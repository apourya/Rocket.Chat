Package["core-runtime"].queue("meteor-developer-oauth",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var OAuth = Package.oauth.OAuth;
var ECMAScript = Package.ecmascript.ECMAScript;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var MeteorDeveloperAccounts;

var require = meteorInstall({"node_modules":{"meteor":{"meteor-developer-oauth":{"meteor_developer_common.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/meteor-developer-oauth/meteor_developer_common.js                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
MeteorDeveloperAccounts = {};
MeteorDeveloperAccounts._server = "https://www.meteor.com";

// Options are:
//  - developerAccountsServer: defaults to "https://www.meteor.com"
MeteorDeveloperAccounts._config = options => {
  if (options.developerAccountsServer) {
    MeteorDeveloperAccounts._server = options.developerAccountsServer;
  }
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"meteor_developer_server.js":function module(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/meteor-developer-oauth/meteor_developer_server.js                                                   //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
OAuth.registerService("meteor-developer", 2, null, async query => {
  const response = await getTokens(query);
  const {
    accessToken
  } = response;
  const identity = await getIdentity(accessToken);
  const serviceData = {
    accessToken: OAuth.sealSecret(accessToken),
    expiresAt: +new Date() + 1000 * response.expiresIn
  };
  Object.assign(serviceData, identity);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken) serviceData.refreshToken = OAuth.sealSecret(response.refreshToken);
  return {
    serviceData,
    options: {
      profile: {
        name: serviceData.username
      }
    }
    // XXX use username for name until meteor accounts has a profile with a name
  };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request and we got a
//   refresh token from the server
const getTokens = async query => {
  const config = await ServiceConfiguration.configurations.findOneAsync({
    service: 'meteor-developer'
  });
  if (!config) {
    throw new ServiceConfiguration.ConfigError();
  }
  const body = OAuth._addValuesToQueryParams({
    grant_type: 'authorization_code',
    code: query.code,
    client_id: config.clientId,
    client_secret: OAuth.openSecret(config.secret),
    redirect_uri: OAuth._redirectUri('meteor-developer', config)
  }).toString();
  return OAuth._fetch(MeteorDeveloperAccounts._server + '/oauth2/token', 'POST', {
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/x-www-form-urlencoded'
    },
    body
  }).then(data => data.json()).then(data => {
    if (data.error) {
      throw new Error('Failed to complete OAuth handshake with Meteor developer accounts. ' + (data ? data.error : 'No response data'));
    }
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in
    };
  }).catch(err => {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Meteor developer accounts. ".concat(err.message)), {
      response: err.response
    });
  });
};
const getIdentity = async accessToken => {
  return OAuth._fetch("".concat(MeteorDeveloperAccounts._server, "/api/v1/identity"), 'GET', {
    headers: {
      Authorization: "Bearer ".concat(accessToken)
    }
  }).then(data => data.json()).catch(err => {
    throw Object.assign(new Error('Failed to fetch identity from Meteor developer accounts. ' + err.message), {
      response: err.response
    });
  });
};
MeteorDeveloperAccounts.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      MeteorDeveloperAccounts: MeteorDeveloperAccounts
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/meteor-developer-oauth/meteor_developer_common.js",
    "/node_modules/meteor/meteor-developer-oauth/meteor_developer_server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/meteor-developer-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9yLWRldmVsb3Blci1vYXV0aC9tZXRlb3JfZGV2ZWxvcGVyX2NvbW1vbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvbWV0ZW9yLWRldmVsb3Blci1vYXV0aC9tZXRlb3JfZGV2ZWxvcGVyX3NlcnZlci5qcyJdLCJuYW1lcyI6WyJNZXRlb3JEZXZlbG9wZXJBY2NvdW50cyIsIl9zZXJ2ZXIiLCJfY29uZmlnIiwib3B0aW9ucyIsImRldmVsb3BlckFjY291bnRzU2VydmVyIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsInJlc3BvbnNlIiwiZ2V0VG9rZW5zIiwiYWNjZXNzVG9rZW4iLCJpZGVudGl0eSIsImdldElkZW50aXR5Iiwic2VydmljZURhdGEiLCJzZWFsU2VjcmV0IiwiZXhwaXJlc0F0IiwiRGF0ZSIsImV4cGlyZXNJbiIsIk9iamVjdCIsImFzc2lnbiIsInJlZnJlc2hUb2tlbiIsInByb2ZpbGUiLCJuYW1lIiwidXNlcm5hbWUiLCJjb25maWciLCJTZXJ2aWNlQ29uZmlndXJhdGlvbiIsImNvbmZpZ3VyYXRpb25zIiwiZmluZE9uZUFzeW5jIiwic2VydmljZSIsIkNvbmZpZ0Vycm9yIiwiYm9keSIsIl9hZGRWYWx1ZXNUb1F1ZXJ5UGFyYW1zIiwiZ3JhbnRfdHlwZSIsImNvZGUiLCJjbGllbnRfaWQiLCJjbGllbnRJZCIsImNsaWVudF9zZWNyZXQiLCJvcGVuU2VjcmV0Iiwic2VjcmV0IiwicmVkaXJlY3RfdXJpIiwiX3JlZGlyZWN0VXJpIiwidG9TdHJpbmciLCJfZmV0Y2giLCJoZWFkZXJzIiwiQWNjZXB0IiwidGhlbiIsImRhdGEiLCJqc29uIiwiZXJyb3IiLCJFcnJvciIsImFjY2Vzc190b2tlbiIsInJlZnJlc2hfdG9rZW4iLCJleHBpcmVzX2luIiwiY2F0Y2giLCJlcnIiLCJjb25jYXQiLCJtZXNzYWdlIiwiQXV0aG9yaXphdGlvbiIsInJldHJpZXZlQ3Jl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ZSxFQUFFQyxnQkFBZ0IsS0FDaEN2RCxLQUFLLENBQUNxRCxrQkFBa0IsQ0FBQ0MsZUFBZSxFQUFFQyxnQkFBZ0IsQ0FBQyxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9tZXRlb3ItZGV2ZWxvcGVyLW9hdXRoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiTWV0ZW9yRGV2ZWxvcGVyQWNjb3VudHMgPSB7fTtcblxuTWV0ZW9yRGV2ZWxvcGVyQWNjb3VudHMuX3NlcnZlciA9IFwiaHR0cHM6Ly93d3cubWV0ZW9yLmNvbVwiO1xuXG4vLyBPcHRpb25zIGFyZTpcbi8vICAtIGRldmVsb3BlckFjY291bnRzU2VydmVyOiBkZWZhdWx0cyB0byBcImh0dHBzOi8vd3d3Lm1ldGVvci5jb21cIlxuTWV0ZW9yRGV2ZWxvcGVyQWNjb3VudHMuX2NvbmZpZyA9IG9wdGlvbnMgPT4ge1xuICBpZiAob3B0aW9ucy5kZXZlbG9wZXJBY2NvdW50c1NlcnZlcikge1xuICAgIE1ldGVvckRldmVsb3BlckFjY291bnRzLl9zZXJ2ZXIgPSBvcHRpb25zLmRldmVsb3BlckFjY291bnRzU2VydmVyO1xuICB9XG59O1xuIiwiT0F1dGgucmVnaXN0ZXJTZXJ2aWNlKFwibWV0ZW9yLWRldmVsb3BlclwiLCAyLCBudWxsLCBhc3luYyBxdWVyeSA9PiB7XG4gIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZ2V0VG9rZW5zKHF1ZXJ5KTtcbiAgY29uc3QgeyBhY2Nlc3NUb2tlbiB9ID0gcmVzcG9uc2U7XG4gIGNvbnN0IGlkZW50aXR5ID0gYXdhaXQgZ2V0SWRlbnRpdHkoYWNjZXNzVG9rZW4pO1xuXG4gIGNvbnN0IHNlcnZpY2VEYXRhID0ge1xuICAgIGFjY2Vzc1Rva2VuOiBPQXV0aC5zZWFsU2VjcmV0KGFjY2Vzc1Rva2VuKSxcbiAgICBleHBpcmVzQXQ6ICgrbmV3IERhdGUpICsgKDEwMDAgKiByZXNwb25zZS5leHBpcmVzSW4pXG4gIH07XG5cbiAgT2JqZWN0LmFzc2lnbihzZXJ2aWNlRGF0YSwgaWRlbnRpdHkpO1xuXG4gIC8vIG9ubHkgc2V0IHRoZSB0b2tlbiBpbiBzZXJ2aWNlRGF0YSBpZiBpdCdzIHRoZXJlLiB0aGlzIGVuc3VyZXNcbiAgLy8gdGhhdCB3ZSBkb24ndCBsb3NlIG9sZCBvbmVzIChzaW5jZSB3ZSBvbmx5IGdldCB0aGlzIG9uIHRoZSBmaXJzdFxuICAvLyBsb2cgaW4gYXR0ZW1wdClcbiAgaWYgKHJlc3BvbnNlLnJlZnJlc2hUb2tlbilcbiAgICBzZXJ2aWNlRGF0YS5yZWZyZXNoVG9rZW4gPSBPQXV0aC5zZWFsU2VjcmV0KHJlc3BvbnNlLnJlZnJlc2hUb2tlbik7XG5cbiAgcmV0dXJuIHtcbiAgICBzZXJ2aWNlRGF0YSxcbiAgICBvcHRpb25zOiB7cHJvZmlsZToge25hbWU6IHNlcnZpY2VEYXRhLnVzZXJuYW1lfX1cbiAgICAvLyBYWFggdXNlIHVzZXJuYW1lIGZvciBuYW1lIHVudGlsIG1ldGVvciBhY2NvdW50cyBoYXMgYSBwcm9maWxlIHdpdGggYSBuYW1lXG4gIH07XG59KTtcblxuLy8gcmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZzpcbi8vIC0gYWNjZXNzVG9rZW5cbi8vIC0gZXhwaXJlc0luOiBsaWZldGltZSBvZiB0b2tlbiBpbiBzZWNvbmRzXG4vLyAtIHJlZnJlc2hUb2tlbiwgaWYgdGhpcyBpcyB0aGUgZmlyc3QgYXV0aG9yaXphdGlvbiByZXF1ZXN0IGFuZCB3ZSBnb3QgYVxuLy8gICByZWZyZXNoIHRva2VuIGZyb20gdGhlIHNlcnZlclxuY29uc3QgZ2V0VG9rZW5zID0gYXN5bmMgKHF1ZXJ5KSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IGF3YWl0IFNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zLmZpbmRPbmVBc3luYyh7XG4gICAgc2VydmljZTogJ21ldGVvci1kZXZlbG9wZXInLFxuICB9KTtcbiAgaWYgKCFjb25maWcpIHtcbiAgICB0aHJvdyBuZXcgU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3IoKTtcbiAgfVxuXG4gIGNvbnN0IGJvZHkgPSBPQXV0aC5fYWRkVmFsdWVzVG9RdWVyeVBhcmFtcyh7XG4gICAgZ3JhbnRfdHlwZTogJ2F1dGhvcml6YXRpb25fY29kZScsXG4gICAgY29kZTogcXVlcnkuY29kZSxcbiAgICBjbGllbnRfaWQ6IGNvbmZpZy5jbGllbnRJZCxcbiAgICBjbGllbnRfc2VjcmV0OiBPQXV0aC5vcGVuU2VjcmV0KGNvbmZpZy5zZWNyZXQpLFxuICAgIHJlZGlyZWN0X3VyaTogT0F1dGguX3JlZGlyZWN0VXJpKCdtZXRlb3ItZGV2ZWxvcGVyJywgY29uZmlnKSxcbiAgfSkudG9TdHJpbmcoKTtcblxuICByZXR1cm4gT0F1dGguX2ZldGNoKFxuICAgIE1ldGVvckRldmVsb3BlckFjY291bnRzLl9zZXJ2ZXIgKyAnL29hdXRoMi90b2tlbicsXG4gICAgJ1BPU1QnLFxuICAgIHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdDb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICAgIH0sXG4gICAgICBib2R5LFxuICAgIH1cbiAgKVxuICAgIC50aGVuKChkYXRhKSA9PiBkYXRhLmpzb24oKSlcbiAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggTWV0ZW9yIGRldmVsb3BlciBhY2NvdW50cy4gJyArXG4gICAgICAgICAgICAoZGF0YSA/IGRhdGEuZXJyb3IgOiAnTm8gcmVzcG9uc2UgZGF0YScpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBhY2Nlc3NUb2tlbjogZGF0YS5hY2Nlc3NfdG9rZW4sXG4gICAgICAgIHJlZnJlc2hUb2tlbjogZGF0YS5yZWZyZXNoX3Rva2VuLFxuICAgICAgICBleHBpcmVzSW46IGRhdGEuZXhwaXJlc19pbixcbiAgICAgIH07XG4gICAgfSlcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgdGhyb3cgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgbmV3IEVycm9yKFxuICAgICAgICAgIGBGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggTWV0ZW9yIGRldmVsb3BlciBhY2NvdW50cy4gJHtlcnIubWVzc2FnZX1gXG4gICAgICAgICksXG4gICAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9XG4gICAgICApO1xuICAgIH0pO1xufTtcblxuY29uc3QgZ2V0SWRlbnRpdHkgPSBhc3luYyAoYWNjZXNzVG9rZW4pID0+IHtcbiAgcmV0dXJuIE9BdXRoLl9mZXRjaChcbiAgICBgJHtNZXRlb3JEZXZlbG9wZXJBY2NvdW50cy5fc2VydmVyfS9hcGkvdjEvaWRlbnRpdHlgLFxuICAgICdHRVQnLFxuICAgIHtcbiAgICAgIGhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke2FjY2Vzc1Rva2VufWAgfSxcbiAgICB9XG4gIClcbiAgICAudGhlbigoZGF0YSkgPT4gZGF0YS5qc29uKCkpXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICAgIG5ldyBFcnJvcihcbiAgICAgICAgICAnRmFpbGVkIHRvIGZldGNoIGlkZW50aXR5IGZyb20gTWV0ZW9yIGRldmVsb3BlciBhY2NvdW50cy4gJyArXG4gICAgICAgICAgICBlcnIubWVzc2FnZVxuICAgICAgICApLFxuICAgICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICAgKTtcbiAgICB9KTtcbn07XG5cbk1ldGVvckRldmVsb3BlckFjY291bnRzLnJldHJpZXZlQ3JlZGVudGlhbCA9XG4gIChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpID0+XG4gICAgT0F1dGgucmV0cmlldmVDcmVkZW50aWFsKGNyZWRlbnRpYWxUb2tlbiwgY3JlZGVudGlhbFNlY3JldCk7XG4iXX0=
