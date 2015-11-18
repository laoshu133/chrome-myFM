/**
 * main
 *
 */

(function(global) {
    var app = global.app = {
        init: function() {
            this.initPlayer();
            this.initVM();

            this.player.play();
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
                data: data
            });
        },
        player: null,
        initPlayer: function() {
            this.player = new Player();

            return;


            var self = this;


            var list = new List();

            console.log(list.channels);

            list.loadChannels()
            .always(function() {
                console.log(arguments);
                console.log(list.channels);


            });
        },
        setChannels: function(channels) {

        }
    };

    app.init();
})(this);
