/**
 * @module state/Map.js
 * @name MapState
 * @copyright 2023 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { ValidationError } from './../Errors.js';
import EventDispatcher from './../../utils/EventDispatcher.js';
import { convertNumber, convertBoolean } from './../utils/Converters.js';
import { Extent } from './../utils/Extent.js';

const mapStateProperties = {
    projection: {type: 'string'},
    center: {type: 'array'},
    zoom: {type: 'number'},
    size: {type: 'array'},
    extent: {type: 'extent'},
    resolution: {type: 'number'},
    scaleDenominator: {type: 'number'},
    pointResolution: {type: 'number'},
    pointScaleDenominator: {type: 'number'},
};

/**
 * Map state ready.
 * @event MapState#map.state.ready
 * @type {object}
 * @property {string} type   - map.state.ready
 * @property {boolean} ready - true
 */

/**
 * Map state changed
 * @event MapState#map.state.changed
 * @type {object}
 * @property {string}   type                    - map.state.changed
 * @property {string}   [projection]            - the map projection code if it changed
 * @property {number[]} [center]                - the map center if it changed
 * @property {number}   [zoom]                  - the map zoom if it changed
 * @property {number[]} [size]                  - the map size if it changed
 * @property {number[]} [extent]                - the map extent (calculate by the map view) if it changed
 * @property {number}   [resolution]            - the map resolution if it changed
 * @property {number}   [scaleDenominator]      - the map scale denominator if it changed
 * @property {number}   [pointResolution]       - the map resolution (calculate from the center) if it changed
 * @property {number}   [pointScaleDenominator] - the map scale denominator (calculate from the center) if it changed
 */

/**
 * Class representing the map state
 * @class
 * @augments EventDispatcher
 */
export class MapState extends EventDispatcher {

    /**
     * Creating the map state
     * @param {OptionConfig}     [options]         - main configuration options
     * @param {string|undefined} [startupFeatures] - The features to highlight at startup in GeoJSON
     */
    constructor(options, startupFeatures) {
        super();
        this._ready = false;
        // default values
        this._projection = 'EPSG:3857';
        this._center = [0, 0];
        this._zoom = -1;
        this._minZoom = 0;
        this._maxZoom = -1;
        this._size = [0, 0];
        this._extent = new Extent(0, 0, 0, 0);
        this._initialExtent = new Extent(0, 0, 0, 0);
        this._resolution = -1;
        this._scaleDenominator = -1;
        this._pointResolution = -1;
        this._pointScaleDenominator = -1;

        // Values from options
        this._singleWMSLayer = false;
        if (options) {
            this._singleWMSLayer = options.wms_single_request_for_all_layers; // default value is defined as false
            this._maxZoom = options.mapScales.length - 1;
            this._initialExtent = options.initialExtent;
        }

        this._startupFeatures = startupFeatures;
    }

