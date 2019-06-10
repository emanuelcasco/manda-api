const Queue = require('bull');
const Redis = require('ioredis');

const tasks = require('./tasks');
const config = require('../../config');

const REDIS_CONFIG = config.redis.url;

const opts = {
  createClient: () => new Redis(REDIS_CONFIG)
};

module.exports = Object.values(tasks).reduce((queues, taskName) => {
  return { [taskName]: new Queue(taskName, opts), ...queues };
}, {});
