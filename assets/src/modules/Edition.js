/**
 * @module modules/Edition.js
 * @name Edition
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { mainEventDispatcher } from '../modules/Globals.js';

/**
 * @class
 * @name Edition
 */
export default class Edition {

    /**
     * Create an edition instance
     * @param {object}   lizmap3   - The old lizmap object
     */
    constructor(lizmap3) {
        this._lizmap3 = lizmap3;

        this.drawFeatureActivated = false;
        this._layerId = undefined;
        this.layerGeometry = undefined;
        this.drawControl = undefined;
        this._lastSegmentLength = undefined;
        this._lastActiveVertex = null;

        lizmap3.events.on({
            lizmapeditiondrawfeatureactivated: (properties) => {
                this.drawFeatureActivated = true;
                this.layerGeometry = properties.editionConfig.geometryType;
                this.drawControl = properties.drawControl;
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            },
            lizmapeditiondrawfeaturedeactivated: () => {
                this.drawFeatureActivated = false;
                this.layerGeometry = undefined;
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

        mainEventDispatcher.addListener(()=>{
            if (this._lastActiveVertex) {
                this._lastActiveVertex.style = null;
                if (this._lastActiveVertex.layer) {
                    this._lastActiveVertex.layer.drawFeature(this._lastActiveVertex);
                }
                this._lastActiveVertex = null;
            }
        }, 'edition.feature.modified')
    }

    get layerId() {
        return this._layerId;
    }

    get hasEditionLayers() {
        return 'editionLayers' in this._lizmap3.config;
    }

    get editLayer() {
        const editLayer = this._lizmap3.map.getLayersByName('editLayer');
        if (editLayer.length === 1) {
            return editLayer[0];
        } else {
            return undefined;
        }
    }

    get modifyFeatureControl(){
        const modifyFeatureCtrls = this._lizmap3.map.getControlsByClass('OpenLayers.Control.ModifyFeature');
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
     * The last modified vertex geometry
     * @type {object|null} - OpenLayers 2 feature representing the last modified vertex
     */
    get lastActiveVertex(){
        return this._lastActiveVertex;
    }

    /**
     * Sets the style for sketch geometry, in both drawing mode and edit mode.
     * Setting an empty object restores the default style.
     * @param {object|null} style
     * @returns {void}
     */
    setOL2SketchGeometryStyle(style = {}){
        // draw mode
        if(this.drawControl?.active) {
            this.drawControl.handler.point.style = style;
        } else if (this.modifyFeatureControl?.active) {
            // edition mode
            // gets the current vertex, so that the geometry is modified only for the vertex being edited
            // while leaving all others in the default style
            const currentVertex = this.modifyFeatureControl.vertex;
            if( this._lastActiveVertex && this._lastActiveVertex != currentVertex) {
                // reset the style of the drawn vertex, since it has changed
                // (for example, the user has selected a different vertex to edit)
                this._lastActiveVertex.style = null
                if (this._lastActiveVertex.layer) {
                    this._lastActiveVertex.layer.drawFeature(this._lastActiveVertex);
                }
                this._lastActiveVertex = null;
            }

            // set the style of the current vertex and redraw it
            if (currentVertex){
                if (style) {
                    currentVertex.style = OpenLayers.Util.applyDefaults(
                        { ...style },
                        OpenLayers.Feature.Vector.style["default"]
                    );
                    // kep trace of the last vertex selected
                    this._lastActiveVertex = currentVertex;
                } else {
                    // Case where the user is still dragging, but the snap has disengaged
                    currentVertex.style = null;
                    this._lastActiveVertex = null;
                }
                // redraw vertex
                this.modifyFeatureControl.layer.drawFeature(currentVertex);
            }
        }
    }

    /**
     * Fetch editable features for given array of layer IDs
     * @param {Array} layerIds - Array of layer IDs
     * @param {Array} layerFeatures - filter on features
     */
    fetchEditableFeatures(layerIds, layerFeatures = []){
        if (Array.isArray(layerIds)){
            const fetchers = [];
            let layerIndex = 0;
            const layersNames = [];
            for (const layerId of layerIds) {
                // take layer name from requests, not from response, since response could be an empty array
                layersNames.push(this._lizmap3.getLayerConfigById(layerId)[0]);
                fetchers.push(fetch(globalThis['lizUrls'].editableFeatures,{
                    "method": "POST",
                    "body": new URLSearchParams({
                        repository: globalThis['lizUrls'].params.repository,
                        project: globalThis['lizUrls'].params.project,
                        layerId: layerId,
                        features: layerFeatures[layerIndex] ?? ''
                    })
                }).then(response => {
                    return response.json();
                }));

                layerIndex++;
            }

            layerIndex = 0;
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
                            properties: {
                                editableFeatures: editableFeatures,
                                layerName:layersNames[layerIndex]
                            }
                        });
                    }

                    layerIndex++;
                }
            });
        }
    }
}
