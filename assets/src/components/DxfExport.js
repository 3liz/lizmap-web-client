/**
 * @module components/DxfExport.js
 * @name DxfExport
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */
import { mainLizmap } from '../modules/Globals.js';
import { html, render } from 'lit-html';
import { transformExtent } from 'ol/proj.js';

/**
 * @class
 * @name DxfExport
 * @augments HTMLElement
 */
export default class DxfExport extends HTMLElement {
    // Constants for scale calculations
    static STANDARD_DPI = 96;
    static INCHES_PER_METER = 39.3701; // More precise value
    static METERS_PER_DEGREE_AT_EQUATOR = 111320; // For geographic coordinates

    constructor() {
        super();
        this._exporting = false;
        this._scale = 'current';
        this._mode = 'SYMBOLLAYERSYMBOLOGY';
        this._force2d = false;
        this._useTitleAsLayername = false;
        this._useMtext = true;
        this._clearHandler = null;
        this._dockHandler = null;
    }

    connectedCallback() {
        this._clearHandler = () => document.querySelector('#button-dxfexport')?.click();
        document.querySelector('.btn-dxfexport-clear')?.addEventListener('click', this._clearHandler);

        this._dockHandler = (e) => {
            if (e.id === 'dxfexport') {
                render(this._template(), this);
            }
        };
        lizMap.events.on({ minidockopened: this._dockHandler });

        render(this._template(), this);
    }

    disconnectedCallback() {
        if (this._clearHandler) {
            document.querySelector('.btn-dxfexport-clear')?.removeEventListener('click', this._clearHandler);
        }
        if (this._dockHandler) {
            lizMap.events.off({ minidockopened: this._dockHandler });
        }
    }

