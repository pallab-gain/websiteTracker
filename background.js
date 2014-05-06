var current_active = undefined;
var xhr = new XMLHttpRequest();
var successURL = 'http://localhost:3000/loginsuccess';

function get_time(gg) {
    var mn = 60, hr = mn * 60, dy = hr * 24, yr = dy * 365, tmp;
    var msg = "";
    return (function (given) {
        if (given >= yr) {
            tmp = Math.floor(given / yr);
            //console.log('yr', tmp);
            msg = msg + tmp + ':';
            given = given - (tmp * yr);
        }
        if (given >= dy) {
            tmp = Math.floor(given / dy);
            //console.log('dy', tmp);
            msg = msg + tmp + ':';
            given = given - (tmp * dy);
        }

        if (given >= hr) {
            tmp = Math.floor(given / hr);
            //console.log('hr', tmp);
            msg = msg + tmp + ':';
            given = given - (tmp * hr);
        }

        if (given >= mn) {
            tmp = Math.floor(given / mn);
            //console.log('mn', tmp);
            msg = msg + tmp;
            given = given - (tmp * mn);
        }
        return msg;
    })(gg);
};
function set_clear(main_callback) {
    return (function () {
        var keys;
        async.series([
            function (callback) {
                keys = _.keys(localStorage);
                callback(null);
            },
            function (callback) {
                async.each(keys, function (cur_key, _callback) {
                    if (cur_key.substr(0, 7) === 'xerxes-') {
                        localStorage.removeItem(cur_key);
                    }
                    _callback(null);
                }, function (err) {
                    callback(null);
                })
            }

        ], function (err, result) {
            main_callback();
        });
    })();
}
setInterval(function () {
    if (!_.isUndefined(current_active)) {
        var _hn = current_active.hostname.toString();
        if (_hn !== 'newtab') {
            var hn = "xerxes-" + _hn;
            var cb = localStorage.getItem(hn);
            var dd = localStorage.getItem('cur_date');
            if (_.isNull(dd)) {
                localStorage.setItem('cur_date', moment().format('l'));
                set_clear(function () {
                    if (_.isNull(cb)) {
                        localStorage.setItem(hn, 0);
                    } else {
                        localStorage.setItem(hn, (_.isNaN(parseFloat(cb)) ? parseFloat(0) : parseFloat(cb) ) + 1);
                    }
                    chrome.browserAction.setBadgeText({text: get_time(cb)});
                });
            } else {
                if (dd !== moment().format('l')) {
                    localStorage.setItem('cur_date', moment().format('l'));
                    set_clear(function () {
                        if (_.isNull(cb)) {
                            localStorage.setItem(hn, 0);
                        } else {
                            localStorage.setItem(hn, (_.isNaN(parseFloat(cb)) ? parseFloat(0) : parseFloat(cb) ) + 1);
                        }
                        chrome.browserAction.setBadgeText({text: get_time(cb)});
                    });
                } else {
                    if (_.isNull(cb)) {
                        localStorage.setItem(hn, 0);
                    } else {
                        localStorage.setItem(hn, (_.isNaN(parseFloat(cb)) ? parseFloat(0) : parseFloat(cb) ) + 1);
                    }
                    chrome.browserAction.setBadgeText({text: get_time(cb)});
                }
            }
        }
    } else {
        //console.log('vaaaaa');
    }
}, 1000);
chrome.tabs.onActivated.addListener(function (tabId, windowId) {
    chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function (tab) {
        console.log('onActive');
        var bucket = {"id": _.first(tab).id, "hostname": new URL(_.first(tab).url).hostname};
        current_active = bucket;
        //console.log('current active ', _.first(tab).id,_.first(tab).url,new URL(_.first(tab).url).hostname);
    })
});
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, cur_tab) {
    if (changeInfo.status === "complete") {
        if (cur_tab.active) {
            var bucket = {"id": cur_tab.id, "hostname": new URL(cur_tab.url).hostname};
            current_active = bucket;
            console.log('onUpdateComplete');
            if (_.isNull(localStorage.getItem('tSfbid'))) {
                (function (ctab) {
                    if (ctab.url.indexOf(successURL) === 0) {
                        chrome.tabs.remove(ctab.id);
                        xhr.open("GET", "http://localhost:3000/getdata", true);
                        xhr.send();
                        //localStorage.setItem('accessToken',access);
                    }
                    /* else if (ctab.url.indexOf(hideURL) === 0) {
                     chrome.tabs.remove(ctab.id);
                     }*/
                })(cur_tab)
            }
        }
    }

});
xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
        // innerText does not let the attacker inject HTML elements.
        //document.getElementById("resp").innerText = xhr.responseText;
        (function (response) {
            response = response.response;
            if(response && response.id){
                localStorage.setItem('tSfbid', response.id);
                console.log( response);
            }
        })(JSON.parse(xhr.responseText))
    }
}
chrome.tabs.onRemoved.addListener(function (tabid, cur_tab) {
    console.log('onRemove');
    chrome.tabs.query({"active": true, "lastFocusedWindow": true}, function (tab) {
        if (!_.isEmpty(tab) && _.first(tab).id !== tabid) {
            var bucket = {"id": _.first(tab).id, "hostname": new URL(_.first(tab).url).hostname};
            current_active = bucket;
        } else {
            if (!_.isUndefined(current_active)) {
                current_active = undefined;
            }
        }
    });

});