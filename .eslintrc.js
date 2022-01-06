module.exports = {
  "env": {
    "es2021": true
  },
  "extends": ["eslint:recommended", "prettier"],
  "plugins": ["prettier"], // eslint-plugin-prettier
  "parserOptions": {
    "ecmaVersion": 12,
  },
  rules: {
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'linebreak-style': 0,
  },
  globals: {
    require: true,
    Page: true,
    wx: true,
    App: true,
    getApp: true,
    getCurrentPages: true,
    Component: true,
    getRegExp: true,
    requirePlugin: true,
    console: true,
    module: true,
    setInterval: true,
    clearInterval: true,
  },
};
