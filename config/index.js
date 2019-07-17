const { hostname } = require('os');

const ENVIRONMENT = process.env.NODE_ENV || 'development';

if (ENVIRONMENT !== 'production') {
  require('dotenv').config();
}

const configFile = `./${ENVIRONMENT}`;

const isObject = variable => variable instanceof Object;

/*
 * Deep copy of source object into tarjet object.
 * It does not overwrite properties.
 */
const assignObject = (target, source) => {
  if (target && isObject(target) && source && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(target, key) || target[key] === undefined) {
        target[key] = source[key];
      } else {
        assignObject(target[key], source[key]);
      }
    });
  }
  return target;
};

const config = {
  api: {
    bodySizeLimit: process.env.API_BODY_SIZE_LIMIT,
    parameterLimit: process.env.API_PARAMETER_LIMIT,
    port: process.env.PORT
  },
  session: {
    header: 'authorization',
    whitelist: 'manda:whitelist',
    secret: process.env.NODE_API_SESSION_SECRET
  },
  hostname: hostname(),
  mailer: {
    service: process.env.NODE_MAILER_SERVICE,
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASS,
    receipient: process.env.NODE_MAILER_RECEIPIENT
  },
  redis: {
    url: process.env.NODE_REDIS_URL
  }
};

const customConfig = require(configFile).config;
module.exports = assignObject(customConfig, config);
