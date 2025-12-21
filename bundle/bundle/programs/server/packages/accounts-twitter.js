Package["core-runtime"].queue("accounts-twitter",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var Accounts = Package['accounts-base'].Accounts;
var Twitter = Package['twitter-oauth'].Twitter;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-twitter":{"notice.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/accounts-twitter/notice.js                                                                          //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
if (Package['accounts-ui'] && !Package['service-configuration'] && !Object.prototype.hasOwnProperty.call(Package, 'twitter-config-ui')) {
  console.warn("Note: You're using accounts-ui and accounts-twitter,\n" + "but didn't install the configuration UI for Twitter\n" + "OAuth. You can install it with:\n" + "\n" + "    meteor add twitter-config-ui" + "\n");
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"twitter.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/accounts-twitter/twitter.js                                                                         //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
Accounts.oauth.registerService('twitter');
if (Meteor.isClient) {
  const loginWithTwitter = (options, callback) => {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }
    const credentialRequestCompleteCallback = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Twitter.requestCredential(options, credentialRequestCompleteCallback);
  };
  Accounts.registerClientLoginFunction('twitter', loginWithTwitter);
  Meteor.loginWithTwitter = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return Accounts.applyLoginFunction('twitter', args);
  };
} else {
  const autopublishedFields =
  // don't send access token. https://dev.twitter.com/discussions/5025
  Twitter.whitelistedFields.concat(['id', 'screenName']).map(subfield => "services.twitter.".concat(subfield));
  Accounts.addAutopublishFields({
    forLoggedInUser: autopublishedFields,
    forOtherUsers: autopublishedFields
  });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
    "/node_modules/meteor/accounts-twitter/notice.js",
    "/node_modules/meteor/accounts-twitter/twitter.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/accounts-twitter.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtdHdpdHRlci9ub3RpY2UuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL2FjY291bnRzLXR3aXR0ZXIvdHdpdHRlci5qcyJdLCJuYW1lcyI6WyJQYWNrYWdlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwiY29uc29sZSIsIndhcm4iLCJBY2NvdW50cyIsIm9hdXRoIiwicmVnaXN0ZXJTZXJ2aWNlIiwiTWV0ZW9yIiwiaXNDbGllbnQiLCJsb2dpbldpdGhUd2l0dGVyIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUNhbGxiYWNrIiwiY3JlZGVudGlhbFJlcXVlc3RDb21wbGV0ZUhhbmRsZXIiLCJUd2l0dGVyIiwicmVxdWVzdENyZWRlbnRpYWwiLCJyZWdpc3RlckNsaWVudExvZ2luRnVuY3Rpb24iLCJfbGVuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiYXJncyIsIkFycmF5IiwiX2tleSIsImFwcGx5TG9naW5GdW5jdGlvbiIsImF1dG9wdWJsaXNoZWRGaWVsZHMiLCJ3aGl0ZWxpc3RlZEZpZWxkcyIsImNvbmNhdCIsIm1hcCIsInN1YmZpZWxkIiwiYWRkQXV0b3B1Ymxpc2hGaWVsZHMiLCJmb3JMb2dnZWRJblVzZXIiLCJmb3JPdGhlclVzZXJzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFBSUEsT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUNuQixDQUFDQSxPQUFPLENBQUMsdUJBQXVCLENBQUMsSUFDakMsQ0FBQ0MsTUFBTSxDQUFDQyxTQUFTLENBQUNDLGNBQWMsQ0FBQ0MsSUFBSSxDQUFDSixPQUFPLEVBQUUsbUJBQW1CLENBQUMsRUFBRTtFQUMxRUssT0FBTyxDQUFDQyxJQUFJLENBQ1Ysd0RBQXdELEdBQ3hELHVEQUF1RCxHQUN2RCxtQ0FBbUMsR0FDbkMsSUFBSSxHQUNKLGtDQUFrQyxHQUNsQyxJQUNGLENBQUM7QUFDSCxDOzs7Ozs7Ozs7OztBQ1hBQyxRQUFRLENBQUNDLEtBQUssQ0FBQ0MsZUFBZSxDQUFDLFNBQVMsQ0FBQztBQUV6QyxJQUFJQyxNQUFNLENBQUNDLFFBQVEsRUFBRTtFQUNuQixNQUFNQyxnQkFBZ0IsR0FBR0EsQ0FBQ0MsT0FBTyxFQUFFQyxRQUFRLEtBQUs7SUFDOUM7SUFDQSxJQUFJLENBQUVBLFFBQVEsSUFBSSxPQUFPRCxPQUFPLEtBQUssVUFBVSxFQUFFO01BQy9DQyxRQUFRLEdBQUdELE9BQU87TUFDbEJBLE9BQU8sR0FBRyxJQUFJO0lBQ2hCO0lBRUEsTUFBTUUsaUNBQWlDLEdBQUdSLFFBQVEsQ0FBQ0MsS0FBSyxDQUFDUSxnQ0FBZ0MsQ0FBQ0YsUUFBUSxDQUFDO0lBQ25HRyxPQUFPLENBQUNDLGlCQUFpQixDQUFDTCxPQUFPLEVBQUVFLGlDQUFpQyxDQUFDO0VBQ3ZFLENBQUM7RUFDRFIsUUFBUSxDQUFDWSwyQkFBMkIsQ0FBQyxTQUFTLEVBQUVQLGdCQUFnQixDQUFDO0VBQ2pFRixNQUFNLENBQUNFLGdCQUFnQixHQUFHO0lBQUEsU0FBQVEsSUFBQSxHQUFBQyxTQUFBLENBQUFDLE1BQUEsRUFBSUMsSUFBSSxPQUFBQyxLQUFBLENBQUFKLElBQUEsR0FBQUssSUFBQSxNQUFBQSxJQUFBLEdBQUFMLElBQUEsRUFBQUssSUFBQTtNQUFKRixJQUFJLENBQUFFLElBQUEsSUFBQUosU0FBQSxDQUFBSSxJQUFBO0lBQUE7SUFBQSxPQUNoQ2xCLFFBQVEsQ0FBQ21CLGtCQUFrQixDQUFDLFNBQVMsRUFBRUgsSUFBSSxDQUFDO0VBQUE7QUFDaEQsQ0FBQyxNQUFNO0VBQ0wsTUFBTUksbUJBQW1CO0VBQ3ZCO0VBQ0FWLE9BQU8sQ0FBQ1csaUJBQWlCLENBQUNDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDQyxHQUFHLENBQ3hEQyxRQUFRLHdCQUFBRixNQUFBLENBQXdCRSxRQUFRLENBQzFDLENBQUM7RUFFSHhCLFFBQVEsQ0FBQ3lCLG9CQUFvQixDQUFDO0lBQzVCQyxlQUFlLEVBQUVOLG1CQUFtQjtJQUNwQ08sYUFBYSxFQUFFUDtFQUNqQixDQUFDLENBQUM7QUFDSixDIiwiZmlsZSI6Ii9wYWNrYWdlcy9hY2NvdW50cy10d2l0dGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaWYgKFBhY2thZ2VbJ2FjY291bnRzLXVpJ11cbiAgICAmJiAhUGFja2FnZVsnc2VydmljZS1jb25maWd1cmF0aW9uJ11cbiAgICAmJiAhT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKFBhY2thZ2UsICd0d2l0dGVyLWNvbmZpZy11aScpKSB7XG4gIGNvbnNvbGUud2FybihcbiAgICBcIk5vdGU6IFlvdSdyZSB1c2luZyBhY2NvdW50cy11aSBhbmQgYWNjb3VudHMtdHdpdHRlcixcXG5cIiArXG4gICAgXCJidXQgZGlkbid0IGluc3RhbGwgdGhlIGNvbmZpZ3VyYXRpb24gVUkgZm9yIFR3aXR0ZXJcXG5cIiArXG4gICAgXCJPQXV0aC4gWW91IGNhbiBpbnN0YWxsIGl0IHdpdGg6XFxuXCIgK1xuICAgIFwiXFxuXCIgK1xuICAgIFwiICAgIG1ldGVvciBhZGQgdHdpdHRlci1jb25maWctdWlcIiArXG4gICAgXCJcXG5cIlxuICApO1xufVxuIiwiQWNjb3VudHMub2F1dGgucmVnaXN0ZXJTZXJ2aWNlKCd0d2l0dGVyJyk7XG5cbmlmIChNZXRlb3IuaXNDbGllbnQpIHtcbiAgY29uc3QgbG9naW5XaXRoVHdpdHRlciA9IChvcHRpb25zLCBjYWxsYmFjaykgPT4ge1xuICAgIC8vIHN1cHBvcnQgYSBjYWxsYmFjayB3aXRob3V0IG9wdGlvbnNcbiAgICBpZiAoISBjYWxsYmFjayAmJiB0eXBlb2Ygb3B0aW9ucyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2sgPSBBY2NvdW50cy5vYXV0aC5jcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlSGFuZGxlcihjYWxsYmFjayk7XG4gICAgVHdpdHRlci5yZXF1ZXN0Q3JlZGVudGlhbChvcHRpb25zLCBjcmVkZW50aWFsUmVxdWVzdENvbXBsZXRlQ2FsbGJhY2spO1xuICB9O1xuICBBY2NvdW50cy5yZWdpc3RlckNsaWVudExvZ2luRnVuY3Rpb24oJ3R3aXR0ZXInLCBsb2dpbldpdGhUd2l0dGVyKTtcbiAgTWV0ZW9yLmxvZ2luV2l0aFR3aXR0ZXIgPSAoLi4uYXJncykgPT5cbiAgICBBY2NvdW50cy5hcHBseUxvZ2luRnVuY3Rpb24oJ3R3aXR0ZXInLCBhcmdzKTtcbn0gZWxzZSB7XG4gIGNvbnN0IGF1dG9wdWJsaXNoZWRGaWVsZHMgPSBcbiAgICAvLyBkb24ndCBzZW5kIGFjY2VzcyB0b2tlbi4gaHR0cHM6Ly9kZXYudHdpdHRlci5jb20vZGlzY3Vzc2lvbnMvNTAyNVxuICAgIFR3aXR0ZXIud2hpdGVsaXN0ZWRGaWVsZHMuY29uY2F0KFsnaWQnLCAnc2NyZWVuTmFtZSddKS5tYXAoXG4gICAgICBzdWJmaWVsZCA9PiBgc2VydmljZXMudHdpdHRlci4ke3N1YmZpZWxkfWBcbiAgICApO1xuXG4gIEFjY291bnRzLmFkZEF1dG9wdWJsaXNoRmllbGRzKHtcbiAgICBmb3JMb2dnZWRJblVzZXI6IGF1dG9wdWJsaXNoZWRGaWVsZHMsXG4gICAgZm9yT3RoZXJVc2VyczogYXV0b3B1Ymxpc2hlZEZpZWxkc1xuICB9KTtcbn1cbiJdfQ==
