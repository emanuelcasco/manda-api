const jwt = require('jsonwebtoken');

const config = require('../../config');

exports.encode = email => jwt.sign({ email }, config.session.secret);

exports.decode = token => jwt.verify(token, config.session.secret);
