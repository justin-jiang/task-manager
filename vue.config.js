const path = require('path');
module.exports = {
  lintOnSave: false,
  outputDir: path.resolve(__dirname, 'dist/client'),
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://127.0.0.1:8999',
        changeOrigin: true,
      }
    }
  },
  configureWebpack: config => {
    config.devtool = 'source-map';
    config.plugins.forEach(pluginElem => {
      if (pluginElem.tsconfig != null) {
        var clientTSConfig = './tsconfig.client.json';
        console.warn("update tsconfig from first to second", pluginElem.tsconfig, clientTSConfig);
        pluginElem.tsconfig = clientTSConfig;
      }
    });
    config.resolve.alias['common'] = path.resolve(__dirname, 'src/common');
    config.resolve.alias['client'] = path.resolve(__dirname, 'src/client');
  }
}
