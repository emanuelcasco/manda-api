const jwt = require('../services/jwt');
const mailer = require('../services/mail');
const logger = require('../logger');
const errors = require('../errors');

const redis = require('../../libs/redis');

const config = require('../../config');

const generateBody = ({ email, link }) => `
  <p>Hi, <b>${email}</b>!</p>
  <p>Click on the following link to login: <a href="${link}">LOGIN</a></p>`;

exports.login = (req, res, next) => {
  const { email } = req.body;

  if (!email) throw errors.defaultError('E-mail missing');

  const token = jwt.encode(email);

  const mailOptions = {
    from: 'Manda - Manga e-mail',
    to: email,
    subject: 'Magic invitation',
    html: generateBody({ email, link: `${config.hostname}/session/magic_link?token=${token}` })
  };

  return redis
    .sismember(config.session.whitelist, email)
    .then(isMember => {
      if (!isMember) {
        return next(errors.authError('E-mail does not belong to whitelist'));
      }

      return mailer.sendEmail(mailOptions);
    })
    .then(() => {
      return res.status(200).send({
        message: `Magic link was sent to your e-mail "${email}"`
      });
    })
    .catch(err => {
      logger.error(err);
      return next(err);
    });
};

exports.magicLink = (req, res, next) => {
  const { token } = req.query;

  try {
    const { email } = jwt.decode(token);

    if (!email) {
      return next(errors.defaultError('Invalid token, e-mail cannot be null'));
    }

    return res
      .set(config.session.header, token)
      .status(200)
      .send({ message: 'Succesfully authenticated', email });
  } catch (err) {
    return next(errors.defaultError('Invalid token'));
  }
};
