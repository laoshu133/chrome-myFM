/**
 * ds.js
 * chrome extensions base module
 *
 */

(function(global) {
    var ds = {
        noop: function() {},
        mix: function(target, source, cover) {
            if(typeof source !== 'object') {
                cover = source;
                source = target;
                target = this;
            }

            for(var k in source) {
                if(cover || target[k] === undefined) {
                    target[k] = source[k];
                }
            }
            return target;
        }
    };

    // Utils
    ds.mix({
        extend: function(target, source) {
            if(typeof source !== 'object') {
                source = target;
                target = this;
            }
            return this.mix(target, source, true);
        },
        fill: function(tmpl, data) {
            for(var k in data) {
                tmpl = tmpl.replace(new RegExp('\\{'+ k +'\\}', 'g'), data[k]);
            }
            return tmpl;
        },
        storage: function(key, val) {
            var isSet = val && typeof val !== 'function';
            var method = isSet ? 'set' : 'get';
            var df = Promise.defer();

            var data = {};
            if(isSet) {
                data[key] = val;
            }
            else {
                data = key;
            }

            chrome.storage.sync[method](data, function(res) {
                df.resolve(res ? res[key] : undefined);
            });

            return df.promise;
        }
    });

    // Event
    ds.mix((function() {
        var _id = 0;
        function uuid() {
            return ++_id;
        }

        var key = parseInt(+new Date() * Math.random());

        function Event(type, props) {
            var e = {
                id: uuid(),
                type: type,
                key: key
            };

            return ds.mix(e, props || {});
        }

        return {
            uuid: uuid,
            Event: Event,
            EVENTKEY: key
        };
    }()));

    // Messager
    ds.Messager = (function() {
        var slice = Array.prototype.slice;
        var msgListeners = {};
        var msgCallbacks = {};

        function createPostEvent(type, data, callback) {
            if(typeof data === 'function') {
                callback = data;
                data = void 0;
            }

            var evt = ds.Event(type, {
                data: data
            });

            if(typeof callback === 'function') {
                msgCallbacks[evt.id] = callback;
            }

            return evt;
        }

        function handleEvent(e) {
            var type = e.type;
            var listeners = msgListeners[type];
            if(listeners && listeners.length) {
                for(var i=0,len=listeners.length; i<len; i++) {
                    listeners[i](e);
                }
            }

            var sourceId = e.sourceId;
            if(sourceId && msgCallbacks[sourceId]) {
                msgCallbacks[sourceId](e);

                delete msgCallbacks[sourceId];
            }
        }

        function initPortListener(port) {
            port.onMessage.addListener(function(e) {
                if(!e || !e.type) {
                    return;
                }
                e.port = port;
                e.tab = port.sender ? port.sender.tab : null;
                e.callback = function(data, evtProps) {
                    var evt = ds.Event('callback', ds.mix({
                        sourceId: e.id,
                        data: data
                    }, evtProps || {}));

                    port.postMessage(evt);
                };

                handleEvent(e);
            });
        }

        var _backgroundPort;
        function getBackgroundPort() {
            if(!_backgroundPort) {
                _backgroundPort = chrome.runtime.connect({ name: 'ds' });
                initPortListener(_backgroundPort);
            }

            return _backgroundPort;
        }

        // for extensions, background, content scripts
        chrome.runtime.onConnect.addListener(function(port) {
            if(port.name !== 'ds') {
                return;
            }

            initPortListener(port);
        });

        // for page
        global.addEventListener('message', function(e) {
            e = e.data;
            if(!e || !e.type || !e.key || e.key === ds.EVENTKEY) {
                return;
            }
            e.callback = function(data, evtProps) {
                var evt = ds.Event('callback', ds.mix({
                    sourceId: e.id,
                    data: data
                }, evtProps || {}));

                global.postMessage(evt, '*');
            };

            handleEvent(e);
        });

        return {
            addListener: function(type, callback) {
                var listeners = msgListeners[type];
                if(!listeners) {
                    listeners = msgListeners[type] = [];
                }

                if(typeof callback === 'function') {
                    listeners.push(callback);
                }

                return this;
            },
            postToBackground: function(/* type, data, callback */) {
                var evt = createPostEvent.apply(null, arguments);

                var port = getBackgroundPort();
                port.postMessage(evt);

                return this;
            },
            postToTab: function(tabId/*, type, data, callback */) {
                var args = slice.call(arguments, 1);
                var evt = createPostEvent.apply(null, args);

                var port = chrome.tabs.connect(tabId, {
                    name: 'ds'
                });

                initPortListener(port);
                port.postMessage(evt);

                return this;
            },
            postToCurrentTab: function(/* type, data, callback */) {
                var self = this;
                var args = slice.call(arguments);

                ds.getCurrentTab(function(tab) {
                    args.unshift(tab.id);
                    self.postToTab.apply(self, args);
                });

                return this;
            },
            postToPage: function() {
                var evt = createPostEvent.apply(null, arguments);
                global.postMessage(evt, '*');

                return this;
            }
        };
    })();

    // ajax
    ds.mix((function() {
        var tools = {
            param: function(data) {
                if(!data) {
                    return '';
                }

                var tmp, ret = [];
                for(var k in data) {
                    if(typeof data[k] !== 'function') {
                        tmp = encodeURIComponent(k);
                        tmp += '=';
                        tmp += encodeURIComponent(data[k]);

                        ret.push(tmp);
                    }
                }

                return ret.join('&');
            },
            ajax: function(ops) {
                if(typeof ops === 'string') {
                    ops = {
                        url: ops
                    };
                }

                ops = this.mix(ops || {}, {
                    url: null,
                    data: null,
                    type: 'get',
                    cache: true,
                    dataType: 'auto',
                    success: this.noop,
                    error: this.noop
                });
                ops.type = ops.type.toUpperCase();

                // params
                var url = ops.url;
                var type = ops.type;
                var data = ops.data;
                if(type === 'GET' && data) {
                    data = this.param(data);

                    if(data) {
                        url += url.indexOf('?') > -1 ? '&' : '?';
                        url += data;
                    }

                    data = null;
                }

                // res type
                var isBlobRespone = false;
                var dataType = ops.dataType.toLowerCase();
                if(/(?:blob|arraybuffer)/.test(dataType)) {
                    isBlobRespone = true;
                }

                // xhr
                var xhr = new XMLHttpRequest();
                xhr.open(type, url, true);

                if(isBlobRespone) {
                    xhr.responseType = dataType;
                }

                if(type === 'GET' && !ops.cache) {
                    xhr.setRequestHeader('Cache-Control', 'no-cache');
                    xhr.setRequestHeader('Pragma', 'no-cache');
                }

                // promise
                var df = Promise.defer();

                xhr.onload = function() {
                    var status = 'success';
                    var statusCode = xhr.status;
                    var ret = isBlobRespone ?
                        xhr.response : xhr.responseText;

                    if(statusCode >= 200 && statusCode < 300 ||
                        statusCode === 304
                    ) {
                        if(!dataType || dataType === 'auto') {
                            var resType = (xhr.getResponseHeader('content-type') || '').toLowerCase();
                            if(resType.indexOf('json') > -1) {
                                dataType = 'json';
                            }
                        }

                        if(dataType === 'json') {
                            try {
                                ret = JSON.parse(ret);
                            }
                            catch(ex) {
                                console.error(ex);

                                status = 'parseerror';
                                ret = null;
                            }
                        }
                    }
                    else {
                        status = 'error';
                    }

                    if(status !== 'success') {
                        ops.error(status, xhr);

                        df.reject(status, xhr);
                    }
                    else {
                        ops.success(ret, xhr);

                        df.resolve(ret, xhr);
                    }
                };
                xhr.onerror = function() {
                    var status = xhr.statusText || 'error';
                    ops.error(status, xhr);

                    df.reject(status, xhr);
                };

                xhr.send(data);

                var promise = df.promise;

                promise.xhr = xhr;
                return promise;
            },
            get: function(url, data, callback, dataType) {
                // shift arguments if data argument was omitted
                if(typeof data === 'function') {
                    dataType = dataType || callback;
                    callback = data;
                    data = undefined;
                }

                return this.ajax({
                    url: url,
                    data: data,
                    success: callback,
                    dataType: dataType
                });
            }
        };

        // content scripts
        if(!chrome.tabs) {
            tools.getByBackground = function(url, callback) {
                ds.Messager.postToBackground('ajax', url, callback);
            };
        }
        // background or popup
        else {
            ds.Messager.addListener('ajax', function(e) {
                var ops = e.data;
                if(typeof ops === 'string') {
                    ops = {
                        url: ops
                    };
                }

                ds.ajax(ds.mix(ops, {
                    success: function(data, xhr) {
                        var headers = {};
                        var repHeaders = xhr.getAllResponseHeaders();
                        repHeaders.split('\r\n').forEach(function(s) {
                            var a = s.split(': ');
                            if(a[0]) {
                                headers[a[0]] = a[1];
                            }
                        });
                        e.callback(data, {
                            status: 'success',
                            statusCode: xhr.status,
                            headers: headers
                        });
                    },
                    error: function(status, xhr) {
                        e.callback(null, {
                            status: status,
                            statusCode: xhr.status
                        });
                    }
                }));
            });
        }

        return tools;
    })());

    // socket
    (function() {
        if(!chrome.tabs) {
            return;
        }

        var socketCache = {};
        var Messager = ds.Messager;
        var WebSocket = global.WebSocket;
        var STATUS_OPEN = WebSocket.OPEN;

        Messager.addListener('socket_create', function(e) {
            var tabId = e.tab ? e.tab.id : 0;
            if(!tabId) {
                return;
            }

            var data = e.data;
            var socketId = ds.uuid();
            var socket = new WebSocket(data.url);
            var cache = socketCache[socketId] = {
                id: socketId,
                socket: socket,
                tabId: tabId
            };

            e.callback(null, {
                socketId: socketId
            });

            String('open,close,message,error').replace(/\w+/g, function(type) {
                socket['on' + type] = function(e) {
                    var data = e.data;
                    if(data) {
                        try {
                            data = JSON.parse(data);
                        }
                        catch(_){}
                    }

                    if(type === 'close') {
                        delete socketCache[socketId];
                    }

                    var evtType = 'socket_event_' + socketId;
                    Messager.postToTab(tabId, evtType, {
                        type: type,
                        data: data,
                        socketId: socketId
                    });
                };
            });
        })
        .addListener('socket_send', function(e) {
            var data = e.data;
            var cache = socketCache[data.socketId];
            var socket = cache ? cache.socket : null;

            if(socket && socket.readyState === STATUS_OPEN) {
                var postData = data.data;
                if(typeof postData === 'object') {
                    postData = JSON.stringify(postData);
                }

                socket.send(postData);
            }
        })
        .addListener('socket_close', function(e) {
            var data = e.data;
            var cache = socketCache[data.socketId];
            var socket = cache ? cache.socket : null;

            if(socket && socket.readyState === STATUS_OPEN) {
                delete socketCache[data.socketId];
                socket.close();
            }
        });

        function cleanCacheByTabId(tabId) {
            Object.keys(socketCache).forEach(function(inx) {
                var item = socketCache[inx];

                if(item.tabId === tabId) {
                    delete socketCache[item.id];
                    item.socket.close();
                }
            });
        }

        // clean by tab onUpdated, onRemoved
        chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
            if(info && info.status === 'loading') {
                cleanCacheByTabId(tabId);
            }
        });
        chrome.tabs.onRemoved.addListener(function(tabId) {
           cleanCacheByTabId(tabId);
        });
    })();

    // utils
    ds.mix({
        getCurrentTab: function(callback) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                // chrome bug, not throw error
                try{
                    callback(tabs[0]);
                }
                catch(ex) {
                    console.error(ex);
                }
            });
        }
    });

    // shim
    ds.mix((function() {
        return {
            hackPromise: function() {
                Promise.prototype.always = function(callback) {
                    return this.then(callback, callback);
                };
            }
        };
    })());

    ds.hackPromise();

    global.ds =ds;
})(this);