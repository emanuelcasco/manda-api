const generateByTimestamp = require('uuid/v1');

const mangaService = require('../services/manga');
const tasksManager = require('../services/tasksManager');

const logger = require('../logger');
const errors = require('../errors');
const queues = require('../jobs/queues');
const { DOWNLOAD_CHAPTER } = require('../jobs/tasks');

exports.search = (req, res, next) => {
  const query = req.query.q;
  return mangaService
    .search(query)
    .then(results => {
      logger.info(`${results.resultsCount} results found for "${query}"`);
      return res.status(200).send({ results });
    })
    .catch(next);
};

exports.downloadChapter = (req, res, next) => {
  const { manga, chapter, receivers, convert } = req.body;

  const id = generateByTimestamp();
  const task = { id, manga, chapter, receivers, convert, status: 'pending' };

  return mangaService
    .validate(manga, chapter)
    .then(isValid => {
      if (isValid) {
        logger.info(`Starting download for "${manga}" #${chapter}`);
        return tasksManager.upsertTask(id, task);
      }
      logger.info(`Chapter "${manga}" #${chapter} not found. Skipping.`);
      return next(errors.notFoundError(`Chapter "${manga}" #${chapter} not found`));
    })
    .then(() => {
      const options = {
        attempts: 5,
        backoff: {
          type: 'fixed',
          delay: 100
        }
      };
      return queues[DOWNLOAD_CHAPTER].add(task, options);
    })
    .then(() => {
      logger.info(`Job queued to download "${manga}" #${chapter}`);
      return res.status(200).send({ id, message: 'Job queued to proccess!' });
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
};
