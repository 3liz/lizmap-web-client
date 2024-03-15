/**
 * @module modules/Tooltip.js
 * @name Tooltip
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */
import { mainLizmap } from '../modules/Globals.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';

/**
 * @class
 * @name Tooltip
 */
export default class Tooltip {

    constructor() {
        this._activeTooltipLayer;
        this._tooltipLayers = new Map();
    }

    /**
     * Activate tooltip for a layer name
     * @param {string} layerName
     */
    activate(layerName) {
        // Remove previous layer if any
        mainLizmap.map.removeLayer(this._activeTooltipLayer);

        const tooltipLayer = this._tooltipLayers.get(layerName);
        const layerTooltipCfg = mainLizmap.config.tooltipLayers[layerName];

        // Styles
        const fill = new Fill({
            color: 'transparent',
        });

        const stroke = new Stroke({
            color: 'transparent',
        });

        const hoverColor = layerTooltipCfg.colorGeom;

        const hoverStyle = new Style({
            image: new Circle({
                fill: fill,
                stroke: new Stroke({
                    color: hoverColor,
                    width: 3
                }),
                radius: 5,
            }),
            fill: fill,
            stroke: new Stroke({
                color: hoverColor,
                width: 3
            }),
        });

        if (tooltipLayer) {
            this._activeTooltipLayer = tooltipLayer;
        } else {
            const layerCfg = lizMap.getLayerConfigById(layerTooltipCfg.layerId);
            const typeName = layerCfg[1].typename;

            const url = `http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=tooltip&SERVICE=WFS&REQUEST=GetFeature&VERSION=1.0.0&OUTPUTFORMAT=GeoJSON&TYPENAME=${typeName}&SRSNAME=EPSG:2154`;

            const vectorStyle = new Style({
                image: new Circle({
                    fill: fill,
                    stroke: stroke,
                    radius: 5,
                }),
                fill: fill,
                stroke: stroke,
            });

            this._activeTooltipLayer = new VectorLayer({
                source: new VectorSource({
                    url: url,
                    format: new GeoJSON(),
                }),
                style: vectorStyle
            });
            this._tooltipLayers.set(layerName, this._activeTooltipLayer);
        }

        mainLizmap.map.addLayer(this._activeTooltipLayer);

        const tooltip = document.getElementById('tooltip');

        let currentFeature;

        this._onPointerMove = event => {
            const pixel = mainLizmap.map.getEventPixel(event.originalEvent);
            const target = event.originalEvent.target;

            if (currentFeature) {
                currentFeature.setStyle(undefined);
            }

            if (event.dragging) {
                tooltip.style.visibility = 'hidden';
                currentFeature = undefined;
                return;
            }

            const feature = target.closest('.ol-control')
                ? undefined
                : mainLizmap.map.forEachFeatureAtPixel(pixel, feature => {
                    return feature; // returning a truthy value stop detection
                }, {
                    layerFilter: layerCandidate => layerCandidate == this._activeTooltipLayer
                });

            if (feature) {
                // Set hover style
                feature.setStyle(hoverStyle);

                // Display tooltip
                tooltip.style.left = pixel[0] + 'px';
                tooltip.style.top = pixel[1] + 'px';
                if (feature !== currentFeature) {
                    tooltip.style.visibility = 'visible';
                    tooltip.innerHTML = feature.get(layerTooltipCfg.fields);
                }
            } else {
                tooltip.style.visibility = 'hidden';
            }
            currentFeature = feature;
        };

        mainLizmap.map.on('pointermove', this._onPointerMove);

        this._onPointerLeave = () => {
            currentFeature = undefined;
            tooltip.style.visibility = 'hidden';
        };

        mainLizmap.map.getTargetElement().addEventListener('pointerleave', this._onPointerLeave);
    }

    /**
     * Deactivate tooltip
     */
    deactivate() {
        mainLizmap.map.removeLayer(this._activeTooltipLayer);
        mainLizmap.map.un('pointermove', this._onPointerMove);
        mainLizmap.map.getTargetElement().removeEventListener('pointerleave', this._onPointerLeave);
    }
}
