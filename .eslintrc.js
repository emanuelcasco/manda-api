const { rules, ...defaultConfig } = require('eslint-config-wolox-node');

module.exports = {
  ...defaultConfig,
  rules: {
    ...rules,
    'arrow-body-style': 0,
    'curly': 0
  }
};
