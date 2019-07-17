const { resolve: resolvePath } = require('path');

const mailService = require('../services/mail');
const mangaService = require('../services/manga');
const imagemagickService = require('../services/imagemagick');

const logger = require('../logger');
const utils = require('../utils');

const BASE_DIRECTORY = './.temp';

function generateDirectory(...args) {
  const pathsToResolve = [...args].map(String);
  return resolvePath(BASE_DIRECTORY, ...pathsToResolve);
}

function downloadPage(manga, chapter, page) {
  const path = generateDirectory(manga, String(chapter), `${page}.png`);

  if (utils.fileExist(path)) {
    return Promise.resolve({ page, path, downloaded: false });
  }

  return mangaService
    .getPage(manga, chapter, page)
    .then(({ imageSource: source }) => {
      return utils.download(source, path);
    })
    .then(() => ({ page, path, downloaded: true }));
}

function prepareDownload(directory) {
  const promises = [
    // Destination directory must be created before start download!
    utils.mkdir(directory).then(() => logger.info(`Directory ${directory} is ready!`))
  ];
  return Promise.all(promises);
}

exports.downloadChapterImages = (manga, chapter) => {
  const chapterDirectory = generateDirectory(manga, chapter);

  return prepareDownload(chapterDirectory)
    .then(() => {
      logger.info(`[${manga}-${chapter}] Fetching chapter info.`);
      return mangaService.getChapter(manga, chapter);
    })
    .then(({ pages, pagesCount }) => {
      logger.info(`[${manga}-${chapter}] Pages count ${pagesCount}.`);
      const pagesNumbers = pages.map(p => p.number);

      return utils.resolveSequentially(pagesNumbers, page => {
        logger.info(`[${manga}-${chapter}] Pending page ${page}...`);
        return downloadPage(manga, chapter, page).then(({ downloaded, ...response }) => {
          logger.info(
            `[${manga}-${chapter}] Page ${page} ${
              downloaded ? 'downloaded succesfully' : 'already downloaded'
            }.`
          );
          return response;
        });
      });
    })
    .then(pages => ({ manga, chapter, pages: pages.map(p => p.path) }));
};

exports.convertChapterImagesToPdf = (manga, chapter, pages) => {
  const mangaDirectory = generateDirectory(manga);

  const destination = `${mangaDirectory}/${manga}-${chapter}.pdf`;

  if (utils.fileExist(destination)) {
    logger.info(`PDF already generated for ${destination}!`);
    return Promise.resolve({ manga, chapter, file: destination });
  }

  logger.info(`Converting files from "${mangaDirectory}/${chapter}/*.png" to ${destination}`);

  return imagemagickService.convert(pages, destination).then(file => {
    logger.info(`[${manga}-${chapter}] File generated succesfully ${file}`);
    return { manga, chapter, file };
  });
};

exports.sendToEmail = mailOptions => {
  return mailService.sendEmail(mailOptions).then(response => {
    if (response.rejected.length > 0) {
      logger.info(`There was an error with followings e-mail addresses: ${response.rejected}.`);
    }
    logger.info('All e-mails were deliver successfully.');
    return response;
  });
};

exports.clearFiles = (manga, chapter) => {
  const imagesDirectory = generateDirectory(manga, chapter);
  const pdfFile = `${generateDirectory(manga)}/${manga}-${chapter}.pdf`;

  const paths = [imagesDirectory, pdfFile];

  return utils
    .rm(imagesDirectory)
    .then(() => utils.rm(pdfFile))
    .then(() => ({ paths, deleted: true }));
};
