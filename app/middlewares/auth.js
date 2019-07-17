const jwt = require('../services/jwt');
const logger = require('../logger');
const errors = require('../errors');

const config = require('../../config');

const { header: AUTH_HEADER } = config.session;

exports.authenticate = async (req, res, next) => {
  const token = req[AUTH_HEADER];

  try {
    const { email } = await jwt.decode(token);
    res.email = email;
    return next();
  } catch (err) {
    logger.error(err);
    return next(errors.authError('Unauthorized'));
  }
};
