app.controller("AppController", ["$scope", "$parse", "$http", "Questionnaire", function($scope, $parse, $http, Questionnaire) {

  var questionnaireDefinitionHref = $("head > link[rel='questionnaire']").attr("href");
  
  $http.get(questionnaireDefinitionHref)
    .success(function(questionnaireDefinition) {
      $scope.questionnaire = new Questionnaire(
        questionnaireDefinition.title, 
        questionnaireDefinition.questions, 
        $parse
      );

      document.title = $scope.questionnaire.title;
    })
    .error(function() {
      $scope.appError = "Unable to load questionnaire";
    });

}]);
