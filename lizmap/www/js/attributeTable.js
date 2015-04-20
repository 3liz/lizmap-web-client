var lizAttributeTable = function() {

    lizMap.events.on({
        'uicreated':function(evt){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var hasAttributeTableLayers = false;
            var attributeLayersActive = false;
            var attributeLayersDic = {};

            var startupFilter = false;
            if( !( typeof lizLayerFilter === 'undefined' ) ){
                startupFilter = true;
            }

            if (!('attributeLayers' in config))
                return -1;

            // Lizmap URL
            var service = OpenLayers.Util.urlAppend(lizUrls.wms
                    ,OpenLayers.Util.getParameterString(lizUrls.params)
            );

            // Verifying WFS layers
            $.get(service, {
                'SERVICE':'WFS'
                ,'VERSION':'1.0.0'
                ,'REQUEST':'GetCapabilities'
            }, function(xml) {

                var featureTypes = $(xml).find('FeatureType');
                if (featureTypes.length == 0 ){
                    //what to deactivate ?
                } else {

                    featureTypes.each( function(){
                        var self = $(this);
                        var lname = self.find('Name').text();
                        if (lname in config.attributeLayers) {
                            hasAttributeTableLayers = true;

                            // Get layers config information
                            var atConfig = config.attributeLayers[lname];

                            // Add some properties to the lizMap.config
                            config.layers[lname]['features'] = [];
                            config.layers[lname]['selectedFeatures'] = [];
                            config.layers[lname]['filteredFeatures'] = [];
                            config.layers[lname]['request_params'] = {
                                'filter' : null,
                                'exp_filter': null,
                                'selection': null
                            };

                            // Get existing filter if exists (via permalink)
                            var layer = lizMap.map.getLayersByName(lname)[0];

                            if( layer
                                && 'FILTER' in layer.params
                                && layer.params['FILTER']
                            ){
                                config.layers[lname]['request_params']['filter'] = layer.params['FILTER'];

                                // Send signal so that getFeatureInfo takes it into account
                                lizMap.events.triggerEvent(
                                    "layerFilterParamChanged",
                                    {
                                        'featureType': lname,
                                        'filter': config.layers[lname]['request_params']['filter'],
                                        'updateDrawing': false
                                    }
                                );

                            }

                            // Add geometryType if not already present (backward compatibility)
                            if( typeof config.layers[lname]['geometryType'] === 'undefined' ) {
                                config.layers[lname]['geometryType'] = 'unknown';
                            }

                            config.layers[lname]['crs'] = self.find('SRS').text();
                            if ( config.layers[lname].crs in Proj4js.defs ){
                                new OpenLayers.Projection(config.layers[lname].crs);
                            }
                            else
                                $.get(service, {
                                    'REQUEST':'GetProj4'
                                    ,'authid': config.layers[lname].crs
                                }, function ( aText ) {
                                    Proj4js.defs[config.layers[lname].crs] = aText;
                                    new OpenLayers.Projection(config.layers[lname].crs);
                                }, 'text');
                            var bbox = self.find('LatLongBoundingBox');
                            atConfig['bbox'] = [
                                parseFloat(bbox.attr('minx'))
                             ,parseFloat(bbox.attr('miny'))
                             ,parseFloat(bbox.attr('maxx'))
                             ,parseFloat(bbox.attr('maxy'))
                            ];
                            attributeLayersDic[lizMap.cleanName(lname)] = lname;
                        }
                    });
                    if (hasAttributeTableLayers) {

                        // Add the list of laers in the summary table
                        var tHtml = '<table id="attribute-layer-list-table" class="table table-condensed table-hover table-striped" style="width:auto;">';
                        for( var idx in attributeLayersDic) {
                            var cleanName = idx;

                            // Do not add a button for the pivot tables
                            if( 'pivot' in config.attributeLayers[ attributeLayersDic[ cleanName ] ]
                                && config.attributeLayers[ attributeLayersDic[ cleanName ] ]['pivot'] == 'True'
                            ){
                                continue;
                            }

                            var title = config.layers[ attributeLayersDic[ cleanName ] ][ 'title' ];
                            tHtml+= '<tr>';
                            tHtml+= '   <td>' + title + '</td><td><button value=' + cleanName + ' class="btn-open-attribute-layer">Detail</button></td>';
                            tHtml+= '</tr>';
                        }
                        tHtml+= '</table>';
                        $('#attribute-layer-list').html(tHtml);

                        // Bind click on detail buttons
                        $('button.btn-open-attribute-layer')
                        .click(function(){
                            var lname = attributeLayersDic[$(this).val()];
                            if( !$('#nav-tab-attribute-layer-' + lname ).length )
                                addLayerDiv(lname);
                            var aTable = '#attribute-layer-table-'+lizMap.cleanName(lname);

                            getAttributeTableFeature(lname, aTable);
                            $('#nav-tab-attribute-layer-' + lname + ' a' ).tab('show');
                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );


                    } else {
                        // Hide navbar menu
                        $('#auth li.attributeLayers').hide();
                        return -1;
                    }
                }
            } );

            function activateAttributeLayers() {
                attributeLayersActive = true;

                // Deactivate locate-menu
                if ( $('#locate-menu').is(':visible') && lizMap.checkMobile()){
                    $('#toggleLocate').parent().removeClass('active');
                    $('#locate-menu').toggle();
                    //~ lizMap.updateSwitcherSize();
                }
                return false;
            }

            function deactivateAttributeLayers() {
                // Some actions done when deactivating attribute table
                return false;
            }


            function addLayerDiv(lname) {
                // Get layer config
                var atConfig = config.attributeLayers[lname];
                var layerName = lizMap.cleanName(lname);

                // Add li to the tabs
                var liHtml = '<li id="nav-tab-attribute-layer-' + layerName + '">';
                liHtml+= '<a href="#attribute-layer-' + layerName + '" data-toggle="tab">' + config.layers[lname]['title'] ;
                liHtml+= '&nbsp;<i class="btn-close-attribute-tab icon-remove icon-white" style="cursor:pointer"></i>';
                liHtml+= '</a>'
                liHtml+= '</li>';

                $('#attributeLayers-tabs').append( liHtml );

                // Add content div
                var html = '<div id="attribute-layer-' + layerName + '" class="tab-pane attribute-content bottom-content" >';
                html+= '    <div class="attribute-layer-main" id="attribute-layer-main-' + layerName + '" >';

                //~ // Refresh button
                //~ html+= '    <button class="btn-refresh-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.refresh.title']+'</button>';

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
                html+= '<input type="text" placeholder="Search" id="attribute-layer-search-' + layerName + '"/>';

                // Selected searched lines button
                html+= '<button class="btn-select-searched btn btn-mini" value="'+layerName+'" title="'+lizDict['attributeLayers.toolbar.btn.select.searched.title']+'"><i class="icon-star"></i></button>';

                // Unselect button
                html+= '    <button class="btn-unselect-attributeTable btn btn-mini' + selClass + '" value="' + layerName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.unselect.title']+'"><i class="icon-star-empty"></i></button>';

                // Filter button : only if no filter applied at startup
                if( !startupFilter ){
                    html+= '    <button class="btn-filter-attributeTable btn btn-mini' + filClass + '" value="' + layerName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.filter.title']+'"><i class="icon-filter"></i></button>';
                }

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
                    html+= '<button type="checkbox" class="btn-detail-attributeTable btn btn-mini" value="' + layerName + '" title="'+lizDict['attributeLayers.toolbar.cb.data.detail.title']+'">';
                    html+= '<i class="icon-info-sign"></i>';
                    html+= '</button>';
                }

                // Create button
                var canCreate = false;
                if( layerName in config.editionLayers ) {
                    var al = config.editionLayers[layerName];
                    if( al.capabilities.createFeature == "True" )
                        canCreate = true;
                }
                if( canCreate ){
                    html+= '    <button class="btn-createFeature-attributeTable btn btn-mini" value="' + layerName + '" title="'+lizDict['attributeLayers.toolbar.btn.data.createFeature.title']+'"><i class="icon-plus-sign"></i></button>';
                }


                // Get children content
                var childHtml = getChildrenHtmlContent( lname );
                var alc='';

                // Toggle children content
                if( childHtml ){
                    // Add button to show/hide children tables
                    html+= '    <button class="btn-toggle-children btn btn-mini" value="' + layerName + '" >'+lizDict['attributeLayers.toolbar.btn.toggle.children.title']+'</button>';

                    // Add buttons to create new children
                    for( var i in childHtml['childCreateButton'] ){
                        var bt = childHtml['childCreateButton'][i];
                        html+= bt;
                    }
                    // Add buttons to link parent and children
                    for( var i in childHtml['pivotLinkButton'] ){
                        var bt = childHtml['pivotLinkButton'][i];
                        html+= bt;
                    }
                }


                // Export tools
                html+= '&nbsp;<div class="btn-group pull-right" role="group" >';
                html+= '    <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">';
                html+= lizDict['attributeLayers.toolbar.btn.data.export.title'];
                html+= '      <span class="caret"></span>';
                html+= '    </button>';
                html+= '    <ul class="dropdown-menu" role="menu">';
                html+= '        <li><a href="#" class="btn-export-attributeTable">GeoJSON</a></li>';
                html+= '        <li><a href="#" class="btn-export-attributeTable">GML</a></li>';
                html+= '    </ul>';
                html+= '</div>';


                html+= '</div>'; // attribute-layer-action-bar


                if( childHtml )
                    alc= ' showChildren';
                html+= '<div class="attribute-layer-content'+alc+'">';
                html+= '    <input type="hidden" class="attribute-table-hidden-layer" value="'+layerName+'">';
                html+= '    <table id="attribute-layer-table-' + layerName + '" class="attribute-table-table table table-hover table-condensed table-striped order-column"></table>';

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
                html+= '    <div class="attribute-layer-feature-panel" id="attribute-table-panel-' + layerName + '" ></div>';

                html+= '</div>'; // 'attribute-layer-' + layerName

                $('#attribute-table-container').append(html);
                $('#attribute-layer-' + layerName + ' button').tooltip( {placement: 'bottom'} );

                $('.btn-close-attribute-tab').click(function(){
                    //there are multiple elements which has .closeTab icon so close the tab whose close icon is clicked
                    var tabContentId = $(this).parent().attr("href");
                    $(this).parent().parent().remove(); //remove li of tab
                    $('#attributeLayers-tabs a:last').tab('show'); // Select first tab
                    $(tabContentId).remove(); //remove respective tab content
                });

                if( childHtml ){
                    $('#attribute-layer-'+ layerName + ' button.btn-toggle-children')
                    .click(function(){
                        var parentDir = $(this).parents('div.attribute-layer-main');
                        parentDir.find('div.attribute-layer-content').toggleClass('showChildren');
                        parentDir.find('div.tabbable.attribute-layer-child-content').toggle();
                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );
                }

                // Bind click on detail button
                if( canPopup ){
                    $('#attribute-layer-'+ layerName + ' button.btn-detail-attributeTable')
                    .click(function(){
                        var aName = attributeLayersDic[ $(this).val() ];
                        if( $(this).hasClass('active') ){
                            $(this).removeClass('active btn-warning');
                            $('#attribute-layer-main-' + aName ).removeClass('reduced');
                            $('#attribute-table-panel-' + aName ).removeClass('visible');
                        }
                        else{
                            $(this).addClass('active btn-warning');
                            $('#attribute-layer-main-' + aName ).addClass('reduced');
                            $('#attribute-table-panel-' + aName ).addClass('visible');
                        }
                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );
                }

                // Bind click on "unselect all" button
                $('#attribute-layer-'+ layerName + ' button.btn-unselect-attributeTable')
                .click(function(){
                    var aName = attributeLayersDic[ $(this).val() ];
                    // Send signal
                    lizMap.events.triggerEvent(
                        "layerfeatureunselectall",
                        { 'featureType': aName, 'updateDrawing': true}
                    );
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );

                // Bind click on filter button
                if( !startupFilter ){
                    $('#attribute-layer-'+ layerName + ' button.btn-filter-attributeTable')
                    .click(function(){
                        var aName = attributeLayersDic[ $(this).val() ];
                        if( $(this).hasClass('active') ) {
                            lizMap.events.triggerEvent(
                                "layerfeatureremovefilter",
                                { 'featureType': aName}
                            );
                        } else {
                            lizMap.events.triggerEvent(
                                "layerfeaturefilterselected",
                                { 'featureType': aName}
                            );
                        }
                        return false;
                    })
                    .hover(
                        function(){ $(this).addClass('btn-primary'); },
                        function(){ $(this).removeClass('btn-primary'); }
                    );
                }

                // Bind click on export buttons
                $('#attribute-layer-'+ layerName + ' a.btn-export-attributeTable')
                .click(function(){
                    var eFormat = $(this).text();
                    if( eFormat == 'GML' )
                        eFormat = 'GML3';
                    var eName = $(this).parents('div.attribute-layer-main:first').attr('id').replace('attribute-layer-main-', '');
                    exportAttributeTable( eName, eFormat );
                    return false;
                });

                // Bind click on createFeature button
                $('#attribute-layer-'+ layerName + ' button.btn-createFeature-attributeTable')
                .click(function(){
                    var aName = attributeLayersDic[ $(this).val() ];
                    var lid = config.layers[aName]['id'];
                    lizMap.launchEdition( lid );
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );

                // Bind click on linkFeatures button
                $('#attribute-layer-'+ layerName + ' button.btn-linkFeatures-attributeTable')
                .click(function(){
                    var cName = attributeLayersDic[ $(this).val() ];
                    var lid = config.layers[cName]['id'];
                    var attrConfig = config.attributeLayers[cName];
                    var p = [];
                    var lname = attributeLayersDic[layerName];

                    if( 'pivot' in attrConfig
                        && attrConfig['pivot'] == 'True'
                        && lid in config.relations.pivot
                    ){
                        // Get parents info : layer id, fkey column in the pivot table for the parent, values of primary key for selected ids
                        for( var parId in config.relations.pivot[lid] ){
                            var parKey = config.relations.pivot[lid][parId];
                            par = { 'id': parId, 'fkey': parKey };

                            // Get ids of selected feature
                            var getP = getLayerConfigById( parId, config.attributeLayers, 'layerId' );
                            if( !getP )
                                return false;
                            par['name'] = getP[0];
                            var idSelected = config.layers[ getP[0] ]['selectedFeatures'];
                            if( !( idSelected.length > 0 ) )
                                return false;
                            // Get corresponding values of parent primary key column for these ids
                            var fi = [];
                            var features = config.layers[ getP[0] ]['features'];
                            if ( !features || features.length <= 0 )
                                return false;
                            var primaryKey = getP[1]['primaryKey'];
                            for( var x in idSelected ) {
                                var idFeat = idSelected[x];
                                var afeat = features[idFeat];
                                if( typeof afeat === "undefined" )
                                    continue;
                                var pk = afeat.properties[primaryKey];
                                if( !parseInt( pk ) )
                                    pk = " '" + pk + "' ";
                                fi.push( pk );
                            }
                            par['selected'] = fi;
                            // Add parent info to the table
                            p.push(par);
                        }

                        if( !( p.length == 2 )  ){
                            return false;
                        }

                        var service = OpenLayers.Util.urlAppend(lizUrls.edition
                            ,OpenLayers.Util.getParameterString(lizUrls.params)
                        );
                        $.get(service.replace('getFeature','linkFeatures'),{
                          features1: p[0]['id'] + ':' + p[0]['fkey'] + ':' + p[0]['selected'].join(),
                          features2: p[1]['id'] + ':' + p[1]['fkey'] + ':' + p[1]['selected'].join(),
                          pivot: lid

                        }, function(data){
                            // Show response message
                            $('#edition-modal').html(data);
                            $('#edition-modal').modal('show');

                            // Unselect features of parent
                            lizMap.events.triggerEvent(
                                "layerfeatureunselectall",
                                { 'featureType': lname, 'updateDrawing': true}
                            );

                        });

                    }

                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );


                // Bind click on btn-select-searched button
                $('#attribute-layer-'+ layerName + ' button.btn-select-searched').click(function(){
                    var aName = attributeLayersDic[ $(this).val() ];

                    // Send signal
                    lizMap.events.triggerEvent(
                        "layerfeatureselectsearched",
                        { 'featureType': aName, 'updateDrawing': true}
                    );
                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );


            }

            function getLayerConfigById( layerId, confObjet, idAttribute ) {

                // Set function parameters if not given
                confObjet = typeof confObjet !== 'undefined' ?  confObjet : config.layers;
                idAttribute = typeof idAttribute !== 'undefined' ?  idAttribute : 'id';

                // Loop through layers to get the one by id
                for ( var lx in confObjet ) {
                    if ( confObjet[lx][idAttribute] == layerId )
                        return [lx, confObjet[lx] ];
                }
                return null;
            }

            function getChildrenHtmlContent( parentLayerName ) {

                var childHtml = null;
                var childDiv = [];
                var childLi = [];
                var childCreateButton = [];
                var pivotLinkButton = [];
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
                        var childLayerConfigA = getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );
                        if( childLayerConfigA ){
                            childCount+=1;
                            if( childCount > 1)
                                childActive = '';
                            var childLayerConfig = childLayerConfigA[1];
                            var childLayerName = childLayerConfigA[0];

                            // Build child table id by concatenating parent and child layer names
                            var tabId = 'attribute-child-tab-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);

                            // Build Div content for tab
                            var cDiv = '<div class="tab-pane attribute-layer-child-content '+childActive+'" id="'+ tabId +'" >';
                            var tId = 'attribute-layer-table-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);
                            cDiv+= '    <input type="hidden" class="attribute-table-hidden-layer" value="'+lizMap.cleanName(childLayerName)+'">';
                            cDiv+= '    <table id="' + tId  + '" class="attribute-table-table table table-hover table-condensed table-striped"></table>';
                            cDiv+= '</div>';
                            childDiv.push(cDiv);

                            // Build li content for tab
                            var cLi = '<li id="nav-tab-'+ tabId +'" class="'+childActive+'"><a href="#'+ tabId +'" data-toggle="tab">'+ childLayerConfig.title +'</a></li>';
                            childLi.push(cLi);

                            // Add create child feature button
                            var editionConfig = getLayerConfigById(
                                relation.referencingLayer,
                                config.editionLayers,
                                'layerId'
                            );
                            var canCreateChild = false;
                            if( childLayerName in config.editionLayers ) {
                                var al = config.editionLayers[childLayerName];
                                if( al.capabilities.createFeature == "True" )
                                    canCreateChild = true;
                            }
                            if( canCreateChild ){
                                // Button to create a new child : Usefull for both 1:n and n:m relation
                                childCreateButton.push( '<button class="btn-createFeature-attributeTable btn btn-mini" value="' + childLayerName + '" >'+lizDict['attributeLayers.toolbar.btn.data.createFeature.title']+ ' "' + childLayerConfig.title +'"</button>' );

                                // Button to link selected lines from 2 tables
                                if('pivot' in config.attributeLayers[childLayerName]
                                    && config.attributeLayers[childLayerName]['pivot'] == 'True'
                                    && childLayerConfig.id in config.relations.pivot
                                ){
                                    pivotLinkButton.push(  '<button class="btn-linkFeatures-attributeTable btn btn-mini" value="' + childLayerName + '" >'+lizDict['attributeLayers.toolbar.btn.data.linkFeatures.title']+ ' "' + childLayerConfig.title +'"</button>' );
                                }
                            }
                        }
                    }

                }
                if( childLi.length )
                    childHtml = {
                        'tab-content': childDiv,
                        'tab-li': childLi,
                        'childCreateButton': childCreateButton,
                        'pivotLinkButton': pivotLinkButton
                    } ;
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
                        var childLayerConfigA = getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );
                        if( childLayerConfigA ){
                            var childLayerName = childLayerConfigA[0];
                            var childLayerConfig = childLayerConfigA[1];
                            // Generate filter
                            var filter = '';
                            if( relation.referencingLayer == childLayerConfig.id ){
                                filter = '"' + relation.referencingField + '" = ' + "'" + fp[relation.referencedField] + "'";
                            }
                            // Get child table id
                            var childTable = sourceTable.replace( ' table:first', '' ) + '-' + lizMap.cleanName(childLayerName);
                            getAttributeTableFeature( childLayerName, childTable, filter );
                        }
                    }
                }
            }

            function getAttributeTableFeature(aName, aTable, a_exp_filter, a_aCallback ) {

                // Set function parameters if not given
                a_exp_filter = typeof a_exp_filter !== 'undefined' ?  a_exp_filter : null;
                a_aCallback = typeof a_aCallback !== 'undefined' ?  a_aCallback : null;

                var dataLength = 0;
                config.attributeLayers[aName]['tableDisplayed'] = false;

                $('body').css('cursor', 'wait');

                var getFeatureUrlData = getAttributeFeatureUrlData( aName, a_exp_filter );
                $.get(getFeatureUrlData['url'], getFeatureUrlData['options'], function(data) {

                    // Get features and build attribute table content
                    var lConfig = config.layers[aName];
                    config.layers[aName]['features'] = [];

                    var atFeatures = data.features;
                    dataLength = atFeatures.length;

                    // Detect if table is parent or child
                    var isChild = true;
                    if( aTable.replace( lizMap.cleanName( aName ), '') == '#attribute-layer-table-' )
                        isChild = false;

                    if (dataLength > 0) {
                        var foundFeatures = {};
                        var columns = [];
                        var firstDisplayedColIndex = 0;

                        // QGIS Fields aliases
                        var atAlias = data.aliases;

                        // Hidden fields
                        var hiddenFields = [];
                        if( 'hiddenFields' in config.attributeLayers[aName]
                            && config.attributeLayers[aName]['hiddenFields']
                        ){
                            var hf = config.attributeLayers[aName]['hiddenFields'].trim();
                            hiddenFields = hf.split(/[\s,]+/);
                        }

                        // Pivot table ?
                        var isPivot = false;
                        if( isChild
                            && 'pivot' in config.attributeLayers[aName]
                            && config.attributeLayers[aName]['pivot'] == 'True'
                        ){
                            isPivot = true;
                        }

                        // Select tool
                        columns.push( { "data": "select", "width": "25px", "searchable": false, "sortable": false} );
                        firstDisplayedColIndex+=1;

                        // Check edition capabilities
                        var canEdit = false;
                        var canDelete = false;
                        if( aName in config.editionLayers ) {
                            var al = config.editionLayers[aName];
                            if( al.capabilities.modifyAttribute == "True" )
                                canEdit = true;
                            if( al.capabilities.deleteFeature == "True" )
                                canDelete = true;
                        }

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

                        if( lConfig['geometryType'] != 'none'
                            && lConfig['geometryType'] != 'unknown'
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
                            columns.push( {"data": idx, "title": atAlias[idx]} );
                        }


                        var dataSet = [];
                        for (var x in atFeatures) {
                            var line = {};

                            // add feature to layer global data
                            var feat = atFeatures[x];
                            var fid = feat.id.split('.')[1];
                            foundFeatures[fid] = feat;

                            // Add row ID
                            line['DT_RowId'] = fid;

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
                            if( canEdit && isChild && !isPivot) {
                                //~ console.log('unlink for ' + aName );
                                var unlinkIcon = 'icon-minus';
                                var unlinkTitle = lizDict['attributeLayers.btn.remove.link.title'];
                                var unlinkCol = '<button class="btn btn-mini attribute-layer-feature-unlink" value="'+fid+'" title="' + unlinkTitle + '"><i class="'+unlinkIcon+'"></i></button>';
                                line['unlink'] = unlinkCol;
                            }

                            if( lConfig['geometryType'] != 'none'
                                && lConfig['geometryType'] != 'unknown'
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
                        }

                        // Fill in the features object
                        config.layers[aName]['features'] = foundFeatures;

                        // Callback
                        if ( a_aCallback )
                          a_aCallback( aName );


                        if ( $.fn.dataTable.isDataTable( aTable ) ) {
                            var oTable = $( aTable ).dataTable();
                            oTable.fnClearTable();
                            oTable.fnAddData( dataSet );
                        }
                        else {
                           $( aTable ).dataTable( {
                                 data: dataSet
                                ,columns: columns
                                ,order: [[ firstDisplayedColIndex, "asc" ]]
                                ,language: { url:lizUrls["dataTableLanguage"] }
                                ,deferRender: true
                                ,createdRow: function ( row, data, dataIndex ) {
                                    if ( config.layers[aName]['selectedFeatures'].indexOf( data.DT_RowId.toString() ) != -1 ) {
                                        $(row).addClass('selected');
                                    }
                                }
                                ,dom: '<<t>iplf>'
                                ,pageLength: 100

                            } );
                            var oTable = $( aTable ).dataTable();
                            $('#attribute-layer-search-' + aName).on( 'keyup', function (){
                                oTable.fnFilter( this.value );
                            });


                            $( aTable ).on( 'page.dt', function() {
                                // unbind previous events
                                $(aTable +' tr').unbind('click');
                                $(aTable +' tr td button').unbind('click');
                            });


                            $( aTable ).on( 'draw.dt', function() {

                                $(aTable +' tr').unbind('click');
                                $(aTable +' tr td button').unbind('click');

                                // Select the line
                                $(aTable +' tr').click(function() {

                                    $(aTable +' tr').removeClass('active');
                                    $(this).addClass('active');

                                    // Get corresponding feature
                                    var featId = $(this).find('button.attribute-layer-feature-focus').val();

                                    // Send signal
                                    lizMap.events.triggerEvent(
                                        "layerfeaturehighlighted",
                                        { 'sourceTable': aTable, 'featureType': aName, 'fid': featId}
                                    );

                                    // Display popup for the feature
                                    if( lConfig && lConfig['popup'] == 'True'
                                        && lConfig['geometryType'] != 'none'
                                        && lConfig['geometryType'] != 'unknown'
                                    ) {
                                        var feat = config.layers[aName]['features'][featId];
                                        getFeatureInfoForLayerFeature( aTable, aName, feat );
                                    }

                                    return false;

                                });

                                // Select feature
                                $(aTable +' tr td button.attribute-layer-feature-select').click(function() {
                                    var featId = $(this).val();
                                    // Send signal
                                    lizMap.events.triggerEvent(
                                        "layerfeatureselected",
                                        { 'featureType': aName, 'fid': featId, 'updateDrawing': true }
                                    );
                                    return false;
                                })
                                .hover(
                                    function(){ $(this).addClass('btn-primary'); },
                                    function(){ $(this).removeClass('btn-primary'); }
                                );



                                if( config.layers[aName] && config.layers[aName]['popup'] == 'True'
                                        && config.layers[aName]['geometryType'] != 'none'
                                        && config.layers[aName]['geometryType'] != 'unknown'
                                ) {
                                    // Zoom to selected feature on tr click
                                    $(aTable +' tr td button.attribute-layer-feature-focus').click(function() {

                                        // Read feature
                                        var featId = $(this).val();
                                        var feat = config.layers[aName]['features'][featId];
                                        var format = new OpenLayers.Format.GeoJSON();
                                        feat = format.read(feat)[0];
                                        var proj = new OpenLayers.Projection(config.layers[aName].crs);
                                        if( feat && feat.geometry ){
                                            feat.geometry.transform(proj, lizMap.map.getProjection());

                                            // Zoom or center to selected feature
                                            if( $(this).hasClass('zoom') )
                                                lizMap.map.zoomToExtent(feat.geometry.getBounds());
                                            else{
                                                var lonlat = feat.geometry.getBounds().getCenterLonLat()
                                                lizMap.map.setCenter(lonlat);
                                            }
                                        }
                                        return false;

                                    })
                                    .hover(
                                        function(){ $(this).addClass('btn-primary'); },
                                        function(){ $(this).removeClass('btn-primary'); }
                                    );
                                }

                                // Trigger edition for selected feature
                                if( canEdit ) {
                                    $(aTable +' tr td button.attribute-layer-feature-edit').click(function() {
                                        var featId = $(this).val();
                                        // trigger edition
                                        var lid = config.layers[aName]['id'];
                                        lizMap.launchEdition( lid, featId );
                                        return false;
                                    })
                                    .hover(
                                        function(){ $(this).addClass('btn-primary'); },
                                        function(){ $(this).removeClass('btn-primary'); }
                                    );
                                }

                                // Trigger delete for selected feature
                                if( canDelete ) {
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

                                return false;

                            });
                        }

                    }

                    if ( dataLength == 0 ){
                        if ( $.fn.dataTable.isDataTable( aTable ) ) {
                            var oTable = $( aTable ).dataTable();
                            oTable.fnClearTable();
                        }
                        $(aTable).hide();

                        $('#attribute-layer-'+lizMap.cleanName(aName)+' span.attribute-layer-msg').html(
                            lizDict['attributeLayers.toolbar.msg.data.nodata'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
                        ).addClass('failure');

                    } else {
                        config.attributeLayers[aName]['tableDisplayed'] = true;
                        $(aTable).show();

                        //~ // Information message
                        //~ $('#attribute-layer-'+lizMap.cleanName(aName)+' span.attribute-layer-msg').html(
                            //~ dataLength +' '+ lizDict['attributeLayers.toolbar.msg.data.lines'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
                        //~ ).addClass('success');

                    }
                });

                $('body').css('cursor', 'auto');
                return false;
            }

            function getAttributeFeatureUrlData( aName, b_exp_filter, b_featureId ) {
                var getFeatureUrlData = {};

                // Set function parameters if not given
                b_exp_filter = typeof b_exp_filter !== 'undefined' ?  b_exp_filter : null;
                b_featureId = typeof b_featureId !== 'undefined' ?  b_featureId : null;

                // Build WFS request parameters
                var typeName = aName.replace(' ','_');
                var layerName = lizMap.cleanName(aName);
                var extent = lizMap.map.getExtent().clone();
                var projFeat = new OpenLayers.Projection(config.layers[aName].crs);
                extent = extent.transform( lizMap.map.getProjection(), projFeat );
                var bbox = extent.toBBOX();

                var wfsOptions = {
                    'SERVICE':'WFS'
                    ,'VERSION':'1.0.0'
                    ,'REQUEST':'GetFeature'
                    ,'TYPENAME':typeName
                    ,'OUTPUTFORMAT':'GeoJSON'
                    //~ ,'BBOX': bbox
                    //~ ,'MAXFEATURES': 100
                };

                var filterParam = [];

                var layer = lizMap.map.getLayersByName( aName )[0];
                if( layer
                    && 'FILTER' in layer.params
                    && layer.params['FILTER']
                ){
                    var wms2wfsFilter = layer.params['FILTER'].replace( aName + ':', '');
                    filterParam.push( wms2wfsFilter );
                }

                if( b_exp_filter ){
                    filterParam.push( b_exp_filter );
                }
                if ( config.layers[aName]['filteredFeatures'] && config.layers[aName]['filteredFeatures'].length > 0 ){
                    var ffFilter = '$id IN ( ' + config.layers[aName]['filteredFeatures'].join() + ' ) ';
                    filterParam.push( ffFilter );
                }

                if( filterParam.length )
                    wfsOptions['EXP_FILTER'] = filterParam.join( ' AND ' );

                // optionnal parameter filterid
                if( b_featureId )
                    wfsOptions['FEATUREID'] = b_featureId;

                getFeatureUrlData['url'] = OpenLayers.Util.urlAppend(lizUrls.wms
                        ,OpenLayers.Util.getParameterString(lizUrls.params)
                );
                getFeatureUrlData['options'] = wfsOptions;

                return getFeatureUrlData;
            }

            function getFeatureInfoForLayerFeature( aTable, aName, feat) {

                // Remove map popup to avoid confusion
                if (lizMap.map.popups.length != 0)
                    lizMap.map.removePopup( lizMap.map.popups[0] );

                var parentLayerName = aTable.replace('#attribute-layer-table-', '').split('-');
                parentLayerName = parentLayerName[0];

                $('#attribute-table-panel-' + parentLayerName ).html('');

                var typeName = aName.replace(' ','_');

                // Calculate fake bbox around the feature
                var proj = new OpenLayers.Projection(config.layers[aName].crs);
                var lConfig = config.layers[parentLayerName];
                var units = lizMap.map.getUnits();
                if( lizMap.map.maxScale == 'auto' )
                    var scale = lConfig.minScale;
                else
                    var scale = Math.max( lizMap.map.maxScale, lConfig.minScale );
                var res = OpenLayers.Util.getResolutionFromScale(scale, units);

                // Get coordinate to mimic click on the map
                var format = new OpenLayers.Format.GeoJSON();
                feat = format.read(feat)[0];
                feat.geometry.transform(proj, lizMap.map.getProjection());
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

                var layerName = lizMap.cleanName(parentLayerName);
                var gfiCrs = lizMap.map.getProjectionObject().toString();
                if ( gfiCrs == 'EPSG:900913' )
                    gfiCrs = 'EPSG:3857';
                var wmsOptions = {
                     'LAYERS': typeName
                    ,'QUERY_LAYERS': typeName
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

                // Add lizmap specific fid parameter
                var fidFilter = feat.fid;
                wmsOptions['fid'] = fidFilter;

                // Query the server
                var service = OpenLayers.Util.urlAppend(lizUrls.wms
                    ,OpenLayers.Util.getParameterString(lizUrls.params)
                );
                $.get(service, wmsOptions, function(data) {
                    $('#attribute-table-panel-' + layerName ).html(data);
                    var closeButton = '<a class="close-attribute-feature-panel pull-right" href="#"><i class="icon-remove"></i></a>'
                    $('#attribute-table-panel-' + layerName + ' h4').append(closeButton);

                    $('#attribute-table-panel-' + layerName + ' h4 a.close-attribute-feature-panel').click(function(){
                        // Hide panel
                        $('#attribute-layer-main-' + layerName ).removeClass('reduced');
                        $('#attribute-table-panel-' + layerName ).removeClass('visible').html('');
                        // Deactivate Detail button
                        $('#attribute-layer-'+ layerName + ' button.btn-detail-attributeTable').removeClass('active btn-warning');

                    });
                });


            }

            function getSelectionFeatureId( aName ) {
                var featureidParameter = '';
                var selectionLayer = attributeLayersDic[ aName ];
                if( config.layers[selectionLayer]['selectedFeatures'] ){
                    var fids = [];
                    for( var id in config.layers[selectionLayer]['selectedFeatures'] ) {
                        fids.push( selectionLayer + '.' + config.layers[selectionLayer]['selectedFeatures'][id] );
                    }
                    if( fids.length )
                        featureidParameter = fids.join();
                }

                return featureidParameter;
            }

            function exportAttributeTable( aName, eformat ) {

                // Set function parameters if not given
                eformat = typeof eformat !== 'undefined' ?  eformat : 'GeoJSON';

                // Get selected features
                var featureid = getSelectionFeatureId( aName );
                // Get WFS url and options
                var getFeatureUrlData = getAttributeFeatureUrlData( aName, null, featureid );
                // Force download
                getFeatureUrlData['options']['dl'] = 1;
                // Set export format
                getFeatureUrlData['options']['OUTPUTFORMAT'] = eformat;
                // Build WFS url
                var exportUrl = OpenLayers.Util.urlAppend(
                    getFeatureUrlData['url'],
                    OpenLayers.Util.getParameterString( getFeatureUrlData['options'] )
                );
                // Open in new window
                window.open( exportUrl );
                return false;
            }

            function refreshLayerSelection( featureType, featId, rupdateDrawing ) {
                // Set function parameters if not given
                rupdateDrawing = typeof rupdateDrawing !== 'undefined' ?  rupdateDrawing : null;

                // Assure selectedFeatures property exists for the layer
                if( !config.layers[featureType]['selectedFeatures'] )
                    config.layers[featureType]['selectedFeatures'] = [];

                // Add or remove feature id from the selectedFeatures
                if( config.layers[featureType]['selectedFeatures'].indexOf( featId ) == -1 ) {
                    config.layers[featureType]['selectedFeatures'].push( featId );
                }else{
                    var idx = config.layers[featureType]['selectedFeatures'].indexOf( featId )
                    config.layers[featureType]['selectedFeatures'].splice( idx, 1 );
                }

                lizMap.events.triggerEvent(
                    "layerSelectionChanged",
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
                $('.attribute-table-table').each(function(){
                    var tableId = $(this).attr('id');
                    var tableLayerName = $(this).parents('div.dataTables_wrapper:first').prev('input.attribute-table-hidden-layer').val()
                    // Get parent table for the feature type
                    if ( tableLayerName
                        && $.fn.dataTable.isDataTable( $(this) )
                        && lizMap.cleanName( featureType ) == tableLayerName
                    ){

                        var sIds = []
                        var oTable = $( this ).dataTable();
                        var filteredrows = oTable.$( 'tr', {"filter":"applied"} );
                        for ( var i = 0; i < filteredrows.length; i++ ) {
                            sIds.push( filteredrows[i].id );
                        }
                        config.layers[featureType]['selectedFeatures'] = sIds;
                        hasChanged = true;
                    }
                })

                if( hasChanged ){
                    lizMap.events.triggerEvent(
                        "layerSelectionChanged",
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
                if( !config.layers[featureType]['selectedFeatures'] )
                    config.layers[featureType]['selectedFeatures'] = [];
                config.layers[featureType]['selectedFeatures'] = [];

                lizMap.events.triggerEvent(
                    "layerSelectionChanged",
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
                if( config.layers[featureType]['filteredFeatures'].indexOf( featId ) == -1 ) {
                    config.layers[featureType]['filteredFeatures'].push( featId );
                }else{
                    var idx = config.layers[featureType]['filteredFeatures'].indexOf( featId )
                    config.layers[featureType]['filteredFeatures'].splice( idx, 1 );
                }

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
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

                // Empty layer filter
                var layer = lizMap.map.getLayersByName( featureType )[0];
                if( layer ) {
                    delete layer.params['FILTER'];
                    config.layers[featureType]['request_params']['filter'] = null;
                    config.layers[featureType]['request_params']['exp_filter'] = null;
                }

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
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

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['filteredFeatures'],
                        'updateDrawing': true
                    }
                );


            }


            function refreshLayerRendering( featureType, rfilterParam, rcascade ){
                // Set function parameters if not given
                rfilterParam = typeof rfilterParam !== 'undefined' ?  rfilterParam : null;
                rcascade = typeof rcascade !== 'undefined' ?  rcascade : true;

                // Modify layer wms options if needed
                var layer = lizMap.map.getLayersByName( featureType )[0];

                if( layer ) {

                    var layerN = attributeLayersDic[featureType];

                    // Selection parameter
                    if( config.layers[featureType]
                        && config.layers[featureType]['selectedFeatures']
                        && config.layers[featureType]['selectedFeatures'].length
                    ) {
                        layer.params['SELECTION'] = layerN + ':' + config.layers[featureType]['selectedFeatures'].join();
                    }
                    else
                        delete layer.params['SELECTION'];

                    // Filter parameter
                    if( config.layers[featureType]
                        && config.layers[featureType]['filteredFeatures']
                        && config.layers[featureType]['filteredFeatures'].length
                    ) {
                        var fi = [];
                        var features = config.layers[featureType]['features'];

                        if ( !features || features.length <= 0 )
                            return false;

                        var primaryKey = config.attributeLayers[featureType]['primaryKey'];
                        for( var x in config.layers[featureType]['filteredFeatures']) {
                            var idFeat = config.layers[featureType]['filteredFeatures'][x];

                            var afeat = features[idFeat];
                            if( typeof afeat === "undefined" )
                                continue;
                            var pk = afeat.properties[primaryKey];
                            if( !parseInt( pk ) )
                                pk = " '" + pk + "' ";
                            fi.push( pk );
                        }
                        layer.params['FILTER'] = layerN + ':"' + primaryKey + '" IN ( ' + fi.join( ' , ' ) + ' ) ';
                        config.layers[featureType]['request_params']['filter'] = layer.params['FILTER'];
                    }
                    // Filter passed when cascading to children
                    else if( rfilterParam ){
                        layer.params['FILTER'] = rfilterParam;
                        config.layers[featureType]['request_params']['filter'] = rfilterParam;
                    }
                    else if( 'FILTER' in layer.params
                        && layer.params['FILTER']
                    ){
                        config.layers[featureType]['request_params']['filter'] = layer.params['FILTER'];
                    }
                    else{
                        delete layer.params['FILTER'];
                        config.layers[featureType]['request_params']['filter'] = null;
                    }
                    // Send signal so that getFeatureInfo and getPrint can use it
                    lizMap.events.triggerEvent(
                        "layerFilterParamChanged",
                        {
                            'featureType': featureType,
                            'filter': config.layers[featureType]['request_params']['filter'],
                            'updateDrawing': true
                        }
                    );

                    if( config.layers[featureType]['geometryType'] != 'none'
                        && config.layers[featureType]['geometryType'] != 'unknown'
                    ){
                        layer.redraw(true);
                    }

                    // Cascade to childrens
                    var ff = config.layers[featureType]['filteredFeatures'];
                    var parentLayerId = config.layers[featureType]['id'];
                    if( 'relations' in config
                        && parentLayerId in config.relations
                        && rcascade
                    ) {
                        var layerRelations = config.relations[parentLayerId];
                        for( var lid in layerRelations ) {
                            var relation = layerRelations[lid];

                            // Get parent primary key values
                            var parentKeys = [];
                            if( config.layers[featureType]['features'] && config.layers[featureType]['features'] != {} > 0 ){
                                for( var a in ff ){
                                    var cFeatureId = ff[a];
                                    var feat = config.layers[featureType]['features'][cFeatureId];
                                    if( typeof feat === "undefined" )
                                        continue;
                                    parentKeys.push( "'" + feat.properties[ relation.referencedField ] + "'");
                                }
                            }

                            var childLayerConfigA = getLayerConfigById(
                                relation.referencingLayer,
                                config.attributeLayers,
                                'layerId'
                            );
                            var isPivot = false;
                            if( childLayerConfigA ){
                                var childLayerKeyName = childLayerConfigA[0];
                                var childLayerConfig = childLayerConfigA[1];

                                var fParam = {'name': childLayerKeyName, 'key': relation.referencingField, 'values': parentKeys};

                                // For pivot table, refresh the other parent instead of child
                                if( 'pivot' in childLayerConfig
                                    && childLayerConfig.pivot == 'True'
                                    && childLayerConfig.layerId in config.relations.pivot
                                ){

                                    isPivot = true;
                                    // Get other parent layer id
                                    var otherParentId = null;
                                    var cData = {"id": relation.referencingLayer, 'field': relation.referencingField, 'values':parentKeys.join() };
                                    var oData = {};

                                    var pData = false;
                                    for( var rx in config.relations ){

                                        if( rx == parentLayerId){
                                            // Same as parent
                                            continue;
                                        }

                                        var aLayerRelations = config.relations[rx];
                                        for( var xx in aLayerRelations){
                                            if( aLayerRelations[xx].referencingLayer == childLayerConfig.layerId){

                                                otherParentId = rx;
                                                otherParentRelation = aLayerRelations[xx];
                                                oData = {'id': rx, 'field': otherParentRelation.referencedField};
                                                cData['field'] = otherParentRelation.referencingField;
                                                pData = true;
                                                break;
                                            }
                                        }
                                    }

                                    if( !pData )
                                        return false;

                                    // Get filtered pivot data, so that we can filter other parent
                                    if( parentKeys.length > 0 )
                                        var pivotFilter = '"' + relation.referencingField + '" IN ( ' + parentKeys.join() + ' )';
                                    else
                                        var pivotFilter = null;

                                    var getFeatureUrlData = getAttributeFeatureUrlData( childLayerKeyName, pivotFilter );
                                    var cOptions = getFeatureUrlData['options'];
                                    $.get(getFeatureUrlData['url'], cOptions, function(data) {

                                        var cFeatures = data.features;
                                        dataLength = cFeatures.length;
                                        var pivotKeys = [];
                                        for (var x in cFeatures) {
                                            // add feature to layer global data
                                            var cFeat = cFeatures[x];
                                            pivotKeys.push( "'" + cFeat.properties[cData['field']] + "'" );
                                        }
                                        var otherParentConfig = getLayerConfigById(
                                            oData['id'],
                                            config.attributeLayers,
                                            'layerId'
                                        );

                                        if( otherParentConfig ){
                                            fParam = {'name': otherParentConfig[0], 'key': oData['field'], 'values': pivotKeys};
                                        }
                                        else{
                                            return false;
                                        }

                                        // Add a Filter to the "other parent" layers
                                        if( fParam['values'].length > 0 )
                                            var cFilter = fParam['name'] + ':"' + fParam['key'] + '" IN ( ' + fParam['values'].join() + ' )';
                                        else
                                            var cFilter = fParam['name'] + ':"' + fParam['key'] + '" IN ( ' + "'-999999'" + ' )';

                                        // Remove filter if no parentkeys which mean no filter for parent anymore
                                        if( parentKeys.length == 0 ) {
                                            var cFilter = null;
                                        }

                                        // Save filter
                                        config.layers[fParam['name']]['request_params']['filter'] = cFilter;
                                        var layer = lizMap.map.getLayersByName( fParam['name'] )[0];
                                        if( layer
                                            && 'FILTER' in layer.params
                                            && layer.params['FILTER']
                                        ){
                                            layer.params['FILTER'] = cFilter;
                                        }

                                        // do not cascade if pivot to avoid infinite loop
                                        if( rcascade ){
                                            refreshLayerRendering( fParam['name'], cFilter, false );

                                            // Also refresh content of attribute table
                                            var opTable = '#attribute-layer-table-'+lizMap.cleanName( fParam['name'] );
                                            if( $( opTable ).length ){
                                                getAttributeTableFeature( fParam['name'], opTable );
                                            }
                                        }

                                    });

                                }else{
                                    // Add a Filter to children layers
                                    if( fParam['values'].length > 0 )
                                        var cFilter = fParam['name'] + ':"' + fParam['key'] + '" IN ( ' + fParam['values'].join() + ' )';
                                    else
                                        var cFilter = null

                                    config.layers[fParam['name']]['request_params']['filter'] = cFilter;
                                    var layer = lizMap.map.getLayersByName( fParam['name'] )[0];
                                    if( layer
                                        && 'FILTER' in layer.params
                                        && layer.params['FILTER']
                                    ){
                                        layer.params['FILTER'] = cFilter;
                                    }

                                    // do not cascade if pivot to avoid infinite loop
                                    if( rcascade ){
                                        refreshLayerRendering( fParam['name'], cFilter, true );
                                    }
                                }
                                lizMap.events.triggerEvent(
                                    "layerFilterParamChanged",
                                    {
                                        'featureType': featureType,
                                        'filter': config.layers[featureType]['request_params']['filter'],
                                        'updateDrawing': true
                                    }
                                );

                            }
                        }

                    }

                }
            }

            function deleteEditionFeature( layerId, featureId ){
                var eConfig = getLayerConfigById(
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
                    getAttributeTableFeature( eConfig[0] );
                });
            }


            function updateMapLayerDrawing( featureType, cascade ){
                // Refresh layer renderding
                refreshLayerRendering( featureType, null, cascade );
            }

            function updateAttributeTableTools( featureType, featureIds ){

                // Show unselect and filter buttons if some features are selected
                if( featureIds.length > 0 ){
                    $('button.btn-unselect-attributeTable').removeClass('hidden');
                    $('button.btn-filter-attributeTable').removeClass('hidden');
                }
                else{
                    // Hide unselect buttons if no feature is selected
                    $('button.btn-unselect-attributeTable').addClass('hidden');

                    // Hide filter button only if no filtered features are set
                    if( !config.layers[featureType]['filteredFeatures'] )
                        config.layers[featureType]['filteredFeatures'] = [];

                    if( config.layers[featureType]['filteredFeatures'].length == 0 )
                        $('button.btn-filter-attributeTable').removeClass('active btn-warning').addClass('hidden');
                    else
                        $('button.btn-filter-attributeTable').removeClass('hidden').addClass('active btn-warning');
                }

            }

            function redrawAttributeTableContent( featureType, featureIds ){
                // Loo through all datatables to get the one concerning this featureType
                $('.attribute-table-table').each(function(){
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

                        // Remove class selected for all the lines
                        $(this).find('tr').removeClass('selected');

                        // Add class selected from featureIds
                        if( featureIds.length > 0 ){
                            var rTable = $(this).DataTable();
                            // Add 'selected' class
                            for( var i in featureIds ){
                                var sfid = featureIds[i]
                                $(this).find( '#' + sfid ).addClass( 'selected' );
                            }

                        }
                    }

                });

            }

            lizMap.events.on({

                layerfeaturehighlighted: function(e) {
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
                    updateAttributeTableTools( e.featureType, e.featureIds );

                    // Redraw attribute table content ( = add "selected" classes)
                    redrawAttributeTableContent( e.featureType, e.featureIds );

                    // Update openlayers layer drawing
                    if( e.updateDrawing )
                        updateMapLayerDrawing( e.featureType, false );
                },

                layerFilteredFeaturesChanged: function(e) {

                    // Update attribute table tools
                    updateAttributeTableTools( e.featureType, e.featureIds );

                    // Update attribute table content
                    var zTable = '#attribute-layer-table-'+lizMap.cleanName( e.featureType );
                    if( !( $( zTable ).length ) ){
                        addLayerDiv( e.featureType );
                    }
                    getAttributeTableFeature( e.featureType, zTable, null, function( featureType ){
                        // Update openlayers layer drawing
                        if( e.updateDrawing )
                            updateMapLayerDrawing( featureType, true );
                    });

                },

                lizmappopupdisplayed: function(e) {
                    var hasButton = false;
                    // Add action buttons if needed
                    $('#liz_layer_popup input.lizmap-popup-layer-feature-id').each(function(){
                        eHtml = '';
                        var fid = $(this).val().split('.').pop();
                        var layerId = $(this).val().replace( '.' + fid, '' );

                        // Select button
                        var aConfig = getLayerConfigById(
                            layerId,
                            config.attributeLayers,
                            'layerId'
                        );
                        var getLayerConfig = getLayerConfigById( layerId );

                        if( aConfig && getLayerConfig ) {
                            var layerConfig = getLayerConfig[1];
                            var selClass = '';
                            if( layerConfig['selectedFeatures'].indexOf( fid ) != -1 )
                                selClass = 'btn-warning';
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-select '+selClass+'" value="';
                            eHtml+= aConfig[0] + '.' + fid;
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-ok"></i>&nbsp;</button>';

                            if( !startupFilter ){
                                var filClass = '';
                                if( layerConfig['filteredFeatures'].indexOf( fid ) != -1 )
                                    filClass = 'btn-warning';
                                eHtml+= '<button class="btn btn-mini popup-layer-feature-filter '+filClass+'" value="';
                                eHtml+= aConfig[0] + '.' + fid;
                                eHtml+= '" title="' + lizDict['attributeLayers.toolbar.btn.data.filter.title'] + '"><i class="icon-filter"></i>&nbsp;</button>';
                            }
                        }

                        // Edit button
                        var eConfig = getLayerConfigById(
                            layerId,
                            config.editionLayers,
                            'layerId'
                        );
                        if( eConfig && eConfig[1].capabilities.modifyAttribute == "True") {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-edit" value="';
                            eHtml+= $(this).val();
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i>&nbsp;</button>';
                        }

                        // Delete feature button
                        if( eConfig && eConfig[1].capabilities.deleteFeature == "True") {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-delete" value="';
                            eHtml+= $(this).val();
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.delete.title'] + '"><i class="icon-remove"></i>&nbsp;</button>';
                        }

                        if( eHtml ){
                            $(this).after(eHtml);
                            $('#liz_layer_popup button.btn').tooltip( {placement: 'bottom'} );
                            hasButton = true;
                        }

                    });
                    // Add interaction buttons
                    if( hasButton ) {

                        // select
                        $('#liz_layer_popup button.popup-layer-feature-select')
                        .click(function(){
                            var fid = $(this).val().split('.').pop();
                            var featureType = $(this).val().replace( '.' + fid, '' );

                            // Get already selected items
                            var layerConfig = config.layers[featureType];
                            var wasSelected = false;
                            if( layerConfig['selectedFeatures'] && layerConfig['selectedFeatures'].indexOf( fid ) != -1 ){
                                wasSelected = true;
                                $(this).removeClass('btn-warning');
                            }

                            // First unselect all items
                            lizMap.events.triggerEvent(
                                'layerfeatureunselectall',
                                { 'featureType': featureType, 'updateDrawing': true}
                            );
                            // Then select item if needed
                            if( !wasSelected ){
                                lizMap.events.triggerEvent(
                                    'layerfeatureselected',
                                    { 'featureType': featureType, 'fid': fid, 'updateDrawing': true}
                                )
                                $(this).addClass('btn-warning');
                            }
                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );


                        // filter
                        if( !startupFilter ){
                            $('#liz_layer_popup button.popup-layer-feature-filter')
                            .click(function(){
                                var fid = $(this).val().split('.').pop();
                                var featureType = $(this).val().replace( '.' + fid, '' );

                                // Get already filtered items
                                var layerConfig = config.layers[featureType];
                                var wasFiltered = false;
                                if( layerConfig['filteredFeatures'] && layerConfig['filteredFeatures'].indexOf( fid ) != -1 ){
                                    wasFiltered = true;
                                }

                                // First deselect all features
                                lizMap.events.triggerEvent(
                                    'layerfeatureunselectall',
                                    { 'featureType': featureType, 'updateDrawing': false}
                                );

                                if( !wasFiltered ){
                                    // Then select this feature only
                                    lizMap.events.triggerEvent(
                                        'layerfeatureselected',
                                        { 'featureType': featureType, 'fid': fid, 'updateDrawing': false}
                                    );
                                    // Then filter for this selected feature
                                    lizMap.events.triggerEvent(
                                        'layerfeaturefilterselected',
                                        { 'featureType': featureType, 'fid': fid, 'updateDrawing': true}
                                    );
                                    $(this).addClass('btn-warning');
                                }else{
                                    // Then remove filter for this selected feature
                                    lizMap.events.triggerEvent(
                                        'layerfeatureremovefilter',
                                        { 'featureType': featureType }
                                    );
                                    $(this).removeClass('btn-warning');
                                }
                                return false;
                            })
                            .hover(
                                function(){ $(this).addClass('btn-primary'); },
                                function(){ $(this).removeClass('btn-primary'); }
                            );
                        }

                        // edit
                        $('#liz_layer_popup button.popup-layer-feature-edit')
                        .click(function(){
                            var fid = $(this).val().split('.').pop();
                            var layerId = $(this).val().replace( '.' + fid, '' );
                            // launch edition
                            lizMap.launchEdition( layerId, fid );
                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );

                        // delete
                        $('#liz_layer_popup button.popup-layer-feature-delete').click(function(){
                            var fid = $(this).val().split('.').pop();
                            var layerId = $(this).val().replace( '.' + fid, '' );

                            // remove Feature
                            deleteEditionFeature( layerId, fid );

                            // Remove map popup to avoid confusion
                            if (lizMap.map.popups.length != 0)
                                lizMap.map.removePopup( lizMap.map.popups[0] );

                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );
                    }


                },

                lizmapeditionfeaturecreated: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var zTable = '#attribute-layer-table-'+lizMap.cleanName( getLayer[0] );
                        if( $(zTable).length )
                            getAttributeTableFeature( getLayer[0], zTable );
                    }
                },

                lizmapeditionfeaturemodified: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var zTable = '#attribute-layer-table-'+lizMap.cleanName( getLayer[0] );
                        if( $(zTable).length )
                            getAttributeTableFeature( getLayer[0], zTable );
                    }
                },

                lizmapeditionfeaturedeleted: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var zTable = '#attribute-layer-table-'+lizMap.cleanName( getLayer[0] );
                        if( $(zTable).length )
                            getAttributeTableFeature( getLayer[0], zTable );
                    }
                }
            });


        } // uicreated
    });


}();

