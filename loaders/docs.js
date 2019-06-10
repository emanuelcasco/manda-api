const express = require('express');
const path = require('path');

exports.init = app => {
  // Client must send "Content-Type: application/json" header
  app.use('/docs', express.static(path.join(__dirname, 'docs')));
  return 'Set up documentation static files.';
};
