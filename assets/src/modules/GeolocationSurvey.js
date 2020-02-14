import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class GeolocationSurvey {

    constructor() {

        this.distanceLimit = 0;
        this.accuracyLimit = 0;
        this._distanceMode = false;
        this._accuracyMode = false;
        this._beepMode = false;
        this._vibrateMode = false;

        // Draw automatically a point and beep when lastSegmentLength >= distanceLimit
        mainEventDispatcher.addListener(
            () => {
                if (mainLizmap.geolocation.isTracking &&  (!this.accuracyMode || (this.accuracyMode && mainLizmap.geolocation.accuracy <= this.accuracyLimit))){
                    if (this.distanceMode && mainLizmap.edition.lastSegmentLength >= this.distanceLimit) {
                        // Draw
                        const node = mainLizmap.edition.drawControl.handler.point.geometry;
                        mainLizmap.edition.drawControl.handler.insertXY(node.x, node.y);

                        // Beep
                        if(this.beepMode){
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
                            v.type = "square";
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

            },
            'edition.lastSegmentLength'
        );
    }

    get distanceMode(){
        return this._distanceMode;
    }

    toggleDistanceMode() {
        this._distanceMode = !this._distanceMode;

        mainEventDispatcher.dispatch('geolocationSurvey.distanceMode');
    }

    get accuracyMode() {
        return this._accuracyMode;
    }

    toggleAccuracyMode() {
        this._accuracyMode = !this._accuracyMode;

        mainEventDispatcher.dispatch('geolocationSurvey.accuracyMode');
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
