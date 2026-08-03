Package["core-runtime"].queue("oauth",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var URL = Package.url.URL;
var URLSearchParams = Package.url.URLSearchParams;
var RoutePolicy = Package.routepolicy.RoutePolicy;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var Log = Package.logging.Log;
var fetch = Package.fetch.fetch;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var OAuth, OAuthTest;

var require = meteorInstall({"node_modules":{"meteor":{"oauth":{"oauth_server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/oauth/oauth_server.js                                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    let _objectWithoutProperties;
    module.link("@babel/runtime/helpers/objectWithoutProperties", {
      default(v) {
        _objectWithoutProperties = v;
      }
    }, 1);
    const _excluded = ["headers", "queryParams", "body"];
    let bodyParser;
    module.link("body-parser", {
      default(v) {
        bodyParser = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    OAuth = {};
    OAuthTest = {};
    RoutePolicy.declare('/_oauth/', 'network');
    const registeredServices = {};

    // Internal: Maps from service version to handler function. The
    // 'oauth1' and 'oauth2' packages manipulate this directly to register
    // for callbacks.
    OAuth._requestHandlers = {};

    /**
    /* Register a handler for an OAuth service. The handler will be called
    /* when we get an incoming http request on /_oauth/{serviceName}. This
    /* handler should use that information to fetch data about the user
    /* logging in.
    /*
    /* @param name {String} e.g. "google", "facebook"
    /* @param version {Number} OAuth version (1 or 2)
    /* @param urls   For OAuth1 only, specify the service's urls
    /* @param handleOauthRequest {Function(oauthBinding|query)}
    /*   - (For OAuth1 only) oauthBinding {OAuth1Binding} bound to the appropriate provider
    /*   - (For OAuth2 only) query {Object} parameters passed in query string
    /*   - return value is:
    /*     - {serviceData:, (optional options:)} where serviceData should end
    /*       up in the user's services[name] field
    /*     - `null` if the user declined to give permissions
    */
    OAuth.registerService = (name, version, urls, handleOauthRequest) => {
      if (registeredServices[name]) throw new Error("Already registered the ".concat(name, " OAuth service"));
      registeredServices[name] = {
        serviceName: name,
        version,
        urls,
        handleOauthRequest
      };
    };

    // For test cleanup.
    OAuthTest.unregisterService = name => {
      delete registeredServices[name];
    };
    OAuth.retrieveCredential = (credentialToken, credentialSecret) => OAuth._retrievePendingCredential(credentialToken, credentialSecret);

    // The state parameter is normally generated on the client using
    // `btoa`, but for tests we need a version that runs on the server.
    //
    OAuth._generateState = (loginStyle, credentialToken, redirectUrl) => {
      return Buffer.from(JSON.stringify({
        loginStyle: loginStyle,
        credentialToken: credentialToken,
        redirectUrl: redirectUrl
      })).toString('base64');
    };
    OAuth._stateFromQuery = query => {
      let string;
      try {
        string = Buffer.from(query.state, 'base64').toString('binary');
      } catch (e) {
        Log.warn("Unable to base64 decode state from OAuth query: ".concat(query.state));
        throw e;
      }
      try {
        return JSON.parse(string);
      } catch (e) {
        Log.warn("Unable to parse state from OAuth query: ".concat(string));
        throw e;
      }
    };
    OAuth._loginStyleFromQuery = query => {
      let style;
      // For backwards-compatibility for older clients, catch any errors
      // that result from parsing the state parameter. If we can't parse it,
      // set login style to popup by default.
      try {
        style = OAuth._stateFromQuery(query).loginStyle;
      } catch (err) {
        style = "popup";
      }
      if (style !== "popup" && style !== "redirect") {
        throw new Error("Unrecognized login style: ".concat(style));
      }
      return style;
    };
    OAuth._credentialTokenFromQuery = query => {
      let state;
      // For backwards-compatibility for older clients, catch any errors
      // that result from parsing the state parameter. If we can't parse it,
      // assume that the state parameter's value is the credential token, as
      // it used to be for older clients.
      try {
        state = OAuth._stateFromQuery(query);
      } catch (err) {
        return query.state;
      }
      return state.credentialToken;
    };
    OAuth._isCordovaFromQuery = query => {
      try {
        return !!OAuth._stateFromQuery(query).isCordova;
      } catch (err) {
        // For backwards-compatibility for older clients, catch any errors
        // that result from parsing the state parameter. If we can't parse
        // it, assume that we are not on Cordova, since older Meteor didn't
        // do Cordova.
        return false;
      }
    };

    // Checks if the `redirectUrl` matches the app host.
    // We export this function so that developers can override this
    // behavior to allow apps from external domains to login using the
    // redirect OAuth flow.
    OAuth._checkRedirectUrlOrigin = redirectUrl => {
      const appHost = Meteor.absoluteUrl();
      const appHostReplacedLocalhost = Meteor.absoluteUrl(undefined, {
        replaceLocalhost: true
      });
      return redirectUrl.substr(0, appHost.length) !== appHost && redirectUrl.substr(0, appHostReplacedLocalhost.length) !== appHostReplacedLocalhost;
    };
    const middleware = async (req, res, next) => {
      let requestData;

      // Make sure to catch any exceptions because otherwise we'd crash
      // the runner
      try {
        const serviceName = oauthServiceName(req);
        if (!serviceName) {
          // not an oauth request. pass to next middleware.
          next();
          return;
        }
        const service = registeredServices[serviceName];

        // Skip everything if there's no service set by the oauth middleware
        if (!service) throw new Error("Unexpected OAuth service ".concat(serviceName));

        // Make sure we're configured
        await ensureConfigured(serviceName);
        const handler = OAuth._requestHandlers[service.version];
        if (!handler) throw new Error("Unexpected OAuth version ".concat(service.version));
        if (req.method === 'GET') {
          requestData = req.query;
        } else {
          requestData = req.body;
        }
        await handler(service, requestData, res);
      } catch (err) {
        var _requestData;
        // if we got thrown an error, save it off, it will get passed to
        // the appropriate login call (if any) and reported there.
        //
        // The other option would be to display it in the popup tab that
        // is still open at this point, ignoring the 'close' or 'redirect'
        // we were passed. But then the developer wouldn't be able to
        // style the error or react to it in any way.
        if ((_requestData = requestData) !== null && _requestData !== void 0 && _requestData.state && err instanceof Error) {
          try {
            // catch any exceptions to avoid crashing runner
            await OAuth._storePendingCredential(OAuth._credentialTokenFromQuery(requestData), err);
          } catch (err) {
            // Ignore the error and just give up. If we failed to store the
            // error, then the login will just fail with a generic error.
            Log.warn("Error in OAuth Server while storing pending login result.\n" + err.stack || err.message);
          }
        }

        // close the popup. because nobody likes them just hanging
        // there.  when someone sees this multiple times they might
        // think to check server logs (we hope?)
        // Catch errors because any exception here will crash the runner.
        try {
          await OAuth._endOfLoginResponse(res, {
            query: requestData,
            loginStyle: OAuth._loginStyleFromQuery(requestData),
            error: err
          });
        } catch (err) {
          Log.warn("Error generating end of login response\n" + (err && (err.stack || err.message)));
        }
      }
    };

    // Listen to incoming OAuth http requests
    WebApp.handlers.use('/_oauth', bodyParser.json());
    WebApp.handlers.use('/_oauth', bodyParser.urlencoded({
      extended: false
    }));
    WebApp.handlers.use(middleware);
    OAuthTest.middleware = middleware;
    OAuthTest.registeredServices = registeredServices;

    // Handle /_oauth/* paths and extract the service name.
    //
    // @returns {String|null} e.g. "facebook", or null if this isn't an
    // oauth request
    const oauthServiceName = req => {
      // req.url will be "/_oauth/<service name>" with an optional "?close".
      const i = req.url.indexOf('?');
      let barePath;
      if (i === -1) barePath = req.url;else barePath = req.url.substring(0, i);
      const splitPath = barePath.split('/');

      // Any non-oauth request will continue down the default
      // middlewares.
      if (splitPath[1] !== '_oauth') return null;

      // Find service based on url
      const serviceName = splitPath[2];
      return serviceName;
    };

    // Make sure we're configured
    const ensureConfigured = async serviceName => {
      const config = await ServiceConfiguration.configurations.findOneAsync({
        service: serviceName
      });
      if (!config) {
        throw new ServiceConfiguration.ConfigError();
      }
    };
    const isSafe = value => {
      // This matches strings generated by `Random.secret` and
      // `Random.id`.
      return typeof value === "string" && /^[a-zA-Z0-9\-_]+$/.test(value);
    };

    // Internal: used by the oauth1 and oauth2 packages
    OAuth._renderOauthResults = async (res, query, credentialSecret) => {
      // For tests, we support the `only_credential_secret_for_test`
      // parameter, which just returns the credential secret without any
      // surrounding HTML. (The test needs to be able to easily grab the
      // secret and use it to log in.)
      //
      // XXX only_credential_secret_for_test could be useful for other
      // things beside tests, like command-line clients. We should give it a
      // real name and serve the credential secret in JSON.

      if (query.only_credential_secret_for_test) {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end(credentialSecret, 'utf-8');
      } else {
        const details = {
          query,
          loginStyle: OAuth._loginStyleFromQuery(query)
        };
        if (query.error) {
          details.error = query.error;
        } else {
          const token = OAuth._credentialTokenFromQuery(query);
          const secret = credentialSecret;
          if (token && secret && isSafe(token) && isSafe(secret)) {
            details.credentials = {
              token: token,
              secret: secret
            };
          } else {
            details.error = "invalid_credential_token_or_secret";
          }
        }
        await OAuth._endOfLoginResponse(res, details);
      }
    };
    const getAsset = name => {
      return new Promise((resolve, reject) => Assets.getTextAsync("".concat(name, ".html"), (err, data) => err ? reject(err) : resolve(data)));
    };
    // This "template" (not a real Spacebars template, just an HTML file
    // with some ##PLACEHOLDER##s) communicates the credential secret back
    // to the main window and then closes the popup.
    OAuth._endOfPopupResponseTemplate = async () => await getAsset('end_of_popup_response');
    OAuth._endOfRedirectResponseTemplate = async () => await getAsset('end_of_redirect_response');

    // Renders the end of login response template into some HTML and JavaScript
    // that closes the popup or redirects at the end of the OAuth flow.
    //
    // options are:
    //   - loginStyle ("popup" or "redirect")
    //   - setCredentialToken (boolean)
    //   - credentialToken
    //   - credentialSecret
    //   - redirectUrl
    //   - isCordova (boolean)
    //
    const renderEndOfLoginResponse = async options => {
      // It would be nice to use Blaze here, but it's a little tricky
      // because our mustaches would be inside a <script> tag, and Blaze
      // would treat the <script> tag contents as text (e.g. encode '&' as
      // '&amp;'). So we just do a simple replace.

      const escape = s => {
        if (s) {
          return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;").replace(/\//g, "&#x2F;");
        } else {
          return s;
        }
      };

      // Escape everything just to be safe (we've already checked that some
      // of this data -- the token and secret -- are safe).
      const config = {
        setCredentialToken: !!options.setCredentialToken,
        credentialToken: escape(options.credentialToken),
        credentialSecret: escape(options.credentialSecret),
        storagePrefix: escape(OAuth._storageTokenPrefix),
        redirectUrl: escape(options.redirectUrl),
        isCordova: !!options.isCordova
      };
      let template;
      if (options.loginStyle === 'popup') {
        template = await OAuth._endOfPopupResponseTemplate();
      } else if (options.loginStyle === 'redirect') {
        template = await OAuth._endOfRedirectResponseTemplate();
      } else {
        throw new Error("invalid loginStyle: ".concat(options.loginStyle));
      }
      const result = template.replace(/##CONFIG##/, JSON.stringify(config)).replace(/##ROOT_URL_PATH_PREFIX##/, __meteor_runtime_config__.ROOT_URL_PATH_PREFIX);
      return "<!DOCTYPE html>\n".concat(result);
    };

    // Writes an HTTP response to the popup window at the end of an OAuth
    // login flow. At this point, if the user has successfully authenticated
    // to the OAuth server and authorized this app, we communicate the
    // credentialToken and credentialSecret to the main window. The main
    // window must provide both these values to the DDP `login` method to
    // authenticate its DDP connection. After communicating these values to
    // the main window, we close the popup.
    //
    // We export this function so that developers can override this
    // behavior, which is particularly useful in, for example, some mobile
    // environments where popups and/or `window.opener` don't work. For
    // example, an app could override `OAuth._endOfPopupResponse` to put the
    // credential token and credential secret in the popup URL for the main
    // window to read them there instead of using `window.opener`. If you
    // override this function, you take responsibility for writing to the
    // request and calling `res.end()` to complete the request.
    //
    // Arguments:
    //   - res: the HTTP response object
    //   - details:
    //      - query: the query string on the HTTP request
    //      - credentials: { token: *, secret: * }. If present, this field
    //        indicates that the login was successful. Return these values
    //        to the client, who can use them to log in over DDP. If
    //        present, the values have been checked against a limited
    //        character set and are safe to include in HTML.
    //      - error: if present, a string or Error indicating an error that
    //        occurred during the login. This can come from the client and
    //        so shouldn't be trusted for security decisions or included in
    //        the response without sanitizing it first. Only one of `error`
    //        or `credentials` should be set.
    OAuth._endOfLoginResponse = async (res, details) => {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      let redirectUrl;
      if (details.loginStyle === 'redirect') {
        var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;
        redirectUrl = OAuth._stateFromQuery(details.query).redirectUrl;
        const appHost = Meteor.absoluteUrl();
        if (!((_Meteor$settings = Meteor.settings) !== null && _Meteor$settings !== void 0 && (_Meteor$settings$pack = _Meteor$settings.packages) !== null && _Meteor$settings$pack !== void 0 && (_Meteor$settings$pack2 = _Meteor$settings$pack.oauth) !== null && _Meteor$settings$pack2 !== void 0 && _Meteor$settings$pack2.disableCheckRedirectUrlOrigin) && OAuth._checkRedirectUrlOrigin(redirectUrl)) {
          details.error = "redirectUrl (".concat(redirectUrl) + ") is not on the same host as the app (".concat(appHost, ")");
          redirectUrl = appHost;
        }
      }
      const isCordova = OAuth._isCordovaFromQuery(details.query);
      if (details.error) {
        Log.warn("Error in OAuth Server: " + (details.error instanceof Error ? details.error.message : details.error));
        res.end(await renderEndOfLoginResponse({
          loginStyle: details.loginStyle,
          setCredentialToken: false,
          redirectUrl,
          isCordova
        }), "utf-8");
        return;
      }

      // If we have a credentialSecret, report it back to the parent
      // window, with the corresponding credentialToken. The parent window
      // uses the credentialToken and credentialSecret to log in over DDP.
      res.end(await renderEndOfLoginResponse({
        loginStyle: details.loginStyle,
        setCredentialToken: true,
        credentialToken: details.credentials.token,
        credentialSecret: details.credentials.secret,
        redirectUrl,
        isCordova
      }), "utf-8");
    };
    const OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption;
    const usingOAuthEncryption = () => OAuthEncryption && OAuthEncryption.keyIsLoaded();

    // Encrypt sensitive service data such as access tokens if the
    // "oauth-encryption" package is loaded and the oauth secret key has
    // been specified.  Returns the unencrypted plaintext otherwise.
    //
    // The user id is not specified because the user isn't known yet at
    // this point in the oauth authentication process.  After the oauth
    // authentication process completes the encrypted service data fields
    // will be re-encrypted with the user id included before inserting the
    // service data into the user document.
    //
    OAuth.sealSecret = plaintext => {
      if (usingOAuthEncryption()) return OAuthEncryption.seal(plaintext);else return plaintext;
    };

    // Unencrypt a service data field, if the "oauth-encryption"
    // package is loaded and the field is encrypted.
    //
    // Throws an error if the "oauth-encryption" package is loaded and the
    // field is encrypted, but the oauth secret key hasn't been specified.
    //
    OAuth.openSecret = (maybeSecret, userId) => {
      if (!Package["oauth-encryption"] || !OAuthEncryption.isSealed(maybeSecret)) return maybeSecret;
      return OAuthEncryption.open(maybeSecret, userId);
    };

    // Unencrypt fields in the service data object.
    //
    OAuth.openSecrets = (serviceData, userId) => {
      const result = {};
      Object.keys(serviceData).forEach(key => result[key] = OAuth.openSecret(serviceData[key], userId));
      return result;
    };
    OAuth._addValuesToQueryParams = function () {
      let values = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      let queryParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new URLSearchParams();
      Object.entries(values).forEach(_ref => {
        let [key, value] = _ref;
        queryParams.set(key, "".concat(value));
      });
      return queryParams;
    };
    OAuth._fetch = async function (url) {
      let method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'GET';
      let _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      let {
          headers = {},
          queryParams = {},
          body
        } = _ref2,
        options = _objectWithoutProperties(_ref2, _excluded);
      const urlWithParams = new URL(url);
      OAuth._addValuesToQueryParams(queryParams, urlWithParams.searchParams);
      const requestOptions = _objectSpread(_objectSpread({
        method: method.toUpperCase(),
        headers
      }, body ? {
        body
      } : {}), options);
      return fetch(urlWithParams.toString(), requestOptions);
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"pending_credentials.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/oauth/pending_credentials.js                                                                             //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
//
// When an oauth request is made, Meteor receives oauth credentials
// in one browser tab, and temporarily persists them while that
// tab is closed, then retrieves them in the browser tab that
// initiated the credential request.
//
// _pendingCredentials is the storage mechanism used to share the
// credential between the 2 tabs
//

// Collection containing pending credentials of oauth credential requests
// Has key, credential, and createdAt fields.
OAuth._pendingCredentials = new Mongo.Collection("meteor_oauth_pendingCredentials", {
  _preventAutopublish: true
});

// TODO[FIBERS]: I Need TLA
async function init() {
  await OAuth._pendingCredentials.createIndexAsync('key', {
    unique: true
  });
  await OAuth._pendingCredentials.createIndexAsync('credentialSecret');
  await OAuth._pendingCredentials.createIndexAsync('createdAt');
}
init();

// Periodically clear old entries that were never retrieved
const _cleanStaleResults = async () => {
  // Remove credentials older than 1 minute
  const timeCutoff = new Date();
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 1);
  await OAuth._pendingCredentials.removeAsync({
    createdAt: {
      $lt: timeCutoff
    }
  });
};
const _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000);

// Stores the key and credential in the _pendingCredentials collection.
// Will throw an exception if `key` is not a string.
//
// @param key {string}
// @param credential {Object}   The credential to store
// @param credentialSecret {string} A secret that must be presented in
//   addition to the `key` to retrieve the credential
//
OAuth._storePendingCredential = async function (key, credential) {
  let credentialSecret = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  check(key, String);
  check(credentialSecret, Match.Maybe(String));
  if (credential instanceof Error) {
    credential = storableError(credential);
  } else {
    credential = OAuth.sealSecret(credential);
  }

  // We do an upsert here instead of an insert in case the user happens
  // to somehow send the same `state` parameter twice during an OAuth
  // login; we don't want a duplicate key error.
  await OAuth._pendingCredentials.upsertAsync({
    key
  }, {
    key,
    credential,
    credentialSecret,
    createdAt: new Date()
  });
};

// Retrieves and removes a credential from the _pendingCredentials collection
//
// @param key {string}
// @param credentialSecret {string}
//
OAuth._retrievePendingCredential = async function (key) {
  let credentialSecret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  check(key, String);
  const pendingCredential = await OAuth._pendingCredentials.findOneAsync({
    key,
    credentialSecret
  });
  if (pendingCredential) {
    await OAuth._pendingCredentials.removeAsync({
      _id: pendingCredential._id
    });
    if (pendingCredential.credential.error) return recreateError(pendingCredential.credential.error);else return OAuth.openSecret(pendingCredential.credential);
  } else {
    return undefined;
  }
};

// Convert an Error into an object that can be stored in mongo
// Note: A Meteor.Error is reconstructed as a Meteor.Error
// All other error classes are reconstructed as a plain Error.
// TODO: Can we do this more simply with EJSON?
const storableError = error => {
  const plainObject = {};
  Object.getOwnPropertyNames(error).forEach(key => plainObject[key] = error[key]);

  // Keep track of whether it's a Meteor.Error
  if (error instanceof Meteor.Error) {
    plainObject['meteorError'] = true;
  }
  return {
    error: plainObject
  };
};

// Create an error from the error format stored in mongo
const recreateError = errorDoc => {
  let error;
  if (errorDoc.meteorError) {
    error = new Meteor.Error();
    delete errorDoc.meteorError;
  } else {
    error = new Error();
  }
  Object.getOwnPropertyNames(errorDoc).forEach(key => error[key] = errorDoc[key]);
  return error;
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"oauth_common.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/oauth/oauth_common.js                                                                                    //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    OAuth._storageTokenPrefix = "Meteor.oauth.credentialSecret-";
    OAuth._redirectUri = (serviceName, config, params, absoluteUrlOptions) => {
      // Clone because we're going to mutate 'params'. The 'cordova' and
      // 'android' parameters are only used for picking the host of the
      // redirect URL, and not actually included in the redirect URL itself.
      let isCordova = false;
      let isAndroid = false;
      if (params) {
        params = _objectSpread({}, params);
        isCordova = params.cordova;
        isAndroid = params.android;
        delete params.cordova;
        delete params.android;
        if (Object.keys(params).length === 0) {
          params = undefined;
        }
      }
      if (Meteor.isServer && isCordova) {
        const url = Npm.require('url');
        let rootUrl = process.env.MOBILE_ROOT_URL || __meteor_runtime_config__.ROOT_URL;
        if (isAndroid) {
          // Match the replace that we do in cordova boilerplate
          // (boilerplate-generator package).
          // XXX Maybe we should put this in a separate package or something
          // that is used here and by boilerplate-generator? Or maybe
          // `Meteor.absoluteUrl` should know how to do this?
          const parsedRootUrl = url.parse(rootUrl);
          if (parsedRootUrl.hostname === "localhost") {
            parsedRootUrl.hostname = "10.0.2.2";
            delete parsedRootUrl.host;
          }
          rootUrl = url.format(parsedRootUrl);
        }
        absoluteUrlOptions = _objectSpread(_objectSpread({}, absoluteUrlOptions), {}, {
          // For Cordova clients, redirect to the special Cordova root url
          // (likely a local IP in development mode).
          rootUrl
        });
      }
      return URL._constructUrl(Meteor.absoluteUrl("_oauth/".concat(serviceName), absoluteUrlOptions), null, params);
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
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"body-parser":{"package.json":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/oauth/node_modules/body-parser/package.json                                                   //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.exports = {
  "name": "body-parser",
  "version": "1.20.3"
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"index.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// node_modules/meteor/oauth/node_modules/body-parser/index.js                                                       //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
module.useNode();
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      OAuth: OAuth,
      OAuthTest: OAuthTest
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/oauth/oauth_server.js",
    "/node_modules/meteor/oauth/pending_credentials.js",
    "/node_modules/meteor/oauth/oauth_common.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2F1dGgvb2F1dGhfc2VydmVyLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aC9wZW5kaW5nX2NyZWRlbnRpYWxzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9vYXV0aC9vYXV0aF9jb21tb24uanMiXSwibmFtZXMiOlsiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIl9vYmplY3RXaXRob3V0UHJvcGVydGllcyIsIl9leGNsdWRlZCIsImJvZHlQYXJzZXIiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIk9BdXRoIiwiT0F1dGhUZXN0IiwiUm91dGVQb2xpY3kiLCJkZWNsYXJlIiwicmVnaXN0ZXJlZFNlcnZpY2VzIiwiX3JlcXVlc3RIYW5kbGVycyIsInJlZ2lzdGVyU2VydmljZSIsIm5hbWUiLCJ2ZXJzaW9uIiwidXJscyIsImhhbmRsZU9hdXRoUmVxdWVzdCIsIkVycm9yIiwiY29uY2F0Iiwic2VydmljZU5hbWUiLCJ1bnJlZ2lzdGVyU2VydmljZSIsInJldHJpZXZlQ3JlZGVudGlhbCIsImNyZWRlbnRpYWxUb2tlbiIsImNyZWRlbnRpYWxTZWNyZXQiLCJfcmV0cmlldmVQZW5kaW5nQ3JlZGVudGlhbCIsIl9nZW5lcmF0ZVN0YXRlIiwibG9naW5TdHlsZSIsInJlZGlyZWN0VXJsIiwiQnVmZmVyIiwiZnJvbSIsIkpTT04iLCJzdHJpbmdpZnkiLCJ0b1N0cmluZyIsIl9zdGF0ZUZyb21RdWVyeSIsInF1ZXJ5Iiwic3RyaW5nIiwic3RhdGUiLCJlIiwiTG9nIiwid2FybiIsInBhcnNlIiwiX2xvZ2luU3R5bGVGcm9tUXVlcnkiLCJzdHlsZSIsImVyciIsIl9jcmVkZW50aWFsVG9rZW5Gcm9tUXVlcnkiLCJfaXNDb3Jkb3ZhRnJvbVF1ZXJ5IiwiaXNDb3Jkb3ZhIiwiX2NoZWNrUmVkaXJlY3RVcmxPcmlnaW4iLCJhcHBIb3N0IiwiTWV0ZW9yIiwiYWJzb2x1dGVVcmwiLCJhcHBIb3N0UmVwbGFjZWRMb2NhbGhvc3QiLCJ1bmRlZmluZWQiLCJyZXBsYWNlTG9jYWxob3N0Iiwic3Vic3RyIiwibGVuZ3RoIiwibWlkZGxld2FyZSIsInJlcSIsInJlcyIsIm5leHQiLCJyZXF1ZXN0RGF0YSIsIm9hdXRoU2VydmljZU5hbWUiLCJzZXJ2aWNlIiwiZW5zdXJlQ29uZmlndXJlZCIsImhhbmRsZXIiLCJtZXRob2QiLCJib2R5IiwiX3JlcXVlc3REYXRhIiwiX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwiLCJzdGFjayIsIm1lc3NhZ2UiLCJfZW5kT2ZMb2dpblJlc3BvbnNlIiwiZXJyb3IiLCJXZWJBcHAiLCJoYW5kbGVycyIsInVzZSIsImpzb24iLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJpIiwidXJsIiwiaW5kZXhPZiIsImJhcmVQYXRoIiwic3Vic3RyaW5nIiwic3BsaXRQYXRoIiwic3BsaXQiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZUFzeW5jIiwiQ29uZmlnRXJyb3IiLCJpc1NhZmUiLCJ2YWx1ZSIsInRlc3QiLCJfcmVuZGVyT2F1dGhSZXN1bHRzIiwib25seV9jcmVkZW50aWFsX3NlY3JldF9mb3JfdGVzdCIsIndyaXRlSGVhZCIsImVuZCIsImRldGFpbHMiLCJ0b2tlbiIsInNlY3JldCIsImNyZWRlbnRpYWxzIiwiZ2V0QXNzZXQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIkFzc2V0cyIsImdldFRleHRBc3luYyIsImRhdGEiLCJfZW5kT2ZQb3B1cFJlc3BvbnNlVGVtcGxhdGUiLCJfZW5kT2ZSZWRpcmVjdFJlc3BvbnNlVGVtcGxhdGUiLCJyZW5kZXJFbmRPZkxvZ2luUmVzcG9uc2UiLCJvcHRpb25zIiwiZXNjYXBlIiwicyIsInJlcGxhY2UiLCJzZXRDcmVkZW50aWFsVG9rZW4iLCJzdG9yYWdlUHJlZml4IiwiX3N0b3JhZ2VUb2tlblByZWZpeCIsInRlbXBsYXRlIiwicmVzdWx0IiwiX19tZXRlb3JfcnVudGltZV9jb25maWdfXyIsIlJPT1RfVVJMX1BBVEhfUFJFRklYIiwiX01ldGVvciRzZXR0aW5ncyIsIl9NZXRlb3Ikc2V0dGluZ3MkcGFjayIsIl9NZXRlb3Ikc2V0dGluZ3MkcGFjazIiLCJzZXR0aW5ncyIsInBhY2thZ2VzIiwib2F1dGgiLCJkaXNhYmxlQ2hlY2tSZWRpcmVjdFVybE9yaWdpbiIsIk9BdXRoRW5jcnlwdGlvbiIsIlBhY2thZ2UiLCJ1c2luZ09BdXRoRW5jcnlwdGlvbiIsImtleUlzTG9hZGVkIiwic2VhbFNlY3JldCIsInBsYWludGV4dCIsInNlYWwiLCJvcGVuU2VjcmV0IiwibWF5YmVTZWNyZXQiLCJ1c2VySWQiLCJpc1NlYWxlZCIsIm9wZW4iLCJvcGVuU2VjcmV0cyIsInNlcnZpY2VEYXRhIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJfYWRkVmFsdWVzVG9RdWVyeVBhcmFtcyIsInZhbHVlcyIsImFyZ3VtZW50cyIsInF1ZXJ5UGFyYW1zIiwiVVJMU2VhcmNoUGFyYW1zIiwiZW50cmllcyIsIl9yZWYiLCJzZXQiLCJfZmV0Y2giLCJfcmVmMiIsImhlYWRlcnMiLCJ1cmxXaXRoUGFyYW1zIiwiVVJMIiwic2VhcmNoUGFyYW1zIiwicmVxdWVzdE9wdGlvbnMiLCJ0b1VwcGVyQ2FzZSIsImZldGNoIiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiX3BlbmRpbmdDcmVkZW50aWFscyIsIk1vbmdvIiwiQ29sbGVjdGlvbiIsIl9wcmV2ZW50QXV0b3B1Ymxpc2giLCJpbml0IiwiY3JlYXRlSW5kZXhBc3luYyIsInVuaXF1ZSIsIl9jbGVhblN0YWxlUmVzdWx0cyIsInRpbWVDdXRvZmYiLCJEYXRlIiwic2V0TWludXRlcyIsImdldE1pbnV0ZXMiLCJyZW1vdmVBc3luYyIsImNyZWF0ZWRBdCIsIiRsdCIsIl9jbGVhbnVwSGFuZGxlIiwic2V0SW50ZXJ2YWwiLCJjcmVkZW50aWFsIiwiY2hlY2siLCJTdHJpbmciLCJNYXRjaCIsIk1heWJlIiwic3RvcmFibGVFcnJvciIsInVwc2VydEFzeW5jIiwicGVuZGluZ0NyZWRlbnRpYWwiLCJfaWQiLCJyZWNyZWF0ZUVycm9yIiwicGxhaW5PYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZXJyb3JEb2MiLCJtZXRlb3JFcnJvciIsIl9yZWRpcmVjdFVyaSIsInBhcmFtcyIsImFic29sdXRlVXJsT3B0aW9ucyIsImlzQW5kcm9pZCIsImNvcmRvdmEiLCJhbmRyb2lkIiwiaXNTZXJ2ZXIiLCJOcG0iLCJyZXF1aXJlIiwicm9vdFVybCIsInByb2Nlc3MiLCJlbnYiLCJNT0JJTEVfUk9PVF9VUkwiLCJST09UX1VSTCIsInBhcnNlZFJvb3RVcmwiLCJob3N0bmFtZSIsImhvc3QiLCJmb3JtYXQiLCJfY29uc3RydWN0VXJsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxhQUFhO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJQyx3QkFBd0I7SUFBQ0osTUFBTSxDQUFDQyxJQUFJLENBQUMsZ0RBQWdELEVBQUM7TUFBQ0MsT0FBT0EsQ0FBQ0MsQ0FBQyxFQUFDO1FBQUNDLHdCQUF3QixHQUFDRCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsTUFBQUUsU0FBQTtJQUE1TyxJQUFJQyxVQUFVO0lBQUNOLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGFBQWEsRUFBQztNQUFDQyxPQUFPQSxDQUFDQyxDQUFDLEVBQUM7UUFBQ0csVUFBVSxHQUFDSCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUksb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFbklDLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDVkMsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUVkQyxXQUFXLENBQUNDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDO0lBRTFDLE1BQU1DLGtCQUFrQixHQUFHLENBQUMsQ0FBQzs7SUFFN0I7SUFDQTtJQUNBO0lBQ0FKLEtBQUssQ0FBQ0ssZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDOztJQUczQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0FMLEtBQUssQ0FBQ00sZUFBZSxHQUFHLENBQUNDLElBQUksRUFBRUMsT0FBTyxFQUFFQyxJQUFJLEVBQUVDLGtCQUFrQixLQUFLO01BQ25FLElBQUlOLGtCQUFrQixDQUFDRyxJQUFJLENBQUMsRUFDMUIsTUFBTSxJQUFJSSxLQUFLLDJCQUFBQyxNQUFBLENBQTJCTCxJQUFJLG1CQUFnQixDQUFDO01BRWpFSCxrQkFBa0IsQ0FBQ0csSUFBSSxDQUFDLEdBQUc7UUFDekJNLFdBQVcsRUFBRU4sSUFBSTtRQUNqQkMsT0FBTztRQUNQQyxJQUFJO1FBQ0pDO01BQ0YsQ0FBQztJQUNILENBQUM7O0lBRUQ7SUFDQVQsU0FBUyxDQUFDYSxpQkFBaUIsR0FBR1AsSUFBSSxJQUFJO01BQ3BDLE9BQU9ILGtCQUFrQixDQUFDRyxJQUFJLENBQUM7SUFDakMsQ0FBQztJQUdEUCxLQUFLLENBQUNlLGtCQUFrQixHQUFHLENBQUNDLGVBQWUsRUFBRUMsZ0JBQWdCLEtBQzNEakIsS0FBSyxDQUFDa0IsMEJBQTBCLENBQUNGLGVBQWUsRUFBRUMsZ0JBQWdCLENBQUM7O0lBR3JFO0lBQ0E7SUFDQTtJQUNBakIsS0FBSyxDQUFDbUIsY0FBYyxHQUFHLENBQUNDLFVBQVUsRUFBRUosZUFBZSxFQUFFSyxXQUFXLEtBQUs7TUFDbkUsT0FBT0MsTUFBTSxDQUFDQyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsU0FBUyxDQUFDO1FBQ2hDTCxVQUFVLEVBQUVBLFVBQVU7UUFDdEJKLGVBQWUsRUFBRUEsZUFBZTtRQUNoQ0ssV0FBVyxFQUFFQTtNQUFXLENBQUMsQ0FBQyxDQUFDLENBQUNLLFFBQVEsQ0FBQyxRQUFRLENBQUM7SUFDbEQsQ0FBQztJQUVEMUIsS0FBSyxDQUFDMkIsZUFBZSxHQUFHQyxLQUFLLElBQUk7TUFDL0IsSUFBSUMsTUFBTTtNQUNWLElBQUk7UUFDRkEsTUFBTSxHQUFHUCxNQUFNLENBQUNDLElBQUksQ0FBQ0ssS0FBSyxDQUFDRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUNKLFFBQVEsQ0FBQyxRQUFRLENBQUM7TUFDaEUsQ0FBQyxDQUFDLE9BQU9LLENBQUMsRUFBRTtRQUNWQyxHQUFHLENBQUNDLElBQUksb0RBQUFyQixNQUFBLENBQW9EZ0IsS0FBSyxDQUFDRSxLQUFLLENBQUUsQ0FBQztRQUMxRSxNQUFNQyxDQUFDO01BQ1Q7TUFFQSxJQUFJO1FBQ0YsT0FBT1AsSUFBSSxDQUFDVSxLQUFLLENBQUNMLE1BQU0sQ0FBQztNQUMzQixDQUFDLENBQUMsT0FBT0UsQ0FBQyxFQUFFO1FBQ1ZDLEdBQUcsQ0FBQ0MsSUFBSSw0Q0FBQXJCLE1BQUEsQ0FBNENpQixNQUFNLENBQUUsQ0FBQztRQUM3RCxNQUFNRSxDQUFDO01BQ1Q7SUFDRixDQUFDO0lBRUQvQixLQUFLLENBQUNtQyxvQkFBb0IsR0FBR1AsS0FBSyxJQUFJO01BQ3BDLElBQUlRLEtBQUs7TUFDVDtNQUNBO01BQ0E7TUFDQSxJQUFJO1FBQ0ZBLEtBQUssR0FBR3BDLEtBQUssQ0FBQzJCLGVBQWUsQ0FBQ0MsS0FBSyxDQUFDLENBQUNSLFVBQVU7TUFDakQsQ0FBQyxDQUFDLE9BQU9pQixHQUFHLEVBQUU7UUFDWkQsS0FBSyxHQUFHLE9BQU87TUFDakI7TUFDQSxJQUFJQSxLQUFLLEtBQUssT0FBTyxJQUFJQSxLQUFLLEtBQUssVUFBVSxFQUFFO1FBQzdDLE1BQU0sSUFBSXpCLEtBQUssOEJBQUFDLE1BQUEsQ0FBOEJ3QixLQUFLLENBQUUsQ0FBQztNQUN2RDtNQUNBLE9BQU9BLEtBQUs7SUFDZCxDQUFDO0lBRURwQyxLQUFLLENBQUNzQyx5QkFBeUIsR0FBR1YsS0FBSyxJQUFJO01BQ3pDLElBQUlFLEtBQUs7TUFDVDtNQUNBO01BQ0E7TUFDQTtNQUNBLElBQUk7UUFDRkEsS0FBSyxHQUFHOUIsS0FBSyxDQUFDMkIsZUFBZSxDQUFDQyxLQUFLLENBQUM7TUFDdEMsQ0FBQyxDQUFDLE9BQU9TLEdBQUcsRUFBRTtRQUNaLE9BQU9ULEtBQUssQ0FBQ0UsS0FBSztNQUNwQjtNQUNBLE9BQU9BLEtBQUssQ0FBQ2QsZUFBZTtJQUM5QixDQUFDO0lBRURoQixLQUFLLENBQUN1QyxtQkFBbUIsR0FBR1gsS0FBSyxJQUFJO01BQ25DLElBQUk7UUFDRixPQUFPLENBQUMsQ0FBRTVCLEtBQUssQ0FBQzJCLGVBQWUsQ0FBQ0MsS0FBSyxDQUFDLENBQUNZLFNBQVM7TUFDbEQsQ0FBQyxDQUFDLE9BQU9ILEdBQUcsRUFBRTtRQUNaO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsT0FBTyxLQUFLO01BQ2Q7SUFDRixDQUFDOztJQUVEO0lBQ0E7SUFDQTtJQUNBO0lBQ0FyQyxLQUFLLENBQUN5Qyx1QkFBdUIsR0FBR3BCLFdBQVcsSUFBSTtNQUM3QyxNQUFNcUIsT0FBTyxHQUFHQyxNQUFNLENBQUNDLFdBQVcsQ0FBQyxDQUFDO01BQ3BDLE1BQU1DLHdCQUF3QixHQUFHRixNQUFNLENBQUNDLFdBQVcsQ0FBQ0UsU0FBUyxFQUFFO1FBQzdEQyxnQkFBZ0IsRUFBRTtNQUNwQixDQUFDLENBQUM7TUFDRixPQUNFMUIsV0FBVyxDQUFDMkIsTUFBTSxDQUFDLENBQUMsRUFBRU4sT0FBTyxDQUFDTyxNQUFNLENBQUMsS0FBS1AsT0FBTyxJQUNqRHJCLFdBQVcsQ0FBQzJCLE1BQU0sQ0FBQyxDQUFDLEVBQUVILHdCQUF3QixDQUFDSSxNQUFNLENBQUMsS0FBS0osd0JBQXdCO0lBRXZGLENBQUM7SUFFRCxNQUFNSyxVQUFVLEdBQUcsTUFBQUEsQ0FBT0MsR0FBRyxFQUFFQyxHQUFHLEVBQUVDLElBQUksS0FBSztNQUMzQyxJQUFJQyxXQUFXOztNQUVmO01BQ0E7TUFDQSxJQUFJO1FBQ0YsTUFBTXpDLFdBQVcsR0FBRzBDLGdCQUFnQixDQUFDSixHQUFHLENBQUM7UUFDekMsSUFBSSxDQUFDdEMsV0FBVyxFQUFFO1VBQ2hCO1VBQ0F3QyxJQUFJLENBQUMsQ0FBQztVQUNOO1FBQ0Y7UUFFQSxNQUFNRyxPQUFPLEdBQUdwRCxrQkFBa0IsQ0FBQ1MsV0FBVyxDQUFDOztRQUUvQztRQUNBLElBQUksQ0FBQzJDLE9BQU8sRUFDVixNQUFNLElBQUk3QyxLQUFLLDZCQUFBQyxNQUFBLENBQTZCQyxXQUFXLENBQUUsQ0FBQzs7UUFFNUQ7UUFDQSxNQUFNNEMsZ0JBQWdCLENBQUM1QyxXQUFXLENBQUM7UUFFbkMsTUFBTTZDLE9BQU8sR0FBRzFELEtBQUssQ0FBQ0ssZ0JBQWdCLENBQUNtRCxPQUFPLENBQUNoRCxPQUFPLENBQUM7UUFDdkQsSUFBSSxDQUFDa0QsT0FBTyxFQUNWLE1BQU0sSUFBSS9DLEtBQUssNkJBQUFDLE1BQUEsQ0FBNkI0QyxPQUFPLENBQUNoRCxPQUFPLENBQUUsQ0FBQztRQUVoRSxJQUFJMkMsR0FBRyxDQUFDUSxNQUFNLEtBQUssS0FBSyxFQUFFO1VBQ3hCTCxXQUFXLEdBQUdILEdBQUcsQ0FBQ3ZCLEtBQUs7UUFDekIsQ0FBQyxNQUFNO1VBQ0wwQixXQUFXLEdBQUdILEdBQUcsQ0FBQ1MsSUFBSTtRQUN4QjtRQUNBLE1BQU1GLE9BQU8sQ0FBQ0YsT0FBTyxFQUFFRixXQUFXLEVBQUVGLEdBQUcsQ0FBQztNQUMxQyxDQUFDLENBQUMsT0FBT2YsR0FBRyxFQUFFO1FBQUEsSUFBQXdCLFlBQUE7UUFDWjtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLElBQUksQ0FBQUEsWUFBQSxHQUFBUCxXQUFXLGNBQUFPLFlBQUEsZUFBWEEsWUFBQSxDQUFhL0IsS0FBSyxJQUFJTyxHQUFHLFlBQVkxQixLQUFLLEVBQUU7VUFDOUMsSUFBSTtZQUFFO1lBQ0osTUFBTVgsS0FBSyxDQUFDOEQsdUJBQXVCLENBQUM5RCxLQUFLLENBQUNzQyx5QkFBeUIsQ0FBQ2dCLFdBQVcsQ0FBQyxFQUFFakIsR0FBRyxDQUFDO1VBQ3hGLENBQUMsQ0FBQyxPQUFPQSxHQUFHLEVBQUU7WUFDWjtZQUNBO1lBQ0FMLEdBQUcsQ0FBQ0MsSUFBSSxDQUFDLDZEQUE2RCxHQUM3REksR0FBRyxDQUFDMEIsS0FBSyxJQUFJMUIsR0FBRyxDQUFDMkIsT0FBTyxDQUFDO1VBQ3BDO1FBQ0Y7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQSxJQUFJO1VBQ0YsTUFBTWhFLEtBQUssQ0FBQ2lFLG1CQUFtQixDQUFDYixHQUFHLEVBQUU7WUFDbkN4QixLQUFLLEVBQUUwQixXQUFXO1lBQ2xCbEMsVUFBVSxFQUFFcEIsS0FBSyxDQUFDbUMsb0JBQW9CLENBQUNtQixXQUFXLENBQUM7WUFDbkRZLEtBQUssRUFBRTdCO1VBQ1QsQ0FBQyxDQUFDO1FBQ0osQ0FBQyxDQUFDLE9BQU9BLEdBQUcsRUFBRTtVQUNaTCxHQUFHLENBQUNDLElBQUksQ0FBQywwQ0FBMEMsSUFDekNJLEdBQUcsS0FBS0EsR0FBRyxDQUFDMEIsS0FBSyxJQUFJMUIsR0FBRyxDQUFDMkIsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMvQztNQUNGO0lBQ0YsQ0FBQzs7SUFFRDtJQUNBRyxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsR0FBRyxDQUFDLFNBQVMsRUFBRXZFLFVBQVUsQ0FBQ3dFLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakRILE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxHQUFHLENBQUMsU0FBUyxFQUFFdkUsVUFBVSxDQUFDeUUsVUFBVSxDQUFDO01BQUVDLFFBQVEsRUFBRTtJQUFNLENBQUMsQ0FBQyxDQUFDO0lBQzFFTCxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsR0FBRyxDQUFDbkIsVUFBVSxDQUFDO0lBRS9CakQsU0FBUyxDQUFDaUQsVUFBVSxHQUFHQSxVQUFVO0lBRWpDakQsU0FBUyxDQUFDRyxrQkFBa0IsR0FBR0Esa0JBQWtCOztJQUVqRDtJQUNBO0lBQ0E7SUFDQTtJQUNBLE1BQU1tRCxnQkFBZ0IsR0FBR0osR0FBRyxJQUFJO01BQzlCO01BQ0EsTUFBTXNCLENBQUMsR0FBR3RCLEdBQUcsQ0FBQ3VCLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQztNQUM5QixJQUFJQyxRQUFRO01BQ1osSUFBSUgsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUNWRyxRQUFRLEdBQUd6QixHQUFHLENBQUN1QixHQUFHLENBQUMsS0FFbkJFLFFBQVEsR0FBR3pCLEdBQUcsQ0FBQ3VCLEdBQUcsQ0FBQ0csU0FBUyxDQUFDLENBQUMsRUFBRUosQ0FBQyxDQUFDO01BQ3BDLE1BQU1LLFNBQVMsR0FBR0YsUUFBUSxDQUFDRyxLQUFLLENBQUMsR0FBRyxDQUFDOztNQUVyQztNQUNBO01BQ0EsSUFBSUQsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFDM0IsT0FBTyxJQUFJOztNQUViO01BQ0EsTUFBTWpFLFdBQVcsR0FBR2lFLFNBQVMsQ0FBQyxDQUFDLENBQUM7TUFDaEMsT0FBT2pFLFdBQVc7SUFDcEIsQ0FBQzs7SUFFRDtJQUNBLE1BQU00QyxnQkFBZ0IsR0FDcEIsTUFBTTVDLFdBQVcsSUFBSTtNQUNuQixNQUFNbUUsTUFBTSxHQUNWLE1BQU1DLG9CQUFvQixDQUFDQyxjQUFjLENBQUNDLFlBQVksQ0FBQztRQUFFM0IsT0FBTyxFQUFFM0M7TUFBWSxDQUFDLENBQUM7TUFDbEYsSUFBSSxDQUFDbUUsTUFBTSxFQUFFO1FBQ1gsTUFBTSxJQUFJQyxvQkFBb0IsQ0FBQ0csV0FBVyxDQUFDLENBQUM7TUFDOUM7SUFDRixDQUFDO0lBRUgsTUFBTUMsTUFBTSxHQUFHQyxLQUFLLElBQUk7TUFDdEI7TUFDQTtNQUNBLE9BQU8sT0FBT0EsS0FBSyxLQUFLLFFBQVEsSUFDOUIsbUJBQW1CLENBQUNDLElBQUksQ0FBQ0QsS0FBSyxDQUFDO0lBQ25DLENBQUM7O0lBRUQ7SUFDQXRGLEtBQUssQ0FBQ3dGLG1CQUFtQixHQUFHLE9BQU9wQyxHQUFHLEVBQUV4QixLQUFLLEVBQUVYLGdCQUFnQixLQUFLO01BQ2xFO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7O01BRUEsSUFBSVcsS0FBSyxDQUFDNkQsK0JBQStCLEVBQUU7UUFDekNyQyxHQUFHLENBQUNzQyxTQUFTLENBQUMsR0FBRyxFQUFFO1VBQUMsY0FBYyxFQUFFO1FBQVcsQ0FBQyxDQUFDO1FBQ2pEdEMsR0FBRyxDQUFDdUMsR0FBRyxDQUFDMUUsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDO01BQ3BDLENBQUMsTUFBTTtRQUNMLE1BQU0yRSxPQUFPLEdBQUc7VUFDZGhFLEtBQUs7VUFDTFIsVUFBVSxFQUFFcEIsS0FBSyxDQUFDbUMsb0JBQW9CLENBQUNQLEtBQUs7UUFDOUMsQ0FBQztRQUNELElBQUlBLEtBQUssQ0FBQ3NDLEtBQUssRUFBRTtVQUNmMEIsT0FBTyxDQUFDMUIsS0FBSyxHQUFHdEMsS0FBSyxDQUFDc0MsS0FBSztRQUM3QixDQUFDLE1BQU07VUFDTCxNQUFNMkIsS0FBSyxHQUFHN0YsS0FBSyxDQUFDc0MseUJBQXlCLENBQUNWLEtBQUssQ0FBQztVQUNwRCxNQUFNa0UsTUFBTSxHQUFHN0UsZ0JBQWdCO1VBQy9CLElBQUk0RSxLQUFLLElBQUlDLE1BQU0sSUFDZlQsTUFBTSxDQUFDUSxLQUFLLENBQUMsSUFBSVIsTUFBTSxDQUFDUyxNQUFNLENBQUMsRUFBRTtZQUNuQ0YsT0FBTyxDQUFDRyxXQUFXLEdBQUc7Y0FBRUYsS0FBSyxFQUFFQSxLQUFLO2NBQUVDLE1BQU0sRUFBRUE7WUFBTSxDQUFDO1VBQ3ZELENBQUMsTUFBTTtZQUNMRixPQUFPLENBQUMxQixLQUFLLEdBQUcsb0NBQW9DO1VBQ3REO1FBQ0Y7UUFFQSxNQUFNbEUsS0FBSyxDQUFDaUUsbUJBQW1CLENBQUNiLEdBQUcsRUFBRXdDLE9BQU8sQ0FBQztNQUMvQztJQUNGLENBQUM7SUFFRCxNQUFNSSxRQUFRLEdBQUl6RixJQUFJLElBQUs7TUFDekIsT0FBTyxJQUFJMEYsT0FBTyxDQUFDLENBQUNDLE9BQU8sRUFBRUMsTUFBTSxLQUFLQyxNQUFNLENBQUNDLFlBQVksSUFBQXpGLE1BQUEsQ0FDdERMLElBQUksWUFDUCxDQUFDOEIsR0FBRyxFQUFFaUUsSUFBSSxLQUFLakUsR0FBRyxHQUFHOEQsTUFBTSxDQUFDOUQsR0FBRyxDQUFDLEdBQUc2RCxPQUFPLENBQUNJLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNEO0lBQ0E7SUFDQTtJQUNBdEcsS0FBSyxDQUFDdUcsMkJBQTJCLEdBQy9CLFlBQVksTUFBTVAsUUFBUSxDQUFDLHVCQUF1QixDQUFDO0lBRXJEaEcsS0FBSyxDQUFDd0csOEJBQThCLEdBQ2xDLFlBQVksTUFBTVIsUUFBUSxDQUFDLDBCQUEwQixDQUFDOztJQUV4RDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0EsTUFBTVMsd0JBQXdCLEdBQUcsTUFBTUMsT0FBTyxJQUFJO01BQ2hEO01BQ0E7TUFDQTtNQUNBOztNQUVBLE1BQU1DLE1BQU0sR0FBR0MsQ0FBQyxJQUFJO1FBQ2xCLElBQUlBLENBQUMsRUFBRTtVQUNMLE9BQU9BLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FDN0JBLE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQ3JCQSxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUNyQkEsT0FBTyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FDeEJBLE9BQU8sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQ3hCQSxPQUFPLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQztRQUM1QixDQUFDLE1BQU07VUFDTCxPQUFPRCxDQUFDO1FBQ1Y7TUFDRixDQUFDOztNQUVEO01BQ0E7TUFDQSxNQUFNNUIsTUFBTSxHQUFHO1FBQ2I4QixrQkFBa0IsRUFBRSxDQUFDLENBQUVKLE9BQU8sQ0FBQ0ksa0JBQWtCO1FBQ2pEOUYsZUFBZSxFQUFFMkYsTUFBTSxDQUFDRCxPQUFPLENBQUMxRixlQUFlLENBQUM7UUFDaERDLGdCQUFnQixFQUFFMEYsTUFBTSxDQUFDRCxPQUFPLENBQUN6RixnQkFBZ0IsQ0FBQztRQUNsRDhGLGFBQWEsRUFBRUosTUFBTSxDQUFDM0csS0FBSyxDQUFDZ0gsbUJBQW1CLENBQUM7UUFDaEQzRixXQUFXLEVBQUVzRixNQUFNLENBQUNELE9BQU8sQ0FBQ3JGLFdBQVcsQ0FBQztRQUN4Q21CLFNBQVMsRUFBRSxDQUFDLENBQUVrRSxPQUFPLENBQUNsRTtNQUN4QixDQUFDO01BRUQsSUFBSXlFLFFBQVE7TUFDWixJQUFJUCxPQUFPLENBQUN0RixVQUFVLEtBQUssT0FBTyxFQUFFO1FBQ2xDNkYsUUFBUSxHQUFHLE1BQU1qSCxLQUFLLENBQUN1RywyQkFBMkIsQ0FBQyxDQUFDO01BQ3RELENBQUMsTUFBTSxJQUFJRyxPQUFPLENBQUN0RixVQUFVLEtBQUssVUFBVSxFQUFFO1FBQzVDNkYsUUFBUSxHQUFHLE1BQU1qSCxLQUFLLENBQUN3Ryw4QkFBOEIsQ0FBQyxDQUFDO01BQ3pELENBQUMsTUFBTTtRQUNMLE1BQU0sSUFBSTdGLEtBQUssd0JBQUFDLE1BQUEsQ0FBd0I4RixPQUFPLENBQUN0RixVQUFVLENBQUUsQ0FBQztNQUM5RDtNQUNBLE1BQU04RixNQUFNLEdBQUdELFFBQVEsQ0FBQ0osT0FBTyxDQUFDLFlBQVksRUFBRXJGLElBQUksQ0FBQ0MsU0FBUyxDQUFDdUQsTUFBTSxDQUFDLENBQUMsQ0FDbEU2QixPQUFPLENBQ04sMEJBQTBCLEVBQUVNLHlCQUF5QixDQUFDQyxvQkFDeEQsQ0FBQztNQUVILDJCQUFBeEcsTUFBQSxDQUEyQnNHLE1BQU07SUFDbkMsQ0FBQzs7SUFFRDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBbEgsS0FBSyxDQUFDaUUsbUJBQW1CLEdBQUcsT0FBT2IsR0FBRyxFQUFFd0MsT0FBTyxLQUFLO01BQ2xEeEMsR0FBRyxDQUFDc0MsU0FBUyxDQUFDLEdBQUcsRUFBRTtRQUFDLGNBQWMsRUFBRTtNQUFXLENBQUMsQ0FBQztNQUVqRCxJQUFJckUsV0FBVztNQUNmLElBQUl1RSxPQUFPLENBQUN4RSxVQUFVLEtBQUssVUFBVSxFQUFFO1FBQUEsSUFBQWlHLGdCQUFBLEVBQUFDLHFCQUFBLEVBQUFDLHNCQUFBO1FBQ3JDbEcsV0FBVyxHQUFHckIsS0FBSyxDQUFDMkIsZUFBZSxDQUFDaUUsT0FBTyxDQUFDaEUsS0FBSyxDQUFDLENBQUNQLFdBQVc7UUFDOUQsTUFBTXFCLE9BQU8sR0FBR0MsTUFBTSxDQUFDQyxXQUFXLENBQUMsQ0FBQztRQUNwQyxJQUNFLEdBQUF5RSxnQkFBQSxHQUFDMUUsTUFBTSxDQUFDNkUsUUFBUSxjQUFBSCxnQkFBQSxnQkFBQUMscUJBQUEsR0FBZkQsZ0JBQUEsQ0FBaUJJLFFBQVEsY0FBQUgscUJBQUEsZ0JBQUFDLHNCQUFBLEdBQXpCRCxxQkFBQSxDQUEyQkksS0FBSyxjQUFBSCxzQkFBQSxlQUFoQ0Esc0JBQUEsQ0FBa0NJLDZCQUE2QixLQUNoRTNILEtBQUssQ0FBQ3lDLHVCQUF1QixDQUFDcEIsV0FBVyxDQUFDLEVBQUU7VUFDNUN1RSxPQUFPLENBQUMxQixLQUFLLEdBQUcsZ0JBQUF0RCxNQUFBLENBQWdCUyxXQUFXLDZDQUFBVCxNQUFBLENBQ0E4QixPQUFPLE1BQUc7VUFDckRyQixXQUFXLEdBQUdxQixPQUFPO1FBQ3ZCO01BQ0Y7TUFFQSxNQUFNRixTQUFTLEdBQUd4QyxLQUFLLENBQUN1QyxtQkFBbUIsQ0FBQ3FELE9BQU8sQ0FBQ2hFLEtBQUssQ0FBQztNQUUxRCxJQUFJZ0UsT0FBTyxDQUFDMUIsS0FBSyxFQUFFO1FBQ2pCbEMsR0FBRyxDQUFDQyxJQUFJLENBQUMseUJBQXlCLElBQ3hCMkQsT0FBTyxDQUFDMUIsS0FBSyxZQUFZdkQsS0FBSyxHQUM5QmlGLE9BQU8sQ0FBQzFCLEtBQUssQ0FBQ0YsT0FBTyxHQUFHNEIsT0FBTyxDQUFDMUIsS0FBSyxDQUFDLENBQUM7UUFDakRkLEdBQUcsQ0FBQ3VDLEdBQUcsQ0FBQyxNQUFNYyx3QkFBd0IsQ0FBQztVQUNyQ3JGLFVBQVUsRUFBRXdFLE9BQU8sQ0FBQ3hFLFVBQVU7VUFDOUIwRixrQkFBa0IsRUFBRSxLQUFLO1VBQ3pCekYsV0FBVztVQUNYbUI7UUFDRixDQUFDLENBQUMsRUFBRSxPQUFPLENBQUM7UUFDWjtNQUNGOztNQUVBO01BQ0E7TUFDQTtNQUNBWSxHQUFHLENBQUN1QyxHQUFHLENBQUMsTUFBTWMsd0JBQXdCLENBQUM7UUFDckNyRixVQUFVLEVBQUV3RSxPQUFPLENBQUN4RSxVQUFVO1FBQzlCMEYsa0JBQWtCLEVBQUUsSUFBSTtRQUN4QjlGLGVBQWUsRUFBRTRFLE9BQU8sQ0FBQ0csV0FBVyxDQUFDRixLQUFLO1FBQzFDNUUsZ0JBQWdCLEVBQUUyRSxPQUFPLENBQUNHLFdBQVcsQ0FBQ0QsTUFBTTtRQUM1Q3pFLFdBQVc7UUFDWG1CO01BQ0YsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDO0lBQ2QsQ0FBQztJQUdELE1BQU1vRixlQUFlLEdBQUdDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJQSxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQ0QsZUFBZTtJQUVsRyxNQUFNRSxvQkFBb0IsR0FBR0EsQ0FBQSxLQUMzQkYsZUFBZSxJQUFJQSxlQUFlLENBQUNHLFdBQVcsQ0FBQyxDQUFDOztJQUVsRDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBL0gsS0FBSyxDQUFDZ0ksVUFBVSxHQUFHQyxTQUFTLElBQUk7TUFDOUIsSUFBSUgsb0JBQW9CLENBQUMsQ0FBQyxFQUN4QixPQUFPRixlQUFlLENBQUNNLElBQUksQ0FBQ0QsU0FBUyxDQUFDLENBQUMsS0FFdkMsT0FBT0EsU0FBUztJQUNwQixDQUFDOztJQUVEO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBakksS0FBSyxDQUFDbUksVUFBVSxHQUFHLENBQUNDLFdBQVcsRUFBRUMsTUFBTSxLQUFLO01BQzFDLElBQUksQ0FBQ1IsT0FBTyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQ0QsZUFBZSxDQUFDVSxRQUFRLENBQUNGLFdBQVcsQ0FBQyxFQUN4RSxPQUFPQSxXQUFXO01BRXBCLE9BQU9SLGVBQWUsQ0FBQ1csSUFBSSxDQUFDSCxXQUFXLEVBQUVDLE1BQU0sQ0FBQztJQUNsRCxDQUFDOztJQUVEO0lBQ0E7SUFDQXJJLEtBQUssQ0FBQ3dJLFdBQVcsR0FBRyxDQUFDQyxXQUFXLEVBQUVKLE1BQU0sS0FBSztNQUMzQyxNQUFNbkIsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUNqQndCLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDRixXQUFXLENBQUMsQ0FBQ0csT0FBTyxDQUFDQyxHQUFHLElBQ2xDM0IsTUFBTSxDQUFDMkIsR0FBRyxDQUFDLEdBQUc3SSxLQUFLLENBQUNtSSxVQUFVLENBQUNNLFdBQVcsQ0FBQ0ksR0FBRyxDQUFDLEVBQUVSLE1BQU0sQ0FDekQsQ0FBQztNQUNELE9BQU9uQixNQUFNO0lBQ2YsQ0FBQztJQUVEbEgsS0FBSyxDQUFDOEksdUJBQXVCLEdBQUcsWUFHM0I7TUFBQSxJQUZIQyxNQUFNLEdBQUFDLFNBQUEsQ0FBQS9GLE1BQUEsUUFBQStGLFNBQUEsUUFBQWxHLFNBQUEsR0FBQWtHLFNBQUEsTUFBRyxDQUFDLENBQUM7TUFBQSxJQUNYQyxXQUFXLEdBQUFELFNBQUEsQ0FBQS9GLE1BQUEsUUFBQStGLFNBQUEsUUFBQWxHLFNBQUEsR0FBQWtHLFNBQUEsTUFBRyxJQUFJRSxlQUFlLENBQUMsQ0FBQztNQUVuQ1IsTUFBTSxDQUFDUyxPQUFPLENBQUNKLE1BQU0sQ0FBQyxDQUFDSCxPQUFPLENBQUNRLElBQUEsSUFBa0I7UUFBQSxJQUFqQixDQUFDUCxHQUFHLEVBQUV2RCxLQUFLLENBQUMsR0FBQThELElBQUE7UUFDMUNILFdBQVcsQ0FBQ0ksR0FBRyxDQUFDUixHQUFHLEtBQUFqSSxNQUFBLENBQUswRSxLQUFLLENBQUUsQ0FBQztNQUNsQyxDQUFDLENBQUM7TUFDRixPQUFPMkQsV0FBVztJQUNwQixDQUFDO0lBRURqSixLQUFLLENBQUNzSixNQUFNLEdBQUcsZ0JBQ2I1RSxHQUFHLEVBR0E7TUFBQSxJQUZIZixNQUFNLEdBQUFxRixTQUFBLENBQUEvRixNQUFBLFFBQUErRixTQUFBLFFBQUFsRyxTQUFBLEdBQUFrRyxTQUFBLE1BQUcsS0FBSztNQUFBLElBQUFPLEtBQUEsR0FBQVAsU0FBQSxDQUFBL0YsTUFBQSxRQUFBK0YsU0FBQSxRQUFBbEcsU0FBQSxHQUFBa0csU0FBQSxNQUN5QyxDQUFDLENBQUM7TUFBQSxJQUF6RDtVQUFFUSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1VBQUVQLFdBQVcsR0FBRyxDQUFDLENBQUM7VUFBRXJGO1FBQWlCLENBQUMsR0FBQTJGLEtBQUE7UUFBVDdDLE9BQU8sR0FBQTlHLHdCQUFBLENBQUEySixLQUFBLEVBQUExSixTQUFBO01BRWxELE1BQU00SixhQUFhLEdBQUcsSUFBSUMsR0FBRyxDQUFDaEYsR0FBRyxDQUFDO01BRWxDMUUsS0FBSyxDQUFDOEksdUJBQXVCLENBQUNHLFdBQVcsRUFBRVEsYUFBYSxDQUFDRSxZQUFZLENBQUM7TUFFdEUsTUFBTUMsY0FBYyxHQUFBckssYUFBQSxDQUFBQSxhQUFBO1FBQ2xCb0UsTUFBTSxFQUFFQSxNQUFNLENBQUNrRyxXQUFXLENBQUMsQ0FBQztRQUM1Qkw7TUFBTyxHQUNINUYsSUFBSSxHQUFHO1FBQUVBO01BQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUNyQjhDLE9BQU8sQ0FDWDtNQUNELE9BQU9vRCxLQUFLLENBQUNMLGFBQWEsQ0FBQy9ILFFBQVEsQ0FBQyxDQUFDLEVBQUVrSSxjQUFjLENBQUM7SUFDeEQsQ0FBQztJQUFDRyxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHOzs7Ozs7Ozs7OztBQzlmRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBR0E7QUFDQTtBQUNBbEssS0FBSyxDQUFDbUssbUJBQW1CLEdBQUcsSUFBSUMsS0FBSyxDQUFDQyxVQUFVLENBQzlDLGlDQUFpQyxFQUFFO0VBQ2pDQyxtQkFBbUIsRUFBRTtBQUN2QixDQUFDLENBQUM7O0FBRUo7QUFDQSxlQUFlQyxJQUFJQSxDQUFBLEVBQUc7RUFDcEIsTUFBTXZLLEtBQUssQ0FBQ21LLG1CQUFtQixDQUFDSyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUU7SUFBRUMsTUFBTSxFQUFFO0VBQUssQ0FBQyxDQUFDO0VBQ3pFLE1BQU16SyxLQUFLLENBQUNtSyxtQkFBbUIsQ0FBQ0ssZ0JBQWdCLENBQUMsa0JBQWtCLENBQUM7RUFDcEUsTUFBTXhLLEtBQUssQ0FBQ21LLG1CQUFtQixDQUFDSyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUM7QUFDL0Q7QUFDQUQsSUFBSSxDQUFDLENBQUM7O0FBSU47QUFDQSxNQUFNRyxrQkFBa0IsR0FBRyxNQUFBQSxDQUFBLEtBQVk7RUFDckM7RUFDQSxNQUFNQyxVQUFVLEdBQUcsSUFBSUMsSUFBSSxDQUFDLENBQUM7RUFDN0JELFVBQVUsQ0FBQ0UsVUFBVSxDQUFDRixVQUFVLENBQUNHLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ2xELE1BQU05SyxLQUFLLENBQUNtSyxtQkFBbUIsQ0FBQ1ksV0FBVyxDQUFDO0lBQUVDLFNBQVMsRUFBRTtNQUFFQyxHQUFHLEVBQUVOO0lBQVc7RUFBRSxDQUFDLENBQUM7QUFDakYsQ0FBQztBQUNELE1BQU1PLGNBQWMsR0FBR3ZJLE1BQU0sQ0FBQ3dJLFdBQVcsQ0FBQ1Qsa0JBQWtCLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQzs7QUFHeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBMUssS0FBSyxDQUFDOEQsdUJBQXVCLEdBQzNCLGdCQUFPK0UsR0FBRyxFQUFFdUMsVUFBVSxFQUE4QjtFQUFBLElBQTVCbkssZ0JBQWdCLEdBQUErSCxTQUFBLENBQUEvRixNQUFBLFFBQUErRixTQUFBLFFBQUFsRyxTQUFBLEdBQUFrRyxTQUFBLE1BQUcsSUFBSTtFQUM3Q3FDLEtBQUssQ0FBQ3hDLEdBQUcsRUFBRXlDLE1BQU0sQ0FBQztFQUNsQkQsS0FBSyxDQUFDcEssZ0JBQWdCLEVBQUVzSyxLQUFLLENBQUNDLEtBQUssQ0FBQ0YsTUFBTSxDQUFDLENBQUM7RUFFNUMsSUFBSUYsVUFBVSxZQUFZekssS0FBSyxFQUFFO0lBQy9CeUssVUFBVSxHQUFHSyxhQUFhLENBQUNMLFVBQVUsQ0FBQztFQUN4QyxDQUFDLE1BQU07SUFDTEEsVUFBVSxHQUFHcEwsS0FBSyxDQUFDZ0ksVUFBVSxDQUFDb0QsVUFBVSxDQUFDO0VBQzNDOztFQUVBO0VBQ0E7RUFDQTtFQUNBLE1BQU1wTCxLQUFLLENBQUNtSyxtQkFBbUIsQ0FBQ3VCLFdBQVcsQ0FBQztJQUMxQzdDO0VBQ0YsQ0FBQyxFQUFFO0lBQ0RBLEdBQUc7SUFDSHVDLFVBQVU7SUFDVm5LLGdCQUFnQjtJQUNoQitKLFNBQVMsRUFBRSxJQUFJSixJQUFJLENBQUM7RUFDdEIsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7QUFHSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E1SyxLQUFLLENBQUNrQiwwQkFBMEIsR0FDOUIsZ0JBQU8ySCxHQUFHLEVBQThCO0VBQUEsSUFBNUI1SCxnQkFBZ0IsR0FBQStILFNBQUEsQ0FBQS9GLE1BQUEsUUFBQStGLFNBQUEsUUFBQWxHLFNBQUEsR0FBQWtHLFNBQUEsTUFBRyxJQUFJO0VBQ2pDcUMsS0FBSyxDQUFDeEMsR0FBRyxFQUFFeUMsTUFBTSxDQUFDO0VBRWxCLE1BQU1LLGlCQUFpQixHQUFHLE1BQU0zTCxLQUFLLENBQUNtSyxtQkFBbUIsQ0FBQ2hGLFlBQVksQ0FBQztJQUNyRTBELEdBQUc7SUFDSDVIO0VBQ0YsQ0FBQyxDQUFDO0VBQ0YsSUFBSTBLLGlCQUFpQixFQUFFO0lBQ3JCLE1BQU0zTCxLQUFLLENBQUNtSyxtQkFBbUIsQ0FBQ1ksV0FBVyxDQUFDO01BQUVhLEdBQUcsRUFBRUQsaUJBQWlCLENBQUNDO0lBQUksQ0FBQyxDQUFDO0lBQzNFLElBQUlELGlCQUFpQixDQUFDUCxVQUFVLENBQUNsSCxLQUFLLEVBQ3BDLE9BQU8ySCxhQUFhLENBQUNGLGlCQUFpQixDQUFDUCxVQUFVLENBQUNsSCxLQUFLLENBQUMsQ0FBQyxLQUV6RCxPQUFPbEUsS0FBSyxDQUFDbUksVUFBVSxDQUFDd0QsaUJBQWlCLENBQUNQLFVBQVUsQ0FBQztFQUN6RCxDQUFDLE1BQU07SUFDTCxPQUFPdEksU0FBUztFQUNsQjtBQUNGLENBQUM7O0FBR0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNMkksYUFBYSxHQUFHdkgsS0FBSyxJQUFJO0VBQzdCLE1BQU00SCxXQUFXLEdBQUcsQ0FBQyxDQUFDO0VBQ3RCcEQsTUFBTSxDQUFDcUQsbUJBQW1CLENBQUM3SCxLQUFLLENBQUMsQ0FBQzBFLE9BQU8sQ0FDdkNDLEdBQUcsSUFBSWlELFdBQVcsQ0FBQ2pELEdBQUcsQ0FBQyxHQUFHM0UsS0FBSyxDQUFDMkUsR0FBRyxDQUNyQyxDQUFDOztFQUVEO0VBQ0EsSUFBRzNFLEtBQUssWUFBWXZCLE1BQU0sQ0FBQ2hDLEtBQUssRUFBRTtJQUNoQ21MLFdBQVcsQ0FBQyxhQUFhLENBQUMsR0FBRyxJQUFJO0VBQ25DO0VBRUEsT0FBTztJQUFFNUgsS0FBSyxFQUFFNEg7RUFBWSxDQUFDO0FBQy9CLENBQUM7O0FBRUQ7QUFDQSxNQUFNRCxhQUFhLEdBQUdHLFFBQVEsSUFBSTtFQUNoQyxJQUFJOUgsS0FBSztFQUVULElBQUk4SCxRQUFRLENBQUNDLFdBQVcsRUFBRTtJQUN4Qi9ILEtBQUssR0FBRyxJQUFJdkIsTUFBTSxDQUFDaEMsS0FBSyxDQUFDLENBQUM7SUFDMUIsT0FBT3FMLFFBQVEsQ0FBQ0MsV0FBVztFQUM3QixDQUFDLE1BQU07SUFDTC9ILEtBQUssR0FBRyxJQUFJdkQsS0FBSyxDQUFDLENBQUM7RUFDckI7RUFFQStILE1BQU0sQ0FBQ3FELG1CQUFtQixDQUFDQyxRQUFRLENBQUMsQ0FBQ3BELE9BQU8sQ0FBQ0MsR0FBRyxJQUM5QzNFLEtBQUssQ0FBQzJFLEdBQUcsQ0FBQyxHQUFHbUQsUUFBUSxDQUFDbkQsR0FBRyxDQUMzQixDQUFDO0VBRUQsT0FBTzNFLEtBQUs7QUFDZCxDQUFDLEM7Ozs7Ozs7Ozs7Ozs7O0lDbElELElBQUkzRSxhQUFhO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQUFsS0MsS0FBSyxDQUFDZ0gsbUJBQW1CLEdBQUcsZ0NBQWdDO0lBRTVEaEgsS0FBSyxDQUFDa00sWUFBWSxHQUFHLENBQUNyTCxXQUFXLEVBQUVtRSxNQUFNLEVBQUVtSCxNQUFNLEVBQUVDLGtCQUFrQixLQUFLO01BQ3hFO01BQ0E7TUFDQTtNQUNBLElBQUk1SixTQUFTLEdBQUcsS0FBSztNQUNyQixJQUFJNkosU0FBUyxHQUFHLEtBQUs7TUFDckIsSUFBSUYsTUFBTSxFQUFFO1FBQ1ZBLE1BQU0sR0FBQTVNLGFBQUEsS0FBUTRNLE1BQU0sQ0FBRTtRQUN0QjNKLFNBQVMsR0FBRzJKLE1BQU0sQ0FBQ0csT0FBTztRQUMxQkQsU0FBUyxHQUFHRixNQUFNLENBQUNJLE9BQU87UUFDMUIsT0FBT0osTUFBTSxDQUFDRyxPQUFPO1FBQ3JCLE9BQU9ILE1BQU0sQ0FBQ0ksT0FBTztRQUNyQixJQUFJN0QsTUFBTSxDQUFDQyxJQUFJLENBQUN3RCxNQUFNLENBQUMsQ0FBQ2xKLE1BQU0sS0FBSyxDQUFDLEVBQUU7VUFDcENrSixNQUFNLEdBQUdySixTQUFTO1FBQ3BCO01BQ0Y7TUFFQSxJQUFJSCxNQUFNLENBQUM2SixRQUFRLElBQUloSyxTQUFTLEVBQUU7UUFDaEMsTUFBTWtDLEdBQUcsR0FBRytILEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM5QixJQUFJQyxPQUFPLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxlQUFlLElBQ25DM0YseUJBQXlCLENBQUM0RixRQUFRO1FBRXhDLElBQUlWLFNBQVMsRUFBRTtVQUNiO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQSxNQUFNVyxhQUFhLEdBQUd0SSxHQUFHLENBQUN4QyxLQUFLLENBQUN5SyxPQUFPLENBQUM7VUFDeEMsSUFBSUssYUFBYSxDQUFDQyxRQUFRLEtBQUssV0FBVyxFQUFFO1lBQzFDRCxhQUFhLENBQUNDLFFBQVEsR0FBRyxVQUFVO1lBQ25DLE9BQU9ELGFBQWEsQ0FBQ0UsSUFBSTtVQUMzQjtVQUNBUCxPQUFPLEdBQUdqSSxHQUFHLENBQUN5SSxNQUFNLENBQUNILGFBQWEsQ0FBQztRQUNyQztRQUVBWixrQkFBa0IsR0FBQTdNLGFBQUEsQ0FBQUEsYUFBQSxLQUNiNk0sa0JBQWtCO1VBQ3JCO1VBQ0E7VUFDQU87UUFBTyxFQUNSO01BQ0g7TUFFQSxPQUFPakQsR0FBRyxDQUFDMEQsYUFBYSxDQUN0QnpLLE1BQU0sQ0FBQ0MsV0FBVyxXQUFBaEMsTUFBQSxDQUFXQyxXQUFXLEdBQUl1TCxrQkFBa0IsQ0FBQyxFQUMvRCxJQUFJLEVBQ0pELE1BQU0sQ0FBQztJQUNYLENBQUM7SUFBQ3BDLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEciLCJmaWxlIjoiL3BhY2thZ2VzL29hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGJvZHlQYXJzZXIgZnJvbSAnYm9keS1wYXJzZXInO1xuXG5PQXV0aCA9IHt9O1xuT0F1dGhUZXN0ID0ge307XG5cblJvdXRlUG9saWN5LmRlY2xhcmUoJy9fb2F1dGgvJywgJ25ldHdvcmsnKTtcblxuY29uc3QgcmVnaXN0ZXJlZFNlcnZpY2VzID0ge307XG5cbi8vIEludGVybmFsOiBNYXBzIGZyb20gc2VydmljZSB2ZXJzaW9uIHRvIGhhbmRsZXIgZnVuY3Rpb24uIFRoZVxuLy8gJ29hdXRoMScgYW5kICdvYXV0aDInIHBhY2thZ2VzIG1hbmlwdWxhdGUgdGhpcyBkaXJlY3RseSB0byByZWdpc3RlclxuLy8gZm9yIGNhbGxiYWNrcy5cbk9BdXRoLl9yZXF1ZXN0SGFuZGxlcnMgPSB7fTtcblxuXG4vKipcbi8qIFJlZ2lzdGVyIGEgaGFuZGxlciBmb3IgYW4gT0F1dGggc2VydmljZS4gVGhlIGhhbmRsZXIgd2lsbCBiZSBjYWxsZWRcbi8qIHdoZW4gd2UgZ2V0IGFuIGluY29taW5nIGh0dHAgcmVxdWVzdCBvbiAvX29hdXRoL3tzZXJ2aWNlTmFtZX0uIFRoaXNcbi8qIGhhbmRsZXIgc2hvdWxkIHVzZSB0aGF0IGluZm9ybWF0aW9uIHRvIGZldGNoIGRhdGEgYWJvdXQgdGhlIHVzZXJcbi8qIGxvZ2dpbmcgaW4uXG4vKlxuLyogQHBhcmFtIG5hbWUge1N0cmluZ30gZS5nLiBcImdvb2dsZVwiLCBcImZhY2Vib29rXCJcbi8qIEBwYXJhbSB2ZXJzaW9uIHtOdW1iZXJ9IE9BdXRoIHZlcnNpb24gKDEgb3IgMilcbi8qIEBwYXJhbSB1cmxzICAgRm9yIE9BdXRoMSBvbmx5LCBzcGVjaWZ5IHRoZSBzZXJ2aWNlJ3MgdXJsc1xuLyogQHBhcmFtIGhhbmRsZU9hdXRoUmVxdWVzdCB7RnVuY3Rpb24ob2F1dGhCaW5kaW5nfHF1ZXJ5KX1cbi8qICAgLSAoRm9yIE9BdXRoMSBvbmx5KSBvYXV0aEJpbmRpbmcge09BdXRoMUJpbmRpbmd9IGJvdW5kIHRvIHRoZSBhcHByb3ByaWF0ZSBwcm92aWRlclxuLyogICAtIChGb3IgT0F1dGgyIG9ubHkpIHF1ZXJ5IHtPYmplY3R9IHBhcmFtZXRlcnMgcGFzc2VkIGluIHF1ZXJ5IHN0cmluZ1xuLyogICAtIHJldHVybiB2YWx1ZSBpczpcbi8qICAgICAtIHtzZXJ2aWNlRGF0YTosIChvcHRpb25hbCBvcHRpb25zOil9IHdoZXJlIHNlcnZpY2VEYXRhIHNob3VsZCBlbmRcbi8qICAgICAgIHVwIGluIHRoZSB1c2VyJ3Mgc2VydmljZXNbbmFtZV0gZmllbGRcbi8qICAgICAtIGBudWxsYCBpZiB0aGUgdXNlciBkZWNsaW5lZCB0byBnaXZlIHBlcm1pc3Npb25zXG4qL1xuT0F1dGgucmVnaXN0ZXJTZXJ2aWNlID0gKG5hbWUsIHZlcnNpb24sIHVybHMsIGhhbmRsZU9hdXRoUmVxdWVzdCkgPT4ge1xuICBpZiAocmVnaXN0ZXJlZFNlcnZpY2VzW25hbWVdKVxuICAgIHRocm93IG5ldyBFcnJvcihgQWxyZWFkeSByZWdpc3RlcmVkIHRoZSAke25hbWV9IE9BdXRoIHNlcnZpY2VgKTtcblxuICByZWdpc3RlcmVkU2VydmljZXNbbmFtZV0gPSB7XG4gICAgc2VydmljZU5hbWU6IG5hbWUsXG4gICAgdmVyc2lvbixcbiAgICB1cmxzLFxuICAgIGhhbmRsZU9hdXRoUmVxdWVzdCxcbiAgfTtcbn07XG5cbi8vIEZvciB0ZXN0IGNsZWFudXAuXG5PQXV0aFRlc3QudW5yZWdpc3RlclNlcnZpY2UgPSBuYW1lID0+IHtcbiAgZGVsZXRlIHJlZ2lzdGVyZWRTZXJ2aWNlc1tuYW1lXTtcbn07XG5cblxuT0F1dGgucmV0cmlldmVDcmVkZW50aWFsID0gKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCkgPT5cbiAgT0F1dGguX3JldHJpZXZlUGVuZGluZ0NyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KTtcblxuXG4vLyBUaGUgc3RhdGUgcGFyYW1ldGVyIGlzIG5vcm1hbGx5IGdlbmVyYXRlZCBvbiB0aGUgY2xpZW50IHVzaW5nXG4vLyBgYnRvYWAsIGJ1dCBmb3IgdGVzdHMgd2UgbmVlZCBhIHZlcnNpb24gdGhhdCBydW5zIG9uIHRoZSBzZXJ2ZXIuXG4vL1xuT0F1dGguX2dlbmVyYXRlU3RhdGUgPSAobG9naW5TdHlsZSwgY3JlZGVudGlhbFRva2VuLCByZWRpcmVjdFVybCkgPT4ge1xuICByZXR1cm4gQnVmZmVyLmZyb20oSlNPTi5zdHJpbmdpZnkoe1xuICAgIGxvZ2luU3R5bGU6IGxvZ2luU3R5bGUsXG4gICAgY3JlZGVudGlhbFRva2VuOiBjcmVkZW50aWFsVG9rZW4sXG4gICAgcmVkaXJlY3RVcmw6IHJlZGlyZWN0VXJsfSkpLnRvU3RyaW5nKCdiYXNlNjQnKTtcbn07XG5cbk9BdXRoLl9zdGF0ZUZyb21RdWVyeSA9IHF1ZXJ5ID0+IHtcbiAgbGV0IHN0cmluZztcbiAgdHJ5IHtcbiAgICBzdHJpbmcgPSBCdWZmZXIuZnJvbShxdWVyeS5zdGF0ZSwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCdiaW5hcnknKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIExvZy53YXJuKGBVbmFibGUgdG8gYmFzZTY0IGRlY29kZSBzdGF0ZSBmcm9tIE9BdXRoIHF1ZXJ5OiAke3F1ZXJ5LnN0YXRlfWApO1xuICAgIHRocm93IGU7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBKU09OLnBhcnNlKHN0cmluZyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBMb2cud2FybihgVW5hYmxlIHRvIHBhcnNlIHN0YXRlIGZyb20gT0F1dGggcXVlcnk6ICR7c3RyaW5nfWApO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG5cbk9BdXRoLl9sb2dpblN0eWxlRnJvbVF1ZXJ5ID0gcXVlcnkgPT4ge1xuICBsZXQgc3R5bGU7XG4gIC8vIEZvciBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3Igb2xkZXIgY2xpZW50cywgY2F0Y2ggYW55IGVycm9yc1xuICAvLyB0aGF0IHJlc3VsdCBmcm9tIHBhcnNpbmcgdGhlIHN0YXRlIHBhcmFtZXRlci4gSWYgd2UgY2FuJ3QgcGFyc2UgaXQsXG4gIC8vIHNldCBsb2dpbiBzdHlsZSB0byBwb3B1cCBieSBkZWZhdWx0LlxuICB0cnkge1xuICAgIHN0eWxlID0gT0F1dGguX3N0YXRlRnJvbVF1ZXJ5KHF1ZXJ5KS5sb2dpblN0eWxlO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBzdHlsZSA9IFwicG9wdXBcIjtcbiAgfVxuICBpZiAoc3R5bGUgIT09IFwicG9wdXBcIiAmJiBzdHlsZSAhPT0gXCJyZWRpcmVjdFwiKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBVbnJlY29nbml6ZWQgbG9naW4gc3R5bGU6ICR7c3R5bGV9YCk7XG4gIH1cbiAgcmV0dXJuIHN0eWxlO1xufTtcblxuT0F1dGguX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeSA9IHF1ZXJ5ID0+IHtcbiAgbGV0IHN0YXRlO1xuICAvLyBGb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIG9sZGVyIGNsaWVudHMsIGNhdGNoIGFueSBlcnJvcnNcbiAgLy8gdGhhdCByZXN1bHQgZnJvbSBwYXJzaW5nIHRoZSBzdGF0ZSBwYXJhbWV0ZXIuIElmIHdlIGNhbid0IHBhcnNlIGl0LFxuICAvLyBhc3N1bWUgdGhhdCB0aGUgc3RhdGUgcGFyYW1ldGVyJ3MgdmFsdWUgaXMgdGhlIGNyZWRlbnRpYWwgdG9rZW4sIGFzXG4gIC8vIGl0IHVzZWQgdG8gYmUgZm9yIG9sZGVyIGNsaWVudHMuXG4gIHRyeSB7XG4gICAgc3RhdGUgPSBPQXV0aC5fc3RhdGVGcm9tUXVlcnkocXVlcnkpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gcXVlcnkuc3RhdGU7XG4gIH1cbiAgcmV0dXJuIHN0YXRlLmNyZWRlbnRpYWxUb2tlbjtcbn07XG5cbk9BdXRoLl9pc0NvcmRvdmFGcm9tUXVlcnkgPSBxdWVyeSA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhIE9BdXRoLl9zdGF0ZUZyb21RdWVyeShxdWVyeSkuaXNDb3Jkb3ZhO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBGb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIG9sZGVyIGNsaWVudHMsIGNhdGNoIGFueSBlcnJvcnNcbiAgICAvLyB0aGF0IHJlc3VsdCBmcm9tIHBhcnNpbmcgdGhlIHN0YXRlIHBhcmFtZXRlci4gSWYgd2UgY2FuJ3QgcGFyc2VcbiAgICAvLyBpdCwgYXNzdW1lIHRoYXQgd2UgYXJlIG5vdCBvbiBDb3Jkb3ZhLCBzaW5jZSBvbGRlciBNZXRlb3IgZGlkbid0XG4gICAgLy8gZG8gQ29yZG92YS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8vIENoZWNrcyBpZiB0aGUgYHJlZGlyZWN0VXJsYCBtYXRjaGVzIHRoZSBhcHAgaG9zdC5cbi8vIFdlIGV4cG9ydCB0aGlzIGZ1bmN0aW9uIHNvIHRoYXQgZGV2ZWxvcGVycyBjYW4gb3ZlcnJpZGUgdGhpc1xuLy8gYmVoYXZpb3IgdG8gYWxsb3cgYXBwcyBmcm9tIGV4dGVybmFsIGRvbWFpbnMgdG8gbG9naW4gdXNpbmcgdGhlXG4vLyByZWRpcmVjdCBPQXV0aCBmbG93LlxuT0F1dGguX2NoZWNrUmVkaXJlY3RVcmxPcmlnaW4gPSByZWRpcmVjdFVybCA9PiB7XG4gIGNvbnN0IGFwcEhvc3QgPSBNZXRlb3IuYWJzb2x1dGVVcmwoKTtcbiAgY29uc3QgYXBwSG9zdFJlcGxhY2VkTG9jYWxob3N0ID0gTWV0ZW9yLmFic29sdXRlVXJsKHVuZGVmaW5lZCwge1xuICAgIHJlcGxhY2VMb2NhbGhvc3Q6IHRydWVcbiAgfSk7XG4gIHJldHVybiAoXG4gICAgcmVkaXJlY3RVcmwuc3Vic3RyKDAsIGFwcEhvc3QubGVuZ3RoKSAhPT0gYXBwSG9zdCAmJlxuICAgIHJlZGlyZWN0VXJsLnN1YnN0cigwLCBhcHBIb3N0UmVwbGFjZWRMb2NhbGhvc3QubGVuZ3RoKSAhPT0gYXBwSG9zdFJlcGxhY2VkTG9jYWxob3N0XG4gICk7XG59O1xuXG5jb25zdCBtaWRkbGV3YXJlID0gYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG4gIGxldCByZXF1ZXN0RGF0YTtcblxuICAvLyBNYWtlIHN1cmUgdG8gY2F0Y2ggYW55IGV4Y2VwdGlvbnMgYmVjYXVzZSBvdGhlcndpc2Ugd2UnZCBjcmFzaFxuICAvLyB0aGUgcnVubmVyXG4gIHRyeSB7XG4gICAgY29uc3Qgc2VydmljZU5hbWUgPSBvYXV0aFNlcnZpY2VOYW1lKHJlcSk7XG4gICAgaWYgKCFzZXJ2aWNlTmFtZSkge1xuICAgICAgLy8gbm90IGFuIG9hdXRoIHJlcXVlc3QuIHBhc3MgdG8gbmV4dCBtaWRkbGV3YXJlLlxuICAgICAgbmV4dCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHNlcnZpY2UgPSByZWdpc3RlcmVkU2VydmljZXNbc2VydmljZU5hbWVdO1xuXG4gICAgLy8gU2tpcCBldmVyeXRoaW5nIGlmIHRoZXJlJ3Mgbm8gc2VydmljZSBzZXQgYnkgdGhlIG9hdXRoIG1pZGRsZXdhcmVcbiAgICBpZiAoIXNlcnZpY2UpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgT0F1dGggc2VydmljZSAke3NlcnZpY2VOYW1lfWApO1xuXG4gICAgLy8gTWFrZSBzdXJlIHdlJ3JlIGNvbmZpZ3VyZWRcbiAgICBhd2FpdCBlbnN1cmVDb25maWd1cmVkKHNlcnZpY2VOYW1lKTtcblxuICAgIGNvbnN0IGhhbmRsZXIgPSBPQXV0aC5fcmVxdWVzdEhhbmRsZXJzW3NlcnZpY2UudmVyc2lvbl07XG4gICAgaWYgKCFoYW5kbGVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmV4cGVjdGVkIE9BdXRoIHZlcnNpb24gJHtzZXJ2aWNlLnZlcnNpb259YCk7XG5cbiAgICBpZiAocmVxLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICAgIHJlcXVlc3REYXRhID0gcmVxLnF1ZXJ5O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXF1ZXN0RGF0YSA9IHJlcS5ib2R5O1xuICAgIH1cbiAgICBhd2FpdCBoYW5kbGVyKHNlcnZpY2UsIHJlcXVlc3REYXRhLCByZXMpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICAvLyBpZiB3ZSBnb3QgdGhyb3duIGFuIGVycm9yLCBzYXZlIGl0IG9mZiwgaXQgd2lsbCBnZXQgcGFzc2VkIHRvXG4gICAgLy8gdGhlIGFwcHJvcHJpYXRlIGxvZ2luIGNhbGwgKGlmIGFueSkgYW5kIHJlcG9ydGVkIHRoZXJlLlxuICAgIC8vXG4gICAgLy8gVGhlIG90aGVyIG9wdGlvbiB3b3VsZCBiZSB0byBkaXNwbGF5IGl0IGluIHRoZSBwb3B1cCB0YWIgdGhhdFxuICAgIC8vIGlzIHN0aWxsIG9wZW4gYXQgdGhpcyBwb2ludCwgaWdub3JpbmcgdGhlICdjbG9zZScgb3IgJ3JlZGlyZWN0J1xuICAgIC8vIHdlIHdlcmUgcGFzc2VkLiBCdXQgdGhlbiB0aGUgZGV2ZWxvcGVyIHdvdWxkbid0IGJlIGFibGUgdG9cbiAgICAvLyBzdHlsZSB0aGUgZXJyb3Igb3IgcmVhY3QgdG8gaXQgaW4gYW55IHdheS5cbiAgICBpZiAocmVxdWVzdERhdGE/LnN0YXRlICYmIGVyciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICB0cnkgeyAvLyBjYXRjaCBhbnkgZXhjZXB0aW9ucyB0byBhdm9pZCBjcmFzaGluZyBydW5uZXJcbiAgICAgICAgYXdhaXQgT0F1dGguX3N0b3JlUGVuZGluZ0NyZWRlbnRpYWwoT0F1dGguX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeShyZXF1ZXN0RGF0YSksIGVycik7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBlcnJvciBhbmQganVzdCBnaXZlIHVwLiBJZiB3ZSBmYWlsZWQgdG8gc3RvcmUgdGhlXG4gICAgICAgIC8vIGVycm9yLCB0aGVuIHRoZSBsb2dpbiB3aWxsIGp1c3QgZmFpbCB3aXRoIGEgZ2VuZXJpYyBlcnJvci5cbiAgICAgICAgTG9nLndhcm4oXCJFcnJvciBpbiBPQXV0aCBTZXJ2ZXIgd2hpbGUgc3RvcmluZyBwZW5kaW5nIGxvZ2luIHJlc3VsdC5cXG5cIiArXG4gICAgICAgICAgICAgICAgIGVyci5zdGFjayB8fCBlcnIubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gY2xvc2UgdGhlIHBvcHVwLiBiZWNhdXNlIG5vYm9keSBsaWtlcyB0aGVtIGp1c3QgaGFuZ2luZ1xuICAgIC8vIHRoZXJlLiAgd2hlbiBzb21lb25lIHNlZXMgdGhpcyBtdWx0aXBsZSB0aW1lcyB0aGV5IG1pZ2h0XG4gICAgLy8gdGhpbmsgdG8gY2hlY2sgc2VydmVyIGxvZ3MgKHdlIGhvcGU/KVxuICAgIC8vIENhdGNoIGVycm9ycyBiZWNhdXNlIGFueSBleGNlcHRpb24gaGVyZSB3aWxsIGNyYXNoIHRoZSBydW5uZXIuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IE9BdXRoLl9lbmRPZkxvZ2luUmVzcG9uc2UocmVzLCB7XG4gICAgICAgIHF1ZXJ5OiByZXF1ZXN0RGF0YSxcbiAgICAgICAgbG9naW5TdHlsZTogT0F1dGguX2xvZ2luU3R5bGVGcm9tUXVlcnkocmVxdWVzdERhdGEpLFxuICAgICAgICBlcnJvcjogZXJyXG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIExvZy53YXJuKFwiRXJyb3IgZ2VuZXJhdGluZyBlbmQgb2YgbG9naW4gcmVzcG9uc2VcXG5cIiArXG4gICAgICAgICAgICAgICAoZXJyICYmIChlcnIuc3RhY2sgfHwgZXJyLm1lc3NhZ2UpKSk7XG4gICAgfVxuICB9XG59O1xuXG4vLyBMaXN0ZW4gdG8gaW5jb21pbmcgT0F1dGggaHR0cCByZXF1ZXN0c1xuV2ViQXBwLmhhbmRsZXJzLnVzZSgnL19vYXV0aCcsIGJvZHlQYXJzZXIuanNvbigpKTtcbldlYkFwcC5oYW5kbGVycy51c2UoJy9fb2F1dGgnLCBib2R5UGFyc2VyLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpO1xuV2ViQXBwLmhhbmRsZXJzLnVzZShtaWRkbGV3YXJlKTtcblxuT0F1dGhUZXN0Lm1pZGRsZXdhcmUgPSBtaWRkbGV3YXJlO1xuXG5PQXV0aFRlc3QucmVnaXN0ZXJlZFNlcnZpY2VzID0gcmVnaXN0ZXJlZFNlcnZpY2VzO1xuXG4vLyBIYW5kbGUgL19vYXV0aC8qIHBhdGhzIGFuZCBleHRyYWN0IHRoZSBzZXJ2aWNlIG5hbWUuXG4vL1xuLy8gQHJldHVybnMge1N0cmluZ3xudWxsfSBlLmcuIFwiZmFjZWJvb2tcIiwgb3IgbnVsbCBpZiB0aGlzIGlzbid0IGFuXG4vLyBvYXV0aCByZXF1ZXN0XG5jb25zdCBvYXV0aFNlcnZpY2VOYW1lID0gcmVxID0+IHtcbiAgLy8gcmVxLnVybCB3aWxsIGJlIFwiL19vYXV0aC88c2VydmljZSBuYW1lPlwiIHdpdGggYW4gb3B0aW9uYWwgXCI/Y2xvc2VcIi5cbiAgY29uc3QgaSA9IHJlcS51cmwuaW5kZXhPZignPycpO1xuICBsZXQgYmFyZVBhdGg7XG4gIGlmIChpID09PSAtMSlcbiAgICBiYXJlUGF0aCA9IHJlcS51cmw7XG4gIGVsc2VcbiAgICBiYXJlUGF0aCA9IHJlcS51cmwuc3Vic3RyaW5nKDAsIGkpO1xuICBjb25zdCBzcGxpdFBhdGggPSBiYXJlUGF0aC5zcGxpdCgnLycpO1xuXG4gIC8vIEFueSBub24tb2F1dGggcmVxdWVzdCB3aWxsIGNvbnRpbnVlIGRvd24gdGhlIGRlZmF1bHRcbiAgLy8gbWlkZGxld2FyZXMuXG4gIGlmIChzcGxpdFBhdGhbMV0gIT09ICdfb2F1dGgnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIC8vIEZpbmQgc2VydmljZSBiYXNlZCBvbiB1cmxcbiAgY29uc3Qgc2VydmljZU5hbWUgPSBzcGxpdFBhdGhbMl07XG4gIHJldHVybiBzZXJ2aWNlTmFtZTtcbn07XG5cbi8vIE1ha2Ugc3VyZSB3ZSdyZSBjb25maWd1cmVkXG5jb25zdCBlbnN1cmVDb25maWd1cmVkID1cbiAgYXN5bmMgc2VydmljZU5hbWUgPT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9XG4gICAgICBhd2FpdCBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lQXN5bmMoeyBzZXJ2aWNlOiBzZXJ2aWNlTmFtZSB9KTtcbiAgICBpZiAoIWNvbmZpZykge1xuICAgICAgdGhyb3cgbmV3IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yKCk7XG4gICAgfVxuICB9O1xuXG5jb25zdCBpc1NhZmUgPSB2YWx1ZSA9PiB7XG4gIC8vIFRoaXMgbWF0Y2hlcyBzdHJpbmdzIGdlbmVyYXRlZCBieSBgUmFuZG9tLnNlY3JldGAgYW5kXG4gIC8vIGBSYW5kb20uaWRgLlxuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmXG4gICAgL15bYS16QS1aMC05XFwtX10rJC8udGVzdCh2YWx1ZSk7XG59O1xuXG4vLyBJbnRlcm5hbDogdXNlZCBieSB0aGUgb2F1dGgxIGFuZCBvYXV0aDIgcGFja2FnZXNcbk9BdXRoLl9yZW5kZXJPYXV0aFJlc3VsdHMgPSBhc3luYyAocmVzLCBxdWVyeSwgY3JlZGVudGlhbFNlY3JldCkgPT4ge1xuICAvLyBGb3IgdGVzdHMsIHdlIHN1cHBvcnQgdGhlIGBvbmx5X2NyZWRlbnRpYWxfc2VjcmV0X2Zvcl90ZXN0YFxuICAvLyBwYXJhbWV0ZXIsIHdoaWNoIGp1c3QgcmV0dXJucyB0aGUgY3JlZGVudGlhbCBzZWNyZXQgd2l0aG91dCBhbnlcbiAgLy8gc3Vycm91bmRpbmcgSFRNTC4gKFRoZSB0ZXN0IG5lZWRzIHRvIGJlIGFibGUgdG8gZWFzaWx5IGdyYWIgdGhlXG4gIC8vIHNlY3JldCBhbmQgdXNlIGl0IHRvIGxvZyBpbi4pXG4gIC8vXG4gIC8vIFhYWCBvbmx5X2NyZWRlbnRpYWxfc2VjcmV0X2Zvcl90ZXN0IGNvdWxkIGJlIHVzZWZ1bCBmb3Igb3RoZXJcbiAgLy8gdGhpbmdzIGJlc2lkZSB0ZXN0cywgbGlrZSBjb21tYW5kLWxpbmUgY2xpZW50cy4gV2Ugc2hvdWxkIGdpdmUgaXQgYVxuICAvLyByZWFsIG5hbWUgYW5kIHNlcnZlIHRoZSBjcmVkZW50aWFsIHNlY3JldCBpbiBKU09OLlxuXG4gIGlmIChxdWVyeS5vbmx5X2NyZWRlbnRpYWxfc2VjcmV0X2Zvcl90ZXN0KSB7XG4gICAgcmVzLndyaXRlSGVhZCgyMDAsIHsnQ29udGVudC1UeXBlJzogJ3RleHQvaHRtbCd9KTtcbiAgICByZXMuZW5kKGNyZWRlbnRpYWxTZWNyZXQsICd1dGYtOCcpO1xuICB9IGVsc2Uge1xuICAgIGNvbnN0IGRldGFpbHMgPSB7XG4gICAgICBxdWVyeSxcbiAgICAgIGxvZ2luU3R5bGU6IE9BdXRoLl9sb2dpblN0eWxlRnJvbVF1ZXJ5KHF1ZXJ5KVxuICAgIH07XG4gICAgaWYgKHF1ZXJ5LmVycm9yKSB7XG4gICAgICBkZXRhaWxzLmVycm9yID0gcXVlcnkuZXJyb3I7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHRva2VuID0gT0F1dGguX2NyZWRlbnRpYWxUb2tlbkZyb21RdWVyeShxdWVyeSk7XG4gICAgICBjb25zdCBzZWNyZXQgPSBjcmVkZW50aWFsU2VjcmV0O1xuICAgICAgaWYgKHRva2VuICYmIHNlY3JldCAmJlxuICAgICAgICAgIGlzU2FmZSh0b2tlbikgJiYgaXNTYWZlKHNlY3JldCkpIHtcbiAgICAgICAgZGV0YWlscy5jcmVkZW50aWFscyA9IHsgdG9rZW46IHRva2VuLCBzZWNyZXQ6IHNlY3JldH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXRhaWxzLmVycm9yID0gXCJpbnZhbGlkX2NyZWRlbnRpYWxfdG9rZW5fb3Jfc2VjcmV0XCI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgYXdhaXQgT0F1dGguX2VuZE9mTG9naW5SZXNwb25zZShyZXMsIGRldGFpbHMpO1xuICB9XG59O1xuXG5jb25zdCBnZXRBc3NldCA9IChuYW1lKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiBBc3NldHMuZ2V0VGV4dEFzeW5jKFxuICAgIGAke25hbWV9Lmh0bWxgLFxuICAgIChlcnIsIGRhdGEpID0+IGVyciA/IHJlamVjdChlcnIpIDogcmVzb2x2ZShkYXRhKSkpXG59XG4vLyBUaGlzIFwidGVtcGxhdGVcIiAobm90IGEgcmVhbCBTcGFjZWJhcnMgdGVtcGxhdGUsIGp1c3QgYW4gSFRNTCBmaWxlXG4vLyB3aXRoIHNvbWUgIyNQTEFDRUhPTERFUiMjcykgY29tbXVuaWNhdGVzIHRoZSBjcmVkZW50aWFsIHNlY3JldCBiYWNrXG4vLyB0byB0aGUgbWFpbiB3aW5kb3cgYW5kIHRoZW4gY2xvc2VzIHRoZSBwb3B1cC5cbk9BdXRoLl9lbmRPZlBvcHVwUmVzcG9uc2VUZW1wbGF0ZSA9XG4gIGFzeW5jICgpID0+IGF3YWl0IGdldEFzc2V0KCdlbmRfb2ZfcG9wdXBfcmVzcG9uc2UnKVxuXG5PQXV0aC5fZW5kT2ZSZWRpcmVjdFJlc3BvbnNlVGVtcGxhdGUgPVxuICBhc3luYyAoKSA9PiBhd2FpdCBnZXRBc3NldCgnZW5kX29mX3JlZGlyZWN0X3Jlc3BvbnNlJylcblxuLy8gUmVuZGVycyB0aGUgZW5kIG9mIGxvZ2luIHJlc3BvbnNlIHRlbXBsYXRlIGludG8gc29tZSBIVE1MIGFuZCBKYXZhU2NyaXB0XG4vLyB0aGF0IGNsb3NlcyB0aGUgcG9wdXAgb3IgcmVkaXJlY3RzIGF0IHRoZSBlbmQgb2YgdGhlIE9BdXRoIGZsb3cuXG4vL1xuLy8gb3B0aW9ucyBhcmU6XG4vLyAgIC0gbG9naW5TdHlsZSAoXCJwb3B1cFwiIG9yIFwicmVkaXJlY3RcIilcbi8vICAgLSBzZXRDcmVkZW50aWFsVG9rZW4gKGJvb2xlYW4pXG4vLyAgIC0gY3JlZGVudGlhbFRva2VuXG4vLyAgIC0gY3JlZGVudGlhbFNlY3JldFxuLy8gICAtIHJlZGlyZWN0VXJsXG4vLyAgIC0gaXNDb3Jkb3ZhIChib29sZWFuKVxuLy9cbmNvbnN0IHJlbmRlckVuZE9mTG9naW5SZXNwb25zZSA9IGFzeW5jIG9wdGlvbnMgPT4ge1xuICAvLyBJdCB3b3VsZCBiZSBuaWNlIHRvIHVzZSBCbGF6ZSBoZXJlLCBidXQgaXQncyBhIGxpdHRsZSB0cmlja3lcbiAgLy8gYmVjYXVzZSBvdXIgbXVzdGFjaGVzIHdvdWxkIGJlIGluc2lkZSBhIDxzY3JpcHQ+IHRhZywgYW5kIEJsYXplXG4gIC8vIHdvdWxkIHRyZWF0IHRoZSA8c2NyaXB0PiB0YWcgY29udGVudHMgYXMgdGV4dCAoZS5nLiBlbmNvZGUgJyYnIGFzXG4gIC8vICcmYW1wOycpLiBTbyB3ZSBqdXN0IGRvIGEgc2ltcGxlIHJlcGxhY2UuXG5cbiAgY29uc3QgZXNjYXBlID0gcyA9PiB7XG4gICAgaWYgKHMpIHtcbiAgICAgIHJldHVybiBzLnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5cbiAgICAgICAgcmVwbGFjZSgvPC9nLCBcIiZsdDtcIikuXG4gICAgICAgIHJlcGxhY2UoLz4vZywgXCImZ3Q7XCIpLlxuICAgICAgICByZXBsYWNlKC9cXFwiL2csIFwiJnF1b3Q7XCIpLlxuICAgICAgICByZXBsYWNlKC9cXCcvZywgXCImI3gyNztcIikuXG4gICAgICAgIHJlcGxhY2UoL1xcLy9nLCBcIiYjeDJGO1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHM7XG4gICAgfVxuICB9O1xuXG4gIC8vIEVzY2FwZSBldmVyeXRoaW5nIGp1c3QgdG8gYmUgc2FmZSAod2UndmUgYWxyZWFkeSBjaGVja2VkIHRoYXQgc29tZVxuICAvLyBvZiB0aGlzIGRhdGEgLS0gdGhlIHRva2VuIGFuZCBzZWNyZXQgLS0gYXJlIHNhZmUpLlxuICBjb25zdCBjb25maWcgPSB7XG4gICAgc2V0Q3JlZGVudGlhbFRva2VuOiAhISBvcHRpb25zLnNldENyZWRlbnRpYWxUb2tlbixcbiAgICBjcmVkZW50aWFsVG9rZW46IGVzY2FwZShvcHRpb25zLmNyZWRlbnRpYWxUb2tlbiksXG4gICAgY3JlZGVudGlhbFNlY3JldDogZXNjYXBlKG9wdGlvbnMuY3JlZGVudGlhbFNlY3JldCksXG4gICAgc3RvcmFnZVByZWZpeDogZXNjYXBlKE9BdXRoLl9zdG9yYWdlVG9rZW5QcmVmaXgpLFxuICAgIHJlZGlyZWN0VXJsOiBlc2NhcGUob3B0aW9ucy5yZWRpcmVjdFVybCksXG4gICAgaXNDb3Jkb3ZhOiAhISBvcHRpb25zLmlzQ29yZG92YVxuICB9O1xuXG4gIGxldCB0ZW1wbGF0ZTtcbiAgaWYgKG9wdGlvbnMubG9naW5TdHlsZSA9PT0gJ3BvcHVwJykge1xuICAgIHRlbXBsYXRlID0gYXdhaXQgT0F1dGguX2VuZE9mUG9wdXBSZXNwb25zZVRlbXBsYXRlKCk7XG4gIH0gZWxzZSBpZiAob3B0aW9ucy5sb2dpblN0eWxlID09PSAncmVkaXJlY3QnKSB7XG4gICAgdGVtcGxhdGUgPSBhd2FpdCBPQXV0aC5fZW5kT2ZSZWRpcmVjdFJlc3BvbnNlVGVtcGxhdGUoKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgbG9naW5TdHlsZTogJHtvcHRpb25zLmxvZ2luU3R5bGV9YCk7XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gdGVtcGxhdGUucmVwbGFjZSgvIyNDT05GSUcjIy8sIEpTT04uc3RyaW5naWZ5KGNvbmZpZykpXG4gICAgLnJlcGxhY2UoXG4gICAgICAvIyNST09UX1VSTF9QQVRIX1BSRUZJWCMjLywgX19tZXRlb3JfcnVudGltZV9jb25maWdfXy5ST09UX1VSTF9QQVRIX1BSRUZJWFxuICAgICk7XG5cbiAgcmV0dXJuIGA8IURPQ1RZUEUgaHRtbD5cXG4ke3Jlc3VsdH1gO1xufTtcblxuLy8gV3JpdGVzIGFuIEhUVFAgcmVzcG9uc2UgdG8gdGhlIHBvcHVwIHdpbmRvdyBhdCB0aGUgZW5kIG9mIGFuIE9BdXRoXG4vLyBsb2dpbiBmbG93LiBBdCB0aGlzIHBvaW50LCBpZiB0aGUgdXNlciBoYXMgc3VjY2Vzc2Z1bGx5IGF1dGhlbnRpY2F0ZWRcbi8vIHRvIHRoZSBPQXV0aCBzZXJ2ZXIgYW5kIGF1dGhvcml6ZWQgdGhpcyBhcHAsIHdlIGNvbW11bmljYXRlIHRoZVxuLy8gY3JlZGVudGlhbFRva2VuIGFuZCBjcmVkZW50aWFsU2VjcmV0IHRvIHRoZSBtYWluIHdpbmRvdy4gVGhlIG1haW5cbi8vIHdpbmRvdyBtdXN0IHByb3ZpZGUgYm90aCB0aGVzZSB2YWx1ZXMgdG8gdGhlIEREUCBgbG9naW5gIG1ldGhvZCB0b1xuLy8gYXV0aGVudGljYXRlIGl0cyBERFAgY29ubmVjdGlvbi4gQWZ0ZXIgY29tbXVuaWNhdGluZyB0aGVzZSB2YWx1ZXMgdG9cbi8vIHRoZSBtYWluIHdpbmRvdywgd2UgY2xvc2UgdGhlIHBvcHVwLlxuLy9cbi8vIFdlIGV4cG9ydCB0aGlzIGZ1bmN0aW9uIHNvIHRoYXQgZGV2ZWxvcGVycyBjYW4gb3ZlcnJpZGUgdGhpc1xuLy8gYmVoYXZpb3IsIHdoaWNoIGlzIHBhcnRpY3VsYXJseSB1c2VmdWwgaW4sIGZvciBleGFtcGxlLCBzb21lIG1vYmlsZVxuLy8gZW52aXJvbm1lbnRzIHdoZXJlIHBvcHVwcyBhbmQvb3IgYHdpbmRvdy5vcGVuZXJgIGRvbid0IHdvcmsuIEZvclxuLy8gZXhhbXBsZSwgYW4gYXBwIGNvdWxkIG92ZXJyaWRlIGBPQXV0aC5fZW5kT2ZQb3B1cFJlc3BvbnNlYCB0byBwdXQgdGhlXG4vLyBjcmVkZW50aWFsIHRva2VuIGFuZCBjcmVkZW50aWFsIHNlY3JldCBpbiB0aGUgcG9wdXAgVVJMIGZvciB0aGUgbWFpblxuLy8gd2luZG93IHRvIHJlYWQgdGhlbSB0aGVyZSBpbnN0ZWFkIG9mIHVzaW5nIGB3aW5kb3cub3BlbmVyYC4gSWYgeW91XG4vLyBvdmVycmlkZSB0aGlzIGZ1bmN0aW9uLCB5b3UgdGFrZSByZXNwb25zaWJpbGl0eSBmb3Igd3JpdGluZyB0byB0aGVcbi8vIHJlcXVlc3QgYW5kIGNhbGxpbmcgYHJlcy5lbmQoKWAgdG8gY29tcGxldGUgdGhlIHJlcXVlc3QuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gICAtIHJlczogdGhlIEhUVFAgcmVzcG9uc2Ugb2JqZWN0XG4vLyAgIC0gZGV0YWlsczpcbi8vICAgICAgLSBxdWVyeTogdGhlIHF1ZXJ5IHN0cmluZyBvbiB0aGUgSFRUUCByZXF1ZXN0XG4vLyAgICAgIC0gY3JlZGVudGlhbHM6IHsgdG9rZW46ICosIHNlY3JldDogKiB9LiBJZiBwcmVzZW50LCB0aGlzIGZpZWxkXG4vLyAgICAgICAgaW5kaWNhdGVzIHRoYXQgdGhlIGxvZ2luIHdhcyBzdWNjZXNzZnVsLiBSZXR1cm4gdGhlc2UgdmFsdWVzXG4vLyAgICAgICAgdG8gdGhlIGNsaWVudCwgd2hvIGNhbiB1c2UgdGhlbSB0byBsb2cgaW4gb3ZlciBERFAuIElmXG4vLyAgICAgICAgcHJlc2VudCwgdGhlIHZhbHVlcyBoYXZlIGJlZW4gY2hlY2tlZCBhZ2FpbnN0IGEgbGltaXRlZFxuLy8gICAgICAgIGNoYXJhY3RlciBzZXQgYW5kIGFyZSBzYWZlIHRvIGluY2x1ZGUgaW4gSFRNTC5cbi8vICAgICAgLSBlcnJvcjogaWYgcHJlc2VudCwgYSBzdHJpbmcgb3IgRXJyb3IgaW5kaWNhdGluZyBhbiBlcnJvciB0aGF0XG4vLyAgICAgICAgb2NjdXJyZWQgZHVyaW5nIHRoZSBsb2dpbi4gVGhpcyBjYW4gY29tZSBmcm9tIHRoZSBjbGllbnQgYW5kXG4vLyAgICAgICAgc28gc2hvdWxkbid0IGJlIHRydXN0ZWQgZm9yIHNlY3VyaXR5IGRlY2lzaW9ucyBvciBpbmNsdWRlZCBpblxuLy8gICAgICAgIHRoZSByZXNwb25zZSB3aXRob3V0IHNhbml0aXppbmcgaXQgZmlyc3QuIE9ubHkgb25lIG9mIGBlcnJvcmBcbi8vICAgICAgICBvciBgY3JlZGVudGlhbHNgIHNob3VsZCBiZSBzZXQuXG5PQXV0aC5fZW5kT2ZMb2dpblJlc3BvbnNlID0gYXN5bmMgKHJlcywgZGV0YWlscykgPT4ge1xuICByZXMud3JpdGVIZWFkKDIwMCwgeydDb250ZW50LVR5cGUnOiAndGV4dC9odG1sJ30pO1xuXG4gIGxldCByZWRpcmVjdFVybDtcbiAgaWYgKGRldGFpbHMubG9naW5TdHlsZSA9PT0gJ3JlZGlyZWN0Jykge1xuICAgIHJlZGlyZWN0VXJsID0gT0F1dGguX3N0YXRlRnJvbVF1ZXJ5KGRldGFpbHMucXVlcnkpLnJlZGlyZWN0VXJsO1xuICAgIGNvbnN0IGFwcEhvc3QgPSBNZXRlb3IuYWJzb2x1dGVVcmwoKTtcbiAgICBpZiAoXG4gICAgICAhTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8ub2F1dGg/LmRpc2FibGVDaGVja1JlZGlyZWN0VXJsT3JpZ2luICYmXG4gICAgICBPQXV0aC5fY2hlY2tSZWRpcmVjdFVybE9yaWdpbihyZWRpcmVjdFVybCkpIHtcbiAgICAgIGRldGFpbHMuZXJyb3IgPSBgcmVkaXJlY3RVcmwgKCR7cmVkaXJlY3RVcmx9YCArXG4gICAgICAgIGApIGlzIG5vdCBvbiB0aGUgc2FtZSBob3N0IGFzIHRoZSBhcHAgKCR7YXBwSG9zdH0pYDtcbiAgICAgIHJlZGlyZWN0VXJsID0gYXBwSG9zdDtcbiAgICB9XG4gIH1cblxuICBjb25zdCBpc0NvcmRvdmEgPSBPQXV0aC5faXNDb3Jkb3ZhRnJvbVF1ZXJ5KGRldGFpbHMucXVlcnkpO1xuXG4gIGlmIChkZXRhaWxzLmVycm9yKSB7XG4gICAgTG9nLndhcm4oXCJFcnJvciBpbiBPQXV0aCBTZXJ2ZXI6IFwiICtcbiAgICAgICAgICAgICAoZGV0YWlscy5lcnJvciBpbnN0YW5jZW9mIEVycm9yID9cbiAgICAgICAgICAgICAgZGV0YWlscy5lcnJvci5tZXNzYWdlIDogZGV0YWlscy5lcnJvcikpO1xuICAgIHJlcy5lbmQoYXdhaXQgcmVuZGVyRW5kT2ZMb2dpblJlc3BvbnNlKHtcbiAgICAgIGxvZ2luU3R5bGU6IGRldGFpbHMubG9naW5TdHlsZSxcbiAgICAgIHNldENyZWRlbnRpYWxUb2tlbjogZmFsc2UsXG4gICAgICByZWRpcmVjdFVybCxcbiAgICAgIGlzQ29yZG92YSxcbiAgICB9KSwgXCJ1dGYtOFwiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiB3ZSBoYXZlIGEgY3JlZGVudGlhbFNlY3JldCwgcmVwb3J0IGl0IGJhY2sgdG8gdGhlIHBhcmVudFxuICAvLyB3aW5kb3csIHdpdGggdGhlIGNvcnJlc3BvbmRpbmcgY3JlZGVudGlhbFRva2VuLiBUaGUgcGFyZW50IHdpbmRvd1xuICAvLyB1c2VzIHRoZSBjcmVkZW50aWFsVG9rZW4gYW5kIGNyZWRlbnRpYWxTZWNyZXQgdG8gbG9nIGluIG92ZXIgRERQLlxuICByZXMuZW5kKGF3YWl0IHJlbmRlckVuZE9mTG9naW5SZXNwb25zZSh7XG4gICAgbG9naW5TdHlsZTogZGV0YWlscy5sb2dpblN0eWxlLFxuICAgIHNldENyZWRlbnRpYWxUb2tlbjogdHJ1ZSxcbiAgICBjcmVkZW50aWFsVG9rZW46IGRldGFpbHMuY3JlZGVudGlhbHMudG9rZW4sXG4gICAgY3JlZGVudGlhbFNlY3JldDogZGV0YWlscy5jcmVkZW50aWFscy5zZWNyZXQsXG4gICAgcmVkaXJlY3RVcmwsXG4gICAgaXNDb3Jkb3ZhLFxuICB9KSwgXCJ1dGYtOFwiKTtcbn07XG5cblxuY29uc3QgT0F1dGhFbmNyeXB0aW9uID0gUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0gJiYgUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0uT0F1dGhFbmNyeXB0aW9uO1xuXG5jb25zdCB1c2luZ09BdXRoRW5jcnlwdGlvbiA9ICgpID0+XG4gIE9BdXRoRW5jcnlwdGlvbiAmJiBPQXV0aEVuY3J5cHRpb24ua2V5SXNMb2FkZWQoKTtcblxuLy8gRW5jcnlwdCBzZW5zaXRpdmUgc2VydmljZSBkYXRhIHN1Y2ggYXMgYWNjZXNzIHRva2VucyBpZiB0aGVcbi8vIFwib2F1dGgtZW5jcnlwdGlvblwiIHBhY2thZ2UgaXMgbG9hZGVkIGFuZCB0aGUgb2F1dGggc2VjcmV0IGtleSBoYXNcbi8vIGJlZW4gc3BlY2lmaWVkLiAgUmV0dXJucyB0aGUgdW5lbmNyeXB0ZWQgcGxhaW50ZXh0IG90aGVyd2lzZS5cbi8vXG4vLyBUaGUgdXNlciBpZCBpcyBub3Qgc3BlY2lmaWVkIGJlY2F1c2UgdGhlIHVzZXIgaXNuJ3Qga25vd24geWV0IGF0XG4vLyB0aGlzIHBvaW50IGluIHRoZSBvYXV0aCBhdXRoZW50aWNhdGlvbiBwcm9jZXNzLiAgQWZ0ZXIgdGhlIG9hdXRoXG4vLyBhdXRoZW50aWNhdGlvbiBwcm9jZXNzIGNvbXBsZXRlcyB0aGUgZW5jcnlwdGVkIHNlcnZpY2UgZGF0YSBmaWVsZHNcbi8vIHdpbGwgYmUgcmUtZW5jcnlwdGVkIHdpdGggdGhlIHVzZXIgaWQgaW5jbHVkZWQgYmVmb3JlIGluc2VydGluZyB0aGVcbi8vIHNlcnZpY2UgZGF0YSBpbnRvIHRoZSB1c2VyIGRvY3VtZW50LlxuLy9cbk9BdXRoLnNlYWxTZWNyZXQgPSBwbGFpbnRleHQgPT4ge1xuICBpZiAodXNpbmdPQXV0aEVuY3J5cHRpb24oKSlcbiAgICByZXR1cm4gT0F1dGhFbmNyeXB0aW9uLnNlYWwocGxhaW50ZXh0KTtcbiAgZWxzZVxuICAgIHJldHVybiBwbGFpbnRleHQ7XG59O1xuXG4vLyBVbmVuY3J5cHQgYSBzZXJ2aWNlIGRhdGEgZmllbGQsIGlmIHRoZSBcIm9hdXRoLWVuY3J5cHRpb25cIlxuLy8gcGFja2FnZSBpcyBsb2FkZWQgYW5kIHRoZSBmaWVsZCBpcyBlbmNyeXB0ZWQuXG4vL1xuLy8gVGhyb3dzIGFuIGVycm9yIGlmIHRoZSBcIm9hdXRoLWVuY3J5cHRpb25cIiBwYWNrYWdlIGlzIGxvYWRlZCBhbmQgdGhlXG4vLyBmaWVsZCBpcyBlbmNyeXB0ZWQsIGJ1dCB0aGUgb2F1dGggc2VjcmV0IGtleSBoYXNuJ3QgYmVlbiBzcGVjaWZpZWQuXG4vL1xuT0F1dGgub3BlblNlY3JldCA9IChtYXliZVNlY3JldCwgdXNlcklkKSA9PiB7XG4gIGlmICghUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0gfHwgIU9BdXRoRW5jcnlwdGlvbi5pc1NlYWxlZChtYXliZVNlY3JldCkpXG4gICAgcmV0dXJuIG1heWJlU2VjcmV0O1xuXG4gIHJldHVybiBPQXV0aEVuY3J5cHRpb24ub3BlbihtYXliZVNlY3JldCwgdXNlcklkKTtcbn07XG5cbi8vIFVuZW5jcnlwdCBmaWVsZHMgaW4gdGhlIHNlcnZpY2UgZGF0YSBvYmplY3QuXG4vL1xuT0F1dGgub3BlblNlY3JldHMgPSAoc2VydmljZURhdGEsIHVzZXJJZCkgPT4ge1xuICBjb25zdCByZXN1bHQgPSB7fTtcbiAgT2JqZWN0LmtleXMoc2VydmljZURhdGEpLmZvckVhY2goa2V5ID0+XG4gICAgcmVzdWx0W2tleV0gPSBPQXV0aC5vcGVuU2VjcmV0KHNlcnZpY2VEYXRhW2tleV0sIHVzZXJJZClcbiAgKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbk9BdXRoLl9hZGRWYWx1ZXNUb1F1ZXJ5UGFyYW1zID0gKFxuICB2YWx1ZXMgPSB7fSxcbiAgcXVlcnlQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcbikgPT4ge1xuICBPYmplY3QuZW50cmllcyh2YWx1ZXMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIHF1ZXJ5UGFyYW1zLnNldChrZXksIGAke3ZhbHVlfWApO1xuICB9KTtcbiAgcmV0dXJuIHF1ZXJ5UGFyYW1zO1xufTtcblxuT0F1dGguX2ZldGNoID0gYXN5bmMgKFxuICB1cmwsXG4gIG1ldGhvZCA9ICdHRVQnLFxuICB7IGhlYWRlcnMgPSB7fSwgcXVlcnlQYXJhbXMgPSB7fSwgYm9keSwgLi4ub3B0aW9ucyB9ID0ge31cbikgPT4ge1xuICBjb25zdCB1cmxXaXRoUGFyYW1zID0gbmV3IFVSTCh1cmwpO1xuXG4gIE9BdXRoLl9hZGRWYWx1ZXNUb1F1ZXJ5UGFyYW1zKHF1ZXJ5UGFyYW1zLCB1cmxXaXRoUGFyYW1zLnNlYXJjaFBhcmFtcyk7XG5cbiAgY29uc3QgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiBtZXRob2QudG9VcHBlckNhc2UoKSxcbiAgICBoZWFkZXJzLFxuICAgIC4uLihib2R5ID8geyBib2R5IH0gOiB7fSksXG4gICAgLi4ub3B0aW9ucyxcbiAgfTtcbiAgcmV0dXJuIGZldGNoKHVybFdpdGhQYXJhbXMudG9TdHJpbmcoKSwgcmVxdWVzdE9wdGlvbnMpO1xufTtcbiIsIi8vXG4vLyBXaGVuIGFuIG9hdXRoIHJlcXVlc3QgaXMgbWFkZSwgTWV0ZW9yIHJlY2VpdmVzIG9hdXRoIGNyZWRlbnRpYWxzXG4vLyBpbiBvbmUgYnJvd3NlciB0YWIsIGFuZCB0ZW1wb3JhcmlseSBwZXJzaXN0cyB0aGVtIHdoaWxlIHRoYXRcbi8vIHRhYiBpcyBjbG9zZWQsIHRoZW4gcmV0cmlldmVzIHRoZW0gaW4gdGhlIGJyb3dzZXIgdGFiIHRoYXRcbi8vIGluaXRpYXRlZCB0aGUgY3JlZGVudGlhbCByZXF1ZXN0LlxuLy9cbi8vIF9wZW5kaW5nQ3JlZGVudGlhbHMgaXMgdGhlIHN0b3JhZ2UgbWVjaGFuaXNtIHVzZWQgdG8gc2hhcmUgdGhlXG4vLyBjcmVkZW50aWFsIGJldHdlZW4gdGhlIDIgdGFic1xuLy9cblxuXG4vLyBDb2xsZWN0aW9uIGNvbnRhaW5pbmcgcGVuZGluZyBjcmVkZW50aWFscyBvZiBvYXV0aCBjcmVkZW50aWFsIHJlcXVlc3RzXG4vLyBIYXMga2V5LCBjcmVkZW50aWFsLCBhbmQgY3JlYXRlZEF0IGZpZWxkcy5cbk9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcbiAgXCJtZXRlb3Jfb2F1dGhfcGVuZGluZ0NyZWRlbnRpYWxzXCIsIHtcbiAgICBfcHJldmVudEF1dG9wdWJsaXNoOiB0cnVlXG4gIH0pO1xuXG4vLyBUT0RPW0ZJQkVSU106IEkgTmVlZCBUTEFcbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gIGF3YWl0IE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMuY3JlYXRlSW5kZXhBc3luYygna2V5JywgeyB1bmlxdWU6IHRydWUgfSk7XG4gIGF3YWl0IE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMuY3JlYXRlSW5kZXhBc3luYygnY3JlZGVudGlhbFNlY3JldCcpO1xuICBhd2FpdCBPQXV0aC5fcGVuZGluZ0NyZWRlbnRpYWxzLmNyZWF0ZUluZGV4QXN5bmMoJ2NyZWF0ZWRBdCcpO1xufVxuaW5pdCgpXG5cblxuXG4vLyBQZXJpb2RpY2FsbHkgY2xlYXIgb2xkIGVudHJpZXMgdGhhdCB3ZXJlIG5ldmVyIHJldHJpZXZlZFxuY29uc3QgX2NsZWFuU3RhbGVSZXN1bHRzID0gYXN5bmMgKCkgPT4ge1xuICAvLyBSZW1vdmUgY3JlZGVudGlhbHMgb2xkZXIgdGhhbiAxIG1pbnV0ZVxuICBjb25zdCB0aW1lQ3V0b2ZmID0gbmV3IERhdGUoKTtcbiAgdGltZUN1dG9mZi5zZXRNaW51dGVzKHRpbWVDdXRvZmYuZ2V0TWludXRlcygpIC0gMSk7XG4gIGF3YWl0IE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMucmVtb3ZlQXN5bmMoeyBjcmVhdGVkQXQ6IHsgJGx0OiB0aW1lQ3V0b2ZmIH0gfSk7XG59O1xuY29uc3QgX2NsZWFudXBIYW5kbGUgPSBNZXRlb3Iuc2V0SW50ZXJ2YWwoX2NsZWFuU3RhbGVSZXN1bHRzLCA2MCAqIDEwMDApO1xuXG5cbi8vIFN0b3JlcyB0aGUga2V5IGFuZCBjcmVkZW50aWFsIGluIHRoZSBfcGVuZGluZ0NyZWRlbnRpYWxzIGNvbGxlY3Rpb24uXG4vLyBXaWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBga2V5YCBpcyBub3QgYSBzdHJpbmcuXG4vL1xuLy8gQHBhcmFtIGtleSB7c3RyaW5nfVxuLy8gQHBhcmFtIGNyZWRlbnRpYWwge09iamVjdH0gICBUaGUgY3JlZGVudGlhbCB0byBzdG9yZVxuLy8gQHBhcmFtIGNyZWRlbnRpYWxTZWNyZXQge3N0cmluZ30gQSBzZWNyZXQgdGhhdCBtdXN0IGJlIHByZXNlbnRlZCBpblxuLy8gICBhZGRpdGlvbiB0byB0aGUgYGtleWAgdG8gcmV0cmlldmUgdGhlIGNyZWRlbnRpYWxcbi8vXG5PQXV0aC5fc3RvcmVQZW5kaW5nQ3JlZGVudGlhbCA9XG4gIGFzeW5jIChrZXksIGNyZWRlbnRpYWwsIGNyZWRlbnRpYWxTZWNyZXQgPSBudWxsKSA9PiB7XG4gICAgY2hlY2soa2V5LCBTdHJpbmcpO1xuICAgIGNoZWNrKGNyZWRlbnRpYWxTZWNyZXQsIE1hdGNoLk1heWJlKFN0cmluZykpO1xuXG4gICAgaWYgKGNyZWRlbnRpYWwgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgY3JlZGVudGlhbCA9IHN0b3JhYmxlRXJyb3IoY3JlZGVudGlhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNyZWRlbnRpYWwgPSBPQXV0aC5zZWFsU2VjcmV0KGNyZWRlbnRpYWwpO1xuICAgIH1cblxuICAgIC8vIFdlIGRvIGFuIHVwc2VydCBoZXJlIGluc3RlYWQgb2YgYW4gaW5zZXJ0IGluIGNhc2UgdGhlIHVzZXIgaGFwcGVuc1xuICAgIC8vIHRvIHNvbWVob3cgc2VuZCB0aGUgc2FtZSBgc3RhdGVgIHBhcmFtZXRlciB0d2ljZSBkdXJpbmcgYW4gT0F1dGhcbiAgICAvLyBsb2dpbjsgd2UgZG9uJ3Qgd2FudCBhIGR1cGxpY2F0ZSBrZXkgZXJyb3IuXG4gICAgYXdhaXQgT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy51cHNlcnRBc3luYyh7XG4gICAgICBrZXksXG4gICAgfSwge1xuICAgICAga2V5LFxuICAgICAgY3JlZGVudGlhbCxcbiAgICAgIGNyZWRlbnRpYWxTZWNyZXQsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcbiAgICB9KTtcbiAgfTtcblxuXG4vLyBSZXRyaWV2ZXMgYW5kIHJlbW92ZXMgYSBjcmVkZW50aWFsIGZyb20gdGhlIF9wZW5kaW5nQ3JlZGVudGlhbHMgY29sbGVjdGlvblxuLy9cbi8vIEBwYXJhbSBrZXkge3N0cmluZ31cbi8vIEBwYXJhbSBjcmVkZW50aWFsU2VjcmV0IHtzdHJpbmd9XG4vL1xuT0F1dGguX3JldHJpZXZlUGVuZGluZ0NyZWRlbnRpYWwgPVxuICBhc3luYyAoa2V5LCBjcmVkZW50aWFsU2VjcmV0ID0gbnVsbCkgPT4ge1xuICAgIGNoZWNrKGtleSwgU3RyaW5nKTtcblxuICAgIGNvbnN0IHBlbmRpbmdDcmVkZW50aWFsID0gYXdhaXQgT0F1dGguX3BlbmRpbmdDcmVkZW50aWFscy5maW5kT25lQXN5bmMoe1xuICAgICAga2V5LFxuICAgICAgY3JlZGVudGlhbFNlY3JldCxcbiAgICB9KTtcbiAgICBpZiAocGVuZGluZ0NyZWRlbnRpYWwpIHtcbiAgICAgIGF3YWl0IE9BdXRoLl9wZW5kaW5nQ3JlZGVudGlhbHMucmVtb3ZlQXN5bmMoeyBfaWQ6IHBlbmRpbmdDcmVkZW50aWFsLl9pZCB9KTtcbiAgICAgIGlmIChwZW5kaW5nQ3JlZGVudGlhbC5jcmVkZW50aWFsLmVycm9yKVxuICAgICAgICByZXR1cm4gcmVjcmVhdGVFcnJvcihwZW5kaW5nQ3JlZGVudGlhbC5jcmVkZW50aWFsLmVycm9yKTtcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIE9BdXRoLm9wZW5TZWNyZXQocGVuZGluZ0NyZWRlbnRpYWwuY3JlZGVudGlhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xuXG5cbi8vIENvbnZlcnQgYW4gRXJyb3IgaW50byBhbiBvYmplY3QgdGhhdCBjYW4gYmUgc3RvcmVkIGluIG1vbmdvXG4vLyBOb3RlOiBBIE1ldGVvci5FcnJvciBpcyByZWNvbnN0cnVjdGVkIGFzIGEgTWV0ZW9yLkVycm9yXG4vLyBBbGwgb3RoZXIgZXJyb3IgY2xhc3NlcyBhcmUgcmVjb25zdHJ1Y3RlZCBhcyBhIHBsYWluIEVycm9yLlxuLy8gVE9ETzogQ2FuIHdlIGRvIHRoaXMgbW9yZSBzaW1wbHkgd2l0aCBFSlNPTj9cbmNvbnN0IHN0b3JhYmxlRXJyb3IgPSBlcnJvciA9PiB7XG4gIGNvbnN0IHBsYWluT2JqZWN0ID0ge307XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGVycm9yKS5mb3JFYWNoKFxuICAgIGtleSA9PiBwbGFpbk9iamVjdFtrZXldID0gZXJyb3Jba2V5XVxuICApO1xuXG4gIC8vIEtlZXAgdHJhY2sgb2Ygd2hldGhlciBpdCdzIGEgTWV0ZW9yLkVycm9yXG4gIGlmKGVycm9yIGluc3RhbmNlb2YgTWV0ZW9yLkVycm9yKSB7XG4gICAgcGxhaW5PYmplY3RbJ21ldGVvckVycm9yJ10gPSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHsgZXJyb3I6IHBsYWluT2JqZWN0IH07XG59O1xuXG4vLyBDcmVhdGUgYW4gZXJyb3IgZnJvbSB0aGUgZXJyb3IgZm9ybWF0IHN0b3JlZCBpbiBtb25nb1xuY29uc3QgcmVjcmVhdGVFcnJvciA9IGVycm9yRG9jID0+IHtcbiAgbGV0IGVycm9yO1xuXG4gIGlmIChlcnJvckRvYy5tZXRlb3JFcnJvcikge1xuICAgIGVycm9yID0gbmV3IE1ldGVvci5FcnJvcigpO1xuICAgIGRlbGV0ZSBlcnJvckRvYy5tZXRlb3JFcnJvcjtcbiAgfSBlbHNlIHtcbiAgICBlcnJvciA9IG5ldyBFcnJvcigpO1xuICB9XG5cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXJyb3JEb2MpLmZvckVhY2goa2V5ID0+XG4gICAgZXJyb3Jba2V5XSA9IGVycm9yRG9jW2tleV1cbiAgKTtcblxuICByZXR1cm4gZXJyb3I7XG59O1xuIiwiT0F1dGguX3N0b3JhZ2VUb2tlblByZWZpeCA9IFwiTWV0ZW9yLm9hdXRoLmNyZWRlbnRpYWxTZWNyZXQtXCI7XG5cbk9BdXRoLl9yZWRpcmVjdFVyaSA9IChzZXJ2aWNlTmFtZSwgY29uZmlnLCBwYXJhbXMsIGFic29sdXRlVXJsT3B0aW9ucykgPT4ge1xuICAvLyBDbG9uZSBiZWNhdXNlIHdlJ3JlIGdvaW5nIHRvIG11dGF0ZSAncGFyYW1zJy4gVGhlICdjb3Jkb3ZhJyBhbmRcbiAgLy8gJ2FuZHJvaWQnIHBhcmFtZXRlcnMgYXJlIG9ubHkgdXNlZCBmb3IgcGlja2luZyB0aGUgaG9zdCBvZiB0aGVcbiAgLy8gcmVkaXJlY3QgVVJMLCBhbmQgbm90IGFjdHVhbGx5IGluY2x1ZGVkIGluIHRoZSByZWRpcmVjdCBVUkwgaXRzZWxmLlxuICBsZXQgaXNDb3Jkb3ZhID0gZmFsc2U7XG4gIGxldCBpc0FuZHJvaWQgPSBmYWxzZTtcbiAgaWYgKHBhcmFtcykge1xuICAgIHBhcmFtcyA9IHsgLi4ucGFyYW1zIH07XG4gICAgaXNDb3Jkb3ZhID0gcGFyYW1zLmNvcmRvdmE7XG4gICAgaXNBbmRyb2lkID0gcGFyYW1zLmFuZHJvaWQ7XG4gICAgZGVsZXRlIHBhcmFtcy5jb3Jkb3ZhO1xuICAgIGRlbGV0ZSBwYXJhbXMuYW5kcm9pZDtcbiAgICBpZiAoT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHBhcmFtcyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH1cblxuICBpZiAoTWV0ZW9yLmlzU2VydmVyICYmIGlzQ29yZG92YSkge1xuICAgIGNvbnN0IHVybCA9IE5wbS5yZXF1aXJlKCd1cmwnKTtcbiAgICBsZXQgcm9vdFVybCA9IHByb2Nlc3MuZW52Lk1PQklMRV9ST09UX1VSTCB8fFxuICAgICAgICAgIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uUk9PVF9VUkw7XG5cbiAgICBpZiAoaXNBbmRyb2lkKSB7XG4gICAgICAvLyBNYXRjaCB0aGUgcmVwbGFjZSB0aGF0IHdlIGRvIGluIGNvcmRvdmEgYm9pbGVycGxhdGVcbiAgICAgIC8vIChib2lsZXJwbGF0ZS1nZW5lcmF0b3IgcGFja2FnZSkuXG4gICAgICAvLyBYWFggTWF5YmUgd2Ugc2hvdWxkIHB1dCB0aGlzIGluIGEgc2VwYXJhdGUgcGFja2FnZSBvciBzb21ldGhpbmdcbiAgICAgIC8vIHRoYXQgaXMgdXNlZCBoZXJlIGFuZCBieSBib2lsZXJwbGF0ZS1nZW5lcmF0b3I/IE9yIG1heWJlXG4gICAgICAvLyBgTWV0ZW9yLmFic29sdXRlVXJsYCBzaG91bGQga25vdyBob3cgdG8gZG8gdGhpcz9cbiAgICAgIGNvbnN0IHBhcnNlZFJvb3RVcmwgPSB1cmwucGFyc2Uocm9vdFVybCk7XG4gICAgICBpZiAocGFyc2VkUm9vdFVybC5ob3N0bmFtZSA9PT0gXCJsb2NhbGhvc3RcIikge1xuICAgICAgICBwYXJzZWRSb290VXJsLmhvc3RuYW1lID0gXCIxMC4wLjIuMlwiO1xuICAgICAgICBkZWxldGUgcGFyc2VkUm9vdFVybC5ob3N0O1xuICAgICAgfVxuICAgICAgcm9vdFVybCA9IHVybC5mb3JtYXQocGFyc2VkUm9vdFVybCk7XG4gICAgfVxuXG4gICAgYWJzb2x1dGVVcmxPcHRpb25zID0ge1xuICAgICAgLi4uYWJzb2x1dGVVcmxPcHRpb25zLFxuICAgICAgLy8gRm9yIENvcmRvdmEgY2xpZW50cywgcmVkaXJlY3QgdG8gdGhlIHNwZWNpYWwgQ29yZG92YSByb290IHVybFxuICAgICAgLy8gKGxpa2VseSBhIGxvY2FsIElQIGluIGRldmVsb3BtZW50IG1vZGUpLlxuICAgICAgcm9vdFVybCxcbiAgICB9O1xuICB9XG5cbiAgcmV0dXJuIFVSTC5fY29uc3RydWN0VXJsKFxuICAgIE1ldGVvci5hYnNvbHV0ZVVybChgX29hdXRoLyR7c2VydmljZU5hbWV9YCwgYWJzb2x1dGVVcmxPcHRpb25zKSxcbiAgICBudWxsLFxuICAgIHBhcmFtcyk7XG59O1xuIl19
