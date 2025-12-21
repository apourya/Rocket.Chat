Package["core-runtime"].queue("service-configuration",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var Accounts = Package['accounts-base'].Accounts;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var ServiceConfiguration;

var require = meteorInstall({"node_modules":{"meteor":{"service-configuration":{"service_configuration_common.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                        //
// packages/service-configuration/service_configuration_common.js                                         //
//                                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                          //
if (typeof ServiceConfiguration === 'undefined') {
  ServiceConfiguration = {};
}

// Table containing documents with configuration options for each
// login service
ServiceConfiguration.configurations = new Mongo.Collection('meteor_accounts_loginServiceConfiguration', {
  _preventAutopublish: true,
  connection: Meteor.isClient ? Accounts.connection : Meteor.connection
});
// Leave this collection open in insecure mode. In theory, someone could
// hijack your oauth connect requests to a different endpoint or appId,
// but you did ask for 'insecure'. The advantage is that it is much
// easier to write a configuration wizard that works only in insecure
// mode.

// Thrown when trying to use a login service which is not configured
ServiceConfiguration.ConfigError = function (serviceName) {
  if (Meteor.isClient && !Accounts.loginServicesConfigured()) {
    this.message = 'Login service configuration not yet loaded';
  } else if (serviceName) {
    this.message = 'Service ' + serviceName + ' not configured';
  } else {
    this.message = 'Service not configured';
  }
};
ServiceConfiguration.ConfigError.prototype = new Error();
ServiceConfiguration.ConfigError.prototype.name = 'ServiceConfiguration.ConfigError';
////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"service_configuration_server.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                        //
// packages/service-configuration/service_configuration_server.js                                         //
//                                                                                                        //
////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    // Only one configuration should ever exist for each service.
    // A unique index helps avoid various race conditions which could
    // otherwise lead to an inconsistent database state (when there are multiple
    // configurations for a single service, which configuration is correct?)
    try {
      ServiceConfiguration.configurations.createIndexAsync({
        service: 1
      }, {
        unique: true
      });
    } catch (err) {
      console.error('The service-configuration package persists configuration in the ' + 'meteor_accounts_loginServiceConfiguration collection in MongoDB. As ' + 'each service should have exactly one configuration, Meteor ' + 'automatically creates a MongoDB index with a unique constraint on the ' + ' meteor_accounts_loginServiceConfiguration collection. The ' + 'createIndex command which creates that index is failing.\n\n' + 'Meteor versions before 1.0.4 did not create this index. If you recently ' + 'upgraded and are seeing this error message for the first time, please ' + 'check your meteor_accounts_loginServiceConfiguration collection for ' + 'multiple configuration entries for the same service and delete ' + 'configuration entries until there is no more than one configuration ' + 'entry per service.\n\n' + 'If the meteor_accounts_loginServiceConfiguration collection looks ' + 'fine, the createIndex command is failing for some other reason.\n\n' + 'For more information on this history of this issue, please see ' + 'https://github.com/meteor/meteor/pull/3514.\n');
      throw err;
    }
    Meteor.startup(() => {
      var _Meteor$settings, _Meteor$settings$pack;
      const settings = (_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : _Meteor$settings$pack['service-configuration'];
      if (!settings) return;
      for (const key of Object.keys(settings)) {
        ServiceConfiguration.configurations.upsertAsync({
          service: key
        }, {
          $set: settings[key]
        });
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
////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      ServiceConfiguration: ServiceConfiguration
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/service-configuration/service_configuration_common.js",
    "/node_modules/meteor/service-configuration/service_configuration_server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/service-configuration.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvc2VydmljZS1jb25maWd1cmF0aW9uL3NlcnZpY2VfY29uZmlndXJhdGlvbl9jb21tb24uanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3NlcnZpY2UtY29uZmlndXJhdGlvbi9zZXJ2aWNlX2NvbmZpZ3VyYXRpb25fc2VydmVyLmpzIl0sIm5hbWVzIjpbIlNlcnZpY2VDb25maWd1cmF0aW9uIiwiY29uZmlndXJhdGlvbnMiLCJNb25nbyIsIkNvbGxlY3Rpb24iLCJfcHJldmVudEF1dG9wdWJsaXNoIiwiY29ubmVjdGlvbiIsIk1ldGVvciIsImlzQ2xpZW50IiwiQWNjb3VudHMiLCJDb25maWdFcnJvciIsInNlcnZpY2VOYW1lIiwibG9naW5TZXJ2aWNlc0NvbmZpZ3VyZWQiLCJtZXNzYWdlIiwicHJvdG90eXBlIiwiRXJyb3IiLCJuYW1lIiwibW9kdWxlIiwibGluayIsInYiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsImNyZWF0ZUluZGV4QXN5bmMiLCJzZXJ2aWNlIiwidW5pcXVlIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwic3RhcnR1cCIsIl9NZXRlb3Ikc2V0dGluZ3MiLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2siLCJzZXR0aW5ncyIsInBhY2thZ2VzIiwia2V5IiwiT2JqZWN0Iiwia2V5cyIsInVwc2VydEFzeW5jIiwiJHNldCIsIl9fcmVpZnlfYXN5bmNfcmVzdWx0X18iLCJfcmVpZnlFcnJvciIsInNlbGYiLCJhc3luYyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJLE9BQU9BLG9CQUFvQixLQUFLLFdBQVcsRUFBRTtFQUMvQ0Esb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO0FBQzNCOztBQUVBO0FBQ0E7QUFDQUEsb0JBQW9CLENBQUNDLGNBQWMsR0FBRyxJQUFJQyxLQUFLLENBQUNDLFVBQVUsQ0FDeEQsMkNBQTJDLEVBQzNDO0VBQ0VDLG1CQUFtQixFQUFF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c0NvbnRlbnQiOlsiaWYgKHR5cGVvZiBTZXJ2aWNlQ29uZmlndXJhdGlvbiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgU2VydmljZUNvbmZpZ3VyYXRpb24gPSB7fTtcbn1cblxuLy8gVGFibGUgY29udGFpbmluZyBkb2N1bWVudHMgd2l0aCBjb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIGVhY2hcbi8vIGxvZ2luIHNlcnZpY2VcblNlcnZpY2VDb25maWd1cmF0aW9uLmNvbmZpZ3VyYXRpb25zID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXG4gICdtZXRlb3JfYWNjb3VudHNfbG9naW5TZXJ2aWNlQ29uZmlndXJhdGlvbicsXG4gIHtcbiAgICBfcHJldmVudEF1dG9wdWJsaXNoOiB0cnVlLFxuICAgIGNvbm5lY3Rpb246IE1ldGVvci5pc0NsaWVudCA/IEFjY291bnRzLmNvbm5lY3Rpb24gOiBNZXRlb3IuY29ubmVjdGlvbixcbiAgfVxuKTtcbi8vIExlYXZlIHRoaXMgY29sbGVjdGlvbiBvcGVuIGluIGluc2VjdXJlIG1vZGUuIEluIHRoZW9yeSwgc29tZW9uZSBjb3VsZFxuLy8gaGlqYWNrIHlvdXIgb2F1dGggY29ubmVjdCByZXF1ZXN0cyB0byBhIGRpZmZlcmVudCBlbmRwb2ludCBvciBhcHBJZCxcbi8vIGJ1dCB5b3UgZGlkIGFzayBmb3IgJ2luc2VjdXJlJy4gVGhlIGFkdmFudGFnZSBpcyB0aGF0IGl0IGlzIG11Y2hcbi8vIGVhc2llciB0byB3cml0ZSBhIGNvbmZpZ3VyYXRpb24gd2l6YXJkIHRoYXQgd29ya3Mgb25seSBpbiBpbnNlY3VyZVxuLy8gbW9kZS5cblxuLy8gVGhyb3duIHdoZW4gdHJ5aW5nIHRvIHVzZSBhIGxvZ2luIHNlcnZpY2Ugd2hpY2ggaXMgbm90IGNvbmZpZ3VyZWRcblNlcnZpY2VDb25maWd1cmF0aW9uLkNvbmZpZ0Vycm9yID0gZnVuY3Rpb24oc2VydmljZU5hbWUpIHtcbiAgaWYgKE1ldGVvci5pc0NsaWVudCAmJiAhQWNjb3VudHMubG9naW5TZXJ2aWNlc0NvbmZpZ3VyZWQoKSkge1xuICAgIHRoaXMubWVzc2FnZSA9ICdMb2dpbiBzZXJ2aWNlIGNvbmZpZ3VyYXRpb24gbm90IHlldCBsb2FkZWQnO1xuICB9IGVsc2UgaWYgKHNlcnZpY2VOYW1lKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gJ1NlcnZpY2UgJyArIHNlcnZpY2VOYW1lICsgJyBub3QgY29uZmlndXJlZCc7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5tZXNzYWdlID0gJ1NlcnZpY2Ugbm90IGNvbmZpZ3VyZWQnO1xuICB9XG59O1xuU2VydmljZUNvbmZpZ3VyYXRpb24uQ29uZmlnRXJyb3IucHJvdG90eXBlID0gbmV3IEVycm9yKCk7XG5TZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvci5wcm90b3R5cGUubmFtZSA9XG4gICdTZXJ2aWNlQ29uZmlndXJhdGlvbi5Db25maWdFcnJvcic7XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJztcblxuLy8gT25seSBvbmUgY29uZmlndXJhdGlvbiBzaG91bGQgZXZlciBleGlzdCBmb3IgZWFjaCBzZXJ2aWNlLlxuLy8gQSB1bmlxdWUgaW5kZXggaGVscHMgYXZvaWQgdmFyaW91cyByYWNlIGNvbmRpdGlvbnMgd2hpY2ggY291bGRcbi8vIG90aGVyd2lzZSBsZWFkIHRvIGFuIGluY29uc2lzdGVudCBkYXRhYmFzZSBzdGF0ZSAod2hlbiB0aGVyZSBhcmUgbXVsdGlwbGVcbi8vIGNvbmZpZ3VyYXRpb25zIGZvciBhIHNpbmdsZSBzZXJ2aWNlLCB3aGljaCBjb25maWd1cmF0aW9uIGlzIGNvcnJlY3Q/KVxudHJ5IHtcbiAgU2VydmljZUNvbmZpZ3VyYXRpb24uY29uZmlndXJhdGlvbnMuY3JlYXRlSW5kZXhBc3luYyhcbiAgICB7IHNlcnZpY2U6IDEgfSxcbiAgICB7IHVuaXF1ZTogdHJ1ZSB9XG4gICk7XG59IGNhdGNoIChlcnIpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhlIHNlcnZpY2UtY29uZmlndXJhdGlvbiBwYWNrYWdlIHBlcnNpc3RzIGNvbmZpZ3VyYXRpb24gaW4gdGhlICcgK1xuICAgICAgJ21ldGVvcl9hY2NvdW50c19sb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIGNvbGxlY3Rpb24gaW4gTW9uZ29EQi4gQXMgJyArXG4gICAgICAnZWFjaCBzZXJ2aWNlIHNob3VsZCBoYXZlIGV4YWN0bHkgb25lIGNvbmZpZ3VyYXRpb24sIE1ldGVvciAnICtcbiAgICAgICdhdXRvbWF0aWNhbGx5IGNyZWF0ZXMgYSBNb25nb0RCIGluZGV4IHdpdGggYSB1bmlxdWUgY29uc3RyYWludCBvbiB0aGUgJyArXG4gICAgICAnIG1ldGVvcl9hY2NvdW50c19sb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIGNvbGxlY3Rpb24uIFRoZSAnICtcbiAgICAgICdjcmVhdGVJbmRleCBjb21tYW5kIHdoaWNoIGNyZWF0ZXMgdGhhdCBpbmRleCBpcyBmYWlsaW5nLlxcblxcbicgK1xuICAgICAgJ01ldGVvciB2ZXJzaW9ucyBiZWZvcmUgMS4wLjQgZGlkIG5vdCBjcmVhdGUgdGhpcyBpbmRleC4gSWYgeW91IHJlY2VudGx5ICcgK1xuICAgICAgJ3VwZ3JhZGVkIGFuZCBhcmUgc2VlaW5nIHRoaXMgZXJyb3IgbWVzc2FnZSBmb3IgdGhlIGZpcnN0IHRpbWUsIHBsZWFzZSAnICtcbiAgICAgICdjaGVjayB5b3VyIG1ldGVvcl9hY2NvdW50c19sb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIGNvbGxlY3Rpb24gZm9yICcgK1xuICAgICAgJ211bHRpcGxlIGNvbmZpZ3VyYXRpb24gZW50cmllcyBmb3IgdGhlIHNhbWUgc2VydmljZSBhbmQgZGVsZXRlICcgK1xuICAgICAgJ2NvbmZpZ3VyYXRpb24gZW50cmllcyB1bnRpbCB0aGVyZSBpcyBubyBtb3JlIHRoYW4gb25lIGNvbmZpZ3VyYXRpb24gJyArXG4gICAgICAnZW50cnkgcGVyIHNlcnZpY2UuXFxuXFxuJyArXG4gICAgICAnSWYgdGhlIG1ldGVvcl9hY2NvdW50c19sb2dpblNlcnZpY2VDb25maWd1cmF0aW9uIGNvbGxlY3Rpb24gbG9va3MgJyArXG4gICAgICAnZmluZSwgdGhlIGNyZWF0ZUluZGV4IGNvbW1hbmQgaXMgZmFpbGluZyBmb3Igc29tZSBvdGhlciByZWFzb24uXFxuXFxuJyArXG4gICAgICAnRm9yIG1vcmUgaW5mb3JtYXRpb24gb24gdGhpcyBoaXN0b3J5IG9mIHRoaXMgaXNzdWUsIHBsZWFzZSBzZWUgJyArXG4gICAgICAnaHR0cHM6Ly9naXRodWIuY29tL21ldGVvci9tZXRlb3IvcHVsbC8zNTE0LlxcbidcbiAgKTtcbiAgdGhyb3cgZXJyO1xufVxuXG5NZXRlb3Iuc3RhcnR1cCgoKSA9PiB7XG4gIGNvbnN0IHNldHRpbmdzID0gTWV0ZW9yLnNldHRpbmdzPy5wYWNrYWdlcz8uWydzZXJ2aWNlLWNvbmZpZ3VyYXRpb24nXTtcbiAgaWYgKCFzZXR0aW5ncykgcmV0dXJuO1xuICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3Qua2V5cyhzZXR0aW5ncykpIHtcbiAgICBTZXJ2aWNlQ29uZmlndXJhdGlvbi5jb25maWd1cmF0aW9ucy51cHNlcnRBc3luYyhcbiAgICAgIHsgc2VydmljZToga2V5IH0sXG4gICAgICB7XG4gICAgICAgICRzZXQ6IHNldHRpbmdzW2tleV0sXG4gICAgICB9XG4gICAgKTtcbiAgfVxufSk7XG4iXX0=
