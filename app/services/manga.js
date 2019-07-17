const cheerio = require('cheerio');
const request = require('request-promise');

const logger = require('../logger');
const errors = require('../errors');

const rootUrl = 'http://www.mangareader.net';

const processEach = (element, cb) => {
  element.each((i, e) => cb(e, i));
};

const options = { timeout: 5000 };

exports.search = query => {
  return request(`${rootUrl}/search/?w=${query}`, options)
    .then(body => {
      const $ = cheerio.load(body);
      const results = [];

      $('#mangaresults .mangaresultitem .mangaresultinner').each((i, element) => {
        const block = { index: i + 1 };
        processEach($(element).find('a'), e => {
          const name = $(e).text();
          const url = $(e).attr('href');
          block.id = url.replace('/', '');
          block.name = name;
          block.url = url;
          block.fullUrl = rootUrl + block.url;
        });
        processEach($(element).find('.imgsearchresults'), e => {
          block.thumb = $(e)
            .css('background-image')
            .replace("url('", '')
            .replace("')", '');
        });
        processEach($(element).find('.chapter_count'), e => {
          block.chapters = $(e).text();
        });
        processEach($(element).find('.manga_type'), e => {
          block.type = $(e).text();
        });
        processEach($(element).find('.manga_genre'), e => {
          block.genre = $(e).text();
        });

        results.push(block);
      });
      return {
        query,
        resultsCount: results.length,
        results
      };
    })
    .catch(err => {
      logger.error(err);
      throw errors.mailerError(`Cannot return search result for "${query}"`);
    });
};

exports.getManga = manga => {
  const mangaUrl = `${rootUrl}/${manga}`;
  return request(mangaUrl, options)
    .then(body => {
      const $ = cheerio.load(body);
      const chapters = [];

      $('#listing tr').each((index, element) => {
        const chapter = { index };
        if ($(element).attr('class') !== 'table_head') {
          processEach($(element).find('td'), elem => {
            chapter.chapterDate = $(elem).text();
            processEach($(elem).find('a'), e => {
              chapter.chapterTitle = $(e).text();
              chapter.chapterUrl = $(e).attr('href');
              chapter.chapterFullUrl = rootUrl + chapter.chapterUrl;
            });
          });
          return chapters.push(chapter);
        }
        return 'no results';
      });
      return {
        mangaUrl,
        chaptersCount: chapters.length,
        chapters
      };
    })
    .catch(err => {
      logger.error(err);
      throw errors.mailerError(`Cannot get manga "${manga}"`);
    });
};

exports.getChapter = (manga, chapter) => {
  const chapterUrl = `${rootUrl}/${manga}/${chapter}`;
  return request(chapterUrl, options)
    .then(body => {
      const $ = cheerio.load(body);
      const pages = [];

      $('#pageMenu option').each((index, element) => {
        const page = { index };
        page.number = $(element).text();
        page.url = $(element).attr('value');
        page.fullUrl = rootUrl + page.url;
        pages.push(page);
      });
      return {
        manga,
        chapter,
        chapterUrl,
        pagesCount: pages.length,
        pages
      };
    })
    .catch(err => {
      logger.error(err);
      throw errors.mailerError(`Cannot get manga ${chapter} from "${manga}"`);
    });
};

exports.getPage = (manga, chapter, page) => {
  const pageUrl = `${rootUrl}/${manga}/${chapter}/${page}`;
  return request(pageUrl, options)
    .then(body => {
      const $ = cheerio.load(body);
      const data = {};

      $('#imgholder').each((_, element) => {
        processEach($(element).find('img'), elem => {
          data.imageHeight = $(elem).attr('height');
          data.imageWidth = $(elem).attr('width');
          data.imageSource = $(elem).attr('src');
          data.imageAlt = $(elem).attr('alt');
        });
      });
      return {
        manga,
        chapter,
        page,
        ...data
      };
    })
    .catch(err => {
      logger.error(err);
      throw errors.mailerError(`Cannot get page ${page} from "${manga}" #${chapter}`);
    });
};
