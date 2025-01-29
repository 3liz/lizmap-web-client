/**
 * @module modules/Geolocation.js
 * @name Geolocation
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */
import { mainEventDispatcher } from '../modules/Globals.js';
import olGeolocation from 'ol/Geolocation.js';
import { transform } from 'ol/proj.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import Point from 'ol/geom/Point.js';
import Circle from 'ol/geom/Circle.js';
import Feature from 'ol/Feature.js';

/**
 * @class
 * @name Geolocation
 */
export default class Geolocation {

    /**
     * Create a geolocation instance
     * @param {Map}    map           - OpenLayers map
     * @param {object}   lizmap3   - The old lizmap object
     */
    constructor(map, lizmap3) {
        const color = 'rgb(3, 149, 214)';
        const fillColor = 'rgba(3, 149, 214, 0.1)';
        const strokeWidth = 1;
        this._geolocationLayer = new VectorLayer({
            source: new VectorSource({
                wrapX: false
            }),
            style: {
                'circle-radius': 3,
                'circle-stroke-color': color,
                'circle-stroke-width': strokeWidth,
                'circle-fill-color': color,
                'stroke-color': color,
                'stroke-width': strokeWidth,
                'fill-color': fillColor,
            }
        });
        this._geolocationLayer.setProperties({
            name: 'LizmapGeolocationGeolocationDrawLayer'
        });

        map.addToolLayer(this._geolocationLayer);

        this._lizmap3 = lizmap3;
        this._map = map;
        this._firstGeolocation = true;
        this._isBind = false;
        this._bindIntervalID = 0;
        this._bindIntervalInSecond = 10;
        this._isLinkedToEdition = false;

        const qgisProjectProjection = lizmap3.map.getProjection();
        this._geolocation = new olGeolocation({
            // `enableHighAccuracy` must be set to true to have the heading value
            trackingOptions: {
                enableHighAccuracy: true
            },
            projection: qgisProjectProjection
        });

        this._geolocation.on('change:position', () => {
            const coordinates = this._geolocation.getPosition();
            this.moveGeolocationPointAndCircle(coordinates);

            mainEventDispatcher.dispatch('geolocation.position');
        });

        this._geolocation.on('change:tracking', () => {
            // FIXME : later we'll need an object listening to 'geolocation.isTracking' event and setting visibility accordingly
            const geolocationLayer = this._lizmap3.map.getLayersByName('geolocation')[0];
            if (geolocationLayer) {
                geolocationLayer.setVisibility(this.isTracking);
            }

            if(this.isBind){
                if (this.isTracking) {
                    this._startBindInterval();
                } else {
                    this._stopBindInterval();
                }
            }

            mainEventDispatcher.dispatch('geolocation.isTracking');
        });

        this._geolocation.on('change:accuracy', () => {
            mainEventDispatcher.dispatch('geolocation.accuracy');
        });

        this._geolocation.on('change:accuracyGeometry', () => {
            // Zoom on accuracy geometry extent when geolocation is activated for the first time
            if (this._firstGeolocation) {
                const bounds = this._geolocation.getAccuracyGeometry().getExtent();
                map.getView().fit(bounds, {nearest: true});
                this.center();
                this._firstGeolocation = false;

                mainEventDispatcher.dispatch('geolocation.firstGeolocation');
            }
        });

        // Handle geolocation error
        this._geolocation.on('error', error => {
            this._lizmap3.addMessage(error.message, 'danger', true);
        });
    }

    center() {
        const center = this._geolocation.getPosition();
        this._map.getView().setCenter(center);
    }

    toggleBind() {
        this.isBind = !this._isBind;

        // Center when binding
        if (this.isBind) {
            this.center();

            this._startBindInterval();
        }else{
            this._stopBindInterval();
        }
    }

    _startBindInterval(){
        // First clear previous interval
        this._stopBindInterval();

        // Then set new interval
        this._bindIntervalID = window.setInterval(() => {
            this.center();
        }, this.bindIntervalInSecond * 1000);
    }

    _stopBindInterval(){
        window.clearInterval(this._bindIntervalID);
    }

    toggleTracking() {
        this.isTracking = !this._geolocation.getTracking();
    }

    getPositionInCRS(crs) {
        if (crs === 'ESPG:4326') {
            return this.position;
        } else {
            const position = this._geolocation.getPosition();
            const qgisProjectProjection = this._lizmap3.map.getProjection();
            return transform(position, qgisProjectProjection, crs);
        }
    }

    get firstGeolocation() {
        return this._firstGeolocation;
    }

    // Get position in GPS coordinates (ESPG:4326) with 6 decimals
    get position() {
        const position = this._geolocation.getPosition();
        if (position) {
            const qgisProjectProjection = this._lizmap3.map.getProjection();
            const position4326 = transform(position, qgisProjectProjection, 'EPSG:4326');
            return [parseFloat(position4326[0].toFixed(6)), parseFloat(position4326[1].toFixed(6))];
        }
        return undefined;
    }

    get accuracy() {
        if (this._geolocation.getAccuracy()) {
            return parseFloat(this._geolocation.getAccuracy().toFixed(3));
        }
        return undefined;
    }

    get isTracking() {
        return this._geolocation.getTracking();
    }

    /**
     * Set tracking status
     * @param {boolean} isTracking - Enable tracking.
     */
    set isTracking(isTracking) {
        this._geolocation.setTracking(isTracking);
    }

    get isBind() {
        return this._isBind;
    }

    /**
     * Set bind status
     * @param {boolean} isBind - Enable map view always centered on current position.
     */
    set isBind(isBind) {
        this._isBind = isBind;

        mainEventDispatcher.dispatch('geolocation.isBind');
    }

    get isLinkedToEdition() {
        return this._isLinkedToEdition;
    }

    /**
     * Set linkedToEdition status
     * @param {boolean} isLinkedToEdition - Link edition and geolocation to draw features based on GPS position
     */
    set isLinkedToEdition(isLinkedToEdition) {
        this._isLinkedToEdition = isLinkedToEdition;

        mainEventDispatcher.dispatch('geolocation.isLinkedToEdition');
    }

    get bindIntervalInSecond(){
        return this._bindIntervalInSecond;
    }

    /**
     * Set the interval in second for the bind
     * @param  {number} interval - Interval in second
     */
    set bindIntervalInSecond(interval) {
        this._bindIntervalInSecond = interval;

        this._startBindInterval();
    }

    moveGeolocationPointAndCircle(coordinates) {
        const positionFeature = new Feature({
            geometry: new Point(coordinates)
        });

        const accuracyFeature = new Feature({
            geometry: new Circle(coordinates, this._geolocation.getAccuracy() / 2)
        });

        this._geolocationLayer.getSource().clear();
        this._geolocationLayer.getSource().addFeatures([positionFeature, accuracyFeature]);
    }
}
