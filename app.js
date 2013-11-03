var app = angular.module("app", []);

app.factory("questionData", ["$http", function($http) {
  return $http.get("/questions.json").then(function(r){ return r.data; });
}]);

app.factory("publicKey", function() {
  return $("#public-key").text();
});

app.factory("encrypt", ["publicKey", function(publicKey) {
  openpgp.init();
  var pub_key = openpgp.read_publicKey(publicKey);
  return function(stringData) {
    return openpgp.write_encrypted_message(pub_key, stringData);
  };
}]);

