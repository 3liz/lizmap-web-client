import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';

export default class Edition {

    constructor() {
        this.drawFeatureActivated = false;
        this._layerId = undefined;
        this.layerGeometry = undefined;
        this.drawControl = undefined;
        this._lastSegmentLength = undefined;

        lizMap.events.on({
            lizmapeditiondrawfeatureactivated: (properties) => {
                this.drawFeatureActivated = true;
                this.layerGeometry = properties.editionConfig.geometryType;
                this.drawControl = properties.drawControl;
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            },
            lizmapeditiondrawfeaturedeactivated: () => {
                this.drawFeatureActivated = false;
                this.layerGeometry = undefined;
                this.drawControl = undefined;
                this.lastSegmentLength = undefined;
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            },
            lizmapeditionformdisplayed: (evt) => {
                this._layerId = (evt['layerId']);
                mainEventDispatcher.dispatch('edition.formDisplayed');
            },
            lizmapeditionformclosed: () => {
                mainEventDispatcher.dispatch('edition.formClosed');
            }
        });
    }

    get layerId() {
        return this._layerId;
    }

    get hasEditionLayers() {
        return 'editionLayers' in mainLizmap.lizmap3.config;
    }

    get editLayer() {
        const editLayer = mainLizmap.lizmap3.map.getLayersByName('editLayer');
        if (editLayer.length === 1) {
            return editLayer[0];
        } else {
            return undefined;
        }
    }

    get modifyFeatureControl(){
        const modifyFeatureCtrls = mainLizmap.lizmap3.map.getControlsByClass('OpenLayers.Control.ModifyFeature');
        return (modifyFeatureCtrls.filter(ctrl => ctrl.layer.name === "editLayer"))[0];
    }

    get lastSegmentLength() {
        return this._lastSegmentLength;
    }

    set lastSegmentLength(lastSegmentLength) {
        lastSegmentLength = parseFloat(lastSegmentLength);
        if (this._lastSegmentLength !== lastSegmentLength) {
            this._lastSegmentLength = lastSegmentLength;

            mainEventDispatcher.dispatch('edition.lastSegmentLength');
        }
    }

    /**
     * Fetch editable features for given array of layer IDs
     * @param {array} layerIds
     */
    fetchEditableFeatures(layerIds){
        if (Array.isArray(layerIds)){
            const fetchers = [];
            for (const layerId of layerIds) {
                fetchers.push(fetch(lizUrls.edition.replace('getFeature', 'editableFeatures'),{
                    "method": "POST",
                    "body": new URLSearchParams({
                        repository: lizUrls.params.repository,
                        project: lizUrls.params.project,
                        layerId: layerId
                    })
                }).then(response => {
                    return response.json();
                }));

                Promise.all(fetchers).then(responses => {
                    const editableFeatures = [];
                    for (const response of responses) {
                        if (response?.['success'] && response?.['status'] === 'restricted') {
                            for (const feature of response.features) {
                                editableFeatures.push(feature);
                            }

                            // Dispatch event only if there is a restriction
                            mainEventDispatcher.dispatch({
                                type: 'edition.editableFeatures',
                                properties: editableFeatures
                            });
                        }
                    }
                });
            }
        }
    }
}
