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

            // own prop
            this.music = {};
            this.musicState = ds.extend({}, this.musicState);

            this.initAudio();

            this.setChannel(this.user.lastChannel);
        },
        initAudio: function() {
            var self = this;
            var audio = this.audio = new Audio();

            audio.preload = 'auto';
            audio.autoplay = false;
            audio.loop = false;
            audio.volume = 0.8;

            var lastSync = 0;
            var sync = function() {
                var now = Date.now();
                if(now - lastSync > 100) {
                    self.syncState();

                    lastSync = now;
                }
            };

            audio.addEventListener('canplay', sync);
            audio.addEventListener('timeupdate', sync);

            audio.addEventListener('ended', function(e){
                self.syncState();
                self.next();
            });

            audio.addEventListener('error', function(e){
                self.throwError(e);
            });
        },
        musicState: {
            volume: 0,
            muted: false,
            paused: false,
            duration: 0,
            progress: 0,
            played: 0
        },
        syncState: function() {
            var audio = this.audio;
            var played = audio.currentTime;
            var duration = audio.duration;
            var progress = 0;

            if(duration > 0 && played > 0) {
                progress = played / duration;
            }

            ds.extend(this.musicState, {
                played: played,
                progress: progress,
                duration: duration,
                volume: audio.volume,
                paused: audio.paused,
                muted: audio.muted
            });
        },
        music: null,
        status: 'ready',
        _play: function() {
            var music = this.music;
            if(!music) {
                return;
            }

            var audio = this.audio;
            audio.pause();

            audio.src = music.url;
            audio.play();

            this.syncState();
            this.loadMusicPic();
        },
        play: function() {
            var self = this;
            this.status = 'loading';

            this.list.next().then(function(music) {
                if(!music.pic_url) {
                    music.pic_url = '';
                }

                self.music = music;
                self.status = 'playing';
                self._play();
            }, function(err) {
                self.status = 'error';

                throw err;
            });
        },
        pause: function() {
            this.status = 'paused';
            this.audio.pause();
        },
        next: function() {
            this.play();
        },
        prev: function() {
            // ...
        },
        // vol
        volume: function(vol) {
            var ratio = 100;
            var audio = this.audio;
            var state = this.musicState;

            if(vol === undefined) {
                return ratio * state.volume;
            }

            vol /= ratio;

            audio.volume = vol;
            this.syncState();
        },
        mute: function(muted) {
            var audio = this.audio;

            if(muted === undefined) {
                muted = !audio.muted;
            }

            audio.muted = !!muted;
            this.syncState();
        },
        loadMusicPic: function() {
            var self = this;
            var url = this.music.picture;

            if(!url) {
                return;
            }

            ds.get(url, ds.noop, 'blob').then(function(res) {
                var music = self.music;
                if(url !== music.picture) {
                    return;
                }

                music.pic_url = URL.createObjectURL(res);
            });
        },
        // channel
        setChannel: function(channel) {
            var self = this;
            var list = this.list;

            this.currChannel = list.setChannel(channel);

            this.next();
        },
        // error
        throwError: function(ex) {
            console.error(ex);
        }
    });

    global.Player = Player;
})(this);
