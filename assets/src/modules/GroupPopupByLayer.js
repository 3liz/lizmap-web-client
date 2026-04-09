/**
 * @module modules/GroupPopupByLayer.js
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */
import { Config } from './Config.js';

export default class GroupPopupByLayer {
    /**
     * Create a group popup by layer instance
     * @param {Config} initialConfig - The lizmap initial config instance
     */
    constructor(initialConfig) {
        this._initialConfig = initialConfig;
        this._isActive = initialConfig.options?.group_popup_by_layer;
        this._popupMapLocation = initialConfig.options?.popupLocation == 'map';
        this._singleFeatureClass = 'lizmapPopupSingleFeature';
        this._singleFeatureTitleSelector = 'lizmapPopupTitle';
    }

    /**
     * group popup by layer mode activated
     * @type {boolean}
     */
    get isActive(){
        return this._isActive;
    }

    /**
     * Current module state
     * @type {object}
     */
    get currentPopupsPerLayer(){
        return this._currentPopupsPerLayer;
    }

    /**
     * Class selector for the single feature popup element
     * @type {string}
     */
    get singleFeatureClass(){
        return this._singleFeatureClass;
    }

    /**
     * Creates the current state and returns a
     * modified string suitable to be injected in the lizmap-group-popup-layer HTML component
     *
     * @param {string} htmlPopup - the string representing the HTML popup
     * @returns {string}
     */
    groupPopups(htmlPopup){
        // reset state
        this._currentPopupsPerLayer = {};

        if(!this._isActive) return htmlPopup;

        // group popups
        const tpl = document.createElement('template');

        // if the popup location is on the map, wrap the html popup in a slot
        if (this._popupMapLocation){
            tpl.innerHTML = `<div slot='popup'></div>`;
            tpl.content.querySelector('div[slot="popup"]').innerHTML = htmlPopup;
        } else {
            // else use the provided lizmapPopupContent div as the slot
            tpl.innerHTML = htmlPopup;
            tpl.content.querySelector('.lizmapPopupContent').setAttribute('slot','popup');
        }

        // select all first level single feature (exclude children, if any)
        const singleFeatures = tpl.content.querySelectorAll(`div[slot="popup"] > .${this._singleFeatureClass}`);
        // create initial state
        singleFeatures.forEach((f)=>{
            const layerId = f.getAttribute('data-layer-id');
            const featureId = f.getAttribute('data-feature-id');
            const title = f.querySelector(`.${this._singleFeatureTitleSelector}`).innerText;
            if(!this._currentPopupsPerLayer.hasOwnProperty(layerId)){
                this._currentPopupsPerLayer[layerId] = {
                    layerId: layerId,
                    title: title,
                    features: [],
                    selectedFeature:featureId,
                }
            }
            this._currentPopupsPerLayer[layerId].features.push(featureId);

            // hide single feature, its visibility will be managed by the lizmap-group-popup-layer HTML component
            f.style.display = 'none';
        })

        return tpl.innerHTML;
    }
}
