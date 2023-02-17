import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';

import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';
import OLparser from 'jsts/org/locationtech/jts/io/OL3Parser.js';

import {
    LinearRing,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon,
} from 'ol/geom';

import GML3 from 'ol/format/GML3';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';

import WFS from '../modules/WFS.js';

import {Vector as VectorSource} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import { Feature } from 'ol';

export default class SelectionTool {

    constructor() {

        this._layers = [];
        this._allFeatureTypeSelected = [];

        this._bufferValue = 0;

        this._bufferLayer = new VectorLayer({
            source: new VectorSource({wrapX: false}),
        });

        mainLizmap.map.addLayer(this._bufferLayer);

        this._geomOperator = 'intersects';

        this._newAddRemove = ['new', 'add', 'remove'];
        this._newAddRemoveSelected = this._newAddRemove[0];

        // Verifying WFS layers
        const featureTypes = mainLizmap.vectorLayerFeatureTypes;
        if (featureTypes.length === 0) {
            if (document.getElementById('button-selectiontool')) {
                document.getElementById('button-selectiontool').parentNode.remove();
            }
            return false;
        }

        const config = mainLizmap.config;
        const layersSorted = [];

        for (const attributeLayerName in config.attributeLayers) {
            if (config.attributeLayers.hasOwnProperty(attributeLayerName)) {
                for (const featureType of featureTypes) {
                    const lname = mainLizmap.getNameByTypeName(featureType.getElementsByTagName('Name')[0].textContent);

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
                if(this.isActive && mainLizmap.digitizing.featureDrawn){
                    // We only handle a single drawn feature currently
                    if (mainLizmap.digitizing.featureDrawn.length > 1){
                        const lastFeature = mainLizmap.digitizing.featureDrawn[1];
                        mainLizmap.digitizing.drawLayer.getSource().clear();
                        mainLizmap.digitizing.drawLayer.getSource().addFeature(lastFeature);

                        mainLizmap.digitizing.saveFeatureDrawn();

                        const oldTooltips = mainLizmap.digitizing._measureTooltips[mainLizmap.digitizing._measureTooltips.length - 2];
                        mainLizmap.map.removeOverlay(oldTooltips[0]);
                        mainLizmap.map.removeOverlay(oldTooltips[1]);

                        // addFeature will provoke a new call of this callack
                        // so we return to avoid two calls
                        return;
                    }

                    let selectionFeature = mainLizmap.digitizing.featureDrawn[0];

                    if (selectionFeature) {
                        // Handle buffer if any
                        this._bufferLayer.getSource().clear();
                        if (this._bufferValue > 0) {
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
                        }

                        for (const featureType of this.allFeatureTypeSelected) {
                            const formatWKT = new WKT();
                            let featureWKT = '';
                            // Translate circle coords to WKT
                            if (selectionFeature.getGeometry().getType() === 'Circle') {
                                const center = selectionFeature.getGeometry().getCenter()
                                const radius = selectionFeature.getGeometry().getRadius()
                                featureWKT = `CIRCULARSTRING(
                                    ${center[0] - radius} ${center[1]},
                                    ${center[0]} ${center[1] + radius},
                                    ${center[0] + radius} ${center[1]},
                                    ${center[0]} ${center[1] - radius},
                                    ${center[0] - radius} ${center[1]})`;
                            } else {
                                featureWKT = formatWKT.writeFeature(selectionFeature);
                            }

                            let spatialFilter = this._geomOperator + `($geometry, geom_from_wkt('${featureWKT}'))`;

                            const lConfig = mainLizmap.config.layers[featureType];

                            let rFilter = lConfig?.request_params?.filter;
                            if( rFilter ){
                                rFilter = rFilter.replace( featureType + ':', '');
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
                                TYPENAME: featureType,
                                EXP_FILTER: spatialFilter
                            };

                            // Restrict to current BBOX for performance
                            // But not with 'disjoint' to get features outside of BBOX
                            if (this._geomOperator !== 'disjoint' || mainLizmap.config?.limitDataToBbox === 'True') {
                                wfsParams['BBOX'] = mainLizmap.map.getView().calculateExtent();
                                wfsParams['SRSNAME'] = mainLizmap.map.getView().getProjection().getCode();
                            }
                  
                            wfs.getFeature(wfsParams).then(response => {
                                const features = (new GeoJSON()).readFeatures(response);

                                // Array of feature ids matching geometry condition
                                let featureIds = features.map(feature => feature.getId().split('.')[1]);

                                if (this.newAddRemoveSelected === 'add' ) { // Add to selection
                                    featureIds = config.layers[featureType]['selectedFeatures'].concat(featureIds);
                                    // Remove duplicates
                                    featureIds = [...new Set(featureIds)];
                                }else if (this.newAddRemoveSelected === 'remove' ) { // Remove from selection
                                    const toRemove = new Set(featureIds);
                                    featureIds = config.layers[featureType]['selectedFeatures'].filter( x => !toRemove.has(x) );
                                }

                                mainLizmap.config.layers[featureType]['selectedFeatures'] = featureIds;
                                lizMap.events.triggerEvent("layerSelectionChanged",
                                    {
                                        'featureType': featureType,
                                        'featureIds': mainLizmap.config.layers[featureType]['selectedFeatures'],
                                        'updateDrawing': true
                                    }
                                );

                            });
                        }
                    }
                }
            },
            ['digitizing.featureDrawn', 'digitizing.editionEnds']
        );

        // Change buffer visibility on digitizing.visibility event
        mainEventDispatcher.addListener(
            () => {
                this._bufferLayer.setVisible(mainLizmap.digitizing.visibility);
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

        mainLizmap.lizmap3.events.on({
            minidockclosed: (event) => {
                if (event.id === 'selectiontool'){
                    mainLizmap.digitizing.toolSelected = 'deactivate';
                }
            }
        });
    }


    /**
     * Is selection tool active or not
     * @todo active state should be set on UI's events
     * @readonly
     * @memberof SelectionTool
     * @return {boolean}
     */
    get isActive() {
        return document.getElementById('button-selectiontool').parentElement.classList.contains('active')
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
        return mainLizmap.vectorLayerResultFormat.filter(
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
            if (featureType in mainLizmap.config.layers &&
                'selectedFeatures' in mainLizmap.config.layers[featureType]
                && mainLizmap.config.layers[featureType]['selectedFeatures'].length) {
                count += mainLizmap.config.layers[featureType]['selectedFeatures'].length;
            }
        }

        return count;
    }

    get filterActive() {
        return mainLizmap.lizmap3.lizmapLayerFilterActive;
    }

    set filterActive(active) {
        mainLizmap.lizmap3.lizmapLayerFilterActive = active;
    }

    get filteredFeaturesCount() {
        let count = 0;

        for (const featureType of this.allFeatureTypeSelected) {
            if (featureType in mainLizmap.config.layers &&
                'filteredFeatures' in mainLizmap.config.layers[featureType]) {
                count += mainLizmap.config.layers[featureType]['filteredFeatures'].length;
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
                    for (let index = 0; index < mainLizmap.lizmap3.map.layers.length; index++) {
                        if (mainLizmap.lizmap3.map.layers[index].visibility
                            && mainLizmap.lizmap3.map.layers[index].name === layerName) {
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
            mainLizmap.lizmap3.events.triggerEvent('layerfeatureunselectall',
                {'featureType': featureType, 'updateDrawing': true}
            );
        }
        mainLizmap.digitizing.drawLayer.getSource().clear();
        this._bufferLayer.getSource().clear();
    }

    filter() {
        if (this.filteredFeaturesCount) {
            for (const featureType of this.allFeatureTypeSelected) {
                mainLizmap.lizmap3.events.triggerEvent('layerfeatureremovefilter',
                    {'featureType': featureType}
                );
            }
            this.filterActive = null;
        } else {
            for (const featureType of this.allFeatureTypeSelected) {
                if (featureType in mainLizmap.config.layers &&
                    'selectedFeatures' in mainLizmap.config.layers[featureType]
                    && mainLizmap.config.layers[featureType]['selectedFeatures'].length) {
                    this.filterActive = featureType;

                    mainLizmap.lizmap3.events.triggerEvent('layerfeaturefilterselected',
                        {'featureType': featureType}
                    );
                }
            }
        }
    }

    // Invert selection on a single layer
    invert(mfeatureType) {
        const featureType = mfeatureType ? mfeatureType : this.allFeatureTypeSelected[0];

        if (featureType in mainLizmap.config.layers &&
            'selectedFeatures' in mainLizmap.config.layers[featureType]
            && mainLizmap.config.layers[featureType]['selectedFeatures'].length) {

            // Get all features
            mainLizmap.lizmap3.getFeatureData(featureType, null, null, 'extent', false, null, null,
                (aName, aFilter, cFeatures) => {
                    const invertSelectionIds = [];
                    for (const feat of cFeatures) {
                        const fid = feat.id.split('.')[1];

                        if (!mainLizmap.config.layers[aName]['selectedFeatures'].includes(fid)) {
                            invertSelectionIds.push(fid);
                        }
                    }

                    mainLizmap.config.layers[featureType]['selectedFeatures'] = invertSelectionIds;

                    mainLizmap.lizmap3.events.triggerEvent('layerSelectionChanged',
                        {
                            'featureType': featureType,
                            'featureIds': mainLizmap.config.layers[featureType]['selectedFeatures'],
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
        mainLizmap.lizmap3.exportVectorLayer(this._allFeatureTypeSelected[0], format, false);
    }
}
