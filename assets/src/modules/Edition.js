/**
 * @module modules/Edition.js
 * @name Edition
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { getArea, getLength } from 'ol/sphere.js';
import { Feature } from 'ol';
import { Point, LineString } from 'ol/geom.js';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4.js';

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
        this._geometryChangedListener = null;
        this._featureDrawnListener = null;
        this._geolocationListener = null;
        this._splitCompleteListener = null;
        this._savedDrawColor = null;

        lizmap3.events.on({
            lizmapeditiondrawfeatureactivated: (properties) => {
                this.drawFeatureActivated = true;
                this.layerGeometry = properties.editionConfig.geometryType;
                this.drawControl = properties.drawControl;
                this.activateDigitizing();
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            },
            lizmapeditiondrawfeaturedeactivated: () => {
                this.drawFeatureActivated = false;
                this.layerGeometry = undefined;
                this.drawControl = undefined;
                this.lastSegmentLength = undefined;
                this.deactivateDigitizing();
                mainEventDispatcher.dispatch('edition.drawFeatureActivated');
            },
            lizmapeditionformdisplayed: (evt) => {
                this._layerId = (evt['layerId']);
                mainEventDispatcher.dispatch('edition.formDisplayed');
            },
            lizmapeditionformclosed: () => {
                this.deactivateDigitizing();
                mainEventDispatcher.dispatch('edition.formClosed');
            }
        });
    }

    /**
     * Get the digitizing web component element
     * @returns {HTMLElement|null}
     */
    get digitizingElement() {
        return document.querySelector('lizmap-digitizing[context="edition"]');
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
     * Show an editing message popup for the current tool
     * @param {string} messageKey - The lizDict key for the message
     */
    _showEditingMessage(messageKey) {
        const msg = lizDict[messageKey];
        if (!msg) return;
        $('#lizmap-editing-message').remove();
        lizMap.addMessage(msg, 'info', true, 10000).attr('id', 'lizmap-editing-message');
    }

    /**
     * Activate the digitizing module for edition
     */
    activateDigitizing() {
        if (!this.layerGeometry) return;

        // Map edition geometry types to digitizing tools
        const toolMap = { point: 'point', line: 'line', polygon: 'polygon' };
        const tool = toolMap[this.layerGeometry] || 'point';

        // Set digitizing context to edition and ensure draw layer is visible
        mainLizmap.digitizing.context = 'edition';
        mainLizmap.digitizing.toggleVisibility(true);
        mainLizmap.digitizing.singlePartGeometry = true;

        // Ensure the measure tool is inactive when starting a new editing session
        if (mainLizmap.digitizing.hasMeasureVisible) {
            mainLizmap.digitizing.hasMeasureVisible = false;
        }
        // Clear any leftover split lock from a previous session
        mainLizmap.digitizing.isSplitLocked = false;

        // Hide digitizing toolbar immediately for point layers
        const digEl = this.digitizingElement;
        if (digEl) {
            digEl.style.display = this.layerGeometry === 'point' ? 'none' : '';
        }

        // Force blue color for edition (like OL2 style) without persisting to localStorage
        this._savedDrawColor = mainLizmap.digitizing.drawColor;
        mainLizmap.digitizing._drawColor = '#3388ff';
        mainEventDispatcher.dispatch({ type: 'digitizing.drawColor', color: '#3388ff' });

        // Load existing geometry from form if editing an existing feature
        const eform = document.querySelector('#edition-form-container form');
        if (eform) {
            const gColumn = eform.querySelector('input[name="liz_geometryColumn"]')?.value;
            const srid = eform.querySelector('input[name="liz_srid"]')?.value;
            const proj4Def = eform.querySelector('input[name="liz_proj4"]')?.value;

            // Register the layer's SRID in proj4/OL6 if not already known
            if (srid && proj4Def) {
                const epsgCode = 'EPSG:' + srid;
                if (!proj4.defs(epsgCode)) {
                    proj4.defs(epsgCode, proj4Def);
                    register(proj4);
                }
            }

            const wkt = gColumn ? eform.querySelector(`input[name="${gColumn}"]`)?.value : '';
            if (wkt) {
                mainLizmap.digitizing.loadFeatureFromWKT(wkt, srid);
                // Switch to edit mode since we have an existing feature
                mainLizmap.digitizing.isEdited = true;
                this._showEditingMessage('edition.select.modify.activate');
            } else {
                // Activate the drawing tool for new geometry
                mainLizmap.digitizing.toolSelected = tool;
                this._showEditingMessage('edition.draw.activate');
            }
        } else {
            mainLizmap.digitizing.toolSelected = tool;
            this._showEditingMessage('edition.draw.activate');
        }

        // Listen to geometry changes and update form
        if (!this._geometryChangedListener) {
            this._geometryChangedListener = () => {
                this.updateFormGeometry();
            };
            mainEventDispatcher.addListener(
                this._geometryChangedListener,
                'digitizing.geometryChanged'
            );
        }

        // Auto-switch to edit mode after first feature is drawn (like OL2 behavior)
        if (!this._featureDrawnListener) {
            this._featureDrawnListener = () => {
                if (mainLizmap.digitizing.context === 'edition' && mainLizmap.digitizing.featureDrawn) {
                    mainLizmap.digitizing.isEdited = true;
                    // Ensure draw layer stays visible after switching to edit mode
                    mainLizmap.digitizing.toggleVisibility(true);
                    this._showEditingMessage('edition.select.modify.activate');
                }
            };
            mainEventDispatcher.addListener(
                this._featureDrawnListener,
                'digitizing.featureDrawn'
            );
        }

        // Listen to geolocation position for GPS-linked drawing
        if (!this._geolocationListener) {
            this._geolocationListener = () => {
                this._handleGeolocationPosition();
            };
            mainEventDispatcher.addListener(
                this._geolocationListener,
                'geolocation.position'
            );
        }

        // Listen to split complete to store new features for saving
        if (!this._splitCompleteListener) {
            this._splitCompleteListener = () => {
                this._handleSplitComplete();
            };
            mainEventDispatcher.addListener(
                this._splitCompleteListener,
                'digitizing.splitComplete'
            );
        }
    }

    /**
     * Handle geolocation position updates for GPS-linked edition
     * @private
     */
    _handleGeolocationPosition() {
        if (!mainLizmap.geolocation.isLinkedToEdition) return;
        if (!this.layerGeometry) return;

        const mapProjection = mainLizmap.map.getView().getProjection().getCode();
        const position = mainLizmap.geolocation.getPositionInCRS(mapProjection);
        if (!position || !position[0] || !position[1]) return;

        const coord = [position[0], position[1]];

        if (this.layerGeometry === 'point') {
            // For point geometry: create/move point at GPS position
            const feature = new Feature(new Point(coord));
            mainLizmap.digitizing._drawSource.clear();
            mainLizmap.digitizing._drawSource.addFeature(feature);
            mainEventDispatcher.dispatch('digitizing.geometryChanged');
        } else if (this.layerGeometry === 'line' || this.layerGeometry === 'polygon') {
            // For line/polygon: append coordinate if draw interaction is active
            const drawInteraction = mainLizmap.digitizing._drawInteraction;
            if (drawInteraction && typeof drawInteraction.appendCoordinates === 'function') {
                drawInteraction.appendCoordinates([coord]);
            }
        }

        // Update last segment length
        const features = mainLizmap.digitizing.featureDrawn;
        if (features && features.length > 0) {
            const geom = features[0].getGeometry();
            if (geom.getType() === 'LineString') {
                const coords = geom.getCoordinates();
                if (coords.length >= 2) {
                    const lastSegment = new LineString([coords[coords.length - 2], coords[coords.length - 1]]);
                    this.lastSegmentLength = getLength(lastSegment, {
                        projection: mainLizmap.map.getView().getProjection()
                    }).toFixed(3);
                }
            }
        }
    }

    /**
     * Handle split complete in edition context.
     * Determines the smaller/larger split parts and triggers the legacy split workflow.
     * @param {object} evt - The split event with features array and geometryType
     * @private
     */
    _handleSplitComplete() {
        if (mainLizmap.digitizing.context !== 'edition') return;

        // Read split results from Digitizing instance (not from event —
        // OL Feature objects can't pass through EventDispatcher's JSON.stringify)
        const splitFeatures = mainLizmap.digitizing._lastSplitFeatures;
        const splitGeometryType = mainLizmap.digitizing._lastSplitGeometryType;
        if (!splitFeatures || splitFeatures.length < 2) return;

        const eform = document.querySelector('#edition-form-container form');
        if (!eform) return;

        const gColumn = eform.querySelector('input[name="liz_geometryColumn"]')?.value;
        const srid = eform.querySelector('input[name="liz_srid"]')?.value;
        if (!gColumn || !srid) return;

        // Determine smaller and larger features by length/area
        const f0 = splitFeatures[0];
        const f1 = splitFeatures[1];
        const g0 = f0.getGeometry();
        const g1 = f1.getGeometry();
        let smallerFeature, largerFeature;

        if (splitGeometryType === 'line') {
            const len0 = getLength(g0, { projection: mainLizmap.map.getView().getProjection() });
            const len1 = getLength(g1, { projection: mainLizmap.map.getView().getProjection() });
            smallerFeature = len0 < len1 ? f0 : f1;
            largerFeature = len0 < len1 ? f1 : f0;
        } else {
            const area0 = getArea(g0, { projection: mainLizmap.map.getView().getProjection() });
            const area1 = getArea(g1, { projection: mainLizmap.map.getView().getProjection() });
            smallerFeature = area0 < area1 ? f0 : f1;
            largerFeature = area0 < area1 ? f1 : f0;
        }

        // Serialize smaller feature as a new record.
        // Capture the current form data including disabled (read-only) elements so
        // that required attributes which are rendered as disabled inputs are still
        // sent to saveNewFeature. PK field clearing is handled server-side in the
        // PHP saveNewFeature action (which knows the exact PK column names).
        const smallerWkt = mainLizmap.digitizing.getFeatureAsWKT(srid, smallerFeature);
        if (!smallerWkt) return;
        const formData = new FormData(eform);

        // Include values from disabled elements (read-only required fields, PK columns).
        for (const el of eform.querySelectorAll('[name]:disabled')) {
            if (!formData.has(el.name)) {
                formData.set(el.name, el.value ?? '');
            }
        }

        formData.set('liz_featureId', '');
        formData.set('__JFORMS_TOKEN__', '');
        if (gColumn) {
            formData.set(gColumn, smallerWkt);
        }

        // Keep both split features visible in the draw source so the user can
        // see the full result of the split operation on the map.

        // Trigger legacy event so edition.js stores the new feature for saving
        this._lizmap3.events.triggerEvent('lizmapeditionsplitcomplete', {
            newFeatureFormData: formData
        });

        // Set the form geometry explicitly to the larger feature
        const largerWkt = mainLizmap.digitizing.getFeatureAsWKT(srid, largerFeature);
        const input = eform.querySelector(`input[name="${gColumn}"]`);
        if (input) {
            input.value = largerWkt;
            input.dispatchEvent(new Event('change'));
        }

        // Trigger backward compat event
        const featureId = eform.querySelector('input[name="liz_featureId"]')?.value;
        const layerId = eform.querySelector('input[name="liz_layerId"]')?.value;
        lizMap.events.triggerEvent('lizmapeditiongeometryupdated', {
            layerId, featureId, geometry: largerWkt, srid
        });

        // Notify the user that editing tools are locked until both features are saved
        this._showEditingMessage('edition.split.locked.message');
    }

    /**
     * Deactivate the digitizing module for edition
     */
    deactivateDigitizing() {
        // Remove geometry change listener
        if (this._geometryChangedListener) {
            mainEventDispatcher.removeListener(
                this._geometryChangedListener,
                'digitizing.geometryChanged'
            );
            this._geometryChangedListener = null;
        }

        // Remove feature drawn listener
        if (this._featureDrawnListener) {
            mainEventDispatcher.removeListener(
                this._featureDrawnListener,
                'digitizing.featureDrawn'
            );
            this._featureDrawnListener = null;
        }

        // Remove geolocation listener
        if (this._geolocationListener) {
            mainEventDispatcher.removeListener(
                this._geolocationListener,
                'geolocation.position'
            );
            this._geolocationListener = null;
        }

        // Remove split complete listener
        if (this._splitCompleteListener) {
            mainEventDispatcher.removeListener(
                this._splitCompleteListener,
                'digitizing.splitComplete'
            );
            this._splitCompleteListener = null;
        }

        // Clear digitizing features for edition context
        if (mainLizmap.digitizing && mainLizmap.digitizing.context === 'edition') {
            mainLizmap.digitizing.toolSelected = 'deactivate';
            mainLizmap.digitizing.eraseAll();
            mainLizmap.digitizing.context = 'draw';
            mainLizmap.digitizing.toggleVisibility(false);

            // Restore digitizing component visibility
            const digEl = this.digitizingElement;
            if (digEl) {
                digEl.style.display = '';
            }

            // Restore user's draw color
            if (this._savedDrawColor) {
                mainLizmap.digitizing._drawColor = this._savedDrawColor;
                mainEventDispatcher.dispatch({ type: 'digitizing.drawColor', color: this._savedDrawColor });
                this._savedDrawColor = null;
            }

            // Clear distance/angle constraints so the next session starts clean
            mainLizmap.digitizing.resetConstraints();
            // Clear split lock
            mainLizmap.digitizing.isSplitLocked = false;
        }
    }

    /**
     * Update the edition form geometry field from the digitizing module
     */
    updateFormGeometry() {
        const eform = document.querySelector('#edition-form-container form');
        if (!eform) return;
        const gColumn = eform.querySelector('input[name="liz_geometryColumn"]')?.value;
        const srid = eform.querySelector('input[name="liz_srid"]')?.value;
        if (!gColumn || !srid) return;

        const wkt = mainLizmap.digitizing.getFeatureAsWKT(srid);
        const input = eform.querySelector(`input[name="${gColumn}"]`);
        if (input) {
            input.value = wkt;
            input.dispatchEvent(new Event('change'));
        }

        // Backward compat event
        const featureId = eform.querySelector('input[name="liz_featureId"]')?.value;
        const layerId = eform.querySelector('input[name="liz_layerId"]')?.value;
        lizMap.events.triggerEvent('lizmapeditiongeometryupdated', {
            layerId, featureId, geometry: wkt, srid
        });
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
                fetchers.push(fetch(globalThis['lizUrls'].edition.replace('getFeature', 'editableFeatures'),{
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
            }).catch(error => {
                console.error('fetchEditableFeatures failed:', error);
                lizMap.addMessage(error.message || String(error), 'danger', true);
            });
        }
    }
}
