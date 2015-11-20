/**
 * User
 *
 */

(function(global) {
    function User() {
        // this.init();
    }

    ds.mix(User.prototype, {
        info: null,
        currChannel: null,
        init: function() {
            // own props
            this.info = {};

            // loader
            return this.loadInfo();
        },
        storageKey: 'myfm_user',
        loadInfo: function() {
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

                self.info = data || {};
                return self.info;
            });
        },
        saveInfo: function() {
            var key = this.storageKey;
            var data = this.info;

            ds.storage(key, data);
        },
        setInfo: function(key, val) {
            this.info[key] = val;

            this.saveInfo();
        }
    });

    global.User = User;
})(this);
