const webpackConfig = require('./.webpack.config.js');

module.exports = {
  configureWebpack: webpackConfig,
  pages: {
    index: {
      entry: 'src/client/main.js',
    },
  },
};
