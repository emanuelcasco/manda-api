const mangaInteractor = require('../interactors/manga');

const logger = require('../logger');
const config = require('../../config');

(function download() {
  if (process.argv.length < 4) {
    logger.error('Expected at least two argument!');
    process.exit(1);
  }

  const manga = process.argv[2];
  const chapter = process.argv[3];
  const options = process.argv[4] || {};

  logger.info(
    `[${manga}-${chapter}] Starting download with options: ${options}. This could take a few minutes...`
  );

  return mangaInteractor
    .downloadChapterImages(manga, chapter)
    .then(response => {
      const { pages } = response;
      logger.info(`[${manga}-${chapter}] ${pages.length} pages generated. Ready to convert!`);
      return mangaInteractor.convertChapterImagesToPdf(manga, chapter, pages);
    })
    .then(response => {
      const { file } = response;
      logger.info(`[${manga}-${chapter}] Sending "${file}" to e-mail.`);

      const { emails, convert } = options;
      if (emails) {
        if (convert) {
          logger.info('Convertion is enabled, all documents you sent to your kindle will be converted.');
        }
        const mailOptions = {
          from: `"Send to Kindle 👻" <${config.mailer.transmitterUser}>`,
          to: emails,
          subject: convert ? 'convert' : 'document',
          text: 'Check out this attached pdf file',
          attachments: [file]
        };

        return mangaInteractor.sendToEmail(mailOptions);
      }
      return true;
    })
    .then(response => {
      logger.info(`[${manga}-${chapter}] Jobs completed succesfully. Shutting down.`);

      if (options.removeOnFinish) {
        return mangaInteractor.clearFiles(manga, chapter).then(() => {
          logger.info(`[${manga}-${chapter}] Files were cleared!`);
          return response;
        });
      }
      return response;
    })
    .then(response => {
      logger.info(response);
      process.exit(0);
    });
})();
