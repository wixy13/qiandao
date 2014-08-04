// Generated by CoffeeScript 1.7.1
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  define(function(require, exports, module) {
    var analyze_cookies, headers, mime_type, sort, utils, xhr;
    utils = require('/static/utils');
    xhr = function(har) {
      var entry, h, _i, _len, _ref;
      _ref = har.log.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (((function() {
          var _j, _len1, _ref1, _results;
          _ref1 = entry.request.headers;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            h = _ref1[_j];
            if (h.name === 'X-Requested-With' && h.value === 'XMLHttpRequest') {
              _results.push(h);
            }
          }
          return _results;
        })()).length > 0) {
          entry.filter_xhr = true;
        }
      }
      return har;
    };
    mime_type = function(har) {
      var entry, mt, _i, _len, _ref, _ref1;
      _ref = har.log.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        mt = (_ref1 = entry.response.content) != null ? _ref1.mimeType : void 0;
        entry.filter_mimeType = (function() {
          switch (false) {
            case mt.indexOf('audio') !== 0:
              return 'media';
            case mt.indexOf('image') !== 0:
              return 'image';
            case mt.indexOf('javascript') === -1:
              return 'javascript';
            case mt !== 'text/html':
              return 'document';
            case mt !== 'text/css' && mt !== 'application/x-pointplus':
              return 'style';
            case mt.indexOf('application') !== 0:
              return 'media';
            default:
              return 'other';
          }
        })();
      }
      return har;
    };
    analyze_cookies = function(har) {
      var cookie, cookie_jar, cookies, entry, h, header, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
      cookie_jar = new utils.CookieJar();
      _ref = har.log.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        cookies = {};
        _ref1 = cookie_jar.getCookiesSync(entry.request.url, {
          now: new Date(entry.startedDateTime)
        });
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          cookie = _ref1[_j];
          cookies[cookie.key] = cookie.value;
        }
        _ref2 = entry.request.cookies;
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          cookie = _ref2[_k];
          cookie.checked = false;
          if (cookie.name in cookies) {
            if (cookie.value === cookies[cookie.name]) {
              cookie.from_session = true;
              entry.filter_from_session = true;
            } else {
              cookie.cookie_changed = true;
              entry.filter_cookie_changed = true;
            }
          } else {
            cookie.cookie_added = true;
            entry.filter_cookie_added = true;
          }
        }
        _ref3 = (function() {
          var _len3, _m, _ref3, _results;
          _ref3 = entry.response.headers;
          _results = [];
          for (_m = 0, _len3 = _ref3.length; _m < _len3; _m++) {
            h = _ref3[_m];
            if (h.name.toLowerCase() === 'set-cookie') {
              _results.push(h);
            }
          }
          return _results;
        })();
        for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
          header = _ref3[_l];
          entry.filter_set_cookie = true;
          cookie_jar.setCookieSync(header.value, entry.request.url, {
            now: new Date(entry.startedDateTime)
          });
        }
      }
      return har;
    };
    sort = function(har) {
      har.log.entries = har.log.entries.sort(function(a, b) {
        if (a.pageref > b.pageref) {
          return 1;
        } else if (a.pageref < b.pageref) {
          return -1;
        } else if (a.startedDateTime > b.startedDateTime) {
          return 1;
        } else if (a.startedDateTime < b.startedDateTime) {
          return -1;
        } else {
          return 0;
        }
      });
      return har;
    };
    headers = function(har) {
      var entry, header, to_remove_headers, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      to_remove_headers = ['x-devtools-emulate-network-conditions-client-id', 'cookie'];
      _ref = har.log.entries;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        _ref1 = entry.request.headers;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          header = _ref1[_j];
          if (_ref2 = header.name.toLowerCase(), __indexOf.call(to_remove_headers, _ref2) < 0) {
            header.checked = true;
          } else {
            header.checked = false;
          }
        }
      }
      return har;
    };
    exports = {
      analyze: function(har) {
        return xhr(mime_type(analyze_cookies(headers(sort(har)))));
      },
      recommend: function(har) {
        var checked, cookie, e, entry, related_cookies, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _results;
        _ref = har.log.entries;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          entry = _ref[_i];
          entry.recommend = entry.checked ? true : false;
        }
        checked = (function() {
          var _j, _len1, _ref1, _results;
          _ref1 = har.log.entries;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            e = _ref1[_j];
            if (e.checked) {
              _results.push(e);
            }
          }
          return _results;
        })();
        related_cookies = [];
        for (_j = 0, _len1 = checked.length; _j < _len1; _j++) {
          entry = checked[_j];
          _ref1 = entry.request.cookies;
          for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
            cookie = _ref1[_k];
            related_cookies.push(cookie.name);
          }
        }
        _ref2 = har.log.entries;
        _results = [];
        for (_l = 0, _len3 = _ref2.length; _l < _len3; _l++) {
          entry = _ref2[_l];
          _results.push((function() {
            var _len4, _m, _ref3, _ref4, _results1;
            _ref3 = entry.response.cookies;
            _results1 = [];
            for (_m = 0, _len4 = _ref3.length; _m < _len4; _m++) {
              cookie = _ref3[_m];
              if (_ref4 = cookie.name, __indexOf.call(related_cookies, _ref4) >= 0) {
                entry.recommend = true;
                break;
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          })());
        }
        return _results;
      }
    };
    return exports;
  });

}).call(this);
