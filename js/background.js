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
	var appUID = 0;
	var appCommands = {
		_getSettingView: function(type) {
			var df = Promise.defer();

			chrome.app.window.create('setting.html', {
				id: 'app-setting',
				resizable: false,
				height: 400,
				width: 480
			}, function(appWin) {
				if(appWin) {
					var view = appWin.contentWindow;
					view.location.hash = '#' + type;

					df.resolve(appWin);
				}
				else {
					df.reject(new Error('App err!'));
				}
			});

			return df.promise;
		},
		about: function() {
			this._getSettingView('about');
		},
		setting: function() {
			this._getSettingView('setting');
		}
	};

	Messager.addListener('init', function(e) {
		var port = e.port;

		e.callback({
			id: ++appUID
		});

		// command: hot keys
		chrome.commands.onCommand.addListener(function(key) {
			Messager.postToPort(port, 'command', {
				key: key
			});

			return false;
		});

		// listener: command
		Messager.addListener('command', function(e) {
			var data = e.data;

			if(appCommands[data.key]) {
				appCommands[data.key](data.data, e);
			}
		});
	});
})(this);
