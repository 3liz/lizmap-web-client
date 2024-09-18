/**
 * @module legacy/attributeTable.js
 * @name AttributeTable
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import DOMPurify from 'dompurify';

var lizAttributeTable = function() {

    const intRegex = /^[0-9]+$/;

    const sqlEscapeFilter = (value, alwaysQuoteString) => {
        if (Array.isArray(value)) {
            // The values must be separated by comma AND spaces
            // since QGIS controls the syntax for the FILTER parameter
            return value.map(v => sqlEscapeFilter(v, alwaysQuoteString)).join(" , ");
        }

        if (typeof value === 'string') {
            if (!alwaysQuoteString && intRegex.test(value) ) {
                // value is a string but represents an integer
                // return unquoted string
                return value;
            }

            // surround value with simple quotes and escape existing single-quote
            return `'${value.replaceAll("'", "''")}'`
        }

        // fallback: return value as-is
        return value;
    }

    lizMap.events.on({
        'uicreated':function(){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var hasAttributeTableLayers = false;
            var attributeLayersActive = false;
            var attributeLayersDic = {};
            var wfsTypenameMap = {};
            var mediaLinkPrefix = globalThis['lizUrls'].media + '?' + new URLSearchParams(globalThis['lizUrls'].params);
            var startupFilter = false;
            if( !( typeof lizLayerFilter === 'undefined' ) ){
                startupFilter = true;
                lizMap.lizmapLayerFilterActive = true;
            }

            var limitDataToBbox = false;
            if ( 'limitDataToBbox' in config.options && config.options.limitDataToBbox == 'True'){
                limitDataToBbox = true;
            }

            if (!('attributeLayers' in config))
                return -1;

            // Verifying WFS layers
            var featureTypes = lizMap.mainLizmap.initialConfig.vectorLayerFeatureTypeList;
            if (featureTypes.length == 0 )
                return -1;

            $('body').css('cursor', 'wait');

            // Sort attribute layers as given by creation order in Lizmap plugin
            var attributeLayersSorted = [];

            for (var lname in config.attributeLayers) {
                var al = config.attributeLayers[lname];
                al.name = lname;
                attributeLayersSorted.push(al);
            }
            attributeLayersSorted.sort(function(a, b) {
                return a.order - b.order;
            });

            for (var i = 0; i < attributeLayersSorted.length; i++) {
                var al = attributeLayersSorted[i];
                attributeLayersDic[lizMap.cleanName(al.name)] = al.name;
            }

            for(const featureType of featureTypes) {
                // typename
                var typeName = featureType.Name;
                // layername
                var layername = lizMap.getNameByTypeName( typeName );
                if ( !layername || layername == undefined ) {
                    continue;
                }
                // Check layername
                // if layer is in a restricted group, the layer wil not be available
                if (!lizMap.mainLizmap.state.layersAndGroupsCollection.layerNames.includes(layername)) {
                    continue;
                }
                // lizmap internal js cleaned name
                var cleanName = lizMap.cleanName(layername);
                // lizmap config file layer name
                var configLayerName = attributeLayersDic[cleanName];
                // Add matching between wfs type name and clean name
                wfsTypenameMap[cleanName] = typeName;

                if (configLayerName in config.attributeLayers) {
                    hasAttributeTableLayers = true;

                    // Get layers config information
                    var atConfig = config.attributeLayers[configLayerName];

                    // Add some properties to the lizMap.config
                    config.layers[configLayerName]['features'] = {};
                    config.layers[configLayerName]['featureCrs'] = null;
                    config.layers[configLayerName]['featuresFullSet'] = false;
                    config.layers[configLayerName]['selectedFeatures'] = [];
                    config.layers[configLayerName]['highlightedFeature'] = null;
                    config.layers[configLayerName]['filteredFeatures'] = [];
                    config.layers[configLayerName]['request_params'] = {
                        'filter' : null,
                        'exp_filter': null,
                        'selection': null
                    };

                    // Get existing filter if exists (via permalink)
                    const layer = lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layername);

                    if (layer.isFiltered) {
                        config.layers[configLayerName]['request_params']['filter'] = layer.expressionFilter;

                        // Send signal so that getFeatureInfo takes it into account
                        lizMap.events.triggerEvent("layerFilterParamChanged",
                            {
                                'featureType': attributeLayersDic[cleanName],
                                'filter': config.layers[configLayerName]['request_params']['filter'],
                                'updateDrawing': false
                            }
                        );
                    }

                    // Add geometryType if not already present (backward compatibility)
                    if( typeof config.layers[configLayerName]['geometryType'] === 'undefined' ) {
                        config.layers[configLayerName]['geometryType'] = 'unknown';
                    }

                    config.layers[configLayerName]['crs'] = featureType.SRS;

                    if (config.layers[configLayerName]['crs'] !== ""){
                        lizMap.loadProjDefinition(config.layers[configLayerName].crs, function (aProj) {
                            new OpenLayers.Projection(config.layers[configLayerName].crs);
                        });
                    }

                    atConfig['bbox'] = featureType.LatLongBoundingBox;
                }
            }

            if (hasAttributeTableLayers) {
                // Attribute table could be activated to get selection tool
                var hasDiplayedAttributeTable = false;

                // Add the list of layers in the summary table
                var tHtml = '<table id="attribute-layer-list-table" class="table table-condensed table-hover table-striped" style="width:auto;">';
                for( var idx in attributeLayersDic) {
                    var cleanName = idx;

                    // Do not add a button for the pivot tables
                    if( 'pivot' in config.attributeLayers[ attributeLayersDic[ cleanName ] ]
                        && config.attributeLayers[ attributeLayersDic[ cleanName ] ]['pivot'] == 'True'
                    ){
                        continue;
                    }

                    // Do not add a button if not asked by editor
                    if( 'hideLayer' in config.attributeLayers[ attributeLayersDic[ cleanName ] ]
                        && config.attributeLayers[ attributeLayersDic[ cleanName ] ]['hideLayer'] == 'True'
                    ){
                        continue;
                    }

                    var title = config.layers[ attributeLayersDic[ cleanName ] ][ 'title' ];
                    tHtml+= '<tr>';
                    tHtml+= '   <td>' + title + '</td><td><button value=' + cleanName + ' class="btn btn-open-attribute-layer">'+ lizDict['attributeLayers.toolbar.btn.detail'] +'</button></td>';
                    tHtml+= '</tr>';

                    hasDiplayedAttributeTable = true;
                }

                tHtml+= '</table>';
                if ( hasDiplayedAttributeTable ) {
                    $('#attribute-layer-list').html(tHtml);

                    // Bind click on detail buttons
                    $('button.btn-open-attribute-layer')
                        .click(function(){
                            var cleanName = $(this).val();

                            // Disable attribute table if limitDataToBbox and layer not visible in map
                            if(limitDataToBbox){
                                let layer = lizMap.mainLizmap.map.getLayerByName(lizMap.getLayerNameByCleanName(cleanName));
                                if( layer ) {
                                    if(warnResolution(layer)){
                                        return false;
                                    }
                                }
                            }

                            // Add Div if not already there
                            const layerName = attributeLayersDic[cleanName];
                            if( !$('#nav-tab-attribute-layer-' + cleanName ).length ){
                                addLayerDiv(layerName);
                            }

                            const layerFilter = ( 'request_params' in config.layers[layerName] && config.layers[layerName]['request_params']['exp_filter'] ) ?
                                config.layers[layerName]['request_params']['exp_filter'] : null;

                            const tableSelector = '#attribute-layer-table-' + cleanName;

                            // Get data and fill attribute table
                            getDataAndFillAttributeTable(layerName, layerFilter, tableSelector, false);

                            const tabElement = document.getElementById('nav-tab-attribute-layer-' + cleanName);
                            bootstrap.Tab.getOrCreateInstance(tabElement).show();

                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );

                    // Bind change on options checkboxes
                    $('#jforms_view_attribute_layers_option_cascade_label input[name="cascade"]').change(function(){
                        var doCascade = $('#jforms_view_attribute_layers_option_cascade_label input[name="cascade"]').prop('checked');
                        // refresh filtered layers if any active
                        if( lizMap.lizmapLayerFilterActive ){
                            var featureType = lizMap.lizmapLayerFilterActive;
                            var layerConfig = config.layers[featureType];
                            if( layerConfig['filteredFeatures'] ){

                                // Update attribute table tools
                                updateAttributeTableTools( featureType );

                                // Update layer
                                var cascadeToChildren = true;
                                if( !doCascade )
                                    cascadeToChildren = 'removeChildrenFilter';
                                updateMapLayerDrawing( featureType, cascadeToChildren );

                            }
                        }
                    });
                } else {
                    // Hide navbar menu
                    $('#mapmenu li.attributeLayers').hide();
                }

                // Send signal
                lizMap.events.triggerEvent("attributeLayersReady",
                    {'layers': attributeLayersDic}
                );

                // Map events
                if (limitDataToBbox) {
                    lizMap.mainLizmap.map.on('moveend', () => {
                        let btitle = lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip.changed'];
                        btitle += ' ' + lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip'];
                        $('button.btn-refresh-table')
                            .attr('data-bs-toggle', 'tooltip')
                            .attr('data-bs-title', btitle)
                            .addClass('btn-warning')
                            .tooltip();
                    });
                }

                // Bind click on tabs to resize datatable tables
                $('#attributeLayers-tabs li').click(function(){
                    var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                    refreshDatatableSize('#'+mycontainerId);
                });

            } else {
                // Hide navbar menu
                $('#mapmenu li.attributeLayers').hide();
                return -1;
            }
            $('body').css('cursor', 'auto');

            /**
             *
             * @param layer
             */
            function warnResolution(layer) {
                const mapResolution = lizMap.mainLizmap.map.getView().getResolution();
                const visibility = layer.getMaxResolution() > mapResolution && mapResolution > layer.getMinResolution();
                if( !visibility ){
                    const msg = lizDict['attributeLayers.msg.layer.not.visible'];
                    lizMap.addMessage( msg, 'info', true).attr('id','lizmap-attribute-message');
                    return true;
                }
                return false;
            }

            /**
             *
             * @param layerName
             * @param filter
             * @param tableSelector
             * @param forceEmptyTable
             * @param callBack
             */
            function getDataAndFillAttributeTable(layerName, filter, tableSelector, forceEmptyTable, callBack){

                let layerConfig = lizMap.config.layers[layerName];
                const typeName = layerConfig?.shortname || layerConfig?.typename || layerConfig?.name;

                const wfsParams = {
                    TYPENAME: typeName,
                    GEOMETRYNAME: 'extent'
                };

                if(filter){
                    wfsParams['EXP_FILTER'] = filter;
                }

                // Calculate bbox from map extent if needed
                if (config.options?.limitDataToBbox == 'True') {
                    const mapExtent = lizMap.mainLizmap.map.getView().calculateExtent();
                    const mapExtent4326 = lizMap.mainLizmap.transformExtent(
                        mapExtent,
                        lizMap.mainLizmap.map.getView().getProjection().getCode(),
                        'EPSG:4326'
                    );
                    wfsParams['BBOX'] = mapExtent4326;
                    wfsParams['SRSNAME'] = 'EPSG:4326';
                }

                const getFeatureRequest = lizMap.mainLizmap.wfs.getFeature(wfsParams);

                let fetchRequests = [getFeatureRequest];
                let namedRequests = {'getFeature': fetchRequests.length-1};


                if (!(layerConfig?.['alias'] && layerConfig?.['types'])) {
                    const describeFeatureTypeRequest = lizMap.mainLizmap.wfs.describeFeatureType({
                        TYPENAME: typeName
                    });
                    fetchRequests.push(describeFeatureTypeRequest);
                    namedRequests['describeFeatureType'] = fetchRequests.length-1;
                }

                const allColumnsKeyValues = {};

                // Indexes 0 and 1 are use for getFeature and describeFeature requests
                namedRequests['keyValues'] = fetchRequests.length+0;
                let responseOrder = fetchRequests.length+0;
                for (const fieldName in lizMap.keyValueConfig?.[layerName]) {
                    const fieldConf = lizMap.keyValueConfig[layerName][fieldName];
                    if (fieldConf.type == 'ValueMap') {
                        allColumnsKeyValues[fieldName] = fieldConf.data;
                    } else {
                        // Get the layer typename based on its id
                        let getSourceLayer = lizMap.getLayerConfigById(fieldConf.source_layer_id);
                        if( !getSourceLayer || getSourceLayer.length != 2) continue;
                        const source_typename = getSourceLayer[1].typename;
                        if (source_typename == undefined) {
                            // The source layer is not published in WFS
                            continue;
                        }
                        // Use an integer as a placeholder for coming fetched key/values
                        allColumnsKeyValues[fieldName] = responseOrder;
                        responseOrder++;
                        fetchRequests.push(lizMap.mainLizmap.wfs.getFeature({
                            TYPENAME: source_typename,
                            PROPERTYNAME: fieldConf.code_field + ',' + fieldConf.label_field,
                            // we must not use null for exp_filter but '' if no filter is active
                            EXP_FILTER: fieldConf.exp_filter ? fieldConf.exp_filter : ''
                        }));
                    }
                }
                if (forceEmptyTable) return buildLayerAttributeDatatable(layerName, tableSelector, [], layerConfig.aliases, layerConfig.types, allColumnsKeyValues, callBack);

                document.body.style.cursor = 'progress';
                Promise.all(fetchRequests).then(responses => {

                    // Get every key/value from relation layers
                    for (let index = namedRequests['keyValues']; index < responses.length; index++) {
                        // Get column name using order placeholder defined before
                        const columnName = Object.keys(allColumnsKeyValues).find(key => allColumnsKeyValues[key] === index);
                        const keyField = lizMap.keyValueConfig[layerName][columnName].code_field;
                        const valueField = lizMap.keyValueConfig[layerName][columnName].label_field;

                        const keyValue = {};

                        responses[index].features.forEach(feature => keyValue[feature.properties[keyField]] = feature.properties[valueField]);

                        allColumnsKeyValues[columnName] = keyValue;

                    }
                    layerConfig['featureCrs'] = 'EPSG:4326';
                    if (namedRequests?.['describeFeatureType']) {
                        const describeFeatureTypeResponse = responses[namedRequests['describeFeatureType']];
                        layerConfig['aliases'] = describeFeatureTypeResponse.aliases;
                        layerConfig['types'] = describeFeatureTypeResponse.types;
                        layerConfig['columns'] = describeFeatureTypeResponse.columns;
                    }

                    buildLayerAttributeDatatable(layerName, tableSelector, responses[0].features, layerConfig.aliases, layerConfig.types, allColumnsKeyValues, callBack);

                    document.body.style.cursor = 'default';
                }).catch(() => {
                    document.body.style.cursor = 'default';
                });
            }

            /**
             *
             * @param layerName
             * @param filter
             * @param tableSelector
             * @param callBack
             */
            function getDataAndRefreshAttributeTable(layerName, filter, tableSelector, callBack){

                const layerConfig = lizMap.config.layers[layerName];
                const typeName = layerConfig?.shortname || layerConfig?.typename || layerConfig?.name;

                const wfsParams = {
                    TYPENAME: typeName,
                    GEOMETRYNAME: 'extent'
                };

                if(filter){
                    wfsParams['EXP_FILTER'] = filter;
                }

                // Calculate bbox from map extent if needed
                if (config.options?.limitDataToBbox == 'True') {
                    const mapExtent = lizMap.mainLizmap.map.getView().calculateExtent();
                    const mapExtent4326 = lizMap.mainLizmap.transformExtent(
                        mapExtent,
                        lizMap.mainLizmap.map.getView().getProjection().getCode(),
                        'EPSG:4326'
                    );
                    wfsParams['BBOX'] = mapExtent4326;
                    wfsParams['SRSNAME'] = 'EPSG:4326';
                }

                const getFeatureRequest = lizMap.mainLizmap.wfs.getFeature(wfsParams);
                Promise.all([getFeatureRequest]).then(responses => {
                    refreshLayerAttributeDatatable(layerName, tableSelector, responses[0].features);
                    document.body.style.cursor = 'default';
                }).catch(() => {
                    document.body.style.cursor = 'default';
                });
            }

            /**
             *
             */
            function activateAttributeLayers() {
                attributeLayersActive = true;

                // Deactivate locate-menu
                if ( $('#locate-menu').is(':visible') && lizMap.checkMobile()){
                    $('#toggleLocate').parent().removeClass('active');
                    $('#locate-menu').toggle();
                }
                return false;
            }

            /**
             *
             */
            function deactivateAttributeLayers() {
                // Some actions done when deactivating attribute table
                return false;
            }

            /**
             *
             * @param parentLayerId
             * @param childLayerId
             */
            function getRelationInfo(parentLayerId,childLayerId){
                if( 'relations' in config && parentLayerId in config.relations) {
                    var layerRelations = config.relations[parentLayerId];
                    for( var lridx in layerRelations ) {
                        var relation = layerRelations[lridx];
                        if (relation.referencingLayer == childLayerId) {
                            return relation;
                        }
                    }
                }
                return null;
            }

            /**
             *
             * @param lname
             */
            function addLayerDiv(lname) {
                // Get layer config
                var atConfig = config.attributeLayers[lname];
                var cleanName = lizMap.cleanName(lname);

                // Add li to the tabs
                var liHtml = '<li class="nav-item" role="presentation">';
                liHtml+= '<button id="nav-tab-attribute-layer-' + cleanName + '" class="nav-link" data-bs-toggle="tab" data-bs-target="#attribute-layer-' + cleanName + '" type="button" role="tab">' + config.layers[lname]['title'] ;
                liHtml+= '&nbsp;<i class="btn-close-attribute-tab icon-remove icon-white" style="cursor:pointer"></i>';
                liHtml+= '</button>'
                liHtml+= '</li>';

                $('#attributeLayers-tabs').append( liHtml );

                // Add content div
                var html = '<div id="attribute-layer-' + cleanName + '" class="tab-pane attribute-content bottom-content" >';
                html+= '    <div class="attribute-layer-main" id="attribute-layer-main-' + cleanName + '" >';

                if( !config.layers[lname]['selectedFeatures'] )
                    config.layers[lname]['selectedFeatures'] = [];
                if( !config.layers[lname]['filteredFeatures'] )
                    config.layers[lname]['filteredFeatures'] = [];

                var selClass= '';
                if( config.layers[lname]['selectedFeatures'].length == 0 )
                    selClass= ' hidden';
                var filClass= '';
                if( config.layers[lname]['filteredFeatures'].length > 0 )
                    filClass= ' active btn-primary';
                else
                    filClass = selClass

                // Action bar specific to the tab
                html+= '<div class="attribute-layer-action-bar">';

                // Search input
                html+= '<div class="btn-group">';
                html+= '  <input id="attribute-layer-search-' + cleanName + '" type="search" class="form-control" placeholder="'+lizDict['attributeLayers.toolbar.input.search.title']+'">';
                html+= '  <i class="clear-layer-search icon-remove" style="position:absolute;right:4px;top:4px;cursor:pointer;"></i>';
                html+= '</div>';

                // Selected searched lines button
                html+= '<button class="btn-select-searched btn btn-sm" value="'+cleanName+'" title="'+lizDict['attributeLayers.toolbar.btn.select.searched.title']+'"><i class="icon-star"></i></button>';

                // Unselect button
                html+= '    <button class="btn-unselect-attributeTable btn btn-sm' + selClass + '" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.unselect.title']+'"><i class="icon-star-empty"></i></button>';

                // 'Move selected to top' button
                html+= '    <button class="btn-moveselectedtotop-attributeTable btn btn-sm' + selClass + '" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.moveselectedtotop.title']+'"><i class="icon-arrow-up"></i></button>';

                // Filter button : only if no filter applied at startup
                if( !startupFilter
                    && ( !lizMap.lizmapLayerFilterActive || lizMap.lizmapLayerFilterActive == lname )
                ){
                    html+= '    <button class="btn-filter-attributeTable btn btn-sm' + filClass + '" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.filter.title']+'"><i class="icon-filter"></i></button>';
                }

                // Invert selection
                html += '<lizmap-selection-invert tooltip-placement="bottom" feature-type="' + cleanName +'"></lizmap-selection-invert>'

                // Detail button
                var canPopup = false
                if( config.layers[lname]
                    && config.layers[lname]['popup'] == 'True'
                    // We should NOT  deactivate popup for non-spatial layers, as it can be very useful
                    // && config.layers[lname]['geometryType'] != 'none'
                    && config.layers[lname]['geometryType'] != 'unknown'
                ){
                    canPopup = true;
                }
                if( canPopup ){
                    html+= '<button type="checkbox" class="btn-detail-attributeTable btn btn-sm" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.cb.data.detail.title']+'">';
                    html+= '<i class="icon-info-sign"></i>';
                    html+= '</button>';
                }

                // Create button
                var canCreate = false;
                if ('editionLayers' in config
                    && cleanName in attributeLayersDic
                    && attributeLayersDic[cleanName] in config.editionLayers) {
                    var al = config.editionLayers[attributeLayersDic[cleanName]];
                    if (al.capabilities.createFeature == "True") {
                        canCreate = true;
                    }
                }
                if (canCreate) {
                    html+= '    <button class="btn-createFeature-attributeTable btn btn-sm" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.createFeature.title']+'"><i class="icon-plus-sign"></i></button>';
                }

                // Refresh button (if limitDataToBbox is true)
                if( limitDataToBbox
                    && config.layers[lname]['geometryType'] != 'none'
                    && config.layers[lname]['geometryType'] != 'unknown'
                ){
                    // Add button to refresh table
                    html+= '<button class="btn-refresh-table btn btn-sm" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip']+'">'+lizDict['attributeLayers.toolbar.btn.refresh.table.title']+'</button>';

                }

                // Get children content
                var childHtml = getChildrenHtmlContent( lname );
                var alc='';

                // Toggle children content
                if( childHtml ){
                    // Add button to show/hide children tables
                    html+= '    <button class="btn-toggle-children btn btn-sm" value="' + cleanName + '" >'+lizDict['attributeLayers.toolbar.btn.toggle.children.title']+'</button>';

                    // Add buttons to create new children
                    if( childHtml['childCreateButton'] )
                        html+= childHtml['childCreateButton'];

                    // Add buttons to link parent and children
                    if( childHtml['layerLinkButton'] )
                        html+= childHtml['layerLinkButton'];
                }

                // Export tools
                if ( 'exportLayers' in config.options && config.options.exportLayers == 'True' ) {
                    html+= '<div class="export-formats dropdown float-end" role="group" >';
                    html+= '    <button type="button" class="btn btn-sm dropdown-toggle exportLayer" data-bs-toggle="dropdown" aria-expanded="false">';
                    html+= lizDict['attributeLayers.toolbar.btn.data.export.title'];
                    html+= '    </button>';
                    html+= '    <ul class="dropdown-menu" role="menu">';
                    html+= '        <li><button type="button" class="dropdown-item btn-export-attributeTable">GeoJSON</button></li>';
                    html+= '        <li><button type="button" class="dropdown-item btn-export-attributeTable">GML</button></li>';
                    var exportFormats = lizMap.mainLizmap.initialConfig.vectorLayerResultFormat;
                    for ( var i=0, len=exportFormats.length; i<len; i++ ) {
                        var format = exportFormats[i].toLowerCase();
                        if ( format != 'gml2' && format != 'gml3' && format != 'geojson' ) {
                            html += '        <li><button type="button" class="dropdown-item btn-export-attributeTable">'+format+'</button></li>';
                        }
                    }
                    html+= '    </ul>';
                    html+= '</div>';
                }

                html+= '</div>'; // attribute-layer-action-bar

                if( childHtml ) {
                    alc= ' showChildren';
                }
                html+= '<div class="attribute-layer-content'+alc+'">';
                html+= '    <input type="hidden" class="attribute-table-hidden-layer" value="'+cleanName+'">';
                html+= '    <table id="attribute-layer-table-' + cleanName + '" class="attribute-table-table table table-hover table-condensed table-striped order-column cell-border" width="100%"></table>';

                html+= '</div>';  // attribute-layer-content

                // Add children content
                if( childHtml ){
                    // Add children content : one tab per childlayer
                    html+= '<div class="attribute-layer-child-content" role="tablist">';
                    // Ul content
                    html+= '    <ul class="nav nav-tabs">';
                    for( var i in childHtml['tab-li'] ){
                        var cLi = childHtml['tab-li'][i];
                        html+= cLi;
                    }
                    html+= '    </ul>';
                    html+= '    <div class="tab-content">';
                    // Tab content
                    for( var i in childHtml['tab-content'] ){
                        var cDiv = childHtml['tab-content'][i];
                        html+= cDiv;
                    }
                    html+= '    </div>'; // tab-content
                    html+= '</div>'; // tabbable
                }

                html+= '</div>';  // attribute-layer-main

                // Right panel to show info
                html+= '    <div class="attribute-layer-feature-panel" id="attribute-table-panel-' + cleanName + '" ></div>';

                html+= '</div>'; // 'attribute-layer-' + cleanName

                $('#attribute-table-container').append(html);

                $('.btn-close-attribute-tab').click(function(){
                    //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
                    var tabContentId = $(this).parent().attr("data-bs-target");
                    $(this).parent().parent().remove(); //remove li of tab
                    bootstrap.Tab.getInstance(document.getElementById('nav-tab-attribute-summary')).show(); // Select first tab
                    $(tabContentId).remove(); //remove respective tab content
                });

                if( childHtml ){

                    // Bind adjust child columns when children tab visibility change
                    $('#attribute-layer-' + cleanName + ' div.attribute-layer-child-content ul li a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                        var target = $(e.target).attr("href") // activated tab
                        var dtable = $(target).find('table.dataTable');
                        dtable.DataTable().tables().columns.adjust();
                    });
                }

                if(limitDataToBbox){
                    $('#attribute-layer-'+ cleanName + ' button.btn-refresh-table')
                        .click(function(){
                        // Reset button tooltip & style
                            $(this)
                                .attr('data-bs-toggle', 'tooltip')
                                .attr('data-bs-title', lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip'])
                                .removeClass('btn-warning');

                            // Disable if the layer is not visible
                            let layer = lizMap.mainLizmap.map.getLayerByName(lizMap.getLayerNameByCleanName(cleanName));
                            if( layer ) {
                                if(warnResolution(layer)){
                                    return false;
                                }
                            }else{
                            // do nothing if no layer found
                                return false;
                            }

                            // Refresh table
                            const tableSelector = '#attribute-layer-table-'+cleanName;
                            $('#attribute-layer-main-'+cleanName+' > div.attribute-layer-content').hide();

                            getDataAndFillAttributeTable(lname, null, tableSelector, false, () => {
                                $('#attribute-layer-main-' + cleanName + ' > div.attribute-layer-content').show();
                                refreshDatatableSize('#attribute-layer-main-' + cleanName);
                            });

                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );
                }

                if( childHtml ){
                    $('#attribute-layer-'+ cleanName + ' button.btn-toggle-children')
                        .click(function(){
                            var parentDir = $(this).parents('div.attribute-layer-main');
                            parentDir.find('div.attribute-layer-content').toggleClass('showChildren');
                            parentDir.find('div.tabbable.attribute-layer-child-content').toggle();
                            // Refresh parent table size
                            refreshDatatableSize('#attribute-layer-main-'+ cleanName);
                            return false;
                        });
                }

                // Bind click on detail button
                // It just toggles the right panel visibility
                if( canPopup ){
                    $('#attribute-layer-'+ cleanName + ' button.btn-detail-attributeTable')
                        .click(function(){
                        // Toggle
                            $('#attribute-layer-main-' + cleanName).toggleClass('reduced', !$(this).hasClass('btn-primary'));
                            $('#attribute-table-panel-' + cleanName).toggleClass('visible', !$(this).hasClass('btn-primary'));
                            $(this).toggleClass('btn-primary');

                            refreshDatatableSize('#attribute-layer-main-'+ cleanName);
                            return false;
                        });
                }

                // Bind click on "unselect all" button
                $('#attribute-layer-'+ cleanName + ' button.btn-unselect-attributeTable')
                    .click(function(){
                        var aName = attributeLayersDic[ $(this).val() ];
                        // Send signal
                        lizMap.events.triggerEvent("layerfeatureunselectall",
                            { 'featureType': aName, 'updateDrawing': true}
                        );
                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );

                // Bind click on "move selected to top" button
                $('#attribute-layer-'+ cleanName + ' button.btn-moveselectedtotop-attributeTable')
                    .click(function(){
                        var aTable = '#attribute-layer-table-' + $(this).val();
                        var dTable = $( aTable ).DataTable();
                        var previousOrder = dTable.order();
                        previousOrder = $.grep(previousOrder, function(o){
                            return o[0] != 0;
                        });
                        var selectedOrder = [ [0, 'asc'] ];
                        var newOrder = selectedOrder.concat(previousOrder);
                        dTable.order( newOrder ).draw();

                        // Scroll to top
                        $(aTable).parents('div.attribute-layer-content').scrollTop(0);

                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );


                // Bind click on filter button
                if( !startupFilter ){
                    $('#attribute-layer-'+ cleanName + ' button.btn-filter-attributeTable')
                        .click(function(){
                            var aName = attributeLayersDic[ $(this).val() ];
                            if( $(this).hasClass('btn-primary') ) {
                                lizMap.events.triggerEvent( "layerfeatureremovefilter",
                                    { 'featureType': aName}
                                );
                                lizMap.lizmapLayerFilterActive = null;
                            } else {
                                lizMap.events.triggerEvent("layerfeaturefilterselected",
                                    { 'featureType': aName}
                                );
                                lizMap.lizmapLayerFilterActive = aName;
                            }
                            return false;
                        });
                }

                // Bind click on export buttons
                $('#attribute-layer-'+ cleanName + ' button.btn-export-attributeTable')
                    .click(function(){
                        var eFormat = $(this).text();
                        if( eFormat == 'GML' )
                            eFormat = 'GML3';
                        var cleanName = $(this).parents('div.attribute-layer-main:first').attr('id').replace('attribute-layer-main-', '');
                        var eName = attributeLayersDic[ cleanName ];
                        lizMap.exportVectorLayer( eName, eFormat, limitDataToBbox );
                    });

                // Bind click on createFeature button
                // BEWARE - This is used for creating a new line in the displayed attribute table
                // and for creating a new child item
                $('#attribute-layer-'+ cleanName + ' button.btn-createFeature-attributeTable')
                    .click(function(){
                        // Ask the user to click on a table line
                        // before trying to create a child feature
                        const creationContext = ($(this).hasClass('new-child')) ? 'child' : 'parent';
                        if (creationContext == 'child'
                            && $('#attribute-layer-'+ cleanName + ' tr.active').length != 1) {
                            $('#lizmap-edition-message').remove();
                            lizMap.addMessage( lizDict['attributeLayers.toolbar.btn.data.createChildFeature.no.actived'], 'info', true).attr('id','lizmap-edition-message');
                            return false;
                        }
                        const parentFidElement = document.querySelector('#attribute-layer-'+ cleanName + ' tr.active lizmap-feature-toolbar');
                        var parentFeatId = (parentFidElement) ? parentFidElement.fid : null;
                        var parentLayerName = attributeLayersDic[ cleanName ];
                        var parentLayerId = config.layers[parentLayerName]['id'];
                        var aName = attributeLayersDic[ $(this).val() ];
                        var pivotId = $(this).attr("data-pivot");
                        var lid = config.layers[aName]['id'];
                        if (creationContext == 'parent') {
                            lizMap.launchEdition( lid, null, null);
                        } else {
                            lizMap.getLayerFeature(parentLayerName, parentFeatId, function(parentFeat) {
                                lizMap.launchEdition( lid, null, {layerId:parentLayerId, feature:parentFeat, pivotId:pivotId});
                            });
                        }

                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );

                // Bind click on createFeature button via dropDown
                $('#attribute-layer-'+ cleanName + ' a.btn-createFeature-attributeTable')
                    .click(function(){
                        if ( $('#attribute-layer-'+ cleanName + ' tr.active').length != 1) {
                            $('#lizmap-edition-message').remove();
                            lizMap.addMessage( lizDict['attributeLayers.toolbar.btn.data.createChildFeature.no.actived'], 'info', true).attr('id','lizmap-edition-message');
                            return false;
                        }
                        var parentFeatId = document.querySelector('#attribute-layer-'+ cleanName + ' tr.active lizmap-feature-toolbar').fid;
                        var parentLayerName = attributeLayersDic[ cleanName ];
                        var parentLayerId = config.layers[parentLayerName]['id'];
                        var selectedValue = $(this).attr('href').replace('#', '');
                        var aName = attributeLayersDic[ selectedValue ];
                        lizMap.getLayerFeature(parentLayerName, parentFeatId, function(parentFeat) {
                            var lid = config.layers[aName]['id'];
                            lizMap.launchEdition( lid, null, {layerId:parentLayerId,feature:parentFeat});
                            $(this).blur();
                        });
                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );

                // Bind click on linkFeatures button
                $('#attribute-layer-'+ cleanName + ' a.btn-linkFeatures-attributeTable')
                    .click(function(){
                        var selectedValue = $(this).attr('href').replace('#', '');
                        $(this).blur();
                        var cName = attributeLayersDic[ selectedValue ];
                        var cId = config.layers[cName]['id'];
                        var attrConfig = config.attributeLayers[cName];
                        var p = [];
                        var pName = attributeLayersDic[cleanName];
                        var pId = config.layers[pName]['id'];
                        var doQuery = false;

                        if( 'pivot' in attrConfig
                        && attrConfig['pivot'] == 'True'
                        && cId in config.relations.pivot
                        ){
                        // Get parents info : layer id, fkey column in the pivot table for the parent, values of primary key for selected ids
                            for( var parId in config.relations.pivot[cId] ){
                                var par = buildLinkParameters( parId );
                                if (!par)
                                    return false;
                                par['id'] = parId;
                                var parKey = config.relations.pivot[cId][parId];
                                par['fkey'] = parKey;

                                // Add parent info to the table
                                p.push(par);

                            }

                            if( !( p.length == 2 )  )
                                return false;

                            doQuery = 'pivot';

                        }else{

                            var par = buildLinkParameters( pId );
                            var chi = buildLinkParameters( cId );

                            if (!par || !chi )
                                return false;
                            par['id'] = pId;
                            // We take the primary key of the child layer (because 1:n relation )
                            par['fkey'] = config.attributeLayers[cName]['primaryKey'];

                            chi['id'] = cId;
                            if( !( pId in config.relations ) )
                                return false;
                            for( var rp in config.relations[pId] ){
                                var rpItem = config.relations[pId][rp];
                                if( rpItem.referencingLayer == cId ){
                                    chi['fkey'] = rpItem.referencingField
                                }else{
                                    continue;
                                }
                            }
                            if( !('fkey' in chi ) )
                                return false;

                            p.push(par);
                            p.push(chi);

                            doQuery = '1n';

                        }

                        if( doQuery ){
                            var service = globalThis['lizUrls'].edition + '?' + new URLSearchParams(globalThis['lizUrls'].params);
                            $.post(service.replace('getFeature','linkFeatures'),{
                                features1: p[0]['id'] + ':' + p[0]['fkey'] + ':' + p[0]['selected'].join(),
                                features2: p[1]['id'] + ':' + p[1]['fkey'] + ':' + p[1]['selected'].join(),
                                pivot: cId

                            }, function(data){
                            // Show response message
                                $('#lizmap-edition-message').remove();
                                lizMap.addMessage( data, 'info', true).attr('id','lizmap-edition-message');

                                // Unselect features of parent (or child)
                                // And trigger table refresh
                                if( doQuery == 'pivot' ){
                                    lizMap.events.triggerEvent("layerfeatureunselectall",
                                        { 'featureType': attributeLayersDic[cleanName], 'updateDrawing': true}
                                    );
                                    // Send signal saying edition has been done on pivot and refresh corresponding tables
                                    var linkedId = lizMap.config.layers[attributeLayersDic[cleanName]]?.id
                                    if (linkedId) {
                                        var pivotCfg = lizMap.config.relations.pivot[cId];
                                        // get layerId of related layer
                                        var linkedKey = Object.keys(pivotCfg).filter((key)=>{
                                            return key != linkedId
                                        })?.[0]

                                        if (linkedKey) {
                                            cId = linkedKey;
                                        }
                                    }
                                    lizMap.events.triggerEvent("lizmapeditionfeaturecreated",
                                        { 'layerId': cId}
                                    );
                                }else{
                                    lizMap.events.triggerEvent("layerfeatureunselectall",
                                        { 'featureType': cName, 'updateDrawing': true}
                                    );
                                    // Send signal saying edition has been done on pivot
                                    lizMap.events.triggerEvent("lizmapeditionfeaturemodified",
                                        { 'layerId': cId}
                                    );
                                }
                            });
                        }

                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );

                // Bind click on btn-select-searched button
                $('#attribute-layer-'+ cleanName + ' button.btn-select-searched').click(function(){
                    var aName = attributeLayersDic[ $(this).val() ];

                    // Send signal
                    lizMap.events.triggerEvent("layerfeatureselectsearched",
                        { 'featureType': aName, 'updateDrawing': true}
                    );
                    return false;
                })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );
            }

            /**
             *
             * @param layerId
             */
            function buildLinkParameters( layerId ){
                var lp  = {};

                // Get ids of selected feature
                var getP = lizMap.getLayerConfigById( layerId, config.attributeLayers, 'layerId' );
                if( !getP )
                    return false;

                lp['name'] = getP[0];

                var idSelected = config.layers[ getP[0] ]['selectedFeatures'];
                if( !( idSelected.length > 0 ) )
                    return false;

                // Get corresponding values of parent primary key column for these ids
                var fi = [];
                var features = config.layers[ getP[0] ]['features'];
                if ( !features || Object.keys(features).length <= 0 )
                    return false;

                var primaryKey = getP[1]['primaryKey'];
                var intRegex = /^[0-9]+$/;
                for( var x in idSelected ) {
                    var idFeat = idSelected[x];
                    var afeat = features[idFeat];
                    if( typeof afeat === "undefined" )
                        continue;
                    var pk = afeat.properties[primaryKey];
                    if( !( intRegex.test(pk) ) )
                        pk = " '" + pk + "' ";
                    fi.push( pk );
                }
                lp['selected'] = fi;

                return lp;
            }

            /**
             *
             * @param parentLayerName
             */
            function getChildrenHtmlContent( parentLayerName ) {

                var childHtml = null;
                var childDiv = [];
                var childLi = [];
                var childCreateButton = ''; var childCreateButtonItems = [];
                var layerLinkButton = ''; var layerLinkButtonItems = [];
                var lConfig = config.layers[parentLayerName];
                if ( !lConfig )
                    return childHtml;
                var parentLayerId = lConfig['id'];
                if( 'relations' in config && parentLayerId in config.relations) {
                    var layerRelations = config.relations[parentLayerId];
                    var childCount = 0;
                    var childActive = 'active';
                    for( var lid in layerRelations ) {
                        var relation = layerRelations[lid];
                        var referencingLayerConfig = lizMap.getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );
                        var isNToM = false;
                        var pivotConfig = null;
                        var mLayerConfig = null;

                        if (referencingLayerConfig && referencingLayerConfig[0] in config.attributeLayers) {
                            // check if the renferencing layer is a pivot
                            mLayerConfig = getPivotLinkedLayerConfiguration(parentLayerId, referencingLayerConfig[1]);
                            // if so, switch the child layer to the "n_layer" if the n_layer could be displayed in attribute table
                            if( mLayerConfig && mLayerConfig.config && mLayerConfig.config[0] in config.attributeLayers) {
                                // store original pivot configuration
                                pivotConfig = referencingLayerConfig;
                                isNToM = true;
                            }
                            childCount+=1;
                            if( childCount > 1)
                                childActive = '';
                            // if the detected relation is n to m, then use mLayer configuration to display the child attribute table
                            var childLayerConfig = isNToM ? mLayerConfig.config[1] : referencingLayerConfig[1];
                            var childLayerName = isNToM ? mLayerConfig.config[0] : referencingLayerConfig[0];
                            var childAttributeLayerConfig = config.attributeLayers[childLayerName];

                            // Discard if the editor does not want this layer to be displayed in child table
                            if( 'hideAsChild' in childAttributeLayerConfig && childAttributeLayerConfig['hideAsChild'] == 'True' )
                                continue;

                            // Build child table id by concatenating parent and child layer names
                            var tabId = 'attribute-child-tab-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);

                            // Build Div content for tab
                            var cDiv = '<div class="tab-pane attribute-layer-child-content '+childActive+'" id="'+ tabId +'" >';
                            var tId = 'attribute-layer-table-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);
                            var tClass = 'attribute-table-table table table-hover table-condensed table-striped cell-border child-of-' + lizMap.cleanName(parentLayerName);
                            cDiv+= '    <input type="hidden" class="attribute-table-hidden-parent-layer" value="'+lizMap.cleanName(parentLayerName)+'">';
                            cDiv+= '    <input type="hidden" class="attribute-table-hidden-layer" value="'+lizMap.cleanName(childLayerName)+'">';
                            cDiv+= '    <table id="' + tId  + '" class="' + tClass + '" width="100%"></table>';
                            cDiv+= '</div>';
                            childDiv.push(cDiv);

                            // Build li content for tab
                            var cLi = '<li id="nav-tab-'+ tabId +'" class="nav-item" role="presentation"><button class="nav-link '+childActive+'" data-bs-target="#'+ tabId +'" data-bs-toggle="tab">'+ childLayerConfig.title +'</button></li>';
                            childLi.push(cLi);

                            // Add create child feature button
                            var canCreateChild = false;
                            if ('editionLayers' in config) {
                                if (childLayerName in config.editionLayers) {
                                    var al = config.editionLayers[childLayerName];
                                    if (al.capabilities.createFeature == "True") {
                                        canCreateChild = true;
                                    }
                                }
                                // if the m layer is displayed then check also the edition capabilities on pivot
                                if(canCreateChild && isNToM){
                                    // check edition capabilities for pivot table
                                    canCreateChild = pivotConfig[0] in config.editionLayers && config.editionLayers[pivotConfig[0]] && config.editionLayers[pivotConfig[0]].capabilities.createFeature == 'True'
                                }
                            }
                            if( canCreateChild ){
                                // Add a button to create a new feature for this child layer
                                let childButtonItem = `
                                    <button class="btn btn-sm btn-createFeature-attributeTable new-child" data-pivot="${isNToM ? pivotConfig[1].id : ''}" value="${lizMap.cleanName(childLayerName)}" title="${lizDict['attributeLayers.toolbar.btn.data.createFeature.title']}">
                                    ➕ ${childLayerConfig.title}
                                    </button>
                                `;
                                childCreateButtonItems.push(childButtonItem);

                                // Link parent with the selected features of the child
                                layerLinkButtonItems.push('<li><a href="#' + lizMap.cleanName(isNToM ? pivotConfig[0] : childLayerName) + '" class="btn-linkFeatures-attributeTable">' + (isNToM ? pivotConfig[1].title : childLayerConfig.title) +'</a></li>' );
                            }
                        }
                    }

                }
                if( childLi.length ){
                    if( childCreateButtonItems.length > 0 ){
                        childCreateButton+= '&nbsp;<span class="edition-children-add-buttons">';
                        for( var i in  childCreateButtonItems){
                            const childButton = childCreateButtonItems[i];
                            childCreateButton+= childButton;
                        }
                        childCreateButton+= '</span>';
                    }
                    if( layerLinkButtonItems.length > 0 ){
                        layerLinkButton+= '&nbsp;<div class="btn-group" role="group" >';
                        layerLinkButton+= '    <button type="button" class="btn btn-sm dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">';
                        layerLinkButton+= lizDict['attributeLayers.toolbar.btn.data.linkFeatures.title'];
                        layerLinkButton+= '      <span class="caret"></span>';
                        layerLinkButton+= '    </button>';
                        layerLinkButton+= '    <ul class="dropdown-menu" role="menu">';
                        for( var i in  layerLinkButtonItems){
                            var li = layerLinkButtonItems[i];
                            layerLinkButton+= li;
                        }
                        layerLinkButton+= '    </ul>';
                        layerLinkButton+= '</div>';
                    }
                    childHtml = {
                        'tab-content': childDiv,
                        'tab-li': childLi,
                        'childCreateButton': childCreateButton,
                        'layerLinkButton': layerLinkButton
                    } ;
                }
                return childHtml;
            }

            // Refresh attribute table content for all children of a given layer
            /**
             *
             * @param sourceTable
             * @param featureType
             * @param featId
             */
            function refreshChildrenLayersContent( sourceTable, featureType, featId ) {
                var feat = config.layers[featureType]['features'][featId];
                if(!feat) {
                    return false;
                }
                var fp = feat.properties;

                var lConfig = config.layers[featureType];
                if ( !lConfig ) {
                    return false;
                }
                var parentLayerId = lConfig['id'];
                // Refresh recursively for direct children and other parent
                if( 'relations' in config && parentLayerId in config.relations) {
                    var layerRelations = config.relations[parentLayerId];
                    for (const relation of layerRelations ) {
                        var referencingLayerConfig = lizMap.getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );

                        // Fill in attribute table for child
                        if( referencingLayerConfig ) {
                            var isNToM = false, mLayerConfig = null;
                            // check if the referencingLayer is a pivot table
                            mLayerConfig = getPivotLinkedLayerConfiguration(parentLayerId, referencingLayerConfig[1]);
                            if (mLayerConfig) {
                                // if the realtion is n to m, switch the layer config to the mLayer
                                referencingLayerConfig = mLayerConfig.config;
                                isNToM = true;
                            }
                            // Discard if the editor does not want this layer to be displayed in child table
                            if (config.attributeLayers?.[referencingLayerConfig[0]]?.['hideAsChild'] == 'False') {
                                const [childLayerName, childLayerConfig] = referencingLayerConfig;
                                // Get child table id
                                const childTableSelector = sourceTable.replace(' table:first', '') + '-' + lizMap.cleanName(childLayerName);
                                // Generate filter
                                let filter = '';
                                if ( isNToM ) {
                                    // get feature from pivot
                                    getPivotWFSFeatures(relation.referencingLayer, mLayerConfig.relation, fp[relation.referencedField]).then((filterString)=>{
                                        getEditionChildData(childLayerName, filterString, childTableSelector, filterString ? false : true);
                                    })
                                } else {
                                    if( relation.referencingLayer == childLayerConfig.id ){
                                        filter = '"' + relation.referencingField + '" = ' + "'" + fp[relation.referencedField] + "'";
                                    }
                                    getDataAndFillAttributeTable(childLayerName, filter, childTableSelector, false);
                                }
                            }
                        }
                    }
                }
            }

            var lizdelay = (function(){
                var timer = 0;
                return function(callback, ms){
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })();

            /**
             *
             * @param aName
             * @param aTable
             * @param cFeatures
             * @param aCallback
             */
            function refreshLayerAttributeDatatable(aName, aTable, cFeatures, aCallback) {
                // Get config
                var lConfig = config.layers[aName];
                // get cleaned name
                var cleanName = lizMap.cleanName( aName );

                // Detect if table is parent or child
                var isChild = true;
                let parentLayerID = '';
                if (['#attribute-layer-table-', '#edition-table-'].includes(aTable.replace(cleanName, ''))){
                    isChild = false;
                }else{
                    let parentLayerName = '';
                    if (aTable.startsWith('#attribute-layer-table-')){
                        parentLayerName =  aTable.replace('#attribute-layer-table-', '').split('-')[0];
                    } else if (aTable.startsWith('#edition-table-')) {
                        parentLayerName = aTable.replace('#edition-table-', '').split('-')[0];
                    }

                    if(parentLayerName){
                        parentLayerID = config.layers[parentLayerName]['id'];
                    }
                }

                // Hidden fields
                var hiddenFields = [];
                if( aName in config.attributeLayers
                    && 'hiddenFields' in config.attributeLayers[aName]
                    && config.attributeLayers[aName]['hiddenFields']
                ){
                    var hf = config.attributeLayers[aName]['hiddenFields'].trim();
                    hiddenFields = hf.split(/[\s,]+/);
                }

                cFeatures = typeof cFeatures !== 'undefined' ?  cFeatures : null;
                if( !cFeatures ){
                    // features is an object, let's transform it to an array
                    // XXX IE compat: Object.values is not available on IE...
                    var features = config.layers[aName]['features'];
                    cFeatures = Object.keys(features).map(function (key) {
                        return features[key];
                    });
                }

                if( cFeatures && cFeatures.length > 0 ){
                    // Format features for datatable
                    var ff = formatDatatableFeatures(
                        cFeatures,
                        isChild,
                        hiddenFields,
                        lConfig['selectedFeatures'],
                        lConfig['id'],
                        parentLayerID);
                    var foundFeatures = ff.foundFeatures;
                    var dataSet = ff.dataSet;

                    // Datatable configuration
                    if ( $.fn.dataTable.isDataTable( aTable ) ) {
                        var oTable = $( aTable ).dataTable();
                        oTable.fnClearTable();
                        oTable.fnAddData( dataSet );
                    }
                    lConfig['features'] = foundFeatures;
                }

                if ( !cFeatures || cFeatures.length == 0 ){
                    if ( $.fn.dataTable.isDataTable( aTable ) ) {
                        var oTable = $( aTable ).dataTable();
                        oTable.fnClearTable();
                    }
                    $(aTable).hide();

                    $('#attribute-layer-'+ cleanName +' span.attribute-layer-msg').html(
                        lizDict['attributeLayers.toolbar.msg.data.nodata'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
                    ).addClass('failure');
                } else {
                    $(aTable).show();
                }

                if (aCallback)
                    aCallback(aName,aTable);

                return false;
            }

            /**
             *
             * @param aName
             * @param aTable
             * @param cFeatures
             * @param cAliases
             * @param cTypes
             * @param allColumnsKeyValues
             * @param aCallback
             */
            function buildLayerAttributeDatatable(aName, aTable, cFeatures, cAliases, cTypes, allColumnsKeyValues, aCallback ) {
                // Get config
                var lConfig = config.layers[aName];

                // get cleaned name
                var cleanName = lizMap.cleanName( aName );

                cAliases = typeof cAliases !== 'undefined' ?  cAliases : null;
                if( !cAliases ){
                    cAliases = lConfig['alias'];
                }
                for( const key in cAliases){
                    if(cAliases[key]==""){
                        cAliases[key]=key;
                    }
                }

                // Detect if table is parent or child
                var isChild = true;
                let parentLayerID = '';
                if (['#attribute-layer-table-', '#edition-table-'].includes(aTable.replace(cleanName, ''))){
                    isChild = false;
                }else{
                    let parentLayerCleanName = '';
                    if (aTable.startsWith('#attribute-layer-table-')){
                        parentLayerCleanName =  aTable.replace('#attribute-layer-table-', '').split('-')[0];
                    } else if (aTable.startsWith('#edition-table-')) {
                        parentLayerCleanName = aTable.replace('#edition-table-', '').split('-')[0];
                    }

                    if(parentLayerCleanName){
                        const parentLayerName = lizMap.getLayerNameByCleanName(parentLayerCleanName);
                        if (parentLayerName) {
                            parentLayerID = config.layers[parentLayerName]['id'];
                        }
                    }
                }

                // Pivot table ?
                var isPivot = false;
                if( isChild
                    && 'pivot' in config.attributeLayers[aName]
                    && config.attributeLayers[aName]['pivot'] == 'True'
                ){
                    isPivot = true;
                }
                var pivotReference = null;
                // checks if the parent and child are related via pivot
                if (parentLayerID) {
                    // means that the table is displayed as a child
                    var parentLayerConfig = lizMap.getLayerConfigById(parentLayerID);
                    var fromEditionForm = aTable.startsWith('#attribute-layer-table-') ? false : (aTable.startsWith('#edition-table-') ? true : false);
                    var highlightedFeature = null;
                    if (fromEditionForm) {
                        // get fid of current layer on editing
                        highlightedFeature = $('#edition-form-container form input[name="liz_featureId"]').val();
                    } else {
                        highlightedFeature = config.layers[attributeLayersDic[parentLayerConfig[1].cleanname]].highlightedFeature;
                    }
                    if (parentLayerConfig && parentLayerConfig[1] && parentLayerConfig[1].cleanname && highlightedFeature) {
                        var childLayerId = lConfig.id;
                        var pivotId = getPivotIdFromRelatedLayers(parentLayerID, childLayerId);
                        if (pivotId) {
                            pivotReference = pivotId + ":" + highlightedFeature;
                        }
                    }
                }

                // Hidden fields
                var hiddenFields = [];
                if( aName in config.attributeLayers
                    && 'hiddenFields' in config.attributeLayers[aName]
                    && config.attributeLayers[aName]['hiddenFields']
                ){
                    var hf = config.attributeLayers[aName]['hiddenFields'].trim();
                    hiddenFields = hf.split(/[\s,]+/);
                }

                // Check edition capabilities
                var canEdit = false;
                var canDelete = false;
                if( 'editionLayers' in config && aName in config.editionLayers ) {
                    var al = config.editionLayers[aName];
                    if( al.capabilities.modifyAttribute == "True" || al.capabilities.modifyGeometry == "True" )
                        canEdit = true;
                    if( al.capabilities.deleteFeature == "True" )
                        canDelete = true;
                }

                cFeatures = typeof cFeatures !== 'undefined' ?  cFeatures : null;
                if( !cFeatures ){
                    // features is an object, let's transform it to an array
                    // XXX IE compat: Object.values is not available on IE...
                    var features = config.layers[aName]['features'];
                    cFeatures = Object.keys(features).map(function (key) {
                        return features[key];
                    });
                }

                var atFeatures = cFeatures;
                var dataLength = atFeatures.length;

                if( cFeatures && cFeatures.length > 0 ){
                    // Create columns for datatable
                    var cdc = createDatatableColumns(aName, atFeatures, hiddenFields, cAliases, cTypes, allColumnsKeyValues);
                    var columns = cdc.columns;
                    var firstDisplayedColIndex = cdc.firstDisplayedColIndex;

                    // Format features for datatable
                    var ff = formatDatatableFeatures(
                        atFeatures,
                        isChild,
                        hiddenFields,
                        lConfig['selectedFeatures'],
                        lConfig['id'],
                        parentLayerID,
                        pivotReference);
                    var foundFeatures = ff.foundFeatures;
                    var dataSet = ff.dataSet;

                    // Fill in the features object
                    // only when necessary : object is empty or is not child or (is child and no full features list in the object)
                    var refillFeatures = false;
                    var dLen = lConfig['features'] ? Object.keys(lConfig['features']).length : 0;
                    if( dLen == 0 ){
                        refillFeatures = true;
                        if( !isChild ){
                            lConfig['featuresFullSet'] = true;
                        }
                    }
                    else{
                        if( isChild ){
                            if( !lConfig['featuresFullSet'] ){
                                refillFeatures = true;
                            }
                        }else{
                            lConfig['featuresFullSet'] = true;
                            refillFeatures = true;
                        }
                    }
                    if( refillFeatures  ) {
                        lConfig['features'] = foundFeatures;
                    }

                    lConfig['alias'] = cAliases;
                    // Datatable configuration
                    if ( $.fn.dataTable.isDataTable( aTable ) ) {
                        var oTable = $( aTable ).dataTable();
                        oTable.fnClearTable();
                        oTable.fnAddData( dataSet );
                    }
                    else {
                        // Search while typing in text input
                        // Deactivate if too many items
                        var searchWhileTyping = true;
                        if( dataLength > 500000 ){
                            searchWhileTyping = false;
                        }

                        var myDom = '<<t>ipl>';
                        if( searchWhileTyping ) {
                            $('#attribute-layer-search-' + cleanName).on( 'keyup', function (e){
                                var searchVal = this.value;
                                lizdelay(function(){
                                    oTable.fnFilter( searchVal );
                                }, 500 );
                            });
                        }else{
                            myDom = '<<t>ipl>';
                        }

                        $( aTable ).dataTable( {
                            data: dataSet
                            ,columns: columns
                            ,initComplete: function(settings, json) {
                                const api = new $.fn.dataTable.Api(settings);
                                const tableId = api.table().node().id;
                                const featureType = tableId.split('attribute-layer-table-')[1];

                                // Trigger event telling attribute table is ready
                                lizMap.events.triggerEvent("attributeLayerContentReady",
                                    {
                                        'featureType': featureType
                                    }
                                );
                            }
                            ,order: [[ firstDisplayedColIndex, "asc" ]]
                            ,language: { url:globalThis['lizUrls']["dataTableLanguage"] }
                            ,deferRender: true
                            ,createdRow: function ( row, data, dataIndex ) {
                                if ( $.inArray( data.DT_RowId.toString(), lConfig['selectedFeatures'] ) != -1
                                ) {
                                    $(row).addClass('selected');
                                    data.lizSelected = 'a';
                                }
                            }
                            ,drawCallback: function (settings) {
                                // rendering ok, find img with data-attr-thumbnail
                                const thumbnailColl = document.getElementsByClassName('data-attr-thumbnail');
                                for(let thumbnail of thumbnailColl) {
                                    thumbnail.setAttribute('src', lizUrls.media+'?repository='+lizUrls.params.repository+'&project='+lizUrls.params.project+'&path='+thumbnail.dataset.src);
                                }
                            }
                            ,dom: myDom
                            ,pageLength: 50
                            ,scrollY: '95%'
                            ,scrollX: '100%'

                        } );

                        var oTable = $( aTable ).dataTable();

                        if( !searchWhileTyping )
                            $('#attribute-layer-search-' + cleanName).hide();

                        // Bind button which clears top-left search input content
                        $('#attribute-layer-search-' + cleanName).next('.clear-layer-search').click(function(){
                            $('#attribute-layer-search-' + cleanName).val('').focus().keyup();
                        });

                        // Unbind previous events on page
                        $( aTable ).on( 'page.dt', function() {
                            // unbind previous events
                            $(aTable +' tr').unbind('click');
                            $(aTable +' tr td button').unbind('click');
                        });

                        // Bind events when drawing table
                        $( aTable ).on( 'draw.dt', function() {

                            $(aTable +' tr').unbind('click');
                            $(aTable +' tr td button').unbind('click');

                            // Bind event when users click anywhere on the table line to highlight
                            bindTableLineClick(aName, aTable);

                            // Refresh size
                            var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');

                            refreshDatatableSize('#' + mycontainerId);

                            return false;

                        });
                    }

                    // Check editable features
                    if (canEdit || canDelete) {
                        lizMap.mainLizmap.edition.fetchEditableFeatures([lConfig.id]);
                    }
                }

                if ( !cFeatures || cFeatures.length == 0 ){
                    if ( $.fn.dataTable.isDataTable( aTable ) ) {
                        var oTable = $( aTable ).dataTable();
                        oTable.fnClearTable();
                    }
                    $(aTable).hide();

                    $('#attribute-layer-'+ cleanName +' span.attribute-layer-msg').html(
                        lizDict['attributeLayers.toolbar.msg.data.nodata'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
                    ).addClass('failure');

                } else {
                    $(aTable).show();
                    refreshDatatableSize('#'+$('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id'))

                }

                if (aCallback)
                    aCallback(aName,aTable);

                return false;
            }

            /**
             *
             * @param aName
             * @param atFeatures
             * @param hiddenFields
             * @param cAliases
             * @param cTypes
             * @param allColumnsKeyValues
             */
            function createDatatableColumns(aName, atFeatures, hiddenFields, cAliases, cTypes, allColumnsKeyValues){
                const columns = [];
                let firstDisplayedColIndex = 0;
                // Column with selected status
                columns.push( {"data": "lizSelected", "width": "25px", "searchable": false, "sortable": true, "visible": false} );
                firstDisplayedColIndex+=1;

                columns.push({ "data": "featureToolbar", "width": "25px", "searchable": false, "sortable": false});
                firstDisplayedColIndex += 1;

                // Add column for each field
                for (var columnName in atFeatures[0].properties){
                    // Do not add hidden fields
                    if (hiddenFields.includes(columnName)){
                        continue;
                    }

                    const colConf = {
                        "data": columnName,
                        "title": cAliases[columnName]
                    };

                    // Replace keys by values if defined
                    if (allColumnsKeyValues?.hasOwnProperty(columnName)){
                        const columnKeyValues = allColumnsKeyValues[columnName];
                        colConf['render'] = function (data, type, row, meta) {
                            // Return value related to key if any. Else return original data
                            // Handle multiple values defined as an array
                            if (Array.isArray(data)){
                                return data.map(key => columnKeyValues[key] ? columnKeyValues[key] : key).join(', ');
                            }
                            // For multiple values displayed as {"value a", "value b"} we must first split the value
                            else if (data && data.toString().substring(0, 1) == '{' && data.toString().slice(-1) == '}') {
                                var displayLabels = [];
                                var stringData = data.toString();
                                stringData = stringData.substring(1, stringData.length - 1);
                                let splitValues = stringData.split(',');
                                for (var s in splitValues) {
                                    let splitValue = splitValues[s].replace(/"/g, '');
                                    displayLabels.push(columnKeyValues[splitValue] ? columnKeyValues[splitValue] : splitValue);
                                }
                                let displayText = displayLabels.length > 0 ? displayLabels.join(', ') : null;
                                return displayText;
                            } else {
                                return columnKeyValues[data] ? columnKeyValues[data] : data ;
                            }
                        }
                    } else if (['decimal', 'double'].includes(cTypes?.[columnName])) {
                        // Handle decimal
                        colConf['render'] = function (data, type, row, meta) {
                            return parseFloat(data);
                        }
                    } else {
                        // Check if we need to replace url or media by link
                        let davConf = globalThis['lizUrls'].webDavUrl && globalThis['lizUrls']?.resourceUrlReplacement?.webdav && config.layers[aName]?.webDavFields && Array.isArray(config.layers[aName].webDavFields) && config.layers[aName].webDavFields.includes(columnName);
                        colConf['render'] = function (data, type, row, meta) {
                            // Replace media and URL with links
                            if (!data || !(typeof data === 'string'))
                                return data;
                            if (davConf) {
                                // replace the root of the url
                                if(data.startsWith(globalThis['lizUrls'].webDavUrl)){
                                    data = data.replace(globalThis['lizUrls'].webDavUrl, globalThis['lizUrls'].resourceUrlReplacement.webdav)
                                }
                            }

                            if (data.substring(0, 6) == 'media/' || data.substring(0, 7) == '/media/' || data.substring(0, 9) == '../media/') {
                                var rdata = data;
                                var colMeta = meta.settings.aoColumns[meta.col];
                                if (data.substring(0, 7) == '/media/')
                                    rdata = data.slice(1);
                                return '<a href="' + mediaLinkPrefix + '&path=' + rdata + '" target="_blank">' + colMeta.title + '</a>';
                            }
                            else if (davConf && data.substring(0, 4) == globalThis['lizUrls'].resourceUrlReplacement.webdav) {
                                var rdata = data;
                                var colMeta = meta.settings.aoColumns[meta.col];
                                return '<a href="' + mediaLinkPrefix + '&path=' + rdata + '" target="_blank">' + colMeta.title + '</a>';

                            }
                            else if (data.substring(0, 4) == 'http' || data.substring(0, 3) == 'www') {
                                var rdata = data;
                                if (data.substring(0, 3) == 'www')
                                    rdata = 'http://' + data;
                                return '<a href="' + rdata + '" target="_blank">' + data + '</a>';
                            }
                            else
                                return data;
                        }
                    }

                    // Handle text alignment
                    // Note: when keys are replaced by values, alignment is
                    // made based on keys type and not values type as in QGIS
                    switch (cTypes?.[columnName]) {
                        case 'integer':
                        case 'int':
                        case 'unsignedInt':
                        case 'long':
                        case 'unsignedLong':
                        case 'decimal':
                        case 'double':
                            colConf['className'] = 'text-right';
                            break;
                        case 'date':
                            colConf['className'] = 'text-center';
                            break;
                        default:
                            break;
                    }

                    columns.push( colConf );
                }

                var colToReturn = {
                    'columns': columns,
                    'firstDisplayedColIndex': firstDisplayedColIndex
                };

                // Reorder and hide columns from QGIS attributetableconfig property
                if(
                    'attributetableconfig' in config.attributeLayers[aName]
                    && config.attributeLayers[aName]['attributetableconfig']
                    && !$.isEmptyObject(config.attributeLayers[aName]['attributetableconfig']['columns'])
                ){
                    if (!('column' in config.attributeLayers[aName]['attributetableconfig']['columns'])) {
                        var atc = config.attributeLayers[aName]['attributetableconfig']['columns'];
                        if(atc.length == 0){
                            return colToReturn;
                        }
                        var lizcols = columns.slice(0, firstDisplayedColIndex);
                        var newcolumns = [];
                        for (var x in atc) {
                            var colx = atc[x];
                            // Do nothing if the item does not reference a field
                            if (colx.type != 'field') {
                                continue;
                            }
                            for (const column of columns) {
                                if (!('data' in column)) {
                                    continue;
                                }
                                if (colx.name == column.data) {
                                    newcolumns.push(column);
                                }
                            }
                        }
                        colToReturn['columns'] = lizcols.concat(newcolumns);
                        return colToReturn;
                    }
                    var atc = config.attributeLayers[aName]['attributetableconfig']['columns']['column'];
                    if(atc.length == 0){
                        return colToReturn;
                    }
                    var lizcols = columns.slice(0, firstDisplayedColIndex);
                    var newcolumns = columns.slice(firstDisplayedColIndex);

                    var newpos = 0;
                    for(var x in atc){
                        var colx = atc[x];
                        // Do nothing if the item does not reference a field
                        if(colx.attributes.type != 'field')
                            continue;
                        var fieldname = colx.attributes.name;
                        var colhidden = colx.attributes.hidden;

                        // Rearrange columns
                        for (var i=0; i < newcolumns.length; i++) {
                            // move item
                            if ('data' in newcolumns[i] && newcolumns[i].data === fieldname) {
                                // adds it back to the good position if not declared hidden
                                if( colhidden == "1" ){
                                    // Remove the item
                                    var a = newcolumns.splice(i,1);
                                }else{
                                    // Move the item
                                    var cfrom = i;
                                    newcolumns.splice(newpos, 0, newcolumns.splice(cfrom,1)[0]);
                                    newpos+= 1;
                                }
                                break;
                            }
                        }
                    }

                    var newcolumnsfinal = lizcols.concat(newcolumns)
                    colToReturn['columns'] = newcolumnsfinal;
                } else if (
                    'columns' in config.layers[aName]
                    && config.layers[aName]['columns']
                    && Object.keys(config.layers[aName]['columns']).length > 0
                ) {
                    var lizcols = columns.slice(0, firstDisplayedColIndex);
                    var newcolumns = columns.slice(firstDisplayedColIndex);

                    var newpos = 0;
                    // columns is an object with key as integer
                    for (const key in config.layers[aName]['columns']) {
                        const fieldname = config.layers[aName]['columns'][key];
                        // Rearrange columns
                        for (var i=0; i < newcolumns.length; i++) {
                            // move item
                            if ('data' in newcolumns[i] && newcolumns[i].data === fieldname) {
                                // Move the item
                                var cfrom = i;
                                newcolumns.splice(newpos, 0, newcolumns.splice(cfrom,1)[0]);
                                newpos+= 1;
                            }
                        }
                    }

                    var newcolumnsfinal = lizcols.concat(newcolumns)
                    colToReturn['columns'] = newcolumnsfinal;
                }

                return colToReturn;
            }


            /**
             *
             * @param atFeatures
             * @param isChild
             * @param hiddenFields
             * @param selectedFeatures
             * @param layerId
             * @param parentLayerID
             * @param pivotId
             */
            function formatDatatableFeatures(atFeatures, isChild, hiddenFields, selectedFeatures, layerId, parentLayerID, pivotId = null){
                var dataSet = [];
                var foundFeatures = {};
                atFeatures.forEach(function(feat) {
                    var line = {};

                    // add feature to layer global data
                    var fid = feat.id.split('.')[1];
                    foundFeatures[fid] = feat;

                    // Add row ID
                    line['DT_RowId'] = fid;
                    line['lizSelected'] = 'z';

                    if( selectedFeatures && $.inArray( fid, selectedFeatures ) != -1 )
                        line.lizSelected = 'a';
                    line['featureToolbar'] = `<lizmap-feature-toolbar value="${layerId + '.' + fid}" ${isChild ? `parent-layer-id="${parentLayerID}"`: ''} ${pivotId ? `pivot-layer="${pivotId}"`: ''}></lizmap-feature-toolbar>`;

                    // Build table lines
                    for (var idx in feat.properties){
                        if( ($.inArray(idx, hiddenFields) > -1) )
                            continue;
                        var prop = feat.properties[idx];
                        if (typeof prop == 'string') {
                            prop = DOMPurify.sanitize(prop, {
                                ADD_ATTR: ['target']
                            });
                        }
                        line[idx] = prop;
                    }


                    dataSet.push( line );
                });
                return {
                    'dataSet': dataSet,
                    'foundFeatures': foundFeatures
                };
            }

            /**
             *
             * @param {string} aName  The layer name
             * @param {string} aTable The HTML table selector
             */
            function bindTableLineClick(aName, aTable){
                $(aTable +' tr').click(function() {

                    $(aTable +' tr').removeClass('active');
                    $(this).addClass('active');

                    // Get corresponding feature
                    var featId = this.querySelector('lizmap-feature-toolbar').fid;

                    // Send signal
                    lizMap.events.triggerEvent("layerfeaturehighlighted",
                        { 'sourceTable': aTable, 'featureType': aName, 'fid': featId}
                    );

                    // Display popup for the feature
                    var lConfig = config.layers[aName];
                    if( lConfig && lConfig['popup'] == 'True' ){
                        var feat = lConfig['features'][featId];

                        var parentLayerCleanName = aTable.replace('#attribute-layer-table-', '').split('-');
                        parentLayerCleanName = parentLayerCleanName[0];

                        $('#attribute-table-panel-' + parentLayerCleanName ).html('');

                        lizMap.getFeaturePopupContent( aName, feat, function(data){
                            $('#attribute-table-panel-' + parentLayerCleanName ).html(data);
                            // Add the missing Bootstrap classes
                            $('#attribute-table-panel-' + parentLayerCleanName + ' table').addClass('table table-condensed table-striped table-bordered');

                            // Trigger event
                            lizMap.events.triggerEvent('lizmappopupdisplayed_inattributetable'
                            );

                            var closeButton = '<a class="close-attribute-feature-panel pull-right" href="#"><i class="icon-remove"></i></a>'
                            $('#attribute-table-panel-' + parentLayerCleanName + ' h4').append(closeButton);

                            $('#attribute-table-panel-' + parentLayerCleanName + ' h4 a.close-attribute-feature-panel').click(function(){
                                // Hide panel
                                $('#attribute-layer-main-' + parentLayerCleanName ).removeClass('reduced');
                                $('#attribute-table-panel-' + parentLayerCleanName ).removeClass('visible').html('');
                                // Deactivate Detail button
                                $('#attribute-layer-'+ parentLayerCleanName + ' button.btn-detail-attributeTable').removeClass('btn-primary');

                            });
                        });
                    }
                });
            }

            /**
             *
             * @param childLayerName
             * @param filter
             * @param childTable
             * @param forceEmptyTable
             */
            function getEditionChildData( childLayerName, filter, childTable, forceEmptyTable = false ){
                getDataAndFillAttributeTable(childLayerName, filter, childTable, forceEmptyTable, () => {
                    // Check edition capabilities
                    var canCreateChildren = false;
                    var canEdit = false;
                    if ('editionLayers' in config && childLayerName in config.editionLayers) {
                        var al = config.editionLayers[childLayerName];
                        if (al.capabilities.createFeature == "True") {
                            canCreateChildren = true;
                        }
                        if (al.capabilities.modifyAttribute == "True" || al.capabilities.modifyGeometry == "True") {
                            canEdit = true;
                        }
                    }

                    // Bind events when drawing table
                    $( childTable ).one( 'draw.dt', function() {

                        if( canEdit ) {
                            // Add property on lizmap-feature-toolbar to edit children feature linked to a parent feature
                            const parentFeatId = $(childTable).parents('div.tab-pane.attribute-layer-child-content')
                                .find('input.attribute-table-hidden-parent-feature-id').val();
                            $(childTable).DataTable().cells().nodes()
                                .to$().children('lizmap-feature-toolbar').attr('parent-feature-id', parentFeatId);
                        }

                        if ( canCreateChildren ) {
                            // Button to create feature linked to parent
                            const createHeader = $($(childTable).DataTable().column(1).header());
                            if ( createHeader.find('button.attribute-layer-feature-create').length == 0 ) {
                                createHeader
                                    .append(`<button class="btn btn-sm attribute-layer-feature-create" value="-1" title="${lizDict['attributeLayers.toolbar.btn.data.createFeature.title']}">
                                            <i class="icon-plus"></i>
                                        </button>`)
                                    .on('click', 'button.attribute-layer-feature-create',function () {
                                        var tabPane = $(this).parents('div.tab-pane.attribute-layer-child-content');
                                        var parentFeatId = tabPane.find('input.attribute-table-hidden-parent-feature-id').val();
                                        var parentLayerName = tabPane.find('input.attribute-table-hidden-parent-layer').val();
                                        var layerName = tabPane.find('input.attribute-table-hidden-layer').val();
                                        lizMap.getLayerFeature(parentLayerName, parentFeatId, function (parentFeat) {
                                            var parentLayerId = config.layers[lizMap.getLayerNameByCleanName(parentLayerName)]['id'];
                                            var lid = config.layers[lizMap.getLayerNameByCleanName(layerName)]['id'];
                                            // n to m relations check
                                            var pivotId = getPivotIdFromRelatedLayers(lid, parentLayerId);

                                            lizMap.launchEdition(lid, null, { layerId: parentLayerId, feature: parentFeat, pivotId: pivotId });
                                        });
                                        return false;
                                    });
                            }
                        }

                        // Display the first child table displayed
                        if ( $(childTable).parents('.edition-children-content').children('ul.nav-tabs').children('li.active').length == 0 ) {
                            var tabId = $(childTable).parents('.tab-pane.attribute-layer-child-content').attr('id');
                            $(childTable).parents('.edition-children-content').find('ul.nav-tabs > li > a[href="#'+tabId+'"]').click();
                        }
                        return false;

                    });
                });
            }


            // Deprecated, use getDataAndFillAttributeTable() instead
            /**
             *
             * @param aName
             * @param aFilter
             * @param aFeatureID
             * @param aGeometryName
             * @param aCallBack
             */
            function getAttributeFeatureData(aName, aFilter, aFeatureID, aGeometryName, aCallBack){

                aFilter = typeof aFilter !== 'undefined' ?  aFilter : null;
                aFeatureID = typeof aFeatureID !== 'undefined' ?  aFeatureID : null;
                aGeometryName  = typeof aGeometryName !== 'undefined' ?  aGeometryName : 'extent';
                aCallBack = typeof aCallBack !== 'undefined' ?  aCallBack : null;

                // get layer configs
                if ( !(aName in config.layers) ) {
                    var qgisName = lizMap.getNameByCleanName(aName);
                    if ( qgisName && (qgisName in config.layers)) {
                        aName = qgisName;
                    } else {
                        console.log('getAttributeFeatureData: "'+aName+'" and "'+qgisName+'" not found in config');
                        return false;
                    }
                }
                var aConfig = config.layers[aName];
                var atConfig = null;
                if( aName in config.attributeLayers )
                    atConfig = config.attributeLayers[aName];

                var limitDataToBbox = false;
                if ( 'limitDataToBbox' in config.options && config.options.limitDataToBbox == 'True'){
                    limitDataToBbox = true;
                }
                lizMap.getFeatureData(aName, aFilter, aFeatureID, aGeometryName, limitDataToBbox, null, null, aCallBack);
                return true;
            }

            /**
             *
             * @param featureType
             * @param featId
             * @param rupdateDrawing
             */
            function refreshLayerSelection( featureType, featId, rupdateDrawing ) {
                // Set function parameters if not given
                rupdateDrawing = typeof rupdateDrawing !== 'undefined' ?  rupdateDrawing : null;

                // Assure selectedFeatures property exists for the layer
                if( !config.layers[featureType]['selectedFeatures'] )
                    config.layers[featureType]['selectedFeatures'] = [];

                // Add or remove feature id from the selectedFeatures
                if( $.inArray( featId, config.layers[featureType]['selectedFeatures'] ) == -1 ) {
                    config.layers[featureType]['selectedFeatures'].push( featId );
                }else{
                    var idx = $.inArray( featId, config.layers[featureType]['selectedFeatures'] );
                    config.layers[featureType]['selectedFeatures'].splice( idx, 1 );
                }

                lizMap.events.triggerEvent("layerSelectionChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['selectedFeatures'],
                        'updateDrawing': rupdateDrawing
                    }
                );

            }

            /**
             *
             * @param featureType
             * @param supdateDrawing
             */
            function setSelectedFeaturesFromSearchedFilter( featureType, supdateDrawing ) {
                // Set function parameters if not given
                supdateDrawing = typeof supdateDrawing !== 'undefined' ?  supdateDrawing : true;

                // Assure selectedFeatures property exists for the layer
                if( !config.layers[featureType]['selectedFeatures'] )
                    config.layers[featureType]['selectedFeatures'] = [];

                var hasChanged = false;
                // Add filtered featured
                $('.attribute-table-table[id]').each(function(){
                    var tableId = $(this).attr('id');
                    var tableLayerName = $(this).parents('div.dataTables_wrapper:first').prev('input.attribute-table-hidden-layer').val()
                    // Get parent table for the feature type
                    if ( tableLayerName
                        && $.fn.dataTable.isDataTable( $(this) )
                        && lizMap.cleanName( featureType ) == tableLayerName
                    ){

                        var sIds = [];
                        var rTable = $(this).DataTable();
                        var filteredrowids = rTable.rows( {"filter":"applied"} ).ids();
                        for ( var i = 0; i < filteredrowids.length; i++ ) {
                            sIds.push( filteredrowids[i] );
                        }
                        config.layers[featureType]['selectedFeatures'] = sIds;
                        hasChanged = true;
                    }
                })

                if( hasChanged ){
                    lizMap.events.triggerEvent("layerSelectionChanged",
                        {
                            'featureType': featureType,
                            'featureIds': config.layers[featureType]['selectedFeatures'],
                            'updateDrawing': supdateDrawing
                        }
                    );
                }
            }

            /**
             *
             * @param featureType
             * @param arefresh
             */
            function emptyLayerSelection( featureType, arefresh ) {
                // Set function parameters if not given
                arefresh = typeof arefresh !== 'undefined' ?  arefresh : true;

                // Empty array
                config.layers[featureType]['selectedFeatures'] = [];

                lizMap.events.triggerEvent("layerSelectionChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['selectedFeatures'],
                        'updateDrawing': arefresh
                    }
                );
            }

            /**
             *
             * @param featureType
             * @param featId
             */
            function refreshLayerFilter( featureType, featId ) {
                // Assure filteredFeatures property exists for the layer
                if( !config.layers[featureType]['filteredFeatures'] )
                    config.layers[featureType]['filteredFeatures'] = [];

                // Add or remove feature id from the filteredFeatures
                if( $.inArray( featId, config.layers[featureType]['filteredFeatures'] ) == -1 ) {
                    config.layers[featureType]['filteredFeatures'].push( featId );
                }else{
                    var idx = $.inArray( featId, config.layers[featureType]['filteredFeatures'] );
                    config.layers[featureType]['filteredFeatures'].splice( idx, 1 );
                }

                lizMap.events.triggerEvent("layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['filteredFeatures'],
                        'updateDrawing': true
                    }
                );
            }

            /**
             *
             * @param featureType
             */
            function emptyLayerFilter( featureType ) {
                // Empty array
                config.layers[featureType]['filteredFeatures'] = [];

                lizMap.lizmapLayerFilterActive = null;

                // Empty layer filter
                config.layers[featureType]['request_params']['filter'] = null;
                config.layers[featureType]['request_params']['exp_filter'] = null;
                config.layers[featureType]['request_params']['filtertoken'] = null;

                // Update layer state
                lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(featureType).expressionFilter = null;

                lizMap.events.triggerEvent("layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['filteredFeatures'],
                        'updateDrawing': true
                    }
                );
            }

            /**
             *
             * @param featureType
             */
            function filterLayerFromSelectedFeatures( featureType ) {

                if( !config.attributeLayers[featureType] )
                    return false;
                // Assure selectedFeatures property exists for the layer
                if( !config.layers[featureType]['selectedFeatures'] )
                    config.layers[featureType]['selectedFeatures'] = [];

                // Copy selected features as filtered features
                config.layers[featureType]['filteredFeatures'] = config.layers[featureType]['selectedFeatures'].slice();

                // Remove selection
                emptyLayerSelection( featureType, false );

                lizMap.lizmapLayerFilterActive = featureType;

                lizMap.events.triggerEvent("layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['filteredFeatures'],
                        'updateDrawing': true
                    }
                );
            }

            /**
             *
             * @param typeNamePile
             * @param typeNameFilter
             * @param typeNameDone
             * @param cascade
             */
            function updateLayer( typeNamePile, typeNameFilter, typeNameDone,  cascade ){
                if (typeNamePile.length == 0) {
                    return;
                }
                cascade = typeof cascade !== 'undefined' ?  cascade : true;

                // Get first elements of the pile and withdraw it from the pile
                var typeName = typeNamePile.shift();

                // Get corresponding filter
                var aFilter = typeNameFilter[typeName];

                // Apply filter and get children
                if (aFilter) {
                    applyLayerFilter( typeName, aFilter, typeNamePile, typeNameFilter, typeNameDone, cascade );
                } else {
                    applyEmptyLayerFilter( typeName, typeNamePile, typeNameFilter, typeNameDone, cascade );
                }

                $('#layerActionUnfilter').toggle((lizMap.lizmapLayerFilterActive !== null));
            }

            /**
             *
             * @param relation
             * @param typeNameDone
             */
            function buildChildParam( relation, typeNameDone ) {
                var childLayerConfigA = lizMap.getLayerConfigById(
                    relation.referencingLayer,
                    config.attributeLayers,
                    'layerId'
                );

                // if no config
                if( !childLayerConfigA ) {
                    return null;
                }

                var childLayerKeyName = childLayerConfigA[0];
                var childLayerConfig = childLayerConfigA[1];

                // Avoid typeName already done ( infinite loop )
                if( $.inArray( childLayerKeyName, typeNameDone ) != -1 )
                    return null;

                // Check if it is a pivot table
                var relationIsPivot = false;
                if( 'pivot' in childLayerConfig
                && childLayerConfig.pivot == 'True'
                && childLayerConfig.layerId in config.relations.pivot
                ){
                    relationIsPivot = true;
                }
                // Build parameter for this child
                var fParam = {
                    'filter': null,
                    'fieldToFilter': relation.referencingField,
                    'parentField': relation.referencedField,
                    'parentValues': [],
                    'pivot': relationIsPivot,
                    'otherParentTypeName': null,
                    'otherParentRelation': null,
                    'otherParentValues': []
                };

                return [childLayerKeyName, fParam];
            }

            /**
             *
             * @param typeNameId
             * @param attributeLayerConfig
             * @param typeNameDone
             */
            function getPivotParam( typeNameId, attributeLayerConfig, typeNameDone ) {
                var isPivot = false;
                var pivotParam = null;
                if( 'pivot' in attributeLayerConfig
                && attributeLayerConfig.pivot == 'True'
                && attributeLayerConfig.layerId in config.relations.pivot
                ){
                    isPivot = true;
                }

                if (!isPivot) {
                    return pivotParam;
                }

                var otherParentId = null;
                var otherParentRelation = null;
                var otherParentTypeName = null;

                for( var rx in config.relations ){
                // Do not take pivot object into account
                    if( rx == 'pivot' )
                        continue;
                    // Do not get relation for parent layer (we are looking for other parents only)
                    if( rx == typeNameId)
                        continue;
                    // Do not get relation for parent to avoid ( infinite loop otherwise )
                    var otherParentConfig = lizMap.getLayerConfigById(
                        rx,
                        config.attributeLayers,
                        'layerId'
                    );
                    if( otherParentConfig
                    && $.inArray( otherParentConfig[0], typeNameDone ) != -1
                    )
                        continue;

                    var aLayerRelations = config.relations[rx];

                    for( var xx in aLayerRelations){
                    // Only look at relations concerning typeName
                        if( aLayerRelations[xx].referencingLayer != attributeLayerConfig.layerId)
                            continue;

                        otherParentId = rx;
                        otherParentRelation = aLayerRelations[xx];

                        var otherParentConfig = lizMap.getLayerConfigById(
                            rx,
                            config.attributeLayers,
                            'layerId'
                        );
                        otherParentTypeName =  otherParentConfig[0];
                    }
                }

                if( otherParentId && otherParentRelation){
                    pivotParam = {};
                    pivotParam['otherParentTypeName'] = otherParentTypeName;
                    pivotParam['otherParentRelation'] = otherParentRelation;
                    pivotParam['otherParentValues'] = [];
                }

                return pivotParam;
            }

            /**
             *
             * @param typeName
             * @param typeNamePile
             * @param typeNameFilter
             * @param typeNameDone
             * @param cascade
             */
            function applyEmptyLayerFilter( typeName, typeNamePile, typeNameFilter, typeNameDone, cascade ){

                // Add done typeName to the list
                typeNameDone.push( typeName );

                // **0** Prepare some variable. e.g. reset features stored in the layer config
                var layerConfig = config.layers[typeName];
                layerConfig['features'] = {};

                // **1** Get children info
                var typeNameId = layerConfig['id'];
                var typeNameChildren = {};

                var getAttributeLayerConfig = lizMap.getLayerConfigById(
                    typeNameId,
                    config.attributeLayers,
                    'layerId'
                );
                var attributeLayerConfig = null;
                if( getAttributeLayerConfig ) {
                    attributeLayerConfig = getAttributeLayerConfig[1];
                }

                if( 'relations' in config
                && typeNameId in config.relations
                && cascade
                ) {
                // Loop through relations to get children data
                    var layerRelations = config.relations[typeNameId];
                    for( var lid in layerRelations ) {
                        var relation = layerRelations[lid];
                        var childParam = buildChildParam(relation, typeNameDone);

                        // if no child param
                        if( !childParam )
                            continue;

                        typeNameChildren[ childParam[0] ] = childParam[1];
                    }
                }

                // ** ** If typeName is a pivot, add some info about the otherParent
                // If pivot, re-loop relations to find configuration for other parents (go up)
                var pivotParam = getPivotParam( typeNameId, attributeLayerConfig, typeNameDone );

                // **3** Apply filter to the typeName and redraw if necessary
                layerConfig['request_params']['filter'] = null;
                layerConfig['request_params']['exp_filter'] = null;
                layerConfig['request_params']['filtertoken'] = null;

                // Update layer state
                lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layerConfig.name).expressionFilter = null;

                // Refresh attributeTable
                var opTable = '#attribute-layer-table-'+lizMap.cleanName( typeName );
                if( $( opTable ).length ){
                    getDataAndRefreshAttributeTable(typeName, null, opTable);
                }

                // And send event so that getFeatureInfo and getPrint use the updated layer filters
                lizMap.events.triggerEvent("layerFilterParamChanged",
                    {
                        'featureType': typeName,
                        'filter': null,
                        'updateDrawing': true
                    }
                );

                // **4** build children filters
                if( cascade ) {
                    for( var x in typeNameChildren ){
                        typeNameFilter[x] = null;
                        typeNamePile.push( x );
                    }
                }

                // **5** Add other parent to pile when typeName is a pivot
                if( pivotParam ){
                    // console.log(pivotParam);
                    // Add a Filter to the "other parent" layers
                    config.layers[ pivotParam['otherParentTypeName'] ]['request_params']['filter'] = null;
                    config.layers[ pivotParam['otherParentTypeName'] ]['request_params']['exp_filter'] = null;
                    config.layers[ pivotParam['otherParentTypeName'] ]['request_params']['filtertoken'] = null;

                    // Update layer state
                    lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(pivotParam['otherParentTypeName']).expressionFilter = null;

                    typeNameFilter[ pivotParam['otherParentTypeName'] ] = null;
                    typeNamePile.push( pivotParam['otherParentTypeName'] );
                }

                // **6** Launch the method again if typeName is not empty
                if( typeNamePile.length > 0 ) {
                    updateLayer( typeNamePile, typeNameFilter, typeNameDone, cascade );
                }

            }

            /**
             *
             * @param typeName
             * @param aFilter
             * @param typeNamePile
             * @param typeNameFilter
             * @param typeNameDone
             * @param cascade
             */
            function applyLayerFilter( typeName, aFilter, typeNamePile, typeNameFilter, typeNameDone, cascade ){
                if (!aFilter) {
                    applyEmptyLayerFilter( typeName, typeNamePile, typeNameFilter, typeNameDone, cascade );
                    return;
                }

                // Add done typeName to the list
                typeNameDone.push( typeName );

                // Get features to refresh attribute table AND build children filters
                var geometryName = 'extent';
                lizMap.getFeatureData(typeName, aFilter, null, geometryName, false, null, null,
                    function (aName, aNameFilter, aNameFeatures, aNameAliases, aNameTypes ){

                        // **0** Prepare some variable. e.g. reset features stored in the layer config
                        var layerConfig = config.layers[typeName];
                        layerConfig['features'] = {};
                        var foundFeatures = {};
                        const wmsName = layerConfig?.shortname || layerConfig.name;

                        // **1** Get children info
                        var cFeatures = aNameFeatures;
                        var typeNameId = layerConfig['id'];
                        var typeNamePkey = config.attributeLayers[typeName]['primaryKey'];
                        var typeNamePkeyValues = [];
                        var typeNameChildren = {};

                        var getAttributeLayerConfig = lizMap.getLayerConfigById(
                            typeNameId,
                            config.attributeLayers,
                            'layerId'
                        );
                        var attributeLayerConfig = null;
                        if( getAttributeLayerConfig )
                            attributeLayerConfig = getAttributeLayerConfig[1];

                        if( 'relations' in config
                    && typeNameId in config.relations
                    && cascade
                        ) {
                            // Loop through relations to get children data
                            var layerRelations = config.relations[typeNameId];
                            for( var lid in layerRelations ) {

                                var relation = layerRelations[lid];
                                var childParam = buildChildParam(relation, typeNameDone);

                                // if no child param
                                if( !childParam )
                                    continue;

                                typeNameChildren[ childParam[0] ] = childParam[1];

                            }
                        }

                        // ** ** If typeName is a pivot, add some info about the otherParent
                        // If pivot, re-loop relations to find configuration for other parents (go up)
                        var pivotParam = getPivotParam( typeNameId, attributeLayerConfig, typeNameDone );

                        // **2** Loop through features && get children filter values
                        var filteredFeatures = [];

                        cFeatures.forEach(function(feat) {

                            // Add feature to layer config data
                            var fid = feat.id.split('.')[1];
                            foundFeatures[fid] = feat;

                            // extract and format PK
                            var pkTypeIsString = ('types' in layerConfig)
                                && (typeNamePkey in layerConfig.types)
                                && layerConfig.types[typeNamePkey] == 'string';
                            var pk = sqlEscapeFilter(feat.properties[typeNamePkey], pkTypeIsString);

                            // Add primary keys values to build the WMS filter ( to be able to redraw layer)
                            typeNamePkeyValues.push( pk );

                            // Reset filteredFeatures with found features
                            filteredFeatures.push( fid );

                            // Loop through found children to build filter
                            // Only if aFilter (original typeName filter) is not null
                            if( cascade && aFilter ){
                                for( var x in typeNameChildren ){
                                    // Get the parent values to be able to build the filter
                                    var cData = typeNameChildren[x];
                                    typeNameChildren[x]['parentValues'].push( "'" + feat.properties[ cData['parentField'] ] + "'" );
                                }
                            }

                            // If pivot, we need also to get the values to filter the other parent
                            if( pivotParam && aFilter ){
                                var referencingField = pivotParam['otherParentRelation'].referencingField;
                                pivotParam['otherParentValues'].push( "'" + feat.properties[ referencingField ] + "'" );
                            }
                        });

                        // **3** Apply filter to the typeName and redraw if necessary
                        layerConfig['features'] = foundFeatures;
                        layerConfig['alias'] = aNameAliases;

                        var lFilter = null;

                        // Add false value to hide all features if we need to hide layer
                        if( typeNamePkeyValues.length == 0 )
                            typeNamePkeyValues.push('-99999');

                        if( aFilter ){
                            // The values must be separated by comma AND spaces
                            // since QGIS controls the syntax for the FILTER parameter
                            lFilter = wmsName + ':"' + typeNamePkey + '" IN ( ' + typeNamePkeyValues.join( ' , ' ) + ' ) ';

                            // Try to use the simple filter ( for example myforeignkey = 4 )
                            // instead of the full list of pkeys we got from wfs
                            // This can prevent too long GET URL
                            // NB : we should improve this by using server side filters
                            if( !aFilter.startsWith('$id') ){
                                var simpleFilter = aFilter;
                                if( !aFilter.startsWith(wmsName) ){
                                    simpleFilter = wmsName + ':' + aFilter ;
                                }
                                lFilter = simpleFilter;
                            }
                        }

                        layerConfig['request_params']['filter'] = lFilter;
                        layerConfig['request_params']['exp_filter'] = aFilter;

                        // Add filter to openlayers layer
                        if( aFilter ){
                            // Get filter token
                            fetch(globalThis['lizUrls'].service, {
                                method: "POST",
                                body: new URLSearchParams({
                                    service: 'WMS',
                                    request: 'GETFILTERTOKEN',
                                    typename: wmsName,
                                    filter: lFilter
                                })
                            }).then(response => {
                                return response.json();
                            }).then(result => {
                                layerConfig['request_params']['filtertoken'] = result.token;

                                // Update layer state
                                lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layerConfig.name).filterToken = {
                                    expressionFilter: layerConfig['request_params']['exp_filter'],
                                    token: result.token
                                };
                            });
                        } else {
                            layerConfig['request_params']['filtertoken'] = null;

                            // Update layer state
                            lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(layerConfig.name).expressionFilter = null;
                        }

                        // Refresh attributeTable
                        var opTable = '#attribute-layer-table-'+lizMap.cleanName( typeName );
                        if( $( opTable ).length ){
                            refreshLayerAttributeDatatable(typeName, opTable, cFeatures);
                        }

                        // And send event so that getFeatureInfo and getPrint use the updated layer filters
                        lizMap.events.triggerEvent("layerFilterParamChanged",
                            {
                                'featureType': typeName,
                                'filter': lFilter,
                                'updateDrawing': true
                            }
                        );

                        // **4** build children filters
                        if( cascade ) {
                            for( var x in typeNameChildren ){
                                var cName = x;
                                var cData = typeNameChildren[x];
                                var cFilter = null;
                                var cExpFilter = null;

                                // Build filter for children
                                // and add child to the typeNameFilter and typeNamePile objects
                                // only if typeName filter aFilter was originally set
                                if( aFilter && cData['parentValues'].length > 0 && cascade != 'removeChildrenFilter' ) {
                                    // The values must be separated by comma AND spaces
                                    // since QGIS controls the syntax for the FILTER parameter
                                    cExpFilter = '"' + cData['fieldToFilter'] + '" IN ( ' + cData['parentValues'].join( ' , ' ) + ' )';
                                }
                                else if( aFilter && cascade != 'removeChildrenFilter' ) {
                                    cExpFilter = '"' + cData['fieldToFilter'] + '" IN ( -99999 )';
                                }
                                const cLayerConfig = config.layers[cName];
                                const cWmsName = cLayerConfig?.shortname || cLayerConfig.name;
                                cFilter = cWmsName + ':' + cExpFilter;

                                cLayerConfig['request_params']['filter'] = cFilter;
                                cLayerConfig['request_params']['exp_filter'] = cExpFilter;

                                // Update layer state
                                lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(cName).expressionFilter = cExpFilter;

                                typeNameFilter[x] = cExpFilter;
                                typeNamePile.push( x );

                            }
                        }

                        // **5** Add other parent to pile when typeName is a pivot
                        if( pivotParam ){
                            // Add a Filter to the "other parent" layers
                            var cFilter = null;
                            // The stored filter in this variable cExpFilter must not be prefixed by the layername
                            // since it is used to build the EXP_FILTER parameter
                            // the cFilter will be based on this value but with the layer name as prefix
                            var cExpFilter = null;
                            var orObj = null;

                            if( aFilter  ){
                                if( pivotParam['otherParentValues'].length > 0 ){
                                    cExpFilter = '"' + pivotParam['otherParentRelation'].referencedField + '"';
                                    // The values must be separated by comma AND spaces
                                    // since QGIS controls the syntax for the FILTER parameter
                                    cExpFilter+= ' IN ( ' + pivotParam['otherParentValues'].join( ' , ' ) + ' )';
                                    cFilter = wmsName + ':' + cExpFilter;
                                    orObj = {
                                        field: pivotParam['otherParentRelation'].referencedField,
                                        values: pivotParam['otherParentValues']
                                    }
                                }
                                else {
                                    cExpFilter = '"' + pivotParam['otherParentRelation'].referencedField + '" IN ( ' + "'-999999'" + ' )';
                                    cFilter = wmsName + ':' + cExpFilter;
                                    orObj = {
                                        field: pivotParam['otherParentRelation'].referencedField,
                                        values: ['-999999']
                                    }
                                }
                            }
                            config.layers[ pivotParam['otherParentTypeName'] ]['request_params']['filter'] = cFilter;
                            config.layers[ pivotParam['otherParentTypeName'] ]['request_params']['exp_filter'] = cExpFilter;

                            // Update layer state
                            lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(pivotParam['otherParentTypeName']).expressionFilter = cExpFilter;

                            // The stored filter in this variable must not be prefixed by the layername
                            // since it is used to build the EXP_FILTER parameter
                            // the FILTER will be based on this value but with the layer name as prefix
                            typeNameFilter[ pivotParam['otherParentTypeName'] ] = cExpFilter;
                            typeNamePile.push( pivotParam['otherParentTypeName'] );
                        }

                        // **6** Launch the method again if typeName is not empty
                        if( typeNamePile.length > 0 ) {
                            updateLayer( typeNamePile, typeNameFilter, typeNameDone, cascade );
                        }
                    });
            }

            /**
             *
             * @param layerId
             * @param featureId
             */
            function deleteEditionFeature( layerId, featureId ){
                var eConfig = lizMap.getLayerConfigById(
                    layerId,
                    config.editionLayers,
                    'layerId'
                );
                var deleteConfirm = '';
                if( eConfig )
                    deleteConfirm += config.layers[eConfig[0]].title;
                if( config.layers[eConfig[0]]
                    && config.layers[eConfig[0]]['features']
                    && config.layers[eConfig[0]]['features'][featureId]
                ){
                    var eProp = config.layers[eConfig[0]]['features'][featureId].properties;
                    for( var y in eProp ){
                        deleteConfirm+= '  \n"' + y + '": ' + eProp[y] ;
                    }

                }
                lizMap.deleteEditionFeature( layerId, featureId, deleteConfirm, function( aLID, aFID ){
                    // Check if the map and tables must be refreshed after this deletion
                    var featureType = eConfig[0];
                    var cascadeToChildren = $('#jforms_view_attribute_layers_option_cascade_label input[name="cascade"]').prop('checked');
                    // Get filter status for the layer concerned by the edition
                    var hasFilter = false;
                    if(
                        ('filteredFeatures' in config.layers[featureType] && config.layers[featureType]['filteredFeatures'].length > 0 )
                        || ( 'request_params' in config.layers[featureType] && config.layers[featureType]['request_params']['filter'] )
                        || ( 'request_params' in config.layers[featureType] && config.layers[featureType]['request_params']['exp_filter'] )
                    ){
                        hasFilter = true;
                    }
                    if( hasFilter && lizMap.lizmapLayerFilterActive && cascadeToChildren ){
                        var parentFeatureType = lizMap.lizmapLayerFilterActive;
                        updateMapLayerDrawing( parentFeatureType, cascadeToChildren );
                    }
                });
            }

            /**
             *
             * @param featureType
             * @param cascade
             */
            function updateMapLayerDrawing( featureType, cascade ){
                cascade = typeof cascade !== 'undefined' ?  cascade : true;
                // Get layer config
                var lConfig = config.layers[featureType];
                if( !lConfig ){
                    return;
                }

                // Build filter from filteredFeatures
                var cFilter = null;
                if (lConfig?.['filteredFeatures']?.length) {
                    // The values must be separated by comma AND spaces
                    // since QGIS controls the syntax for the FILTER parameter
                    cFilter = '$id IN ( ' + sqlEscapeFilter(lConfig['filteredFeatures']) + ' ) ';
                }

                const wmsName = lConfig?.['shortname'] || featureType;

                // Build selection parameter from selectedFeatures
                if( lConfig?.['selectedFeatures']?.length) {
                    lConfig['request_params']['selection'] = wmsName + ':' + lConfig['selectedFeatures'].join();

                    // Get selection token
                    fetch(globalThis['lizUrls'].service, {
                        method: "POST",
                        body: new URLSearchParams({
                            service: 'WMS',
                            request: 'GETSELECTIONTOKEN',
                            typename: wmsName,
                            ids: lConfig.selectedFeatures.join()
                        })
                    }).then(response => {
                        return response.json();
                    }).then(result => {
                        lConfig.request_params['selectiontoken'] = result.token;
                        // Update layer state
                        lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(lConfig.name).selectionToken = {
                            selectedFeatures: lConfig.selectedFeatures,
                            token: result.token
                        };
                    });
                }
                else {
                    lConfig['request_params']['selection'] = null;
                    lConfig['request_params']['selectiontoken'] = null;

                    lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(lConfig.name).selectedFeatures = null;
                }

                // Build data to update layer drawing and other components
                var typeNamePile = [ featureType ];
                var typeNameFilter = {};
                typeNameFilter[featureType] = cFilter;
                var typeNameDone = [];
                updateLayer(typeNamePile, typeNameFilter, typeNameDone,  cascade );
            }

            /**
             *
             * @param featureType
             */
            function updateMapLayerSelection(featureType) {
                // Get layer config
                var lConfig = config.layers[featureType];
                if (!lConfig){
                    return;
                }

                const wmsName = lConfig?.['shortname'] || featureType;

                // Build selection parameter from selectedFeatures
                if (lConfig?.selectedFeatures?.length) {
                    if (!('request_params' in lConfig)) {
                        lConfig['request_params'] = {};
                    }
                    lConfig.request_params['selection'] = wmsName + ':' + lConfig.selectedFeatures.join();

                    // Get selection token
                    fetch(globalThis['lizUrls'].service, {
                        method: "POST",
                        body: new URLSearchParams({
                            service: 'WMS',
                            request: 'GETSELECTIONTOKEN',
                            typename: wmsName,
                            ids: lConfig.selectedFeatures.join()
                        })
                    }).then(response => {
                        return response.json();
                    }).then(result => {
                        lConfig.request_params['selectiontoken'] = result.token;
                        // Update layer state
                        lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(lConfig.name).selectionToken = {
                            selectedFeatures: lConfig.selectedFeatures,
                            token: result.token
                        };
                    });
                } else {

                    if (!('request_params' in lConfig)) {
                        lConfig['request_params'] = {};
                    }
                    lConfig.request_params['selection'] = null;
                    lConfig.request_params['selectiontoken'] = null;

                    // Update layer state
                    lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerByName(lConfig.name).selectedFeatures = null;
                }
            }

            /**
             *
             * @param featureType
             */
            function updateAttributeTableTools( featureType ){

                // Show unselect and filter buttons if some features are selected
                var selIds = config.layers[featureType]['selectedFeatures'];
                var filIds = config.layers[featureType]['filteredFeatures'];
                var cleanName = lizMap.cleanName(featureType);
                // UnSelection button and move selection to top
                if( selIds && selIds.length > 0 ){
                    $('button.btn-unselect-attributeTable[value="'+cleanName+'"]').removeClass('hidden');
                    $('button.btn-moveselectedtotop-attributeTable[value="'+cleanName+'"]').removeClass('hidden');
                }
                else{
                    $('button.btn-unselect-attributeTable[value="'+cleanName+'"]').addClass('hidden');
                    $('button.btn-moveselectedtotop-attributeTable[value="'+cleanName+'"]').addClass('hidden');
                }

                // Filter button

                // Hide it first and remove active classes
                $('button.btn-filter-attributeTable[value="'+cleanName+'"]').addClass('hidden').removeClass('btn-primary');

                // Then display it only if:
                // * no other features is active and selected items exists for this layer
                // * or this is the layer for which it is active
                if( ( !lizMap.lizmapLayerFilterActive && selIds && selIds.length > 0)
                    || lizMap.lizmapLayerFilterActive == featureType
                ){
                    $('button.btn-filter-attributeTable[value="'+cleanName+'"]').removeClass('hidden');

                    // Show button as activated if some filter exists
                    if( filIds && filIds.length > 0 )
                        $('button.btn-filter-attributeTable[value="'+cleanName+'"]').addClass('btn-primary');
                }

            }

            /**
             *
             * @param featureType
             * @param featureIds
             */
            function redrawAttributeTableContent( featureType, featureIds ){
                // Loop through all datatables to get the one concerning this featureType
                $('.attribute-table-table[id]').each(function(){
                    var tableId = $(this).attr('id');
                    var tableLayerName = $(this).parents('div.dataTables_wrapper:first').prev('input.attribute-table-hidden-layer').val()

                    if ( tableLayerName
                        && $.fn.dataTable.isDataTable( $(this) )
                        && lizMap.cleanName( featureType ) == tableLayerName
                    ){
                        // Get selected feature ids if not given
                        if( !featureIds ){
                            // Assure selectedFeatures property exists for the layer
                            if( !config.layers[featureType]['selectedFeatures'] )
                                config.layers[featureType]['selectedFeatures'] = [];
                            var featureIds = config.layers[featureType]['selectedFeatures'];
                        }

                        // Get Datatable api
                        var rTable = $(this).DataTable();
                        var dTable = $(this).dataTable();

                        // Remove class selected for all the lines
                        rTable
                            .rows( $(this).find('tr.selected') )
                            .every(function(){
                                dTable.fnUpdate( 'z', this, 0, false, false );
                            })
                        //~ .draw()
                            .nodes()
                            .to$()
                            .removeClass( 'selected' )
                        ;

                        // Add class selected from featureIds
                        // And change lizSelected column value to a
                        if( featureIds.length > 0 ){

                            var rTable = $(this).DataTable();
                            rTable.data().each( function(d){
                                if( $.inArray( d.DT_RowId.toString(), featureIds ) != -1 )
                                    d.lizSelected = 'a';
                            });
                            rTable
                                .rows( function ( idx, data, node ) {
                                    return data.lizSelected == 'a' ? true : false;
                                })
                                .nodes()
                                .to$()
                                .addClass( 'selected' )
                            ;
                        }
                    }

                });
            }

            /**
             *
             * @param featureType
             */
            function refreshTablesAfterEdition( featureType ){
                // Loop through each datatable, and refresh if it corresponds to the layer edited
                $('.attribute-table-table[id]').each(function(){
                    // get table id
                    var tableId = $(this).attr('id');
                    // verifying the id
                    if ( !tableId )
                        return true;

                    var tableLayerName = $(this).parents('div.dataTables_wrapper:first').prev('input.attribute-table-hidden-layer').val()

                    if ( tableLayerName
                        && $.fn.dataTable.isDataTable( $(this) )
                        && lizMap.cleanName( featureType ) == tableLayerName
                    ){
                        var zTable = '#' + tableId;
                        var parentTable = zTable;
                        var parentLayerCleanName = tableLayerName;
                        var parentLayerName = featureType;
                        var zClassNames = $(zTable).attr('class').split(' ');
                        for(var zKey=0; zKey<zClassNames.length; zKey++) {
                            if( !zClassNames[zKey].match('child-of-'))
                                continue;

                            parentLayerCleanName = zClassNames[zKey].substring('child-of-'.length);
                            parentTable = '#attribute-layer-table-' + parentLayerCleanName;
                            parentLayerName = attributeLayersDic[parentLayerCleanName];
                            break;
                        }
                        // If child, re-highlight parent feature to refresh all the children
                        // or update the edition table
                        if( parentTable != zTable ){
                            if( zTable.match('edition-table-') ) {
                                // get info from the form
                                var formFeatureId = $('#edition-form-container form input[name="liz_featureId"]').val();
                                var formLayerId = $('#edition-form-container form input[name="liz_layerId"]').val();
                                // get parent layer config
                                var getParentLayerConfig = lizMap.getLayerConfigById( formLayerId );
                                if ( (featureType in config.attributeLayers) && parentLayerName == getParentLayerConfig[0] ) {
                                    // get featureType layer config
                                    var featureTypeConfig = config.attributeLayers[featureType];

                                    // n to m checks
                                    var pivotId = getPivotIdFromRelatedLayers(formLayerId, featureTypeConfig.layerId)

                                    //get relation
                                    var relation = getRelationInfo(formLayerId,featureTypeConfig.layerId);

                                    if( relation != null || pivotId) {
                                        lizMap.getLayerFeature(parentLayerName, formFeatureId, function(feat) {
                                            var fp = feat.properties;
                                            if (pivotId) {
                                                const currentPivot = config.relations.pivot[pivotId];
                                                const pivotConfig =  lizMap.getLayerConfigById(
                                                    pivotId,
                                                    config.layers,
                                                    'id'
                                                );
                                                if( pivotConfig && pivotConfig[1] ){

                                                    const referencedPivotField = currentPivot[formLayerId];
                                                    const referencingPivotField = currentPivot[featureTypeConfig.layerId];
                                                    const referencedFieldForFilter = config.relations[featureTypeConfig.layerId].filter((fil)=>{
                                                        return fil.referencingLayer == pivotId
                                                    })[0]?.referencedField;

                                                    const childReferencedField = config.relations[featureTypeConfig.layerId].filter((rel)=>{
                                                        return rel.referencingLayer == pivotId
                                                    })[0]?.referencedField;

                                                    if(referencedPivotField && referencingPivotField && referencedFieldForFilter && childReferencedField){
                                                        const pWfsParam = {
                                                            referencedPivotField : referencedPivotField,
                                                            referencingPivotField : referencingPivotField,
                                                            referencedFieldForFilter : referencedFieldForFilter
                                                        }
                                                        getPivotWFSFeatures(pivotId, pWfsParam, fp[childReferencedField]).then((filterString)=>{
                                                            getEditionChildData(featureType, filterString, zTable, filterString ? false : true);
                                                        })
                                                    }
                                                }
                                            } else {
                                                var filter = '"' + relation.referencingField + '" = ' + "'" + fp[relation.referencedField] + "'";
                                                getEditionChildData( featureType, filter, zTable);
                                            }

                                        });
                                    }
                                }
                            } else {
                                var parentHighlighted = config.layers[parentLayerName]['highlightedFeature'];
                                if( parentHighlighted )
                                    $(parentTable +' tr#' + parentHighlighted).click();
                            }
                        }
                        // Else refresh main table with no filter
                        else{
                            // If not pivot
                            getDataAndFillAttributeTable(featureType, null, zTable, false);
                        }
                    }
                });
            }

            /**
             *
             * @param container
             */
            function refreshDatatableSize(container){

                var dtable = $(container).find('table.dataTable');
                if ( dtable.length == 0 ) {
                    return;
                }

                // Adapt height
                var h = $(container + ' div.attribute-layer-content').height() ? $(container + ' div.attribute-layer-content').height() : 0;

                h -= $(container + ' thead').height() ? $(container + ' thead').height() : 0;
                h -= $(container + ' div.dataTables_paginate').height() ? $(container + ' div.dataTables_paginate').height() : 0;
                h -= $(container + ' div.dataTables_filter').height() ? $(container + ' div.dataTables_filter').height() : 0;
                h -= 20;

                dtable.parent('div.dataTables_scrollBody').height(h);

                // Width : adapt columns size
                dtable.DataTable().tables().columns.adjust();
            }

            /**
             *
             * @param nlayerId
             * @param referencingLayerConfig
             */
            function getPivotLinkedLayerConfiguration(nlayerId, referencingLayerConfig){
                const refAttributeLayerConf = lizMap.getLayerConfigById( referencingLayerConfig.id, lizMap.config.attributeLayers, 'layerId' );

                if (refAttributeLayerConf && refAttributeLayerConf[1]?.pivot == 'True' && config.relations?.pivot && referencingLayerConfig.id in config.relations.pivot && nlayerId in config.relations.pivot[referencingLayerConfig.id]){
                    // get referenced layer for the parent layer
                    const referencedLayer = Object.keys(config.relations.pivot[referencingLayerConfig.id]).filter((k)=>{ return k != nlayerId})
                    var mLayerConfig = null;
                    if (referencedLayer.length == 1) {
                        mLayerConfig = lizMap.getLayerConfigById(
                            referencedLayer[0],
                            config.layers,
                            'id'
                        );

                        if (mLayerConfig) {
                            var currentPivot = config.relations.pivot[referencingLayerConfig.id];
                            if (currentPivot) {
                                const referencedPivotField = currentPivot[nlayerId];
                                const referencingPivotField = currentPivot[referencedLayer[0]];
                                const referencedFieldForFilter = config.relations[mLayerConfig[1].id].filter((fil)=>{
                                    return fil.referencingLayer == referencingLayerConfig.id
                                })[0]?.referencedField;

                                if (referencedPivotField && referencingPivotField && referencedFieldForFilter) {
                                    return {
                                        config:mLayerConfig,
                                        relation:{
                                            referencedPivotField:referencedPivotField,
                                            referencingPivotField:referencingPivotField,
                                            referencedFieldForFilter:referencedFieldForFilter
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return null;
            }

            /**
             *
             * @param nlayerId
             * @param mLayerId
             */
            function getPivotIdFromRelatedLayers(nlayerId, mLayerId){
                // returns the pivotId starting from the related layers
                // this method assumes that the mLayer and nLayer is related with n to m relation via a single pivot
                // i.e. there is not n to m relation duplication
                if (config.relations.pivot) {
                    var pivotId = Object.keys(config.relations.pivot).filter((key)=>{
                        return config.relations.pivot[key][mLayerId] != null && config.relations.pivot[key][nlayerId] != null;
                    })[0] //<--- assumes that the couple father-childs belongs to a single pivot

                    if (pivotId) {
                        const refAttributeLayerConf = lizMap.getLayerConfigById( pivotId, lizMap.config.attributeLayers, 'layerId' );
                        if(refAttributeLayerConf && refAttributeLayerConf[1]?.pivot == 'True'){
                            // check if pivot is in relations for both layers
                            const validRelation = [nlayerId,mLayerId].every((layerId)=>{
                                return config.relations[layerId] && config.relations[layerId].filter((rlayer)=>{ return rlayer.referencingLayer == pivotId}).length == 1
                            })
                            if (validRelation)
                                return pivotId;
                        }
                    }
                }
                return null;
            }

            /**
             *
             * @param pivotId
             * @param wfsFields
             * @param referencedFieldValue
             */
            async function getPivotWFSFeatures(pivotId, wfsFields, referencedFieldValue){

                const pivotConfig =  lizMap.getLayerConfigById(
                    pivotId,
                    config.layers,
                    'id'
                );

                let filterString = "", feats = {};
                if( pivotConfig && pivotConfig[1] ){
                    // the field on the pivot linked to the nLayer
                    const referencedPivotField = wfsFields.referencedPivotField;
                    // the field on the pivot linked to the mLayer
                    const referencingPivotField = wfsFields.referencingPivotField;
                    // the field on the mLayer linked the the pivot
                    const referencedFieldForFilter = wfsFields.referencedFieldForFilter;

                    const typeName = pivotConfig[1].typename;
                    const wfsParams = {
                        TYPENAME: typeName,
                        GEOMETRYNAME: 'extent'
                    };
                    wfsParams['EXP_FILTER'] = '"' + referencedPivotField + '" = ' + "'" + referencedFieldValue + "'";
                    if (config.options?.limitDataToBbox == 'True') {
                        wfsParams['BBOX'] = lizMap.mainLizmap.map.getView().calculateExtent();
                        wfsParams['SRSNAME'] = lizMap.mainLizmap.map.getView().getProjection().getCode();
                    }

                    const getFeatureRequest = lizMap.mainLizmap.wfs.getFeature(wfsParams);

                    let results = await getFeatureRequest;

                    if(results && results.features){

                        const features = results.features;

                        let filArray = [];
                        features.forEach((feat)=>{
                            var fid = feat.id.split('.')[1];
                            feats[fid] = feat;
                            if (feat.properties && feat.properties[referencingPivotField]) {
                                filArray.push(feat.properties[referencingPivotField])
                            }
                        })
                        if (filArray.length) {
                            var fil = filArray.map(function(val){
                                return '"'+referencedFieldForFilter+'" = \''+val+'\'';
                            })
                            filterString = fil.join(" OR ");
                        }
                    }

                }
                pivotConfig[1].features = feats;

                return filterString;
            }

            lizMap.refreshDatatableSize = function(container){
                return refreshDatatableSize(container);
            }

            lizMap.events.on({

                layerfeaturehighlighted: function(e) {
                    config.layers[e.featureType]['highlightedFeature'] = e.fid;
                    refreshChildrenLayersContent( e.sourceTable, e.featureType, e.fid );
                },

                layerfeatureselected: function(e) {
                    refreshLayerSelection( e.featureType, e.fid, e.updateDrawing );
                },

                layerfeatureunselectall: function(e) {
                    emptyLayerSelection( e.featureType, e.updateDrawing );
                },

                layerfeatureselectsearched: function(e) {
                    setSelectedFeaturesFromSearchedFilter( e.featureType, e.updateDrawing );
                },

                layerfeaturefilterselected: function(e) {
                    filterLayerFromSelectedFeatures( e.featureType );
                },

                layerfeatureremovefilter: function(e) {
                    emptyLayerFilter( e.featureType );
                },

                layerSelectionChanged: function(e) {

                    // Update attribute table tools
                    updateAttributeTableTools( e.featureType );

                    // Redraw attribute table content ( = add "selected" classes)
                    redrawAttributeTableContent( e.featureType, e.featureIds );

                    // Update openlayers layer drawing
                    if( e.updateDrawing )
                        updateMapLayerSelection( e.featureType );
                },

                layerFilteredFeaturesChanged: function(e) {

                    // Update attribute table tools
                    updateAttributeTableTools( e.featureType );

                    // Update layer
                    var cascadeToChildren = $('#jforms_view_attribute_layers_option_cascade_label input[name="cascade"]').prop('checked');
                    if ( 'cascade' in e )
                        cascadeToChildren = e.cascade;
                    updateMapLayerDrawing( e.featureType, cascadeToChildren );

                },

                lizmapeditionfeaturecreated: function(e){
                    var getLayer = lizMap.getLayerConfigById( e.layerId, config.attributeLayers, 'layerId' );
                    if( getLayer ){
                        var featureType = getLayer[0];
                        if( !(featureType in config.attributeLayers) )
                            return false;
                        refreshTablesAfterEdition( featureType );
                    }
                },

                lizmapeditionfeaturemodified: function(e){
                    var getLayer = lizMap.getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var featureType = getLayer[0];
                        if( !(featureType in config.attributeLayers) )
                            return false;
                        refreshTablesAfterEdition( featureType );
                    }
                },

                lizmapeditionfeaturedeleted: function(e){
                    var getLayer = lizMap.getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var featureType = getLayer[0];
                        if( !(featureType in config.attributeLayers) ){
                            return false;
                        }
                        refreshTablesAfterEdition( featureType );

                        // Check if the map and tables must be refreshed after this deletion
                        const cascadeToChildren = $('#jforms_view_attribute_layers_option_cascade_label input[name="cascade"]').prop('checked');
                        // Get filter status for the layer concerned by the edition
                        let hasFilter = false;
                        if (
                            ('filteredFeatures' in config.layers[featureType] && config.layers[featureType]['filteredFeatures'].length > 0)
                            || ('request_params' in config.layers[featureType] && config.layers[featureType]['request_params']['filter'])
                            || ('request_params' in config.layers[featureType] && config.layers[featureType]['request_params']['exp_filter'])
                        ){
                            hasFilter = true;
                        }
                        if (hasFilter && lizMap.lizmapLayerFilterActive && cascadeToChildren) {
                            const parentFeatureType = lizMap.lizmapLayerFilterActive;
                            updateMapLayerDrawing(parentFeatureType, cascadeToChildren);
                        }
                    } // todo : only remove line corresponding to deleted feature ?
                },

                // Filter layer when using "Locate by layer" tool
                lizmaplocatefeaturechanged: function(e){
                    if( !( e.featureType in config.attributeLayers) || startupFilter )
                        return false;

                    var aConfig = config.locateByLayer[e.featureType];
                    var triggerFilterOnLocate = false;

                    if( 'filterOnLocate' in aConfig && aConfig.filterOnLocate == 'True' )
                        triggerFilterOnLocate = true;

                    if( !triggerFilterOnLocate )
                        return false;

                    // Select feature
                    lizMap.events.triggerEvent('layerfeatureselected',
                        {'featureType': e.featureType, 'fid': e.featureId, 'updateDrawing': false}
                    );
                    // Filter selected feature
                    lizMap.events.triggerEvent('layerfeaturefilterselected',
                        {'featureType': e.featureType}
                    );
                },

                lizmaplocatefeaturecanceled: function(e){

                    lizMap.events.triggerEvent('layerfeatureremovefilter',
                        {'featureType': e.featureType}
                    );
                },

                // If there are some relations for the edited layer
                // We add the children tables below or inside the form
                lizmapeditionformdisplayed: function(e) {
                    $('#edition-children-container').hide().html('');

                    var fid =  e.featureId;

                    // Do not display children tables (from QGIS relations)
                    // if the form concerns a feature creation
                    if ( !fid || fid == '' )
                        return;

                    // Get the edited layer ID
                    var layerId = e.layerId;
                    var getLayerConfig = lizMap.getLayerConfigById( layerId );

                    // Check for relations
                    if( getLayerConfig && 'relations' in lizMap.config && layerId in lizMap.config.relations ) {
                        var relations = lizMap.config.relations[layerId];
                        var featureType = getLayerConfig[0];
                        var featureId = featureType + '.' + fid;
                        if ( relations.length > 0 ) {

                            // Build the HTML container for the children tables
                            // which will be displayed under the form
                            var childHtml = getChildrenHtmlContent( featureType );
                            var html = '';

                            // Add children content container
                            if( childHtml ){
                                // Add buttons to create new children
                                if( childHtml['childCreateButton'] ) {
                                    // Action bar
                                    html+= '<div class="attribute-layer-action-bar">';
                                    html+= childHtml['childCreateButton'];
                                    html+= '</div>';
                                }

                                // Add children content : one tab per childlayer
                                html+= '<div class="tabbable edition-children-content">';
                                // UL content: the tabs title
                                html+= '    <ul class="nav nav-tabs">';
                                for( var i in childHtml['tab-li'] ){
                                    var cLi = childHtml['tab-li'][i];
                                    html+= cLi;
                                }
                                html+= '    </ul>';

                                // Tab content
                                html+= '    <div class="tab-content">';
                                for( var i in childHtml['tab-content'] ){
                                    var cDiv = childHtml['tab-content'][i];
                                    html+= cDiv;
                                }
                                html+= '    </div>'; // tab-content
                                html+= '</div>'; // tabbable
                            }

                            // Add the child container content HTML and show it
                            $('#edition-children-container').show().append(html);

                            // Add a hidden input containing the parent feature id
                            $('#edition-children-container div.tabbable div.tab-pane input.attribute-table-hidden-parent-layer').after(
                                '<input class="attribute-table-hidden-parent-feature-id" value="'+fid+'" type="hidden">'
                            );

                            // Replace the id & href attributes of the children tabs
                            // to distinguish them from the main attribute table menu ("Data")
                            $('#edition-children-container div.tabbable ul.nav-tabs li').each(function() {
                                $(this).attr('id', $(this).attr('id').replace(/nav-tab-attribute-child-tab-/g, 'nav-tab-edition-child-tab-'));
                            });
                            $('#edition-children-container div.tabbable ul.nav-tabs li a').each(function() {
                                $(this).attr('href', $(this).attr('href').replace(/attribute-child-tab-/g, 'edition-child-tab-'));
                            });
                            $('#edition-children-container div.tabbable div.tab-content div.tab-pane').each(function() {
                                $(this).attr('id', $(this).attr('id').replace(/attribute-child-tab-/g, 'edition-child-tab-'));
                            });
                            $('#edition-children-container div.tabbable div.tab-content table').each(function() {
                                $(this).attr('id', $(this).attr('id').replace(/attribute-layer-/g, 'edition-'));
                            });

                            // Bind click on createFeature button
                            // When clicked, we launch the edition of the child feature
                            // and pass the parent ID
                            $('#edition-children-container button.btn-createFeature-attributeTable')
                                .click(function(){
                                // Ask if we should really create a child
                                // This is important, as the modified data in the parent form
                                // will be losed if the user has not saved it
                                    let confirm_msg = lizDict['edition.confirm.launch.child.creation'];
                                    let confirmChildCreation = confirm(confirm_msg);
                                    if (!confirmChildCreation) {
                                        return false;
                                    }
                                    var parentLayerId = layerId;
                                    var aName = attributeLayersDic[ $(this).val() ];
                                    var pivotId = $(this).attr("data-pivot");
                                    lizMap.getLayerFeature(featureType, fid, function(parentFeat) {
                                        var lid = config.layers[aName]['id'];
                                        lizMap.launchEdition( lid, null, {layerId:parentLayerId, feature:parentFeat, pivotId: pivotId});
                                    });
                                    return false;
                                })
                                .hover(
                                    function(){ $(this).addClass('btn-primary'); },
                                    function(){ $(this).removeClass('btn-primary'); }
                                );

                            // Bind click on createFeature button via dropDown
                            $('#edition-children-container a.btn-createFeature-attributeTable')
                                .click(function(){
                                    var parentLayerId = layerId;
                                    var selectedValue = $(this).attr('href').replace('#', '');
                                    var aName = attributeLayersDic[ selectedValue ];
                                    lizMap.getLayerFeature(featureType, fid, function(parentFeat) {
                                        var lid = config.layers[aName]['id'];
                                        lizMap.launchEdition( lid, null, {layerId:parentLayerId,feature:parentFeat});
                                        $(this).blur();
                                    });
                                    return false;
                                })
                                .hover(
                                    function(){ $(this).addClass('btn-primary'); },
                                    function(){ $(this).removeClass('btn-primary'); }
                                );

                            // Fill the child attribute table with data from the layer with WFS
                            lizMap.getLayerFeature(featureType, fid, function(feat) {
                                var fp = feat.properties;
                                for ( var i=0, len=relations.length; i<len; i++ ){
                                    var r = relations[i];
                                    var rLayerId = r.referencingLayer;
                                    var rGetLayerConfig = lizMap.getLayerConfigById( rLayerId );
                                    if ( rGetLayerConfig ) {
                                        // check if relation is nToM
                                        var isNToM = false, mLayerConfig = null;
                                        // check if the referencingLayer is a pivot table
                                        mLayerConfig = getPivotLinkedLayerConfiguration(layerId, rGetLayerConfig[1]);
                                        if (mLayerConfig) {
                                            // if the realtion is n to m, switch the layer config to the mLayer
                                            rGetLayerConfig = mLayerConfig.config;
                                            isNToM = true;
                                        }

                                        let rLayerName = rGetLayerConfig[0];
                                        let rConfigLayer = rGetLayerConfig[1];
                                        let filter = "";
                                        // Get child table id
                                        let parent_and_child = lizMap.cleanName(featureType) + '-' + lizMap.cleanName(rLayerName);
                                        let childTable = '#edition-table-' + parent_and_child;
                                        // Fill in attribute table for child
                                        if(rLayerName in config.attributeLayers){
                                            if (isNToM) {
                                                getPivotWFSFeatures(r.referencingLayer, mLayerConfig.relation, fp[r.referencedField]).then((filterString)=>{
                                                    getEditionChildData(rLayerName, filterString, childTable, filterString ? false : true);
                                                })
                                            } else {
                                                filter = '"' + r.referencingField + '" = ' + "'" + fp[r.referencedField] + "'";
                                                getEditionChildData( rLayerName, filter, childTable );
                                            }
                                        }

                                        // Try to move the tables inside the parent form
                                        // if we find dedicated containers coming from the "drag&drop" mode
                                        // Get child attribute table id
                                        var child_table_container = 'edition-child-tab-' + parent_and_child;
                                        var target_div_selector = '#edition-form-container div.lizmap-form-relation[data-relation-id="';
                                        target_div_selector += r.relationId + '"]';
                                        var target_div = $(target_div_selector);
                                        $('#' + child_table_container).appendTo(target_div);

                                        // Hide the tab in the UL of the bottom container
                                        $('#nav-tab-edition-child-tab-' + parent_and_child).hide();

                                        // Replace the label by the relation name if the relation widget label is empty
                                        if (target_div.find('legend:first').text().trim() == '') {
                                            target_div.find('legend:first').text(r.relationName);
                                        }
                                    }
                                }

                                // Hide the bottom tab container if its empty
                                // (child tables have all been moved inside the form)
                                let children_tab_content = $('div#edition-children-container div.tabbable.edition-children-content div.tab-content');
                                if (children_tab_content.find('div.attribute-layer-child-content').length == 0) {
                                    // Hide the button
                                    $('#edition-children-container div.tabbable.edition-children-content').hide();
                                }

                            });
                        }
                    }
                },

                bottomdocksizechanged: function(evt) {
                    var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                    refreshDatatableSize('#'+mycontainerId);
                },
                dockopened: function(evt) {
                    if($('#mapmenu li.attributeLayers').hasClass('active')){
                        var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                        refreshDatatableSize('#'+mycontainerId);
                    }
                },
                dockclosed: function(evt) {
                    if($('#mapmenu li.attributeLayers').hasClass('active')){
                        var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                        refreshDatatableSize('#'+mycontainerId);
                    }
                },
                rightdockopened: function(evt) {
                    if($('#mapmenu li.attributeLayers').hasClass('active')){
                        var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                        refreshDatatableSize('#'+mycontainerId);
                    }
                },
                rightdockclosed: function(evt) {
                    if($('#mapmenu li.attributeLayers').hasClass('active')){
                        var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                        refreshDatatableSize('#'+mycontainerId);
                    }
                }

            }); // lizMap.events.on end

            // Extend lizMap API
            lizMap.getAttributeFeatureData = getAttributeFeatureData;

        } // uicreated
    });

}();
