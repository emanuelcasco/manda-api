const redis = require('../../libs/redis');

exports.getById = id => {
  return redis.get(`task:${id}`).then(response => {
    if (!response) return null;
    return JSON.parse(response);
  });
};

exports.remove = id => {
  return redis.del(`task:${id}`);
};

exports.status = id => {
  return exports.getById(id).then(task => {
    return task ? task.status : null;
  });
};

exports.upsertTask = (id, value) => {
  return redis.set(`task:${id}`, JSON.stringify(value)).then(() => value);
};
