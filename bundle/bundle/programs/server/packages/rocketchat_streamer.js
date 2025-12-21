Package["core-runtime"].queue("rocketchat:streamer",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var DDPCommon = Package['ddp-common'].DDPCommon;
var ECMAScript = Package.ecmascript.ECMAScript;
var check = Package.check.check;
var Match = Package.check.Match;
var Tracker = Package.tracker.Tracker;
var Deps = Package.tracker.Deps;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var EV, Streamer;

var require = meteorInstall({"node_modules":{"meteor":{"rocketchat:streamer":{"lib":{"ev.js":function module(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/rocketchat_streamer/lib/ev.js                                                                             //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
/* globals EV:true */
/* exported EV */

EV = class EV {
  constructor() {
    this.handlers = {};
  }
  emit(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return this.handlers[event] && this.handlers[event].forEach(handler => handler.apply(this, args));
  }
  emitWithScope(event, scope) {
    for (var _len2 = arguments.length, args = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }
    return this.handlers[event] && this.handlers[event].forEach(handler => handler.apply(scope, args));
  }
  listenerCount(event) {
    return this.handlers[event] && this.handlers[event].length || 0;
  }
  on(event, callback) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(callback);
  }
  once(event, callback) {
    const self = this;
    this.on(event, function onetimeCallback() {
      self.removeListener(event, onetimeCallback);
      callback.apply(this, arguments);
    });
  }
  removeListener(event, callback) {
    if (!this.handlers[event]) {
      return;
    }
    const index = this.handlers[event].indexOf(callback);
    if (index > -1) {
      this.handlers[event].splice(index, 1);
    }
  }
  removeAllListeners(event) {
    this.handlers[event] = undefined;
  }
};
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"server.js":function module(require,exports,module){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                    //
// packages/rocketchat_streamer/server/server.js                                                                      //
//                                                                                                                    //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                      //
!module.wrapAsync(async function (module, __reifyWaitForDeps__, __reify_async_result__) {
  "use strict";
  try {
    let DDPCommon;
    module.link("meteor/ddp-common", {
      DDPCommon(v) {
        DDPCommon = v;
      }
    }, 0);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    class StreamerCentral extends EV {
      constructor() {
        super();
        this.instances = {};
      }
    }
    Meteor.StreamerCentral = new StreamerCentral();
    const changedPayload = function (collection, id, fields) {
      if (_.isEmpty(fields)) {
        return;
      }
      return DDPCommon.stringifyDDP({
        msg: 'changed',
        collection,
        id,
        fields
      });
    };
    const send = function (self, msg) {
      if (!self.socket) {
        return;
      }
      self.socket.send(msg);
    };
    Meteor.Streamer = class Streamer extends EV {
      constructor(name) {
        let {
          retransmit = true,
          retransmitToSelf = false
        } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        if (Meteor.StreamerCentral.instances[name]) {
          console.warn('Streamer instance already exists:', name);
          return Meteor.StreamerCentral.instances[name];
        }
        super();
        Meteor.StreamerCentral.instances[name] = this;
        this.name = name;
        this.retransmit = retransmit;
        this.retransmitToSelf = retransmitToSelf;
        this.subscriptions = [];
        this.subscriptionsByEventName = {};
        this.transformers = {};
        this.iniPublication();
        this.initMethod();
        this._allowRead = {};
        this._allowEmit = {};
        this._allowWrite = {};
        this.allowRead('none');
        this.allowEmit('all');
        this.allowWrite('none');
      }
      get name() {
        return this._name;
      }
      set name(name) {
        check(name, String);
        this._name = name;
      }
      get subscriptionName() {
        return "stream-".concat(this.name);
      }
      get retransmit() {
        return this._retransmit;
      }
      set retransmit(retransmit) {
        check(retransmit, Boolean);
        this._retransmit = retransmit;
      }
      get retransmitToSelf() {
        return this._retransmitToSelf;
      }
      set retransmitToSelf(retransmitToSelf) {
        check(retransmitToSelf, Boolean);
        this._retransmitToSelf = retransmitToSelf;
      }
      allowRead(eventName, fn) {
        if (fn === undefined) {
          fn = eventName;
          eventName = '__all__';
        }
        if (typeof fn === 'function') {
          return this._allowRead[eventName] = fn;
        }
        if (typeof fn === 'string' && ['all', 'none', 'logged'].indexOf(fn) === -1) {
          console.error("allowRead shortcut '".concat(fn, "' is invalid"));
        }
        if (fn === 'all' || fn === true) {
          return this._allowRead[eventName] = function () {
            return true;
          };
        }
        if (fn === 'none' || fn === false) {
          return this._allowRead[eventName] = function () {
            return false;
          };
        }
        if (fn === 'logged') {
          return this._allowRead[eventName] = function () {
            return Boolean(this.userId);
          };
        }
      }
      allowEmit(eventName, fn) {
        if (fn === undefined) {
          fn = eventName;
          eventName = '__all__';
        }
        if (typeof fn === 'function') {
          return this._allowEmit[eventName] = fn;
        }
        if (typeof fn === 'string' && ['all', 'none', 'logged'].indexOf(fn) === -1) {
          console.error("allowRead shortcut '".concat(fn, "' is invalid"));
        }
        if (fn === 'all' || fn === true) {
          return this._allowEmit[eventName] = function () {
            return true;
          };
        }
        if (fn === 'none' || fn === false) {
          return this._allowEmit[eventName] = function () {
            return false;
          };
        }
        if (fn === 'logged') {
          return this._allowEmit[eventName] = function () {
            return Boolean(this.userId);
          };
        }
      }
      allowWrite(eventName, fn) {
        if (fn === undefined) {
          fn = eventName;
          eventName = '__all__';
        }
        if (typeof fn === 'function') {
          return this._allowWrite[eventName] = fn;
        }
        if (typeof fn === 'string' && ['all', 'none', 'logged'].indexOf(fn) === -1) {
          console.error("allowWrite shortcut '".concat(fn, "' is invalid"));
        }
        if (fn === 'all' || fn === true) {
          return this._allowWrite[eventName] = function () {
            return true;
          };
        }
        if (fn === 'none' || fn === false) {
          return this._allowWrite[eventName] = function () {
            return false;
          };
        }
        if (fn === 'logged') {
          return this._allowWrite[eventName] = function () {
            return Boolean(this.userId);
          };
        }
      }
      isReadAllowed(scope, eventName, args) {
        if (this._allowRead[eventName]) {
          return this._allowRead[eventName].call(scope, eventName, ...args);
        }
        return this._allowRead['__all__'].call(scope, eventName, ...args);
      }
      isEmitAllowed(scope, eventName) {
        for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
          args[_key - 2] = arguments[_key];
        }
        if (this._allowEmit[eventName]) {
          return this._allowEmit[eventName].call(scope, eventName, ...args);
        }
        return this._allowEmit['__all__'].call(scope, eventName, ...args);
      }
      isWriteAllowed(scope, eventName, args) {
        if (this._allowWrite[eventName]) {
          return this._allowWrite[eventName].call(scope, eventName, ...args);
        }
        return this._allowWrite['__all__'].call(scope, eventName, ...args);
      }
      addSubscription(subscription, eventName) {
        this.subscriptions.push(subscription);
        if (!this.subscriptionsByEventName[eventName]) {
          this.subscriptionsByEventName[eventName] = [];
        }
        this.subscriptionsByEventName[eventName].push(subscription);
      }
      removeSubscription(subscription, eventName) {
        const index = this.subscriptions.indexOf(subscription);
        if (index > -1) {
          this.subscriptions.splice(index, 1);
        }
        if (this.subscriptionsByEventName[eventName]) {
          const index = this.subscriptionsByEventName[eventName].indexOf(subscription);
          if (index > -1) {
            this.subscriptionsByEventName[eventName].splice(index, 1);
          }
        }
      }
      transform(eventName, fn) {
        if (typeof eventName === 'function') {
          fn = eventName;
          eventName = '__all__';
        }
        if (!this.transformers[eventName]) {
          this.transformers[eventName] = [];
        }
        this.transformers[eventName].push(fn);
      }
      applyTransformers(methodScope, eventName, args) {
        if (this.transformers['__all__']) {
          this.transformers['__all__'].forEach(transform => {
            args = transform.call(methodScope, eventName, args);
            methodScope.tranformed = true;
            if (!Array.isArray(args)) {
              args = [args];
            }
          });
        }
        if (this.transformers[eventName]) {
          this.transformers[eventName].forEach(transform => {
            args = transform.call(methodScope, ...args);
            methodScope.tranformed = true;
            if (!Array.isArray(args)) {
              args = [args];
            }
          });
        }
        return args;
      }
      _publish(publication, eventName, options) {
        check(eventName, String);
        check(options, Match.OneOf(Boolean, {
          useCollection: Boolean,
          args: Array
        }));
        let useCollection,
          args = [];
        if (typeof options === 'boolean') {
          useCollection = options;
        } else {
          if (options.useCollection) {
            useCollection = options.useCollection;
          }
          if (options.args) {
            args = options.args;
          }
        }
        if (eventName.length === 0) {
          publication.stop();
          throw new Meteor.Error('invalid-event-name');
        }
        if (this.isReadAllowed(publication, eventName, args) !== true) {
          publication.stop();
          throw new Meteor.Error('not-allowed');
        }
        const subscription = {
          subscription: publication,
          eventName: eventName
        };
        this.addSubscription(subscription, eventName);
        publication.onStop(() => {
          this.removeSubscription(subscription, eventName);
        });
        if (useCollection === true) {
          // Collection compatibility
          publication._session.sendAdded(this.subscriptionName, 'id', {
            eventName: eventName
          });
        }
        publication.ready();
      }
      iniPublication() {
        const stream = this;
        Meteor.publish(this.subscriptionName, function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          return stream._publish.apply(stream, [this, ...args]);
        });
      }
      initMethod() {
        const stream = this;
        const method = {};
        method[this.subscriptionName] = function (eventName) {
          for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            args[_key3 - 1] = arguments[_key3];
          }
          check(eventName, String);
          check(args, Array);
          this.unblock();
          if (stream.isWriteAllowed(this, eventName, args) !== true) {
            return;
          }
          const methodScope = {
            userId: this.userId,
            connection: this.connection,
            originalParams: args,
            tranformed: false
          };
          args = stream.applyTransformers(methodScope, eventName, args);
          stream.emitWithScope(eventName, methodScope, ...args);
          if (stream.retransmit === true) {
            stream._emit(eventName, args, this.connection, true);
          }
        };
        try {
          Meteor.methods(method);
        } catch (e) {
          console.error(e);
        }
      }
      _emit(eventName, args, origin, broadcast) {
        if (broadcast === true) {
          Meteor.StreamerCentral.emit('broadcast', this.name, eventName, args);
        }
        const subscriptions = this.subscriptionsByEventName[eventName];
        if (!Array.isArray(subscriptions)) {
          return;
        }
        const msg = changedPayload(this.subscriptionName, 'id', {
          eventName,
          args
        });
        if (!msg) {
          return;
        }
        subscriptions.forEach(subscription => {
          if (this.retransmitToSelf === false && origin && origin === subscription.subscription.connection) {
            return;
          }
          if (this.isEmitAllowed(subscription.subscription, eventName, ...args)) {
            send(subscription.subscription._session, msg);
          }
        });
      }
      emit(eventName) {
        for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
          args[_key4 - 1] = arguments[_key4];
        }
        this._emit(eventName, args, undefined, true);
      }
      __emit() {
        return super.emit(...arguments);
      }
      emitWithoutBroadcast(eventName) {
        for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
          args[_key5 - 1] = arguments[_key5];
        }
        this._emit(eventName, args, undefined, false);
      }
    };
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: false
});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  export: function () { return {
      Streamer: Streamer
    };},
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/rocketchat:streamer/lib/ev.js",
    "/node_modules/meteor/rocketchat:streamer/server/server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/rocketchat_streamer.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcm9ja2V0Y2hhdDpzdHJlYW1lci9saWIvZXYuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL3JvY2tldGNoYXQ6c3RyZWFtZXIvc2VydmVyL3NlcnZlci5qcyJdLCJuYW1lcyI6WyJFViIsImNvbnN0cnVjdG9yIiwiaGFuZGxlcnMiLCJlbWl0IiwiZXZlbnQiLCJfbGVuIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiYXJncyIsIkFycmF5IiwiX2tleSIsImZvckVhY2giLCJoYW5kbGVyIiwiYXBwbHkiLCJlbWl0V2l0aFNjb3BlIiwic2NvcGUiLCJfbGVuMiIsIl9rZXkyIiwibGlzdGVuZXJDb3VudCIsIm9uIiwiY2FsbGJhY2siLCJwdXNoIiwib25jZSIsInNlbGYiLCJvbmV0aW1lQ2FsbGJhY2siLCJyZW1vdmVMaXN0ZW5lciIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInJlbW92ZUFsbExpc3RlbmVycyIsInVuZGVmaW5lZCIsIkREUENvbW1vbiIsIm1vZHVsZSIsImxpbmsiLCJ2IiwiX19yZWlmeVdhaXRGb3JEZXBzX18iLCJTdHJlYW1lckNlbnRyYWwiLCJpbnN0YW5jZXMiLCJNZXRlb3IiLCJjaGFuZ2VkUGF5bG9hZCIsImNvbGxlY3Rpb24iLCJpZCIsImZpZWxkcyIsIl8iLCJpc0VtcHR5Iiwic3RyaW5naWZ5RERQIiwibXNnIiwic2VuZCIsInNvY2tldCIsIlN0cmVhbWVyIiwibmFtZSIsInJldHJhbnNtaXQiLCJyZXRyYW5zbWl0VG9TZWxmIiwiY29uc29sZSIsIndhcm4iLCJzdWJzY3JpcHRpb25zIiwic3Vic2NyaXB0aW9uc0J5RXZlbnROYW1lIiwidHJhbnNmb3JtZXJzIiwiaW5pUHVibGljYXRpb24iLCJpbml0TWV0aG9kIiwiX2FsbG93UmVhZCIsIl9hbGxvd0VtaXQiLCJfYWxsb3dXcml0ZSIsImFsbG93UmVhZCIsImFsbG93RW1pdCIsImFsbG93V3JpdGUiLCJfbmFtZSIsImNoZWNrIiwiU3RyaW5nIiwic3Vic2NyaXB0aW9uTmFtZSIsImNvbmNhdCIsIl9yZXRyYW5zbWl0IiwiQm9vbGVhbiIsIl9yZXRyYW5zbWl0VG9TZWxmIiwiZXZlbnROYW1lIiwiZm4iLCJlcnJvciIsInVzZXJJZCIsImlzUmVhZEFsbG93ZWQiLCJjYWxsIiwiaXNFbWl0QWxsb3dlZCIsImlzV3JpdGVBbGxvd2VkIiwiYWRkU3Vic2NyaXB0aW9uIiwic3Vic2NyaXB0aW9uIiwicmVtb3ZlU3Vic2NyaXB0aW9uIiwidHJhbnNmb3JtIiwiYXBwbHlUcmFuc2Zvcm1lcnMiLCJtZXRob2RTY29wZSIsInRyYW5mb3JtZWQiLCJpc0FycmF5IiwiX3B1Ymxpc2giLCJwdWJsaWNhdGlvbiIsIm9wdGlvbnMiLCJNYXRjaCIsIk9uZU9mIiwidXNlQ29sbGVjdGlvbiIsInN0b3AiLCJFcnJvciIsIm9uU3RvcCIsIl9zZXNzaW9uIiwic2VuZEFkZGVkIiwicmVhZHkiLCJzdHJlYW0iLCJwdWJsaXNoIiwibWV0aG9kIiwiX2xlbjMiLCJfa2V5MyIsInVuYmxvY2siLCJjb25uZWN0aW9uIiwib3JpZ2luYWxQYXJhbXMiLCJfZW1pdCIsIm1ldGhvZHMiLCJlIiwib3JpZ2luIiwiYnJvYWRjYXN0IiwiX2xlbjQiLCJfa2V5NCIsIl9fZW1pdCIsImVtaXRXaXRob3V0QnJvYWRjYXN0IiwiX2xlbjUiLCJfa2V5NSIsIl9fcmVpZnlfYXN5bmNfcmVzdWx0X18iLCJfcmVpZnlFcnJvciIsImFzeW5jIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTs7QUFFQUEsRUFBRSxHQUFHLE1BQU1BLEVBQUUsQ0FBQztFQUNiQyxXQUFXQSxDQUFBLEVBQUc7SUFDYixJQUFJLENBQUNDLFFBQVEsR0FBRyxDQUFDLENBQUM7RUFDbkI7RUFFQUMsSUFBSUEsQ0FBQ0MsS0FBSyxFQUFXO0lBQUEsU0FBQUMsSUFBQSxHQUFBQyxTQUFBLENBQUFDLE1BQUEsRUFBTkMsSUFBSSxPQUFBQyxLQUFBLENBQUFKLElBQUEsT0FBQUEsSUFBQSxXQUFBSyxJQUFBLE1BQUFBLElBQUEsR0FBQUwsSUFBQSxFQUFBSyxJQUFBO01BQUpGLElBQUksQ0FBQUUsSUFBQSxRQUFBSixTQUFBLENBQUFJLElBQUE7SUFBQTtJQUNsQixPQUFPLElBQUksQ0FBQ1IsUUFBUSxDQUFDRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUNGLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLENBQUNPLE9BQU8sQ0FBQ0MsT0FBTyxJQUFJQSxPQUFPLENBQUNDLEtBQUssQ0FBQyxJQUFJLEVBQUVMLElBQUksQ0FBQyxDQUFDO0VBQ2xHO0VBRUFNLGFBQWFBLENBQUNWLEtBQUssRUFBRVcsS0FBSyxFQUFXO0lBQUEsU0FBQUMsS0FBQSxHQUFBVixTQUFBLENBQUFDLE1BQUEsRUFBTkMsSUFBSSxPQUFBQyxLQUFBLENBQUFPLEtBQUEsT0FBQUEsS0FBQSxXQUFBQyxLQUFBLE1BQUFBLEtBQUEsR0FBQUQsS0FBQSxFQUFBQyxLQUFBO01BQUpULElBQUksQ0FBQVMsS0FBQSxRQUFBWCxTQUFBLENBQUFXLEtBQUE7SUFBQTtJQUNsQyxPQUFPLElBQUksQ0FBQ2YsUUFBUSxDQUFDRSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUNGLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLENBQUNPLE9BQU8sQ0FBQ0MsT0FBTyxJQUFJQSxPQUFPLENBQUNDLEtBQUssQ0FBQ0UsS0FBSyxFQUFFUCxJQUFJLENBQUMsQ0FBQztFQUNuRztFQUVBVSxhQUFhQSxDQUFDZCxLQUFLLEVBQUU7SUFDcEIsT0FBUSxJQUFJLENBQUNGLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDRixRQUFRLENBQUNFLEtBQUssQ0FBQyxDQUFDRyxNQUFNLElBQUssQ0FBQztFQUNsRTtFQUVBWSxFQUFFQSxDQUFDZixLQUFLLEVBQUVnQixRQUFRLEVBQUU7SUFDbkIsSUFBSSxDQUFDLElBQUksQ0FBQ2xCLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLEVBQUU7TUFDMUIsSUFBSSxDQUFDRixRQUFRLENBQUNFLEtBQUssQ0FBQyxHQUFHLEVBQUU7SUFDMUI7SUFDQSxJQUFJLENBQUNGLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLENBQUNpQixJQUFJLENBQUNELFFBQVEsQ0FBQztFQUNwQztFQUVBRSxJQUFJQSxDQUFDbEIsS0FBSyxFQUFFZ0IsUUFBUSxFQUFFO0lBQ3JCLE1BQU1HLElBQUksR0FBRyxJQUFJO0lBQ2pCLElBQUksQ0FBQ0osRUFBRSxDQUFDZixLQUFLLEVBQUUsU0FBU29CLGVBQWVBLENBQUEsRUFBRztNQUN6Q0QsSUFBSSxDQUFDRSxjQUFjLENBQUNyQixLQUFLLEVBQUVvQixlQUFlLENBQUM7TUFDM0NKLFFBQVEsQ0FBQ1AsS0FBSyxDQUFDLElBQUksRUFBRVAsU0FBUyxDQUFDO0lBQ2hDLENBQUMsQ0FBQztFQUNIO0VBRUFtQixjQUFjQSxDQUFDckIsS0FBSyxFQUFFZ0IsUUFBUSxFQUFFO0lBQy9CLElBQUksQ0FBQyxJQUFJLENBQUNsQixRQUFRLENBQUNFLEtBQUssQ0FBQyxFQUFFO01BQzFCO0lBQ0Q7SUFDQSxNQUFNc0IsS0FBSyxHQUFHLElBQUksQ0FBQ3hCLFFBQVEsQ0FBQ0UsS0FBSyxDQUFDLENBQUN1QixPQUFPLENBQUNQLFFBQVEsQ0FBQztJQUNwRCxJQUFJTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7TUFDZixJQUFJLENBQUN4QixRQUFRLENBQUNFLEtBQUssQ0FBQyxDQUFDd0IsTUFBTSxDQUFDRixLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDO0VBQ0Q7RUFFQUcsa0JBQWtCQSxDQUFDekIsS0FBSyxFQUFFO0lBQ3pCLElBQUksQ0FBQ0YsUUFBUSxDQUFDRSxLQUFLLENBQUMsR0FBRzBCLFNBQVM7RUFDakM7QUFDRCxDQUFDLEM7Ozs7Ozs7Ozs7Ozs7O0lDaERELElBQUlDLFNBQVM7SUFBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsbUJBQW1CLEVBQUM7TUFBQ0YsU0FBU0EsQ0FBQ0csQ0FBQyxFQUFDO1FBQUNILFNBQVMsR0FBQ0csQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBSXpJLE1BQU1DLGVBQWUsU0FBU3BDLEVBQUUsQ0FBQztNQUNoQ0MsV0FBV0EsQ0FBQSxFQUFHO1FBQ2IsS0FBSyxDQUFDLENBQUM7UUFFUCxJQUFJLENBQUNvQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO01BQ3BCO0lBQ0Q7SUFFQUMsTUFBTSxDQUFDRixlQUFlLEdBQUcsSUFBSUEsZUFBZSxDQUFELENBQUM7SUFFNUMsTUFBTUcsY0FBYyxHQUFHLFNBQUFBLENBQVVDLFVBQVUsRUFBRUMsRUFBRSxFQUFFQyxNQUFNLEVBQUU7TUFDeEQsSUFBSUMsQ0FBQyxDQUFDQyxPQUFPLENBQUNGLE1BQU0sQ0FBQyxFQUFFO1FBQ3RCO01BQ0Q7TUFDQSxPQUFPWCxTQUFTLENBQUNjLFlBQVksQ0FBQztRQUM3QkMsR0FBRyxFQUFFLFNBQVM7UUFDZE4sVUFBVTtRQUNWQyxFQUFFO1FBQ0ZDO01BQ0QsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU1LLElBQUksR0FBRyxTQUFBQSxDQUFVeEIsSUFBSSxFQUFFdUIsR0FBRyxFQUFFO01BQ2pDLElBQUksQ0FBQ3ZCLElBQUksQ0FBQ3lCLE1BQU0sRUFBRTtRQUNqQjtNQUNEO01BQ0F6QixJQUFJLENBQUN5QixNQUFNLENBQUNELElBQUksQ0FBQ0QsR0FBRyxDQUFDO0lBQ3RCLENBQUM7SUFHRFIsTUFBTSxDQUFDVyxRQUFRLEdBQUcsTUFBTUEsUUFBUSxTQUFTakQsRUFBRSxDQUFDO01BQzNDQyxXQUFXQSxDQUFDaUQsSUFBSSxFQUFzRDtRQUFBLElBQXBEO1VBQUNDLFVBQVUsR0FBRyxJQUFJO1VBQUVDLGdCQUFnQixHQUFHO1FBQUssQ0FBQyxHQUFBOUMsU0FBQSxDQUFBQyxNQUFBLFFBQUFELFNBQUEsUUFBQXdCLFNBQUEsR0FBQXhCLFNBQUEsTUFBRyxDQUFDLENBQUM7UUFDbkUsSUFBSWdDLE1BQU0sQ0FBQ0YsZUFBZSxDQUFDQyxTQUFTLENBQUNhLElBQUksQ0FBQyxFQUFFO1VBQzNDRyxPQUFPLENBQUNDLElBQUksQ0FBQyxtQ0FBbUMsRUFBRUosSUFBSSxDQUFDO1VBQ3ZELE9BQU9aLE1BQU0sQ0FBQ0YsZUFBZSxDQUFDQyxTQUFTLENBQUNhLElBQUksQ0FBQztRQUM5QztRQUVBLEtBQUssQ0FBQyxDQUFDO1FBRVBaLE1BQU0sQ0FBQ0YsZUFBZSxDQUFDQyxTQUFTLENBQUNhLElBQUksQ0FBQyxHQUFHLElBQUk7UUFFN0MsSUFBSSxDQUFDQSxJQUFJLEdBQUdBLElBQUk7UUFDaEIsSUFBSSxDQUFDQyxVQUFVLEdBQUdBLFVBQVU7UUFDNUIsSUFBSSxDQUFDQyxnQkFBZ0IsR0FBR0EsZ0JBQWdCO1FBRXhDLElBQUksQ0FBQ0csYUFBYSxHQUFHLEVBQUU7UUFDdkIsSUFBSSxDQUFDQyx3QkFBd0IsR0FBRyxDQUFDLENBQUM7UUFDbEMsSUFBSSxDQUFDQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO1FBRXRCLElBQUksQ0FBQ0MsY0FBYyxDQUFDLENBQUM7UUFDckIsSUFBSSxDQUFDQyxVQUFVLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUNDLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQ0MsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUVyQixJQUFJLENBQUNDLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDdEIsSUFBSSxDQUFDQyxTQUFTLENBQUMsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQ0MsVUFBVSxDQUFDLE1BQU0sQ0FBQztNQUN4QjtNQUVBLElBQUlmLElBQUlBLENBQUEsRUFBRztRQUNWLE9BQU8sSUFBSSxDQUFDZ0IsS0FBSztNQUNsQjtNQUVBLElBQUloQixJQUFJQSxDQUFDQSxJQUFJLEVBQUU7UUFDZGlCLEtBQUssQ0FBQ2pCLElBQUksRUFBRWtCLE1BQU0sQ0FBQztRQUNuQixJQUFJLENBQUNGLEtBQUssR0FBR2hCLElBQUk7TUFDbEI7TUFFQSxJQUFJbUIsZ0JBQWdCQSxDQUFBLEVBQUc7UUFDdEIsaUJBQUFDLE1BQUEsQ0FBaUIsSUFBSSxDQUFDcEIsSUFBSTtNQUMzQjtNQUVBLElBQUlDLFVBQVVBLENBQUEsRUFBRztRQUNoQixPQUFPLElBQUksQ0FBQ29CLFdBQVc7TUFDeEI7TUFFQSxJQUFJcEIsVUFBVUEsQ0FBQ0EsVUFBVSxFQUFFO1FBQzFCZ0IsS0FBSyxDQUFDaEIsVUFBVSxFQUFFcUIsT0FBTyxDQUFDO1FBQzFCLElBQUksQ0FBQ0QsV0FBVyxHQUFHcEIsVUFBVTtNQUM5QjtNQUVBLElBQUlDLGdCQUFnQkEsQ0FBQSxFQUFHO1FBQ3RCLE9BQU8sSUFBSSxDQUFDcUIsaUJBQWlCO01BQzlCO01BRUEsSUFBSXJCLGdCQUFnQkEsQ0FBQ0EsZ0JBQWdCLEVBQUU7UUFDdENlLEtBQUssQ0FBQ2YsZ0JBQWdCLEVBQUVvQixPQUFPLENBQUM7UUFDaEMsSUFBSSxDQUFDQyxpQkFBaUIsR0FBR3JCLGdCQUFnQjtNQUMxQztNQUVBVyxTQUFTQSxDQUFDVyxTQUFTLEVBQUVDLEVBQUUsRUFBRTtRQUN4QixJQUFJQSxFQUFFLEtBQUs3QyxTQUFTLEVBQUU7VUFDckI2QyxFQUFFLEdBQUdELFNBQVM7VUFDZEEsU0FBUyxHQUFHLFNBQVM7UUFDdEI7UUFFQSxJQUFJLE9BQU9DLEVBQUUsS0FBSyxVQUFVLEVBQUU7VUFDN0IsT0FBTyxJQUFJLENBQUNmLFVBQVUsQ0FBQ2MsU0FBUyxDQUFDLEdBQUdDLEVBQUU7UUFDdkM7UUFFQSxJQUFJLE9BQU9BLEVBQUUsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDaEQsT0FBTyxDQUFDZ0QsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDM0V0QixPQUFPLENBQUN1QixLQUFLLHdCQUFBTixNQUFBLENBQXdCSyxFQUFFLGlCQUFjLENBQUM7UUFDdkQ7UUFFQSxJQUFJQSxFQUFFLEtBQUssS0FBSyxJQUFJQSxFQUFFLEtBQUssSUFBSSxFQUFFO1VBQ2hDLE9BQU8sSUFBSSxDQUFDZixVQUFVLENBQUNjLFNBQVMsQ0FBQyxHQUFHLFlBQVc7WUFDOUMsT0FBTyxJQUFJO1VBQ1osQ0FBQztRQUNGO1FBRUEsSUFBSUMsRUFBRSxLQUFLLE1BQU0sSUFBSUEsRUFBRSxLQUFLLEtBQUssRUFBRTtVQUNsQyxPQUFPLElBQUksQ0FBQ2YsVUFBVSxDQUFDYyxTQUFTLENBQUMsR0FBRyxZQUFXO1lBQzlDLE9BQU8sS0FBSztVQUNiLENBQUM7UUFDRjtRQUVBLElBQUlDLEVBQUUsS0FBSyxRQUFRLEVBQUU7VUFDcEIsT0FBTyxJQUFJLENBQUNmLFVBQVUsQ0FBQ2MsU0FBUyxDQUFDLEdBQUcsWUFBVztZQUM5QyxPQUFPRixPQUFPLENBQUMsSUFBSSxDQUFDSyxNQUFNLENBQUM7VUFDNUIsQ0FBQztRQUNGO01BQ0Q7TUFFQWIsU0FBU0EsQ0FBQ1UsU0FBUyxFQUFFQyxFQUFFLEVBQUU7UUFDeEIsSUFBSUEsRUFBRSxLQUFLN0MsU0FBUyxFQUFFO1VBQ3JCNkMsRUFBRSxHQUFHRCxTQUFTO1VBQ2RBLFNBQVMsR0FBRyxTQUFTO1FBQ3RCO1FBRUEsSUFBSSxPQUFPQyxFQUFFLEtBQUssVUFBVSxFQUFFO1VBQzdCLE9BQU8sSUFBSSxDQUFDZCxVQUFVLENBQUNhLFNBQVMsQ0FBQyxHQUFHQyxFQUFFO1FBQ3ZDO1FBRUEsSUFBSSxPQUFPQSxFQUFFLEtBQUssUUFBUSxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQ2hELE9BQU8sQ0FBQ2dELEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1VBQzNFdEIsT0FBTyxDQUFDdUIsS0FBSyx3QkFBQU4sTUFBQSxDQUF3QkssRUFBRSxpQkFBYyxDQUFDO1FBQ3ZEO1FBRUEsSUFBSUEsRUFBRSxLQUFLLEtBQUssSUFBSUEsRUFBRSxLQUFLLElBQUksRUFBRTtVQUNoQyxPQUFPLElBQUksQ0FBQ2QsVUFBVSxDQUFDYSxTQUFTLENBQUMsR0FBRyxZQUFXO1lBQzlDLE9BQU8sSUFBSTtVQUNaLENBQUM7UUFDRjtRQUVBLElBQUlDLEVBQUUsS0FBSyxNQUFNLElBQUlBLEVBQUUsS0FBSyxLQUFLLEVBQUU7VUFDbEMsT0FBTyxJQUFJLENBQUNkLFVBQVUsQ0FBQ2EsU0FBUyxDQUFDLEdBQUcsWUFBVztZQUM5QyxPQUFPLEtBQUs7VUFDYixDQUFDO1FBQ0Y7UUFFQSxJQUFJQyxFQUFFLEtBQUssUUFBUSxFQUFFO1VBQ3BCLE9BQU8sSUFBSSxDQUFDZCxVQUFVLENBQUNhLFNBQVMsQ0FBQyxHQUFHLFlBQVc7WUFDOUMsT0FBT0YsT0FBTyxDQUFDLElBQUksQ0FBQ0ssTUFBTSxDQUFDO1VBQzVCLENBQUM7UUFDRjtNQUNEO01BRUFaLFVBQVVBLENBQUNTLFNBQVMsRUFBRUMsRUFBRSxFQUFFO1FBQ3pCLElBQUlBLEVBQUUsS0FBSzdDLFNBQVMsRUFBRTtVQUNyQjZDLEVBQUUsR0FBR0QsU0FBUztVQUNkQSxTQUFTLEdBQUcsU0FBUztRQUN0QjtRQUVBLElBQUksT0FBT0MsRUFBRSxLQUFLLFVBQVUsRUFBRTtVQUM3QixPQUFPLElBQUksQ0FBQ2IsV0FBVyxDQUFDWSxTQUFTLENBQUMsR0FBR0MsRUFBRTtRQUN4QztRQUVBLElBQUksT0FBT0EsRUFBRSxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUNoRCxPQUFPLENBQUNnRCxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtVQUMzRXRCLE9BQU8sQ0FBQ3VCLEtBQUsseUJBQUFOLE1BQUEsQ0FBeUJLLEVBQUUsaUJBQWMsQ0FBQztRQUN4RDtRQUVBLElBQUlBLEVBQUUsS0FBSyxLQUFLLElBQUlBLEVBQUUsS0FBSyxJQUFJLEVBQUU7VUFDaEMsT0FBTyxJQUFJLENBQUNiLFdBQVcsQ0FBQ1ksU0FBUyxDQUFDLEdBQUcsWUFBVztZQUMvQyxPQUFPLElBQUk7VUFDWixDQUFDO1FBQ0Y7UUFFQSxJQUFJQyxFQUFFLEtBQUssTUFBTSxJQUFJQSxFQUFFLEtBQUssS0FBSyxFQUFFO1VBQ2xDLE9BQU8sSUFBSSxDQUFDYixXQUFXLENBQUNZLFNBQVMsQ0FBQyxHQUFHLFlBQVc7WUFDL0MsT0FBTyxLQUFLO1VBQ2IsQ0FBQztRQUNGO1FBRUEsSUFBSUMsRUFBRSxLQUFLLFFBQVEsRUFBRTtVQUNwQixPQUFPLElBQUksQ0FBQ2IsV0FBVyxDQUFDWSxTQUFTLENBQUMsR0FBRyxZQUFXO1lBQy9DLE9BQU9GLE9BQU8sQ0FBQyxJQUFJLENBQUNLLE1BQU0sQ0FBQztVQUM1QixDQUFDO1FBQ0Y7TUFDRDtNQUVBQyxhQUFhQSxDQUFDL0QsS0FBSyxFQUFFMkQsU0FBUyxFQUFFbEUsSUFBSSxFQUFFO1FBQ3JDLElBQUksSUFBSSxDQUFDb0QsVUFBVSxDQUFDYyxTQUFTLENBQUMsRUFBRTtVQUMvQixPQUFPLElBQUksQ0FBQ2QsVUFBVSxDQUFDYyxTQUFTLENBQUMsQ0FBQ0ssSUFBSSxDQUFDaEUsS0FBSyxFQUFFMkQsU0FBUyxFQUFFLEdBQUdsRSxJQUFJLENBQUM7UUFDbEU7UUFFQSxPQUFPLElBQUksQ0FBQ29ELFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQ21CLElBQUksQ0FBQ2hFLEtBQUssRUFBRTJELFNBQVMsRUFBRSxHQUFHbEUsSUFBSSxDQUFDO01BQ2xFO01BRUF3RSxhQUFhQSxDQUFDakUsS0FBSyxFQUFFMkQsU0FBUyxFQUFXO1FBQUEsU0FBQXJFLElBQUEsR0FBQUMsU0FBQSxDQUFBQyxNQUFBLEVBQU5DLElBQUksT0FBQUMsS0FBQSxDQUFBSixJQUFBLE9BQUFBLElBQUEsV0FBQUssSUFBQSxNQUFBQSxJQUFBLEdBQUFMLElBQUEsRUFBQUssSUFBQTtVQUFKRixJQUFJLENBQUFFLElBQUEsUUFBQUosU0FBQSxDQUFBSSxJQUFBO1FBQUE7UUFDdEMsSUFBSSxJQUFJLENBQUNtRCxVQUFVLENBQUNhLFNBQVMsQ0FBQyxFQUFFO1VBQy9CLE9BQU8sSUFBSSxDQUFDYixVQUFVLENBQUNhLFNBQVMsQ0FBQyxDQUFDSyxJQUFJLENBQUNoRSxLQUFLLEVBQUUyRCxTQUFTLEVBQUUsR0FBR2xFLElBQUksQ0FBQztRQUNsRTtRQUVBLE9BQU8sSUFBSSxDQUFDcUQsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDa0IsSUFBSSxDQUFDaEUsS0FBSyxFQUFFMkQsU0FBUyxFQUFFLEdBQUdsRSxJQUFJLENBQUM7TUFDbEU7TUFFQXlFLGNBQWNBLENBQUNsRSxLQUFLLEVBQUUyRCxTQUFTLEVBQUVsRSxJQUFJLEVBQUU7UUFDdEMsSUFBSSxJQUFJLENBQUNzRCxXQUFXLENBQUNZLFNBQVMsQ0FBQyxFQUFFO1VBQ2hDLE9BQU8sSUFBSSxDQUFDWixXQUFXLENBQUNZLFNBQVMsQ0FBQyxDQUFDSyxJQUFJLENBQUNoRSxLQUFLLEVBQUUyRCxTQUFTLEVBQUUsR0FBR2xFLElBQUksQ0FBQztRQUNuRTtRQUVBLE9BQU8sSUFBSSxDQUFDc0QsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDaUIsSUFBSSxDQUFDaEUsS0FBSyxFQUFFMkQsU0FBUyxFQUFFLEdBQUdsRSxJQUFJLENBQUM7TUFDbkU7TUFFQTBFLGVBQWVBLENBQUNDLFlBQVksRUFBRVQsU0FBUyxFQUFFO1FBQ3hDLElBQUksQ0FBQ25CLGFBQWEsQ0FBQ2xDLElBQUksQ0FBQzhELFlBQVksQ0FBQztRQUVyQyxJQUFJLENBQUMsSUFBSSxDQUFDM0Isd0JBQXdCLENBQUNrQixTQUFTLENBQUMsRUFBRTtVQUM5QyxJQUFJLENBQUNsQix3QkFBd0IsQ0FBQ2tCLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDOUM7UUFFQSxJQUFJLENBQUNsQix3QkFBd0IsQ0FBQ2tCLFNBQVMsQ0FBQyxDQUFDckQsSUFBSSxDQUFDOEQsWUFBWSxDQUFDO01BQzVEO01BRUFDLGtCQUFrQkEsQ0FBQ0QsWUFBWSxFQUFFVCxTQUFTLEVBQUU7UUFDM0MsTUFBTWhELEtBQUssR0FBRyxJQUFJLENBQUM2QixhQUFhLENBQUM1QixPQUFPLENBQUN3RCxZQUFZLENBQUM7UUFDdEQsSUFBSXpELEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtVQUNmLElBQUksQ0FBQzZCLGFBQWEsQ0FBQzNCLE1BQU0sQ0FBQ0YsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNwQztRQUVBLElBQUksSUFBSSxDQUFDOEIsd0JBQXdCLENBQUNrQixTQUFTLENBQUMsRUFBRTtVQUM3QyxNQUFNaEQsS0FBSyxHQUFHLElBQUksQ0FBQzhCLHdCQUF3QixDQUFDa0IsU0FBUyxDQUFDLENBQUMvQyxPQUFPLENBQUN3RCxZQUFZLENBQUM7VUFDNUUsSUFBSXpELEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtZQUNmLElBQUksQ0FBQzhCLHdCQUF3QixDQUFDa0IsU0FBUyxDQUFDLENBQUM5QyxNQUFNLENBQUNGLEtBQUssRUFBRSxDQUFDLENBQUM7VUFDMUQ7UUFDRDtNQUNEO01BRUEyRCxTQUFTQSxDQUFDWCxTQUFTLEVBQUVDLEVBQUUsRUFBRTtRQUN4QixJQUFJLE9BQU9ELFNBQVMsS0FBSyxVQUFVLEVBQUU7VUFDcENDLEVBQUUsR0FBR0QsU0FBUztVQUNkQSxTQUFTLEdBQUcsU0FBUztRQUN0QjtRQUVBLElBQUksQ0FBQyxJQUFJLENBQUNqQixZQUFZLENBQUNpQixTQUFTLENBQUMsRUFBRTtVQUNsQyxJQUFJLENBQUNqQixZQUFZLENBQUNpQixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2xDO1FBRUEsSUFBSSxDQUFDakIsWUFBWSxDQUFDaUIsU0FBUyxDQUFDLENBQUNyRCxJQUFJLENBQUNzRCxFQUFFLENBQUM7TUFDdEM7TUFFQVcsaUJBQWlCQSxDQUFDQyxXQUFXLEVBQUViLFNBQVMsRUFBRWxFLElBQUksRUFBRTtRQUMvQyxJQUFJLElBQUksQ0FBQ2lELFlBQVksQ0FBQyxTQUFTLENBQUMsRUFBRTtVQUNqQyxJQUFJLENBQUNBLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzlDLE9BQU8sQ0FBRTBFLFNBQVMsSUFBSztZQUNuRDdFLElBQUksR0FBRzZFLFNBQVMsQ0FBQ04sSUFBSSxDQUFDUSxXQUFXLEVBQUViLFNBQVMsRUFBRWxFLElBQUksQ0FBQztZQUNuRCtFLFdBQVcsQ0FBQ0MsVUFBVSxHQUFHLElBQUk7WUFDN0IsSUFBSSxDQUFDL0UsS0FBSyxDQUFDZ0YsT0FBTyxDQUFDakYsSUFBSSxDQUFDLEVBQUU7Y0FDekJBLElBQUksR0FBRyxDQUFDQSxJQUFJLENBQUM7WUFDZDtVQUNELENBQUMsQ0FBQztRQUNIO1FBRUEsSUFBSSxJQUFJLENBQUNpRCxZQUFZLENBQUNpQixTQUFTLENBQUMsRUFBRTtVQUNqQyxJQUFJLENBQUNqQixZQUFZLENBQUNpQixTQUFTLENBQUMsQ0FBQy9ELE9BQU8sQ0FBRTBFLFNBQVMsSUFBSztZQUNuRDdFLElBQUksR0FBRzZFLFNBQVMsQ0FBQ04sSUFBSSxDQUFDUSxXQUFXLEVBQUUsR0FBRy9FLElBQUksQ0FBQztZQUMzQytFLFdBQVcsQ0FBQ0MsVUFBVSxHQUFHLElBQUk7WUFDN0IsSUFBSSxDQUFDL0UsS0FBSyxDQUFDZ0YsT0FBTyxDQUFDakYsSUFBSSxDQUFDLEVBQUU7Y0FDekJBLElBQUksR0FBRyxDQUFDQSxJQUFJLENBQUM7WUFDZDtVQUNELENBQUMsQ0FBQztRQUNIO1FBRUEsT0FBT0EsSUFBSTtNQUNaO01BR0FrRixRQUFRQSxDQUFDQyxXQUFXLEVBQUVqQixTQUFTLEVBQUVrQixPQUFPLEVBQUU7UUFDekN6QixLQUFLLENBQUNPLFNBQVMsRUFBRU4sTUFBTSxDQUFDO1FBQ3hCRCxLQUFLLENBQUN5QixPQUFPLEVBQUVDLEtBQUssQ0FBQ0MsS0FBSyxDQUFDdEIsT0FBTyxFQUFFO1VBQ25DdUIsYUFBYSxFQUFFdkIsT0FBTztVQUN0QmhFLElBQUksRUFBRUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUlzRixhQUFhO1VBQUV2RixJQUFJLEdBQUcsRUFBRTtRQUU1QixJQUFJLE9BQU9vRixPQUFPLEtBQUssU0FBUyxFQUFFO1VBQ2pDRyxhQUFhLEdBQUdILE9BQU87UUFDeEIsQ0FBQyxNQUFNO1VBQ04sSUFBSUEsT0FBTyxDQUFDRyxhQUFhLEVBQUU7WUFDMUJBLGFBQWEsR0FBR0gsT0FBTyxDQUFDRyxhQUFhO1VBQ3RDO1VBRUEsSUFBSUgsT0FBTyxDQUFDcEYsSUFBSSxFQUFFO1lBQ2pCQSxJQUFJLEdBQUdvRixPQUFPLENBQUNwRixJQUFJO1VBQ3BCO1FBQ0Q7UUFFQSxJQUFJa0UsU0FBUyxDQUFDbkUsTUFBTSxLQUFLLENBQUMsRUFBRTtVQUMzQm9GLFdBQVcsQ0FBQ0ssSUFBSSxDQUFDLENBQUM7VUFDbEIsTUFBTSxJQUFJMUQsTUFBTSxDQUFDMkQsS0FBSyxDQUFDLG9CQUFvQixDQUFDO1FBQzdDO1FBRUEsSUFBSSxJQUFJLENBQUNuQixhQUFhLENBQUNhLFdBQVcsRUFBRWpCLFNBQVMsRUFBRWxFLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtVQUM5RG1GLFdBQVcsQ0FBQ0ssSUFBSSxDQUFDLENBQUM7VUFDbEIsTUFBTSxJQUFJMUQsTUFBTSxDQUFDMkQsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUN0QztRQUVBLE1BQU1kLFlBQVksR0FBRztVQUNwQkEsWUFBWSxFQUFFUSxXQUFXO1VBQ3pCakIsU0FBUyxFQUFFQTtRQUNaLENBQUM7UUFFRCxJQUFJLENBQUNRLGVBQWUsQ0FBQ0MsWUFBWSxFQUFFVCxTQUFTLENBQUM7UUFFN0NpQixXQUFXLENBQUNPLE1BQU0sQ0FBQyxNQUFNO1VBQ3hCLElBQUksQ0FBQ2Qsa0JBQWtCLENBQUNELFlBQVksRUFBRVQsU0FBUyxDQUFDO1FBQ2pELENBQUMsQ0FBQztRQUVGLElBQUlxQixhQUFhLEtBQUssSUFBSSxFQUFFO1VBQzNCO1VBQ0FKLFdBQVcsQ0FBQ1EsUUFBUSxDQUFDQyxTQUFTLENBQUMsSUFBSSxDQUFDL0IsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFO1lBQzNESyxTQUFTLEVBQUVBO1VBQ1osQ0FBQyxDQUFDO1FBQ0g7UUFFQWlCLFdBQVcsQ0FBQ1UsS0FBSyxDQUFDLENBQUM7TUFDcEI7TUFFQTNDLGNBQWNBLENBQUEsRUFBRztRQUNoQixNQUFNNEMsTUFBTSxHQUFHLElBQUk7UUFDbkJoRSxNQUFNLENBQUNpRSxPQUFPLENBQUMsSUFBSSxDQUFDbEMsZ0JBQWdCLEVBQUUsWUFBbUI7VUFBQSxTQUFBckQsS0FBQSxHQUFBVixTQUFBLENBQUFDLE1BQUEsRUFBTkMsSUFBSSxPQUFBQyxLQUFBLENBQUFPLEtBQUEsR0FBQUMsS0FBQSxNQUFBQSxLQUFBLEdBQUFELEtBQUEsRUFBQUMsS0FBQTtZQUFKVCxJQUFJLENBQUFTLEtBQUEsSUFBQVgsU0FBQSxDQUFBVyxLQUFBO1VBQUE7VUFBSSxPQUFPcUYsTUFBTSxDQUFDWixRQUFRLENBQUM3RSxLQUFLLENBQUN5RixNQUFNLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRzlGLElBQUksQ0FBQyxDQUFDO1FBQUUsQ0FBQyxDQUFDO01BQ3JIO01BRUFtRCxVQUFVQSxDQUFBLEVBQUc7UUFDWixNQUFNMkMsTUFBTSxHQUFHLElBQUk7UUFDbkIsTUFBTUUsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVqQkEsTUFBTSxDQUFDLElBQUksQ0FBQ25DLGdCQUFnQixDQUFDLEdBQUcsVUFBU0ssU0FBUyxFQUFXO1VBQUEsU0FBQStCLEtBQUEsR0FBQW5HLFNBQUEsQ0FBQUMsTUFBQSxFQUFOQyxJQUFJLE9BQUFDLEtBQUEsQ0FBQWdHLEtBQUEsT0FBQUEsS0FBQSxXQUFBQyxLQUFBLE1BQUFBLEtBQUEsR0FBQUQsS0FBQSxFQUFBQyxLQUFBO1lBQUpsRyxJQUFJLENBQUFrRyxLQUFBLFFBQUFwRyxTQUFBLENBQUFvRyxLQUFBO1VBQUE7VUFDMUR2QyxLQUFLLENBQUNPLFNBQVMsRUFBRU4sTUFBTSxDQUFDO1VBQ3hCRCxLQUFLLENBQUMzRCxJQUFJLEVBQUVDLEtBQUssQ0FBQztVQUVsQixJQUFJLENBQUNrRyxPQUFPLENBQUMsQ0FBQztVQUVkLElBQUlMLE1BQU0sQ0FBQ3JCLGNBQWMsQ0FBQyxJQUFJLEVBQUVQLFNBQVMsRUFBRWxFLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRTtZQUMxRDtVQUNEO1VBRUEsTUFBTStFLFdBQVcsR0FBRztZQUNuQlYsTUFBTSxFQUFFLElBQUksQ0FBQ0EsTUFBTTtZQUNuQitCLFVBQVUsRUFBRSxJQUFJLENBQUNBLFVBQVU7WUFDM0JDLGNBQWMsRUFBRXJHLElBQUk7WUFDcEJnRixVQUFVLEVBQUU7VUFDYixDQUFDO1VBRURoRixJQUFJLEdBQUc4RixNQUFNLENBQUNoQixpQkFBaUIsQ0FBQ0MsV0FBVyxFQUFFYixTQUFTLEVBQUVsRSxJQUFJLENBQUM7VUFFN0Q4RixNQUFNLENBQUN4RixhQUFhLENBQUM0RCxTQUFTLEVBQUVhLFdBQVcsRUFBRSxHQUFHL0UsSUFBSSxDQUFDO1VBRXJELElBQUk4RixNQUFNLENBQUNuRCxVQUFVLEtBQUssSUFBSSxFQUFFO1lBQy9CbUQsTUFBTSxDQUFDUSxLQUFLLENBQUNwQyxTQUFTLEVBQUVsRSxJQUFJLEVBQUUsSUFBSSxDQUFDb0csVUFBVSxFQUFFLElBQUksQ0FBQztVQUNyRDtRQUNELENBQUM7UUFFRCxJQUFJO1VBQ0h0RSxNQUFNLENBQUN5RSxPQUFPLENBQUNQLE1BQU0sQ0FBQztRQUN2QixDQUFDLENBQUMsT0FBT1EsQ0FBQyxFQUFFO1VBQ1gzRCxPQUFPLENBQUN1QixLQUFLLENBQUNvQyxDQUFDLENBQUM7UUFDakI7TUFDRDtNQUVBRixLQUFLQSxDQUFDcEMsU0FBUyxFQUFFbEUsSUFBSSxFQUFFeUcsTUFBTSxFQUFFQyxTQUFTLEVBQUU7UUFDekMsSUFBSUEsU0FBUyxLQUFLLElBQUksRUFBRTtVQUN2QjVFLE1BQU0sQ0FBQ0YsZUFBZSxDQUFDakMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMrQyxJQUFJLEVBQUV3QixTQUFTLEVBQUVsRSxJQUFJLENBQUM7UUFDckU7UUFFQSxNQUFNK0MsYUFBYSxHQUFHLElBQUksQ0FBQ0Msd0JBQXdCLENBQUNrQixTQUFTLENBQUM7UUFDOUQsSUFBSSxDQUFDakUsS0FBSyxDQUFDZ0YsT0FBTyxDQUFDbEMsYUFBYSxDQUFDLEVBQUU7VUFDbEM7UUFDRDtRQUVBLE1BQU1ULEdBQUcsR0FBR1AsY0FBYyxDQUFDLElBQUksQ0FBQzhCLGdCQUFnQixFQUFFLElBQUksRUFBRTtVQUN2REssU0FBUztVQUNUbEU7UUFDRCxDQUFDLENBQUM7UUFFRixJQUFHLENBQUNzQyxHQUFHLEVBQUU7VUFDUjtRQUNEO1FBRUFTLGFBQWEsQ0FBQzVDLE9BQU8sQ0FBRXdFLFlBQVksSUFBSztVQUN2QyxJQUFJLElBQUksQ0FBQy9CLGdCQUFnQixLQUFLLEtBQUssSUFBSTZELE1BQU0sSUFBSUEsTUFBTSxLQUFLOUIsWUFBWSxDQUFDQSxZQUFZLENBQUN5QixVQUFVLEVBQUU7WUFDakc7VUFDRDtVQUVBLElBQUksSUFBSSxDQUFDNUIsYUFBYSxDQUFDRyxZQUFZLENBQUNBLFlBQVksRUFBRVQsU0FBUyxFQUFFLEdBQUdsRSxJQUFJLENBQUMsRUFBRTtZQUN0RXVDLElBQUksQ0FBQ29DLFlBQVksQ0FBQ0EsWUFBWSxDQUFDZ0IsUUFBUSxFQUFFckQsR0FBRyxDQUFDO1VBQzlDO1FBQ0QsQ0FBQyxDQUFDO01BQ0g7TUFFQTNDLElBQUlBLENBQUN1RSxTQUFTLEVBQVc7UUFBQSxTQUFBeUMsS0FBQSxHQUFBN0csU0FBQSxDQUFBQyxNQUFBLEVBQU5DLElBQUksT0FBQUMsS0FBQSxDQUFBMEcsS0FBQSxPQUFBQSxLQUFBLFdBQUFDLEtBQUEsTUFBQUEsS0FBQSxHQUFBRCxLQUFBLEVBQUFDLEtBQUE7VUFBSjVHLElBQUksQ0FBQTRHLEtBQUEsUUFBQTlHLFNBQUEsQ0FBQThHLEtBQUE7UUFBQTtRQUN0QixJQUFJLENBQUNOLEtBQUssQ0FBQ3BDLFNBQVMsRUFBRWxFLElBQUksRUFBRXNCLFNBQVMsRUFBRSxJQUFJLENBQUM7TUFDN0M7TUFFQXVGLE1BQU1BLENBQUEsRUFBVTtRQUNmLE9BQU8sS0FBSyxDQUFDbEgsSUFBSSxDQUFDLEdBQUFHLFNBQU8sQ0FBQztNQUMzQjtNQUVBZ0gsb0JBQW9CQSxDQUFDNUMsU0FBUyxFQUFXO1FBQUEsU0FBQTZDLEtBQUEsR0FBQWpILFNBQUEsQ0FBQUMsTUFBQSxFQUFOQyxJQUFJLE9BQUFDLEtBQUEsQ0FBQThHLEtBQUEsT0FBQUEsS0FBQSxXQUFBQyxLQUFBLE1BQUFBLEtBQUEsR0FBQUQsS0FBQSxFQUFBQyxLQUFBO1VBQUpoSCxJQUFJLENBQUFnSCxLQUFBLFFBQUFsSCxTQUFBLENBQUFrSCxLQUFBO1FBQUE7UUFDdEMsSUFBSSxDQUFDVixLQUFLLENBQUNwQyxTQUFTLEVBQUVsRSxJQUFJLEVBQUVzQixTQUFTLEVBQUUsS0FBSyxDQUFDO01BQzlDO0lBQ0QsQ0FBQztJQUFDMkYsc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQWxHLElBQUE7RUFBQW9HLEtBQUE7QUFBQSxHIiwiZmlsZSI6Ii9wYWNrYWdlcy9yb2NrZXRjaGF0X3N0cmVhbWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFscyBFVjp0cnVlICovXG4vKiBleHBvcnRlZCBFViAqL1xuXG5FViA9IGNsYXNzIEVWIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5oYW5kbGVycyA9IHt9O1xuXHR9XG5cblx0ZW1pdChldmVudCwgLi4uYXJncykge1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXJzW2V2ZW50XSAmJiB0aGlzLmhhbmRsZXJzW2V2ZW50XS5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKSk7XG5cdH1cblxuXHRlbWl0V2l0aFNjb3BlKGV2ZW50LCBzY29wZSwgLi4uYXJncykge1xuXHRcdHJldHVybiB0aGlzLmhhbmRsZXJzW2V2ZW50XSAmJiB0aGlzLmhhbmRsZXJzW2V2ZW50XS5mb3JFYWNoKGhhbmRsZXIgPT4gaGFuZGxlci5hcHBseShzY29wZSwgYXJncykpO1xuXHR9XG5cblx0bGlzdGVuZXJDb3VudChldmVudCkge1xuXHRcdHJldHVybiAodGhpcy5oYW5kbGVyc1tldmVudF0gJiYgdGhpcy5oYW5kbGVyc1tldmVudF0ubGVuZ3RoKSB8fCAwO1xuXHR9XG5cblx0b24oZXZlbnQsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKCF0aGlzLmhhbmRsZXJzW2V2ZW50XSkge1xuXHRcdFx0dGhpcy5oYW5kbGVyc1tldmVudF0gPSBbXTtcblx0XHR9XG5cdFx0dGhpcy5oYW5kbGVyc1tldmVudF0ucHVzaChjYWxsYmFjayk7XG5cdH1cblxuXHRvbmNlKGV2ZW50LCBjYWxsYmFjaykge1xuXHRcdGNvbnN0IHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMub24oZXZlbnQsIGZ1bmN0aW9uIG9uZXRpbWVDYWxsYmFjaygpIHtcblx0XHRcdHNlbGYucmVtb3ZlTGlzdGVuZXIoZXZlbnQsIG9uZXRpbWVDYWxsYmFjayk7XG5cdFx0XHRjYWxsYmFjay5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGNhbGxiYWNrKSB7XG5cdFx0aWYgKCF0aGlzLmhhbmRsZXJzW2V2ZW50XSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBpbmRleCA9IHRoaXMuaGFuZGxlcnNbZXZlbnRdLmluZGV4T2YoY2FsbGJhY2spO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHR0aGlzLmhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5kZXgsIDEpO1xuXHRcdH1cblx0fVxuXG5cdHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuXHRcdHRoaXMuaGFuZGxlcnNbZXZlbnRdID0gdW5kZWZpbmVkO1xuXHR9XG59O1xuIiwiLyogZ2xvYmFscyBFViAqL1xuLyogZXNsaW50IG5ldy1jYXA6IGZhbHNlICovXG5pbXBvcnQgeyBERFBDb21tb24gfSBmcm9tICdtZXRlb3IvZGRwLWNvbW1vbic7XG5cbmNsYXNzIFN0cmVhbWVyQ2VudHJhbCBleHRlbmRzIEVWIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0c3VwZXIoKTtcblxuXHRcdHRoaXMuaW5zdGFuY2VzID0ge307XG5cdH1cbn1cblxuTWV0ZW9yLlN0cmVhbWVyQ2VudHJhbCA9IG5ldyBTdHJlYW1lckNlbnRyYWw7XG5cbmNvbnN0IGNoYW5nZWRQYXlsb2FkID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGlkLCBmaWVsZHMpIHtcblx0aWYgKF8uaXNFbXB0eShmaWVsZHMpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHJldHVybiBERFBDb21tb24uc3RyaW5naWZ5RERQKHtcblx0XHRtc2c6ICdjaGFuZ2VkJyxcblx0XHRjb2xsZWN0aW9uLFxuXHRcdGlkLFxuXHRcdGZpZWxkc1xuXHR9KTtcbn07XG5cbmNvbnN0IHNlbmQgPSBmdW5jdGlvbiAoc2VsZiwgbXNnKSB7XG5cdGlmICghc2VsZi5zb2NrZXQpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0c2VsZi5zb2NrZXQuc2VuZChtc2cpO1xufTtcblxuXG5NZXRlb3IuU3RyZWFtZXIgPSBjbGFzcyBTdHJlYW1lciBleHRlbmRzIEVWIHtcblx0Y29uc3RydWN0b3IobmFtZSwge3JldHJhbnNtaXQgPSB0cnVlLCByZXRyYW5zbWl0VG9TZWxmID0gZmFsc2V9ID0ge30pIHtcblx0XHRpZiAoTWV0ZW9yLlN0cmVhbWVyQ2VudHJhbC5pbnN0YW5jZXNbbmFtZV0pIHtcblx0XHRcdGNvbnNvbGUud2FybignU3RyZWFtZXIgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHM6JywgbmFtZSk7XG5cdFx0XHRyZXR1cm4gTWV0ZW9yLlN0cmVhbWVyQ2VudHJhbC5pbnN0YW5jZXNbbmFtZV07XG5cdFx0fVxuXG5cdFx0c3VwZXIoKTtcblxuXHRcdE1ldGVvci5TdHJlYW1lckNlbnRyYWwuaW5zdGFuY2VzW25hbWVdID0gdGhpcztcblxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0dGhpcy5yZXRyYW5zbWl0ID0gcmV0cmFuc21pdDtcblx0XHR0aGlzLnJldHJhbnNtaXRUb1NlbGYgPSByZXRyYW5zbWl0VG9TZWxmO1xuXG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zID0gW107XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zQnlFdmVudE5hbWUgPSB7fTtcblx0XHR0aGlzLnRyYW5zZm9ybWVycyA9IHt9O1xuXG5cdFx0dGhpcy5pbmlQdWJsaWNhdGlvbigpO1xuXHRcdHRoaXMuaW5pdE1ldGhvZCgpO1xuXG5cdFx0dGhpcy5fYWxsb3dSZWFkID0ge307XG5cdFx0dGhpcy5fYWxsb3dFbWl0ID0ge307XG5cdFx0dGhpcy5fYWxsb3dXcml0ZSA9IHt9O1xuXG5cdFx0dGhpcy5hbGxvd1JlYWQoJ25vbmUnKTtcblx0XHR0aGlzLmFsbG93RW1pdCgnYWxsJyk7XG5cdFx0dGhpcy5hbGxvd1dyaXRlKCdub25lJyk7XG5cdH1cblxuXHRnZXQgbmFtZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fbmFtZTtcblx0fVxuXG5cdHNldCBuYW1lKG5hbWUpIHtcblx0XHRjaGVjayhuYW1lLCBTdHJpbmcpO1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHR9XG5cblx0Z2V0IHN1YnNjcmlwdGlvbk5hbWUoKSB7XG5cdFx0cmV0dXJuIGBzdHJlYW0tJHt0aGlzLm5hbWV9YDtcblx0fVxuXG5cdGdldCByZXRyYW5zbWl0KCkge1xuXHRcdHJldHVybiB0aGlzLl9yZXRyYW5zbWl0O1xuXHR9XG5cblx0c2V0IHJldHJhbnNtaXQocmV0cmFuc21pdCkge1xuXHRcdGNoZWNrKHJldHJhbnNtaXQsIEJvb2xlYW4pO1xuXHRcdHRoaXMuX3JldHJhbnNtaXQgPSByZXRyYW5zbWl0O1xuXHR9XG5cblx0Z2V0IHJldHJhbnNtaXRUb1NlbGYoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3JldHJhbnNtaXRUb1NlbGY7XG5cdH1cblxuXHRzZXQgcmV0cmFuc21pdFRvU2VsZihyZXRyYW5zbWl0VG9TZWxmKSB7XG5cdFx0Y2hlY2socmV0cmFuc21pdFRvU2VsZiwgQm9vbGVhbik7XG5cdFx0dGhpcy5fcmV0cmFuc21pdFRvU2VsZiA9IHJldHJhbnNtaXRUb1NlbGY7XG5cdH1cblxuXHRhbGxvd1JlYWQoZXZlbnROYW1lLCBmbikge1xuXHRcdGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmbiA9IGV2ZW50TmFtZTtcblx0XHRcdGV2ZW50TmFtZSA9ICdfX2FsbF9fJztcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dSZWFkW2V2ZW50TmFtZV0gPSBmbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGZuID09PSAnc3RyaW5nJyAmJiBbJ2FsbCcsICdub25lJywgJ2xvZ2dlZCddLmluZGV4T2YoZm4pID09PSAtMSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcihgYWxsb3dSZWFkIHNob3J0Y3V0ICcke2ZufScgaXMgaW52YWxpZGApO1xuXHRcdH1cblxuXHRcdGlmIChmbiA9PT0gJ2FsbCcgfHwgZm4gPT09IHRydWUpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbGxvd1JlYWRbZXZlbnROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKGZuID09PSAnbm9uZScgfHwgZm4gPT09IGZhbHNlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dSZWFkW2V2ZW50TmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoZm4gPT09ICdsb2dnZWQnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dSZWFkW2V2ZW50TmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIEJvb2xlYW4odGhpcy51c2VySWQpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRhbGxvd0VtaXQoZXZlbnROYW1lLCBmbikge1xuXHRcdGlmIChmbiA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmbiA9IGV2ZW50TmFtZTtcblx0XHRcdGV2ZW50TmFtZSA9ICdfX2FsbF9fJztcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dFbWl0W2V2ZW50TmFtZV0gPSBmbjtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mIGZuID09PSAnc3RyaW5nJyAmJiBbJ2FsbCcsICdub25lJywgJ2xvZ2dlZCddLmluZGV4T2YoZm4pID09PSAtMSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcihgYWxsb3dSZWFkIHNob3J0Y3V0ICcke2ZufScgaXMgaW52YWxpZGApO1xuXHRcdH1cblxuXHRcdGlmIChmbiA9PT0gJ2FsbCcgfHwgZm4gPT09IHRydWUpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbGxvd0VtaXRbZXZlbnROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0aWYgKGZuID09PSAnbm9uZScgfHwgZm4gPT09IGZhbHNlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dFbWl0W2V2ZW50TmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRpZiAoZm4gPT09ICdsb2dnZWQnKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dFbWl0W2V2ZW50TmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIEJvb2xlYW4odGhpcy51c2VySWQpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRhbGxvd1dyaXRlKGV2ZW50TmFtZSwgZm4pIHtcblx0XHRpZiAoZm4gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Zm4gPSBldmVudE5hbWU7XG5cdFx0XHRldmVudE5hbWUgPSAnX19hbGxfXyc7XG5cdFx0fVxuXG5cdFx0aWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FsbG93V3JpdGVbZXZlbnROYW1lXSA9IGZuO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgZm4gPT09ICdzdHJpbmcnICYmIFsnYWxsJywgJ25vbmUnLCAnbG9nZ2VkJ10uaW5kZXhPZihmbikgPT09IC0xKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKGBhbGxvd1dyaXRlIHNob3J0Y3V0ICcke2ZufScgaXMgaW52YWxpZGApO1xuXHRcdH1cblxuXHRcdGlmIChmbiA9PT0gJ2FsbCcgfHwgZm4gPT09IHRydWUpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbGxvd1dyaXRlW2V2ZW50TmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChmbiA9PT0gJ25vbmUnIHx8IGZuID09PSBmYWxzZSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2FsbG93V3JpdGVbZXZlbnROYW1lXSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChmbiA9PT0gJ2xvZ2dlZCcpIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbGxvd1dyaXRlW2V2ZW50TmFtZV0gPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIEJvb2xlYW4odGhpcy51c2VySWQpO1xuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRpc1JlYWRBbGxvd2VkKHNjb3BlLCBldmVudE5hbWUsIGFyZ3MpIHtcblx0XHRpZiAodGhpcy5fYWxsb3dSZWFkW2V2ZW50TmFtZV0pIHtcblx0XHRcdHJldHVybiB0aGlzLl9hbGxvd1JlYWRbZXZlbnROYW1lXS5jYWxsKHNjb3BlLCBldmVudE5hbWUsIC4uLmFyZ3MpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9hbGxvd1JlYWRbJ19fYWxsX18nXS5jYWxsKHNjb3BlLCBldmVudE5hbWUsIC4uLmFyZ3MpO1xuXHR9XG5cblx0aXNFbWl0QWxsb3dlZChzY29wZSwgZXZlbnROYW1lLCAuLi5hcmdzKSB7XG5cdFx0aWYgKHRoaXMuX2FsbG93RW1pdFtldmVudE5hbWVdKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dFbWl0W2V2ZW50TmFtZV0uY2FsbChzY29wZSwgZXZlbnROYW1lLCAuLi5hcmdzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fYWxsb3dFbWl0WydfX2FsbF9fJ10uY2FsbChzY29wZSwgZXZlbnROYW1lLCAuLi5hcmdzKTtcblx0fVxuXG5cdGlzV3JpdGVBbGxvd2VkKHNjb3BlLCBldmVudE5hbWUsIGFyZ3MpIHtcblx0XHRpZiAodGhpcy5fYWxsb3dXcml0ZVtldmVudE5hbWVdKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYWxsb3dXcml0ZVtldmVudE5hbWVdLmNhbGwoc2NvcGUsIGV2ZW50TmFtZSwgLi4uYXJncyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2FsbG93V3JpdGVbJ19fYWxsX18nXS5jYWxsKHNjb3BlLCBldmVudE5hbWUsIC4uLmFyZ3MpO1xuXHR9XG5cblx0YWRkU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbiwgZXZlbnROYW1lKSB7XG5cdFx0dGhpcy5zdWJzY3JpcHRpb25zLnB1c2goc3Vic2NyaXB0aW9uKTtcblxuXHRcdGlmICghdGhpcy5zdWJzY3JpcHRpb25zQnlFdmVudE5hbWVbZXZlbnROYW1lXSkge1xuXHRcdFx0dGhpcy5zdWJzY3JpcHRpb25zQnlFdmVudE5hbWVbZXZlbnROYW1lXSA9IFtdO1xuXHRcdH1cblxuXHRcdHRoaXMuc3Vic2NyaXB0aW9uc0J5RXZlbnROYW1lW2V2ZW50TmFtZV0ucHVzaChzdWJzY3JpcHRpb24pO1xuXHR9XG5cblx0cmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbiwgZXZlbnROYW1lKSB7XG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLnN1YnNjcmlwdGlvbnMuaW5kZXhPZihzdWJzY3JpcHRpb24pO1xuXHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHR0aGlzLnN1YnNjcmlwdGlvbnMuc3BsaWNlKGluZGV4LCAxKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5zdWJzY3JpcHRpb25zQnlFdmVudE5hbWVbZXZlbnROYW1lXSkge1xuXHRcdFx0Y29uc3QgaW5kZXggPSB0aGlzLnN1YnNjcmlwdGlvbnNCeUV2ZW50TmFtZVtldmVudE5hbWVdLmluZGV4T2Yoc3Vic2NyaXB0aW9uKTtcblx0XHRcdGlmIChpbmRleCA+IC0xKSB7XG5cdFx0XHRcdHRoaXMuc3Vic2NyaXB0aW9uc0J5RXZlbnROYW1lW2V2ZW50TmFtZV0uc3BsaWNlKGluZGV4LCAxKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHR0cmFuc2Zvcm0oZXZlbnROYW1lLCBmbikge1xuXHRcdGlmICh0eXBlb2YgZXZlbnROYW1lID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRmbiA9IGV2ZW50TmFtZTtcblx0XHRcdGV2ZW50TmFtZSA9ICdfX2FsbF9fJztcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMudHJhbnNmb3JtZXJzW2V2ZW50TmFtZV0pIHtcblx0XHRcdHRoaXMudHJhbnNmb3JtZXJzW2V2ZW50TmFtZV0gPSBbXTtcblx0XHR9XG5cblx0XHR0aGlzLnRyYW5zZm9ybWVyc1tldmVudE5hbWVdLnB1c2goZm4pO1xuXHR9XG5cblx0YXBwbHlUcmFuc2Zvcm1lcnMobWV0aG9kU2NvcGUsIGV2ZW50TmFtZSwgYXJncykge1xuXHRcdGlmICh0aGlzLnRyYW5zZm9ybWVyc1snX19hbGxfXyddKSB7XG5cdFx0XHR0aGlzLnRyYW5zZm9ybWVyc1snX19hbGxfXyddLmZvckVhY2goKHRyYW5zZm9ybSkgPT4ge1xuXHRcdFx0XHRhcmdzID0gdHJhbnNmb3JtLmNhbGwobWV0aG9kU2NvcGUsIGV2ZW50TmFtZSwgYXJncyk7XG5cdFx0XHRcdG1ldGhvZFNjb3BlLnRyYW5mb3JtZWQgPSB0cnVlO1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcblx0XHRcdFx0XHRhcmdzID0gW2FyZ3NdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy50cmFuc2Zvcm1lcnNbZXZlbnROYW1lXSkge1xuXHRcdFx0dGhpcy50cmFuc2Zvcm1lcnNbZXZlbnROYW1lXS5mb3JFYWNoKCh0cmFuc2Zvcm0pID0+IHtcblx0XHRcdFx0YXJncyA9IHRyYW5zZm9ybS5jYWxsKG1ldGhvZFNjb3BlLCAuLi5hcmdzKTtcblx0XHRcdFx0bWV0aG9kU2NvcGUudHJhbmZvcm1lZCA9IHRydWU7XG5cdFx0XHRcdGlmICghQXJyYXkuaXNBcnJheShhcmdzKSkge1xuXHRcdFx0XHRcdGFyZ3MgPSBbYXJnc107XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcmdzO1xuXHR9XG5cblxuXHRfcHVibGlzaChwdWJsaWNhdGlvbiwgZXZlbnROYW1lLCBvcHRpb25zKSB7XG5cdFx0Y2hlY2soZXZlbnROYW1lLCBTdHJpbmcpO1xuXHRcdGNoZWNrKG9wdGlvbnMsIE1hdGNoLk9uZU9mKEJvb2xlYW4sIHtcblx0XHRcdHVzZUNvbGxlY3Rpb246IEJvb2xlYW4sXG5cdFx0XHRhcmdzOiBBcnJheSxcblx0XHR9KSk7XG5cblx0XHRsZXQgdXNlQ29sbGVjdGlvbiwgYXJncyA9IFtdO1xuXG5cdFx0aWYgKHR5cGVvZiBvcHRpb25zID09PSAnYm9vbGVhbicpIHtcblx0XHRcdHVzZUNvbGxlY3Rpb24gPSBvcHRpb25zO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAob3B0aW9ucy51c2VDb2xsZWN0aW9uKSB7XG5cdFx0XHRcdHVzZUNvbGxlY3Rpb24gPSBvcHRpb25zLnVzZUNvbGxlY3Rpb247XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvcHRpb25zLmFyZ3MpIHtcblx0XHRcdFx0YXJncyA9IG9wdGlvbnMuYXJncztcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZXZlbnROYW1lLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cHVibGljYXRpb24uc3RvcCgpO1xuXHRcdFx0dGhyb3cgbmV3IE1ldGVvci5FcnJvcignaW52YWxpZC1ldmVudC1uYW1lJyk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaXNSZWFkQWxsb3dlZChwdWJsaWNhdGlvbiwgZXZlbnROYW1lLCBhcmdzKSAhPT0gdHJ1ZSkge1xuXHRcdFx0cHVibGljYXRpb24uc3RvcCgpO1xuXHRcdFx0dGhyb3cgbmV3IE1ldGVvci5FcnJvcignbm90LWFsbG93ZWQnKTtcblx0XHR9XG5cblx0XHRjb25zdCBzdWJzY3JpcHRpb24gPSB7XG5cdFx0XHRzdWJzY3JpcHRpb246IHB1YmxpY2F0aW9uLFxuXHRcdFx0ZXZlbnROYW1lOiBldmVudE5hbWVcblx0XHR9O1xuXG5cdFx0dGhpcy5hZGRTdWJzY3JpcHRpb24oc3Vic2NyaXB0aW9uLCBldmVudE5hbWUpO1xuXG5cdFx0cHVibGljYXRpb24ub25TdG9wKCgpID0+IHtcblx0XHRcdHRoaXMucmVtb3ZlU3Vic2NyaXB0aW9uKHN1YnNjcmlwdGlvbiwgZXZlbnROYW1lKTtcblx0XHR9KTtcblxuXHRcdGlmICh1c2VDb2xsZWN0aW9uID09PSB0cnVlKSB7XG5cdFx0XHQvLyBDb2xsZWN0aW9uIGNvbXBhdGliaWxpdHlcblx0XHRcdHB1YmxpY2F0aW9uLl9zZXNzaW9uLnNlbmRBZGRlZCh0aGlzLnN1YnNjcmlwdGlvbk5hbWUsICdpZCcsIHtcblx0XHRcdFx0ZXZlbnROYW1lOiBldmVudE5hbWVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHB1YmxpY2F0aW9uLnJlYWR5KCk7XG5cdH1cblxuXHRpbmlQdWJsaWNhdGlvbigpIHtcblx0XHRjb25zdCBzdHJlYW0gPSB0aGlzO1xuXHRcdE1ldGVvci5wdWJsaXNoKHRoaXMuc3Vic2NyaXB0aW9uTmFtZSwgZnVuY3Rpb24gKC4uLmFyZ3MpIHsgcmV0dXJuIHN0cmVhbS5fcHVibGlzaC5hcHBseShzdHJlYW0sIFt0aGlzLCAuLi5hcmdzXSk7IH0pO1xuXHR9XG5cblx0aW5pdE1ldGhvZCgpIHtcblx0XHRjb25zdCBzdHJlYW0gPSB0aGlzO1xuXHRcdGNvbnN0IG1ldGhvZCA9IHt9O1xuXG5cdFx0bWV0aG9kW3RoaXMuc3Vic2NyaXB0aW9uTmFtZV0gPSBmdW5jdGlvbihldmVudE5hbWUsIC4uLmFyZ3MpIHtcblx0XHRcdGNoZWNrKGV2ZW50TmFtZSwgU3RyaW5nKTtcblx0XHRcdGNoZWNrKGFyZ3MsIEFycmF5KTtcblxuXHRcdFx0dGhpcy51bmJsb2NrKCk7XG5cblx0XHRcdGlmIChzdHJlYW0uaXNXcml0ZUFsbG93ZWQodGhpcywgZXZlbnROYW1lLCBhcmdzKSAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG1ldGhvZFNjb3BlID0ge1xuXHRcdFx0XHR1c2VySWQ6IHRoaXMudXNlcklkLFxuXHRcdFx0XHRjb25uZWN0aW9uOiB0aGlzLmNvbm5lY3Rpb24sXG5cdFx0XHRcdG9yaWdpbmFsUGFyYW1zOiBhcmdzLFxuXHRcdFx0XHR0cmFuZm9ybWVkOiBmYWxzZVxuXHRcdFx0fTtcblxuXHRcdFx0YXJncyA9IHN0cmVhbS5hcHBseVRyYW5zZm9ybWVycyhtZXRob2RTY29wZSwgZXZlbnROYW1lLCBhcmdzKTtcblxuXHRcdFx0c3RyZWFtLmVtaXRXaXRoU2NvcGUoZXZlbnROYW1lLCBtZXRob2RTY29wZSwgLi4uYXJncyk7XG5cblx0XHRcdGlmIChzdHJlYW0ucmV0cmFuc21pdCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRzdHJlYW0uX2VtaXQoZXZlbnROYW1lLCBhcmdzLCB0aGlzLmNvbm5lY3Rpb24sIHRydWUpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0TWV0ZW9yLm1ldGhvZHMobWV0aG9kKTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKGUpO1xuXHRcdH1cblx0fVxuXG5cdF9lbWl0KGV2ZW50TmFtZSwgYXJncywgb3JpZ2luLCBicm9hZGNhc3QpIHtcblx0XHRpZiAoYnJvYWRjYXN0ID09PSB0cnVlKSB7XG5cdFx0XHRNZXRlb3IuU3RyZWFtZXJDZW50cmFsLmVtaXQoJ2Jyb2FkY2FzdCcsIHRoaXMubmFtZSwgZXZlbnROYW1lLCBhcmdzKTtcblx0XHR9XG5cblx0XHRjb25zdCBzdWJzY3JpcHRpb25zID0gdGhpcy5zdWJzY3JpcHRpb25zQnlFdmVudE5hbWVbZXZlbnROYW1lXTtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoc3Vic2NyaXB0aW9ucykpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBtc2cgPSBjaGFuZ2VkUGF5bG9hZCh0aGlzLnN1YnNjcmlwdGlvbk5hbWUsICdpZCcsIHtcblx0XHRcdGV2ZW50TmFtZSxcblx0XHRcdGFyZ3Ncblx0XHR9KTtcblxuXHRcdGlmKCFtc2cpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRzdWJzY3JpcHRpb25zLmZvckVhY2goKHN1YnNjcmlwdGlvbikgPT4ge1xuXHRcdFx0aWYgKHRoaXMucmV0cmFuc21pdFRvU2VsZiA9PT0gZmFsc2UgJiYgb3JpZ2luICYmIG9yaWdpbiA9PT0gc3Vic2NyaXB0aW9uLnN1YnNjcmlwdGlvbi5jb25uZWN0aW9uKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuaXNFbWl0QWxsb3dlZChzdWJzY3JpcHRpb24uc3Vic2NyaXB0aW9uLCBldmVudE5hbWUsIC4uLmFyZ3MpKSB7XG5cdFx0XHRcdHNlbmQoc3Vic2NyaXB0aW9uLnN1YnNjcmlwdGlvbi5fc2Vzc2lvbiwgbXNnKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGVtaXQoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG5cdFx0dGhpcy5fZW1pdChldmVudE5hbWUsIGFyZ3MsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdH1cblxuXHRfX2VtaXQoLi4uYXJncykge1xuXHRcdHJldHVybiBzdXBlci5lbWl0KC4uLmFyZ3MpO1xuXHR9XG5cblx0ZW1pdFdpdGhvdXRCcm9hZGNhc3QoZXZlbnROYW1lLCAuLi5hcmdzKSB7XG5cdFx0dGhpcy5fZW1pdChldmVudE5hbWUsIGFyZ3MsIHVuZGVmaW5lZCwgZmFsc2UpO1xuXHR9XG59O1xuIl19
