/**
 * @module modules/State.js
 * @name State
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */
import { mainEventDispatcher } from '../modules/Globals.js';
import Digitizing from './Digitizing.js';
import {Config} from './Config.js';

import {
    LinearRing,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
} from 'ol/geom.js';

import * as olExtent from 'ol/extent.js';
import GML3 from 'ol/format/GML3.js';
import GeoJSON from 'ol/format/GeoJSON.js';

import WFS from '../modules/WFS.js';

import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import { Feature } from 'ol';

/**
 * @class
 * @name SelectionTool
 */
export default class SelectionTool {

    /**
     * Create a selection tool instance
     * @param {Map}        map        - OpenLayers map
     * @param {Digitizing} digitizing - The digitizing module
     * @param {Config}     initialConfig - The Lizmap initial config
     * @param {object}     lizmap3    - The old lizmap object
     */
    constructor(map, digitizing, initialConfig, lizmap3) {

        this._map = map;
        this._digitizing = digitizing;
        this._initialConfig = initialConfig;
        this._lizmap3 = lizmap3;

        this._layers = [];
        this._allFeatureTypeSelected = [];

        this._bufferValue = 0;

        this._bufferLayer = new VectorLayer({
            source: new VectorSource({wrapX: false}),
        });
        this._bufferLayer.setProperties({
            name: 'LizmapSelectionToolBufferLayer'
        });

        this._map.addToolLayer(this._bufferLayer);

        this._geomOperator = 'intersects';

        this._newAddRemove = ['new', 'add', 'remove'];
        this._newAddRemoveSelected = this._newAddRemove[0];

        // Verifying WFS layers
        const featureTypes = initialConfig.vectorLayerFeatureTypeList;
        if (featureTypes.length === 0) {
            if (document.getElementById('button-selectiontool')) {
                document.getElementById('button-selectiontool').parentNode.remove();
            }
            return false;
        }

        const config = this._lizmap3.config;
        const layersSorted = [];

        for (const attributeLayerName in config.attributeLayers) {
            if (config.attributeLayers.hasOwnProperty(attributeLayerName)) {
                for (const featureType of featureTypes) {
                    const lname = this._lizmap3.getNameByTypeName(featureType.Name);

                    if (attributeLayerName === lname
                        && lname in config.layers
                        && config.layers[lname]['geometryType'] != 'none'
                        && config.layers[lname]['geometryType'] != 'unknown') {

                        layersSorted[config.attributeLayers[attributeLayerName].order] = {
                            name: lname,
                            title: config.layers[lname].title
                        };
                    }
                }
            }
        }

        for (const params of layersSorted) {
            if (params !== undefined) {
                this._layers.push(params);
                this._allFeatureTypeSelected.push(params.name);
            }
        }

        if (this._layers.length === 0) {
            if (document.getElementById('button-selectiontool')) {
                document.getElementById('button-selectiontool').parentNode.remove();
            }
            return false;
        }

        // Listen to digitizing tool to query a selection when tool is active and a feature (buffered or not) is drawn
        mainEventDispatcher.addListener(
            () => {
                if(this.isActive && this._digitizing.featureDrawn){
                    // We only handle a single drawn feature currently
                    if (this._digitizing.featureDrawn.length > 1){
                        // Erase the previous feature
                        this._digitizing._eraseFeature(this._digitizing.featureDrawn[0]);
                        this._digitizing.saveFeatureDrawn();
                    }

                    let selectionFeature = this._digitizing.featureDrawn[0];

                    if (selectionFeature) {
                        // Handle buffer if any
                        this._bufferLayer.getSource().clear();
                        if (this._bufferValue > 0) {
                            Promise.all([
                                import(/* webpackChunkName: 'OLparser' */ 'jsts/org/locationtech/jts/io/OL3Parser.js'),
                                import(/* webpackChunkName: 'BufferOp' */ 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js')
                            ]).then(([{ default: OLparser }, { default: BufferOp }]) => {
                                const parser = new OLparser();
                                parser.inject(
                                    Point,
                                    LineString,
                                    LinearRing,
                                    Polygon,
                                    MultiPoint,
                                    MultiLineString,
                                    MultiPolygon
                                );

                                // Convert the OpenLayers geometry to a JSTS geometry
                                const jstsGeom = parser.read(selectionFeature.getGeometry());

                                // Create a buffer
                                const jstsbBufferedGeom = BufferOp.bufferOp(jstsGeom, this._bufferValue);

                                const bufferedFeature = new Feature();
                                bufferedFeature.setGeometry(parser.write(jstsbBufferedGeom));

                                this._bufferLayer.getSource().addFeature(bufferedFeature);

                                selectionFeature = this.featureDrawnBuffered;

                                for (const featureType of this.allFeatureTypeSelected) {
                                    this.selectLayerFeaturesFromSelectionFeature(featureType, selectionFeature, this._geomOperator);
                                }
                            });
                        } else {
                            for (const featureType of this.allFeatureTypeSelected) {
                                this.selectLayerFeaturesFromSelectionFeature(featureType, selectionFeature, this._geomOperator);
                            }
                        }
                    }
                }
            },
            ['digitizing.featureDrawn', 'digitizing.editionEnds']
        );

        // Change buffer visibility on digitizing.visibility event
        mainEventDispatcher.addListener(
            () => {
                this._bufferLayer.setVisible(this._digitizing.visibility);
            },
            ['digitizing.visibility']
        );

        // Erase buffer on digitizing.erase event
        mainEventDispatcher.addListener(
            () => {
                this._bufferLayer.getSource().clear();
            },
            ['digitizing.erase']
        );

        this._lizmap3.events.on({
            minidockclosed: (event) => {
                if (event.id === 'selectiontool'){
                    this._digitizing.toolSelected = 'deactivate';
                }
            }
        });
    }

    /**
     * Is selection tool active or not
     * @todo active state should be set on UI's events
     * @readonly
     * @memberof SelectionTool
     * @returns {boolean} true if active, false otherwise
     */
    get isActive() {
        const isActive = document.getElementById('button-selectiontool')?.parentElement?.classList?.contains('active');
        return isActive ? true : false;
    }

    get layers() {
        return this._layers;
    }

    get bufferLayer() {
        return this._bufferLayer;
    }

    get bufferValue() {
        return this._bufferValue;
    }

    set bufferValue(bufferValue) {
        this._bufferValue = isNaN(bufferValue) ? 0 : bufferValue;

        mainEventDispatcher.dispatch('selection.bufferValue');
    }

    get featureDrawnBuffered() {
        const features = this._bufferLayer.getSource().getFeatures();
        if (features.length) {
            return features[0];
        }
        return null;
    }

    // List of WFS format
    get exportFormats() {
        return this._initialConfig.vectorLayerResultFormat.filter(
            format => !['GML2', 'GML3', 'GEOJSON'].includes(format.toUpperCase())
        );
    }

    // Selection is exportable if :
    // - one single feature type is selected in list
    // - there is at least one feature selected
    get isExportable(){
        return (this._allFeatureTypeSelected.length === 1 && this.selectedFeaturesCount);
    }

    get selectedFeaturesCount() {
        let count = 0;

        for (const featureType of this.allFeatureTypeSelected) {
            if (featureType in this._lizmap3.config.layers &&
              'selectedFeatures' in this._lizmap3.config.layers[featureType]
              && this._lizmap3.config.layers[featureType]['selectedFeatures'].length) {
                count += this._lizmap3.config.layers[featureType]['selectedFeatures'].length;
            }
        }

        return count;
    }

    get filterActive() {
        return this._lizmap3.lizmapLayerFilterActive;
    }

    set filterActive(active) {
        this._lizmap3.lizmapLayerFilterActive = active;
    }

    get filteredFeaturesCount() {
        let count = 0;

        for (const featureType of this.allFeatureTypeSelected) {
            if (featureType in this._lizmap3.config.layers &&
              'filteredFeatures' in this._lizmap3.config.layers[featureType]) {
                count += this._lizmap3.config.layers[featureType]['filteredFeatures'].length;
            }
        }

        return count;
    }

    get allFeatureTypeSelected() {
        return this._allFeatureTypeSelected;
    }

    set allFeatureTypeSelected(featureType) {
        if (this._allFeatureTypeSelected !== featureType) {
            if (featureType === 'selectable-layers') {
                this._allFeatureTypeSelected = this.layers.map(layer => layer.name);
            } else if (featureType === 'selectable-visible-layers') {
                this._allFeatureTypeSelected = this.layers.map(layer => layer.name).filter(layerName => {
                    for (let index = 0; index < this._lizmap3.map.layers.length; index++) {
                        if (this._lizmap3.map.layers[index].visibility
                          && this._lizmap3.map.layers[index].name === layerName) {
                            return true;
                        }
                    }
                });
            } else {
                this._allFeatureTypeSelected = [featureType];
            }

            mainEventDispatcher.dispatch('selectionTool.allFeatureTypeSelected');
        }
    }

    set geomOperator(geomOperator) {
        if (this._geomOperator !== geomOperator) {
            this._geomOperator = geomOperator;
        }
    }

    get newAddRemoveSelected() {
        return this._newAddRemoveSelected;
    }

    set newAddRemoveSelected(newAddRemove) {
        if (this._newAddRemove.includes(newAddRemove)) {
            this._newAddRemoveSelected = newAddRemove;

            mainEventDispatcher.dispatch('selectionTool.newAddRemoveSelected');
        }
    }

    disable() {
        if (this.isActive) {
            document.getElementById('button-selectiontool').click();
        }
    }

    unselect() {
        for (const featureType of this.allFeatureTypeSelected) {
            this._lizmap3.events.triggerEvent('layerfeatureunselectall',
                {'featureType': featureType, 'updateDrawing': true}
            );
        }
        this._digitizing.drawLayer.getSource().clear();
        this._bufferLayer.getSource().clear();
    }

    filter() {
        if (this.filteredFeaturesCount) {
            for (const featureType of this.allFeatureTypeSelected) {
                this._lizmap3.events.triggerEvent('layerfeatureremovefilter',
                    {'featureType': featureType}
                );
            }
            this.filterActive = null;
        } else {
            for (const featureType of this.allFeatureTypeSelected) {
                if (featureType in this._lizmap3.config.layers &&
                    'selectedFeatures' in this._lizmap3.config.layers[featureType]
                    && this._lizmap3.config.layers[featureType]['selectedFeatures'].length) {
                    this.filterActive = featureType;

                    this._lizmap3.events.triggerEvent('layerfeaturefilterselected',
                        {'featureType': featureType}
                    );
                }
            }
        }
    }

    // Invert selection on a single layer
    invert(mfeatureType) {
        const featureType = mfeatureType ? mfeatureType : this.allFeatureTypeSelected[0];

        if (featureType in this._lizmap3.config.layers &&
            'selectedFeatures' in this._lizmap3.config.layers[featureType]
            && this._lizmap3.config.layers[featureType]['selectedFeatures'].length) {

            // Get all features
            this._lizmap3.getFeatureData(featureType, null, null, 'extent', false, null, null,
                (aName, aFilter, cFeatures) => {
                    const invertSelectionIds = [];
                    for (const feat of cFeatures) {
                        const fid = feat.id.split('.')[1];

                        if (!this._lizmap3.config.layers[aName]['selectedFeatures'].includes(fid)) {
                            invertSelectionIds.push(fid);
                        }
                    }

                    this._lizmap3.config.layers[featureType]['selectedFeatures'] = invertSelectionIds;

                    this._lizmap3.lizmap3.events.triggerEvent('layerSelectionChanged',
                        {
                            'featureType': featureType,
                            'featureIds': this._lizmap3.config.layers[featureType]['selectedFeatures'],
                            'updateDrawing': true
                        }
                    );
                });
        }
    }

    export(format) {
        if (format === 'GML') {
            format = 'GML3';
        }
        this._lizmap3.exportVectorLayer(this._allFeatureTypeSelected[0], format, false);
    }

    /**
     * select layer's features with a feature and a geometry operator
     * @param {string} targetFeatureType - target feature type
     * @param {Feature} selectionFeature - selection feature in map projection
     * @param {string} geomOperator - geometry operator
     */
    selectLayerFeaturesFromSelectionFeature(targetFeatureType, selectionFeature, geomOperator = 'intersects'){
        const lConfig = this._lizmap3.config.layers[targetFeatureType];
        let typeName = targetFeatureType;
        if ('typename' in lConfig) {
            typeName = lConfig.typename;
        } else if ('shortname' in lConfig) {
            typeName = lConfig.shortname;
        }

        // To avoid applying reverseAxis (not supported by QGIS GML Parser)
        // Choose a srsName without reverseAxis
        let srsName = lConfig.crs;
        if (srsName == 'EPSG:4326') {
            srsName = 'CRS:84';
        }
        const gml = new GML3({srsName:srsName});

        // Get the geometry in the layer projection
        let geom = selectionFeature.getGeometry().clone();
        geom.transform(this._map.getView().getProjection().getCode(), lConfig.crs);

        // TODO create a geometry collection from the selection draw?
        const gmlNode = gml.writeGeometryNode(geom);

        const serializer = new XMLSerializer();

        let spatialFilter = geomOperator + `($geometry, geom_from_gml('${serializer.serializeToString(gmlNode.firstChild)}'))`;


        let rFilter = lConfig?.request_params?.filter;
        if( rFilter ){
            rFilter = rFilter.replace( typeName + ':', '');
            spatialFilter = rFilter + ' AND ' + spatialFilter;
        }

        // Add exp_filter, for example if set by another tool( filter module )
        // Often 'filter' is not set because filtertoken is set instead
        // But in this case, exp_filter must also been set and must be added
        let eFilter = lConfig?.request_params?.exp_filter;
        if( eFilter ){
            spatialFilter = eFilter +' AND '+ spatialFilter;
        }

        const wfs = new WFS();
        const wfsParams = {
            TYPENAME: typeName,
            EXP_FILTER: spatialFilter
        };

        // Apply limit to bounding box config
        if (this._lizmap3.config?.limitDataToBbox === 'True') {
            wfsParams['BBOX'] = this._map.getView().calculateExtent();
            wfsParams['SRSNAME'] = this._map.getView().getProjection().getCode();
        }

        // Restrict to current geometry extent for performance
        // But not with 'disjoint' to get features
        if (this._geomOperator !== 'disjoint') {
            let geomExtent = geom.getExtent();
            if (olExtent.getArea(geomExtent) == 0) {
                geomExtent = olExtent.buffer(geomExtent, 0.000001);
            }
            wfsParams['BBOX'] = geomExtent;
            wfsParams['SRSNAME'] = lConfig.crs;
        }

        wfs.getFeature(wfsParams).then(response => {
            const features = (new GeoJSON()).readFeatures(response);

            // Array of feature ids matching geometry condition
            let featureIds = features.map(feature => feature.getId().split('.')[1]);

            if (this.newAddRemoveSelected === 'add' ) { // Add to selection
                featureIds = lConfig['selectedFeatures'].concat(featureIds);
                // Remove duplicates
                featureIds = [...new Set(featureIds)];
            } else if (this.newAddRemoveSelected === 'remove' ) { // Remove from selection
                const toRemove = new Set(featureIds);
                featureIds = lConfig['selectedFeatures'].filter( x => !toRemove.has(x) );
            }

            lConfig['selectedFeatures'] = featureIds;
            this._lizmap3.events.triggerEvent("layerSelectionChanged",
                {
                    'featureType': targetFeatureType,
                    'featureIds': lConfig['selectedFeatures'],
                    'updateDrawing': true
                }
            );
        });
    }
}
