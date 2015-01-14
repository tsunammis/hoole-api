'use strict';

var validate        = require('./joi/validate'),
    userServices    = require('../services/user'),
    BimError        = require('../bim/bimError'),
    errors          = require('../validator/errors'),
    joiSchema       = require('./joi/schema'),
    when            = require('when'),
    _               = require('lodash');

var _emailAlreadyExist = function(userValidated, bim, schema) {
    if (bim.hasErrorWithPath('email') || _.isEmpty(userValidated.email) || !_.has(schema, 'email')) {
        var resolved = {
            value: userValidated,
            bim: bim
        };
        if (bim.isValid()) {
            return when.resolve(resolved);
        } else {
            return when.reject(resolved);
        }
    }

    return userServices.findOneReadOnlyByEmail(userValidated.email)
        .then(function(user) {
            if (user !== null) {
                var bimError = new BimError(
                    errors.user.email_already_exist.code,
                    'email',
                    errors.user.email_already_exist.message
                );
                bim.add(bimError);
                return when.reject({
                    value: userValidated,
                    bim: bim
                });
            }
            return when.resolve({
                value: userValidated,
                bim: bim
            });
        }, function() {
            var bimError = new BimError(
                errors.user.internal.code,
                'email',
                errors.user.internal.message
            );
            bim.add(bimError);
            return when.reject({
                value: userValidated,
                bim: bim
            });
        });
};

// TODO WIP
var _usernameAlreadyExist = function(userValidated, bim, schema) {
    if (bim.hasErrorWithPath('username') || _.isEmpty(userValidated.username) || !_.has(schema, 'username')) {
        var resolved = {
            value: userValidated,
            bim: bim
        };
        if (bim.isValid()) {
            return when.resolve(resolved);
        } else {
            return when.reject(resolved);
        }
    }

    return userServices.findOneReadOnlyByUsername(userValidated.username)
        .then(function(user) {
            if (user !== null) {
                var bimError = new BimError(
                    errors.user.username_already_exist.code,
                    'username',
                    errors.user.username_already_exist.message
                );
                bim.add(bimError);
                return when.reject({
                    value: userValidated,
                    bim: bim
                });
            }
            return when.resolve({
                value: userValidated,
                bim: bim
            });
        }, function() {
            var bimError = new BimError(
                errors.user.internal.code,
                'username',
                errors.user.internal.message
            );
            bim.add(bimError);
            return when.reject({
                value: userValidated,
                bim: bim
            });
        });
};

var validateUser = function(value, schemaName) {
    var schema = joiSchema.getSchema('user', schemaName);
    var promise = validate(value, schema);

    var promiseEmailAlreadyExist = function(resolved) {
        return _emailAlreadyExist(resolved.value, resolved.bim, schema);
    };

    var promiseUsernameAlreadyExist = function(resolved) {
        return _usernameAlreadyExist(resolved.value, resolved.bim, schema);
    };

    return promise
        .then(promiseEmailAlreadyExist, promiseEmailAlreadyExist)
        .then(promiseUsernameAlreadyExist, promiseUsernameAlreadyExist);
};

module.exports = {
    _emailAlreadyExist:      _emailAlreadyExist,
    _usernameAlreadyExist:  _usernameAlreadyExist,
    validate:               validateUser
};
