var app = angular.module("app", []);

app.factory("questionData", ["$http", function($http) {
  return $http.get("/questions.json").then(function(r){ return r.data; });
}]);

app.factory("publicKey", function() {
  return $("#public-key").text();
});

app.controller(
  "QuestionsController",
  ["$scope", "$anchorScroll", "$location", "$timeout", "questionData", "$parse", "encrypt",
  function($scope, $anchorScroll, $location, $timeout, questionData, $parse, encrypt) {

  var remainingQuestions = [];
  var activeQuestions = [];

  $scope.gotQuestions = false;
  questionData.then(function(data) {
    remainingQuestions.push.apply(remainingQuestions, data.questions);
    $scope.gotQuestions = true;
  });

  $scope.title = questionData.title;
  $scope.patient = {};
  $scope.activeQuestions = activeQuestions;

  $scope.next = function() {
    var nextQuestion = findNextQuestion();
    if (nextQuestion) {
      $scope.activeQuestions.push(nextQuestion);
      $timeout(function() {
        $location.hash(nextQuestion.id.toString());
        $anchorScroll();
      });
    } else {
      readyToSend();
    }
  };

  $scope.allowComments = function(question) {
    return question.type !== "text" && question.type !== "singleline-text";
  };

  $scope.addComments = function(question) {
    question.hasComments = true;
  };

  $scope.cancelComments = function(question) {
    question.hasComments = false;
  };

  $scope.send = function() {
    finished();
  };

  function findNextQuestion() {
    var next = remainingQuestions.filter(function(q) {
      return isConditionMet(q);
    })[0];

    var index = remainingQuestions.indexOf(next);
    remainingQuestions.splice(index, 1);

    return next;
  }

  function isConditionMet(q) {
    if (!q.condition) return true;

    var condition = $parse(q.condition);
    var answers = {};
    activeQuestions.forEach(function(question) {
      answers[question.id] = question.answer;
    });

    return condition({ q: answers });
  }

  function readyToSend() {
    $scope.readyToSend = true;
    $location.hash("send");
    $anchorScroll();
  }

  function questionOutput(q) {
    var answer;
    if (q.type === "checklist") {
      answer = q.options
        .filter(function(option) { return option.selected; })
        .map(function(option) { return option.text; });
    } else {
      answer = q.answer
    }

    var output = {
      id: q.id,
      question: q.text,
      answer: answer
    };

    if (q.comments) {
      output.comments = q.comments;
    }

    return output;
  }

  function getQuestionFlags(q) {
    switch (q.type) {
      case "radiolist":
        var flagged = q.options
          .filter(function(option) {
            return option.id === q.answer && option.flag;
          })
          [0];

        if (flagged) {
          return [{
            flag: flagged.flag,
            question: q.text,
            answer: flagged.text
          }];
        } else {
          return [];
        }

      case "checklist":
        return q.options
          .filter(function(option) { return option.selected && option.flag; })
          .map(function(option) {
            return {
              flag: option.flag,
              question: q.text,
              answer: option.text
            };
          });

      default:
        return [];
    }
  }

  function getAllFlags() {
    var flags = activeQuestions.map(getQuestionFlags);
    // Flatten all flag arrays in one
    flags = [].concat.apply([], flags);
    return flags;
  }

  function finished() {
    var questions = activeQuestions.map(questionOutput);
    var flags = getAllFlags();

    $scope.output = {
      patient: $scope.patient,
      flags: flags,
      questions: questions
    };

    $scope.encrypted = encrypt(JSON.stringify($scope.output));
    // TODO: post to relay server
    $scope.finished = true;
    $location.hash("");
  }

}]);


app.factory("encrypt", ["publicKey", function(publicKey) {
  openpgp.init();
  var pub_key = openpgp.read_publicKey(publicKey);
  return function(stringData) {
    return openpgp.write_encrypted_message(pub_key, stringData);
  };
}]);

