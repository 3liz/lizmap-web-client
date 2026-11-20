/**
 * @module modules/Utils.js
 * @name Utils
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { Point, LineString } from 'ol/geom.js';
import { Feature } from 'ol';
import { NetworkError, HttpError, ResponseError } from './Errors.js';
import { createEnum } from './utils/Enums.js';
import DOMPurify from 'dompurify';
import { equals } from 'ol/coordinate.js';

/**
 * Enum for HTTP request methods
 * @readonly
 * @enum {string}
 * @property {string} GET  - The GET method requests a representation of the specified resource
 * @property {string} HEAD - The HEAD method asks for a response identical to a GET request,
 *                           but without a response body
 * @property {string} POST - The POST method submits an entity to the specified resource,
 *                           often causing a change in state or side effects on the server
 * @property {string} PUT  - The PUT method replaces all current representations of the target
 *                           resource with the request content
 * @property {string} DELETE  - The DELETE method deletes the specified resource
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods|HTTP request methods}
 */
export const HttpRequestMethods = createEnum({
    'GET': 'GET',
    'HEAD': 'HEAD',
    'POST': 'POST',
    'PUT': 'PUT',
    'DELETE': 'DELETE',
});

/**
 * Class representing a file downloader.
 * Can be used to override the format file name.
 * @class
 */
export class FileDownloader {

    /**
     * FileDownloader construtor
     * @param {string} url        - A string or any other object with a stringifier — including a URL object — that provides the URL of the resource to send the request to.
     * @param {object} parameters - Parameters that will be serialize as a Query string
     */
    constructor(url, parameters) {
        this._url = url;
        this._parameters = parameters;
    }

    /**
     * The url
     * @type {string}
     */
    get url() {
        return this._url;
    }

    /**
     * The parameters
     * @type {object}
     */
    get parameters() {
        return this._parameters;
    }

    /**
     * The parameters as URLSearchParams
     * @type {URLSearchParams}
     * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
     */
    get urlParameters() {
        return new URLSearchParams(this._parameters);
    }

    /**
     * Format a file name to be used as a download file name / can be replaced by a child class
     * @param {string} filename the file name to format
     * @returns {string} the file name formated
     */
    formatFileName(filename) {
        return filename;
    }

    /**
     * fetch file and download it
     * @returns {Promise<Response>} the response downloaded
     */
    async fetch() {
        return await Utils.fetch(this._url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: this.urlParameters,
        }).then(async (response) => {
            let filename = "";
            const disposition = response.headers.get("Content-Disposition");
            if (disposition && disposition.indexOf('filename') !== -1) {
                var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                var matches = filenameRegex.exec(disposition);
                if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
            }
            filename = this.formatFileName(filename);

            let type = 'application/octet-stream';
            const contentType = response.headers.get("content-type");
            // Firefox >= 98 opens blob in its pdf viewer
            // This is a hack to force download as in Chrome
            if (navigator.userAgent.toLowerCase().indexOf('firefox') == -1 || contentType != 'application/pdf') {
                type = contentType;
            }

            const blob = new File([await response.arrayBuffer()], filename, { type: type });
            const downloadUrl = URL.createObjectURL(blob);

            if (filename) {
                // use HTML5 a[download] attribute to specify filename
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                a.dispatchEvent(new MouseEvent('click'));
            } else {
                window.open(downloadUrl);
            }
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            await sleep(100); // wait a little to have time to have the download triggered, and then cleanup
            URL.revokeObjectURL(downloadUrl)

            return Promise.resolve(response);
        }).catch(error => {
            return Promise.reject(error);
        });
    }
}

/**
 * @callback downloadFileCallback
 * @param {Response} response - The response
 */

/**
 * @callback downloadFileErrorCallback
 * @param {HttpError|NetworkError} error - The error
 */

/**
 * Sanitize HTML hook added to DOMPurify
 * @param boolean
 */
let SANITIZE_HTML_HOOK_ADDED = false;

/**
 * The main utils methods
 * @class
 * @name Utils
 */
