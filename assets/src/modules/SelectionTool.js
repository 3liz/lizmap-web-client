import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class SelectionTool {

    constructor() {

        this._layers = [];

        // Verifying WFS layers
        const featureTypes = mainLizmap.vectorLayerFeatureTypes;
        if (featureTypes.length === 0) {
            document.getElementById('button-selectiontool').parentNode.remove();
            return false;
        }

        const _this = this;

        featureTypes.each(function () {
            var self = $(this);
            var lname = mainLizmap.getNameByTypeName(self.find('Name').text());

            const config = mainLizmap.config;

            if (lname in config.layers
                && config.layers[lname]['geometryType'] != 'none'
                && config.layers[lname]['geometryType'] != 'unknown'
                && lname in config.attributeLayers) {

                _this._layers[config.attributeLayers[lname].order] = {
                    name : lname,
                    title: config.layers[lname].title
                };
            }
        });

        if (this._layers.length === 0) {
            document.getElementById('button-selectiontool').parentNode.remove();
            return false;
        }

        // List of WFS format
        this._exportFormats = mainLizmap.vectorLayerResultFormat.filter(
            format => !['GML2', 'GML3', 'GEOJSON'].includes(format.tagName)
        );
    }

    get layers() {
        return this._layers;
    }

    get exportFormats() {
        return this._exportFormats;
    }

}
