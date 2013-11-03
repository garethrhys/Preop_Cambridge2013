function QuestionnaireController(questionnaire, $http, $location, $anchorScroll, $timeout, encrypt, reportGenerator, $sce) {
  this.questionnaire = questionnaire;
  this.$timeout = $timeout;
  this.$http = $http;
  this.$location = $location;
  this.$anchorScroll = $anchorScroll;
  this.encrypt = encrypt;
  this.reportGenerator = reportGenerator;
  this.$sce = $sce;

  document.title = questionnaire.title;
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
    this.reportGenerator(report).then(function(reportHtml) {
      var encryptedReport = this.encrypt(reportHtml);

      this.$http.post("/send.php", encryptedReport);

      this.report = this.$sce.trustAsHtml(reportHtml);
      this.encryptedReport = encryptedReport;

      this.sent = true;
      this.$location.hash("sent");
      this.$anchorScroll();
    }.bind(this));
  }

});

app.controller(
  "QuestionnaireController",
  [ "questionnaire", "$http", "$location", "$anchorScroll", "$timeout", "encrypt", "reportGenerator", "$sce",
  QuestionnaireController]
);

