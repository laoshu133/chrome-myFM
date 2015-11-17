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
