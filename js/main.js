/**
 * main
 *
 */

(function(global) {
    var Messager = ds.Messager;

    var app = global.app = {
        init: function() {
            this.initPlayer();
            this.initEvent();
            this.initVM();
        },
        initEvent: function() {
            var self = this;

            var player = this.player;
            var commands = {
                play_pause: function() {
                    if(player.status === 'paused') {
                        player.resume();
                    }
                    else {
                        player.pause();
                    }
                },
                next: function() {
                    player.next();
                },
                prev: function() {
                    player.prev();
                },
                volume_up: function() {
                    var unit = 100 / 10;
                    var vol = player.volume();

                    player.volume(vol + unit);
                },
                volume_down: function() {
                    var unit = 100 / 10;
                    var vol = player.volume();

                    player.volume(vol - unit);
                }
            };

            Messager.addListener('command', function(e) {
                var command = commands[e.data.key];
                if(!command) {
                    return;
                }

                command.call(self, e.data);
            });

            Messager.postToBackground('init', function(e) {
                console.log('App main init, id:', e.data.id);
            });
        },
        vm: null,
        initVM: function(data) {
            // Vue.config.debug = true;

            Vue.filter('musicTime', function(val) {
                val += 0;
                if(!val) {
                    val = 0;
                }

                var ms = Math.ceil(1000 * val);
                var oneM = 1000 * 60;

                var m = Math.floor(ms / oneM);
                var s = Math.ceil((ms - m * oneM) / 1000);

                return [
                    ('00' + m).slice(-2),
                    ('00' + s).slice(-2)
                ]
                .join(':');
            });

            data = ds.mix({
                menuActived: false,
                player: this.player
            }, data);

            var vm = this.vm = new Vue({
                el: '#J_app',
                methods: app.methods,
                data: data
            });
        },
        player: null,
        initPlayer: function() {
            var player = this.player = new Player();

            player.init().then(function() {
                // auto start
                // player.play();
            });
        },
        // methods
        methods: {
            setChannel: function(channel) {
                this.player.setChannel(channel);

                this.menuActived = false;
            },
            // hack for input range
            lockProgressSync: function() {
                app.player.lockStateSync();
            },
            unlockProgressSync: function() {
                app.player.unlockStateSync();
            },
            setProgress: (function() {
                var timer;

                function _setProgress(progress) {
                    var player = app.player;

                    player.setProgress(progress);
                    player.unlockStateSync();
                    player.resume();
                }

                return function(e) {
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        var elem = e.target;
                        var progress = 0;

                        if(e.type !== 'click') {
                            progress = elem.value / elem.max;
                        }
                        else {
                            progress = e.offsetX / elem.offsetWidth;
                        }

                        _setProgress(progress);
                    }, 0);
                };
            })(),
            changeVolume: function(e) {
                var player = app.player;
                var vol = player.volume();
                var delta = e.wheelDeltaY || e.wheelDelta;

                // revert
                var volDown = false;
                if(delta > 0) {
                    volDown = true;
                }

                // abs
                delta = Math.abs(delta / 3);

                // limit
                delta = Math.max(0, Math.min(4, delta));
                if(volDown) {
                    delta = -delta;
                }

                player.volume(vol + delta);
            },
            // ext
            callAppCommand: function(key, data) {
                Messager.postToBackground('command', {
                    data: data,
                    key: key
                });
            }
        }
    };

    app.init();
})(this);
