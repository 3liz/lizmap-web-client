/**
 * Class: lizMap
 * @package
 * @subpackage view
 * @author    3liz
 * @copyright 2011 3liz
 * @link      http://3liz.com
 * @license MPL-2.0
 */

import { extend } from 'ol/extent.js';

import WFS from '../modules/WFS.js';
import WMS from '../modules/WMS.js';
import { Utils } from '../modules/Utils.js';

window.lizMap = function() {
    /**
     * PRIVATE Property: config
     * {object} The map config
     */
    var config = null;
    /**
     * PRIVATE Property: keyValueConfig
     * {object} Config to replace keys by values
     */
    var keyValueConfig = null;
    /**
     * PRIVATE Property: capabilities
     * {object} The wms capabilities
     */
    var capabilities = null;
    /**
     * PRIVATE Property: wmtsCapabilities
     * {object} The wmts capabilities
     */
    var wmtsCapabilities = null;
    /**
     * PRIVATE Property: wfsCapabilities
     * {object} The wfs capabilities
     */
    var wfsCapabilities = null;
    /**
     * PRIVATE Property: map
     * {<OpenLayers.Map>} The map
     */
    var map = null;
    /**
     * PRIVATE Property: baselayers
     * {Array(<OpenLayers.Layer>)} Ordered list of base layers
     */
    var baselayers = [];
    /**
     * PRIVATE Property: layers
     * {Array(<OpenLayers.Layer>)} Ordered list of layers
     */
    var layers = [];
    /**
     * PRIVATE Property: controls
     * {Object({key:<OpenLayers.Control>})} Dictionary of controls
     */
    var controls = {};

    /**
     * PRIVATE Property: getFeatureInfoVendorParams
     * {object} Additional QGIS Server parameter for click tolerance in pixels
     */
    var defaultGetFeatureInfoTolerances = {
        'FI_POINT_TOLERANCE': 25,
        'FI_LINE_TOLERANCE': 10,
        'FI_POLYGON_TOLERANCE': 5
    };

    /**
     * PRIVATE Property: externalBaselayersReplacement
     *
     */
    var externalBaselayersReplacement = {
        'osm': 'osm-mapnik',
        'osm-toner': 'osm-stamen-toner',
        'opentopomap': 'open-topo-map',
        'osm-cycle': 'osm-cyclemap',
        'gsat': 'google-satellite',
        'ghyb': 'google-hybrid',
        'gphy': 'google-terrain',
        'gmap': 'google-street',
        'bmap': 'bing-road',
        'baerial': 'bing-aerial',
        'bhybrid': 'bing-hybrid',
        'ignmap': 'ign-scan',
        'ignplan': 'ign-plan',
        'ignphoto': 'ign-photo',
        'igncadastral': 'ign-cadastral'
    };

    /**
     * PRIVATE Property: cleanNameMap
     *
     */
    var cleanNameMap = {
    };

    /**
     * PRIVATE Property: layerIdMap
     *
     */
    var layerIdMap = {
    };
    /**
     * PRIVATE Property: shortNameMap
     *
     */
    var shortNameMap = {
    };
    /**
     * PRIVATE Property: typeNameMap
     *
     */
    var typeNameMap = {
    };

    /**
     * PRIVATE Property: layerCleanNames
     *
     */
    var layerCleanNames = {};

    /**
     * PRIVATE Property: lizmapLayerFilterActive. Contains layer name if filter is active
     *
     */
    var lizmapLayerFilterActive = null;

    /**
     * PRIVATE Property: editionPending. True when an edition form has already been displayed. Used to prevent double-click on launchEdition button
     *
     */
    var editionPending = false;

    var lastLonLatInfo = null;

    /**
     * Get the metadata written in the configuration file by the desktop Lizmap plugin.
     *
     * This method should be used EVERY TIME we need to add "if" conditions
     * to adapt the code for configuration parameters changes across versions.
     * This will ease in the future the review of the code to remove all the "if"
     * conditions: we will just need to search for "getLizmapDesktopPluginMetadata"
     * and not: "if 'someproperty' in someconfig".
     *
     * For very old configuration files, which have not the needed metadata, we
     * return fake versions for each property.
     *
     * Dependencies:
     * config
     */
    function getLizmapDesktopPluginMetadata()
    {
    // Default fake versions if the properties does not yet exist in configuration file
    // lizmap/modules/lizmap/lib/Project/Project.php
        var plugin_metadata = {
            lizmap_plugin_version_str: "3.1.8",
            lizmap_plugin_version: 30108,
            lizmap_web_client_target_version: 30200,
            qgis_desktop_version: 30000
        };

        if (!('metadata' in config)) {
            return plugin_metadata;
        }
        if ('lizmap_plugin_version' in config['metadata']) {
            plugin_metadata['lizmap_plugin_version'] = config['metadata']['lizmap_plugin_version'];
        }
        if ('lizmap_web_client_target_version' in config['metadata']) {
            plugin_metadata['lizmap_web_client_target_version'] = config['metadata']['lizmap_web_client_target_version'];
        }
        if ('qgis_desktop_version' in config['metadata']) {
            plugin_metadata['qgis_desktop_version'] = config['metadata']['qgis_desktop_version'];
        }

        return plugin_metadata;

    }

    /**
     *
     * @param aName
     */
    function performCleanName(aName) {
        var accentMap = {
            "à": "a",    "á": "a",    "â": "a",    "ã": "a",    "ä": "a",    "ç": "c",    "è": "e",    "é": "e",    "ê": "e",    "ë": "e",    "ì": "i",    "í": "i",    "î": "i",    "ï": "i",    "ñ": "n",    "ò": "o",    "ó": "o",    "ô": "o",    "õ": "o",    "ö": "o",    "ù": "u",    "ú": "u",    "û": "u",    "ü": "u",    "ý": "y",    "ÿ": "y",
            "À": "A",    "Á": "A",    "Â": "A",    "Ã": "A",    "Ä": "A",    "Ç": "C",    "È": "E",    "É": "E",    "Ê": "E",    "Ë": "E",    "Ì": "I",    "Í": "I",    "Î": "I",    "Ï": "I",    "Ñ": "N",    "Ò": "O",    "Ó": "O",    "Ô": "O",    "Õ": "O",    "Ö": "O",    "Ù": "U",    "Ú": "U",    "Û": "U",    "Ü": "U",    "Ý": "Y",
            "-":" ", "'": " ", "(": " ", ")": " "};
        var normalize = function( term ) {
            var ret = "";
            for ( var i = 0; i < term.length; i++ ) {
                ret += accentMap[ term.charAt(i) ] || term.charAt(i);
            }
            return ret;
        };
        var theCleanName = normalize(aName);
        var reg = new RegExp('\\W', 'g');
        return theCleanName.replace(reg, '_');
    }

    /**
     * PRIVATE function: cleanName
     * cleaning layerName for class and layer
     * @param aName
     */
    function cleanName(aName){
        if ( aName in cleanNameMap )
            return aName;

        if ( aName == undefined ) {
            console.log( "An undefined name has been clean" );
            return '';
        }

        var theCleanName = performCleanName( aName );
        if ( (theCleanName in cleanNameMap) && cleanNameMap[theCleanName] != aName ){
            var i = 1;
            var nCleanName = theCleanName+i;
            while( (nCleanName in cleanNameMap) && cleanNameMap[nCleanName] != aName ){
                i += 1;
                nCleanName = theCleanName+i;
            }
            theCleanName = nCleanName;
        }
        cleanNameMap[theCleanName] = aName;
        return theCleanName;
    }

    /**
     *
     * @param cleanName
     */
    function getNameByCleanName( cleanName ){
        var name = null;
        if( cleanName in cleanNameMap )
            name = cleanNameMap[cleanName];
        return name;
    }

    /**
     *
     * @param shortName
     */
    function getNameByShortName( shortName ){
        var name = null;
        if( shortName in shortNameMap )
            name = shortNameMap[shortName];
        return name;
    }

    /**
     *
     * @param typeName
     */
    function getNameByTypeName( typeName ){
        var name = null;
        if( typeName in typeNameMap )
            name = typeNameMap[typeName];
        return name;
    }

    /**
     *
     * @param cleanName
     */
    function getLayerNameByCleanName( cleanName ){
        var layerName = null;
        if( cleanName in layerCleanNames )
            layerName = layerCleanNames[cleanName];
        if ( layerName == null && cleanName in cleanNameMap ) {
            layerName = cleanNameMap[cleanName];
            layerCleanNames[cleanName] = layerName;
        }
        return layerName;
    }


    /**
     * PRIVATE function: updateMobile
     * Determine if we should display the mobile version.
     */
    function updateMobile(){
        var isMobile = mCheckMobile();
        var contentIsMobile = $('#content').hasClass('mobile');
        if (isMobile == contentIsMobile)
            return;

        if (isMobile) {
            // Add mobile class to content
            $('#content, #headermenu').addClass('mobile');

            // Hide switcher
            if( $('#button-switcher').parent().hasClass('active') )
                $('#button-switcher').click();

            if( $('#menu').is(':visible'))
                $('#menu').hide();

            $('#map-content').append($('#toolbar'));

            $('#toggleLegend')
                .attr('data-bs-toggle', 'tooltip')
                .attr('data-bs-title',$('#toggleLegendOn').attr('value'))
                .parent().attr('class','legend');

            // autocompletion items for locatebylayer feature
            $('div.locate-layer select').show();
            $('span.custom-combobox').hide();
        }
        else
        {
            // Remove mobile class to content
            $('#content, #headermenu').removeClass('mobile');

            // Show switcher
            if( !( $('#button-switcher').parent().hasClass('active') ) )
                $('#button-switcher').click();

            if( !$('#menu').is(':visible'))
                $('#content span.ui-icon-open-menu').click();
            else
                $('#map-content').show();

            $('#toolbar').insertBefore($('#switcher-menu'));

            $('#toggleLegend')
                .attr('data-bs-toggle', 'tooltip')
                .attr('data-bs-title',$('#toggleMapOnlyOn').attr('value'))
                .parent().attr('class','map');

            // autocompletion items for locatebylayer feature
            $('div.locate-layer select').hide();
            $('span.custom-combobox').show();
        }
    }

    /**
     * PRIVATE function: updateContentSize
     * update the content size
     */
    function updateContentSize(){

        if (document.querySelector('body').classList.contains('print_popup')) {
            return;
        }

        updateMobile();

        // calculate height height
        var h = $(window).innerHeight();
        h = h - $('#header').height();
        $('#map').height(h);

        // Update body padding top by summing up header+headermenu
        $('body').css('padding-top', $('#header').outerHeight() );

        // calculate map width depending on theme configuration
        // (fullscreen map or not, mobile or not)
        var w = $('body').parent()[0].offsetWidth;
        w -= parseInt($('#map-content').css('margin-left'));
        w -= parseInt($('#map-content').css('margin-right'));
        if ($('#menu').is(':hidden') || $('#map-content').hasClass('fullscreen')) {
            $('#map-content').css('margin-left','auto');
        } else {
            w -= $('#menu').width();
            $('#map-content').css('margin-left', $('#menu').width());
        }
        $('#map').width(w);

        if ( $('#right-dock-tabs').is(':visible') ){
            $('#right-dock-content').css( 'max-height', $('#right-dock').height() - $('#right-dock-tabs').height() );
        }
    }

    /**
     * PRIVATE function: getLayerScale
     * get the layer scales based on children layer
     *
     * Parameters:
     * nested - {Object} a capability layer
     * minScale - {Float} the nested min scale
     * maxScale - {Float} the nested max scale
     *
     * Dependencies:
     * config
     *
     * Returns:
     * {Object} the min and max scales
     * @param nested
     * @param minScale
     * @param maxScale
     */
    function getLayerScale(nested,minScale,maxScale) {
        for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
            var layer = nested.nestedLayers[i];
            var qgisLayerName = layer.name;
            if ( 'useLayerIDs' in config.options && config.options.useLayerIDs == 'True' )
                qgisLayerName = layerIdMap[layer.name];
            else if ( layer.name in shortNameMap )
                qgisLayerName = shortNameMap[layer.name];
            var layerConfig = config.layers[qgisLayerName];
            if (layer.nestedLayers.length != 0)
                return getLayerScale(layer,minScale,maxScale);
            if (layerConfig) {
                if (minScale == null)
                    minScale=layerConfig.minScale;
                else if (layerConfig.minScale<minScale)
                    minScale=layerConfig.minScale;
                if (maxScale == null)
                    maxScale=layerConfig.maxScale;
                else if (layerConfig.maxScale>maxScale)
                    maxScale=layerConfig.maxScale;
            }
        }
        if ( minScale < 1 )
            minScale = 1;
        return {minScale:minScale,maxScale:maxScale};
    }

    /**
     * PRIVATE function: getLayerOrder
     * get the layer order and calculate it if it's a QGIS group
     *
     * Parameters:
     * nested - {Object} a capability layer
     *
     * Dependencies:
     * config
     *
     * Returns:
     * {int} the layer's order
     * @param nested
     */
    function getLayerOrder(nested) {
    // there is no layersOrder in the project
        if (!('layersOrder' in config))
            return -1;

        // the nested is a layer and not a group
        if (nested.nestedLayers.length == 0) {
            var qgisLayerName = nested.name;
            if ( 'useLayerIDs' in config.options && config.options.useLayerIDs == 'True' )
                qgisLayerName = layerIdMap[nested.name];
            else if ( nested.name in shortNameMap )
                qgisLayerName = shortNameMap[nested.name];
            if (qgisLayerName in config.layersOrder)
                return config.layersOrder[nested.name];
            else
                return -1;
        }

        // the nested is a group
        var order = -1;
        for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
            var layer = nested.nestedLayers[i];
            var qgisLayerName = layer.name;
            if ( 'useLayerIDs' in config.options && config.options.useLayerIDs == 'True' )
                qgisLayerName = layerIdMap[layer.name];
            else if ( layer.name in shortNameMap )
                qgisLayerName = shortNameMap[layer.name];
            var lOrder = -1;
            if (layer.nestedLayers.length != 0)
                lOrder = getLayerScale(layer);
            else if (qgisLayerName in config.layersOrder)
                lOrder = config.layersOrder[qgisLayerName];
            else
                lOrder = -1;
            if (lOrder != -1) {
                if (order == -1 || lOrder < order)
                    order = lOrder;
            }
        }
        return order;
    }

    /**
     *
     */
    function buildNativeScales() {
        if (('EPSG:900913' in Proj4js.defs)
            && !('EPSG:3857' in Proj4js.defs)) {
            Proj4js.defs['EPSG:3857'] = Proj4js.defs['EPSG:900913'];
        }

        // Check config projection
        var proj = config.options.projection;
        if (proj.ref) {
            if ( !(proj.ref in Proj4js.defs) ) {
                Proj4js.defs[proj.ref]=proj.proj4;
            }
            // Build proj
            new OpenLayers.Projection(proj.ref);
        } else {
            proj.ref = 'EPSG:3857';
            proj.proj4 = Proj4js.defs['EPSG:3857'];
        }

        // Force projection if config contains old external baselayers
        // To be removed when baselayers only in the tree
        if ('osmMapnik' in config.options
            || 'osmStamenToner' in config.options
            || 'openTopoMap' in config.options
            || 'osmCyclemap' in config.options
            || 'googleStreets' in config.options
            || 'googleSatellite' in config.options
            || 'googleHybrid' in config.options
            || 'googleTerrain' in config.options
            || 'bingStreets' in config.options
            || 'bingSatellite' in config.options
            || 'bingHybrid' in config.options
            || 'ignTerrain' in config.options
            || 'ignStreets' in config.options
            || 'ignSatellite' in config.options
            || 'ignCadastral' in config.options) {
            // get projection
            var projection = new OpenLayers.Projection(proj.ref);

            // get and define the max extent
            var bbox = config.options.bbox;
            var initialBbox = config.options.initialExtent;
            var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
            var initialExtent = new OpenLayers.Bounds(Number(initialBbox[0]),Number(initialBbox[1]),Number(initialBbox[2]),Number(initialBbox[3]));
            extent.transform(projection, 'EPSG:3857');
            initialExtent.transform(projection, 'EPSG:3857');
            config.options.bbox = extent.toArray();
            config.options.initialExtent = initialExtent.toArray();
            proj.ref = 'EPSG:3857';
            proj.proj4 = Proj4js.defs['EPSG:3857'];
        }

        var scales = [];
        if ('mapScales' in config.options){
            scales = Array.from(config.options.mapScales);
        }

        if (scales.length < 2){
            scales = [config.options.maxScale,config.options.minScale];
        }
        scales.sort(function(a, b) {
            return Number(b) - Number(a);
        });

        var useNativeZoomLevels = false;
        if (!('use_native_zoom_levels' in config.options)) {
            if (proj.ref == 'EPSG:3857') {
                useNativeZoomLevels = true;
            }
            if (scales.length == 2) {
                useNativeZoomLevels = true;
            }
        } else {
            useNativeZoomLevels = config.options['use_native_zoom_levels'];
        }

        // Nothing to change
        if (!useNativeZoomLevels) {
            return;
        }

        if (proj.ref == 'EPSG:3857') {
            var projOSM = new OpenLayers.Projection('EPSG:3857');
            var resolutions = [];
            config.options.zoomLevelNumber = 24;
            var maxScale = scales[0];
            var maxRes = OpenLayers.Util.getResolutionFromScale(maxScale, projOSM.proj.units);
            var minScale = scales[scales.length-1];
            var minRes = OpenLayers.Util.getResolutionFromScale(minScale, projOSM.proj.units);
            var res = 156543.03390625;
            var n = 1;
            while ( res > minRes && n < config.options.zoomLevelNumber) {
                if ( res < maxRes ) {
                    //Add extra scale
                    resolutions.push(res);
                }
                res = res/2;
                n++;
            }
            maxRes = resolutions[0];
            minRes = resolutions[resolutions.length-1];
            //Add extra scale
            var maxScale = OpenLayers.Util.getScaleFromResolution(maxRes, projOSM.proj.units);
            var minScale = OpenLayers.Util.getScaleFromResolution(minRes, projOSM.proj.units);
            config.options['resolutions'] = resolutions;

            if (resolutions.length != 0 ) {
                config.options.zoomLevelNumber = resolutions.length;
                config.options.maxScale = maxScale;
                config.options.minScale = minScale;
            }
        } else if (scales.length == 2) {
            var nativeScales = [];
            var maxScale = scales[0];
            var minScale = scales[scales.length-1];
            let n=1;
            while (10*Math.pow(10,n)-1 < maxScale) {
                nativeScales = nativeScales.concat([10, 25, 50].map((x) => Math.pow(10,n)*x));
                n++;
            }
            let mapScales = [];
            for (const scale of nativeScales) {
                if (scale < minScale) {
                    continue;
                }
                if (scale > maxScale) {
                    break;
                }
                mapScales.push(scale);
            }
            mapScales.sort(function(a, b) {
                return Number(b) - Number(a);
            });
            config.options.mapScales = mapScales;
            config.options.maxScale = scales[0];
            config.options.minScale = scales[scales.length-1];
        }
    }

    /**
     *
     * @param firstLayer
     */
    function initProjections(firstLayer) {
        // Set Proj4js.libPath
        const proj4jsLibPath = document.body.dataset?.proj4jsLibPath;
        if (proj4jsLibPath) {
            Proj4js.libPath = proj4jsLibPath;
        }

        // Insert or update projection list
        if ( globalThis['lizProj4'] ) {
            for( var ref in globalThis['lizProj4'] ) {
                if ( !(ref in Proj4js.defs) ) {
                    Proj4js.defs[ref]=globalThis['lizProj4'][ref];
                }
            }
        }

        // get and define projection
        var proj = config.options.projection;
        if ( !(proj.ref in Proj4js.defs) )
            Proj4js.defs[proj.ref]=proj.proj4;
        var projection = new OpenLayers.Projection(proj.ref);

        if ( !(proj.ref in OpenLayers.Projection.defaults) ) {
            OpenLayers.Projection.defaults[proj.ref] = projection;

            // test extent for inverted axis
            if ( proj.ref in firstLayer.bbox ) {
                var wmsBbox = firstLayer.bbox[proj.ref].bbox;
                var wmsBounds = OpenLayers.Bounds.fromArray( wmsBbox );
                var initBounds = OpenLayers.Bounds.fromArray( config.options.initialExtent );
                if ( !initBounds.intersectsBounds( wmsBounds ) )
                    OpenLayers.Projection.defaults[proj.ref].yx = true;
            }
        }
    }

    /**
     * PRIVATE function: createMap
     * creating the map {<OpenLayers.Map>}
     * @param {Array} initialExtent initial extent in EPSG:4326 projection
     */
    function createMap(initialExtent) {
    // get projection
        var proj = config.options.projection;
        var projection = new OpenLayers.Projection(proj.ref);
        var proj4326 = new OpenLayers.Projection('EPSG:4326');
        var initialExtentProj = proj4326;
        var zoomToClosest = false;

        // get and define the max extent
        var bbox = config.options.bbox;
        var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));

        var restrictedExtent = extent.scale(3);

        const urlParameters = (new URL(document.location)).searchParams;
        if (urlParameters.has('bbox')) {
            let initialExtentParam = urlParameters.get('bbox').split(',');
            if (initialExtentParam.length === 4) {
                initialExtent = initialExtentParam;
            }
            if (urlParameters.has('crs')) {
                initialExtentProj = new OpenLayers.Projection(urlParameters.get('crs'));
            }
            zoomToClosest = true;
        }

        let initialExtentPermalink = window.location.hash.substring(1).split('|')[0].split(',');
        if (initialExtentPermalink.length === 4) {
            initialExtent = initialExtentPermalink;
            initialExtentProj = proj4326;
            zoomToClosest = true;
        }

        if(initialExtent){
            initialExtent = new OpenLayers.Bounds(initialExtent);
            initialExtent.transform(initialExtentProj, projection);
        } else {
            initialExtent = extent.clone();
            if ( 'initialExtent' in config.options && config.options.initialExtent.length == 4 ) {
                var initBbox = config.options.initialExtent;
                initialExtent = new OpenLayers.Bounds(Number(initBbox[0]),Number(initBbox[1]),Number(initBbox[2]),Number(initBbox[3]));
            }
        }

        // calculate the map height
        var mapHeight = $('body').parent()[0].clientHeight;
        if(!mapHeight)
            mapHeight = $('window').innerHeight();
        mapHeight = mapHeight - $('#header').height();
        mapHeight = mapHeight - $('#headermenu').height();
        $('#map').height(mapHeight);

        // Make sure interface divs size are updated before creating the map
        // This avoid the request of each singlettile layer 2 times on startup
        updateContentSize();

        var scales = [];
        var resolutions = [];
        if ('resolutions' in config.options){
            resolutions = Array.from(config.options.resolutions);
        }
        else if ('mapScales' in config.options){
            scales = Array.from(config.options.mapScales);
        }

        scales.sort(function(a, b) {
            return Number(b) - Number(a);
        });
        // remove duplicate scales
        var nScales = [];
        while (scales.length != 0){
            var scale = scales.pop(0);
            if ($.inArray( scale, nScales ) == -1 )
                nScales.push( scale );
        }
        scales = nScales;


        // creating the map
        OpenLayers.Util.IMAGE_RELOAD_ATTEMPTS = 3; // Avoid some issues with tiles not displayed
        OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
        OpenLayers.Util.DEFAULT_PRECISION=20; // default is 14 : change needed to avoid rounding problem with cache

        map = new OpenLayers.Map('map'
            ,{
                controls:[
                    new OpenLayers.Control.Navigation({mouseWheelOptions: {interval: 100}})
                ]
                ,tileManager: null // prevent bug with OL 2.13 : white tiles on panning back
                ,maxExtent:extent
                ,restrictedExtent: restrictedExtent
                ,initialExtent:initialExtent
                ,zoomToClosest: zoomToClosest
                ,maxScale: scales.length == 0 ? config.options.minScale : "auto"
                ,minScale: scales.length == 0 ? config.options.maxScale : "auto"
                ,numZoomLevels: scales.length == 0 ? config.options.zoomLevelNumber : scales.length
                ,scales: scales.length == 0 ? null : scales
                ,resolutions: resolutions.length == 0 ? null : resolutions
                ,projection:projection
                ,units:projection.proj.units !== null ? projection.proj.units : "degrees"
                ,allOverlays:(baselayers.length == 0)
                ,autoUpdateSize: false
            });

        // add handler to update the map size
        window.addEventListener('resize', updateContentSize);
    }

    /**
     *
     * @param layer_name
     */
    function clearDrawLayer(layer_name) {
        var layer = map.getLayersByName(layer_name);
        if (layer.length == 0) {
            return;
        }
        layer[0].destroyFeatures();
    }

    /**
     * PRIVATE function: createToolbar
     * create the tool bar (collapse switcher, etc)
     */
    function createToolbar() {
        var configOptions = config.options;

        addFeatureInfo();

        if (('geolocation' in configOptions)
      && configOptions['geolocation'] == 'True'){
            $('#geolocation button.btn-geolocation-close').click(function () {
                $('#button-geolocation').click();
                return false;
            });
        }

        if ( ('measure' in configOptions)
        && configOptions['measure'] == 'True')
            addMeasureControls();
        else {
            $('#measure').parent().remove();
            $('#measure-length-menu').remove();
            $('#measure-area-menu').remove();
            $('#measure-perimeter-menu').remove();
        }
    }

    /**
     * PRIVATE function: deactivateToolControls
     * Deactivate Openlayers controls
     * @param evt
     */
    function deactivateToolControls( evt ) {
        for (var id in controls) {
            var ctrl = controls[id];
            if(ctrl){
                if (evt && ('object' in evt) && ctrl == evt.object){
                    continue;
                }
                if (ctrl.type == OpenLayers.Control.TYPE_TOOL){
                    ctrl.deactivate();
                }
            }
        }
        return true;
    }

    /**
     *
     * @param {string} text - text to display
     * @param {object} xy - x and y in pixels
     * @param {Array} coordinate - coordinate in map unit
     */
    function displayGetFeatureInfo(text, xy, coordinate){
        var eventLonLatInfo = map.getLonLatFromPixel(xy);

        var popup = null;
        var popupContainerId = null;
        if( 'popupLocation' in config.options && config.options.popupLocation != 'map' ){
            popupContainerId = 'popupcontent';

            // create content
            var popupReg = new RegExp('lizmapPopupTable', 'g');
            text = text.replace( popupReg, 'table table-condensed table-striped table-bordered lizmapPopupTable');
            var pcontent = '<div class="lizmapPopupContent">'+text+'</div>';
            var hasPopupContent = (!(!text || text == null || text == ''));
            document.querySelector('#popupcontent div.menu-content').innerHTML = pcontent;
            if ( !$('#mapmenu .nav-list > li.popupcontent').is(':visible') )
                $('#mapmenu .nav-list > li.popupcontent').show();

            // Warn user no data has been found
            if( !hasPopupContent ){
                pcontent = '<div class="lizmapPopupContent noContent"><h4>'+lizDict['popup.msg.no.result']+'</h4></div>';
                document.querySelector('#popupcontent div.menu-content').innerHTML = pcontent;
                window.setTimeout(function(){
                    if ( $('#mapmenu .nav-list > li.popupcontent').hasClass('active') &&
                $('#popupcontent .lizmapPopupContent').hasClass('noContent') &&
                config.options.popupLocation != 'right-dock'){
                        document.getElementById('button-popupcontent').click();
                    }
                },2000);
            }

            // Display dock if needed
            if(
                !$('#mapmenu .nav-list > li.popupcontent').hasClass('active')
          && (!mCheckMobile() || ( mCheckMobile() && hasPopupContent ) )
          && (lastLonLatInfo == null || eventLonLatInfo.lon != lastLonLatInfo.lon || eventLonLatInfo.lat != lastLonLatInfo.lat)
            ){
                document.getElementById('button-popupcontent').click();
            }
            else if(
                $('#mapmenu .nav-list > li.popupcontent').hasClass('active')
          && ( mCheckMobile() && hasPopupContent )
            ){
                document.getElementById('button-popupcontent').click();
            }
        } else {
            // Hide previous popup
            lizMap.mainLizmap.popup.mapPopup.setVisible(false);

            if (!text || text == null || text == ''){
                return false;
            }

            document.getElementById('liz_layer_popup_contentDiv').innerHTML = text;
            if (coordinate) {
                lizMap.mainLizmap.popup.mapPopup.setPosition(coordinate);
            } else {
                lizMap.mainLizmap.popup.mapPopup.setPosition([eventLonLatInfo.lon, eventLonLatInfo.lat]);
            }

            // Activate Boostrap 2 tabs here as they are not
            // automatically activated when created in popup anchored
            $('#' + popupContainerId + ' a[data-toggle="tab"]').on( 'click',function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
        }
        lastLonLatInfo = eventLonLatInfo;

        // Display related children objects
        addChildrenFeatureInfo( popup, popupContainerId );
        // Display geometries
        addGeometryFeatureInfo( popup, popupContainerId );
        // Display the plots of the children layers features filtered by popup item
        addChildrenDatavizFilteredByPopupFeature( popup, popupContainerId );

        // Trigger event
        lizMap.events.triggerEvent("lizmappopupdisplayed",
            {'popup': popup, 'containerId': popupContainerId}
        );
    }

    /**
     *
     * @param popup
     * @param containerId
     */
    function addGeometryFeatureInfo( popup, containerId ) {
        // Build selector
        let selector = 'div.lizmapPopupContent div.lizmapPopupDiv > input.lizmap-popup-layer-feature-geometry';
        if ( containerId ){
            selector = '#'+ containerId +' '+ selector;
        }
        // Highlight geometries
        const geometriesWKT = [];
        document.querySelectorAll(selector).forEach(element => geometriesWKT.push(element.value));
        if (geometriesWKT.length) {
            const geometryCollectionWKT = `GEOMETRYCOLLECTION(${geometriesWKT.join()})`;
            lizMap.mainLizmap.map.setHighlightFeatures(geometryCollectionWKT, "wkt");
        }
    }

    /**
     *
     * @param popup
     * @param containerId
     */
    function addChildrenDatavizFilteredByPopupFeature(popup, containerId) {
        if ('datavizLayers' in lizMap.config) {
            // build selector
            var selector = 'div.lizmapPopupContent div.lizmapPopupDiv';
            if ( containerId )
                selector = '#'+ containerId +' '+ selector;
            $(selector).each(function(){
                var mydiv = $(this);

                // Do not add plots if already present
                if( $(this).find('div.lizdataviz').length > 0 )
                    return true;

                if ($(this).find('input.lizmap-popup-layer-feature-id:first').val()) {
                    var getLayerId = $(this).find('input.lizmap-popup-layer-feature-id:first').val().split('.');
                    var popupId = getLayerId[0] + '_' + getLayerId[1];
                    var layerId = getLayerId[0];
                    var fid = getLayerId[1];

                    var getLayerConfig = lizMap.getLayerConfigById( layerId );

                    // verifiying  related children objects
                    if ( !getLayerConfig )
                        return true;
                    var featureType = getLayerConfig[0];

                    // We do not want to deactivate the display of filtered children dataviz
                    // when children popup are not displayed : comment the 2 following lines
                    if ( !('relations' in lizMap.config) || !(layerId in lizMap.config.relations) )
                        return true;

                    //If dataviz exists, get config
                    if( !('datavizLayers' in lizMap.config ))
                        return true;

                    lizMap.getLayerFeature(featureType, fid, function(feat) {
                        // Where there is all plots
                        var plotLayers = lizMap.config.datavizLayers.layers;
                        var lrelations = lizMap.config.relations[layerId];
                        var nbPlotByLayer = 1;

                        for ( var i in plotLayers) {

                            for(var x in lrelations){
                                var rel = lrelations[x];
                                // Id of the layer which is the child of layerId
                                var getChildrenId = rel.referencingLayer;

                                // Filter of the plot
                                var filter = '"' + rel.referencingField + '" IN (\''+feat.properties[rel.referencedField]+'\')';


                                if(plotLayers[i].layer_id==getChildrenId)
                                {
                                    var plot_config=plotLayers[i];
                                    if('popup_display_child_plot' in plot_config
                              && plot_config.popup_display_child_plot == "True"
                                    ){
                                        var plot_id=plotLayers[i].plot_id;
                                        popupId = getLayerId[0] + '_' + getLayerId[1] + '_' + String(nbPlotByLayer);
                                        // Be sure the id is unique ( popup can be displayed in atlas tool too)
                                        popupId+= '_' + new Date().valueOf()+btoa(Math.random()).substring(0,12);
                                        var phtml = lizDataviz.buildPlotContainerHtml(
                                            plot_config.title_popup,
                                            plot_config.abstract,
                                            popupId,
                                            false
                                        );
                                        var html = '<div class="lizmapPopupChildren lizdataviz">';
                                        html+= '<h4>'+ plot_config.title_popup+'</h4>';
                                        html+= phtml
                                        html+= '</div>';
                                        var haspc = $(mydiv).find('div.lizmapPopupChildren:last');
                                        if( haspc.length > 0 )
                                            $(haspc).after(html);
                                        else
                                            $(mydiv).append(html);
                                        lizDataviz.getPlot(plot_id, filter, popupId);
                                        nbPlotByLayer++;
                                    }
                                }
                            }
                        }
                    });
                }
            });
        }else{
            return false;
        }
    }

    /**
     *
     * @param popup
     * @param containerId
     */
    function addChildrenFeatureInfo( popup, containerId ) {
        var selector = 'div.lizmapPopupContent input.lizmap-popup-layer-feature-id';
        if ( containerId )
            selector = '#'+ containerId +' '+ selector;
        $(selector).each(function(){
            var self = $(this);
            var val = self.val();
            var fid = val.split('.').pop();
            var layerId = val.replace( '.' + fid, '' );

            var getLayerConfig = getLayerConfigById( layerId );

            // verifiying  related children objects
            if ( !getLayerConfig )
                return true;
            var layerConfig = getLayerConfig[1];
            var featureType = getLayerConfig[0];
            if ( !('popupDisplayChildren' in layerConfig) || layerConfig.popupDisplayChildren != 'True')
                return true;
            if ( !('relations' in config) || !(layerId in config.relations) )
                return true;

            // Display related children objects
            var relations = config.relations[layerId];
            var popupMaxFeatures = 10;
            if ( 'popupMaxFeatures' in layerConfig && !isNaN(parseInt(layerConfig.popupMaxFeatures)) )
                popupMaxFeatures = parseInt(layerConfig.popupMaxFeatures);
            popupMaxFeatures == 0 ? 10 : popupMaxFeatures;
            getLayerFeature(featureType, fid, function(feat) {
                var parentDiv = self.parent();

                // Array of Promise w/ fetch to request children popup content
                const popupChidrenRequests = [];

                // Array of pre-processed objects for WMS popup requests
                const preProcessedRequests = [];

                // Array of object contains utilities for each relation
                const preProcessUtilities = [];

                const rConfigLayerAll = [];

                // Build POST query for every child based on QGIS relations
                for ( const relation of relations ){
                    const rLayerId = relation.referencingLayer;
                    let preProcessRequest = null;

                    // prepare utilities object
                    let rUtilities = {
                        rLayerId : rLayerId, // pivot id or table id
                        relationId: relation.relationId, // relationId
                    };
                    const pivotAttributeLayerConf = lizMap.getLayerConfigById( rLayerId, lizMap.config.attributeLayers, 'layerId' );
                    // check if child is a pivot table
                    if (pivotAttributeLayerConf && pivotAttributeLayerConf[1]?.pivot == 'True' && config.relations.pivot && config.relations.pivot[rLayerId]) {
                        // looking for related children
                        const pivotConfig =  lizMap.getLayerConfigById(
                            rLayerId,
                            config.layers,
                            'id'
                        );
                        if (pivotConfig) {
                            // n to m -> get "m" layer id
                            var mLayer = Object.keys(config.relations.pivot[rLayerId]).filter((k)=>{ return k !== layerId})
                            if (mLayer.length == 1) {
                                // "m" layer config
                                const mLayerConfig = getLayerConfigById( mLayer[0] );
                                if (mLayerConfig) {
                                    let clRefname = mLayerConfig[1]?.shortname || mLayerConfig[1]?.cleanname;
                                    if ( clRefname === undefined ) {
                                        clRefname = cleanName(mLayerConfig[1].name);
                                        mLayerConfig[1].cleanname = clRefname;
                                    }
                                    if (mLayerConfig[1].popup == 'True' && self.parent().find('div.lizmapPopupChildren.'+clRefname).length == 0) {
                                        // get results from pivot table
                                        const typeName = pivotConfig[1].typename;
                                        const wfsParams = {
                                            TYPENAME: typeName,
                                            GEOMETRYNAME: 'extent'
                                        };

                                        wfsParams['EXP_FILTER'] = '"' + config.relations.pivot[rLayerId][layerId] + '" = ' + "'" + feat.properties[relation.referencedField] + "'";
                                        // Calculate bbox
                                        if (config.options?.limitDataToBbox == 'True') {
                                            wfsParams['BBOX'] = lizMap.mainLizmap.map.getView().calculateExtent();
                                            wfsParams['SRSNAME'] = lizMap.mainLizmap.map.getView().getProjection().getCode();
                                        }
                                        preProcessRequest = lizMap.mainLizmap.wfs.getFeature(wfsParams);

                                        let ut = {
                                            pivotTableId: rLayerId,
                                            mLayerConfig: mLayerConfig
                                        }
                                        rUtilities = {...rUtilities,...ut};
                                    }
                                }
                            }
                        }
                    } else {
                        // one to n relation
                        const rGetLayerConfig = getLayerConfigById( rLayerId );
                        if ( rGetLayerConfig ) {
                            preProcessRequest = {
                                oneToN:true,
                                layer:rGetLayerConfig[1],
                                relationId:relation.relationId,
                            }
                            let ut = {
                                referencingField: relation.referencingField,
                                referencedField: relation.referencedField
                            }
                            rUtilities = {...rUtilities, ...ut}
                        }
                    }
                    preProcessedRequests.push(preProcessRequest);
                    preProcessUtilities.push(rUtilities)
                }

                Promise.allSettled(preProcessedRequests).then(preProcessResponses =>{
                    for (let rr = 0; rr < preProcessResponses.length; rr++) {
                        const resp = preProcessResponses[rr];
                        const utilities = preProcessUtilities[rr];
                        if (resp.value) {
                            const respValue = resp.value;
                            var confLayer = null, wmsFilter = null;
                            if (respValue.oneToN && utilities.referencingField && utilities.referencedField) {
                                confLayer = respValue.layer;
                                wmsFilter = '"'+utilities.referencingField+'" = \''+feat.properties[utilities.referencedField]+'\'';
                            } else {
                                if (respValue.features) {
                                    const features = respValue.features;
                                    const referencedFieldForFilter = config.relations[utilities.mLayerConfig[1].id].filter((fil)=>{
                                        return fil.referencingLayer == utilities.rLayerId
                                    })[0]?.referencedField;
                                    let filArray = [];
                                    const feats = {};
                                    features.forEach((feat)=>{
                                        var fid = feat.id.split('.')[1];
                                        feats[fid] = feat;
                                        if (feat.properties && feat.properties[config.relations.pivot[utilities.rLayerId][utilities.mLayerConfig[1].id]]) {
                                            filArray.push(feat.properties[config.relations.pivot[utilities.rLayerId][utilities.mLayerConfig[1].id]])
                                        }
                                    })

                                    if (filArray.length) {
                                        let fil = filArray.map(function(val){
                                            return '"'+referencedFieldForFilter+'" = \''+val+'\'';
                                        })

                                        wmsFilter = fil.join(" OR ");
                                    }
                                    const pivotConfig = lizMap.getLayerConfigById(
                                        utilities.pivotTableId,
                                        config.layers,
                                        'id'
                                    );
                                    pivotConfig[1].features = feats;
                                    // get feature of mLayer
                                    confLayer = utilities.mLayerConfig[1];
                                }
                            }
                            if (wmsFilter && confLayer) {
                                const rConfigLayer = confLayer;
                                let clname = rConfigLayer?.shortname || rConfigLayer.cleanname;
                                if ( clname === undefined ) {
                                    clname = cleanName(rConfigLayer.name);
                                    rConfigLayer.cleanname = clname;
                                }
                                if ( rConfigLayer.popup == 'True' && self.parent().find('div.lizmapPopupChildren.'+clname).length == 0) {
                                    let wmsName = rConfigLayer?.shortname || rConfigLayer.name;
                                    const wmsOptions = {
                                        'LAYERS': wmsName
                                        ,'QUERY_LAYERS': wmsName
                                        ,'STYLES': ''
                                        ,'SERVICE': 'WMS'
                                        ,'VERSION': '1.3.0'
                                        ,'CRS': (('crs' in rConfigLayer) && rConfigLayer.crs != '') ? rConfigLayer.crs : 'EPSG:4326'
                                        ,'REQUEST': 'GetFeatureInfo'
                                        ,'EXCEPTIONS': 'application/vnd.ogc.se_inimage'
                                        ,'FEATURE_COUNT': popupMaxFeatures
                                        ,'INFO_FORMAT': 'text/html'
                                    };
                                    if ( 'popupMaxFeatures' in rConfigLayer && !isNaN(parseInt(rConfigLayer.popupMaxFeatures)) )
                                        wmsOptions['FEATURE_COUNT'] = parseInt(rConfigLayer.popupMaxFeatures);
                                    if ( wmsOptions['FEATURE_COUNT'] == 0 )
                                        wmsOptions['FEATURE_COUNT'] = popupMaxFeatures;
                                    if ( rConfigLayer.request_params && rConfigLayer.request_params.filter &&
                                        rConfigLayer.request_params.filter !== '' )
                                        wmsOptions['FILTER'] = rConfigLayer.request_params.filter+' AND '+wmsFilter;
                                    else
                                        wmsOptions['FILTER'] = wmsName+':'+wmsFilter;

                                    // Fetch queries
                                    // Keep `rConfigLayer` in array with same order that fetch queries
                                    // for later user when Promise.allSettled resolves
                                    rConfigLayerAll.push(rConfigLayer);
                                    popupChidrenRequests.push(
                                        fetch(globalThis['lizUrls'].service, {
                                            "method": "POST",
                                            "body": new URLSearchParams(wmsOptions)
                                        }).then(function (response) {
                                            return response.text();
                                        }).then( function (textResp) {
                                            // add utilities object to response for further controls
                                            return {
                                                popupChildData:textResp,
                                                utilities:utilities
                                            }
                                        })
                                    );
                                }
                            }
                        }
                    }

                    // Fetch GetFeatureInfo query for every children popups
                    Promise.allSettled(popupChidrenRequests).then(popupChildrenData => {

                        const childPopupElements = [];

                        for (let index = 0; index < popupChildrenData.length; index++) {
                            let popupResponse = popupChildrenData[index].value;
                            let popupChildData = popupResponse.popupChildData;
                            const utilities = popupResponse.utilities;
                            var hasPopupContent = (!(!popupChildData || popupChildData == null || popupChildData == ''))
                            if (hasPopupContent) {
                                var popupReg = new RegExp('lizmapPopupTable', 'g');
                                popupChildData = popupChildData.replace(popupReg, 'table table-condensed table-striped lizmapPopupTable');

                                const configLayer = rConfigLayerAll[index];

                                var clname = configLayer.cleanname;
                                if (clname === undefined) {
                                    clname = cleanName(configLayer.name);
                                    configLayer.cleanname = clname;
                                }

                                if(utilities.pivotTableId){
                                    var popupFeatureToolbarReg = new RegExp('<lizmap-feature-toolbar ', 'g');
                                    popupChildData = popupChildData.replace(popupFeatureToolbarReg,"<lizmap-feature-toolbar parent-layer-id='"+layerId+"' pivot-layer='"+utilities.pivotTableId+':'+fid+"'")

                                }

                                const resizeTablesButtons =
                                  '<button class="compact-tables btn btn-sm" data-bs-toggle="tooltip" data-bs-title="' + lizDict['popup.table.compact'] + '"><i class="icon-resize-small"></i></button>'+
                                  '<button class="explode-tables btn btn-sm hide" data-bs-toggle="tooltip" data-bs-title="' + lizDict['popup.table.explode'] + '"><i class="icon-resize-full"></i></button>';

                                var childPopup = $('<div class="lizmapPopupChildren ' + clname + '" data-layername="' + clname + '" data-title="' + configLayer.title + '">' + resizeTablesButtons + popupChildData + '</div>');

                                // Manage if the user choose to create a table for children
                                if (['qgis', 'form'].indexOf(configLayer.popupSource) !== -1 && childPopup.find('.lizmap_merged').length != 0) {
                                    // save inputs
                                    childPopup.find(".lizmapPopupDiv").each(function (i, e) {
                                        var popupDiv = $(e);
                                        if (popupDiv.find(".lizmapPopupHeader").prop("tagName") == 'TR') {
                                            popupDiv.find(".lizmapPopupHeader").prepend("<th></th>");
                                            popupDiv.find(".lizmapPopupHeader").next().prepend("<td></td>");
                                        } else {
                                            popupDiv.find(".lizmapPopupHeader").next().prepend("<span></span>");
                                        }
                                        popupDiv.find(".lizmapPopupHeader").next().children().first().append(popupDiv.find("input"));
                                    });
                                    childPopup.find("h4").each(function (i, e) {
                                        if (i != 0)
                                            $(e).remove();
                                    });

                                    childPopup.find(".lizmapPopupHeader").each(function (i, e) {
                                        if (i != 0)
                                            $(e).remove();
                                    });

                                    childPopup.find(".lizmapPopupDiv").contents().unwrap();
                                    childPopup.find(".lizmap_merged").contents().unwrap();
                                    childPopup.find(".lizmapPopupDiv").remove();
                                    childPopup.find(".lizmap_merged").remove();

                                    childPopup.find(".lizmapPopupHidden").hide();

                                    var tChildPopup = $("<table class='lizmap_merged'></table>");
                                    childPopup.append(tChildPopup);
                                    childPopup.find('tr').appendTo(tChildPopup);

                                    childPopup.children('tbody').remove();
                                }

                                var oldPopupChild = parentDiv.find('div.lizmapPopupChildren.' + clname);
                                if (oldPopupChild.length != 0) {
                                    oldPopupChild.remove();
                                }

                                parentDiv.append(childPopup);

                                childPopupElements.push({
                                    childPopupElement:childPopup,
                                    relationId:utilities.relationId,
                                });

                                // Trigger event for single popup children
                                lizMap.events.triggerEvent(
                                    "lizmappopupchildrendisplayed",
                                    { 'html': childPopup.html() }
                                );
                            }
                        }

                        // Handle compact-tables/explode-tables behaviour
                        parentDiv.find('.lizmapPopupChildren .popupAllFeaturesCompact table').DataTable({
                            order: [[1, 'asc']],
                            language: { url:globalThis['lizUrls']["dataTableLanguage"] }
                        });

                        parentDiv.find('.lizmapPopupChildren .compact-tables, .lizmapPopupChildren .explode-tables').tooltip();

                        parentDiv.find('.lizmapPopupChildren .compact-tables').off('click').on('click',function() {
                            $(this)
                                .addClass('hide')
                                .siblings('.explode-tables').removeClass('hide')
                                .siblings('.popupAllFeaturesCompact, .lizmapPopupSingleFeature').toggle();
                        });

                        parentDiv.find('.lizmapPopupChildren .explode-tables').off('click').on('click',function () {
                            $(this)
                                .addClass('hide')
                                .siblings('.compact-tables').removeClass('hide')
                                .siblings('.popupAllFeaturesCompact, .lizmapPopupSingleFeature').toggle();
                        });

                        // place children in the right div, if any
                        let relations = parentDiv.children('.container.popup_lizmap_dd').find(".popup_lizmap_dd_relation");
                        relations.each((ind, relation) => {
                            let relationId = relation.dataset.relationId;
                            let elementToMove = childPopupElements.filter(c => c.relationId == relationId);
                            if (elementToMove.length == 1) {
                                $(relation).append(elementToMove[0].childPopupElement);
                            }
                        });

                        // Trigger event for all popup children
                        lizMap.events.triggerEvent(
                            "lizmappopupallchildrendisplayed",
                            {
                                parentPopupElement: self.parents('.lizmapPopupSingleFeature'),
                                childPopupElements: childPopupElements.map(c => c.childPopupElement)
                            }
                        );
                    });
                })
            });
        });
    }

    /**
     *
     */
    function addFeatureInfo() {
        // Verifying layers
        var popupsAvailable = false;
        for ( var l in config.layers ) {
            var configLayer = config.layers[l];
            var editionLayer = null;
            if ( ('editionLayers' in config) && (l in config.editionLayers) )
                editionLayer = config.editionLayers[l];
            if( (configLayer && configLayer.popup && configLayer.popup == 'True')
           || (editionLayer && ( editionLayer.capabilities.modifyGeometry == 'True'
                              || editionLayer.capabilities.modifyAttribute == 'True'
                              || editionLayer.capabilities.deleteFeature == 'True') ) ){
                popupsAvailable = true;
                break;
            }
        }
        if ( !popupsAvailable ) {
            if ($('#mapmenu .nav-list > li.popupcontent > a').length ) {
                $('#mapmenu .nav-list > li.popupcontent').remove();
            }
            return null;
        }

        // Create the dock if needed
        if( 'popupLocation' in config.options &&
            config.options.popupLocation != 'map' ) {
            if ( !$('#mapmenu .nav-list > li.popupcontent > a').length ) {
                // Verifying the message
                if ( !('popup.msg.start' in lizDict) )
                    lizDict['popup.msg.start'] = 'Click to the map to get informations.';
                // Initialize dock
                var popupContainerId = 'popupcontent';
                var pcontent = '<div class="lizmapPopupContent"><h4>'+lizDict['popup.msg.start']+'</h4></div>';
                addDock(popupContainerId, 'Popup', config.options.popupLocation, pcontent, 'icon-comment');
                $('#button-popupcontent').click(function(){
                    if($(this).parent().hasClass('active')) {
                        // clear highlight layer
                        lizMap.mainLizmap.map.clearHighlightFeatures();
                        // remove information
                        $('#popupcontent > div.menu-content').html('<div class="lizmapPopupContent"><h4>'+lizDict['popup.msg.start']+'</h4></div>');
                    }
                });
            } else {
                $('#mapmenu .nav-list > li.popupcontent > a > span.icon').append('<i class="icon-comment icon-white" style="margin-left: 4px;"></i>');
                $('#mapmenu .nav-list > li.popupcontent > a > span.icon').css('background-image', 'none');
            }
        }

        /**
         *
         * @param evt
         */
        function refreshGetFeatureInfo( evt ) {
            if ( !evt.updateDrawing )
                return;
            if ( lastLonLatInfo == null )
                return true;
            var lastPx = map.getPixelFromLonLat(lastLonLatInfo);
            if ( $('#liz_layer_popup  div.lizmapPopupContent').length < 1
          && $('#popupcontent > div.menu-content div.lizmapPopupContent').length < 1)
                return;

            var popupContainerId = "liz_layer_popup";
            if ( $('#'+popupContainerId+' div.lizmapPopupContent input.lizmap-popup-layer-feature-id').length == 0 )
                popupContainerId = 'popupcontent';

            // Refresh if needed
            var refreshInfo = false;
            $('#'+popupContainerId+' div.lizmapPopupContent input.lizmap-popup-layer-feature-id').each(function(){
                var self = $(this);
                var val = self.val();
                var fid = val.split('.').pop();
                var layerId = val.replace( '.' + fid, '' );
                var aConfig = lizMap.getLayerConfigById( layerId );
                if ( aConfig && aConfig[0] == evt.featureType ) {
                    refreshInfo = true;
                    return false;
                }
            });
            if ( refreshInfo  ) {
            //lastLonLatInfo = null;
                $('#'+popupContainerId+' div.lizmapPopupContent input.lizmap-popup-layer-feature-id[value="'+evt.layerId+'.'+evt.featureId+'"]').parent().remove();
            }
            return;
        }
        lizMap.events.on({
            "layerFilterParamChanged": function( evt ) {
            // Continue only if there is a popup displayed
            // This would avoid useless GETFILTERTOKEN requests
                let nbPopupDisplayed = document.querySelectorAll('input.lizmap-popup-layer-feature-id').length;
                if (nbPopupDisplayed == 0) {
                    return;
                }

                for ( var  lName in config.layers ) {
                    let lConfig = config.layers[lName];

                    // Do not request if the layer has no popup
                    if ( lConfig.popup != 'True' )
                        continue;

                    // Do not request if the layer has no request parameters
                    if ( !('request_params' in lConfig)
                  || lConfig['request_params'] == null )
                        continue;

                    // Do not get the filter token if the popup is not displayed
                    nbPopupDisplayed = document.querySelectorAll(
                  `input.lizmap-popup-layer-feature-id[value^=${lConfig.id}]`
                    ).length;
                    if (nbPopupDisplayed == 0) {
                        continue;
                    }

                    // Get the filter token only if there is a request_params filter
                    var requestParams = lConfig['request_params'];
                    if ( ('filter' in lConfig['request_params'])
                  && lConfig['request_params']['filter'] != null
                  && lConfig['request_params']['filter'] != "" ) {

                        // Get filter token
                        var sdata = {
                            service: 'WMS',
                            request: 'GETFILTERTOKEN',
                            typename: lName,
                            filter: lConfig['request_params']['filter']
                        };
                        $.post(globalThis['lizUrls'].service, sdata, function(result){
                        // Update layer state
                            lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(lConfig.name).filterToken = {
                                expressionFilter: lConfig['request_params']['exp_filter'],
                                token: result.token
                            };
                            // Refresh GetFeatureInfo
                            refreshGetFeatureInfo(evt);
                        });
                    }
                }
            },
            "layerSelectionChanged": function( evt ) {
                refreshGetFeatureInfo(evt);
            },
            "lizmapeditionfeaturedeleted": function( evt ) {
                if ( $('div.lizmapPopupContent input.lizmap-popup-layer-feature-id').length > 1 ) {
                    refreshGetFeatureInfo(evt);
                } else {
                    if (map.popups.length != 0)
                        map.removePopup(map.popups[0]);

                    if( 'popupLocation' in config.options && config.options.popupLocation != 'map' ){
                        var pcontent = '<div class="lizmapPopupContent"><h4>'+lizDict['popup.msg.no.result']+'</h4></div>';
                        document.querySelector('#popupcontent div.menu-content').innerHTML = pcontent;
                        if ( $('#mapmenu .nav-list > li.popupcontent').hasClass('active') ){
                            document.getElementById('button-popupcontent').click();
                        }
                        if ( !$('#mapmenu .nav-list > li.popupcontent').hasClass('active') ){
                            $('#mapmenu .nav-list > li.popupcontent').hide();
                        }
                    }
                }
            }
        });
    }

    /**
     *
     * @param aLayerId
     * @param aConfObjet
     * @param aIdAttribute
     */
    function getLayerConfigById( aLayerId, aConfObjet, aIdAttribute ) {
    // Set function parameters if not given
        aConfObjet = typeof aConfObjet !== 'undefined' ?  aConfObjet : config.layers;
        aIdAttribute = typeof aIdAttribute !== 'undefined' ?  aIdAttribute : 'id';

        // Loop through layers to get the one by id
        for ( var lx in aConfObjet ) {
            if ( aConfObjet[lx][aIdAttribute] == aLayerId )
                return [lx, aConfObjet[lx] ];
        }
        return null;
    }


    /**
     *
     */
    function addMeasureControls() {
    // style the sketch fancy
        var sketchSymbolizers = {
            "Point": {
                pointRadius: 4,
                graphicName: "square",
                fillColor: "white",
                fillOpacity: 1,
                strokeWidth: 1,
                strokeOpacity: 1,
                strokeColor: "#333333"
            },
            "Line": {
                strokeWidth: 3,
                strokeOpacity: 1,
                strokeColor: "#666666",
                strokeDashstyle: "dash"
            },
            "Polygon": {
                strokeWidth: 2,
                strokeOpacity: 1,
                strokeColor: "#666666",
                strokeDashstyle: "dash",
                fillColor: "white",
                fillOpacity: 0.3
            }
        };
        var style = new OpenLayers.Style();
        style.addRules([
            new OpenLayers.Rule({symbolizer: sketchSymbolizers})
        ]);
        var styleMap = new OpenLayers.StyleMap({"default": style});

        var measureControls = {
            length: new OpenLayers.Control.Measure(
                OpenLayers.Handler.Path, {
                    persist: true,
                    geodesic: true,
                    immediate: true,
                    handlerOptions: {
                        layerOptions: {
                            styleMap: styleMap
                        }
                    },
                    type:OpenLayers.Control.TYPE_TOOL
                }
            ),
            area: new OpenLayers.Control.Measure(
                OpenLayers.Handler.Polygon, {
                    persist: true,
                    geodesic: true,
                    immediate: true,
                    handlerOptions: {
                        layerOptions: {
                            styleMap: styleMap
                        }
                    },
                    type:OpenLayers.Control.TYPE_TOOL
                }
            ),
            perimeter: new OpenLayers.Control.Measure(
                OpenLayers.Handler.Polygon, {
                    persist: true,
                    geodesic: true,
                    immediate: true,
                    handlerOptions: {
                        layerOptions: {
                            styleMap: styleMap
                        }
                    },
                    type:OpenLayers.Control.TYPE_TOOL
                }
            ),
            angle: new OpenLayers.Control.Measure(
                OpenLayers.Handler.Path, {
                    id: 'angleMeasure',
                    persist: true,
                    geodesic: true,
                    immediate: true,
                    handlerOptions: {
                        maxVertices: 3,
                        layerOptions: {
                            styleMap: styleMap
                        }
                    },
                    type: OpenLayers.Control.TYPE_TOOL
                }
            )
        };
        measureControls.length.events.on({
            activate: function() {
                mAddMessage(lizDict['measure.activate.length'],'info',true).attr('id','lizmap-measure-message');
            },
            deactivate: function() {
                $('#lizmap-measure-message').remove();
            }
        });
        measureControls.area.events.on({
            activate: function() {
                mAddMessage(lizDict['measure.activate.area'],'info',true).attr('id','lizmap-measure-message');
            },
            deactivate: function() {
                $('#lizmap-measure-message').remove();
            }
        });
        measureControls.perimeter.events.on({
            activate: function () {
                mAddMessage(lizDict['measure.activate.perimeter'], 'info', true).attr('id', 'lizmap-measure-message');
            },
            deactivate: function () {
                $('#lizmap-measure-message').remove();
            }
        });
        measureControls.angle.events.on({
            activate: function () {
                mAddMessage(lizDict['measure.activate.angle'], 'info', true).attr('id', 'lizmap-measure-message');
            },
            deactivate: function () {
                $('#lizmap-measure-message').remove();
            }
        });

        measureControls.perimeter.measure = function(geometry, eventType) {
            var stat, order;
            if( OpenLayers.Util.indexOf( geometry.CLASS_NAME, 'LineString' ) > -1) {
                stat = this.getBestLength(geometry);
                order = 1;
            } else {
                stat = this.getBestLength(geometry.components[0]);
                order = 1;
            }
            this.events.triggerEvent(eventType, {
                measure: stat[0],
                units: stat[1],
                order: order,
                geometry: geometry
            });
        };

        /**
         *
         * @param evt
         */
        function handleMeasurements(evt) {
            var units = evt.units;
            var order = evt.order;
            var measure = evt.measure;
            var out = "";

            // Angle
            if (evt.object.id === "angleMeasure") {

                out = lizDict['measure.handle'] + " 0°";

                // Three points are needed to measure an angle
                if (evt.geometry.components.length === 3){
                    // Invert first and second points and use a flag to make this change occurs once until next measurement
                    if(evt.object.invert === undefined){
                        const firstComponent = evt.geometry.components[0].clone();
                        const secondComponent = evt.geometry.components[1].clone();
                        evt.geometry.components[0].move(secondComponent.x - firstComponent.x, secondComponent.y - firstComponent.y);
                        evt.geometry.components[1].move(firstComponent.x - secondComponent.x, firstComponent.y - secondComponent.y);

                        evt.object.invert = true;
                    } else if (evt.type === "measure"){
                        evt.object.invert = undefined;
                    }

                    // Display angle ABC between three points. B is center
                    const A = evt.geometry.components[0];
                    const B = evt.geometry.components[1];
                    const C = evt.geometry.components[2];

                    const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
                    const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
                    const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
                    let angleInDegrees = (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180) / Math.PI;

                    if (isNaN(angleInDegrees)) {
                        angleInDegrees = 0;
                    }

                    out = lizDict['measure.handle'] + " " + angleInDegrees.toFixed(2) + "°";
                }
                // Other measurement tools
            }else{
                if (order == 1) {
                    out += lizDict['measure.handle'] + " " + measure.toFixed(3) + " " + units;
                } else {
                    out += lizDict['measure.handle'] + " " + measure.toFixed(3) + " " + units + "<sup>2</" + "sup>";
                }
            }

            var element = $('#lizmap-measure-message');
            if ( element.length == 0 ) {
                element = mAddMessage(out);
                element.attr('id','lizmap-measure-message');
            } else {
                element.html('<p>'+out+'</p>');
            }
        }

        for(var key in measureControls) {
            var control = measureControls[key];
            control.events.on({
                "measure": handleMeasurements,
                "measurepartial": handleMeasurements
            });
            map.addControl(control);
            controls[key+'Measure'] = control;
        }
        $('#measure-type').change(function() {
            var self = $(this);
            self.find('option').each(function() {
                var val = $( this ).attr('value');
                if ( val in measureControls && measureControls[val].active )
                    measureControls[val].deactivate();
            });
            measureControls[self.val()].activate();
        });
        lizMap.events.on({
            minidockopened: function(e) {
                if ( e.id == 'measure' ) {
                    // Put old OL2 map on top and synchronize position with new OL map
                    lizMap.mainLizmap.newOlMap = false;

                    $('#measure-type').change();
                }
            },
            minidockclosed: function(e) {
                if ( e.id == 'measure' ) {
                    // Put old OL2 map at bottom
                    lizMap.mainLizmap.newOlMap = true;

                    var activeCtrl = '';
                    $('#measure-type option').each(function() {
                        var val = $( this ).attr('value');
                        if ( val in measureControls && measureControls[val].active )
                            activeCtrl = val;
                    });
                    if ( activeCtrl != '' )
                        measureControls[activeCtrl].deactivate();
                }
            }
        });

        $('#measure-stop').click(function(){
            $('#button-measure').click();
        });

        return measureControls;
    }

    /**
     * PRIVATE function: loadProjDefinition
     * load CRS definition and activate it
     *
     * Parameters:
     * aCRS - {String}
     * aCallbalck - {function ( proj )}
     * @param aCRS
     * @param aCallback
     */
    function loadProjDefinition( aCRS, aCallback ) {
        var proj = aCRS.replace(/^\s+|\s+$/g, ''); // trim();
        if ( proj in Proj4js.defs ) {
            aCallback( proj );
        } else {
            $.get( globalThis['lizUrls'].service, {
                'SERVICE':'WMS',
                'REQUEST':'GetProj4'
                ,'authid': proj
            }, function ( aText ) {
                Proj4js.defs[proj] = aText;
                new OpenLayers.Projection(proj);
                aCallback( proj );
            }
            );
        }
    }

    /**
     * PRIVATE function: mCheckMobile
     * Check wether in mobile context.
     *
     *
     * Returns:
     * {Boolean} True if in mobile context.
     */
    function mCheckMobile() {
        var minMapSize = 450;
        var w = $('body').parent()[0].offsetWidth;
        var leftW = w - minMapSize;
        if(leftW < minMapSize || w < minMapSize)
            return true;
        return false;
    }

    /**
     * PRIVATE function: mAddMessage
     * Write message to the UI
     *
     *
     * Returns:
     * {jQuery Object} The message added.
     * @param aMessage
     * @param aType
     * @param aClose
     * @param aTimeout
     */
    function mAddMessage( aMessage, aType, aClose, aTimeout ) {
        var mType = 'info';
        var mTypeList = ['info', 'error', 'danger', 'success'];
        var mClose = false;

        if ( mTypeList.includes(aType) ){
            mType = aType;
        }

        // `.alert-error` does not exist in Bootstrap > 2
        if (mType === 'error') {
            mType = 'danger';
        }

        if ( aClose ){
            mClose = true;
        }

        var html = '<div class="alert alert-'+mType+' alert-dismissible fade show" role="alert" data-alert="alert">';
        html += '<p>'+aMessage+'</p>';

        if ( mClose ){
            html += '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
        }
        html += '</div>';

        var elt = $(html);
        $('#message').append(elt);

        if (aTimeout) {
            window.setTimeout(() => {
                elt.remove();
            }, aTimeout)
        }

        return elt;
    }

    /**
     * PRIVATE function: exportVectorLayer
     * @param aName
     * @param eformat
     * @param restrictToMapExtent
     */
    function exportVectorLayer( aName, eformat, restrictToMapExtent ) {

        restrictToMapExtent = typeof restrictToMapExtent !== 'undefined' ?  restrictToMapExtent : null;

        // right not set
        if ( !('exportLayers' in lizMap.config.options) || lizMap.config.options.exportLayers != 'True' ) {
            mAddMessage(lizDict['layer.export.right.required'], 'danger', true);
            return false;
        }

        // Set function parameters if not given
        eformat = typeof eformat !== 'undefined' ?  eformat : 'GeoJSON';

        // Get selected features
        var cleanName = lizMap.cleanName( aName );
        var selectionLayer = getLayerNameByCleanName( cleanName );

        if (!selectionLayer) {
            selectionLayer = aName;
        }

        // Get the layer Lizmap configuration
        var config_layer = lizMap.config.layers[selectionLayer];

        // Check if the layer is spatial
        const is_spatial = (
            config_layer['geometryType'] && config_layer['geometryType'] != 'none' && config_layer != 'unknown'
        ) ? true : false;

        // Check if there is a selection token
        const has_selection_token = (
            'request_params' in config_layer && 'selectiontoken' in config_layer['request_params']
        && config_layer['request_params']['selectiontoken'] != null
        && config_layer['request_params']['selectiontoken'] != ''
        ) ? true : false;

        // Check for parenthesis inside the layer name
        // There is a bug to be fixed in QGIS Server WFS request for this context
        const parenthesis_regex = /[\(\)]/g;
        const has_parenthesis = selectionLayer.match(parenthesis_regex);

        // If there is a selection, use the selectiontoken,
        // not a list of features ids to avoid to have too big urls
        // There is some cases when we do not want to use the selection token
        // * Layers with no selection token
        // * Layers with parenthesis inside the layer name (Bug to be fixed in QGIS Server WFS request)
        // * Layers with no geometry, because there is no request_params (as it is only for Openlayers layers)
        if (is_spatial && has_selection_token && !has_parenthesis) {
        // Get the WFS URL with no filter
            var getFeatureUrlData = getVectorLayerWfsUrl( aName, null, null, null, restrictToMapExtent );
            // Add the SELECTIONTOKEN parameter
            var selection_token = config_layer['request_params']['selectiontoken'];
            getFeatureUrlData['options']['SELECTIONTOKEN'] = selection_token;
        } else {
        // Get the WFS feature ids
            var featureid = getVectorLayerSelectionFeatureIdsString( selectionLayer );
            // Restrict the WFS URL for these IDS
            var getFeatureUrlData = getVectorLayerWfsUrl( aName, null, featureid, null, restrictToMapExtent );
        }

        // Force download
        getFeatureUrlData['options']['dl'] = 1;

        // Set export format
        getFeatureUrlData['options']['OUTPUTFORMAT'] = eformat;

        // Download file
        document.querySelectorAll('.exportLayer').forEach(el => el.disabled = true);
        mAddMessage(lizDict['layer.export.started'], 'info', true).addClass('export-in-progress');
        Utils.downloadFile(getFeatureUrlData['url'], getFeatureUrlData['options'], () => {
            document.querySelectorAll('.exportLayer').forEach(el => el.disabled = false);
            document.querySelector('#message .export-in-progress button').click();
        });

        return false;
    }

    /**
     *
     * @param aName
     */
    function getVectorLayerSelectionFeatureIdsString( aName ) {
        var featureidParameter = '';
        if( aName in config.layers && config.layers[aName]['selectedFeatures'] ){
            var fids = [];

            // Get WFS typename
            var configLayer = config.layers[aName];
            var typeName = aName.split(' ').join('_');
            if ( 'shortname' in configLayer && configLayer.shortname != '' )
                typeName = configLayer.shortname;

            for( var id in configLayer['selectedFeatures'] ) {
                fids.push( typeName + '.' + configLayer['selectedFeatures'][id] );
            }
            if( fids.length )
                featureidParameter = fids.join();
        }

        return featureidParameter;
    }

    /**
     *
     * @param aName
     * @param aFilter
     * @param aFeatureId
     * @param geometryName
     * @param restrictToMapExtent
     * @param startIndex
     * @param maxFeatures
     */
    function getVectorLayerWfsUrl( aName, aFilter, aFeatureId, geometryName, restrictToMapExtent, startIndex, maxFeatures ) {
        var getFeatureUrlData = {};

        // Set function parameters if not given
        aFilter = typeof aFilter !== 'undefined' ?  aFilter : null;
        aFeatureId = typeof aFeatureId !== 'undefined' ?  aFeatureId : null;
        geometryName = typeof geometryName !== 'undefined' ?  geometryName : null;
        restrictToMapExtent = typeof restrictToMapExtent !== 'undefined' ?  restrictToMapExtent : false;
        startIndex = typeof startIndex !== 'undefined' ?  startIndex : null;
        maxFeatures = typeof maxFeatures !== 'undefined' ?  maxFeatures : null;

        // Build WFS request parameters
        if ( !(aName in config.layers) ) {
            var qgisName = lizMap.getNameByCleanName(aName);
            if ( !qgisName || !(qgisName in config.layers))
                qgisName = lizMap.getNameByShortName(aName);
            if ( !qgisName || !(qgisName in config.layers))
                qgisName = lizMap.getNameByTypeName(aName);
            if ( qgisName && (qgisName in config.layers)) {
                aName = qgisName;
            } else {
                console.log('getVectorLayerWfsUrl: "'+aName+'" and "'+qgisName+'" not found in config');
                return false;
            }
        }
        var configLayer = config.layers[aName];
        var typeName = aName.split(' ').join('_');
        if ( 'shortname' in configLayer && configLayer.shortname != '' )
            typeName = configLayer.shortname;
        else if ( 'typename' in configLayer && configLayer.typename != '' )
            typeName = configLayer.typename;

        var wfsOptions = {
            'SERVICE':'WFS'
            ,'VERSION':'1.0.0'
            ,'REQUEST':'GetFeature'
            ,'TYPENAME':typeName
            ,'OUTPUTFORMAT':'GeoJSON'
        };

        if( startIndex )
            wfsOptions['STARTINDEX'] = startIndex;

        if( maxFeatures )
            wfsOptions['MAXFEATURES'] = maxFeatures;

        var filterParam = [];

        if( aFilter ){
            // Remove layerName followed by :
            aFilter = aFilter.replace( aName + ':', '');
            if ( aFilter != '' )
                filterParam.push( aFilter );
        }else{
            // If not filter passed, check if a filter does not exists for the layer
            if( 'request_params' in config.layers[aName] && 'filter' in config.layers[aName]['request_params'] ){
                var aFilter = config.layers[aName]['request_params']['filter'];
                if( aFilter ){
                    aFilter = aFilter.replace( aName + ':', '');
                    filterParam.push( aFilter );
                }
            }
        }

        // optionnal parameter filterid or EXP_FILTER
        if( aFeatureId )
            wfsOptions['FEATUREID'] = aFeatureId.replace(new RegExp(aName, 'g'), typeName);
        else if( filterParam.length )
            wfsOptions['EXP_FILTER'] = filterParam.join( ' AND ' );


        // Calculate bbox from map extent if needed
        if( restrictToMapExtent ) {
            const mapExtent = lizMap.mainLizmap.map.getView().calculateExtent();
            const transformedExtent = lizMap.mainLizmap.transformExtent (
                mapExtent,
                lizMap.mainLizmap.map.getView().getProjection().getCode(),
                config.layers[aName].crs
            );
            wfsOptions['BBOX'] = transformedExtent.join();
        }

        // Optionnal parameter geometryname
        if( geometryName
        && $.inArray( geometryName.toLowerCase(), ['none', 'extent', 'centroid'] ) != -1
        ){
            wfsOptions['GEOMETRYNAME'] = geometryName;
        }

        getFeatureUrlData['url'] = globalThis['lizUrls'].service;
        getFeatureUrlData['options'] = wfsOptions;

        return getFeatureUrlData;
    }

    /**
     * storage for callbacks given to getFeatureData
     *
     * used to avoid multiple request for the same feature
     * @type {{}}
     */
    var featureDataPool = {};

    /**
     *
     * @param poolId
     * @param features
     */
    function callFeatureDataCallBacks(poolId, features) {
        var callbacksData = featureDataPool[poolId];
        delete featureDataPool[poolId];
        callbacksData.callbacks.forEach(function(callback) {
            if (callback) {
                callback(callbacksData.layerName, callbacksData.filter, features, callbacksData.alias, callbacksData.types);
            }
        });
    }

    /**
     *
     * @param aName
     * @param aFilter
     * @param aFeatureID
     * @param aGeometryName
     * @param restrictToMapExtent
     * @param startIndex
     * @param maxFeatures
     * @param aCallBack
     */
    function getFeatureData(aName, aFilter, aFeatureID, aGeometryName, restrictToMapExtent, startIndex, maxFeatures, aCallBack) {
        // Set function parameters if not given
        aFilter = typeof aFilter !== 'undefined' ?  aFilter : null;
        aFeatureID = typeof aFeatureID !== 'undefined' ? aFeatureID : null;
        aGeometryName = typeof aGeometryName !== 'undefined' ? aGeometryName : null;
        restrictToMapExtent = typeof restrictToMapExtent !== 'undefined' ?  restrictToMapExtent : false;
        startIndex = typeof startIndex !== 'undefined' ?  startIndex : null;
        maxFeatures = typeof maxFeatures !== 'undefined' ?  maxFeatures : null;

        // get layer configs
        if ( !(aName in config.layers) ) {
            var qgisName = lizMap.getNameByCleanName(aName);
            if ( !qgisName || !(qgisName in config.layers))
                qgisName = lizMap.getNameByShortName(aName);
            if ( !qgisName || !(qgisName in config.layers))
                qgisName = lizMap.getNameByTypeName(aName);
            if ( qgisName && (qgisName in config.layers)) {
                aName = qgisName;
            } else {
                console.log('getFeatureData: "'+aName+'" and "'+qgisName+'" not found in config');
                return false;
            }
        }
        var aConfig = config.layers[aName];

        $('body').css('cursor', 'wait');

        var getFeatureUrlData = lizMap.getVectorLayerWfsUrl( aName, aFilter, aFeatureID, aGeometryName, restrictToMapExtent, startIndex, maxFeatures );

        // see if a request for the same feature is not already made
        var poolId = getFeatureUrlData['url'] + "|" + JSON.stringify(getFeatureUrlData['options']);
        if (poolId in featureDataPool) {
            // there is already a request, let's store our callback and wait...
            if (aCallBack) {
                featureDataPool[poolId].callbacks.push(aCallBack);
            }
            return;
        }
        // no request yet, let's do it and store the callback and its parameters
        featureDataPool[poolId] = {
            callbacks: [ aCallBack ],
            layerName: aName,
            filter: aFilter,
            alias: aConfig['alias'],
            types: aConfig['types']
        };

        const wfs = new WFS();
        wfs.getFeature(getFeatureUrlData['options']).then(data => {
            aConfig['featureCrs'] = 'EPSG:4326';

            if (aConfig?.['alias'] && aConfig?.['types']) {
                callFeatureDataCallBacks(poolId, data.features);
                $('body').css('cursor', 'auto');
            } else {
                $.post(globalThis['lizUrls'].service, {
                    'SERVICE':'WFS'
                    ,'VERSION':'1.0.0'
                    ,'REQUEST':'DescribeFeatureType'
                    ,'TYPENAME': ('typename' in aConfig) ? aConfig.typename : aName
                    ,'OUTPUTFORMAT':'JSON'
                }, function(describe) {

                    aConfig['alias'] = describe.aliases;
                    aConfig['types'] = describe.types;
                    aConfig['columns'] = describe.columns;

                    callFeatureDataCallBacks(poolId, data.features);

                    $('body').css('cursor', 'auto');

                },'json');
            }
        });
        return true;
    }

    /**
     *
     * @param feature
     * @param proj
     * @param zoomAction
     */
    function zoomToOlFeature( feature, proj, zoomAction = 'action' ){
        var format = new OpenLayers.Format.GeoJSON({
            ignoreExtraDims: true
        });
        var feat = format.read(feature)[0];
        if( feat && 'geometry' in feat ){
            feat.geometry.transform( proj, lizMap.map.getProjection() );

            // Zoom or center to selected feature
            if( zoomAction == 'zoom' ){
                lizMap.mainLizmap.map.zoomToGeometryOrExtent(feat.geometry.getBounds().toArray());
            } else if( zoomAction == 'center' ){
                const lonlat = feat.geometry.getBounds().getCenterLonLat();
                lizMap.mainLizmap.map.getView().setCenter([lonlat.lon, lonlat.lat]);
            }
        }
    }

    /**
     *
     * @param featureType
     * @param fid
     * @param zoomAction
     */
    function zoomToFeature( featureType, fid, zoomAction = 'zoom' ){
        getLayerFeature(featureType, fid, function(feat) {
            var proj = new OpenLayers.Projection(config.layers[featureType].crs);
            if( config.layers[featureType].featureCrs )
                proj = new OpenLayers.Projection(config.layers[featureType].featureCrs);
            zoomToOlFeature( feat, proj, zoomAction );
        });
    }

    /**
     *
     * @param featureType
     * @param fid
     * @param aCallback
     * @param aCallbackNotfound
     * @param forceToLoad
     */
    function getLayerFeature( featureType, fid, aCallback, aCallbackNotfound, forceToLoad ){
        if ( !aCallback )
            return;
        if ( !(featureType in config.layers) )
            return;

        var layerConfig = config.layers[featureType];
        var featureId = featureType + '.' + fid;

        // Use already retrieved feature
        if(!forceToLoad && layerConfig['features'] && fid in layerConfig['features'] ){
            aCallback(layerConfig['features'][fid]);
        }
        // Or get the feature via WFS in needed
        else{
            getFeatureData(featureType, null, featureId, 'extent', false, null, null,
                function( aName, aFilter, cFeatures, cAliases ){

                    if (cFeatures.length == 1) {
                        var feat = cFeatures[0];
                        if( !layerConfig['features'] ) {
                            layerConfig['features'] = {};
                        }
                        layerConfig['features'][fid] = feat;
                        aCallback(feat);
                    }
                    else if(aCallbackNotfound) {
                        aCallbackNotfound(featureType, fid);
                    }
                });
        }
    }

    /**
     *
     */
    function getVectorLayerFeatureTypes() {
        if ( wfsCapabilities == null ){
            return [];
        }
        return wfsCapabilities.getElementsByTagName('FeatureType');
    }

    /**
     *
     */
    function getVectorLayerResultFormat() {
        let formats = [];
        if ( wfsCapabilities == null ){
            return formats;
        }else{
            for (const format of wfsCapabilities.getElementsByTagName('ResultFormat')[0].children) {
                formats.push(format.tagName);
            }
            return formats;
        }
    }


    /**
     *
     * @param aName
     * @param feat
     * @param aCallback
     */
    function getFeaturePopupContent( aName, feat, aCallback) {
        // Only use this function with callback
        if ( !aCallback )
            return;

        // Only use when feat is set
        if( !feat )
            return false;

        // Get popup content by FILTER and not with virtual click on map
        var filter = '';
        var qgisName = aName;
        if( lizMap.getLayerNameByCleanName(aName) ){
            qgisName = lizMap.getLayerNameByCleanName(aName);
        }

        var layerConfig = null;
        if (qgisName in lizMap.config.layers) {
            layerConfig = lizMap.config.layers[qgisName];
        }

        if( !layerConfig )
            return false;

        var pkey = null;
        // Get primary key with attributelayer options
        if( (qgisName in lizMap.config.attributeLayers) ){
            pkey = lizMap.config.attributeLayers[qgisName]['primaryKey'];
        }


        // Test if primary key is set in the atlas tool
        // Atlas config with one layer (legacy)
        if( !pkey && 'atlasLayer' in lizMap.config.options && 'atlasPrimaryKey' in lizMap.config.options ){
            if( layerConfig.id == lizMap.config.options['atlasLayer'] && lizMap.config.options['atlasPrimaryKey'] != '' ){
                pkey = lizMap.config.options['atlasPrimaryKey'];
            }
        }

        // Atlas config with several layers (LWC >= 3.4)
        if (!pkey && 'atlas' in lizMap.config && 'layers' in lizMap.config.atlas && Array.isArray(lizMap.config.atlas['layers']) && lizMap.config.atlas['layers'].length > 0) {
            for (let index = 0; index < lizMap.config.atlas.layers.length; index++) {
                const layer = lizMap.config.atlas.layers[index];
                if (layerConfig.id === layer.layer){
                    pkey = layer.primaryKey;
                    break;
                }
            }
        }

        if( !pkey )
            return false;

        var pkVal = feat.properties[pkey];

        const wmsName = layerConfig?.shortname || layerConfig?.name || qgisName;
        filter = wmsName + ':"' + pkey + '" = ' + "'" + pkVal + "'" ;

        var crs = 'EPSG:4326';
        if(('crs' in lizMap.config.layers[qgisName]) && lizMap.config.layers[qgisName].crs != ''){
            crs = lizMap.config.layers[qgisName].crs;
        }

        var wmsOptions = {
            'LAYERS': wmsName
            ,'QUERY_LAYERS': wmsName
            ,'STYLES': ''
            ,'SERVICE': 'WMS'
            ,'VERSION': '1.3.0'
            ,'CRS': crs
            ,'REQUEST': 'GetFeatureInfo'
            ,'EXCEPTIONS': 'application/vnd.ogc.se_inimage'
            ,'INFO_FORMAT': 'text/html'
            ,'FEATURE_COUNT': 1
            ,'FILTER': filter
        };

        // Query the server
        $.post(globalThis['lizUrls'].service, wmsOptions, function(data) {
            aCallback(Utils.sanitizeGFIContent(data));
        });
    }

    // Get the popup content for a layer given a feature
    /**
     *
     * @param aName
     * @param feat
     * @param aCallback
     */
    function getFeaturePopupContentByFeatureIntersection(aName, feat, aCallback) {

        // Calculate fake bbox around the feature
        var units = lizMap.map.getUnits();
        var lConfig = lizMap.config.layers[aName];
        var minMapScale = lizMap.config.options.mapScales.at(0);
        var scale = Math.max( minMapScale, lConfig.minScale ) * 2;
        var maxMapScale = lizMap.config.options.mapScales.at(-1);
        if (maxMapScale < lConfig.maxScale && scale > maxMapScale) {
            scale =scale/2 + (maxMapScale-scale/2)/2;
        } else if (scale > lConfig.maxScale) {
            scale =scale/2 + (lConfig.maxScale-scale/2)/2
        }

        var res = OpenLayers.Util.getResolutionFromScale(scale, units);

        var geomType = feat.geometry.CLASS_NAME;
        if (
            geomType == 'OpenLayers.Geometry.Polygon'
      || geomType == 'OpenLayers.Geometry.MultiPolygon'
      || geomType == 'OpenLayers.Geometry.Point'
        ) {
            var lonlat = feat.geometry.getBounds().getCenterLonLat()
        }
        else {
            var vert = feat.geometry.getVertices();
            var middlePoint = vert[Math.floor(vert.length/2)];
            var lonlat = new OpenLayers.LonLat(middlePoint.x, middlePoint.y);
        }

        // Calculate fake bbox
        var bbox = new OpenLayers.Bounds(
            lonlat.lon - 5 * res,
            lonlat.lat - 5 * res,
            lonlat.lon + 5 * res,
            lonlat.lat + 5 * res
        );

        var gfiCrs = lizMap.map.getProjectionObject().toString();
        if ( gfiCrs == 'EPSG:900913' )
            gfiCrs = 'EPSG:3857';

        var wmsOptions = {
            'LAYERS': aName
            ,'QUERY_LAYERS': aName
            ,'STYLES': ''
            ,'SERVICE': 'WMS'
            ,'VERSION': '1.3.0'
            ,'REQUEST': 'GetFeatureInfo'
            ,'EXCEPTIONS': 'application/vnd.ogc.se_inimage'
            ,'BBOX': bbox.toBBOX()
            ,'FEATURE_COUNT': 10
            ,'HEIGHT': 100
            ,'WIDTH': 100
            ,'INFO_FORMAT': 'text/html'
            ,'CRS': gfiCrs
            ,'I': 50
            ,'J': 50
        };

        // Query the server
        $.post(globalThis['lizUrls'].service, wmsOptions, function(data) {
            if (aCallback) {
                aCallback(globalThis['lizUrls'].service, wmsOptions, Utils.sanitizeGFIContent(data));
            }
        });
    }

    // Create new dock or minidock
    // Example : lizMap.addDock('mydock', 'My dock title', 'dock', 'Some content', 'icon-pencil');
    // see icon list here : http://getbootstrap.com/2.3.2/base-css.html#icons
    /**
     *
     * @param dname
     * @param dlabel
     * @param dtype
     * @param dcontent
     * @param dicon
     */
    function addDock( dname, dlabel, dtype, dcontent, dicon){
        // First check if this dname already exists
        if( $('#mapmenu .nav-list > li.'+dname+' > a').length ){
            console.log(dname + ' menu item already exists');
            return;
        }

        // Create menu icon for activating dock
        var dockli = '';
        dockli+='<li class="'+dname+' nav-'+dtype+'">';
        dockli+='   <a id="button-'+dname+'" data-bs-toggle="tooltip" data-bs-title="'+dlabel+'" data-placement="right" data-dockid="'+dname+'" href="#'+dname+'" data-container="#content">';
        dockli += '       <span class="icon"><i class="' + dicon + ' icon-white"></i></span><span class="menu-title">' + dname +'</span>';
        dockli+='   </a>';
        dockli+='</li>';
        $('#mapmenu div ul li.nav-'+dtype+':last').after(dockli);
        if ( $('#mapmenu div ul li.nav-'+dtype+'.'+dname).length == 0 )
            $('#mapmenu div ul li:last').after(dockli);

        //  Remove native lizmap icon
        $('#mapmenu .nav-list > li.'+dname+' > a .icon').css('background-image','none');
        $('#mapmenu .nav-list > li.'+dname+' > a .icon >i ').css('margin-left', '4px');

        // Add tooltip
        $('#mapmenu .nav-list > li.'+dname+' > a').tooltip();

        // Create dock tab content
        var docktab = '';
        docktab+='<div class="tab-pane" id="'+dname+'">';
        if( dtype == 'minidock'){
            docktab+='<div class="mini-dock-close" title="' + lizDict['toolbar.content.stop'] + '" style="padding:7px;float:right;cursor:pointer;"><i class="icon-remove icon-white"></i></div>';
            docktab+='    <div class="'+dname+'">';
            docktab+='        <h3>';
            docktab+='            <span class="title">';
            docktab+='              <i class="'+dicon+' icon-white"></i>';
            docktab+='              <span class="text">&nbsp;'+dlabel+'&nbsp;</span>';
            docktab+='            </span>';
            docktab+='        </h3>';
        }
        docktab+='        <div class="menu-content">';
        docktab+= dcontent;
        docktab+='        </div>';
        docktab+='    </div>';
        docktab+='</div>';
        if( dtype == 'minidock'){
            $('#mini-dock-content').append(docktab);
            $('#'+dname+' div.mini-dock-close').click(function(){
                if( $('#mapmenu .nav-list > li.'+dname).hasClass('active') ){
                    $('#button-'+dname).click();
                }
            });
        }
        else if( dtype == 'right-dock' )
            $('#right-dock-content').append(docktab);
        else if( dtype == 'dock' )
            $('#dock-content').append(docktab);
        else if( dtype == 'bottomdock' )
            $('#bottom-dock-content').append(docktab);

        // Create dock tab li
        var docktabli = '';
        docktabli+= '<li id="nav-tab-'+dname+'"><a href="#'+dname+'" data-toggle="tab">'+dlabel+'</a></li>';
        if( dtype == 'minidock')
            $('#mini-dock-tabs').append(docktabli);
        else if( dtype == 'right-dock' )
            $('#right-dock-tabs').append(docktabli);
        else if( dtype == 'dock' )
            $('#dock-tabs').append(docktabli);
        else if( dtype == 'bottomdock' )
            $('#bottom-dock-tabs').append(docktabli);

    }

    /**
     * PRIVATE function: getFeatureInfoTolerances
     * Get tolerances for point, line and polygon
     * as configured with lizmap plugin, or default
     * if no configuration found.
     * Returns:
     * {Object} The tolerances for point, line and polygon
     */
    function getFeatureInfoTolerances(){

        var tolerances = defaultGetFeatureInfoTolerances;
        if( 'pointTolerance' in config.options
        && 'lineTolerance' in config.options
        && 'polygonTolerance' in config.options
        ){
            tolerances = {
                'FI_POINT_TOLERANCE': config.options.pointTolerance,
                'FI_LINE_TOLERANCE': config.options.lineTolerance,
                'FI_POLYGON_TOLERANCE': config.options.polygonTolerance
            };
        }
        return tolerances;

    }

    /* PRIVATE function: isHighDensity
   * Return True when the screen is of high density
   * Returns:
   * Boolean
   */
    /**
     *
     */
    function isHighDensity(){
        return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 124dpi), only screen and (min-resolution: 1.3dppx), only screen and (min-resolution: 48.8dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (min-device-pixel-ratio: 1.3)').matches)) || (window.devicePixelRatio && window.devicePixelRatio > 1.3));
    }

    /**
     *
     * @param layername
     */
    function deactivateMaplayerFilter (layername) {
        let layer = lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layername);
        layer.expressionFilter = null;

        // Remove layer filter
        if( !('request_params' in config.layers[layername]) ){
            config.layers[layername]['request_params'] = {};
        }
        config.layers[layername]['request_params']['exp_filter'] = null;
        config.layers[layername]['request_params']['filtertoken'] = null;
        config.layers[layername]['request_params']['filter'] = null;
    }

    /**
     *
     * @param layername
     * @param filter
     */
    function triggerLayerFilter (layername, filter) {
        // Get layer information
        const layer = lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layername);
        const layerWmsName = layer.wmsName;

        // Add filter to the layer
        if( !filter || filter == ''){
            filter = null;
            var lfilter = null;

        }else{
            var lfilter = layerWmsName + ':' + filter;
        }

        if( !('request_params' in config.layers[layername]) ){
            config.layers[layername]['request_params'] = {};
        }

        // Add WFS exp_filter param
        config.layers[layername]['request_params']['exp_filter'] = filter;

        // Get WMS filter token ( used via GET in GetMap or GetPrint )
        fetch(globalThis['lizUrls'].service, {
            method: "POST",
            body: new URLSearchParams({
                service: 'WMS',
                request: 'GETFILTERTOKEN',
                typename: layername,
                filter: lfilter
            })
        }).then(response => {
            return response.json();
        }).then(result => {
            var filtertoken = result.token;
            // Add OpenLayers layer parameter
            config.layers[layername]['request_params']['filtertoken'] = filtertoken;

            // Update layer state
            lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layername).filterToken = {
                expressionFilter: config.layers[layername]['request_params']['exp_filter'],
                token: result.token
            };


            // Tell popup to be aware of the filter
            lizMap.events.triggerEvent("layerFilterParamChanged",
                {
                    'featureType': layername,
                    'filter': lfilter,
                    'updateDrawing': false
                }
            );
        });

        return true;
    }

    // creating the lizMap object
    var obj = {
    /**
     * Property: map
     * {<OpenLayers.Map>} The map
     */
        map: null,
        /**
         * Property: layers
         * {Array(<OpenLayers.Layer>)} The layers
         */
        layers: null,
        /**
         * Property: baselayers
         * {Array(<OpenLayers.Layer>)} The base layers
         */
        baselayers: null,
        /**
         * Property: events
         * {<OpenLayers.Events>} An events object that handles all
         *                       events on the lizmap
         */
        events: null,
        /**
         * Property: config
         * {Object} The map config
         */
        config: null,
        /**
         * Property: dictionnary
         * {Object} The map dictionnary
         */
        dictionary: null,
        /**
         * Property: tree
         * {Object} The map tree
         */
        tree: null,
        /**
         * Property: lizmapLayerFilterActive
         * {Object} Contains main filtered layer if filter is active
         */
        lizmapLayerFilterActive: null,

        /**
         * Method: getLizmapDesktopPluginMetadata
         */
        getLizmapDesktopPluginMetadata: function() {
            return getLizmapDesktopPluginMetadata();
        },

        /**
         * Method: checkMobile
         */
        checkMobile: function() {
            return mCheckMobile();
        },

        /**
         * Method: cleanName
         * @param aName
         */
        cleanName: function( aName ) {
            return cleanName( aName );
        },

        /**
         * Method: getNameByCleanName
         * @param cleanName
         */
        getNameByCleanName: function( cleanName ) {
            return getNameByCleanName( cleanName );
        },

        /**
         * Method: getNameByShortName
         * @param shortName
         */
        getNameByShortName: function( shortName ) {
            return getNameByShortName( shortName );
        },

        /**
         * Method: getNameByTypeName
         * @param typeName
         */
        getNameByTypeName: function( typeName ) {
            return getNameByTypeName( typeName );
        },

        /**
         * Method: getLayerNameByCleanName
         * @param cleanName
         */
        getLayerNameByCleanName: function( cleanName ) {
            return getLayerNameByCleanName( cleanName );
        },

        /**
         * Method: addMessage
         * @param aMessage
         * @param aType
         * @param aClose
         * @param aTimeout
         */
        addMessage: function( aMessage, aType, aClose, aTimeout ) {
            return mAddMessage( aMessage, aType, aClose, aTimeout );
        },

        /**
         * Method: transformBounds
         * @param aCRS
         * @param aCallback
         */
        loadProjDefinition: function( aCRS, aCallback ) {
            return loadProjDefinition( aCRS, aCallback );
        },

        /**
         * Method: updateContentSize
         */
        updateContentSize: function() {
            return updateContentSize();
        },

        /**
         * Method: clearDrawLayer
         * @param layerName
         */
        clearDrawLayer: function(layerName) {
            return clearDrawLayer(layerName);
        },

        /**
         * Method: getLayerFeature
         * @param featureType
         * @param fid
         * @param aCallback
         * @param aCallbackNotfound
         * @param forceToLoad
         */
        getLayerFeature: function( featureType, fid, aCallback, aCallbackNotfound, forceToLoad ) {
            getLayerFeature( featureType, fid, aCallback, aCallbackNotfound, forceToLoad );
        },

        /**
         * Method: getFeatureData
         * @param aName
         * @param aFilter
         * @param aFeatureID
         * @param aGeometryName
         * @param restrictToMapExtent
         * @param startIndex
         * @param maxFeatures
         * @param aCallBack
         */
        getFeatureData: function(aName, aFilter, aFeatureID, aGeometryName, restrictToMapExtent, startIndex, maxFeatures, aCallBack) {
            getFeatureData(aName, aFilter, aFeatureID, aGeometryName, restrictToMapExtent, startIndex, maxFeatures, aCallBack);
        },

        /**
         * Method: translateWfsFieldValues
         * @param aName
         * @param fieldName
         * @param fieldValue
         * @param translation_dict
         */
        translateWfsFieldValues: function(aName, fieldName, fieldValue, translation_dict) {
            return translateWfsFieldValues(aName, fieldName, fieldValue, translation_dict);
        },

        /**
         * Method: zoomToFeature
         * @param featureType
         * @param fid
         * @param zoomAction
         */
        zoomToFeature: function( featureType, fid, zoomAction ) {
            zoomToFeature( featureType, fid, zoomAction );
        },

        /**
         * Method: getExternalBaselayersReplacement
         */
        getExternalBaselayersReplacement: function() {
            return externalBaselayersReplacement;
        },

        launchEdition: function() {
            return false;
        },

        deleteEditionFeature: function(){
            return false;
        },

        deactivateToolControls: function( evt ) {
            return deactivateToolControls( evt );
        },

        displayGetFeatureInfo: function( text, xy, coordinate ) {
            return displayGetFeatureInfo( text, xy, coordinate );
        },

        /**
         * Method: exportVectorLayer
         * @param aName
         * @param eformat
         * @param restrictToMapExtent
         */
        exportVectorLayer: function( aName, eformat, restrictToMapExtent ) {
            return exportVectorLayer( aName, eformat, restrictToMapExtent );
        },

        /**
         * Method: getVectorLayerWfsUrl
         * @param aName
         * @param aFilter
         * @param aFeatureId
         * @param geometryName
         * @param restrictToMapExtent
         */
        getVectorLayerWfsUrl: function( aName, aFilter, aFeatureId, geometryName, restrictToMapExtent ) {
            return getVectorLayerWfsUrl( aName, aFilter, aFeatureId, geometryName, restrictToMapExtent );
        },

        /**
         * Method: getVectorLayerFeatureType
         * @returns {Array} Array of FeatureType Elements
         */
        getVectorLayerFeatureTypes: function() {
            return getVectorLayerFeatureTypes();
        },

        /**
         * Method: getVectorLayerResultFormat
         * @returns {string[]} Array of format for file export
         */
        getVectorLayerResultFormat: function() {
            return getVectorLayerResultFormat();
        },

        /**
         * Method: getLayerConfigById
         * @param aLayerId
         * @param aConfObjet
         * @param aIdAttribute
         */
        getLayerConfigById: function( aLayerId, aConfObjet, aIdAttribute ) {
            return getLayerConfigById( aLayerId, aConfObjet, aIdAttribute );
        },

        /**
         * Method: getFeaturePopupContent
         * @param aName
         * @param feat
         * @param aCallback
         */
        getFeaturePopupContent: function( aName, feat, aCallback) {
            return getFeaturePopupContent(aName, feat, aCallback);
        },

        /**
         * Method: getFeaturePopupContentByFeatureIntersection
         * @param aName
         * @param feat
         * @param aCallback
         */
        getFeaturePopupContentByFeatureIntersection: function( aName, feat, aCallback) {
            return getFeaturePopupContentByFeatureIntersection(aName, feat, aCallback);
        },

        /**
         * Method: addGeometryFeatureInfo
         * @param popup
         * @param containerId
         */
        addGeometryFeatureInfo: function(popup, containerId){
            return addGeometryFeatureInfo(popup, containerId);
        },

        /**
         * Method: addChildrenFeatureInfo
         * @param popup
         * @param containerId
         */
        addChildrenFeatureInfo: function(popup, containerId){
            return addChildrenFeatureInfo(popup, containerId);
        },

        /**
         * Method: addChildrenDatavizFilteredByPopupFeature
         * @param popup
         * @param containerId
         */
        addChildrenDatavizFilteredByPopupFeature: function(popup, containerId){
            return addChildrenDatavizFilteredByPopupFeature(popup, containerId);
        },

        /**
         * Method: addDock
         * @param dname
         * @param dlabel
         * @param dtype
         * @param dcontent
         * @param dicon
         */
        addDock: function( dname, dlabel, dtype, dcontent, dicon){
            return addDock(dname, dlabel, dtype, dcontent, dicon);
        },

        /**
         * Method: getHashParamFromUrl
         * Utility function to get searched key in URL's hash
         * @param {string} hash_key - searched key in hash
         * @returns {string} value for searched key
         * @example
         * URL: https://liz.map/index.php/view/map/?repository=demo&project=cats#fid:v_cat20180426181713938.16,other_param:foo
         * console.log(getHashParamFromUrl('fid'))
         * returns 'v_cat20180426181713938.16'
         */
        getHashParamFromUrl: function (hash_key) {
            var ret_val = null;
            var hash = location.hash.replace('#', '');
            var hash_items = hash.split(',');
            for (var i in hash_items) {
                var item = hash_items[i];
                var param = item.split(':');
                if (param.length == 2) {
                    var key = param[0];
                    var val = param[1];
                    if (key == hash_key) {
                        return val;
                    }
                }
            }
            return ret_val;
        },


        /**
         * Apply the global filter on a OpenLayer layer
         * Only used by filter.js and timemanager.js
         * @param layername
         * @param filter
         */
        triggerLayerFilter: function (layername, filter) {
            return triggerLayerFilter(layername, filter);
        },

        /**
         * Deactivate the global filter on a OpenLayer layer
         * Only used by filter.js and timemanager.js
         * @param layername
         */
        deactivateMaplayerFilter: function (layername) {
            // Get layer information
            return deactivateMaplayerFilter(layername);
        },

        /**
         * Method: init
         */
        init: function() {
            // Initialize global variables
            const lizmapVariablesJSON = document.getElementById('lizmap-vars')?.innerText;
            if (lizmapVariablesJSON) {
                try {
                    const lizmapVariables = JSON.parse(lizmapVariablesJSON);
                    for (const variable in lizmapVariables) {
                        globalThis[variable] = lizmapVariables[variable];
                    }
                } catch {
                    console.warn('JSON for Lizmap global variables is not valid!');
                }
            }

            var self = this;

            // Get config
            const configRequest = fetch(globalThis['lizUrls'].config + '?' + new URLSearchParams(globalThis['lizUrls'].params)).then(function (response) {
                if (!response.ok) {
                    throw 'Config not loaded: ' + response.status + ' ' + response.statusText
                }
                return response.json()
            });

            // Get key/value config
            const keyValueConfigRequest = fetch(globalThis['lizUrls'].keyValueConfig + '?' + new URLSearchParams(globalThis['lizUrls'].params)).then(function (response) {
                if (!response.ok) {
                    throw 'Key/value config not loaded: ' + response.status + ' ' + response.statusText
                }
                return response.json()
            });

            // Get WMS, WMTS, WFS capabilities
            const WMSRequest = fetch(globalThis['lizUrls'].service + '&' + new URLSearchParams({ SERVICE: 'WMS', REQUEST: 'GetCapabilities', VERSION: '1.3.0' })).then(function (response) {
                if (!response.ok) {
                    throw 'WMS GetCapabilities not loaded: ' + response.status + ' ' + response.statusText
                }
                return response.text()
            });
            const WMTSRequest = fetch(globalThis['lizUrls'].service + '&' + new URLSearchParams({ SERVICE: 'WMTS', REQUEST: 'GetCapabilities', VERSION: '1.0.0' })).then(function (response) {
                if (!response.ok) {
                    throw 'WMTS GetCapabilities not loaded: ' + response.status + ' ' + response.statusText
                }
                return response.text()
            });
            const WFSRequest = fetch(globalThis['lizUrls'].service + '&' + new URLSearchParams({ SERVICE: 'WFS', REQUEST: 'GetCapabilities', VERSION: '1.0.0' })).then(function (response) {
                if (!response.ok) {
                    throw 'WFS GetCapabilities not loaded: ' + response.status + ' ' + response.statusText
                }
                return response.text()
            });

            // Get feature extent if defined in URL
            let featureExtentRequest;
            // Get feature info if defined in URL
            let getFeatureInfoRequest;
            let getFeatureInfo;

            const urlParameters = (new URL(document.location)).searchParams;

            const layerName = urlParameters.get('layer');
            const filter = urlParameters.get('filter');

            if(layerName && filter){

                // Feature extent
                const wfs = new WFS();
                const wfsParams = {
                    TYPENAME: layerName,
                    EXP_FILTER: filter
                };

                featureExtentRequest = wfs.getFeature(wfsParams);

                // Feature info
                if(urlParameters.get('popup') === 'true'){
                    const wms = new WMS();
                    const wmsParams = {
                        QUERY_LAYERS: layerName,
                        LAYERS: layerName,
                        FEATURE_COUNT: 50, // TODO: get this value from config after it has been loaded?
                        FILTER: `${layerName}:${filter}`,
                    };

                    getFeatureInfoRequest = wms.getFeatureInfo(wmsParams);
                }
            }

            // Request config and capabilities in parallel
            Promise.allSettled([
                configRequest,
                keyValueConfigRequest,
                WMSRequest,
                WMTSRequest,
                WFSRequest,
                featureExtentRequest,
                getFeatureInfoRequest,
            ]).then(async (responses) => {
                // Raise an error when one those required requests fails
                // Other requests can fail silently
                const requiredRequests = [responses[0], responses[2], responses[3], responses[4]];

                for (const request of requiredRequests) {
                    if (request.status === "rejected") {
                        throw new Error(request.reason);
                    }
                }

                // `config` is defined globally
                config = responses[0].value;
                keyValueConfig = responses[1].value;
                const wmsCapaData = responses[2].value;
                const wmtsCapaData = responses[3].value;
                const wfsCapaData = responses[4].value;
                let featuresExtent = responses[5].value?.features?.[0]?.bbox;
                let startupFeatures = responses[5].value?.features;

                if(featuresExtent){
                    for (const feature of startupFeatures) {
                        featuresExtent = extend(featuresExtent, feature.bbox);
                    }
                }

                /**
                 * mainLizmap is loaded in another JS file
                 * and could not be available when `configsloaded` is fired
                 * in this case all the Lizmap is not build
                 * to be sur mainLizmap is ready when `configsloaded` is fired
                 * we have to wait until `lizMap.mainLizmap` is not `undefined`
                 */

                // sleep Promise
                let sleep = ms => new Promise(r => setTimeout(r, ms));
                // sleep step first value the *2
                let sleepStep = 100;
                // max wait to 10 seconds
                const maxWait = 10000;
                // waitFor function returns waiting time in milliseconds
                let waitFor = async function waitFor(f){
                    let waitingTime = 0;
                    while(waitingTime < maxWait && !f()) {
                        await sleep(sleepStep);
                        waitingTime += sleepStep;
                        sleepStep *= 2;
                    }
                    return waitingTime;
                };
                // wait until lizMap.mainLizmap is not undefined
                // lizMap.mainLizmap is defined when configsloaded is fired
                const waitingFor = await waitFor(() => {
                    self.events.triggerEvent("configsloaded", {
                        initialConfig: config,
                        wmsCapabilities: wmsCapaData,
                        wmtsCapabilities: wmtsCapaData,
                        wfsCapabilities: wfsCapaData,
                        startupFeatures: responses[5].value,
                    });
                    return self.mainLizmap !== undefined;
                });
                // lizMap.mainLizmap is still undefined
                if (self.mainLizmap === undefined) {
                    throw new Error('Until we wait '+waitingFor+' ms, mainLizmap has not been loaded!');
                }

                getFeatureInfo = responses[6].value;

                const domparser = new DOMParser();

                config.options.hasOverview = false;

                // store layerIDs
                if ('useLayerIDs' in config.options && config.options.useLayerIDs == 'True') {
                    for (var layerName in config.layers) {
                        var configLayer = config.layers[layerName];
                        layerIdMap[configLayer.id] = layerName;
                    }
                }
                // store shortnames and shortnames
                for (var layerName in config.layers) {
                    var configLayer = config.layers[layerName];
                    if ('shortname' in configLayer && configLayer.shortname != '')
                        shortNameMap[configLayer.shortname] = layerName;
                    configLayer.cleanname = cleanName(layerName);
                }

                // Parse WMS capabilities
                const wmsFormat =  new OpenLayers.Format.WMSCapabilities({version:'1.3.0'});
                capabilities = wmsFormat.read(wmsCapaData);

                if (!capabilities.capability) {
                    throw 'WMS Capabilities error';
                }

                // Parse WMTS capabilities
                const wmtsFormat = new OpenLayers.Format.WMTSCapabilities({});
                wmtsCapabilities = wmtsFormat.read(wmtsCapaData);
                if ('exceptionReport' in wmtsCapabilities) {
                    var wmtsElem = $('#metadata-wmts-getcapabilities-url');
                    if (wmtsElem.length != 0) {
                        wmtsElem.before('<i title="' + wmtsCapabilities.exceptionReport.exceptions[0].texts[0] + '" class="icon-warning-sign"></i>&nbsp;');
                    }
                    wmtsCapabilities = null;
                }
                self.wmtsCapabilities = wmtsCapaData;

                // Parse WFS capabilities
                wfsCapabilities = domparser.parseFromString(wfsCapaData, "application/xml");
                var featureTypes = self.mainLizmap.initialConfig.vectorLayerFeatureTypeList;

                for (const featureType of featureTypes) {
                    var typeName = featureType.Name;
                    var layerName = lizMap.getNameByTypeName(typeName);
                    if (!layerName) {
                        if (typeName in config.layers)
                            layerName = typeName
                        else if ((typeName in shortNameMap) && (shortNameMap[typeName] in config.layers))
                            layerName = shortNameMap[typeName];
                        else {
                            for (var l in config.layers) {
                                if (l.split(' ').join('_') == typeName) {
                                    layerName = l;
                                    break;
                                }
                            }
                        }
                    }

                    if (!(layerName in config.layers))
                        continue;

                    var configLayer = config.layers[layerName];
                    configLayer.typename = typeName;
                    typeNameMap[typeName] = layerName;
                }

                //set title and abstract coming from capabilities
                $('#abstract').html(capabilities.abstract ? capabilities.abstract : '');

                // get and analyse tree
                var capability = capabilities.capability;

                // Copy QGIS project's projection
                config.options.qgisProjectProjection = Object.assign({}, config.options.projection);

                // Add the config in self here to be able
                // to let the JS external script modify some plugin cfg layers properties
                // before Lizmap will create the layer tree
                self.config = config;
                /**
                 * Event when the tree is going to be created
                 * @event beforetreecreated
                 */
                self.events.triggerEvent("beforetreecreated", self);
                buildNativeScales();

                var firstLayer = capability.nestedLayers[0];

                // Re-save the config in self
                self.config = config;
                self.keyValueConfig = keyValueConfig;

                // create the map
                initProjections(firstLayer);
                createMap(featuresExtent);
                self.map = map;
                self.layers = layers;
                self.baselayers = baselayers;
                self.controls = controls;
                /**
                 * Event when the map has been created
                 * @event mapcreated
                 */
                self.events.triggerEvent("mapcreated", self);

                // Add empty baselayer as needed by OL2 map
                if (baselayers.length === 0) {
                    // hide elements for baselayers
                    map.addLayer(new OpenLayers.Layer.Vector('baselayer',{
                        maxExtent:map.maxExtent
                        ,maxScale: map.maxScale
                        ,minScale: map.minScale
                        ,numZoomLevels: map.numZoomLevels
                        ,scales: map.scales
                        ,projection: map.projection
                        ,units: map.projection.proj.units
                    }));
                }

                /**
                 * Event when layers have been added
                 * @event layersadded
                 */
                self.events.triggerEvent("layersadded", self);


                // Verifying z-index
                var lastLayerZIndex = map.layers[map.layers.length - 1].getZIndex();
                if (lastLayerZIndex > map.Z_INDEX_BASE['Feature'] - 100) {
                    map.Z_INDEX_BASE['Feature'] = lastLayerZIndex + 100;
                    map.Z_INDEX_BASE['Popup'] = map.Z_INDEX_BASE['Feature'] + 25;
                    if (map.Z_INDEX_BASE['Popup'] > map.Z_INDEX_BASE['Control'] - 25)
                        map.Z_INDEX_BASE['Control'] = map.Z_INDEX_BASE['Popup'] + 25;
                }

                // initialize the map
                // Set map extent depending on options
                if (!map.getCenter()) {
                    map.zoomToExtent(map.initialExtent, map.zoomToClosest);
                }

                updateContentSize();
                map.events.triggerEvent("zoomend", { "zoomChanged": true });

                // create toolbar
                createToolbar();
                self.events.triggerEvent("toolbarcreated", self);

                // Handle docks visibility
                document.querySelector('#mapmenu .nav').addEventListener('click', evt => {
                    let dockType;
                    const liClicked = evt.target.closest('li');
                    if (!liClicked) {
                        return;
                    }

                    for (const className of liClicked.classList) {
                        if (className.includes('nav-')) {
                            dockType = className.split('nav-')[1];
                        }
                    }

                    if (!dockType) {
                        return;
                    }

                    evt.preventDefault();

                    const linkClicked = evt.target.closest('a');
                    const dockId = linkClicked.dataset.dockid;
                    const parentElement = linkClicked.parentElement;
                    const wasActive = parentElement.classList.contains('active');

                    const dockContentSelector = dockType == 'minidock' ? '#mini-dock-content > div' : '#' + dockType + '-content > div';

                    document.querySelectorAll('#mapmenu .nav-' + dockType).forEach(element => {
                        element.classList.remove('active');
                    });
                    document.querySelectorAll(dockContentSelector).forEach(element => element.classList.add('hide'));
                    parentElement.classList.toggle('active', !wasActive);
                    if (dockId) {
                        document.getElementById(dockId).classList.toggle('hide', wasActive);
                    }

                    const dockEvent = dockType == 'right-dock' ? 'rightdock' : dockType;

                    const lizmapEvent = wasActive ? dockEvent + 'closed' : dockEvent + 'opened';
                    lizMap.events.triggerEvent(lizmapEvent, { 'id': dockId });

                    return false;
                });

                // hide mini-dock if no tool is active
                if ($('#mapmenu ul li.nav-minidock.active').length == 0) {
                    $('#mini-dock-content > .tab-pane.active').removeClass('active');
                    $('#mini-dock-tabs li.active').removeClass('active');
                }

                // Toggle menu visibility
                $('#menuToggle').click(function(){
                    $(this).toggleClass('opened');
                });

                // Hide mapmenu when menu item is clicked in mobile context
                $('#menuToggle:visible ~ #mapmenu ul').on('click', 'li > a', function () {
                    $('#menuToggle').removeClass('opened');
                });

                // Show layer switcher
                updateContentSize();

                self.events.triggerEvent("uicreated", self);
            })
                .catch((error) => {
                    console.error(error);
                    // Generic error message
                    let errorMsg = `
          <p class="error-msg">
          ${lizDict['startup.error']}<br>
          `;
                    if (document.body.dataset.lizmapAdminUser == 1) {
                        // The user is an administrator, we add more infos and buttons.
                        if (document.body.dataset.lizmapUserDefinedJsCount > 0) {
                            errorMsg += `${lizDict['startup.user_defined_js']}<br>

                            <a href="${globalThis['lizUrls'].repositoryAdmin}"><button class="btn btn-primary" type="button">${lizDict['startup.goToRepositoryAdmin']}</button></a>
                            <a href="`+ window.location+`&no_user_defined_js=1"><button class="btn btn-primary" type="button">${lizDict['startup.projectWithoutJSLink']}</button></a>
                    `;
                        } else {
                            // No additional JavaScript, but still failing, we propose the developer tools :/
                            errorMsg += `${lizDict['startup.error.developer.tools']}<br>`;
                        }
                    // If the flag no_user_defined_js=1, we could give more info ?
                    } else {
                        // The user is not an administrator, we invite the admin, and button to get back home
                        errorMsg += `${lizDict['startup.error.administrator']}<br>`;
                    }
                    errorMsg += `<a href="${globalThis['lizUrls'].basepath}"><button class="btn btn-primary" type="button">${lizDict['startup.goToProject']}</button></a>`;
                    errorMsg += `</p>`;
                    document.getElementById('header').insertAdjacentHTML('afterend', errorMsg);
                })
                .finally(() => {
                    $('body').css('cursor', 'auto');
                    $('#loading').dialog('close');

                    // Display getFeatureInfo if requested
                    if(getFeatureInfo){
                        displayGetFeatureInfo(getFeatureInfo,
                            {
                                x: map.size.w / 2,
                                y: map.size.h / 2
                            });
                    }
                });
        }
    };
    // initializing the lizMap events
    obj.events = new OpenLayers.Events(
        obj, null,
        ['treecreated','mapcreated','layersadded','uicreated',
            'dockopened','dockclosed'],
        true,
        {includeXY: true}
    );
    return obj;
}();
/*
 * it's possible to add event listener
 * before the document is ready
 * but after this file
 */
lizMap.events.on({
    uicreated: function(){

        // Update legend if mobile
        if( lizMap.checkMobile() ){
            if( $('#button-switcher').parent().hasClass('active') )
                $('#button-switcher').click();
        }

        // Connect dock close button
        document.getElementById('dock-close').addEventListener('click', () => { document.querySelector('#mapmenu .nav-list > li.active.nav-dock a').click();});
        document.getElementById('right-dock-close').addEventListener('click', () => { document.querySelector('#mapmenu .nav-list > li.active.nav-right-dock > a').click();});
    }
});

$(document).ready(function () {
    // start waiting
    $('body').css('cursor', 'wait');
    $('#loading').dialog({
        modal: true
        , draggable: false
        , resizable: false
        , closeOnEscape: false
        , dialogClass: 'liz-dialog-wait'
        , minHeight: 128
    })
        .parent().removeClass('ui-corner-all')
        .children('.ui-dialog-titlebar').removeClass('ui-corner-all');
    // configurate OpenLayers
    OpenLayers.DOTS_PER_INCH = 96;

    // initialize LizMap
    lizMap.init();

    // Init bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
        trigger: 'hover'
    }));
    $( "#loading" ).css('min-height','128px');
});
