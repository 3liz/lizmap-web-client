import {resolve, dirname} from 'path';
import { fileURLToPath } from 'url';
import { IgnorePlugin } from '@rspack/core';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    plugins: [
        // Our Plotly custom bundle (assets/src/dependencies/plotly.js) never registers
        // the 'map' (maplibre) subplot, but plotly.js unconditionally requires this CSS
        // from its trace registry, which rspack can't parse as JS.
        new IgnorePlugin({ resourceRegExp: /maplibre-gl\/dist\/maplibre-gl\.css$/ }),
    ],
    resolve: {
        alias: {
            // Use the Panoramax viewer's self-contained pre-built bundle: CSS is
            // inlined as constructable stylesheets and MapLibre is excluded (the
            // PhotoViewer does not need it). This avoids bundling its per-component
            // `import ... with { type: 'css' }` sources, which rspack does not turn
            // into CSSStyleSheet objects.
            '@panoramax/web-viewer$': resolve(__dirname, '../node_modules/@panoramax/web-viewer/build/cjs/index_photoviewer.js'),
        },
    },
    module: {
        rules: [
            {
                // The Panoramax pre-built CJS bundle uses CommonJS `exports`/`module`.
                // `javascript/auto` tells rspack to treat it as CJS even when the
                // workspace is `"type": "module"`, preventing the
                // "exports is not defined" runtime error in the lazy chunk.
                test: /node_modules[\\/]@panoramax[\\/]web-viewer[\\/]build[\\/]cjs[\\/]/,
                type: 'javascript/auto',
            }
        ]
    },
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
        publicPath: 'auto',
        path: resolve(__dirname, '../lizmap/www/assets/js/')
    },
};
