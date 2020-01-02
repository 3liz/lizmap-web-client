import olGeolocation from 'ol/Geolocation.js';
import { mainLizmap } from '../modules/Globals.js';

export default class Geolocation {

    constructor() {
        this._firstGeolocation = true;
    }

    toggleGeolocation() {
        if (this._geolocation === undefined) {
            this._geolocation = new olGeolocation({
                // enableHighAccuracy must be set to true to have the heading value.
                trackingOptions: {
                    enableHighAccuracy: true
                },
                projection: mainLizmap.projection
            });

            this._geolocation.on('change:position', () => {
                const coordinates = this._geolocation.getPosition();

            });

            this._geolocation.on('change:accuracyGeometry', () => {
                // Zoom on accuracy geometry extent when geolocation is activated for the first time
                if (this._firstGeolocation) {
                    mainLizmap.extent = this._geolocation.getAccuracyGeometry();
                    this.firstGeolocation_ = false;
                }
            });
        }

        this._geolocation.setTracking(!this._geolocation.getTracking());
    }
}
