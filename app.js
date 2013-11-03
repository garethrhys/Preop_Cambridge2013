var app = angular.module("app", []);

app.factory("publicKey", function() {
  return $("#public-key").text();
});

app.factory("questionnaire", [ "Questionnaire", "$parse", function(Questionnaire, $parse) {
  var defn = JSON.parse($.trim($("#questionnaire-definition").text()));
  return new Questionnaire(defn.title, defn.questions, $parse);
}]);

app.factory("encrypt", ["publicKey", function(publicKey) {
  openpgp.init();
  var pub_key = openpgp.read_publicKey(publicKey);
  return function(stringData) {
    return openpgp.write_encrypted_message(pub_key, stringData);
  };
}]);

