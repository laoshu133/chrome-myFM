/**
 * User
 *
 */

(function(global) {
    function User() {
        this.init();
    }

    ds.mix(User.prototype, {
        info: null,
        currChannel: null,
        init: function() {
            this.loadInfo();
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
            // var data = JSON.stringify(this.info);

            ds.storage(key, data);
        }
    });

    global.User = User;
})(this);
