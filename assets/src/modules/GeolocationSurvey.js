/**
 * @module modules/State.js
 * @name State
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import {mainEventDispatcher} from '../modules/Globals.js';
import Edition from './Edition.js';
import Geolocation from './Geolocation.js';
import {transform} from 'ol/proj.js';

/**
 * @class
 * @name GeolocationSurvey
 */
export default class GeolocationSurvey {

    /**
     * Create a geolocation survey instance
     * @param {Geolocation} geolocation - The Lizmap geolocation instance
     * @param {Edition}     edition     - The Lizmap edition instance
     * @param {object}      lizmap3     - The old lizmap object
     */
    constructor(geolocation, edition, lizmap3) {

        this.distanceLimit = 0;
        this.timeLimit = 0;
        this.accuracyLimit = 0;
        this.averageRecordLimit = 0;
        this._geolocation = geolocation;
        this._edition = edition;
        this._lizmap3 = lizmap3;
        this._distanceMode = false;
        this._timeMode = false;
        this._timePauseMode = false;
        this._accuracyMode = false;
        this._averageRecordMode = false;
        this._beepMode = false;
        this._vibrateMode = false;

        this._timeCount = 0;
        // Id we keep to later stop setInterval()
        this._intervalID = 0;
        // Geolocation position points for the last 'averageRecordLimit' seconds
        this._positionPointsRecord = {};
    }

    // Private method to insert a point at current or average position
    _insertPoint() {
        if (this._geolocation.isTracking && (!this.accuracyMode || (this._geolocation.accuracy <= this.accuracyLimit))) {

            if (this.averageRecordMode && this.positionAverageInMapCRS !== undefined) {
                this._edition.drawControl.handler.insertXY(this.positionAverageInMapCRS);
            } else {
                const node = this._edition.drawControl.handler.point.geometry;
                this._edition.drawControl.handler.insertXY(node.x, node.y);
            }

            // Beep
            if (this.beepMode) {
                if (!this.hasOwnProperty('_beep')) {
                    this._beep = new AudioContext();
                }
                const freq = 520;
                const duration = 0.2;
                const volume = 1;

                const v = this._beep.createOscillator();
                const u = this._beep.createGain();
                v.connect(u);
                v.frequency.value = freq;
                v.type = 'square';
                u.connect(this._beep.destination);
                u.gain.value = volume;
                v.start(this._beep.currentTime);
                v.stop(this._beep.currentTime + duration);
            }

            // Vibrate
            if (this.vibrateMode) {
                window.navigator.vibrate(200);
            }
        }
    }

    get distanceMode() {
        return this._distanceMode;
    }

    toggleDistanceMode() {
        this._distanceMode = !this._distanceMode;

        if (this._distanceModeCallback === undefined) {
            this._distanceModeCallback = () => {
                // Insert automatically a point when lastSegmentLength >= distanceLimit
                if (this._distanceMode && this._edition.lastSegmentLength >= this.distanceLimit) {
                    this._insertPoint();
                }
            };
        }

        if (this._distanceMode) {
            mainEventDispatcher.addListener(
                this._distanceModeCallback,
                'edition.lastSegmentLength'
            );
        } else {
            mainEventDispatcher.removeListener(
                this._distanceModeCallback,
                'edition.lastSegmentLength'
            );
        }

        mainEventDispatcher.dispatch('geolocationSurvey.distanceMode');
    }

    get timeMode() {
        return this._timeMode;
    }

