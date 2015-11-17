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
            var channels = this.channels = [];

            defaultChannels.forEach(function(item) {
                item = ds.extend({}, item);

                self.addChannel(item);
            });

            this.loadLocalChannels();
            this.loadChannels();
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
        loadChannels: function() {
            var self = this;
            var rChannels = /(hot|fast)_channels_json\s*=\s*(\[[\s\S]+?\]);/g;

            return ds.get('http://douban.fm/')
            .then(function(str) {
                str.replace(rChannels, function(a, name, json) {
                    var items = JSON.parse(json);

                    items.forEach(function(item) {
                        console.log('ss', arguments[1], item.id, item.name);
                        self.addChannel(item, true);
                    });
                });

                console.log(self.channelsMap);

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
        }
    });

    global.List = List;
})(this);
