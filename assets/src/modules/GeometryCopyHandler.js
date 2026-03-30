/**
 * @module modules/GeometryCopyHandler.js
 * @name GeometryCopyHandler
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from './Globals.js';
import FeaturePickerPopup from './FeaturePickerPopup.js';
import { Utils } from './Utils.js';
import { Feature } from 'ol';
import { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon } from 'ol/geom.js';

/**
 * Handles geometry copy workflow
 * @class
 */
export default class GeometryCopyHandler {
    constructor(map) {
        this._map = map;
        this._active = false;
        this._clickHandler = null;
        this._ol6ClickHandler = null;
        this._featurePickerPopup = new FeaturePickerPopup(map);
        this._drawControlWasActive = false;

        // Listen for edition form closed event to deactivate copy mode
        mainEventDispatcher.addListener(() => {
            if (this._active) {
                this.deactivate();
            }
        }, 'edition.formClosed');
    }

    /**
     * Activate copy mode
     */
    activate() {
        if (this._active) {
            return;
        }

        this._active = true;

        // Deactivate digitizing tool to prevent creating vertices on map click
        if (mainLizmap?.digitizing?.toolSelected !== 'deactivate') {
            this._drawControlWasActive = true;
            this._previousTool = mainLizmap.digitizing.toolSelected;
            mainLizmap.digitizing.toolSelected = 'deactivate';
        }

        // Change cursor
        $('#map').css('cursor', 'crosshair');
        $('#newOlMap').css('cursor', 'crosshair');

        // Register click handler on the appropriate map
        // In edition context, OL6 map is on top so use OL6 click handler
        if (mainLizmap.digitizing?.context === 'edition' && mainLizmap.map) {
            this._ol6ClickHandler = (event) => this._onOL6MapClick(event);
            mainLizmap.map.on('singleclick', this._ol6ClickHandler);
        } else {
            this._clickHandler = this._map.events.register('click', this, this._onMapClick);
        }

        // Dispatch event
        mainEventDispatcher.dispatch({
            type: 'geometryCopy.activated'
        });
    }

    /**
     * Deactivate copy mode
     */
    deactivate() {
        if (!this._active) return;

        this._active = false;

        // Reactivate digitizing tool if it was active before
        if (this._drawControlWasActive && mainLizmap?.digitizing && this._previousTool) {
            mainLizmap.digitizing.toolSelected = this._previousTool;
            this._drawControlWasActive = false;
            this._previousTool = null;
        }

        // Reset cursor
        $('#map').css('cursor', 'default');
        $('#newOlMap').css('cursor', '');

        // Unregister click handlers
        if (this._clickHandler) {
            this._map.events.unregister('click', this, this._onMapClick);
            this._clickHandler = null;
        }
        if (this._ol6ClickHandler && mainLizmap.map) {
            mainLizmap.map.un('singleclick', this._ol6ClickHandler);
            this._ol6ClickHandler = null;
        }

        // Hide popup if open
        this._featurePickerPopup.hide();

        // Dispatch event
        mainEventDispatcher.dispatch({
            type: 'geometryCopy.deactivated'
        });
    }

    /**
     * Handle OL2 map click
     * @param {object} event - OL2 Map click event
     */
    _onMapClick(event) {
        const position = event.xy;
        const coordinate = this._map.getLonLatFromPixel(position);

        // Query features at this position
        this._queryFeaturesAtPosition(coordinate, position);
    }

    /**
     * Handle OL6 map click (used in edition context when OL6 map is on top)
     * @param {object} event - OL6 map click event
     */
    _onOL6MapClick(event) {
        const pixel = event.pixel;
        const ol6Map = mainLizmap.map;
        const ol6Size = ol6Map.getSize(); // [width, height]
        const ol6Extent = ol6Map.getView().calculateExtent(ol6Size);
        const ol6Projection = ol6Map.getView().getProjection().getCode();

        const position = { x: pixel[0], y: pixel[1] };
        const mapInfo = {
            width: ol6Size[0],
            height: ol6Size[1],
            bbox: ol6Extent.join(','),
            projection: ol6Projection
        };

        // Query features at this position
        this._queryFeaturesAtPosition(null, position, mapInfo);
    }

