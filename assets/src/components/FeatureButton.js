/**
 * @module components/FeatureButton.js
 * @name FeatureButton
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { getCenter } from 'ol/extent.js';

// Maximum time to wait for the feature geometry, in milliseconds
const FEATURE_REQUEST_TIMEOUT = 10000;

/**
 * @summary A button to act on a specific feature of a specific layer:
 * open its popup or launch its edition, and optionally zoom to it.
 * @description
 * Data attributes:
 * - `data-target-layer-id` (required): the QGIS layer ID.
 * - `data-target-feature-id` (required): the value of the primary key for the feature.
 *   It is also used as the WFS feature ID for zoom and edition.
 * - `data-target-layer-pk-field` (required in `popup` mode): the primary key field of the layer.
 *   It must be the primary key defined for the layer in QGIS, and a single-column key:
 *   composite keys and layers without a primary key are not supported.
 * - `data-mode` (optional, default `popup`): `popup` to open the feature popup
 *   (popup must be enabled for the layer), `edit` to launch the feature edition
 *   (the layer must be editable by the current user, with modification allowed).
 * - `data-target-zoom-to-feature` (optional, default `false`): `true` to zoom to the feature.
 * - `data-label` (optional): the button text. Defaults to a translated label depending on the mode.
 * - `data-description` (optional): the button tooltip.
 *
 * The button is disabled if the parameters are not valid; the reason is logged in the console.
 * @augments HTMLElement
 * @fires featureButtonPopupDisplayed
 * @fires featureButtonEditionLaunched
 * @example <caption>Open the popup of a feature and zoom to it</caption>
 * <lizmap-feature-button
 *      data-target-layer-id="layer_id"
 *      data-target-feature-id="42"
 *      data-target-layer-pk-field="id"
 *      data-target-zoom-to-feature="true"
 *      data-description="Open the popup for this feature">
 * </lizmap-feature-button>
 * @example <caption>Launch the edition of a feature</caption>
 * <lizmap-feature-button
 *      data-target-layer-id="layer_id"
 *      data-target-feature-id="42"
 *      data-target-layer-pk-field="id"
 *      data-mode="edit"
 *      data-label="Edit">
 * </lizmap-feature-button>
 */
export default class FeatureButton extends HTMLElement {

    /**
     * Create the inner button and bind its click event
     */
    constructor() {
        super();
        this._button = document.createElement('button');
        this._button.type = 'button';
        this._button.addEventListener('click', () => this.onClick());
    }

    /**
     * Read the data attributes, check them and render the button
     * when the element is inserted into the DOM
     */
    connectedCallback() {
        // data attributes from the HTML element
        this.targetLayerId = this.dataset.targetLayerId;
        this.targetFeatureId = this.dataset.targetFeatureId;
        this.mode = this.dataset.mode || 'popup';
        this.label = this.dataset.label
            || lizDict[this.mode === 'edit' ? 'featureButton.edit.label' : 'featureButton.popup.label'];
        this.description = this.dataset.description;
        this.zoomTo = this.dataset.targetZoomToFeature === "true";
        this.targetLayerPkField = this.dataset.targetLayerPkField;

        try {
            this.targetLayerConfig = mainLizmap.initialConfig.layers.getLayerConfigByLayerId(this.targetLayerId);
            this.targetLayerName = this.targetLayerConfig.name;
        } catch {
            this.targetLayerConfig = null;
            this.targetLayerName = undefined;
        }

        // Check if the parameters are valid (change the button state accordingly)
        this.isValidParameters = this.checkParameters();

        // Render the button
        this._render();
    }

    /**
     * Render the button, disabled if the parameters are not valid
     */
    _render() {
        this._button.textContent = this.label;
        this._button.title = this.description ?? '';
        this._button.className = 'btn lizmap-feature-button';
        this._button.disabled = !this.isValidParameters;
        this.append(this._button);
    }

    /**
     * Zoom to the feature if requested, then display its popup or launch its edition
     * depending on the mode. The button is disabled while the request is running.
     * @async
     * @returns {Promise<void>}
     */
    async onClick() {
        this._button.disabled = true;
        try {
            // The geometry is needed to zoom, and to anchor the popup on the feature when displayed on the map
            const popupOnMap = this.mode === 'popup' && mainLizmap.initialConfig.options.popupLocation === 'map';
            const geometry = (this.zoomTo || popupOnMap) ? await this._getFeatureGeometry() : null;
            if (this.zoomTo && geometry) {
                await this._zoomTo(geometry);
            }

            if (this.mode === "edit") {
                lizMap.launchEdition(this.targetLayerId, this.targetFeatureId, null, null);
                this._dispatch('featurebutton.edition.launched');
            } else if (this.mode === "popup") {
                const anchor = geometry ? getCenter(geometry.getExtent()) : null;
                const displayed = await mainLizmap.popup.displayFeaturePopup(
                    this.targetLayerId, this.targetFeatureId, this.targetLayerPkField, anchor);
                if (!displayed) {
                    lizMap.addMessage(lizDict['featureButton.error'], 'error', true, 5000);
                    return;
                }
                this._dispatch('featurebutton.popup.displayed');
            } else {
                lizMap.addMessage(lizDict['featureButton.error'], 'error', true, 5000);
                return;
            }
        } catch (error) {
            console.error(error);
        } finally {
            this._button.disabled = false;
        }
    }

