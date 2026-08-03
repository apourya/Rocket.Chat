Package["core-runtime"].queue("dispatch:run-as-user",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var check = Package.check.check;
var Match = Package.check.Match;
var _ = Package.underscore._;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var LocalCollection = Package.minimongo.LocalCollection;
var Minimongo = Package.minimongo.Minimongo;

/* Package-scope variables */
var DDPCommon;

(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/dispatch_run-as-user/lib/pre.1.0.3.js                                                                 //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
// This code will go away in later versions of Meteor, this is just a "polyfill"
// until the next release of Meteor maybe 1.0.3?
//
if (typeof DDPCommon === 'undefined') {
	DDPCommon = {};

	DDPCommon.MethodInvocation = function (options) {
		var self = this;

		// true if we're running not the actual method, but a stub (that is,
		// if we're on a client (which may be a browser, or in the future a
		// server connecting to another server) and presently running a
		// simulation of a server-side method for latency compensation
		// purposes). not currently true except in a client such as a browser,
		// since there's usually no point in running stubs unless you have a
		// zero-latency connection to the user.

		/**
		 * @summary Access inside a method invocation.  Boolean value, true if this invocation is a stub.
		 * @locus Anywhere
		 * @name  isSimulation
		 * @memberOf MethodInvocation
		 * @instance
		 * @type {Boolean}
		 */
		this.isSimulation = options.isSimulation;

		// call this function to allow other method invocations (from the
		// same client) to continue running without waiting for this one to
		// complete.
		this._unblock = options.unblock || function () {};
		this._calledUnblock = false;

		// current user id

		/**
		 * @summary The id of the user that made this method call, or `null` if no user was logged in.
		 * @locus Anywhere
		 * @name  userId
		 * @memberOf MethodInvocation
		 * @instance
		 */
		this.userId = options.userId;

		// sets current user id in all appropriate server contexts and
		// reruns subscriptions
		this._setUserId = options.setUserId || function () {};

		// On the server, the connection this method call came in on.

		/**
		 * @summary Access inside a method invocation. The [connection](#meteor_onconnection) that this method was received on. `null` if the method is not associated with a connection, eg. a server initiated method call.
		 * @locus Server
		 * @name  connection
		 * @memberOf MethodInvocation
		 * @instance
		 */
		this.connection = options.connection;

		// The seed for randomStream value generation
		this.randomSeed = options.randomSeed;

		// This is set by RandomStream.get; and holds the random stream state
		this.randomStream = null;
	};

	_.extend(DDPCommon.MethodInvocation.prototype, {
		/**
		 * @summary Call inside a method invocation.  Allow subsequent method from this client to begin running in a new fiber.
		 * @locus Server
		 * @memberOf MethodInvocation
		 * @instance
		 */
		unblock: function () {
			var self = this;
			self._calledUnblock = true;
			self._unblock();
		},

		/**
		 * @summary Set the logged in user.
		 * @locus Server
		 * @memberOf MethodInvocation
		 * @instance
		 * @param {String | null} userId The value that should be returned by `userId` on this connection.
		 */
		setUserId: function (userId) {
			var self = this;
			if (self._calledUnblock) throw new Error("Can't call setUserId in a method after calling unblock");
			self.userId = userId;
			// self._setUserId(userId);
		},
	});
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/dispatch_run-as-user/lib/common.js                                                                    //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
// This file adds the actual "Meteor.runAsUser" and "Meteor.isRestricted" api
//
// It's done by using a DDP method invocation, setting a user id and a
// "isRestricted" flag on it.
//
// If run inside of an existing DDP invocation a nested version will be created.

var restrictedMode = new Meteor.EnvironmentVariable();

/**
 * Returns true if inside a runAsUser user scope
 * @return {Boolean} True if in a runAsUser user scope
 */
Meteor.isRestricted = function () {
	return !!restrictedMode.get();
};

/**
 * Run code restricted
 * @param  {Function} f Code to run in restricted mode
 * @return {Any}   Result of code running
 */
Meteor.runRestricted = function (f) {
	if (Meteor.isRestricted()) {
		return f();
	} else {
		return restrictedMode.withValue(true, f);
	}
};

/**
 * Run code unrestricted
 * @param  {Function} f Code to run in restricted mode
 * @return {Any}   Result of code running
 */
Meteor.runUnrestricted = function (f) {
	if (Meteor.isRestricted()) {
		return restrictedMode.withValue(false, f);
	} else {
		f();
	}
};

/**
 * Run as a user
 * @param  {String} userId The id of user to run as
 * @param  {Function} f      Function to run as user
 * @return {Any} Returns function result
 */
Meteor.runAsUser = function (userId, f) {
	var currentInvocation = DDP._CurrentInvocation.get();

	// Create a new method invocation
	var invocation = new DDPCommon.MethodInvocation(
		currentInvocation
			? currentInvocation
			: {
					connection: null,
			  },
	);

	// Now run as user on this invocation
	invocation.setUserId(userId);

	return DDP._CurrentInvocation.withValue(invocation, function () {
		return f.apply(invocation, [userId]);
	});
};

/**
 * Run as restricted user
 * @param  {Function} f Function to run unrestricted
 * @return {Any}   Returns function result
 */
Meteor.runAsRestrictedUser = function (userId, f) {
	return Meteor.runRestricted(function () {
		return Meteor.runAsUser(userId, f);
	});
};

var adminMode = new Meteor.EnvironmentVariable();

/**
 * Check if code is running isside an invocation / method
 */
Meteor.isAdmin = function () {
	return !!adminMode.get();
};

/**
 * Make the function run outside invocation
 */
Meteor.runAsAdmin = function (f) {
	if (Meteor.isAdmin()) {
		return f();
	} else {
		return adminMode.withValue(false, f);
	}
};

/**
 * Make sure code runs outside an invocation on the
 * server
 */
Meteor.runOutsideInvocation = function (f) {
	if (Meteor.isServer && DDP._CurrentInvocation.get()) {
		DDP._CurrentInvocation.withValue(null, f);
	} else {
		f();
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                //
// packages/dispatch_run-as-user/lib/collection.overwrites.js                                                     //
//                                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                  //
// TODO: Remove this after meteor fixes the issue
// This override fixes a recent issue introduced after the update to Meteor 3.0
// MinimongoCollection.remove(query) where `query` has `_id: { $in: Array }` removes only the first found record.
LocalCollection.prototype['_eachPossiblyMatchingDocAsync'] =  async function (selector, fn) {
    const specificIds = LocalCollection._idsMatchedBySelector(selector);

    if (specificIds) {
      for (const id of specificIds) {
        const doc = this._docs.get(id);

        if (doc && (await fn(doc, id)) === false) { // Changed from `!fn(doc,id)`
          break
        }
      }
    } else {
      await this._docs.forEachAsync(fn);
    }
  }

  LocalCollection.prototype['_eachPossiblyMatchingDocSync'] = function (selector, fn) {
    const specificIds = LocalCollection._idsMatchedBySelector(selector);

    if (specificIds) {
      for (const id of specificIds) {
        const doc = this._docs.get(id);

        if (doc && fn(doc, id) === false) { // Changed from `!fn(doc,id)`
          break
        }
      }
    } else {
      this._docs.forEach(fn);
    }
  }

// This file overwrites the default metoer Mongo.Collection modifiers: "insert",
// "update", "remove"
//
// The new methods are checking if Meteor is in "restricted" mode to apply
// allow and deny rules if needed.
//
// This will allow us to run the modifiers inside of a "Meteor.runAsUser" with
// security checks.
_.each(['insert', 'update', 'remove'], function (method) {
	var _super = Mongo.Collection.prototype[method];

	Mongo.Collection.prototype[method] = function (/* arguments */) {
		var self = this;
		var args = _.toArray(arguments);

		// Check if this method is run in restricted mode and collection is
		// restricted.
		if (Meteor.isRestricted() && self._restricted) {
			var generatedId = null;
			if (method === 'insert' && !_.has(args[0], '_id')) {
				generatedId = self._makeNewID();
			}

			// short circuit if there is no way it will pass.
			if (self._validators[method].allow.length === 0) {
				throw new Meteor.Error(403, 'Access denied. No allow validators set on restricted ' + "collection for method '" + method + "'.");
			}

			var validatedMethodName = '_validated' + method.charAt(0).toUpperCase() + method.slice(1);
			args.unshift(Meteor.userId());

			if (method === 'insert') {
				args.push(generatedId);

				self[validatedMethodName].apply(self, args);
				// xxx: for now we return the id since self._validatedInsert doesn't
				// yet return the new id
				return generatedId || args[0]._id;
			}

			return self[validatedMethodName].apply(self, args);
		}

		return _super.apply(self, args);
	};
});



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
return {

}});
