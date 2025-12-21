Package["core-runtime"].queue("oauth1",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Random = Package.random.Random;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var OAuth = Package.oauth.OAuth;
var check = Package.check.check;
var Match = Package.check.Match;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var OAuth1Binding, OAuth1Test;

var require = meteorInstall({"node_modules":{"meteor":{"oauth1":{"oauth1_binding.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth1/oauth1_binding.js                                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    module.export({
      OAuth1Binding: () => OAuth1Binding
    });
    let crypto;
    module.link("crypto", {
      default(v) {
        crypto = v;
      }
    }, 0);
    let querystring;
    module.link("querystring", {
      default(v) {
        querystring = v;
      }
    }, 1);
    let urlModule;
    module.link("url", {
      default(v) {
        urlModule = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class OAuth1Binding {
      constructor(config, urls) {
        this._config = config;
        this._urls = urls;
      }
      async prepareRequestToken(callbackUrl) {
        const headers = this._buildHeader({
          oauth_callback: callbackUrl
        });
        const response = await this._call({
          method: 'POST',
          url: this._urls.requestToken,
          headers
        });
        const tokens = querystring.parse(response.content);
        if (!tokens.oauth_callback_confirmed) throw Object.assign(new Error("oauth_callback_confirmed false when requesting oauth1 token"), {
          response: response
        });
        this.requestToken = tokens.oauth_token;
        this.requestTokenSecret = tokens.oauth_token_secret;
      }
      async prepareAccessToken(query, requestTokenSecret) {
        // support implementations that use request token secrets. This is
        // read by this._call.
        //
        // XXX make it a param to call, not something stashed on self? It's
        // kinda confusing right now, everything except this is passed as
        // arguments, but this is stored.
        if (requestTokenSecret) this.accessTokenSecret = requestTokenSecret;
        const headers = this._buildHeader({
          oauth_token: query.oauth_token,
          oauth_verifier: query.oauth_verifier
        });
        const response = await this._call({
          method: 'POST',
          url: this._urls.accessToken,
          headers
        });
        const tokens = querystring.parse(response.content);
        if (!tokens.oauth_token || !tokens.oauth_token_secret) {
          const error = new Error("missing oauth token or secret");
          // We provide response only if no token is available, we do not want to leak any tokens
          if (!tokens.oauth_token && !tokens.oauth_token_secret) {
            Object.assign(error, {
              response: response
            });
          }
          throw error;
        }
        this.accessToken = tokens.oauth_token;
        this.accessTokenSecret = tokens.oauth_token_secret;
      }
      async callAsync(method, url, params, callback) {
        const headers = this._buildHeader({
          oauth_token: this.accessToken
        });
        if (!params) {
          params = {};
        }
        return this._call({
          method,
          url,
          headers,
          params,
          callback
        });
      }
      async getAsync(url, params, callback) {
        return this.callAsync('GET', url, params, callback);
      }
      async postAsync(url, params, callback) {
        return this.callAsync('POST', url, params, callback);
      }
      get(url, params, callback) {
        // Require changes when remove Fibers. Exposed to public api.
        return this.call('GET', url, params, callback);
      }
      post(url, params, callback) {
        // Require changes when remove Fibers. Exposed to public api.
        return this.call('POST', url, params, callback);
      }
      _buildHeader(headers) {
        return _objectSpread({
          oauth_consumer_key: this._config.consumerKey,
          oauth_nonce: Random.secret().replace(/\W/g, ''),
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: (new Date().valueOf() / 1000).toFixed().toString(),
          oauth_version: '1.0'
        }, headers);
      }
      _getSignature(method, url, rawHeaders, accessTokenSecret, params) {
        const headers = this._encodeHeader(_objectSpread(_objectSpread({}, rawHeaders), params));
        const parameters = Object.keys(headers).map(key => "".concat(key, "=").concat(headers[key])).sort().join('&');
        const signatureBase = [method, this._encodeString(url), this._encodeString(parameters)].join('&');
        const secret = OAuth.openSecret(this._config.secret);
        let signingKey = "".concat(this._encodeString(secret), "&");
        if (accessTokenSecret) signingKey += this._encodeString(accessTokenSecret);
        return crypto.createHmac('SHA1', signingKey).update(signatureBase).digest('base64');
      }
      async _call(_ref) {
        let {
          method,
          url,
          headers = {},
          params = {},
          callback
        } = _ref;
        // all URLs to be functions to support parameters/customization
        if (typeof url === "function") {
          url = url(this);
        }

        // Extract all query string parameters from the provided URL
        const parsedUrl = urlModule.parse(url, true);
        // Merge them in a way that params given to the method call have precedence
        params = _objectSpread(_objectSpread({}, parsedUrl.query), params);

        // Reconstruct the URL back without any query string parameters
        // (they are now in params)
        parsedUrl.query = {};
        parsedUrl.search = '';
        url = urlModule.format(parsedUrl);

        // Get the signature
        headers.oauth_signature = this._getSignature(method, url, headers, this.accessTokenSecret, params);

        // Make a authorization string according to oauth1 spec
        const authString = this._getAuthHeaderString(headers);
        // Make signed request
        return OAuth._fetch(url, method, _objectSpread({
          headers: _objectSpread({
            Authorization: authString
          }, method.toUpperCase() === 'POST' ? {
            'Content-Type': 'application/x-www-form-urlencoded'
          } : {})
        }, method.toUpperCase() === 'POST' ? {
          body: OAuth._addValuesToQueryParams(params).toString()
        } : {
          queryParams: params
        })).then(res => res.text().then(content => {
          const responseHeaders = Array.from(res.headers.entries()).reduce((acc, _ref2) => {
            let [key, val] = _ref2;
            return _objectSpread(_objectSpread({}, acc), {}, {
              [key.toLowerCase()]: val
            });
          }, {});
          const data = responseHeaders['content-type'].includes('application/json') ? JSON.parse(content) : undefined;
          return {
            content: data ? '' : content,
            data,
            headers: _objectSpread(_objectSpread({}, responseHeaders), {}, {
              nonce: headers.oauth_nonce
            }),
            redirected: res.redirected,
            ok: res.ok,
            statusCode: res.status
          };
        })).then(response => {
          if (callback) {
            callback(undefined, response);
          }
          return response;
        }).catch(err => {
          if (callback) {
            callback(err);
          }
          console.log({
            err
          });
          throw Object.assign(new Error("Failed to send OAuth1 request to ".concat(url, ". ").concat(err.message)), {
            response: err.response
          });
        });
      }
      _encodeHeader(header) {
        return Object.keys(header).reduce((memo, key) => {
          memo[this._encodeString(key)] = this._encodeString(header[key]);
          return memo;
        }, {});
      }
      _encodeString(str) {
        return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
      }
      _getAuthHeaderString(headers) {
        return 'OAuth ' + Object.keys(headers).map(key => "".concat(this._encodeString(key), "=\"").concat(this._encodeString(headers[key]), "\"")).sort().join(', ');
      }
    }
    ;
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth1_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth1/oauth1_server.js                                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module1.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    let url;
    module1.link("url", {
      default(v) {
        url = v;
      }
    }, 0);
    let OAuth1Binding;
    module1.link("./oauth1_binding", {
      OAuth1Binding(v) {
        OAuth1Binding = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    OAuth._queryParamsWithAuthTokenUrl = function (authUrl, oauthBinding) {
      let params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      let whitelistedQueryParams = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
      const redirectUrlObj = url.parse(authUrl, true);
      Object.assign(redirectUrlObj.query, whitelistedQueryParams.reduce((prev, param) => params.query[param] ? _objectSpread(_objectSpread({}, prev), {}, {
        param: params.query[param]
      }) : prev, {}), {
        oauth_token: oauthBinding.requestToken
      });

      // Clear the `search` so it is rebuilt by Node's `url` from the `query` above.
      // Using previous versions of the Node `url` module, this was just set to ""
      // However, Node 6 docs seem to indicate that this should be `undefined`.
      delete redirectUrlObj.search;

      // Reconstruct the URL back with provided query parameters merged with oauth_token
      return url.format(redirectUrlObj);
    };

    // connect middleware
    OAuth._requestHandlers['1'] = async (service, query, res) => {
      const config = await ServiceConfiguration.configurations.findOneAsync({
        service: service.serviceName
      });
      if (!config) {
        throw new ServiceConfiguration.ConfigError(service.serviceName);
      }
      const {
        urls
      } = service;
      const oauthBinding = new OAuth1Binding(config, urls);
      let credentialSecret;
      if (query.requestTokenAndRedirect) {
        // step 1 - get and store a request token
        const callbackUrl = OAuth._redirectUri(service.serviceName, config, {
          state: query.state,
          cordova: query.cordova === "true",
          android: query.android === "true"
        });

        // Get a request token to start auth process
        await oauthBinding.prepareRequestToken(callbackUrl);

        // Keep track of request token so we can verify it on the next step
        await OAuth._storeRequestToken(OAuth._credentialTokenFromQuery(query), oauthBinding.requestToken, oauthBinding.requestTokenSecret);

        // support for scope/name parameters
        let redirectUrl;
        const authParams = {
          query
        };
        if (typeof urls.authenticate === "function") {
          redirectUrl = urls.authenticate(oauthBinding, authParams);
        } else {
          redirectUrl = OAuth._queryParamsWithAuthTokenUrl(urls.authenticate, oauthBinding, authParams);
        }

        // redirect to provider login, which will redirect back to "step 2" below

        res.writeHead(302, {
          'Location': redirectUrl
        });
        res.end();
      } else {
        // step 2, redirected from provider login - store the result
        // and close the window to allow the login handler to proceed

        // Get the user's request token so we can verify it and clear it
        const requestTokenInfo = await OAuth._retrieveRequestToken(OAuth._credentialTokenFromQuery(query));
        if (!requestTokenInfo) {
          throw new Error("Unable to retrieve request token");
        }

        // Verify user authorized access and the oauth_token matches
        // the requestToken from previous step
        if (query.oauth_token && query.oauth_token === requestTokenInfo.requestToken) {
          // Prepare the login results before returning.  This way the
          // subsequent call to the `login` method will be immediate.

          // Get the access token for signing requests
          await oauthBinding.prepareAccessToken(query, requestTokenInfo.requestTokenSecret);

          // Run service-specific handler.
          const oauthResult = await service.handleOauthRequest(oauthBinding, {
            query: query
          });
          const credentialToken = OAuth._credentialTokenFromQuery(query);
          credentialSecret = Random.secret();

          // Store the login result so it can be retrieved in another
          // browser tab by the result handler
          await OAuth._storePendingCredential(credentialToken, {
            serviceName: service.serviceName,
            serviceData: oauthResult.serviceData,
            options: oauthResult.options
          }, credentialSecret);
        }

        // Either close the window, redirect, or render nothing
        // if all else fails
        await OAuth._renderOauthResults(res, query, credentialSecret);
      }
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth1_pending_request_tokens.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/oauth1/oauth1_pending_request_tokens.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    __reifyWaitForDeps__();
    //
    // _pendingRequestTokens are request tokens that have been received
    // but not yet fully authorized (processed).
    //
    // During the oauth1 authorization process, the Meteor App opens
    // a pop-up, requests a request token from the oauth1 service, and
    // redirects the browser to the oauth1 service for the user
    // to grant authorization.  The user is then returned to the
    // Meteor Apps' callback url and the request token is verified.
    //
    // When Meteor Apps run on multiple servers, it's possible that
    // 2 different servers may be used to generate the request token
    // and to verify it in the callback once the user has authorized.
    //
    // For this reason, the _pendingRequestTokens are stored in the database
    // so they can be shared across Meteor App servers.
    //
    // XXX This code is fairly similar to oauth/pending_credentials.js --
    // maybe we can combine them somehow.

    // Collection containing pending request tokens
    // Has key, requestToken, requestTokenSecret, and createdAt fields.
    OAuth._pendingRequestTokens = new Mongo.Collection("meteor_oauth_pendingRequestTokens", {
      _preventAutopublish: true
    });
    await OAuth._pendingRequestTokens.createIndexAsync('key', {
      unique: true
    });
    await OAuth._pendingRequestTokens.createIndexAsync('createdAt');

    // Periodically clear old entries that never got completed
    const _cleanStaleResults = async () => {
      // Remove request tokens older than 5 minute
      const timeCutoff = new Date();
      timeCutoff.setMinutes(timeCutoff.getMinutes() - 5);
      await OAuth._pendingRequestTokens.removeAsync({
        createdAt: {
          $lt: timeCutoff
        }
      });
    };
    const _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000);

    // Stores the key and request token in the _pendingRequestTokens collection.
    // Will throw an exception if `key` is not a string.
    //
    // @param key {string}
    // @param requestToken {string}
    // @param requestTokenSecret {string}
    //
    OAuth._storeRequestToken = async (key, requestToken, requestTokenSecret) => {
      check(key, String);

      // We do an upsert here instead of an insert in case the user happens
      // to somehow send the same `state` parameter twice during an OAuth
      // login; we don't want a duplicate key error.
      await OAuth._pendingRequestTokens.upsertAsync({
        key
      }, {
        key,
        requestToken: OAuth.sealSecret(requestToken),
        requestTokenSecret: OAuth.sealSecret(requestTokenSecret),
        createdAt: new Date()
      });
    };

    // Retrieves and removes a request token from the _pendingRequestTokens collection
    // Returns an object containing requestToken and requestTokenSecret properties
    //
    // @param key {string}
    //
    OAuth._retrieveRequestToken = async key => {
      check(key, String);
      const pendingRequestToken = await OAuth._pendingRequestTokens.findOneAsync({
        key: key
      });
      if (pendingRequestToken) {
        await OAuth._pendingRequestTokens.removeAsync({
          _id: pendingRequestToken._id
        });
        return {
          requestToken: OAuth.openSecret(pendingRequestToken.requestToken),
          requestTokenSecret: OAuth.openSecret(pendingRequestToken.requestTokenSecret)
        };
      } else {
        return undefined;
      }
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: true
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      OAuth1Binding: OAuth1Binding,
      OAuth1Test: OAuth1Test
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/oauth1/oauth1_binding.js",
    "/node_modules/meteor/oauth1/oauth1_server.js",
    "/node_modules/meteor/oauth1/oauth1_pending_request_tokens.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/oauth1.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgxL29hdXRoMV9iaW5kaW5nLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aDEvb2F1dGgxX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgxL29hdXRoMV9wZW5kaW5nX3JlcXVlc3RfdG9rZW5zLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJleHBvcnQiLCJPQXV0aDFCaW5kaW5nIiwiY3J5cHRvIiwicXVlcnlzdHJpbmciLCJ1cmxNb2R1bGUiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsImNvbnN0cnVjdG9yIiwiY29uZmlnIiwidXJscyIsIl9jb25maWciLCJfdXJscyIsInByZXBhcmVSZXF1ZXN0VG9rZW4iLCJjYWxsYmFja1VybCIsImhlYWRlcnMiLCJfYnVpbGRIZWFkZXIiLCJvYXV0aF9jYWxsYmFjayIsInJlc3BvbnNlIiwiX2NhbGwiLCJtZXRob2QiLCJ1cmwiLCJyZXF1ZXN0VG9rZW4iLCJ0b2tlbnMiLCJwYXJzZSIsImNvbnRlbnQiLCJvYXV0aF9jYWxsYmFja19jb25maXJtZWQiLCJPYmplY3QiLCJhc3NpZ24iLCJFcnJvciIsIm9hdXRoX3Rva2VuIiwicmVxdWVzdFRva2VuU2VjcmV0Iiwib2F1dGhfdG9rZW5fc2VjcmV0IiwicHJlcGFyZUFjY2Vzc1Rva2VuIiwicXVlcnkiLCJhY2Nlc3NUb2tlblNlY3JldCIsIm9hdXRoX3ZlcmlmaWVyIiwiYWNjZXNzVG9rZW4iLCJlcnJvciIsImNhbGxBc3luYyIsInBhcmFtcyIsImNhbGxiYWNrIiwiZ2V0QXN5bmMiLCJwb3N0QXN5bmMiLCJnZXQiLCJjYWxsIiwicG9zdCIsIm9hdXRoX2NvbnN1bWVyX2tleSIsImNvbnN1bWVyS2V5Iiwib2F1dGhfbm9uY2UiLCJSYW5kb20iLCJzZWNyZXQiLCJyZXBsYWNlIiwib2F1dGhfc2lnbmF0dXJlX21ldGhvZCIsIm9hdXRoX3RpbWVzdGFtcCIsIkRhdGUiLCJ2YWx1ZU9mIiwidG9GaXhlZCIsInRvU3RyaW5nIiwib2F1dGhfdmVyc2lvbiIsIl9nZXRTaWduYXR1cmUiLCJyYXdIZWFkZXJzIiwiX2VuY29kZUhlYWRlciIsInBhcmFtZXRlcnMiLCJrZXlzIiwibWFwIiwia2V5IiwiY29uY2F0Iiwic29ydCIsImpvaW4iLCJzaWduYXR1cmVCYXNlIiwiX2VuY29kZVN0cmluZyIsIk9BdXRoIiwib3BlblNlY3JldCIsInNpZ25pbmdLZXkiLCJjcmVhdGVIbWFjIiwidXBkYXRlIiwiZGlnZXN0IiwiX3JlZiIsInBhcnNlZFVybCIsInNlYXJjaCIsImZvcm1hdCIsIm9hdXRoX3NpZ25hdHVyZSIsImF1dGhTdHJpbmciLCJfZ2V0QXV0aEhlYWRlclN0cmluZyIsIl9mZXRjaCIsIkF1dGhvcml6YXRpb24iLCJ0b1VwcGVyQ2FzZSIsImJvZHkiLCJfYWRkVmFsdWVzVG9RdWVyeVBhcmFtcyIsInF1ZXJ5UGFyYW1zIiwidGhlbiIsInJlcyIsInRleHQiLCJyZXNwb25zZUhlYWRlcnMiLCJBcnJheSIsImZyb20iLCJlbnRyaWVzIiwicmVkdWNlIiwiYWNjIiwiX3JlZjIiLCJ2YWwiLCJ0b0xvd2VyQ2FzZSIsImRhdGEiLCJpbmNsdWRlcyIsIkpTT04iLCJ1bmRlZmluZWQiLCJub25jZSIsInJlZGlyZWN0ZWQiLCJvayIsInN0YXR1c0NvZGUiLCJzdGF0dXMiLCJjYXRjaCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJtZXNzYWdlIiwiaGVhZGVyIiwibWVtbyIsInN0ciIsImVuY29kZVVSSUNvbXBvbmVudCIsImVzY2FwZSIsIl9fcmVpZnlfYXN5bmNfcmVzdWx0X18iLCJfcmVpZnlFcnJvciIsInNlbGYiLCJhc3luYyIsIm1vZHVsZTEiLCJfcXVlcnlQYXJhbXNXaXRoQXV0aFRva2VuVXJsIiwiYXV0aFVybCIsIm9hdXRoQmluZGluZyIsImFyZ3VtZW50cyIsImxlbmd0aCIsIndoaXRlbGlzdGVkUXVlcnlQYXJhbXMiLCJyZWRpcmVjdFVybE9iaiIsInByZXYiLCJwYXJhbSIsIl9yZXF1ZXN0SGFuZGxlcnMiLCJzZXJ2aWNlIiwiU2VydmljZUNvbmZpZ3VyYXRpb24iLCJjb25maWd1cmF0aW9ucyIsImZpbmRPbmVBc3luYyIsInNlcnZpY2VOYW1lIiwiQ29uZmlnRXJyb3IiLCJjcmVkZW50aWFsU2VjcmV0IiwicmVxdWVzdFRva2VuQW5kUmVkaXJlY3QiLCJfcmVkaXJlY3RVcmkiLCJzdGF0ZSIsImNvcmRvdmEiLCJhbmRyb2lkIiwiX3N0b3JlUmVxdWVzdFRva2VuIiwiX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeSIsInJlZGlyZWN0VXJsIiwiYXV0aFBhcmFtcyIsImF1dGhlbnRpY2F0ZSIsIndyaXRlSGVhZCIsImVuZCIsInJlcXVlc3RUb2tlbkluZm8iLCJfcmV0cmlldmVSZXF1ZXN0VG9rZW4iLCJvYXV0aFJlc3VsdCIsImhhbmRsZU9hdXRoUmVxdWVzdCIsImNyZWRlbnRpYWxUb2tlbiIsIl9zdG9yZVBlbmRpbmdDcmVkZW50aWFsIiwic2VydmljZURhdGEiLCJvcHRpb25zIiwiX3JlbmRlck9hdXRoUmVzdWx0cyIsIl9wZW5kaW5nUmVxdWVzdFRva2VucyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl9wcmV2ZW50QXV0b3B1Ymxpc2giLCJjcmVhdGVJbmRleEFzeW5jIiwidW5pcXVlIiwiX2NsZWFuU3RhbGVSZXN1bHRzIiwidGltZUN1dG9mZiIsInNldE1pbnV0ZXMiLCJnZXRNaW51dGVzIiwicmVtb3ZlQXN5bmMiLCJjcmVhdGVkQXQiLCIkbHQiLCJfY2xlYW51cEhhbmRsZSIsIk1ldGVvciIsInNldEludGVydmFsIiwiY2hlY2siLCJTdHJpbmciLCJ1cHNlcnRBc3luYyIsInNlYWxTZWNyZXQiLCJwZW5kaW5nUmVxdWVzdFRva2VuIiwiX2lkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxhQUFhO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBckdILE1BQU0sQ0FBQ0ksTUFBTSxDQUFDO01BQUNDLGFBQWEsRUFBQ0EsQ0FBQSxLQUFJQTtJQUFhLENBQUMsQ0FBQztJQUFDLElBQUlDLE1BQU07SUFBQ04sTUFBTSxDQUFDQyxJQUFJLENBQUMsUUFBUSxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDRyxNQUFNLEdBQUNILENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxXQUFXO0lBQUNQLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGFBQWEsRUFBQztNQUFDQyxPQUFPQSxDQUFDQyxDQUFDLEVBQUM7UUFBQ0ksV0FBVyxHQUFDSixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUssU0FBUztJQUFDUixNQUFNLENBQUNDLElBQUksQ0FBQyxLQUFLLEVBQUM7TUFBQ0MsT0FBT0EsQ0FBQ0MsQ0FBQyxFQUFDO1FBQUNLLFNBQVMsR0FBQ0wsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlNLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBZXRTLE1BQU1KLGFBQWEsQ0FBQztNQUN6QkssV0FBV0EsQ0FBQ0MsTUFBTSxFQUFFQyxJQUFJLEVBQUU7UUFDeEIsSUFBSSxDQUFDQyxPQUFPLEdBQUdGLE1BQU07UUFDckIsSUFBSSxDQUFDRyxLQUFLLEdBQUdGLElBQUk7TUFDbkI7TUFFQSxNQUFNRyxtQkFBbUJBLENBQUNDLFdBQVcsRUFBRTtRQUNyQyxNQUFNQyxPQUFPLEdBQUcsSUFBSSxDQUFDQyxZQUFZLENBQUM7VUFDaENDLGNBQWMsRUFBRUg7UUFDbEIsQ0FBQyxDQUFDO1FBRUYsTUFBTUksUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDQyxLQUFLLENBQUM7VUFBQ0MsTUFBTSxFQUFFLE1BQU07VUFBRUMsR0FBRyxFQUFFLElBQUksQ0FBQ1QsS0FBSyxDQUFDVSxZQUFZO1VBQUVQO1FBQU8sQ0FBQyxDQUFDO1FBQzFGLE1BQU1RLE1BQU0sR0FBR2xCLFdBQVcsQ0FBQ21CLEtBQUssQ0FBQ04sUUFBUSxDQUFDTyxPQUFPLENBQUM7UUFFbEQsSUFBSSxDQUFFRixNQUFNLENBQUNHLHdCQUF3QixFQUNuQyxNQUFNQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxJQUFJQyxLQUFLLENBQUMsNkRBQTZELENBQUMsRUFDbkU7VUFBQ1gsUUFBUSxFQUFFQTtRQUFRLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUNJLFlBQVksR0FBR0MsTUFBTSxDQUFDTyxXQUFXO1FBQ3RDLElBQUksQ0FBQ0Msa0JBQWtCLEdBQUdSLE1BQU0sQ0FBQ1Msa0JBQWtCO01BQ3JEO01BRUEsTUFBTUMsa0JBQWtCQSxDQUFDQyxLQUFLLEVBQUVILGtCQUFrQixFQUFFO1FBQ2xEO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLElBQUlBLGtCQUFrQixFQUNwQixJQUFJLENBQUNJLGlCQUFpQixHQUFHSixrQkFBa0I7UUFFN0MsTUFBTWhCLE9BQU8sR0FBRyxJQUFJLENBQUNDLFlBQVksQ0FBQztVQUNoQ2MsV0FBVyxFQUFFSSxLQUFLLENBQUNKLFdBQVc7VUFDOUJNLGNBQWMsRUFBRUYsS0FBSyxDQUFDRTtRQUN4QixDQUFDLENBQUM7UUFFRixNQUFNbEIsUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDQyxLQUFLLENBQUM7VUFBRUMsTUFBTSxFQUFFLE1BQU07VUFBRUMsR0FBRyxFQUFFLElBQUksQ0FBQ1QsS0FBSyxDQUFDeUIsV0FBVztVQUFFdEI7UUFBUSxDQUFDLENBQUM7UUFDM0YsTUFBTVEsTUFBTSxHQUFHbEIsV0FBVyxDQUFDbUIsS0FBSyxDQUFDTixRQUFRLENBQUNPLE9BQU8sQ0FBQztRQUVsRCxJQUFJLENBQUVGLE1BQU0sQ0FBQ08sV0FBVyxJQUFJLENBQUVQLE1BQU0sQ0FBQ1Msa0JBQWtCLEVBQUU7VUFDdkQsTUFBTU0sS0FBSyxHQUFHLElBQUlULEtBQUssQ0FBQywrQkFBK0IsQ0FBQztVQUN4RDtVQUNBLElBQUksQ0FBRU4sTUFBTSxDQUFDTyxXQUFXLElBQUksQ0FBRVAsTUFBTSxDQUFDUyxrQkFBa0IsRUFBRTtZQUN2REwsTUFBTSxDQUFDQyxNQUFNLENBQUNVLEtBQUssRUFBRTtjQUFDcEIsUUFBUSxFQUFFQTtZQUFRLENBQUMsQ0FBQztVQUM1QztVQUNBLE1BQU1vQixLQUFLO1FBQ2I7UUFFQSxJQUFJLENBQUNELFdBQVcsR0FBR2QsTUFBTSxDQUFDTyxXQUFXO1FBQ3JDLElBQUksQ0FBQ0ssaUJBQWlCLEdBQUdaLE1BQU0sQ0FBQ1Msa0JBQWtCO01BQ3BEO01BRUEsTUFBTU8sU0FBU0EsQ0FBQ25CLE1BQU0sRUFBRUMsR0FBRyxFQUFFbUIsTUFBTSxFQUFFQyxRQUFRLEVBQUU7UUFDN0MsTUFBTTFCLE9BQU8sR0FBRyxJQUFJLENBQUNDLFlBQVksQ0FBQztVQUNoQ2MsV0FBVyxFQUFFLElBQUksQ0FBQ087UUFDcEIsQ0FBQyxDQUFDO1FBRUYsSUFBRyxDQUFFRyxNQUFNLEVBQUU7VUFDWEEsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNiO1FBRUEsT0FBTyxJQUFJLENBQUNyQixLQUFLLENBQUM7VUFBRUMsTUFBTTtVQUFFQyxHQUFHO1VBQUVOLE9BQU87VUFBRXlCLE1BQU07VUFBRUM7UUFBUyxDQUFDLENBQUM7TUFDL0Q7TUFFQSxNQUFNQyxRQUFRQSxDQUFDckIsR0FBRyxFQUFFbUIsTUFBTSxFQUFFQyxRQUFRLEVBQUU7UUFDcEMsT0FBTyxJQUFJLENBQUNGLFNBQVMsQ0FBQyxLQUFLLEVBQUVsQixHQUFHLEVBQUVtQixNQUFNLEVBQUVDLFFBQVEsQ0FBQztNQUNyRDtNQUVBLE1BQU1FLFNBQVNBLENBQUN0QixHQUFHLEVBQUVtQixNQUFNLEVBQUVDLFFBQVEsRUFBRTtRQUNyQyxPQUFPLElBQUksQ0FBQ0YsU0FBUyxDQUFDLE1BQU0sRUFBRWxCLEdBQUcsRUFBRW1CLE1BQU0sRUFBRUMsUUFBUSxDQUFDO01BQ3REO01BRUFHLEdBQUdBLENBQUN2QixHQUFHLEVBQUVtQixNQUFNLEVBQUVDLFFBQVEsRUFBRTtRQUN6QjtRQUNBLE9BQU8sSUFBSSxDQUFDSSxJQUFJLENBQUMsS0FBSyxFQUFFeEIsR0FBRyxFQUFFbUIsTUFBTSxFQUFFQyxRQUFRLENBQUM7TUFDaEQ7TUFFQUssSUFBSUEsQ0FBQ3pCLEdBQUcsRUFBRW1CLE1BQU0sRUFBRUMsUUFBUSxFQUFFO1FBQzFCO1FBQ0EsT0FBTyxJQUFJLENBQUNJLElBQUksQ0FBQyxNQUFNLEVBQUV4QixHQUFHLEVBQUVtQixNQUFNLEVBQUVDLFFBQVEsQ0FBQztNQUNqRDtNQUVBekIsWUFBWUEsQ0FBQ0QsT0FBTyxFQUFFO1FBQ3BCLE9BQUFsQixhQUFBO1VBQ0VrRCxrQkFBa0IsRUFBRSxJQUFJLENBQUNwQyxPQUFPLENBQUNxQyxXQUFXO1VBQzVDQyxXQUFXLEVBQUVDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7VUFDL0NDLHNCQUFzQixFQUFFLFdBQVc7VUFDbkNDLGVBQWUsRUFBRSxDQUFDLElBQUlDLElBQUksQ0FBQyxDQUFDLENBQUNDLE9BQU8sQ0FBQyxDQUFDLEdBQUMsSUFBSSxFQUFFQyxPQUFPLENBQUMsQ0FBQyxDQUFDQyxRQUFRLENBQUMsQ0FBQztVQUNqRUMsYUFBYSxFQUFFO1FBQUssR0FDakI1QyxPQUFPO01BRWQ7TUFFQTZDLGFBQWFBLENBQUN4QyxNQUFNLEVBQUVDLEdBQUcsRUFBRXdDLFVBQVUsRUFBRTFCLGlCQUFpQixFQUFFSyxNQUFNLEVBQUU7UUFDaEUsTUFBTXpCLE9BQU8sR0FBRyxJQUFJLENBQUMrQyxhQUFhLENBQUFqRSxhQUFBLENBQUFBLGFBQUEsS0FBTWdFLFVBQVUsR0FBS3JCLE1BQU0sQ0FBRSxDQUFDO1FBRWhFLE1BQU11QixVQUFVLEdBQUdwQyxNQUFNLENBQUNxQyxJQUFJLENBQUNqRCxPQUFPLENBQUMsQ0FBQ2tELEdBQUcsQ0FBQ0MsR0FBRyxPQUFBQyxNQUFBLENBQU9ELEdBQUcsT0FBQUMsTUFBQSxDQUFJcEQsT0FBTyxDQUFDbUQsR0FBRyxDQUFDLENBQUUsQ0FBQyxDQUN6RUUsSUFBSSxDQUFDLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUVuQixNQUFNQyxhQUFhLEdBQUcsQ0FDcEJsRCxNQUFNLEVBQ04sSUFBSSxDQUFDbUQsYUFBYSxDQUFDbEQsR0FBRyxDQUFDLEVBQ3ZCLElBQUksQ0FBQ2tELGFBQWEsQ0FBQ1IsVUFBVSxDQUFDLENBQy9CLENBQUNNLElBQUksQ0FBQyxHQUFHLENBQUM7UUFFWCxNQUFNbEIsTUFBTSxHQUFHcUIsS0FBSyxDQUFDQyxVQUFVLENBQUMsSUFBSSxDQUFDOUQsT0FBTyxDQUFDd0MsTUFBTSxDQUFDO1FBRXBELElBQUl1QixVQUFVLE1BQUFQLE1BQUEsQ0FBTSxJQUFJLENBQUNJLGFBQWEsQ0FBQ3BCLE1BQU0sQ0FBQyxNQUFHO1FBQ2pELElBQUloQixpQkFBaUIsRUFDbkJ1QyxVQUFVLElBQUksSUFBSSxDQUFDSCxhQUFhLENBQUNwQyxpQkFBaUIsQ0FBQztRQUVyRCxPQUFPL0IsTUFBTSxDQUFDdUUsVUFBVSxDQUFDLE1BQU0sRUFBRUQsVUFBVSxDQUFDLENBQUNFLE1BQU0sQ0FBQ04sYUFBYSxDQUFDLENBQUNPLE1BQU0sQ0FBQyxRQUFRLENBQUM7TUFDckY7TUFFQSxNQUFNMUQsS0FBS0EsQ0FBQTJELElBQUEsRUFBcUQ7UUFBQSxJQUFwRDtVQUFDMUQsTUFBTTtVQUFFQyxHQUFHO1VBQUVOLE9BQU8sR0FBRyxDQUFDLENBQUM7VUFBRXlCLE1BQU0sR0FBRyxDQUFDLENBQUM7VUFBRUM7UUFBUSxDQUFDLEdBQUFxQyxJQUFBO1FBQzVEO1FBQ0EsSUFBRyxPQUFPekQsR0FBRyxLQUFLLFVBQVUsRUFBRTtVQUM1QkEsR0FBRyxHQUFHQSxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ2pCOztRQUVBO1FBQ0EsTUFBTTBELFNBQVMsR0FBR3pFLFNBQVMsQ0FBQ2tCLEtBQUssQ0FBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQztRQUM1QztRQUNBbUIsTUFBTSxHQUFBM0MsYUFBQSxDQUFBQSxhQUFBLEtBQVFrRixTQUFTLENBQUM3QyxLQUFLLEdBQUtNLE1BQU0sQ0FBRTs7UUFFMUM7UUFDQTtRQUNBdUMsU0FBUyxDQUFDN0MsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNwQjZDLFNBQVMsQ0FBQ0MsTUFBTSxHQUFHLEVBQUU7UUFDckIzRCxHQUFHLEdBQUdmLFNBQVMsQ0FBQzJFLE1BQU0sQ0FBQ0YsU0FBUyxDQUFDOztRQUVqQztRQUNBaEUsT0FBTyxDQUFDbUUsZUFBZSxHQUNyQixJQUFJLENBQUN0QixhQUFhLENBQUN4QyxNQUFNLEVBQUVDLEdBQUcsRUFBRU4sT0FBTyxFQUFFLElBQUksQ0FBQ29CLGlCQUFpQixFQUFFSyxNQUFNLENBQUM7O1FBRTFFO1FBQ0EsTUFBTTJDLFVBQVUsR0FBRyxJQUFJLENBQUNDLG9CQUFvQixDQUFDckUsT0FBTyxDQUFDO1FBQ3JEO1FBQ0EsT0FBT3lELEtBQUssQ0FBQ2EsTUFBTSxDQUFDaEUsR0FBRyxFQUFFRCxNQUFNLEVBQUF2QixhQUFBO1VBQzdCa0IsT0FBTyxFQUFBbEIsYUFBQTtZQUNMeUYsYUFBYSxFQUFFSDtVQUFVLEdBQ3JCL0QsTUFBTSxDQUFDbUUsV0FBVyxDQUFDLENBQUMsS0FBSyxNQUFNLEdBQUc7WUFBRSxjQUFjLEVBQUU7VUFBb0MsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRyxHQUNHbkUsTUFBTSxDQUFDbUUsV0FBVyxDQUFDLENBQUMsS0FBSyxNQUFNLEdBQ2pDO1VBQUVDLElBQUksRUFBRWhCLEtBQUssQ0FBQ2lCLHVCQUF1QixDQUFDakQsTUFBTSxDQUFDLENBQUNrQixRQUFRLENBQUM7UUFBRSxDQUFDLEdBQ3hEO1VBQUVnQyxXQUFXLEVBQUVsRDtRQUFPLENBQUMsQ0FDNUIsQ0FBQyxDQUFDbUQsSUFBSSxDQUFFQyxHQUFHLElBQ1JBLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FBQ0YsSUFBSSxDQUFFbEUsT0FBTyxJQUFLO1VBQzNCLE1BQU1xRSxlQUFlLEdBQUdDLEtBQUssQ0FBQ0MsSUFBSSxDQUFDSixHQUFHLENBQUM3RSxPQUFPLENBQUNrRixPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUNDLE1BQU0sQ0FDOUQsQ0FBQ0MsR0FBRyxFQUFBQyxLQUFBLEtBQWlCO1lBQUEsSUFBZixDQUFDbEMsR0FBRyxFQUFFbUMsR0FBRyxDQUFDLEdBQUFELEtBQUE7WUFDZCxPQUFBdkcsYUFBQSxDQUFBQSxhQUFBLEtBQVlzRyxHQUFHO2NBQUUsQ0FBQ2pDLEdBQUcsQ0FBQ29DLFdBQVcsQ0FBQyxDQUFDLEdBQUdEO1lBQUc7VUFDM0MsQ0FBQyxFQUNELENBQUMsQ0FDSCxDQUFDO1VBQ0QsTUFBTUUsSUFBSSxHQUFHVCxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUNVLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxHQUN2RUMsSUFBSSxDQUFDakYsS0FBSyxDQUFDQyxPQUFPLENBQUMsR0FBR2lGLFNBQVM7VUFDakMsT0FBUTtZQUNOakYsT0FBTyxFQUFFOEUsSUFBSSxHQUFHLEVBQUUsR0FBRzlFLE9BQU87WUFDNUI4RSxJQUFJO1lBQ0p4RixPQUFPLEVBQUFsQixhQUFBLENBQUFBLGFBQUEsS0FBT2lHLGVBQWU7Y0FBRWEsS0FBSyxFQUFFNUYsT0FBTyxDQUFDa0M7WUFBVyxFQUFFO1lBQzNEMkQsVUFBVSxFQUFFaEIsR0FBRyxDQUFDZ0IsVUFBVTtZQUMxQkMsRUFBRSxFQUFFakIsR0FBRyxDQUFDaUIsRUFBRTtZQUNWQyxVQUFVLEVBQUVsQixHQUFHLENBQUNtQjtVQUNsQixDQUFDO1FBQ0gsQ0FBQyxDQUNILENBQUMsQ0FDQXBCLElBQUksQ0FBRXpFLFFBQVEsSUFBSztVQUNsQixJQUFJdUIsUUFBUSxFQUFFO1lBQ1pBLFFBQVEsQ0FBQ2lFLFNBQVMsRUFBRXhGLFFBQVEsQ0FBQztVQUMvQjtVQUNBLE9BQU9BLFFBQVE7UUFDakIsQ0FBQyxDQUFDLENBQ0Q4RixLQUFLLENBQUVDLEdBQUcsSUFBSztVQUNkLElBQUl4RSxRQUFRLEVBQUU7WUFDWkEsUUFBUSxDQUFDd0UsR0FBRyxDQUFDO1VBQ2Y7VUFDQUMsT0FBTyxDQUFDQyxHQUFHLENBQUM7WUFBRUY7VUFBSSxDQUFDLENBQUM7VUFDcEIsTUFBTXRGLE1BQU0sQ0FBQ0MsTUFBTSxDQUNqQixJQUFJQyxLQUFLLHFDQUFBc0MsTUFBQSxDQUFxQzlDLEdBQUcsUUFBQThDLE1BQUEsQ0FBSzhDLEdBQUcsQ0FBQ0csT0FBTyxDQUFFLENBQUMsRUFDcEU7WUFBRWxHLFFBQVEsRUFBRStGLEdBQUcsQ0FBQy9GO1VBQVMsQ0FDM0IsQ0FBQztRQUNILENBQUMsQ0FBQztNQUNOO01BRUE0QyxhQUFhQSxDQUFDdUQsTUFBTSxFQUFFO1FBQ3BCLE9BQU8xRixNQUFNLENBQUNxQyxJQUFJLENBQUNxRCxNQUFNLENBQUMsQ0FBQ25CLE1BQU0sQ0FBQyxDQUFDb0IsSUFBSSxFQUFFcEQsR0FBRyxLQUFLO1VBQy9Db0QsSUFBSSxDQUFDLElBQUksQ0FBQy9DLGFBQWEsQ0FBQ0wsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUNLLGFBQWEsQ0FBQzhDLE1BQU0sQ0FBQ25ELEdBQUcsQ0FBQyxDQUFDO1VBQy9ELE9BQU9vRCxJQUFJO1FBQ2IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ1I7TUFFQS9DLGFBQWFBLENBQUNnRCxHQUFHLEVBQUU7UUFDakIsT0FBT0Msa0JBQWtCLENBQUNELEdBQUcsQ0FBQyxDQUFDbkUsT0FBTyxDQUFDLFNBQVMsRUFBRXFFLE1BQU0sQ0FBQyxDQUFDckUsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7TUFDakY7TUFFQWdDLG9CQUFvQkEsQ0FBQ3JFLE9BQU8sRUFBRTtRQUM1QixPQUFPLFFBQVEsR0FBSVksTUFBTSxDQUFDcUMsSUFBSSxDQUFDakQsT0FBTyxDQUFDLENBQUNrRCxHQUFHLENBQUNDLEdBQUcsT0FBQUMsTUFBQSxDQUMxQyxJQUFJLENBQUNJLGFBQWEsQ0FBQ0wsR0FBRyxDQUFDLFNBQUFDLE1BQUEsQ0FBSyxJQUFJLENBQUNJLGFBQWEsQ0FBQ3hELE9BQU8sQ0FBQ21ELEdBQUcsQ0FBQyxDQUFDLE9BQ2pFLENBQUMsQ0FBQ0UsSUFBSSxDQUFDLENBQUMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQztNQUNyQjtJQUVGO0lBQUM7SUFBQ3FELHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7Ozs7O0lDek5GLElBQUloSSxhQUFhO0lBQUNpSSxPQUFPLENBQUMvSCxJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ0MsT0FBT0EsQ0FBQ0MsQ0FBQyxFQUFDO1FBQUNKLGFBQWEsR0FBQ0ksQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUF0RyxJQUFJb0IsR0FBRztJQUFDeUcsT0FBTyxDQUFDL0gsSUFBSSxDQUFDLEtBQUssRUFBQztNQUFDQyxPQUFPQSxDQUFDQyxDQUFDLEVBQUM7UUFBQ29CLEdBQUcsR0FBQ3BCLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJRSxhQUFhO0lBQUMySCxPQUFPLENBQUMvSCxJQUFJLENBQUMsa0JBQWtCLEVBQUM7TUFBQ0ksYUFBYUEsQ0FBQ0YsQ0FBQyxFQUFDO1FBQUNFLGFBQWEsR0FBQ0YsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlNLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBR3ZNaUUsS0FBSyxDQUFDdUQsNEJBQTRCLEdBQUcsVUFBQ0MsT0FBTyxFQUFFQyxZQUFZLEVBQStDO01BQUEsSUFBN0N6RixNQUFNLEdBQUEwRixTQUFBLENBQUFDLE1BQUEsUUFBQUQsU0FBQSxRQUFBeEIsU0FBQSxHQUFBd0IsU0FBQSxNQUFHLENBQUMsQ0FBQztNQUFBLElBQUVFLHNCQUFzQixHQUFBRixTQUFBLENBQUFDLE1BQUEsUUFBQUQsU0FBQSxRQUFBeEIsU0FBQSxHQUFBd0IsU0FBQSxNQUFHLEVBQUU7TUFDbkcsTUFBTUcsY0FBYyxHQUFHaEgsR0FBRyxDQUFDRyxLQUFLLENBQUN3RyxPQUFPLEVBQUUsSUFBSSxDQUFDO01BRS9DckcsTUFBTSxDQUFDQyxNQUFNLENBQ1h5RyxjQUFjLENBQUNuRyxLQUFLLEVBQ3BCa0csc0JBQXNCLENBQUNsQyxNQUFNLENBQUMsQ0FBQ29DLElBQUksRUFBRUMsS0FBSyxLQUN4Qy9GLE1BQU0sQ0FBQ04sS0FBSyxDQUFDcUcsS0FBSyxDQUFDLEdBQUExSSxhQUFBLENBQUFBLGFBQUEsS0FBUXlJLElBQUk7UUFBRUMsS0FBSyxFQUFFL0YsTUFBTSxDQUFDTixLQUFLLENBQUNxRyxLQUFLO01BQUMsS0FBS0QsSUFBSSxFQUNwRSxDQUFDLENBQ0gsQ0FBQyxFQUNEO1FBQ0V4RyxXQUFXLEVBQUVtRyxZQUFZLENBQUMzRztNQUM1QixDQUNGLENBQUM7O01BRUQ7TUFDQTtNQUNBO01BQ0EsT0FBTytHLGNBQWMsQ0FBQ3JELE1BQU07O01BRTVCO01BQ0EsT0FBTzNELEdBQUcsQ0FBQzRELE1BQU0sQ0FBQ29ELGNBQWMsQ0FBQztJQUNuQyxDQUFDOztJQUVEO0lBQ0E3RCxLQUFLLENBQUNnRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPQyxPQUFPLEVBQUV2RyxLQUFLLEVBQUUwRCxHQUFHLEtBQUs7TUFDM0QsTUFBTW5GLE1BQU0sR0FBRyxNQUFNaUksb0JBQW9CLENBQUNDLGNBQWMsQ0FBQ0MsWUFBWSxDQUFDO1FBQUNILE9BQU8sRUFBRUEsT0FBTyxDQUFDSTtNQUFXLENBQUMsQ0FBQztNQUNyRyxJQUFJLENBQUVwSSxNQUFNLEVBQUU7UUFDWixNQUFNLElBQUlpSSxvQkFBb0IsQ0FBQ0ksV0FBVyxDQUFDTCxPQUFPLENBQUNJLFdBQVcsQ0FBQztNQUNqRTtNQUVBLE1BQU07UUFBRW5JO01BQUssQ0FBQyxHQUFHK0gsT0FBTztNQUN4QixNQUFNUixZQUFZLEdBQUcsSUFBSTlILGFBQWEsQ0FBQ00sTUFBTSxFQUFFQyxJQUFJLENBQUM7TUFFcEQsSUFBSXFJLGdCQUFnQjtNQUVwQixJQUFJN0csS0FBSyxDQUFDOEcsdUJBQXVCLEVBQUU7UUFDakM7UUFDQSxNQUFNbEksV0FBVyxHQUFHMEQsS0FBSyxDQUFDeUUsWUFBWSxDQUFDUixPQUFPLENBQUNJLFdBQVcsRUFBRXBJLE1BQU0sRUFBRTtVQUNsRXlJLEtBQUssRUFBRWhILEtBQUssQ0FBQ2dILEtBQUs7VUFDbEJDLE9BQU8sRUFBR2pILEtBQUssQ0FBQ2lILE9BQU8sS0FBSyxNQUFPO1VBQ25DQyxPQUFPLEVBQUdsSCxLQUFLLENBQUNrSCxPQUFPLEtBQUs7UUFDOUIsQ0FBQyxDQUFDOztRQUVGO1FBQ0EsTUFBTW5CLFlBQVksQ0FBQ3BILG1CQUFtQixDQUFDQyxXQUFXLENBQUM7O1FBRW5EO1FBQ0EsTUFBTTBELEtBQUssQ0FBQzZFLGtCQUFrQixDQUM1QjdFLEtBQUssQ0FBQzhFLHlCQUF5QixDQUFDcEgsS0FBSyxDQUFDLEVBQ3RDK0YsWUFBWSxDQUFDM0csWUFBWSxFQUN6QjJHLFlBQVksQ0FBQ2xHLGtCQUFrQixDQUFDOztRQUVsQztRQUNBLElBQUl3SCxXQUFXO1FBQ2YsTUFBTUMsVUFBVSxHQUFHO1VBQUV0SDtRQUFNLENBQUM7UUFFNUIsSUFBRyxPQUFPeEIsSUFBSSxDQUFDK0ksWUFBWSxLQUFLLFVBQVUsRUFBRTtVQUMxQ0YsV0FBVyxHQUFHN0ksSUFBSSxDQUFDK0ksWUFBWSxDQUFDeEIsWUFBWSxFQUFFdUIsVUFBVSxDQUFDO1FBQzNELENBQUMsTUFBTTtVQUNMRCxXQUFXLEdBQUcvRSxLQUFLLENBQUN1RCw0QkFBNEIsQ0FDOUNySCxJQUFJLENBQUMrSSxZQUFZLEVBQ2pCeEIsWUFBWSxFQUNadUIsVUFDRixDQUFDO1FBQ0g7O1FBRUE7O1FBRUE1RCxHQUFHLENBQUM4RCxTQUFTLENBQUMsR0FBRyxFQUFFO1VBQUMsVUFBVSxFQUFFSDtRQUFXLENBQUMsQ0FBQztRQUM3QzNELEdBQUcsQ0FBQytELEdBQUcsQ0FBQyxDQUFDO01BQ1gsQ0FBQyxNQUFNO1FBQ0w7UUFDQTs7UUFFQTtRQUNBLE1BQU1DLGdCQUFnQixHQUFHLE1BQU1wRixLQUFLLENBQUNxRixxQkFBcUIsQ0FDeERyRixLQUFLLENBQUM4RSx5QkFBeUIsQ0FBQ3BILEtBQUssQ0FBQyxDQUFDO1FBRXpDLElBQUksQ0FBRTBILGdCQUFnQixFQUFFO1VBQ3RCLE1BQU0sSUFBSS9ILEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQztRQUNyRDs7UUFFQTtRQUNBO1FBQ0EsSUFBSUssS0FBSyxDQUFDSixXQUFXLElBQUlJLEtBQUssQ0FBQ0osV0FBVyxLQUFLOEgsZ0JBQWdCLENBQUN0SSxZQUFZLEVBQUU7VUFFNUU7VUFDQTs7VUFFQTtVQUNBLE1BQU0yRyxZQUFZLENBQUNoRyxrQkFBa0IsQ0FBQ0MsS0FBSyxFQUFFMEgsZ0JBQWdCLENBQUM3SCxrQkFBa0IsQ0FBQzs7VUFFakY7VUFDQSxNQUFNK0gsV0FBVyxHQUFHLE1BQU1yQixPQUFPLENBQUNzQixrQkFBa0IsQ0FDbEQ5QixZQUFZLEVBQUU7WUFBRS9GLEtBQUssRUFBRUE7VUFBTSxDQUFDLENBQUM7VUFFakMsTUFBTThILGVBQWUsR0FBR3hGLEtBQUssQ0FBQzhFLHlCQUF5QixDQUFDcEgsS0FBSyxDQUFDO1VBQzlENkcsZ0JBQWdCLEdBQUc3RixNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDOztVQUVsQztVQUNBO1VBQ0EsTUFBTXFCLEtBQUssQ0FBQ3lGLHVCQUF1QixDQUFDRCxlQUFlLEVBQUU7WUFDbkRuQixXQUFXLEVBQUVKLE9BQU8sQ0FBQ0ksV0FBVztZQUNoQ3FCLFdBQVcsRUFBRUosV0FBVyxDQUFDSSxXQUFXO1lBQ3BDQyxPQUFPLEVBQUVMLFdBQVcsQ0FBQ0s7VUFDdkIsQ0FBQyxFQUFFcEIsZ0JBQWdCLENBQUM7UUFDdEI7O1FBRUE7UUFDQTtRQUNBLE1BQU12RSxLQUFLLENBQUM0RixtQkFBbUIsQ0FBQ3hFLEdBQUcsRUFBRTFELEtBQUssRUFBRTZHLGdCQUFnQixDQUFDO01BQy9EO0lBQ0YsQ0FBQztJQUFDckIsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRzs7Ozs7Ozs7Ozs7Ozs7SUNuSEZ0SCxvQkFBb0IsQ0FBQyxDQUFDO0lBQXRCO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztJQUVBO0lBQ0E7SUFDQWlFLEtBQUssQ0FBQzZGLHFCQUFxQixHQUFHLElBQUlDLEtBQUssQ0FBQ0MsVUFBVSxDQUNoRCxtQ0FBbUMsRUFBRTtNQUNuQ0MsbUJBQW1CLEVBQUU7SUFDdkIsQ0FBQyxDQUFDO0lBRUosTUFBTWhHLEtBQUssQ0FBQzZGLHFCQUFxQixDQUFDSSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7TUFBRUMsTUFBTSxFQUFFO0lBQUssQ0FBQyxDQUFDO0lBQzNFLE1BQU1sRyxLQUFLLENBQUM2RixxQkFBcUIsQ0FBQ0ksZ0JBQWdCLENBQUMsV0FBVyxDQUFDOztJQUkvRDtJQUNBLE1BQU1FLGtCQUFrQixHQUFHLE1BQUFBLENBQUEsS0FBWTtNQUNyQztNQUNBLE1BQU1DLFVBQVUsR0FBRyxJQUFJckgsSUFBSSxDQUFDLENBQUM7TUFDN0JxSCxVQUFVLENBQUNDLFVBQVUsQ0FBQ0QsVUFBVSxDQUFDRSxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUNsRCxNQUFNdEcsS0FBSyxDQUFDNkYscUJBQXFCLENBQUNVLFdBQVcsQ0FBQztRQUFFQyxTQUFTLEVBQUU7VUFBRUMsR0FBRyxFQUFFTDtRQUFXO01BQUUsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFDRCxNQUFNTSxjQUFjLEdBQUdDLE1BQU0sQ0FBQ0MsV0FBVyxDQUFDVCxrQkFBa0IsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDOztJQUd4RTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBbkcsS0FBSyxDQUFDNkUsa0JBQWtCLEdBQUcsT0FBT25GLEdBQUcsRUFBRTVDLFlBQVksRUFBRVMsa0JBQWtCLEtBQUs7TUFDMUVzSixLQUFLLENBQUNuSCxHQUFHLEVBQUVvSCxNQUFNLENBQUM7O01BRWxCO01BQ0E7TUFDQTtNQUNBLE1BQU05RyxLQUFLLENBQUM2RixxQkFBcUIsQ0FBQ2tCLFdBQVcsQ0FBQztRQUM1Q3JIO01BQ0YsQ0FBQyxFQUFFO1FBQ0RBLEdBQUc7UUFDSDVDLFlBQVksRUFBRWtELEtBQUssQ0FBQ2dILFVBQVUsQ0FBQ2xLLFlBQVksQ0FBQztRQUM1Q1Msa0JBQWtCLEVBQUV5QyxLQUFLLENBQUNnSCxVQUFVLENBQUN6SixrQkFBa0IsQ0FBQztRQUN4RGlKLFNBQVMsRUFBRSxJQUFJekgsSUFBSSxDQUFDO01BQ3RCLENBQUMsQ0FBQztJQUNKLENBQUM7O0lBR0Q7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBaUIsS0FBSyxDQUFDcUYscUJBQXFCLEdBQUcsTUFBTTNGLEdBQUcsSUFBSTtNQUN6Q21ILEtBQUssQ0FBQ25ILEdBQUcsRUFBRW9ILE1BQU0sQ0FBQztNQUVsQixNQUFNRyxtQkFBbUIsR0FBSSxNQUFNakgsS0FBSyxDQUFDNkYscUJBQXFCLENBQUN6QixZQUFZLENBQUM7UUFBRTFFLEdBQUcsRUFBRUE7TUFBSSxDQUFDLENBQUM7TUFDekYsSUFBSXVILG1CQUFtQixFQUFFO1FBQ3ZCLE1BQU1qSCxLQUFLLENBQUM2RixxQkFBcUIsQ0FBQ1UsV0FBVyxDQUFDO1VBQUVXLEdBQUcsRUFBRUQsbUJBQW1CLENBQUNDO1FBQUksQ0FBQyxDQUFDO1FBQy9FLE9BQU87VUFDTHBLLFlBQVksRUFBRWtELEtBQUssQ0FBQ0MsVUFBVSxDQUFDZ0gsbUJBQW1CLENBQUNuSyxZQUFZLENBQUM7VUFDaEVTLGtCQUFrQixFQUFFeUMsS0FBSyxDQUFDQyxVQUFVLENBQ2xDZ0gsbUJBQW1CLENBQUMxSixrQkFBa0I7UUFDMUMsQ0FBQztNQUNILENBQUMsTUFBTTtRQUNMLE9BQU8yRSxTQUFTO01BQ2xCO0lBQ0YsQ0FBQztJQUFDZ0Isc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvb2F1dGgxLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHF1ZXJ5c3RyaW5nIGZyb20gJ3F1ZXJ5c3RyaW5nJztcbmltcG9ydCB1cmxNb2R1bGUgZnJvbSAndXJsJztcblxuLy8gQW4gT0F1dGgxIHdyYXBwZXIgYXJvdW5kIGh0dHAgY2FsbHMgd2hpY2ggaGVscHMgZ2V0IHRva2VucyBhbmRcbi8vIHRha2VzIGNhcmUgb2YgSFRUUCBoZWFkZXJzXG4vL1xuLy8gQHBhcmFtIGNvbmZpZyB7T2JqZWN0fVxuLy8gICAtIGNvbnN1bWVyS2V5IChTdHJpbmcpOiBvYXV0aCBjb25zdW1lciBrZXlcbi8vICAgLSBzZWNyZXQgKFN0cmluZyk6IG9hdXRoIGNvbnN1bWVyIHNlY3JldFxuLy8gQHBhcmFtIHVybHMge09iamVjdH1cbi8vICAgLSByZXF1ZXN0VG9rZW4gKFN0cmluZyk6IHVybFxuLy8gICAtIGF1dGhvcml6ZSAoU3RyaW5nKTogdXJsXG4vLyAgIC0gYWNjZXNzVG9rZW4gKFN0cmluZyk6IHVybFxuLy8gICAtIGF1dGhlbnRpY2F0ZSAoU3RyaW5nKTogdXJsXG5leHBvcnQgY2xhc3MgT0F1dGgxQmluZGluZyB7XG4gIGNvbnN0cnVjdG9yKGNvbmZpZywgdXJscykge1xuICAgIHRoaXMuX2NvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLl91cmxzID0gdXJscztcbiAgfVxuXG4gIGFzeW5jIHByZXBhcmVSZXF1ZXN0VG9rZW4oY2FsbGJhY2tVcmwpIHtcbiAgICBjb25zdCBoZWFkZXJzID0gdGhpcy5fYnVpbGRIZWFkZXIoe1xuICAgICAgb2F1dGhfY2FsbGJhY2s6IGNhbGxiYWNrVXJsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2NhbGwoe21ldGhvZDogJ1BPU1QnLCB1cmw6IHRoaXMuX3VybHMucmVxdWVzdFRva2VuLCBoZWFkZXJzfSk7XG4gICAgY29uc3QgdG9rZW5zID0gcXVlcnlzdHJpbmcucGFyc2UocmVzcG9uc2UuY29udGVudCk7XG5cbiAgICBpZiAoISB0b2tlbnMub2F1dGhfY2FsbGJhY2tfY29uZmlybWVkKVxuICAgICAgdGhyb3cgT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoXCJvYXV0aF9jYWxsYmFja19jb25maXJtZWQgZmFsc2Ugd2hlbiByZXF1ZXN0aW5nIG9hdXRoMSB0b2tlblwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cmVzcG9uc2U6IHJlc3BvbnNlfSk7XG5cbiAgICB0aGlzLnJlcXVlc3RUb2tlbiA9IHRva2Vucy5vYXV0aF90b2tlbjtcbiAgICB0aGlzLnJlcXVlc3RUb2tlblNlY3JldCA9IHRva2Vucy5vYXV0aF90b2tlbl9zZWNyZXQ7XG4gIH1cblxuICBhc3luYyBwcmVwYXJlQWNjZXNzVG9rZW4ocXVlcnksIHJlcXVlc3RUb2tlblNlY3JldCkge1xuICAgIC8vIHN1cHBvcnQgaW1wbGVtZW50YXRpb25zIHRoYXQgdXNlIHJlcXVlc3QgdG9rZW4gc2VjcmV0cy4gVGhpcyBpc1xuICAgIC8vIHJlYWQgYnkgdGhpcy5fY2FsbC5cbiAgICAvL1xuICAgIC8vIFhYWCBtYWtlIGl0IGEgcGFyYW0gdG8gY2FsbCwgbm90IHNvbWV0aGluZyBzdGFzaGVkIG9uIHNlbGY/IEl0J3NcbiAgICAvLyBraW5kYSBjb25mdXNpbmcgcmlnaHQgbm93LCBldmVyeXRoaW5nIGV4Y2VwdCB0aGlzIGlzIHBhc3NlZCBhc1xuICAgIC8vIGFyZ3VtZW50cywgYnV0IHRoaXMgaXMgc3RvcmVkLlxuICAgIGlmIChyZXF1ZXN0VG9rZW5TZWNyZXQpXG4gICAgICB0aGlzLmFjY2Vzc1Rva2VuU2VjcmV0ID0gcmVxdWVzdFRva2VuU2VjcmV0O1xuXG4gICAgY29uc3QgaGVhZGVycyA9IHRoaXMuX2J1aWxkSGVhZGVyKHtcbiAgICAgIG9hdXRoX3Rva2VuOiBxdWVyeS5vYXV0aF90b2tlbixcbiAgICAgIG9hdXRoX3ZlcmlmaWVyOiBxdWVyeS5vYXV0aF92ZXJpZmllclxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9jYWxsKHsgbWV0aG9kOiAnUE9TVCcsIHVybDogdGhpcy5fdXJscy5hY2Nlc3NUb2tlbiwgaGVhZGVycyB9KTtcbiAgICBjb25zdCB0b2tlbnMgPSBxdWVyeXN0cmluZy5wYXJzZShyZXNwb25zZS5jb250ZW50KTtcblxuICAgIGlmICghIHRva2Vucy5vYXV0aF90b2tlbiB8fCAhIHRva2Vucy5vYXV0aF90b2tlbl9zZWNyZXQpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKFwibWlzc2luZyBvYXV0aCB0b2tlbiBvciBzZWNyZXRcIik7XG4gICAgICAvLyBXZSBwcm92aWRlIHJlc3BvbnNlIG9ubHkgaWYgbm8gdG9rZW4gaXMgYXZhaWxhYmxlLCB3ZSBkbyBub3Qgd2FudCB0byBsZWFrIGFueSB0b2tlbnNcbiAgICAgIGlmICghIHRva2Vucy5vYXV0aF90b2tlbiAmJiAhIHRva2Vucy5vYXV0aF90b2tlbl9zZWNyZXQpIHtcbiAgICAgICAgT2JqZWN0LmFzc2lnbihlcnJvciwge3Jlc3BvbnNlOiByZXNwb25zZX0pO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuXG4gICAgdGhpcy5hY2Nlc3NUb2tlbiA9IHRva2Vucy5vYXV0aF90b2tlbjtcbiAgICB0aGlzLmFjY2Vzc1Rva2VuU2VjcmV0ID0gdG9rZW5zLm9hdXRoX3Rva2VuX3NlY3JldDtcbiAgfVxuXG4gIGFzeW5jIGNhbGxBc3luYyhtZXRob2QsIHVybCwgcGFyYW1zLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGhlYWRlcnMgPSB0aGlzLl9idWlsZEhlYWRlcih7XG4gICAgICBvYXV0aF90b2tlbjogdGhpcy5hY2Nlc3NUb2tlblxuICAgIH0pO1xuXG4gICAgaWYoISBwYXJhbXMpIHtcbiAgICAgIHBhcmFtcyA9IHt9O1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9jYWxsKHsgbWV0aG9kLCB1cmwsIGhlYWRlcnMsIHBhcmFtcywgY2FsbGJhY2sgfSk7XG4gIH1cblxuICBhc3luYyBnZXRBc3luYyh1cmwsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gdGhpcy5jYWxsQXN5bmMoJ0dFVCcsIHVybCwgcGFyYW1zLCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBwb3N0QXN5bmModXJsLCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIHRoaXMuY2FsbEFzeW5jKCdQT1NUJywgdXJsLCBwYXJhbXMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGdldCh1cmwsIHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAvLyBSZXF1aXJlIGNoYW5nZXMgd2hlbiByZW1vdmUgRmliZXJzLiBFeHBvc2VkIHRvIHB1YmxpYyBhcGkuXG4gICAgcmV0dXJuIHRoaXMuY2FsbCgnR0VUJywgdXJsLCBwYXJhbXMsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIHBvc3QodXJsLCBwYXJhbXMsIGNhbGxiYWNrKSB7XG4gICAgLy8gUmVxdWlyZSBjaGFuZ2VzIHdoZW4gcmVtb3ZlIEZpYmVycy4gRXhwb3NlZCB0byBwdWJsaWMgYXBpLlxuICAgIHJldHVybiB0aGlzLmNhbGwoJ1BPU1QnLCB1cmwsIHBhcmFtcywgY2FsbGJhY2spO1xuICB9XG5cbiAgX2J1aWxkSGVhZGVyKGhlYWRlcnMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgb2F1dGhfY29uc3VtZXJfa2V5OiB0aGlzLl9jb25maWcuY29uc3VtZXJLZXksXG4gICAgICBvYXV0aF9ub25jZTogUmFuZG9tLnNlY3JldCgpLnJlcGxhY2UoL1xcVy9nLCAnJyksXG4gICAgICBvYXV0aF9zaWduYXR1cmVfbWV0aG9kOiAnSE1BQy1TSEExJyxcbiAgICAgIG9hdXRoX3RpbWVzdGFtcDogKG5ldyBEYXRlKCkudmFsdWVPZigpLzEwMDApLnRvRml4ZWQoKS50b1N0cmluZygpLFxuICAgICAgb2F1dGhfdmVyc2lvbjogJzEuMCcsXG4gICAgICAuLi5oZWFkZXJzLFxuICAgIH1cbiAgfVxuXG4gIF9nZXRTaWduYXR1cmUobWV0aG9kLCB1cmwsIHJhd0hlYWRlcnMsIGFjY2Vzc1Rva2VuU2VjcmV0LCBwYXJhbXMpIHtcbiAgICBjb25zdCBoZWFkZXJzID0gdGhpcy5fZW5jb2RlSGVhZGVyKHsgLi4ucmF3SGVhZGVycywgLi4ucGFyYW1zIH0pO1xuXG4gICAgY29uc3QgcGFyYW1ldGVycyA9IE9iamVjdC5rZXlzKGhlYWRlcnMpLm1hcChrZXkgPT4gYCR7a2V5fT0ke2hlYWRlcnNba2V5XX1gKVxuICAgICAgLnNvcnQoKS5qb2luKCcmJyk7XG5cbiAgICBjb25zdCBzaWduYXR1cmVCYXNlID0gW1xuICAgICAgbWV0aG9kLFxuICAgICAgdGhpcy5fZW5jb2RlU3RyaW5nKHVybCksXG4gICAgICB0aGlzLl9lbmNvZGVTdHJpbmcocGFyYW1ldGVycylcbiAgICBdLmpvaW4oJyYnKTtcblxuICAgIGNvbnN0IHNlY3JldCA9IE9BdXRoLm9wZW5TZWNyZXQodGhpcy5fY29uZmlnLnNlY3JldCk7XG5cbiAgICBsZXQgc2lnbmluZ0tleSA9IGAke3RoaXMuX2VuY29kZVN0cmluZyhzZWNyZXQpfSZgO1xuICAgIGlmIChhY2Nlc3NUb2tlblNlY3JldClcbiAgICAgIHNpZ25pbmdLZXkgKz0gdGhpcy5fZW5jb2RlU3RyaW5nKGFjY2Vzc1Rva2VuU2VjcmV0KTtcblxuICAgIHJldHVybiBjcnlwdG8uY3JlYXRlSG1hYygnU0hBMScsIHNpZ25pbmdLZXkpLnVwZGF0ZShzaWduYXR1cmVCYXNlKS5kaWdlc3QoJ2Jhc2U2NCcpO1xuICB9O1xuXG4gIGFzeW5jIF9jYWxsKHttZXRob2QsIHVybCwgaGVhZGVycyA9IHt9LCBwYXJhbXMgPSB7fSwgY2FsbGJhY2t9KSB7XG4gICAgLy8gYWxsIFVSTHMgdG8gYmUgZnVuY3Rpb25zIHRvIHN1cHBvcnQgcGFyYW1ldGVycy9jdXN0b21pemF0aW9uXG4gICAgaWYodHlwZW9mIHVybCA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB1cmwgPSB1cmwodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gRXh0cmFjdCBhbGwgcXVlcnkgc3RyaW5nIHBhcmFtZXRlcnMgZnJvbSB0aGUgcHJvdmlkZWQgVVJMXG4gICAgY29uc3QgcGFyc2VkVXJsID0gdXJsTW9kdWxlLnBhcnNlKHVybCwgdHJ1ZSk7XG4gICAgLy8gTWVyZ2UgdGhlbSBpbiBhIHdheSB0aGF0IHBhcmFtcyBnaXZlbiB0byB0aGUgbWV0aG9kIGNhbGwgaGF2ZSBwcmVjZWRlbmNlXG4gICAgcGFyYW1zID0geyAuLi5wYXJzZWRVcmwucXVlcnksIC4uLnBhcmFtcyB9O1xuXG4gICAgLy8gUmVjb25zdHJ1Y3QgdGhlIFVSTCBiYWNrIHdpdGhvdXQgYW55IHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXJzXG4gICAgLy8gKHRoZXkgYXJlIG5vdyBpbiBwYXJhbXMpXG4gICAgcGFyc2VkVXJsLnF1ZXJ5ID0ge307XG4gICAgcGFyc2VkVXJsLnNlYXJjaCA9ICcnO1xuICAgIHVybCA9IHVybE1vZHVsZS5mb3JtYXQocGFyc2VkVXJsKTtcblxuICAgIC8vIEdldCB0aGUgc2lnbmF0dXJlXG4gICAgaGVhZGVycy5vYXV0aF9zaWduYXR1cmUgPVxuICAgICAgdGhpcy5fZ2V0U2lnbmF0dXJlKG1ldGhvZCwgdXJsLCBoZWFkZXJzLCB0aGlzLmFjY2Vzc1Rva2VuU2VjcmV0LCBwYXJhbXMpO1xuXG4gICAgLy8gTWFrZSBhIGF1dGhvcml6YXRpb24gc3RyaW5nIGFjY29yZGluZyB0byBvYXV0aDEgc3BlY1xuICAgIGNvbnN0IGF1dGhTdHJpbmcgPSB0aGlzLl9nZXRBdXRoSGVhZGVyU3RyaW5nKGhlYWRlcnMpO1xuICAgIC8vIE1ha2Ugc2lnbmVkIHJlcXVlc3RcbiAgICByZXR1cm4gT0F1dGguX2ZldGNoKHVybCwgbWV0aG9kLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEF1dGhvcml6YXRpb246IGF1dGhTdHJpbmcsXG4gICAgICAgIC4uLihtZXRob2QudG9VcHBlckNhc2UoKSA9PT0gJ1BPU1QnID8geyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgfSA6IHt9KVxuICAgICAgfSxcbiAgICAgIC4uLihtZXRob2QudG9VcHBlckNhc2UoKSA9PT0gJ1BPU1QnID9cbiAgICAgICAgeyBib2R5OiBPQXV0aC5fYWRkVmFsdWVzVG9RdWVyeVBhcmFtcyhwYXJhbXMpLnRvU3RyaW5nKCkgfVxuICAgICAgICA6IHsgcXVlcnlQYXJhbXM6IHBhcmFtcyB9KVxuICAgIH0pLnRoZW4oKHJlcykgPT5cbiAgICAgICAgcmVzLnRleHQoKS50aGVuKChjb250ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVzcG9uc2VIZWFkZXJzID0gQXJyYXkuZnJvbShyZXMuaGVhZGVycy5lbnRyaWVzKCkpLnJlZHVjZShcbiAgICAgICAgICAgIChhY2MsIFtrZXksIHZhbF0pID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIHsgLi4uYWNjLCBba2V5LnRvTG93ZXJDYXNlKCldOiB2YWwgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7fVxuICAgICAgICAgICk7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlSGVhZGVyc1snY29udGVudC10eXBlJ10uaW5jbHVkZXMoJ2FwcGxpY2F0aW9uL2pzb24nKSA/XG4gICAgICAgICAgICBKU09OLnBhcnNlKGNvbnRlbnQpIDogdW5kZWZpbmVkO1xuICAgICAgICAgIHJldHVybiAge1xuICAgICAgICAgICAgY29udGVudDogZGF0YSA/ICcnIDogY29udGVudCxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBoZWFkZXJzOiB7IC4uLnJlc3BvbnNlSGVhZGVycywgbm9uY2U6IGhlYWRlcnMub2F1dGhfbm9uY2UgfSxcbiAgICAgICAgICAgIHJlZGlyZWN0ZWQ6IHJlcy5yZWRpcmVjdGVkLFxuICAgICAgICAgICAgb2s6IHJlcy5vayxcbiAgICAgICAgICAgIHN0YXR1c0NvZGU6IHJlcy5zdGF0dXMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfSlcbiAgICAgIClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICBjYWxsYmFjayh1bmRlZmluZWQsIHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyh7IGVyciB9KTtcbiAgICAgICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICBuZXcgRXJyb3IoYEZhaWxlZCB0byBzZW5kIE9BdXRoMSByZXF1ZXN0IHRvICR7dXJsfS4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICAgICApO1xuICAgICAgfSk7XG4gIH1cblxuICBfZW5jb2RlSGVhZGVyKGhlYWRlcikge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhoZWFkZXIpLnJlZHVjZSgobWVtbywga2V5KSA9PiB7XG4gICAgICBtZW1vW3RoaXMuX2VuY29kZVN0cmluZyhrZXkpXSA9IHRoaXMuX2VuY29kZVN0cmluZyhoZWFkZXJba2V5XSk7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9LCB7fSk7XG4gIH07XG5cbiAgX2VuY29kZVN0cmluZyhzdHIpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvWyEnKCldL2csIGVzY2FwZSkucmVwbGFjZSgvXFwqL2csIFwiJTJBXCIpO1xuICB9O1xuXG4gIF9nZXRBdXRoSGVhZGVyU3RyaW5nKGhlYWRlcnMpIHtcbiAgICByZXR1cm4gJ09BdXRoICcgKyAgT2JqZWN0LmtleXMoaGVhZGVycykubWFwKGtleSA9PlxuICAgICAgYCR7dGhpcy5fZW5jb2RlU3RyaW5nKGtleSl9PVwiJHt0aGlzLl9lbmNvZGVTdHJpbmcoaGVhZGVyc1trZXldKX1cImBcbiAgICApLnNvcnQoKS5qb2luKCcsICcpO1xuICB9O1xuXG59O1xuIiwiaW1wb3J0IHVybCBmcm9tICd1cmwnO1xuaW1wb3J0IHsgT0F1dGgxQmluZGluZyB9IGZyb20gJy4vb2F1dGgxX2JpbmRpbmcnO1xuXG5PQXV0aC5fcXVlcnlQYXJhbXNXaXRoQXV0aFRva2VuVXJsID0gKGF1dGhVcmwsIG9hdXRoQmluZGluZywgcGFyYW1zID0ge30sIHdoaXRlbGlzdGVkUXVlcnlQYXJhbXMgPSBbXSkgPT4ge1xuICBjb25zdCByZWRpcmVjdFVybE9iaiA9IHVybC5wYXJzZShhdXRoVXJsLCB0cnVlKTtcblxuICBPYmplY3QuYXNzaWduKFxuICAgIHJlZGlyZWN0VXJsT2JqLnF1ZXJ5LFxuICAgIHdoaXRlbGlzdGVkUXVlcnlQYXJhbXMucmVkdWNlKChwcmV2LCBwYXJhbSkgPT5cbiAgICAgIHBhcmFtcy5xdWVyeVtwYXJhbV0gPyB7IC4uLnByZXYsIHBhcmFtOiBwYXJhbXMucXVlcnlbcGFyYW1dIH0gOiBwcmV2LFxuICAgICAge31cbiAgICApLFxuICAgIHtcbiAgICAgIG9hdXRoX3Rva2VuOiBvYXV0aEJpbmRpbmcucmVxdWVzdFRva2VuLFxuICAgIH1cbiAgKTtcblxuICAvLyBDbGVhciB0aGUgYHNlYXJjaGAgc28gaXQgaXMgcmVidWlsdCBieSBOb2RlJ3MgYHVybGAgZnJvbSB0aGUgYHF1ZXJ5YCBhYm92ZS5cbiAgLy8gVXNpbmcgcHJldmlvdXMgdmVyc2lvbnMgb2YgdGhlIE5vZGUgYHVybGAgbW9kdWxlLCB0aGlzIHdhcyBqdXN0IHNldCB0byBcIlwiXG4gIC8vIEhvd2V2ZXIsIE5vZGUgNiBkb2NzIHNlZW0gdG8gaW5kaWNhdGUgdGhhdCB0aGlzIHNob3VsZCBiZSBgdW5kZWZpbmVkYC5cbiAgZGVsZXRlIHJlZGlyZWN0VXJsT2JqLnNlYXJjaDtcblxuICAvLyBSZWNvbnN0cnVjdCB0aGUgVVJMIGJhY2sgd2l0aCBwcm92aWRlZCBxdWVyeSBwYXJhbWV0ZXJzIG1lcmdlZCB3aXRoIG9hdXRoX3Rva2VuXG4gIHJldHVybiB1cmwuZm9ybWF0KHJlZGlyZWN0VXJsT2JqKTtcbn07XG5cbi8vIGNvbm5lY3QgbWlkZGxld2FyZVxuT0F1dGguX3JlcXVlc3RIYW5kbGVyc1snMSddID0gYXN5bmMgKHNlcnZpY2UsIHF1ZXJ5LCByZXMpID0+IHtcbiAgY29uc3QgY29uZmlnID0gYXdhaXQgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZUFzeW5jKHtzZXJ2aWNlOiBzZXJ2aWNlLnNlcnZpY2VOYW1lfSk7XG4gIGlmICghIGNvbmZpZykge1xuICAgIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcihzZXJ2aWNlLnNlcnZpY2VOYW1lKTtcbiAgfVxuXG4gIGNvbnN0IHsgdXJscyB9ID0gc2VydmljZTtcbiAgY29uc3Qgb2F1dGhCaW5kaW5nID0gbmV3IE9BdXRoMUJpbmRpbmcoY29uZmlnLCB1cmxzKTtcblxuICBsZXQgY3JlZGVudGlhbFNlY3JldDtcblxuICBpZiAocXVlcnkucmVxdWVzdFRva2VuQW5kUmVkaXJlY3QpIHtcbiAgICAvLyBzdGVwIDEgLSBnZXQgYW5kIHN0b3JlIGEgcmVxdWVzdCB0b2tlblxuICAgIGNvbnN0IGNhbGxiYWNrVXJsID0gT0F1dGguX3JlZGlyZWN0VXJpKHNlcnZpY2Uuc2VydmljZU5hbWUsIGNvbmZpZywge1xuICAgICAgc3RhdGU6IHF1ZXJ5LnN0YXRlLFxuICAgICAgY29yZG92YTogKHF1ZXJ5LmNvcmRvdmEgPT09IFwidHJ1ZVwiKSxcbiAgICAgIGFuZHJvaWQ6IChxdWVyeS5hbmRyb2lkID09PSBcInRydWVcIilcbiAgICB9KTtcblxuICAgIC8vIEdldCBhIHJlcXVlc3QgdG9rZW4gdG8gc3RhcnQgYXV0aCBwcm9jZXNzXG4gICAgYXdhaXQgb2F1dGhCaW5kaW5nLnByZXBhcmVSZXF1ZXN0VG9rZW4oY2FsbGJhY2tVcmwpO1xuXG4gICAgLy8gS2VlcCB0cmFjayBvZiByZXF1ZXN0IHRva2VuIHNvIHdlIGNhbiB2ZXJpZnkgaXQgb24gdGhlIG5leHQgc3RlcFxuICAgIGF3YWl0IE9BdXRoLl9zdG9yZVJlcXVlc3RUb2tlbihcbiAgICAgIE9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkocXVlcnkpLFxuICAgICAgb2F1dGhCaW5kaW5nLnJlcXVlc3RUb2tlbixcbiAgICAgIG9hdXRoQmluZGluZy5yZXF1ZXN0VG9rZW5TZWNyZXQpO1xuXG4gICAgLy8gc3VwcG9ydCBmb3Igc2NvcGUvbmFtZSBwYXJhbWV0ZXJzXG4gICAgbGV0IHJlZGlyZWN0VXJsO1xuICAgIGNvbnN0IGF1dGhQYXJhbXMgPSB7IHF1ZXJ5IH07XG5cbiAgICBpZih0eXBlb2YgdXJscy5hdXRoZW50aWNhdGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmVkaXJlY3RVcmwgPSB1cmxzLmF1dGhlbnRpY2F0ZShvYXV0aEJpbmRpbmcsIGF1dGhQYXJhbXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWRpcmVjdFVybCA9IE9BdXRoLl9xdWVyeVBhcmFtc1dpdGhBdXRoVG9rZW5VcmwoXG4gICAgICAgIHVybHMuYXV0aGVudGljYXRlLFxuICAgICAgICBvYXV0aEJpbmRpbmcsXG4gICAgICAgIGF1dGhQYXJhbXNcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gcmVkaXJlY3QgdG8gcHJvdmlkZXIgbG9naW4sIHdoaWNoIHdpbGwgcmVkaXJlY3QgYmFjayB0byBcInN0ZXAgMlwiIGJlbG93XG5cbiAgICByZXMud3JpdGVIZWFkKDMwMiwgeydMb2NhdGlvbic6IHJlZGlyZWN0VXJsfSk7XG4gICAgcmVzLmVuZCgpO1xuICB9IGVsc2Uge1xuICAgIC8vIHN0ZXAgMiwgcmVkaXJlY3RlZCBmcm9tIHByb3ZpZGVyIGxvZ2luIC0gc3RvcmUgdGhlIHJlc3VsdFxuICAgIC8vIGFuZCBjbG9zZSB0aGUgd2luZG93IHRvIGFsbG93IHRoZSBsb2dpbiBoYW5kbGVyIHRvIHByb2NlZWRcblxuICAgIC8vIEdldCB0aGUgdXNlcidzIHJlcXVlc3QgdG9rZW4gc28gd2UgY2FuIHZlcmlmeSBpdCBhbmQgY2xlYXIgaXRcbiAgICBjb25zdCByZXF1ZXN0VG9rZW5JbmZvID0gYXdhaXQgT0F1dGguX3JldHJpZXZlUmVxdWVzdFRva2VuKFxuICAgICAgT0F1dGguX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeShxdWVyeSkpO1xuXG4gICAgaWYgKCEgcmVxdWVzdFRva2VuSW5mbykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIHJldHJpZXZlIHJlcXVlc3QgdG9rZW5cIik7XG4gICAgfVxuXG4gICAgLy8gVmVyaWZ5IHVzZXIgYXV0aG9yaXplZCBhY2Nlc3MgYW5kIHRoZSBvYXV0aF90b2tlbiBtYXRjaGVzXG4gICAgLy8gdGhlIHJlcXVlc3RUb2tlbiBmcm9tIHByZXZpb3VzIHN0ZXBcbiAgICBpZiAocXVlcnkub2F1dGhfdG9rZW4gJiYgcXVlcnkub2F1dGhfdG9rZW4gPT09IHJlcXVlc3RUb2tlbkluZm8ucmVxdWVzdFRva2VuKSB7XG5cbiAgICAgIC8vIFByZXBhcmUgdGhlIGxvZ2luIHJlc3VsdHMgYmVmb3JlIHJldHVybmluZy4gIFRoaXMgd2F5IHRoZVxuICAgICAgLy8gc3Vic2VxdWVudCBjYWxsIHRvIHRoZSBgbG9naW5gIG1ldGhvZCB3aWxsIGJlIGltbWVkaWF0ZS5cblxuICAgICAgLy8gR2V0IHRoZSBhY2Nlc3MgdG9rZW4gZm9yIHNpZ25pbmcgcmVxdWVzdHNcbiAgICAgIGF3YWl0IG9hdXRoQmluZGluZy5wcmVwYXJlQWNjZXNzVG9rZW4ocXVlcnksIHJlcXVlc3RUb2tlbkluZm8ucmVxdWVzdFRva2VuU2VjcmV0KTtcblxuICAgICAgLy8gUnVuIHNlcnZpY2Utc3BlY2lmaWMgaGFuZGxlci5cbiAgICAgIGNvbnN0IG9hdXRoUmVzdWx0ID0gYXdhaXQgc2VydmljZS5oYW5kbGVPYXV0aFJlcXVlc3QoXG4gICAgICAgIG9hdXRoQmluZGluZywgeyBxdWVyeTogcXVlcnkgfSk7XG5cbiAgICAgIGNvbnN0IGNyZWRlbnRpYWxUb2tlbiA9IE9BdXRoLl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkocXVlcnkpO1xuICAgICAgY3JlZGVudGlhbFNlY3JldCA9IFJhbmRvbS5zZWNyZXQoKTtcblxuICAgICAgLy8gU3RvcmUgdGhlIGxvZ2luIHJlc3VsdCBzbyBpdCBjYW4gYmUgcmV0cmlldmVkIGluIGFub3RoZXJcbiAgICAgIC8vIGJyb3dzZXIgdGFiIGJ5IHRoZSByZXN1bHQgaGFuZGxlclxuICAgICAgYXdhaXQgT0F1dGguX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCB7XG4gICAgICAgIHNlcnZpY2VOYW1lOiBzZXJ2aWNlLnNlcnZpY2VOYW1lLFxuICAgICAgICBzZXJ2aWNlRGF0YTogb2F1dGhSZXN1bHQuc2VydmljZURhdGEsXG4gICAgICAgIG9wdGlvbnM6IG9hdXRoUmVzdWx0Lm9wdGlvbnNcbiAgICAgIH0sIGNyZWRlbnRpYWxTZWNyZXQpO1xuICAgIH1cblxuICAgIC8vIEVpdGhlciBjbG9zZSB0aGUgd2luZG93LCByZWRpcmVjdCwgb3IgcmVuZGVyIG5vdGhpbmdcbiAgICAvLyBpZiBhbGwgZWxzZSBmYWlsc1xuICAgIGF3YWl0IE9BdXRoLl9yZW5kZXJPYXV0aFJlc3VsdHMocmVzLCBxdWVyeSwgY3JlZGVudGlhbFNlY3JldCk7XG4gIH1cbn07XG4iLCIvL1xuLy8gX3BlbmRpbmdSZXF1ZXN0VG9rZW5zIGFyZSByZXF1ZXN0IHRva2VucyB0aGF0IGhhdmUgYmVlbiByZWNlaXZlZFxuLy8gYnV0IG5vdCB5ZXQgZnVsbHkgYXV0aG9yaXplZCAocHJvY2Vzc2VkKS5cbi8vXG4vLyBEdXJpbmcgdGhlIG9hdXRoMSBhdXRob3JpemF0aW9uIHByb2Nlc3MsIHRoZSBNZXRlb3IgQXBwIG9wZW5zXG4vLyBhIHBvcC11cCwgcmVxdWVzdHMgYSByZXF1ZXN0IHRva2VuIGZyb20gdGhlIG9hdXRoMSBzZXJ2aWNlLCBhbmRcbi8vIHJlZGlyZWN0cyB0aGUgYnJvd3NlciB0byB0aGUgb2F1dGgxIHNlcnZpY2UgZm9yIHRoZSB1c2VyXG4vLyB0byBncmFudCBhdXRob3JpemF0aW9uLiAgVGhlIHVzZXIgaXMgdGhlbiByZXR1cm5lZCB0byB0aGVcbi8vIE1ldGVvciBBcHBzJyBjYWxsYmFjayB1cmwgYW5kIHRoZSByZXF1ZXN0IHRva2VuIGlzIHZlcmlmaWVkLlxuLy9cbi8vIFdoZW4gTWV0ZW9yIEFwcHMgcnVuIG9uIG11bHRpcGxlIHNlcnZlcnMsIGl0J3MgcG9zc2libGUgdGhhdFxuLy8gMiBkaWZmZXJlbnQgc2VydmVycyBtYXkgYmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgcmVxdWVzdCB0b2tlblxuLy8gYW5kIHRvIHZlcmlmeSBpdCBpbiB0aGUgY2FsbGJhY2sgb25jZSB0aGUgdXNlciBoYXMgYXV0aG9yaXplZC5cbi8vXG4vLyBGb3IgdGhpcyByZWFzb24sIHRoZSBfcGVuZGluZ1JlcXVlc3RUb2tlbnMgYXJlIHN0b3JlZCBpbiB0aGUgZGF0YWJhc2Vcbi8vIHNvIHRoZXkgY2FuIGJlIHNoYXJlZCBhY3Jvc3MgTWV0ZW9yIEFwcCBzZXJ2ZXJzLlxuLy9cbi8vIFhYWCBUaGlzIGNvZGUgaXMgZmFpcmx5IHNpbWlsYXIgdG8gb2F1dGgvcGVuZGluZ19jcmVkZW50aWFscy5qcyAtLVxuLy8gbWF5YmUgd2UgY2FuIGNvbWJpbmUgdGhlbSBzb21laG93LlxuXG4vLyBDb2xsZWN0aW9uIGNvbnRhaW5pbmcgcGVuZGluZyByZXF1ZXN0IHRva2Vuc1xuLy8gSGFzIGtleSwgcmVxdWVzdFRva2VuLCByZXF1ZXN0VG9rZW5TZWNyZXQsIGFuZCBjcmVhdGVkQXQgZmllbGRzLlxuT0F1dGguX3BlbmRpbmdSZXF1ZXN0VG9rZW5zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXG4gIFwibWV0ZW9yX29hdXRoX3BlbmRpbmdSZXF1ZXN0VG9rZW5zXCIsIHtcbiAgICBfcHJldmVudEF1dG9wdWJsaXNoOiB0cnVlXG4gIH0pO1xuXG5hd2FpdCBPQXV0aC5fcGVuZGluZ1JlcXVlc3RUb2tlbnMuY3JlYXRlSW5kZXhBc3luYygna2V5JywgeyB1bmlxdWU6IHRydWUgfSk7XG5hd2FpdCBPQXV0aC5fcGVuZGluZ1JlcXVlc3RUb2tlbnMuY3JlYXRlSW5kZXhBc3luYygnY3JlYXRlZEF0Jyk7XG5cblxuXG4vLyBQZXJpb2RpY2FsbHkgY2xlYXIgb2xkIGVudHJpZXMgdGhhdCBuZXZlciBnb3QgY29tcGxldGVkXG5jb25zdCBfY2xlYW5TdGFsZVJlc3VsdHMgPSBhc3luYyAoKSA9PiB7XG4gIC8vIFJlbW92ZSByZXF1ZXN0IHRva2VucyBvbGRlciB0aGFuIDUgbWludXRlXG4gIGNvbnN0IHRpbWVDdXRvZmYgPSBuZXcgRGF0ZSgpO1xuICB0aW1lQ3V0b2ZmLnNldE1pbnV0ZXModGltZUN1dG9mZi5nZXRNaW51dGVzKCkgLSA1KTtcbiAgYXdhaXQgT0F1dGguX3BlbmRpbmdSZXF1ZXN0VG9rZW5zLnJlbW92ZUFzeW5jKHsgY3JlYXRlZEF0OiB7ICRsdDogdGltZUN1dG9mZiB9IH0pO1xufTtcbmNvbnN0IF9jbGVhbnVwSGFuZGxlID0gTWV0ZW9yLnNldEludGVydmFsKF9jbGVhblN0YWxlUmVzdWx0cywgNjAgKiAxMDAwKTtcblxuXG4vLyBTdG9yZXMgdGhlIGtleSBhbmQgcmVxdWVzdCB0b2tlbiBpbiB0aGUgX3BlbmRpbmdSZXF1ZXN0VG9rZW5zIGNvbGxlY3Rpb24uXG4vLyBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBga2V5YCBpcyBub3QgYSBzdHJpbmcuXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy8gQHBhcmFtIHJlcXVlc3RUb2tlbiB7c3RyaW5nfVxuLy8gQHBhcmFtIHJlcXVlc3RUb2tlblNlY3JldCB7c3RyaW5nfVxuLy9cbk9BdXRoLl9zdG9yZVJlcXVlc3RUb2tlbiA9IGFzeW5jIChrZXksIHJlcXVlc3RUb2tlbiwgcmVxdWVzdFRva2VuU2VjcmV0KSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcblxuICAvLyBXZSBkbyBhbiB1cHNlcnQgaGVyZSBpbnN0ZWFkIG9mIGFuIGluc2VydCBpbiBjYXNlIHRoZSB1c2VyIGhhcHBlbnNcbiAgLy8gdG8gc29tZWhvdyBzZW5kIHRoZSBzYW1lIGBzdGF0ZWAgcGFyYW1ldGVyIHR3aWNlIGR1cmluZyBhbiBPQXV0aFxuICAvLyBsb2dpbjsgd2UgZG9uJ3Qgd2FudCBhIGR1cGxpY2F0ZSBrZXkgZXJyb3IuXG4gIGF3YWl0IE9BdXRoLl9wZW5kaW5nUmVxdWVzdFRva2Vucy51cHNlcnRBc3luYyh7XG4gICAga2V5LFxuICB9LCB7XG4gICAga2V5LFxuICAgIHJlcXVlc3RUb2tlbjogT0F1dGguc2VhbFNlY3JldChyZXF1ZXN0VG9rZW4pLFxuICAgIHJlcXVlc3RUb2tlblNlY3JldDogT0F1dGguc2VhbFNlY3JldChyZXF1ZXN0VG9rZW5TZWNyZXQpLFxuICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKVxuICB9KTtcbn07XG5cblxuLy8gUmV0cmlldmVzIGFuZCByZW1vdmVzIGEgcmVxdWVzdCB0b2tlbiBmcm9tIHRoZSBfcGVuZGluZ1JlcXVlc3RUb2tlbnMgY29sbGVjdGlvblxuLy8gUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyByZXF1ZXN0VG9rZW4gYW5kIHJlcXVlc3RUb2tlblNlY3JldCBwcm9wZXJ0aWVzXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy9cbk9BdXRoLl9yZXRyaWV2ZVJlcXVlc3RUb2tlbiA9IGFzeW5jIGtleSA9PiB7XG4gIGNoZWNrKGtleSwgU3RyaW5nKTtcblxuICBjb25zdCBwZW5kaW5nUmVxdWVzdFRva2VuID0gIGF3YWl0IE9BdXRoLl9wZW5kaW5nUmVxdWVzdFRva2Vucy5maW5kT25lQXN5bmMoeyBrZXk6IGtleSB9KTtcbiAgaWYgKHBlbmRpbmdSZXF1ZXN0VG9rZW4pIHtcbiAgICBhd2FpdCBPQXV0aC5fcGVuZGluZ1JlcXVlc3RUb2tlbnMucmVtb3ZlQXN5bmMoeyBfaWQ6IHBlbmRpbmdSZXF1ZXN0VG9rZW4uX2lkIH0pO1xuICAgIHJldHVybiB7XG4gICAgICByZXF1ZXN0VG9rZW46IE9BdXRoLm9wZW5TZWNyZXQocGVuZGluZ1JlcXVlc3RUb2tlbi5yZXF1ZXN0VG9rZW4pLFxuICAgICAgcmVxdWVzdFRva2VuU2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KFxuICAgICAgICBwZW5kaW5nUmVxdWVzdFRva2VuLnJlcXVlc3RUb2tlblNlY3JldClcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn07XG4iXX0=
