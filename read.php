<?php
$privateKey = file_get_contents('./private.key');
?>
<!doctype html>
<html ng-app="reader">
<head>
  <title>Questionnaire response reader</title>
  <link href="//netdna.bootstrapcdn.com/bootstrap/3.0.1/css/bootstrap.min.css" rel="stylesheet" />
  <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.0-rc.3/angular.min.js"></script>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
  <script src="openpgp.js"></script>
  <script src="read.js"></script>
</head>
<body>
  <div class="container" ng-controller="ReaderController as reader">

    <form name="form" ng-submit="reader.decrypt()" ng-hide="reader.report">
      <h1>Encrypted response reader</h1>
      <div class="form-group">
        <textarea ng-model="reader.encrypted" rows="10" class="form-control" placeholder="Paste encrypted questionnaire response here"></textarea>
      </div>
      <div class="form-group">
        <button type="submit" class="btn btn-primary">Decrypt</button>
      </div>
    </form>

    <div ng-if="reader.report" ng-bind-html="reader.report"></div>

  </div>

  <script id="private-key" type="text/plain"><?php echo $privateKey ?></script>
</body>
</html>
