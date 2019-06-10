const tasksController = require('./controllers/tasks');
const mangaController = require('./controllers/manga');
const { healthCheck } = require('./controllers/healthCheck');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/tasks/:id', [], tasksController.status);
  app.get('/manga/search', [], mangaController.search);

  app.post('/download', [], mangaController.queueChapterToDownload);
};
