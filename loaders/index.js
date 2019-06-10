const fs = require('fs');
const path = require('path');

const logger = require('../app/logger');

exports.init = app => {
  const normalizedPath = path.join(__dirname);
  fs.readdirSync(normalizedPath).forEach(file => {
    if (file.match(/\.js$/) !== null && file !== 'index.js') {
      const loader = require(path.resolve(normalizedPath, file));
      const msg = loader.init(app);
      logger.info(msg);
    }
  });
  logger.info('All loaders were succesfully set up.');
};
