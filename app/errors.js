const {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  SERVICE_UNAVAILABLE,
  UNAUTHORIZED
} = require('http-status-codes');

const parseError = (message, internalCode, statusCode) => ({ message, internalCode, statusCode });

exports.authError = message => parseError(message, 'auth_error', UNAUTHORIZED);

exports.defaultError = message => parseError(message, 'default_error', BAD_REQUEST);

exports.internalError = message => parseError(message, 'internal_error', INTERNAL_SERVER_ERROR);

exports.databaseError = message => parseError(message, 'database_error', SERVICE_UNAVAILABLE);

exports.externalError = message => parseError(message, 'external_error', SERVICE_UNAVAILABLE);

exports.mailerError = message => parseError(message, 'mailer_error', SERVICE_UNAVAILABLE);
