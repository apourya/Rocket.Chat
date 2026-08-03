Package["core-runtime"].queue("ostrio:cookies",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"ostrio:cookies":{"cookies.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/ostrio_cookies/cookies.js                                                                             //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    module.export({
      Cookies: () => Cookies
    });
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    let fetch;
    let WebApp;
    if (Meteor.isServer) {
      WebApp = require('meteor/webapp').WebApp;
    } else {
      fetch = require('meteor/fetch').fetch;
    }
    const NoOp = () => {};
    const urlRE = /\/___cookie___\/set/;
    const rootUrl = Meteor.isServer ? process.env.ROOT_URL : window.__meteor_runtime_config__.ROOT_URL || window.__meteor_runtime_config__.meteorEnv.ROOT_URL || false;
    const mobileRootUrl = Meteor.isServer ? process.env.MOBILE_ROOT_URL : window.__meteor_runtime_config__.MOBILE_ROOT_URL || window.__meteor_runtime_config__.meteorEnv.MOBILE_ROOT_URL || false;
    const helpers = {
      isUndefined(obj) {
        return obj === void 0;
      },
      isArray(obj) {
        return Array.isArray(obj);
      },
      clone(obj) {
        if (!this.isObject(obj)) return obj;
        return this.isArray(obj) ? obj.slice() : Object.assign({}, obj);
      }
    };
    const _helpers = ['Number', 'Object', 'Function'];
    for (let i = 0; i < _helpers.length; i++) {
      helpers['is' + _helpers[i]] = function (obj) {
        return Object.prototype.toString.call(obj) === '[object ' + _helpers[i] + ']';
      };
    }

    /**
     * @url https://github.com/jshttp/cookie/blob/master/index.js
     * @name cookie
     * @author jshttp
     * @license
     * (The MIT License)
     *
     * Copyright (c) 2012-2014 Roman Shtylman <shtylman@gmail.com>
     * Copyright (c) 2015 Douglas Christopher Wilson <doug@somethingdoug.com>
     *
     * Permission is hereby granted, free of charge, to any person obtaining
     * a copy of this software and associated documentation files (the
     * 'Software'), to deal in the Software without restriction, including
     * without limitation the rights to use, copy, modify, merge, publish,
     * distribute, sublicense, and/or sell copies of the Software, and to
     * permit persons to whom the Software is furnished to do so, subject to
     * the following conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
     * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
     * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
     * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
     * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    const decode = decodeURIComponent;
    const encode = encodeURIComponent;
    const pairSplitRegExp = /; */;

    /**
     * RegExp to match field-content in RFC 7230 sec 3.2
     *
     * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
     * field-vchar   = VCHAR / obs-text
     * obs-text      = %x80-FF
     */
    const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    /**
     * @function
     * @name tryDecode
     * @param {String} str
     * @param {Function} d
     * @summary Try decoding a string using a decoding function.
     * @private
     */
    const tryDecode = (str, d) => {
      try {
        return d(str);
      } catch (e) {
        return str;
      }
    };

    /**
     * @function
     * @name parse
     * @param {String} str
     * @param {Object} [options]
     * @return {Object}
     * @summary
     * Parse a cookie header.
     * Parse the given cookie header string into an object
     * The object has the various cookies as keys(names) => values
     * @private
     */
    const parse = (str, options) => {
      if (typeof str !== 'string') {
        throw new Meteor.Error(404, 'argument str must be a string');
      }
      const obj = {};
      const opt = options || {};
      let val;
      let key;
      let eqIndx;
      str.split(pairSplitRegExp).forEach(pair => {
        eqIndx = pair.indexOf('=');
        if (eqIndx < 0) {
          return;
        }
        key = pair.substr(0, eqIndx).trim();
        key = tryDecode(unescape(key), opt.decode || decode);
        val = pair.substr(++eqIndx, pair.length).trim();
        if (val[0] === '"') {
          val = val.slice(1, -1);
        }
        if (void 0 === obj[key]) {
          obj[key] = tryDecode(val, opt.decode || decode);
        }
      });
      return obj;
    };

    /**
     * @function
     * @name antiCircular
     * @param data {Object} - Circular or any other object which needs to be non-circular
     * @private
     */
    const antiCircular = _obj => {
      const object = helpers.clone(_obj);
      const cache = new Map();
      return JSON.stringify(object, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (cache.get(value)) {
            return void 0;
          }
          cache.set(value, true);
        }
        return value;
      });
    };

    /**
     * @function
     * @name serialize
     * @param {String} name
     * @param {String} val
     * @param {Object} [options]
     * @return { cookieString: String, sanitizedValue: Mixed }
     * @summary
     * Serialize data into a cookie header.
     * Serialize the a name value pair into a cookie string suitable for
     * http headers. An optional options object specified cookie parameters.
     * serialize('foo', 'bar', { httpOnly: true }) => "foo=bar; httpOnly"
     * @private
     */
    const serialize = function (key, val) {
      let opt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      let name;
      if (!fieldContentRegExp.test(key)) {
        name = escape(key);
      } else {
        name = key;
      }
      let sanitizedValue = val;
      let value = val;
      if (!helpers.isUndefined(value)) {
        if (helpers.isObject(value) || helpers.isArray(value)) {
          const stringified = antiCircular(value);
          value = encode("JSON.parse(".concat(stringified, ")"));
          sanitizedValue = JSON.parse(stringified);
        } else {
          value = encode(value);
          if (value && !fieldContentRegExp.test(value)) {
            value = escape(value);
          }
        }
      } else {
        value = '';
      }
      const pairs = ["".concat(name, "=").concat(value)];
      if (helpers.isNumber(opt.maxAge)) {
        pairs.push("Max-Age=".concat(opt.maxAge));
      }
      if (opt.domain && typeof opt.domain === 'string') {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new Meteor.Error(404, 'option domain is invalid');
        }
        pairs.push("Domain=".concat(opt.domain));
      }
      if (opt.path && typeof opt.path === 'string') {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new Meteor.Error(404, 'option path is invalid');
        }
        pairs.push("Path=".concat(opt.path));
      } else {
        pairs.push('Path=/');
      }
      opt.expires = opt.expires || opt.expire || false;
      if (opt.expires === Infinity) {
        pairs.push('Expires=Fri, 31 Dec 9999 23:59:59 GMT');
      } else if (opt.expires instanceof Date) {
        pairs.push("Expires=".concat(opt.expires.toUTCString()));
      } else if (opt.expires === 0) {
        pairs.push('Expires=0');
      } else if (helpers.isNumber(opt.expires)) {
        pairs.push("Expires=".concat(new Date(opt.expires).toUTCString()));
      }
      if (opt.httpOnly) {
        pairs.push('HttpOnly');
      }
      if (opt.secure) {
        pairs.push('Secure');
      }
      if (opt.firstPartyOnly) {
        pairs.push('First-Party-Only');
      }
      if (opt.sameSite) {
        pairs.push(opt.sameSite === true ? 'SameSite' : "SameSite=".concat(opt.sameSite));
      }
      return {
        cookieString: pairs.join('; '),
        sanitizedValue
      };
    };
    const isStringifiedRegEx = /JSON\.parse\((.*)\)/;
    const isTypedRegEx = /false|true|null/;
    const deserialize = string => {
      if (typeof string !== 'string') {
        return string;
      }
      if (isStringifiedRegEx.test(string)) {
        let obj = string.match(isStringifiedRegEx)[1];
        if (obj) {
          try {
            return JSON.parse(decode(obj));
          } catch (e) {
            console.error('[ostrio:cookies] [.get()] [deserialize()] Exception:', e, string, obj);
            return string;
          }
        }
        return string;
      } else if (isTypedRegEx.test(string)) {
        try {
          return JSON.parse(string);
        } catch (e) {
          return string;
        }
      }
      return string;
    };

    /**
     * @locus Anywhere
     * @class __cookies
     * @param opts {Object} - Options (configuration) object
     * @param opts._cookies {Object|String} - Current cookies as String or Object
     * @param opts.TTL {Number|Boolean} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
     * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
     * @param opts.response {http.ServerResponse|Object} - This object is created internally by a HTTP server
     * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
     * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
     * @summary Internal Class
     */
    class __cookies {
      constructor(opts) {
        this.__pendingCookies = [];
        this.TTL = opts.TTL || false;
        this.response = opts.response || false;
        this.runOnServer = opts.runOnServer || false;
        this.allowQueryStringCookies = opts.allowQueryStringCookies || false;
        this.allowedCordovaOrigins = opts.allowedCordovaOrigins || false;
        if (this.allowedCordovaOrigins === true) {
          this.allowedCordovaOrigins = /^http:\/\/localhost:12[0-9]{3}$/;
        }
        this.originRE = new RegExp("^https?://(".concat(rootUrl ? rootUrl : '').concat(mobileRootUrl ? '|' + mobileRootUrl : '', ")$"));
        if (helpers.isObject(opts._cookies)) {
          this.cookies = opts._cookies;
        } else {
          this.cookies = parse(opts._cookies);
        }
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name get
       * @param {String} key  - The name of the cookie to read
       * @param {String} _tmp - Unparsed string instead of user's cookies
       * @summary Read a cookie. If the cookie doesn't exist a null value will be returned.
       * @returns {String|void}
       */
      get(key, _tmp) {
        const cookieString = _tmp ? parse(_tmp) : this.cookies;
        if (!key || !cookieString) {
          return void 0;
        }
        if (cookieString.hasOwnProperty(key)) {
          return deserialize(cookieString[key]);
        }
        return void 0;
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name set
       * @param {String} key   - The name of the cookie to create/overwrite
       * @param {String} value - The value of the cookie
       * @param {Object} opts  - [Optional] Cookie options (see readme docs)
       * @summary Create/overwrite a cookie.
       * @returns {Boolean}
       */
      set(key, value) {
        let opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        if (key && !helpers.isUndefined(value)) {
          if (helpers.isNumber(this.TTL) && opts.expires === undefined) {
            opts.expires = new Date(+new Date() + this.TTL);
          }
          const {
            cookieString,
            sanitizedValue
          } = serialize(key, value, opts);
          this.cookies[key] = sanitizedValue;
          if (Meteor.isClient) {
            document.cookie = cookieString;
          } else if (this.response) {
            this.__pendingCookies.push(cookieString);
            this.response.setHeader('Set-Cookie', this.__pendingCookies);
          }
          return true;
        }
        return false;
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name remove
       * @param {String} key    - The name of the cookie to create/overwrite
       * @param {String} path   - [Optional] The path from where the cookie will be
       * readable. E.g., "/", "/mydir"; if not specified, defaults to the current
       * path of the current document location (string or null). The path must be
       * absolute (see RFC 2965). For more information on how to use relative paths
       * in this argument, see: https://developer.mozilla.org/en-US/docs/Web/API/document.cookie#Using_relative_URLs_in_the_path_parameter
       * @param {String} domain - [Optional] The domain from where the cookie will
       * be readable. E.g., "example.com", ".example.com" (includes all subdomains)
       * or "subdomain.example.com"; if not specified, defaults to the host portion
       * of the current document location (string or null).
       * @summary Remove a cookie(s).
       * @returns {Boolean}
       */
      remove(key) {
        let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '/';
        let domain = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
        if (key && this.cookies.hasOwnProperty(key)) {
          const {
            cookieString
          } = serialize(key, '', {
            domain,
            path,
            expires: new Date(0)
          });
          delete this.cookies[key];
          if (Meteor.isClient) {
            document.cookie = cookieString;
          } else if (this.response) {
            this.response.setHeader('Set-Cookie', cookieString);
          }
          return true;
        } else if (!key && this.keys().length > 0 && this.keys()[0] !== '') {
          const keys = Object.keys(this.cookies);
          for (let i = 0; i < keys.length; i++) {
            this.remove(keys[i]);
          }
          return true;
        }
        return false;
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name has
       * @param {String} key  - The name of the cookie to create/overwrite
       * @param {String} _tmp - Unparsed string instead of user's cookies
       * @summary Check whether a cookie exists in the current position.
       * @returns {Boolean}
       */
      has(key, _tmp) {
        const cookieString = _tmp ? parse(_tmp) : this.cookies;
        if (!key || !cookieString) {
          return false;
        }
        return cookieString.hasOwnProperty(key);
      }

      /**
       * @locus Anywhere
       * @memberOf __cookies
       * @name keys
       * @summary Returns an array of all readable cookies from this location.
       * @returns {[String]}
       */
      keys() {
        if (this.cookies) {
          return Object.keys(this.cookies);
        }
        return [];
      }

      /**
       * @locus Client
       * @memberOf __cookies
       * @name send
       * @param cb {Function} - Callback
       * @summary Send all cookies over XHR to server.
       * @returns {void}
       */
      send() {
        let cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : NoOp;
        if (Meteor.isServer) {
          cb(new Meteor.Error(400, "Can't run `.send()` on server, it's Client only method!"));
        }
        if (this.runOnServer) {
          let path = "".concat(window.__meteor_runtime_config__.ROOT_URL_PATH_PREFIX || window.__meteor_runtime_config__.meteorEnv.ROOT_URL_PATH_PREFIX || '', "/___cookie___/set");
          let query = '';
          if (Meteor.isCordova && this.allowQueryStringCookies) {
            const cookiesKeys = this.keys();
            const cookiesArray = [];
            for (let i = 0; i < cookiesKeys.length; i++) {
              const {
                sanitizedValue
              } = serialize(cookiesKeys[i], this.get(cookiesKeys[i]));
              const pair = "".concat(cookiesKeys[i], "=").concat(sanitizedValue);
              if (!cookiesArray.includes(pair)) {
                cookiesArray.push(pair);
              }
            }
            if (cookiesArray.length) {
              path = Meteor.absoluteUrl('___cookie___/set');
              query = "?___cookies___=".concat(encodeURIComponent(cookiesArray.join('; ')));
            }
          }
          fetch("".concat(path).concat(query), {
            credentials: 'include',
            type: 'cors'
          }).then(response => {
            cb(void 0, response);
          }).catch(cb);
        } else {
          cb(new Meteor.Error(400, "Can't send cookies on server when `runOnServer` is false."));
        }
        return void 0;
      }
    }

    /**
     * @function
     * @locus Server
     * @summary Middleware handler
     * @private
     */
    const __middlewareHandler = (request, response, opts) => {
      let _cookies = {};
      if (opts.runOnServer) {
        if (request.headers && request.headers.cookie) {
          _cookies = parse(request.headers.cookie);
        }
        return new __cookies({
          _cookies,
          TTL: opts.TTL,
          runOnServer: opts.runOnServer,
          response,
          allowQueryStringCookies: opts.allowQueryStringCookies
        });
      }
      throw new Meteor.Error(400, "Can't use middleware when `runOnServer` is false.");
    };

    /**
     * @locus Anywhere
     * @class Cookies
     * @param opts {Object}
     * @param opts.TTL {Number} - Default cookies expiration time (max-age) in milliseconds, by default - session (false)
     * @param opts.auto {Boolean} - [Server] Auto-bind in middleware as `req.Cookies`, by default `true`
     * @param opts.handler {Function} - [Server] Middleware handler
     * @param opts.runOnServer {Boolean} - Expose Cookies class to Server
     * @param opts.allowQueryStringCookies {Boolean} - Allow passing Cookies in a query string (in URL). Primary should be used only in Cordova environment
     * @param opts.allowedCordovaOrigins {Regex|Boolean} - [Server] Allow setting Cookies from that specific origin which in Meteor/Cordova is localhost:12XXX (^http://localhost:12[0-9]{3}$)
     * @summary Main Cookie class
     */
    class Cookies extends __cookies {
      constructor() {
        let opts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        opts.TTL = helpers.isNumber(opts.TTL) ? opts.TTL : false;
        opts.runOnServer = opts.runOnServer !== false ? true : false;
        opts.allowQueryStringCookies = opts.allowQueryStringCookies !== true ? false : true;
        if (Meteor.isClient) {
          opts._cookies = document.cookie;
          super(opts);
        } else {
          opts._cookies = {};
          super(opts);
          opts.auto = opts.auto !== false ? true : false;
          this.opts = opts;
          this.handler = helpers.isFunction(opts.handler) ? opts.handler : false;
          this.onCookies = helpers.isFunction(opts.onCookies) ? opts.onCookies : false;
          if (opts.runOnServer && !Cookies.isLoadedOnServer) {
            Cookies.isLoadedOnServer = true;
            if (opts.auto) {
              WebApp.connectHandlers.use((req, res, next) => {
                if (urlRE.test(req._parsedUrl.path)) {
                  const matchedCordovaOrigin = !!req.headers.origin && this.allowedCordovaOrigins && this.allowedCordovaOrigins.test(req.headers.origin);
                  const matchedOrigin = matchedCordovaOrigin || !!req.headers.origin && this.originRE.test(req.headers.origin);
                  if (matchedOrigin) {
                    res.setHeader('Access-Control-Allow-Credentials', 'true');
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                  }
                  const cookiesArray = [];
                  let cookiesObject = {};
                  if (matchedCordovaOrigin && opts.allowQueryStringCookies && req.query.___cookies___) {
                    cookiesObject = parse(decodeURIComponent(req.query.___cookies___));
                  } else if (req.headers.cookie) {
                    cookiesObject = parse(req.headers.cookie);
                  }
                  const cookiesKeys = Object.keys(cookiesObject);
                  if (cookiesKeys.length) {
                    for (let i = 0; i < cookiesKeys.length; i++) {
                      const {
                        cookieString
                      } = serialize(cookiesKeys[i], cookiesObject[cookiesKeys[i]]);
                      if (!cookiesArray.includes(cookieString)) {
                        cookiesArray.push(cookieString);
                      }
                    }
                    if (cookiesArray.length) {
                      res.setHeader('Set-Cookie', cookiesArray);
                    }
                  }
                  helpers.isFunction(this.onCookies) && this.onCookies(__middlewareHandler(req, res, opts));
                  res.writeHead(200);
                  res.end('');
                } else {
                  req.Cookies = __middlewareHandler(req, res, opts);
                  helpers.isFunction(this.handler) && this.handler(req.Cookies);
                  next();
                }
              });
            }
          }
        }
      }

      /**
       * @locus Server
       * @memberOf Cookies
       * @name middleware
       * @summary Get Cookies instance into callback
       * @returns {void}
       */
      middleware() {
        if (!Meteor.isServer) {
          throw new Meteor.Error(500, "[ostrio:cookies] Can't use `.middleware()` on Client, it's Server only!");
        }
        return (req, res, next) => {
          helpers.isFunction(this.handler) && this.handler(__middlewareHandler(req, res, this.opts));
          next();
        };
      }
    }
    if (Meteor.isServer) {
      Cookies.isLoadedOnServer = false;
    }

    /* Export the Cookies class */
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/ostrio:cookies/cookies.js"
  ],
  mainModulePath: "/node_modules/meteor/ostrio:cookies/cookies.js"
}});