    /**
     * Query all visible layers for features at position via WMS GetFeatureInfo
     * @param {object} coordinate - Lon/lat coordinate
     * @param {object} pixelPosition - Pixel position
     * @param {object} [mapInfo] - Optional map dimensions/extent (used for OL6 context)
     */
    _queryFeaturesAtPosition(coordinate, pixelPosition, mapInfo) {
        // Close any existing popup before opening a new one
        this._featurePickerPopup.hide();

        // Get all visible layers from mainLizmap state
        let candidateLayers = mainLizmap.state.rootMapGroup.findMapLayers()
            .toSorted((a, b) => b.layerOrder - a.layerOrder);

        // Only request visible layers
        candidateLayers = candidateLayers.filter(layer => layer.visibility);

        // Only request layers with 'popup' checked (queryable layers)
        candidateLayers = candidateLayers.filter(layer => {
            const layerCfg = layer.layerConfig;
            return layerCfg && layerCfg.popup;
        });

        if (!candidateLayers.length) {
            lizMap.addMessage('No queryable layers found. Please enable popup on layers you want to copy from.', 'info', true);
            this.deactivate();
            return;
        }

        const layersNames = [];
        const layersStyles = [];
        const filterTokens = [];
        const legendOn = [];
        const legendOff = [];

        for (const layer of candidateLayers) {
            const layerWmsParams = layer.wmsParameters;
            layersNames.push(layerWmsParams['LAYERS']);
            layersStyles.push(layerWmsParams['STYLES']);
            if ('FILTERTOKEN' in layerWmsParams) {
                filterTokens.push(layerWmsParams['FILTERTOKEN']);
            }
            if ('LEGEND_ON' in layerWmsParams) {
                legendOn.push(layerWmsParams['LEGEND_ON']);
            }
            if ('LEGEND_OFF' in layerWmsParams) {
                legendOff.push(layerWmsParams['LEGEND_OFF']);
            }
        }

        // Get map dimensions and extent — use OL6 values when available (edition context)
        let width, height, bbox, projection;
        if (mapInfo) {
            width = mapInfo.width;
            height = mapInfo.height;
            bbox = mapInfo.bbox;
            projection = mapInfo.projection;
        } else {
            const mapSize = this._map.getSize();
            const extent = this._map.getExtent();
            width = mapSize.w;
            height = mapSize.h;
            bbox = extent.toBBOX();
            projection = this._map.getProjection();
        }

        const wmsParams = {
            QUERY_LAYERS: layersNames.join(','),
            LAYERS: layersNames.join(','),
            STYLE: layersStyles.join(','),
            INFO_FORMAT: 'text/html',
            CRS: projection,
            BBOX: bbox,
            WIDTH: width,
            HEIGHT: height,
            FEATURE_COUNT: 100,
            I: Math.round(pixelPosition.x),
            J: Math.round(pixelPosition.y),
            FI_POINT_TOLERANCE: 25,
            FI_LINE_TOLERANCE: 10,
            FI_POLYGON_TOLERANCE: 5
        };

        if (filterTokens.length) {
            wmsParams.FILTERTOKEN = filterTokens.join(';');
        }
        if (legendOn.length) {
            wmsParams.LEGEND_ON = legendOn.join(';');
        }
        if (legendOff.length) {
            wmsParams.LEGEND_OFF = legendOff.join(';');
        }

        $('#newOlMap').css('cursor', 'wait');

        // Use fetchHTML to get the standard Lizmap popup HTML response
        Utils.fetchHTML(globalThis['lizUrls'].wms, {
            method: "POST",
            body: new URLSearchParams({
                repository: globalThis['lizUrls'].params.repository,
                project: globalThis['lizUrls'].params.project,
                SERVICE: 'WMS',
                REQUEST: 'GetFeatureInfo',
                VERSION: '1.3.0',
                ...wmsParams
            })
        }).then(response => {
            $('#newOlMap').css('cursor', 'crosshair');
            this._handleWMSResponse(response, pixelPosition);
        }).catch(() => {
            $('#newOlMap').css('cursor', 'crosshair');
            lizMap.addMessage('Error querying features', 'error', true);
            this.deactivate();
        });
    }

