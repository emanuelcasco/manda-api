const app = require('./app'),
  config = require('./config'),
  logger = require('./app/logger');

try {
  const port = config.api.port || 8080;
  logger.info(`Starting app on port: ${port}`);
  app.listen(port);

  logger.info(`Listening on port: ${port}`);
} catch (error) {
  logger.error(error);
}