    toggleTimeMode(mode) {
        this._timeMode = mode || !this._timeMode;

        if (this._timeModeCallback === undefined) {
            this._timeModeCallback = () => {
                // Disable time mode when edition or geolocation end
                if (!this._edition.drawFeatureActivated || !this._geolocation.isTracking) {
                    this.toggleTimeMode(false);
                }
            };
        }

        // Begin count
        if (this._timeMode) {
            this._intervalID = window.setInterval(() => {
                // Count taking care of accuracy if mode is active and pause mode
                if (!this.timePauseMode && (!this.accuracyMode || (this._geolocation.accuracy <= this.accuracyLimit))) {
                    this.timeCount = this.timeCount + 1;

                    // Insert automatically a point when timeCount >= timeLimit
                    if (this.timeCount >= this.timeLimit) {
                        this.timeCount = 0;
                        this._insertPoint();
                    }
                }
            }, 1000);

            mainEventDispatcher.addListener(
                this._timeModeCallback,
                'edition.drawFeatureActivated'
            );

            mainEventDispatcher.addListener(
                this._timeModeCallback,
                'geolocation.isTracking'
            );
        } else {
            // Reset count
            window.clearInterval(this._intervalID);
            this.timeCount = 0;

            // Disable pause mode
            this._timePauseMode = false;

            mainEventDispatcher.removeListener(
                this._timeModeCallback,
                'edition.drawFeatureActivated'
            );

            mainEventDispatcher.removeListener(
                this._timeModeCallback,
                'geolocation.isTracking'
            );
        }

        mainEventDispatcher.dispatch('geolocationSurvey.timeMode');
    }

    get timePauseMode() {
        return this._timePauseMode;
    }

    toggleTimePauseMode() {
        this._timePauseMode = !this._timePauseMode;

        mainEventDispatcher.dispatch('geolocationSurvey.timePauseMode');
    }

    get timeCount() {
        return this._timeCount;
    }

    set timeCount(timeCount) {
        this._timeCount = timeCount;

        mainEventDispatcher.dispatch('geolocationSurvey.timeCount');
    }

    get accuracyMode() {
        return this._accuracyMode;
    }

    toggleAccuracyMode() {
        this._accuracyMode = !this._accuracyMode;

        mainEventDispatcher.dispatch('geolocationSurvey.accuracyMode');
    }

    get averageRecordMode() {
        return this._averageRecordMode;
    }

    // Calculate average for every points in _positionPointsRecord in map CRS
    get positionAverageInMapCRS() {
        if (this.averageRecordMode && Object.keys(this._positionPointsRecord).length > 0) {
            let sumX = 0;
            let sumY = 0;
            let count = 0;

            for (const time in this._positionPointsRecord) {
                if (this._positionPointsRecord.hasOwnProperty(time)) {
                    sumX += this._positionPointsRecord[time][0];
                    sumY += this._positionPointsRecord[time][1];
                    count++;
                }
            }
            const qgisProjectProjection = this._lizmap3.map.getProjection();

            return transform([sumX / count, sumY / count], 'EPSG:4326', qgisProjectProjection);
        } else {
            return undefined;
        }
    }

    toggleAverageRecordMode() {
        this._averageRecordMode = !this._averageRecordMode;

        if (this._averageRecordModeCallback === undefined) {
            // Record geolocation position points for the last 'averageRecordLimit' seconds
            this._averageRecordModeCallback = () => {
                if (this._averageRecordMode && this.averageRecordLimit > 0) {
                    const now = Date.now();

                    // Delete data older than averageRecordLimit
                    for (const time in this._positionPointsRecord) {
                        if (this._positionPointsRecord.hasOwnProperty(time)) {
                            if ((now - parseInt(time)) >= this.averageRecordLimit * 1000) {
                                delete this._positionPointsRecord[time];
                            }
                        }
                    }

                    // Record point taking care of accuracy if mode is active
                    if (!this.accuracyMode || (this._geolocation.accuracy <= this.accuracyLimit)) {
                        this._positionPointsRecord[now] = this._geolocation.position;
                    }
                }
            };
        }

        if (this._averageRecordMode) {
            mainEventDispatcher.addListener(
                this._averageRecordModeCallback,
                'geolocation.position'
            );
        } else {
            mainEventDispatcher.removeListener(
                this._averageRecordModeCallback,
                'geolocation.position'
            );

            // Empty record
            this._positionPointsRecord = {};
        }

        mainEventDispatcher.dispatch('geolocationSurvey.averageRecordMode');
    }

    get beepMode() {
        return this._beepMode;
    }

    toggleBeepMode() {
        this._beepMode = !this._beepMode;

        mainEventDispatcher.dispatch('geolocationSurvey.beepMode');
    }

    get vibrateMode() {
        return this._vibrateMode;
    }

    toggleVibrateMode() {
        this._vibrateMode = !this._vibrateMode;

        mainEventDispatcher.dispatch('geolocationSurvey.vibrateMode');
    }
}
