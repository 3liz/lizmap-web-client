var lizAttributeTable = function() {

    lizMap.events.on({
        'uicreated':function(evt){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var hasAttributeTableLayers = false;
            var attributeLayersActive = false;
            var attributeLayersDic = {};
            var wfsTypenameMap = {};
            var mediaLinkPrefix = OpenLayers.Util.urlAppend(lizUrls.media
              ,OpenLayers.Util.getParameterString(lizUrls.params)
            )
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

            // Lizmap URL
            var service = OpenLayers.Util.urlAppend(lizUrls.wms
                    ,OpenLayers.Util.getParameterString(lizUrls.params)
            );

            // Verifying WFS layers
            var featureTypes = lizMap.getVectorLayerFeatureTypes();
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
                var typeName = featureType.getElementsByTagName('Name')[0].textContent;
                // layername
                var layername = lizMap.getNameByTypeName( typeName );
                if ( !layername || layername == undefined )
                    continue;
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
                    var layer = lizMap.map.getLayersByName(cleanName)[0];

                    if( layer
                        && 'FILTER' in layer.params
                        && layer.params['FILTER']
                    ){

                        config.layers[configLayerName]['request_params']['filter'] = layer.params['FILTER'];

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

                    config.layers[configLayerName]['crs'] = featureType.getElementsByTagName('SRS')[0].textContent;
                    lizMap.loadProjDefinition( config.layers[configLayerName].crs, function() {
                        new OpenLayers.Projection(config.layers[configLayerName].crs);
                    });
                    var bbox = featureType.getElementsByTagName('LatLongBoundingBox')[0];
                    atConfig['bbox'] = [
                        parseFloat(bbox.getAttribute('minx'))
                        , parseFloat(bbox.getAttribute('miny'))
                        , parseFloat(bbox.getAttribute('maxx'))
                        , parseFloat(bbox.getAttribute('maxy'))
                    ];
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
                            var layer = lizMap.map.getLayersByName( cleanName )[0];
                            var ms = lizMap.map.getScale();
                            if( layer ) {
                                var lvisibility = layer.maxScale < ms && ms < layer.minScale;
                                if( !lvisibility ){
                                    var msg = lizDict['attributeLayers.msg.layer.not.visible'];
                                    lizMap.addMessage( msg, 'info', true).attr('id','lizmap-attribute-message');
                                    return false;
                                }
                            }
                        }

                        // Add Div if not already there
                        var lname = attributeLayersDic[cleanName];
                        if( !$('#nav-tab-attribute-layer-' + cleanName ).length )
                            addLayerDiv(lname);
                        var aTable = '#attribute-layer-table-'+cleanName;

                        // Get data and fill attribute table
                        var dFilter = null;
                        getAttributeFeatureData( lname, dFilter, null, 'extent',
                            function(someName, someNameFilter, someNameFeatures, someNameAliases){
                                buildLayerAttributeDatatable( someName, aTable, someNameFeatures, someNameAliases );
                        });

                        $('#nav-tab-attribute-layer-' + cleanName + ' a' ).tab('show');

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
                function warnExtent() {
                    var btitle = lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip.changed'];
                    btitle += ' ' + lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip'];
                    $('button.btn-refresh-table')
                        .attr('data-original-title', btitle)
                        .addClass('btn-warning')
                        .tooltip()
                        ;
                }
                if (limitDataToBbox) {
                    lizMap.map.events.on({
                        moveend: function () {
                            warnExtent();
                        }
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

            function activateAttributeLayers() {
                attributeLayersActive = true;

                // Deactivate locate-menu
                if ( $('#locate-menu').is(':visible') && lizMap.checkMobile()){
                    $('#toggleLocate').parent().removeClass('active');
                    $('#locate-menu').toggle();
                }
                return false;
            }

            function deactivateAttributeLayers() {
                // Some actions done when deactivating attribute table
                return false;
            }

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

            function addLayerDiv(lname) {
                // Get layer config
                var atConfig = config.attributeLayers[lname];
                var cleanName = lizMap.cleanName(lname);

                // Add li to the tabs
                var liHtml = '<li id="nav-tab-attribute-layer-' + cleanName + '">';
                liHtml+= '<a href="#attribute-layer-' + cleanName + '" data-toggle="tab">' + config.layers[lname]['title'] ;
                liHtml+= '&nbsp;<i class="btn-close-attribute-tab icon-remove icon-white" style="cursor:pointer"></i>';
                liHtml+= '</a>'
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
                    filClass= ' active btn-warning';
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
                html+= '<button class="btn-select-searched btn btn-mini" value="'+cleanName+'" title="'+lizDict['attributeLayers.toolbar.btn.select.searched.title']+'"><i class="icon-star"></i></button>';

                // Unselect button
                html+= '    <button class="btn-unselect-attributeTable btn btn-mini' + selClass + '" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.unselect.title']+'"><i class="icon-star-empty"></i></button>';

                // Move selected to Top button
                html+= '    <button class="btn-moveselectedtotop-attributeTable btn btn-mini' + selClass + '" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.moveselectedtotop.title']+'"><i class="icon-arrow-up"></i></button>';

                // Filter button : only if no filter applied at startup
                if( !startupFilter
                    && ( !lizMap.lizmapLayerFilterActive || lizMap.lizmapLayerFilterActive == cleanName )
                ){
                    html+= '    <button class="btn-filter-attributeTable btn btn-mini' + filClass + '" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.filter.title']+'"><i class="icon-filter"></i></button>';
                }

                // Invert selection
                html += '<lizmap-selection-invert tooltip-placement="bottom" feature-type="' + cleanName +'"></lizmap-selection-invert>'

                // Detail button
                var canPopup = false
                if( config.layers[lname]
                    && config.layers[lname]['popup'] == 'True'
                    && config.layers[lname]['geometryType'] != 'none'
                    && config.layers[lname]['geometryType'] != 'unknown'
                ){
                    canPopup = true;
                }
                if( canPopup ){
                    html+= '<button type="checkbox" class="btn-detail-attributeTable btn btn-mini" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.cb.data.detail.title']+'">';
                    html+= '<i class="icon-info-sign"></i>';
                    html+= '</button>';
                }

                // Create button
                var canCreate = false;
                if( 'editionLayers' in config && cleanName in config.editionLayers ) {
                    var al = config.editionLayers[attributeLayersDic[cleanName]];
                    if( al.capabilities.createFeature == "True" )
                        canCreate = true;
                }
                if( canCreate ){
                    html+= '    <button class="btn-createFeature-attributeTable btn btn-mini" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.createFeature.title']+'"><i class="icon-plus-sign"></i></button>';
                }

                // Refresh button (if limitDataToBbox is true)
                if( limitDataToBbox
                    && config.layers[lname]['geometryType'] != 'none'
                    && config.layers[lname]['geometryType'] != 'unknown'
                ){
                    // Add button to refresh table
                    html+= '    <button class="btn-refresh-table btn btn-mini" value="' + cleanName + '" title="'+lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip']+'">'+lizDict['attributeLayers.toolbar.btn.refresh.table.title']+'</button>';

                }

                // Get children content
                var childHtml = getChildrenHtmlContent( lname );
                var alc='';

                // Toggle children content
                if( childHtml ){
                    // Add button to show/hide children tables
                    html+= '    <button class="btn-toggle-children btn btn-mini" value="' + cleanName + '" >'+lizDict['attributeLayers.toolbar.btn.toggle.children.title']+'</button>';

                    // Add buttons to create new children
                    if( childHtml['childCreateButton'] )
                        html+= childHtml['childCreateButton'];

                    // Add buttons to link parent and children
                    if( childHtml['layerLinkButton'] )
                        html+= childHtml['layerLinkButton'];
                }

                // Export tools
                if ( 'exportLayers' in config.options && config.options.exportLayers == 'True' ) {
                    html+= '&nbsp;<div class="btn-group pull-right" role="group" >';
                    html+= '    <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">';
                    html+= lizDict['attributeLayers.toolbar.btn.data.export.title'];
                    html+= '      <span class="caret"></span>';
                    html+= '    </button>';
                    html+= '    <ul class="dropdown-menu" role="menu">';
                    html+= '        <li><a href="#" class="btn-export-attributeTable">GeoJSON</a></li>';
                    html+= '        <li><a href="#" class="btn-export-attributeTable">GML</a></li>';
                    var exportFormats = lizMap.getVectorLayerResultFormat();
                    for ( var i=0, len=exportFormats.length; i<len; i++ ) {
                        var format = exportFormats[i].toLowerCase();
                        if ( format != 'gml2' && format != 'gml3' && format != 'geojson' ) {
                            html += '        <li><a href="#" class="btn-export-attributeTable">'+format+'</a></li>';
                        }
                    }
                    html+= '    </ul>';
                    html+= '</div>';
                }

                html+= '</div>'; // attribute-layer-action-bar

                if( childHtml )
                    alc= ' showChildren';
                html+= '<div class="attribute-layer-content'+alc+'">';
                html+= '    <input type="hidden" class="attribute-table-hidden-layer" value="'+cleanName+'">';
                html+= '    <table id="attribute-layer-table-' + cleanName + '" class="attribute-table-table table table-hover table-condensed table-striped order-column cell-border" width="100%"></table>';

                html+= '</div>';  // attribute-layer-content

                // Add children content
                if( childHtml ){
                    // Add children content : one tab per childlayer
                    html+= '<div class="tabbable attribute-layer-child-content">';
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

                $('#attribute-layer-' + cleanName + ' button').tooltip( {
                    placement: 'bottom'
                } );

                $('.btn-close-attribute-tab').click(function(){
                    //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
                    var tabContentId = $(this).parent().attr("href");
                    $(this).parent().parent().remove(); //remove li of tab
                    $('#attributeLayers-tabs a:last').tab('show'); // Select first tab
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
                        .attr('data-original-title', lizDict['attributeLayers.toolbar.btn.refresh.table.tooltip'])
                        .removeClass('btn-warning');

                        // Disable if the layer is not visible
                        var layer = lizMap.map.getLayersByName( cleanName )[0];
                        var ms = lizMap.map.getScale();
                        if( layer ) {
                            var lvisibility = layer.maxScale < ms && ms < layer.minScale;
                            if( !lvisibility ){
                                var msg = lizDict['attributeLayers.msg.layer.not.visible'];
                                lizMap.addMessage( msg, 'info', true).attr('id','lizmap-attribute-message');
                                return false;
                            }
                        }else{
                            // do nothing if no layer found
                            return false;
                        }

                        // Refresh table
                        var aTable = '#attribute-layer-table-'+cleanName;
                        var dFilter = null;
                        $('#attribute-layer-main-'+cleanName+' > div.attribute-layer-content').hide();
                        getAttributeFeatureData( lname, dFilter, null, 'extent', function(someName, someNameFilter, someNameFeatures, someNameAliases){
                            buildLayerAttributeDatatable( someName, aTable, someNameFeatures, someNameAliases );
                            $('#attribute-layer-main-'+cleanName+' > div.attribute-layer-content').show();
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
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );

                }

                // Bind click on detail button
                if( canPopup ){
                    $('#attribute-layer-'+ cleanName + ' button.btn-detail-attributeTable')
                    .click(function(){
                        var aName = attributeLayersDic[ $(this).val() ];
                        if( $(this).hasClass('active') ){
                            $(this).removeClass('active btn-warning');
                            $('#attribute-layer-main-' + cleanName ).removeClass('reduced');
                            $('#attribute-table-panel-' + cleanName ).removeClass('visible');
                        }
                        else{
                            $(this).addClass('active btn-warning');
                            $('#attribute-layer-main-' + cleanName ).addClass('reduced');
                            $('#attribute-table-panel-' + cleanName ).addClass('visible');
                        }
                        refreshDatatableSize('#attribute-layer-main-'+ cleanName);
                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );
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
                        if( $(this).hasClass('active') ) {
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
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );
                }

                // Bind click on export buttons
                $('#attribute-layer-'+ cleanName + ' a.btn-export-attributeTable')
                .click(function(){
                    var eFormat = $(this).text();
                    if( eFormat == 'GML' )
                        eFormat = 'GML3';
                    var cleanName = $(this).parents('div.attribute-layer-main:first').attr('id').replace('attribute-layer-main-', '');
                    var eName = attributeLayersDic[ cleanName ];
                    lizMap.exportVectorLayer( eName, eFormat, limitDataToBbox );
                    $(this).blur();
                    return false;
                });

                // Bind click on createFeature button
                $('#attribute-layer-'+ cleanName + ' button.btn-createFeature-attributeTable')
                .click(function(){
                    if ( $('#attribute-layer-'+ cleanName + ' tr.active').length != 1) {
                        $('#lizmap-edition-message').remove();
                        lizMap.addMessage( lizDict['attributeLayers.toolbar.btn.data.createChildFeature.no.actived'], 'info', true).attr('id','lizmap-edition-message');
                        return false;
                    }
                    var parentFeatId = $('#attribute-layer-'+ cleanName + ' tr.active button.attribute-layer-feature-select').val();
                    var parentLayerName = attributeLayersDic[ cleanName ];
                    var parentLayerId = config.layers[parentLayerName]['id'];
                    var aName = attributeLayersDic[ $(this).val() ];
                    lizMap.getLayerFeature(parentLayerName, parentFeatId, function(parentFeat) {
                        var lid = config.layers[aName]['id'];
                        lizMap.launchEdition( lid, null, {layerId:parentLayerId,feature:parentFeat});
                    });
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
                    var parentFeatId = $('#attribute-layer-'+ cleanName + ' tr.active button.attribute-layer-feature-select').val();
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
                        var service = OpenLayers.Util.urlAppend(lizUrls.edition
                            ,OpenLayers.Util.getParameterString(lizUrls.params)
                        );
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
                                // Send signal saying edition has been done on pivot
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
                        var childLayerConfigA = lizMap.getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );
                        if( childLayerConfigA
                            &&  childLayerConfigA[0] in config.attributeLayers
                        ){
                            childCount+=1;
                            if( childCount > 1)
                                childActive = '';
                            var childLayerConfig = childLayerConfigA[1];
                            var childLayerName = childLayerConfigA[0];
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
                            var cLi = '<li id="nav-tab-'+ tabId +'" class="'+childActive+'"><a href="#'+ tabId +'" data-toggle="tab">'+ childLayerConfig.title +'</a></li>';
                            childLi.push(cLi);

                            // Add create child feature button
                            var canCreateChild = false;
                            if( 'editionLayers' in config ){
                                var editionConfig = lizMap.getLayerConfigById(
                                    relation.referencingLayer,
                                    config.editionLayers,
                                    'layerId'
                                );
                                if( childLayerName in config.editionLayers ) {
                                    var al = config.editionLayers[childLayerName];
                                    if( al.capabilities.createFeature == "True" )
                                        canCreateChild = true;
                                }
                            }

                            if( canCreateChild ){
                                // Button to create a new child : Usefull for both 1:n and n:m relation
                                childCreateButtonItems.push( '<li><a href="#' + lizMap.cleanName(childLayerName) + '" class="btn-createFeature-attributeTable">' + childLayerConfig.title +'</a></li>' );
                                layerLinkButtonItems.push( '<li><a href="#' + lizMap.cleanName(childLayerName) + '" class="btn-linkFeatures-attributeTable">' + childLayerConfig.title +'</a></li>' );
                            }
                        }
                    }

                }
                if( childLi.length ){
                    if( childCreateButtonItems.length > 0 ){
                        childCreateButton+= '&nbsp;<div class="btn-group" role="group" >';
                        childCreateButton+= '    <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">';
                        childCreateButton+= lizDict['attributeLayers.toolbar.btn.data.createChildFeature.title'];
                        childCreateButton+= '      <span class="caret"></span>';
                        childCreateButton+= '    </button>';
                        childCreateButton+= '    <ul class="dropdown-menu" role="menu">';
                        for( var i in  childCreateButtonItems){
                            var li = childCreateButtonItems[i];
                            childCreateButton+= li;
                        }
                        childCreateButton+= '    </ul>';
                        childCreateButton+= '</div>';
                    }
                    if( layerLinkButtonItems.length > 0 ){
                        layerLinkButton+= '&nbsp;<div class="btn-group" role="group" >';
                        layerLinkButton+= '    <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">';
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
            function refreshChildrenLayersContent( sourceTable, featureType, featId ) {
                var feat = config.layers[featureType]['features'][featId];

                if(!feat)
                    return false;
                var fp = feat.properties;

                var lConfig = config.layers[featureType];
                if ( !lConfig )
                  return false;
                var parentLayerId = lConfig['id'];

                // Refresh recursively for direct children and other parent
                if( 'relations' in config && parentLayerId in config.relations) {
                    var layerRelations = config.relations[parentLayerId];
                    for( var lid in layerRelations ) {
                        var relation = layerRelations[lid];
                        var childLayerConfigA = lizMap.getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );
                        if( childLayerConfigA
                            && childLayerConfigA[0] in config.attributeLayers
                        ){
                            var childLayerName = childLayerConfigA[0];
                            var childLayerConfig = childLayerConfigA[1];
                            // Generate filter
                            var filter = '';
                            if( relation.referencingLayer == childLayerConfig.id ){
                                filter = '"' + relation.referencingField + '" = ' + "'" + fp[relation.referencedField] + "'";
                            }

                            // Get child table id
                            var childTable = sourceTable.replace( ' table:first', '' ) + '-' + lizMap.cleanName(childLayerName);

                            // Fill in attribute table for child
                            if( childLayerName in config.attributeLayers )
                                // Discard if the editor does not want this layer to be displayed in child table
                                if( 'hideAsChild' in config.attributeLayers[childLayerName] && config.attributeLayers[childLayerName]['hideAsChild'] == 'True' )
                                    continue;
                                getDirectChildData( childLayerName, filter, childTable);

                        }
                    }
                }
            }


            function getDirectChildData( childLayerName, filter, childTable ){
                // Get features
                getAttributeFeatureData(childLayerName, filter, null, 'extent', function(chName, chFilter, chFeatures, chAliases){
                    buildLayerAttributeDatatable( chName, childTable, chFeatures, chAliases );
                });
            }

            var lizdelay = (function(){
                var timer = 0;
                return function(callback, ms){
                    clearTimeout (timer);
                    timer = setTimeout(callback, ms);
                };
            })();

            function buildLayerAttributeDatatable(aName, aTable, cFeatures, cAliases, aCallback ) {

                cFeatures = typeof cFeatures !== 'undefined' ?  cFeatures : null;
                if( !cFeatures ){
                    // features is an object, let's transform it to an array
                    // XXX IE compat: Object.values is not available on IE...
                    var features = config.layers[aName]['features'];
                    cFeatures = Object.keys(features).map(function (key) {
                        return features[key];
                    });
                }

                cAliases = typeof cAliases !== 'undefined' ?  cAliases : null;
                if( !cAliases ){
                    cAliases = config.layers[aName]['alias'];
                }
                for( key in cAliases){
                    if(cAliases[key]==""){
                        cAliases[key]=key;
                    }
                }
                var cTypes = {};
                if( 'types' in config.layers[aName] )
                    cTypes = config.layers[aName]['types'];

                var atFeatures = cFeatures;
                var dataLength = atFeatures.length;

                // Get config
                var lConfig = config.layers[aName];
                // get cleaned name
                var cleanName = lizMap.cleanName( aName );

                // Detect if table is parent or child
                var isChild = true;
                if( aTable.replace( cleanName, '') == '#attribute-layer-table-' )
                    isChild = false;

                // Pivot table ?
                var isPivot = false;
                if( isChild
                    && 'pivot' in config.attributeLayers[aName]
                    && config.attributeLayers[aName]['pivot'] == 'True'
                ){
                    isPivot = true;
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

                if( cFeatures && cFeatures.length > 0 ){

                    // Create columns for datatable
                    var cdc = createDatatableColumns(aName, atFeatures, lConfig['geometryType'], canEdit, canDelete, isChild, isPivot, hiddenFields, cAliases, cTypes);
                    var columns = cdc.columns;
                    var firstDisplayedColIndex = cdc.firstDisplayedColIndex;

                    // Format features for datatable
                    var ff = formatDatatableFeatures(atFeatures, lConfig['geometryType'], canEdit, canDelete, isChild, isPivot, hiddenFields, config.layers[aName]['selectedFeatures']);
                    var foundFeatures = ff.foundFeatures;
                    var dataSet = ff.dataSet;

                    // Fill in the features object
                    // only when necessary : object is empty or is not child or (is child and no full features list in the object)
                    var refillFeatures = false;
                    var dLen = config.layers[aName]['features'] ? Object.keys(config.layers[aName]['features']).length : 0;
                    if( dLen == 0 ){
                        refillFeatures = true;
                        if( !isChild ){
                            config.layers[aName]['featuresFullSet'] = true;
                        }
                    }
                    else{
                        if( isChild ){
                            if( !config.layers[aName]['featuresFullSet'] ){
                                refillFeatures = true;
                            }
                        }else{
                            config.layers[aName]['featuresFullSet'] = true;
                            refillFeatures = true;
                        }
                    }
                    if( refillFeatures  )
                        config.layers[aName]['features'] = foundFeatures;

                    config.layers[aName]['alias'] = cAliases;
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
                        if( dataLength > 50000 )
                            searchWhileTyping = false;

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
                                var featureType = tableId.split('attribute-layer-table-')[1];
                                // Trigger event telling attribute table is ready
                                lizMap.events.triggerEvent("attributeLayerContentReady",
                                    {
                                        'featureType': featureType
                                    }
                                );
                            }
                            ,order: [[ firstDisplayedColIndex, "asc" ]]
                            ,language: { url:lizUrls["dataTableLanguage"] }
                            ,deferRender: true
                            ,createdRow: function ( row, data, dataIndex ) {
                                if ( $.inArray( data.DT_RowId.toString(), config.layers[aName]['selectedFeatures'] ) != -1
                                ) {
                                    $(row).addClass('selected');
                                    data.lizSelected = 'a';
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

                            // Bind event on select button
                            bindTableSelectButton(aName, aTable);

                            // Bind event on zoom buttons
                            if(  config.layers[aName]['geometryType'] != 'none'
                                    && config.layers[aName]['geometryType'] != 'unknown'
                            ) {
                                bindTableZoomButton(aName, aTable);
                            }

                            // Bind event on edit button
                            if( canEdit ) {
                                bindTableEditButton(aName, aTable);
                            }

                            // Bind event on delete button
                            if( canDelete ) {
                                bindTableDeleteButton(aName, aTable);
                            }

                            // Bind event on unlink button
                            if( canEdit && isChild && !isPivot ) {
                                bindTableUnlinkButton(aName, aTable);
                            }

                            // Refresh size
                            var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');

                            refreshDatatableSize('#' + mycontainerId);

                            return false;

                        });
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

                }

                if (aCallback)
                    aCallback(aName,aTable);

                return false;
            }

            function createDatatableColumns(aName, atFeatures, geometryType, canEdit, canDelete, isChild, isPivot, hiddenFields, cAliases, cTypes){
                var columns = [];
                var firstDisplayedColIndex = 0;

                // Column with selected status
                columns.push( {"data": "lizSelected", "width": "25px", "searchable": false, "sortable": true, "visible": false} );
                firstDisplayedColIndex+=1;

                // Select tool
                columns.push( { "data": "select", "width": "25px", "searchable": false, "sortable": false} );
                firstDisplayedColIndex+=1;

                if( canEdit ){
                    columns.push( {"data": "edit", "width": "25px", "searchable": false, "sortable": false} );
                    firstDisplayedColIndex+=1;
                }
                if( canDelete ){
                    columns.push( {"data": "delete", "width": "25px", "searchable": false, "sortable": false} );
                    firstDisplayedColIndex+=1;
                }

                if( canEdit && isChild && !isPivot){
                    columns.push( {"data": "unlink", "width": "25px", "searchable": false, "sortable": false} );
                    firstDisplayedColIndex+=1;
                }

                if( geometryType != 'none'
                    && geometryType != 'unknown'
                ){
                    columns.push( {"data": "zoom", "width": "25px", "searchable": false, "sortable": false} );
                    columns.push( {"data": "center", "width": "25px", "searchable": false, "sortable": false} );
                    firstDisplayedColIndex+=2;
                }

                // Add column for each field
                for (var idx in atFeatures[0].properties){
                    // Do not add hidden fields
                    if( ($.inArray(idx, hiddenFields) > -1) )
                        continue;
                    var colConf = { "mData": idx, "title": cAliases[idx] };

                    // Check if we need to replace url or media by link
                    // Add function for any string cell
                    // First check if the col is number
                    if (idx in cTypes){
                        switch (cTypes[idx]) {
                            case 'integer':
                            case 'int':
                            case 'unsignedInt':
                            case 'long':
                            case 'unsignedLong':
                                colConf['mRender'] = function( data, type, full, meta ){
                                    return parseInt(data);
                                }
                                colConf['className'] = 'text-right';
                                break;
                            case 'decimal':
                            case 'double':
                                colConf['mRender'] = function( data, type, full, meta ){
                                    return parseFloat(data);
                                }
                                colConf['className'] = 'text-right';
                                break;
                            case 'date':
                                colConf['className'] = 'text-center';
                                break;
                            default:
                                colConf['mRender'] = function( data, type, full, meta ){
                                    // Translate field ( language translation OR code->label translation )
                                    var colMeta = meta.settings.aoColumns[meta.col];
                                    var colName = colMeta.mData
                                    var translation_dict = null;
                                    var tdata = data;
                                    if(data)
                                        tdata = lizMap.translateWfsFieldValues(aName, colName, data.toString(), translation_dict);
                                    if( tdata === null )
                                        tdata = data;

                                    // Replace media and URL with links
                                    if( !tdata || !( typeof tdata === 'string') )
                                        return tdata;
                                    if( tdata.substr(0,6) == 'media/' || tdata.substr(0,7) == '/media/' || tdata.substr(0,9) == '../media/'){
                                        var rdata = tdata;
                                        if( tdata.substr(0,7) == '/media/' )
                                            rdata = tdata.slice(1);
                                        return '<a href="' + mediaLinkPrefix + '&path=' + rdata + '" target="_blank">' + colMeta.title + '</a>';
                                    }
                                    else if( tdata.substr(0,4) == 'http' || tdata.substr(0,3) == 'www' ){
                                        var rdata = tdata;
                                        if(tdata.substr(0,3) == 'www')
                                            rdata = 'http://' + tdata;
                                        return '<a href="' + rdata + '" target="_blank">' + tdata + '</a>';
                                    }
                                    else
                                        return tdata;
                                }
                        }
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
                            if ('mData' in newcolumns[i] && newcolumns[i].mData === fieldname) {
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
                }

                return colToReturn;
            }


            function formatDatatableFeatures(atFeatures, geometryType, canEdit, canDelete, isChild, isPivot, hiddenFields, selectedFeatures){
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

                    // Build table lines
                    var selectCol = '<button class="btn btn-mini attribute-layer-feature-select checkbox" value="'+fid+'" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-ok"></i></button>';
                    line['select'] = selectCol;

                    // Edit button
                    if( canEdit ) {
                        var editCol = '<button class="btn btn-mini attribute-layer-feature-edit" value="'+fid+'" title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i></button>';
                        line['edit'] = editCol;
                    }

                    // Delete button
                    if( canDelete ) {
                        var delIcon = 'icon-trash';
                        var delTitle = lizDict['attributeLayers.btn.delete.title'];
                        if( isChild && isPivot ){
                            delIcon = 'icon-minus';
                            delTitle = lizDict['attributeLayers.btn.remove.link.title'];
                        }
                        var deleteCol = '<button class="btn btn-mini attribute-layer-feature-delete" value="'+fid+'" title="' + delTitle + '"><i class="'+delIcon+'"></i></button>';
                        line['delete'] = deleteCol;
                    }

                    // Unlink button
                    if( canEdit && isChild && !isPivot ) {

                        var unlinkIcon = 'icon-minus';
                        var unlinkTitle = lizDict['attributeLayers.btn.remove.link.title'];
                        var unlinkCol = '<button class="btn btn-mini attribute-layer-feature-unlink" value="'+fid+'" title="' + unlinkTitle + '"><i class="'+unlinkIcon+'"></i></button>';
                        line['unlink'] = unlinkCol;
                    }

                    if( geometryType != 'none'
                        && geometryType != 'unknown'
                    ){
                        var zoomCol = '<button class="btn btn-mini attribute-layer-feature-focus zoom" value="'+fid+'" title="' + lizDict['attributeLayers.btn.zoom.title'] + '"><i class="icon-zoom-in"></i></button>';
                        line['zoom'] = zoomCol;

                        var centerCol = '<button class="btn btn-mini attribute-layer-feature-focus center" value="'+fid+'" title="' + lizDict['attributeLayers.btn.center.title'] + '"><i class="icon-screenshot"></i></button>';
                        line['center'] = centerCol;
                    }

                    for (var idx in feat.properties){
                        if( ($.inArray(idx, hiddenFields) > -1) )
                            continue;
                        var prop = feat.properties[idx];
                        line[idx] = prop;
                    }


                    dataSet.push( line );
                });
                return {
                    'dataSet': dataSet,
                    'foundFeatures': foundFeatures
                };
            }

            function bindTableLineClick(aName, aTable){
                $(aTable +' tr').click(function() {

                    $(aTable +' tr').removeClass('active');
                    $(this).addClass('active');

                    // Get corresponding feature
                    var featId = $(this).find('button.attribute-layer-feature-select').val();

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
                                $('#attribute-layer-'+ parentLayerCleanName + ' button.btn-detail-attributeTable').removeClass('active btn-warning');

                            });
                        });
                    }
                });
            }

            function bindTableSelectButton(aName, aTable, aClass){
                $(aTable +' tr td button.attribute-layer-feature-select').click(function() {

                    // Trigger click to highlight feature;
                    $(this).parents('tr:first').click();

                    // Get feature id
                    var featId = $(this).val();

                    // Send signal to select the feature
                    lizMap.events.triggerEvent("layerfeatureselected",
                        { 'featureType': aName, 'fid': featId, 'updateDrawing': true }
                    );

                    lizMap.events.triggerEvent("layerfeaturehighlighted",
                        { 'sourceTable': aTable, 'featureType': aName, 'fid': featId}
                    );
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );
            }

            function bindTableZoomButton(aName, aTable){
                // Zoom or center to selected feature on zoom button click
                $(aTable +' tr td button.attribute-layer-feature-focus').click(function() {
                    // Read feature
                    var featId = $(this).val();
                    var zoomAction = 'zoom';
                    if( $(this).hasClass('center') )
                        zoomAction = 'center';
                    lizMap.zoomToFeature( aName, featId, zoomAction );
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );
            }

            function bindTableEditButton(aName, aTable){
                $(aTable +' tr td button.attribute-layer-feature-edit').click(function() {
                    var featId = $(this).val();
                    // trigger edition
                    var lid = config.layers[aName]['id'];
                    lizMap.launchEdition( lid, featId, null);
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );
            }

            function bindTableDeleteButton(aName, aTable){
                $(aTable +' tr td button.attribute-layer-feature-delete').click(function() {
                    var featId = $(this).val();
                    // trigger deletion
                    var lid = config.layers[aName]['id'];
                    deleteEditionFeature( lid, featId );
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );
            }

            function bindTableUnlinkButton(aName, aTable){
                $(aTable +' tr td button.attribute-layer-feature-unlink').click(function() {
                    // Get child feature id clicked
                    var featId = $(this).val();
                    // Get child layer id
                    var cId = config.layers[aName]['id'];
                    // Get parent layer name and id
                    var pName = $(aTable).parents('div.attribute-layer-main:first').attr('id').replace('attribute-layer-main-', '');
                    var pId = config.layers[pName]['id'];

                    // Get foreign key column
                    var cFkey = null;
                    if( !( pId in config.relations ) )
                        return false;
                    for( var rp in config.relations[pId] ){
                        var rpItem = config.relations[pId][rp];
                        if( rpItem.referencingLayer == cId ){
                            cFkey = rpItem.referencingField
                        }else{
                            continue;
                        }
                    }
                    if( !cFkey )
                        return false;

                    // Get features for the child layer
                    var features = config.layers[aName]['features'];
                    if ( !features || Object.keys(features).length <= 0 )
                        return false;

                    // Get primary key value for clicked child item
                    var cc = lizMap.getLayerConfigById(
                        cId,
                        config.attributeLayers,
                        'layerId'
                    );

                    if( !cc )
                        return false;
                    var primaryKey = cc[1]['primaryKey'];
                    var afeat = features[featId];
                    if( typeof afeat === "undefined" )
                        return false;
                    var cPkeyVal = afeat.properties[primaryKey];
                    // Check if pkey is integer
                    var intRegex = /^[0-9]+$/;
                    if( !( intRegex.test(cPkeyVal) ) )
                        cPkeyVal = " '" + cPkeyVal + "' ";
                    var eService = OpenLayers.Util.urlAppend(lizUrls.edition
                        ,OpenLayers.Util.getParameterString(lizUrls.params)
                    );

                    $.post(eService.replace('getFeature','unlinkChild'),{
                      lid: cId,
                      pkey: primaryKey,
                      pkeyval: cPkeyVal,
                      fkey: cFkey
                    }, function(data){
                        // Show response message
                        $('#lizmap-edition-message').remove();
                        lizMap.addMessage( data, 'info', true).attr('id','lizmap-edition-message');

                        // Send signal saying edition has been done on table
                        lizMap.events.triggerEvent("lizmapeditionfeaturemodified",
                            { 'layerId': cId}
                        );

                    });
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );
            }

            function bindEditTableEditButton(aName, aTable){
                $(aTable +' tr td button.attribute-layer-feature-edit').click(function() {
                    var featId = $(this).val();
                    // trigger edition
                    var lid = config.layers[aName]['id'];
                    // get info from the form
                    var formFeatureId = $('#edition-form-container form input[name="liz_featureId"]').val();
                    var formLayerId = $('#edition-form-container form input[name="liz_layerId"]').val();
                    // get parent layer config
                    var getParentLayerConfig = lizMap.getLayerConfigById( formLayerId );
                    var parentLayerName = getParentLayerConfig[0];
                    if ( aName in config.attributeLayers ) {
                        // get featureType layer config
                        var layerConfig = config.attributeLayers[aName];
                        //get relation
                        var relation = getRelationInfo(formLayerId,layerConfig.layerId);
                        if( relation != null ) {
                            lizMap.getLayerFeature(parentLayerName, formFeatureId, function(feat) {
                                lizMap.launchEdition( lid, featId, {layerId:formLayerId,feature:feat});
                            });
                        }
                    }
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );
            }

            function getEditionChildData( childLayerName, filter, childTable ){
                // Get features
                getAttributeFeatureData(childLayerName, filter, null, 'extent', function(chName, chFilter, chFeatures, chAliases){
                    buildLayerAttributeDatatable( chName, childTable, chFeatures, chAliases, function() {

                        // Check edition capabilities
                        var canCreate = false;
                        var canEdit = false;
                        var canDelete = false;
                        if( 'editionLayers' in config && chName in config.editionLayers ) {
                            var al = config.editionLayers[chName];
                            if( al.capabilities.createFeature == "True" )
                                canCreate = true;
                            if( al.capabilities.modifyAttribute == "True" || al.capabilities.modifyGeometry == "True" )
                                canEdit = true;
                            if( al.capabilities.deleteFeature == "True" )
                                canDelete = true;
                        }

                        // Unbind previous events on page
                        $( childTable ).on( 'page.dt', function() {
                            // unbind previous events
                            $(childTable +' tr').unbind('click');
                            $(childTable +' tr td button').unbind('click');
                        });

                        // Bind events when drawing table
                        $( childTable ).on( 'draw.dt', function() {

                            $(childTable +' tr').unbind('click');
                            $(childTable +' tr td button').unbind('click');

                            // Bind event on select button
                            bindTableSelectButton(chName, childTable);

                            // Bind event on delete button
                            if( canDelete ) {
                                bindTableDeleteButton(chName, childTable);
                            }

                            // Bind event on edit button
                            if( canEdit ) {
                                bindEditTableEditButton(chName, childTable);
                            }

                            // Remove button before reuse it
                            // Zoom
                            $(childTable +' tr td button.attribute-layer-feature-focus').remove();
                            // Unlink
                            $(childTable +' tr td button.attribute-layer-feature-unlink').remove();
                            // Hide columns
                            var dt = $(childTable).DataTable();
                            for ( c = 2; c < 7; c++ ) {
                                var dataSrc = dt.column(c).dataSrc();
                                if ( dataSrc == 'unlink' ||
                                     dataSrc == 'zoom' ||
                                     dataSrc == 'center' )
                                     dt.column(c).visible(false);
                                if ( dataSrc == 'edit' && canCreate ) {
                                    var createHeader = $(dt.column(c).header());
                                    if ( createHeader.find('button.attribute-layer-feature-create').length == 0 ) {
                                        createHeader
                                            .append('<button class="btn btn-mini attribute-layer-feature-create" value="-1" title="'+lizDict['attributeLayers.toolbar.btn.data.createFeature.title']+'"><i class="icon-plus"></i></button>')
                                            .css('padding', '10px 5px');
                                        createHeader
                                            .children('button.attribute-layer-feature-create')
                                            .click(function(){
                                var tabPane = $(this).parents('div.tab-pane.attribute-layer-child-content');
                                var parentFeatId = tabPane.find('input.attribute-table-hidden-parent-feature-id').val();
                                var parentLayerName = tabPane.find('input.attribute-table-hidden-parent-layer').val();
                                var layerName = tabPane.find('input.attribute-table-hidden-layer').val();
                                lizMap.getLayerFeature(parentLayerName, parentFeatId, function(parentFeat) {
                                    var parentLayerId = config.layers[lizMap.getLayerNameByCleanName(parentLayerName)]['id'];
                                    var lid = config.layers[lizMap.getLayerNameByCleanName(layerName)]['id'];
                                    lizMap.launchEdition( lid, null, {layerId:parentLayerId,feature:parentFeat});
                                });
                                return false;
                                            });
                                    }
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
                });
            }


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

            function emptyLayerFilter( featureType ) {
                // Empty array
                config.layers[featureType]['filteredFeatures'] = [];

                lizMap.lizmapLayerFilterActive = null;

                // Empty layer filter
                var layer = lizMap.map.getLayersByName( lizMap.cleanName(featureType) )[0];
                if( layer ) {
                    delete layer.params['FILTER'];
                }
                config.layers[featureType]['request_params']['filter'] = null;
                config.layers[featureType]['request_params']['exp_filter'] = null;

                lizMap.events.triggerEvent("layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['filteredFeatures'],
                        'updateDrawing': true
                    }
                );
            }

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

        function updateLayer( typeNamePile, typeNameFilter, typeNameDone,  cascade ){
            cascade = typeof cascade !== 'undefined' ?  cascade : true;

            // Get first elements of the pile and withdraw it from the pile
            var typeName = typeNamePile.shift();
            var cleanName = lizMap.cleanName(typeName);

            // Get corresponding filter
            var aFilter = typeNameFilter[typeName];

            // Apply filter and get children
            applyLayerFilter( typeName, aFilter, typeNamePile, typeNameFilter, typeNameDone, cascade );

            // Change background in switcher
            var trFilteredBgcolor = 'inherit';
            var displayUnFilterSwitcherTool = false;
            if( aFilter ){
                trFilteredBgcolor = 'rgba(255, 171, 0, 0.4)';
                displayUnFilterSwitcherTool = true;
            }
            $('#switcher .treeTable tr#group-' + cleanName).css('background-color', trFilteredBgcolor );
            $('#switcher .treeTable tr#layer-' + cleanName).css('background-color', trFilteredBgcolor );
            $('#layerActionUnfilter' ).toggle( ( lizMap.lizmapLayerFilterActive !== null ) ).css( 'background-color', 'rgba(255, 171, 0, 0.4)');

        }

        function applyLayerFilter( typeName, aFilter, typeNamePile, typeNameFilter, typeNameDone, cascade ){

            // Add done typeName to the list
            typeNameDone.push( typeName );

            // Get features to refresh attribute table AND build children filters
            var geometryName = 'extent';
            lizMap.getFeatureData(typeName, aFilter, null, geometryName, false, null, null,
                function(aName, aNameFilter, aNameFeatures, aNameAliases ){

                // **0** Prepare some variable. e.g. reset features stored in the layer config
                var layerConfig = config.layers[typeName];
                layerConfig['features'] = {};
                var foundFeatures = {};

                // **1** Get children info
                var cFeatures = aNameFeatures;
                var dataLength = cFeatures.length;
                var typeNameId = layerConfig['id'];
                var typeNamePkey = config.attributeLayers[typeName]['primaryKey'];
                var typeNamePkeyValues = [];
                var typeNameChildren = {};

                var getTypeNameConfig = lizMap.getLayerConfigById(
                    typeNameId,
                    config.attributeLayers,
                    'layerId'
                );
                var typeNameConfig = null;
                if( getTypeNameConfig )
                    typeNameConfig = getTypeNameConfig[1]

                if( 'relations' in config
                    && typeNameId in config.relations
                    && cascade
                ) {
                    var isPivot = false;
                    // Loop through relations to get children data
                    var layerRelations = config.relations[typeNameId];
                    for( var lid in layerRelations ) {

                        var relation = layerRelations[lid];
                        var childLayerConfigA = lizMap.getLayerConfigById(
                            relation.referencingLayer,
                            config.attributeLayers,
                            'layerId'
                        );

                        // if no config
                        if( !childLayerConfigA )
                            continue;

                        var childLayerKeyName = childLayerConfigA[0];
                        var childLayerConfig = childLayerConfigA[1];

                        // Avoid typeName already done ( infinite loop )
                        if( $.inArray( childLayerKeyName, typeNameDone ) != -1 )
                            continue;

                        // Check if it is a pivot table
                        if( 'pivot' in childLayerConfig
                            && childLayerConfig.pivot == 'True'
                            && childLayerConfig.layerId in config.relations.pivot
                        ){
                            isPivot = true;
                        }
                        // Build parameter for this child
                        var fParam = {
                            'filter': null,
                            'fieldToFilter': relation.referencingField,
                            'parentField': relation.referencedField,
                            'parentValues': [],
                            'pivot': isPivot,
                            'otherParentTypeName': null,
                            'otherParentRelation': null,
                            'otherParentValues': []
                        };

                        typeNameChildren[ childLayerKeyName ] = fParam;

                    }
                }

                // ** ** If typeName is a pivot, add some info about the otherParent
                // If pivot, re-loop relations to find configuration for other parents (go up)
                var isPivot = false;
                var pivotParam = null;
                if( 'pivot' in typeNameConfig
                    && typeNameConfig.pivot == 'True'
                    && typeNameConfig.layerId in config.relations.pivot
                ){
                    isPivot = true;
                }

                if( isPivot ){
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
                            if( aLayerRelations[xx].referencingLayer != typeNameConfig.layerId)
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
                }

                // **2** Loop through features && get children filter values
                var filteredFeatures = [];

                cFeatures.forEach(function(feat) {

                    // Add feature to layer config data
                    var fid = feat.id.split('.')[1];
                    foundFeatures[fid] = feat;

                    // Add primary keys values to build the WMS filter ( to be able to redraw layer)
                    var pk = feat.properties[typeNamePkey];
                    if( ('types' in layerConfig)
                     && (typeNamePkey in layerConfig.types)
                     && layerConfig.types[typeNamePkey] == 'string') {
                        pk = " '" + pk + "' ";
                    } else {
                        var intRegex = /^[0-9]+$/;
                        if( !( intRegex.test(pk) ) )
                            pk = " '" + pk + "' ";
                    }
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
                    if( isPivot && pivotParam && aFilter ){
                        var referencingField = pivotParam['otherParentRelation'].referencingField;
                        pivotParam['otherParentValues'].push( "'" + feat.properties[ referencingField ] + "'" );
                    }
                });

                // **3** Apply filter to the typeName and redraw if necessary
                layerConfig['features'] = foundFeatures;
                layerConfig['alias'] = aNameAliases;
                var layerN = attributeLayersDic[lizMap.cleanName(typeName)];

                var lFilter = null;
                var layer = lizMap.map.getLayersByName( lizMap.cleanName(typeName) )[0];
                if( layer && layer.params) {
                    layerN = layer.params['LAYERS'];
                }

                // Add false value to hide all features if we need to hide layer
                if( typeNamePkeyValues.length == 0 )
                    typeNamePkeyValues.push('-99999');

                if( aFilter ){
                    lFilter = layerN + ':"' + typeNamePkey + '" IN ( ' + typeNamePkeyValues.join( ' , ' ) + ' ) ';

                    // Try to use the simple filter ( for example myforeignkey = 4 )
                    // instead of the full list of pkeys we got from wfs
                    // This can prevent too long GET URL
                    // NB : we should improve this by using server side filters
                    if( !aFilter.startsWith('$id') ){
                        var simpleFilter = aFilter;
                        if( !aFilter.startsWith(layerN) ){
                            simpleFilter = layerN + ':' + aFilter ;
                        }
                        lFilter = simpleFilter;
                    }
                }

                layerConfig['request_params']['filter'] = lFilter;
                layerConfig['request_params']['exp_filter'] = aFilter;

                // Add filter to openlayers layer
                if( layer
                    && layer.params
                ){
                    if( aFilter ){
                        // Get filter token
                        var surl = OpenLayers.Util.urlAppend(lizUrls.wms
                            ,OpenLayers.Util.getParameterString(lizUrls.params)
                        );
                        var sdata = {
                            service: 'WMS',
                            request: 'GETFILTERTOKEN',
                            typename: typeName,
                            filter: lFilter
                        };
                        $.post(surl, sdata, function(result){
                            layer.params['FILTERTOKEN'] = result.token;
                            delete layer.params['FILTER'];
                            layerConfig['request_params']['filtertoken'] = result.token;
                            // Redraw openlayers layer
                            if( layerConfig['geometryType']
                                && layerConfig.geometryType != 'none'
                                && layerConfig.geometryType != 'unknown'
                            ){
                                layer.redraw(true);
                            }
                        });

                    }
                    else{
                        delete layer.params['FILTER'];
                        delete layer.params['FILTERTOKEN'];
                        layerConfig['request_params']['filtertoken'] = null;
                    }
                }

                // Redraw openlayers layer
                if( layer
                    && layerConfig['geometryType'] != 'none'
                    && layerConfig['geometryType'] != 'unknown'
                ){
                    layer.redraw(true);
                }

                // Refresh attributeTable
                var opTable = '#attribute-layer-table-'+lizMap.cleanName( typeName );
                if( $( opTable ).length )
                    buildLayerAttributeDatatable( typeName, opTable, cFeatures, aNameAliases );

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
                        var wmsCname = cName;
                        // Get WMS layer name (can be different depending on QGIS Server version)
                        var wlayer = lizMap.map.getLayersByName( lizMap.cleanName(cName) )[0];
                        if( wlayer && wlayer.params) {
                            wmsCname = wlayer.params['LAYERS'];
                        }

                        // Build filter for children
                        // and add child to the typeNameFilter and typeNamePile objects
                        // only if typeName filter aFilter was originally set
                        if( aFilter && cData['parentValues'].length > 0 && cascade != 'removeChildrenFilter' )
                            cFilter = wmsCname + ':"' + cData['fieldToFilter'] + '" IN ( ' + cData['parentValues'].join() + ' )';
                        else if( aFilter && cascade != 'removeChildrenFilter' )
                            cFilter = wmsCname + ':"' + cData['fieldToFilter'] + '" IN ( -99999 )';

                        config.layers[cName]['request_params']['filter'] = cFilter;

                        typeNameFilter[x] = cFilter;
                        typeNamePile.push( x );

                    }
                }

                // **5** Add other parent to pile when typeName is a pivot
                if( isPivot && pivotParam ){
                    // Add a Filter to the "other parent" layers
                    var cFilter = null;
                    var orObj = null;
                    var pwmsName = pivotParam['otherParentTypeName'];
                    // Get WMS layer name
                    var pwlayer = lizMap.map.getLayersByName( lizMap.cleanName(pwmsName) )[0];
                    if( pwlayer && pwlayer.params) {
                        pwmsName = pwlayer.params['LAYERS'];
                    }
                    if( aFilter  ){
                        if( pivotParam['otherParentValues'].length > 0 ){
                            cFilter = pwmsName + ':"';
                            cFilter+= pivotParam['otherParentRelation'].referencedField;
                            cFilter+= '" IN ( ' + pivotParam['otherParentValues'].join() + ' )';
                            orObj = {
                                field: pivotParam['otherParentRelation'].referencedField,
                                values: pivotParam['otherParentValues']
                            }
                        }
                        else {
                            cFilter = pwmsName + ':"' + pivotParam['otherParentRelation'].referencedField + '" IN ( ' + "'-999999'" + ' )';
                            orObj = {
                                field: pivotParam['otherParentRelation'].referencedField,
                                values: ['-999999']
                            }
                        }
                    }

                    config.layers[ pivotParam['otherParentTypeName'] ]['request_params']['filter'] = cFilter;

                    typeNameFilter[ pivotParam['otherParentTypeName'] ] = cFilter;
                    typeNamePile.push( pivotParam['otherParentTypeName'] );
                }

                // **6** Launch the method again if typeName is not empty
                if( typeNamePile.length > 0 )
                    updateLayer( typeNamePile, typeNameFilter, typeNameDone, cascade );

            });
        }

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


            function updateMapLayerDrawing( featureType, cascade ){
                cascade = typeof cascade !== 'undefined' ?  cascade : true;
                // Get layer
                var layer = lizMap.map.getLayersByName( lizMap.cleanName(featureType) )[0];

                // Build filter from filteredFeatures
                var cFilter = null;
                if ( config.layers[featureType]['filteredFeatures']
                    && config.layers[featureType]['filteredFeatures'].length > 0
                ){
                    cFilter = '$id IN ( ' + config.layers[featureType]['filteredFeatures'].join() + ' ) ';
                }

                // Build selection parameter from selectedFeatures
                var layerN = attributeLayersDic[featureType];
                if( config.layers[featureType]
                    && config.layers[featureType]['selectedFeatures']
                    && config.layers[featureType]['selectedFeatures'].length
                ) {
                    config.layers[featureType]['request_params']['selection'] = layerN + ':' + config.layers[featureType]['selectedFeatures'].join();

                    // Get selection token
                    var surl = OpenLayers.Util.urlAppend(lizUrls.wms
                        ,OpenLayers.Util.getParameterString(lizUrls.params)
                    );
                    var sdata = {
                        service: 'WMS',
                        request: 'GETSELECTIONTOKEN',
                        typename: featureType,
                        ids: config.layers[featureType]['selectedFeatures'].join()
                    };
                    $.post(surl, sdata, function(result){
                        config.layers[featureType]['request_params']['selectiontoken'] = result.token;
                        if ( layer ) {
                            //layer.params['SELECTION'] = layerN + ':' + config.layers[featureType]['selectedFeatures'].join();
                            layer.params['SELECTIONTOKEN'] = result.token;
                        }
                    });
                }
                else {
                    if ( layer ){
                        //delete layer.params['SELECTION'];
                        delete layer.params['SELECTIONTOKEN'];
                    }
                    config.layers[featureType]['request_params']['selection'] = null;
                    config.layers[featureType]['request_params']['selectiontoken'] = null;
                }

                // Build data to update layer drawing and other components
                var typeNamePile = [ featureType ];
                var typeNameFilter = {};
                typeNameFilter[featureType] = cFilter;
                var typeNameDone = [];
                updateLayer(typeNamePile, typeNameFilter, typeNameDone,  cascade );

            }

            function updateMapLayerSelection( featureType ) {

                // Get layer
                var cleanName = lizMap.cleanName(featureType);
                var layer = lizMap.map.getLayersByName( cleanName )[0];
                if( !layer )
                    return;

                var lConfig = config.layers[featureType];
                if( !lConfig )
                    return;

                // Build selection parameter from selectedFeatures
                if( lConfig.selectedFeatures
                    && lConfig.selectedFeatures.length
                ) {
                    if ( !( 'request_params' in lConfig ) )
                        lConfig['request_params'] = {};
                    lConfig.request_params['selection'] = featureType + ':' + lConfig.selectedFeatures.join();

                    // Get selection token
                    var surl = OpenLayers.Util.urlAppend(lizUrls.wms
                        ,OpenLayers.Util.getParameterString(lizUrls.params)
                    );
                    var sdata = {
                        service: 'WMS',
                        request: 'GETSELECTIONTOKEN',
                        typename: featureType,
                        ids: lConfig.selectedFeatures.join()
                    };
                    $.post(surl, sdata, function(result){
                        lConfig.request_params['selectiontoken'] = result.token;
                        if ( layer )
                            layer.params['SELECTIONTOKEN'] = result.token;
                        // Redraw openlayers layer
                        if( lConfig['geometryType']
                            && lConfig.geometryType != 'none'
                            && lConfig.geometryType != 'unknown'
                        ){
                            layer.redraw(true);
                        }
                    });
                }
                else {
                    //delete layer.params['SELECTION'];
                    if ( layer )
                        delete layer.params['SELECTIONTOKEN'];
                    if ( !( 'request_params' in lConfig ) )
                        lConfig['request_params'] = {};
                    lConfig.request_params['selection'] = null;
                    lConfig.request_params['selectiontoken'] = null;
                    // Redraw openlayers layer
                    if( lConfig['geometryType']
                        && lConfig.geometryType != 'none'
                        && lConfig.geometryType != 'unknown'
                    ){
                        layer.redraw(true);
                    }
                }
            }

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
                $('button.btn-filter-attributeTable[value="'+cleanName+'"]').addClass('hidden').removeClass('active btn-warning');

                // Then display it only if:
                // * no other features is active and selected items exists for this layer
                // * or this is the layer for which it is active
                if( ( !lizMap.lizmapLayerFilterActive && selIds && selIds.length > 0)
                    || lizMap.lizmapLayerFilterActive == featureType
                 ){
                    $('button.btn-filter-attributeTable[value="'+cleanName+'"]').removeClass('hidden');

                    // Show button as activated if some filter exists
                    if( filIds && filIds.length > 0 )
                        $('button.btn-filter-attributeTable[value="'+cleanName+'"]').addClass('active btn-warning');
                }

            }

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
                                    //get relation
                                    var relation = getRelationInfo(formLayerId,featureTypeConfig.layerId);
                                    if( relation != null ) {
                                        lizMap.getLayerFeature(parentLayerName, formFeatureId, function(feat) {
                                            var fp = feat.properties;
                                            filter = '"' + relation.referencingField + '" = ' + "'" + fp[relation.referencedField] + "'";
                                            getEditionChildData( featureType, filter, zTable);
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
                            var dFilter = null;
                            getAttributeFeatureData( featureType, dFilter, null, 'extent', function(someName, someNameFilter, someNameFeatures){
                                buildLayerAttributeDatatable( someName, zTable, someNameFeatures );
                            });
                        }
                    }
                });
            }

            function refreshDatatableSize(container){

                var dtable = $(container).find('table.dataTable');

                // Adapt height
                var h = $(container +' div.attribute-layer-content').height();

                h = h - $(container +' thead').height();
                h = h - $(container +' div.dataTables_paginate').height();
                h = h - $(container +' div.dataTables_filter').height();
                h = h - 20;
                dtable.parent('div.dataTables_scrollBody').height(h);

                // Width : adapt columns size
                dtable.DataTable().tables().columns.adjust();
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

                lizmappopupdisplayed: function(e) {
                    var hasButton = false;
                    var popup = e.popup;
                    var selector = 'div.lizmapPopupContent input.lizmap-popup-layer-feature-id';
                    if ( e.containerId )
                        selector = '#'+ e.containerId +' '+ selector;
                    // Add action buttons if needed
                    $(selector).each(function(){
                        var self = $(this);
                        var val = self.val();
                        var eHtml = '';
                        var fid = val.split('.').pop();
                        var layerId = val.replace( '.' + fid, '' );

                        // Select button
                        var aConfig = lizMap.getLayerConfigById(
                            layerId,
                            config.attributeLayers,
                            'layerId'
                        );
                        var getLayerConfig = lizMap.getLayerConfigById( layerId );
                        if( aConfig && getLayerConfig && self.next('span.popupButtonBar').find('button.popup-layer-feature-select').length == 0) {
                            var layerConfig = getLayerConfig[1];
                            var selClass = '';
                            if( $.inArray( fid, layerConfig['selectedFeatures'] ) != -1 )
                                selClass = 'btn-warning';
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-select '+selClass+'" value="';
                            eHtml+= aConfig[0] + '.' + fid;
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-ok"></i>&nbsp;</button>';

                            if( !startupFilter
                                && (lizMap.lizmapLayerFilterActive == getLayerConfig[0] || !lizMap.lizmapLayerFilterActive )
                            ){
                                var filClass = '';
                                if( $.inArray( fid, layerConfig['filteredFeatures'] ) != -1 )
                                    filClass = 'btn-warning';
                                eHtml+= '<button class="btn btn-mini popup-layer-feature-filter '+filClass+'" value="';
                                eHtml+= aConfig[0] + '.' + fid;
                                eHtml+= '" title="' + lizDict['attributeLayers.toolbar.btn.data.filter.title'] + '"><i class="icon-filter"></i>&nbsp;</button>';
                            }
                        }

                        // Zoom button
                        var popupButtonBar = self.next('span.popupButtonBar');
                        var bboxZoomButton = popupButtonBar.find('button.popup-layer-feature-zoom');
                        if ( bboxZoomButton.length == 0 )
                            bboxZoomButton = popupButtonBar.find('button.popup-layer-feature-bbox-zoom');
                        if( aConfig && getLayerConfig && bboxZoomButton.length == 0) {
                            var layerConfig = getLayerConfig[1];
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-zoom" value="';
                            eHtml+= aConfig[0] + '.' + fid;
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.zoom.title'] + '"><i class="icon-zoom-in"></i>&nbsp;</button>';
                        }

                        if( eHtml != '' ){
                            if ( popupButtonBar.length != 0 ) {
                                if ( bboxZoomButton.length == 0 )
                                    popupButtonBar.append(eHtml);
                                else
                                    bboxZoomButton.before(eHtml);
                            } else {
                                eHtml = '<span class="popupButtonBar">' + eHtml + '</span></br>';
                                self.after(eHtml);
                            }
                            self.find('button.btn').tooltip( {
                                placement: 'bottom'
                            } );
                            hasButton = true;
                            if( popup )
                                popup.verifySize();
                        }

                    });
                    // Add interaction buttons
                    if( hasButton ) {
                        // Tooltips
                        $('div.lizmapPopupContent button').tooltip();

                        // select
                        $('div.lizmapPopupContent button.popup-layer-feature-select')
                        .unbind('click')
                        .click(function(){
                            var fid = $(this).val().split('.').pop();
                            var featureType = $(this).val().replace( '.' + fid, '' );

                            // Get already selected items
                            var layerConfig = config.layers[featureType];
                            var wasSelected = false;
                            if( layerConfig['selectedFeatures'] && $.inArray( fid, layerConfig['selectedFeatures'] ) != -1 ){
                                wasSelected = true;
                                $(this).removeClass('btn-warning');
                            }
                            // Then select or unselect item
                            lizMap.events.triggerEvent('layerfeatureselected',
                                { 'featureType': featureType, 'fid': fid, 'updateDrawing': true}
                            )
                            if( !wasSelected ){
                                $(this).addClass('btn-warning');
                            }
                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );

                        // Zoom
                        $('div.lizmapPopupContent button.popup-layer-feature-zoom')
                        .unbind('click')
                        .click(function(){
                            var fid = $(this).val().split('.').pop();
                            var featureType = $(this).val().replace( '.' + fid, '' );

                            // Remove map popup to avoid confusion
                            if (lizMap.map.popups.length != 0)
                                lizMap.map.removePopup( lizMap.map.popups[0] );

                            lizMap.zoomToFeature( featureType, fid, 'zoom' );
                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );



                        // filter
                        if( !startupFilter ){
                            $('div.lizmapPopupContent button.popup-layer-feature-filter')
                            .unbind('click')
                            .click(function(){
                                var fid = $(this).val().split('.').pop();
                                var featureType = $(this).val().replace( '.' + fid, '' );

                                // Get already filtered items
                                var layerConfig = config.layers[featureType];
                                var wasFiltered = false;
                                if( layerConfig['filteredFeatures'] && $.inArray( fid, layerConfig['filteredFeatures'] ) != -1 ){
                                    wasFiltered = true;
                                }

                                // First deselect all features
                                lizMap.events.triggerEvent('layerfeatureunselectall',
                                    { 'featureType': featureType, 'updateDrawing': false}
                                );

                                if( !wasFiltered ){
                                    // Then select this feature only
                                    lizMap.events.triggerEvent('layerfeatureselected',
                                        { 'featureType': featureType, 'fid': fid, 'updateDrawing': false}
                                    );
                                    // Then filter for the selected features
                                    lizMap.events.triggerEvent('layerfeaturefilterselected',
                                        { 'featureType': featureType}
                                    );
                                    lizMap.lizmapLayerFilterActive = featureType;
                                    $(this).addClass('btn-warning');
                                }else{
                                    // Then remove filter for this selected feature
                                    lizMap.events.triggerEvent('layerfeatureremovefilter',
                                        { 'featureType': featureType }
                                    );
                                    $(this).removeClass('btn-warning');
                                    lizMap.lizmapLayerFilterActive = null;
                                }
                                return false;
                            })
                            .hover(
                                function(){ $(this).addClass('btn-primary'); },
                                function(){ $(this).removeClass('btn-primary'); }
                            );
                        }
                    }
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
                        if( !(featureType in config.attributeLayers) )
                            return false;
                        refreshTablesAfterEdition( featureType );
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

                lizmapeditionformdisplayed: function(e) {
                    $('#edition-children-container').hide().html('');

                    var fid =  e.featureId;
                    // Do not disply child if it's a creation
                    if ( !fid || fid == '' )
                        return;

                    var layerId = e.layerId;
                    var getLayerConfig = lizMap.getLayerConfigById( layerId );

                    if( getLayerConfig && 'relations' in lizMap.config && layerId in lizMap.config.relations ) {
                        var relations = lizMap.config.relations[layerId];
                        var featureType = getLayerConfig[0];
                        var featureId = featureType + '.' + fid;
                        if ( relations.length > 0 ) {
                            var childHtml = getChildrenHtmlContent( featureType );
                            var html = '';
                            // Add children content
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
                            $('#edition-children-container').show().append(html);
                            $('#edition-children-container div.tabbable div.tab-pane input.attribute-table-hidden-parent-layer').after(
                                '<input class="attribute-table-hidden-parent-feature-id" value="'+fid+'" type="hidden">'
                            );
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
                            $('#edition-children-container button.btn-createFeature-attributeTable')
                            .click(function(){
                                var parentFeatId = fid;
                                var parentLayerName = featureType;
                                var parentLayerId = layerId;
                                var aName = attributeLayersDic[ $(this).val() ];
                                lizMap.getLayerFeature(featureType, fid, function(parentFeat) {
                                    var lid = config.layers[aName]['id'];
                                    lizMap.launchEdition( lid, null, {layerId:parentLayerId,feature:parentFeat});
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
                                var parentFeatId = fid;
                                var parentLayerName = featureType;
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
                            lizMap.getLayerFeature(featureType, fid, function(feat) {
                                var fp = feat.properties;
                                for ( var i=0, len=relations.length; i<len; i++ ){
                                    var r = relations[i];
                                    var rLayerId = r.referencingLayer;
                                    var rGetLayerConfig = lizMap.getLayerConfigById( rLayerId );
                                    if ( rGetLayerConfig ) {
                                        var rLayerName = rGetLayerConfig[0];
                                        var rConfigLayer = rGetLayerConfig[1];
                                        filter = '"' + r.referencingField + '" = ' + "'" + fp[r.referencedField] + "'";
                                        // Get child table id
                                        var childTable = '#edition-table-' + lizMap.cleanName(featureType) + '-' + lizMap.cleanName(rLayerName);

                                        // Fill in attribute table for child
                                        if( rLayerName in config.attributeLayers ) {
                                            getEditionChildData( rLayerName, filter, childTable );
                                        }
                                    }
                                }
                            });
                        }
                    }
                },

                bottomdocksizechanged: function(evt) {
                    var mycontainerId = $('#bottom-dock div.bottom-content.active div.attribute-layer-main').attr('id');
                    refreshDatatableSize('#'+mycontainerId);
                }

            }); // lizMap.events.on end

            // Extend lizMap API
            lizMap.getAttributeFeatureData = getAttributeFeatureData;

        } // uicreated
    });

}();
