const path = require('path');

module.exports = {
  devServer
};

function devServer() {
  return {
    port: 3000,
    contentBase: path.join(__dirname, '../public'),
    hot: true,
    open: false,
    historyApiFallback: true,
    proxy: {
      '/api': {
         target: {
          target: 'http://0.0.0.0:8000',
          secure: false,
          changeOrigin: false,
         }
      }
    }
  };
}
