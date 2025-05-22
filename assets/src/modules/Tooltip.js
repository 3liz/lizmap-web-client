/**
 * @module modules/Tooltip.js
 * @name Tooltip
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */
import { mainEventDispatcher } from '../modules/Globals.js';
import { TooltipLayersConfig } from './config/Tooltip.js';
import WMS from '../modules/WMS.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import { Circle, Fill, Stroke, Style } from 'ol/style.js';
import { Reader, createOlStyleFunction, getLayer, getStyle } from '@nieuwlandgeo/sldreader/src/index.js';

/**
 * @class
 * @name Tooltip
 */
export default class Tooltip {

    /**
     * Create the tooltip Map
     * @param {Map}        map        - OpenLayers map
     * @param {TooltipLayersConfig} tooltipLayersConfig - The config tooltipLayers
     * @param {object}        lizmap3       - The old lizmap object
     */
    constructor(map, tooltipLayersConfig, lizmap3) {
        this._map = map;
        this._tooltipLayersConfig = tooltipLayersConfig;
        this._lizmap3 = lizmap3;
        this._activeTooltipLayer;
        this._tooltipLayers = new Map();
    }

    /**
     * Activate tooltip for a layer order
     * @param {number} layerOrder a layer order
     */
    activate(layerOrder) {
        if (layerOrder === "") {
            this.deactivate();
            return;
        }

        // Remove previous layer if any
        this._map.removeToolLayer(this._activeTooltipLayer);

        const layerTooltipCfg = this._tooltipLayersConfig.layerConfigs[layerOrder];
        const layerName = layerTooltipCfg.name;
        const tooltipLayer = this._tooltipLayers.get(layerName);
        this._displayGeom = layerTooltipCfg.displayGeom;
        this._displayLayerStyle = layerTooltipCfg.displayLayerStyle;

        // Styles
        const fill = new Fill({
            color: 'transparent',
        });

        const stroke = new Stroke({
            color: 'rgba(255, 255, 255, 0.01)', // 'transparent' doesn't work for lines. Is it a bug in OL?
        });

        const hoverColor = layerTooltipCfg.colorGeom;

        const hoverStyle = feature => {
            if (['Polygon', 'MultiPolygon'].includes(feature.getGeometry().getType())) {
                return new Style({
                    fill: fill,
                    stroke: new Stroke({
                        color: hoverColor,
                        width: 3
                    }),
                });
            } else if (['LineString', 'MultiLineString'].includes(feature.getGeometry().getType())) {
                return new Style({
                    stroke: new Stroke({
                        color: hoverColor,
                        width: 6
                    }),
                });
            } else if (['Point', 'MultiPoint'].includes(feature.getGeometry().getType())) {
                return new Style({
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
            }
            return undefined;
        }

        if (tooltipLayer) {
            this._activeTooltipLayer = tooltipLayer;
        } else {
            const url = `${lizUrls.service.replace('service?','features/tooltips?')}&layerId=${layerTooltipCfg.id}`;

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


            // Handle points layers with QGIS style
            if (this._displayLayerStyle) {
                const wmsParams = {
                    LAYERS: layerName
                };

                const wms = new WMS();

                wms.getStyles(wmsParams).then((response) => {
                    const sldObject = Reader(response);

                    const sldLayer = getLayer(sldObject);
                    const style = getStyle(sldLayer);
                    const featureTypeStyle = style.featuretypestyles[0];

                    const olStyleFunction = createOlStyleFunction(featureTypeStyle, {
                        imageLoadedCallback: () => {
                            // Signal OpenLayers to redraw the layer when an image icon has loaded.
                            // On redraw, the updated symbolizer with the correct image scale will be used to draw the icon.
                            this._activeTooltipLayer.changed();
                        },
                    });

                    this._activeTooltipLayer.setStyle(olStyleFunction);
                });
            }

            // Load tooltip layer
            this._activeTooltipLayer.once('sourceready', () => {
                mainEventDispatcher.dispatch('tooltip.loaded');
            });

            this._activeTooltipLayer.getSource().on('featuresloaderror', () => {
                this._lizmap3.addMessage(lizDict['tooltip.loading.error'], 'error', true);
                console.warn(`Tooltip layer '${layerName}' could not be loaded.`);
            });

            mainEventDispatcher.dispatch('tooltip.loading');

            this._tooltipLayers.set(layerName, this._activeTooltipLayer);
        }

        this._map.addToolLayer(this._activeTooltipLayer);

        const tooltip = document.getElementById('tooltip');

        let currentFeature;

        this._onPointerMove = event => {
            const pixel = this._map.getEventPixel(event.originalEvent);
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
                : this._map.forEachFeatureAtPixel(pixel, feature => {
                    return feature; // returning a truthy value stop detection
                }, {
                    hitTolerance: 5,
                    layerFilter: layerCandidate => layerCandidate == this._activeTooltipLayer
                });

            if (feature) {
                // Set hover style if `Display geom` is true
                if (this._displayGeom){
                    feature.setStyle(hoverStyle);
                }
                // Increase point size on hover
                else if (this._displayLayerStyle){
                    const olStyleFunction = this._activeTooltipLayer.getStyleFunction();
                    const mapResolution = this._map.getView().getResolution();
                    const olStyle = olStyleFunction(feature, mapResolution);

                    const newStyle = [];
                    for (const style of olStyle) {
                        const clonedStyle = style.clone();
                        // If the style is a Circle, increase its radius
                        // We could increase the scale but pixels are blurry
                        const newRadius = clonedStyle.getImage().getRadius?.() * 1.5;
                        if (newRadius) {
                            clonedStyle.getImage().setRadius(newRadius);
                        } else {
                            // If the style is not a Circle, we can still increase the scale
                            const newScale = clonedStyle.getImage().getScale() * 1.5;
                            clonedStyle.getImage().setScale(newScale);
                        }
                        newStyle.push(clonedStyle);
                    }

                    feature.setStyle(newStyle);
                }

                // Display tooltip
                tooltip.style.left = pixel[0] + 'px';
                tooltip.style.top = pixel[1] + 'px';
                const tooltipHTML = feature.get('tooltip');
                if (feature !== currentFeature && tooltip) {
                    tooltip.style.visibility = 'visible';
                    tooltip.innerHTML = tooltipHTML;
                }
            } else {
                tooltip.style.visibility = 'hidden';
            }
            currentFeature = feature;
        };

        this._map.on('pointermove', this._onPointerMove);

        this._onPointerLeave = () => {
            currentFeature = undefined;
            tooltip.style.visibility = 'hidden';
        };

        this._map.getTargetElement().addEventListener('pointerleave', this._onPointerLeave);
    }

    /**
     * Deactivate tooltip
     */
    deactivate() {
        this._map.removeToolLayer(this._activeTooltipLayer);
        if (this._onPointerMove) {
            this._map.un('pointermove', this._onPointerMove);
        }
        if (this._onPointerLeave) {
            this._map.getTargetElement().removeEventListener('pointerleave', this._onPointerLeave);
        }
    }
}
