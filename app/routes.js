const mangaController = require('./controllers/manga');
const tasksController = require('./controllers/tasks');
const sessionController = require('./controllers/session');
const { healthCheck } = require('./controllers/healthCheck');

const { authenticate } = require('./middlewares/auth');

exports.init = app => {
  app.get('/health', healthCheck);

  app.post('/session/login', [], sessionController.login);
  app.get('/session/magic_link', [], sessionController.magicLink);

  app.get('/tasks/:id', [], tasksController.status);

  app.get('/manga/search', [], mangaController.search);

  // TODO app.get('/manga/populars', [], mangaController.getManga); // Get popular mangas
  // TODO app.get('/manga/popular_updates', [], mangaController.getManga); // Get last popular updates
  // TODO app.get('/manga/:manga', [], mangaController.getManga); // Get info from manga
  // TODO app.get('/manga/:manga/:chapter', [], mangaController.downloadChapter); // Get info from chapter

  // Download chapter
  app.post('/download', [authenticate], mangaController.downloadChapter);
};
