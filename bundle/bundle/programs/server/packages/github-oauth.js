Package["core-runtime"].queue("github-oauth",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var OAuth = Package.oauth.OAuth;
var fetch = Package.fetch.fetch;
var Accounts = Package['accounts-base'].Accounts;
var ServiceConfiguration = Package['service-configuration'].ServiceConfiguration;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Github;

var require = meteorInstall({"node_modules":{"meteor":{"github-oauth":{"github_server.js":function module(){

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/github-oauth/github_server.js                                                                    //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
Github = {};
OAuth.registerService('github', 2, null, async query => {
  const accessToken = await getAccessToken(query);
  const identity = await getIdentity(accessToken);
  const emails = await getEmails(accessToken);
  const primaryEmail = emails.find(email => email.primary);
  return {
    serviceData: {
      id: identity.id,
      accessToken: OAuth.sealSecret(accessToken),
      email: identity.email || primaryEmail && primaryEmail.email || '',
      username: identity.login,
      name: identity.name,
      avatar: identity.avatar_url,
      company: identity.company,
      blog: identity.blog,
      location: identity.location,
      bio: identity.bio,
      emails
    },
    options: {
      profile: {
        name: identity.name
      }
    }
  };
});

// http://developer.github.com/v3/#user-agent-required
let userAgent = 'Meteor';
if (Meteor.release) userAgent += "/".concat(Meteor.release);
const getAccessToken = async query => {
  const config = await ServiceConfiguration.configurations.findOneAsync({
    service: 'github'
  });
  if (!config) throw new ServiceConfiguration.ConfigError();
  let response;
  try {
    const content = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.secret,
      code: query.code,
      redirect_uri: OAuth._redirectUri('github', config)
    });
    const request = await OAuth._fetch("https://github.com/login/oauth/access_token?".concat(content.toString()), 'POST', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      }
    });
    response = await request.json();
  } catch (err) {
    throw Object.assign(new Error("Failed to complete OAuth handshake with Github. ".concat(err.message)), {
      response: err.response
    });
  }
  if (response.error) {
    // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with GitHub. ".concat(response.error));
  } else {
    return response.access_token;
  }
};
const getIdentity = async accessToken => {
  try {
    const request = await OAuth._fetch('https://api.github.com/user', 'GET', {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent,
        Authorization: "token ".concat(accessToken)
      } // http://developer.github.com/v3/#user-agent-required
    });
    return await request.json();
  } catch (err) {
    throw Object.assign(new Error("Failed to fetch identity from Github. ".concat(err.message)), {
      response: err.response
    });
  }
};
const getEmails = async accessToken => {
  try {
    const request = await OAuth._fetch('https://api.github.com/user/emails', 'GET', {
      headers: {
        'User-Agent': userAgent,
        Accept: 'application/json',
        Authorization: "token ".concat(accessToken)
      } // http://developer.github.com/v3/#user-agent-required
    });
    return await request.json();
  } catch (err) {
    return [];
  }
};
Github.retrieveCredential = (credentialToken, credentialSecret) => OAuth.retrieveCredential(credentialToken, credentialSecret);
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Github: Github
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/github-oauth/github_server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/github-oauth.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvZ2l0aHViLW9hdXRoL2dpdGh1Yl9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiR2l0aHViIiwiT0F1dGgiLCJyZWdpc3RlclNlcnZpY2UiLCJxdWVyeSIsImFjY2Vzc1Rva2VuIiwiZ2V0QWNjZXNzVG9rZW4iLCJpZGVudGl0eSIsImdldElkZW50aXR5IiwiZW1haWxzIiwiZ2V0RW1haWxzIiwicHJpbWFyeUVtYWlsIiwiZmluZCIsImVtYWlsIiwicHJpbWFyeSIsInNlcnZpY2VEYXRhIiwiaWQiLCJzZWFsU2VjcmV0IiwidXNlcm5hbWUiLCJsb2dpbiIsIm5hbWUiLCJhdmF0YXIiLCJhdmF0YXJfdXJsIiwiY29tcGFueSIsImJsb2ciLCJsb2NhdGlvbiIsImJpbyIsIm9wdGlvbnMiLCJwcm9maWxlIiwidXNlckFnZW50IiwiTWV0ZW9yIiwicmVsZWFzZSIsImNvbmNhdCIsImNvbmZpZyIsIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJmaW5kT25lQXN5bmMiLCJzZXJ2aWNlIiwiQ29uZmlnRXJyb3IiLCJyZXNwb25zZSIsImNvbnRlbnQiLCJVUkxTZWFyY2hQYXJhbXMiLCJjbGllbnRfaWQiLCJjbGllbnRJZCIsImNsaWVudF9zZWNyZXQiLCJzZWNyZXQiLCJjb2RlIiwicmVkaXJlY3RfdXJpIiwiX3JlZGlyZWN0VXJpIiwicmVxdWVzdCIsIl9mZXRjaCIsInRvU3RyaW5nIiwiaGVhZGVycyIsIkFjY2VwdCIsImpzb24iLCJlcnIiLCJPYmplY3QiLCJhc3NpZ24iLCJFcnJvciIsIm1lc3NhZ2UiLCJlcnJvciIsImFjY2Vzc190b2tlbiIsIkF1dGhvcml6YXRpb24iLCJyZXRyaWV2ZUNyZWRlbnRpYWwiLCJjcmVkZW50aWFsVG9rZW4iLCJjcmVkZW50aWFsU2VjcmV0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQUEsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUVYQyxLQUFLLENBQUNDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFPQyxLQUFLLElBQUs7RUFDeEQsTUFBTUMsV0FBVyxHQUFHLE1BQU1DLGNBQWMsQ0FBQ0YsS0FBSyxDQUFDO0VBQy9DLE1BQU1HLFFBQVEsR0FBRyxNQUFNQyxXQUFXLENBQUNILFdBQVcsQ0FBQztFQUMvQyxNQUFNSSxNQUFNLEdBQUcsTUFBTUMsU0FBUyxDQUFDTCxXQUFXLENBQUM7RUFDM0MsTUFBTU0sWUFBWSxHQUFHRixNQUFNLENBQUNHLElBQUksQ0FBRUMsS0FBSyxJQUFLQSxLQUFLLENBQUNDLE9BQU8sQ0FBQztFQUUxRCxPQUFPO0lBQ0xDLFdBQVcsRUFBRTtNQUNYQyxFQUFFLEVBQUVULFFBQVEsQ0FBQ1MsRUFBRTtNQUNmWCxXQUFXLEVBQUVILEtBQUssQ0FBQ2UsVUFBVSxDQUFDWixXQUFXLENBQUM7TUFDMUNRLEtBQUssRUFBRU4sUUFBUSxDQUFDTSxLQUFLLElBQUtGLFlBQVksSUFBSUEsWUFBWSxDQUFDRSxLQUFNLElBQUksRUFBRTtNQUNuRUssUUFBUSxFQUFFWCxRQUFRLENBQUNZLEtBQUs7TUFDeEJDLElBQUksRUFBRWIsUUFBUSxDQUFDYSxJQUFJO01BQ25CQyxNQUFNLEVBQUVkLFFBQVEsQ0FBQ2UsVUFBVTtNQUMzQkMsT0FBTyxFQUFFaEIsUUFBUSxDQUFDZ0IsT0FBTztNQUN6QkMsSUFBSSxFQUFFakIsUUFBUSxDQUFDaUIsSUFBSTtNQUNuQkMsUUFBUSxFQUFFbEIsUUFBUSxDQUFDa0IsUUFBUTtNQUMzQkMsR0FBRyxFQUFFbkIsUUFBUSxDQUFDbUIsR0FBRztNQUNqQmpCO0lBQ0YsQ0FBQztJQUNEa0IsT0FBTyxFQUFFO01BQUVDLE9BQU8sRUFBRTtRQUFFUixJQUFJLEVBQUViLFFBQVEsQ0FBQ2E7TUFBSztJQUFFO0VBQzlDLENBQUM7QUFDSCxDQUFDLENBQUM7O0FBRUY7QUFDQSxJQUFJUyxTQUFTLEdBQUcsUUFBUTtBQUN4QixJQUFJQyxNQUFNLENBQUNDLE9BQU8sRUFBRUYsU0FBUyxRQUFBRyxNQUFBLENBQVFGLE1BQU0sQ0FBQ0MsT0FBTyxDQUFFO0FBRXJELE1BQU16QixjQUFjLEdBQUcsTUFBT0YsS0FBSyxJQUFLO0VBQ3RDLE1BQU02QixNQUFNLEdBQUcsTUFBTUMsb0JBQW9CLENBQUNDLGNBQWMsQ0FBQ0MsWUFBWSxDQUFDO0lBQ3BFQyxPQUFPLEVBQUU7RUFDWCxDQUFDLENBQUM7RUFDRixJQUFJLENBQUNKLE1BQU0sRUFBRSxNQUFNLElBQUlDLG9CQUFvQixDQUFDSSxXQUFXLENBQUMsQ0FBQztFQUV6RCxJQUFJQyxRQUFRO0VBQ1osSUFBSTtJQUNGLE1BQU1DLE9BQU8sR0FBRyxJQUFJQyxlQUFlLENBQUM7TUFDbENDLFNBQVMsRUFBRVQsTUFBTSxDQUFDVSxRQUFRO01BQzFCQyxhQUFhLEVBQUVYLE1BQU0sQ0FBQ1ksTUFBTTtNQUM1QkMsSUFBSSxFQUFFMUMsS0FBSyxDQUFDMEMsSUFBSTtNQUNoQkMsWUFBWSxFQUFFN0MsS0FBSyxDQUFDOEMsWUFBWSxDQUM5QixRQUFRLEVBQ1JmLE1BQ0Y7SUFDRixDQUFDLENBQUM7SUFDRixNQUFNZ0IsT0FBTyxHQUFHLE1BQU0vQyxLQUFLLENBQUNnRCxNQUFNLGdEQUFBbEIsTUFBQSxDQUNlUSxPQUFPLENBQUNXLFFBQVEsQ0FBQyxDQUFDLEdBQ2pFLE1BQU0sRUFDTjtNQUNFQyxPQUFPLEVBQUU7UUFDUEMsTUFBTSxFQUFFLGtCQUFrQjtRQUMxQixZQUFZLEVBQUV4QjtNQUNoQjtJQUNGLENBQ0YsQ0FBQztJQUNEVSxRQUFRLEdBQUcsTUFBTVUsT0FBTyxDQUFDSyxJQUFJLENBQUMsQ0FBQztFQUNqQyxDQUFDLENBQUMsT0FBT0MsR0FBRyxFQUFFO0lBQ1osTUFBTUMsTUFBTSxDQUFDQyxNQUFNLENBQ2pCLElBQUlDLEtBQUssb0RBQUExQixNQUFBLENBQzRDdUIsR0FBRyxDQUFDSSxPQUFPLENBQ2hFLENBQUMsRUFDRDtNQUFFcEIsUUFBUSxFQUFFZ0IsR0FBRyxDQUFDaEI7SUFBUyxDQUMzQixDQUFDO0VBQ0g7RUFDQSxJQUFJQSxRQUFRLENBQUNxQixLQUFLLEVBQUU7SUFDbEI7SUFDQSxNQUFNLElBQUlGLEtBQUssb0RBQUExQixNQUFBLENBQ3NDTyxRQUFRLENBQUNxQixLQUFLLENBQ25FLENBQUM7RUFDSCxDQUFDLE1BQU07SUFDTCxPQUFPckIsUUFBUSxDQUFDc0IsWUFBWTtFQUM5QjtBQUNGLENBQUM7QUFFRCxNQUFNckQsV0FBVyxHQUFHLE1BQU9ILFdBQVcsSUFBSztFQUN6QyxJQUFJO0lBQ0YsTUFBTTRDLE9BQU8sR0FBRyxNQUFNL0MsS0FBSyxDQUFDZ0QsTUFBTSxDQUFDLDZCQUE2QixFQUFFLEtBQUssRUFBRTtNQUN2RUUsT0FBTyxFQUFFO1FBQ1BDLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsWUFBWSxFQUFFeEIsU0FBUztRQUN2QmlDLGFBQWEsV0FBQTlCLE1BQUEsQ0FBVzNCLFdBQVc7TUFDckMsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxDQUFDO0lBQ0YsT0FBTyxNQUFNNEMsT0FBTyxDQUFDSyxJQUFJLENBQUMsQ0FBQztFQUM3QixDQUFDLENBQUMsT0FBT0MsR0FBRyxFQUFFO0lBQ1osTUFBTUMsTUFBTSxDQUFDQyxNQUFNLENBQ2pCLElBQUlDLEtBQUssMENBQUExQixNQUFBLENBQTBDdUIsR0FBRyxDQUFDSSxPQUFPLENBQUUsQ0FBQyxFQUNqRTtNQUFFcEIsUUFBUSxFQUFFZ0IsR0FBRyxDQUFDaEI7SUFBUyxDQUMzQixDQUFDO0VBQ0g7QUFDRixDQUFDO0FBRUQsTUFBTTdCLFNBQVMsR0FBRyxNQUFPTCxXQUFXLElBQUs7RUFDdkMsSUFBSTtJQUNGLE1BQU00QyxPQUFPLEdBQUcsTUFBTS9DLEtBQUssQ0FBQ2dELE1BQU0sQ0FBQyxvQ0FBb0MsRUFBRSxLQUFLLEVBQUU7TUFDOUVFLE9BQU8sRUFBRTtRQUNQLFlBQVksRUFBRXZCLFNBQVM7UUFDdkJ3QixNQUFNLEVBQUUsa0JBQWtCO1FBQzFCUyxhQUFhLFdBQUE5QixNQUFBLENBQVczQixXQUFXO01BQ3JDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQztJQUNGLE9BQU8sTUFBTTRDLE9BQU8sQ0FBQ0ssSUFBSSxDQUFDLENBQUM7RUFDN0IsQ0FBQyxDQUFDLE9BQU9DLEdBQUcsRUFBRTtJQUNaLE9BQU8sRUFBRTtFQUNYO0FBQ0YsQ0FBQztBQUVEdEQsTUFBTSxDQUFDOEQsa0JBQWtCLEdBQUcsQ0FBQ0MsZUFBZSxFQUFFQyxnQkFBZ0IsS0FDNUQvRCxLQUFLLENBQUM2RCxrQkFBa0IsQ0FBQ0MsZUFBZSxFQUFFQyxnQkFBZ0IsQ0FBQyxDIiwiZmlsZSI6Ii9wYWNrYWdlcy9naXRodWItb2F1dGguanMiLCJzb3VyY2VzQ29udGVudCI6WyJHaXRodWIgPSB7fTtcblxuT0F1dGgucmVnaXN0ZXJTZXJ2aWNlKCdnaXRodWInLCAyLCBudWxsLCBhc3luYyAocXVlcnkpID0+IHtcbiAgY29uc3QgYWNjZXNzVG9rZW4gPSBhd2FpdCBnZXRBY2Nlc3NUb2tlbihxdWVyeSk7XG4gIGNvbnN0IGlkZW50aXR5ID0gYXdhaXQgZ2V0SWRlbnRpdHkoYWNjZXNzVG9rZW4pO1xuICBjb25zdCBlbWFpbHMgPSBhd2FpdCBnZXRFbWFpbHMoYWNjZXNzVG9rZW4pO1xuICBjb25zdCBwcmltYXJ5RW1haWwgPSBlbWFpbHMuZmluZCgoZW1haWwpID0+IGVtYWlsLnByaW1hcnkpO1xuXG4gIHJldHVybiB7XG4gICAgc2VydmljZURhdGE6IHtcbiAgICAgIGlkOiBpZGVudGl0eS5pZCxcbiAgICAgIGFjY2Vzc1Rva2VuOiBPQXV0aC5zZWFsU2VjcmV0KGFjY2Vzc1Rva2VuKSxcbiAgICAgIGVtYWlsOiBpZGVudGl0eS5lbWFpbCB8fCAocHJpbWFyeUVtYWlsICYmIHByaW1hcnlFbWFpbC5lbWFpbCkgfHwgJycsXG4gICAgICB1c2VybmFtZTogaWRlbnRpdHkubG9naW4sXG4gICAgICBuYW1lOiBpZGVudGl0eS5uYW1lLFxuICAgICAgYXZhdGFyOiBpZGVudGl0eS5hdmF0YXJfdXJsLFxuICAgICAgY29tcGFueTogaWRlbnRpdHkuY29tcGFueSxcbiAgICAgIGJsb2c6IGlkZW50aXR5LmJsb2csXG4gICAgICBsb2NhdGlvbjogaWRlbnRpdHkubG9jYXRpb24sXG4gICAgICBiaW86IGlkZW50aXR5LmJpbyxcbiAgICAgIGVtYWlsc1xuICAgIH0sXG4gICAgb3B0aW9uczogeyBwcm9maWxlOiB7IG5hbWU6IGlkZW50aXR5Lm5hbWUgfSB9XG4gIH07XG59KTtcblxuLy8gaHR0cDovL2RldmVsb3Blci5naXRodWIuY29tL3YzLyN1c2VyLWFnZW50LXJlcXVpcmVkXG5sZXQgdXNlckFnZW50ID0gJ01ldGVvcic7XG5pZiAoTWV0ZW9yLnJlbGVhc2UpIHVzZXJBZ2VudCArPSBgLyR7TWV0ZW9yLnJlbGVhc2V9YDtcblxuY29uc3QgZ2V0QWNjZXNzVG9rZW4gPSBhc3luYyAocXVlcnkpID0+IHtcbiAgY29uc3QgY29uZmlnID0gYXdhaXQgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuZmluZE9uZUFzeW5jKHtcbiAgICBzZXJ2aWNlOiAnZ2l0aHViJ1xuICB9KTtcbiAgaWYgKCFjb25maWcpIHRocm93IG5ldyBTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcigpO1xuXG4gIGxldCByZXNwb25zZTtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb250ZW50ID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICBjbGllbnRfaWQ6IGNvbmZpZy5jbGllbnRJZCxcbiAgICAgIGNsaWVudF9zZWNyZXQ6IGNvbmZpZy5zZWNyZXQsXG4gICAgICBjb2RlOiBxdWVyeS5jb2RlLFxuICAgICAgcmVkaXJlY3RfdXJpOiBPQXV0aC5fcmVkaXJlY3RVcmkoXG4gICAgICAgICdnaXRodWInLFxuICAgICAgICBjb25maWdcbiAgICAgIClcbiAgICB9KTtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXdhaXQgT0F1dGguX2ZldGNoKFxuICAgICAgYGh0dHBzOi8vZ2l0aHViLmNvbS9sb2dpbi9vYXV0aC9hY2Nlc3NfdG9rZW4/JHtjb250ZW50LnRvU3RyaW5nKCl9YCxcbiAgICAgICdQT1NUJyxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICdVc2VyLUFnZW50JzogdXNlckFnZW50XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIHJlc3BvbnNlID0gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoXG4gICAgICAgIGBGYWlsZWQgdG8gY29tcGxldGUgT0F1dGggaGFuZHNoYWtlIHdpdGggR2l0aHViLiAke2Vyci5tZXNzYWdlfWBcbiAgICAgICksXG4gICAgICB7IHJlc3BvbnNlOiBlcnIucmVzcG9uc2UgfVxuICAgICk7XG4gIH1cbiAgaWYgKHJlc3BvbnNlLmVycm9yKSB7XG4gICAgLy8gaWYgdGhlIGh0dHAgcmVzcG9uc2Ugd2FzIGEganNvbiBvYmplY3Qgd2l0aCBhbiBlcnJvciBhdHRyaWJ1dGVcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRmFpbGVkIHRvIGNvbXBsZXRlIE9BdXRoIGhhbmRzaGFrZSB3aXRoIEdpdEh1Yi4gJHtyZXNwb25zZS5lcnJvcn1gXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gcmVzcG9uc2UuYWNjZXNzX3Rva2VuO1xuICB9XG59O1xuXG5jb25zdCBnZXRJZGVudGl0eSA9IGFzeW5jIChhY2Nlc3NUb2tlbikgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBhd2FpdCBPQXV0aC5fZmV0Y2goJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vdXNlcicsICdHRVQnLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIEFjY2VwdDogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnVXNlci1BZ2VudCc6IHVzZXJBZ2VudCxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYHRva2VuICR7YWNjZXNzVG9rZW59YFxuICAgICAgfSAvLyBodHRwOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvI3VzZXItYWdlbnQtcmVxdWlyZWRcbiAgICB9KTtcbiAgICByZXR1cm4gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHRocm93IE9iamVjdC5hc3NpZ24oXG4gICAgICBuZXcgRXJyb3IoYEZhaWxlZCB0byBmZXRjaCBpZGVudGl0eSBmcm9tIEdpdGh1Yi4gJHtlcnIubWVzc2FnZX1gKSxcbiAgICAgIHsgcmVzcG9uc2U6IGVyci5yZXNwb25zZSB9XG4gICAgKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RW1haWxzID0gYXN5bmMgKGFjY2Vzc1Rva2VuKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGF3YWl0IE9BdXRoLl9mZXRjaCgnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS91c2VyL2VtYWlscycsICdHRVQnLCB7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdVc2VyLUFnZW50JzogdXNlckFnZW50LFxuICAgICAgICBBY2NlcHQ6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYHRva2VuICR7YWNjZXNzVG9rZW59YFxuICAgICAgfSAvLyBodHRwOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvI3VzZXItYWdlbnQtcmVxdWlyZWRcbiAgICB9KTtcbiAgICByZXR1cm4gYXdhaXQgcmVxdWVzdC5qc29uKCk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBbXTtcbiAgfVxufTtcblxuR2l0aHViLnJldHJpZXZlQ3JlZGVudGlhbCA9IChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpID0+XG4gIE9BdXRoLnJldHJpZXZlQ3JlZGVudGlhbChjcmVkZW50aWFsVG9rZW4sIGNyZWRlbnRpYWxTZWNyZXQpO1xuIl19
