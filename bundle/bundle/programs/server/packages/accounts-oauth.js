Package["core-runtime"].queue("accounts-oauth",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var Accounts = Package['accounts-base'].Accounts;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-oauth":{"oauth_common.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-oauth/oauth_common.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    Accounts.oauth = {};
    const services = {};
    const hasOwn = Object.prototype.hasOwnProperty;

    // Helper for registering OAuth based accounts packages.
    // On the server, adds an index to the user collection.
    Accounts.oauth.registerService = name => {
      if (hasOwn.call(services, name)) throw new Error("Duplicate service: ".concat(name));
      services[name] = true;
      if (Meteor.server) {
        // Accounts.updateOrCreateUserFromExternalService does a lookup by this id,
        // so this should be a unique index. You might want to add indexes for other
        // fields returned by your service (eg services.github.login) but you can do
        // that in your app.
        Meteor.users.createIndexAsync("services.".concat(name, ".id"), {
          unique: true,
          sparse: true
        });
      }
    };

    // Removes a previously registered service.
    // This will disable logging in with this service, and serviceNames() will not
    // contain it.
    // It's worth noting that already logged in users will remain logged in unless
    // you manually expire their sessions.
    Accounts.oauth.unregisterService = name => {
      if (!hasOwn.call(services, name)) throw new Error("Service not found: ".concat(name));
      delete services[name];
    };
    Accounts.oauth.serviceNames = () => Object.keys(services);

    // loginServiceConfiguration and ConfigError are maintained for backwards compatibility
    Meteor.startup(() => {
      var _Meteor$settings, _Meteor$settings$pack;
      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      Accounts.loginServiceConfiguration = ServiceConfiguration.configurations;
      Accounts.ConfigError = ServiceConfiguration.ConfigError;
      const settings = (_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : _Meteor$settings$pack['accounts-base'];
      if (settings) {
        if (settings.oauthSecretKey) {
          if (!Package['oauth-encryption']) {
            throw new Error('The oauth-encryption package must be loaded to set oauthSecretKey');
          }
          Package['oauth-encryption'].OAuthEncryption.loadKey(settings.oauthSecretKey);
          delete settings.oauthSecretKey;
        }
      }
    });
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

},"oauth_server.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/accounts-oauth/oauth_server.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    var _Package$oauthEncryp;
    let Meteor;
    module.link("meteor/meteor", {
      Meteor(v) {
        Meteor = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Listen to calls to `login` with an oauth option set. This is where
    // users actually get logged in to meteor via oauth.
    Accounts.registerLoginHandler(async options => {
      if (!options.oauth) return undefined; // don't handle

      check(options.oauth, {
        credentialToken: String,
        // When an error occurs while retrieving the access token, we store
        // the error in the pending credentials table, with a secret of
        // null. The client can call the login method with a secret of null
        // to retrieve the error.
        credentialSecret: Match.OneOf(null, String)
      });
      const result = await OAuth.retrieveCredential(options.oauth.credentialToken, options.oauth.credentialSecret);
      if (!result) {
        // OAuth credentialToken is not recognized, which could be either
        // because the popup was closed by the user before completion, or
        // some sort of error where the oauth provider didn't talk to our
        // server correctly and closed the popup somehow.
        //
        // We assume it was user canceled and report it as such, using a
        // numeric code that the client recognizes (XXX this will get
        // replaced by a symbolic error code at some point
        // https://trello.com/c/kMkw800Z/53-official-ddp-specification). This
        // will mask failures where things are misconfigured such that the
        // server doesn't see the request but does close the window. This
        // seems unlikely.
        //
        // XXX we want `type` to be the service name such as "facebook"
        return {
          type: "oauth",
          error: new Meteor.Error(Accounts.LoginCancelledError.numericError, "No matching login attempt found")
        };
      }
      if (result instanceof Error)
        // We tried to login, but there was a fatal error. Report it back
        // to the user.
        throw result;else {
        if (!Accounts.oauth.serviceNames().includes(result.serviceName)) {
          // serviceName was not found in the registered services list.
          // This could happen because the service never registered itself or
          // unregisterService was called on it.
          return {
            type: "oauth",
            error: new Meteor.Error(Accounts.LoginCancelledError.numericError, "No registered oauth service found for: ".concat(result.serviceName))
          };
        }
        return Accounts.updateOrCreateUserFromExternalService(result.serviceName, result.serviceData, result.options);
      }
    });

    ///
    /// OAuth Encryption Support
    ///

    const OAuthEncryption = (_Package$oauthEncryp = Package["oauth-encryption"]) === null || _Package$oauthEncryp === void 0 ? void 0 : _Package$oauthEncryp.OAuthEncryption;
    const usingOAuthEncryption = () => {
      return OAuthEncryption === null || OAuthEncryption === void 0 ? void 0 : OAuthEncryption.keyIsLoaded();
    };

    // Encrypt unencrypted login service secrets when oauth-encryption is
    // added.
    //
    // XXX For the oauthSecretKey to be available here at startup, the
    // developer must call Accounts.config({oauthSecretKey: ...}) at load
    // time, instead of in a Meteor.startup block, because the startup
    // block in the app code will run after this accounts-base startup
    // block.  Perhaps we need a post-startup callback?

    Meteor.startup(() => {
      if (!usingOAuthEncryption()) {
        return;
      }
      const {
        ServiceConfiguration
      } = Package['service-configuration'];
      ServiceConfiguration.configurations.find({
        $and: [{
          secret: {
            $exists: true
          }
        }, {
          "secret.algorithm": {
            $exists: false
          }
        }]
      }).forEachAsync(async config => {
        await ServiceConfiguration.configurations.updateAsync(config._id, {
          $set: {
            secret: OAuthEncryption.seal(config.secret)
          }
        });
      });
    });
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
    "/node_modules/meteor/accounts-oauth/oauth_common.js",
    "/node_modules/meteor/accounts-oauth/oauth_server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/accounts-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtb2F1dGgvb2F1dGhfY29tbW9uLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hY2NvdW50cy1vYXV0aC9vYXV0aF9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiTWV0ZW9yIiwibW9kdWxlIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIkFjY291bnRzIiwib2F1dGgiLCJzZXJ2aWNlcyIsImhhc093biIsIk9iamVjdCIsInByb3RvdHlwZSIsImhhc093blByb3BlcnR5IiwicmVnaXN0ZXJTZXJ2aWNlIiwibmFtZSIsImNhbGwiLCJFcnJvciIsImNvbmNhdCIsInNlcnZlciIsInVzZXJzIiwiY3JlYXRlSW5kZXhBc3luYyIsInVuaXF1ZSIsInNwYXJzZSIsInVucmVnaXN0ZXJTZXJ2aWNlIiwic2VydmljZU5hbWVzIiwia2V5cyIsInN0YXJ0dXAiLCJfTWV0ZW9yJHNldHRpbmdzIiwiX01ldGVvciRzZXR0aW5ncyRwYWNrIiwiU2VydmljZUNvbmZpZ3VyYXRpb24iLCJQYWNrYWdlIiwibG9naW5TZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiQ29uZmlnRXJyb3IiLCJzZXR0aW5ncyIsInBhY2thZ2VzIiwib2F1dGhTZWNyZXRLZXkiLCJPQXV0aEVuY3J5cHRpb24iLCJsb2FkS2V5IiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwicmVnaXN0ZXJMb2dpbkhhbmRsZXIiLCJvcHRpb25zIiwidW5kZWZpbmVkIiwiY2hlY2siLCJjcmVkZW50aWFsVG9rZW4iLCJTdHJpbmciLCJjcmVkZW50aWFsU2VjcmV0IiwiTWF0Y2giLCJPbmVPZiIsInJlc3VsdCIsIk9BdXRoIiwicmV0cmlldmVDcmVkZW50aWFsIiwidHlwZSIsImVycm9yIiwiTG9naW5DYW5jZWxsZWRFcnJvciIsIm51bWVyaWNFcnJvciIsImluY2x1ZGVzIiwic2VydmljZU5hbWUiLCJ1cGRhdGVPckNyZWF0ZVVzZXJGcm9tRXh0ZXJuYWxTZXJ2aWNlIiwic2VydmljZURhdGEiLCJfUGFja2FnZSRvYXV0aEVuY3J5cCIsInVzaW5nT0F1dGhFbmNyeXB0aW9uIiwia2V5SXNMb2FkZWQiLCJmaW5kIiwiJGFuZCIsInNlY3JldCIsIiRleGlzdHMiLCJmb3JFYWNoQXN5bmMiLCJjb25maWciLCJ1cGRhdGVBc3luYyIsIl9pZCIsIiRzZXQiLCJzZWFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxNQUFNO0lBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLGVBQWUsRUFBQztNQUFDRixNQUFNQSxDQUFDRyxDQUFDLEVBQUM7UUFBQ0gsTUFBTSxHQUFDRyxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUMsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTUEsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUM7SUFFNUhDLFFBQVEsQ0FBQ0MsS0FBSyxHQUFHLENBQUMsQ0FBQztJQUVuQixNQUFNQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLE1BQU1DLE1BQU0sR0FBR0MsTUFBTSxDQUFDQyxTQUFTLENBQUNDLGNBQWM7O0lBRTlDO0lBQ0E7SUFDQU4sUUFBUSxDQUFDQyxLQUFLLENBQUNNLGVBQWUsR0FBR0MsSUFBSSxJQUFJO01BQ3ZDLElBQUlMLE1BQU0sQ0FBQ00sSUFBSSxDQUFDUCxRQUFRLEVBQUVNLElBQUksQ0FBQyxFQUM3QixNQUFNLElBQUlFLEtBQUssdUJBQUFDLE1BQUEsQ0FBdUJILElBQUksQ0FBRSxDQUFDO01BQy9DTixRQUFRLENBQUNNLElBQUksQ0FBQyxHQUFHLElBQUk7TUFFckIsSUFBSWIsTUFBTSxDQUFDaUIsTUFBTSxFQUFFO1FBQ2pCO1FBQ0E7UUFDQTtRQUNBO1FBQ0FqQixNQUFNLENBQUNrQixLQUFLLENBQUNDLGdCQUFnQixhQUFBSCxN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SUFFRDtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBOztJQUVBaEUsTUFBTSxDQUFDeUIsT0FBTyxDQUFDLE1BQU07TUFDbkIsSUFBSSxDQUFFc0Msb0JBQW9CLENBQUMsQ0FBQyxFQUFFO1FBQzVCO01BQ0Y7TUFFQSxNQUFNO1FBQUVuQztNQUFxQixDQUFDLEdBQUdDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztNQUVqRUQsb0JBQW9CLENBQUNHLGNBQWMsQ0FBQ2tDLElBQUksQ0FBQztRQUN2Q0MsSUFBSSxFQUFFLENBQUM7VUFDTEMsTUFBTSxFQUFFO1lBQUVDLE9BQU8sRUFBRTtVQUFLO1FBQzFCLENBQUMsRUFBRTtVQUNELGtCQUFrQixFQUFFO1lBQUVBLE9BQU8sRUFBRTtVQUFNO1FBQ3ZDLENBQUM7TUFDSCxDQUFDLENBQUMsQ0FBQ0MsWUFBWSxDQUFDLE1BQU9DLE1BQU0sSUFBSztRQUNoQyxNQUFNMUMsb0JBQW9CLENBQUNHLGNBQWMsQ0FBQ3dDLFdBQVcsQ0FBQ0QsTUFBTSxDQUFDRSxHQUFHLEVBQUU7VUFDaEVDLElBQUksRUFBRTtZQUNKTixNQUFNLEVBQUUvQixlQUFlLENBQUNzQyxJQUFJLENBQUNKLE1BQU0sQ0FBQ0gsTUFBTTtVQUM1QztRQUNGLENBQUMsQ0FBQztNQUNKLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUFDN0Isc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvYWNjb3VudHMtb2F1dGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuQWNjb3VudHMub2F1dGggPSB7fTtcblxuY29uc3Qgc2VydmljZXMgPSB7fTtcbmNvbnN0IGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIEhlbHBlciBmb3IgcmVnaXN0ZXJpbmcgT0F1dGggYmFzZWQgYWNjb3VudHMgcGFja2FnZXMuXG4vLyBPbiB0aGUgc2VydmVyLCBhZGRzIGFuIGluZGV4IHRvIHRoZSB1c2VyIGNvbGxlY3Rpb24uXG5BY2NvdW50cy5vYXV0aC5yZWdpc3RlclNlcnZpY2UgPSBuYW1lID0+IHtcbiAgaWYgKGhhc093bi5jYWxsKHNlcnZpY2VzLCBuYW1lKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYER1cGxpY2F0ZSBzZXJ2aWNlOiAke25hbWV9YCk7XG4gIHNlcnZpY2VzW25hbWVdID0gdHJ1ZTtcblxuICBpZiAoTWV0ZW9yLnNlcnZlcikge1xuICAgIC8vIEFjY291bnRzLnVwZGF0ZU9yQ3JlYXRlVXNlckZyb21FeHRlcm5hbFNlcnZpY2UgZG9lcyBhIGxvb2t1cCBieSB0aGlzIGlkLFxuICAgIC8vIHNvIHRoaXMgc2hvdWxkIGJlIGEgdW5pcXVlIGluZGV4LiBZb3UgbWlnaHQgd2FudCB0byBhZGQgaW5kZXhlcyBmb3Igb3RoZXJcbiAgICAvLyBmaWVsZHMgcmV0dXJuZWQgYnkgeW91ciBzZXJ2aWNlIChlZyBzZXJ2aWNlcy5naXRodWIubG9naW4pIGJ1dCB5b3UgY2FuIGRvXG4gICAgLy8gdGhhdCBpbiB5b3VyIGFwcC5cbiAgICBNZXRlb3IudXNlcnMuY3JlYXRlSW5kZXhBc3luYyhgc2VydmljZXMuJHtuYW1lfS5pZGAsIHt1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZX0pO1xuICB9XG59O1xuXG4vLyBSZW1vdmVzIGEgcHJldmlvdXNseSByZWdpc3RlcmVkIHNlcnZpY2UuXG4vLyBUaGlzIHdpbGwgZGlzYWJsZSBsb2dnaW5nIGluIHdpdGggdGhpcyBzZXJ2aWNlLCBhbmQgc2VydmljZU5hbWVzKCkgd2lsbCBub3Rcbi8vIGNvbnRhaW4gaXQuXG4vLyBJdCdzIHdvcnRoIG5vdGluZyB0aGF0IGFscmVhZHkgbG9nZ2VkIGluIHVzZXJzIHdpbGwgcmVtYWluIGxvZ2dlZCBpbiB1bmxlc3Ncbi8vIHlvdSBtYW51YWxseSBleHBpcmUgdGhlaXIgc2Vzc2lvbnMuXG5BY2NvdW50cy5vYXV0aC51bnJlZ2lzdGVyU2VydmljZSA9IG5hbWUgPT4ge1xuICBpZiAoIWhhc093bi5jYWxsKHNlcnZpY2VzLCBuYW1lKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFNlcnZpY2Ugbm90IGZvdW5kOiAke25hbWV9YCk7XG4gIGRlbGV0ZSBzZXJ2aWNlc1tuYW1lXTtcbn07XG5cbkFjY291bnRzLm9hdXRoLnNlcnZpY2VOYW1lcyA9ICgpID0+IE9iamVjdC5rZXlzKHNlcnZpY2VzKTtcblxuLy8gbG9naW5TZXJ2aWNlQ29uZmlndXJhdGlvbiBhbmQgQ29uZmlnRXJyb3IgYXJlIG1haW50YWluZWQgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIGNvbnN0IHsgU2VydmljZUNvbmZpZ3VyYXRpb24gfSA9IFBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddO1xuICBBY2NvdW50cy5sb2dpblNlcnZpY2VDb25maWd1cmF0aW9uID0gU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnM7XG4gIEFjY291bnRzLkNvbmZpZ0Vycm9yID0gU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3I7XG5cbiAgY29uc3Qgc2V0dGluZ3MgPSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5bJ2FjY291bnRzLWJhc2UnXTtcbiAgaWYgKHNldHRpbmdzKSB7XG4gICAgaWYgKHNldHRpbmdzLm9hdXRoU2VjcmV0S2V5KSB7XG4gICAgICBpZiAoIVBhY2thZ2VbJ29hdXRoLWVuY3J5cHRpb24nXSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1RoZSBvYXV0aC1lbmNyeXB0aW9uIHBhY2thZ2UgbXVzdCBiZSBsb2FkZWQgdG8gc2V0IG9hdXRoU2VjcmV0S2V5J1xuICAgICAgICApO1xuICAgICAgfVxuICAgICAgUGFja2FnZVsnb2F1dGgtZW5jcnlwdGlvbiddLk9BdXRoRW5jcnlwdGlvbi5sb2FkS2V5KFxuICAgICAgICBzZXR0aW5ncy5vYXV0aFNlY3JldEtleVxuICAgICAgKTtcbiAgICAgIGRlbGV0ZSBzZXR0aW5ncy5vYXV0aFNlY3JldEtleTtcbiAgICB9XG4gIH1cbn0pO1xuIiwiaW1wb3J0IHsgTWV0ZW9yIH0gZnJvbSAnbWV0ZW9yL21ldGVvcic7XG5cbi8vIExpc3RlbiB0byBjYWxscyB0byBgbG9naW5gIHdpdGggYW4gb2F1dGggb3B0aW9uIHNldC4gVGhpcyBpcyB3aGVyZVxuLy8gdXNlcnMgYWN0dWFsbHkgZ2V0IGxvZ2dlZCBpbiB0byBtZXRlb3IgdmlhIG9hdXRoLlxuQWNjb3VudHMucmVnaXN0ZXJMb2dpbkhhbmRsZXIoYXN5bmMgb3B0aW9ucyA9PiB7XG4gIGlmICghb3B0aW9ucy5vYXV0aClcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBkb24ndCBoYW5kbGVcblxuICBjaGVjayhvcHRpb25zLm9hdXRoLCB7XG4gICAgY3JlZGVudGlhbFRva2VuOiBTdHJpbmcsXG4gICAgLy8gV2hlbiBhbiBlcnJvciBvY2N1cnMgd2hpbGUgcmV0cmlldmluZyB0aGUgYWNjZXNzIHRva2VuLCB3ZSBzdG9yZVxuICAgIC8vIHRoZSBlcnJvciBpbiB0aGUgcGVuZGluZyBjcmVkZW50aWFscyB0YWJsZSwgd2l0aCBhIHNlY3JldCBvZlxuICAgIC8vIG51bGwuIFRoZSBjbGllbnQgY2FuIGNhbGwgdGhlIGxvZ2luIG1ldGhvZCB3aXRoIGEgc2VjcmV0IG9mIG51bGxcbiAgICAvLyB0byByZXRyaWV2ZSB0aGUgZXJyb3IuXG4gICAgY3JlZGVudGlhbFNlY3JldDogTWF0Y2guT25lT2YobnVsbCwgU3RyaW5nKVxuICB9KTtcblxuICBjb25zdCByZXN1bHQgPSBhd2FpdCBPQXV0aC5yZXRyaWV2ZUNyZWRlbnRpYWwob3B0aW9ucy5vYXV0aC5jcmVkZW50aWFsVG9rZW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vYXV0aC5jcmVkZW50aWFsU2VjcmV0KTtcblxuICBpZiAoIXJlc3VsdCkge1xuICAgIC8vIE9BdXRoIGNyZWRlbnRpYWxUb2tlbiBpcyBub3QgcmVjb2duaXplZCwgd2hpY2ggY291bGQgYmUgZWl0aGVyXG4gICAgLy8gYmVjYXVzZSB0aGUgcG9wdXAgd2FzIGNsb3NlZCBieSB0aGUgdXNlciBiZWZvcmUgY29tcGxldGlvbiwgb3JcbiAgICAvLyBzb21lIHNvcnQgb2YgZXJyb3Igd2hlcmUgdGhlIG9hdXRoIHByb3ZpZGVyIGRpZG4ndCB0YWxrIHRvIG91clxuICAgIC8vIHNlcnZlciBjb3JyZWN0bHkgYW5kIGNsb3NlZCB0aGUgcG9wdXAgc29tZWhvdy5cbiAgICAvL1xuICAgIC8vIFdlIGFzc3VtZSBpdCB3YXMgdXNlciBjYW5jZWxlZCBhbmQgcmVwb3J0IGl0IGFzIHN1Y2gsIHVzaW5nIGFcbiAgICAvLyBudW1lcmljIGNvZGUgdGhhdCB0aGUgY2xpZW50IHJlY29nbml6ZXMgKFhYWCB0aGlzIHdpbGwgZ2V0XG4gICAgLy8gcmVwbGFjZWQgYnkgYSBzeW1ib2xpYyBlcnJvciBjb2RlIGF0IHNvbWUgcG9pbnRcbiAgICAvLyBodHRwczovL3RyZWxsby5jb20vYy9rTWt3ODAwWi81My1vZmZpY2lhbC1kZHAtc3BlY2lmaWNhdGlvbikuIFRoaXNcbiAgICAvLyB3aWxsIG1hc2sgZmFpbHVyZXMgd2hlcmUgdGhpbmdzIGFyZSBtaXNjb25maWd1cmVkIHN1Y2ggdGhhdCB0aGVcbiAgICAvLyBzZXJ2ZXIgZG9lc24ndCBzZWUgdGhlIHJlcXVlc3QgYnV0IGRvZXMgY2xvc2UgdGhlIHdpbmRvdy4gVGhpc1xuICAgIC8vIHNlZW1zIHVubGlrZWx5LlxuICAgIC8vXG4gICAgLy8gWFhYIHdlIHdhbnQgYHR5cGVgIHRvIGJlIHRoZSBzZXJ2aWNlIG5hbWUgc3VjaCBhcyBcImZhY2Vib29rXCJcbiAgICByZXR1cm4geyB0eXBlOiBcIm9hdXRoXCIsXG4gICAgICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICAgICAgICAgICBBY2NvdW50cy5Mb2dpbkNhbmNlbGxlZEVycm9yLm51bWVyaWNFcnJvcixcbiAgICAgICAgICAgICAgIFwiTm8gbWF0Y2hpbmcgbG9naW4gYXR0ZW1wdCBmb3VuZFwiKSB9O1xuICB9XG5cbiAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIEVycm9yKVxuICAgIC8vIFdlIHRyaWVkIHRvIGxvZ2luLCBidXQgdGhlcmUgd2FzIGEgZmF0YWwgZXJyb3IuIFJlcG9ydCBpdCBiYWNrXG4gICAgLy8gdG8gdGhlIHVzZXIuXG4gICAgdGhyb3cgcmVzdWx0O1xuICBlbHNlIHtcbiAgICBpZiAoISBBY2NvdW50cy5vYXV0aC5zZXJ2aWNlTmFtZXMoKS5pbmNsdWRlcyhyZXN1bHQuc2VydmljZU5hbWUpKSB7XG4gICAgICAvLyBzZXJ2aWNlTmFtZSB3YXMgbm90IGZvdW5kIGluIHRoZSByZWdpc3RlcmVkIHNlcnZpY2VzIGxpc3QuXG4gICAgICAvLyBUaGlzIGNvdWxkIGhhcHBlbiBiZWNhdXNlIHRoZSBzZXJ2aWNlIG5ldmVyIHJlZ2lzdGVyZWQgaXRzZWxmIG9yXG4gICAgICAvLyB1bnJlZ2lzdGVyU2VydmljZSB3YXMgY2FsbGVkIG9uIGl0LlxuICAgICAgcmV0dXJuIHsgdHlwZTogXCJvYXV0aFwiLFxuICAgICAgICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoXG4gICAgICAgICAgICAgICAgIEFjY291bnRzLkxvZ2luQ2FuY2VsbGVkRXJyb3IubnVtZXJpY0Vycm9yLFxuICAgICAgICAgICAgICAgICBgTm8gcmVnaXN0ZXJlZCBvYXV0aCBzZXJ2aWNlIGZvdW5kIGZvcjogJHtyZXN1bHQuc2VydmljZU5hbWV9YCkgfTtcblxuICAgIH1cbiAgICByZXR1cm4gQWNjb3VudHMudXBkYXRlT3JDcmVhdGVVc2VyRnJvbUV4dGVybmFsU2VydmljZShyZXN1bHQuc2VydmljZU5hbWUsIHJlc3VsdC5zZXJ2aWNlRGF0YSwgcmVzdWx0Lm9wdGlvbnMpO1xuICB9XG59KTtcblxuLy8vXG4vLy8gT0F1dGggRW5jcnlwdGlvbiBTdXBwb3J0XG4vLy9cblxuY29uc3QgT0F1dGhFbmNyeXB0aW9uID0gUGFja2FnZVtcIm9hdXRoLWVuY3J5cHRpb25cIl0/Lk9BdXRoRW5jcnlwdGlvbjtcblxuY29uc3QgdXNpbmdPQXV0aEVuY3J5cHRpb24gPSAoKSA9PiB7XG4gIHJldHVybiBPQXV0aEVuY3J5cHRpb24/LmtleUlzTG9hZGVkKCk7XG59O1xuXG4vLyBFbmNyeXB0IHVuZW5jcnlwdGVkIGxvZ2luIHNlcnZpY2Ugc2VjcmV0cyB3aGVuIG9hdXRoLWVuY3J5cHRpb24gaXNcbi8vIGFkZGVkLlxuLy9cbi8vIFhYWCBGb3IgdGhlIG9hdXRoU2VjcmV0S2V5IHRvIGJlIGF2YWlsYWJsZSBoZXJlIGF0IHN0YXJ0dXAsIHRoZVxuLy8gZGV2ZWxvcGVyIG11c3QgY2FsbCBBY2NvdW50cy5jb25maWcoe29hdXRoU2VjcmV0S2V5OiAuLi59KSBhdCBsb2FkXG4vLyB0aW1lLCBpbnN0ZWFkIG9mIGluIGEgTWV0ZW9yLnN0YXJ0dXAgYmxvY2ssIGJlY2F1c2UgdGhlIHN0YXJ0dXBcbi8vIGJsb2NrIGluIHRoZSBhcHAgY29kZSB3aWxsIHJ1biBhZnRlciB0aGlzIGFjY291bnRzLWJhc2Ugc3RhcnR1cFxuLy8gYmxvY2suICBQZXJoYXBzIHdlIG5lZWQgYSBwb3N0LXN0YXJ0dXAgY2FsbGJhY2s/XG5cbk1ldGVvci5zdGFydHVwKCgpID0+IHtcbiAgaWYgKCEgdXNpbmdPQXV0aEVuY3J5cHRpb24oKSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgU2VydmljZUNvbmZpZ3VyYXRpb24gfSA9IFBhY2thZ2VbJ3NlcnZpY2UtY29uZmlndXJhdGlvbiddO1xuXG4gIFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmZpbmQoe1xuICAgICRhbmQ6IFt7XG4gICAgICBzZWNyZXQ6IHsgJGV4aXN0czogdHJ1ZSB9XG4gICAgfSwge1xuICAgICAgXCJzZWNyZXQuYWxnb3JpdGhtXCI6IHsgJGV4aXN0czogZmFsc2UgfVxuICAgIH1dXG4gIH0pLmZvckVhY2hBc3luYyhhc3luYyAoY29uZmlnKSA9PiB7XG4gICAgYXdhaXQgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMudXBkYXRlQXN5bmMoY29uZmlnLl9pZCwge1xuICAgICAgJHNldDoge1xuICAgICAgICBzZWNyZXQ6IE9BdXRoRW5jcnlwdGlvbi5zZWFsKGNvbmZpZy5zZWNyZXQpXG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXX0=
