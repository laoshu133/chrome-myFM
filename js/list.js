/**
 * List
 */

(function(global) {
    var List = function() {
        this.init();
    };

    ds.mix(List.prototype, {
        constructor: List,
        init: function() {
            // this.loadChannels();
        },
        channels: [
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
        ],
        loadChannels: function() {
            var self = this;
            var channels = [];
            var channelsMap = {};
            var rChannels = /(hot|fast)_channels_json\s*=\s*(\[[\s\S]+?\]);/g;

            function addChannel(item) {
                if(channelsMap[item.id]) {
                    return;
                }
                channelsMap[item.id] = 1;

                channels.push(item);
            }

            return ds.get('http://douban.fm/')
            .then(function(str) {
                str.replace(rChannels, function(a, name, json) {
                    var items = JSON.parse(json);

                    items.forEach(function(item) {
                        addChannel(item);
                    });
                });

                self.channels = channels;

                return channels;
            });
        }
    });

    global.List = List;
})(this);
