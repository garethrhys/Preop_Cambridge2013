function QuestionnaireController($scope, $http, $location, $anchorScroll, $timeout, encrypt) {
  this.$timeout = $timeout;
  this.$location = $location;
  this.$anchorScroll = $anchorScroll;
  this.encrypt = encrypt;

  this.questionnaire = $scope.questionnaire;
}

angular.extend(QuestionnaireController.prototype, {
  
  nextQuestion: function() {
    if (!this.questionnaire.validateCurrentQuestion()) return;

    var question = this.questionnaire.findNextQuestion();
    if (question) {
      this.questionnaire.askQuestion(question);
      this.scrollToQuestion(question);
    } else {
      this.finishAsking();
    }
  },

  isAsked: function(question) {
    return question.asked;
  },

  scrollToQuestion: function(question) {
    this.$timeout(function() {
      this.$location.hash(question.id);
      this.$anchorScroll();
    }.bind(this));
  },

  finishAsking: function() {
    this.readyToSend = true;
    this.$location.hash("send");
    this.$anchorScroll();
  },

  send: function() {
    var report = this.questionnaire.report();
    // TODO: Build report document text
    // plain text, HTML, PDF?
    var encryptedReportJson = this.encrypt(JSON.stringify(report));

    // TODO: Post report document to email relay server
    this.report = report;
    this.encryptedReportJson = encryptedReportJson;

    this.sent = true;
    this.$location.hash("sent");
    this.$anchorScroll();
  }

});

app.controller(
  "QuestionnaireController",
  [ "$scope", "$http", "$location", "$anchorScroll", "$timeout", "encrypt",
  QuestionnaireController]
);

