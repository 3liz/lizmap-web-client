import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';

export default class SelectionTool {

    constructor() {

        this._layers = [];
        this._featureTypeSelected = undefined;

        this._tools = ["deactivate", "box", "circle", "polygon", "freehand"] ;
        this._toolSelected = this._tools[0];

        // Verifying WFS layers
        const featureTypes = mainLizmap.vectorLayerFeatureTypes;
        if (featureTypes.length === 0) {
            document.getElementById('button-selectiontool').parentNode.remove();
            return false;
        }

        const _this = this;

        featureTypes.each(function () {
            var self = $(this);
            var lname = mainLizmap.getNameByTypeName(self.find('Name').text());

            const config = mainLizmap.config;

            if (lname in config.layers
                && config.layers[lname]['geometryType'] != 'none'
                && config.layers[lname]['geometryType'] != 'unknown'
                && lname in config.attributeLayers) {

                _this._layers[config.attributeLayers[lname].order] = {
                    name : lname,
                    title: config.layers[lname].title
                };
            }
        });

        if (this._layers.length === 0) {
            document.getElementById('button-selectiontool').parentNode.remove();
            return false;
        }

        this._featureTypeSelected = this._layers[0].name;

        // List of WFS format
        this._exportFormats = mainLizmap.vectorLayerResultFormat.filter(
            format => !['GML2', 'GML3', 'GEOJSON'].includes(format.tagName)
        );

        // Draw and selection tools style
        const drawStyle = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: "#94EF05",
            fillOpacity: 0.3,
            strokeColor: "yellow",
            strokeOpacity: 1,
            strokeWidth: 3
        });

        const drawStyleTemp = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: "orange",
            fillOpacity: 0.3,
            strokeColor: "blue",
            strokeOpacity: 1,
            strokeWidth: 3
        });

        const drawStyleSelect = new OpenLayers.Style({
            pointRadius: 7,
            fillColor: "blue",
            fillOpacity: 0.3,
            strokeColor: "blue",
            strokeOpacity: 1,
            strokeWidth: 3
        });

        const drawStyleMap = new OpenLayers.StyleMap({
            "default": drawStyle,
            "temporary": drawStyleTemp,
            "select": drawStyleSelect
        });

        const queryLayer = new OpenLayers.Layer.Vector("selectionQueryLayer", { styleMap: drawStyleMap });
        mainLizmap.lizmap3.map.addLayers([queryLayer]);
        mainLizmap.lizmap3.layers['selectionQueryLayer'] = queryLayer;

        mainLizmap.lizmap3.controls['selectiontool'] = {};

        const onQueryFeatureAdded = (feature) => {
            /**
             * @todo Ne gère que si il ya a seulement 1 géométrie
             */
            if (feature.layer) {
                if (feature.layer.features.length > 1) {
                    feature.layer.destroyFeatures(feature.layer.features.shift());
                }
            }

            mainLizmap.lizmap3.selectLayerFeaturesFromSelectionFeature(this.featureTypeSelected, feature);
        }

        /**
         * Box
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryBoxLayerCtrl = new OpenLayers.Control.DrawFeature(queryLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 4, irregular: true }, 'featureAdded': onQueryFeatureAdded }
        );

        /**
         * Circle
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryCircleLayerCtrl = new OpenLayers.Control.DrawFeature(queryLayer,
            OpenLayers.Handler.RegularPolygon,
            { handlerOptions: { sides: 40 }, 'featureAdded': onQueryFeatureAdded }
        );

        /**
         * Polygon
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryPolygonLayerCtrl = new OpenLayers.Control.DrawFeature(
            queryLayer,
            OpenLayers.Handler.Polygon,
            {
                'featureAdded': onQueryFeatureAdded,
                styleMap: drawStyleMap,
                eventListeners: {
                    // getFeatureInfo and polygon draw controls are mutually exclusive
                    'activate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.deactivate();
                        }
                    },
                    'deactivate': function () {
                        if ('featureInfo' in lizMap.controls && lizMap.controls.featureInfo && !lizMap.controls.featureInfo.active) {
                            lizMap.controls.featureInfo.activate();
                        }
                    }
                }
            }
        );

        /**
         * Freehand
         * @type @new;OpenLayers.Control.DrawFeature
         */
        const queryFreehandLayerCtrl = new OpenLayers.Control.DrawFeature(queryLayer,
            OpenLayers.Handler.Polygon, {
                'featureAdded': onQueryFeatureAdded, styleMap: drawStyleMap,
            handlerOptions: { freehand: true }
            }
        );

        // TODO : keep reference to controls in this class
        mainLizmap.lizmap3.map.addControls([queryBoxLayerCtrl, queryCircleLayerCtrl, queryPolygonLayerCtrl, queryFreehandLayerCtrl]);

        mainLizmap.lizmap3.controls['selectiontool']['queryBoxLayerCtrl'] = queryBoxLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryCircleLayerCtrl'] = queryCircleLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryPolygonLayerCtrl'] = queryPolygonLayerCtrl;
        mainLizmap.lizmap3.controls['selectiontool']['queryFreehandLayerCtrl'] = queryFreehandLayerCtrl;

        mainLizmap.lizmap3.events.on({
            "minidockopened": (mdoEvt) => {
                if (mdoEvt.id == 'selectiontool') {
                    this.toolSelected = "deactivate";
                    mainLizmap.lizmap3.layers['selectionQueryLayer'].destroyFeatures();
                    mainLizmap.lizmap3.layers['selectionQueryLayer'].setVisibility(true);
                    // TODO
                    // $('#selectiontool-layer-list').change();
                }
            },
            "minidockclosed": (mdcEvt) => {
                if (mdcEvt.id == 'selectiontool') {
                    this.toolSelected = "deactivate";
                    mainLizmap.lizmap3.layers['selectionQueryLayer'].destroyFeatures();
                    mainLizmap.lizmap3.layers['selectionQueryLayer'].setVisibility(false);
                }
            },
            "layerSelectionChanged": (lscEvt) => {
                if ($('#mapmenu li.selectiontool').hasClass('active') &&
                    lscEvt.featureType === this._featureTypeSelected) {
                    mainEventDispatcher.dispatch('selectionTool.selectionChanged');
                }
            },
            "layerFilteredFeaturesChanged": (lffcEvt) => {
                if ($('#mapmenu li.selectiontool').hasClass('active') &&
                    lffcEvt.featureType === this._featureTypeSelected) {
                    mainEventDispatcher.dispatch('selectionTool.filteredFeaturesChanged');
                }
            }
        });
    }

    get layers() {
        return this._layers;
    }

    get exportFormats() {
        return this._exportFormats;
    }

    get selectedFeaturesCount() {
        if (this._featureTypeSelected in mainLizmap.config.layers &&
            'selectedFeatures' in mainLizmap.config.layers[this._featureTypeSelected]) {
            return mainLizmap.config.layers[this._featureTypeSelected]['selectedFeatures'].length;
        }
        return 0;
    }

    get filterActive() {
        return mainLizmap.lizmap3.lizmapLayerFilterActive !== null;
    }

    set filterActive(active) {
        mainLizmap.lizmap3.lizmapLayerFilterActive = active;
    }

    get filteredFeaturesCount() {
        if (this._featureTypeSelected in mainLizmap.config.layers &&
            'filteredFeatures' in mainLizmap.config.layers[this._featureTypeSelected]) {
            return mainLizmap.config.layers[this._featureTypeSelected]['filteredFeatures'].length;
        }
        return 0;
    }

    get featureTypeSelected(){
        return this._featureTypeSelected;
    }

    set featureTypeSelected(featureType){
        if (this._featureTypeSelected !== featureType){
            this._featureTypeSelected = featureType;

            mainEventDispatcher.dispatch('selectionTool.featureTypeSelected');
        }
    }

    get toolSelected() {
        return this._toolSelected;
    }

    set toolSelected(tool){
        if (this._tools.includes(tool)){
            // Disable all tools then enable the chosen one
            for (const key in mainLizmap.lizmap3.controls.selectiontool) {
                mainLizmap.lizmap3.controls.selectiontool[key].deactivate();
            }

            switch (tool) {
                case this._tools[1]:
                    mainLizmap.lizmap3.controls.selectiontool.queryBoxLayerCtrl.activate();
                    break;
                case this._tools[2]:
                    mainLizmap.lizmap3.controls.selectiontool.queryCircleLayerCtrl.activate();
                    break;
                case this._tools[3]:
                    mainLizmap.lizmap3.controls.selectiontool.queryPolygonLayerCtrl.activate();
                    break;
                case this._tools[4]:
                    mainLizmap.lizmap3.controls.selectiontool.queryFreehandLayerCtrl.activate();
                    break;
            }

            this._toolSelected = tool;
            mainEventDispatcher.dispatch('selectionTool.toolSelected');
        }
    }

    disable() {
        const btnSelectionTool = document.getElementById('button-selectiontool');

        if (btnSelectionTool.parentElement.classList.contains('active')){
            btnSelectionTool.click();
        }
    }

    unselect() {
        // Send signal
        mainLizmap.lizmap3.events.triggerEvent("layerfeatureunselectall",
            { 'featureType': this.featureTypeSelected, 'updateDrawing': true }
        );
    }

    filter() {
        if (this.filterActive) {
            mainLizmap.lizmap3.events.triggerEvent("layerfeatureremovefilter",
                { 'featureType': this.featureTypeSelected }
            );
            this.filterActive = null;
        } else {
            mainLizmap.lizmap3.events.triggerEvent("layerfeaturefilterselected",
                { 'featureType': this.featureTypeSelected }
            );
            this.filterActive = this.featureTypeSelected;
        }
    }

    export(format) {
        if (format == 'GML'){
            format = 'GML3';
        }
        mainLizmap.lizmap3.exportVectorLayer(this.featureTypeSelected, format, false);
    }
}
