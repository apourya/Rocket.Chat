Package["core-runtime"].queue("autoupdate",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var WebApp = Package.webapp.WebApp;
var WebAppInternals = Package.webapp.WebAppInternals;
var main = Package.webapp.main;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var Autoupdate;

var require = meteorInstall({"node_modules":{"meteor":{"autoupdate":{"autoupdate_server.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/autoupdate/autoupdate_server.js                                                                         //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
!module.wrapAsync(async function (module1, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let _objectSpread;
    module1.link("@babel/runtime/helpers/objectSpread2", {
      default(v) {
        _objectSpread = v;
      }
    }, 0);
    module1.export({
      Autoupdate: () => Autoupdate
    });
    let ClientVersions;
    module1.link("./client_versions.js", {
      ClientVersions(v) {
        ClientVersions = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const Autoupdate = __meteor_runtime_config__.autoupdate = {
      // Map from client architectures (web.browser, web.browser.legacy,
      // web.cordova) to version fields { version, versionRefreshable,
      // versionNonRefreshable, refreshable } that will be stored in
      // ClientVersions documents (whose IDs are client architectures). This
      // data gets serialized into the boilerplate because it's stored in
      // __meteor_runtime_config__.autoupdate.versions.
      versions: {}
    };
    // Stores acceptable client versions.
    const clientVersions = new ClientVersions();

    // The client hash includes __meteor_runtime_config__, so wait until
    // all packages have loaded and have had a chance to populate the
    // runtime config before using the client hash as our default auto
    // update version id.

    // Note: Tests allow people to override Autoupdate.autoupdateVersion before
    // startup.
    Autoupdate.autoupdateVersion = null;
    Autoupdate.autoupdateVersionRefreshable = null;
    Autoupdate.autoupdateVersionCordova = null;
    Autoupdate.appId = __meteor_runtime_config__.appId = process.env.APP_ID;
    var syncQueue = new Meteor._AsynchronousQueue();
    async function updateVersions(shouldReloadClientProgram) {
      // Step 1: load the current client program on the server
      if (shouldReloadClientProgram) {
        await WebAppInternals.reloadClientPrograms();
      }
      const {
        // If the AUTOUPDATE_VERSION environment variable is defined, it takes
        // precedence, but Autoupdate.autoupdateVersion is still supported as
        // a fallback. In most cases neither of these values will be defined.
        AUTOUPDATE_VERSION = Autoupdate.autoupdateVersion
      } = process.env;

      // Step 2: update __meteor_runtime_config__.autoupdate.versions.
      const clientArchs = Object.keys(WebApp.clientPrograms);
      clientArchs.forEach(arch => {
        Autoupdate.versions[arch] = {
          version: AUTOUPDATE_VERSION || WebApp.calculateClientHash(arch),
          versionRefreshable: AUTOUPDATE_VERSION || WebApp.calculateClientHashRefreshable(arch),
          versionNonRefreshable: AUTOUPDATE_VERSION || WebApp.calculateClientHashNonRefreshable(arch),
          versionReplaceable: AUTOUPDATE_VERSION || WebApp.calculateClientHashReplaceable(arch),
          versionHmr: WebApp.clientPrograms[arch].hmrVersion
        };
      });

      // Step 3: form the new client boilerplate which contains the updated
      // assets and __meteor_runtime_config__.
      if (shouldReloadClientProgram) {
        await WebAppInternals.generateBoilerplate();
      }

      // Step 4: update the ClientVersions collection.
      // We use `onListening` here because we need to use
      // `WebApp.getRefreshableAssets`, which is only set after
      // `WebApp.generateBoilerplate` is called by `main` in webapp.
      WebApp.onListening(() => {
        clientArchs.forEach(arch => {
          const payload = _objectSpread(_objectSpread({}, Autoupdate.versions[arch]), {}, {
            assets: WebApp.getRefreshableAssets(arch)
          });
          clientVersions.set(arch, payload);
        });
      });
    }
    Meteor.publish('meteor_autoupdate_clientVersions', function (appId) {
      // `null` happens when a client doesn't have an appId and passes
      // `undefined` to `Meteor.subscribe`. `undefined` is translated to
      // `null` as JSON doesn't have `undefined.
      check(appId, Match.OneOf(String, undefined, null));

      // Don't notify clients using wrong appId such as mobile apps built with a
      // different server but pointing at the same local url
      if (Autoupdate.appId && appId && Autoupdate.appId !== appId) return [];

      // Random value to delay the updates for 2-10 minutes
      const randomInterval = Meteor.isProduction ? (Math.floor(Math.random() * 8) + 2) * 1000 * 60 : 0;
      const stop = clientVersions.watch((version, isNew) => {
        setTimeout(() => {
          (isNew ? this.added : this.changed).call(this, 'meteor_autoupdate_clientVersions', version._id, version);
        }, randomInterval);
      });
      this.onStop(() => stop());
      this.ready();
    }, {
      is_auto: true
    });
    Meteor.startup(async function () {
      await updateVersions(false);

      // Force any connected clients that are still looking for these older
      // document IDs to reload.
      ['version', 'version-refreshable', 'version-cordova'].forEach(_id => {
        clientVersions.set(_id, {
          version: 'outdated'
        });
      });
    });
    function enqueueVersionsRefresh() {
      syncQueue.queueTask(async function () {
        await updateVersions(true);
      });
    }
    const setupListeners = () => {
      let onMessage;
      module1.link("meteor/inter-process-messaging", {
        onMessage(v) {
          onMessage = v;
        }
      }, 1);
      onMessage('client-refresh', enqueueVersionsRefresh);

      // Another way to tell the process to refresh: send SIGHUP signal
      process.on('SIGHUP', Meteor.bindEnvironment(function () {
        enqueueVersionsRefresh();
      }, 'handling SIGHUP signal for refresh'));
    };
    WebApp.onListening(function () {
      Promise.resolve(setupListeners());
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"client_versions.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/autoupdate/client_versions.js                                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    module.export({
      ClientVersions: () => ClientVersions
    });
    let Tracker;
    module.link("meteor/tracker", {
      Tracker(v) {
        Tracker = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class ClientVersions {
      constructor() {
        this._versions = new Map();
        this._watchCallbacks = new Set();
      }

      // Creates a Livedata store for use with `Meteor.connection.registerStore`.
      // After the store is registered, document updates reported by Livedata are
      // merged with the documents in this `ClientVersions` instance.
      createStore() {
        return {
          update: _ref => {
            let {
              id,
              msg,
              fields
            } = _ref;
            if (msg === 'added' || msg === 'changed') {
              this.set(id, fields);
            }
          }
        };
      }
      hasVersions() {
        return this._versions.size > 0;
      }
      get(id) {
        return this._versions.get(id);
      }

      // Adds or updates a version document and invokes registered callbacks for the
      // added/updated document. If a document with the given ID already exists, its
      // fields are merged with `fields`.
      set(id, fields) {
        let version = this._versions.get(id);
        let isNew = false;
        if (version) {
          Object.assign(version, fields);
        } else {
          version = _objectSpread({
            _id: id
          }, fields);
          isNew = true;
          this._versions.set(id, version);
        }
        this._watchCallbacks.forEach(_ref2 => {
          let {
            fn,
            filter
          } = _ref2;
          if (!filter || filter === version._id) {
            fn(version, isNew);
          }
        });
      }

      // Registers a callback that will be invoked when a version document is added
      // or changed. Calling the function returned by `watch` removes the callback.
      // If `skipInitial` is true, the callback isn't be invoked for existing
      // documents. If `filter` is set, the callback is only invoked for documents
      // with ID `filter`.
      watch(fn) {
        let {
          skipInitial,
          filter
        } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (!skipInitial) {
          const resolved = Promise.resolve();
          this._versions.forEach(version => {
            if (!filter || filter === version._id) {
              resolved.then(() => fn(version, true));
            }
          });
        }
        const callback = {
          fn,
          filter
        };
        this._watchCallbacks.add(callback);
        return () => this._watchCallbacks.delete(callback);
      }

      // A reactive data source for `Autoupdate.newClientAvailable`.
      newClientAvailable(id, fields, currentVersion) {
        function isNewVersion(version) {
          return version._id === id && fields.some(field => version[field] !== currentVersion[field]);
        }
        const dependency = new Tracker.Dependency();
        const version = this.get(id);
        dependency.depend();
        const stop = this.watch(version => {
          if (isNewVersion(version)) {
            dependency.changed();
            stop();
          }
        }, {
          skipInitial: true
        });
        return !!version && isNewVersion(version);
      }
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Autoupdate: Autoupdate
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/autoupdate/autoupdate_server.js"
  ],
  mainModulePath: "/node_modules/meteor/autoupdate/autoupdate_server.js"
}});

//# sourceURL=meteor://💻app/packages/autoupdate.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYXV0b3VwZGF0ZS9hdXRvdXBkYXRlX3NlcnZlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYXV0b3VwZGF0ZS9jbGllbnRfdmVyc2lvbnMuanMiXSwibmFtZXMiOlsiX29iamVjdFNwcmVhZCIsIm1vZHVsZTEiLCJsaW5rIiwiZGVmYXVsdCIsInYiLCJleHBvcnQiLCJBdXRvdXBkYXRlIiwiQ2xpZW50VmVyc2lvbnMiLCJfX3JlaWZ5V2FpdEZvckRlcHNfXyIsIl9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18iLCJhdXRvdXBkYXRlIiwidmVyc2lvbnMiLCJjbGllbnRWZXJzaW9ucyIsImF1dG91cGRhdGVWZXJzaW9uIiwiYXV0b3VwZGF0ZVZlcnNpb25SZWZyZXNoYWJsZSIsImF1dG91cGRhdGVWZXJzaW9uQ29yZG92YSIsImFwcElkIiwicHJvY2VzcyIsImVudiIsIkFQUF9JRCIsInN5bmNRdWV1ZSIsIk1ldGVvciIsIl9Bc3luY2hyb25vdXNRdWV1ZSIsInVwZGF0ZVZlcnNpb25zIiwic2hvdWxkUmVsb2FkQ2xpZW50UHJvZ3JhbSIsIldlYkFwcEludGVybmFscyIsInJlbG9hZENsaWVudFByb2dyYW1zIiwiQVVUT1VQREFURV9WRVJTSU9OIiwiY2xpZW50QXJjaHMiLCJPYmplY3QiLCJrZXlzIiwiV2ViQXBwIiwiY2xpZW50UHJvZ3JhbXMiLCJmb3JFYWNoIiwiYXJjaCIsInZlcnNpb24iLCJjYWxjdWxhdGVDbGllbnRIYXNoIiwidmVyc2lvblJlZnJlc2hhYmxlIiwiY2FsY3VsYXRlQ2xpZW50SGFzaFJlZnJlc2hhYmxlIiwidmVyc2lvbk5vblJlZnJlc2hhYmxlIiwiY2FsY3VsYXRlQ2xpZW50SGFzaE5vblJlZnJlc2hhYmxlIiwidmVyc2lvblJlcGxhY2VhYmxlIiwiY2FsY3VsYXRlQ2xpZW50SGFzaFJlcGxhY2VhYmxlIiwidmVyc2lvbkhtciIsImhtclZlcnNpb24iLCJnZW5lcmF0ZUJvaWxlcnBsYXRlIiwib25MaXN0ZW5pbmciLCJwYXlsb2FkIiwiYXNzZXRzIiwiZ2V0UmVmcmVzaGFibGVBc3NldHMiLCJzZXQiLCJwdWJsaXNoIiwiY2hlY2siLCJNYXRjaCIsIk9uZU9mIiwiU3RyaW5nIiwidW5kZWZpbmVkIiwicmFuZG9tSW50ZXJ2YWwiLCJpc1Byb2R1Y3Rpb24iLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJzdG9wIiwid2F0Y2giLCJpc05ldyIsInNldFRpbWVvdXQiLCJhZGRlZCIsImNoYW5nZWQiLCJjYWxsIiwiX2lkIiwib25TdG9wIiwicmVhZHkiLCJpc19hdXRvIiwic3RhcnR1cCIsImVucXVldWVWZXJzaW9uc1JlZnJlc2giLCJxdWV1ZVRhc2siLCJzZXR1cExpc3RlbmVycyIsIm9uTWVzc2FnZSIsIm9uIiwiYmluZEVudmlyb25tZW50IiwiUHJvbWlzZSIsInJlc29sdmUiLCJfX3JlaWZ5X2FzeW5jX3Jlc3VsdF9fIiwiX3JlaWZ5RXJyb3IiLCJzZWxmIiwiYXN5bmMiLCJtb2R1bGUiLCJUcmFja2VyIiwiY29uc3RydWN0b3IiLCJfdmVyc2lvbnMiLCJNYXAiLCJfd2F0Y2hDYWxsYmFja3MiLCJTZXQiLCJjcmVhdGVTdG9yZSIsInVwZGF0ZSIsIl9yZWYiLCJpZCIsIm1zZyIsImZpZWxkcyIsImhhc1ZlcnNpb25zIiwic2l6ZSIsImdldCIsImFzc2lnbiIsIl9yZWYyIiwiZm4iLCJmaWx0ZXIiLCJza2lwSW5pdGlhbCIsImFyZ3VtZW50cyIsImxlbmd0aCIsInJlc29sdmVkIiwidGhlbiIsImNhbGxiYWNrIiwiYWRkIiwiZGVsZXRlIiwibmV3Q2xpZW50QXZhaWxhYmxlIiwiY3VycmVudFZlcnNpb24iLCJpc05ld1ZlcnNpb24iLCJzb21lIiwiZmllbGQiLCJkZXBlbmRlbmN5IiwiRGVwZW5kZW5jeSIsImRlcGVuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsYUFBYTtJQUFDQyxPQUFPLENBQUNDLElBQUksQ0FB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QUFVLENBQUNFLE1BQU0sQ0FBQyxDQUFDO1FBRW5CLE1BQU0zRCxJQUFJLEdBQUcsSUFBSSxDQUFDQyxLQUFLLENBQ3JCNUIsT0FBTyxJQUFLO1VBQ1osSUFBSWlGLFlBQVksQ0FBQ2pGLE9BQU8sQ0FBQyxFQUFFO1lBQzFCb0YsVUFBVSxDQUFDcEQsT0FBTyxDQUFDLENBQUM7WUFDcEJMLElBQUksQ0FBQyxDQUFDO1VBQ1A7UUFDRCxDQUFDLEVBQ0Q7VUFBRTRDLFdBQVcsRUFBRTtRQUFLLENBQ3JCLENBQUM7UUFFRCxPQUFPLENBQUMsQ0FBQ3ZFLE9BQU8sSUFBSWlGLFlBQVksQ0FBQ2pGLE9BQU8sQ0FBQztNQUMxQztJQUNEO0lBQUMrQyxzQkFBQTtFQUFBLFNBQUFDLFdBQUE7SUFBQSxPQUFBRCxzQkFBQSxDQUFBQyxXQUFBO0VBQUE7RUFBQUQsc0JBQUE7QUFBQTtFQUFBRSxJQUFBO0VBQUFDLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9hdXRvdXBkYXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gUHVibGlzaCB0aGUgY3VycmVudCBjbGllbnQgdmVyc2lvbnMgZm9yIGVhY2ggY2xpZW50IGFyY2hpdGVjdHVyZVxuLy8gKHdlYi5icm93c2VyLCB3ZWIuYnJvd3Nlci5sZWdhY3ksIHdlYi5jb3Jkb3ZhKS4gV2hlbiBhIGNsaWVudCBvYnNlcnZlc1xuLy8gYSBjaGFuZ2UgaW4gdGhlIHZlcnNpb25zIGFzc29jaWF0ZWQgd2l0aCBpdHMgY2xpZW50IGFyY2hpdGVjdHVyZSxcbi8vIGl0IHdpbGwgcmVmcmVzaCBpdHNlbGYsIGVpdGhlciBieSBzd2FwcGluZyBvdXQgQ1NTIGFzc2V0cyBvciBieVxuLy8gcmVsb2FkaW5nIHRoZSBwYWdlLiBDaGFuZ2VzIHRvIHRoZSByZXBsYWNlYWJsZSB2ZXJzaW9uIGFyZSBpZ25vcmVkXG4vLyBhbmQgaGFuZGxlZCBieSB0aGUgaG90LW1vZHVsZS1yZXBsYWNlbWVudCBwYWNrYWdlLlxuLy9cbi8vIFRoZXJlIGFyZSBmb3VyIHZlcnNpb25zIGZvciBhbnkgZ2l2ZW4gY2xpZW50IGFyY2hpdGVjdHVyZTogYHZlcnNpb25gLFxuLy8gYHZlcnNpb25SZWZyZXNoYWJsZWAsIGB2ZXJzaW9uTm9uUmVmcmVzaGFibGVgLCBhbmRcbi8vIGB2ZXJzaW9uUmVwbGFjZWFibGVgLiBUaGUgcmVmcmVzaGFibGUgdmVyc2lvbiBpcyBhIGhhc2ggb2YganVzdCB0aGVcbi8vIGNsaWVudCByZXNvdXJjZXMgdGhhdCBhcmUgcmVmcmVzaGFibGUsIHN1Y2ggYXMgQ1NTLiBUaGUgcmVwbGFjZWFibGVcbi8vIHZlcnNpb24gaXMgYSBoYXNoIG9mIGZpbGVzIHRoYXQgY2FuIGJlIHVwZGF0ZWQgd2l0aCBITVIuIFRoZVxuLy8gbm9uLXJlZnJlc2hhYmxlIHZlcnNpb24gaXMgYSBoYXNoIG9mIHRoZSByZXN0IG9mIHRoZSBjbGllbnQgYXNzZXRzLFxuLy8gZXhjbHVkaW5nIHRoZSByZWZyZXNoYWJsZSBvbmVzOiBIVE1MLCBKUyB0aGF0IGlzIG5vdCByZXBsYWNlYWJsZSwgYW5kXG4vLyBzdGF0aWMgZmlsZXMgaW4gdGhlIGBwdWJsaWNgIGRpcmVjdG9yeS4gVGhlIGB2ZXJzaW9uYCB2ZXJzaW9uIGlzIGFcbi8vIGNvbWJpbmVkIGhhc2ggb2YgZXZlcnl0aGluZy5cbi8vXG4vLyBJZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgYEFVVE9VUERBVEVfVkVSU0lPTmAgaXMgc2V0LCBpdCB3aWxsIGJlXG4vLyB1c2VkIGluIHBsYWNlIG9mIGFsbCBjbGllbnQgdmVyc2lvbnMuIFlvdSBjYW4gdXNlIHRoaXMgdmFyaWFibGUgdG9cbi8vIGNvbnRyb2wgd2hlbiB0aGUgY2xpZW50IHJlbG9hZHMuIEZvciBleGFtcGxlLCBpZiB5b3Ugd2FudCB0byBmb3JjZSBhXG4vLyByZWxvYWQgb25seSBhZnRlciBtYWpvciBjaGFuZ2VzLCB1c2UgYSBjdXN0b20gQVVUT1VQREFURV9WRVJTSU9OIGFuZFxuLy8gY2hhbmdlIGl0IG9ubHkgd2hlbiBzb21ldGhpbmcgd29ydGggcHVzaGluZyB0byBjbGllbnRzIGhhcHBlbnMuXG4vL1xuLy8gVGhlIHNlcnZlciBwdWJsaXNoZXMgYSBgbWV0ZW9yX2F1dG91cGRhdGVfY2xpZW50VmVyc2lvbnNgIGNvbGxlY3Rpb24uXG4vLyBUaGUgSUQgb2YgZWFjaCBkb2N1bWVudCBpcyB0aGUgY2xpZW50IGFyY2hpdGVjdHVyZSwgYW5kIHRoZSBmaWVsZHMgb2Zcbi8vIHRoZSBkb2N1bWVudCBhcmUgdGhlIHZlcnNpb25zIGRlc2NyaWJlZCBhYm92ZS5cblxuaW1wb3J0IHsgQ2xpZW50VmVyc2lvbnMgfSBmcm9tICcuL2NsaWVudF92ZXJzaW9ucy5qcyc7XG5cbmV4cG9ydCBjb25zdCBBdXRvdXBkYXRlID0gKF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYXV0b3VwZGF0ZSA9IHtcblx0Ly8gTWFwIGZyb20gY2xpZW50IGFyY2hpdGVjdHVyZXMgKHdlYi5icm93c2VyLCB3ZWIuYnJvd3Nlci5sZWdhY3ksXG5cdC8vIHdlYi5jb3Jkb3ZhKSB0byB2ZXJzaW9uIGZpZWxkcyB7IHZlcnNpb24sIHZlcnNpb25SZWZyZXNoYWJsZSxcblx0Ly8gdmVyc2lvbk5vblJlZnJlc2hhYmxlLCByZWZyZXNoYWJsZSB9IHRoYXQgd2lsbCBiZSBzdG9yZWQgaW5cblx0Ly8gQ2xpZW50VmVyc2lvbnMgZG9jdW1lbnRzICh3aG9zZSBJRHMgYXJlIGNsaWVudCBhcmNoaXRlY3R1cmVzKS4gVGhpc1xuXHQvLyBkYXRhIGdldHMgc2VyaWFsaXplZCBpbnRvIHRoZSBib2lsZXJwbGF0ZSBiZWNhdXNlIGl0J3Mgc3RvcmVkIGluXG5cdC8vIF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYXV0b3VwZGF0ZS52ZXJzaW9ucy5cblx0dmVyc2lvbnM6IHt9LFxufSk7XG5cbi8vIFN0b3JlcyBhY2NlcHRhYmxlIGNsaWVudCB2ZXJzaW9ucy5cbmNvbnN0IGNsaWVudFZlcnNpb25zID0gbmV3IENsaWVudFZlcnNpb25zKCk7XG5cbi8vIFRoZSBjbGllbnQgaGFzaCBpbmNsdWRlcyBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLCBzbyB3YWl0IHVudGlsXG4vLyBhbGwgcGFja2FnZXMgaGF2ZSBsb2FkZWQgYW5kIGhhdmUgaGFkIGEgY2hhbmNlIHRvIHBvcHVsYXRlIHRoZVxuLy8gcnVudGltZSBjb25maWcgYmVmb3JlIHVzaW5nIHRoZSBjbGllbnQgaGFzaCBhcyBvdXIgZGVmYXVsdCBhdXRvXG4vLyB1cGRhdGUgdmVyc2lvbiBpZC5cblxuLy8gTm90ZTogVGVzdHMgYWxsb3cgcGVvcGxlIHRvIG92ZXJyaWRlIEF1dG91cGRhdGUuYXV0b3VwZGF0ZVZlcnNpb24gYmVmb3JlXG4vLyBzdGFydHVwLlxuQXV0b3VwZGF0ZS5hdXRvdXBkYXRlVmVyc2lvbiA9IG51bGw7XG5BdXRvdXBkYXRlLmF1dG91cGRhdGVWZXJzaW9uUmVmcmVzaGFibGUgPSBudWxsO1xuQXV0b3VwZGF0ZS5hdXRvdXBkYXRlVmVyc2lvbkNvcmRvdmEgPSBudWxsO1xuQXV0b3VwZGF0ZS5hcHBJZCA9IF9fbWV0ZW9yX3J1bnRpbWVfY29uZmlnX18uYXBwSWQgPSBwcm9jZXNzLmVudi5BUFBfSUQ7XG5cbnZhciBzeW5jUXVldWUgPSBuZXcgTWV0ZW9yLl9Bc3luY2hyb25vdXNRdWV1ZSgpO1xuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVWZXJzaW9ucyhzaG91bGRSZWxvYWRDbGllbnRQcm9ncmFtKSB7XG5cdC8vIFN0ZXAgMTogbG9hZCB0aGUgY3VycmVudCBjbGllbnQgcHJvZ3JhbSBvbiB0aGUgc2VydmVyXG5cdGlmIChzaG91bGRSZWxvYWRDbGllbnRQcm9ncmFtKSB7XG5cdFx0YXdhaXQgV2ViQXBwSW50ZXJuYWxzLnJlbG9hZENsaWVudFByb2dyYW1zKCk7XG5cdH1cblxuXHRjb25zdCB7XG5cdFx0Ly8gSWYgdGhlIEFVVE9VUERBVEVfVkVSU0lPTiBlbnZpcm9ubWVudCB2YXJpYWJsZSBpcyBkZWZpbmVkLCBpdCB0YWtlc1xuXHRcdC8vIHByZWNlZGVuY2UsIGJ1dCBBdXRvdXBkYXRlLmF1dG91cGRhdGVWZXJzaW9uIGlzIHN0aWxsIHN1cHBvcnRlZCBhc1xuXHRcdC8vIGEgZmFsbGJhY2suIEluIG1vc3QgY2FzZXMgbmVpdGhlciBvZiB0aGVzZSB2YWx1ZXMgd2lsbCBiZSBkZWZpbmVkLlxuXHRcdEFVVE9VUERBVEVfVkVSU0lPTiA9IEF1dG91cGRhdGUuYXV0b3VwZGF0ZVZlcnNpb24sXG5cdH0gPSBwcm9jZXNzLmVudjtcblxuXHQvLyBTdGVwIDI6IHVwZGF0ZSBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLmF1dG91cGRhdGUudmVyc2lvbnMuXG5cdGNvbnN0IGNsaWVudEFyY2hzID0gT2JqZWN0LmtleXMoV2ViQXBwLmNsaWVudFByb2dyYW1zKTtcblx0Y2xpZW50QXJjaHMuZm9yRWFjaCgoYXJjaCkgPT4ge1xuXHRcdEF1dG91cGRhdGUudmVyc2lvbnNbYXJjaF0gPSB7XG5cdFx0XHR2ZXJzaW9uOiBBVVRPVVBEQVRFX1ZFUlNJT04gfHwgV2ViQXBwLmNhbGN1bGF0ZUNsaWVudEhhc2goYXJjaCksXG5cdFx0XHR2ZXJzaW9uUmVmcmVzaGFibGU6IEFVVE9VUERBVEVfVkVSU0lPTiB8fCBXZWJBcHAuY2FsY3VsYXRlQ2xpZW50SGFzaFJlZnJlc2hhYmxlKGFyY2gpLFxuXHRcdFx0dmVyc2lvbk5vblJlZnJlc2hhYmxlOiBBVVRPVVBEQVRFX1ZFUlNJT04gfHwgV2ViQXBwLmNhbGN1bGF0ZUNsaWVudEhhc2hOb25SZWZyZXNoYWJsZShhcmNoKSxcblx0XHRcdHZlcnNpb25SZXBsYWNlYWJsZTogQVVUT1VQREFURV9WRVJTSU9OIHx8IFdlYkFwcC5jYWxjdWxhdGVDbGllbnRIYXNoUmVwbGFjZWFibGUoYXJjaCksXG5cdFx0XHR2ZXJzaW9uSG1yOiBXZWJBcHAuY2xpZW50UHJvZ3JhbXNbYXJjaF0uaG1yVmVyc2lvbixcblx0XHR9O1xuXHR9KTtcblxuXHQvLyBTdGVwIDM6IGZvcm0gdGhlIG5ldyBjbGllbnQgYm9pbGVycGxhdGUgd2hpY2ggY29udGFpbnMgdGhlIHVwZGF0ZWRcblx0Ly8gYXNzZXRzIGFuZCBfX21ldGVvcl9ydW50aW1lX2NvbmZpZ19fLlxuXHRpZiAoc2hvdWxkUmVsb2FkQ2xpZW50UHJvZ3JhbSkge1xuXHRcdGF3YWl0IFdlYkFwcEludGVybmFscy5nZW5lcmF0ZUJvaWxlcnBsYXRlKCk7XG5cdH1cblxuXHQvLyBTdGVwIDQ6IHVwZGF0ZSB0aGUgQ2xpZW50VmVyc2lvbnMgY29sbGVjdGlvbi5cblx0Ly8gV2UgdXNlIGBvbkxpc3RlbmluZ2AgaGVyZSBiZWNhdXNlIHdlIG5lZWQgdG8gdXNlXG5cdC8vIGBXZWJBcHAuZ2V0UmVmcmVzaGFibGVBc3NldHNgLCB3aGljaCBpcyBvbmx5IHNldCBhZnRlclxuXHQvLyBgV2ViQXBwLmdlbmVyYXRlQm9pbGVycGxhdGVgIGlzIGNhbGxlZCBieSBgbWFpbmAgaW4gd2ViYXBwLlxuXHRXZWJBcHAub25MaXN0ZW5pbmcoKCkgPT4ge1xuXHRcdGNsaWVudEFyY2hzLmZvckVhY2goKGFyY2gpID0+IHtcblx0XHRcdGNvbnN0IHBheWxvYWQgPSB7XG5cdFx0XHRcdC4uLkF1dG91cGRhdGUudmVyc2lvbnNbYXJjaF0sXG5cdFx0XHRcdGFzc2V0czogV2ViQXBwLmdldFJlZnJlc2hhYmxlQXNzZXRzKGFyY2gpLFxuXHRcdFx0fTtcblxuXHRcdFx0Y2xpZW50VmVyc2lvbnMuc2V0KGFyY2gsIHBheWxvYWQpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuTWV0ZW9yLnB1Ymxpc2goXG5cdCdtZXRlb3JfYXV0b3VwZGF0ZV9jbGllbnRWZXJzaW9ucycsXG5cdGZ1bmN0aW9uIChhcHBJZCkge1xuXHRcdC8vIGBudWxsYCBoYXBwZW5zIHdoZW4gYSBjbGllbnQgZG9lc24ndCBoYXZlIGFuIGFwcElkIGFuZCBwYXNzZXNcblx0XHQvLyBgdW5kZWZpbmVkYCB0byBgTWV0ZW9yLnN1YnNjcmliZWAuIGB1bmRlZmluZWRgIGlzIHRyYW5zbGF0ZWQgdG9cblx0XHQvLyBgbnVsbGAgYXMgSlNPTiBkb2Vzbid0IGhhdmUgYHVuZGVmaW5lZC5cblx0XHRjaGVjayhhcHBJZCwgTWF0Y2guT25lT2YoU3RyaW5nLCB1bmRlZmluZWQsIG51bGwpKTtcblxuXHRcdC8vIERvbid0IG5vdGlmeSBjbGllbnRzIHVzaW5nIHdyb25nIGFwcElkIHN1Y2ggYXMgbW9iaWxlIGFwcHMgYnVpbHQgd2l0aCBhXG5cdFx0Ly8gZGlmZmVyZW50IHNlcnZlciBidXQgcG9pbnRpbmcgYXQgdGhlIHNhbWUgbG9jYWwgdXJsXG5cdFx0aWYgKEF1dG91cGRhdGUuYXBwSWQgJiYgYXBwSWQgJiYgQXV0b3VwZGF0ZS5hcHBJZCAhPT0gYXBwSWQpIHJldHVybiBbXTtcblxuXHRcdC8vIFJhbmRvbSB2YWx1ZSB0byBkZWxheSB0aGUgdXBkYXRlcyBmb3IgMi0xMCBtaW51dGVzXG5cdFx0Y29uc3QgcmFuZG9tSW50ZXJ2YWwgPSBNZXRlb3IuaXNQcm9kdWN0aW9uID8gKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDgpICsgMikgKiAxMDAwICogNjAgOiAwO1xuXG5cdFx0Y29uc3Qgc3RvcCA9IGNsaWVudFZlcnNpb25zLndhdGNoKCh2ZXJzaW9uLCBpc05ldykgPT4ge1xuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdChpc05ldyA/IHRoaXMuYWRkZWQgOiB0aGlzLmNoYW5nZWQpLmNhbGwodGhpcywgJ21ldGVvcl9hdXRvdXBkYXRlX2NsaWVudFZlcnNpb25zJywgdmVyc2lvbi5faWQsIHZlcnNpb24pO1xuXHRcdFx0fSwgcmFuZG9tSW50ZXJ2YWwpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5vblN0b3AoKCkgPT4gc3RvcCgpKTtcblx0XHR0aGlzLnJlYWR5KCk7XG5cdH0sXG5cdHsgaXNfYXV0bzogdHJ1ZSB9LFxuKTtcblxuTWV0ZW9yLnN0YXJ0dXAoYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRhd2FpdCB1cGRhdGVWZXJzaW9ucyhmYWxzZSk7XG5cblx0Ly8gRm9yY2UgYW55IGNvbm5lY3RlZCBjbGllbnRzIHRoYXQgYXJlIHN0aWxsIGxvb2tpbmcgZm9yIHRoZXNlIG9sZGVyXG5cdC8vIGRvY3VtZW50IElEcyB0byByZWxvYWQuXG5cdFsndmVyc2lvbicsICd2ZXJzaW9uLXJlZnJlc2hhYmxlJywgJ3ZlcnNpb24tY29yZG92YSddLmZvckVhY2goKF9pZCkgPT4ge1xuXHRcdGNsaWVudFZlcnNpb25zLnNldChfaWQsIHtcblx0XHRcdHZlcnNpb246ICdvdXRkYXRlZCcsXG5cdFx0fSk7XG5cdH0pO1xufSk7XG5cbmZ1bmN0aW9uIGVucXVldWVWZXJzaW9uc1JlZnJlc2goKSB7XG5cdHN5bmNRdWV1ZS5xdWV1ZVRhc2soYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdGF3YWl0IHVwZGF0ZVZlcnNpb25zKHRydWUpO1xuXHR9KTtcbn1cblxuY29uc3Qgc2V0dXBMaXN0ZW5lcnMgPSAoKSA9PiB7XG5cdC8vIExpc3RlbiBmb3IgbWVzc2FnZXMgcGVydGFpbmluZyB0byB0aGUgY2xpZW50LXJlZnJlc2ggdG9waWMuXG5cdGltcG9ydCB7IG9uTWVzc2FnZSB9IGZyb20gJ21ldGVvci9pbnRlci1wcm9jZXNzLW1lc3NhZ2luZyc7XG5cdG9uTWVzc2FnZSgnY2xpZW50LXJlZnJlc2gnLCBlbnF1ZXVlVmVyc2lvbnNSZWZyZXNoKTtcblxuXHQvLyBBbm90aGVyIHdheSB0byB0ZWxsIHRoZSBwcm9jZXNzIHRvIHJlZnJlc2g6IHNlbmQgU0lHSFVQIHNpZ25hbFxuXHRwcm9jZXNzLm9uKFxuXHRcdCdTSUdIVVAnLFxuXHRcdE1ldGVvci5iaW5kRW52aXJvbm1lbnQoZnVuY3Rpb24gKCkge1xuXHRcdFx0ZW5xdWV1ZVZlcnNpb25zUmVmcmVzaCgpO1xuXHRcdH0sICdoYW5kbGluZyBTSUdIVVAgc2lnbmFsIGZvciByZWZyZXNoJyksXG5cdCk7XG59O1xuXG5XZWJBcHAub25MaXN0ZW5pbmcoZnVuY3Rpb24gKCkge1xuXHRQcm9taXNlLnJlc29sdmUoc2V0dXBMaXN0ZW5lcnMoKSk7XG59KTtcbiIsImltcG9ydCB7IFRyYWNrZXIgfSBmcm9tICdtZXRlb3IvdHJhY2tlcic7XG5cbmV4cG9ydCBjbGFzcyBDbGllbnRWZXJzaW9ucyB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuX3ZlcnNpb25zID0gbmV3IE1hcCgpO1xuXHRcdHRoaXMuX3dhdGNoQ2FsbGJhY2tzID0gbmV3IFNldCgpO1xuXHR9XG5cblx0Ly8gQ3JlYXRlcyBhIExpdmVkYXRhIHN0b3JlIGZvciB1c2Ugd2l0aCBgTWV0ZW9yLmNvbm5lY3Rpb24ucmVnaXN0ZXJTdG9yZWAuXG5cdC8vIEFmdGVyIHRoZSBzdG9yZSBpcyByZWdpc3RlcmVkLCBkb2N1bWVudCB1cGRhdGVzIHJlcG9ydGVkIGJ5IExpdmVkYXRhIGFyZVxuXHQvLyBtZXJnZWQgd2l0aCB0aGUgZG9jdW1lbnRzIGluIHRoaXMgYENsaWVudFZlcnNpb25zYCBpbnN0YW5jZS5cblx0Y3JlYXRlU3RvcmUoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHVwZGF0ZTogKHsgaWQsIG1zZywgZmllbGRzIH0pID0+IHtcblx0XHRcdFx0aWYgKG1zZyA9PT0gJ2FkZGVkJyB8fCBtc2cgPT09ICdjaGFuZ2VkJykge1xuXHRcdFx0XHRcdHRoaXMuc2V0KGlkLCBmaWVsZHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdH07XG5cdH1cblxuXHRoYXNWZXJzaW9ucygpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmVyc2lvbnMuc2l6ZSA+IDA7XG5cdH1cblxuXHRnZXQoaWQpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmVyc2lvbnMuZ2V0KGlkKTtcblx0fVxuXG5cdC8vIEFkZHMgb3IgdXBkYXRlcyBhIHZlcnNpb24gZG9jdW1lbnQgYW5kIGludm9rZXMgcmVnaXN0ZXJlZCBjYWxsYmFja3MgZm9yIHRoZVxuXHQvLyBhZGRlZC91cGRhdGVkIGRvY3VtZW50LiBJZiBhIGRvY3VtZW50IHdpdGggdGhlIGdpdmVuIElEIGFscmVhZHkgZXhpc3RzLCBpdHNcblx0Ly8gZmllbGRzIGFyZSBtZXJnZWQgd2l0aCBgZmllbGRzYC5cblx0c2V0KGlkLCBmaWVsZHMpIHtcblx0XHRsZXQgdmVyc2lvbiA9IHRoaXMuX3ZlcnNpb25zLmdldChpZCk7XG5cdFx0bGV0IGlzTmV3ID0gZmFsc2U7XG5cblx0XHRpZiAodmVyc2lvbikge1xuXHRcdFx0T2JqZWN0LmFzc2lnbih2ZXJzaW9uLCBmaWVsZHMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2ZXJzaW9uID0ge1xuXHRcdFx0XHRfaWQ6IGlkLFxuXHRcdFx0XHQuLi5maWVsZHMsXG5cdFx0XHR9O1xuXG5cdFx0XHRpc05ldyA9IHRydWU7XG5cdFx0XHR0aGlzLl92ZXJzaW9ucy5zZXQoaWQsIHZlcnNpb24pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3dhdGNoQ2FsbGJhY2tzLmZvckVhY2goKHsgZm4sIGZpbHRlciB9KSA9PiB7XG5cdFx0XHRpZiAoIWZpbHRlciB8fCBmaWx0ZXIgPT09IHZlcnNpb24uX2lkKSB7XG5cdFx0XHRcdGZuKHZlcnNpb24sIGlzTmV3KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIFJlZ2lzdGVycyBhIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBpbnZva2VkIHdoZW4gYSB2ZXJzaW9uIGRvY3VtZW50IGlzIGFkZGVkXG5cdC8vIG9yIGNoYW5nZWQuIENhbGxpbmcgdGhlIGZ1bmN0aW9uIHJldHVybmVkIGJ5IGB3YXRjaGAgcmVtb3ZlcyB0aGUgY2FsbGJhY2suXG5cdC8vIElmIGBza2lwSW5pdGlhbGAgaXMgdHJ1ZSwgdGhlIGNhbGxiYWNrIGlzbid0IGJlIGludm9rZWQgZm9yIGV4aXN0aW5nXG5cdC8vIGRvY3VtZW50cy4gSWYgYGZpbHRlcmAgaXMgc2V0LCB0aGUgY2FsbGJhY2sgaXMgb25seSBpbnZva2VkIGZvciBkb2N1bWVudHNcblx0Ly8gd2l0aCBJRCBgZmlsdGVyYC5cblx0d2F0Y2goZm4sIHsgc2tpcEluaXRpYWwsIGZpbHRlciB9ID0ge30pIHtcblx0XHRpZiAoIXNraXBJbml0aWFsKSB7XG5cdFx0XHRjb25zdCByZXNvbHZlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXG5cdFx0XHR0aGlzLl92ZXJzaW9ucy5mb3JFYWNoKCh2ZXJzaW9uKSA9PiB7XG5cdFx0XHRcdGlmICghZmlsdGVyIHx8IGZpbHRlciA9PT0gdmVyc2lvbi5faWQpIHtcblx0XHRcdFx0XHRyZXNvbHZlZC50aGVuKCgpID0+IGZuKHZlcnNpb24sIHRydWUpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY2FsbGJhY2sgPSB7IGZuLCBmaWx0ZXIgfTtcblx0XHR0aGlzLl93YXRjaENhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuXG5cdFx0cmV0dXJuICgpID0+IHRoaXMuX3dhdGNoQ2FsbGJhY2tzLmRlbGV0ZShjYWxsYmFjayk7XG5cdH1cblxuXHQvLyBBIHJlYWN0aXZlIGRhdGEgc291cmNlIGZvciBgQXV0b3VwZGF0ZS5uZXdDbGllbnRBdmFpbGFibGVgLlxuXHRuZXdDbGllbnRBdmFpbGFibGUoaWQsIGZpZWxkcywgY3VycmVudFZlcnNpb24pIHtcblx0XHRmdW5jdGlvbiBpc05ld1ZlcnNpb24odmVyc2lvbikge1xuXHRcdFx0cmV0dXJuIHZlcnNpb24uX2lkID09PSBpZCAmJiBmaWVsZHMuc29tZSgoZmllbGQpID0+IHZlcnNpb25bZmllbGRdICE9PSBjdXJyZW50VmVyc2lvbltmaWVsZF0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRlcGVuZGVuY3kgPSBuZXcgVHJhY2tlci5EZXBlbmRlbmN5KCk7XG5cdFx0Y29uc3QgdmVyc2lvbiA9IHRoaXMuZ2V0KGlkKTtcblxuXHRcdGRlcGVuZGVuY3kuZGVwZW5kKCk7XG5cblx0XHRjb25zdCBzdG9wID0gdGhpcy53YXRjaChcblx0XHRcdCh2ZXJzaW9uKSA9PiB7XG5cdFx0XHRcdGlmIChpc05ld1ZlcnNpb24odmVyc2lvbikpIHtcblx0XHRcdFx0XHRkZXBlbmRlbmN5LmNoYW5nZWQoKTtcblx0XHRcdFx0XHRzdG9wKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHR7IHNraXBJbml0aWFsOiB0cnVlIH0sXG5cdFx0KTtcblxuXHRcdHJldHVybiAhIXZlcnNpb24gJiYgaXNOZXdWZXJzaW9uKHZlcnNpb24pO1xuXHR9XG59XG4iXX0=
