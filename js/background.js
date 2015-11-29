/**
* chrome-myFM
* @author admin@laoshu133.com
* @date   2015.09.14
*/

;(function(global) {
	var ds = global.ds;
	var Messager = ds.Messager;

	chrome.app.runtime.onLaunched.addListener(function() {
		chrome.app.window.create('main.html', {
			id: 'app-main',
			resizable: false,
			height: 240,
			width: 520
		});
	});

	// Messager
	var instanceUid = 0;
	Messager.addListener('init', function(e) {
		var port = e.port;

		e.callback({
			id: ++instanceUid
		});

		chrome.commands.onCommand.addListener(function(key) {
			Messager.postToPort(port, 'command', {
				key: key
			});

			return false;
		});
	});
})(this);
