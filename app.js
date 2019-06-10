const express = require('express');

const loaders = require('./loaders');
const routes = require('./app/routes');
const errors = require('./app/middlewares/errors');

const app = express();

loaders.init(app);

routes.init(app);

app.use(errors.handle);

module.exports = app;
