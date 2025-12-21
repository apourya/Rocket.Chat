Package["core-runtime"].queue("facebook-oauth",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Facebook;

var require = meteorInstall({"node_modules":{"meteor":{"facebook-oauth":{"facebook_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/facebook-oauth/facebook_server.js                                                                      //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    var _Meteor$settings, _Meteor$settings$publ, _Meteor$settings$publ2, _Meteor$settings$publ3;
    let crypto;
    module.link("crypto", {
      default(v) {
        crypto = v;
      }
    }, 0);
    let Accounts;
    module.link("meteor/accounts-base", {
      Accounts(v) {
        Accounts = v;
      }
    }, 1);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    Facebook = {};
    const API_VERSION = ((_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$publ = _Meteor$settings.public) === null || _Meteor$settings$publ === void 0 ? void 0 : (_Meteor$settings$publ2 = _Meteor$settings$publ.packages) === null || _Meteor$settings$publ2 === void 0 ? void 0 : (_Meteor$settings$publ3 = _Meteor$settings$publ2['facebook-oauth']) === null || _Meteor$settings$publ3 === void 0 ? void 0 : _Meteor$settings$publ3.apiVersion) || '22.0';
    Facebook.handleAuthFromAccessToken = async (accessToken, expiresAt) => {
      // include basic fields from facebook
      // https://developers.facebook.com/docs/facebook-login/permissions/
      const whitelisted = ['id', 'email', 'name', 'first_name', 'last_name', 'middle_name', 'name_format', 'picture', 'short_name'];
      const identity = await getIdentity(accessToken, whitelisted);
      const fields = {};
      whitelisted.forEach(field => fields[field] = identity[field]);
      const serviceData = _objectSpread({
        accessToken,
        expiresAt
      }, fields);
      return {
        serviceData,
        options: {
          profile: {
            name: identity.name
          }
        }
      };
    };
    Accounts.registerLoginHandler(async request => {
      if (request.facebookSignIn !== true) {
        return;
      }
      const facebookData = await Facebook.handleAuthFromAccessToken(request.accessToken, +new Date() + 1000 * request.expirationTime);
      if (!facebookData) return;
      return Accounts.updateOrCreateUserFromExternalService('facebook', facebookData.serviceData, facebookData.options);
    });
    OAuth.registerService('facebook', 2, null, async query => {
      const response = await getTokenResponse(query);
      const {
        accessToken
      } = response;
      const {
        expiresIn
      } = response;
      return Facebook.handleAuthFromAccessToken(accessToken, +new Date() + 1000 * expiresIn);
    });
    function getAbsoluteUrlOptions(query) {
      var _Meteor$settings2, _Meteor$settings2$pac, _Meteor$settings2$pac2;
      const overrideRootUrlFromStateRedirectUrl = (_Meteor$settings2 = Meteor.settings) === null || _Meteor$settings2 === void 0 ? void 0 : (_Meteor$settings2$pac = _Meteor$settings2.packages) === null || _Meteor$settings2$pac === void 0 ? void 0 : (_Meteor$settings2$pac2 = _Meteor$settings2$pac['facebook-oauth']) === null || _Meteor$settings2$pac2 === void 0 ? void 0 : _Meteor$settings2$pac2.overrideRootUrlFromStateRedirectUrl;
      if (!overrideRootUrlFromStateRedirectUrl) {
        return undefined;
      }
      try {
        const state = OAuth._stateFromQuery(query) || {};
        const redirectUrl = new URL(state.redirectUrl);
        return {
          rootUrl: redirectUrl.origin
        };
      } catch (e) {
        console.error("Failed to complete OAuth handshake with Facebook because it was not able to obtain the redirect url from the state and you are using overrideRootUrlFromStateRedirectUrl.", e);
        return undefined;
      }
    }

    /**
     * @typedef {Object} UserAccessToken
     * @property {string} accessToken - User access Token
     * @property {number} expiresIn - lifetime of token in seconds
     */
    /**
     * @async
     * @function getTokenResponse
     * @param {Object} query - An object with the code.
     * @returns {Promise<UserAccessToken>} - Promise with an Object containing the accessToken and expiresIn (lifetime of token in seconds)
     */
    const getTokenResponse = async query => {
      const config = await ServiceConfiguration.configurations.findOneAsync({
        service: 'facebook'
      });
      if (!config) throw new ServiceConfiguration.ConfigError();
      const absoluteUrlOptions = getAbsoluteUrlOptions(query);
      const redirectUri = OAuth._redirectUri('facebook', config, undefined, absoluteUrlOptions);
      return OAuth._fetch("https://graph.facebook.com/v".concat(API_VERSION, "/oauth/access_token"), 'GET', {
        queryParams: {
          client_id: config.appId,
          redirect_uri: redirectUri,
          client_secret: OAuth.openSecret(config.secret),
          code: query.code
        }
      }).then(res => res.json()).then(data => {
        const fbAccessToken = data.access_token;
        const fbExpires = data.expires_in;
        if (!fbAccessToken) {
          throw new Error("Failed to complete OAuth handshake with facebook " + "-- can't find access token in HTTP response. ".concat(data));
        }
        return {
          accessToken: fbAccessToken,
          expiresIn: fbExpires
        };
      }).catch(err => {
        throw Object.assign(new Error("Failed to complete OAuth handshake with Facebook. ".concat(err.message)), {
          response: err.response
        });
      });
    };
    const getIdentity = async (accessToken, fields) => {
      const config = await ServiceConfiguration.configurations.findOneAsync({
        service: 'facebook'
      });
      if (!config) throw new ServiceConfiguration.ConfigError();

      // Generate app secret proof that is a sha256 hash of the app access token, with the app secret as the key
      // https://developers.facebook.com/docs/graph-api/securing-requests#appsecret_proof
      const hmac = crypto.createHmac('sha256', OAuth.openSecret(config.secret));
      hmac.update(accessToken);
      return OAuth._fetch("https://graph.facebook.com/v".concat(API_VERSION, "/me"), 'GET', {
        queryParams: {
          access_token: accessToken,
          appsecret_proof: hmac.digest('hex'),
          fields: fields.join(',')
        }
      }).then(res => res.json()).catch(err => {
        throw Object.assign(new Error("Failed to fetch identity from Facebook. ".concat(err.message)), {
          response: err.response
        });
      });
    };
    Facebook.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Facebook: Facebook
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/facebook-oauth/facebook_server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/facebook-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZmFjZWJvb2stb2F1dGgvZmFjZWJvb2tfc2VydmVyLmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJfTWV0ZW9yJHNldHRpbmdzIiwiX01ldGVvciRzZXR0aW5ncyRwdWJsIiwiX01ldGVvciRzZXR0aW5ncyRwdWJsMiIsIl9NZXRlb3Ikc2V0dGluZ3MkcHVibDMiLCJjcnlwdG8iLCJBY2NvdW50cyIsIl9fcmVpZnlXYWl0Rm9yRGVwc19fIiwiRmFjZWJvb2siLCJBUElfVkVSU0lPTiIsIk1ldGVvciIsInNldHRpbmdzIiwicHVibGljIiwicGFja2FnZXMiLCJhcGlWZXJzaW9uIiwiaGFuZGxlQXV0aEZyb21BY2Nlc3NUb2tlbiIsImFjY2Vzc1Rva2VuIiwiZXhwaXJlc0F0Iiwid2hpdGVsaXN0ZWQiLCJpZGVudGl0eSIsImdldElkZW50aXR5IiwiZmllbGRzIiwiZm9yRWFjaCIsImZpZWxkIiwic2VydmljZURhdGEiLCJvcHRpb25zIiwicHJvZmlsZSIsIm5hbWUiLCJyZWdpc3RlckxvZ2luSGFuZGxlciIsInJlcXVlc3QiLCJmYWNlYm9va1NpZ25JbiIsImZhY2Vib29rRGF0YSIsIkRhdGUiLCJleHBpcmF0aW9uVGltZSIsInVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJPQXV0aCIsInJlZ2lzdGVyU2VydmljZSIsInF1ZXJ5IiwicmVzcG9uc2UiLCJnZXRUb2tlblJlc3BvbnNlIiwiZXhwaXJlc0luIiwiZ2V0QWJzb2x1dGVVcmxPcHRpb25zIiwiX01ldGVvciRzZXR0aW5nczIiLCJfTWV0ZW9yJHNldHRpbmdzMiRwYWMiLCJfTWV0ZW9yJHNldHRpbmdzMiRwYWMyIiwib3ZlcnJpZGVSb290VXJsRnJvbVN0YXRlUmVkaXJlY3RVcmwiLCJ1bmRlZmluZWQiLCJzdGF0ZSIsIl9zdGF0ZUZyb21RdWVyeSIsInJlZGlyZWN0VXJsIiwiVVJMIiwicm9vdFVybCIsIm9yaWdpbiIsImUiLCJjb25zb2xlIiwiZXJyb3IiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZUFzeW5jIiwic2VydmljZSIsIkNvbmZpZ0Vycm9yIiwiYWJzb2x1dGVVcmxPcHRpb25zIiwicmVkaXJlY3RVcmkiLCJfcmVkaXJlY3RVcmkiLCJfZmV0Y2giLCJjb25jYXQiLCJxdWVyeVBhcmFtcyIsImNsaWVudF9pZCIsImFwcElkIiwicmVkaXJlY3RfdXJpIiwiY2xpZW50X3NlY3JldCIsIm9wZW5TZWNyZXQiLCJzZWNyZXQiLCJjb2RlIiwidGhlbiIsInJlcyIsImpzb24iLCJkYXRhIiwiZmJBY2Nlc3NUb2tlbiIsImFjY2Vzc190b2tlbiIsImZiRXhwaXJlcyIsImV4cGlyZXNfaW4iLCJFcnJvciIsImNhdGNoIiwiZXJyIiwiT2JqZWN0IiwiYXNzaWduIiwibWVzc2FnZSIsImhtYWMiLCJjcmVhdGVIbWFjIiwidXBkYXRlIiwiYXBwc2VjcmV0X3Byb29mIiwiZGlnZXN0Iiwiam9pbiIsInJldHJpZXZlQ3JlZGVudGlhbCIsImNyZWRlbnRpYWxUb2tlbiIsImNyZWRlbnRpYWxTZWNyZXQiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxhQUFhO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFBQyxnQkFBQSxFQUFBQyxxQkFBQSxFQUFBQyxzQkFBQSxFQUFBQyxzQkFBQTtJQUF0RyxJQUFJQyxNQUFNO0lBQUNSLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLFFBQVEsRUFBQztNQUFDQyxPQUFP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QUFrQixHQUFHLENBQUNDLGVBQWUsRUFBRUMsZ0JBQWdCLEtBQzlEOUQsS0FBSyxDQUFDNEQsa0JBQWtCLENBQUNDLGVBQWUsRUFBRUMsZ0JBQWdCLENBQUM7SUFBQ0Msc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvZmFjZWJvb2stb2F1dGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJGYWNlYm9vayA9IHt9O1xuaW1wb3J0IGNyeXB0byBmcm9tICdjcnlwdG8nO1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tICdtZXRlb3IvYWNjb3VudHMtYmFzZSc7XG5cbmNvbnN0IEFQSV9WRVJTSU9OID0gTWV0ZW9yLnNldHRpbmdzPy5wdWJsaWM/LnBhY2thZ2VzPy5bJ2ZhY2Vib29rLW9hdXRoJ10/LmFwaVZlcnNpb24gfHwgJzIyLjAnO1xuXG5GYWNlYm9vay5oYW5kbGVBdXRoRnJvbUFjY2Vzc1Rva2VuID0gYXN5bmMgKGFjY2Vzc1Rva2VuLCBleHBpcmVzQXQpID0+IHtcbiAgLy8gaW5jbHVkZSBiYXNpYyBmaWVsZHMgZnJvbSBmYWNlYm9va1xuICAvLyBodHRwczovL2RldmVsb3BlcnMuZmFjZWJvb2suY29tL2RvY3MvZmFjZWJvb2stbG9naW4vcGVybWlzc2lvbnMvXG4gIGNvbnN0IHdoaXRlbGlzdGVkID0gWydpZCcsICdlbWFpbCcsICduYW1lJywgJ2ZpcnN0X25hbWUnLCAnbGFzdF9uYW1lJyxcbiAgICAnbWlkZGxlX25hbWUnLCAnbmFtZV9mb3JtYXQnLCAncGljdHVyZScsICdzaG9ydF9uYW1lJ107XG5cbiAgY29uc3QgaWRlbnRpdHkgPSBhd2FpdCBnZXRJZGVudGl0eShhY2Nlc3NUb2tlbiwgd2hpdGVsaXN0ZWQpO1xuXG4gIGNvbnN0IGZpZWxkcyA9IHt9O1xuICB3aGl0ZWxpc3RlZC5mb3JFYWNoKGZpZWxkID0+IGZpZWxkc1tmaWVsZF0gPSBpZGVudGl0eVtmaWVsZF0pO1xuICBjb25zdCBzZXJ2aWNlRGF0YSA9IHtcbiAgICBhY2Nlc3NUb2tlbixcbiAgICBleHBpcmVzQXQsXG4gICAgLi4uZmllbGRzLFxuICB9O1xuXG4gIHJldHVybiB7XG4gICAgc2VydmljZURhdGEsXG4gICAgb3B0aW9uczoge3Byb2ZpbGU6IHtuYW1lOiBpZGVudGl0eS5uYW1lfX1cbiAgfTtcbn07XG5cbkFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKGFzeW5jIHJlcXVlc3QgPT4ge1xuICBpZiAocmVxdWVzdC5mYWNlYm9va1NpZ25JbiAhPT0gdHJ1ZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBmYWNlYm9va0RhdGEgPSBhd2FpdCBGYWNlYm9vay5oYW5kbGVBdXRoRnJvbUFjY2Vzc1Rva2VuKHJlcXVlc3QuYWNjZXNzVG9rZW4sICgrbmV3IERhdGUpICsgKDEwMDAgKiByZXF1ZXN0LmV4cGlyYXRpb25UaW1lKSk7XG4gIGlmICghZmFjZWJvb2tEYXRhKSByZXR1cm47XG4gIHJldHVybiBBY2NvdW50cy51cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlKCdmYWNlYm9vaycsIGZhY2Vib29rRGF0YS5zZXJ2aWNlRGF0YSwgZmFjZWJvb2tEYXRhLm9wdGlvbnMpO1xufSk7XG5cbk9BdXRoLnJlZ2lzdGVyU2VydmljZSgnZmFjZWJvb2snLCAyLCBudWxsLCBhc3luYyBxdWVyeSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2V0VG9rZW5SZXNwb25zZShxdWVyeSk7XG4gIGNvbnN0IHsgYWNjZXNzVG9rZW4gfSA9IHJlc3BvbnNlO1xuICBjb25zdCB7IGV4cGlyZXNJbiB9ID0gcmVzcG9uc2U7XG5cbiAgcmV0dXJuIEZhY2Vib29rLmhhbmRsZUF1dGhGcm9tQWNjZXNzVG9rZW4oYWNjZXNzVG9rZW4sICgrbmV3IERhdGUpICsgKDEwMDAgKiBleHBpcmVzSW4pKTtcbn0pO1xuXG5mdW5jdGlvbiBnZXRBYnNvbHV0ZVVybE9wdGlvbnMocXVlcnkpIHtcbiAgY29uc3Qgb3ZlcnJpZGVSb290VXJsRnJvbVN0YXRlUmVkaXJlY3RVcmwgPSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5bJ2ZhY2Vib29rLW9hdXRoJ10/Lm92ZXJyaWRlUm9vdFVybEZyb21TdGF0ZVJlZGlyZWN0VXJsO1xuICBpZiAoIW92ZXJyaWRlUm9vdFVybEZyb21TdGF0ZVJlZGlyZWN0VXJsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICB0cnkge1xuICAgIGNvbnN0IHN0YXRlID0gT0F1dGguX3N0YXRlRnJvbVF1ZXJ5KHF1ZXJ5KSB8fCB7fTtcbiAgICBjb25zdCByZWRpcmVjdFVybCA9IG5ldyBVUkwoc3RhdGUucmVkaXJlY3RVcmwpO1xuICAgIHJldHVybiB7XG4gICAgICByb290VXJsOiByZWRpcmVjdFVybC5vcmlnaW4sXG4gICAgfTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEZhY2Vib29rIGJlY2F1c2UgaXQgd2FzIG5vdCBhYmxlIHRvIG9idGFpbiB0aGUgcmVkaXJlY3QgdXJsIGZyb20gdGhlIHN0YXRlIGFuZCB5b3UgYXJlIHVzaW5nIG92ZXJyaWRlUm9vdFVybEZyb21TdGF0ZVJlZGlyZWN0VXJsLmAsIGVcbiAgICApO1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBAdHlwZWRlZiB7T2JqZWN0fSBVc2VyQWNjZXNzVG9rZW5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBhY2Nlc3NUb2tlbiAtIFVzZXIgYWNjZXNzIFRva2VuXG4gKiBAcHJvcGVydHkge251bWJlcn0gZXhwaXJlc0luIC0gbGlmZXRpbWUgb2YgdG9rZW4gaW4gc2Vjb25kc1xuICovXG4vKipcbiAqIEBhc3luY1xuICogQGZ1bmN0aW9uIGdldFRva2VuUmVzcG9uc2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBxdWVyeSAtIEFuIG9iamVjdCB3aXRoIHRoZSBjb2RlLlxuICogQHJldHVybnMge1Byb21pc2U8VXNlckFjY2Vzc1Rva2VuPn0gLSBQcm9taXNlIHdpdGggYW4gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGFjY2Vzc1Rva2VuIGFuZCBleHBpcmVzSW4gKGxpZmV0aW1lIG9mIHRva2VuIGluIHNlY29uZHMpXG4gKi9cbmNvbnN0IGdldFRva2VuUmVzcG9uc2UgPSBhc3luYyAocXVlcnkpID0+IHtcbiAgY29uc3QgY29uZmlnID0gYXdhaXQgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZUFzeW5jKHtcbiAgICBzZXJ2aWNlOiAnZmFjZWJvb2snLFxuICB9KTtcbiAgaWYgKCFjb25maWcpIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIGNvbnN0IGFic29sdXRlVXJsT3B0aW9ucyA9IGdldEFic29sdXRlVXJsT3B0aW9ucyhxdWVyeSk7XG4gIGNvbnN0IHJlZGlyZWN0VXJpID0gT0F1dGguX3JlZGlyZWN0VXJpKCdmYWNlYm9vaycsIGNvbmZpZywgdW5kZWZpbmVkLCBhYnNvbHV0ZVVybE9wdGlvbnMpO1xuXG4gIHJldHVybiBPQXV0aC5fZmV0Y2goXG4gICAgYGh0dHBzOi8vZ3JhcGguZmFjZWJvb2suY29tL3Yke0FQSV9WRVJTSU9OfS9vYXV0aC9hY2Nlc3NfdG9rZW5gLFxuICAgICdHRVQnLFxuICAgIHtcbiAgICAgIHF1ZXJ5UGFyYW1zOiB7XG4gICAgICAgIGNsaWVudF9pZDogY29uZmlnLmFwcElkLFxuICAgICAgICByZWRpcmVjdF91cmk6IHJlZGlyZWN0VXJpLFxuICAgICAgICBjbGllbnRfc2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpLFxuICAgICAgICBjb2RlOiBxdWVyeS5jb2RlLFxuICAgICAgfSxcbiAgICB9XG4gIClcbiAgICAudGhlbigocmVzKSA9PiByZXMuanNvbigpKVxuICAgIC50aGVuKGRhdGEgPT4ge1xuICAgICAgY29uc3QgZmJBY2Nlc3NUb2tlbiA9IGRhdGEuYWNjZXNzX3Rva2VuO1xuICAgICAgY29uc3QgZmJFeHBpcmVzID0gZGF0YS5leHBpcmVzX2luO1xuICAgICAgaWYgKCFmYkFjY2Vzc1Rva2VuKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBmYWNlYm9vayBcIiArXG4gICAgICAgICAgYC0tIGNhbid0IGZpbmQgYWNjZXNzIHRva2VuIGluIEhUVFAgcmVzcG9uc2UuICR7ZGF0YX1gKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFjY2Vzc1Rva2VuOiBmYkFjY2Vzc1Rva2VuLFxuICAgICAgICBleHBpcmVzSW46IGZiRXhwaXJlc1xuICAgICAgfTtcbiAgICB9KVxuICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICB0aHJvdyBPYmplY3QuYXNzaWduKFxuICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgYEZhaWxlZCB0byBjb21wbGV0ZSBPQXV0aCBoYW5kc2hha2Ugd2l0aCBGYWNlYm9vay4gJHtlcnIubWVzc2FnZX1gXG4gICAgICAgICksXG4gICAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9XG4gICAgICApO1xuICAgIH0pO1xufTtcblxuY29uc3QgZ2V0SWRlbnRpdHkgPSBhc3luYyAoYWNjZXNzVG9rZW4sIGZpZWxkcykgPT4ge1xuICBjb25zdCBjb25maWcgPSBhd2FpdCBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lQXN5bmMoe1xuICAgIHNlcnZpY2U6ICdmYWNlYm9vaycsXG4gIH0pO1xuICBpZiAoIWNvbmZpZykgdGhyb3cgbmV3IFNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yKCk7XG5cbiAgLy8gR2VuZXJhdGUgYXBwIHNlY3JldCBwcm9vZiB0aGF0IGlzIGEgc2hhMjU2IGhhc2ggb2YgdGhlIGFwcCBhY2Nlc3MgdG9rZW4sIHdpdGggdGhlIGFwcCBzZWNyZXQgYXMgdGhlIGtleVxuICAvLyBodHRwczovL2RldmVsb3BlcnMuZmFjZWJvb2suY29tL2RvY3MvZ3JhcGgtYXBpL3NlY3VyaW5nLXJlcXVlc3RzI2FwcHNlY3JldF9wcm9vZlxuICBjb25zdCBobWFjID0gY3J5cHRvLmNyZWF0ZUhtYWMoJ3NoYTI1NicsIE9BdXRoLm9wZW5TZWNyZXQoY29uZmlnLnNlY3JldCkpO1xuICBobWFjLnVwZGF0ZShhY2Nlc3NUb2tlbik7XG5cbiAgcmV0dXJuIE9BdXRoLl9mZXRjaChgaHR0cHM6Ly9ncmFwaC5mYWNlYm9vay5jb20vdiR7QVBJX1ZFUlNJT059L21lYCwgJ0dFVCcsIHtcbiAgICBxdWVyeVBhcmFtczoge1xuICAgICAgYWNjZXNzX3Rva2VuOiBhY2Nlc3NUb2tlbixcbiAgICAgIGFwcHNlY3JldF9wcm9vZjogaG1hYy5kaWdlc3QoJ2hleCcpLFxuICAgICAgZmllbGRzOiBmaWVsZHMuam9pbignLCcpLFxuICAgIH0sXG4gIH0pXG4gICAgLnRoZW4oKHJlcykgPT4gcmVzLmpzb24oKSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggaWRlbnRpdHkgZnJvbSBGYWNlYm9vay4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgICAgeyByZXNwb25zZTogZXJyLnJlc3BvbnNlIH1cbiAgICAgICk7XG4gICAgfSk7XG59O1xuXG5GYWNlYm9vay5yZXRyaWV2ZUNyZWRlbnRpYWwgPSAoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KSA9PlxuICBPQXV0aC5yZXRyaWV2ZUNyZWRlbnRpYWwoY3JlZGVudGlhbFRva2VuLCBjcmVkZW50aWFsU2VjcmV0KTtcbiJdfQ==
