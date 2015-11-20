/**
 * Digger
 *
 */

(function(global) {
    function Digger() {
        this.init();
    }

    ds.mix(Digger.prototype, {
        init: function() {
            // init
            // ...
        },
        // dig high kbps music
        dig: function(music) {
            // ...
            // music.orig_url = music.url
            // music.url_form = from;
            // music.url = newUrl;
        }
    });

    global.Digger = Digger;
})(this);
