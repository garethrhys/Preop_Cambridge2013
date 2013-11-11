(function() {

  function Questionnaire(title, questions, $parse) {
    this.title = title;
    this.patient = {
      number: "",
      name: "",
      dateOfBirth: ""
    };
    this.questions = questions.map(function(questionData) {
      return new Question(questionData, $parse);
    });
  }

  angular.extend(Questionnaire.prototype, {
   
    answeredCurrentQuestion: function() {
      if (this.currentQuestion) {
        if (this.currentQuestion.validate()) {
          this.currentQuestion.answered = true;
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },

    findNextQuestion: function() {
      var answers = this.answers();
      return this.questions
        .filter(function(q) { return !q.asked && q.isConditionMet(answers); })
        [0];
    },

    progress: function() {
      var answeredQuestions = this.questions.filter(function(q) {
        return q.answered;
      });
      // Number of answered questions + one more for the patient details.
      var answeredCount = answeredQuestions.length + (this.currentQuestion ? 1 : 0);
      // Count number of questions after the most recently asked question.
      var indexOfMostRecent = (answeredQuestions.length > 0)
        ? this.questions.indexOf(answeredQuestions[answeredQuestions.length - 1])
        : 0;
      var total = answeredCount + this.questions.length - indexOfMostRecent - 1;
      return Math.floor((answeredCount / total) * 100);
    },

    answers: function() {
      var answers = {};
      this.questions
        .filter(function(q) { return q.asked; })
        .forEach(function(q) { answers[q.id] = q.answer; });
      return answers;
    },

    askQuestion: function(question) {
      question.asked = true;
      this.currentQuestion = question;
    },

    // TODO: locking of previous questions
    // unlocking a question to change it needs to "un-ask" subsequent questions

    report: function() {
      var asked = this.questions.filter(function(q) { return q.asked; });

      var responses = asked.map(function(q) { return q.response(); });
      var flags = asked.map(function(q) { return q.flags(); });
      // Flatten array of arrays into array of simple objects.
      flags = [].concat.apply([], flags);
      var redFlags = flags.filter(function(f) { return f.flag === "RED"; });
      var yellowFlags = flags.filter(function(f) { return f.flag === "YELLOW"; })

      return {
        title: this.title,
        created: new Date(),
        patient: this.patient,
        redFlags: redFlags,
        yellowFlags: yellowFlags,
        responses: responses
      };
    }

    // TODO: save to local storage (answers, asked, comments, hasComments, etc)
    // TODO: load from local storage

  });

  
  function Question(data, $parse) {
    angular.extend(this, data); // id, text, etc
    this.asked = false;
    this.hasComments = false;

    this.testCondition = data.condition 
      ? $parse(data.condition)
      : function() { return true; };
  }

  angular.extend(Question.prototype, {

    isConditionMet: function(previousAnswers) {
      // previousAnswers is object containing
      // { <question-id>: <answer>, ... }
      return this.testCondition({ q: previousAnswers });
    },

    allowComments: function() {
      return this.type !== "text" && this.type !== "singleline-text";
    },

    addComments: function() {
      this.hasComments = true;
    },

    removeComments: function() {
      this.hasComments = false;
    },

    response: function() {

      var response = {
        id: this.id,
        question: this.text,
        answer: this.getAnswer()
      };

      if (this.hasComments) {
        response.comments = this.comments;
      }

      return response;
    },

    getAnswer: function() {
      if (this.type === "checklist") {
        return this.options
          .filter(function(option) { return option.selected; })
          .map(function(option) { return option.text; })
          .join("; ");
      } else {
        return this.answer;
      }
    },

    flags: function() {
      switch (this.type) {
        case "radiolist":
          var flagged = this.options
            .filter(function(option) {
              return option.text === this.answer && option.flag;
            }, this)
            [0];

          if (flagged) {
            return [{
              flag: flagged.flag,
              question: this.text,
              answer: flagged.text
            }];
          } else {
            return [];
          }

        case "checklist":
          return this.options
            .filter(function(option) { return option.selected && option.flag; })
            .map(function(option) {
              return {
                flag: option.flag,
                question: this.text,
                answer: option.text
              };
            }, this);

        default:
          return [];
      }
    },

    validate: function() {
      if (this.required && !this.getAnswer()) {
        this.errorMessage = "An answer is required for this question";
        return false;
      }

      delete this.errorMessage;
      return true;
    }

  });

  app.value("Questionnaire", Questionnaire);
 
}());
