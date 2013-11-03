app.factory("reportGenerator", [ "$http", "$templateCache", "$compile", "$rootScope", "$q", "$timeout", function($http, $templateCache, $compile, $rootScope, $q, $timeout) {

  var reportTemplate = $http.get("/report.html", { cache: $templateCache })
    .then(function(response) {
      return $compile(response.data);
    });

  return function(report) {
    var scope = $rootScope.$new();
    scope.report = report;

    var deferred = $q.defer();
    reportTemplate.then(function(create) {
      create(scope, function(element) {
        $timeout(function() {
          deferred.resolve(element.html());
          scope.$destroy();
        });
      });
    });

    return deferred.promise;
  };

}]);