    /**
     * Handle WMS GetFeatureInfo HTML response
     * @param {string} htmlResponse - HTML response from WMS GetFeatureInfo
     * @param {object} pixelPosition - Pixel position where user clicked
     */
    _handleWMSResponse(htmlResponse, pixelPosition) {
        const features = [];

        // Get current editing layer's geometry type for filtering
        const editingGeometryType = this._getEditingGeometryType();

        // Parse HTML response
        const $html = $('<div>').html(htmlResponse);
        const $featureDivs = $html.find('.lizmapPopupSingleFeature');

        $featureDivs.each((index, featureDiv) => {
            try {
                const $featureDiv = $(featureDiv);

                // Extract layer name from lizmapPopupTitle
                const layerName = $featureDiv.find('.lizmapPopupTitle').text().trim() || 'Unknown Layer';

                // Extract layer ID and feature ID from data attributes
                const layerId = $featureDiv.attr('data-layer-id') || '';
                const featureId = $featureDiv.attr('data-feature-id') || 'Unknown';

                // Extract geometry WKT from hidden input
                const geometryWKT = $featureDiv.find('.lizmap-popup-layer-feature-geometry').val();

                if (!geometryWKT) {
                    return;
                }

                // Convert WKT to OL2 geometry
                const ol2Geometry = OpenLayers.Geometry.fromWKT(geometryWKT);

                if (!ol2Geometry) {
                    return;
                }

                const geometryType = this._getGeometryType(ol2Geometry);

                // Filter by geometry type - only add features that match the editing layer's geometry type
                if (editingGeometryType && !this._geometryTypesMatch(geometryType, editingGeometryType)) {
                    return;
                }

                // Create OL2 feature
                const ol2Feature = new OpenLayers.Feature.Vector(ol2Geometry);
                ol2Feature.fid = featureId;

                features.push({
                    layerName: layerName,
                    layerId: layerId,
                    featureLabel: featureId,
                    geometryType: geometryType,
                    geometryWKT: geometryWKT,
                    geometry: ol2Geometry,
                    feature: ol2Feature
                });
            } catch {
                // Silently skip features that fail to parse
            }
        });

        if (features.length > 0) {
            this._showFeaturePicker(features, pixelPosition);
        } else {
            lizMap.addMessage('No compatible features found at this location', 'info', true);
            this.deactivate();
        }
    }

    /**
     * Get feature label for display
     * @param {object} feature - Feature object
     * @returns {string} Feature label
     */
    _getFeatureLabel(feature) {
        // Try to get a meaningful label from attributes
        if (feature.attributes) {
            const labelAttrs = ['name', 'label', 'title', 'id', 'fid', 'pk_uid'];
            for (const attr of labelAttrs) {
                if (feature.attributes[attr] !== undefined && feature.attributes[attr] !== null) {
                    return String(feature.attributes[attr]);
                }
            }
        }
        return feature.fid || feature.id || 'Feature';
    }

    /**
     * Get geometry type name
     * @param {object} geometry - Geometry object
     * @returns {string} Geometry type name
     */
    _getGeometryType(geometry) {
        if (!geometry) return 'Unknown';
        return geometry.CLASS_NAME.replace('OpenLayers.Geometry.', '');
    }

    /**
     * Show feature picker popup
     * @param {Array} features - Array of features
     * @param {object} pixelPosition - Pixel position
     */
    _showFeaturePicker(features, pixelPosition) {
        this._featurePickerPopup.show(
            features,
            pixelPosition,
            (selectedFeature) => {
                this._onFeatureSelected(selectedFeature);
            }
        );
    }