export class Utils {
    static globalStyleSheets = null;
    /**
     * Download a file provided as a string
     * @static
     * @param {string} text - file content
     * @param {string} fileType - file's MIME type
     * @param {string} fileName - file'name with extension
     */
    static downloadFileFromString(text, fileType, fileName) {
        var blob = new Blob([text], { type: fileType });

        var a = document.createElement('a');
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => { URL.revokeObjectURL(a.href); }, 1500);
    }

    /**
     * Send an ajax POST request to download a file
     * @static
     * @param {string} url        - A string or any other object with a stringifier — including a URL object — that provides the URL of the resource to send the request to.
     * @param {Array} parameters  - Parameters that will be serialize as a Query string
     * @param {downloadFileCallback} callback - optional callback executed when download ends
     * @param {downloadFileErrorCallback} errorCallback - optional callback executed when error event occurs
     */
    static downloadFile(url, parameters, callback = () => {}, errorCallback = () => {}) {
        const fileDownloader =new FileDownloader(url, parameters);
        fileDownloader.fetch()
            .then(callback)
            .catch(errorCallback);
    }

    /**
     * Fetching a resource from the network, returning a promise that is fulfilled once the response is successful.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options  - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves to a successful Response object (status in the range 200 – 299)
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static async fetch(resource, options) {
        return fetch(resource, options).then(response => {
            if (response.ok) {
                return response;
            }

            return Promise.reject(new HttpError('HTTP error: ' + response.status, response.status, resource, options));
        }).catch(error => {
            if (error instanceof NetworkError) {
                return Promise.reject(error);
            }
            return Promise.reject(new NetworkError(error.message, resource, options));
        });
    }

    /**
     * Fetching a resource from the network, which is JSON or GeoJSON, returning a promise that resolves with the result of parsing the response body text as JSON.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves with the result of parsing the response body text as JSON.
     * @throws {ResponseError} In case of invalid content type (not application/json or application/vnd.geo+json) or Invalid JSON
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static async fetchJSON(resource, options) {
        return Utils.fetch(resource, options).then(response => {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('application/json') ||
                contentType.includes('application/vnd.geo+json')) {
                return response.json().catch(error => {
                    return Promise.reject(new ResponseError('Invalid JSON: ' + error.message, response, resource, options));
                });
            }

            return Promise.reject(new ResponseError('Invalid content type: ' + contentType, response, resource, options));
        }).catch(error => {return Promise.reject(error)});
    }

    /**
     * Fetching a resource from the network, which is HTML, returning a promise that resolves with a text representation of the response body.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves with a text representation of the response body.
     * @throws {ResponseError} In case of invalid content type (not text/html)
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static async fetchHTML(resource, options) {
        return Utils.fetch(resource, options).then(response => {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('text/html')) {
                return response.text().catch(error => {
                    return Promise.reject(new ResponseError('HTML error: ' + error.message, response, resource, options));
                });
            }

            return Promise.reject(new ResponseError('Invalid content type: ' + contentType, response, resource, options));
        }).catch(error => {return Promise.reject(error)});
    }

    /**
     * Fetching a resource from the network, which is XML, returning a promise that resolves with a text representation of the response body.
     * @static
     * @param {string} resource - This defines the resource that you wish to fetch. A string or any other object with a stringifier — including a URL object — that provides the URL of the resource you want to fetch.
     * @param {object} options - An object containing any custom settings you want to apply to the request.
     * @returns {Promise} A Promise that resolves with a text representation of the response body.
     * @throws {ResponseError} In case of invalid content type (not text/xml)
     * @throws {HttpError} In case of not successful response (status not in the range 200 – 299)
     * @throws {NetworkError} In case of catch exceptions
     * @see https://developer.mozilla.org/en-US/docs/Web/API/fetch
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Response
     */
    static async fetchXML(resource, options) {
        return Utils.fetch(resource, options).then(response => {
            const contentType = response.headers.get('Content-Type') || '';

            if (contentType.includes('text/xml')) {
                return response.text().catch(error => {
                    return Promise.reject(new ResponseError('XML error: ' + error.message, response, resource, options));
                });
            }

            return Promise.reject(new ResponseError('Invalid content type: ' + contentType, response, resource, options));
        }).catch(error => {return Promise.reject(error)});
    }

    /**
     * Get the corresponding resolution for the scale with meters per unit
     * @static
     * @param {number} scale         - The scale
     * @param {number} metersPerUnit - The meters per unit
     * @returns {number} The corresponding resolution
     * @see https://github.com/openlayers/ol2/blob/master/lib/OpenLayers/Util.js#L1101
     */
    static getResolutionFromScale(scale, metersPerUnit) {
        const inchesPerMeter = 1000 / 25.4;
        const DPI = 96;
        const resolution = scale / (inchesPerMeter * DPI * metersPerUnit);
        return resolution;
    }

    /**
     * Get the corresponding scale for the resolution with meters per unit
     * @static
     * @param {number} resolution    - The resolution
     * @param {number} metersPerUnit - The meters per unit
     * @returns {number} The corresponding scale
     * @see getResolutionFromScale
     */
    static getScaleFromResolution(resolution, metersPerUnit) {
        const inchesPerMeter = 1000 / 25.4;
        const DPI = 96;
        const scale = resolution * inchesPerMeter * DPI * metersPerUnit;
        return scale;
    }

    /**
     * Sanitize HTML content before inserting it in DOM
     * @static
     * @param {string} content - The content to sanitize
     * @returns {string} The sanitized content
     */
    static sanitizeHTMLContent(content) {
        // Register the iframe-sandboxing hook only once. DOMPurify is a singleton, so
        // re-adding the hook on every call would stack duplicate hooks indefinitely.
        if (!SANITIZE_HTML_HOOK_ADDED) {
            DOMPurify.addHook('afterSanitizeAttributes', node => {
                // Sandbox all iframes except those from the same origin.
                // Use getAttribute() (not node.attributes['src'].textContent) so a
                // src-less iframe (e.g. srcdoc) does not throw and is sandboxed by default.
                if (node.nodeName === 'IFRAME') {
                    const src = node.getAttribute('src') || '';
                    if (!src.startsWith(document.location.origin)) {
                        node.setAttribute('sandbox', 'allow-scripts allow-forms');
                    }
                }
            });
            SANITIZE_HTML_HOOK_ADDED = true;
        }
        return DOMPurify.sanitize(content, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['target'],
            CUSTOM_ELEMENT_HANDLING: {
                tagNameCheck: /^lizmap-/,
                attributeNameCheck: /crs|bbox|edition-restricted|layerid|layertitle|uniquefield|expressionfilter|withgeometry|sortingfield|sortingorder|draggable/,
            }
        });
    }

    /**
     * Sanitize the GetFeatureInfo content - alias of sanitizaHTMLContent
     * @static
     * @param {string} content - The content to sanitize
     * @returns {string} The sanitized content
     * @see sanitizaHTMLContent
     */
    static sanitizeGFIContent(content) {
        return Utils.sanitizeHTMLContent(content);
    }

    /**
     * Injects global stylesheets into the given shadowRoot instance
     * @param {ShadowRoot} shadowRoot - component shadowRoot instance
     * @returns {void}
     */
    static addGlobalStylesToShadowRoot(shadowRoot) {
        if (!Utils.globalStyleSheets) {
            Utils.globalStyleSheets = Array.from(document.styleSheets)
                .map(x => {
                    const sheet = new CSSStyleSheet();
                    const css = Array.from(x.cssRules).map(rule => rule.cssText).join(' ');
                    sheet.replaceSync(css);
                    return sheet;
                });
        }

        shadowRoot.adoptedStyleSheets.push(
            ...Utils.globalStyleSheets
        );
    }

    /**
     * Computes the intersection point of two 2D line segments using their parametric representation.
     *
     * Returns `null` if the segments do not intersect within their endpoints, are parallel/collinear,
     * or if either segment is degenerate (zero-length).
     *
     * @param {Array<Array<number>>} segmentA - First segment defined by `[start, end]` coordinates.
     * @param {Array<Array<number>>} segmentB - Second segment defined by `[start, end]` coordinates.
     * @returns {Array<number> | null} The `[x, y]` coordinates of the intersection point, or `null` if none exists.
     */
    static getLineSegmentsIntersection(segmentA, segmentB) {
        // Base relative tolerance for floating-point comparisons
        const eps = 1e-12;

        // Extract segment endpoints: segmentA = [p0, p1], segmentB = [p2, p3]
        const p0 = segmentA[0];
        const p1 = segmentA[1];
        const p2 = segmentB[0];
        const p3 = segmentB[1];

        // Compute direction vectors for both segments
        const deltaA_x = p1[0] - p0[0];
        const deltaA_y = p1[1] - p0[1];
        const deltaB_x = p3[0] - p2[0];
        const deltaB_y = p3[1] - p2[1];

        // collinear or parallel segments

        // calculate the square length of each segment (square module)
        const lenSqA = deltaA_x * deltaA_x + deltaA_y * deltaA_y;
        const lenSqB = deltaB_x * deltaB_x + deltaB_y * deltaB_y;

        // degenerate zero-length segment, it happens on square polygons drawned with digitzing tool when
        // an extra point is added at the end of digitization.
        // this control is also inside getSegmentsFromGeometry function but, since this is a static function, coulb be called
        // also as s stand alone function
        if (lenSqA === 0 || lenSqB === 0) return null;

        // 2D cross product (determinant) of the direction vectors.
        // TODO: Handle overlapping collinear segments if endpoint-touch detection is needed.
        const d = (-deltaB_x * deltaA_y + deltaA_x * deltaB_y)

        // deal with floating-point approximation generated from "d" calculation above
        // probably it's a bit overkill but this should cover thiny numbers resulting from, for instance, EPSG:4326 coordinates
        // subtraction and large numbers too (for instance coordinates in EPSG:3857)
        // scale epsilon by the product of segment lengths so tolerance works across both
        // small geographic coordinates (e.g., EPSG:4326) and large projected coordinates (e.g., EPSG:3857).
        if (Math.abs(d) <= eps * Math.sqrt(lenSqA * lenSqB)) return null;

        // Compute parametric positions `s` (along segment B) and `t` (along segment A)
        // where the infinite lines intersect:
        // - Intersection lies on both segments iff 0 <= s <= 1 and 0 <= t <= 1
        // - Values outside [0, 1] indicate intersection only on the line extensions
        // progress on segent a, find the position on the extension of segment a where the intersection occurs
        const s = (-deltaA_y * (p0[0] - p2[0]) + deltaA_x * (p0[1] - p2[1])) / d;
        // progress on the segment b, find the position on the extension of segment b where the intersection occurs
        const t = ( deltaB_x * (p0[1] - p2[1]) - deltaB_y * (p0[0] - p2[0])) / d;

        // there are several possible cases:
        // 1. the intesecion point lies on both segments:
        //      s >= 0 && s <= 1 && t >= 0 && t <= 1
        //      The intersection is valid
        //
        // 2. the intersection point lies on segment A but outside segment B (on its extension) or vice versa
        //      s >= 0 && s <= 1 but t is < 0 or > 1 or vice versa
        //      The instersection is not valid
        //
        // 3. the intersection lies outside of both segments
        //      both s and t are greater than 1 or lessere than 0
        //      The intersection is not valid

        // Allow `eps` margin around [0, 1] so endpoint intersections aren't missed due to rounding
        if (s >= -eps && s <= 1 + eps && t >= -eps && t <= 1 + eps) {
            // Return intersection, using t coefficent
            // adjust t value, which could be grater than 1 and lessere than 0 here
            const tCap = Math.max(0, Math.min(1, t));
            return [p0[0] + tCap * deltaA_x, p0[1] + tCap * deltaA_y];
            // we could obtain same result by using s and
            // returning [p2[0] + (sCap * deltaB_x), p2[1] + (sCap * deltaB_y)]
        }

        return null;
    }

    /**
     * Decomposes a `LineString` or `Polygon` geometry into an array of individual 2D line segments.
     *
     * For polygons, iterates over all linear rings (exterior and interior holes) and filters out
     * degenerate zero-length segments caused by consecutive duplicate vertices.
     *
     * @param {Geometry} geom - OpenLayers geometry to decompose (`LineString` or `Polygon`).
     * @returns {Array<Array<Array<number>>>} Array of segments, each defined as `[start, end]` coordinates.
     */
    static getSegmentsFromGeometry(geom){
        const type = geom.getType();
        const segments = [];

        if (type === 'LineString') {
            const coords = geom.getCoordinates();
            for (let i = 0; i < coords.length - 1; i++) {
                segments.push([coords[i], coords[i + 1]]);
            }
        } else if (type === 'Polygon') {
            // Iterate over exterior and interior (hole) rings
            geom.getLinearRings().forEach(ring => {
                const ringCoord = ring.getCoordinates();
                for (let i = 0; i < ringCoord.length - 1; i++) {
                    if(!equals(ringCoord[i], ringCoord[i + 1])){
                        // skip 0 length segments
                        // Skip zero-length segments caused by consecutive duplicate vertices
                        // (e.g., extra closing vertices added by the digitizing tool or malformed imported features)
                        segments.push([ringCoord[i], ringCoord[i + 1]]);
                    }
                }
            });
        }

        return segments;
    }

    /**
     * Computes all unique pairwise intersection points across a set of OpenLayers features.
     *
     * Supports `Point`, `LineString`, and `Polygon` geometries (including polygon boundaries/holes).
     * Uses bounding-box filtering and identical-geometry checks to skip unnecessary segment comparisons,
     * then deduplicates overlapping intersection coordinates before returning them as `Point` features.
     *
     * @param {Array<Feature>} featuresSet - Input features to test for intersections.
     * @returns {Array<Feature>} Array of deduplicated `Point` features at each intersection.
     */
    static calculateGeometriesIntersections(featuresSet) {
        const features = [...featuresSet]
        const intersections = [];

        for (let i = 0; i < features.length; i++) {

            // get geometries properties for the i feature
            const featA = features[i];
            const geomA = featA.getGeometry();
            const typeA = geomA.getType();
            const extentA = geomA.getExtent();

            // j starts from i+1 in order to avoid self-comparison and duplicate (A, B) / (B, A) checks
            for (let j = i + 1; j < features.length; j++) {
                // get geometries properties for the j feature
                const featB = features[j];
                const geomB = featB.getGeometry();
                const typeB = geomB.getType();

                // bounding-box rejection: skip pair if extents do not overlap
                if (!geomB.intersectsExtent(extentA)) continue;

                // skip identical geometries to avoid reporting every shared vertex as an intersection
                if (typeA === typeB) {
                    const coordsA = geomA.getFlatCoordinates();
                    const coordsB = geomB.getFlatCoordinates();

                    // test geometries equality
                    if (coordsA.length == coordsB.length && coordsA.every((a,i)=> a == coordsB[i])) continue;
                }

                // linear or polygonal geometries — decompose into segments and test all segment pairs
                if ((typeA === 'LineString' || typeA === 'Polygon') && (typeB === 'LineString' || typeB === 'Polygon')) {
                    // get segments for both geometry
                    const segmentsA = Utils.getSegmentsFromGeometry(geomA);
                    const segmentsB = Utils.getSegmentsFromGeometry(geomB);

                    // compare each segments to get intersections
                    for (const segA of segmentsA) {
                        for (const segB of segmentsB) {
                            const pt = Utils.getLineSegmentsIntersection(segA, segB);
                            if (pt) {
                                intersections.push(pt);
                            }
                        }
                    }
                } else if (typeA === 'Point' || typeB === 'Point') {
                    // at least one geometry is a Point — use OpenLayers' native coordinate intersection
                    const pointGeom = typeA === 'Point' ? geomA : geomB;
                    const otherGeom = typeA === 'Point' ? geomB : geomA;
                    const pointCoordinates = pointGeom.getCoordinates();

                    // for Polygons, test boundary intersection by converting each LinearRing to a LineString
                    // (note: `Polygon.intersectsCoordinate` checks interior containment, not boundary intersection)
                    const intersects = otherGeom.getType() == 'Polygon' ?
                        otherGeom.getLinearRings().some((ring) => {
                            const ringLine = new LineString(ring.getCoordinates());
                            return ringLine.intersectsCoordinate(pointCoordinates);
                        }) :
                        // it's LineString vs Point, native OL check
                        otherGeom.intersectsCoordinate(pointCoordinates);

                    // push coordinates
                    if (intersects) {
                        intersections.push(pointCoordinates);
                    }
                }
            }
        }

        //  Deduplicate identical intersection coordinates (e.g., probably reare situation when 3+ segments meet at a single point)
        const uniqueIntersection = Array.from(
            new Set(intersections.map(p => p.join(',')))
        ).map(s => s.split(',').map(Number));

        // Convert coordinates to Point features
        return uniqueIntersection.map(coords => new Feature(new Point(coords)));
    }
}
