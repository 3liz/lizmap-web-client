import {resolve, dirname} from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    entry: {
        lizmap: './assets/src/index.js',
        map: './assets/src/legacy/map.js',
        attributeTable: './assets/src/legacy/attributeTable.js',
        edition: './assets/src/legacy/edition.js',
        filter: './assets/src/legacy/filter.js',
        atlas: './assets/src/legacy/atlas.js',
        'switcher-layers-actions': './assets/src/legacy/switcher-layers-actions.js',
        timemanager: './assets/src/legacy/timemanager.js',
        view: './assets/src/legacy/view.js',
        'bottom-dock': './assets/src/legacy/bottom-dock.js',
        'map-projects': './assets/src/legacy/map-projects.js',
    },
    output: {
        filename: '[name].js',
        chunkFilename: '[name].bundle.js',
        publicPath: '/assets/js/',
        path: resolve(__dirname, '../lizmap/www/assets/js/')
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
