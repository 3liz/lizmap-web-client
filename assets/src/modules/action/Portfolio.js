/**
 * @module action/Portfolio.js
 * @name Portfolio
 * @copyright 2026 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { mainLizmap } from '../Globals.js';
import { FileDownloader } from '../Utils.js';
import { ADJUSTED_DPI } from '../../utils/Constants.js';
import { ThemeConfig } from '../config/Theme.js'
import { PortfolioDrawingGeometries, FolioZoomMethods, PortfolioConfig } from '../config/Portfolio.js'
import { MapGroupState, MapLayerState } from '../state/MapLayer.js'
import { BaseLayersState, BaseLayerState } from '../state/BaseLayer.js'

import WKT from 'ol/format/WKT.js';
import { transformExtent } from 'ol/proj.js';

const INCHES_PER_METER = 1000 / 25.4;
const WEB_DPI = 72;

/**
 * Get the print scales from the map resolutions.
 * @function
 * @returns {number[]} The print scales
 */
function getPrintScales() {
    return mainLizmap.map.getView().getResolutions()
        .map((r) => {return Math.round(r * INCHES_PER_METER * ADJUSTED_DPI);})
}

/**
 * Get the map id of the print template
 * @param {object} printTemplate a print template configuration
 * @returns {null|string} The first map id not overview in the print template
 */
function getMapId(printTemplate) {
    for (const map of printTemplate.maps) {
        if(map?.overviewMap){
            continue;
        }
        return map.id;
    }
    return null;
}

/**
 * Get the print template by name
 * @param {string} name the print template title
 * @returns {undefined|object} the print template configuration
 */
function getPrintTemplate(name) {
    return mainLizmap.config?.printTemplates.filter(template => template.title === name)?.[0];
}

/**
 * Get highlight print parameters
 * @param {string} mapProjection The map projection
 * @param {string} projectProjection The project projection
 * @returns {object} The highlight print parameters
 */
function getHighlightPrint(mapProjection, projectProjection) {
    const formatWKT = new WKT();
    const highlightGeom = [];
    const highlightSymbol = [];
    const highlightLabelString = [];
    const highlightLabelSize = [];
    const highlightLabelBufferColor = [];
    const highlightLabelBufferSize = [];
    const highlightLabelRotation = [];
    const highlightLabelHorizontal = [];
    const highlightLabelVertical = [];

    mainLizmap.digitizing.featureDrawn?.forEach((featureDrawn, index) => {

        // Translate circle coords to WKT
        if (featureDrawn.getGeometry().getType() === 'Circle') {
            const geomReproj = featureDrawn.getGeometry().clone().transform(mapProjection, projectProjection);
            const center = geomReproj.getCenter();
            const radius = geomReproj.getRadius();

            const circleWKT = `CURVEPOLYGON(CIRCULARSTRING(
                ${center[0] - radius} ${center[1]},
                ${center[0]} ${center[1] + radius},
                ${center[0] + radius} ${center[1]},
                ${center[0]} ${center[1] - radius},
                ${center[0] - radius} ${center[1]}))`;

            highlightGeom.push(circleWKT);
        } else {
            highlightGeom.push(formatWKT.writeFeature(featureDrawn, {
                featureProjection: mapProjection,
                dataProjection: projectProjection
            }));
        }

        highlightSymbol.push(mainLizmap.digitizing.getFeatureDrawnSLD(index));

        // Labels
        const label = featureDrawn.get('text') ?? ' ';
        highlightLabelString.push(label);
        // Font size is 10px by default (https://github.com/openlayers/openlayers/blob/v8.1.0/src/ol/style/Text.js#L30)
        let scale = featureDrawn.get('scale') ?? 1;
        if (scale) {
            scale = scale * 10;
        }
        highlightLabelSize.push(scale);

        highlightLabelBufferColor.push('#FFFFFF');
        highlightLabelBufferSize.push(1.5);

        highlightLabelRotation.push(featureDrawn.get('rotation') ?? 0);
        highlightLabelHorizontal.push('center');
        highlightLabelVertical.push('half');
    });

    return {
        geom: highlightGeom,
        symbol: highlightSymbol,
        label: highlightLabelString,
        labelSize: highlightLabelSize,
        labelBufferColor: highlightLabelBufferColor,
        labelBufferSize: highlightLabelBufferSize,
        labelRotation: highlightLabelRotation,
        labelHorizontal: highlightLabelHorizontal,
        labelVertical: highlightLabelVertical,
    }
}

