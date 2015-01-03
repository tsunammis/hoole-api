'use strict';

var configuration   = require('../config/configuration'),
    mongoose        = require('mongoose'),
    conn            = mongoose.createConnection(configuration.mongodb);

module.exports = {
    connection: conn,
    mongoose: mongoose
};
