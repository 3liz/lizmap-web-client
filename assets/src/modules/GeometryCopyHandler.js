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

        // Deactivate draw control to prevent creating vertices on map click
        if (mainLizmap?.edition?.drawControl && mainLizmap.edition.drawControl.active) {
            this._drawControlWasActive = true;
            mainLizmap.edition.drawControl.deactivate();
        }

        // Change cursor
        $('#map').css('cursor', 'crosshair');
        $('#newOlMap').css('cursor', 'crosshair');

        // Register click handler
        this._clickHandler = this._map.events.register('click', this, this._onMapClick);

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

        // Reactivate draw control if it was active before
        if (this._drawControlWasActive && mainLizmap?.edition?.drawControl) {
            mainLizmap.edition.drawControl.activate();
            this._drawControlWasActive = false;
        }

        // Reset cursor
        $('#map').css('cursor', 'default');
        $('#newOlMap').css('cursor', '');

        // Unregister click handler
        if (this._clickHandler) {
            this._map.events.unregister('click', this, this._onMapClick);
            this._clickHandler = null;
        }

        // Hide popup if open
        this._featurePickerPopup.hide();

        // Dispatch event
        mainEventDispatcher.dispatch({
            type: 'geometryCopy.deactivated'
        });
    }

    /**
     * Handle map click
     * @param {object} event - Map click event
     */
    _onMapClick(event) {
        const position = event.xy;
        const coordinate = this._map.getLonLatFromPixel(position);

        // Query features at this position
        this._queryFeaturesAtPosition(coordinate, position);
    }

    /**
     * Query all visible layers for features at position via WMS GetFeatureInfo
     * @param {object} coordinate - Lon/lat coordinate
     * @param {object} pixelPosition - Pixel position
     */
    _queryFeaturesAtPosition(coordinate, pixelPosition) {
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

        // Get map dimensions and extent from OL2 map
        const mapSize = this._map.getSize();
        const extent = this._map.getExtent();
        const projection = this._map.getProjection();

        const wmsParams = {
            QUERY_LAYERS: layersNames.join(','),
            LAYERS: layersNames.join(','),
            STYLE: layersStyles.join(','),
            INFO_FORMAT: 'text/html',
            CRS: projection,
            BBOX: extent.toBBOX(),
            WIDTH: mapSize.w,
            HEIGHT: mapSize.h,
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

        // Apply to current editing feature
        this._applyGeometryToEditing(featureData.geometry);

        // Visual feedback
        lizMap.addMessage('Geometry copied successfully', 'info', true);

        // Deactivate copy mode
        this.deactivate();
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
     * @param {object} geometry - Geometry to apply
     */
    _applyGeometryToEditing(geometry) {
        if (!mainLizmap.edition) {
            return;
        }

        const geomClone = geometry.clone();
        const feature = new OpenLayers.Feature.Vector(geomClone);

        // Try to apply to draw control layer (for new features being drawn)
        if (mainLizmap.edition.drawControl && mainLizmap.edition.drawControl.layer) {
            mainLizmap.edition.drawControl.layer.removeAllFeatures();
            mainLizmap.edition.drawControl.layer.addFeatures([feature]);
        }

        // Try to apply to modify control layer (for existing features being edited)
        if (mainLizmap.edition.modifyFeatureControl &&
            mainLizmap.edition.modifyFeatureControl.active &&
            mainLizmap.edition.modifyFeatureControl.layer) {
            mainLizmap.edition.modifyFeatureControl.layer.destroyFeatures();
            mainLizmap.edition.modifyFeatureControl.layer.addFeatures([feature]);
        }

        // Try to find editLayer directly (legacy approach)
        const editLayers = this._map.getLayersByName('editLayer');
        if (editLayers && editLayers.length > 0) {
            editLayers[0].removeAllFeatures();
            editLayers[0].addFeatures([feature]);
        }

        // Update geometry field in form if available
        if (lizMap.edition && typeof lizMap.edition.updateGeometryColumnFromFeature === 'function') {
            lizMap.edition.updateGeometryColumnFromFeature(feature);
        }
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