//# sourceURL=meteor://💻app/packages/ostrio_cookies.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb3N0cmlvOmNvb2tpZXMvY29va2llcy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJleHBvcnQiLCJDb29raWVzIiwiTWV0ZW9yIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsImZldGNoIiwiV2ViQXBwIiwiaXNTZXJ2ZXIiLCJyZXF1aXJlIiwiTm9PcCIsInVybFJFIiwicm9vdFVybCIsInByb2Nlc3MiLCJlbnYiLCJST09UX1VSTCIsIndpbmRvdyIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJtZXRlb3JFbnYiLCJtb2JpbGVSb290VXJsIiwiTU9CSUxFX1JPT1RfVVJMIiwiaGVscGVycyIsImlzVW5kZWZpbmVkIiwib2JqIiwiaXNBcnJheSIsIkFycmF5IiwiY2xvbmUiLCJpc09iamVjdCIsInNsaWNlIiwiT2JqZWN0IiwiYXNzaWduIiwiX2hlbHBlcnMiLCJpIiwibGVuZ3RoIiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiZGVjb2RlIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwicGFpclNwbGl0UmVnRXhwIiwiZmllbGRDb250ZW50UmVnRXhwIiwidHJ5RGVjb2RlIiwic3RyIiwiZCIsImUiLCJwYXJzZSIsIm9wdGlvbnMiLCJFcnJvciIsIm9wdCIsInZhbCIsImtleSIsImVxSW5keCIsInNwbGl0IiwiZm9yRWFjaCIsInBhaXIiLCJpbmRleE9mIiwic3Vic3RyIiwidHJpbSIsInVuZXNjYXBlIiwiYW50aUNpcmN1bGFyIiwiX29iaiIsIm9iamVjdCIsImNhY2hlIiwiTWFwIiwiSlNPTiIsInN0cmluZ2lmeSIsInZhbHVlIiwiZ2V0Iiwic2V0Iiwic2VyaWFsaXplIiwiYXJndW1lbnRzIiwidW5kZWZpbmVkIiwibmFtZSIsInRlc3QiLCJlc2NhcGUiLCJzYW5pdGl6ZWRWYWx1ZSIsInN0cmluZ2lmaWVkIiwiY29uY2F0IiwicGFpcnMiLCJpc051bWJlciIsIm1heEFnZSIsInB1c2giLCJkb21haW4iLCJwYXRoIiwiZXhwaXJlcyIsImV4cGlyZSIsIkluZmluaXR5IiwiRGF0ZSIsInRvVVRDU3RyaW5nIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJmaXJzdFBhcnR5T25seSIsInNhbWVTaXRlIiwiY29va2llU3RyaW5nIiwiam9pbiIsImlzU3RyaW5naWZpZWRSZWdFeCIsImlzVHlwZWRSZWdFeCIsImRlc2VyaWFsaXplIiwic3RyaW5nIiwibWF0Y2giLCJjb25zb2xlIiwiZXJyb3IiLCJfX2Nvb2tpZXMiLCJjb25zdHJ1Y3RvciIsIm9wdHMiLCJfX3BlbmRpbmdDb29raWVzIiwiVFRMIiwicmVzcG9uc2UiLCJydW5PblNlcnZlciIsImFsbG93UXVlcnlTdHJpbmdDb29raWVzIiwiYWxsb3dlZENvcmRvdmFPcmlnaW5zIiwib3JpZ2luUkUiLCJSZWdFeHAiLCJfY29va2llcyIsImNvb2tpZXMiLCJfdG1wIiwiaGFzT3duUHJvcGVydHkiLCJpc0NsaWVudCIsImRvY3VtZW50IiwiY29va2llIiwic2V0SGVhZGVyIiwicmVtb3ZlIiwia2V5cyIsImhhcyIsInNlbmQiLCJjYiIsIlJPT1RfVVJMX1BBVEhfUFJFRklYIiwicXVlcnkiLCJpc0NvcmRvdmEiLCJjb29raWVzS2V5cyIsImNvb2tpZXNBcnJheSIsImluY2x1ZGVzIiwiYWJzb2x1dGVVcmwiLCJjcmVkZW50aWFscyIsInR5cGUiLCJ0aGVuIiwiY2F0Y2giLCJfX21pZGRsZXdhcmVIYW5kbGVyIiwicmVxdWVzdCIsImhlYWRlcnMiLCJhdXRvIiwiaGFuZGxlciIsImlzRnVuY3Rpb24iLCJvbkNvb2tpZXMiLCJpc0xvYWRlZE9uU2VydmVyIiwiY29ubmVjdEhhbmRsZXJzIiwidXNlIiwicmVxIiwicmVzIiwibmV4dCIsIl9wYXJzZWRVcmwiLCJtYXRjaGVkQ29yZG92YU9yaWdpbiIsIm9yaWdpbiIsIm1hdGNoZWRPcmlnaW4iLCJjb29raWVzT2JqZWN0IiwiX19fY29va2llc19fXyIsIndyaXRlSGVhZCIsImVuZCIsIm1pZGRsZXdhcmUiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUFBLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDO01BQUNDLE9BQU8sRUFBQ0EsQ0FBQSxLQUFJQTtJQUFPLENBQUMsQ0FBQztJQUFDLElBQUlDLE1BQU07SUFBQ0gsTUFBTSxDQUFDSSxJQUFJLENBQUMsZUFBZSxFQUFDO01BQUNELE1BQU1BLENBQUNFLENBQUMsRUFBQztRQUFDRixNQUFNLEdBQUNFLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJQyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUVqSyxJQUFJQyxLQUFLO0lBQ1QsSUFBSUMsTUFBTTtJQUVWLElBQUlMLE1BQU0sQ0FBQ00sUUFBUSxFQUFFO01BQ3BCRCxNQUFNLEdBQUdFLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQ0YsTUFBTTtJQUN6QyxDQUFDLE1BQU07TUFDTkQsS0FBSyxHQUFHRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUNILEtBQUs7SUFDdEM7SUFFQSxNQUFNSSxJQUFJLEdBQUdBLENBQUEsS0FBTSxDQUFDLENBQUM7SUFDckIsTUFBTUMsS0FBSyxHQUFHLHFCQUFxQjtJQUNuQyxNQUFNQyxPQUFPLEdBQUdWLE1BQU0sQ0FBQ00sUUFBUSxHQUM1QkssT0FBTyxDQUFDQyxHQUFHLENBQUNDLFFBQVEsR0FDcEJDLE1BQU0sQ0FBQ0MseUJBQXlCLENBQUNGLFFBQVEsSUFBSUMsTUFBTSxDQUFDQyx5QkFBeUIsQ0FBQ0MsU0FBUyxDQUFDSCxRQUFRLElBQUksS0FBSztJQUM1RyxNQUFNSSxhQUFhLEdBQUdqQixNQUFNLENBQUNNLFFBQVEsR0FDbENLLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDTSxlQUFlLEdBQzNC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QUFDLENBQUM7WUFDSDtVQUNEO1FBQ0Q7TUFDRDs7TUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtNQUNDUyxVQUFVQSxDQUFBLEVBQUc7UUFDWixJQUFJLENBQUM5SixNQUFNLENBQUNNLFFBQVEsRUFBRTtVQUNyQixNQUFNLElBQUlOLE1BQU0sQ0FBQytDLEtBQUssQ0FBQyxHQUFHLEVBQUUseUVBQXlFLENBQUM7UUFDdkc7UUFFQSxPQUFPLENBQUNvRyxHQUFHLEVBQUVDLEdBQUcsRUFBRUMsSUFBSSxLQUFLO1VBQzFCbEksT0FBTyxDQUFDMkgsVUFBVSxDQUFDLElBQUksQ0FBQ0QsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDQSxPQUFPLENBQUNKLG1CQUFtQixDQUFDVSxHQUFHLEVBQUVDLEdBQUcsRUFBRSxJQUFJLENBQUM1QyxJQUFJLENBQUMsQ0FBQztVQUMxRjZDLElBQUksQ0FBQyxDQUFDO1FBQ1AsQ0FBQztNQUNGO0lBQ0Q7SUFFQSxJQUFJckosTUFBTSxDQUFDTSxRQUFRLEVBQUU7TUFDcEJQLE9BQU8sQ0FBQ2lKLGdCQUFnQixHQUFHLEtBQUs7SUFDakM7O0lBRUE7SUFBQWUsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvb3N0cmlvX2Nvb2tpZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxubGV0IGZldGNoO1xubGV0IFdlYkFwcDtcblxuaWYgKE1ldGVvci5pc1NlcnZlcikge1xuXHRXZWJBcHAgPSByZXF1aXJlKCdtZXRlb3Ivd2ViYXBwJykuV2ViQXBwO1xufSBlbHNlIHtcblx0ZmV0Y2ggPSByZXF1aXJlKCdtZXRlb3IvZmV0Y2gnKS5mZXRjaDtcbn1cblxuY29uc3QgTm9PcCA9ICgpID0+IHt9O1xuY29uc3QgdXJsUkUgPSAvXFwvX19fY29va2llX19fXFwvc2V0LztcbmNvbnN0IHJvb3RVcmwgPSBNZXRlb3IuaXNTZXJ2ZXJcblx0PyBwcm9jZXNzLmVudi5ST09UX1VSTFxuXHQ6IHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlJPT1RfVVJMIHx8IHdpbmRvdy5fX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLm1ldGVvckVudi5ST09UX1VSTCB8fCBmYWxzZTtcbmNvbnN0IG1vYmlsZVJvb3RVcmwgPSBNZXRlb3IuaXNTZXJ2ZXJcblx0PyBwcm9jZXNzLmVudi5NT0JJTEVfUk9PVF9VUkxcblx0OiB3aW5kb3cuX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5NT0JJTEVfUk9PVF9VUkwgfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52Lk1PQklMRV9ST09UX1VSTCB8fCBmYWxzZTtcblxuY29uc3QgaGVscGVycyA9IHtcblx0aXNVbmRlZmluZWQob2JqKSB7XG5cdFx0cmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuXHR9LFxuXHRpc0FycmF5KG9iaikge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KG9iaik7XG5cdH0sXG5cdGNsb25lKG9iaikge1xuXHRcdGlmICghdGhpcy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuXHRcdHJldHVybiB0aGlzLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogT2JqZWN0LmFzc2lnbih7fSwgb2JqKTtcblx0fSxcbn07XG5jb25zdCBfaGVscGVycyA9IFsnTnVtYmVyJywgJ09iamVjdCcsICdGdW5jdGlvbiddO1xuZm9yIChsZXQgaSA9IDA7IGkgPCBfaGVscGVycy5sZW5ndGg7IGkrKykge1xuXHRoZWxwZXJzWydpcycgKyBfaGVscGVyc1tpXV0gPSBmdW5jdGlvbiAob2JqKSB7XG5cdFx0cmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgX2hlbHBlcnNbaV0gKyAnXSc7XG5cdH07XG59XG5cbi8qKlxuICogQHVybCBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL2Nvb2tpZS9ibG9iL21hc3Rlci9pbmRleC5qc1xuICogQG5hbWUgY29va2llXG4gKiBAYXV0aG9yIGpzaHR0cFxuICogQGxpY2Vuc2VcbiAqIChUaGUgTUlUIExpY2Vuc2UpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEyLTIwMTQgUm9tYW4gU2h0eWxtYW4gPHNodHlsbWFuQGdtYWlsLmNvbT5cbiAqIENvcHlyaWdodCAoYykgMjAxNSBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvbiA8ZG91Z0Bzb21ldGhpbmdkb3VnLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4gKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuICogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbiAqIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5jb25zdCBkZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG5jb25zdCBlbmNvZGUgPSBlbmNvZGVVUklDb21wb25lbnQ7XG5jb25zdCBwYWlyU3BsaXRSZWdFeHAgPSAvOyAqLztcblxuLyoqXG4gKiBSZWdFeHAgdG8gbWF0Y2ggZmllbGQtY29udGVudCBpbiBSRkMgNzIzMCBzZWMgMy4yXG4gKlxuICogZmllbGQtY29udGVudCA9IGZpZWxkLXZjaGFyIFsgMSooIFNQIC8gSFRBQiApIGZpZWxkLXZjaGFyIF1cbiAqIGZpZWxkLXZjaGFyICAgPSBWQ0hBUiAvIG9icy10ZXh0XG4gKiBvYnMtdGV4dCAgICAgID0gJXg4MC1GRlxuICovXG5jb25zdCBmaWVsZENvbnRlbnRSZWdFeHAgPSAvXltcXHUwMDA5XFx1MDAyMC1cXHUwMDdlXFx1MDA4MC1cXHUwMGZmXSskLztcblxuLyoqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHRyeURlY29kZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtGdW5jdGlvbn0gZFxuICogQHN1bW1hcnkgVHJ5IGRlY29kaW5nIGEgc3RyaW5nIHVzaW5nIGEgZGVjb2RpbmcgZnVuY3Rpb24uXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCB0cnlEZWNvZGUgPSAoc3RyLCBkKSA9PiB7XG5cdHRyeSB7XG5cdFx0cmV0dXJuIGQoc3RyKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBwYXJzZVxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHJldHVybiB7T2JqZWN0fVxuICogQHN1bW1hcnlcbiAqIFBhcnNlIGEgY29va2llIGhlYWRlci5cbiAqIFBhcnNlIHRoZSBnaXZlbiBjb29raWUgaGVhZGVyIHN0cmluZyBpbnRvIGFuIG9iamVjdFxuICogVGhlIG9iamVjdCBoYXMgdGhlIHZhcmlvdXMgY29va2llcyBhcyBrZXlzKG5hbWVzKSA9PiB2YWx1ZXNcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHBhcnNlID0gKHN0ciwgb3B0aW9ucykgPT4ge1xuXHRpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgJ2FyZ3VtZW50IHN0ciBtdXN0IGJlIGEgc3RyaW5nJyk7XG5cdH1cblx0Y29uc3Qgb2JqID0ge307XG5cdGNvbnN0IG9wdCA9IG9wdGlvbnMgfHwge307XG5cdGxldCB2YWw7XG5cdGxldCBrZXk7XG5cdGxldCBlcUluZHg7XG5cblx0c3RyLnNwbGl0KHBhaXJTcGxpdFJlZ0V4cCkuZm9yRWFjaCgocGFpcikgPT4ge1xuXHRcdGVxSW5keCA9IHBhaXIuaW5kZXhPZignPScpO1xuXHRcdGlmIChlcUluZHggPCAwKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGtleSA9IHBhaXIuc3Vic3RyKDAsIGVxSW5keCkudHJpbSgpO1xuXHRcdGtleSA9IHRyeURlY29kZSh1bmVzY2FwZShrZXkpLCBvcHQuZGVjb2RlIHx8IGRlY29kZSk7XG5cdFx0dmFsID0gcGFpci5zdWJzdHIoKytlcUluZHgsIHBhaXIubGVuZ3RoKS50cmltKCk7XG5cdFx0aWYgKHZhbFswXSA9PT0gJ1wiJykge1xuXHRcdFx0dmFsID0gdmFsLnNsaWNlKDEsIC0xKTtcblx0XHR9XG5cdFx0aWYgKHZvaWQgMCA9PT0gb2JqW2tleV0pIHtcblx0XHRcdG9ialtrZXldID0gdHJ5RGVjb2RlKHZhbCwgb3B0LmRlY29kZSB8fCBkZWNvZGUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBvYmo7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgYW50aUNpcmN1bGFyXG4gKiBAcGFyYW0gZGF0YSB7T2JqZWN0fSAtIENpcmN1bGFyIG9yIGFueSBvdGhlciBvYmplY3Qgd2hpY2ggbmVlZHMgdG8gYmUgbm9uLWNpcmN1bGFyXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBhbnRpQ2lyY3VsYXIgPSAoX29iaikgPT4ge1xuXHRjb25zdCBvYmplY3QgPSBoZWxwZXJzLmNsb25lKF9vYmopO1xuXHRjb25zdCBjYWNoZSA9IG5ldyBNYXAoKTtcblx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KG9iamVjdCwgKGtleSwgdmFsdWUpID0+IHtcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0aWYgKGNhY2hlLmdldCh2YWx1ZSkpIHtcblx0XHRcdFx0cmV0dXJuIHZvaWQgMDtcblx0XHRcdH1cblx0XHRcdGNhY2hlLnNldCh2YWx1ZSwgdHJ1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiB2YWx1ZTtcblx0fSk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2VyaWFsaXplXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHJldHVybiB7IGNvb2tpZVN0cmluZzogU3RyaW5nLCBzYW5pdGl6ZWRWYWx1ZTogTWl4ZWQgfVxuICogQHN1bW1hcnlcbiAqIFNlcmlhbGl6ZSBkYXRhIGludG8gYSBjb29raWUgaGVhZGVyLlxuICogU2VyaWFsaXplIHRoZSBhIG5hbWUgdmFsdWUgcGFpciBpbnRvIGEgY29va2llIHN0cmluZyBzdWl0YWJsZSBmb3JcbiAqIGh0dHAgaGVhZGVycy4gQW4gb3B0aW9uYWwgb3B0aW9ucyBvYmplY3Qgc3BlY2lmaWVkIGNvb2tpZSBwYXJhbWV0ZXJzLlxuICogc2VyaWFsaXplKCdmb28nLCAnYmFyJywgeyBodHRwT25seTogdHJ1ZSB9KSA9PiBcImZvbz1iYXI7IGh0dHBPbmx5XCJcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IHNlcmlhbGl6ZSA9IChrZXksIHZhbCwgb3B0ID0ge30pID0+IHtcblx0bGV0IG5hbWU7XG5cblx0aWYgKCFmaWVsZENvbnRlbnRSZWdFeHAudGVzdChrZXkpKSB7XG5cdFx0bmFtZSA9IGVzY2FwZShrZXkpO1xuXHR9IGVsc2Uge1xuXHRcdG5hbWUgPSBrZXk7XG5cdH1cblxuXHRsZXQgc2FuaXRpemVkVmFsdWUgPSB2YWw7XG5cdGxldCB2YWx1ZSA9IHZhbDtcblx0aWYgKCFoZWxwZXJzLmlzVW5kZWZpbmVkKHZhbHVlKSkge1xuXHRcdGlmIChoZWxwZXJzLmlzT2JqZWN0KHZhbHVlKSB8fCBoZWxwZXJzLmlzQXJyYXkodmFsdWUpKSB7XG5cdFx0XHRjb25zdCBzdHJpbmdpZmllZCA9IGFudGlDaXJjdWxhcih2YWx1ZSk7XG5cdFx0XHR2YWx1ZSA9IGVuY29kZShgSlNPTi5wYXJzZSgke3N0cmluZ2lmaWVkfSlgKTtcblx0XHRcdHNhbml0aXplZFZhbHVlID0gSlNPTi5wYXJzZShzdHJpbmdpZmllZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbHVlID0gZW5jb2RlKHZhbHVlKTtcblx0XHRcdGlmICh2YWx1ZSAmJiAhZmllbGRDb250ZW50UmVnRXhwLnRlc3QodmFsdWUpKSB7XG5cdFx0XHRcdHZhbHVlID0gZXNjYXBlKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dmFsdWUgPSAnJztcblx0fVxuXG5cdGNvbnN0IHBhaXJzID0gW2Ake25hbWV9PSR7dmFsdWV9YF07XG5cblx0aWYgKGhlbHBlcnMuaXNOdW1iZXIob3B0Lm1heEFnZSkpIHtcblx0XHRwYWlycy5wdXNoKGBNYXgtQWdlPSR7b3B0Lm1heEFnZX1gKTtcblx0fVxuXG5cdGlmIChvcHQuZG9tYWluICYmIHR5cGVvZiBvcHQuZG9tYWluID09PSAnc3RyaW5nJykge1xuXHRcdGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3Qob3B0LmRvbWFpbikpIHtcblx0XHRcdHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDA0LCAnb3B0aW9uIGRvbWFpbiBpcyBpbnZhbGlkJyk7XG5cdFx0fVxuXHRcdHBhaXJzLnB1c2goYERvbWFpbj0ke29wdC5kb21haW59YCk7XG5cdH1cblxuXHRpZiAob3B0LnBhdGggJiYgdHlwZW9mIG9wdC5wYXRoID09PSAnc3RyaW5nJykge1xuXHRcdGlmICghZmllbGRDb250ZW50UmVnRXhwLnRlc3Qob3B0LnBhdGgpKSB7XG5cdFx0XHR0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwNCwgJ29wdGlvbiBwYXRoIGlzIGludmFsaWQnKTtcblx0XHR9XG5cdFx0cGFpcnMucHVzaChgUGF0aD0ke29wdC5wYXRofWApO1xuXHR9IGVsc2Uge1xuXHRcdHBhaXJzLnB1c2goJ1BhdGg9LycpO1xuXHR9XG5cblx0b3B0LmV4cGlyZXMgPSBvcHQuZXhwaXJlcyB8fCBvcHQuZXhwaXJlIHx8IGZhbHNlO1xuXHRpZiAob3B0LmV4cGlyZXMgPT09IEluZmluaXR5KSB7XG5cdFx0cGFpcnMucHVzaCgnRXhwaXJlcz1GcmksIDMxIERlYyA5OTk5IDIzOjU5OjU5IEdNVCcpO1xuXHR9IGVsc2UgaWYgKG9wdC5leHBpcmVzIGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdHBhaXJzLnB1c2goYEV4cGlyZXM9JHtvcHQuZXhwaXJlcy50b1VUQ1N0cmluZygpfWApO1xuXHR9IGVsc2UgaWYgKG9wdC5leHBpcmVzID09PSAwKSB7XG5cdFx0cGFpcnMucHVzaCgnRXhwaXJlcz0wJyk7XG5cdH0gZWxzZSBpZiAoaGVscGVycy5pc051bWJlcihvcHQuZXhwaXJlcykpIHtcblx0XHRwYWlycy5wdXNoKGBFeHBpcmVzPSR7bmV3IERhdGUob3B0LmV4cGlyZXMpLnRvVVRDU3RyaW5nKCl9YCk7XG5cdH1cblxuXHRpZiAob3B0Lmh0dHBPbmx5KSB7XG5cdFx0cGFpcnMucHVzaCgnSHR0cE9ubHknKTtcblx0fVxuXG5cdGlmIChvcHQuc2VjdXJlKSB7XG5cdFx0cGFpcnMucHVzaCgnU2VjdXJlJyk7XG5cdH1cblxuXHRpZiAob3B0LmZpcnN0UGFydHlPbmx5KSB7XG5cdFx0cGFpcnMucHVzaCgnRmlyc3QtUGFydHktT25seScpO1xuXHR9XG5cblx0aWYgKG9wdC5zYW1lU2l0ZSkge1xuXHRcdHBhaXJzLnB1c2gob3B0LnNhbWVTaXRlID09PSB0cnVlID8gJ1NhbWVTaXRlJyA6IGBTYW1lU2l0ZT0ke29wdC5zYW1lU2l0ZX1gKTtcblx0fVxuXG5cdHJldHVybiB7IGNvb2tpZVN0cmluZzogcGFpcnMuam9pbignOyAnKSwgc2FuaXRpemVkVmFsdWUgfTtcbn07XG5cbmNvbnN0IGlzU3RyaW5naWZpZWRSZWdFeCA9IC9KU09OXFwucGFyc2VcXCgoLiopXFwpLztcbmNvbnN0IGlzVHlwZWRSZWdFeCA9IC9mYWxzZXx0cnVlfG51bGwvO1xuY29uc3QgZGVzZXJpYWxpemUgPSAoc3RyaW5nKSA9PiB7XG5cdGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuXHRcdHJldHVybiBzdHJpbmc7XG5cdH1cblxuXHRpZiAoaXNTdHJpbmdpZmllZFJlZ0V4LnRlc3Qoc3RyaW5nKSkge1xuXHRcdGxldCBvYmogPSBzdHJpbmcubWF0Y2goaXNTdHJpbmdpZmllZFJlZ0V4KVsxXTtcblx0XHRpZiAob2JqKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShkZWNvZGUob2JqKSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ1tvc3RyaW86Y29va2llc10gWy5nZXQoKV0gW2Rlc2VyaWFsaXplKCldIEV4Y2VwdGlvbjonLCBlLCBzdHJpbmcsIG9iaik7XG5cdFx0XHRcdHJldHVybiBzdHJpbmc7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzdHJpbmc7XG5cdH0gZWxzZSBpZiAoaXNUeXBlZFJlZ0V4LnRlc3Qoc3RyaW5nKSkge1xuXHRcdHRyeSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShzdHJpbmcpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHJldHVybiBzdHJpbmc7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIF9fY29va2llc1xuICogQHBhcmFtIG9wdHMge09iamVjdH0gLSBPcHRpb25zIChjb25maWd1cmF0aW9uKSBvYmplY3RcbiAqIEBwYXJhbSBvcHRzLl9jb29raWVzIHtPYmplY3R8U3RyaW5nfSAtIEN1cnJlbnQgY29va2llcyBhcyBTdHJpbmcgb3IgT2JqZWN0XG4gKiBAcGFyYW0gb3B0cy5UVEwge051bWJlcnxCb29sZWFufSAtIERlZmF1bHQgY29va2llcyBleHBpcmF0aW9uIHRpbWUgKG1heC1hZ2UpIGluIG1pbGxpc2Vjb25kcywgYnkgZGVmYXVsdCAtIHNlc3Npb24gKGZhbHNlKVxuICogQHBhcmFtIG9wdHMucnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAcGFyYW0gb3B0cy5yZXNwb25zZSB7aHR0cC5TZXJ2ZXJSZXNwb25zZXxPYmplY3R9IC0gVGhpcyBvYmplY3QgaXMgY3JlYXRlZCBpbnRlcm5hbGx5IGJ5IGEgSFRUUCBzZXJ2ZXJcbiAqIEBwYXJhbSBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzIHtCb29sZWFufSAtIEFsbG93IHBhc3NpbmcgQ29va2llcyBpbiBhIHF1ZXJ5IHN0cmluZyAoaW4gVVJMKS4gUHJpbWFyeSBzaG91bGQgYmUgdXNlZCBvbmx5IGluIENvcmRvdmEgZW52aXJvbm1lbnRcbiAqIEBwYXJhbSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB7UmVnZXh8Qm9vbGVhbn0gLSBbU2VydmVyXSBBbGxvdyBzZXR0aW5nIENvb2tpZXMgZnJvbSB0aGF0IHNwZWNpZmljIG9yaWdpbiB3aGljaCBpbiBNZXRlb3IvQ29yZG92YSBpcyBsb2NhbGhvc3Q6MTJYWFggKF5odHRwOi8vbG9jYWxob3N0OjEyWzAtOV17M30kKVxuICogQHN1bW1hcnkgSW50ZXJuYWwgQ2xhc3NcbiAqL1xuY2xhc3MgX19jb29raWVzIHtcblx0Y29uc3RydWN0b3Iob3B0cykge1xuXHRcdHRoaXMuX19wZW5kaW5nQ29va2llcyA9IFtdO1xuXHRcdHRoaXMuVFRMID0gb3B0cy5UVEwgfHwgZmFsc2U7XG5cdFx0dGhpcy5yZXNwb25zZSA9IG9wdHMucmVzcG9uc2UgfHwgZmFsc2U7XG5cdFx0dGhpcy5ydW5PblNlcnZlciA9IG9wdHMucnVuT25TZXJ2ZXIgfHwgZmFsc2U7XG5cdFx0dGhpcy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyA9IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgfHwgZmFsc2U7XG5cdFx0dGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPSBvcHRzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyB8fCBmYWxzZTtcblxuXHRcdGlmICh0aGlzLmFsbG93ZWRDb3Jkb3ZhT3JpZ2lucyA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgPSAvXmh0dHA6XFwvXFwvbG9jYWxob3N0OjEyWzAtOV17M30kLztcblx0XHR9XG5cblx0XHR0aGlzLm9yaWdpblJFID0gbmV3IFJlZ0V4cChgXmh0dHBzPzpcXC9cXC8oJHtyb290VXJsID8gcm9vdFVybCA6ICcnfSR7bW9iaWxlUm9vdFVybCA/ICd8JyArIG1vYmlsZVJvb3RVcmwgOiAnJ30pJGApO1xuXG5cdFx0aWYgKGhlbHBlcnMuaXNPYmplY3Qob3B0cy5fY29va2llcykpIHtcblx0XHRcdHRoaXMuY29va2llcyA9IG9wdHMuX2Nvb2tpZXM7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuY29va2llcyA9IHBhcnNlKG9wdHMuX2Nvb2tpZXMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAbG9jdXMgQW55d2hlcmVcblx0ICogQG1lbWJlck9mIF9fY29va2llc1xuXHQgKiBAbmFtZSBnZXRcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSAgLSBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRvIHJlYWRcblx0ICogQHBhcmFtIHtTdHJpbmd9IF90bXAgLSBVbnBhcnNlZCBzdHJpbmcgaW5zdGVhZCBvZiB1c2VyJ3MgY29va2llc1xuXHQgKiBAc3VtbWFyeSBSZWFkIGEgY29va2llLiBJZiB0aGUgY29va2llIGRvZXNuJ3QgZXhpc3QgYSBudWxsIHZhbHVlIHdpbGwgYmUgcmV0dXJuZWQuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd8dm9pZH1cblx0ICovXG5cdGdldChrZXksIF90bXApIHtcblx0XHRjb25zdCBjb29raWVTdHJpbmcgPSBfdG1wID8gcGFyc2UoX3RtcCkgOiB0aGlzLmNvb2tpZXM7XG5cdFx0aWYgKCFrZXkgfHwgIWNvb2tpZVN0cmluZykge1xuXHRcdFx0cmV0dXJuIHZvaWQgMDtcblx0XHR9XG5cblx0XHRpZiAoY29va2llU3RyaW5nLmhhc093blByb3BlcnR5KGtleSkpIHtcblx0XHRcdHJldHVybiBkZXNlcmlhbGl6ZShjb29raWVTdHJpbmdba2V5XSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHZvaWQgMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAbG9jdXMgQW55d2hlcmVcblx0ICogQG1lbWJlck9mIF9fY29va2llc1xuXHQgKiBAbmFtZSBzZXRcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSAgIC0gVGhlIG5hbWUgb2YgdGhlIGNvb2tpZSB0byBjcmVhdGUvb3ZlcndyaXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZSAtIFRoZSB2YWx1ZSBvZiB0aGUgY29va2llXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzICAtIFtPcHRpb25hbF0gQ29va2llIG9wdGlvbnMgKHNlZSByZWFkbWUgZG9jcylcblx0ICogQHN1bW1hcnkgQ3JlYXRlL292ZXJ3cml0ZSBhIGNvb2tpZS5cblx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdCAqL1xuXHRzZXQoa2V5LCB2YWx1ZSwgb3B0cyA9IHt9KSB7XG5cdFx0aWYgKGtleSAmJiAhaGVscGVycy5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcblx0XHRcdGlmIChoZWxwZXJzLmlzTnVtYmVyKHRoaXMuVFRMKSAmJiBvcHRzLmV4cGlyZXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRvcHRzLmV4cGlyZXMgPSBuZXcgRGF0ZSgrbmV3IERhdGUoKSArIHRoaXMuVFRMKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHsgY29va2llU3RyaW5nLCBzYW5pdGl6ZWRWYWx1ZSB9ID0gc2VyaWFsaXplKGtleSwgdmFsdWUsIG9wdHMpO1xuXG5cdFx0XHR0aGlzLmNvb2tpZXNba2V5XSA9IHNhbml0aXplZFZhbHVlO1xuXHRcdFx0aWYgKE1ldGVvci5pc0NsaWVudCkge1xuXHRcdFx0XHRkb2N1bWVudC5jb29raWUgPSBjb29raWVTdHJpbmc7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMucmVzcG9uc2UpIHtcblx0XHRcdFx0dGhpcy5fX3BlbmRpbmdDb29raWVzLnB1c2goY29va2llU3RyaW5nKTtcblx0XHRcdFx0dGhpcy5yZXNwb25zZS5zZXRIZWFkZXIoJ1NldC1Db29raWUnLCB0aGlzLl9fcGVuZGluZ0Nvb2tpZXMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAbG9jdXMgQW55d2hlcmVcblx0ICogQG1lbWJlck9mIF9fY29va2llc1xuXHQgKiBAbmFtZSByZW1vdmVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSAgICAtIFRoZSBuYW1lIG9mIHRoZSBjb29raWUgdG8gY3JlYXRlL292ZXJ3cml0ZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAgIC0gW09wdGlvbmFsXSBUaGUgcGF0aCBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbCBiZVxuXHQgKiByZWFkYWJsZS4gRS5nLiwgXCIvXCIsIFwiL215ZGlyXCI7IGlmIG5vdCBzcGVjaWZpZWQsIGRlZmF1bHRzIHRvIHRoZSBjdXJyZW50XG5cdCAqIHBhdGggb2YgdGhlIGN1cnJlbnQgZG9jdW1lbnQgbG9jYXRpb24gKHN0cmluZyBvciBudWxsKS4gVGhlIHBhdGggbXVzdCBiZVxuXHQgKiBhYnNvbHV0ZSAoc2VlIFJGQyAyOTY1KS4gRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gaG93IHRvIHVzZSByZWxhdGl2ZSBwYXRoc1xuXHQgKiBpbiB0aGlzIGFyZ3VtZW50LCBzZWU6IGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9kb2N1bWVudC5jb29raWUjVXNpbmdfcmVsYXRpdmVfVVJMc19pbl90aGVfcGF0aF9wYXJhbWV0ZXJcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiAtIFtPcHRpb25hbF0gVGhlIGRvbWFpbiBmcm9tIHdoZXJlIHRoZSBjb29raWUgd2lsbFxuXHQgKiBiZSByZWFkYWJsZS4gRS5nLiwgXCJleGFtcGxlLmNvbVwiLCBcIi5leGFtcGxlLmNvbVwiIChpbmNsdWRlcyBhbGwgc3ViZG9tYWlucylcblx0ICogb3IgXCJzdWJkb21haW4uZXhhbXBsZS5jb21cIjsgaWYgbm90IHNwZWNpZmllZCwgZGVmYXVsdHMgdG8gdGhlIGhvc3QgcG9ydGlvblxuXHQgKiBvZiB0aGUgY3VycmVudCBkb2N1bWVudCBsb2NhdGlvbiAoc3RyaW5nIG9yIG51bGwpLlxuXHQgKiBAc3VtbWFyeSBSZW1vdmUgYSBjb29raWUocykuXG5cdCAqIEByZXR1cm5zIHtCb29sZWFufVxuXHQgKi9cblx0cmVtb3ZlKGtleSwgcGF0aCA9ICcvJywgZG9tYWluID0gJycpIHtcblx0XHRpZiAoa2V5ICYmIHRoaXMuY29va2llcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG5cdFx0XHRjb25zdCB7IGNvb2tpZVN0cmluZyB9ID0gc2VyaWFsaXplKGtleSwgJycsIHtcblx0XHRcdFx0ZG9tYWluLFxuXHRcdFx0XHRwYXRoLFxuXHRcdFx0XHRleHBpcmVzOiBuZXcgRGF0ZSgwKSxcblx0XHRcdH0pO1xuXG5cdFx0XHRkZWxldGUgdGhpcy5jb29raWVzW2tleV07XG5cdFx0XHRpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG5cdFx0XHRcdGRvY3VtZW50LmNvb2tpZSA9IGNvb2tpZVN0cmluZztcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5yZXNwb25zZSkge1xuXHRcdFx0XHR0aGlzLnJlc3BvbnNlLnNldEhlYWRlcignU2V0LUNvb2tpZScsIGNvb2tpZVN0cmluZyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKCFrZXkgJiYgdGhpcy5rZXlzKCkubGVuZ3RoID4gMCAmJiB0aGlzLmtleXMoKVswXSAhPT0gJycpIHtcblx0XHRcdGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmNvb2tpZXMpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRoaXMucmVtb3ZlKGtleXNbaV0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAbG9jdXMgQW55d2hlcmVcblx0ICogQG1lbWJlck9mIF9fY29va2llc1xuXHQgKiBAbmFtZSBoYXNcblx0ICogQHBhcmFtIHtTdHJpbmd9IGtleSAgLSBUaGUgbmFtZSBvZiB0aGUgY29va2llIHRvIGNyZWF0ZS9vdmVyd3JpdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IF90bXAgLSBVbnBhcnNlZCBzdHJpbmcgaW5zdGVhZCBvZiB1c2VyJ3MgY29va2llc1xuXHQgKiBAc3VtbWFyeSBDaGVjayB3aGV0aGVyIGEgY29va2llIGV4aXN0cyBpbiB0aGUgY3VycmVudCBwb3NpdGlvbi5cblx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdCAqL1xuXHRoYXMoa2V5LCBfdG1wKSB7XG5cdFx0Y29uc3QgY29va2llU3RyaW5nID0gX3RtcCA/IHBhcnNlKF90bXApIDogdGhpcy5jb29raWVzO1xuXHRcdGlmICgha2V5IHx8ICFjb29raWVTdHJpbmcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY29va2llU3RyaW5nLmhhc093blByb3BlcnR5KGtleSk7XG5cdH1cblxuXHQvKipcblx0ICogQGxvY3VzIEFueXdoZXJlXG5cdCAqIEBtZW1iZXJPZiBfX2Nvb2tpZXNcblx0ICogQG5hbWUga2V5c1xuXHQgKiBAc3VtbWFyeSBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCByZWFkYWJsZSBjb29raWVzIGZyb20gdGhpcyBsb2NhdGlvbi5cblx0ICogQHJldHVybnMge1tTdHJpbmddfVxuXHQgKi9cblx0a2V5cygpIHtcblx0XHRpZiAodGhpcy5jb29raWVzKSB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb29raWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBsb2N1cyBDbGllbnRcblx0ICogQG1lbWJlck9mIF9fY29va2llc1xuXHQgKiBAbmFtZSBzZW5kXG5cdCAqIEBwYXJhbSBjYiB7RnVuY3Rpb259IC0gQ2FsbGJhY2tcblx0ICogQHN1bW1hcnkgU2VuZCBhbGwgY29va2llcyBvdmVyIFhIUiB0byBzZXJ2ZXIuXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKi9cblx0c2VuZChjYiA9IE5vT3ApIHtcblx0XHRpZiAoTWV0ZW9yLmlzU2VydmVyKSB7XG5cdFx0XHRjYihuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJDYW4ndCBydW4gYC5zZW5kKClgIG9uIHNlcnZlciwgaXQncyBDbGllbnQgb25seSBtZXRob2QhXCIpKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5ydW5PblNlcnZlcikge1xuXHRcdFx0bGV0IHBhdGggPSBgJHtcblx0XHRcdFx0d2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkxfUEFUSF9QUkVGSVggfHwgd2luZG93Ll9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18ubWV0ZW9yRW52LlJPT1RfVVJMX1BBVEhfUFJFRklYIHx8ICcnXG5cdFx0XHR9L19fX2Nvb2tpZV9fXy9zZXRgO1xuXHRcdFx0bGV0IHF1ZXJ5ID0gJyc7XG5cblx0XHRcdGlmIChNZXRlb3IuaXNDb3Jkb3ZhICYmIHRoaXMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMpIHtcblx0XHRcdFx0Y29uc3QgY29va2llc0tleXMgPSB0aGlzLmtleXMoKTtcblx0XHRcdFx0Y29uc3QgY29va2llc0FycmF5ID0gW107XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llc0tleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCB7IHNhbml0aXplZFZhbHVlIH0gPSBzZXJpYWxpemUoY29va2llc0tleXNbaV0sIHRoaXMuZ2V0KGNvb2tpZXNLZXlzW2ldKSk7XG5cdFx0XHRcdFx0Y29uc3QgcGFpciA9IGAke2Nvb2tpZXNLZXlzW2ldfT0ke3Nhbml0aXplZFZhbHVlfWA7XG5cdFx0XHRcdFx0aWYgKCFjb29raWVzQXJyYXkuaW5jbHVkZXMocGFpcikpIHtcblx0XHRcdFx0XHRcdGNvb2tpZXNBcnJheS5wdXNoKHBhaXIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjb29raWVzQXJyYXkubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cGF0aCA9IE1ldGVvci5hYnNvbHV0ZVVybCgnX19fY29va2llX19fL3NldCcpO1xuXHRcdFx0XHRcdHF1ZXJ5ID0gYD9fX19jb29raWVzX19fPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGNvb2tpZXNBcnJheS5qb2luKCc7ICcpKX1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZldGNoKGAke3BhdGh9JHtxdWVyeX1gLCB7XG5cdFx0XHRcdGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG5cdFx0XHRcdHR5cGU6ICdjb3JzJyxcblx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdGNiKHZvaWQgMCwgcmVzcG9uc2UpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goY2IpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjYihuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJDYW4ndCBzZW5kIGNvb2tpZXMgb24gc2VydmVyIHdoZW4gYHJ1bk9uU2VydmVyYCBpcyBmYWxzZS5cIikpO1xuXHRcdH1cblx0XHRyZXR1cm4gdm9pZCAwO1xuXHR9XG59XG5cbi8qKlxuICogQGZ1bmN0aW9uXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAc3VtbWFyeSBNaWRkbGV3YXJlIGhhbmRsZXJcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IF9fbWlkZGxld2FyZUhhbmRsZXIgPSAocmVxdWVzdCwgcmVzcG9uc2UsIG9wdHMpID0+IHtcblx0bGV0IF9jb29raWVzID0ge307XG5cdGlmIChvcHRzLnJ1bk9uU2VydmVyKSB7XG5cdFx0aWYgKHJlcXVlc3QuaGVhZGVycyAmJiByZXF1ZXN0LmhlYWRlcnMuY29va2llKSB7XG5cdFx0XHRfY29va2llcyA9IHBhcnNlKHJlcXVlc3QuaGVhZGVycy5jb29raWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgX19jb29raWVzKHtcblx0XHRcdF9jb29raWVzLFxuXHRcdFx0VFRMOiBvcHRzLlRUTCxcblx0XHRcdHJ1bk9uU2VydmVyOiBvcHRzLnJ1bk9uU2VydmVyLFxuXHRcdFx0cmVzcG9uc2UsXG5cdFx0XHRhbGxvd1F1ZXJ5U3RyaW5nQ29va2llczogb3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyxcblx0XHR9KTtcblx0fVxuXG5cdHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAwLCBcIkNhbid0IHVzZSBtaWRkbGV3YXJlIHdoZW4gYHJ1bk9uU2VydmVyYCBpcyBmYWxzZS5cIik7XG59O1xuXG4vKipcbiAqIEBsb2N1cyBBbnl3aGVyZVxuICogQGNsYXNzIENvb2tpZXNcbiAqIEBwYXJhbSBvcHRzIHtPYmplY3R9XG4gKiBAcGFyYW0gb3B0cy5UVEwge051bWJlcn0gLSBEZWZhdWx0IGNvb2tpZXMgZXhwaXJhdGlvbiB0aW1lIChtYXgtYWdlKSBpbiBtaWxsaXNlY29uZHMsIGJ5IGRlZmF1bHQgLSBzZXNzaW9uIChmYWxzZSlcbiAqIEBwYXJhbSBvcHRzLmF1dG8ge0Jvb2xlYW59IC0gW1NlcnZlcl0gQXV0by1iaW5kIGluIG1pZGRsZXdhcmUgYXMgYHJlcS5Db29raWVzYCwgYnkgZGVmYXVsdCBgdHJ1ZWBcbiAqIEBwYXJhbSBvcHRzLmhhbmRsZXIge0Z1bmN0aW9ufSAtIFtTZXJ2ZXJdIE1pZGRsZXdhcmUgaGFuZGxlclxuICogQHBhcmFtIG9wdHMucnVuT25TZXJ2ZXIge0Jvb2xlYW59IC0gRXhwb3NlIENvb2tpZXMgY2xhc3MgdG8gU2VydmVyXG4gKiBAcGFyYW0gb3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyB7Qm9vbGVhbn0gLSBBbGxvdyBwYXNzaW5nIENvb2tpZXMgaW4gYSBxdWVyeSBzdHJpbmcgKGluIFVSTCkuIFByaW1hcnkgc2hvdWxkIGJlIHVzZWQgb25seSBpbiBDb3Jkb3ZhIGVudmlyb25tZW50XG4gKiBAcGFyYW0gb3B0cy5hbGxvd2VkQ29yZG92YU9yaWdpbnMge1JlZ2V4fEJvb2xlYW59IC0gW1NlcnZlcl0gQWxsb3cgc2V0dGluZyBDb29raWVzIGZyb20gdGhhdCBzcGVjaWZpYyBvcmlnaW4gd2hpY2ggaW4gTWV0ZW9yL0NvcmRvdmEgaXMgbG9jYWxob3N0OjEyWFhYICheaHR0cDovL2xvY2FsaG9zdDoxMlswLTldezN9JClcbiAqIEBzdW1tYXJ5IE1haW4gQ29va2llIGNsYXNzXG4gKi9cbmNsYXNzIENvb2tpZXMgZXh0ZW5kcyBfX2Nvb2tpZXMge1xuXHRjb25zdHJ1Y3RvcihvcHRzID0ge30pIHtcblx0XHRvcHRzLlRUTCA9IGhlbHBlcnMuaXNOdW1iZXIob3B0cy5UVEwpID8gb3B0cy5UVEwgOiBmYWxzZTtcblx0XHRvcHRzLnJ1bk9uU2VydmVyID0gb3B0cy5ydW5PblNlcnZlciAhPT0gZmFsc2UgPyB0cnVlIDogZmFsc2U7XG5cdFx0b3B0cy5hbGxvd1F1ZXJ5U3RyaW5nQ29va2llcyA9IG9wdHMuYWxsb3dRdWVyeVN0cmluZ0Nvb2tpZXMgIT09IHRydWUgPyBmYWxzZSA6IHRydWU7XG5cblx0XHRpZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG5cdFx0XHRvcHRzLl9jb29raWVzID0gZG9jdW1lbnQuY29va2llO1xuXHRcdFx0c3VwZXIob3B0cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wdHMuX2Nvb2tpZXMgPSB7fTtcblx0XHRcdHN1cGVyKG9wdHMpO1xuXHRcdFx0b3B0cy5hdXRvID0gb3B0cy5hdXRvICE9PSBmYWxzZSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdHRoaXMub3B0cyA9IG9wdHM7XG5cdFx0XHR0aGlzLmhhbmRsZXIgPSBoZWxwZXJzLmlzRnVuY3Rpb24ob3B0cy5oYW5kbGVyKSA/IG9wdHMuaGFuZGxlciA6IGZhbHNlO1xuXHRcdFx0dGhpcy5vbkNvb2tpZXMgPSBoZWxwZXJzLmlzRnVuY3Rpb24ob3B0cy5vbkNvb2tpZXMpID8gb3B0cy5vbkNvb2tpZXMgOiBmYWxzZTtcblxuXHRcdFx0aWYgKG9wdHMucnVuT25TZXJ2ZXIgJiYgIUNvb2tpZXMuaXNMb2FkZWRPblNlcnZlcikge1xuXHRcdFx0XHRDb29raWVzLmlzTG9hZGVkT25TZXJ2ZXIgPSB0cnVlO1xuXHRcdFx0XHRpZiAob3B0cy5hdXRvKSB7XG5cdFx0XHRcdFx0V2ViQXBwLmNvbm5lY3RIYW5kbGVycy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAodXJsUkUudGVzdChyZXEuX3BhcnNlZFVybC5wYXRoKSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBtYXRjaGVkQ29yZG92YU9yaWdpbiA9XG5cdFx0XHRcdFx0XHRcdFx0ISFyZXEuaGVhZGVycy5vcmlnaW4gJiYgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMgJiYgdGhpcy5hbGxvd2VkQ29yZG92YU9yaWdpbnMudGVzdChyZXEuaGVhZGVycy5vcmlnaW4pO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBtYXRjaGVkT3JpZ2luID0gbWF0Y2hlZENvcmRvdmFPcmlnaW4gfHwgKCEhcmVxLmhlYWRlcnMub3JpZ2luICYmIHRoaXMub3JpZ2luUkUudGVzdChyZXEuaGVhZGVycy5vcmlnaW4pKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAobWF0Y2hlZE9yaWdpbikge1xuXHRcdFx0XHRcdFx0XHRcdHJlcy5zZXRIZWFkZXIoJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJywgJ3RydWUnKTtcblx0XHRcdFx0XHRcdFx0XHRyZXMuc2V0SGVhZGVyKCdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nLCByZXEuaGVhZGVycy5vcmlnaW4pO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgY29va2llc0FycmF5ID0gW107XG5cdFx0XHRcdFx0XHRcdGxldCBjb29raWVzT2JqZWN0ID0ge307XG5cdFx0XHRcdFx0XHRcdGlmIChtYXRjaGVkQ29yZG92YU9yaWdpbiAmJiBvcHRzLmFsbG93UXVlcnlTdHJpbmdDb29raWVzICYmIHJlcS5xdWVyeS5fX19jb29raWVzX19fKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29va2llc09iamVjdCA9IHBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChyZXEucXVlcnkuX19fY29va2llc19fXykpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHJlcS5oZWFkZXJzLmNvb2tpZSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvb2tpZXNPYmplY3QgPSBwYXJzZShyZXEuaGVhZGVycy5jb29raWUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgY29va2llc0tleXMgPSBPYmplY3Qua2V5cyhjb29raWVzT2JqZWN0KTtcblx0XHRcdFx0XHRcdFx0aWYgKGNvb2tpZXNLZXlzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgY29va2llc0tleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHsgY29va2llU3RyaW5nIH0gPSBzZXJpYWxpemUoY29va2llc0tleXNbaV0sIGNvb2tpZXNPYmplY3RbY29va2llc0tleXNbaV1dKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICghY29va2llc0FycmF5LmluY2x1ZGVzKGNvb2tpZVN0cmluZykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29va2llc0FycmF5LnB1c2goY29va2llU3RyaW5nKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoY29va2llc0FycmF5Lmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzLnNldEhlYWRlcignU2V0LUNvb2tpZScsIGNvb2tpZXNBcnJheSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aGVscGVycy5pc0Z1bmN0aW9uKHRoaXMub25Db29raWVzKSAmJiB0aGlzLm9uQ29va2llcyhfX21pZGRsZXdhcmVIYW5kbGVyKHJlcSwgcmVzLCBvcHRzKSk7XG5cblx0XHRcdFx0XHRcdFx0cmVzLndyaXRlSGVhZCgyMDApO1xuXHRcdFx0XHRcdFx0XHRyZXMuZW5kKCcnKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJlcS5Db29raWVzID0gX19taWRkbGV3YXJlSGFuZGxlcihyZXEsIHJlcywgb3B0cyk7XG5cdFx0XHRcdFx0XHRcdGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmhhbmRsZXIpICYmIHRoaXMuaGFuZGxlcihyZXEuQ29va2llcyk7XG5cdFx0XHRcdFx0XHRcdG5leHQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBAbG9jdXMgU2VydmVyXG5cdCAqIEBtZW1iZXJPZiBDb29raWVzXG5cdCAqIEBuYW1lIG1pZGRsZXdhcmVcblx0ICogQHN1bW1hcnkgR2V0IENvb2tpZXMgaW5zdGFuY2UgaW50byBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICovXG5cdG1pZGRsZXdhcmUoKSB7XG5cdFx0aWYgKCFNZXRlb3IuaXNTZXJ2ZXIpIHtcblx0XHRcdHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNTAwLCBcIltvc3RyaW86Y29va2llc10gQ2FuJ3QgdXNlIGAubWlkZGxld2FyZSgpYCBvbiBDbGllbnQsIGl0J3MgU2VydmVyIG9ubHkhXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiAocmVxLCByZXMsIG5leHQpID0+IHtcblx0XHRcdGhlbHBlcnMuaXNGdW5jdGlvbih0aGlzLmhhbmRsZXIpICYmIHRoaXMuaGFuZGxlcihfX21pZGRsZXdhcmVIYW5kbGVyKHJlcSwgcmVzLCB0aGlzLm9wdHMpKTtcblx0XHRcdG5leHQoKTtcblx0XHR9O1xuXHR9XG59XG5cbmlmIChNZXRlb3IuaXNTZXJ2ZXIpIHtcblx0Q29va2llcy5pc0xvYWRlZE9uU2VydmVyID0gZmFsc2U7XG59XG5cbi8qIEV4cG9ydCB0aGUgQ29va2llcyBjbGFzcyAqL1xuZXhwb3J0IHsgQ29va2llcyB9O1xuIl19
