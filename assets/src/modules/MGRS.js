/**
 * @module MGRS.js
 * @name MGRS
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import Graticule from 'ol/layer/Graticule.js';

import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import Feature from 'ol/Feature.js';

import {Text, Fill, Stroke, Style} from 'ol/style.js';

import {Coordinate} from 'ol/coordinate.js'

import {
    applyTransform,
    equals,
    getCenter,
    isEmpty,
    getIntersection,
    intersects,
    Extent
} from 'ol/extent.js';

import {
    equivalent as equivalentProjection,
    transform,
    getTransform,
    get as getProjection,
} from 'ol/proj.js';

import Projection from 'ol/proj/Projection.js';

import {clamp} from 'ol/math.js';

import { forward, toPoint } from '../dependencies/mgrs.js';
import { mainLizmap } from './Globals.js';

/**
 * @typedef {object} Options
 * @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
 * @property {number} [opacity=1] Opacity (0, 1).
 * @property {boolean} [visible=true] Visibility.
 * @property {Extent} [extent] The bounding extent for layer rendering.  The layer will not be
 * rendered outside of this extent.
 * @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
 * will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
 * for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
 * method was used.
 * @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
 * visible.
 * @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
 * be visible.
 * @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
 * visible.
 * @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
 * be visible.
 * @property {number} [maxLines=100] The maximum number of meridians and
 * parallels from the center of the map. The default value of 100 means that at
 * most 200 meridians and 200 parallels will be displayed. The default value is
 * appropriate for conformal projections like Spherical Mercator. If you
 * increase the value, more lines will be drawn and the drawing performance will
 * decrease.
 * @property {Stroke} [strokeStyle] The
 * stroke style to use for drawing the graticule. If not provided, the following stroke will be used:
 * ```js
 * new Stroke({
 *   color: 'rgba(0, 0, 0, 0.2)' // a not fully opaque black
 * });
 * ```
 * @property {number} [targetSize=100] The target size of the graticule cells,
 * in pixels.
 * @property {boolean} [showLabels=false] Render a label with the respective
 * latitude/longitude for each graticule line.
 * @property {function(number):string} [lonLabelFormatter] Label formatter for
 * longitudes. This function is called with the longitude as argument, and
 * should return a formatted string representing the longitude. By default,
 * labels are formatted as degrees, minutes, seconds and hemisphere.
 * @property {function(number):string} [latLabelFormatter] Label formatter for
 * latitudes. This function is called with the latitude as argument, and
 * should return a formatted string representing the latitude. By default,
 * labels are formatted as degrees, minutes, seconds and hemisphere.
 * @property {number} [lonLabelPosition=0] Longitude label position in fractions
 * (0..1) of view extent. 0 means at the bottom of the viewport, 1 means at the
 * top.
 * @property {number} [latLabelPosition=1] Latitude label position in fractions
 * (0..1) of view extent. 0 means at the left of the viewport, 1 means at the
 * right.
 * @property {Text} [lonLabelStyle] Longitude label text
 * style. If not provided, the following style will be used:
 * ```js
 * new Text({
 *   font: '12px Calibri,sans-serif',
 *   textBaseline: 'bottom',
 *   fill: new Fill({
 *     color: 'rgba(0,0,0,1)'
 *   }),
 *   stroke: new Stroke({
 *     color: 'rgba(255,255,255,1)',
 *     width: 3
 *   })
 * });
 * ```
 * Note that the default's `textBaseline` configuration will not work well for
 * `lonLabelPosition` configurations that position labels close to the top of
 * the viewport.
 * @property {Text} [latLabelStyle] Latitude label text style.
 * If not provided, the following style will be used:
 * ```js
 * new Text({
 *   font: '12px Calibri,sans-serif',
 *   textAlign: 'end',
 *   fill: new Fill({
 *     color: 'rgba(0,0,0,1)'
 *   }),
 *   stroke: Stroke({
 *     color: 'rgba(255,255,255,1)',
 *     width: 3
 *   })
 * });
 * ```
 * Note that the default's `textAlign` configuration will not work well for
 * `latLabelPosition` configurations that position labels close to the left of
 * the viewport.
 * @property {Array<number>} [intervals=[90, 45, 30, 20, 10, 5, 2, 1, 30/60, 20/60, 10/60, 5/60, 2/60, 1/60, 30/3600, 20/3600, 10/3600, 5/3600, 2/3600, 1/3600]]
 * Intervals (in degrees) for the graticule. Example to limit graticules to 30 and 10 degrees intervals:
 * ```js
 * [30, 10]
 * ```
 * @property {boolean} [wrapX=true] Whether to repeat the graticule horizontally.
 * @property {object} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
 */

