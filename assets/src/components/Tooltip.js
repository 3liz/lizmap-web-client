import { html, render } from 'lit-html';
import { mainLizmap } from '../modules/Globals.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';

export default class Tooltip extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {

        this._tooltipLayersCfg = mainLizmap.config.tooltipLayers;

        this._template = () => html`
            <select @change=${ event => { this._display(event.target.value) }}>
                <option value="">---</option>
                ${Object.keys(this._tooltipLayersCfg).map( tooltipLayerName =>
                    html`<option value="${tooltipLayerName}">${mainLizmap.state.layersAndGroupsCollection.getLayerByName(tooltipLayerName).title}</option>`
                )}
            </select>
        `;

        render(this._template(), this);
    }

    disconnectedCallback() {
    }

    _display(layerName) {
        const layerTooltipCfg = this._tooltipLayersCfg[layerName];
        const layerCfg = lizMap.getLayerConfigById(layerTooltipCfg.layerId);
        const typeName = layerCfg[1].typename;

        const url = `http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=tooltip&SERVICE=WFS&REQUEST=GetFeature&VERSION=1.0.0&OUTPUTFORMAT=GeoJSON&TYPENAME=${typeName}&SRSNAME=EPSG:2154`;

        const fill = new Fill({
            color: 'transparent',
        });

        const stroke = new Stroke({
            color: 'transparent',
        });

        const vectorStyle = new Style({
            image: new Circle({
                fill: fill,
                stroke: stroke,
                radius: 5,
            }),
            fill: fill,
            stroke: stroke,
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

        const vector = new VectorLayer({
            source: new VectorSource({
                url: url,
                format: new GeoJSON(),
            }),
            style: vectorStyle
        });

        mainLizmap.map.addLayer(vector);

        const tooltip = document.getElementById('tooltip');

        let currentFeature;
        mainLizmap.map.on('pointermove', event => {
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
        });

        mainLizmap.map.getTargetElement().addEventListener('pointerleave', () => {
            currentFeature = undefined;
            tooltip.style.visibility = 'hidden';
        });
    }
}