    /**
     * Update the map state
     * @param {object}   evt                         - the map state changed object
     * @param {string}   [evt.projection]            - the map projection code
     * @param {number[]} [evt.center]                - the map center
     * @param {number}   [evt.zoom]                  - the map zoom
     * @param {number[]} [evt.size]                  - the map size
     * @param {number[]} [evt.extent]                - the map extent (calculate by the map view)
     * @param {number}   [evt.resolution]            - the map resolution
     * @param {number}   [evt.scaleDenominator]      - the map scale denominator
     * @param {number}   [evt.pointResolution]       - the map resolution (calculate from the center)
     * @param {number}   [evt.pointScaleDenominator] - the map scale denominator (calculate from the center)
     * @fires MapState#map.state.ready
     * @fires MapState#map.state.changed
     */
    update(evt) {
        let updatedProperties = {};
        for (const prop in mapStateProperties) {
            if (evt.hasOwnProperty(prop)) {
                // Get definition
                const def = mapStateProperties[prop];
                // save old value
                const oldValue = this['_'+prop];
                // convert value
                switch (def.type){
                    case 'boolean':
                        this['_'+prop] = convertBoolean(evt[prop]);
                        break;
                    case 'number':
                        this['_'+prop] = convertNumber(evt[prop]);
                        break;
                    case 'extent':
                        if (typeof(evt[prop]) == 'string'
                            || typeof(evt[prop]) == 'number'
                            || !(evt[prop] instanceof Array)) {
                            throw new ValidationError('The value for `'+prop+'` has to be an array!');
                        }
                        if (oldValue.length != evt[prop].length) {
                            throw new ValidationError('The length for `'+prop+'` is not expected! It has to be: '+oldValue.length);
                        }
                        this['_'+prop] = new Extent(...evt[prop]);
                        break;
                    case 'array':
                        if (typeof(evt[prop]) == 'string'
                            || typeof(evt[prop]) == 'number'
                            || !(evt[prop] instanceof Array)) {
                            throw new ValidationError('The value for `'+prop+'` has to be an array!');
                        }
                        this['_'+prop] = evt[prop];
                        break;
                    default:
                        this['_'+prop] = evt[prop];
                }
                // Check if the value has changed
                if (def.type == 'extent') {
                    if (!oldValue.equals([...this['_'+prop]])){
                        updatedProperties[prop] = evt[prop];
                    }
                } else if (def.type == 'array') {
                    if (oldValue.filter((v, i) => {return evt[prop][i] != v}).length != 0) {
                        updatedProperties[prop] = evt[prop];
                    }
                } else if (oldValue != this['_'+prop]) {
                    updatedProperties[prop] = evt[prop];
                }
            }
        }
        // Dispatch event only if something have changed
        if (Object.getOwnPropertyNames(updatedProperties).length != 0) {
            const neededProperties = ['center', 'size', 'extent', 'resolution'];
            if (!this._ready && Object.getOwnPropertyNames(updatedProperties).filter(v => neededProperties.includes(v)).length == 4) {
                this._ready = true;
                this.dispatch({
                    type: 'map.state.ready',
                    ready: true,
                });
            }
            this.dispatch(
                Object.assign({
                    type: 'map.state.changed'
                }, updatedProperties)
            );
        }
    }

    /**
     * Map is ready
     * @type {boolean}
     */
    get isReady() {
        return this._ready;
    }

    /**
     * Map projection code
     * @type {string}
     */
    get projection() {
        return this._projection;
    }

    /**
     * Map center
     * @type {number[]}
     */
    get center() {
        return this._center;
    }

    /**
     * Map zoom
     * @type {number}
     */
    get zoom() {
        return this._zoom;
    }

    /**
     * Map min zoom
     * @type {number}
     */
    get minZoom() {
        return this._minZoom;
    }

    /**
     * Map max zoom
     * @type {number}
     */
    get maxZoom() {
        return this._maxZoom;
    }

    /**
     * Map size
     * @type {number[]}
     */
    get size() {
        return this._size;
    }

    /**
     * Map extent (calculate by the map view)
     * @type {number[]}
     */
    get extent() {
        return this._extent;
    }

    /**
     * Map resolution
     * @type {number}
     */
    get resolution() {
        return this._resolution;
    }

    /**
     * Map scale denominator
     * @type {number}
     */
    get scaleDenominator() {
        return this._scaleDenominator;
    }

    /**
     * Map resolution (calculate from the center)
     * @type {number}
     */
    get pointResolution() {
        return this._pointResolution;
    }

    /**
     * Map scale denominator (calculate from the center)
     * @type {number}
     */
    get pointScaleDenominator() {
        return this._pointScaleDenominator;
    }

    /**
     * The features to highlight at startup in GeoJSON
     * @type {string|undefined}
     */
    get startupFeatures() {
        return this._startupFeatures;
    }

    /**
     * Config singleWMSLayer
     *
     * @type {Boolean}
     */
    get singleWMSLayer(){
        return this._singleWMSLayer;
    }

    /**
     * Zoom in
     */
    zoomIn() {
        const newZoom = this._zoom + 1
        if (newZoom <= this._maxZoom) {
            this.update({ 'zoom': newZoom });
        }
    }

    /**
     * Zoom out
     */
    zoomOut() {
        const newZoom = this._zoom - 1
        if (newZoom >= this._minZoom) {
            this.update({ 'zoom': newZoom });
        }
    }

    /**
     * Zoom to initial extent
     */
    zoomToInitialExtent() {
        this.update({ 'extent': this._initialExtent });
    }
}
