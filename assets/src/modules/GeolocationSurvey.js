import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class GeolocationSurvey {

    constructor() {

        this.distanceLimit = 0;
        this._distanceMode = false;

        // Draw automatically a point when lastSegmentLength >= distanceLimit
        mainEventDispatcher.addListener(
            () => {
                if (this.distanceMode && mainLizmap.edition.lastSegmentLength >= this.distanceLimit){
                    const node = mainLizmap.edition.drawControl.handler.point.geometry;
                    mainLizmap.edition.drawControl.handler.insertXY(node.x, node.y);
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
}
