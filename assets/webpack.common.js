const path = require('path');

module.exports = {
    entry: {
        lizmap: './src/index.js',
        map: './src/legacy/map.js',
        attributeTable: './src/legacy/attributeTable.js',
        edition: './src/legacy/edition.js',
        filter: './src/legacy/filter.js',
        atlas: './src/legacy/atlas.js',
        'switcher-layers-actions': './src/legacy/switcher-layers-actions.js',
        timemanager: './src/legacy/timemanager.js',
        search: './src/legacy/search.js',
        view: './src/legacy/view.js',
        action: './src/legacy/action.js',
        'bottom-dock': './src/legacy/bottom-dock.js',
        popupQgisAtlas: './src/legacy/popupQgisAtlas.js',
        //jspdf: './node_modules/jspdf/dist/jspdf.es.min.js'
    },
    output: {
        publicPath: '/assets/js/',
        filename: '[name].js',
        chunkFilename: '[name].js',
        path: path.resolve(__dirname, 'dist/../../lizmap/www/assets/js')
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
