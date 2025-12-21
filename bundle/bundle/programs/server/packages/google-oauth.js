Package["core-runtime"].queue("google-oauth",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var fetch = Package.fetch.fetch;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Google;

var require = meteorInstall({"node_modules":{"meteor":{"google-oauth":{"google_server.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/google-oauth/google_server.js                                                                        //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    let Google;
    module.link("./namespace.js", {
      default(v) {
        Google = v;
      }
    }, 0);
    let Accounts;
    module.link("meteor/accounts-base", {
      Accounts(v) {
        Accounts = v;
      }
    }, 1);
    let fetch;
    module.link("meteor/fetch", {
      fetch(v) {
        fetch = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const hasOwn = Object.prototype.hasOwnProperty;

    // https://developers.google.com/accounts/docs/OAuth2Login#userinfocall
    Google.whitelistedFields = ['id', 'email', 'verified_email', 'name', 'given_name', 'family_name', 'picture', 'locale', 'timezone', 'gender'];
    const getServiceDataFromTokens = async (tokens, callback) => {
      const {
        accessToken,
        idToken
      } = tokens;
      const scopes = await getScopes(accessToken).catch(err => {
        const error = Object.assign(new Error("Failed to fetch tokeninfo from Google. ".concat(err.message)), {
          response: err.response
        });
        callback && callback(error);
        throw error;
      });
      let identity = await getIdentity(accessToken).catch(err => {
        const error = Object.assign(new Error("Failed to fetch identity from Google. ".concat(err.message)), {
          response: err.response
        });
        callback && callback(error);
        throw error;
      });
      const serviceData = {
        accessToken,
        idToken,
        scope: scopes
      };
      if (hasOwn.call(tokens, 'expiresIn')) {
        serviceData.expiresAt = Date.now() + 1000 * parseInt(tokens.expiresIn, 10);
      }
      const fields = Object.create(null);
      Google.whitelistedFields.forEach(function (name) {
        if (hasOwn.call(identity, name)) {
          fields[name] = identity[name];
        }
      });
      Object.assign(serviceData, fields);

      // only set the token in serviceData if it's there. this ensures
      // that we don't lose old ones (since we only get this on the first
      // log in attempt)
      if (tokens.refreshToken) {
        serviceData.refreshToken = tokens.refreshToken;
      }
      const returnValue = {
        serviceData,
        options: {
          profile: {
            name: identity.name
          }
        }
      };
      callback && callback(undefined, returnValue);
      return returnValue;
    };
    Accounts.registerLoginHandler(async request => {
      if (request.googleSignIn !== true) {
        return;
      }
      const tokens = {
        accessToken: request.accessToken,
        refreshToken: request.refreshToken,
        idToken: request.idToken
      };
      if (request.serverAuthCode) {
        Object.assign(tokens, await getTokens({
          code: request.serverAuthCode
        }));
      }
      let result;
      try {
        result = await getServiceDataFromTokens(tokens);
      } catch (err) {
        throw Object.assign(new Error("Failed to complete OAuth handshake with Google. ".concat(err.message)), {
          response: err.response
        });
      }
      return Accounts.updateOrCreateUserFromExternalService('google', _objectSpread({
        id: request.userId,
        idToken: request.idToken,
        accessToken: request.accessToken,
        email: request.email,
        picture: request.imageUrl
      }, result.serviceData), result.options);
    });

    // returns an object containing:
    // - accessToken
    // - expiresIn: lifetime of token in seconds
    // - refreshToken, if this is the first authorization request
    const getTokens = async (query, callback) => {
      const config = await ServiceConfiguration.configurations.findOneAsync({
        service: 'google'
      });
      if (!config) throw new ServiceConfiguration.ConfigError();
      const content = new URLSearchParams({
        code: query.code,
        client_id: config.clientId,
        client_secret: OAuth.openSecret(config.secret),
        redirect_uri: OAuth._redirectUri('google', config),
        grant_type: 'authorization_code'
      });
      const request = await OAuth._fetch('https://accounts.google.com/o/oauth2/token', 'POST', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: content
      });
      const response = await request.json();
      if (response.error) {
        // if the http response was a json object with an error attribute
        callback && callback(response.error);
        throw new Meteor.Error("Failed to complete OAuth handshake with Google. ".concat(response.error));
      } else {
        const data = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresIn: response.expires_in,
          idToken: response.id_token
        };
        callback && callback(undefined, data);
        return data;
      }
    };
    const getServiceData = async query => getServiceDataFromTokens(await getTokens(query));
    OAuth.registerService('google', 2, null, getServiceData);
    const getIdentity = async (accessToken, callback) => {
      const content = new URLSearchParams({
        access_token: accessToken
      });
      let response;
      try {
        const request = await OAuth._fetch("https://www.googleapis.com/oauth2/v1/userinfo?".concat(content.toString()), 'GET', {
          headers: {
            Accept: 'application/json'
          }
        });
        response = await request.json();
      } catch (e) {
        callback && callback(e);
        throw new Meteor.Error(e.reason);
      }
      callback && callback(undefined, response);
      return response;
    };
    const getScopes = async (accessToken, callback) => {
      const content = new URLSearchParams({
        access_token: accessToken
      });
      let response;
      try {
        const request = await OAuth._fetch("https://www.googleapis.com/oauth2/v1/tokeninfo?".concat(content.toString()), 'GET', {
          headers: {
            Accept: 'application/json'
          }
        });
        response = await request.json();
      } catch (e) {
        callback && callback(e);
        throw new Meteor.Error(e.reason);
      }
      callback && callback(undefined, response.scope.split(' '));
      return response.scope.split(' ');
    };
    Google.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"namespace.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                               //
// packages/google-oauth/namespace.js                                                                            //
//                                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                 //
!function (module1) {
  // The module.exports object of this module becomes the Google namespace
  // for other modules in this package.
  Google = module.exports;

  // So that api.export finds the "Google" property.
  Google.Google = Google;
}.call(this, module);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Google: Google
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/google-oauth/google_server.js",
    "/node_modules/meteor/google-oauth/namespace.js"
  ],
  mainModulePath: "/node_modules/meteor/google-oauth/namespace.js"
}});

//# sourceURL=meteor://💻app/packages/google-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZ29vZ2xlLW9hdXRoL2dvb2dsZV9zZXJ2ZXIuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2dvb2dsZS1vYXV0aC9uYW1lc3BhY2UuanMiXSwibmFtZXMiOlsiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIkdvb2dsZSIsIkFjY291bnRzIiwiZmV0Y2giLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsImhhc093biIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5Iiwid2hpdGVsaXN0ZWRGaWVsZHMiLCJnZXRTZXJ2aWNlRGF0YUZyb21Ub2tlbnMiLCJ0b2tlbnMiLCJjYWxsYmFjayIsImFjY2Vzc1Rva2VuIiwiaWRUb2tlbiIsInNjb3BlcyIsImdldFNjb3BlcyIsImNhdGNoIiwiZXJyIiwiZXJyb3IiLCJhc3NpZ24iLCJFcnJvciIsImNvbmNhdCIsIm1lc3NhZ2UiLCJyZXNwb25zZSIsImlkZW50aXR5IiwiZ2V0SWRlbnRpdHkiLCJzZXJ2aWNlRGF0YSIsInNjb3BlIiwiY2FsbCIsImV4cGlyZXNBdCIsIkRhdGUiLCJub3ciLCJwYXJzZUludCIsImV4cGlyZXNJbiIsImZpZWxkcyIsImNyZWF0ZSIsImZvckVhY2giLCJuYW1lIiwicmVmcmVzaFRva2VuIiwicmV0dXJuVmFsdWUiLCJvcHRpb25zIiwicHJvZmlsZSIsInVuZGVmaW5lZCIsInJlZ2lzdGVyTG9naW5IYW5kbGVyIiwicmVxdWVzdCIsImdvb2dsZVNpZ25JbiIsInNlcnZlckF1dGhDb2RlIiwiZ2V0VG9rZW5zIiwiY29kZSIsInJlc3VsdCIsInVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UiLCJpZCIsInVzZXJJZCIsImVtYWlsIiwicGljdHVyZSIsImltYWdlVXJsIiwicXVlcnkiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZUFzeW5jIiwic2VydmljZSIsIkNvbmZpZ0Vycm9yIiwiY29udGVudCIsIlVSTFNlYXJjaFBhcmFtcyIsImNsaWVudF9pZCIsImNsaWVudElkIiwiY2xpZW50X3NlY3JldCIsIk9BdXRoIiwib3BlblNlY3JldCIsInNlY3JldCIsInJlZGlyZWN0X3VyaSIsIl9yZWRpcmVjdFVyaSIsImdyYW50X3R5cGUiLCJfZmV0Y2giLCJoZWFkZXJzIiwiQWNjZXB0IiwiYm9keSIsImpzb24iLCJNZXRlb3IiLCJkYXRhIiwiYWNjZXNzX3Rva2VuIiwicmVmcmVzaF90b2tlbiIsImV4cGlyZXNfaW4iLCJpZF90b2tlbiIsImdldFNlcnZpY2VEYXRhIiwicmVnaXN0ZXJTZXJ2aWNlIiwidG9TdHJpbmciLCJlIiwicmVhc29uIiwic3BsaXQiLCJyZXRyaWV2ZUNyZWRlbnRpYWwiLCJjcmVkZW50aWFsVG9rZW4iLCJjcmVkZW50aWFsU2VjcmV0IiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxhQUFhO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLHNDQUFzQyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDSixhQUFhLEdBQUNJLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBckcsSUFBSUMsTUFBTTtJQUFDSixNQUFNLENBQUNDLElBQUksQ0FBQyxnQkFBZ0IsRUFBQztNQUFDQyxPQUFPQSxDQUFDQyxDQUFDLEVBQUM7UUFBQ0MsTUFBTSxHQUFDRCxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUUsUUFBUTtJQUFDTCxNQUFNLENBQUNDLElBQUksQ0FBQyxzQkFBc0IsRUFBQztNQUFDSSxRQUFRQSxDQUFDRixDQUFDLEVBQUM7UUFBQ0UsUUFBUSxHQUFDRixDQUFDO01B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RyxDQUFDLENBQUM7TUFDMUQsT0FBT25FLFFBQVEsQ0FBQ0ksS0FBSyxDQUFDK0QsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUNsQyxDQUFDO0lBRUQxRixNQUFNLENBQUMyRixrQkFBa0IsR0FBRyxDQUFDQyxlQUFlLEVBQUVDLGdCQUFnQixLQUM1RHpCLEtBQUssQ0FBQ3VCLGtCQUFrQixDQUFDQyxlQUFlLEVBQUVDLGdCQUFnQixDQUFDO0lBQUNDLHNCQUFBO0VBQUEsU0FBQUMsV0FBQTtJQUFBLE9BQUFELHNCQUFBLENBQUFDLFdBQUE7RUFBQTtFQUFBRCxzQkFBQTtBQUFBO0VBQUFFLElBQUE7RUFBQUMsS0FBQTtBQUFBLEc7Ozs7Ozs7Ozs7OztFQ3BOOUQ7RUFDQTtFQUNBakcsTUFBTSxHQUFHSixNQUFNLENBQUNzRyxPQUFPOztFQUV2QjtFQUNBbEcsTUFBTSxDQUFDQSxNQUFNLEdBQUdBLE1BQU07QUFBQyxFQUFBNEIsSUFBQSxPQUFBaEMsTUFBQSxFIiwiZmlsZSI6Ii9wYWNrYWdlcy9nb29nbGUtb2F1dGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgR29vZ2xlIGZyb20gJy4vbmFtZXNwYWNlLmpzJztcbmltcG9ydCB7IEFjY291bnRzIH0gZnJvbSAnbWV0ZW9yL2FjY291bnRzLWJhc2UnO1xuaW1wb3J0IHsgZmV0Y2ggfSBmcm9tICdtZXRlb3IvZmV0Y2gnO1xuXG5jb25zdCBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hY2NvdW50cy9kb2NzL09BdXRoMkxvZ2luI3VzZXJpbmZvY2FsbFxuR29vZ2xlLndoaXRlbGlzdGVkRmllbGRzID0gW1xuICAnaWQnLFxuICAnZW1haWwnLFxuICAndmVyaWZpZWRfZW1haWwnLFxuICAnbmFtZScsXG4gICdnaXZlbl9uYW1lJyxcbiAgJ2ZhbWlseV9uYW1lJyxcbiAgJ3BpY3R1cmUnLFxuICAnbG9jYWxlJyxcbiAgJ3RpbWV6b25lJyxcbiAgJ2dlbmRlcicsXG5dO1xuXG5jb25zdCBnZXRTZXJ2aWNlRGF0YUZyb21Ub2tlbnMgPSBhc3luYyAodG9rZW5zLCBjYWxsYmFjaykgPT4ge1xuICBjb25zdCB7IGFjY2Vzc1Rva2VuLCBpZFRva2VuIH0gPSB0b2tlbnM7XG4gIGNvbnN0IHNjb3BlcyA9IGF3YWl0IGdldFNjb3BlcyhhY2Nlc3NUb2tlbikuY2F0Y2goKGVycikgPT4ge1xuICAgIGNvbnN0IGVycm9yID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIG5ldyBFcnJvcihgRmFpbGVkIHRvIGZldGNoIHRva2VuaW5mbyBmcm9tIEdvb2dsZS4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9XG4gICAgKTtcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH0pO1xuXG4gIGxldCBpZGVudGl0eSA9IGF3YWl0IGdldElkZW50aXR5KGFjY2Vzc1Rva2VuKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgY29uc3QgZXJyb3IgPSBPYmplY3QuYXNzaWduKFxuICAgICAgbmV3IEVycm9yKGBGYWlsZWQgdG8gZmV0Y2ggaWRlbnRpdHkgZnJvbSBHb29nbGUuICR7ZXJyLm1lc3NhZ2V9YCksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICk7XG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9KTtcbiAgY29uc3Qgc2VydmljZURhdGEgPSB7XG4gICAgYWNjZXNzVG9rZW4sXG4gICAgaWRUb2tlbixcbiAgICBzY29wZTogc2NvcGVzLFxuICB9O1xuXG4gIGlmIChoYXNPd24uY2FsbCh0b2tlbnMsICdleHBpcmVzSW4nKSkge1xuICAgIHNlcnZpY2VEYXRhLmV4cGlyZXNBdCA9IERhdGUubm93KCkgKyAxMDAwICogcGFyc2VJbnQodG9rZW5zLmV4cGlyZXNJbiwgMTApO1xuICB9XG5cbiAgY29uc3QgZmllbGRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgR29vZ2xlLndoaXRlbGlzdGVkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZiAoaGFzT3duLmNhbGwoaWRlbnRpdHksIG5hbWUpKSB7XG4gICAgICBmaWVsZHNbbmFtZV0gPSBpZGVudGl0eVtuYW1lXTtcbiAgICB9XG4gIH0pO1xuXG4gIE9iamVjdC5hc3NpZ24oc2VydmljZURhdGEsIGZpZWxkcyk7XG5cbiAgLy8gb25seSBzZXQgdGhlIHRva2VuIGluIHNlcnZpY2VEYXRhIGlmIGl0J3MgdGhlcmUuIHRoaXMgZW5zdXJlc1xuICAvLyB0aGF0IHdlIGRvbid0IGxvc2Ugb2xkIG9uZXMgKHNpbmNlIHdlIG9ubHkgZ2V0IHRoaXMgb24gdGhlIGZpcnN0XG4gIC8vIGxvZyBpbiBhdHRlbXB0KVxuICBpZiAodG9rZW5zLnJlZnJlc2hUb2tlbikge1xuICAgIHNlcnZpY2VEYXRhLnJlZnJlc2hUb2tlbiA9IHRva2Vucy5yZWZyZXNoVG9rZW47XG4gIH1cbiAgY29uc3QgcmV0dXJuVmFsdWUgPSB7XG4gICAgc2VydmljZURhdGEsXG4gICAgb3B0aW9uczoge1xuICAgICAgcHJvZmlsZToge1xuICAgICAgICBuYW1lOiBpZGVudGl0eS5uYW1lLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xuXG4gIGNhbGxiYWNrICYmIGNhbGxiYWNrKHVuZGVmaW5lZCwgcmV0dXJuVmFsdWUpO1xuXG4gIHJldHVybiByZXR1cm5WYWx1ZTtcbn07XG5cbkFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKGFzeW5jIChyZXF1ZXN0KSA9PiB7XG4gIGlmIChyZXF1ZXN0Lmdvb2dsZVNpZ25JbiAhPT0gdHJ1ZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCB0b2tlbnMgPSB7XG4gICAgYWNjZXNzVG9rZW46IHJlcXVlc3QuYWNjZXNzVG9rZW4sXG4gICAgcmVmcmVzaFRva2VuOiByZXF1ZXN0LnJlZnJlc2hUb2tlbixcbiAgICBpZFRva2VuOiByZXF1ZXN0LmlkVG9rZW4sXG4gIH07XG5cbiAgaWYgKHJlcXVlc3Quc2VydmVyQXV0aENvZGUpIHtcbiAgICBPYmplY3QuYXNzaWduKFxuICAgICAgdG9rZW5zLFxuICAgICAgYXdhaXQgZ2V0VG9rZW5zKHtcbiAgICAgICAgY29kZTogcmVxdWVzdC5zZXJ2ZXJBdXRoQ29kZSxcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGxldCByZXN1bHQ7XG4gIHRyeSB7XG4gICAgcmVzdWx0ID0gYXdhaXQgZ2V0U2VydmljZURhdGFGcm9tVG9rZW5zKHRva2Vucyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoXG4gICAgICAgIGBGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggR29vZ2xlLiAke2Vyci5tZXNzYWdlfWBcbiAgICAgICksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIEFjY291bnRzLnVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UoXG4gICAgJ2dvb2dsZScsXG4gICAge1xuICAgICAgaWQ6IHJlcXVlc3QudXNlcklkLFxuICAgICAgaWRUb2tlbjogcmVxdWVzdC5pZFRva2VuLFxuICAgICAgYWNjZXNzVG9rZW46IHJlcXVlc3QuYWNjZXNzVG9rZW4sXG4gICAgICBlbWFpbDogcmVxdWVzdC5lbWFpbCxcbiAgICAgIHBpY3R1cmU6IHJlcXVlc3QuaW1hZ2VVcmwsXG4gICAgICAuLi5yZXN1bHQuc2VydmljZURhdGEsXG4gICAgfSxcbiAgICByZXN1bHQub3B0aW9uc1xuICApO1xufSk7XG5cbi8vIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmc6XG4vLyAtIGFjY2Vzc1Rva2VuXG4vLyAtIGV4cGlyZXNJbjogbGlmZXRpbWUgb2YgdG9rZW4gaW4gc2Vjb25kc1xuLy8gLSByZWZyZXNoVG9rZW4sIGlmIHRoaXMgaXMgdGhlIGZpcnN0IGF1dGhvcml6YXRpb24gcmVxdWVzdFxuY29uc3QgZ2V0VG9rZW5zID0gYXN5bmMgKHF1ZXJ5LCBjYWxsYmFjaykgPT4ge1xuICBjb25zdCBjb25maWcgPSBhd2FpdCBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy5maW5kT25lQXN5bmMoe1xuICAgIHNlcnZpY2U6ICdnb29nbGUnLFxuICB9KTtcbiAgaWYgKCFjb25maWcpIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIGNvbnN0IGNvbnRlbnQgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICBjb2RlOiBxdWVyeS5jb2RlLFxuICAgIGNsaWVudF9pZDogY29uZmlnLmNsaWVudElkLFxuICAgIGNsaWVudF9zZWNyZXQ6IE9BdXRoLm9wZW5TZWNyZXQoY29uZmlnLnNlY3JldCksXG4gICAgcmVkaXJlY3RfdXJpOiBPQXV0aC5fcmVkaXJlY3RVcmkoJ2dvb2dsZScsIGNvbmZpZyksXG4gICAgZ3JhbnRfdHlwZTogJ2F1dGhvcml6YXRpb25fY29kZScsXG4gIH0pO1xuICBjb25zdCByZXF1ZXN0ID0gYXdhaXQgT0F1dGguX2ZldGNoKCdodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvdG9rZW4nLCAnUE9TVCcsIHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICB9LFxuICAgIGJvZHk6IGNvbnRlbnQsXG4gIH0pO1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuXG4gIGlmIChyZXNwb25zZS5lcnJvcikge1xuICAgIC8vIGlmIHRoZSBodHRwIHJlc3BvbnNlIHdhcyBhIGpzb24gb2JqZWN0IHdpdGggYW4gZXJyb3IgYXR0cmlidXRlXG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2socmVzcG9uc2UuZXJyb3IpO1xuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEdvb2dsZS4gJHtyZXNwb25zZS5lcnJvcn1gXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgYWNjZXNzVG9rZW46IHJlc3BvbnNlLmFjY2Vzc190b2tlbixcbiAgICAgIHJlZnJlc2hUb2tlbjogcmVzcG9uc2UucmVmcmVzaF90b2tlbixcbiAgICAgIGV4cGlyZXNJbjogcmVzcG9uc2UuZXhwaXJlc19pbixcbiAgICAgIGlkVG9rZW46IHJlc3BvbnNlLmlkX3Rva2VuLFxuICAgIH07XG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2sodW5kZWZpbmVkLCBkYXRhKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxufTtcblxuY29uc3QgZ2V0U2VydmljZURhdGEgPSBhc3luYyAocXVlcnkpID0+XG4gIGdldFNlcnZpY2VEYXRhRnJvbVRva2Vucyhhd2FpdCBnZXRUb2tlbnMocXVlcnkpKTtcblxuT0F1dGgucmVnaXN0ZXJTZXJ2aWNlKCdnb29nbGUnLCAyLCBudWxsLCBnZXRTZXJ2aWNlRGF0YSk7XG5cbmNvbnN0IGdldElkZW50aXR5ID0gYXN5bmMgKGFjY2Vzc1Rva2VuLCBjYWxsYmFjaykgPT4ge1xuICBjb25zdCBjb250ZW50ID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7IGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW4gfSk7XG4gIGxldCByZXNwb25zZTtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXdhaXQgT0F1dGguX2ZldGNoKFxuICAgICAgYGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS91c2VyaW5mbz8ke2NvbnRlbnQudG9TdHJpbmcoKX1gLFxuICAgICAgJ0dFVCcsXG4gICAgICB7XG4gICAgICAgIGhlYWRlcnM6IHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICAgIH1cbiAgICApO1xuICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjYWxsYmFjayAmJiBjYWxsYmFjayhlKTtcbiAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKGUucmVhc29uKTtcbiAgfVxuICBjYWxsYmFjayAmJiBjYWxsYmFjayh1bmRlZmluZWQsIHJlc3BvbnNlKTtcbiAgcmV0dXJuIHJlc3BvbnNlO1xufTtcblxuY29uc3QgZ2V0U2NvcGVzID0gYXN5bmMgKGFjY2Vzc1Rva2VuLCBjYWxsYmFjaykgPT4ge1xuICBjb25zdCBjb250ZW50ID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7IGFjY2Vzc190b2tlbjogYWNjZXNzVG9rZW4gfSk7XG4gIGxldCByZXNwb25zZTtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXdhaXQgT0F1dGguX2ZldGNoKFxuICAgICAgYGh0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL29hdXRoMi92MS90b2tlbmluZm8/JHtjb250ZW50LnRvU3RyaW5nKCl9YCxcbiAgICAgICdHRVQnLFxuICAgICAge1xuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nIH0sXG4gICAgICB9XG4gICAgKTtcbiAgICByZXNwb25zZSA9IGF3YWl0IHJlcXVlc3QuanNvbigpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgY2FsbGJhY2sgJiYgY2FsbGJhY2soZSk7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcihlLnJlYXNvbik7XG4gIH1cbiAgY2FsbGJhY2sgJiYgY2FsbGJhY2sodW5kZWZpbmVkLCByZXNwb25zZS5zY29wZS5zcGxpdCgnICcpKTtcbiAgcmV0dXJuIHJlc3BvbnNlLnNjb3BlLnNwbGl0KCcgJyk7XG59O1xuXG5Hb29nbGUucmV0cmlldmVDcmVkZW50aWFsID0gKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCkgPT5cbiAgT0F1dGgucmV0cmlldmVDcmVkZW50aWFsKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCk7XG4iLCIvLyBUaGUgbW9kdWxlLmV4cG9ydHMgb2JqZWN0IG9mIHRoaXMgbW9kdWxlIGJlY29tZXMgdGhlIEdvb2dsZSBuYW1lc3BhY2Vcbi8vIGZvciBvdGhlciBtb2R1bGVzIGluIHRoaXMgcGFja2FnZS5cbkdvb2dsZSA9IG1vZHVsZS5leHBvcnRzO1xuXG4vLyBTbyB0aGF0IGFwaS5leHBvcnQgZmluZHMgdGhlIFwiR29vZ2xlXCIgcHJvcGVydHkuXG5Hb29nbGUuR29vZ2xlID0gR29vZ2xlO1xuIl19
