/**
 * main
 *
 */

(function(global) {
    var app = global.app = {
        init: function() {
            this.initPlayer();
            this.player.play();

            this.initVM();
        },
        vm: null,
        initVM: function(data) {
            Vue.config.debug = true;

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
                player: this.player,
                currChannel: null,
                channels: []
            }, data);

            var vm = this.vm = new Vue({
                el: '#J_app',
                methods: app.methods,
                data: data

            });
        },
        player: null,
        initPlayer: function() {
            this.player = new Player();
        },
        // methods
        methods: {
            setChannel: function(channel) {
                this.player.setChannel(channel);

                this.menuActived = false;
            },
            setProgress: (function() {
                var timer;
                var ratio = 1000;

                function _setProgress(val) {
                    var player = app.player;
                    var progress = val / ratio;

                    player.setProgress(progress);
                    player.resume();
                }

                return function(e) {
                    clearTimeout(timer);
                    timer = setTimeout(function() {
                        _setProgress(+e.target.value);
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
            }
        }
    };

    app.init();
})(this);
