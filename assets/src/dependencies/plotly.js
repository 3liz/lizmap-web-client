/**
 * Custom bundle: only the trace types used by the dataviz module, to keep the
 * lazy-loaded chunk small. Keep in sync with datavizPlot.class.php trace types.
 *
 * @returns {Promise<object>} The Plotly core module, with those traces registered.
 */
function loadTraces() {
    return Promise.all([
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/core.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/scatter.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/bar.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/box.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/pie.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/histogram.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/histogram2d.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/scatterpolar.js'),
        import(/* webpackChunkName: 'plotly' */ 'plotly.js/lib/sunburst.js'),
    ]).then(([core, ...traces]) => {
        const Plotly = core.default;
        Plotly.register(traces.map(trace => trace.default));
        return Plotly;
    });
}

/**
 * Locales previously vendored as plotly-locale-*.js, each its own small chunk.
 *
 * @param {string} locale Two-letter locale code.
 * @returns {Promise<object>|null} The locale module import, or null if unsupported.
 */
function loadLocale(locale) {
    switch (locale) {
        case 'de': return import(/* webpackChunkName: 'plotly-locale-de' */ 'plotly.js/lib/locales/de.js');
        case 'el': return import(/* webpackChunkName: 'plotly-locale-el' */ 'plotly.js/lib/locales/el.js');
        case 'es': return import(/* webpackChunkName: 'plotly-locale-es' */ 'plotly.js/lib/locales/es.js');
        case 'fr': return import(/* webpackChunkName: 'plotly-locale-fr' */ 'plotly.js/lib/locales/fr.js');
        case 'it': return import(/* webpackChunkName: 'plotly-locale-it' */ 'plotly.js/lib/locales/it.js');
        case 'nl': return import(/* webpackChunkName: 'plotly-locale-nl' */ 'plotly.js/lib/locales/nl.js');
        case 'ro': return import(/* webpackChunkName: 'plotly-locale-ro' */ 'plotly.js/lib/locales/ro.js');
        default: return null;
    }
}

let loadingPromise = null;

/**
 * Load Plotly.js the first time it is needed, then return the same cached
 * instance on every subsequent call.
 *
 * @param {string} [locale] Two-letter locale code to register alongside Plotly, if supported.
 * @returns {Promise<object>} The Plotly module, with the dataviz trace types registered.
 */
function load(locale) {
    if (!loadingPromise) {
        loadingPromise = loadTraces();
    }

    return loadingPromise.then(async Plotly => {
        const localeImport = loadLocale(locale);
        if (localeImport) {
            const localeModule = await localeImport;
            Plotly.register(localeModule.default);
        }
        return Plotly;
    });
}

export default { load };
