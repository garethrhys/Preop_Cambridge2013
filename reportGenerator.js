app.factory("reportGenerator", [ "$templateCache", "$compile", "$rootScope", "$q", "$timeout", function($templateCache, $compile, $rootScope, $q, $timeout) {

  var reportTemplate = $.trim($templateCache.get("report"));
  var generateReportHtml = $compile(reportTemplate);

  return function(report) {
    var scope = $rootScope.$new();
    scope.report = report;

    var deferred = $q.defer();
    generateReportHtml(scope, function(element) {
      $timeout(function() {
        deferred.resolve(element.html());
      });
    });
    return deferred.promise;
  };

}]);
