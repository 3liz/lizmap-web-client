/**
 * @module modules/ProxyEvents.js
 * @name ProxyEvents
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { mainEventDispatcher } from '../modules/Globals.js';

/**
 * Proxy old Lizmap events to new ones
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
