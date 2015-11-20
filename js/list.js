/**
 * List
 */

(function(global) {
    var List = function() {
        this.init();
    };

    var defaultChannels = [
        {
            id: 1,
            name: "华语"
        }, {
            id: 2,
            name: "欧美"
        }, {
            id: 4,
            name: "八零"
        }, {
            id: 153,
            name: "工作学习"
        }, {
            id: 6,
            name: "粤语"
        }, {
            id: 9,
            name: "轻音乐"
        }, {
            id: 32,
            name: "咖啡"
        }, {
            id: 13,
            name: "爵士"
        }, {
            id: 61,
            name: "新歌"
        }, {
            id: 5,
            name: "九零"
        }, {
            id: 7,
            name: "摇滚"
        }, {
            id: 8,
            name: "民谣"
        }, {
            id: 10,
            name: "电影原声"
        }, {
            id: 76,
            name: "小清新"
        }
    ];

    ds.mix(List.prototype, {
        constructor: List,
        init: function() {
            var self = this;

            // own props
            this.queue = [];
            this.channels = [];
            this.digger = new Digger();

            // default channels
            defaultChannels.forEach(function(item) {
                item = ds.extend({}, item);

                self.addChannel(item);
            });

            this.loadLocalChannels();
            this.loadChannels();

            this.setChannel();
        },
        addChannel: function(channel, cover) {
            var channels = this.channels;
            var channelsMap = this.channelsMap;
            if(!channelsMap) {
                channelsMap = this.channelsMap = {};

                channels.forEach(function(item) {
                    channelsMap[item.id] = item;
                });
            }

            var cacheChannel = channelsMap[channel.id];
            if(!cacheChannel) {
                channelsMap[channel.id] = channel;
                channels.push(channel);

                // ext
                channel.lastActive = 0;

                return channel;
            }

            if(cover) {
                ds.extend(cacheChannel, channel);
            }

            return cacheChannel;
        },
        currChannel: null,
        setChannel: function(channel) {
            var self = this;

            if(channel) {
                this.addChannel(channel);

                this.channels.forEach(function(item) {
                    if(item.id === channel.id) {
                        self.currChannel = item;
                    }
                });
            }
            else {
                this.currChannel = this.channels[0];
            }

            // lastActive
            channel = this.currChannel;
            channel.lastActive = Date.now();

            // cache
            this.clearMusicCache();

            return channel;
        },
        loadChannels: function() {
            var self = this;
            var rChannels = /(hot|fast)_channels_json\s*=\s*(\[[\s\S]+?\]);/g;

            return ds.get('http://douban.fm/')
            .then(function(str) {
                str.replace(rChannels, function(a, name, json) {
                    var items = JSON.parse(json);

                    items.forEach(function(item) {
                        self.addChannel(item, true);
                    });
                });

                self.saveLocalChannels();

                return self.channels;
            });
        },
        storageKey: 'myfm_channels',
        loadLocalChannels: function() {
            var self = this;
            var key = this.storageKey;

            return ds.storage(key)
            .then(function(data) {
                if(data) {
                    try{
                        data = JSON.parse(data);
                    }
                    catch(_) {}
                }

                var channels = data || [];
                if(channels.length) {
                    channels.forEach(function(item) {
                        self.addChannel(item, true);
                    });
                }

                return self.channels;
            });
        },
        saveLocalChannels: function() {
            var key = this.storageKey;
            var data = this.channels;
            // var data = JSON.stringify(this.channels);

            ds.storage(key, data);
        },
        queue: [],
        next: function() {
            var queue = this.queue;
            var digger = this.digger;

            var df = Promise.defer();

            if(queue.length) {
                df.resolve(queue.shift());
            }
            else {
                this.loadNext().then(function(music) {
                    df.resolve(music);
                }, function(err) {
                    df.reject(err);
                });
            }

            if(queue.length < 1) {
                this.loadNext().then(function(music) {
                    queue.push(music);

                    // digger
                    // be fast, only dig next music
                    digger.dig(music);
                });
            }

            return df.promise;
        },
        musicModel: {
            url: '',
            url_form: '',
            orig_url: '',
            title: '',
            album: '',
            albumtitle: '',
            artist: '',
            file_ext: '',
            picture: '',
            pic_url: ''
        },
        loadNext: function() {
            var musicModel = this.musicModel;
            var channel = this.currChannel;
            if(!channel) {
                return;
            }

            // http://douban.fm/j/mine/playlist?type=p&sid=693695&pt=0.0&channel=8&pb=128&from=mainsite&r=d07cdf6a52

            var url = 'http://douban.fm/j/mine/playlist';
            var r = Date.now().toString(16);
            var data = {
                // pb: 128,
                type: 'p',
                channel: channel.id,
                from: 'mainsite',
                sid: '693695',
                pt: '0.0',
                r: r
            };

            return ds.get(url, data).then(function(res) {
                var music = res && res.song && res.song[0];
                if(music) {
                    music = ds.mix(music, musicModel);

                    return Promise.resolve(music);
                }
                else {
                    Promise.reject(new Error('List: load error'));
                }
            });
        },
        clearMusicCache: function() {
            this.queue = [];
        }
    });

    global.List = List;
})(this);
