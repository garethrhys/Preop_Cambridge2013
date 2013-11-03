<?php
$public_key = file_get_contents('./public.key');
$questionnaire = file_get_contents('./questions.json');
?>
<!doctype html>

<html ng-app="app">
  <head>
    <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.1/css/bootstrap.min.css" rel="stylesheet" />
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.3/angular.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
    <script src="openpgp.min.js"></script>
    <script src="app.js"></script>
    <script src="Questionnaire.js"></script>
    <script src="QuestionnaireController.js"></script>
    <script src="reportGenerator.js"></script>
    <title>Questionnaire</title>
    <style type="text/css">
	body {
    background-color: #D4D4D4;
    color: #333333;
    font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
    font-size: 12px;
    line-height: 16px;
    margin: 0;
}
</style>
  </head>
  <body>

    <div class="container" ng-controller="QuestionnaireController as qc">

      <h1>{{qc.questionnaire.title}}</h2>
      <p class="well" ng-hide="qc.sent">
    Please complete this questionnaire as fully and accurately as possible. Inaccurate information may result in your operation being delayed or cancelled. If you wish to provide further information specific to any question, click the 'Add extra information' link. Once completed, your information will be sent encrypted to the hospital, where it will be reviewed by medical staff. We will contact you if you need to attend a pre-admission clinic before the day of your surgery.<br/>
    If you have any difficulties completing this questionnaire, please ring 01234 567890
    </p>
    <p class="alert alert-warning" ng-hide="qc.sent">
    <b>NHS Hackday Cambridge 2013</b> - The question set is a small sample of those required in a production version. There is work to be done on validation, and the possibility of adding additional question types.
    </p>
      <form name="form" role="form" novalidate ng-hide="qc.sent">
        <div ng-include src="'patient-details'"></div>
        <div ng-repeat="question in qc.questionnaire.questions | filter:qc.isAsked track by $index "
             ng-form="questionForm"
             ng-include src="'question'"></div>
        <div class="form-group">
          <button class="btn btn-primary" ng-hide="qc.readyToSend" ng-click="qc.nextQuestion()">Next &raquo;</button>
        </div>
        <div ng-show="qc.readyToSend" ng-include src="'send'"></div>
      </form>

      <div ng-show="qc.sent">
        <a id="sent"></a>
        <div class="panel panel-success">
          <div class="panel-heading">
            <h3 class="panel-title">Form sent</h3>
          </div>
          <div class="panel-body">
            <p>Thanks for completing this questionnaire.</p>
            <p>You doctor will be in touch soon.</p>
          </div>
        </div>
      </div>

    </div>

    <script id="patient-details" type="text/ng-template">
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">Patient details</h3>
        </div>
        <div class="panel-body">
          <div class="form-group">
            <label for="patient-id">Patient number</label>
            <input type="text" id="patient-id" class="form-control" ng-model="qc.questionnaire.patient.number" required autofocus />
          </div>
          <div class="form-group">
            <label for="patient-name">Patient name</label>
            <input type="text" id="patient-name" class="form-control" ng-model="qc.questionnaire.patient.name" required />
          </div>
          <div class="form-group">
            <label for="patient-dob">Patient date of birth</label>
            <input type="text" id="patient-dob" class="form-control" ng-model="qc.questionnaire.patient.dateOfBirth" required placeholder="dd/mm/yyyy"/>
          </div>
        </div>
      </div>
    </script>

    <script id="question" type="text/ng-template">
      <a id="{{question.id}}"></a>
      <div class="panel panel-default">
        <div class="panel-heading">
          <h3 class="panel-title">{{question.text}}</h3>
        </div>
        <div class="panel-body">
          <div class="form-group" ng-include src="question.type"></div>
          <div ng-if="question.errorMessage" class="alert alert-danger">{{question.errorMessage}}</div>
          <div class="form-group pull-right" ng-show="question.allowComments()">
            <a href="javascript:void(0)" ng-click="question.addComments()" ng-hide="question.hasComments">Add extra information</a>
          </div>
          <div class="form-group" ng-if="question.hasComments">
            <label>Extra information</label>
            <textarea class="form-control" ng-model="question.comments" ng-show="question.hasComments" autofocus placeholder="Add anything extra that may be relevant"></textarea>
          </div>
          <div class="form-group pull-right" ng-if="question.hasComments">
            <button class="btn btn-xs btn-default" ng-click="question.removeComments()">Remove comment</button>
          </div>
        </div>
        <div class="panel-footer text-muted" ng-if="question.hint">
          <i class="glyphicon glyphicon-info-sign"></i> {{question.hint}}
        </div>
      </div>
    </script>

    <script id="boolean" type="text/ng-template">
      <div class="radio">
        <label><input name="{{question.id}}" type="radio" value="yes" ng-model="question.answer" /> Yes</label>
      </div>
      <div class="radio">
        <label><input name="{{question.id}}" type="radio" value="no" ng-model="question.answer" /> No</label>
      </div>
      <input type="hidden" ng-model="question.answer" required />
    </script>

    <script id="text" type="text/ng-template">
      <textarea class="form-control" rows="10" ng-model="question.answer" required></textarea>
    </script>

    <script id="singleline-text" type="text/ng-template">
      <input type="text" class="form-control" ng-model="question.answer" required/>
    </script>

    <script id="radiolist" type="text/ng-template">
      <div class="radio" ng-repeat="option in question.options">
        <label>
          <input type="radio" name="{{question.id}}" value="{{option.text}}" ng-model="question.answer" />
          {{option.text}}
        </label>
      </div>
      <input type="hidden" name="{{question.id}}" ng-model="question.answer" required/>
    </script>

    <script id="checklist" type="text/ng-template">
      <div class="checkbox" ng-repeat="option in question.options">
        <label>
          <input type="checkbox" value="{{option.text}}" ng-model="option.selected" />
          {{option.text}}
        </label>
      </div>
    </script>

    <script id="send" type="text/ng-template">
      <div class="panel panel-info">
        <div class="panel-heading">
          <h3 class="panel-title">Ready to submit?</h3>
        </div>
        <div class="panel-body">
          <p>Please review your answers, the click Send to Doctor to securely send them.</p>
          <button class="btn btn-primary" ng-click="qc.send()"><i class="glyphicon glyphicon-lock"></i> Send to Doctor</button>
        </div>
      </div>
      <a id="send"></a>
    </script>

    <script id="questionnaire-definition" type="text/plain"><?php echo $questionnaire; ?></script>
    <script id="public-key" type="text/plain"><?php echo $public_key; ?></script>
  </body>
</html>

