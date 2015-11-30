/**
 * Player
 *
 */

(function(global) {
    function Player(ops) {
        // this.init(ops);
    }

    var defaultOptions = {};

    ds.mix(Player.prototype, {
        list: null,
        init: function(ops) {
            var self = this;

            this.options = ds.extend({}, defaultOptions, ops);

            var user = this.user = new User();
            this.list = new List();

            // own props
            this.music = {};
            this.currChannel = null;
            this.state = ds.extend({}, this.state);

            // init
            this.status = 'loading';
            this.initAudio();

            return user.init().then(function() {
                var info = user.info;
                self.setChannel(info.lastChannel, false);
            });
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
                if(now - lastSync > 0) {
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
        state: {
            volume: 0,
            muted: false,
            paused: true,
            duration: 0,
            progress: 0,
            played: 0
        },
        syncFlag: true,
        syncState: function() {
            if(!this.syncFlag) {
                return;
            }

            var audio = this.audio;
            var played = audio.currentTime;
            var duration = audio.duration;
            var progress = 0;

            if(duration > 0 && played > 0) {
                progress = played / duration;
            }

            ds.extend(this.state, {
                played: played,
                progress: progress,
                duration: duration,
                volume: audio.volume,
                paused: audio.paused,
                muted: audio.muted
            });
        },
        lockStateSync: function() {
            this.syncFlag = false;
        },
        unlockStateSync: function() {
            this.syncFlag = true;
        },
        music: null,
        status: 'ready',
        _play: function() {
            var music = this.music;
            if(!music) {
                return;
            }

            var audio = this.audio;
            var status = this.status;

            if(status !== 'paused') {
                audio.pause();

                audio.src = music.url;
                this.loadMusicPic();
            }

            audio.play();

            this.status = 'playing';
            this.syncState();
        },
        play: function() {
            var self = this;
            var status = this.status;

            if(status === 'paused') {
                this.resume();
                return;
            }

            this.status = 'loading';
            this.list.next().then(function(music) {
                // fix props for vue
                music.pic_url = '';

                self.music = music;
                self._play();
            }, function(err) {
                self.status = 'error';

                throw err;
            });
        },
        pause: function() {
            if(this.status !== 'playing') {
                return;
            }

            this.audio.pause();

            this.status = 'paused';
            this.syncState();
        },
        resume: function() {
            if(this.status !== 'paused') {
                return;
            }

            this._play();
        },
        next: function() {
            if(this.status === 'loading') {
                return;
            }

            this.status = 'ready';
            this.play();
        },
        prev: function() {
            // ...
        },
        setProgress: function(progress) {
            progress = Math.max(0, Math.min(1, progress));

            if(
                !this.music ||
                isNaN(progress) ||
                progress === this.state.progress
            ) {
                return;
            }

            var time = this.state.duration * progress;

            this.audio.currentTime = time;
            this.syncState();
        },
        // vol
        volume: function(vol) {
            var ratio = 100;
            var audio = this.audio;
            var state = this.state;
            var currVol = ratio * state.volume;

            if(vol === undefined) {
                return currVol;
            }

            vol /= ratio;
            if(isNaN(vol)) {
                vol = currVol;
            }

            vol = Math.max(0, Math.min(1, vol));

            audio.volume = vol;
            this.mute(false);

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
            var music = this.music || {};
            var url = music.picture;

            if(!url || music.pic_url) {
                return;
            }

            ds.get(url, ds.noop, 'blob').then(function(res) {
                if(music !== self.music) {
                    return;
                }

                music.pic_url = URL.createObjectURL(res);
            });
        },
        // channel
        setChannel: function(channel, next) {
            var self = this;
            var list = this.list;

            this.currChannel = list.setChannel(channel);

            if(next || next === undefined) {
                this.next();
            }

            // save
            this.user.setInfo('lastChannel', this.currChannel);
        },
        // error
        throwError: function(ex) {
            console.error(ex);
        }
    });

    global.Player = Player;
})(this);
