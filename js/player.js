/**
 * Player
 *
 */

(function(global) {
    function Player(ops) {
        this.init(ops);
    }

    var defaultOptions = {};

    ds.mix(Player.prototype, {
        list: null,
        currChannel: null,
        init: function(ops) {
            this.options = ds.extend({}, defaultOptions, ops);

            this.list = new List();
            this.user = new User();

            this.setChannel(this.user.lastChannel);
        },
        status: 'ready',
        currMusic: null,
        _play: function() {
            var music = this.currMusic;
            if(!music) {
                return;
            }

            console.log(music);
        },
        play: function() {
            var self = this;
            this.status = 'loading';

            this.list.next().then(function(music) {
                self.currMusic = music;
                self.status = 'playing';
                self._play();
            }, function(err) {
                self.status = 'error';

                throw err;
            });
        },
        pause: function() {

        },
        next: function() {

        },
        prev: function() {

        },
        setChannel: function(channel) {
            var self = this;
            var list = this.list;

            this.currChannel = list.setChannel(channel);

            this.next();
        }
    });

    global.Player = Player;
})(this);
