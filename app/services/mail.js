const path = require('path');

const nodemailer = require('nodemailer');

const logger = require('../logger');
const errors = require('../errors');

const { mailer: config } = require('../../config');

const transporter = nodemailer.createTransport({
  service: config.service,
  auth: {
    user: config.user,
    pass: config.pass
  }
});

// def: sendEmail => MailOptions! => Object!
// MailOptions :: { from: string!, to: string!, subject: string!, text: string!, attachments: [Object] }
exports.sendEmail = mailOptions => {
  logger.info(`Sending e-mail with options: ${JSON.stringify(mailOptions)}`);

  if (mailOptions.attachments) {
    mailOptions.attachments = mailOptions.attachments.map(file => {
      const filename = path.basename(file);
      const filePath = path.resolve(file);
      return { filename, path: filePath };
    });
  }
  return new Promise(resolve => {
    transporter.sendMail(mailOptions, (error, responseInfo) => {
      if (error) {
        logger.error(error);
        throw errors.mailerError('Failure sending e-mail!');
      }
      logger.error('E-mail sent succesfully!');
      return resolve({ ...mailOptions, ...responseInfo });
    });
  });
};