    /**
     * Generates the HTML template for the DXF export component
     * @private
     * @returns {Object} The lit-html template
     */
    _template() {
        const exportableLayers = this._getExportableLayers();
        const currentScale = this._getCurrentMapScale();
        const availableScales = this._getAvailableScales();

        return html`
            <div class="dxfexport-container">
                <p>${lizDict['dxfexport.description'] || 'Export the current map view as a DXF file.'}</p>

                <div class="dxfexport-options">
                    ${this._renderScaleSelector(currentScale, availableScales)}
                    ${this._renderModeSelector()}
                    ${this._renderOptionsCheckboxes()}
                    ${this._renderLayersList(exportableLayers)}
                </div>

                <div class="dxfexport-actions">
                    <button
                        id="dxfexport-launch"
                        class="btn btn-primary ${this._exporting ? 'spinner' : ''}"
                        ?disabled=${this._exporting}
                        @click=${() => this._launch()}>
                        ${lizDict['dxfexport.launch'] || 'Export to DXF'}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Renders the scale selector
     * @private
     */
    _renderScaleSelector(currentScale, availableScales) {
        return html`
            <div class="form-group">
                <label for="dxfexport-scale">${lizDict['dxfexport.scale'] || 'Scale'}</label>
                <select id="dxfexport-scale" class="form-control"
                        @change=${(e) => this._handleScaleChange(e)}>
                    ${currentScale ? html`
                        <option value="current" ?selected=${this._scale === 'current'}>
                            ${lizDict['dxfexport.scale.current'] || 'Current'} (1:${currentScale.toLocaleString()})
                        </option>
                    ` : ''}
                    ${availableScales.map(scale => html`
                        <option value=${scale} ?selected=${this._scale === scale}>
                            1:${scale.toLocaleString()}
                        </option>
                    `)}
                </select>
            </div>
        `;
    }

    /**
     * Renders the mode selector
     * @private
     */
    _renderModeSelector() {
        return html`
            <div class="form-group">
                <label for="dxfexport-mode">${lizDict['dxfexport.mode'] || 'Export mode'}</label>
                <select id="dxfexport-mode" class="form-control"
                        @change=${(e) => { this._mode = e.target.value; }}>
                    <option value="SYMBOLLAYERSYMBOLOGY" ?selected=${this._mode === 'SYMBOLLAYERSYMBOLOGY'}>
                        ${lizDict['dxfexport.mode.symbollayer'] || 'Symbol layer symbology'}
                    </option>
                    <option value="FEATURESYMBOLOGY" ?selected=${this._mode === 'FEATURESYMBOLOGY'}>
                        ${lizDict['dxfexport.mode.feature'] || 'Feature symbology'}
                    </option>
                    <option value="NOSYMBOLOGY" ?selected=${this._mode === 'NOSYMBOLOGY'}>
                        ${lizDict['dxfexport.mode.none'] || 'No symbology'}
                    </option>
                </select>
            </div>
        `;
    }

    /**
     * Renders the options checkboxes
     * @private
     */
    _renderOptionsCheckboxes() {
        return html`
            <div class="form-group">
                <label class="checkbox">
                    <input type="checkbox" ?checked=${this._force2d}
                           @change=${(e) => { this._force2d = e.target.checked; }}>
                    ${lizDict['dxfexport.force2d'] || 'Force 2D (enables line widths)'}
                </label>
            </div>
            <div class="form-group">
                <label class="checkbox">
                    <input type="checkbox" ?checked=${this._useMtext}
                           @change=${(e) => { this._useMtext = e.target.checked; }}>
                    ${lizDict['dxfexport.use_mtext'] || 'Use MTEXT for labels'}
                </label>
            </div>
            <div class="form-group">
                <label class="checkbox">
                    <input type="checkbox" ?checked=${this._useTitleAsLayername}
                           @change=${(e) => { this._useTitleAsLayername = e.target.checked; }}>
                    ${lizDict['dxfexport.use_title_as_layername'] || 'Use layer titles as DXF layer names'}
                </label>
            </div>
        `;
    }

    /**
     * Renders the layers list
     * @private
     */
    _renderLayersList(exportableLayers) {
        if (exportableLayers.length === 0) {
            return html`
                <div class="alert alert-warning" style="font-size: 0.9em; margin-top: 10px;">
                    <i class="icon-warning-sign"></i>
                    ${lizDict['dxfexport.no_wfs_layers'] || 'No WFS-enabled layers available for export.'}
                </div>
            `;
        }

        return html`
            <details class="dxfexport-layers" style="margin-top: 10px; border: 1px solid #ddd; border-radius: 4px; padding: 8px;">
                <summary style="cursor: pointer; font-weight: bold; user-select: none;">
                    <i class="icon-list"></i> ${exportableLayers.length}
                    ${lizDict['dxfexport.layers_to_export'] || 'layers will be exported'}
                </summary>
                <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 0.9em; max-height: 200px; overflow-y: auto;">
                    ${exportableLayers.map(layer => html`
                        <li title="${layer.name}">${layer.title}</li>
                    `)}
                </ul>
            </details>
        `;
    }

    /**
     * Handles scale selection change
     * @private
     */
    _handleScaleChange(event) {
        const value = event.target.value;
        this._scale = value === 'current' ? 'current' : parseInt(value, 10);
        render(this._template(), this);
    }

    /**
     * Gets WFS layer names from configuration
     * @private
     * @returns {Set<string>} Set of WFS layer names
     */
    _getWfsLayerNames() {
        const wfsFeatureTypes = mainLizmap.initialConfig?.vectorLayerFeatureTypeList || [];
        return new Set(wfsFeatureTypes.map(ft => ft.Name));
    }

    /**
     * Gets the list of layers that will be exported
     * @private
     * @returns {Array<{name: string, title: string}>} Array of exportable layers
     */
    _getExportableLayers() {
        const layers = [];
        const wfsLayerNames = this._getWfsLayerNames();

        // Check base layer
        const selectedBaseLayer = mainLizmap.state.baseLayers.selectedBaseLayer;
        if (selectedBaseLayer?.hasItemState &&
            selectedBaseLayer.itemState.wmsName &&
            selectedBaseLayer.layerConfig?.typename !== undefined) {
            layers.push({
                name: selectedBaseLayer.itemState.wmsName,
                title: selectedBaseLayer.layerConfig.title || selectedBaseLayer.itemState.wmsName
            });
        }

        // Add visible WFS-enabled layers
        mainLizmap.state.rootMapGroup.findExplodedMapLayers()
            .filter(layer => layer.visibility)
            .forEach(layer => {
                const layerName = layer.wmsName || layer.name;
                if (wfsLayerNames.has(layerName)) {
                    layers.push({
                        name: layerName,
                        title: layer.layerConfig?.title || layer.name
                    });
                }
            });

        return layers;
    }

    /**
     * Calculates the current map scale with high precision
     * Uses proper geodesic calculations for geographic coordinates
     * @private
     * @returns {number|null} The current map scale, or null if it cannot be calculated
     */
    _getCurrentMapScale() {
        try {
            const view = mainLizmap.map.getView();
            const resolution = view.getResolution();
            const units = view.getProjection().getUnits();

            if (units === 'm') {
                // Projected coordinates - straightforward calculation
                return Math.round(resolution * DxfExport.INCHES_PER_METER * DxfExport.STANDARD_DPI);
            }

            if (units === 'degrees') {
                // Geographic coordinates - use precise geodesic calculation
                const center = view.getCenter();
                const latitude = center[1] * Math.PI / 180; // Convert to radians

                // More precise calculation using WGS84 ellipsoid parameters
                const metersPerDegree = DxfExport.METERS_PER_DEGREE_AT_EQUATOR * Math.cos(latitude);
                const scale = resolution * metersPerDegree * DxfExport.INCHES_PER_METER * DxfExport.STANDARD_DPI;

                return Math.round(scale);
            }

            return null;
        } catch (error) {
            console.warn('Could not calculate current map scale:', error);
            return null;
        }
    }

    /**
     * Gets available scales from map configuration
     * @private
     * @returns {number[]} Array of available scales
     */
    _getAvailableScales() {
        const scales = mainLizmap.config?.options?.mapScales || [
            1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000
        ];
        return Array.from(scales);
    }

    /**
     * Shows a success message
     * @private
     */
    _showSuccess() {
        this._exporting = false;
        render(this._template(), this);

        document.querySelector('#message .dxfexport-in-progress button')?.click();
        mainLizmap._lizmap3.addMessage(
            lizDict['dxfexport.success'] || 'DXF export completed successfully.',
            'info',
            true
        ).addClass('dxfexport-success');
    }

    /**
     * Shows an error message
     * @private
     * @param {string} message - Error message
     * @param {Error|Object} [error] - Optional error object
     */
    _showError(message, error = null) {
        let displayMessage = message || lizDict['dxfexport.error'] || 'Error during DXF export';

        if (error) {
            console.error('DXF export error:', error);

            if (error.message) {
                displayMessage += `: ${error.message}`;
            } else if (error.status) {
                const errorMessages = {
                    404: lizDict['dxfexport.error.notfound'] || 'Export service not found.',
                    500: lizDict['dxfexport.error.server'] || 'Server error during export.',
                    503: lizDict['dxfexport.error.unavailable'] || 'Export service temporarily unavailable.'
                };
                displayMessage = errorMessages[error.status] || `${displayMessage} (HTTP ${error.status})`;
            }
        }

        this._exporting = false;
        render(this._template(), this);

        mainLizmap._lizmap3.addMessage(displayMessage, 'danger', true).addClass('dxfexport-error');
    }

    /**
     * Builds FORMAT_OPTIONS string for QGIS Server
     * @private
     * @returns {string} Semicolon-separated FORMAT_OPTIONS
     */
    _buildFormatOptions() {
        const options = [`MODE:${this._mode}`];

        // Add scale
        const exportScale = this._scale === 'current' ? this._getCurrentMapScale() : this._scale;
        if (exportScale) {
            options.push(`SCALE:${exportScale}`);
        }

        // Add optional parameters
        if (this._force2d) options.push('FORCE_2D:TRUE');
        if (!this._useMtext) options.push('NO_MTEXT:TRUE');
        if (this._useTitleAsLayername) options.push('USE_TITLE_AS_LAYERNAME:TRUE');

        return options.join(';');
    }

    /**
     * Collects layer information for export
     * @private
     * @returns {Object} Object containing layers, styles, opacities, and tokens
     */
    _collectLayerInformation() {
        const result = {
            layers: [],
            styles: [],
            opacities: [],
            filterTokens: [],
            selectionTokens: [],
            legendOn: [],
            legendOff: []
        };

        const wfsLayerNames = this._getWfsLayerNames();

        // Add base layer if compatible
        const selectedBaseLayer = mainLizmap.state.baseLayers.selectedBaseLayer;
        if (selectedBaseLayer?.hasItemState &&
            selectedBaseLayer.itemState.wmsName &&
            selectedBaseLayer.layerConfig) {
            result.layers.push(selectedBaseLayer.itemState.wmsName);
            result.styles.push(selectedBaseLayer.itemState.wmsSelectedStyleName || '');

            const baseOpacity = selectedBaseLayer.itemState.opacity || 1;
            const configOpacity = selectedBaseLayer.layerConfig.opacity || 1;
            result.opacities.push(Math.round(255 * baseOpacity * configOpacity));
        }

        // Add visible WFS-enabled layers
        mainLizmap.state.rootMapGroup.findExplodedMapLayers()
            .filter(layer => {
                const layerName = layer.wmsName || layer.name;
                return layer.visibility && wfsLayerNames.has(layerName);
            })
            .forEach(layer => {
                const params = layer.wmsParameters;

                result.layers.push(params.LAYERS);
                result.styles.push(params.STYLES);

                const opacity = layer.layerConfig?.opacity
                    ? layer.calculateTotalOpacity() * layer.layerConfig.opacity
                    : layer.calculateTotalOpacity();
                result.opacities.push(Math.round(255 * opacity));

                // Collect tokens
                if (params.FILTERTOKEN) result.filterTokens.push(params.FILTERTOKEN);
                if (params.SELECTIONTOKEN) result.selectionTokens.push(params.SELECTIONTOKEN);
                if (params.LEGEND_ON) result.legendOn.push(params.LEGEND_ON);
                if (params.LEGEND_OFF) result.legendOff.push(params.LEGEND_OFF);
            });

        return result;
    }

    /**
     * Builds WMS GetMap parameters for DXF export
     * @private
     * @returns {Object} WMS parameters object
     */
    _buildWmsParameters() {
        // Get map extent and projection
        const mapExtent = mainLizmap.map.getView().calculateExtent(mainLizmap.map.getSize());
        const mapProjection = mainLizmap.config.options.projection.ref;
        const projectProjection = mainLizmap.config.options.qgisProjectProjection.ref || mapProjection;

        // Transform extent if necessary
        const extent = mapProjection !== projectProjection
            ? transformExtent(mapExtent, mapProjection, projectProjection)
            : mapExtent;

        const size = mainLizmap.map.getSize();

        // Build base parameters
        const params = {
            SERVICE: 'WMS',
            REQUEST: 'GetMap',
            VERSION: '1.3.0',
            FORMAT: 'application/dxf',
            TRANSPARENT: true,
            CRS: projectProjection,
            BBOX: extent.join(','),
            WIDTH: size[0],
            HEIGHT: size[1],
            FORMAT_OPTIONS: this._buildFormatOptions()
        };

        // Add layer information
        const layerInfo = this._collectLayerInformation();
        params.LAYERS = layerInfo.layers.join(',');
        params.STYLES = layerInfo.styles.join(',');
        params.OPACITIES = layerInfo.opacities.join(',');

        // Add optional tokens
        if (layerInfo.filterTokens.length) params.FILTERTOKEN = layerInfo.filterTokens.join(';');
        if (layerInfo.selectionTokens.length) params.SELECTIONTOKEN = layerInfo.selectionTokens.join(';');
        if (layerInfo.legendOn.length) params.LEGEND_ON = layerInfo.legendOn.join(';');
        if (layerInfo.legendOff.length) params.LEGEND_OFF = layerInfo.legendOff.join(';');

        // Generate and add filename
        const filename = this._generateFilename();
        params.FILE_NAME = filename;

        return { params, filename };
    }

    /**
     * Generates a filename for the DXF export
     * @private
     * @returns {string} Generated filename
     */
    _generateFilename() {
        let projectName = globalThis['lizUrls']?.params?.project || 'map-export';
        projectName = projectName.replace(/^qgis_server_wms_map_[a-z]+_/i, '');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        return `${projectName}_${timestamp}.dxf`;
    }

    /**
     * Downloads a DXF file via XHR
     * @private
     * @param {string} url - Service URL
     * @param {Object} parameters - WMS parameters
     * @param {string} filename - Output filename
     */
    _downloadDxfFile(url, parameters, filename) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = () => {
            if (xhr.status === 200) {
                const type = xhr.getResponseHeader('Content-Type') || 'application/dxf';
                const blob = new File([xhr.response], filename, { type });
                const downloadUrl = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                a.dispatchEvent(new MouseEvent('click'));

                setTimeout(() => URL.revokeObjectURL(downloadUrl), 100);
                this._showSuccess();
            } else {
                this._showError(lizDict['dxfexport.error'], { status: xhr.status });
            }
        };

        xhr.onerror = () => {
            this._showError(lizDict['dxfexport.error'], { message: 'Network error' });
        };

        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send($.param(parameters, true));
    }

    /**
     * Launches the DXF export process
     * @private
     */
    _launch() {
        this._exporting = true;
        render(this._template(), this);

        try {
            // Validate visible layers
            const visibleLayers = mainLizmap.state.rootMapGroup.findExplodedMapLayers()
                .filter(layer => layer.visibility);
            const hasBaseLayer = mainLizmap.state.baseLayers.selectedBaseLayer?.hasItemState;

            if (visibleLayers.length === 0 && !hasBaseLayer) {
                this._showError(lizDict['dxfexport.no_visible_layers'] || 'No visible layers to export.');
                return;
            }

            // Build parameters and execute export
            const { params, filename } = this._buildWmsParameters();

            mainLizmap._lizmap3.addMessage(
                lizDict['dxfexport.started'] || 'DXF export started...',
                'info',
                true
            ).addClass('dxfexport-in-progress');

            this._downloadDxfFile(mainLizmap.serviceURL, params, filename);

        } catch (error) {
            this._showError(lizDict['dxfexport.error'], error);
        }
    }
}
