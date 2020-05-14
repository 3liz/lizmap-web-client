import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import GeoJSONReader from 'jsts/org/locationtech/jts/io/GeoJSONReader.js';
import GeoJSONWriter from 'jsts/org/locationtech/jts/io/GeoJSONWriter.js';
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';

export default class Digitizing {

    constructor() {

        this._tools = ['deactivate', 'point', 'line', 'polygon', 'box', 'circle', 'freehand'];
        this._toolSelected = this._tools[0];

        this._bufferValue = 0;
    }

    get toolSelected() {
        return this._toolSelected;
    }

    set toolSelected(tool) {
        if (this._tools.includes(tool)) {
            // Disable all tools then enable the chosen one
            for (const key in mainLizmap.lizmap3.controls.selectiontool) {
                mainLizmap.lizmap3.controls.selectiontool[key].deactivate();
            }

            switch (tool) {
                case this._tools[1]:
                    mainLizmap.lizmap3.controls.selectiontool.queryPointLayerCtrl.activate();
                    break;
                case this._tools[2]:
                    mainLizmap.lizmap3.controls.selectiontool.queryLineLayerCtrl.activate();
                    break;
                case this._tools[3]:
                    mainLizmap.lizmap3.controls.selectiontool.queryPolygonLayerCtrl.activate();
                    break;
                case this._tools[4]:
                    mainLizmap.lizmap3.controls.selectiontool.queryBoxLayerCtrl.activate();
                    break;
                case this._tools[5]:
                    mainLizmap.lizmap3.controls.selectiontool.queryCircleLayerCtrl.activate();
                    break;
                case this._tools[6]:
                    mainLizmap.lizmap3.controls.selectiontool.queryFreehandLayerCtrl.activate();
                    break;
            }

            this._toolSelected = tool;
            mainEventDispatcher.dispatch('digitizing.toolSelected');
        }
    }
}
