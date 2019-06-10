// def: internalError => (string!, string!) => Error!
const internalError = (message, internalCode) => Error({ message, internalCode });

exports.DEFAULT_ERROR = 'default_error';
exports.defaultError = message => internalError(message, exports.DEFAULT_ERROR);

// Custom errors ⇩

exports.DATABASE_ERROR = 'database_error';
exports.databaseError = message => internalError(message, exports.DATABASE_ERROR);

exports.EXTERNAL_API_ERROR = 'external_api__error';
exports.externalApiError = message => internalError(message, exports.EXTERNAL_API_ERROR);

exports.MAILER_ERROR = 'mailer_error';
exports.mailerError = message => internalError(message, exports.MAILER_ERROR);
