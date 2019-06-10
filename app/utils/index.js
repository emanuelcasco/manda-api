const fs = require('fs');

const request = require('request-promise');

// def: download => (string!, string!) => Object!
exports.download = (uri, path) => {
  return new Promise((resolve, reject) => {
    request.head(uri, (error, res) => {
      if (error) return reject(error);

      const writeStream = fs.createWriteStream(path);
      return request(uri)
        .pipe(writeStream)
        .on('close', () =>
          resolve({
            path,
            uri,
            type: res.headers['content-type'],
            length: res.headers['content-length']
          })
        )
        .on('error', err => {
          fs.unlinkSync(path);
          return reject(err);
        });
    });
  });
};

// def: fileExist => (string!) => boolean!
exports.fileExist = path => {
  try {
    return fs.existsSync(path);
  } catch (error) {
    return false;
  }
};

// def: keysMapping => (Object!) => Object!
exports.keysMapping = object => {
  return Object.keys(object).reduce((accum, current) => ({ [current]: current, ...accum }), {});
};

// def: mkdir => (string!) => string!
exports.mkdir = path => {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, err => {
      return err ? reject(err) : resolve(path);
    });
  });
};

// def: rm => (string!) => string!
exports.rm = path => {
  return new Promise((resolve, reject) => {
    try {
      if (fs.existsSync(path)) {
        if (fs.lstatSync(path).isDirectory()) {
          fs.readdirSync(path).forEach(file => {
            const currentPath = `${path}/${file}`;
            exports.rm(currentPath);
          });
          fs.rmdirSync(path);
        } else {
          fs.unlinkSync(path);
        }
      }
      resolve(path);
    } catch (error) {
      reject(error);
    }
  });
};

// def: resolveSequentially => ([any!], any! => Promise!) => [Promise]!
exports.resolveSequentially = (array, asyncFn) => {
  const responses = [];
  const resolveAsyncFn = ([x, ...xs]) => {
    return Promise.resolve(asyncFn(x)).then(res => {
      responses.push(res);
      return xs.length > 0 ? resolveAsyncFn(xs) : responses;
    });
  };
  return resolveAsyncFn(array);
};
