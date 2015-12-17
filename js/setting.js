/**
 * main
 *
 */

(function(global) {
    var setting = {
        init: function() {
            this.initEvent();
            this.initVM();
        },
        initEvent: function() {
            var self = this;

            window.onhashchange = function() {
                self.syncState();
            };
        },
        getCurrPage: function() {
            var page = 'setting';
            var pageAbout = 'about';
            var hash = location.hash.slice(1);

            if(hash.slice(0, pageAbout.length) === pageAbout) {
                page = pageAbout;
            }

            return page;
        },
        initVM: function() {
            // Vue.config.debug = true;

            var data = {
                page: this.getCurrPage(),
                version: '0.0.1'
            };

            this.vm = new Vue({
                el: '#J_setting',
                methods: this.methods,
                data: data
            });
        },
        syncState: function() {
            var vm = this.vm;
            if(!vm) {
                return;
            }

            vm.page = this.getCurrPage();
        },
        methods: {
            openShortcuts: function() {
                var url = 'chrome://extensions/configureCommands';

                window.open(url, '_blank');

                // return chrome.tabs.create({
                //     url: url
                // });
            }
        }
    };

    setting.init();

})(this);
