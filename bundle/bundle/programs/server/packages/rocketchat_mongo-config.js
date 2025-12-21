Package["core-runtime"].queue("rocketchat:mongo-config",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var ECMAScript = Package.ecmascript.ECMAScript;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var HTTP = Package.http.HTTP;
var HTTPInternals = Package.http.HTTPInternals;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:mongo-config":{"server":{"index.js":function module(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/rocketchat_mongo-config/server/index.js                                                                    //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    let tls;
    module.link("tls", {
      default(v) {
        tls = v;
      }
    }, 0);
    let PassThrough;
    module.link("stream", {
      PassThrough(v) {
        PassThrough = v;
      }
    }, 1);
    let Email;
    module.link("meteor/email", {
      Email(v) {
        Email = v;
      }
    }, 2);
    let Mongo;
    module.link("meteor/mongo", {
      Mongo(v) {
        Mongo = v;
      }
    }, 3);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const shouldUseNativeOplog = ['yes', 'true'].includes(String(process.env.USE_NATIVE_OPLOG).toLowerCase());
    if (!shouldUseNativeOplog) {
      Package['disable-oplog'] = {};
    }

    // FIX For TLS error see more here https://github.com/RocketChat/Rocket.Chat/issues/9316
    // TODO: Remove after NodeJS fix it, more information
    // https://github.com/nodejs/node/issues/16196
    // https://github.com/nodejs/node/pull/16853
    // This is fixed in Node 10, but this supports LTS versions
    tls.DEFAULT_ECDH_CURVE = 'auto';
    const mongoConnectionOptions = _objectSpread(_objectSpread({}, !process.env.MONGO_URL.includes('retryWrites') && {
      retryWrites: false
    }), {}, {
      ignoreUndefined: false,
      // TODO ideally we should call isTracingEnabled(), but since this is a Meteor package we can't :/
      monitorCommands: ['yes', 'true'].includes(String(process.env.TRACING_ENABLED).toLowerCase())
    });
    const mongoOptionStr = process.env.MONGO_OPTIONS;
    if (typeof mongoOptionStr !== 'undefined') {
      const mongoOptions = JSON.parse(mongoOptionStr);
      Object.assign(mongoConnectionOptions, mongoOptions);
    }
    if (Object.keys(mongoConnectionOptions).length > 0) {
      Mongo.setConnectionOptions(mongoConnectionOptions);
    }
    process.env.HTTP_FORWARDED_COUNT = process.env.HTTP_FORWARDED_COUNT || '1';

    // Just print to logs if in TEST_MODE due to a bug in Meteor 2.5: TypeError: Cannot read property '_syncSendMail' of null
    if (process.env.TEST_MODE === 'true') {
      Email.sendAsync = async function _sendAsync(options) {
        console.log('Email.sendAsync', options);
      };
    } else if (process.env.NODE_ENV !== 'development') {
      // Send emails to a "fake" stream instead of print them in console in case MAIL_URL or SMTP is not configured
      const stream = new PassThrough();
      stream.on('data', () => {});
      stream.on('end', () => {});
      const {
        sendAsync
      } = Email;
      Email.sendAsync = function _sendAsync(options) {
        return sendAsync.call(this, _objectSpread({
          stream
        }, options));
      };
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
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/rocketchat:mongo-config/server/index.js"
  ],
  mainModulePath: "/node_modules/meteor/rocketchat:mongo-config/server/index.js"
}});