/**
 * @class
 * @name MGRS
 * @augments Graticule
 */
class MGRS extends Graticule {

    /**
     * Constructor for a new MGRS layer.
     * @param {Options} [options] Options.
     */
    constructor(options) {
        super(options);

        /**
         * @type {Array<LineString>}
         * @private
         */
        this.lines_ = [];

        this.latLabelFormatter_ = () => {
            return '';
        };

        this.lonLabelFormatter_ = () => {
            return '';
        };
    }

    /**
     * Add a parallel to the collection of parallels.
     * @param {number} lon Longitude.
     * @param {number} minLat Minimal latitude.
     * @param {number} maxLat Maximal latitude.
     * @param {number} squaredTolerance Squared tolerance.
     * @param {Extent} extent Extent.
     * @param {number} index Index.
     * @returns {number} Index.
     * @private
     */
    addMeridian_(lon, minLat, maxLat, squaredTolerance, extent, index) {
        const lineString = this.getMeridian_(
            lon,
            minLat,
            maxLat,
            squaredTolerance,
            index
        );
        if (intersects(lineString.getExtent(), extent)) {
            if (this.meridiansLabels_) {
                const text = forward([lon, minLat], 0).slice(0, -2);

                if (index in this.meridiansLabels_) {
                    this.meridiansLabels_[index].text = text;
                } else {
                    this.meridiansLabels_[index] = {
                        geom: new Point([]),
                        text: text,
                    };
                }
            }
            this.meridians_[index++] = lineString;
        }
        return index;
    }

    calculateIntersection_(p1, p2, p3, p4) {

        var c2x = p3.x - p4.x; // (x3 - x4)
        var c3x = p1.x - p2.x; // (x1 - x2)
        var c2y = p3.y - p4.y; // (y3 - y4)
        var c3y = p1.y - p2.y; // (y1 - y2)

        // down part of intersection point formula
        var d = c3x * c2y - c3y * c2x;

        if (d == 0) {
            throw new Error('Number of intersection points is zero or infinity.');
        }

        // upper part of intersection point formula
        var u1 = p1.x * p2.y - p1.y * p2.x; // (x1 * y2 - y1 * x2)
        var u4 = p3.x * p4.y - p3.y * p4.x; // (x3 * y4 - y3 * x4)

        // intersection point formula

        var px = (u1 * c2x - c3x * u4) / d;
        var py = (u1 * c2y - c3y * u4) / d;

        var p = { x: px, y: py };

        return p;
    }

    /**
     * Update geometries in the source based on current view
     * @param {Extent} extent Extent
     * @param {number} resolution Resolution
     * @param {Projection} projection Projection
     */
    loaderFunction(extent, resolution, projection) {
        this.loadedExtent_ = extent;
        const source = this.getSource();

        // only consider the intersection between our own extent & the requested one
        const layerExtent = this.getExtent() || [
            -Infinity,
            -Infinity,
            Infinity,
            Infinity,
        ];
        const renderExtent = getIntersection(layerExtent, extent);

        if (
            this.renderedExtent_ &&
            equals(this.renderedExtent_, renderExtent) &&
            this.renderedResolution_ === resolution
        ) {
            return;
        }
        this.renderedExtent_ = renderExtent;
        this.renderedResolution_ = resolution;

        // bail out if nothing to render
        if (isEmpty(renderExtent)) {
            return;
        }

        // update projection info
        const center = getCenter(renderExtent);
        const squaredTolerance = (resolution * resolution) / 4;

        const updateProjectionInfo =
            !this.projection_ || !equivalentProjection(this.projection_, projection);

        if (updateProjectionInfo) {
            this.updateProjectionInfo_(projection);
        }

        this.createGraticule_(renderExtent, center, resolution, squaredTolerance);

        // first make sure we have enough features in the pool
        let featureCount = this.meridians_.length + this.parallels_.length + this.lines_.length;
        if (this.meridiansLabels_) {
            featureCount += this.meridians_.length;
        }
        if (this.parallelsLabels_) {
            featureCount += this.parallels_.length;
        }

        let feature;
        while (featureCount > this.featurePool_.length) {
            feature = new Feature();
            this.featurePool_.push(feature);
        }

        const featuresColl = source.getFeaturesCollection();
        featuresColl.clear();
        let poolIndex = 0;

        // add features for the lines & labels
        let i, l;
        for (i = 0, l = this.meridians_.length; i < l; ++i) {
            feature = this.featurePool_[poolIndex++];
            feature.setGeometry(this.meridians_[i]);
            feature.setStyle(this.lineStyle_);
            featuresColl.push(feature);
        }
        for (i = 0, l = this.parallels_.length; i < l; ++i) {
            feature = this.featurePool_[poolIndex++];
            feature.setGeometry(this.parallels_[i]);
            feature.setStyle(this.lineStyle_);
            featuresColl.push(feature);
        }

        // 100km
        for (i = 0, l = this.lines_.length; i < l; ++i) {
            feature = this.featurePool_[poolIndex++];
            feature.setGeometry(this.lines_[i]);
            feature.setStyle((feature) => {
                return new Style({
                    stroke: new Stroke({
                        color: '#000',
                        width: 1.25,
                    }),
                    text: new Text({
                        text: feature.getGeometry().get('label'),
                        offsetY: -10,
                        fill: new Fill({
                            color: '#000',
                        }),
                        stroke: new Stroke({
                            color: '#fff',
                            width: 4,
                        }),
                    })
                })
            });
            featuresColl.push(feature);
        }
    }

