const jwt = require('../services/jwt');
const mailer = require('../services/mail');
const logger = require('../logger');
const errors = require('../errors');

const redis = require('../../libs/redis');

const config = require('../../config');

const generateBody = ({ email, link }) => `
  <h1>Hi, <b>${email}</b>!</h1>
  <p>Here is a Magic Link for you to log in: <a href="${link}">LOGIN</a></p>`;

exports.login = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(errors.defaultError('E-mail missing'));
    }

    const isMember = await redis.sismember(config.session.whitelist, email);

    if (!isMember) {
      return next(errors.authError('E-mail does not belong to whitelist'));
    }

    const token = await jwt.encode(email);

    const mail = await mailer.sendEmail({
      from: 'Manda - Manga e-mail',
      to: email,
      subject: 'Magic invitation',
      html: generateBody({ email, link: `${config.hostname}/session/magic_link?token=${token}` })
    });

    return res.status(200).send({
      message: `Magic link was sent to your e-mail "${mail.to}"`
    });
  } catch (err) {
    logger.error(err);
    return next(err);
  }
};

exports.magicLink = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { email } = await jwt.decode(token);

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
