import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import olGeolocation from 'ol/Geolocation.js';
import {transform} from 'ol/proj.js';

export default class Geolocation {

    constructor() {
        this._firstGeolocation = true;
        this._isBind = false;
        this._bindIntervalID = 0;
        this._bindIntervalInSecond = 10;
        this._isLinkedToEdition = false;

        this._geolocation = new olGeolocation({
            // enableHighAccuracy must be set to true to have the heading value.
            trackingOptions: {
                enableHighAccuracy: true
            },
            projection: mainLizmap.projection
        });

        this._geolocation.on('change:position', () => {
            const coordinates = this._geolocation.getPosition();
            this.moveGeolocationPointAndCircle(coordinates);

            mainEventDispatcher.dispatch('geolocation.position');
        });

        this._geolocation.on('change:tracking', () => {
            // FIXME : later we'll need an object listening to 'geolocation.isTracking' event and setting visibility accordingly
            const geolocationLayer = mainLizmap._lizmap3.map.getLayersByName('geolocation')[0];
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
                mainLizmap.extent = this._geolocation.getAccuracyGeometry().getExtent();
                this.center();
                this._firstGeolocation = false;

                mainEventDispatcher.dispatch('geolocation.firstGeolocation');
            }
        });

        // Handle geolocation error
        this._geolocation.on('error', function(error) {
            mainLizmap.displayMessage(error.message, 'error', true);
        });
    }

    center() {
        mainLizmap.center = this._geolocation.getPosition();
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
            return transform(position, mainLizmap.projection, crs);
        }
    }

    get firstGeolocation() {
        return this._firstGeolocation;
    }

    // Get position in GPS coordinates (ESPG:4326) with 6 decimals
    get position() {
        const position = this._geolocation.getPosition();
        if (position) {
            const position4326 = transform(position, mainLizmap.projection, 'EPSG:4326');
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
     * @param {boolean} isTracking - Enable tracking.
     */
    set isTracking(isTracking) {
        this._geolocation.setTracking(isTracking);
    }

    get isBind() {
        return this._isBind;
    }

    /**
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
    * @param  {number} interval - Interval in second
    */
    set bindIntervalInSecond(interval) {
        this._bindIntervalInSecond = interval;

        this._startBindInterval();
    }

    moveGeolocationPointAndCircle(coordinates) {
        let geolocationLayer = mainLizmap._lizmap3.map.getLayersByName('geolocation')[0];
        const circleStyle = {
            fillColor: '#0395D6',
            fillOpacity: 0.1,
            strokeColor: '#0395D6',
            strokeWidth: 1
        };

        // Create layer if it does not exist
        if (geolocationLayer === undefined) {
            geolocationLayer = new OpenLayers.Layer.Vector('geolocation');

            geolocationLayer.addFeatures([
                new OpenLayers.Feature.Vector(
                    // Point
                    new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
                    {},
                    {
                        graphicName: 'circle',
                        strokeColor: '#0395D6',
                        strokeWidth: 1,
                        fillOpacity: 1,
                        fillColor: '#0395D6',
                        pointRadius: 3
                    }
                ),
                // circle
                new OpenLayers.Feature.Vector(
                    OpenLayers.Geometry.Polygon.createRegularPolygon(
                        new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
                        this._geolocation.getAccuracy() / 2,
                        40,
                        0
                    ),
                    {},
                    circleStyle
                )
            ]);
            mainLizmap._lizmap3.map.addLayer(geolocationLayer);
        } else {
            const geolocationPoint = geolocationLayer.features[0];

            geolocationPoint.geometry.x = coordinates[0];
            geolocationPoint.geometry.y = coordinates[1];
            geolocationPoint.geometry.clearBounds();
            geolocationLayer.drawFeature(geolocationPoint);

            let geolocationCircle = geolocationLayer.features[1];
            geolocationLayer.destroyFeatures([geolocationCircle]);
            geolocationCircle = new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
                    this._geolocation.getAccuracy() / 2,
                    40,
                    0
                ),
                {},
                circleStyle
            );
            geolocationLayer.addFeatures([geolocationCircle]);
        }
    }
}