    /**
     * Handle feature selection from popup
     * @param {object} featureData - Selected feature data
     */
    _onFeatureSelected(featureData) {
        // Convert OL2 geometry to OL6 format
        const ol6Feature = this._convertToOL6Feature(featureData.feature);

        // Store in FeatureStorage
        mainLizmap.featureStorage.copy([ol6Feature], {
            geometryType: featureData.geometryType,
            sourceLayer: featureData.layerName,
            sourceCRS: this._map.projection
        });

        // Deactivate copy mode first (before applying geometry)
        // so that tool restoration doesn't interfere with edit mode
        this._drawControlWasActive = false;
        this.deactivate();

        // Apply to current editing feature (sets isEdited = true)
        this._applyGeometryToEditing(featureData.geometry);

        // Visual feedback
        lizMap.addMessage('Geometry copied successfully', 'info', true);
    }

    /**
     * Convert OL2 feature to OL6 format
     * @param {object} ol2Feature - OpenLayers 2 feature
     * @returns {object | null} OpenLayers 6 feature or null
     */
    _convertToOL6Feature(ol2Feature) {
        const geometry = ol2Feature.geometry;
        const geomType = this._getGeometryType(geometry);

        let olGeometry;

        switch(geomType) {
            case 'Point':
                olGeometry = new Point([geometry.x, geometry.y]);
                break;

            case 'LineString':
                if (geometry.components && geometry.components.length > 0) {
                    olGeometry = new LineString(
                        geometry.components.map(pt => [pt.x, pt.y])
                    );
                }
                break;

            case 'Polygon':
                if (geometry.components && geometry.components.length > 0) {
                    olGeometry = new Polygon(
                        geometry.components.map(ring =>
                            ring.components.map(pt => [pt.x, pt.y])
                        )
                    );
                }
                break;

            case 'MultiPoint':
                if (geometry.components && geometry.components.length > 0) {
                    olGeometry = new MultiPoint(
                        geometry.components.map(pt => [pt.x, pt.y])
                    );
                }
                break;

            case 'MultiLineString':
                if (geometry.components && geometry.components.length > 0) {
                    olGeometry = new MultiLineString(
                        geometry.components.map(line =>
                            line.components.map(pt => [pt.x, pt.y])
                        )
                    );
                }
                break;

            case 'MultiPolygon':
                if (geometry.components && geometry.components.length > 0) {
                    olGeometry = new MultiPolygon(
                        geometry.components.map(poly =>
                            poly.components.map(ring =>
                                ring.components.map(pt => [pt.x, pt.y])
                            )
                        )
                    );
                }
                break;

            default:
                console.warn('Unsupported geometry type for conversion:', geomType);
                return null;
        }

        if (!olGeometry) {
            console.error('Failed to convert geometry');
            return null;
        }

        return new Feature({ geometry: olGeometry });
    }

    /**
     * Apply copied geometry to current editing feature
     * @param {object} geometry - OL2 geometry to apply
     */
    _applyGeometryToEditing(geometry) {
        if (!mainLizmap.edition || !mainLizmap.digitizing) {
            return;
        }

        // Convert OL2 geometry to OL6 feature and add to digitizing draw source
        const ol6Geom = this._convertOL2ToOL6Geometry(geometry);
        if (ol6Geom) {
            const ol6Feature = new Feature(ol6Geom);
            // Set the draw color so the feature renders correctly
            ol6Feature.set('color', mainLizmap.digitizing.drawColor);
            mainLizmap.digitizing._drawSource.clear();
            mainLizmap.digitizing._drawSource.addFeature(ol6Feature);
            mainLizmap.digitizing.isEdited = true;
            mainEventDispatcher.dispatch('digitizing.geometryChanged');
        }
    }

