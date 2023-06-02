import Graticule from 'ol/layer/Graticule.js';

import Point from 'ol/geom/Point.js';
import LineString from 'ol/geom/LineString.js';
import Feature from 'ol/Feature.js';

import {Text, Fill, Stroke, Style} from 'ol/style.js';

import {
    applyTransform,
    equals,
    getCenter,
    isEmpty,
    getIntersection,
    intersects,
} from 'ol/extent.js';

import {
    equivalent as equivalentProjection,
    transform,
    getTransform,
    get as getProjection,
} from 'ol/proj.js';

import {clamp} from 'ol/math.js';

import { forward, toPoint } from '../dependencies/mgrs.js';
import { mainLizmap } from './Globals.js';
class MGRS extends Graticule {

    /**
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
     * @param {number} lon Longitude.
     * @param {number} minLat Minimal latitude.
     * @param {number} maxLat Maximal latitude.
     * @param {number} squaredTolerance Squared tolerance.
     * @param {import("../extent.js").Extent} extent Extent.
     * @param {number} index Index.
     * @return {number} Index.
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
   * @param {import("../extent").Extent} extent Extent
   * @param {number} resolution Resolution
   * @param {import("../proj/Projection.js").default} projection Projection
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
    * @param {import("../extent.js").Extent} extent Extent.
    * @param {import("../coordinate.js").Coordinate} center Center.
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
                                } catch (error) {}
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
