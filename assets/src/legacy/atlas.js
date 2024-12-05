/**
 * @module legacy/atlas.js
 * @name Atlas
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import DOMPurify from 'dompurify';
import GeoJSON from 'ol/format/GeoJSON.js';
import { getCenter } from 'ol/extent.js';

(function () {

    lizMap.events.on({
        'uicreated': function () {

            var lizAtlasLayers;

            // Single atlas layer
            if ('atlasEnabled' in lizMap.config.options && lizMap.config.options['atlasEnabled'] === 'True'){
                var cfgOptions = lizMap.config.options;
                var atlasLayer = {};

                atlasLayer[cfgOptions.atlasLayer] = {
                    atlasDuration: cfgOptions.atlasDuration,
                    atlasFeatureLabel: cfgOptions.atlasFeatureLabel,
                    atlasZoom: cfgOptions.atlasZoom,
                    atlasPrimaryKey: cfgOptions.atlasPrimaryKey,
                    atlasTriggerFilter: cfgOptions.atlasTriggerFilter,
                    atlasHighlightGeometry: cfgOptions.atlasHighlightGeometry,
                    atlasDisplayLayerDescription: cfgOptions.atlasDisplayLayerDescription,
                    atlasDisplayPopup: cfgOptions.atlasDisplayPopup,
                    atlasSortField: cfgOptions.atlasSortField
                }

                lizAtlasLayers = {
                    layerOptions: atlasLayer,
                    globalOptions: {
                        atlasShowAtStartup: cfgOptions.atlasShowAtStartup,
                        atlasAutoPlay: cfgOptions.atlasAutoPlay
                    }
                }
            }
            // Multiple atlas layer
            else if ('atlas' in lizMap.config && 'layers' in lizMap.config.atlas && Array.isArray(lizMap.config.atlas['layers']) && lizMap.config.atlas['layers'].length > 0){
                var atlasLayers = {};
                for (var index = 0; index < lizMap.config.atlas.layers.length; index++) {
                    const layerConfig = lizMap.config.atlas.layers[index];

                    atlasLayers[layerConfig.layer] = {
                        atlasDuration: layerConfig.duration,
                        atlasFeatureLabel: layerConfig.featureLabel,
                        atlasZoom: layerConfig.zoom,
                        atlasPrimaryKey: layerConfig.primaryKey,
                        atlasTriggerFilter: layerConfig.triggerFilter,
                        atlasHighlightGeometry: layerConfig.highlightGeometry,
                        atlasDisplayLayerDescription: layerConfig.displayLayerDescription,
                        atlasDisplayPopup: layerConfig.displayPopup,
                        atlasSortField: layerConfig.sortField
                    }
                }

                lizAtlasLayers = {
                    layerOptions: atlasLayers,
                    globalOptions: {
                        atlasShowAtStartup: lizMap.config.options.atlasShowAtStartup,
                        atlasAutoPlay: lizMap.config.options.atlasAutoPlay
                    }
                }
            }

            if (!lizAtlasLayers){
                return;
            }

            var lizAtlasLayersCount = Object.keys(lizAtlasLayers.layerOptions).length;
            var getFeatureDataCallbackCounter = 0;

            var atlasGlobalOptions = lizAtlasLayers.globalOptions;
            var lizAtlasGlobalConfig = {
                'showAtStartup': atlasGlobalOptions['atlasShowAtStartup'] == 'True' ? true : false,
                'autoPlay': atlasGlobalOptions['atlasAutoPlay'] == 'True' ? true : false
            };

            var lizAtlasConfigArray = [];

            var layerOrder = 0;

            for (var layerId in lizAtlasLayers.layerOptions) {
                var getLayerConfig = lizMap.getLayerConfigById(layerId);

                // If layer has no config (because current user has no rights to view it for example)
                // decrement lizAtlasLayersCount and continue to next layer
                if (!getLayerConfig){
                    lizAtlasLayersCount--;
                    continue;
                }
                const layerConfig = getLayerConfig[1];
                var featureType = getLayerConfig[0];
                const wmsName = layerConfig?.shortname || featureType;

                var atlasLayerOptions = lizAtlasLayers.layerOptions[layerId];

                var primaryKey = atlasLayerOptions['atlasPrimaryKey'] != '' ? atlasLayerOptions['atlasPrimaryKey'] : null;
                if (!primaryKey)
                    return;
                var titleField = atlasLayerOptions['atlasFeatureLabel'] != '' ? atlasLayerOptions['atlasFeatureLabel'] : null;
                if (!titleField)
                    return;
                var sortField = atlasLayerOptions['atlasSortField'] != '' ? atlasLayerOptions['atlasSortField'] : titleField;

                var lizAtlasConfig = {
                    'layername': featureType,
                    'layerId': layerConfig.id,
                    'wmsName': wmsName,
                    'displayLayerDescription': atlasLayerOptions['atlasDisplayLayerDescription'] == 'True' ? true : false,
                    'primaryKey': primaryKey,
                    'titleField': titleField,
                    'sortField': sortField,
                    'duration': atlasLayerOptions['atlasDuration'],
                    'drawFeatureGeom': atlasLayerOptions['atlasHighlightGeometry'] == 'True' ? true : false,
                    'atlasDisplayPopup': atlasLayerOptions['atlasDisplayPopup'] == 'True' ? true : false,
                    'triggerFilter': atlasLayerOptions['atlasTriggerFilter'] == 'True' ? true : false,
                    'zoom': atlasLayerOptions['atlasZoom'] == '' ? false : atlasLayerOptions['atlasZoom']
                };
                var lizAtlasTimer;

                // Launch Atlas feature
                getAtlasData(lizAtlasConfig, layerOrder);
                layerOrder++;
            }

            /**
             *
             * @param lizAtlasConfig
             * @param layerOrder
             */
            function getAtlasData(lizAtlasConfig, layerOrder) {

                var featureType = lizAtlasConfig.layername;

                // Get data
                lizMap.getFeatureData(featureType, featureType + ':', null, 'geom', false, null, null,
                    function (aName, aFilter, aFeatures, aAliases) {

                        lizAtlasConfig['features'] = aFeatures;
                        lizAtlasConfig['featureType'] = featureType;
                        prepareFeatures(lizAtlasConfig);

                        lizAtlasConfigArray[layerOrder] = lizAtlasConfig;

                        // Launch atlas when last ajax request had finished
                        getFeatureDataCallbackCounter++;
                        if (getFeatureDataCallbackCounter === lizAtlasLayersCount) {
                            launchAtlas(lizAtlasConfigArray, lizAtlasGlobalConfig);
                        }

                        $('body').css('cursor', 'auto');
                        return false;
                    });
            }

            /**
             *
             */
            function updateAtlasData() {
                // Get data
                lizMap.getFeatureData(lizAtlasConfig['featureType'], lizAtlasConfig['featureType'] + ':', null, 'geom', false, null, null,
                    function (aName, aFilter, aFeatures, aAliases) {
                        lizAtlasConfig['features'] = aFeatures;
                        prepareFeatures(lizAtlasConfig);

                        var options = '<option value="-1"> --- </option>';
                        var pkey_field = lizAtlasConfig['primaryKey'];
                        for (var i in lizAtlasConfig['features_sorted']) {
                            var item = lizAtlasConfig['features_sorted'][i];

                            // Add option
                            options += '<option value="' + i + '">';
                            options += item[lizAtlasConfig['titleField']];
                            options += '</option>';
                        }

                        var val = $('#liz-atlas-select').val();
                        $('#liz-atlas-select').html(DOMPurify.sanitize(options));
                        // reset val
                        $('#liz-atlas-select').val(val);
                        // get popup
                        $('#liz-atlas-select').change();

                        return false;
                    });
            }

            /**
             *
             * @param lizAtlasConfig
             */
            function prepareFeatures(lizAtlasConfig) {

                // Get and order features
                lizAtlasConfig['features_with_pkey'] = {};
                var items = [];
                var pkey_field = lizAtlasConfig['primaryKey'];
                var s_field = lizAtlasConfig['sortField'];
                if (!s_field)
                    s_field = pkey_field;
                for (var i in lizAtlasConfig.features) {

                    // Get feature
                    var feat = lizAtlasConfig.features[i];
                    var fid = feat.id.split('.').pop();
                    var pk_val = feat.properties[pkey_field];

                    // Add feature in dictionary for further ref
                    lizAtlasConfig['features_with_pkey'][pk_val] = feat;

                    // Add feature to sorted oject
                    items.push(feat.properties);
                }

                items.sort(function (a, b) {
                    var nameA = a[s_field];
                    var nameB = b[s_field];
                    if (typeof (nameA) == 'string' || typeof (nameB) == 'string') {
                        if (!nameA)
                            nameA = '';
                        else
                            nameA = nameA.toUpperCase(); // ignore upper and lowercase
                        if (!nameB)
                            nameB = '';
                        else
                            nameB = nameB.toUpperCase(); // ignore upper and lowercase
                    }
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;
                });

                lizAtlasConfig['features_sorted'] = items;
            }

            /**
             *
             * @param lizAtlasConfig
             */
            function getAtlasHome(lizAtlasConfig) {


                var home = '';

                // Add description
                if (lizAtlasConfig['displayLayerDescription']) {
                    var labstract = lizMap.config.layers[lizAtlasConfig.layername]['abstract'];
                    if (labstract != '') {
                        home += '<p id="liz-atlas-item-layer-abstract">' + lizMap.config.layers[lizAtlasConfig.layername]['abstract'] + '</p>';
                    }
                }

                // Add combobox with all data
                home += '<p style="padding:0px 10px;">';
                home += '<select id="liz-atlas-select">';
                home += '<option value="-1"> --- </option>';
                var pkey_field = lizAtlasConfig['primaryKey'];
                for (var i in lizAtlasConfig['features_sorted']) {
                    var item = lizAtlasConfig['features_sorted'][i];

                    // Add option
                    home += '<option value="' + i + '">';
                    home += item[lizAtlasConfig['titleField']];
                    home += '</option>';
                }
                home += '</select>';
                home += '<br><span>';
                home += '<button class="btn btn-sm btn-primary liz-atlas-item" value="-1">' + lizDict['atlas.toolbar.prev'] + '</button>';
                home += '&nbsp;';
                home += '<button class="btn btn-sm btn-primary liz-atlas-item" value="1">' + lizDict['atlas.toolbar.next'] + '</button>';
                home += '&nbsp;';
                home += '<button class="btn btn-sm btn-wanrning liz-atlas-run" value="1">' + lizDict['atlas.toolbar.play'] + '</button>';
                home += '&nbsp;';
                home += '</span>';
                home += '</span>';
                home += '</br>';
                home += '</p>';
                home += '<div id="liz-atlas-item-detail" style="display:none;">';
                home += '</div>';
                home += '</div>';

                lizAtlasConfig.home = home;
                return home;
            }

            /**
             *
             * @param lizAtlasConfigArray
             * @param lizAtlasGlobalConfig
             */
            function launchAtlas(lizAtlasConfigArray, lizAtlasGlobalConfig) {

                let atlasHTML = '';

                // Multiple atlas
                if (lizAtlasConfigArray.length > 1){
                    // Build select to choose between atlas layers
                    atlasHTML = '<i class="icon-globe icon-white" style="margin-right: 4px;vertical-align: baseline;"></i><select id="select-atlas-layer">';
                    for (let i = 0; i < lizAtlasConfigArray.length; i++) {
                        atlasHTML += '<option value="' + lizAtlasConfigArray[i].layerId + '">' + lizMap.config.layers[lizAtlasConfigArray[i].layername]['title'] + '</option>';
                    }

                    atlasHTML += '</select>';

                }else{ // Single atlas
                    atlasHTML += '<h3><i class="icon-globe icon-white" style="margin-right: 4px;"></i>' + lizMap.config.layers[lizAtlasConfigArray[0].layername]['title'] + '</h3>';
                }

                atlasHTML += '<div id="atlas-content" style="border-top: #F0F0F0 dashed 1px;padding-top: 5px;"></div>';

                // Add dock
                lizMap.addDock(
                    'atlas',
                    lizDict['atlas.toolbar.title'],
                    'right-dock',
                    atlasHTML,
                    'icon-globe'
                );

                // Multiple atlas
                if (lizAtlasConfigArray.length > 1) {
                    $('#select-atlas-layer')
                        .change(function () {
                            // deactivate current atlas
                            deactivateAtlas();

                            var layerId = $(this).val();

                            for (var i = 0; i < lizAtlasConfigArray.length; i++) {
                                if (layerId === lizAtlasConfigArray[i].layerId) {
                                    lizAtlasConfig = lizAtlasConfigArray[i];
                                    displayAtlasContent();
                                }
                            }

                            lizMap.events.triggerEvent("atlasready", lizAtlasConfig);

                            return false;
                        });

                    // Display first atlas layer
                    $('#select-atlas-layer').change();
                }else{
                    lizAtlasConfig = lizAtlasConfigArray[0];
                    displayAtlasContent();
                }

                // Start animation for first layer if set
                if (lizAtlasGlobalConfig['autoPlay'] && !lizMap.checkMobile()) {
                    $('button.liz-atlas-run').click();
                }

                // Show dock
                if (lizAtlasGlobalConfig['showAtStartup'] && !lizMap.checkMobile()) {
                    $('#mapmenu li.atlas:not(.active) a').click();
                    // Hide legend
                    $('#mapmenu li.switcher.active a').click();
                }

                // Limit dock size
                adaptAtlasSize();
            }

            /**
             *
             */
            function displayAtlasContent(){
                // Get Atlas home
                var home = getAtlasHome(lizAtlasConfig);

                $("#atlas-content").html(DOMPurify.sanitize(home));

                // Add events
                activateAtlasTrigger(lizAtlasConfig);

                // Only if features in layer
                if (lizAtlasConfig.features.length != 0) {
                    // Activate filter
                    if (lizAtlasConfig.triggerFilter && lizAtlasConfig.hideFeaturesAtStratup) {
                        // Select feature
                        lizMap.events.triggerEvent('layerfeatureselected',
                            { 'featureType': lizAtlasConfig.featureType, 'fid': -99999, 'updateDrawing': false }
                        );
                        // Filter selected feature
                        lizMap.events.triggerEvent('layerfeaturefilterselected',
                            { 'featureType': lizAtlasConfig.featureType }
                        );
                    }
                }

                lizMap.events.triggerEvent("uiatlascreated", lizAtlasConfig);

                lizMap.events.on({
                    lizmapeditionfeaturecreated: function (e) {
                        if (e.layerId == lizAtlasConfig.layerId)
                            updateAtlasData();
                    },
                    lizmapeditionfeaturemodified: function (e) {
                        if (e.layerId == lizAtlasConfig.layerId)
                            updateAtlasData();
                    },
                    lizmapeditionfeaturedeleted: function (e) {
                        if (e.layerId == lizAtlasConfig.layerId)
                            updateAtlasData();
                    }
                });
            }

            /**
             *
             */
            function adaptAtlasSize() {
                lizMap.events.on({
                    // Adapt dock size to display metadata
                    rightdockopened: function (e) {
                        if (e.id == 'atlas') {
                            // Size : add class to content to enabled specific css to be applied
                            $('#content').addClass('atlas-visible');
                            lizMap.updateContentSize();

                        }
                    },
                    rightdockclosed: function (e) {
                        if (e.id == 'atlas') {

                            // Set right-dock default size by removing #content class
                            $('#content').removeClass('atlas-visible');
                            lizMap.updateContentSize();

                            // Deactivate atlas and stop animation
                            deactivateAtlas();
                        }
                    }
                });
            }

            /**
             *
             */
            function activateAtlasTrigger() {
                $('#liz-atlas-select')
                    .change(function () {
                        var i = $(this).val();
                        var len = lizAtlasConfig['features_sorted'].length;

                        if (i == -1) {
                            deactivateAtlas();
                            return false;
                        }
                        if (i && i >= 0 && i < len) {
                            var item = lizAtlasConfig['features_sorted'][i];

                            var pkey_field = lizAtlasConfig['primaryKey'];

                            if (item[pkey_field] in lizAtlasConfig['features_with_pkey']) {
                                var feature = lizAtlasConfig['features_with_pkey'][item[pkey_field]];
                                runAtlasItem(feature);

                            } else {
                                console.log("no feature found");
                            }
                        }
                        return false;
                    });

                $('#atlas div.menu-content button.liz-atlas-item')
                    .click(function () {
                        var a = parseInt($(this).val());
                        var curval = parseInt($('#liz-atlas-select').val());
                        var nextval = a + curval;
                        var len = lizAtlasConfig['features_sorted'].length;
                        if (nextval >= len) {
                            nextval = 0;
                        }
                        if (nextval >= 0 && nextval < len) {
                            $('#liz-atlas-select').val(nextval).change();
                        }
                        return false;
                    });

                // Timer
                $('#atlas div.menu-content button.liz-atlas-run').click(function () {
                    // Get button value
                    var a = $(this).val();

                    // Get animation duration
                    var duration = lizAtlasConfig.duration;
                    if (!(parseInt(duration) > 0)){
                        duration = 5;
                    }
                    var step = parseInt(duration) * 1000;
                    if (step < 2 || step > 60000) {
                        step = 5000;
                    }

                    // Run or stop animation
                    if (a == '1') {
                        // Click on the next button
                        $('button.liz-atlas-item[value="1"]').click();

                        // Change the run button value into 0
                        $(this).val(0);

                        // Change button look
                        $(this).text(lizDict['atlas.toolbar.stop']).addClass('btn-danger');

                        // Run timer
                        lizAtlasTimer = setInterval(function () {
                            // Click on then next button for each step
                            $('button.liz-atlas-item[value="1"]').click();
                        }, step);
                    } else {
                        deactivateAtlas();
                    }
                });
            }

            /**
             *
             * @param feature
             */
            function runAtlasItem(feature) {
                const olFeature = (new GeoJSON()).readFeature(feature);

                // Zoom to feature
                if (lizAtlasConfig['zoom']) {
                    if (lizAtlasConfig['zoom'].toLowerCase() == 'center') {
                        // center
                        const center = getCenter(olFeature.getGeometry().getExtent());
                        lizMap.map.setCenter(center);
                    }
                    else {
                        // zoom
                        lizMap.mainLizmap.map.zoomToGeometryOrExtent(olFeature.getGeometry());
                    }
                }

                // Draw feature geometry
                if (lizAtlasConfig.drawFeatureGeom) {
                    lizMap.mainLizmap.map.setHighlightFeatures(feature,"geojson");
                }

                // Display popup
                if (lizAtlasConfig['atlasDisplayPopup']) {
                    lizMap.getFeaturePopupContent(lizAtlasConfig.layername, feature, function (data) {
                        var popupContainerId = 'liz-atlas-item-detail';
                        // Add class to table
                        var popupReg = new RegExp('lizmapPopupTable', 'g');
                        text = data.replace(popupReg, 'table table-condensed lizmapPopupTable');
                        var text = '<div class="lizmapPopupContent">' + text + '</div>';
                        // Remove <h4> with layer title
                        var titleReg = new RegExp('<h4>.+</h4>');
                        text = text.replace(titleReg, '');
                        $('#' + popupContainerId).html(text).show();

                        // Trigger event ? a bit buggy
                        lizMap.events.triggerEvent("lizmappopupdisplayed", { 'popup': null, 'containerId': popupContainerId });

                        // Add children
                        lizMap.addChildrenFeatureInfo(data, popupContainerId);
                        // Display the plots of the children layers features filtered by popup item
                        lizMap.addChildrenDatavizFilteredByPopupFeature(data, popupContainerId);

                    });
                }

                // Trigger Filter
                if (lizAtlasConfig['triggerFilter']) {

                    var fid = feature.id.split('.').pop();

                    // Select feature
                    lizMap.events.triggerEvent('layerfeatureselected',
                        { 'featureType': lizAtlasConfig.featureType, 'fid': fid, 'updateDrawing': false }
                    );
                    // Filter selected feature
                    lizMap.events.triggerEvent('layerfeaturefilterselected',
                        { 'featureType': lizAtlasConfig.featureType }
                    );
                }
            }

            /**
             *
             */
            function deactivateAtlas() {
                // Stop animation
                if (lizAtlasTimer) {
                    var btrun = $('#atlas div.menu-content button.liz-atlas-run');
                    // Change button value
                    btrun.val(1);

                    // Change button look
                    btrun.text(lizDict['atlas.toolbar.play']).removeClass('btn-danger');

                    // Reset interval and time
                    clearInterval(lizAtlasTimer);
                    lizAtlasTimer = null;
                }

                // Deactivate highlight
                if (lizAtlasConfig.drawFeatureGeom) {
                    lizMap.mainLizmap.map.clearHighlightFeatures();
                }

                // Deactivate filter
                if (lizAtlasConfig.triggerFilter && lizMap.lizmapLayerFilterActive) {
                    if (lizAtlasConfig.hideFeaturesAtStratup) {
                        // Select feature
                        lizMap.events.triggerEvent('layerfeatureselected',
                            { 'featureType': lizAtlasConfig.featureType, 'fid': -99999, 'updateDrawing': false }
                        );
                        // Filter selected feature
                        lizMap.events.triggerEvent('layerfeaturefilterselected',
                            { 'featureType': lizAtlasConfig.featureType }
                        );
                    } else
                        lizMap.events.triggerEvent("layerfeatureremovefilter",
                            { 'featureType': lizAtlasConfig.featureType }
                        );
                }
                // Hide some containers
                $('#liz-atlas-item-detail').hide();
            }

        } // uicreated
    });
})();
