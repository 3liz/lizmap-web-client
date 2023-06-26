import { mainEventDispatcher } from '../modules/Globals.js';

/**
 * Proxy old Lizmap events to new ones
 *
 * @export
 * @class ProxyEvents
 */
export default class ProxyEvents {
    constructor() {
        lizMap.events.on({
            layerSelectionChanged: e => {
                mainEventDispatcher.dispatch({
                    type: 'selection.changed',
                    properties : {
                        'featureType': e.featureType,
                        'featureIds': e.featureIds,
                        'updateDrawing': e.updateDrawing
                    }
                });
            },
            layerFilteredFeaturesChanged: e => {
                mainEventDispatcher.dispatch({
                    type: 'filteredFeatures.changed',
                    properties: {
                        'featureType': e.featureType,
                        'featureIds': e.featureIds,
                        'updateDrawing': e.updateDrawing
                    }
                });
            }
        });
    }
}