/**
 * Get map layers in group from theme config
 * @param {MapGroupState} mapGroup The map group
 * @param {ThemeConfig} theme The theme config
 * @returns {MapLayerState[]} The map layers
 */
function getLayersInMapGroupFromTheme(mapGroup, theme) {
    const checkedGroupNodes = theme.checkedGroupNodes;

    // Helper function to check if group is in list
    const isInList = (nodeList, wmsName, name) => {
        // First check for exact matches (full path or simple name)
        if (nodeList.includes(wmsName) || nodeList.includes(name)) {
            return true;
        }

        // For nested groups: check if this group matches the last component of a path
        // Example: if checkedGroupNodes has "ALKIS/Beschriftung",
        // then the "Beschriftung" subgroup should match, but "ALKIS" parent should NOT
        for (const nodePath of nodeList) {
            // Skip paths without separator (already handled by exact match above)
            if (!nodePath.includes('/')) {
                continue;
            }

            // Get the last component of the path
            const lastPart = nodePath.split('/').pop();

            // Only match if wmsName or name equals the LAST part
            if (wmsName === lastPart || name === lastPart) {
                return true;
            }
        }

        return false;
    };

    // Get layers from map group, recursively for nested groups
    let layers = [];
    for (const child of mapGroup.children.slice()) {
        if(child.type !== 'layer' && child.type !== 'group'){
            continue;
        }

        if (child.type == 'group') {
            if (!isInList(checkedGroupNodes, child.wmsName, child.name)) {
                continue;
            }
            layers = layers.concat(getLayersInMapGroupFromTheme(child, theme));
        } else {
            layers.push(child);
        }
    }

    // Return filtered layers
    const layerThemeIds = theme.layerIds;
    return layers.filter(mapLayer => {
        // Group as layer
        if (mapLayer.itemState.type === 'group' && mapLayer.itemState.groupAsLayer) {
            return isInList(checkedGroupNodes, mapLayer.wmsName, mapLayer.name);
        }
        // others
        return layerThemeIds.indexOf(mapLayer.itemState.id) !== -1
    });
}

/**
 * Get the base layer from theme config
 * @param {BaseLayersState} baseLayers The base layers
 * @param {ThemeConfig} theme The theme config
 * @returns {BaseLayerState} The base layer
 */
function getBaseLayerFromTheme(baseLayers, theme) {
    for (const baseLayer of baseLayers) {
        if (!baseLayer.layerConfig) {
            continue;
        }
        if (theme.layerIds.indexOf(baseLayer.layerConfig.id) !== -1) {
            return baseLayer;
        }
    }
    return null;
}

/**
 * The layers and styles from theme config
 * @param {string} themeName The theme name
 * @returns {Array<{layer:string, style:string}>} list of layer and style
 */
function getLayersStylesFromTheme(themeName) {
    const theme = mainLizmap.initialConfig.themes.getThemeConfigByThemeName(themeName);

    const mapLayers = getLayersInMapGroupFromTheme(mainLizmap.state.rootMapGroup, theme);
    const baseLayer = getBaseLayerFromTheme(mainLizmap.state.baseLayers.getBaseLayers(), theme);
    if (baseLayer) {
        mapLayers.push(baseLayer);
    }

    const layerThemeConfigs = theme.layerConfigs;
    return mapLayers.map(mapLayer => {
        const layerThemeConfig = layerThemeConfigs.filter(ltc => ltc.layerId === mapLayer.itemState.id)?.[0];
        if (layerThemeConfig == null) {
            throw new Error(`Layer ${mapLayer.itemState.id} not found in theme ${themeName}`);
        }
        return {
            layer: mapLayer.itemState.wmsName,
            style: layerThemeConfig.style,
        }
    }).reverse();
}

