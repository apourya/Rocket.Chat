Package["core-runtime"].queue("accounts-password",function () {/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var EmitterPromise = Package.meteor.EmitterPromise;
var Accounts = Package['accounts-base'].Accounts;
var SHA256 = Package.sha.SHA256;
var EJSON = Package.ejson.EJSON;
var DDP = Package['ddp-client'].DDP;
var DDPServer = Package['ddp-server'].DDPServer;
var Email = Package.email.Email;
var EmailInternals = Package.email.EmailInternals;
var Random = Package.random.Random;
var check = Package.check.check;
var Match = Package.check.Match;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

var require = meteorInstall({"node_modules":{"meteor":{"accounts-password":{"email_templates.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-password/email_templates.js                                                                    //
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
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    const greet = welcomeMsg => (user, url) => {
      const greeting = user.profile && user.profile.name ? "Hello ".concat(user.profile.name, ",") : 'Hello,';
      return "".concat(greeting, "\n\n").concat(welcomeMsg, ", simply click the link below.\n\n").concat(url, "\n\nThank you.\n");
    };

    /**
     * @summary Options to customize emails sent from the Accounts system.
     * @locus Server
     * @importFromPackage accounts-base
     */
    Accounts.emailTemplates = _objectSpread(_objectSpread({}, Accounts.emailTemplates || {}), {}, {
      from: 'Accounts Example <no-reply@example.com>',
      siteName: Meteor.absoluteUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),
      resetPassword: {
        subject: () => "How to reset your password on ".concat(Accounts.emailTemplates.siteName),
        text: greet('To reset your password')
      },
      verifyEmail: {
        subject: () => "How to verify email address on ".concat(Accounts.emailTemplates.siteName),
        text: greet('To verify your account email')
      },
      enrollAccount: {
        subject: () => "An account has been created for you on ".concat(Accounts.emailTemplates.siteName),
        text: greet('To start using the service')
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"password_server.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/accounts-password/password_server.js                                                                    //
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
    let argon2;
    module.link("argon2", {
      default(v) {
        argon2 = v;
      }
    }, 0);
    let bcryptHash, bcryptCompare;
    module.link("bcrypt", {
      hash(v) {
        bcryptHash = v;
      },
      compare(v) {
        bcryptCompare = v;
      }
    }, 1);
    let Accounts;
    module.link("meteor/accounts-base", {
      Accounts(v) {
        Accounts = v;
      }
    }, 2);
    if (__reifyWaitForDeps__()) (await __reifyWaitForDeps__())();
    // Utility for grabbing user
    const getUserById = async (id, options) => await Meteor.users.findOneAsync(id, Accounts._addDefaultFieldSelector(options));

    // User records have two fields that are used for password-based login:
    // - 'services.password.bcrypt', which stores the bcrypt password, which will be deprecated
    // - 'services.password.argon2', which stores the argon2 password
    //
    // When the client sends a password to the server, it can either be a
    // string (the plaintext password) or an object with keys 'digest' and
    // 'algorithm' (must be "sha-256" for now). The Meteor client always sends
    // password objects { digest: *, algorithm: "sha-256" }, but DDP clients
    // that don't have access to SHA can just send plaintext passwords as
    // strings.
    //
    // When the server receives a plaintext password as a string, it always
    // hashes it with SHA256 before passing it into bcrypt / argon2. When the server
    // receives a password as an object, it asserts that the algorithm is
    // "sha-256" and then passes the digest to bcrypt / argon2.

    Accounts._bcryptRounds = () => Accounts._options.bcryptRounds || 10;
    Accounts._argon2Enabled = () => Accounts._options.argon2Enabled || false;
    const ARGON2_TYPES = {
      argon2i: argon2.argon2i,
      argon2d: argon2.argon2d,
      argon2id: argon2.argon2id
    };
    Accounts._argon2Type = () => ARGON2_TYPES[Accounts._options.argon2Type] || argon2.argon2id;
    Accounts._argon2TimeCost = () => Accounts._options.argon2TimeCost || 2;
    Accounts._argon2MemoryCost = () => Accounts._options.argon2MemoryCost || 19456;
    Accounts._argon2Parallelism = () => Accounts._options.argon2Parallelism || 1;

    /**
     * Extracts the string to be encrypted using bcrypt or Argon2 from the given `password`.
     *
     * @param {string|Object} password - The password provided by the client. It can be:
     *  - A plaintext string password.
     *  - An object with the following properties:
     *      @property {string} digest - The hashed password.
     *      @property {string} algorithm - The hashing algorithm used. Must be "sha-256".
     *
     * @returns {string} - The resulting password string to encrypt.
     *
     * @throws {Error} - If the `algorithm` in the password object is not "sha-256".
     */
    const getPasswordString = password => {
      if (typeof password === "string") {
        password = SHA256(password);
      } else {
        // 'password' is an object
        if (password.algorithm !== "sha-256") {
          throw new Error("Invalid password hash algorithm. " + "Only 'sha-256' is allowed.");
        }
        password = password.digest;
      }
      return password;
    };

    /**
     * Encrypt the given `password` using either bcrypt or Argon2.
     * @param password can be a string (in which case it will be run through SHA256 before encryption) or an object with properties `digest` and `algorithm` (in which case we bcrypt or Argon2 `password.digest`).
     * @returns {Promise<string>} The encrypted password.
     */
    const hashPassword = async password => {
      password = getPasswordString(password);
      if (Accounts._argon2Enabled() === true) {
        return await argon2.hash(password, {
          type: Accounts._argon2Type(),
          timeCost: Accounts._argon2TimeCost(),
          memoryCost: Accounts._argon2MemoryCost(),
          parallelism: Accounts._argon2Parallelism()
        });
      } else {
        return await bcryptHash(password, Accounts._bcryptRounds());
      }
    };

    // Extract the number of rounds used in the specified bcrypt hash.
    const getRoundsFromBcryptHash = hash => {
      let rounds;
      if (hash) {
        const hashSegments = hash.split("$");
        if (hashSegments.length > 2) {
          rounds = parseInt(hashSegments[2], 10);
        }
      }
      return rounds;
    };
    Accounts._getRoundsFromBcryptHash = getRoundsFromBcryptHash;

    /**
     * Extract readable parameters from an Argon2 hash string.
     * @param {string} hash - The Argon2 hash string.
     * @returns {object} An object containing the parsed parameters.
     * @throws {Error} If the hash format is invalid.
     */
    function getArgon2Params(hash) {
      const regex = /^\$(argon2(?:i|d|id))\$v=\d+\$m=(\d+),t=(\d+),p=(\d+)/;
      const match = hash.match(regex);
      if (!match) {
        throw new Error("Invalid Argon2 hash format.");
      }
      const [, type, memoryCost, timeCost, parallelism] = match;
      return {
        type: ARGON2_TYPES[type],
        timeCost: parseInt(timeCost, 10),
        memoryCost: parseInt(memoryCost, 10),
        parallelism: parseInt(parallelism, 10)
      };
    }
    Accounts._getArgon2Params = getArgon2Params;
    const getUserPasswordHash = user => {
      var _user$services, _user$services$passwo, _user$services2, _user$services2$passw;
      return ((_user$services = user.services) === null || _user$services === void 0 ? void 0 : (_user$services$passwo = _user$services.password) === null || _user$services$passwo === void 0 ? void 0 : _user$services$passwo.argon2) || ((_user$services2 = user.services) === null || _user$services2 === void 0 ? void 0 : (_user$services2$passw = _user$services2.password) === null || _user$services2$passw === void 0 ? void 0 : _user$services2$passw.bcrypt);
    };
    Accounts._checkPasswordUserFields = {
      _id: 1,
      services: 1
    };
    const isBcrypt = hash => {
      // bcrypt hashes start with $2a$ or $2b$
      return hash.startsWith("$2");
    };
    const isArgon = hash => {
      // argon2 hashes start with $argon2i$, $argon2d$ or $argon2id$
      return hash.startsWith("$argon2");
    };
    const updateUserPasswordDefered = (user, formattedPassword) => {
      Meteor.defer(async () => {
        await updateUserPassword(user, formattedPassword);
      });
    };

    /**
     * Hashes the provided password and returns an object that can be used to update the user's password.
     * @param formattedPassword
     * @returns {Promise<{$set: {"services.password.bcrypt": string}}|{$unset: {"services.password.bcrypt": number}, $set: {"services.password.argon2": string}}>}
     */
    const getUpdatorForUserPassword = async formattedPassword => {
      const encryptedPassword = await hashPassword(formattedPassword);
      if (Accounts._argon2Enabled() === false) {
        return {
          $set: {
            "services.password.bcrypt": encryptedPassword
          },
          $unset: {
            "services.password.argon2": 1
          }
        };
      } else if (Accounts._argon2Enabled() === true) {
        return {
          $set: {
            "services.password.argon2": encryptedPassword
          },
          $unset: {
            "services.password.bcrypt": 1
          }
        };
      }
    };
    const updateUserPassword = async (user, formattedPassword) => {
      const updator = await getUpdatorForUserPassword(formattedPassword);
      await Meteor.users.updateAsync({
        _id: user._id
      }, updator);
    };

    /**
     * Checks whether the provided password matches the hashed password stored in the user's database record.
     *
     * @param {Object} user - The user object containing at least:
     *   @property {string} _id - The user's unique identifier.
     *   @property {Object} services - The user's services data.
     *   @property {Object} services.password - The user's password object.
     *   @property {string} [services.password.argon2] - The Argon2 hashed password.
     *   @property {string} [services.password.bcrypt] - The bcrypt hashed password, deprecated
     *
     * @param {string|Object} password - The password provided by the client. It can be:
     *   - A plaintext string password.
     *   - An object with the following properties:
     *       @property {string} digest - The hashed password.
     *       @property {string} algorithm - The hashing algorithm used. Must be "sha-256".
     *
     * @returns {Promise<Object>} - A result object with the following properties:
     *   @property {string} userId - The user's unique identifier.
     *   @property {Object} [error] - An error object if the password does not match or an error occurs.
     *
     * @throws {Error} - If an unexpected error occurs during the process.
     */
    const checkPasswordAsync = async (user, password) => {
      const result = {
        userId: user._id
      };
      const formattedPassword = getPasswordString(password);
      const hash = getUserPasswordHash(user);
      const argon2Enabled = Accounts._argon2Enabled();
      if (argon2Enabled === false) {
        if (isArgon(hash)) {
          // this is a rollback feature, enabling to switch back from argon2 to bcrypt if needed
          // TODO : deprecate this
          console.warn("User has an argon2 password and argon2 is not enabled, rolling back to bcrypt encryption");
          const match = await argon2.verify(hash, formattedPassword);
          if (!match) {
            result.error = Accounts._handleError("Incorrect password", false);
          } else {
            // The password checks out, but the user's stored password needs to be updated to argon2
            updateUserPasswordDefered(user, {
              digest: formattedPassword,
              algorithm: "sha-256"
            });
          }
        } else {
          const hashRounds = getRoundsFromBcryptHash(hash);
          const match = await bcryptCompare(formattedPassword, hash);
          if (!match) {
            result.error = Accounts._handleError("Incorrect password", false);
          } else if (hash) {
            const paramsChanged = hashRounds !== Accounts._bcryptRounds();
            // The password checks out, but the user's bcrypt hash needs to be updated
            // to match current bcrypt settings
            if (paramsChanged === true) {
              updateUserPasswordDefered(user, {
                digest: formattedPassword,
                algorithm: "sha-256"
              });
            }
          }
        }
      } else if (argon2Enabled === true) {
        if (isBcrypt(hash)) {
          // migration code from bcrypt to argon2
          const match = await bcryptCompare(formattedPassword, hash);
          if (!match) {
            result.error = Accounts._handleError("Incorrect password", false);
          } else {
            // The password checks out, but the user's stored password needs to be updated to argon2
            updateUserPasswordDefered(user, {
              digest: formattedPassword,
              algorithm: "sha-256"
            });
          }
        } else {
          // argon2 password
          const argon2Params = getArgon2Params(hash);
          const match = await argon2.verify(hash, formattedPassword);
          if (!match) {
            result.error = Accounts._handleError("Incorrect password", false);
          } else if (hash) {
            const paramsChanged = argon2Params.memoryCost !== Accounts._argon2MemoryCost() || argon2Params.timeCost !== Accounts._argon2TimeCost() || argon2Params.parallelism !== Accounts._argon2Parallelism() || argon2Params.type !== Accounts._argon2Type();
            if (paramsChanged === true) {
              // The password checks out, but the user's argon2 hash needs to be updated with the right params
              updateUserPasswordDefered(user, {
                digest: formattedPassword,
                algorithm: "sha-256"
              });
            }
          }
        }
      }
      return result;
    };
    Accounts._checkPasswordAsync = checkPasswordAsync;

    ///
    /// LOGIN
    ///

    /**
     * @summary Finds the user asynchronously with the specified username.
     * First tries to match username case sensitively; if that fails, it
     * tries case insensitively; but if more than one user matches the case
     * insensitive search, it returns null.
     * @locus Server
     * @param {String} username The username to look for
     * @param {Object} [options]
     * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
     * @returns {Promise<Object>} A user if found, else null
     * @importFromPackage accounts-base
     */
    Accounts.findUserByUsername = async (username, options) => await Accounts._findUserByQuery({
      username
    }, options);

    /**
     * @summary Finds the user asynchronously with the specified email.
     * First tries to match email case sensitively; if that fails, it
     * tries case insensitively; but if more than one user matches the case
     * insensitive search, it returns null.
     * @locus Server
     * @param {String} email The email address to look for
     * @param {Object} [options]
     * @param {MongoFieldSpecifier} options.fields Dictionary of fields to return or exclude.
     * @returns {Promise<Object>} A user if found, else null
     * @importFromPackage accounts-base
     */
    Accounts.findUserByEmail = async (email, options) => await Accounts._findUserByQuery({
      email
    }, options);

    // XXX maybe this belongs in the check package
    const NonEmptyString = Match.Where(x => {
      check(x, String);
      return x.length > 0;
    });
    const passwordValidator = Match.OneOf(Match.Where(str => {
      var _Meteor$settings, _Meteor$settings$pack, _Meteor$settings$pack2;
      return Match.test(str, String) && str.length <= ((_Meteor$settings = Meteor.settings) === null || _Meteor$settings === void 0 ? void 0 : (_Meteor$settings$pack = _Meteor$settings.packages) === null || _Meteor$settings$pack === void 0 ? void 0 : (_Meteor$settings$pack2 = _Meteor$settings$pack.accounts) === null || _Meteor$settings$pack2 === void 0 ? void 0 : _Meteor$settings$pack2.passwordMaxLength) || 256;
    }), {
      digest: Match.Where(str => Match.test(str, String) && str.length === 64),
      algorithm: Match.OneOf('sha-256')
    });

    // Handler to login with a password.
    //
    // The Meteor client sets options.password to an object with keys
    // 'digest' (set to SHA256(password)) and 'algorithm' ("sha-256").
    //
    // For other DDP clients which don't have access to SHA, the handler
    // also accepts the plaintext password in options.password as a string.
    //
    // (It might be nice if servers could turn the plaintext password
    // option off. Or maybe it should be opt-in, not opt-out?
    // Accounts.config option?)
    //
    // Note that neither password option is secure without SSL.
    //
    Accounts.registerLoginHandler("password", async options => {
      var _Accounts$_check2faEn, _Accounts;
      if (!options.password) return undefined; // don't handle

      check(options, {
        user: Accounts._userQueryValidator,
        password: passwordValidator,
        code: Match.Optional(NonEmptyString)
      });
      const user = await Accounts._findUserByQuery(options.user, {
        fields: _objectSpread({
          services: 1
        }, Accounts._checkPasswordUserFields)
      });
      if (!user) {
        Accounts._handleError("User not found");
      }
      if (!getUserPasswordHash(user)) {
        Accounts._handleError("User has no password set");
      }
      const result = await checkPasswordAsync(user, options.password);
      // This method is added by the package accounts-2fa
      // First the login is validated, then the code situation is checked
      if (!result.error && (_Accounts$_check2faEn = (_Accounts = Accounts)._check2faEnabled) !== null && _Accounts$_check2faEn !== void 0 && _Accounts$_check2faEn.call(_Accounts, user)) {
        if (!options.code) {
          Accounts._handleError('2FA code must be informed', true, 'no-2fa-code');
        }
        if (!Accounts._isTokenValid(user.services.twoFactorAuthentication.secret, options.code)) {
          Accounts._handleError('Invalid 2FA code', true, 'invalid-2fa-code');
        }
      }
      return result;
    });

    ///
    /// CHANGING
    ///

    /**
     * @summary Change a user's username asynchronously. Use this instead of updating the
     * database directly. The operation will fail if there is an existing user
     * with a username only differing in case.
     * @locus Server
     * @param {String} userId The ID of the user to update.
     * @param {String} newUsername A new username for the user.
     * @importFromPackage accounts-base
     */
    Accounts.setUsername = async (userId, newUsername) => {
      check(userId, NonEmptyString);
      check(newUsername, NonEmptyString);
      const user = await getUserById(userId, {
        fields: {
          username: 1
        }
      });
      if (!user) {
        Accounts._handleError("User not found");
      }
      const oldUsername = user.username;

      // Perform a case insensitive check for duplicates before update
      await Accounts._checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);
      await Meteor.users.updateAsync({
        _id: user._id
      }, {
        $set: {
          username: newUsername
        }
      });

      // Perform another check after update, in case a matching user has been
      // inserted in the meantime
      try {
        await Accounts._checkForCaseInsensitiveDuplicates('username', 'Username', newUsername, user._id);
      } catch (ex) {
        // Undo update if the check fails
        await Meteor.users.updateAsync({
          _id: user._id
        }, {
          $set: {
            username: oldUsername
          }
        });
        throw ex;
      }
    };

    // Let the user change their own password if they know the old
    // password. `oldPassword` and `newPassword` should be objects with keys
    // `digest` and `algorithm` (representing the SHA256 of the password).
    Meteor.methods({
      changePassword: async function (oldPassword, newPassword) {
        check(oldPassword, passwordValidator);
        check(newPassword, passwordValidator);
        if (!this.userId) {
          throw new Meteor.Error(401, "Must be logged in");
        }
        const user = await getUserById(this.userId, {
          fields: _objectSpread({
            services: 1
          }, Accounts._checkPasswordUserFields)
        });
        if (!user) {
          Accounts._handleError("User not found");
        }
        if (!getUserPasswordHash(user)) {
          Accounts._handleError("User has no password set");
        }
        const result = await checkPasswordAsync(user, oldPassword);
        if (result.error) {
          throw result.error;
        }

        // It would be better if this removed ALL existing tokens and replaced
        // the token for the current connection with a new one, but that would
        // be tricky, so we'll settle for just replacing all tokens other than
        // the one for the current connection.
        const currentToken = Accounts._getLoginToken(this.connection.id);
        const updator = await getUpdatorForUserPassword(newPassword);
        await Meteor.users.updateAsync({
          _id: this.userId
        }, {
          $set: updator.$set,
          $pull: {
            "services.resume.loginTokens": {
              hashedToken: {
                $ne: currentToken
              }
            }
          },
          $unset: _objectSpread({
            "services.password.reset": 1
          }, updator.$unset)
        });
        return {
          passwordChanged: true
        };
      }
    });

    // Force change the users password.

    /**
     * @summary Forcibly change the password for a user.
     * @locus Server
     * @param {String} userId The id of the user to update.
     * @param {String} newPlaintextPassword A new password for the user.
     * @param {Object} [options]
     * @param {Object} options.logout Logout all current connections with this userId (default: true)
     * @importFromPackage accounts-base
     */
    Accounts.setPasswordAsync = async (userId, newPlaintextPassword, options) => {
      check(userId, String);
      check(newPlaintextPassword, Match.Where(str => {
        var _Meteor$settings2, _Meteor$settings2$pac, _Meteor$settings2$pac2;
        return Match.test(str, String) && str.length <= ((_Meteor$settings2 = Meteor.settings) === null || _Meteor$settings2 === void 0 ? void 0 : (_Meteor$settings2$pac = _Meteor$settings2.packages) === null || _Meteor$settings2$pac === void 0 ? void 0 : (_Meteor$settings2$pac2 = _Meteor$settings2$pac.accounts) === null || _Meteor$settings2$pac2 === void 0 ? void 0 : _Meteor$settings2$pac2.passwordMaxLength) || 256;
      }));
      check(options, Match.Maybe({
        logout: Boolean
      }));
      options = _objectSpread({
        logout: true
      }, options);
      const user = await getUserById(userId, {
        fields: {
          _id: 1
        }
      });
      if (!user) {
        throw new Meteor.Error(403, "User not found");
      }
      let updator = await getUpdatorForUserPassword(newPlaintextPassword);
      updator.$unset = updator.$unset || {};
      updator.$unset["services.password.reset"] = 1;
      if (options.logout) {
        updator.$unset["services.resume.loginTokens"] = 1;
      }
      await Meteor.users.updateAsync({
        _id: user._id
      }, updator);
    };

    ///
    /// RESETTING VIA EMAIL
    ///

    // Utility for plucking addresses from emails
    const pluckAddresses = function () {
      let emails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      return emails.map(email => email.address);
    };

    // Method called by a user to request a password reset email. This is
    // the start of the reset process.
    Meteor.methods({
      forgotPassword: async options => {
        check(options, {
          email: String
        });
        const user = await Accounts.findUserByEmail(options.email, {
          fields: {
            emails: 1
          }
        });
        if (!user) {
          Accounts._handleError("User not found");
        }
        const emails = pluckAddresses(user.emails);
        const caseSensitiveEmail = emails.find(email => email.toLowerCase() === options.email.toLowerCase());
        await Accounts.sendResetPasswordEmail(user._id, caseSensitiveEmail);
      }
    });

    /**
     * @summary Asynchronously generates a reset token and saves it into the database.
     * @locus Server
     * @param {String} userId The id of the user to generate the reset token for.
     * @param {String} email Which address of the user to generate the reset token for. This address must be in the user's `emails` list. If `null`, defaults to the first email in the list.
     * @param {String} reason `resetPassword` or `enrollAccount`.
     * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
     * @returns {Promise<Object>} Promise of an object with {email, user, token} values.
     * @importFromPackage accounts-base
     */
    Accounts.generateResetToken = async (userId, email, reason, extraTokenData) => {
      // Make sure the user exists, and email is one of their addresses.
      // Don't limit the fields in the user object since the user is returned
      // by the function and some other fields might be used elsewhere.
      const user = await getUserById(userId);
      if (!user) {
        Accounts._handleError("Can't find user");
      }

      // pick the first email if we weren't passed an email.
      if (!email && user.emails && user.emails[0]) {
        email = user.emails[0].address;
      }

      // make sure we have a valid email
      if (!email || !pluckAddresses(user.emails).includes(email)) {
        Accounts._handleError("No such email for user.");
      }
      const token = Random.secret();
      const tokenRecord = {
        token,
        email,
        when: new Date()
      };
      if (reason === 'resetPassword') {
        tokenRecord.reason = 'reset';
      } else if (reason === 'enrollAccount') {
        tokenRecord.reason = 'enroll';
      } else if (reason) {
        // fallback so that this function can be used for unknown reasons as well
        tokenRecord.reason = reason;
      }
      if (extraTokenData) {
        Object.assign(tokenRecord, extraTokenData);
      }
      // if this method is called from the enroll account work-flow then
      // store the token record in 'services.password.enroll' db field
      // else store the token record in in 'services.password.reset' db field
      if (reason === "enrollAccount") {
        await Meteor.users.updateAsync({
          _id: user._id
        }, {
          $set: {
            "services.password.enroll": tokenRecord
          }
        });
        // before passing to template, update user object with new token
        Meteor._ensure(user, "services", "password").enroll = tokenRecord;
      } else {
        await Meteor.users.updateAsync({
          _id: user._id
        }, {
          $set: {
            "services.password.reset": tokenRecord
          }
        });
        // before passing to template, update user object with new token
        Meteor._ensure(user, "services", "password").reset = tokenRecord;
      }
      return {
        email,
        user,
        token
      };
    };

    /**
     * @summary Generates asynchronously an e-mail verification token and saves it into the database.
     * @locus Server
     * @param {String} userId The id of the user to generate the  e-mail verification token for.
     * @param {String} email Which address of the user to generate the e-mail verification token for. This address must be in the user's `emails` list. If `null`, defaults to the first unverified email in the list.
     * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
     * @returns {Promise<Object>} Promise of an object with {email, user, token} values.
     * @importFromPackage accounts-base
     */
    Accounts.generateVerificationToken = async (userId, email, extraTokenData) => {
      // Make sure the user exists, and email is one of their addresses.
      // Don't limit the fields in the user object since the user is returned
      // by the function and some other fields might be used elsewhere.
      const user = await getUserById(userId);
      if (!user) {
        Accounts._handleError("Can't find user");
      }

      // pick the first unverified email if we weren't passed an email.
      if (!email) {
        const emailRecord = (user.emails || []).find(e => !e.verified);
        email = (emailRecord || {}).address;
        if (!email) {
          Accounts._handleError("That user has no unverified email addresses.");
        }
      }

      // make sure we have a valid email
      if (!email || !pluckAddresses(user.emails).includes(email)) {
        Accounts._handleError("No such email for user.");
      }
      const token = Random.secret();
      const tokenRecord = {
        token,
        // TODO: This should probably be renamed to "email" to match reset token record.
        address: email,
        when: new Date()
      };
      if (extraTokenData) {
        Object.assign(tokenRecord, extraTokenData);
      }
      await Meteor.users.updateAsync({
        _id: user._id
      }, {
        $push: {
          'services.email.verificationTokens': tokenRecord
        }
      });

      // before passing to template, update user object with new token
      Meteor._ensure(user, 'services', 'email');
      if (!user.services.email.verificationTokens) {
        user.services.email.verificationTokens = [];
      }
      user.services.email.verificationTokens.push(tokenRecord);
      return {
        email,
        user,
        token
      };
    };

    // send the user an email with a link that when opened allows the user
    // to set a new password, without the old password.

    /**
     * @summary Send an email asynchronously with a link the user can use to reset their password.
     * @locus Server
     * @param {String} userId The id of the user to send email to.
     * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
     * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
     * @param {Object} [extraParams] Optional additional params to be added to the reset url.
     * @returns {Promise<Object>} Promise of an object with {email, user, token, url, options} values.
     * @importFromPackage accounts-base
     */
    Accounts.sendResetPasswordEmail = async (userId, email, extraTokenData, extraParams) => {
      const {
        email: realEmail,
        user,
        token
      } = await Accounts.generateResetToken(userId, email, 'resetPassword', extraTokenData);
      const url = Accounts.urls.resetPassword(token, extraParams);
      const options = await Accounts.generateOptionsForEmail(realEmail, user, url, 'resetPassword');
      await Email.sendAsync(options);
      if (Meteor.isDevelopment && !Meteor.isPackageTest) {
        console.log("\nReset password URL: ".concat(url));
      }
      return {
        email: realEmail,
        user,
        token,
        url,
        options
      };
    };

    // send the user an email informing them that their account was created, with
    // a link that when opened both marks their email as verified and forces them
    // to choose their password. The email must be one of the addresses in the
    // user's emails field, or undefined to pick the first email automatically.
    //
    // This is not called automatically. It must be called manually if you
    // want to use enrollment emails.

    /**
     * @summary Send an email asynchronously with a link the user can use to set their initial password.
     * @locus Server
     * @param {String} userId The id of the user to send email to.
     * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first email in the list.
     * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
     * @param {Object} [extraParams] Optional additional params to be added to the enrollment url.
     * @returns {Promise<Object>} Promise of an object {email, user, token, url, options} values.
     * @importFromPackage accounts-base
     */
    Accounts.sendEnrollmentEmail = async (userId, email, extraTokenData, extraParams) => {
      const {
        email: realEmail,
        user,
        token
      } = await Accounts.generateResetToken(userId, email, 'enrollAccount', extraTokenData);
      const url = Accounts.urls.enrollAccount(token, extraParams);
      const options = await Accounts.generateOptionsForEmail(realEmail, user, url, 'enrollAccount');
      await Email.sendAsync(options);
      if (Meteor.isDevelopment && !Meteor.isPackageTest) {
        console.log("\nEnrollment email URL: ".concat(url));
      }
      return {
        email: realEmail,
        user,
        token,
        url,
        options
      };
    };

    // Take token from sendResetPasswordEmail or sendEnrollmentEmail, change
    // the users password, and log them in.
    Meteor.methods({
      resetPassword: async function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const token = args[0];
        const newPassword = args[1];
        return await Accounts._loginMethod(this, "resetPassword", args, "password", async () => {
          var _Accounts$_check2faEn2, _Accounts2;
          check(token, String);
          check(newPassword, passwordValidator);
          let user = await Meteor.users.findOneAsync({
            "services.password.reset.token": token
          }, {
            fields: {
              services: 1,
              emails: 1
            }
          });
          let isEnroll = false;
          // if token is in services.password.reset db field implies
          // this method is was not called from enroll account workflow
          // else this method is called from enroll account workflow
          if (!user) {
            user = await Meteor.users.findOneAsync({
              "services.password.enroll.token": token
            }, {
              fields: {
                services: 1,
                emails: 1
              }
            });
            isEnroll = true;
          }
          if (!user) {
            throw new Meteor.Error(403, "Token expired");
          }
          let tokenRecord = {};
          if (isEnroll) {
            tokenRecord = user.services.password.enroll;
          } else {
            tokenRecord = user.services.password.reset;
          }
          const {
            when,
            email
          } = tokenRecord;
          let tokenLifetimeMs = Accounts._getPasswordResetTokenLifetimeMs();
          if (isEnroll) {
            tokenLifetimeMs = Accounts._getPasswordEnrollTokenLifetimeMs();
          }
          const currentTimeMs = Date.now();
          if (currentTimeMs - when > tokenLifetimeMs) throw new Meteor.Error(403, "Token expired");
          if (!pluckAddresses(user.emails).includes(email)) return {
            userId: user._id,
            error: new Meteor.Error(403, "Token has invalid email address")
          };

          // NOTE: We're about to invalidate tokens on the user, who we might be
          // logged in as. Make sure to avoid logging ourselves out if this
          // happens. But also make sure not to leave the connection in a state
          // of having a bad token set if things fail.
          const oldToken = Accounts._getLoginToken(this.connection.id);
          Accounts._setLoginToken(user._id, this.connection, null);
          const resetToOldToken = () => Accounts._setLoginToken(user._id, this.connection, oldToken);
          const updator = await getUpdatorForUserPassword(newPassword);
          try {
            // Update the user record by:
            // - Changing the password to the new one
            // - Forgetting about the reset token or enroll token that was just used
            // - Verifying their email, since they got the password reset via email.
            let affectedRecords = {};
            // if reason is enroll then check services.password.enroll.token field for affected records
            if (isEnroll) {
              affectedRecords = await Meteor.users.updateAsync({
                _id: user._id,
                "emails.address": email,
                "services.password.enroll.token": token
              }, {
                $set: _objectSpread({
                  "emails.$.verified": true
                }, updator.$set),
                $unset: _objectSpread({
                  "services.password.enroll": 1
                }, updator.$unset)
              });
            } else {
              affectedRecords = await Meteor.users.updateAsync({
                _id: user._id,
                "emails.address": email,
                "services.password.reset.token": token
              }, {
                $set: _objectSpread({
                  "emails.$.verified": true
                }, updator.$set),
                $unset: _objectSpread({
                  "services.password.reset": 1
                }, updator.$unset)
              });
            }
            if (affectedRecords !== 1) return {
              userId: user._id,
              error: new Meteor.Error(403, "Invalid email")
            };
          } catch (err) {
            resetToOldToken();
            throw err;
          }

          // Replace all valid login tokens with new ones (changing
          // password should invalidate existing sessions).
          await Accounts._clearAllLoginTokens(user._id);
          if ((_Accounts$_check2faEn2 = (_Accounts2 = Accounts)._check2faEnabled) !== null && _Accounts$_check2faEn2 !== void 0 && _Accounts$_check2faEn2.call(_Accounts2, user)) {
            return {
              userId: user._id,
              error: Accounts._handleError('Changed password, but user not logged in because 2FA is enabled', false, '2fa-enabled')
            };
          }
          return {
            userId: user._id
          };
        });
      }
    });

    ///
    /// EMAIL VERIFICATION
    ///

    // send the user an email with a link that when opened marks that
    // address as verified

    /**
     * @summary Send an email asynchronously with a link the user can use verify their email address.
     * @locus Server
     * @param {String} userId The id of the user to send email to.
     * @param {String} [email] Optional. Which address of the user's to send the email to. This address must be in the user's `emails` list. Defaults to the first unverified email in the list.
     * @param {Object} [extraTokenData] Optional additional data to be added into the token record.
     * @param {Object} [extraParams] Optional additional params to be added to the verification url.
     * @returns {Promise<Object>} Promise of an object with {email, user, token, url, options} values.
     * @importFromPackage accounts-base
     */
    Accounts.sendVerificationEmail = async (userId, email, extraTokenData, extraParams) => {
      // XXX Also generate a link using which someone can delete this
      // account if they own said address but weren't those who created
      // this account.

      const {
        email: realEmail,
        user,
        token
      } = await Accounts.generateVerificationToken(userId, email, extraTokenData);
      const url = Accounts.urls.verifyEmail(token, extraParams);
      const options = await Accounts.generateOptionsForEmail(realEmail, user, url, 'verifyEmail');
      await Email.sendAsync(options);
      if (Meteor.isDevelopment && !Meteor.isPackageTest) {
        console.log("\nVerification email URL: ".concat(url));
      }
      return {
        email: realEmail,
        user,
        token,
        url,
        options
      };
    };

    // Take token from sendVerificationEmail, mark the email as verified,
    // and log them in.
    Meteor.methods({
      verifyEmail: async function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        const token = args[0];
        return await Accounts._loginMethod(this, "verifyEmail", args, "password", async () => {
          var _Accounts$_check2faEn3, _Accounts3;
          check(token, String);
          const user = await Meteor.users.findOneAsync({
            'services.email.verificationTokens.token': token
          }, {
            fields: {
              services: 1,
              emails: 1
            }
          });
          if (!user) throw new Meteor.Error(403, "Verify email link expired");
          const tokenRecord = await user.services.email.verificationTokens.find(t => t.token == token);
          if (!tokenRecord) return {
            userId: user._id,
            error: new Meteor.Error(403, "Verify email link expired")
          };
          const emailsRecord = user.emails.find(e => e.address == tokenRecord.address);
          if (!emailsRecord) return {
            userId: user._id,
            error: new Meteor.Error(403, "Verify email link is for unknown address")
          };

          // By including the address in the query, we can use 'emails.$' in the
          // modifier to get a reference to the specific object in the emails
          // array. See
          // http://www.mongodb.org/display/DOCS/Updating/#Updating-The%24positionaloperator)
          // http://www.mongodb.org/display/DOCS/Updating#Updating-%24pull
          await Meteor.users.updateAsync({
            _id: user._id,
            'emails.address': tokenRecord.address
          }, {
            $set: {
              'emails.$.verified': true
            },
            $pull: {
              'services.email.verificationTokens': {
                address: tokenRecord.address
              }
            }
          });
          if ((_Accounts$_check2faEn3 = (_Accounts3 = Accounts)._check2faEnabled) !== null && _Accounts$_check2faEn3 !== void 0 && _Accounts$_check2faEn3.call(_Accounts3, user)) {
            return {
              userId: user._id,
              error: Accounts._handleError('Email verified, but user not logged in because 2FA is enabled', false, '2fa-enabled')
            };
          }
          return {
            userId: user._id
          };
        });
      }
    });

    /**
     * @summary Asynchronously replace an email address for a user. Use this instead of directly
     * updating the database. The operation will fail if there is a different user
     * with an email only differing in case. If the specified user has an existing
     * email only differing in case however, we replace it.
     * @locus Server
     * @param {String} userId The ID of the user to update.
     * @param {String} oldEmail The email address to replace.
     * @param {String} newEmail The new email address to use.
     * @param {Boolean} [verified] Optional - whether the new email address should
     * be marked as verified. Defaults to false.
     * @importFromPackage accounts-base
     */
    Accounts.replaceEmailAsync = async (userId, oldEmail, newEmail, verified) => {
      check(userId, NonEmptyString);
      check(oldEmail, NonEmptyString);
      check(newEmail, NonEmptyString);
      check(verified, Match.Optional(Boolean));
      if (verified === void 0) {
        verified = false;
      }
      const user = await getUserById(userId, {
        fields: {
          _id: 1
        }
      });
      if (!user) throw new Meteor.Error(403, "User not found");

      // Ensure no user already has this new email
      await Accounts._checkForCaseInsensitiveDuplicates("emails.address", "Email", newEmail, user._id);
      const result = await Meteor.users.updateAsync({
        _id: user._id,
        'emails.address': oldEmail
      }, {
        $set: {
          'emails.$.address': newEmail,
          'emails.$.verified': verified
        }
      });
      if (result.modifiedCount === 0) {
        throw new Meteor.Error(404, "No user could be found with old email");
      }
    };

    /**
     * @summary Asynchronously add an email address for a user. Use this instead of directly
     * updating the database. The operation will fail if there is a different user
     * with an email only differing in case. If the specified user has an existing
     * email only differing in case however, we replace it.
     * @locus Server
     * @param {String} userId The ID of the user to update.
     * @param {String} newEmail A new email address for the user.
     * @param {Boolean} [verified] Optional - whether the new email address should
     * be marked as verified. Defaults to false.
     * @importFromPackage accounts-base
     */
    Accounts.addEmailAsync = async (userId, newEmail, verified) => {
      check(userId, NonEmptyString);
      check(newEmail, NonEmptyString);
      check(verified, Match.Optional(Boolean));
      if (verified === void 0) {
        verified = false;
      }
      const user = await getUserById(userId, {
        fields: {
          emails: 1
        }
      });
      if (!user) throw new Meteor.Error(403, "User not found");

      // Allow users to change their own email to a version with a different case

      // We don't have to call checkForCaseInsensitiveDuplicates to do a case
      // insensitive check across all emails in the database here because: (1) if
      // there is no case-insensitive duplicate between this user and other users,
      // then we are OK and (2) if this would create a conflict with other users
      // then there would already be a case-insensitive duplicate and we can't fix
      // that in this code anyway.
      const caseInsensitiveRegExp = new RegExp("^".concat(Meteor._escapeRegExp(newEmail), "$"), "i");

      // TODO: This is a linear search. If we have a lot of emails.
      //  we should consider using a different data structure.
      const updatedEmail = async function () {
        let emails = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        let _id = arguments.length > 1 ? arguments[1] : undefined;
        let updated = false;
        for (const email of emails) {
          if (caseInsensitiveRegExp.test(email.address)) {
            await Meteor.users.updateAsync({
              _id: _id,
              "emails.address": email.address
            }, {
              $set: {
                "emails.$.address": newEmail,
                "emails.$.verified": verified
              }
            });
            updated = true;
          }
        }
        return updated;
      };
      const didUpdateOwnEmail = await updatedEmail(user.emails, user._id);

      // In the other updates below, we have to do another call to
      // checkForCaseInsensitiveDuplicates to make sure that no conflicting values
      // were added to the database in the meantime. We don't have to do this for
      // the case where the user is updating their email address to one that is the
      // same as before, but only different because of capitalization. Read the
      // big comment above to understand why.

      if (didUpdateOwnEmail) {
        return;
      }

      // Perform a case insensitive check for duplicates before update
      await Accounts._checkForCaseInsensitiveDuplicates("emails.address", "Email", newEmail, user._id);
      await Meteor.users.updateAsync({
        _id: user._id
      }, {
        $addToSet: {
          emails: {
            address: newEmail,
            verified: verified
          }
        }
      });

      // Perform another check after update, in case a matching user has been
      // inserted in the meantime
      try {
        await Accounts._checkForCaseInsensitiveDuplicates("emails.address", "Email", newEmail, user._id);
      } catch (ex) {
        // Undo update if the check fails
        await Meteor.users.updateAsync({
          _id: user._id
        }, {
          $pull: {
            emails: {
              address: newEmail
            }
          }
        });
        throw ex;
      }
    };

    /**
     * @summary Remove an email address asynchronously for a user. Use this instead of updating
     * the database directly.
     * @locus Server
     * @param {String} userId The ID of the user to update.
     * @param {String} email The email address to remove.
     * @importFromPackage accounts-base
     */
    Accounts.removeEmail = async (userId, email) => {
      check(userId, NonEmptyString);
      check(email, NonEmptyString);
      const user = await getUserById(userId, {
        fields: {
          _id: 1
        }
      });
      if (!user) throw new Meteor.Error(403, "User not found");
      await Meteor.users.updateAsync({
        _id: user._id
      }, {
        $pull: {
          emails: {
            address: email
          }
        }
      });
    };

    ///
    /// CREATING USERS
    ///

    // Shared createUser function called from the createUser method, both
    // if originates in client or server code. Calls user provided hooks,
    // does the actual user insertion.
    //
    // returns the user id
    const createUser = async options => {
      // Unknown keys allowed, because a onCreateUserHook can take arbitrary
      // options.
      check(options, Match.ObjectIncluding({
        username: Match.Optional(String),
        email: Match.Optional(String),
        password: Match.Optional(passwordValidator)
      }));
      const {
        username,
        email,
        password
      } = options;
      if (!username && !email) throw new Meteor.Error(400, "Need to set a username or email");
      const user = {
        services: {}
      };
      if (password) {
        const hashed = await hashPassword(password);
        const argon2Enabled = Accounts._argon2Enabled();
        if (argon2Enabled === false) {
          user.services.password = {
            bcrypt: hashed
          };
        } else {
          user.services.password = {
            argon2: hashed
          };
        }
      }
      return await Accounts._createUserCheckingDuplicates({
        user,
        email,
        username,
        options
      });
    };

    // method for create user. Requests come from the client.
    Meteor.methods({
      createUser: async function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        const options = args[0];
        return await Accounts._loginMethod(this, "createUser", args, "password", async () => {
          // createUser() above does more checking.
          check(options, Object);
          if (Accounts._options.forbidClientAccountCreation) return {
            error: new Meteor.Error(403, "Signups forbidden")
          };
          const userId = await Accounts.createUserVerifyingEmail(options);

          // client gets logged in as the new user afterwards.
          return {
            userId: userId
          };
        });
      }
    });

    /**
     * @summary Creates an user asynchronously and sends an email if `options.email` is informed.
     * Then if the `sendVerificationEmail` option from the `Accounts` package is
     * enabled, you'll send a verification email if `options.password` is informed,
     * otherwise you'll send an enrollment email.
     * @locus Server
     * @param {Object} options The options object to be passed down when creating
     * the user
     * @param {String} options.username A unique name for this user.
     * @param {String} options.email The user's email address.
     * @param {String} options.password The user's password. This is __not__ sent in plain text over the wire.
     * @param {Object} options.profile The user's profile, typically including the `name` field.
     * @importFromPackage accounts-base
     * */
    Accounts.createUserVerifyingEmail = async options => {
      options = _objectSpread({}, options);
      // Create user. result contains id and token.
      const userId = await createUser(options);
      // safety belt. createUser is supposed to throw on error. send 500 error
      // instead of sending a verification email with empty userid.
      if (!userId) throw new Error("createUser failed to insert new user");

      // If `Accounts._options.sendVerificationEmail` is set, register
      // a token to verify the user's primary email, and send it to
      // that address.
      if (options.email && Accounts._options.sendVerificationEmail) {
        if (options.password) {
          await Accounts.sendVerificationEmail(userId, options.email);
        } else {
          await Accounts.sendEnrollmentEmail(userId, options.email);
        }
      }
      return userId;
    };

    // Create user directly on the server.
    //
    // Unlike the client version, this does not log you in as this user
    // after creation.
    //
    // returns Promise<userId> or throws an error if it can't create
    //
    // XXX add another argument ("server options") that gets sent to onCreateUser,
    // which is always empty when called from the createUser method? eg, "admin:
    // true", which we want to prevent the client from setting, but which a custom
    // method calling Accounts.createUser could set?
    //

    Accounts.createUserAsync = createUser;

    // Create user directly on the server.
    //
    // Unlike the client version, this does not log you in as this user
    // after creation.
    //
    // returns userId or throws an error if it can't create
    //
    // XXX add another argument ("server options") that gets sent to onCreateUser,
    // which is always empty when called from the createUser method? eg, "admin:
    // true", which we want to prevent the client from setting, but which a custom
    // method calling Accounts.createUser could set?
    //

    Accounts.createUser = Accounts.createUserAsync;

    ///
    /// PASSWORD-SPECIFIC INDEXES ON USERS
    ///
    await Meteor.users.createIndexAsync('services.email.verificationTokens.token', {
      unique: true,
      sparse: true
    });
    await Meteor.users.createIndexAsync('services.password.reset.token', {
      unique: true,
      sparse: true
    });
    await Meteor.users.createIndexAsync('services.password.enroll.token', {
      unique: true,
      sparse: true
    });
    __reify_async_result__();
  } catch (_reifyError) {
    return __reify_async_result__(_reifyError);
  }
  __reify_async_result__()
}, {
  self: this,
  async: true
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"node_modules":{"argon2":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/accounts-password/node_modules/argon2/package.json                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.exports = {
  "name": "argon2",
  "version": "0.41.1",
  "main": "argon2.cjs"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"argon2.cjs":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/accounts-password/node_modules/argon2/argon2.cjs                                             //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"bcrypt":{"package.json":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/accounts-password/node_modules/bcrypt/package.json                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.exports = {
  "name": "bcrypt",
  "version": "5.0.1",
  "main": "./bcrypt"
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"bcrypt.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// node_modules/meteor/accounts-password/node_modules/bcrypt/bcrypt.js                                              //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
module.useNode();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});


/* Exports */
return {
  require: require,
  eagerModulePaths: [
    "/node_modules/meteor/accounts-password/email_templates.js",
    "/node_modules/meteor/accounts-password/password_server.js"
  ]
}});

//# sourceURL=meteor://💻app/packages/accounts-password.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvYWNjb3VudHMtcGFzc3dvcmQvZW1haWxfdGVtcGxhdGVzLmpzIiwibWV0ZW9yOi8v8J+Su2FwcC9wYWNrYWdlcy9hY2NvdW50cy1wYXNzd29yZC9wYXNzd29yZF9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiX29iamVjdFNwcmVhZCIsIm1vZHVsZSIsImxpbmsiLCJkZWZhdWx0IiwidiIsIl9fcmVpZnlXYWl0Rm9yRGVwc19fIiwiZ3JlZXQiLCJ3ZWxjb21lTXNnIiwidXNlciIsInVybCIsImdyZWV0aW5nIiwicHJvZmlsZSIsIm5hbWUiLCJjb25jYXQiLCJBY2NvdW50cyIsImVtYWlsVGVtcGxhdGVzIiwiZnJvbSIsInNpdGVOYW1lIiwiTWV0ZW9yIiwiYWJzb2x1dGVVcmwiLCJyZXBsYWNlIiwicmVzZXRQYXNzd29yZCIsInN1YmplY3QiLCJ0ZXh0IiwidmVyaWZ5RW1haWwiLCJlbnJvbGxBY2NvdW50IiwiX19yZWlmeV9hc3luY19yZXN1bHRfXyIsIl9yZWlmeUVycm9yIiwic2VsZiIsImFzeW5jIiwiYXJnb24yIiwiYmNyeXB0SGFzaCIsImJjcnlwdENvbXBhcmUiLCJoYXNoIiwiY29tcGFyZSIsImdldFVzZXJCeUlkIiwiaWQiLCJvcHRpb25zIiwidXNlcnMiLCJmaW5kT25lQXN5bmMiLCJfYWRkRGVmYXVsdEZpZWxkU2VsZWN0b3IiLCJfYmNyeXB0Um91bmRzIiwiX29wdGlvbnMiLCJiY3J5cHRSb3VuZHMiLCJfYXJnb24yRW5hYmxlZCIsImFyZ29uMkVuYWJsZWQiLCJBUkdPTjJfVFlQRVMiLCJhcmdvbjJpIiwiYXJnb24yZCIsImFyZ29uMmlkIiwiX2FyZ29uMlR5cGUiLCJhcmdvbjJUeXBlIiwiX2FyZ29uMlRpbWVDb3N0IiwiYXJnb24yVGltZUNvc3QiLCJfYXJnb24yTWVtb3J5Q29zdCIsImFyZ29uMk1lbW9yeUNvc3QiLCJfYXJnb24yUGFyYWxsZWxpc20iLCJhcmdvbjJQYXJhbGxlbGlzbSIsImdldFBhc3N3b3JkU3RyaW5nIiwicGFzc3dvcmQiLCJTSEEyNTYiLCJhbGdvcml0aG0iLCJFcnJvciIsImRpZ2VzdCIsImhhc2hQYXNzd29yZCIsInR5cGUiLCJ0aW1lQ29zdCIsIm1lbW9yeUNvc3QiLCJwYXJhbGxlbGlzbSIsImdldFJvdW5kc0Zyb21CY3J5cHRIYXNoIiwicm91bmRzIiwiaGFzaFNlZ21lbnRzIiwic3BsaXQiLCJsZW5ndGgiLCJwYXJzZUludCIsIl9nZXRSb3VuZHNGcm9tQmNyeXB0SGFzaCIsImdldEFyZ29uMlBhcmFtcyIsInJlZ2V4IiwibWF0Y2giLCJfZ2V0QXJnb24yUGFyYW1zIiwiZ2V0VXNlclBhc3N3b3JkSGFzaCIsIl91c2VyJHNlcnZpY2VzIiwiX3VzZXIkc2VydmljZXMkcGFzc3dvIiwiX3VzZXIkc2VydmljZXMyIiwiX3VzZXIkc2VydmljZXMyJHBhc3N3Iiwic2VydmljZXMiLCJiY3J5cHQiLCJfY2hlY2tQYXNzd29yZFVzZXJGaWVsZHMiLCJfaWQiLCJpc0JjcnlwdCIsInN0YXJ0c1dpdGgiLCJpc0FyZ29uIiwidXBkYXRlVXNlclBhc3N3b3JkRGVmZXJlZCIsImZvcm1hdHRlZFBhc3N3b3JkIiwiZGVmZXIiLCJ1cGRhdGVVc2VyUGFzc3dvcmQiLCJnZXRVcGRhdG9yRm9yVXNlclBhc3N3b3JkIiwiZW5jcnlwdGVkUGFzc3dvcmQiLCIkc2V0IiwiJHVuc2V0IiwidXBkYXRvciIsInVwZGF0ZUFzeW5jIiwiY2hlY2tQYXNzd29yZEFzeW5jIiwicmVzdWx0IiwidXNlcklkIiwiY29uc29sZSIsIndhcm4iLCJ2ZXJpZnkiLCJlcnJvciIsIl9oYW5kbGVFcnJvciIsImhhc2hSb3VuZHMiLCJwYXJhbXNDaGFuZ2VkIiwiYXJnb24yUGFyYW1zIiwiX2NoZWNrUGFzc3dvcmRBc3luYyIsImZpbmRVc2VyQnlVc2VybmFtZSIsInVzZXJuYW1lIiwiX2ZpbmRVc2VyQnlRdWVyeSIsImZpbmRVc2VyQnlFbWFpbCIsImVtYWlsIiwiTm9uRW1wdHlTdHJpbmciLCJNYXRjaCIsIldoZXJlIiwieCIsImNoZWNrIiwiU3RyaW5nIiwicGFzc3dvcmRWYWxpZGF0b3IiLCJPbmVPZiIsInN0ciIsIl9NZXRlb3Ikc2V0dGluZ3MiLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2siLCJfTWV0ZW9yJHNldHRpbmdzJHBhY2syIiwidGVzdCIsInNldHRpbmdzIiwicGFja2FnZXMiLCJhY2NvdW50cyIsInBhc3N3b3JkTWF4TGVuZ3RoIiwicmVnaXN0ZXJMb2dpbkhhbmRsZXIiLCJfQWNjb3VudHMkX2NoZWNrMmZhRW4iLCJfQWNjb3VudHMiLCJ1bmRlZmluZWQiLCJfdXNlclF1ZXJ5VmFsaWRhdG9yIiwiY29kZSIsIk9wdGlvbmFsIiwiZmllbGRzIiwiX2NoZWNrMmZhRW5hYmxlZCIsImNhbGwiLCJfaXNUb2tlblZhbGlkIiwidHdvRmFjdG9yQXV0aGVudGljYXRpb24iLCJzZWNyZXQiLCJzZXRVc2VybmFtZSIsIm5ld1VzZXJuYW1lIiwib2xkVXNlcm5hbWUiLCJfY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzIiwiZXgiLCJtZXRob2RzIiwiY2hhbmdlUGFzc3dvcmQiLCJvbGRQYXNzd29yZCIsIm5ld1Bhc3N3b3JkIiwiY3VycmVudFRva2VuIiwiX2dldExvZ2luVG9rZW4iLCJjb25uZWN0aW9uIiwiJHB1bGwiLCJoYXNoZWRUb2tlbiIsIiRuZSIsInBhc3N3b3JkQ2hhbmdlZCIsInNldFBhc3N3b3JkQXN5bmMiLCJuZXdQbGFpbnRleHRQYXNzd29yZCIsIl9NZXRlb3Ikc2V0dGluZ3MyIiwiX01ldGVvciRzZXR0aW5nczIkcGFjIiwiX01ldGVvciRzZXR0aW5nczIkcGFjMiIsIk1heWJlIiwibG9nb3V0IiwiQm9vbGVhbiIsInBsdWNrQWRkcmVzc2VzIiwiZW1haWxzIiwiYXJndW1lbnRzIiwibWFwIiwiYWRkcmVzcyIsImZvcmdvdFBhc3N3b3JkIiwiY2FzZVNlbnNpdGl2ZUVtYWlsIiwiZmluZCIsInRvTG93ZXJDYXNlIiwic2VuZFJlc2V0UGFzc3dvcmRFbWFpbCIsImdlbmVyYXRlUmVzZXRUb2tlbiIsInJlYXNvbiIsImV4dHJhVG9rZW5EYXRhIiwiaW5jbHVkZXMiLCJ0b2tlbiIsIlJhbmRvbSIsInRva2VuUmVjb3JkIiwid2hlbiIsIkRhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJfZW5zdXJlIiwiZW5yb2xsIiwicmVzZXQiLCJnZW5lcmF0ZVZlcmlmaWNhdGlvblRva2VuIiwiZW1haWxSZWNvcmQiLCJlIiwidmVyaWZpZWQiLCIkcHVzaCIsInZlcmlmaWNhdGlvblRva2VucyIsInB1c2giLCJleHRyYVBhcmFtcyIsInJlYWxFbWFpbCIsInVybHMiLCJnZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbCIsIkVtYWlsIiwic2VuZEFzeW5jIiwiaXNEZXZlbG9wbWVudCIsImlzUGFja2FnZVRlc3QiLCJsb2ciLCJzZW5kRW5yb2xsbWVudEVtYWlsIiwiX2xlbiIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJfbG9naW5NZXRob2QiLCJfQWNjb3VudHMkX2NoZWNrMmZhRW4yIiwiX0FjY291bnRzMiIsImlzRW5yb2xsIiwidG9rZW5MaWZldGltZU1zIiwiX2dldFBhc3N3b3JkUmVzZXRUb2tlbkxpZmV0aW1lTXMiLCJfZ2V0UGFzc3dvcmRFbnJvbGxUb2tlbkxpZmV0aW1lTXMiLCJjdXJyZW50VGltZU1zIiwibm93Iiwib2xkVG9rZW4iLCJfc2V0TG9naW5Ub2tlbiIsInJlc2V0VG9PbGRUb2tlbiIsImFmZmVjdGVkUmVjb3JkcyIsImVyciIsIl9jbGVhckFsbExvZ2luVG9rZW5zIiwic2VuZFZlcmlmaWNhdGlvbkVtYWlsIiwiX2xlbjIiLCJfa2V5MiIsIl9BY2NvdW50cyRfY2hlY2syZmFFbjMiLCJfQWNjb3VudHMzIiwidCIsImVtYWlsc1JlY29yZCIsInJlcGxhY2VFbWFpbEFzeW5jIiwib2xkRW1haWwiLCJuZXdFbWFpbCIsIm1vZGlmaWVkQ291bnQiLCJhZGRFbWFpbEFzeW5jIiwiY2FzZUluc2Vuc2l0aXZlUmVnRXhwIiwiUmVnRXhwIiwiX2VzY2FwZVJlZ0V4cCIsInVwZGF0ZWRFbWFpbCIsInVwZGF0ZWQiLCJkaWRVcGRhdGVPd25FbWFpbCIsIiRhZGRUb1NldCIsInJlbW92ZUVtYWlsIiwiY3JlYXRlVXNlciIsIk9iamVjdEluY2x1ZGluZyIsImhhc2hlZCIsIl9jcmVhdGVVc2VyQ2hlY2tpbmdEdXBsaWNhdGVzIiwiX2xlbjMiLCJfa2V5MyIsImZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbiIsImNyZWF0ZVVzZXJWZXJpZnlpbmdFbWFpbCIsImNyZWF0ZVVzZXJBc3luYyIsImNyZWF0ZUluZGV4QXN5bmMiLCJ1bmlxdWUiLCJzcGFyc2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLGFBQWE7SUFBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUMsc0NBQXNDLEVBQUM7TUFBQ0MsT0FBT0EsQ0FBQ0MsQ0FBQyxFQUFDO1FBQUNKLGFBQWEsR0FBQ0ksQ0FBQztNQUFBO0lBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQztJQUFDLElBQUlDLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU1BLG9CQUFvQixDQUFDLENBQUMsRUFBRSxDQUFDO0lBQWxLLE1BQU1DLEtBQUssR0FBR0MsVUFBVSxJQUFJLENBQUNDLElBQUksRUFBRUMsR0FBRyxLQUFLO01BQ3pDLE1BQU1DLFFBQVEsR0FDWkYsSUFBSSxDQUFDRyxPQUFPLElBQUlILElBQUksQ0FBQ0csT0FBTyxDQUFDQyxJQUFJLFlBQUFDLE1BQUEsQ0FDcEJMLElBQUksQ0FBQ0csT0FBTyxDQUFDQyxJQUFJLFNBQzFCLFFBQVE7TUFDZCxVQUFBQyxNQUFBLENBQVVILFFBQVEsVUFBQUcsTUFBQSxDQUVsQk4sVUFBVSx3Q0FBQU0sTUFBQSxDQUVWSixHQUFHO0lBSUwsQ0FBQzs7SUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0FLLFFBQVEsQ0FBQ0MsY0FBYyxHQUFBZixhQUFBLENBQUFBLGFBQUEsS0FDakJjLFFBQVEsQ0FBQ0MsY0FBYyxJQUFJLENBQUMsQ0FBQztNQUNqQ0MsSUFBSSxF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LENBQUMrTyxVQUFVLEdBQUcvTyxRQUFRLENBQUN1UCxlQUFlOztJQUU5QztJQUNBO0lBQ0E7SUFDQSxNQUFNblAsTUFBTSxDQUFDb0IsS0FBSyxDQUFDZ08sZ0JBQWdCLENBQUMseUNBQXlDLEVBQzNFO01BQUVDLE1BQU0sRUFBRSxJQUFJO01BQUVDLE1BQU0sRUFBRTtJQUFLLENBQUMsQ0FBQztJQUNqQyxNQUFNdFAsTUFBTSxDQUFDb0IsS0FBSyxDQUFDZ08sZ0JBQWdCLENBQUMsK0JBQStCLEVBQ2pFO01BQUVDLE1BQU0sRUFBRSxJQUFJO01BQUVDLE1BQU0sRUFBRTtJQUFLLENBQUMsQ0FBQztJQUNqQyxNQUFNdFAsTUFBTSxDQUFDb0IsS0FBSyxDQUFDZ08sZ0JBQWdCLENBQUMsZ0NBQWdDLEVBQ2xFO01BQUVDLE1BQU0sRUFBRSxJQUFJO01BQUVDLE1BQU0sRUFBRTtJQUFLLENBQUMsQ0FBQztJQUFDOU8sc0JBQUE7RUFBQSxTQUFBQyxXQUFBO0lBQUEsT0FBQUQsc0JBQUEsQ0FBQUMsV0FBQTtFQUFBO0VBQUFELHNCQUFBO0FBQUE7RUFBQUUsSUFBQTtFQUFBQyxLQUFBO0FBQUEsRyIsImZpbGUiOiIvcGFja2FnZXMvYWNjb3VudHMtcGFzc3dvcmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBncmVldCA9IHdlbGNvbWVNc2cgPT4gKHVzZXIsIHVybCkgPT4ge1xuICBjb25zdCBncmVldGluZyA9XG4gICAgdXNlci5wcm9maWxlICYmIHVzZXIucHJvZmlsZS5uYW1lXG4gICAgICA/IGBIZWxsbyAke3VzZXIucHJvZmlsZS5uYW1lfSxgXG4gICAgICA6ICdIZWxsbywnO1xuICByZXR1cm4gYCR7Z3JlZXRpbmd9XG5cbiR7d2VsY29tZU1zZ30sIHNpbXBseSBjbGljayB0aGUgbGluayBiZWxvdy5cblxuJHt1cmx9XG5cblRoYW5rIHlvdS5cbmA7XG59O1xuXG4vKipcbiAqIEBzdW1tYXJ5IE9wdGlvbnMgdG8gY3VzdG9taXplIGVtYWlscyBzZW50IGZyb20gdGhlIEFjY291bnRzIHN5c3RlbS5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLmVtYWlsVGVtcGxhdGVzID0ge1xuICAuLi4oQWNjb3VudHMuZW1haWxUZW1wbGF0ZXMgfHwge30pLFxuICBmcm9tOiAnQWNjb3VudHMgRXhhbXBsZSA8bm8tcmVwbHlAZXhhbXBsZS5jb20+JyxcbiAgc2l0ZU5hbWU6IE1ldGVvci5hYnNvbHV0ZVVybCgpXG4gICAgLnJlcGxhY2UoL15odHRwcz86XFwvXFwvLywgJycpXG4gICAgLnJlcGxhY2UoL1xcLyQvLCAnJyksXG5cbiAgcmVzZXRQYXNzd29yZDoge1xuICAgIHN1YmplY3Q6ICgpID0+XG4gICAgICBgSG93IHRvIHJlc2V0IHlvdXIgcGFzc3dvcmQgb24gJHtBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5zaXRlTmFtZX1gLFxuICAgIHRleHQ6IGdyZWV0KCdUbyByZXNldCB5b3VyIHBhc3N3b3JkJyksXG4gIH0sXG4gIHZlcmlmeUVtYWlsOiB7XG4gICAgc3ViamVjdDogKCkgPT5cbiAgICAgIGBIb3cgdG8gdmVyaWZ5IGVtYWlsIGFkZHJlc3Mgb24gJHtBY2NvdW50cy5lbWFpbFRlbXBsYXRlcy5zaXRlTmFtZX1gLFxuICAgIHRleHQ6IGdyZWV0KCdUbyB2ZXJpZnkgeW91ciBhY2NvdW50IGVtYWlsJyksXG4gIH0sXG4gIGVucm9sbEFjY291bnQ6IHtcbiAgICBzdWJqZWN0OiAoKSA9PlxuICAgICAgYEFuIGFjY291bnQgaGFzIGJlZW4gY3JlYXRlZCBmb3IgeW91IG9uICR7QWNjb3VudHMuZW1haWxUZW1wbGF0ZXMuc2l0ZU5hbWV9YCxcbiAgICB0ZXh0OiBncmVldCgnVG8gc3RhcnQgdXNpbmcgdGhlIHNlcnZpY2UnKSxcbiAgfSxcbn07XG4iLCJpbXBvcnQgYXJnb24yIGZyb20gXCJhcmdvbjJcIjtcbmltcG9ydCB7IGhhc2ggYXMgYmNyeXB0SGFzaCwgY29tcGFyZSBhcyBiY3J5cHRDb21wYXJlIH0gZnJvbSBcImJjcnlwdFwiO1xuaW1wb3J0IHsgQWNjb3VudHMgfSBmcm9tIFwibWV0ZW9yL2FjY291bnRzLWJhc2VcIjtcblxuLy8gVXRpbGl0eSBmb3IgZ3JhYmJpbmcgdXNlclxuY29uc3QgZ2V0VXNlckJ5SWQgPVxuICBhc3luYyAoaWQsIG9wdGlvbnMpID0+XG4gICAgYXdhaXQgTWV0ZW9yLnVzZXJzLmZpbmRPbmVBc3luYyhpZCwgQWNjb3VudHMuX2FkZERlZmF1bHRGaWVsZFNlbGVjdG9yKG9wdGlvbnMpKTtcblxuLy8gVXNlciByZWNvcmRzIGhhdmUgdHdvIGZpZWxkcyB0aGF0IGFyZSB1c2VkIGZvciBwYXNzd29yZC1iYXNlZCBsb2dpbjpcbi8vIC0gJ3NlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdCcsIHdoaWNoIHN0b3JlcyB0aGUgYmNyeXB0IHBhc3N3b3JkLCB3aGljaCB3aWxsIGJlIGRlcHJlY2F0ZWRcbi8vIC0gJ3NlcnZpY2VzLnBhc3N3b3JkLmFyZ29uMicsIHdoaWNoIHN0b3JlcyB0aGUgYXJnb24yIHBhc3N3b3JkXG4vL1xuLy8gV2hlbiB0aGUgY2xpZW50IHNlbmRzIGEgcGFzc3dvcmQgdG8gdGhlIHNlcnZlciwgaXQgY2FuIGVpdGhlciBiZSBhXG4vLyBzdHJpbmcgKHRoZSBwbGFpbnRleHQgcGFzc3dvcmQpIG9yIGFuIG9iamVjdCB3aXRoIGtleXMgJ2RpZ2VzdCcgYW5kXG4vLyAnYWxnb3JpdGhtJyAobXVzdCBiZSBcInNoYS0yNTZcIiBmb3Igbm93KS4gVGhlIE1ldGVvciBjbGllbnQgYWx3YXlzIHNlbmRzXG4vLyBwYXNzd29yZCBvYmplY3RzIHsgZGlnZXN0OiAqLCBhbGdvcml0aG06IFwic2hhLTI1NlwiIH0sIGJ1dCBERFAgY2xpZW50c1xuLy8gdGhhdCBkb24ndCBoYXZlIGFjY2VzcyB0byBTSEEgY2FuIGp1c3Qgc2VuZCBwbGFpbnRleHQgcGFzc3dvcmRzIGFzXG4vLyBzdHJpbmdzLlxuLy9cbi8vIFdoZW4gdGhlIHNlcnZlciByZWNlaXZlcyBhIHBsYWludGV4dCBwYXNzd29yZCBhcyBhIHN0cmluZywgaXQgYWx3YXlzXG4vLyBoYXNoZXMgaXQgd2l0aCBTSEEyNTYgYmVmb3JlIHBhc3NpbmcgaXQgaW50byBiY3J5cHQgLyBhcmdvbjIuIFdoZW4gdGhlIHNlcnZlclxuLy8gcmVjZWl2ZXMgYSBwYXNzd29yZCBhcyBhbiBvYmplY3QsIGl0IGFzc2VydHMgdGhhdCB0aGUgYWxnb3JpdGhtIGlzXG4vLyBcInNoYS0yNTZcIiBhbmQgdGhlbiBwYXNzZXMgdGhlIGRpZ2VzdCB0byBiY3J5cHQgLyBhcmdvbjIuXG5cbkFjY291bnRzLl9iY3J5cHRSb3VuZHMgPSAoKSA9PiBBY2NvdW50cy5fb3B0aW9ucy5iY3J5cHRSb3VuZHMgfHwgMTA7XG5cbkFjY291bnRzLl9hcmdvbjJFbmFibGVkID0gKCkgPT4gQWNjb3VudHMuX29wdGlvbnMuYXJnb24yRW5hYmxlZCB8fCBmYWxzZTtcblxuY29uc3QgQVJHT04yX1RZUEVTID0ge1xuICBhcmdvbjJpOiBhcmdvbjIuYXJnb24yaSxcbiAgYXJnb24yZDogYXJnb24yLmFyZ29uMmQsXG4gIGFyZ29uMmlkOiBhcmdvbjIuYXJnb24yaWRcbn07XG5cbkFjY291bnRzLl9hcmdvbjJUeXBlID0gKCkgPT4gQVJHT04yX1RZUEVTW0FjY291bnRzLl9vcHRpb25zLmFyZ29uMlR5cGVdIHx8IGFyZ29uMi5hcmdvbjJpZDtcbkFjY291bnRzLl9hcmdvbjJUaW1lQ29zdCA9ICgpID0+IEFjY291bnRzLl9vcHRpb25zLmFyZ29uMlRpbWVDb3N0IHx8IDI7XG5BY2NvdW50cy5fYXJnb24yTWVtb3J5Q29zdCA9ICgpID0+IEFjY291bnRzLl9vcHRpb25zLmFyZ29uMk1lbW9yeUNvc3QgfHwgMTk0NTY7XG5BY2NvdW50cy5fYXJnb24yUGFyYWxsZWxpc20gPSAoKSA9PiBBY2NvdW50cy5fb3B0aW9ucy5hcmdvbjJQYXJhbGxlbGlzbSB8fCAxO1xuXG4vKipcbiAqIEV4dHJhY3RzIHRoZSBzdHJpbmcgdG8gYmUgZW5jcnlwdGVkIHVzaW5nIGJjcnlwdCBvciBBcmdvbjIgZnJvbSB0aGUgZ2l2ZW4gYHBhc3N3b3JkYC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IHBhc3N3b3JkIC0gVGhlIHBhc3N3b3JkIHByb3ZpZGVkIGJ5IHRoZSBjbGllbnQuIEl0IGNhbiBiZTpcbiAqICAtIEEgcGxhaW50ZXh0IHN0cmluZyBwYXNzd29yZC5cbiAqICAtIEFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAgICAgQHByb3BlcnR5IHtzdHJpbmd9IGRpZ2VzdCAtIFRoZSBoYXNoZWQgcGFzc3dvcmQuXG4gKiAgICAgIEBwcm9wZXJ0eSB7c3RyaW5nfSBhbGdvcml0aG0gLSBUaGUgaGFzaGluZyBhbGdvcml0aG0gdXNlZC4gTXVzdCBiZSBcInNoYS0yNTZcIi5cbiAqXG4gKiBAcmV0dXJucyB7c3RyaW5nfSAtIFRoZSByZXN1bHRpbmcgcGFzc3dvcmQgc3RyaW5nIHRvIGVuY3J5cHQuXG4gKlxuICogQHRocm93cyB7RXJyb3J9IC0gSWYgdGhlIGBhbGdvcml0aG1gIGluIHRoZSBwYXNzd29yZCBvYmplY3QgaXMgbm90IFwic2hhLTI1NlwiLlxuICovXG5jb25zdCBnZXRQYXNzd29yZFN0cmluZyA9IHBhc3N3b3JkID0+IHtcbiAgaWYgKHR5cGVvZiBwYXNzd29yZCA9PT0gXCJzdHJpbmdcIikge1xuICAgIHBhc3N3b3JkID0gU0hBMjU2KHBhc3N3b3JkKTtcbiAgfVxuICBlbHNlIHsgLy8gJ3Bhc3N3b3JkJyBpcyBhbiBvYmplY3RcbiAgICBpZiAocGFzc3dvcmQuYWxnb3JpdGhtICE9PSBcInNoYS0yNTZcIikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXNzd29yZCBoYXNoIGFsZ29yaXRobS4gXCIgK1xuICAgICAgICBcIk9ubHkgJ3NoYS0yNTYnIGlzIGFsbG93ZWQuXCIpO1xuICAgIH1cbiAgICBwYXNzd29yZCA9IHBhc3N3b3JkLmRpZ2VzdDtcbiAgfVxuICByZXR1cm4gcGFzc3dvcmQ7XG59O1xuXG4vKipcbiAqIEVuY3J5cHQgdGhlIGdpdmVuIGBwYXNzd29yZGAgdXNpbmcgZWl0aGVyIGJjcnlwdCBvciBBcmdvbjIuXG4gKiBAcGFyYW0gcGFzc3dvcmQgY2FuIGJlIGEgc3RyaW5nIChpbiB3aGljaCBjYXNlIGl0IHdpbGwgYmUgcnVuIHRocm91Z2ggU0hBMjU2IGJlZm9yZSBlbmNyeXB0aW9uKSBvciBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzIGBkaWdlc3RgIGFuZCBgYWxnb3JpdGhtYCAoaW4gd2hpY2ggY2FzZSB3ZSBiY3J5cHQgb3IgQXJnb24yIGBwYXNzd29yZC5kaWdlc3RgKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPHN0cmluZz59IFRoZSBlbmNyeXB0ZWQgcGFzc3dvcmQuXG4gKi9cbmNvbnN0IGhhc2hQYXNzd29yZCA9IGFzeW5jIChwYXNzd29yZCkgPT4ge1xuICBwYXNzd29yZCA9IGdldFBhc3N3b3JkU3RyaW5nKHBhc3N3b3JkKTtcbiAgaWYgKEFjY291bnRzLl9hcmdvbjJFbmFibGVkKCkgPT09IHRydWUpIHtcbiAgICByZXR1cm4gYXdhaXQgYXJnb24yLmhhc2gocGFzc3dvcmQsIHtcbiAgICAgIHR5cGU6IEFjY291bnRzLl9hcmdvbjJUeXBlKCksXG4gICAgICB0aW1lQ29zdDogQWNjb3VudHMuX2FyZ29uMlRpbWVDb3N0KCksXG4gICAgICBtZW1vcnlDb3N0OiBBY2NvdW50cy5fYXJnb24yTWVtb3J5Q29zdCgpLFxuICAgICAgcGFyYWxsZWxpc206IEFjY291bnRzLl9hcmdvbjJQYXJhbGxlbGlzbSgpXG4gICAgfSk7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGF3YWl0IGJjcnlwdEhhc2gocGFzc3dvcmQsIEFjY291bnRzLl9iY3J5cHRSb3VuZHMoKSk7XG4gIH1cbn07XG5cbi8vIEV4dHJhY3QgdGhlIG51bWJlciBvZiByb3VuZHMgdXNlZCBpbiB0aGUgc3BlY2lmaWVkIGJjcnlwdCBoYXNoLlxuY29uc3QgZ2V0Um91bmRzRnJvbUJjcnlwdEhhc2ggPSAoaGFzaCkgPT4ge1xuICBsZXQgcm91bmRzO1xuICBpZiAoaGFzaCkge1xuICAgIGNvbnN0IGhhc2hTZWdtZW50cyA9IGhhc2guc3BsaXQoXCIkXCIpO1xuICAgIGlmIChoYXNoU2VnbWVudHMubGVuZ3RoID4gMikge1xuICAgICAgcm91bmRzID0gcGFyc2VJbnQoaGFzaFNlZ21lbnRzWzJdLCAxMCk7XG4gICAgfVxuICB9XG4gIHJldHVybiByb3VuZHM7XG59O1xuQWNjb3VudHMuX2dldFJvdW5kc0Zyb21CY3J5cHRIYXNoID0gZ2V0Um91bmRzRnJvbUJjcnlwdEhhc2g7XG5cblxuLyoqXG4gKiBFeHRyYWN0IHJlYWRhYmxlIHBhcmFtZXRlcnMgZnJvbSBhbiBBcmdvbjIgaGFzaCBzdHJpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaCAtIFRoZSBBcmdvbjIgaGFzaCBzdHJpbmcuXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgcGFyc2VkIHBhcmFtZXRlcnMuXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgdGhlIGhhc2ggZm9ybWF0IGlzIGludmFsaWQuXG4gKi9cbmZ1bmN0aW9uIGdldEFyZ29uMlBhcmFtcyhoYXNoKSB7XG4gIGNvbnN0IHJlZ2V4ID0gL15cXCQoYXJnb24yKD86aXxkfGlkKSlcXCR2PVxcZCtcXCRtPShcXGQrKSx0PShcXGQrKSxwPShcXGQrKS87XG5cbiAgY29uc3QgbWF0Y2ggPSBoYXNoLm1hdGNoKHJlZ2V4KTtcblxuICBpZiAoIW1hdGNoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBBcmdvbjIgaGFzaCBmb3JtYXQuXCIpO1xuICB9XG5cbiAgY29uc3QgWywgdHlwZSwgbWVtb3J5Q29zdCwgdGltZUNvc3QsIHBhcmFsbGVsaXNtXSA9IG1hdGNoO1xuXG4gIHJldHVybiB7XG4gICAgdHlwZTogQVJHT04yX1RZUEVTW3R5cGVdLFxuICAgIHRpbWVDb3N0OiBwYXJzZUludCh0aW1lQ29zdCwgMTApLFxuICAgIG1lbW9yeUNvc3Q6IHBhcnNlSW50KG1lbW9yeUNvc3QsIDEwKSxcbiAgICBwYXJhbGxlbGlzbTogcGFyc2VJbnQocGFyYWxsZWxpc20sIDEwKVxuICB9O1xufVxuXG5BY2NvdW50cy5fZ2V0QXJnb24yUGFyYW1zID0gZ2V0QXJnb24yUGFyYW1zO1xuXG5jb25zdCBnZXRVc2VyUGFzc3dvcmRIYXNoID0gdXNlciA9PiB7XG4gIHJldHVybiB1c2VyLnNlcnZpY2VzPy5wYXNzd29yZD8uYXJnb24yIHx8IHVzZXIuc2VydmljZXM/LnBhc3N3b3JkPy5iY3J5cHQ7XG59O1xuXG5BY2NvdW50cy5fY2hlY2tQYXNzd29yZFVzZXJGaWVsZHMgPSB7IF9pZDogMSwgc2VydmljZXM6IDEgfTtcblxuY29uc3QgaXNCY3J5cHQgPSAoaGFzaCkgPT4ge1xuICAvLyBiY3J5cHQgaGFzaGVzIHN0YXJ0IHdpdGggJDJhJCBvciAkMmIkXG4gIHJldHVybiBoYXNoLnN0YXJ0c1dpdGgoXCIkMlwiKTtcbn07XG5cbmNvbnN0IGlzQXJnb24gPSAoaGFzaCkgPT4ge1xuICAgIC8vIGFyZ29uMiBoYXNoZXMgc3RhcnQgd2l0aCAkYXJnb24yaSQsICRhcmdvbjJkJCBvciAkYXJnb24yaWQkXG4gICAgcmV0dXJuIGhhc2guc3RhcnRzV2l0aChcIiRhcmdvbjJcIik7XG59XG5cbmNvbnN0IHVwZGF0ZVVzZXJQYXNzd29yZERlZmVyZWQgPSAodXNlciwgZm9ybWF0dGVkUGFzc3dvcmQpID0+IHtcbiAgTWV0ZW9yLmRlZmVyKGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCB1cGRhdGVVc2VyUGFzc3dvcmQodXNlciwgZm9ybWF0dGVkUGFzc3dvcmQpO1xuICB9KTtcbn07XG5cbi8qKlxuICogSGFzaGVzIHRoZSBwcm92aWRlZCBwYXNzd29yZCBhbmQgcmV0dXJucyBhbiBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byB1cGRhdGUgdGhlIHVzZXIncyBwYXNzd29yZC5cbiAqIEBwYXJhbSBmb3JtYXR0ZWRQYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8eyRzZXQ6IHtcInNlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdFwiOiBzdHJpbmd9fXx7JHVuc2V0OiB7XCJzZXJ2aWNlcy5wYXNzd29yZC5iY3J5cHRcIjogbnVtYmVyfSwgJHNldDoge1wic2VydmljZXMucGFzc3dvcmQuYXJnb24yXCI6IHN0cmluZ319Pn1cbiAqL1xuY29uc3QgZ2V0VXBkYXRvckZvclVzZXJQYXNzd29yZCA9IGFzeW5jIChmb3JtYXR0ZWRQYXNzd29yZCkgPT4ge1xuICBjb25zdCBlbmNyeXB0ZWRQYXNzd29yZCA9IGF3YWl0IGhhc2hQYXNzd29yZChmb3JtYXR0ZWRQYXNzd29yZCk7XG4gIGlmIChBY2NvdW50cy5fYXJnb24yRW5hYmxlZCgpID09PSBmYWxzZSkge1xuICAgIHJldHVybiB7XG4gICAgICAkc2V0OiB7XG4gICAgICAgIFwic2VydmljZXMucGFzc3dvcmQuYmNyeXB0XCI6IGVuY3J5cHRlZFBhc3N3b3JkXG4gICAgICB9LFxuICAgICAgJHVuc2V0OiB7XG4gICAgICAgIFwic2VydmljZXMucGFzc3dvcmQuYXJnb24yXCI6IDFcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGVsc2UgaWYgKEFjY291bnRzLl9hcmdvbjJFbmFibGVkKCkgPT09IHRydWUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgJHNldDoge1xuICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLmFyZ29uMlwiOiBlbmNyeXB0ZWRQYXNzd29yZFxuICAgICAgfSxcbiAgICAgICR1bnNldDoge1xuICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdFwiOiAxXG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuY29uc3QgdXBkYXRlVXNlclBhc3N3b3JkID0gYXN5bmMgKHVzZXIsIGZvcm1hdHRlZFBhc3N3b3JkKSA9PiB7XG4gIGNvbnN0IHVwZGF0b3IgPSBhd2FpdCBnZXRVcGRhdG9yRm9yVXNlclBhc3N3b3JkKGZvcm1hdHRlZFBhc3N3b3JkKTtcbiAgYXdhaXQgTWV0ZW9yLnVzZXJzLnVwZGF0ZUFzeW5jKHsgX2lkOiB1c2VyLl9pZCB9LCB1cGRhdG9yKTtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIHByb3ZpZGVkIHBhc3N3b3JkIG1hdGNoZXMgdGhlIGhhc2hlZCBwYXNzd29yZCBzdG9yZWQgaW4gdGhlIHVzZXIncyBkYXRhYmFzZSByZWNvcmQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHVzZXIgLSBUaGUgdXNlciBvYmplY3QgY29udGFpbmluZyBhdCBsZWFzdDpcbiAqICAgQHByb3BlcnR5IHtzdHJpbmd9IF9pZCAtIFRoZSB1c2VyJ3MgdW5pcXVlIGlkZW50aWZpZXIuXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBzZXJ2aWNlcyAtIFRoZSB1c2VyJ3Mgc2VydmljZXMgZGF0YS5cbiAqICAgQHByb3BlcnR5IHtPYmplY3R9IHNlcnZpY2VzLnBhc3N3b3JkIC0gVGhlIHVzZXIncyBwYXNzd29yZCBvYmplY3QuXG4gKiAgIEBwcm9wZXJ0eSB7c3RyaW5nfSBbc2VydmljZXMucGFzc3dvcmQuYXJnb24yXSAtIFRoZSBBcmdvbjIgaGFzaGVkIHBhc3N3b3JkLlxuICogICBAcHJvcGVydHkge3N0cmluZ30gW3NlcnZpY2VzLnBhc3N3b3JkLmJjcnlwdF0gLSBUaGUgYmNyeXB0IGhhc2hlZCBwYXNzd29yZCwgZGVwcmVjYXRlZFxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gcGFzc3dvcmQgLSBUaGUgcGFzc3dvcmQgcHJvdmlkZWQgYnkgdGhlIGNsaWVudC4gSXQgY2FuIGJlOlxuICogICAtIEEgcGxhaW50ZXh0IHN0cmluZyBwYXNzd29yZC5cbiAqICAgLSBBbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKiAgICAgICBAcHJvcGVydHkge3N0cmluZ30gZGlnZXN0IC0gVGhlIGhhc2hlZCBwYXNzd29yZC5cbiAqICAgICAgIEBwcm9wZXJ0eSB7c3RyaW5nfSBhbGdvcml0aG0gLSBUaGUgaGFzaGluZyBhbGdvcml0aG0gdXNlZC4gTXVzdCBiZSBcInNoYS0yNTZcIi5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSAtIEEgcmVzdWx0IG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqICAgQHByb3BlcnR5IHtzdHJpbmd9IHVzZXJJZCAtIFRoZSB1c2VyJ3MgdW5pcXVlIGlkZW50aWZpZXIuXG4gKiAgIEBwcm9wZXJ0eSB7T2JqZWN0fSBbZXJyb3JdIC0gQW4gZXJyb3Igb2JqZWN0IGlmIHRoZSBwYXNzd29yZCBkb2VzIG5vdCBtYXRjaCBvciBhbiBlcnJvciBvY2N1cnMuXG4gKlxuICogQHRocm93cyB7RXJyb3J9IC0gSWYgYW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnMgZHVyaW5nIHRoZSBwcm9jZXNzLlxuICovXG5jb25zdCBjaGVja1Bhc3N3b3JkQXN5bmMgPSBhc3luYyAodXNlciwgcGFzc3dvcmQpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0ge1xuICAgIHVzZXJJZDogdXNlci5faWRcbiAgfTtcblxuICBjb25zdCBmb3JtYXR0ZWRQYXNzd29yZCA9IGdldFBhc3N3b3JkU3RyaW5nKHBhc3N3b3JkKTtcbiAgY29uc3QgaGFzaCA9IGdldFVzZXJQYXNzd29yZEhhc2godXNlcik7XG5cblxuICBjb25zdCBhcmdvbjJFbmFibGVkID0gQWNjb3VudHMuX2FyZ29uMkVuYWJsZWQoKTtcbiAgaWYgKGFyZ29uMkVuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgaWYgKGlzQXJnb24oaGFzaCkpIHtcbiAgICAgIC8vIHRoaXMgaXMgYSByb2xsYmFjayBmZWF0dXJlLCBlbmFibGluZyB0byBzd2l0Y2ggYmFjayBmcm9tIGFyZ29uMiB0byBiY3J5cHQgaWYgbmVlZGVkXG4gICAgICAvLyBUT0RPIDogZGVwcmVjYXRlIHRoaXNcbiAgICAgIGNvbnNvbGUud2FybihcIlVzZXIgaGFzIGFuIGFyZ29uMiBwYXNzd29yZCBhbmQgYXJnb24yIGlzIG5vdCBlbmFibGVkLCByb2xsaW5nIGJhY2sgdG8gYmNyeXB0IGVuY3J5cHRpb25cIik7XG4gICAgICBjb25zdCBtYXRjaCA9IGF3YWl0IGFyZ29uMi52ZXJpZnkoaGFzaCwgZm9ybWF0dGVkUGFzc3dvcmQpO1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXN1bHQuZXJyb3IgPSBBY2NvdW50cy5faGFuZGxlRXJyb3IoXCJJbmNvcnJlY3QgcGFzc3dvcmRcIiwgZmFsc2UpO1xuICAgICAgfVxuICAgICAgZWxzZXtcbiAgICAgICAgLy8gVGhlIHBhc3N3b3JkIGNoZWNrcyBvdXQsIGJ1dCB0aGUgdXNlcidzIHN0b3JlZCBwYXNzd29yZCBuZWVkcyB0byBiZSB1cGRhdGVkIHRvIGFyZ29uMlxuICAgICAgICB1cGRhdGVVc2VyUGFzc3dvcmREZWZlcmVkKHVzZXIsIHsgZGlnZXN0OiBmb3JtYXR0ZWRQYXNzd29yZCwgYWxnb3JpdGhtOiBcInNoYS0yNTZcIiB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBoYXNoUm91bmRzID0gZ2V0Um91bmRzRnJvbUJjcnlwdEhhc2goaGFzaCk7XG4gICAgICBjb25zdCBtYXRjaCA9IGF3YWl0IGJjcnlwdENvbXBhcmUoZm9ybWF0dGVkUGFzc3dvcmQsIGhhc2gpO1xuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICByZXN1bHQuZXJyb3IgPSBBY2NvdW50cy5faGFuZGxlRXJyb3IoXCJJbmNvcnJlY3QgcGFzc3dvcmRcIiwgZmFsc2UpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoaGFzaCkge1xuICAgICAgICBjb25zdCBwYXJhbXNDaGFuZ2VkID0gaGFzaFJvdW5kcyAhPT0gQWNjb3VudHMuX2JjcnlwdFJvdW5kcygpO1xuICAgICAgICAvLyBUaGUgcGFzc3dvcmQgY2hlY2tzIG91dCwgYnV0IHRoZSB1c2VyJ3MgYmNyeXB0IGhhc2ggbmVlZHMgdG8gYmUgdXBkYXRlZFxuICAgICAgICAvLyB0byBtYXRjaCBjdXJyZW50IGJjcnlwdCBzZXR0aW5nc1xuICAgICAgICBpZiAocGFyYW1zQ2hhbmdlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIHVwZGF0ZVVzZXJQYXNzd29yZERlZmVyZWQodXNlciwgeyBkaWdlc3Q6IGZvcm1hdHRlZFBhc3N3b3JkLCBhbGdvcml0aG06IFwic2hhLTI1NlwiIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKGFyZ29uMkVuYWJsZWQgPT09IHRydWUpIHtcbiAgICBpZiAoaXNCY3J5cHQoaGFzaCkpIHtcbiAgICAgIC8vIG1pZ3JhdGlvbiBjb2RlIGZyb20gYmNyeXB0IHRvIGFyZ29uMlxuICAgICAgY29uc3QgbWF0Y2ggPSBhd2FpdCBiY3J5cHRDb21wYXJlKGZvcm1hdHRlZFBhc3N3b3JkLCBoYXNoKTtcbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmVzdWx0LmVycm9yID0gQWNjb3VudHMuX2hhbmRsZUVycm9yKFwiSW5jb3JyZWN0IHBhc3N3b3JkXCIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBUaGUgcGFzc3dvcmQgY2hlY2tzIG91dCwgYnV0IHRoZSB1c2VyJ3Mgc3RvcmVkIHBhc3N3b3JkIG5lZWRzIHRvIGJlIHVwZGF0ZWQgdG8gYXJnb24yXG4gICAgICAgIHVwZGF0ZVVzZXJQYXNzd29yZERlZmVyZWQodXNlciwgeyBkaWdlc3Q6IGZvcm1hdHRlZFBhc3N3b3JkLCBhbGdvcml0aG06IFwic2hhLTI1NlwiIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIGFyZ29uMiBwYXNzd29yZFxuICAgICAgY29uc3QgYXJnb24yUGFyYW1zID0gZ2V0QXJnb24yUGFyYW1zKGhhc2gpO1xuICAgICAgY29uc3QgbWF0Y2ggPSBhd2FpdCBhcmdvbjIudmVyaWZ5KGhhc2gsIGZvcm1hdHRlZFBhc3N3b3JkKTtcbiAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmVzdWx0LmVycm9yID0gQWNjb3VudHMuX2hhbmRsZUVycm9yKFwiSW5jb3JyZWN0IHBhc3N3b3JkXCIsIGZhbHNlKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGhhc2gpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zQ2hhbmdlZCA9IGFyZ29uMlBhcmFtcy5tZW1vcnlDb3N0ICE9PSBBY2NvdW50cy5fYXJnb24yTWVtb3J5Q29zdCgpIHx8XG4gICAgICAgICAgYXJnb24yUGFyYW1zLnRpbWVDb3N0ICE9PSBBY2NvdW50cy5fYXJnb24yVGltZUNvc3QoKSB8fFxuICAgICAgICAgIGFyZ29uMlBhcmFtcy5wYXJhbGxlbGlzbSAhPT0gQWNjb3VudHMuX2FyZ29uMlBhcmFsbGVsaXNtKCkgfHxcbiAgICAgICAgICBhcmdvbjJQYXJhbXMudHlwZSAhPT0gQWNjb3VudHMuX2FyZ29uMlR5cGUoKTtcbiAgICAgICAgaWYgKHBhcmFtc0NoYW5nZWQgPT09IHRydWUpIHtcbiAgICAgICAgICAvLyBUaGUgcGFzc3dvcmQgY2hlY2tzIG91dCwgYnV0IHRoZSB1c2VyJ3MgYXJnb24yIGhhc2ggbmVlZHMgdG8gYmUgdXBkYXRlZCB3aXRoIHRoZSByaWdodCBwYXJhbXNcbiAgICAgICAgICB1cGRhdGVVc2VyUGFzc3dvcmREZWZlcmVkKHVzZXIsIHsgZGlnZXN0OiBmb3JtYXR0ZWRQYXNzd29yZCwgYWxnb3JpdGhtOiBcInNoYS0yNTZcIiB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbkFjY291bnRzLl9jaGVja1Bhc3N3b3JkQXN5bmMgPSBjaGVja1Bhc3N3b3JkQXN5bmM7XG5cbi8vL1xuLy8vIExPR0lOXG4vLy9cblxuXG4vKipcbiAqIEBzdW1tYXJ5IEZpbmRzIHRoZSB1c2VyIGFzeW5jaHJvbm91c2x5IHdpdGggdGhlIHNwZWNpZmllZCB1c2VybmFtZS5cbiAqIEZpcnN0IHRyaWVzIHRvIG1hdGNoIHVzZXJuYW1lIGNhc2Ugc2Vuc2l0aXZlbHk7IGlmIHRoYXQgZmFpbHMsIGl0XG4gKiB0cmllcyBjYXNlIGluc2Vuc2l0aXZlbHk7IGJ1dCBpZiBtb3JlIHRoYW4gb25lIHVzZXIgbWF0Y2hlcyB0aGUgY2FzZVxuICogaW5zZW5zaXRpdmUgc2VhcmNoLCBpdCByZXR1cm5zIG51bGwuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIHRvIGxvb2sgZm9yXG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAcGFyYW0ge01vbmdvRmllbGRTcGVjaWZpZXJ9IG9wdGlvbnMuZmllbGRzIERpY3Rpb25hcnkgb2YgZmllbGRzIHRvIHJldHVybiBvciBleGNsdWRlLlxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0Pn0gQSB1c2VyIGlmIGZvdW5kLCBlbHNlIG51bGxcbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLmZpbmRVc2VyQnlVc2VybmFtZSA9XG4gIGFzeW5jICh1c2VybmFtZSwgb3B0aW9ucykgPT5cbiAgICBhd2FpdCBBY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5KHsgdXNlcm5hbWUgfSwgb3B0aW9ucyk7XG5cbi8qKlxuICogQHN1bW1hcnkgRmluZHMgdGhlIHVzZXIgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgc3BlY2lmaWVkIGVtYWlsLlxuICogRmlyc3QgdHJpZXMgdG8gbWF0Y2ggZW1haWwgY2FzZSBzZW5zaXRpdmVseTsgaWYgdGhhdCBmYWlscywgaXRcbiAqIHRyaWVzIGNhc2UgaW5zZW5zaXRpdmVseTsgYnV0IGlmIG1vcmUgdGhhbiBvbmUgdXNlciBtYXRjaGVzIHRoZSBjYXNlXG4gKiBpbnNlbnNpdGl2ZSBzZWFyY2gsIGl0IHJldHVybnMgbnVsbC5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBlbWFpbCBUaGUgZW1haWwgYWRkcmVzcyB0byBsb29rIGZvclxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtNb25nb0ZpZWxkU3BlY2lmaWVyfSBvcHRpb25zLmZpZWxkcyBEaWN0aW9uYXJ5IG9mIGZpZWxkcyB0byByZXR1cm4gb3IgZXhjbHVkZS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IEEgdXNlciBpZiBmb3VuZCwgZWxzZSBudWxsXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5maW5kVXNlckJ5RW1haWwgPVxuICBhc3luYyAoZW1haWwsIG9wdGlvbnMpID0+XG4gICAgYXdhaXQgQWNjb3VudHMuX2ZpbmRVc2VyQnlRdWVyeSh7IGVtYWlsIH0sIG9wdGlvbnMpO1xuXG4vLyBYWFggbWF5YmUgdGhpcyBiZWxvbmdzIGluIHRoZSBjaGVjayBwYWNrYWdlXG5jb25zdCBOb25FbXB0eVN0cmluZyA9IE1hdGNoLldoZXJlKHggPT4ge1xuICBjaGVjayh4LCBTdHJpbmcpO1xuICByZXR1cm4geC5sZW5ndGggPiAwO1xufSk7XG5cbmNvbnN0IHBhc3N3b3JkVmFsaWRhdG9yID0gTWF0Y2guT25lT2YoXG4gIE1hdGNoLldoZXJlKHN0ciA9PiBNYXRjaC50ZXN0KHN0ciwgU3RyaW5nKSAmJiBzdHIubGVuZ3RoIDw9IE1ldGVvci5zZXR0aW5ncz8ucGFja2FnZXM/LmFjY291bnRzPy5wYXNzd29yZE1heExlbmd0aCB8fCAyNTYpLCB7XG4gICAgZGlnZXN0OiBNYXRjaC5XaGVyZShzdHIgPT4gTWF0Y2gudGVzdChzdHIsIFN0cmluZykgJiYgc3RyLmxlbmd0aCA9PT0gNjQpLFxuICAgIGFsZ29yaXRobTogTWF0Y2guT25lT2YoJ3NoYS0yNTYnKVxuICB9XG4pO1xuXG4vLyBIYW5kbGVyIHRvIGxvZ2luIHdpdGggYSBwYXNzd29yZC5cbi8vXG4vLyBUaGUgTWV0ZW9yIGNsaWVudCBzZXRzIG9wdGlvbnMucGFzc3dvcmQgdG8gYW4gb2JqZWN0IHdpdGgga2V5c1xuLy8gJ2RpZ2VzdCcgKHNldCB0byBTSEEyNTYocGFzc3dvcmQpKSBhbmQgJ2FsZ29yaXRobScgKFwic2hhLTI1NlwiKS5cbi8vXG4vLyBGb3Igb3RoZXIgRERQIGNsaWVudHMgd2hpY2ggZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gU0hBLCB0aGUgaGFuZGxlclxuLy8gYWxzbyBhY2NlcHRzIHRoZSBwbGFpbnRleHQgcGFzc3dvcmQgaW4gb3B0aW9ucy5wYXNzd29yZCBhcyBhIHN0cmluZy5cbi8vXG4vLyAoSXQgbWlnaHQgYmUgbmljZSBpZiBzZXJ2ZXJzIGNvdWxkIHR1cm4gdGhlIHBsYWludGV4dCBwYXNzd29yZFxuLy8gb3B0aW9uIG9mZi4gT3IgbWF5YmUgaXQgc2hvdWxkIGJlIG9wdC1pbiwgbm90IG9wdC1vdXQ/XG4vLyBBY2NvdW50cy5jb25maWcgb3B0aW9uPylcbi8vXG4vLyBOb3RlIHRoYXQgbmVpdGhlciBwYXNzd29yZCBvcHRpb24gaXMgc2VjdXJlIHdpdGhvdXQgU1NMLlxuLy9cbkFjY291bnRzLnJlZ2lzdGVyTG9naW5IYW5kbGVyKFwicGFzc3dvcmRcIiwgYXN5bmMgb3B0aW9ucyA9PiB7XG4gIGlmICghb3B0aW9ucy5wYXNzd29yZClcbiAgICByZXR1cm4gdW5kZWZpbmVkOyAvLyBkb24ndCBoYW5kbGVcblxuICBjaGVjayhvcHRpb25zLCB7XG4gICAgdXNlcjogQWNjb3VudHMuX3VzZXJRdWVyeVZhbGlkYXRvcixcbiAgICBwYXNzd29yZDogcGFzc3dvcmRWYWxpZGF0b3IsXG4gICAgY29kZTogTWF0Y2guT3B0aW9uYWwoTm9uRW1wdHlTdHJpbmcpLFxuICB9KTtcblxuXG4gIGNvbnN0IHVzZXIgPSBhd2FpdCBBY2NvdW50cy5fZmluZFVzZXJCeVF1ZXJ5KG9wdGlvbnMudXNlciwge2ZpZWxkczoge1xuICAgIHNlcnZpY2VzOiAxLFxuICAgIC4uLkFjY291bnRzLl9jaGVja1Bhc3N3b3JkVXNlckZpZWxkcyxcbiAgfX0pO1xuICBpZiAoIXVzZXIpIHtcbiAgICBBY2NvdW50cy5faGFuZGxlRXJyb3IoXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgfVxuXG4gIGlmICghZ2V0VXNlclBhc3N3b3JkSGFzaCh1c2VyKSkge1xuICAgIEFjY291bnRzLl9oYW5kbGVFcnJvcihcIlVzZXIgaGFzIG5vIHBhc3N3b3JkIHNldFwiKTtcbiAgfVxuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrUGFzc3dvcmRBc3luYyh1c2VyLCBvcHRpb25zLnBhc3N3b3JkKTtcbiAgLy8gVGhpcyBtZXRob2QgaXMgYWRkZWQgYnkgdGhlIHBhY2thZ2UgYWNjb3VudHMtMmZhXG4gIC8vIEZpcnN0IHRoZSBsb2dpbiBpcyB2YWxpZGF0ZWQsIHRoZW4gdGhlIGNvZGUgc2l0dWF0aW9uIGlzIGNoZWNrZWRcbiAgaWYgKFxuICAgICFyZXN1bHQuZXJyb3IgJiZcbiAgICBBY2NvdW50cy5fY2hlY2syZmFFbmFibGVkPy4odXNlcilcbiAgKSB7XG4gICAgaWYgKCFvcHRpb25zLmNvZGUpIHtcbiAgICAgIEFjY291bnRzLl9oYW5kbGVFcnJvcignMkZBIGNvZGUgbXVzdCBiZSBpbmZvcm1lZCcsIHRydWUsICduby0yZmEtY29kZScpO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICAhQWNjb3VudHMuX2lzVG9rZW5WYWxpZChcbiAgICAgICAgdXNlci5zZXJ2aWNlcy50d29GYWN0b3JBdXRoZW50aWNhdGlvbi5zZWNyZXQsXG4gICAgICAgIG9wdGlvbnMuY29kZVxuICAgICAgKVxuICAgICkge1xuICAgICAgQWNjb3VudHMuX2hhbmRsZUVycm9yKCdJbnZhbGlkIDJGQSBjb2RlJywgdHJ1ZSwgJ2ludmFsaWQtMmZhLWNvZGUnKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufSk7XG5cbi8vL1xuLy8vIENIQU5HSU5HXG4vLy9cblxuLyoqXG4gKiBAc3VtbWFyeSBDaGFuZ2UgYSB1c2VyJ3MgdXNlcm5hbWUgYXN5bmNocm9ub3VzbHkuIFVzZSB0aGlzIGluc3RlYWQgb2YgdXBkYXRpbmcgdGhlXG4gKiBkYXRhYmFzZSBkaXJlY3RseS4gVGhlIG9wZXJhdGlvbiB3aWxsIGZhaWwgaWYgdGhlcmUgaXMgYW4gZXhpc3RpbmcgdXNlclxuICogd2l0aCBhIHVzZXJuYW1lIG9ubHkgZGlmZmVyaW5nIGluIGNhc2UuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBJRCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmV3VXNlcm5hbWUgQSBuZXcgdXNlcm5hbWUgZm9yIHRoZSB1c2VyLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuc2V0VXNlcm5hbWUgPVxuICBhc3luYyAodXNlcklkLCBuZXdVc2VybmFtZSkgPT4ge1xuICAgIGNoZWNrKHVzZXJJZCwgTm9uRW1wdHlTdHJpbmcpO1xuICAgIGNoZWNrKG5ld1VzZXJuYW1lLCBOb25FbXB0eVN0cmluZyk7XG5cbiAgICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckJ5SWQodXNlcklkLCB7XG4gICAgICBmaWVsZHM6IHtcbiAgICAgICAgdXNlcm5hbWU6IDEsXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoIXVzZXIpIHtcbiAgICAgIEFjY291bnRzLl9oYW5kbGVFcnJvcihcIlVzZXIgbm90IGZvdW5kXCIpO1xuICAgIH1cblxuICAgIGNvbnN0IG9sZFVzZXJuYW1lID0gdXNlci51c2VybmFtZTtcblxuICAgIC8vIFBlcmZvcm0gYSBjYXNlIGluc2Vuc2l0aXZlIGNoZWNrIGZvciBkdXBsaWNhdGVzIGJlZm9yZSB1cGRhdGVcbiAgICBhd2FpdCBBY2NvdW50cy5fY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCd1c2VybmFtZScsXG4gICAgICAnVXNlcm5hbWUnLCBuZXdVc2VybmFtZSwgdXNlci5faWQpO1xuXG4gICAgYXdhaXQgTWV0ZW9yLnVzZXJzLnVwZGF0ZUFzeW5jKHsgX2lkOiB1c2VyLl9pZCB9LCB7ICRzZXQ6IHsgdXNlcm5hbWU6IG5ld1VzZXJuYW1lIH0gfSk7XG5cbiAgICAvLyBQZXJmb3JtIGFub3RoZXIgY2hlY2sgYWZ0ZXIgdXBkYXRlLCBpbiBjYXNlIGEgbWF0Y2hpbmcgdXNlciBoYXMgYmVlblxuICAgIC8vIGluc2VydGVkIGluIHRoZSBtZWFudGltZVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBBY2NvdW50cy5fY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKCd1c2VybmFtZScsXG4gICAgICAgICdVc2VybmFtZScsIG5ld1VzZXJuYW1lLCB1c2VyLl9pZCk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8vIFVuZG8gdXBkYXRlIGlmIHRoZSBjaGVjayBmYWlsc1xuICAgICAgYXdhaXQgTWV0ZW9yLnVzZXJzLnVwZGF0ZUFzeW5jKHsgX2lkOiB1c2VyLl9pZCB9LCB7ICRzZXQ6IHsgdXNlcm5hbWU6IG9sZFVzZXJuYW1lIH0gfSk7XG4gICAgICB0aHJvdyBleDtcbiAgICB9XG4gIH07XG5cbi8vIExldCB0aGUgdXNlciBjaGFuZ2UgdGhlaXIgb3duIHBhc3N3b3JkIGlmIHRoZXkga25vdyB0aGUgb2xkXG4vLyBwYXNzd29yZC4gYG9sZFBhc3N3b3JkYCBhbmQgYG5ld1Bhc3N3b3JkYCBzaG91bGQgYmUgb2JqZWN0cyB3aXRoIGtleXNcbi8vIGBkaWdlc3RgIGFuZCBgYWxnb3JpdGhtYCAocmVwcmVzZW50aW5nIHRoZSBTSEEyNTYgb2YgdGhlIHBhc3N3b3JkKS5cbk1ldGVvci5tZXRob2RzKFxuICB7XG4gICAgY2hhbmdlUGFzc3dvcmQ6IGFzeW5jIGZ1bmN0aW9uKG9sZFBhc3N3b3JkLCBuZXdQYXNzd29yZCkge1xuICAgICAgY2hlY2sob2xkUGFzc3dvcmQsIHBhc3N3b3JkVmFsaWRhdG9yKTtcbiAgICAgIGNoZWNrKG5ld1Bhc3N3b3JkLCBwYXNzd29yZFZhbGlkYXRvcik7XG5cbiAgICAgIGlmICghdGhpcy51c2VySWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDEsIFwiTXVzdCBiZSBsb2dnZWQgaW5cIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHVzZXIgPSBhd2FpdCBnZXRVc2VyQnlJZCh0aGlzLnVzZXJJZCwge1xuICAgICAgICBmaWVsZHM6IHtcbiAgICAgICAgICBzZXJ2aWNlczogMSxcbiAgICAgICAgICAuLi5BY2NvdW50cy5fY2hlY2tQYXNzd29yZFVzZXJGaWVsZHNcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgQWNjb3VudHMuX2hhbmRsZUVycm9yKFwiVXNlciBub3QgZm91bmRcIik7XG4gICAgICB9XG5cbiAgICAgIGlmICghZ2V0VXNlclBhc3N3b3JkSGFzaCh1c2VyKSkge1xuICAgICAgICBBY2NvdW50cy5faGFuZGxlRXJyb3IoXCJVc2VyIGhhcyBubyBwYXNzd29yZCBzZXRcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNoZWNrUGFzc3dvcmRBc3luYyh1c2VyLCBvbGRQYXNzd29yZCk7XG4gICAgICBpZiAocmVzdWx0LmVycm9yKSB7XG4gICAgICAgIHRocm93IHJlc3VsdC5lcnJvcjtcbiAgICAgIH1cblxuICAgICAgLy8gSXQgd291bGQgYmUgYmV0dGVyIGlmIHRoaXMgcmVtb3ZlZCBBTEwgZXhpc3RpbmcgdG9rZW5zIGFuZCByZXBsYWNlZFxuICAgICAgLy8gdGhlIHRva2VuIGZvciB0aGUgY3VycmVudCBjb25uZWN0aW9uIHdpdGggYSBuZXcgb25lLCBidXQgdGhhdCB3b3VsZFxuICAgICAgLy8gYmUgdHJpY2t5LCBzbyB3ZSdsbCBzZXR0bGUgZm9yIGp1c3QgcmVwbGFjaW5nIGFsbCB0b2tlbnMgb3RoZXIgdGhhblxuICAgICAgLy8gdGhlIG9uZSBmb3IgdGhlIGN1cnJlbnQgY29ubmVjdGlvbi5cbiAgICAgIGNvbnN0IGN1cnJlbnRUb2tlbiA9IEFjY291bnRzLl9nZXRMb2dpblRva2VuKHRoaXMuY29ubmVjdGlvbi5pZCk7XG4gICAgICBjb25zdCB1cGRhdG9yID0gYXdhaXQgZ2V0VXBkYXRvckZvclVzZXJQYXNzd29yZChuZXdQYXNzd29yZCk7XG5cbiAgICAgIGF3YWl0IE1ldGVvci51c2Vycy51cGRhdGVBc3luYyhcbiAgICAgICAgeyBfaWQ6IHRoaXMudXNlcklkIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAkc2V0OiB1cGRhdG9yLiRzZXQsXG4gICAgICAgICAgJHB1bGw6IHtcbiAgICAgICAgICAgIFwic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCI6IHsgaGFzaGVkVG9rZW46IHsgJG5lOiBjdXJyZW50VG9rZW4gfSB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAkdW5zZXQ6IHsgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldFwiOiAxLCAuLi51cGRhdG9yLiR1bnNldCB9XG4gICAgICAgIH1cbiAgICAgICk7XG5cbiAgICAgIHJldHVybiB7IHBhc3N3b3JkQ2hhbmdlZDogdHJ1ZSB9O1xuICAgIH1cbiAgfSk7XG5cblxuLy8gRm9yY2UgY2hhbmdlIHRoZSB1c2VycyBwYXNzd29yZC5cblxuLyoqXG4gKiBAc3VtbWFyeSBGb3JjaWJseSBjaGFuZ2UgdGhlIHBhc3N3b3JkIGZvciBhIHVzZXIuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byB1cGRhdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmV3UGxhaW50ZXh0UGFzc3dvcmQgQSBuZXcgcGFzc3dvcmQgZm9yIHRoZSB1c2VyLlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMubG9nb3V0IExvZ291dCBhbGwgY3VycmVudCBjb25uZWN0aW9ucyB3aXRoIHRoaXMgdXNlcklkIChkZWZhdWx0OiB0cnVlKVxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuc2V0UGFzc3dvcmRBc3luYyA9XG4gIGFzeW5jICh1c2VySWQsIG5ld1BsYWludGV4dFBhc3N3b3JkLCBvcHRpb25zKSA9PiB7XG4gICAgY2hlY2sodXNlcklkLCBTdHJpbmcpO1xuICAgIGNoZWNrKG5ld1BsYWludGV4dFBhc3N3b3JkLCBNYXRjaC5XaGVyZShzdHIgPT4gTWF0Y2gudGVzdChzdHIsIFN0cmluZykgJiYgc3RyLmxlbmd0aCA8PSBNZXRlb3Iuc2V0dGluZ3M/LnBhY2thZ2VzPy5hY2NvdW50cz8ucGFzc3dvcmRNYXhMZW5ndGggfHwgMjU2KSk7XG4gICAgY2hlY2sob3B0aW9ucywgTWF0Y2guTWF5YmUoeyBsb2dvdXQ6IEJvb2xlYW4gfSkpO1xuICAgIG9wdGlvbnMgPSB7IGxvZ291dDogdHJ1ZSwgLi4ub3B0aW9ucyB9O1xuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IGdldFVzZXJCeUlkKHVzZXJJZCwgeyBmaWVsZHM6IHsgX2lkOiAxIH0gfSk7XG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgICB9XG5cbiAgICBsZXQgdXBkYXRvciA9IGF3YWl0IGdldFVwZGF0b3JGb3JVc2VyUGFzc3dvcmQobmV3UGxhaW50ZXh0UGFzc3dvcmQpO1xuICAgIHVwZGF0b3IuJHVuc2V0ID0gdXBkYXRvci4kdW5zZXQgfHwge307XG4gICAgdXBkYXRvci4kdW5zZXRbXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldFwiXSA9IDE7XG5cbiAgICBpZiAob3B0aW9ucy5sb2dvdXQpIHtcbiAgICAgIHVwZGF0b3IuJHVuc2V0W1wic2VydmljZXMucmVzdW1lLmxvZ2luVG9rZW5zXCJdID0gMTtcbiAgICB9XG5cbiAgICBhd2FpdCBNZXRlb3IudXNlcnMudXBkYXRlQXN5bmMoeyBfaWQ6IHVzZXIuX2lkIH0sIHVwZGF0b3IpO1xuICB9O1xuXG4vLy9cbi8vLyBSRVNFVFRJTkcgVklBIEVNQUlMXG4vLy9cblxuLy8gVXRpbGl0eSBmb3IgcGx1Y2tpbmcgYWRkcmVzc2VzIGZyb20gZW1haWxzXG5jb25zdCBwbHVja0FkZHJlc3NlcyA9IChlbWFpbHMgPSBbXSkgPT4gZW1haWxzLm1hcChlbWFpbCA9PiBlbWFpbC5hZGRyZXNzKTtcblxuLy8gTWV0aG9kIGNhbGxlZCBieSBhIHVzZXIgdG8gcmVxdWVzdCBhIHBhc3N3b3JkIHJlc2V0IGVtYWlsLiBUaGlzIGlzXG4vLyB0aGUgc3RhcnQgb2YgdGhlIHJlc2V0IHByb2Nlc3MuXG5NZXRlb3IubWV0aG9kcyh7Zm9yZ290UGFzc3dvcmQ6IGFzeW5jIG9wdGlvbnMgPT4ge1xuICBjaGVjayhvcHRpb25zLCB7ZW1haWw6IFN0cmluZ30pXG5cbiAgY29uc3QgdXNlciA9IGF3YWl0IEFjY291bnRzLmZpbmRVc2VyQnlFbWFpbChvcHRpb25zLmVtYWlsLCB7IGZpZWxkczogeyBlbWFpbHM6IDEgfSB9KTtcblxuICBpZiAoIXVzZXIpIHtcbiAgICBBY2NvdW50cy5faGFuZGxlRXJyb3IoXCJVc2VyIG5vdCBmb3VuZFwiKTtcbiAgfVxuXG4gIGNvbnN0IGVtYWlscyA9IHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKTtcbiAgY29uc3QgY2FzZVNlbnNpdGl2ZUVtYWlsID0gZW1haWxzLmZpbmQoXG4gICAgZW1haWwgPT4gZW1haWwudG9Mb3dlckNhc2UoKSA9PT0gb3B0aW9ucy5lbWFpbC50b0xvd2VyQ2FzZSgpXG4gICk7XG5cbiAgYXdhaXQgQWNjb3VudHMuc2VuZFJlc2V0UGFzc3dvcmRFbWFpbCh1c2VyLl9pZCwgY2FzZVNlbnNpdGl2ZUVtYWlsKTtcbn19KTtcblxuLyoqXG4gKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBnZW5lcmF0ZXMgYSByZXNldCB0b2tlbiBhbmQgc2F2ZXMgaXQgaW50byB0aGUgZGF0YWJhc2UuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byBnZW5lcmF0ZSB0aGUgcmVzZXQgdG9rZW4gZm9yLlxuICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIgdG8gZ2VuZXJhdGUgdGhlIHJlc2V0IHRva2VuIGZvci4gVGhpcyBhZGRyZXNzIG11c3QgYmUgaW4gdGhlIHVzZXIncyBgZW1haWxzYCBsaXN0LiBJZiBgbnVsbGAsIGRlZmF1bHRzIHRvIHRoZSBmaXJzdCBlbWFpbCBpbiB0aGUgbGlzdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSByZWFzb24gYHJlc2V0UGFzc3dvcmRgIG9yIGBlbnJvbGxBY2NvdW50YC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFUb2tlbkRhdGFdIE9wdGlvbmFsIGFkZGl0aW9uYWwgZGF0YSB0byBiZSBhZGRlZCBpbnRvIHRoZSB0b2tlbiByZWNvcmQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxPYmplY3Q+fSBQcm9taXNlIG9mIGFuIG9iamVjdCB3aXRoIHtlbWFpbCwgdXNlciwgdG9rZW59IHZhbHVlcy5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLmdlbmVyYXRlUmVzZXRUb2tlbiA9XG4gIGFzeW5jICh1c2VySWQsIGVtYWlsLCByZWFzb24sIGV4dHJhVG9rZW5EYXRhKSA9PiB7XG4gIC8vIE1ha2Ugc3VyZSB0aGUgdXNlciBleGlzdHMsIGFuZCBlbWFpbCBpcyBvbmUgb2YgdGhlaXIgYWRkcmVzc2VzLlxuICAvLyBEb24ndCBsaW1pdCB0aGUgZmllbGRzIGluIHRoZSB1c2VyIG9iamVjdCBzaW5jZSB0aGUgdXNlciBpcyByZXR1cm5lZFxuICAvLyBieSB0aGUgZnVuY3Rpb24gYW5kIHNvbWUgb3RoZXIgZmllbGRzIG1pZ2h0IGJlIHVzZWQgZWxzZXdoZXJlLlxuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckJ5SWQodXNlcklkKTtcbiAgaWYgKCF1c2VyKSB7XG4gICAgQWNjb3VudHMuX2hhbmRsZUVycm9yKFwiQ2FuJ3QgZmluZCB1c2VyXCIpO1xuICB9XG5cbiAgLy8gcGljayB0aGUgZmlyc3QgZW1haWwgaWYgd2Ugd2VyZW4ndCBwYXNzZWQgYW4gZW1haWwuXG4gIGlmICghZW1haWwgJiYgdXNlci5lbWFpbHMgJiYgdXNlci5lbWFpbHNbMF0pIHtcbiAgICBlbWFpbCA9IHVzZXIuZW1haWxzWzBdLmFkZHJlc3M7XG4gIH1cblxuICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIHZhbGlkIGVtYWlsXG4gIGlmICghZW1haWwgfHxcbiAgICAhKHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKS5pbmNsdWRlcyhlbWFpbCkpKSB7XG4gICAgQWNjb3VudHMuX2hhbmRsZUVycm9yKFwiTm8gc3VjaCBlbWFpbCBmb3IgdXNlci5cIik7XG4gIH1cblxuICBjb25zdCB0b2tlbiA9IFJhbmRvbS5zZWNyZXQoKTtcbiAgY29uc3QgdG9rZW5SZWNvcmQgPSB7XG4gICAgdG9rZW4sXG4gICAgZW1haWwsXG4gICAgd2hlbjogbmV3IERhdGUoKVxuICB9O1xuXG4gIGlmIChyZWFzb24gPT09ICdyZXNldFBhc3N3b3JkJykge1xuICAgIHRva2VuUmVjb3JkLnJlYXNvbiA9ICdyZXNldCc7XG4gIH0gZWxzZSBpZiAocmVhc29uID09PSAnZW5yb2xsQWNjb3VudCcpIHtcbiAgICB0b2tlblJlY29yZC5yZWFzb24gPSAnZW5yb2xsJztcbiAgfSBlbHNlIGlmIChyZWFzb24pIHtcbiAgICAvLyBmYWxsYmFjayBzbyB0aGF0IHRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgZm9yIHVua25vd24gcmVhc29ucyBhcyB3ZWxsXG4gICAgdG9rZW5SZWNvcmQucmVhc29uID0gcmVhc29uO1xuICB9XG5cbiAgaWYgKGV4dHJhVG9rZW5EYXRhKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0b2tlblJlY29yZCwgZXh0cmFUb2tlbkRhdGEpO1xuICB9XG4gIC8vIGlmIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBmcm9tIHRoZSBlbnJvbGwgYWNjb3VudCB3b3JrLWZsb3cgdGhlblxuICAvLyBzdG9yZSB0aGUgdG9rZW4gcmVjb3JkIGluICdzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwnIGRiIGZpZWxkXG4gIC8vIGVsc2Ugc3RvcmUgdGhlIHRva2VuIHJlY29yZCBpbiBpbiAnc2VydmljZXMucGFzc3dvcmQucmVzZXQnIGRiIGZpZWxkXG4gIGlmIChyZWFzb24gPT09IFwiZW5yb2xsQWNjb3VudFwiKSB7XG4gICAgYXdhaXQgTWV0ZW9yLnVzZXJzLnVwZGF0ZUFzeW5jKFxuICAgICAgeyBfaWQ6IHVzZXIuX2lkIH0sXG4gICAgICB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLmVucm9sbFwiOiB0b2tlblJlY29yZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgICAvLyBiZWZvcmUgcGFzc2luZyB0byB0ZW1wbGF0ZSwgdXBkYXRlIHVzZXIgb2JqZWN0IHdpdGggbmV3IHRva2VuXG4gICAgTWV0ZW9yLl9lbnN1cmUodXNlciwgXCJzZXJ2aWNlc1wiLCBcInBhc3N3b3JkXCIpLmVucm9sbCA9IHRva2VuUmVjb3JkO1xuICB9XG4gIGVsc2Uge1xuICAgIGF3YWl0IE1ldGVvci51c2Vycy51cGRhdGVBc3luYyhcbiAgICAgIHsgX2lkOiB1c2VyLl9pZCB9LFxuICAgICAge1xuICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgXCJzZXJ2aWNlcy5wYXNzd29yZC5yZXNldFwiOiB0b2tlblJlY29yZFxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgICAvLyBiZWZvcmUgcGFzc2luZyB0byB0ZW1wbGF0ZSwgdXBkYXRlIHVzZXIgb2JqZWN0IHdpdGggbmV3IHRva2VuXG4gICAgTWV0ZW9yLl9lbnN1cmUodXNlciwgXCJzZXJ2aWNlc1wiLCBcInBhc3N3b3JkXCIpLnJlc2V0ID0gdG9rZW5SZWNvcmQ7XG4gIH1cblxuICByZXR1cm4geyBlbWFpbCwgdXNlciwgdG9rZW4gfTtcbn07XG5cbi8qKlxuICogQHN1bW1hcnkgR2VuZXJhdGVzIGFzeW5jaHJvbm91c2x5IGFuIGUtbWFpbCB2ZXJpZmljYXRpb24gdG9rZW4gYW5kIHNhdmVzIGl0IGludG8gdGhlIGRhdGFiYXNlLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gZ2VuZXJhdGUgdGhlICBlLW1haWwgdmVyaWZpY2F0aW9uIHRva2VuIGZvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBlbWFpbCBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyIHRvIGdlbmVyYXRlIHRoZSBlLW1haWwgdmVyaWZpY2F0aW9uIHRva2VuIGZvci4gVGhpcyBhZGRyZXNzIG11c3QgYmUgaW4gdGhlIHVzZXIncyBgZW1haWxzYCBsaXN0LiBJZiBgbnVsbGAsIGRlZmF1bHRzIHRvIHRoZSBmaXJzdCB1bnZlcmlmaWVkIGVtYWlsIGluIHRoZSBsaXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtleHRyYVRva2VuRGF0YV0gT3B0aW9uYWwgYWRkaXRpb25hbCBkYXRhIHRvIGJlIGFkZGVkIGludG8gdGhlIHRva2VuIHJlY29yZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IFByb21pc2Ugb2YgYW4gb2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbn0gdmFsdWVzLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuZ2VuZXJhdGVWZXJpZmljYXRpb25Ub2tlbiA9XG4gIGFzeW5jICh1c2VySWQsIGVtYWlsLCBleHRyYVRva2VuRGF0YSkgPT4ge1xuICAvLyBNYWtlIHN1cmUgdGhlIHVzZXIgZXhpc3RzLCBhbmQgZW1haWwgaXMgb25lIG9mIHRoZWlyIGFkZHJlc3Nlcy5cbiAgLy8gRG9uJ3QgbGltaXQgdGhlIGZpZWxkcyBpbiB0aGUgdXNlciBvYmplY3Qgc2luY2UgdGhlIHVzZXIgaXMgcmV0dXJuZWRcbiAgLy8gYnkgdGhlIGZ1bmN0aW9uIGFuZCBzb21lIG90aGVyIGZpZWxkcyBtaWdodCBiZSB1c2VkIGVsc2V3aGVyZS5cbiAgY29uc3QgdXNlciA9IGF3YWl0IGdldFVzZXJCeUlkKHVzZXJJZCk7XG4gIGlmICghdXNlcikge1xuICAgIEFjY291bnRzLl9oYW5kbGVFcnJvcihcIkNhbid0IGZpbmQgdXNlclwiKTtcbiAgfVxuXG4gIC8vIHBpY2sgdGhlIGZpcnN0IHVudmVyaWZpZWQgZW1haWwgaWYgd2Ugd2VyZW4ndCBwYXNzZWQgYW4gZW1haWwuXG4gIGlmICghZW1haWwpIHtcbiAgICBjb25zdCBlbWFpbFJlY29yZCA9ICh1c2VyLmVtYWlscyB8fCBbXSkuZmluZChlID0+ICFlLnZlcmlmaWVkKTtcbiAgICBlbWFpbCA9IChlbWFpbFJlY29yZCB8fCB7fSkuYWRkcmVzcztcblxuICAgIGlmICghZW1haWwpIHtcbiAgICAgIEFjY291bnRzLl9oYW5kbGVFcnJvcihcIlRoYXQgdXNlciBoYXMgbm8gdW52ZXJpZmllZCBlbWFpbCBhZGRyZXNzZXMuXCIpO1xuICAgIH1cbiAgfVxuXG4gIC8vIG1ha2Ugc3VyZSB3ZSBoYXZlIGEgdmFsaWQgZW1haWxcbiAgaWYgKCFlbWFpbCB8fFxuICAgICEocGx1Y2tBZGRyZXNzZXModXNlci5lbWFpbHMpLmluY2x1ZGVzKGVtYWlsKSkpIHtcbiAgICBBY2NvdW50cy5faGFuZGxlRXJyb3IoXCJObyBzdWNoIGVtYWlsIGZvciB1c2VyLlwiKTtcbiAgfVxuXG4gIGNvbnN0IHRva2VuID0gUmFuZG9tLnNlY3JldCgpO1xuICBjb25zdCB0b2tlblJlY29yZCA9IHtcbiAgICB0b2tlbixcbiAgICAvLyBUT0RPOiBUaGlzIHNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIHRvIFwiZW1haWxcIiB0byBtYXRjaCByZXNldCB0b2tlbiByZWNvcmQuXG4gICAgYWRkcmVzczogZW1haWwsXG4gICAgd2hlbjogbmV3IERhdGUoKVxuICB9O1xuXG4gIGlmIChleHRyYVRva2VuRGF0YSkge1xuICAgIE9iamVjdC5hc3NpZ24odG9rZW5SZWNvcmQsIGV4dHJhVG9rZW5EYXRhKTtcbiAgfVxuXG4gIGF3YWl0IE1ldGVvci51c2Vycy51cGRhdGVBc3luYyh7X2lkOiB1c2VyLl9pZH0sIHskcHVzaDoge1xuICAgICdzZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMnOiB0b2tlblJlY29yZFxuICB9fSk7XG5cbiAgLy8gYmVmb3JlIHBhc3NpbmcgdG8gdGVtcGxhdGUsIHVwZGF0ZSB1c2VyIG9iamVjdCB3aXRoIG5ldyB0b2tlblxuICBNZXRlb3IuX2Vuc3VyZSh1c2VyLCAnc2VydmljZXMnLCAnZW1haWwnKTtcbiAgaWYgKCF1c2VyLnNlcnZpY2VzLmVtYWlsLnZlcmlmaWNhdGlvblRva2Vucykge1xuICAgIHVzZXIuc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zID0gW107XG4gIH1cbiAgdXNlci5zZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMucHVzaCh0b2tlblJlY29yZCk7XG5cbiAgcmV0dXJuIHtlbWFpbCwgdXNlciwgdG9rZW59O1xufTtcblxuXG4vLyBzZW5kIHRoZSB1c2VyIGFuIGVtYWlsIHdpdGggYSBsaW5rIHRoYXQgd2hlbiBvcGVuZWQgYWxsb3dzIHRoZSB1c2VyXG4vLyB0byBzZXQgYSBuZXcgcGFzc3dvcmQsIHdpdGhvdXQgdGhlIG9sZCBwYXNzd29yZC5cblxuLyoqXG4gKiBAc3VtbWFyeSBTZW5kIGFuIGVtYWlsIGFzeW5jaHJvbm91c2x5IHdpdGggYSBsaW5rIHRoZSB1c2VyIGNhbiB1c2UgdG8gcmVzZXQgdGhlaXIgcGFzc3dvcmQuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byBzZW5kIGVtYWlsIHRvLlxuICogQHBhcmFtIHtTdHJpbmd9IFtlbWFpbF0gT3B0aW9uYWwuIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIncyB0byBzZW5kIHRoZSBlbWFpbCB0by4gVGhpcyBhZGRyZXNzIG11c3QgYmUgaW4gdGhlIHVzZXIncyBgZW1haWxzYCBsaXN0LiBEZWZhdWx0cyB0byB0aGUgZmlyc3QgZW1haWwgaW4gdGhlIGxpc3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhVG9rZW5EYXRhXSBPcHRpb25hbCBhZGRpdGlvbmFsIGRhdGEgdG8gYmUgYWRkZWQgaW50byB0aGUgdG9rZW4gcmVjb3JkLlxuICogQHBhcmFtIHtPYmplY3R9IFtleHRyYVBhcmFtc10gT3B0aW9uYWwgYWRkaXRpb25hbCBwYXJhbXMgdG8gYmUgYWRkZWQgdG8gdGhlIHJlc2V0IHVybC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IFByb21pc2Ugb2YgYW4gb2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZW5kUmVzZXRQYXNzd29yZEVtYWlsID1cbiAgYXN5bmMgKHVzZXJJZCwgZW1haWwsIGV4dHJhVG9rZW5EYXRhLCBleHRyYVBhcmFtcykgPT4ge1xuICAgIGNvbnN0IHsgZW1haWw6IHJlYWxFbWFpbCwgdXNlciwgdG9rZW4gfSA9XG4gICAgICBhd2FpdCBBY2NvdW50cy5nZW5lcmF0ZVJlc2V0VG9rZW4odXNlcklkLCBlbWFpbCwgJ3Jlc2V0UGFzc3dvcmQnLCBleHRyYVRva2VuRGF0YSk7XG4gICAgY29uc3QgdXJsID0gQWNjb3VudHMudXJscy5yZXNldFBhc3N3b3JkKHRva2VuLCBleHRyYVBhcmFtcyk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IGF3YWl0IEFjY291bnRzLmdlbmVyYXRlT3B0aW9uc0ZvckVtYWlsKHJlYWxFbWFpbCwgdXNlciwgdXJsLCAncmVzZXRQYXNzd29yZCcpO1xuICAgIGF3YWl0IEVtYWlsLnNlbmRBc3luYyhvcHRpb25zKTtcblxuICAgIGlmIChNZXRlb3IuaXNEZXZlbG9wbWVudCAmJiAhTWV0ZW9yLmlzUGFja2FnZVRlc3QpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBcXG5SZXNldCBwYXNzd29yZCBVUkw6ICR7IHVybCB9YCk7XG4gICAgfVxuICAgIHJldHVybiB7IGVtYWlsOiByZWFsRW1haWwsIHVzZXIsIHRva2VuLCB1cmwsIG9wdGlvbnMgfTtcbiAgfTtcblxuLy8gc2VuZCB0aGUgdXNlciBhbiBlbWFpbCBpbmZvcm1pbmcgdGhlbSB0aGF0IHRoZWlyIGFjY291bnQgd2FzIGNyZWF0ZWQsIHdpdGhcbi8vIGEgbGluayB0aGF0IHdoZW4gb3BlbmVkIGJvdGggbWFya3MgdGhlaXIgZW1haWwgYXMgdmVyaWZpZWQgYW5kIGZvcmNlcyB0aGVtXG4vLyB0byBjaG9vc2UgdGhlaXIgcGFzc3dvcmQuIFRoZSBlbWFpbCBtdXN0IGJlIG9uZSBvZiB0aGUgYWRkcmVzc2VzIGluIHRoZVxuLy8gdXNlcidzIGVtYWlscyBmaWVsZCwgb3IgdW5kZWZpbmVkIHRvIHBpY2sgdGhlIGZpcnN0IGVtYWlsIGF1dG9tYXRpY2FsbHkuXG4vL1xuLy8gVGhpcyBpcyBub3QgY2FsbGVkIGF1dG9tYXRpY2FsbHkuIEl0IG11c3QgYmUgY2FsbGVkIG1hbnVhbGx5IGlmIHlvdVxuLy8gd2FudCB0byB1c2UgZW5yb2xsbWVudCBlbWFpbHMuXG5cbi8qKlxuICogQHN1bW1hcnkgU2VuZCBhbiBlbWFpbCBhc3luY2hyb25vdXNseSB3aXRoIGEgbGluayB0aGUgdXNlciBjYW4gdXNlIHRvIHNldCB0aGVpciBpbml0aWFsIHBhc3N3b3JkLlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgaWQgb2YgdGhlIHVzZXIgdG8gc2VuZCBlbWFpbCB0by5cbiAqIEBwYXJhbSB7U3RyaW5nfSBbZW1haWxdIE9wdGlvbmFsLiBXaGljaCBhZGRyZXNzIG9mIHRoZSB1c2VyJ3MgdG8gc2VuZCB0aGUgZW1haWwgdG8uIFRoaXMgYWRkcmVzcyBtdXN0IGJlIGluIHRoZSB1c2VyJ3MgYGVtYWlsc2AgbGlzdC4gRGVmYXVsdHMgdG8gdGhlIGZpcnN0IGVtYWlsIGluIHRoZSBsaXN0LlxuICogQHBhcmFtIHtPYmplY3R9IFtleHRyYVRva2VuRGF0YV0gT3B0aW9uYWwgYWRkaXRpb25hbCBkYXRhIHRvIGJlIGFkZGVkIGludG8gdGhlIHRva2VuIHJlY29yZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFQYXJhbXNdIE9wdGlvbmFsIGFkZGl0aW9uYWwgcGFyYW1zIHRvIGJlIGFkZGVkIHRvIHRoZSBlbnJvbGxtZW50IHVybC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IFByb21pc2Ugb2YgYW4gb2JqZWN0IHtlbWFpbCwgdXNlciwgdG9rZW4sIHVybCwgb3B0aW9uc30gdmFsdWVzLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuc2VuZEVucm9sbG1lbnRFbWFpbCA9XG4gIGFzeW5jICh1c2VySWQsIGVtYWlsLCBleHRyYVRva2VuRGF0YSwgZXh0cmFQYXJhbXMpID0+IHtcblxuICAgIGNvbnN0IHsgZW1haWw6IHJlYWxFbWFpbCwgdXNlciwgdG9rZW4gfSA9XG4gICAgICBhd2FpdCBBY2NvdW50cy5nZW5lcmF0ZVJlc2V0VG9rZW4odXNlcklkLCBlbWFpbCwgJ2Vucm9sbEFjY291bnQnLCBleHRyYVRva2VuRGF0YSk7XG5cbiAgICBjb25zdCB1cmwgPSBBY2NvdW50cy51cmxzLmVucm9sbEFjY291bnQodG9rZW4sIGV4dHJhUGFyYW1zKTtcblxuICAgIGNvbnN0IG9wdGlvbnMgPVxuICAgICAgYXdhaXQgQWNjb3VudHMuZ2VuZXJhdGVPcHRpb25zRm9yRW1haWwocmVhbEVtYWlsLCB1c2VyLCB1cmwsICdlbnJvbGxBY2NvdW50Jyk7XG5cbiAgICBhd2FpdCBFbWFpbC5zZW5kQXN5bmMob3B0aW9ucyk7XG4gICAgaWYgKE1ldGVvci5pc0RldmVsb3BtZW50ICYmICFNZXRlb3IuaXNQYWNrYWdlVGVzdCkge1xuICAgICAgY29uc29sZS5sb2coYFxcbkVucm9sbG1lbnQgZW1haWwgVVJMOiAkeyB1cmwgfWApO1xuICAgIH1cbiAgICByZXR1cm4geyBlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zIH07XG4gIH07XG5cblxuLy8gVGFrZSB0b2tlbiBmcm9tIHNlbmRSZXNldFBhc3N3b3JkRW1haWwgb3Igc2VuZEVucm9sbG1lbnRFbWFpbCwgY2hhbmdlXG4vLyB0aGUgdXNlcnMgcGFzc3dvcmQsIGFuZCBsb2cgdGhlbSBpbi5cbk1ldGVvci5tZXRob2RzKFxuICB7XG4gICAgcmVzZXRQYXNzd29yZDpcbiAgICAgIGFzeW5jIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICAgIGNvbnN0IHRva2VuID0gYXJnc1swXTtcbiAgICAgICAgY29uc3QgbmV3UGFzc3dvcmQgPSBhcmdzWzFdO1xuICAgICAgICByZXR1cm4gYXdhaXQgQWNjb3VudHMuX2xvZ2luTWV0aG9kKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgXCJyZXNldFBhc3N3b3JkXCIsXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgICBcInBhc3N3b3JkXCIsXG4gICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgY2hlY2sodG9rZW4sIFN0cmluZyk7XG4gICAgICAgICAgICBjaGVjayhuZXdQYXNzd29yZCwgcGFzc3dvcmRWYWxpZGF0b3IpO1xuICAgICAgICAgICAgbGV0IHVzZXIgPSBhd2FpdCBNZXRlb3IudXNlcnMuZmluZE9uZUFzeW5jKFxuICAgICAgICAgICAgICB7IFwic2VydmljZXMucGFzc3dvcmQucmVzZXQudG9rZW5cIjogdG9rZW4gfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgICAgICAgc2VydmljZXM6IDEsXG4gICAgICAgICAgICAgICAgICBlbWFpbHM6IDEsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBsZXQgaXNFbnJvbGwgPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIGlmIHRva2VuIGlzIGluIHNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0IGRiIGZpZWxkIGltcGxpZXNcbiAgICAgICAgICAgIC8vIHRoaXMgbWV0aG9kIGlzIHdhcyBub3QgY2FsbGVkIGZyb20gZW5yb2xsIGFjY291bnQgd29ya2Zsb3dcbiAgICAgICAgICAgIC8vIGVsc2UgdGhpcyBtZXRob2QgaXMgY2FsbGVkIGZyb20gZW5yb2xsIGFjY291bnQgd29ya2Zsb3dcbiAgICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgICB1c2VyID0gYXdhaXQgTWV0ZW9yLnVzZXJzLmZpbmRPbmVBc3luYyhcbiAgICAgICAgICAgICAgICB7IFwic2VydmljZXMucGFzc3dvcmQuZW5yb2xsLnRva2VuXCI6IHRva2VuIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgZmllbGRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VzOiAxLFxuICAgICAgICAgICAgICAgICAgICBlbWFpbHM6IDEsXG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICBpc0Vucm9sbCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVG9rZW4gZXhwaXJlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB0b2tlblJlY29yZCA9IHt9O1xuICAgICAgICAgICAgaWYgKGlzRW5yb2xsKSB7XG4gICAgICAgICAgICAgIHRva2VuUmVjb3JkID0gdXNlci5zZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0b2tlblJlY29yZCA9IHVzZXIuc2VydmljZXMucGFzc3dvcmQucmVzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB7IHdoZW4sIGVtYWlsIH0gPSB0b2tlblJlY29yZDtcbiAgICAgICAgICAgIGxldCB0b2tlbkxpZmV0aW1lTXMgPSBBY2NvdW50cy5fZ2V0UGFzc3dvcmRSZXNldFRva2VuTGlmZXRpbWVNcygpO1xuICAgICAgICAgICAgaWYgKGlzRW5yb2xsKSB7XG4gICAgICAgICAgICAgIHRva2VuTGlmZXRpbWVNcyA9IEFjY291bnRzLl9nZXRQYXNzd29yZEVucm9sbFRva2VuTGlmZXRpbWVNcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY3VycmVudFRpbWVNcyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBpZiAoKGN1cnJlbnRUaW1lTXMgLSB3aGVuKSA+IHRva2VuTGlmZXRpbWVNcylcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVG9rZW4gZXhwaXJlZFwiKTtcbiAgICAgICAgICAgIGlmICghKHBsdWNrQWRkcmVzc2VzKHVzZXIuZW1haWxzKS5pbmNsdWRlcyhlbWFpbCkpKVxuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlRva2VuIGhhcyBpbnZhbGlkIGVtYWlsIGFkZHJlc3NcIilcbiAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gTk9URTogV2UncmUgYWJvdXQgdG8gaW52YWxpZGF0ZSB0b2tlbnMgb24gdGhlIHVzZXIsIHdobyB3ZSBtaWdodCBiZVxuICAgICAgICAgICAgLy8gbG9nZ2VkIGluIGFzLiBNYWtlIHN1cmUgdG8gYXZvaWQgbG9nZ2luZyBvdXJzZWx2ZXMgb3V0IGlmIHRoaXNcbiAgICAgICAgICAgIC8vIGhhcHBlbnMuIEJ1dCBhbHNvIG1ha2Ugc3VyZSBub3QgdG8gbGVhdmUgdGhlIGNvbm5lY3Rpb24gaW4gYSBzdGF0ZVxuICAgICAgICAgICAgLy8gb2YgaGF2aW5nIGEgYmFkIHRva2VuIHNldCBpZiB0aGluZ3MgZmFpbC5cbiAgICAgICAgICAgIGNvbnN0IG9sZFRva2VuID0gQWNjb3VudHMuX2dldExvZ2luVG9rZW4odGhpcy5jb25uZWN0aW9uLmlkKTtcbiAgICAgICAgICAgIEFjY291bnRzLl9zZXRMb2dpblRva2VuKHVzZXIuX2lkLCB0aGlzLmNvbm5lY3Rpb24sIG51bGwpO1xuICAgICAgICAgICAgY29uc3QgcmVzZXRUb09sZFRva2VuID0gKCkgPT5cbiAgICAgICAgICAgICAgQWNjb3VudHMuX3NldExvZ2luVG9rZW4odXNlci5faWQsIHRoaXMuY29ubmVjdGlvbiwgb2xkVG9rZW4pO1xuXG4gICAgICAgICAgICBjb25zdCB1cGRhdG9yID0gYXdhaXQgZ2V0VXBkYXRvckZvclVzZXJQYXNzd29yZChuZXdQYXNzd29yZCk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgdXNlciByZWNvcmQgYnk6XG4gICAgICAgICAgICAgIC8vIC0gQ2hhbmdpbmcgdGhlIHBhc3N3b3JkIHRvIHRoZSBuZXcgb25lXG4gICAgICAgICAgICAgIC8vIC0gRm9yZ2V0dGluZyBhYm91dCB0aGUgcmVzZXQgdG9rZW4gb3IgZW5yb2xsIHRva2VuIHRoYXQgd2FzIGp1c3QgdXNlZFxuICAgICAgICAgICAgICAvLyAtIFZlcmlmeWluZyB0aGVpciBlbWFpbCwgc2luY2UgdGhleSBnb3QgdGhlIHBhc3N3b3JkIHJlc2V0IHZpYSBlbWFpbC5cbiAgICAgICAgICAgICAgbGV0IGFmZmVjdGVkUmVjb3JkcyA9IHt9O1xuICAgICAgICAgICAgICAvLyBpZiByZWFzb24gaXMgZW5yb2xsIHRoZW4gY2hlY2sgc2VydmljZXMucGFzc3dvcmQuZW5yb2xsLnRva2VuIGZpZWxkIGZvciBhZmZlY3RlZCByZWNvcmRzXG4gICAgICAgICAgICAgIGlmIChpc0Vucm9sbCkge1xuICAgICAgICAgICAgICAgIGFmZmVjdGVkUmVjb3JkcyA9IGF3YWl0IE1ldGVvci51c2Vycy51cGRhdGVBc3luYyhcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgX2lkOiB1c2VyLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgXCJlbWFpbHMuYWRkcmVzc1wiOiBlbWFpbCxcbiAgICAgICAgICAgICAgICAgICAgXCJzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwudG9rZW5cIjogdG9rZW5cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICRzZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICBcImVtYWlscy4kLnZlcmlmaWVkXCI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgLi4udXBkYXRvci4kc2V0XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICR1bnNldDoge1xuICAgICAgICAgICAgICAgICAgICAgIFwic2VydmljZXMucGFzc3dvcmQuZW5yb2xsXCI6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgLi4udXBkYXRvci4kdW5zZXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYWZmZWN0ZWRSZWNvcmRzID0gYXdhaXQgTWV0ZW9yLnVzZXJzLnVwZGF0ZUFzeW5jKFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBfaWQ6IHVzZXIuX2lkLFxuICAgICAgICAgICAgICAgICAgICBcImVtYWlscy5hZGRyZXNzXCI6IGVtYWlsLFxuICAgICAgICAgICAgICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LnRva2VuXCI6IHRva2VuXG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgXCJlbWFpbHMuJC52ZXJpZmllZFwiOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgIC4uLnVwZGF0b3IuJHNldFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAkdW5zZXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICBcInNlcnZpY2VzLnBhc3N3b3JkLnJlc2V0XCI6IDEsXG4gICAgICAgICAgICAgICAgICAgICAgLi4udXBkYXRvci4kdW5zZXRcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGFmZmVjdGVkUmVjb3JkcyAhPT0gMSlcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgICAgICAgICAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJJbnZhbGlkIGVtYWlsXCIpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgICByZXNldFRvT2xkVG9rZW4oKTtcbiAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZXBsYWNlIGFsbCB2YWxpZCBsb2dpbiB0b2tlbnMgd2l0aCBuZXcgb25lcyAoY2hhbmdpbmdcbiAgICAgICAgICAgIC8vIHBhc3N3b3JkIHNob3VsZCBpbnZhbGlkYXRlIGV4aXN0aW5nIHNlc3Npb25zKS5cbiAgICAgICAgICAgIGF3YWl0IEFjY291bnRzLl9jbGVhckFsbExvZ2luVG9rZW5zKHVzZXIuX2lkKTtcblxuICAgICAgICAgICAgaWYgKEFjY291bnRzLl9jaGVjazJmYUVuYWJsZWQ/Lih1c2VyKSkge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHVzZXJJZDogdXNlci5faWQsXG4gICAgICAgICAgICAgICAgZXJyb3I6IEFjY291bnRzLl9oYW5kbGVFcnJvcihcbiAgICAgICAgICAgICAgICAgICdDaGFuZ2VkIHBhc3N3b3JkLCBidXQgdXNlciBub3QgbG9nZ2VkIGluIGJlY2F1c2UgMkZBIGlzIGVuYWJsZWQnLFxuICAgICAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgICAgICAnMmZhLWVuYWJsZWQnXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHVzZXJJZDogdXNlci5faWQgfTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9XG4gIH1cbik7XG5cbi8vL1xuLy8vIEVNQUlMIFZFUklGSUNBVElPTlxuLy8vXG5cblxuLy8gc2VuZCB0aGUgdXNlciBhbiBlbWFpbCB3aXRoIGEgbGluayB0aGF0IHdoZW4gb3BlbmVkIG1hcmtzIHRoYXRcbi8vIGFkZHJlc3MgYXMgdmVyaWZpZWRcblxuLyoqXG4gKiBAc3VtbWFyeSBTZW5kIGFuIGVtYWlsIGFzeW5jaHJvbm91c2x5IHdpdGggYSBsaW5rIHRoZSB1c2VyIGNhbiB1c2UgdmVyaWZ5IHRoZWlyIGVtYWlsIGFkZHJlc3MuXG4gKiBAbG9jdXMgU2VydmVyXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlcklkIFRoZSBpZCBvZiB0aGUgdXNlciB0byBzZW5kIGVtYWlsIHRvLlxuICogQHBhcmFtIHtTdHJpbmd9IFtlbWFpbF0gT3B0aW9uYWwuIFdoaWNoIGFkZHJlc3Mgb2YgdGhlIHVzZXIncyB0byBzZW5kIHRoZSBlbWFpbCB0by4gVGhpcyBhZGRyZXNzIG11c3QgYmUgaW4gdGhlIHVzZXIncyBgZW1haWxzYCBsaXN0LiBEZWZhdWx0cyB0byB0aGUgZmlyc3QgdW52ZXJpZmllZCBlbWFpbCBpbiB0aGUgbGlzdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbZXh0cmFUb2tlbkRhdGFdIE9wdGlvbmFsIGFkZGl0aW9uYWwgZGF0YSB0byBiZSBhZGRlZCBpbnRvIHRoZSB0b2tlbiByZWNvcmQuXG4gKiBAcGFyYW0ge09iamVjdH0gW2V4dHJhUGFyYW1zXSBPcHRpb25hbCBhZGRpdGlvbmFsIHBhcmFtcyB0byBiZSBhZGRlZCB0byB0aGUgdmVyaWZpY2F0aW9uIHVybC5cbiAqIEByZXR1cm5zIHtQcm9taXNlPE9iamVjdD59IFByb21pc2Ugb2YgYW4gb2JqZWN0IHdpdGgge2VtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zfSB2YWx1ZXMuXG4gKiBAaW1wb3J0RnJvbVBhY2thZ2UgYWNjb3VudHMtYmFzZVxuICovXG5BY2NvdW50cy5zZW5kVmVyaWZpY2F0aW9uRW1haWwgPVxuICBhc3luYyAodXNlcklkLCBlbWFpbCwgZXh0cmFUb2tlbkRhdGEsIGV4dHJhUGFyYW1zKSA9PiB7XG4gICAgLy8gWFhYIEFsc28gZ2VuZXJhdGUgYSBsaW5rIHVzaW5nIHdoaWNoIHNvbWVvbmUgY2FuIGRlbGV0ZSB0aGlzXG4gICAgLy8gYWNjb3VudCBpZiB0aGV5IG93biBzYWlkIGFkZHJlc3MgYnV0IHdlcmVuJ3QgdGhvc2Ugd2hvIGNyZWF0ZWRcbiAgICAvLyB0aGlzIGFjY291bnQuXG5cbiAgICBjb25zdCB7IGVtYWlsOiByZWFsRW1haWwsIHVzZXIsIHRva2VuIH0gPVxuICAgICAgYXdhaXQgQWNjb3VudHMuZ2VuZXJhdGVWZXJpZmljYXRpb25Ub2tlbih1c2VySWQsIGVtYWlsLCBleHRyYVRva2VuRGF0YSk7XG4gICAgY29uc3QgdXJsID0gQWNjb3VudHMudXJscy52ZXJpZnlFbWFpbCh0b2tlbiwgZXh0cmFQYXJhbXMpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSBhd2FpdCBBY2NvdW50cy5nZW5lcmF0ZU9wdGlvbnNGb3JFbWFpbChyZWFsRW1haWwsIHVzZXIsIHVybCwgJ3ZlcmlmeUVtYWlsJyk7XG4gICAgYXdhaXQgRW1haWwuc2VuZEFzeW5jKG9wdGlvbnMpO1xuICAgIGlmIChNZXRlb3IuaXNEZXZlbG9wbWVudCAmJiAhTWV0ZW9yLmlzUGFja2FnZVRlc3QpIHtcbiAgICAgIGNvbnNvbGUubG9nKGBcXG5WZXJpZmljYXRpb24gZW1haWwgVVJMOiAkeyB1cmwgfWApO1xuICAgIH1cbiAgICByZXR1cm4geyBlbWFpbDogcmVhbEVtYWlsLCB1c2VyLCB0b2tlbiwgdXJsLCBvcHRpb25zIH07XG4gIH07XG5cbi8vIFRha2UgdG9rZW4gZnJvbSBzZW5kVmVyaWZpY2F0aW9uRW1haWwsIG1hcmsgdGhlIGVtYWlsIGFzIHZlcmlmaWVkLFxuLy8gYW5kIGxvZyB0aGVtIGluLlxuTWV0ZW9yLm1ldGhvZHMoXG4gIHtcbiAgICB2ZXJpZnlFbWFpbDogYXN5bmMgZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgIGNvbnN0IHRva2VuID0gYXJnc1swXTtcbiAgICAgIHJldHVybiBhd2FpdCBBY2NvdW50cy5fbG9naW5NZXRob2QoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIFwidmVyaWZ5RW1haWxcIixcbiAgICAgICAgYXJncyxcbiAgICAgICAgXCJwYXNzd29yZFwiLFxuICAgICAgICBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgY2hlY2sodG9rZW4sIFN0cmluZyk7XG5cbiAgICAgICAgICBjb25zdCB1c2VyID0gYXdhaXQgTWV0ZW9yLnVzZXJzLmZpbmRPbmVBc3luYyhcbiAgICAgICAgICAgIHsgJ3NlcnZpY2VzLmVtYWlsLnZlcmlmaWNhdGlvblRva2Vucy50b2tlbic6IHRva2VuIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGZpZWxkczoge1xuICAgICAgICAgICAgICAgIHNlcnZpY2VzOiAxLFxuICAgICAgICAgICAgICAgIGVtYWlsczogMSxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKCF1c2VyKVxuICAgICAgICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVmVyaWZ5IGVtYWlsIGxpbmsgZXhwaXJlZFwiKTtcblxuICAgICAgICAgIGNvbnN0IHRva2VuUmVjb3JkID1cbiAgICAgICAgICAgIGF3YWl0IHVzZXJcbiAgICAgICAgICAgICAgLnNlcnZpY2VzLmVtYWlsLnZlcmlmaWNhdGlvblRva2Vucy5maW5kKHQgPT4gdC50b2tlbiA9PSB0b2tlbik7XG5cbiAgICAgICAgICBpZiAoIXRva2VuUmVjb3JkKVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlZlcmlmeSBlbWFpbCBsaW5rIGV4cGlyZWRcIilcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb25zdCBlbWFpbHNSZWNvcmQgPVxuICAgICAgICAgICAgdXNlci5lbWFpbHMuZmluZChlID0+IGUuYWRkcmVzcyA9PSB0b2tlblJlY29yZC5hZGRyZXNzKTtcblxuICAgICAgICAgIGlmICghZW1haWxzUmVjb3JkKVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgICAgICAgICAgZXJyb3I6IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlZlcmlmeSBlbWFpbCBsaW5rIGlzIGZvciB1bmtub3duIGFkZHJlc3NcIilcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAvLyBCeSBpbmNsdWRpbmcgdGhlIGFkZHJlc3MgaW4gdGhlIHF1ZXJ5LCB3ZSBjYW4gdXNlICdlbWFpbHMuJCcgaW4gdGhlXG4gICAgICAgICAgLy8gbW9kaWZpZXIgdG8gZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBzcGVjaWZpYyBvYmplY3QgaW4gdGhlIGVtYWlsc1xuICAgICAgICAgIC8vIGFycmF5LiBTZWVcbiAgICAgICAgICAvLyBodHRwOi8vd3d3Lm1vbmdvZGIub3JnL2Rpc3BsYXkvRE9DUy9VcGRhdGluZy8jVXBkYXRpbmctVGhlJTI0cG9zaXRpb25hbG9wZXJhdG9yKVxuICAgICAgICAgIC8vIGh0dHA6Ly93d3cubW9uZ29kYi5vcmcvZGlzcGxheS9ET0NTL1VwZGF0aW5nI1VwZGF0aW5nLSUyNHB1bGxcbiAgICAgICAgICBhd2FpdCBNZXRlb3IudXNlcnMudXBkYXRlQXN5bmMoXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIF9pZDogdXNlci5faWQsXG4gICAgICAgICAgICAgICdlbWFpbHMuYWRkcmVzcyc6IHRva2VuUmVjb3JkLmFkZHJlc3NcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICRzZXQ6IHsgJ2VtYWlscy4kLnZlcmlmaWVkJzogdHJ1ZSB9LFxuICAgICAgICAgICAgICAkcHVsbDogeyAnc2VydmljZXMuZW1haWwudmVyaWZpY2F0aW9uVG9rZW5zJzogeyBhZGRyZXNzOiB0b2tlblJlY29yZC5hZGRyZXNzIH0gfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICBpZiAoQWNjb3VudHMuX2NoZWNrMmZhRW5hYmxlZD8uKHVzZXIpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdXNlcklkOiB1c2VyLl9pZCxcbiAgICAgICAgICBlcnJvcjogQWNjb3VudHMuX2hhbmRsZUVycm9yKFxuICAgICAgICAgICAgJ0VtYWlsIHZlcmlmaWVkLCBidXQgdXNlciBub3QgbG9nZ2VkIGluIGJlY2F1c2UgMkZBIGlzIGVuYWJsZWQnLFxuICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAnMmZhLWVuYWJsZWQnXG4gICAgICAgICAgKSxcbiAgICAgICAgfTtcbiAgICAgIH1yZXR1cm4geyB1c2VySWQ6IHVzZXIuX2lkIH07XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9KTtcblxuXG4vKipcbiAqIEBzdW1tYXJ5IEFzeW5jaHJvbm91c2x5IHJlcGxhY2UgYW4gZW1haWwgYWRkcmVzcyBmb3IgYSB1c2VyLiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGRpcmVjdGx5XG4gKiB1cGRhdGluZyB0aGUgZGF0YWJhc2UuIFRoZSBvcGVyYXRpb24gd2lsbCBmYWlsIGlmIHRoZXJlIGlzIGEgZGlmZmVyZW50IHVzZXJcbiAqIHdpdGggYW4gZW1haWwgb25seSBkaWZmZXJpbmcgaW4gY2FzZS4gSWYgdGhlIHNwZWNpZmllZCB1c2VyIGhhcyBhbiBleGlzdGluZ1xuICogZW1haWwgb25seSBkaWZmZXJpbmcgaW4gY2FzZSBob3dldmVyLCB3ZSByZXBsYWNlIGl0LlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgSUQgb2YgdGhlIHVzZXIgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IG9sZEVtYWlsIFRoZSBlbWFpbCBhZGRyZXNzIHRvIHJlcGxhY2UuXG4gKiBAcGFyYW0ge1N0cmluZ30gbmV3RW1haWwgVGhlIG5ldyBlbWFpbCBhZGRyZXNzIHRvIHVzZS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3ZlcmlmaWVkXSBPcHRpb25hbCAtIHdoZXRoZXIgdGhlIG5ldyBlbWFpbCBhZGRyZXNzIHNob3VsZFxuICogYmUgbWFya2VkIGFzIHZlcmlmaWVkLiBEZWZhdWx0cyB0byBmYWxzZS5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLnJlcGxhY2VFbWFpbEFzeW5jID0gYXN5bmMgKHVzZXJJZCwgb2xkRW1haWwsIG5ld0VtYWlsLCB2ZXJpZmllZCkgPT4ge1xuICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sob2xkRW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sobmV3RW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sodmVyaWZpZWQsIE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pKTtcblxuICBpZiAodmVyaWZpZWQgPT09IHZvaWQgMCkge1xuICAgIHZlcmlmaWVkID0gZmFsc2U7XG4gIH1cblxuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckJ5SWQodXNlcklkLCB7IGZpZWxkczogeyBfaWQ6IDEgfSB9KTtcbiAgaWYgKCF1c2VyKVxuICAgIHRocm93IG5ldyBNZXRlb3IuRXJyb3IoNDAzLCBcIlVzZXIgbm90IGZvdW5kXCIpO1xuXG4gIC8vIEVuc3VyZSBubyB1c2VyIGFscmVhZHkgaGFzIHRoaXMgbmV3IGVtYWlsXG4gIGF3YWl0IEFjY291bnRzLl9jaGVja0ZvckNhc2VJbnNlbnNpdGl2ZUR1cGxpY2F0ZXMoXG4gICAgXCJlbWFpbHMuYWRkcmVzc1wiLFxuICAgIFwiRW1haWxcIixcbiAgICBuZXdFbWFpbCxcbiAgICB1c2VyLl9pZFxuICApO1xuXG4gIGNvbnN0IHJlc3VsdCA9IGF3YWl0IE1ldGVvci51c2Vycy51cGRhdGVBc3luYyhcbiAgICB7IF9pZDogdXNlci5faWQsICdlbWFpbHMuYWRkcmVzcyc6IG9sZEVtYWlsIH0sXG4gICAgeyAkc2V0OiB7ICdlbWFpbHMuJC5hZGRyZXNzJzogbmV3RW1haWwsICdlbWFpbHMuJC52ZXJpZmllZCc6IHZlcmlmaWVkIH0gfVxuICApO1xuICBcbiAgaWYgKHJlc3VsdC5tb2RpZmllZENvdW50ID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDQsIFwiTm8gdXNlciBjb3VsZCBiZSBmb3VuZCB3aXRoIG9sZCBlbWFpbFwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAc3VtbWFyeSBBc3luY2hyb25vdXNseSBhZGQgYW4gZW1haWwgYWRkcmVzcyBmb3IgYSB1c2VyLiBVc2UgdGhpcyBpbnN0ZWFkIG9mIGRpcmVjdGx5XG4gKiB1cGRhdGluZyB0aGUgZGF0YWJhc2UuIFRoZSBvcGVyYXRpb24gd2lsbCBmYWlsIGlmIHRoZXJlIGlzIGEgZGlmZmVyZW50IHVzZXJcbiAqIHdpdGggYW4gZW1haWwgb25seSBkaWZmZXJpbmcgaW4gY2FzZS4gSWYgdGhlIHNwZWNpZmllZCB1c2VyIGhhcyBhbiBleGlzdGluZ1xuICogZW1haWwgb25seSBkaWZmZXJpbmcgaW4gY2FzZSBob3dldmVyLCB3ZSByZXBsYWNlIGl0LlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgSUQgb2YgdGhlIHVzZXIgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IG5ld0VtYWlsIEEgbmV3IGVtYWlsIGFkZHJlc3MgZm9yIHRoZSB1c2VyLlxuICogQHBhcmFtIHtCb29sZWFufSBbdmVyaWZpZWRdIE9wdGlvbmFsIC0gd2hldGhlciB0aGUgbmV3IGVtYWlsIGFkZHJlc3Mgc2hvdWxkXG4gKiBiZSBtYXJrZWQgYXMgdmVyaWZpZWQuIERlZmF1bHRzIHRvIGZhbHNlLlxuICogQGltcG9ydEZyb21QYWNrYWdlIGFjY291bnRzLWJhc2VcbiAqL1xuQWNjb3VudHMuYWRkRW1haWxBc3luYyA9IGFzeW5jICh1c2VySWQsIG5ld0VtYWlsLCB2ZXJpZmllZCkgPT4ge1xuICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sobmV3RW1haWwsIE5vbkVtcHR5U3RyaW5nKTtcbiAgY2hlY2sodmVyaWZpZWQsIE1hdGNoLk9wdGlvbmFsKEJvb2xlYW4pKTtcblxuICBpZiAodmVyaWZpZWQgPT09IHZvaWQgMCkge1xuICAgIHZlcmlmaWVkID0gZmFsc2U7XG4gIH1cblxuICBjb25zdCB1c2VyID0gYXdhaXQgZ2V0VXNlckJ5SWQodXNlcklkLCB7IGZpZWxkczogeyBlbWFpbHM6IDEgfSB9KTtcbiAgaWYgKCF1c2VyKSB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJVc2VyIG5vdCBmb3VuZFwiKTtcblxuICAvLyBBbGxvdyB1c2VycyB0byBjaGFuZ2UgdGhlaXIgb3duIGVtYWlsIHRvIGEgdmVyc2lvbiB3aXRoIGEgZGlmZmVyZW50IGNhc2VcblxuICAvLyBXZSBkb24ndCBoYXZlIHRvIGNhbGwgY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzIHRvIGRvIGEgY2FzZVxuICAvLyBpbnNlbnNpdGl2ZSBjaGVjayBhY3Jvc3MgYWxsIGVtYWlscyBpbiB0aGUgZGF0YWJhc2UgaGVyZSBiZWNhdXNlOiAoMSkgaWZcbiAgLy8gdGhlcmUgaXMgbm8gY2FzZS1pbnNlbnNpdGl2ZSBkdXBsaWNhdGUgYmV0d2VlbiB0aGlzIHVzZXIgYW5kIG90aGVyIHVzZXJzLFxuICAvLyB0aGVuIHdlIGFyZSBPSyBhbmQgKDIpIGlmIHRoaXMgd291bGQgY3JlYXRlIGEgY29uZmxpY3Qgd2l0aCBvdGhlciB1c2Vyc1xuICAvLyB0aGVuIHRoZXJlIHdvdWxkIGFscmVhZHkgYmUgYSBjYXNlLWluc2Vuc2l0aXZlIGR1cGxpY2F0ZSBhbmQgd2UgY2FuJ3QgZml4XG4gIC8vIHRoYXQgaW4gdGhpcyBjb2RlIGFueXdheS5cbiAgY29uc3QgY2FzZUluc2Vuc2l0aXZlUmVnRXhwID0gbmV3IFJlZ0V4cChcbiAgICBgXiR7TWV0ZW9yLl9lc2NhcGVSZWdFeHAobmV3RW1haWwpfSRgLFxuICAgIFwiaVwiXG4gICk7XG5cbiAgLy8gVE9ETzogVGhpcyBpcyBhIGxpbmVhciBzZWFyY2guIElmIHdlIGhhdmUgYSBsb3Qgb2YgZW1haWxzLlxuICAvLyAgd2Ugc2hvdWxkIGNvbnNpZGVyIHVzaW5nIGEgZGlmZmVyZW50IGRhdGEgc3RydWN0dXJlLlxuICBjb25zdCB1cGRhdGVkRW1haWwgPSBhc3luYyAoZW1haWxzID0gW10sIF9pZCkgPT4ge1xuICAgIGxldCB1cGRhdGVkID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBlbWFpbCBvZiBlbWFpbHMpIHtcbiAgICAgIGlmIChjYXNlSW5zZW5zaXRpdmVSZWdFeHAudGVzdChlbWFpbC5hZGRyZXNzKSkge1xuICAgICAgICBhd2FpdCBNZXRlb3IudXNlcnMudXBkYXRlQXN5bmMoXG4gICAgICAgICAge1xuICAgICAgICAgICAgX2lkOiBfaWQsXG4gICAgICAgICAgICBcImVtYWlscy5hZGRyZXNzXCI6IGVtYWlsLmFkZHJlc3MsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAkc2V0OiB7XG4gICAgICAgICAgICAgIFwiZW1haWxzLiQuYWRkcmVzc1wiOiBuZXdFbWFpbCxcbiAgICAgICAgICAgICAgXCJlbWFpbHMuJC52ZXJpZmllZFwiOiB2ZXJpZmllZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICB1cGRhdGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVwZGF0ZWQ7XG4gIH07XG4gIGNvbnN0IGRpZFVwZGF0ZU93bkVtYWlsID0gYXdhaXQgdXBkYXRlZEVtYWlsKHVzZXIuZW1haWxzLCB1c2VyLl9pZCk7XG5cbiAgLy8gSW4gdGhlIG90aGVyIHVwZGF0ZXMgYmVsb3csIHdlIGhhdmUgdG8gZG8gYW5vdGhlciBjYWxsIHRvXG4gIC8vIGNoZWNrRm9yQ2FzZUluc2Vuc2l0aXZlRHVwbGljYXRlcyB0byBtYWtlIHN1cmUgdGhhdCBubyBjb25mbGljdGluZyB2YWx1ZXNcbiAgLy8gd2VyZSBhZGRlZCB0byB0aGUgZGF0YWJhc2UgaW4gdGhlIG1lYW50aW1lLiBXZSBkb24ndCBoYXZlIHRvIGRvIHRoaXMgZm9yXG4gIC8vIHRoZSBjYXNlIHdoZXJlIHRoZSB1c2VyIGlzIHVwZGF0aW5nIHRoZWlyIGVtYWlsIGFkZHJlc3MgdG8gb25lIHRoYXQgaXMgdGhlXG4gIC8vIHNhbWUgYXMgYmVmb3JlLCBidXQgb25seSBkaWZmZXJlbnQgYmVjYXVzZSBvZiBjYXBpdGFsaXphdGlvbi4gUmVhZCB0aGVcbiAgLy8gYmlnIGNvbW1lbnQgYWJvdmUgdG8gdW5kZXJzdGFuZCB3aHkuXG5cbiAgaWYgKGRpZFVwZGF0ZU93bkVtYWlsKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gUGVyZm9ybSBhIGNhc2UgaW5zZW5zaXRpdmUgY2hlY2sgZm9yIGR1cGxpY2F0ZXMgYmVmb3JlIHVwZGF0ZVxuICBhd2FpdCBBY2NvdW50cy5fY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKFxuICAgIFwiZW1haWxzLmFkZHJlc3NcIixcbiAgICBcIkVtYWlsXCIsXG4gICAgbmV3RW1haWwsXG4gICAgdXNlci5faWRcbiAgKTtcblxuICBhd2FpdCBNZXRlb3IudXNlcnMudXBkYXRlQXN5bmMoXG4gICAge1xuICAgICAgX2lkOiB1c2VyLl9pZCxcbiAgICB9LFxuICAgIHtcbiAgICAgICRhZGRUb1NldDoge1xuICAgICAgICBlbWFpbHM6IHtcbiAgICAgICAgICBhZGRyZXNzOiBuZXdFbWFpbCxcbiAgICAgICAgICB2ZXJpZmllZDogdmVyaWZpZWQsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH1cbiAgKTtcblxuICAvLyBQZXJmb3JtIGFub3RoZXIgY2hlY2sgYWZ0ZXIgdXBkYXRlLCBpbiBjYXNlIGEgbWF0Y2hpbmcgdXNlciBoYXMgYmVlblxuICAvLyBpbnNlcnRlZCBpbiB0aGUgbWVhbnRpbWVcbiAgdHJ5IHtcbiAgICBhd2FpdCBBY2NvdW50cy5fY2hlY2tGb3JDYXNlSW5zZW5zaXRpdmVEdXBsaWNhdGVzKFxuICAgICAgXCJlbWFpbHMuYWRkcmVzc1wiLFxuICAgICAgXCJFbWFpbFwiLFxuICAgICAgbmV3RW1haWwsXG4gICAgICB1c2VyLl9pZFxuICAgICk7XG4gIH0gY2F0Y2ggKGV4KSB7XG4gICAgLy8gVW5kbyB1cGRhdGUgaWYgdGhlIGNoZWNrIGZhaWxzXG4gICAgYXdhaXQgTWV0ZW9yLnVzZXJzLnVwZGF0ZUFzeW5jKFxuICAgICAgeyBfaWQ6IHVzZXIuX2lkIH0sXG4gICAgICB7ICRwdWxsOiB7IGVtYWlsczogeyBhZGRyZXNzOiBuZXdFbWFpbCB9IH0gfVxuICAgICk7XG4gICAgdGhyb3cgZXg7XG4gIH1cbn07XG5cbi8qKlxuICogQHN1bW1hcnkgUmVtb3ZlIGFuIGVtYWlsIGFkZHJlc3MgYXN5bmNocm9ub3VzbHkgZm9yIGEgdXNlci4gVXNlIHRoaXMgaW5zdGVhZCBvZiB1cGRhdGluZ1xuICogdGhlIGRhdGFiYXNlIGRpcmVjdGx5LlxuICogQGxvY3VzIFNlcnZlclxuICogQHBhcmFtIHtTdHJpbmd9IHVzZXJJZCBUaGUgSUQgb2YgdGhlIHVzZXIgdG8gdXBkYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGVtYWlsIFRoZSBlbWFpbCBhZGRyZXNzIHRvIHJlbW92ZS5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKi9cbkFjY291bnRzLnJlbW92ZUVtYWlsID1cbiAgYXN5bmMgKHVzZXJJZCwgZW1haWwpID0+IHtcbiAgICBjaGVjayh1c2VySWQsIE5vbkVtcHR5U3RyaW5nKTtcbiAgICBjaGVjayhlbWFpbCwgTm9uRW1wdHlTdHJpbmcpO1xuXG4gICAgY29uc3QgdXNlciA9IGF3YWl0IGdldFVzZXJCeUlkKHVzZXJJZCwgeyBmaWVsZHM6IHsgX2lkOiAxIH0gfSk7XG4gICAgaWYgKCF1c2VyKVxuICAgICAgdGhyb3cgbmV3IE1ldGVvci5FcnJvcig0MDMsIFwiVXNlciBub3QgZm91bmRcIik7XG5cbiAgICBhd2FpdCBNZXRlb3IudXNlcnMudXBkYXRlQXN5bmMoeyBfaWQ6IHVzZXIuX2lkIH0sXG4gICAgICB7ICRwdWxsOiB7IGVtYWlsczogeyBhZGRyZXNzOiBlbWFpbCB9IH0gfSk7XG4gIH1cblxuLy8vXG4vLy8gQ1JFQVRJTkcgVVNFUlNcbi8vL1xuXG4vLyBTaGFyZWQgY3JlYXRlVXNlciBmdW5jdGlvbiBjYWxsZWQgZnJvbSB0aGUgY3JlYXRlVXNlciBtZXRob2QsIGJvdGhcbi8vIGlmIG9yaWdpbmF0ZXMgaW4gY2xpZW50IG9yIHNlcnZlciBjb2RlLiBDYWxscyB1c2VyIHByb3ZpZGVkIGhvb2tzLFxuLy8gZG9lcyB0aGUgYWN0dWFsIHVzZXIgaW5zZXJ0aW9uLlxuLy9cbi8vIHJldHVybnMgdGhlIHVzZXIgaWRcbmNvbnN0IGNyZWF0ZVVzZXIgPVxuICBhc3luYyBvcHRpb25zID0+IHtcbiAgICAvLyBVbmtub3duIGtleXMgYWxsb3dlZCwgYmVjYXVzZSBhIG9uQ3JlYXRlVXNlckhvb2sgY2FuIHRha2UgYXJiaXRyYXJ5XG4gICAgLy8gb3B0aW9ucy5cbiAgICBjaGVjayhvcHRpb25zLCBNYXRjaC5PYmplY3RJbmNsdWRpbmcoe1xuICAgICAgdXNlcm5hbWU6IE1hdGNoLk9wdGlvbmFsKFN0cmluZyksXG4gICAgICBlbWFpbDogTWF0Y2guT3B0aW9uYWwoU3RyaW5nKSxcbiAgICAgIHBhc3N3b3JkOiBNYXRjaC5PcHRpb25hbChwYXNzd29yZFZhbGlkYXRvcilcbiAgICB9KSk7XG5cbiAgICBjb25zdCB7IHVzZXJuYW1lLCBlbWFpbCwgcGFzc3dvcmQgfSA9IG9wdGlvbnM7XG4gICAgaWYgKCF1c2VybmFtZSAmJiAhZW1haWwpXG4gICAgICB0aHJvdyBuZXcgTWV0ZW9yLkVycm9yKDQwMCwgXCJOZWVkIHRvIHNldCBhIHVzZXJuYW1lIG9yIGVtYWlsXCIpO1xuXG4gICAgY29uc3QgdXNlciA9IHsgc2VydmljZXM6IHt9IH07XG4gICAgaWYgKHBhc3N3b3JkKSB7XG4gICAgICBjb25zdCBoYXNoZWQgPSBhd2FpdCBoYXNoUGFzc3dvcmQocGFzc3dvcmQpO1xuICAgICAgY29uc3QgYXJnb24yRW5hYmxlZCA9IEFjY291bnRzLl9hcmdvbjJFbmFibGVkKCk7XG4gICAgICBpZiAoYXJnb24yRW5hYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgdXNlci5zZXJ2aWNlcy5wYXNzd29yZCA9IHsgYmNyeXB0OiBoYXNoZWQgfTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICB1c2VyLnNlcnZpY2VzLnBhc3N3b3JkID0geyBhcmdvbjI6IGhhc2hlZCB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCBBY2NvdW50cy5fY3JlYXRlVXNlckNoZWNraW5nRHVwbGljYXRlcyh7IHVzZXIsIGVtYWlsLCB1c2VybmFtZSwgb3B0aW9ucyB9KTtcbiAgfTtcblxuLy8gbWV0aG9kIGZvciBjcmVhdGUgdXNlci4gUmVxdWVzdHMgY29tZSBmcm9tIHRoZSBjbGllbnQuXG5NZXRlb3IubWV0aG9kcyhcbiAge1xuICAgIGNyZWF0ZVVzZXI6IGFzeW5jIGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICBjb25zdCBvcHRpb25zID0gYXJnc1swXTtcbiAgICAgIHJldHVybiBhd2FpdCBBY2NvdW50cy5fbG9naW5NZXRob2QoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIFwiY3JlYXRlVXNlclwiLFxuICAgICAgICBhcmdzLFxuICAgICAgICBcInBhc3N3b3JkXCIsXG4gICAgICAgIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAvLyBjcmVhdGVVc2VyKCkgYWJvdmUgZG9lcyBtb3JlIGNoZWNraW5nLlxuICAgICAgICAgIGNoZWNrKG9wdGlvbnMsIE9iamVjdCk7XG4gICAgICAgICAgaWYgKEFjY291bnRzLl9vcHRpb25zLmZvcmJpZENsaWVudEFjY291bnRDcmVhdGlvbilcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgIGVycm9yOiBuZXcgTWV0ZW9yLkVycm9yKDQwMywgXCJTaWdudXBzIGZvcmJpZGRlblwiKVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IGF3YWl0IEFjY291bnRzLmNyZWF0ZVVzZXJWZXJpZnlpbmdFbWFpbChvcHRpb25zKTtcblxuICAgICAgICAgIC8vIGNsaWVudCBnZXRzIGxvZ2dlZCBpbiBhcyB0aGUgbmV3IHVzZXIgYWZ0ZXJ3YXJkcy5cbiAgICAgICAgICByZXR1cm4geyB1c2VySWQ6IHVzZXJJZCB9O1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbi8qKlxuICogQHN1bW1hcnkgQ3JlYXRlcyBhbiB1c2VyIGFzeW5jaHJvbm91c2x5IGFuZCBzZW5kcyBhbiBlbWFpbCBpZiBgb3B0aW9ucy5lbWFpbGAgaXMgaW5mb3JtZWQuXG4gKiBUaGVuIGlmIHRoZSBgc2VuZFZlcmlmaWNhdGlvbkVtYWlsYCBvcHRpb24gZnJvbSB0aGUgYEFjY291bnRzYCBwYWNrYWdlIGlzXG4gKiBlbmFibGVkLCB5b3UnbGwgc2VuZCBhIHZlcmlmaWNhdGlvbiBlbWFpbCBpZiBgb3B0aW9ucy5wYXNzd29yZGAgaXMgaW5mb3JtZWQsXG4gKiBvdGhlcndpc2UgeW91J2xsIHNlbmQgYW4gZW5yb2xsbWVudCBlbWFpbC5cbiAqIEBsb2N1cyBTZXJ2ZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIFRoZSBvcHRpb25zIG9iamVjdCB0byBiZSBwYXNzZWQgZG93biB3aGVuIGNyZWF0aW5nXG4gKiB0aGUgdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMudXNlcm5hbWUgQSB1bmlxdWUgbmFtZSBmb3IgdGhpcyB1c2VyLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMuZW1haWwgVGhlIHVzZXIncyBlbWFpbCBhZGRyZXNzLlxuICogQHBhcmFtIHtTdHJpbmd9IG9wdGlvbnMucGFzc3dvcmQgVGhlIHVzZXIncyBwYXNzd29yZC4gVGhpcyBpcyBfX25vdF9fIHNlbnQgaW4gcGxhaW4gdGV4dCBvdmVyIHRoZSB3aXJlLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMucHJvZmlsZSBUaGUgdXNlcidzIHByb2ZpbGUsIHR5cGljYWxseSBpbmNsdWRpbmcgdGhlIGBuYW1lYCBmaWVsZC5cbiAqIEBpbXBvcnRGcm9tUGFja2FnZSBhY2NvdW50cy1iYXNlXG4gKiAqL1xuQWNjb3VudHMuY3JlYXRlVXNlclZlcmlmeWluZ0VtYWlsID1cbiAgYXN5bmMgKG9wdGlvbnMpID0+IHtcbiAgICBvcHRpb25zID0geyAuLi5vcHRpb25zIH07XG4gICAgLy8gQ3JlYXRlIHVzZXIuIHJlc3VsdCBjb250YWlucyBpZCBhbmQgdG9rZW4uXG4gICAgY29uc3QgdXNlcklkID0gYXdhaXQgY3JlYXRlVXNlcihvcHRpb25zKTtcbiAgICAvLyBzYWZldHkgYmVsdC4gY3JlYXRlVXNlciBpcyBzdXBwb3NlZCB0byB0aHJvdyBvbiBlcnJvci4gc2VuZCA1MDAgZXJyb3JcbiAgICAvLyBpbnN0ZWFkIG9mIHNlbmRpbmcgYSB2ZXJpZmljYXRpb24gZW1haWwgd2l0aCBlbXB0eSB1c2VyaWQuXG4gICAgaWYgKCF1c2VySWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJjcmVhdGVVc2VyIGZhaWxlZCB0byBpbnNlcnQgbmV3IHVzZXJcIik7XG5cbiAgICAvLyBJZiBgQWNjb3VudHMuX29wdGlvbnMuc2VuZFZlcmlmaWNhdGlvbkVtYWlsYCBpcyBzZXQsIHJlZ2lzdGVyXG4gICAgLy8gYSB0b2tlbiB0byB2ZXJpZnkgdGhlIHVzZXIncyBwcmltYXJ5IGVtYWlsLCBhbmQgc2VuZCBpdCB0b1xuICAgIC8vIHRoYXQgYWRkcmVzcy5cbiAgICBpZiAob3B0aW9ucy5lbWFpbCAmJiBBY2NvdW50cy5fb3B0aW9ucy5zZW5kVmVyaWZpY2F0aW9uRW1haWwpIHtcbiAgICAgIGlmIChvcHRpb25zLnBhc3N3b3JkKSB7XG4gICAgICAgIGF3YWl0IEFjY291bnRzLnNlbmRWZXJpZmljYXRpb25FbWFpbCh1c2VySWQsIG9wdGlvbnMuZW1haWwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgQWNjb3VudHMuc2VuZEVucm9sbG1lbnRFbWFpbCh1c2VySWQsIG9wdGlvbnMuZW1haWwpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1c2VySWQ7XG4gIH07XG5cbi8vIENyZWF0ZSB1c2VyIGRpcmVjdGx5IG9uIHRoZSBzZXJ2ZXIuXG4vL1xuLy8gVW5saWtlIHRoZSBjbGllbnQgdmVyc2lvbiwgdGhpcyBkb2VzIG5vdCBsb2cgeW91IGluIGFzIHRoaXMgdXNlclxuLy8gYWZ0ZXIgY3JlYXRpb24uXG4vL1xuLy8gcmV0dXJucyBQcm9taXNlPHVzZXJJZD4gb3IgdGhyb3dzIGFuIGVycm9yIGlmIGl0IGNhbid0IGNyZWF0ZVxuLy9cbi8vIFhYWCBhZGQgYW5vdGhlciBhcmd1bWVudCAoXCJzZXJ2ZXIgb3B0aW9uc1wiKSB0aGF0IGdldHMgc2VudCB0byBvbkNyZWF0ZVVzZXIsXG4vLyB3aGljaCBpcyBhbHdheXMgZW1wdHkgd2hlbiBjYWxsZWQgZnJvbSB0aGUgY3JlYXRlVXNlciBtZXRob2Q/IGVnLCBcImFkbWluOlxuLy8gdHJ1ZVwiLCB3aGljaCB3ZSB3YW50IHRvIHByZXZlbnQgdGhlIGNsaWVudCBmcm9tIHNldHRpbmcsIGJ1dCB3aGljaCBhIGN1c3RvbVxuLy8gbWV0aG9kIGNhbGxpbmcgQWNjb3VudHMuY3JlYXRlVXNlciBjb3VsZCBzZXQ/XG4vL1xuXG5BY2NvdW50cy5jcmVhdGVVc2VyQXN5bmMgPSBjcmVhdGVVc2VyXG5cbi8vIENyZWF0ZSB1c2VyIGRpcmVjdGx5IG9uIHRoZSBzZXJ2ZXIuXG4vL1xuLy8gVW5saWtlIHRoZSBjbGllbnQgdmVyc2lvbiwgdGhpcyBkb2VzIG5vdCBsb2cgeW91IGluIGFzIHRoaXMgdXNlclxuLy8gYWZ0ZXIgY3JlYXRpb24uXG4vL1xuLy8gcmV0dXJucyB1c2VySWQgb3IgdGhyb3dzIGFuIGVycm9yIGlmIGl0IGNhbid0IGNyZWF0ZVxuLy9cbi8vIFhYWCBhZGQgYW5vdGhlciBhcmd1bWVudCAoXCJzZXJ2ZXIgb3B0aW9uc1wiKSB0aGF0IGdldHMgc2VudCB0byBvbkNyZWF0ZVVzZXIsXG4vLyB3aGljaCBpcyBhbHdheXMgZW1wdHkgd2hlbiBjYWxsZWQgZnJvbSB0aGUgY3JlYXRlVXNlciBtZXRob2Q/IGVnLCBcImFkbWluOlxuLy8gdHJ1ZVwiLCB3aGljaCB3ZSB3YW50IHRvIHByZXZlbnQgdGhlIGNsaWVudCBmcm9tIHNldHRpbmcsIGJ1dCB3aGljaCBhIGN1c3RvbVxuLy8gbWV0aG9kIGNhbGxpbmcgQWNjb3VudHMuY3JlYXRlVXNlciBjb3VsZCBzZXQ/XG4vL1xuXG5BY2NvdW50cy5jcmVhdGVVc2VyID0gQWNjb3VudHMuY3JlYXRlVXNlckFzeW5jO1xuXG4vLy9cbi8vLyBQQVNTV09SRC1TUEVDSUZJQyBJTkRFWEVTIE9OIFVTRVJTXG4vLy9cbmF3YWl0IE1ldGVvci51c2Vycy5jcmVhdGVJbmRleEFzeW5jKCdzZXJ2aWNlcy5lbWFpbC52ZXJpZmljYXRpb25Ub2tlbnMudG9rZW4nLFxuICB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuYXdhaXQgTWV0ZW9yLnVzZXJzLmNyZWF0ZUluZGV4QXN5bmMoJ3NlcnZpY2VzLnBhc3N3b3JkLnJlc2V0LnRva2VuJyxcbiAgeyB1bmlxdWU6IHRydWUsIHNwYXJzZTogdHJ1ZSB9KTtcbmF3YWl0IE1ldGVvci51c2Vycy5jcmVhdGVJbmRleEFzeW5jKCdzZXJ2aWNlcy5wYXNzd29yZC5lbnJvbGwudG9rZW4nLFxuICB7IHVuaXF1ZTogdHJ1ZSwgc3BhcnNlOiB0cnVlIH0pO1xuXG4iXX0=
