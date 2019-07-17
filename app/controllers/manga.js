const generateByTimestamp = require('uuid/v1');

const mangaService = require('../services/manga');
const tasksManager = require('../services/tasksManager');

const logger = require('../logger');
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

  // TODO validate if manga exists first!

  logger.info(`Starting download for "${manga}" #${chapter}`);
  return tasksManager
    .upsertTask(id, task)
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
      return res.status(200).send({ id, message: 'Job queued to proccess!' });
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
};
