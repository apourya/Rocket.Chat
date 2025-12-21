Package["core-runtime"].queue("accounts-google",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Google = Package['google-oauth'].Google;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-google":{"notice.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/accounts-google/notice.js                                                                        //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Object.prototype.hasOwnProperty.call(Package, 'google-config-ui')) {
  console.warn("Note: You're using accounts-ui and accounts-google,\n" + "but didn't install the configuration UI for the Google\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add google-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"google.js":function module(require,exports,module){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/accounts-google/google.js                                                                        //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    Accounts.oauth.registerService('google');
    if (Meteor.isClient) {
      const loginWithGoogle = (options, callback) => {
        // support a callback without options
        if (!callback && typeof options === "function") {
          callback = options;
          options = null;
        }
        if (Meteor.isCordova && Google.signIn) {
          // After 20 April 2017, Google OAuth login will no longer work from
          // a WebView, so Cordova apps must use Google Sign-In instead.
          // https://github.com/meteor/meteor/issues/8253
          Google.signIn(options, callback);
          return;
        }

        // Use Google's domain-specific login page if we want to restrict creation to
        // a particular email domain. (Don't use it if restrictCreationByEmailDomain
        // is a function.) Note that all this does is change Google's UI ---
        // accounts-base/accounts_server.js still checks server-side that the server
        // has the proper email address after the OAuth conversation.
        if (typeof Accounts._options.restrictCreationByEmailDomain === 'string') {
          options = _objectSpread({}, options);
          options.loginUrlParameters = _objectSpread({}, options.loginUrlParameters);
          options.loginUrlParameters.hd = Accounts._options.restrictCreationByEmailDomain;
        }
        const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
        Google.requestCredential(options, credentialRequestCompleteCallback);
      };
      Accounts.registerClientLoginFunction('google', loginWithGoogle);
      Meteor.loginWithGoogle = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        return Accounts.applyLoginFunction('google', args);
      };
    } else {
      Accounts.addAutopublishFields({
        forLoggedInUser:
        // publish access token since it can be used from the client (if
        // transmitted over ssl or on
        // localhost). https://developers.google.com/accounts/docs/OAuth2UserAgent
        // refresh token probably shouldn't be sent down.
        Google.whitelistedFields.concat(['accessToken', 'expiresAt']).map(subfield => "services.google.".concat(subfield) // don't publish refresh token
        ),
        forOtherUsers:
        // even with autopublish, no legitimate web app should be
        // publishing all users' emails
        Google.whitelistedFields.filter(field => field !== 'email' && field !== 'verified_email').map(subfield => "services.google.".concat(subfield))
      });
    }
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    "/node_modules/meteor/accounts-google/notice.js",
    "/node_modules/meteor/accounts-google/google.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/accounts-google.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZ29vZ2xlL25vdGljZS5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZ29vZ2xlL2dvb2dsZS5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiY29uc29sZSIsIndhcm4iLCJfb2JqZWN0U3ByZWFkIiwibW9kdWxlIiwibGluayIsImRlZmF1bHQiLCJ2IiwiX19yZWlmeVdhaXRGb3JEZXBzX18iLCJBY2NvdW50cyIsIm9hdXRoIiwicmVnaXN0ZXJTZXJ2aWNlIiwiTWV0ZW9yIiwiaXNDbGllbnQiLCJsb2dpbldpdGhHb29nbGUiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJpc0NvcmRvdmEiLCJHb29nbGUiLCJzaWduSW4iLCJfb3B0aW9ucyIsInJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluIiwibG9naW5VcmxQYXJhbWV0ZXJzIiwiaGQiLCJjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2siLCJjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlSGFuZGxlciIsInJlcXVlc3RDcmVkZW50aWFsIiwicmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uIiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJhcHBseUxvZ2luRnVuY3Rpb24iLCJhZGRBdXRvcHVibGlzaEZpZWxkcyIsImZvckxvZ2dlZEluVXNlciIsIndoaXRlbGlzdGVkRmllbGRzIiwiY29uY2F0IiwibWFwIiwic3ViZmllbGQiLCJmb3JPdGhlclVzZXJzIiwiZmlsdGVyIiwiZmllbGQiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxPQUFPLENBQUMsYUFB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SyxNQUFNLENBQzdCQyxLQUFLLElBQUlBLEtBQUssS0FBSyxPQUFPLElBQUlBLEtBQUssS0FBSyxnQkFDMUMsQ0FBQyxDQUFDSixHQUFHLENBQ0hDLFFBQVEsdUJBQUFGLE1BQUEsQ0FBdUJFLFFBQVEsQ0FDekM7TUFDSixDQUFDLENBQUM7SUFDSjtJQUFDSSxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9hY2NvdW50cy1nb29nbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpZiAoUGFja2FnZVsnYWNjb3VudHMtdWknXVxuICAgICYmICFQYWNrYWdlWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXVxuICAgICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoUGFja2FnZSwgJ2dvb2dsZS1jb25maWctdWknKSkge1xuICBjb25zb2xlLndhcm4oXG4gICAgXCJOb3RlOiBZb3UncmUgdXNpbmcgYWNjb3VudHMtdWkgYW5kIGFjY291bnRzLWdvb2dsZSxcXG5cIiArXG4gICAgXCJidXQgZGlkbid0IGluc3RhbGwgdGhlIGNvbmZpZ3VyYXRpb24gVUkgZm9yIHRoZSBHb29nbGVcXG5cIiArXG4gICAgXCJPQXV0aC4gWW91IGNhbiBpbnN0YWxsIGl0IHdpdGg6XFxuXCIgK1xuICAgIFwiXFxuXCIgK1xuICAgIFwiICAgIG1ldGVvciBhZGQgZ29vZ2xlLWNvbmZpZy11aVwiICtcbiAgICBcIlxcblwiXG4gICk7XG59XG4iLCJBY2NvdW50cy5vYXV0aC5yZWdpc3RlclNlcnZpY2UoJ2dvb2dsZScpO1xuXG5pZiAoTWV0ZW9yLmlzQ2xpZW50KSB7XG4gIGNvbnN0IGxvZ2luV2l0aEdvb2dsZSA9IChvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICAgIC8vIHN1cHBvcnQgYSBjYWxsYmFjayB3aXRob3V0IG9wdGlvbnNcbiAgICBpZiAoISBjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAoTWV0ZW9yLmlzQ29yZG92YSAmJlxuICAgICAgICBHb29nbGUuc2lnbkluKSB7XG4gICAgICAvLyBBZnRlciAyMCBBcHJpbCAyMDE3LCBHb29nbGUgT0F1dGggbG9naW4gd2lsbCBubyBsb25nZXIgd29yayBmcm9tXG4gICAgICAvLyBhIFdlYlZpZXcsIHNvIENvcmRvdmEgYXBwcyBtdXN0IHVzZSBHb29nbGUgU2lnbi1JbiBpbnN0ZWFkLlxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvaXNzdWVzLzgyNTNcbiAgICAgIEdvb2dsZS5zaWduSW4ob3B0aW9ucywgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFVzZSBHb29nbGUncyBkb21haW4tc3BlY2lmaWMgbG9naW4gcGFnZSBpZiB3ZSB3YW50IHRvIHJlc3RyaWN0IGNyZWF0aW9uIHRvXG4gICAgLy8gYSBwYXJ0aWN1bGFyIGVtYWlsIGRvbWFpbi4gKERvbid0IHVzZSBpdCBpZiByZXN0cmljdENyZWF0aW9uQnlFbWFpbERvbWFpblxuICAgIC8vIGlzIGEgZnVuY3Rpb24uKSBOb3RlIHRoYXQgYWxsIHRoaXMgZG9lcyBpcyBjaGFuZ2UgR29vZ2xlJ3MgVUkgLS0tXG4gICAgLy8gYWNjb3VudHMtYmFzZS9hY2NvdW50c19zZXJ2ZXIuanMgc3RpbGwgY2hlY2tzIHNlcnZlci1zaWRlIHRoYXQgdGhlIHNlcnZlclxuICAgIC8vIGhhcyB0aGUgcHJvcGVyIGVtYWlsIGFkZHJlc3MgYWZ0ZXIgdGhlIE9BdXRoIGNvbnZlcnNhdGlvbi5cbiAgICBpZiAodHlwZW9mIEFjY291bnRzLl9vcHRpb25zLnJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluID09PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9O1xuICAgICAgb3B0aW9ucy5sb2dpblVybFBhcmFtZXRlcnMgPSB7IC4uLm9wdGlvbnMubG9naW5VcmxQYXJhbWV0ZXJzIH07XG4gICAgICBvcHRpb25zLmxvZ2luVXJsUGFyYW1ldGVycy5oZCA9IEFjY291bnRzLl9vcHRpb25zLnJlc3RyaWN0Q3JlYXRpb25CeUVtYWlsRG9tYWluO1xuICAgIH1cbiAgICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2sgPSBBY2NvdW50cy5vYXV0aC5jcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlSGFuZGxlcihjYWxsYmFjayk7XG4gICAgR29vZ2xlLnJlcXVlc3RDcmVkZW50aWFsKG9wdGlvbnMsIGNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVDYWxsYmFjayk7XG4gIH07XG4gIEFjY291bnRzLnJlZ2lzdGVyQ2xpZW50TG9naW5GdW5jdGlvbignZ29vZ2xlJywgbG9naW5XaXRoR29vZ2xlKTtcbiAgTWV0ZW9yLmxvZ2luV2l0aEdvb2dsZSA9IFxuICAgICguLi5hcmdzKSA9PiBBY2NvdW50cy5hcHBseUxvZ2luRnVuY3Rpb24oJ2dvb2dsZScsIGFyZ3MpO1xufSBlbHNlIHtcbiAgQWNjb3VudHMuYWRkQXV0b3B1Ymxpc2hGaWVsZHMoe1xuICAgIGZvckxvZ2dlZEluVXNlcjpcbiAgICAgIC8vIHB1Ymxpc2ggYWNjZXNzIHRva2VuIHNpbmNlIGl0IGNhbiBiZSB1c2VkIGZyb20gdGhlIGNsaWVudCAoaWZcbiAgICAgIC8vIHRyYW5zbWl0dGVkIG92ZXIgc3NsIG9yIG9uXG4gICAgICAvLyBsb2NhbGhvc3QpLiBodHRwczovL2RldmVsb3BlcnMuZ29vZ2xlLmNvbS9hY2NvdW50cy9kb2NzL09BdXRoMlVzZXJBZ2VudFxuICAgICAgLy8gcmVmcmVzaCB0b2tlbiBwcm9iYWJseSBzaG91bGRuJ3QgYmUgc2VudCBkb3duLlxuICAgICAgR29vZ2xlLndoaXRlbGlzdGVkRmllbGRzLmNvbmNhdChbJ2FjY2Vzc1Rva2VuJywgJ2V4cGlyZXNBdCddKS5tYXAoXG4gICAgICAgIHN1YmZpZWxkID0+IGBzZXJ2aWNlcy5nb29nbGUuJHtzdWJmaWVsZH1gIC8vIGRvbid0IHB1Ymxpc2ggcmVmcmVzaCB0b2tlblxuICAgICAgKSwgXG5cbiAgICBmb3JPdGhlclVzZXJzOiBcbiAgICAgIC8vIGV2ZW4gd2l0aCBhdXRvcHVibGlzaCwgbm8gbGVnaXRpbWF0ZSB3ZWIgYXBwIHNob3VsZCBiZVxuICAgICAgLy8gcHVibGlzaGluZyBhbGwgdXNlcnMnIGVtYWlsc1xuICAgICAgR29vZ2xlLndoaXRlbGlzdGVkRmllbGRzLmZpbHRlcihcbiAgICAgICAgZmllbGQgPT4gZmllbGQgIT09ICdlbWFpbCcgJiYgZmllbGQgIT09ICd2ZXJpZmllZF9lbWFpbCdcbiAgICAgICkubWFwKFxuICAgICAgICBzdWJmaWVsZCA9PiBgc2VydmljZXMuZ29vZ2xlLiR7c3ViZmllbGR9YFxuICAgICAgKSxcbiAgfSk7XG59XG4iXX0=
