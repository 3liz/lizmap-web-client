const path = require('path');

module.exports = {
    entry: {
        map: './src/index.js'
    },
    output: {
        filename: '../../lizmap/www/js/[name].js',
        chunkFilename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        libraryExport: 'default', // put the default export of index.js...
        libraryTarget: 'var', //  ... into a variable...
        library: 'Lizmap' //  ... which has the name Lizmap
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: { loader: 'html-loader' }
            }
        ],
    }
};