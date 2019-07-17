const tasksManager = require('../services/tasksManager');

const errors = require('../errors');
const logger = require('../logger');

exports.status = (req, res, next) => {
  const { id } = req.params;
  logger.info(`Looking status for task "${id}"`);

  return tasksManager
    .status(id)
    .then(status => {
      return status
        ? res.status(200).send({ id, status })
        : res.status(404).send({ id, status: 'not found' });
    })
    .catch(err => {
      logger.error(err);
      return next(errors.defaultError('Cannot retrieve task info.'));
    });
};
