var reader = angular.module("reader", []);

reader.controller("ReaderController", ["$scope", "$sce", function($scope, $sce) {

  var privateKeyText = $("#private-key").text();
  openpgp.init();
  var priv_key = openpgp.read_privateKey(privateKeyText);

  this.encrypted = "";

  this.decrypt = function() {
    var report;

    var msg = openpgp.read_message(this.encrypted);
    var keymat = null;
		var sesskey = null;
		// Find the private (sub)key for the session key of the message
		for (var i = 0; i< msg[0].sessionKeys.length; i++) {
			if (priv_key[0].privateKeyPacket.publicKey.getKeyId() == msg[0].sessionKeys[i].keyId.bytes) {
				keymat = { key: priv_key[0], keymaterial: priv_key[0].privateKeyPacket};
				sesskey = msg[0].sessionKeys[i];
				break;
			}
			for (var j = 0; j < priv_key[0].subKeys.length; j++) {
				if (priv_key[0].subKeys[j].publicKey.getKeyId() == msg[0].sessionKeys[i].keyId.bytes) {
					keymat = { key: priv_key[0], keymaterial: priv_key[0].subKeys[j]};
					sesskey = msg[0].sessionKeys[i];
					break;
				}
			}
		}
		if (keymat != null) {
			if (!keymat.keymaterial.decryptSecretMPIs($('#decpassword').val())) {
				util.print_error("Password for secrect key was incorrect!");
				return;

			}
			report = msg[0].decrypt(keymat, sesskey);
		} else {
			util.print_error("No private key found!");
		}

    this.report = $sce.trustAsHtml(report);
  };

}]);
