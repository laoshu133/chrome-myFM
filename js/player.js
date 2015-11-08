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
        play: function() {

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

            if(channel) {
                list.addChannel(channel);

                list.channels.forEach(function(item) {
                    if(item.id === channel.id) {
                        self.currChannel = item;
                    }
                });
            }
            else {
                this.currChannel = list.channels[0];
            }

            this.next();
        }
    });

    global.Player = Player;
})(this);
