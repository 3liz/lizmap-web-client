/**
 * @module interaction/Draw.js
 * @name Draw
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../Globals.js';

import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Draw as olDraw, Modify as olModify } from 'ol/interaction.js';

/**
 * @class
 * @name Draw
 */
export default class Draw {

    constructor() { }

    /**
     * Initialize Draw based on new OL
     * @param {string} [geomType] The geometry type. One of 'Point', 'LineString', 'LinearRing', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection', 'Circle'.
     * @param {number} [maxFeatures] Limit the draw to maxFeatures features
     * @param {boolean} [modify] Allow to modify features after being drawn
     * @param {Style | null} style Layer style
     * @memberof Draw
     */
    init(geomType = "Point", maxFeatures = -1, modify = true, style) {
        // Remove old draw if any
        if (this._drawSource) {
            this.clear();
        }

        this._drawSource = new VectorSource();

        this._dispatchAddFeature = () => {
            mainEventDispatcher.dispatch('draw.addFeature');
        };

        this._dispatchModifyEnd = () => {
            mainEventDispatcher.dispatch('draw.modifyEnd');
        };

        // Dispatch event when a feature is added
        this._drawSource.on('addfeature', this._dispatchAddFeature);

        this._drawLayer = new VectorLayer({
            source: this._drawSource,
            style: style !== undefined ? style : new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2,
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33',
                    }),
                }),
            }),
        });
        this._drawLayer.setProperties({
            name: 'LizmapDrawDrawLayer'
        });

        mainLizmap.map.addToolLayer(this._drawLayer);

        this._drawInteraction = new olDraw({
            source: this._drawSource,
            type: geomType,
        });

        this._drawInteraction.on('drawend', () => {
            // Limit the draw to maxFeatures features
            if (maxFeatures !== -1 && this._drawSource.getFeatures().length === maxFeatures - 1) {
                mainLizmap.map.removeInteraction(this._drawInteraction);
            }
        });

        mainLizmap.map.addInteraction(this._drawInteraction);

        if (modify) {
            this._modifyInteraction = new olModify({ source: this._drawSource });
            this._modifyInteraction.on('modifyend', this._dispatchModifyEnd);
            mainLizmap.map.addInteraction(this._modifyInteraction);
        }
    }

    clear() {
        this._drawSource.clear(true);
        this._drawSource.un('addfeature', this._dispatchAddFeature);
        mainLizmap.map.removeToolLayer(this._drawLayer);
        mainLizmap.map.removeInteraction(this._drawInteraction);
        this._modifyInteraction.un('modifyend', this._dispatchModifyEnd);
        mainLizmap.map.removeInteraction(this._modifyInteraction);
    }

    set visible(visible) {
        this._drawLayer.setVisible(visible);
    }

    get features() {
        return this._drawSource.getFeatures();
    }
}