//# sourceURL=meteor://💻app/packages/rocketchat_mongo-config.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDptb25nby1jb25maWcvc2VydmVyL2luZGV4LmpzIl0sIm5hbWVzIjpbIl9vYmplY3RTcHJlYWQiLCJtb2R1bGUiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJ0bHMiLCJQYXNzVGhyb3VnaCIsIkVtYWlsIiwiTW9uZ28iLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsInNob3VsZFVzZU5hdGl2ZU9wbG9nIiwiaW5jbHVkZXMiLCJTdHJpbmciLCJwcm9jZXNzIiwiZW52IiwiVVNFX05BVElWRV9PUExPRyIsInRvTG93ZXJDYXNlIiwiUGFja2FnZSIsIkRFRkFVTFRfRUNESF9DVVJWRSIsIm1vbmdvQ29ubmVjdGlvbk9wdGlvbnMiLCJNT05HT19VUkwiLCJyZXRyeVdyaXRlcyIsImlnbm9yZVVuZGVmaW5lZCIsIm1vbml0b3JDb21tYW5kcyIsIlRSQUNJTkdfRU5BQkxFRCIsIm1vbmdvT3B0aW9uU3RyIiwiTU9OR09fT1BUSU9OUyIsIm1vbmdvT3B0aW9ucyIsIkpTT04iLCJwYXJzZSIsIk9iamVjdCIsImFzc2lnbiIsImtleXMiLCJsZW5ndGgiLCJzZXRDb25uZWN0aW9uT3B0aW9ucyIsIkhUVFBfRk9SV0FSREVEX0NPVU5UIiwiVEVTVF9NT0RFIiwic2VuZEFzeW5jIiwiX3NlbmRBc3luYyIsIm9wdGlvbnMiLCJjb25zb2xlIiwibG9nIiwiTk9ERV9FTlYiLCJzdHJlYW0iLCJvbiIsImNhbGwiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsYUFBYTtJQUFDQyxNQUFNLENBQUNDLElBQUksQ0FBQyxzQ0FBc0MsRUFBQztNQUFDQyxPQUFPQSxDQUFDQyxDQUFDLEVBQUM7UUFBQ0osYUFBYSxHQUFDSSxDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQXJHLElBQUlDLEdBQUc7SUFBQ0osTUFBTSxDQUFDQyxJQUFJLENBQUMsS0FBSyxFQUFDO01BQUNDLE9BQU9BLENBQUNDLENBQUMsRUFBQztRQUFDQyxHQUFHLEdBQUNELENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJRSxXQUFXO0lBQUNMLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLFFBQVEsRUFBQztNQUFDSSxXQUFXQSxDQUFDRixDQUFDLEVBQUM7UUFBQ0UsV0FBVyxHQUFDRixDQUFDO01BQUE7SUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0lBQUMsSUFBSUcsS0FBSztJQUFDTixNQUFNLENBQUNDLElBQUksQ0FBQyxjQUFjLEVBQUM7TUFBQ0ssS0FBS0EsQ0FBQ0gsQ0FBQyxFQUFDO1FBQUNHLEtBQUssR0FBQ0gsQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlJLEtBQUs7SUFBQ1AsTUFBTSxDQUFDQyxJQUFJLENBQUMsY0FBYyxFQUFDO01BQUNNLEtBQUtBLENBQUNKLENBQUMsRUFBQztRQUFDSSxLQUFLLEdBQUNKLENBQUM7TUFBQTtJQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7SUFBQyxJQUFJSyxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNQSxvQkFBb0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQztJQU03UyxNQUFNQyxvQkFBb0IsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUNDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDQyxnQkFBZ0IsQ0FBQyxDQUFDQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ3pHLElBQUksQ0FBQ04sb0JBQW9CLEVBQUU7TUFDMUJPLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUI7O0lBRUE7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBWixHQUFHLENBQUNhLGtCQUFrQixHQUFHLE1BQU07SUFFL0IsTUFBTUMsc0JBQXNCLEdBQUFuQixhQUFBLENBQUFBLGFBQUEsS0FFdkIsQ0FBQ2EsT0FBTyxDQUFDQyxHQUFHLENBQUNNLFNBQVMsQ0FBQ1QsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJO01BQUVVLFdBQVcsRUFBRTtJQUFNLENBQUM7TUFDNUVDLGVBQWUsRUFBRSxLQUFLO01BRXRCO01BQ0FDLGVBQWUsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQ1osUUFBUSxDQUFDQyxNQUFNLENBQUNDLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDVSxlQUFlLENBQUMsQ0FBQ1IsV0FBVyxDQUFDLENBQUM7SUFBQyxFQUM1RjtJQUVELE1BQU1TLGNBQWMsR0FBR1osT0FBTyxDQUFDQyxHQUFHLENBQUNZLGFBQWE7SUFDaEQsSUFBSSxPQUFPRCxjQUFjLEtBQUssV0FBVyxFQUFFO01BQzFDLE1BQU1FLFlBQVksR0FBR0MsSUFBSSxDQUFDQyxLQUFLLENBQUNKLGNBQWMsQ0FBQztNQUMvQ0ssTUFBTSxDQUFDQyxNQUFNLENBQUNaLHNCQUFzQixFQUFFUSxZQUFZLENBQUM7SUFDcEQ7SUFFQSxJQUFJRyxNQUFNLENBQUNFLElBQUksQ0FBQ2Isc0JBQXNCLENBQUMsQ0FBQ2MsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUNuRHpCLEtBQUssQ0FBQzBCLG9CQUFvQixDQUFDZixzQkFBc0IsQ0FBQztJQUNuRDtJQUVBTixPQUFPLENBQUNDLEdBQUcsQ0FBQ3FCLG9CQUFvQixHQUFHdEIsT0FBTyxDQUFDQyxHQUFHLENBQUNxQixvQkFBb0IsSUFBSSxHQUFHOztJQUUxRTtJQUNBLElBQUl0QixPQUFPLENBQUNDLEdBQUcsQ0FBQ3NCLFNBQVMsS0FBSyxNQUFNLEVBQUU7TUFDckM3QixLQUFLLENBQUM4QixTQUFTLEdBQUcsZUFBZUMsVUFBVUEsQ0FBQ0MsT0FBTyxFQUFFO1FBQ3BEQyxPQUFPLENBQUNDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRUYsT0FBTyxDQUFDO01BQ3hDLENBQUM7SUFDRixDQUFDLE1BQU0sSUFBSTFCLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDNEIsUUFBUSxLQUFLLGFBQWEsRUFBRTtNQUNsRDtNQUNBLE1BQU1DLE1BQU0sR0FBRyxJQUFJckMsV0FBVyxDQUFDLENBQUM7TUFDaENxQyxNQUFNLENBQUNDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztNQUMzQkQsTUFBTSxDQUFDQyxFQUFFLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7TUFFMUIsTUFBTTtRQUFFUDtNQUFVLENBQUMsR0FBRzlCLEtBQUs7TUFDM0JBLEtBQUssQ0FBQzhCLFNBQVMsR0FBRyxTQUFTQyxVQUFVQSxDQUFDQyxPQUFPLEVBQUU7UUFDOUMsT0FBT0YsU0FBUyxDQUFDUSxJQUFJLENBQUMsSUFBSSxFQUFBN0MsYUFBQTtVQUFJMkM7UUFBTSxHQUFLSixPQUFPLENBQUUsQ0FBQztNQUNwRCxDQUFDO0lBQ0Y7SUFBQ08sc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvcm9ja2V0Y2hhdF9tb25nby1jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdGxzIGZyb20gJ3Rscyc7XG5pbXBvcnQgeyBQYXNzVGhyb3VnaCB9IGZyb20gJ3N0cmVhbSc7XG5cbmltcG9ydCB7IEVtYWlsIH0gZnJvbSAnbWV0ZW9yL2VtYWlsJztcbmltcG9ydCB7IE1vbmdvIH0gZnJvbSAnbWV0ZW9yL21vbmdvJztcblxuY29uc3Qgc2hvdWxkVXNlTmF0aXZlT3Bsb2cgPSBbJ3llcycsICd0cnVlJ10uaW5jbHVkZXMoU3RyaW5nKHByb2Nlc3MuZW52LlVTRV9OQVRJVkVfT1BMT0cpLnRvTG93ZXJDYXNlKCkpO1xuaWYgKCFzaG91bGRVc2VOYXRpdmVPcGxvZykge1xuXHRQYWNrYWdlWydkaXNhYmxlLW9wbG9nJ10gPSB7fTtcbn1cblxuLy8gRklYIEZvciBUTFMgZXJyb3Igc2VlIG1vcmUgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vUm9ja2V0Q2hhdC9Sb2NrZXQuQ2hhdC9pc3N1ZXMvOTMxNlxuLy8gVE9ETzogUmVtb3ZlIGFmdGVyIE5vZGVKUyBmaXggaXQsIG1vcmUgaW5mb3JtYXRpb25cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvMTYxOTZcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9wdWxsLzE2ODUzXG4vLyBUaGlzIGlzIGZpeGVkIGluIE5vZGUgMTAsIGJ1dCB0aGlzIHN1cHBvcnRzIExUUyB2ZXJzaW9uc1xudGxzLkRFRkFVTFRfRUNESF9DVVJWRSA9ICdhdXRvJztcblxuY29uc3QgbW9uZ29Db25uZWN0aW9uT3B0aW9ucyA9IHtcblx0Ly8gYWRkIHJldHJ5V3JpdGVzPWZhbHNlIGlmIG5vdCBwcmVzZW50IGluIE1PTkdPX1VSTFxuXHQuLi4oIXByb2Nlc3MuZW52Lk1PTkdPX1VSTC5pbmNsdWRlcygncmV0cnlXcml0ZXMnKSAmJiB7IHJldHJ5V3JpdGVzOiBmYWxzZSB9KSxcblx0aWdub3JlVW5kZWZpbmVkOiBmYWxzZSxcblxuXHQvLyBUT0RPIGlkZWFsbHkgd2Ugc2hvdWxkIGNhbGwgaXNUcmFjaW5nRW5hYmxlZCgpLCBidXQgc2luY2UgdGhpcyBpcyBhIE1ldGVvciBwYWNrYWdlIHdlIGNhbid0IDovXG5cdG1vbml0b3JDb21tYW5kczogWyd5ZXMnLCAndHJ1ZSddLmluY2x1ZGVzKFN0cmluZyhwcm9jZXNzLmVudi5UUkFDSU5HX0VOQUJMRUQpLnRvTG93ZXJDYXNlKCkpLFxufTtcblxuY29uc3QgbW9uZ29PcHRpb25TdHIgPSBwcm9jZXNzLmVudi5NT05HT19PUFRJT05TO1xuaWYgKHR5cGVvZiBtb25nb09wdGlvblN0ciAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0Y29uc3QgbW9uZ29PcHRpb25zID0gSlNPTi5wYXJzZShtb25nb09wdGlvblN0cik7XG5cdE9iamVjdC5hc3NpZ24obW9uZ29Db25uZWN0aW9uT3B0aW9ucywgbW9uZ29PcHRpb25zKTtcbn1cblxuaWYgKE9iamVjdC5rZXlzKG1vbmdvQ29ubmVjdGlvbk9wdGlvbnMpLmxlbmd0aCA+IDApIHtcblx0TW9uZ28uc2V0Q29ubmVjdGlvbk9wdGlvbnMobW9uZ29Db25uZWN0aW9uT3B0aW9ucyk7XG59XG5cbnByb2Nlc3MuZW52LkhUVFBfRk9SV0FSREVEX0NPVU5UID0gcHJvY2Vzcy5lbnYuSFRUUF9GT1JXQVJERURfQ09VTlQgfHwgJzEnO1xuXG4vLyBKdXN0IHByaW50IHRvIGxvZ3MgaWYgaW4gVEVTVF9NT0RFIGR1ZSB0byBhIGJ1ZyBpbiBNZXRlb3IgMi41OiBUeXBlRXJyb3I6IENhbm5vdCByZWFkIHByb3BlcnR5ICdfc3luY1NlbmRNYWlsJyBvZiBudWxsXG5pZiAocHJvY2Vzcy5lbnYuVEVTVF9NT0RFID09PSAndHJ1ZScpIHtcblx0RW1haWwuc2VuZEFzeW5jID0gYXN5bmMgZnVuY3Rpb24gX3NlbmRBc3luYyhvcHRpb25zKSB7XG5cdFx0Y29uc29sZS5sb2coJ0VtYWlsLnNlbmRBc3luYycsIG9wdGlvbnMpO1xuXHR9O1xufSBlbHNlIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ2RldmVsb3BtZW50Jykge1xuXHQvLyBTZW5kIGVtYWlscyB0byBhIFwiZmFrZVwiIHN0cmVhbSBpbnN0ZWFkIG9mIHByaW50IHRoZW0gaW4gY29uc29sZSBpbiBjYXNlIE1BSUxfVVJMIG9yIFNNVFAgaXMgbm90IGNvbmZpZ3VyZWRcblx0Y29uc3Qgc3RyZWFtID0gbmV3IFBhc3NUaHJvdWdoKCk7XG5cdHN0cmVhbS5vbignZGF0YScsICgpID0+IHt9KTtcblx0c3RyZWFtLm9uKCdlbmQnLCAoKSA9PiB7fSk7XG5cblx0Y29uc3QgeyBzZW5kQXN5bmMgfSA9IEVtYWlsO1xuXHRFbWFpbC5zZW5kQXN5bmMgPSBmdW5jdGlvbiBfc2VuZEFzeW5jKG9wdGlvbnMpIHtcblx0XHRyZXR1cm4gc2VuZEFzeW5jLmNhbGwodGhpcywgeyBzdHJlYW0sIC4uLm9wdGlvbnMgfSk7XG5cdH07XG59XG4iXX0=
