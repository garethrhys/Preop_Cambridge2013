var app = angular.module("app", []);

app.value("questionData", 
{
  title: "Example questions",
  questions: [
    {
      id: 1,
      text: "Have you had an operation before?",
      type: "boolean",
      hint: "Anything at all..."
    },
    {
      condition: "q[1] === 'yes'",
      id: 2,
      text: "When was your last operation?",
      type: "text"
    },
    {
      id: 3,
      text: "How often do you hack?",
      type: "single-choice",
      choices: [
        { id: "0", text: "Never" },
        { id: "1", text: "Once a week" },
        { id: "2", text: "Once a month", flag: "RED" },
      ]
    },
    {
      id: 4,
      text: "What medication are you taking?",
      type: "multi-choice",
      choices: [
        { id: "x", text: "XXX" },
        { id: "y", text: "YYY" },
        { id: "z", text: "ZZZ" }
      ]
    }
  ]
});

app.factory("publicKey", function() {
  return $("#public-key").text();
});

app.controller("QuestionsController", ["$scope", "questionData", "$parse", "publicKey", function($scope, questionData, $parse, publicKey) {

  var remainingQuestions = questionData.questions.slice(0); // copy the questions array so we destructive update it
  var activeQuestions = [];

  activeQuestions.push(remainingQuestions.shift());

  $scope.title = questionData.title;
  $scope.activeQuestions = activeQuestions;

  $scope.next = function() {
    var nextQuestion = findNextQuestion();
    if (nextQuestion) {
      $scope.activeQuestions.push(nextQuestion);
    } else {
      finished();
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

  function finished() {
    var questions = activeQuestions.map(function(q) {
      var answer;
      if (q.type === "multi-choice") {
        answer = q.choices
          .filter(function(choice) { return choice.selected; })
          .map(function(choice) { return choice.id; });
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
    });

    var flags = activeQuestions.map(function(q) {
      switch (q.type) {
        case "single-choice":
          var flaggedChoice = q.choices.filter(function(choice) { return choice.id === q.answer && choice.flag; })[0];
          if (flaggedChoice) {
            return [{
              flag: flaggedChoice.flag,
              question: q.text,
              answer: flaggedChoice.id
            }];
          } else {
            return [];
          }

        case "multi-choice":
          return q.choices
            .filter(function(choice) { return choice.selection && choice.flag; })
            .map(function(choice) {
              return {
                flag: flaggedChoice.flag,
                question: q.text,
                answer: flaggedChoice.id
              };
            });

        default:
          return [];
      }
    });

      flags = [].concat.apply([], flags);


    // TODO: post to relay server

    $scope.output = {
      flags: flags,
      questions: questions
    };

    $scope.encrypted = encryptData($scope.output);

    $scope.finished = true;
  }

  function encryptData(data) {
    var json = JSON.stringify(data);

    openpgp.init();
    var pub_key = openpgp.read_publicKey(publicKey);
    return openpgp.write_encrypted_message(pub_key,json);
  }


}]);

