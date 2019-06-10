const { tasks, queues, jobs } = require('../app/jobs');

const tasksNames = Object.keys(tasks)
  .map(x => `"${x}"`)
  .join(', ');

exports.init = () => {
  Object.values(tasks).forEach(TASK => {
    queues[TASK].process(jobs[TASK]);
  });
  return `Tasks loaded: ${tasksNames}`;
};
