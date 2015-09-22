/**
* chrome-myFM
* @author admin@laoshu133.com
* @date   2015.09.14
*/

;(function(global) {
	var ds = global.ds;

	chrome.app.runtime.onLaunched.addListener(function() {
		chrome.app.window.create('main.html', {
			id: 'app-main',
			resizable: false,
			height: 240,
			width: 520
		});
	});

	// chrome.commands.onCommand.addListener(function() {
	// 	console.log('xxx', arguments);

	// 	return false;
	// });

})(this);