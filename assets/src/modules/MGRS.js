import Graticule from 'ol/layer/Graticule';

import Point from 'ol/geom/Point.js';

import {
    applyTransform,
    containsCoordinate,
    containsExtent,
    getWidth,
    intersects,
    wrapX as wrapExtentX,
} from 'ol/extent.js';

import { clamp } from 'ol/math.js';

import { forward } from 'mgrs';
class MGRS extends Graticule {

    latLabelFormatter_ = () => {
        return '';
    };

    lonLabelFormatter_ = () => {
        return '';
    };

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
                const mgrsLabel = forward([lon, minLat]);
                let text;

                // Handle single digit GZD
                if (lon <= -132) {
                    text = mgrsLabel.slice(0, 2);
                } else {
                    text = mgrsLabel.slice(0, 3);
                }
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

    /**
    * @param {import("../extent.js").Extent} extent Extent.
    * @param {import("../coordinate.js").Coordinate} center Center.
    * @param {number} resolution Resolution.
    * @param {number} squaredTolerance Squared tolerance.
    * @private
    */
    createGraticule_(extent, center, resolution, squaredTolerance) {

        // Force minLat and maxLat for MGRS
        this.maxLat_ = 72;
        this.minLat_ = -80;

        let interval = this.getInterval_(resolution);
        if (interval == -1) {
            this.meridians_.length = 0;
            this.parallels_.length = 0;
            if (this.meridiansLabels_) {
                this.meridiansLabels_.length = 0;
            }
            if (this.parallelsLabels_) {
                this.parallelsLabels_.length = 0;
            }
            return;
        }

        let wrapX = false;
        const projectionExtent = this.projection_.getExtent();
        const worldWidth = getWidth(projectionExtent);
        if (
            this.getSource().getWrapX() &&
            this.projection_.canWrapX() &&
            !containsExtent(projectionExtent, extent)
        ) {
            if (getWidth(extent) >= worldWidth) {
                extent[0] = projectionExtent[0];
                extent[2] = projectionExtent[2];
            } else {
                wrapX = true;
            }
        }

        // Constrain the center to fit into the extent available to the graticule

        const validCenterP = [
            clamp(center[0], this.minX_, this.maxX_),
            clamp(center[1], this.minY_, this.maxY_),
        ];

        // Transform the center to lon lat
        // Some projections may have a void area at the poles
        // so replace any NaN latitudes with the min or max value closest to a pole

        const centerLonLat = this.toLonLatTransform_(validCenterP);
        if (isNaN(centerLonLat[1])) {
            centerLonLat[1] =
                Math.abs(this.maxLat_) >= Math.abs(this.minLat_)
                    ? this.maxLat_
                    : this.minLat_;
        }
        let centerLon = clamp(centerLonLat[0], this.minLon_, this.maxLon_);
        let centerLat = clamp(centerLonLat[1], this.minLat_, this.maxLat_);
        const maxLines = this.maxLines_;
        let cnt, idx, lat, lon;

        // Limit the extent to fit into the extent available to the graticule

        let validExtentP = extent;
        if (!wrapX) {
            validExtentP = [
                clamp(extent[0], this.minX_, this.maxX_),
                clamp(extent[1], this.minY_, this.maxY_),
                clamp(extent[2], this.minX_, this.maxX_),
                clamp(extent[3], this.minY_, this.maxY_),
            ];
        }

        // Transform the extent to get the lon lat ranges for the edges of the extent

        const validExtent = applyTransform(
            validExtentP,
            this.toLonLatTransform_,
            undefined,
            8
        );

        let maxLat = validExtent[3];
        let maxLon = validExtent[2];
        let minLat = validExtent[1];
        let minLon = validExtent[0];

        if (!wrapX) {
            // Check if extremities of the world extent lie inside the extent
            // (for example the pole in a polar projection)
            // and extend the extent as appropriate

            if (containsCoordinate(validExtentP, this.bottomLeft_)) {
                minLon = this.minLon_;
                minLat = this.minLat_;
            }
            if (containsCoordinate(validExtentP, this.bottomRight_)) {
                maxLon = this.maxLon_;
                minLat = this.minLat_;
            }
            if (containsCoordinate(validExtentP, this.topLeft_)) {
                minLon = this.minLon_;
                maxLat = this.maxLat_;
            }
            if (containsCoordinate(validExtentP, this.topRight_)) {
                maxLon = this.maxLon_;
                maxLat = this.maxLat_;
            }

            // The transformed center may also extend the lon lat ranges used for rendering

            maxLat = clamp(maxLat, centerLat, this.maxLat_);
            maxLon = clamp(maxLon, centerLon, this.maxLon_);
            minLat = clamp(minLat, this.minLat_, centerLat);
            minLon = clamp(minLon, this.minLon_, centerLon);
        }

        const lonInterval = 6;
        let latInterval = 8;

        let idxParallels = 0;
        let idxMeridians = 0;

        for (lon = this.minLon_; lon <= this.maxLon_; lon += lonInterval) {
            for (lat = this.minLat_; lat <= this.maxLat_; lat += latInterval) {

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

        this.parallels_.length = idxParallels;
        if (this.parallelsLabels_) {
            this.parallelsLabels_.length = idxParallels;
        }

        this.meridians_.length = idxMeridians;
        if (this.meridiansLabels_) {
            this.meridiansLabels_.length = idxMeridians;
        }
    }
}

export default MGRS;