/**
 * Get the GetPrint request parameters
 * @param {string} template the template name/title
 * @param {string} mapId The map id
 * @param {string} crs The print projection
 * @param {number[]} extent The print extent
 * @param {string} scale The print scale
 * @param {string} theme The theme name
 * @param {object} highlightPrint The highlight print parameters
 * @returns {object} The GetPrint request parameters
 */
function getWmsGetPrintParameters(template, mapId, crs, extent, scale, theme, highlightPrint) {
    const wmsParams = {
        SERVICE: 'WMS',
        REQUEST: 'GetPrint',
        VERSION: '1.3.0',
        FORMAT: 'application/pdf',
        TRANSPARENT: true,
        CRS: crs,
        DPI: 100,
        TEMPLATE: template,
    };

    wmsParams[mapId + ':EXTENT'] = extent.join(',');
    wmsParams[mapId + ':SCALE'] = scale;

    const layersStyles = getLayersStylesFromTheme(theme);
    const printLayers = layersStyles.map(lsc => lsc.layer);
    const styleLayers = layersStyles.map(lsc => lsc.style);
    wmsParams[mapId + ':LAYERS'] = printLayers.join(',');
    wmsParams[mapId + ':STYLES'] = styleLayers.join(',');

    wmsParams[mapId + ':HIGHLIGHT_GEOM'] = highlightPrint.geom.join(';');
    wmsParams[mapId + ':HIGHLIGHT_SYMBOL'] = highlightPrint.symbol.join(';');

    if (!highlightPrint.label.every(label => label === ' ')){
        wmsParams[mapId + ':HIGHLIGHT_LABELSTRING'] = highlightPrint.label.join(';');
        wmsParams[mapId + ':HIGHLIGHT_LABELSIZE'] = highlightPrint.labelSize.join(';');
        wmsParams[mapId + ':HIGHLIGHT_LABELBUFFERCOLOR'] = highlightPrint.labelBufferColor.join(';');
        wmsParams[mapId + ':HIGHLIGHT_LABELBUFFERSIZE'] = highlightPrint.labelBufferSize.join(';');
        wmsParams[mapId + ':HIGHLIGHT_LABEL_ROTATION'] = highlightPrint.labelRotation.join(';');
        wmsParams[mapId + ':HIGHLIGHT_LABEL_HORIZONTAL_ALIGNMENT'] = highlightPrint.labelHorizontal.join(';');
        wmsParams[mapId + ':HIGHLIGHT_LABEL_VERTICAL_ALIGNMENT'] = highlightPrint.labelVertical.join(';');
    }

    return wmsParams;
}

class FolioDownloader extends FileDownloader {
    /**
     * FileDownloader construtor
     * @param {string} url        - A string or any other object with a stringifier — including a URL object — that provides the URL of the resource to send the request to.
     * @param {object} parameters - Parameters that will be serialize as a Query string
     * @param {string} theme - Folio theme
     * @param {string} scale - Folio scale
     */
    constructor(url, parameters, theme, scale) {
        super(url, parameters);
        this._theme = theme;
        this._scale = scale;
    }

    /**
     * Format a file name to be used as a download file name / can be replaced by a child class
     * @param {string} filename the file name to format
     * @returns {string} the file name formated
     */
    formatFileName(filename) {
        if (!filename) {
            return filename;
        }
        filenameParts = filename.split('.');
        filenameParts[0] += '-'+this._theme;
        filenameParts[0] += '-'+this._scale;
        return filenameParts.join('.');
    }
}

/**
 * Run a portfolio
 * @param {PortfolioConfig} portfolio The porfolio to run
 */
