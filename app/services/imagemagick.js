const im = require('imagemagick');

// def: convert => (...[string!], string!) => string!
exports.convert = (sources, destination) => {
  const options = [...sources, destination];
  return new Promise((resolve, reject) => {
    im.convert(options, err => {
      if (err) reject(err);
      resolve(destination);
    });
  });
};
