import Graticule from 'ol/layer/Graticule';

import {
    applyTransform,
    containsCoordinate,
    containsExtent,
    getWidth,
    wrapX as wrapExtentX,
} from 'ol/extent.js';

import { clamp } from 'ol/math.js';

class MGRS extends Graticule {

    /**
    * @param {import("../extent.js").Extent} extent Extent.
    * @param {import("../coordinate.js").Coordinate} center Center.
    * @param {number} resolution Resolution.
    * @param {number} squaredTolerance Squared tolerance.
    * @private
    */
    createGraticule_(extent, center, resolution, squaredTolerance) {
        const interval = this.getInterval_(resolution);
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

        // Create meridians

        centerLon = Math.floor(centerLon / interval) * interval;
        lon = clamp(centerLon, this.minLon_, this.maxLon_);

        idx = this.addMeridian_(lon, minLat, maxLat, squaredTolerance, extent, 0);

        cnt = 0;
        if (wrapX) {
            while ((lon -= interval) >= minLon && cnt++ < maxLines) {
                idx = this.addMeridian_(
                    lon,
                    minLat,
                    maxLat,
                    squaredTolerance,
                    extent,
                    idx
                );
            }
        } else {
            while (lon != this.minLon_ && cnt++ < maxLines) {
                lon = Math.max(lon - interval, this.minLon_);
                idx = this.addMeridian_(
                    lon,
                    minLat,
                    maxLat,
                    squaredTolerance,
                    extent,
                    idx
                );
            }
        }

        lon = clamp(centerLon, this.minLon_, this.maxLon_);

        cnt = 0;
        if (wrapX) {
            while ((lon += interval) <= maxLon && cnt++ < maxLines) {
                idx = this.addMeridian_(
                    lon,
                    minLat,
                    maxLat,
                    squaredTolerance,
                    extent,
                    idx
                );
            }
        } else {
            while (lon != this.maxLon_ && cnt++ < maxLines) {
                lon = Math.min(lon + interval, this.maxLon_);
                idx = this.addMeridian_(
                    lon,
                    minLat,
                    maxLat,
                    squaredTolerance,
                    extent,
                    idx
                );
            }
        }

        this.meridians_.length = idx;
        if (this.meridiansLabels_) {
            this.meridiansLabels_.length = idx;
        }

        // Create parallels

        centerLat = Math.floor(centerLat / interval) * interval;
        lat = clamp(centerLat, this.minLat_, this.maxLat_);

        idx = this.addParallel_(lat, minLon, maxLon, squaredTolerance, extent, 0);

        cnt = 0;
        while (lat != this.minLat_ && cnt++ < maxLines) {
            lat = Math.max(lat - interval, this.minLat_);
            idx = this.addParallel_(
                lat,
                minLon,
                maxLon,
                squaredTolerance,
                extent,
                idx
            );
        }

        lat = clamp(centerLat, this.minLat_, this.maxLat_);

        cnt = 0;
        while (lat != this.maxLat_ && cnt++ < maxLines) {
            lat = Math.min(lat + interval, this.maxLat_);
            idx = this.addParallel_(
                lat,
                minLon,
                maxLon,
                squaredTolerance,
                extent,
                idx
            );
        }

        this.parallels_.length = idx;
        if (this.parallelsLabels_) {
            this.parallelsLabels_.length = idx;
        }
    }

}

export default MGRS;