    /**
     * Create the graticule.
     * @param {Extent} extent Extent.
     * @param {Coordinate} center Center.
     * @param {number} resolution Resolution.
     * @param {number} squaredTolerance Squared tolerance.
     * @private
     */
    createGraticule_(extent, center, resolution, squaredTolerance) {

        const zoom = mainLizmap.map.getView().getZoomForResolution(resolution);
        const zoomSwitch = 4;

        const validExtent = applyTransform(
            extent,
            getTransform(this.projection_, getProjection('EPSG:4326')),
            undefined,
            8
        );

        // Force minLat and maxLat for MGRS
        const MGRSMaxLat = 72;
        const MGRSMinLat = -80;

        let lat, lon;

        const lonInterval = 6;
        let latInterval = 8;

        const maxLat = clamp(Math.floor(validExtent[3] / latInterval) * latInterval + latInterval, MGRSMinLat, MGRSMaxLat) ;
        const maxLon = clamp(Math.floor(validExtent[2] / lonInterval) * lonInterval + lonInterval, this.minLon_, this.maxLon_);
        const minLat = clamp(Math.floor(validExtent[1] / latInterval) * latInterval, MGRSMinLat, MGRSMaxLat);
        const minLon = clamp(Math.floor(validExtent[0] / lonInterval) * lonInterval, this.minLon_, this.maxLon_);

        let idxParallels = 0;
        let idxMeridians = 0;

        // GZD grid
        if (zoom <= zoomSwitch) {
            for (lon = minLon; lon <= maxLon; lon += lonInterval) {
                for (lat = minLat; lat <= maxLat; lat += latInterval) {

                    // The northmost latitude band, X, is 12° high
                    if (lat == 72) {
                        latInterval = 12
                    } else {
                        latInterval = 8;
                    }

                    idxParallels = this.addParallel_(
                        lat,
                        lon,
                        lon + lonInterval,
                        squaredTolerance,
                        extent,
                        idxParallels
                    );

                    // Special cases
                    // Norway
                    if (lat === 56 && lon === 6) {
                        continue;
                    }

                    // Svalbard
                    if (lat === 72 && lon >= 6 && lon <= 36) {
                        continue;
                    }

                    idxMeridians = this.addMeridian_(
                        lon,
                        lat,
                        lat + latInterval,
                        squaredTolerance,
                        extent,
                        idxMeridians
                    );
                }
            }

            // Special cases
            // Norway
            idxMeridians = this.addMeridian_(
                3,
                56,
                64,
                squaredTolerance,
                extent,
                idxMeridians
            );

            // Svalbard
            for (const lon of [9, 21, 33]) {
                idxMeridians = this.addMeridian_(
                    lon,
                    72,
                    84,
                    squaredTolerance,
                    extent,
                    idxMeridians
                );
            }
        }

        this.parallels_.length = idxParallels;
        if (this.parallelsLabels_) {
            this.parallelsLabels_.length = idxParallels;
        }

        this.meridians_.length = idxMeridians;
        if (this.meridiansLabels_) {
            this.meridiansLabels_.length = idxMeridians;
        }


        // 100KM grid
        this.lines_ = [];
        if (zoom > zoomSwitch) {
            // Get code inside grid
            const delta = 0.01;

            for (lon = minLon; lon < maxLon; lon += lonInterval) {
                for (lat = minLat; lat <= maxLat; lat += latInterval) {
                    const leftBottom = forward([lon, lat], 0);

                    const rightColumnLetter = forward([lon + lonInterval - delta, lat], 0).slice(-2, -1).charCodeAt();

                    const rightTop = forward([lon + lonInterval - delta, lat + latInterval - delta], 0);

                    let columnLetter = leftBottom.slice(-2, -1).charCodeAt();
                    while (columnLetter != rightColumnLetter + 1) {

                        // Discard I and O
                        if (columnLetter === 73 || columnLetter === 79) {
                            columnLetter++;
                            continue;
                        }

                        let rowLetter = leftBottom.slice(-1).charCodeAt();
                        while (rowLetter != rightTop.slice(-1).charCodeAt()) {
                            // Discard I and O
                            if (rowLetter === 73 || rowLetter === 79) {
                                rowLetter++;
                                continue;
                            }

                            // Next letters
                            let columnLetterNext = columnLetter + 1;

                            // Column letter stops at 'Z' => after we go back to 'A'
                            if (columnLetterNext >= 91) {
                                columnLetterNext = 65;
                            }

                            // Discard I and O
                            if (columnLetterNext === 73 || columnLetterNext === 79) {
                                columnLetterNext++;
                            }

                            let rowLetterNext = rowLetter + 1;

                            // Row letter stops at 'V' => after we go back to 'A'
                            if (rowLetterNext >= 87) {
                                rowLetterNext = 65;
                            }

                            // Discard I and O
                            if (rowLetterNext === 73 || rowLetterNext === 79) {
                                rowLetterNext++;
                            }

                            let leftBottomCoords = toPoint(leftBottom.slice(0, -2) + String.fromCharCode(columnLetter) + String.fromCharCode(rowLetter));
                            let rightBottomCoords = toPoint(leftBottom.slice(0, -2) + String.fromCharCode(columnLetterNext) + String.fromCharCode(rowLetter));
                            let leftTopCoords = toPoint(leftBottom.slice(0, -2) + String.fromCharCode(columnLetter) + String.fromCharCode(rowLetterNext));

                            // Make lines don't exceed their GZD cell
                            if (leftBottomCoords[0] < lon) {
                                const intersectionPointWithLon = this.calculateIntersection_(
                                    { x: lon, y: lat + latInterval },
                                    { x: lon, y: lat - latInterval },
                                    { x: leftBottomCoords[0], y: leftBottomCoords[1] },
                                    { x: rightBottomCoords[0], y: rightBottomCoords[1] }
                                );

                                leftBottomCoords[0] = intersectionPointWithLon.x;
                                leftBottomCoords[1] = intersectionPointWithLon.y;
                            }

                            if (leftTopCoords[0] < lon) {
                                leftTopCoords[0] = lon;
                            }

                            if (leftTopCoords[1] > lat + latInterval) {
                                leftTopCoords[1] = lat + latInterval;
                            }

                            if (rightBottomCoords[0] > lon + lonInterval) {

                                const intersectionPointWithLon = this.calculateIntersection_(
                                    { x: lon + lonInterval, y: lat + latInterval },
                                    { x: lon + lonInterval, y: lat - latInterval },
                                    { x: leftBottomCoords[0], y: leftBottomCoords[1] },
                                    { x: rightBottomCoords[0], y: rightBottomCoords[1] }
                                );

                                rightBottomCoords[0] = intersectionPointWithLon.x;
                                rightBottomCoords[1] = intersectionPointWithLon.y;
                            }

                            if (leftBottomCoords[0] <= lon + lonInterval) {

                                const parallel = new LineString([
                                    transform(leftBottomCoords, 'EPSG:4326', this.projection_),
                                    transform(rightBottomCoords, 'EPSG:4326', this.projection_)
                                ]);

                                // Display label on parallel
                                let label = '';
                                try {
                                    label = forward([leftBottomCoords[0] + delta, leftBottomCoords[1] + delta], 0);
                                } catch (error) {
                                    console.log(error);
                                }
                                parallel.set('label', label, true);

                                this.lines_.push(parallel);

                                this.lines_.push(new LineString([
                                    transform(leftBottomCoords, 'EPSG:4326', this.projection_),
                                    transform(leftTopCoords, 'EPSG:4326', this.projection_)
                                ]));
                            }

                            // Increment rowLetter
                            rowLetter++;

                            // Row letter stops at 'V' => after we go back to 'A'
                            if (rowLetter >= 87) {
                                rowLetter = 65;
                            }
                        }
                        // Increment columnLetter
                        columnLetter++;

                        // Column letter stops at 'Z' => after we go back to 'A'
                        if (columnLetter >= 91 && columnLetter != rightColumnLetter + 1) {
                            columnLetter = 65;
                        }
                    }
                }
            }
        }
    }
}

export default MGRS;
