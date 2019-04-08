const path = require('path');

module.exports = {
  lintOnSave: false,
  outputDir: path.resolve(__dirname, 'dist/client'),
  // publicPath: '/task/',
  publicPath: '/',
  devServer: {
    proxy: {
      // '/task/api':
      '/api':
      {
        target: 'http://127.0.0.1:8999',
        changeOrigin: true,
      }
    }
  },
  pluginOptions: {
    webpackBundleAnalyzer: {
      openAnalyzer: true,
    }
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'source-map';
    } else {
      config.devtool = false;
    }
    console.log('\r\n');
    console.log('devtool:', config.devtool);
    console.log('mode:', process.env.NODE_ENV);
    console.log('report:', process.env.REPORT);

    config.plugins.forEach(pluginElem => {
      if (pluginElem.tsconfig != null) {
        var clientTSConfig = './tsconfig.client.json';
        console.warn("update tsconfig from first to second:", pluginElem.tsconfig, clientTSConfig);
        pluginElem.tsconfig = clientTSConfig;
      }
    });
    if (process.env.REPORT === 'true') {
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      config.plugins.push(new BundleAnalyzerPlugin({ generateStatsFile: true }));
    }

    config.resolve.alias['common'] = path.resolve(__dirname, 'src/common');
    config.resolve.alias['client'] = path.resolve(__dirname, 'src/client');


    if (config.optimization != null && config.optimization.splitChunks != null) {
      config.optimization.runtimeChunk = true;
      config.optimization.splitChunks.chunks = 'all';
      config.optimization.splitChunks.maxInitialRequests = Infinity;

      config.optimization.splitChunks.cacheGroups['element-ui'] = {
        test: /[\\\/]node_modules[\\\/]_element-ui@.+/,
        priority: 0,
        chunks: 'initial',
      };

      // config.optimization.splitChunks.cacheGroups.vendors.name = (module) => {
      //   // get the name. E.g. node_modules/packageName/not/this/part.js
      //   // or node_modules/packageName
      //   const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
      //   // npm package names are URL-safe, but some servers don't like @ symbols
      //   return `npm.${packageName.replace(/@/g, '')}`;
      // }

      // config.output.chunkFilename = 'js/[name].m.[contenthash:8].e.js';
      // config.optimization.splitChunks.cacheGroups.vendors.chunks = 'all';
      // config.output.filename = 'js/buble.js'
      // delete config.optimization;
      // delete config.output.chunkFilename;
      // config.optimization.splitChunks.maxAsyncRequests = 1;
      // config.optimization.splitChunks.maxInitialRequests = 1;
      // config.optimization.splitChunks.minChunks = 1;
      // config.optimization.splitChunks.minSize = 50000;
      // 
      // config.optimization.splitChunks.automaticNameDelimiter = '~';

      // config.optimization.splitChunks.cacheGroups.common.priority = -20;
      // config.optimization.splitChunks.cacheGroups.common.reuseExistingChunk = true;
      // config.optimization.splitChunks.cacheGroups.vendors.minChunks = 10;

      // config.optimization.splitChunks.cacheGroups.vendors.priority = -10;
      // config.optimization.splitChunks.cacheGroups.vendors.minChunks = 10;
      // config.optimization.splitChunks.cacheGroups.vendors.minSize = 50000;
      // config.optimization.splitChunks.cacheGroups.vendors.name = 'myChunk';
      // config.optimization.splitChunks.cacheGroups.vendors.filename = 'myChunk';
    }
  },

  chainWebpack: config => {
    // config.module.rule('ts').use('thread-loader').tap(options => {
    //   options = options || {};
    //   options.works = 4;
    //   return options;
    // });
  }
}
