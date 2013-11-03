<?php
$report = file_get_contents("php://input");
mail("doctor@example.com", "Questionnaire Response", $report);
?>
