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
			// frame: 'none',
			height: 240,
			width: 520,
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
				// frame: 'none',
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
		},
		// clean
		close: function() {
			var appWin = chrome.app.window.get('app-setting');

			if(appWin) {
				appWin.close();
			}
		}
	};

	Messager.addListener('init', function(e) {
		var port = e.port;
		var cmdEvtName = 'command';

		// init callback
		e.callback({
			id: ++appUID
		});

		// command: hot keys
		var commands = chrome.commands;
		var hotKeyHandler = function(key) {
			Messager.postToPort(port, cmdEvtName, {
				key: key
			});

			return false;
		};
		commands.onCommand.addListener(hotKeyHandler);

		// listener: command
		var cmdHandler = function(e) {
			var data = e.data;

			if(appCommands[data.key]) {
				appCommands[data.key](data.data, e);
			}

			// clean
			if(data && data.key === 'close') {
				commands.onCommand.removeListener(hotKeyHandler);
				Messager.removeListener(cmdEvtName, cmdHandler);

				port = null;
			}
		};
		Messager.addListener(cmdEvtName, cmdHandler);
	});
})(this);
