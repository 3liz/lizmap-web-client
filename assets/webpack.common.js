const path = require('path');

module.exports = {
    entry: {
        lizmap: './src/index.js'
    },
    output: {
        filename: '../../lizmap/www/assets/js/[name].js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: [
                    'svg-sprite-loader',
                    'svgo-loader'
                ]
            }
        ]
    }
};
