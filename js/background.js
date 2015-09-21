/**
* chrome-myFM
* @author admin@laoshu133.com
* @date   2015.09.14
*/

;(function(global) {
	var ds = global.ds;

	console.log(111);

	chrome.app.runtime.onLaunched.addListener(function() {
		chrome.app.window.create('main.html', {
			'bounds': {
				'width': 520,
				'height': 240
			}
		});
	});

	chrome.commands.onCommand.addListener(function() {
		console.log('xxx', arguments);

		return false;
	});

	console.log('chrome.permissions', chrome.permissions);

	chrome.system.network.getNetworkInterfaces(function() {
		console.log('sss', arguments);
	});

})(this);