const path = require('path');

module.exports = {
	mode: 'development',
	devtool: 'inline-source-map',
	entry: {
		map: './src/index.js'
	},
	output: {
		filename: '../../lizmap/www/js/[name].js',
		chunkFilename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
	    rules: [
	      {
	        test: /\.css$/i,
	        use: ['style-loader', 'css-loader'],
	      },
	    ],
	  }
};