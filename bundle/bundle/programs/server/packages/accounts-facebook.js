Package["core-runtime"].queue("accounts-facebook",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Facebook = Package['facebook-oauth'].Facebook;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-facebook":{"notice.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-facebook/notice.js                                                                  //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Object.prototype.hasOwnProperty.call(Package, 'facebook-config-ui')) {
  console.warn("Note: You're using accounts-ui and accounts-facebook,\n" + "but didn't install the configuration UI for the Facebook\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add facebook-config-ui" + "\n");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

},"facebook.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                       //
// packages/accounts-facebook/facebook.js                                                                //
//                                                                                                       //
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                         //
Accounts.oauth.registerService('facebook');
if (Meteor.isClient) {
  const loginWithFacebook = (options, callback) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }
    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Facebook.requestCredential(options, credentialRequestCompleteCallback);
  };
  Accounts.registerClientLoginFunction('facebook', loginWithFacebook);
  Meteor.loginWithFacebook = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return Accounts.applyLoginFunction('facebook', args);
  };
} else {
  Accounts.addAutopublishFields({
    // publish all fields including access token, which can legitimately
    // be used from the client (if transmitted over ssl or on
    // localhost). https://developers.facebook.com/docs/concepts/login/access-tokens-and-types/,
    // "Sharing of Access Tokens"
    forLoggedInUser: ['services.facebook'],
    forOtherUsers: [
    // https://www.facebook.com/help/167709519956542
    'services.facebook.id', 'services.facebook.username', 'services.facebook.gender']
  });
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    "/node_modules/meteor/accounts-facebook/notice.js",
    "/node_modules/meteor/accounts-facebook/facebook.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/accounts-facebook.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtZmFjZWJvb2svbm90aWNlLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hY2NvdW50cy1mYWNlYm9vay9mYWNlYm9vay5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiY29uc29sZSIsIndhcm4iLCJBY2NvdW50cyIsIm9hdXRoIiwicmVnaXN0ZXJTZXJ2aWNlIiwiTWV0ZW9yIiwiaXNDbGllbnQiLCJsb2dpbldpdGhGYWNlYm9vayIsIm9wdGlvbnMiLCJjYWxsYmFjayIsImNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVDYWxsYmFjayIsImNyZWRlbnRpYWxSZXF1ZXN0Q29tcGxldGVIYW5kbGVyIiwiRmFjZWJvb2siLCJyZXF1ZXN0Q3JlZGVudGlhbCIsInJlZ2lzdGVyQ2xpZW50TG9naW5GdW5jdGlvbiIsIl9sZW4iLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJhcmdzIiwiQXJyYXkiLCJfa2V5IiwiYXBwbHlMb2dpbkZ1bmN0aW9uIiwiYWRkQXV0b3B1Ymxpc2hGaWVsZHMiLCJmb3JMb2dnZWRJblVzZXIiLCJmb3JPdGhlclVzZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUNuQixDQUFDQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFDakMsQ0FBQ0MsTUFBTSxDQUFDQyxTQUFTLENBQUNDLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDSixPQUFPLEVBQUUsb0JBQW9CLENBQUMsRUFBRTtFQUMzRUssT0FBTyxDQUFDQyxJQUFJLENBQ1YseURBQXlELEdBQ3pELDREQUE0RCxHQUM1RCxtQ0FBbUMsR0FDbkMsSUFBSSxHQUNKLG1DQUFtQyxHQUNuQyxJQUNGLENBQUM7QUFDSCxDOzs7Ozs7Ozs7OztBQ1hBQyxRQUFRLENBQUNDLEtBQUssQ0FBQ0MsZUFBZSxDQUFDLFVBQVUsQ0FBQztBQUUxQyxJQUFJQyxNQUFNLENBQUNDLFFBQVEsRUFBRTtFQUNuQixNQUFNQyxpQkFBaUIsR0FBR0EsQ0FBQ0MsT0FBTyxFQUFFQyxRQUFRLEtBQUs7SUFDL0M7SUFDQSxJQUFJLENBQUVBLFFBQVEsSUFBSSxPQUFPRCxPQUFPLEtBQUssVUFBVSxFQUFFO01BQy9DQyxRQUFRLEdBQUdELE9BQU87TUFDbEJBLE9BQU8sR0FBRyxJQUFJO0lBQ2hCO0lBRUEsTUFBTUUsaUNBQWlDLEdBQUdSLFFBQVEsQ0FBQ0MsS0FBSyxDQUFDUSxnQ0FBZ0MsQ0FBQ0YsUUFBUSxDQUFDO0lBQ25HRyxRQUFRLENBQUNDLGlCQUFpQixDQUFDTCxPQUFPLEVBQUVFLGlDQUFpQyxDQUFDO0VBQ3hFLENBQUM7RUFDRFIsUUFBUSxDQUFDWSwyQkFBMkIsQ0FBQyxVQUFVLEVBQUVQLGlCQUFpQixDQUFDO0VBQ25FRixNQUFNLENBQUNFLGlCQUFpQixHQUN0QjtJQUFBLFNBQUFRLElBQUEsR0FBQUMsU0FBQSxDQUFBQyxNQUFBLEVBQUlDLElBQUksT0FBQUMsS0FBQSxDQUFBSixJQUFBLEdBQUFLLElBQUEsTUFBQUEsSUFBQSxHQUFBTCxJQUFBLEVBQUFLLElBQUE7TUFBSkYsSUFBSSxDQUFBRSxJQUFBLElBQUFKLFNBQUEsQ0FBQUksSUFBQTtJQUFBO0lBQUEsT0FBS2xCLFFBQVEsQ0FBQ21CLGtCQUFrQixDQUFDLFVBQVUsRUFBRUgsSUFBSSxDQUFDO0VBQUE7QUFDOUQsQ0FBQyxNQUFNO0VBQ0xoQixRQUFRLENBQUNvQixvQkFBb0IsQ0FBQztJQUM1QjtJQUNBO0lBQ0E7SUFDQTtJQUNBQyxlQUFlLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztJQUN0Q0MsYUFBYSxFQUFFO0lBQ2I7SUFDQSxzQkFBc0IsRUFBRSw0QkFBNEIsRUFBRSwwQkFBMEI7RUFFcEYsQ0FBQyxDQUFDO0FBQ0osQyIsImZpbGUiOiIvcGFja2FnZXMvYWNjb3VudHMtZmFjZWJvb2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJpZiAoUGFja2FnZVsnYWNjb3VudHMtdWknXVxuICAgICYmICFQYWNrYWdlWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXVxuICAgICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoUGFja2FnZSwgJ2ZhY2Vib29rLWNvbmZpZy11aScpKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBcIk5vdGU6IFlvdSdyZSB1c2luZyBhY2NvdW50cy11aSBhbmQgYWNjb3VudHMtZmFjZWJvb2ssXFxuXCIgK1xuICAgIFwiYnV0IGRpZG4ndCBpbnN0YWxsIHRoZSBjb25maWd1cmF0aW9uIFVJIGZvciB0aGUgRmFjZWJvb2tcXG5cIiArXG4gICAgXCJPQXV0aC4gWW91IGNhbiBpbnN0YWxsIGl0IHdpdGg6XFxuXCIgK1xuICAgIFwiXFxuXCIgK1xuICAgIFwiICAgIG1ldGVvciBhZGQgZmFjZWJvb2stY29uZmlnLXVpXCIgK1xuICAgIFwiXFxuXCJcbiAgKTtcbn1cbiIsIkFjY291bnRzLm9hdXRoLnJlZ2lzdGVyU2VydmljZSgnZmFjZWJvb2snKTtcblxuaWYgKE1ldGVvci5pc0NsaWVudCkge1xuICBjb25zdCBsb2dpbldpdGhGYWNlYm9vayA9IChvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICAgIC8vIHN1cHBvcnQgYSBjYWxsYmFjayB3aXRob3V0IG9wdGlvbnNcbiAgICBpZiAoISBjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2sgPSBBY2NvdW50cy5vYXV0aC5jcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlSGFuZGxlcihjYWxsYmFjayk7XG4gICAgRmFjZWJvb2sucmVxdWVzdENyZWRlbnRpYWwob3B0aW9ucywgY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrKTtcbiAgfTtcbiAgQWNjb3VudHMucmVnaXN0ZXJDbGllbnRMb2dpbkZ1bmN0aW9uKCdmYWNlYm9vaycsIGxvZ2luV2l0aEZhY2Vib29rKTtcbiAgTWV0ZW9yLmxvZ2luV2l0aEZhY2Vib29rID0gXG4gICAgKC4uLmFyZ3MpID0+IEFjY291bnRzLmFwcGx5TG9naW5GdW5jdGlvbignZmFjZWJvb2snLCBhcmdzKTtcbn0gZWxzZSB7XG4gIEFjY291bnRzLmFkZEF1dG9wdWJsaXNoRmllbGRzKHtcbiAgICAvLyBwdWJsaXNoIGFsbCBmaWVsZHMgaW5jbHVkaW5nIGFjY2VzcyB0b2tlbiwgd2hpY2ggY2FuIGxlZ2l0aW1hdGVseVxuICAgIC8vIGJlIHVzZWQgZnJvbSB0aGUgY2xpZW50IChpZiB0cmFuc21pdHRlZCBvdmVyIHNzbCBvciBvblxuICAgIC8vIGxvY2FsaG9zdCkuIGh0dHBzOi8vZGV2ZWxvcGVycy5mYWNlYm9vay5jb20vZG9jcy9jb25jZXB0cy9sb2dpbi9hY2Nlc3MtdG9rZW5zLWFuZC10eXBlcy8sXG4gICAgLy8gXCJTaGFyaW5nIG9mIEFjY2VzcyBUb2tlbnNcIlxuICAgIGZvckxvZ2dlZEluVXNlcjogWydzZXJ2aWNlcy5mYWNlYm9vayddLFxuICAgIGZvck90aGVyVXNlcnM6IFtcbiAgICAgIC8vIGh0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9oZWxwLzE2NzcwOTUxOTk1NjU0MlxuICAgICAgJ3NlcnZpY2VzLmZhY2Vib29rLmlkJywgJ3NlcnZpY2VzLmZhY2Vib29rLnVzZXJuYW1lJywgJ3NlcnZpY2VzLmZhY2Vib29rLmdlbmRlcidcbiAgICBdXG4gIH0pO1xufVxuIl19