export async function runPortfolio(portfolio) {
    const mapProjection = mainLizmap.config.options.projection.ref;
    const projectProjection = mainLizmap.config.options.qgisProjectProjection.ref ? mainLizmap.config.options.qgisProjectProjection.ref : mapProjection;

    const highlightPrint = getHighlightPrint(mapProjection, projectProjection);

    const downloaders = [];

    if (portfolio.drawingGeometry == PortfolioDrawingGeometries.Point) {
        const center = mainLizmap.digitizing.featureDrawn[0].getGeometry().getCoordinates();
        for (const folio of portfolio.folios) {
            const printTemplate = getPrintTemplate(folio.layout);
            const mapId = getMapId(printTemplate);
            const templateMap = printTemplate.maps.filter(map => map.id == mapId)?.[0];
            const maskWidth = templateMap?.width / 1000 * INCHES_PER_METER * WEB_DPI;
            const maskHeight = templateMap?.height / 1000 * INCHES_PER_METER * WEB_DPI;

            const deltaX = (maskWidth * folio.fixedScale) / 2 / INCHES_PER_METER / WEB_DPI;
            const deltaY = (maskHeight * folio.fixedScale) / 2 / INCHES_PER_METER / WEB_DPI;

            let extent = [center[0] - deltaX, center[1] - deltaY, center[0] + deltaX, center[1] + deltaY];
            if(projectProjection != mapProjection){
                extent = transformExtent(extent, mapProjection, projectProjection);
            }

            const downloader = new FolioDownloader(
                mainLizmap.serviceURL,
                getWmsGetPrintParameters(
                    folio.layout,
                    mapId,
                    projectProjection,
                    extent,
                    folio.fixedScale,
                    folio.theme,
                    highlightPrint,
                ),
                folio.theme,
                folio.fixedScale,
            );
            downloaders.push(downloader);
        }
    } else {

        for (const folio of portfolio.folios) {
            let extent = mainLizmap.digitizing.featureDrawn[0].getGeometry().getExtent();
            let resolution = mainLizmap.map.getView().getResolutionForExtent(extent);

            const printTemplate = getPrintTemplate(folio.layout);
            const mapId = getMapId(printTemplate);
            const templateMap = printTemplate.maps.filter(map => map.id == mapId)?.[0];
            const maskWidth = templateMap?.width / 1000 * INCHES_PER_METER * WEB_DPI;
            const maskHeight = templateMap?.height / 1000 * INCHES_PER_METER * WEB_DPI;
            const center = new Array(
                extent[0] + (extent[2] - extent[0])/2,
                extent[1] + (extent[3] - extent[1])/2,
            );

            if (folio.zoomMethod == FolioZoomMethods.Margin) {
                const margin = folio.margin / 100.0;
                const width = (extent[2] - extent[0]) * (1 + margin);
                const height = (extent[3] - extent[1]) * (1 + margin);

                extent[0] = center[0] - width / 2;
                extent[1] = center[1] - height / 2;
                extent[2] = center[0] + width / 2;
                extent[3] = center[1] + height / 2;

                resolution = mainLizmap.map.getView().getResolutionForExtent(extent);
            }

            let scale = Math.round(resolution * INCHES_PER_METER * ADJUSTED_DPI);

            if (folio.zoomMethod == FolioZoomMethods.BestScale) {
                scale = getPrintScales().filter(s => s >= scale).slice(-1)?.[0];
            }

            const deltaX = (maskWidth * scale) / 2 / INCHES_PER_METER / WEB_DPI;
            const deltaY = (maskHeight * scale) / 2 / INCHES_PER_METER / WEB_DPI;

            extent = [center[0] - deltaX, center[1] - deltaY, center[0] + deltaX, center[1] + deltaY];
            if(projectProjection != mapProjection){
                extent = transformExtent(extent, mapProjection, projectProjection);
            }

            const downloader = new FolioDownloader(
                mainLizmap.serviceURL,
                getWmsGetPrintParameters(
                    folio.layout,
                    mapId,
                    projectProjection,
                    extent,
                    scale,
                    folio.theme,
                    highlightPrint,
                ),
                folio.theme,
                scale,
            );
            downloaders.push(downloader);
        }
    }

    //return;
    for ( const downloader of downloaders ) {
        try {
            await downloader.fetch();
        } catch(e) {
            console.error(e);
        }
    }
}
