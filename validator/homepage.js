'use strict';

var when            = require('when'),
    _               = require('lodash'),
    validate        = require('./joi/validate'),
    homepageDao     = require('../manager/dao').Homepage,
    BimError        = require('../bim/bimError'),
    errors          = require('../validator/errors'),
    joiSchema       = require('./joi/schema');

/**
 * Check if the slug is unique
 *
 * @param homepageValidated
 * @param {Bim} bim
 * @param schema
 * @returns {Promise}
 */
var _slugAlreadyExist = function(homepageValidated, bim, schema) {
    if (bim.hasErrorWithPath('slug') || _.isEmpty(homepageValidated.slug) || !_.has(schema, 'slug')) {
        var resolved = {
            value: homepageValidated,
            bim: bim
        };
        if (bim.isValid()) {
            return when.resolve(resolved);
        } else {
            return when.reject(resolved);
        }
    }

    return homepageDao.findOneReadOnlyBySlug(homepageValidated.slug)
        .then(function(homepage) {
            if (homepage !== null) {
                var bimError = new BimError(
                    errors.homepage.slug_already_exist.code,
                    'slug',
                    errors.homepage.slug_already_exist.message
                );
                bim.add(bimError);
                return when.reject({
                    value: homepageValidated,
                    bim: bim
                });
            }

            if (bim.isValid()) {
                return when.resolve({
                    value: homepageValidated,
                    bim: bim
                });
            } else {
                return when.reject({
                    value: homepageValidated,
                    bim: bim
                });
            }
        }, function() {
            var bimError = new BimError(
                errors.homepage.internal.code,
                'slug',
                errors.homepage.internal.message
            );
            bim.add(bimError);
            return when.reject({
                value: homepageValidated,
                bim: bim
            });
        });
};

/**
 * Valid the values to record a new homepage
 *
 * @param {Object} value - Homepage data to validate
 * @param {string} schemaName - if it is not specified, "default" will be used
 * @returns {Promise}
 */
var validateHomepage = function(value, schemaName) {
    var schema = joiSchema.getSchema('homepage', schemaName);
    var promise = validate(value, schema);

    var promiseSlugAlreadyExist = function(resolved) {
        return _slugAlreadyExist(resolved.value, resolved.bim, schema);
    };

    if (schemaName === 'default' || schemaName === undefined) {
        return promise.then(promiseSlugAlreadyExist, promiseSlugAlreadyExist);
    } else {
        return promise;
    }
};

module.exports = {
    _slugAlreadyExist:      _slugAlreadyExist,
    validate:               validateHomepage
};