    /**
     * Convert OL2 geometry to OL6 geometry
     * @param {object} ol2Geom - OL2 geometry
     * @returns {object|null} OL6 geometry or null
     */
    _convertOL2ToOL6Geometry(ol2Geom) {
        const className = ol2Geom.CLASS_NAME;
        if (className === 'OpenLayers.Geometry.Point') {
            return new Point([ol2Geom.x, ol2Geom.y]);
        } else if (className === 'OpenLayers.Geometry.LineString') {
            const coords = ol2Geom.components.map(p => [p.x, p.y]);
            return new LineString(coords);
        } else if (className === 'OpenLayers.Geometry.Polygon') {
            const rings = ol2Geom.components.map(ring =>
                ring.components.map(p => [p.x, p.y])
            );
            return new Polygon(rings);
        } else if (className === 'OpenLayers.Geometry.MultiPoint') {
            const coords = ol2Geom.components.map(p => [p.x, p.y]);
            return new MultiPoint(coords);
        } else if (className === 'OpenLayers.Geometry.MultiLineString') {
            const lines = ol2Geom.components.map(line =>
                line.components.map(p => [p.x, p.y])
            );
            return new MultiLineString(lines);
        } else if (className === 'OpenLayers.Geometry.MultiPolygon') {
            const polys = ol2Geom.components.map(poly =>
                poly.components.map(ring =>
                    ring.components.map(p => [p.x, p.y])
                )
            );
            return new MultiPolygon(polys);
        }
        return null;
    }

    /**
     * Check if copy mode is active
     * @returns {boolean} True if active
     */
    isActive() {
        return this._active;
    }

    /**
     * Get the geometry type of the current editing layer
     * @returns {string|null} Geometry type or null
     */
    _getEditingGeometryType() {
        // Try to get from mainLizmap.edition.layerGeometry
        if (mainLizmap?.edition?.layerGeometry) {
            return mainLizmap.edition.layerGeometry;
        }

        // Try to get from layer config using layer ID
        if (mainLizmap?.edition?.layerId && lizMap?.config?.editionLayers) {
            const layerId = mainLizmap.edition.layerId;

            // editionLayers is an object with layer names as keys, but each has a layerId property
            // We need to find the config where layerId matches
            for (const config of Object.values(lizMap.config.editionLayers)) {
                if (config.layerId === layerId && config.geometryType) {
                    return config.geometryType;
                }
            }
        }

        // Try to get from legacy lizMap.edition
        if (lizMap?.edition?.layerConfig?.geometryType) {
            return lizMap.edition.layerConfig.geometryType;
        }

        // Try to get from lizMap.map editLayer
        const editLayers = this._map.getLayersByName('editLayer');
        if (editLayers && editLayers.length > 0 && editLayers[0].features && editLayers[0].features.length > 0) {
            const feature = editLayers[0].features[0];
            if (feature.geometry) {
                return this._getGeometryType(feature.geometry);
            }
        }

        // Try getting from current draw control
        if (mainLizmap?.edition?.drawControl?.handler?.CLASS_NAME) {
            const handlerClass = mainLizmap.edition.drawControl.handler.CLASS_NAME;

            if (handlerClass.includes('Point')) return 'Point';
            if (handlerClass.includes('Path') || handlerClass.includes('Line')) return 'LineString';
            if (handlerClass.includes('Polygon')) return 'Polygon';
        }

        return null;
    }

    /**
     * Check if two geometry types are compatible
     * @param {string} geomType1 - First geometry type
     * @param {string} geomType2 - Second geometry type
     * @returns {boolean} True if compatible
     */
    _geometryTypesMatch(geomType1, geomType2) {
        if (!geomType1 || !geomType2) return true;

        // Normalize geometry type names (case insensitive)
        const type1 = geomType1.toLowerCase().replace('multi', '');
        const type2 = geomType2.toLowerCase().replace('multi', '');

        // Point matches Point and MultiPoint
        // LineString matches LineString and MultiLineString
        // Polygon matches Polygon and MultiPolygon
        return type1 === type2;
    }
}