    /**
     * Get the feature geometry in the map projection
     * @returns {Promise<Geometry|null>} The feature geometry, or null if it cannot be retrieved
     */
    _getFeatureGeometry() {
        return new Promise((resolve) => {
            // getLayerFeature does not call back if the request fails
            const timeout = setTimeout(() => resolve(null), FEATURE_REQUEST_TIMEOUT);
            lizMap.getLayerFeature(this.targetLayerName, this.targetFeatureId,
                (feat) => {
                    clearTimeout(timeout);
                    try {
                        const olFeature = (new GeoJSON()).readFeature(feat, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: mainLizmap.map.getView().getProjection()
                        });
                        resolve(olFeature.getGeometry() ?? null);
                    } catch (error) {
                        console.error(error);
                        resolve(null);
                    }
                },
                () => {
                    clearTimeout(timeout);
                    resolve(null);
                }
            );
        });
    }

    /**
     * Zoom to the geometry and wait for the view to reach its final position
     * @param {Geometry} geometry - The geometry in the map projection
     * @returns {Promise<void>}
     */
    _zoomTo(geometry) {
        return new Promise((resolve) => {
            mainLizmap.map.zoomToGeometryOrExtent(geometry, { callback: () => resolve() });
        });
    }

    /**
     * Check the parameters depending on the mode:
     * - common: the mode is known, the layer exists and the feature id is defined
     * - popup: the primary key field is defined and the popup is enabled for the layer
     * - edit: the layer is editable by the current user and its features can be modified
     * @returns {boolean} True if the parameters are valid, false otherwise
     */
    checkParameters() {
        if (!['popup', 'edit'].includes(this.mode)) {
            console.warn(`The mode is unknown, expected "popup" or "edit" : ${this.mode}`);
            return false;
        }
        if (!this.targetLayerName) {
            console.warn(`The target layer is undefined or does not exist : ${this.targetLayerId}`);
            return false;
        }
        if (!this.targetFeatureId) {
            console.warn(`The target feature id is undefined for the layer : ${this.targetLayerId}`);
            return false;
        }

        if (this.mode === 'popup') {
            if (!this.targetLayerPkField) {
                console.warn(`The target layer primary key field is undefined : ${this.targetLayerId}`);
                return false;
            }
            if (!this.targetLayerConfig.popup) {
                console.warn(`The target layer does not have popup enabled : ${this.targetLayerId}`);
                return false;
            }
        }

        if (this.mode === 'edit') {
            // The config only contains the edition layers the current user is allowed to edit
            const config = mainLizmap.initialConfig;
            if (!config.hasEditionLayers || !config.editionLayers.layerIds.includes(this.targetLayerId)) {
                console.warn(`The target layer is not editable by the current user : ${this.targetLayerId}`);
                return false;
            }
            const capabilities = config.editionLayers.getLayerConfigByLayerId(this.targetLayerId).capabilities;
            if (!capabilities.modifyAttribute && !capabilities.modifyGeometry) {
                console.warn(`The target layer features cannot be modified : ${this.targetLayerId}`);
                return false;
            }
        }

        return true;
    }


    /**
     * Notify listeners through the main event dispatcher
     * @param {string} type - The event type
     * @fires featureButtonPopupDisplayed
     * @fires featureButtonEditionLaunched
     */
    _dispatch(type) {
        /**
         * When the button action has been performed
         * @event featureButtonPopupDisplayed
         * @event featureButtonEditionLaunched
         * @property {string} type      featurebutton.popup.displayed or featurebutton.edition.launched
         * @property {string} layerId   The target layer ID
         * @property {string} featureId The target feature ID
         * @example
         * lizMap.mainEventDispatcher.addListener((lizmapEvent) => {
         *         console.log(`Popup displayed for ${lizmapEvent.layerId} / ${lizmapEvent.featureId}`);
         *     },
         *     ['featurebutton.popup.displayed']
         * );
         */
        mainEventDispatcher.dispatch({
            type: type,
            layerId: this.targetLayerId,
            featureId: this.targetFeatureId,
        });
    }
}
