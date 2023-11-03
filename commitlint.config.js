module.exports = {
  extends: ['@commitlint/config-conventional'],
  ignores: [(message) => message.includes('[skip ci]')],
  rules: {
    'header-max-length': [0, 'always'],
    'body-max-line-length': [0, 'always'],
  },
};
