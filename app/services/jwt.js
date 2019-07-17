const jwt = require('jsonwebtoken');

const config = require('../../config');

exports.encode = email =>
  new Promise((resolve, reject) => {
    jwt.sign({ email }, config.session.secret, (err, encoded) => {
      return err ? reject(err) : resolve(encoded);
    });
  });

exports.decode = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, config.session.secret, (err, decoded) => {
      return err ? reject(err) : resolve(decoded);
    });
  });
