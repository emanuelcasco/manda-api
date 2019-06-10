const tasksManager = require('../services/tasksManager');
const mangaInteractor = require('../interactors/manga');

const logger = require('../logger');
const config = require('../../config');

const queues = require('./queues');
const { DOWNLOAD_CHAPTER, CONVERT_CHAPTER, DELIVER_CHAPTER, CLEAN_CHAPTER } = require('./tasks');

const updateStatus = (task, status) => {
  const { id } = task;
  return tasksManager.upsertTask(id, { ...task, status });
};

async function downloadChapter(job, done) {
  const { id } = job.data;
  logger.info(`[${id}] Starting downloading job, status "${job.data.status}" (attemps: ${job.attemps}).`);
  try {
    const task = await updateStatus(job.data, 'downloading');

    const { manga, chapter } = task;
    logger.info(`[${id}] Downloading "${manga}" #${chapter}.`);

    const { pages } = await mangaInteractor.downloadChapterImages(manga, chapter);
    logger.info(`[${id}] Downloaded ${pages.length} pages for "${manga}" #${chapter}.`);

    const updatedTask = await updateStatus({ ...task, pages }, 'downloaded');
    logger.info(`[${id}] Task ${updatedTask.status}.`);

    queues[CONVERT_CHAPTER].add(updatedTask);
    return done(null, updatedTask);
  } catch (error) {
    logger.error(`[${id}] Task fails! Details below...`);
    logger.error(error);
    return done(error);
  }
}

async function convertChapter(job, done) {
  const { id } = job.data;
  logger.info(`[${id}] Starting convertion job, status "${job.data.status}" (attemps: ${job.attemps}).`);
  try {
    const task = await updateStatus(job.data, 'converting');

    const { manga, chapter, pages } = task;
    logger.info(`[${id}] Converting "${manga}" #${chapter} pages.`);

    const { file } = await mangaInteractor.convertChapterImagesToPdf(manga, chapter, pages);
    logger.info(`[${id}] File ${file} converted.`);

    const updatedTask = await updateStatus({ ...task, file }, 'converted');
    logger.info(`[${id}] Task ${updatedTask.status}.`);

    queues[DELIVER_CHAPTER].add(updatedTask);
    return done(null, updatedTask);
  } catch (error) {
    logger.error(`[${id}] Task fails! Details below...`);
    logger.error(error);
    return done(error);
  }
}

async function deliverChapter(job, done) {
  const { id } = job.data;
  logger.info(`[${id}] Starting delivery job, status "${job.data.status}" (attemps: ${job.attemps}).`);
  try {
    const task = await updateStatus(job.data, 'delivering');

    const { manga, chapter, file, pages, receivers, convert } = task;
    logger.info(`[${id}] Delivering file "${file}" to "${receivers}".`);

    const mailOptions = {
      from: `"Send to Kindle 👻" <${config.mailer.receipient}>`,
      to: receivers,
      subject: convert ? 'convert' : 'document',
      text: `Check out this attached pdf file: "${manga}" #${chapter} (${pages.length} pages).`,
      attachments: [file]
    };

    const delivered = await mangaInteractor.sendToEmail(mailOptions);
    logger.info(`[${id}] File sent succesfully to ${delivered.to}.`);

    const updatedTask = await updateStatus({ ...task, file }, 'delivered');
    logger.info(`[${id}] Task ${updatedTask.status}.`);

    queues[CLEAN_CHAPTER].add(updatedTask);
    return done(null, updatedTask);
  } catch (error) {
    logger.error(`[${id}] Task fails! Details below...`);
    logger.error(error);
    return done(error);
  }
}

async function cleanChapterFiles(job, done) {
  const { id } = job.data;
  logger.info(`[${id}] Starting cleaning job, status "${job.data.status}" (attemps: ${job.attemps}).`);
  try {
    const task = await updateStatus(job.data, 'delivering');

    const { manga, chapter } = task;
    logger.info(`[${id}] Cleaning files from "${manga}" #"${chapter}".`);

    const { paths } = await mangaInteractor.clearFiles(manga, chapter);
    logger.info(`[${id}] ${paths.length} files and folders deleted.`);

    const deleted = await tasksManager.remove(id);
    logger.info(`[${id}] Task destroyed.`);

    return done(null, deleted);
  } catch (error) {
    logger.error(`[${id}] Task fails! Details below...`);
    logger.error(error);
    return done(error);
  }
}

module.exports = {
  [DOWNLOAD_CHAPTER]: downloadChapter,
  [CONVERT_CHAPTER]: convertChapter,
  [DELIVER_CHAPTER]: deliverChapter,
  [CLEAN_CHAPTER]: cleanChapterFiles
};
