const path = require('path');

module.exports = {
    entry: {
        lizmap: './src/index.js',
        map: '../lizmap/www/assets/js/map.js',
        attributeTable: '../lizmap/www/assets/js/attributeTable.js',
        edition: '../lizmap/www/assets/js/edition.js',
        filter: '../lizmap/www/assets/js/filter.js',
        atlas: '../lizmap/www/assets/js/atlas.js',
        'switcher-layers-actions': '../lizmap/www/assets/js/switcher-layers-actions.js',
        timemanager: '../lizmap/www/assets/js/timemanager.js',
        search: '../lizmap/www/assets/js/search.js',
        view: '../lizmap/www/assets/js/view.js',
        action: '../lizmap/www/assets/js/action.js',
        'bottom-dock': '../lizmap/www/assets/js/bottom-dock.js',
        popupQgisAtlas: '../lizmap/www/assets/js/popupQgisAtlas.js',
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
