var lizAttributeTable = function() {

    lizMap.events.on({
        'uicreated':function(evt){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var hasAttributeTableLayers = false;
            var attributeLayersActive = false;
            var attributeLayersDic = {};
            var lizmapLayerFilterActive = false;

            var startupFilter = false;
            if( !( typeof lizLayerFilter === 'undefined' ) ){
                startupFilter = true;
                lizmapLayerFilterActive = true;
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
                            config.layers[lname]['highlightedFeature'] = null;
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
                            var dFilter = null;
                            getAttributeFeatureData( lname, dFilter, null, function(someName, someNameFilter, someNameFeatures, someNameAliases){
                                getAttributeTableFeature( someName, aTable, someNameFeatures, someNameAliases );
                            });
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
                if( !startupFilter
                    && ( !lizmapLayerFilterActive || lizmapLayerFilterActive == layerName )
                ){
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
                            lizmapLayerFilterActive = false;
                        } else {
                            lizMap.events.triggerEvent(
                                "layerfeaturefilterselected",
                                { 'featureType': aName}
                            );
                            lizmapLayerFilterActive = aName;
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
                            // Send signal saying edition has been done on pivot
                            lizMap.events.triggerEvent(
                                "lizmapeditionfeaturecreated",
                                { 'layerId': lid}
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

                            // Fill in attribute table for child
                            getDirectChildData( childLayerName, filter, childTable);

                        }
                    }
                }
            }


            function getDirectChildData( childLayerName, filter, childTable){
                // Get features
                getAttributeFeatureData(childLayerName, filter, null, function(chName, chFilter, chFeatures, chAliases){
                    getAttributeTableFeature( chName, childTable, chFeatures, chAliases );
                });
            }

            function getAttributeTableFeature(aName, aTable, cFeatures, cAliases ) {

                cFeatures = typeof cFeatures !== 'undefined' ?  cFeatures : null;
                if( !cFeatures ){
                    cFeatures = config.layers[aName]['features'];
                }
                cAliases = typeof cAliases !== 'undefined' ?  cAliases : null;
                if( !cAliases ){
                    cAliases = config.layers[aName]['alias'];
                }

                var dataLength = 0;
                var atFeatures = cFeatures;
                dataLength = atFeatures.length;

                config.attributeLayers[aName]['tableDisplayed'] = false;

                // Get config
                var lConfig = config.layers[aName];

                // Detect if table is parent or child
                var isChild = true;
                if( aTable.replace( lizMap.cleanName( aName ), '') == '#attribute-layer-table-' )
                    isChild = false;

                if( cFeatures && cFeatures.length > 0 ){
                    var foundFeatures = {};
                    var columns = [];
                    var firstDisplayedColIndex = 0;

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
                        columns.push( {"data": idx, "title": cAliases[idx]} );
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
                    config.layers[aName]['alias'] = cAliases;

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
                                // Trigger click to highlight feature;
                                $(this).parents('tr:first').click();

                                // Get feature id
                                var featId = $(this).val();

                                // Send signal to select the feature
                                lizMap.events.triggerEvent(
                                    "layerfeatureselected",
                                    { 'featureType': aName, 'fid': featId, 'updateDrawing': true }
                                );

                                lizMap.events.triggerEvent(
                                    "layerfeaturehighlighted",
                                    { 'sourceTable': aTable, 'featureType': aName, 'fid': featId}
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

                if ( !cFeatures || cFeatures.length == 0 ){
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

                }


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

                if( b_exp_filter ){
                    // Remove layerName followed by :
                    b_exp_filter = b_exp_filter.replace( aName + ':', '');
                    filterParam.push( b_exp_filter );
                }else{
                    // If not filter passed, check if a filter does not exists for the layer
                    var aFilter = config.layers[aName]['request_params']['filter'];
                    if( aFilter ){
                        aFilter = aFilter.replace( aName + ':', '');
                        filterParam.push( aFilter );
                    }
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

            function getAttributeFeatureData(aName, aFilter, aFeatureID, aCallBack){

                aFilter = typeof aFilter !== 'undefined' ?  aFilter : null;
                aFeatureID = typeof aFeatureID !== 'undefined' ?  aFeatureID : null;
                aCallBack = typeof aCallBack !== 'undefined' ?  aCallBack : null;

                $('body').css('cursor', 'wait');
                var getFeatureUrlData = getAttributeFeatureUrlData( aName, aFilter, aFeatureID );
                $.get( getFeatureUrlData['url'], getFeatureUrlData['options'], function(data) {

                    var cFeatures = data.features;
                    var cAliases = data.aliases;

                    if( aCallBack)
                        aCallBack( aName, aFilter, cFeatures, cAliases );

                    $('body').css('cursor', 'auto');

                });

                return false;

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
                if( !feat )
                    return false;

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

                lizmapLayerFilterActive = false;

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

                lizmapLayerFilterActive = featureType;

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
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

            // Get corresponding filter
            var aFilter = typeNameFilter[typeName];

            // Apply filter and get children
            applyLayerFilter( typeName, aFilter, typeNamePile, typeNameFilter, typeNameDone, cascade );

        }

        function applyLayerFilter( typeName, aFilter, typeNamePile, typeNameFilter, typeNameDone, cascade ){

            // Add done typeNAme to the list
            typeNameDone.push( typeName );

            // Get features to refresh attribute table AND build children filters
            var getFeatureUrlData = getAttributeFeatureUrlData( typeName, aFilter );

            getAttributeFeatureData(typeName, aFilter, null, function(aName, aNameFilter, aNameFeatures, aNameAliases ){

                // **0** Prepare some variable. e.g. reset features stored in the layer config
                config.layers[typeName]['features'] = [];
                var foundFeatures = {};

                // **1** Get children info
                var cFeatures = aNameFeatures;
                var dataLength = cFeatures.length;
                var typeNameId = config.layers[typeName]['id'];
                var typeNamePkey = config.attributeLayers[typeName]['primaryKey'];
                var typeNamePkeyValues = [];
                var typeNameChildren = {};

                var getTypeNameConfig = getLayerConfigById(
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
                        var childLayerConfigA = getLayerConfigById(
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
                        if(  typeNameDone.indexOf( childLayerKeyName ) != -1 )
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
                        var otherParentConfig = getLayerConfigById(
                            rx,
                            config.attributeLayers,
                            'layerId'
                        );
                        if( otherParentConfig
                            && typeNameDone.indexOf( otherParentConfig[0] ) != -1
                        )
                            continue;

                        var aLayerRelations = config.relations[rx];

                        for( var xx in aLayerRelations){
                            // Only look at relations concerning typeName
                            if( aLayerRelations[xx].referencingLayer != typeNameConfig.layerId)
                                continue;

                            otherParentId = rx;
                            otherParentRelation = aLayerRelations[xx];

                            var otherParentConfig = getLayerConfigById(
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

                for (var x in cFeatures) {

                    // Add feature to layer config data
                    var feat = cFeatures[x];
                    var fid = feat.id.split('.')[1];
                    foundFeatures[fid] = feat;

                    // Add primary keys values to build the WMS filter ( to be able to redraw layer)
                    var pk = feat.properties[typeNamePkey];
                    if( !parseInt( pk ) )
                        pk = " '" + pk + "' ";
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


                }

                // **3** Apply filter to the typeName and redraw if necessayr
                config.layers[typeName]['features'] = foundFeatures;
                config.layers[typeName]['alias'] = aNameAliases;
                var layerN = attributeLayersDic[typeName];
                var lFilter = null;
                if( aFilter )
                    var lFilter = layerN + ':"' + typeNamePkey + '" IN ( ' + typeNamePkeyValues.join( ' , ' ) + ' ) ';
                config.layers[typeName]['request_params']['filter'] = lFilter;

                // Add filter to openlayers layer
                var layer = lizMap.map.getLayersByName( typeName )[0];
                if( layer
                    && layer.params
                ){
                    if( aFilter )
                        layer.params['FILTER'] = lFilter;
                    else
                        delete layer.params['FILTER'];
                }

                // Redraw openlayers layer
                if( layer
                    && config.layers[typeName]['geometryType'] != 'none'
                    && config.layers[typeName]['geometryType'] != 'unknown'
                ){
                    layer.redraw(true);
                }

                // Refresh attributeTable
                var opTable = '#attribute-layer-table-'+lizMap.cleanName( typeName );
                if( $( opTable ).length )
                    getAttributeTableFeature( typeName, opTable, cFeatures, aNameAliases );

                // And send event so that getFeatureInfo and getPrint use the updated layer filters
                lizMap.events.triggerEvent(
                    "layerFilterParamChanged",
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

                        // Build filter for children
                        // and add child to the typeNameFilter and typeNamePile objects
                        // only if typeName filter aFilter was originally set
                        if( aFilter && cData['parentValues'].length > 0 )
                            cFilter = cName + ':"' + cData['fieldToFilter'] + '" IN ( ' + cData['parentValues'].join() + ' )';

                        config.layers[cName]['request_params']['filter'] = cFilter;

                        typeNameFilter[x] = cFilter;
                        typeNamePile.push( x );

                    }
                }

                // **5** Add other parent to pile when typeName is a pivot
                if( isPivot && pivotParam ){
                    // Add a Filter to the "other parent" layers
                    var cFilter = null;
                    if( aFilter  ){
                        if( pivotParam['otherParentValues'].length > 0 ){
                            cFilter = pivotParam['otherParentTypeName'] + ':"';
                            cFilter+= pivotParam['otherParentRelation'].referencedField;
                            cFilter+= '" IN ( ' + pivotParam['otherParentValues'].join() + ' )';
                        }
                        else
                            cFilter = pivotParam['otherParentTypeName'] + ':"' + pivotParam['otherParentRelation'].referencedField + '" IN ( ' + "'-999999'" + ' )';
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
                    var dTable = '#attribute-layer-table-'+lizMap.cleanName( eConfig[0] );
                    // todo simplement supprimer la lignes des features et raffraîchir
                    if( $(dTable).length ){
                        var dFilter = null;
                        getAttributeFeatureData( eConfig[0], dFilter, null, function(someName, someNameFilter, someNameFeatures, someNameAliases){
                            getAttributeTableFeature( someName, dTable, someNameFeatures, someNameAliases);
                        });
                    }
                });
            }


            function updateMapLayerDrawing( featureType, cascade ){
                cascade = typeof cascade !== 'undefined' ?  cascade : true;

                // Get layer
                var layer = lizMap.map.getLayersByName( featureType )[0];
                if( !layer )
                    return;

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
                    layer.params['SELECTION'] = layerN + ':' + config.layers[featureType]['selectedFeatures'].join();
                }
                else
                    delete layer.params['SELECTION'];

                // Build data to update layer drawing and other components
                var typeNamePile = [ featureType ];
                var typeNameFilter = {};
                typeNameFilter[featureType] = cFilter;
                var typeNameDone = [];

                updateLayer(typeNamePile, typeNameFilter, typeNameDone,  cascade );

            }

            function updateMapLayerSelection( featureType ) {
                // Get layer
                var layer = lizMap.map.getLayersByName( featureType )[0];
                if( !layer )
                    return;

                // Build selection parameter from selectedFeatures
                var layerN = attributeLayersDic[featureType];
                if( config.layers[featureType]
                    && config.layers[featureType]['selectedFeatures']
                    && config.layers[featureType]['selectedFeatures'].length
                ) {
                    layer.params['SELECTION'] = layerN + ':' + config.layers[featureType]['selectedFeatures'].join();
                }
                else
                    delete layer.params['SELECTION'];

                // Redraw openlayers layer
                if( config.layers[featureType]['geometryType'] != 'none'
                    && config.layers[featureType]['geometryType'] != 'unknown'
                ){
                    layer.redraw(true);
                }

            }

            function updateAttributeTableTools( featureType ){

                // Show unselect and filter buttons if some features are selected
                var selIds = config.layers[featureType]['selectedFeatures'];
                var filIds = config.layers[featureType]['filteredFeatures'];

                // UnSelection button
                if( selIds && selIds.length > 0 ){
                    $('button.btn-unselect-attributeTable[value="'+featureType+'"]').removeClass('hidden');
                }
                else{
                    $('button.btn-unselect-attributeTable[value="'+featureType+'"]').addClass('hidden');
                }

                // Filter button

                // Hide it first and remove active classes
                $('button.btn-filter-attributeTable[value="'+featureType+'"]').addClass('hidden').removeClass('active btn-warning');

                // Then display it only if:
                // * no other features is active and selected items exists for this layer
                // * or this is the layer for which it is active
                if( ( !lizmapLayerFilterActive && selIds && selIds.length > 0)
                    || lizmapLayerFilterActive == featureType
                 ){
                    $('button.btn-filter-attributeTable[value="'+featureType+'"]').removeClass('hidden');

                    // Show button as activated if some filter exists
                    if( filIds && filIds.length > 0 )
                        $('button.btn-filter-attributeTable[value="'+featureType+'"]').addClass('active btn-warning');
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

            function refreshTablesAfterEdition( featureType ){
                // Loop through each datatable, and refresh if it corresponds to the layer edited
                $('.attribute-table-table').each(function(){
                    var tableId = $(this).attr('id');
                    var tableLayerName = $(this).parents('div.dataTables_wrapper:first').prev('input.attribute-table-hidden-layer').val()

                    if ( tableLayerName
                        && $.fn.dataTable.isDataTable( $(this) )
                        && lizMap.cleanName( featureType ) == tableLayerName
                    ){
                        var zTable = '#' + tableId;
                        var parentLayerCleanName = zTable.replace('#attribute-layer-table-', '').split('-');
                        var parentLayerCleanName = parentLayerCleanName[0];
                        var parentTable = '#attribute-layer-table-' + parentLayerCleanName;
                        var parentLayerName = attributeLayersDic[parentLayerCleanName]

                        // If child, re-highlight parent feature to refresh all the children
                        if( parentTable != zTable ){
                            var parentHighlighted = config.layers[parentLayerName]['highlightedFeature'];
                            if( parentHighlighted )
                                $(parentTable +' tr#' + parentHighlighted).click();

                        }
                        // Else refresh main table with no filter
                        else{
                            // If not pivot
                            var dFilter = null;
                            getAttributeFeatureData( tableLayerName, dFilter, null, function(someName, someNameFilter, someNameFeatures){
                                getAttributeTableFeature( someName, zTable, someNameFeatures );
                            });
                        }
                    }
                });
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
                    var cascadeToChildren = true;
                    updateMapLayerDrawing( e.featureType, cascadeToChildren );

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

                            if( !startupFilter
                                && (lizmapLayerFilterActive == getLayerConfig[0] || !lizmapLayerFilterActive )
                            ){
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
                                    lizmapLayerFilterActive = featureType;
                                    $(this).addClass('btn-warning');
                                }else{
                                    // Then remove filter for this selected feature
                                    lizMap.events.triggerEvent(
                                        'layerfeatureremovefilter',
                                        { 'featureType': featureType }
                                    );
                                    $(this).removeClass('btn-warning');
                                    lizmapLayerFilterActive = false;
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
                    var getLayer = getLayerConfigById( e.layerId, config.attributeLayers, 'layerId' );
                    if( getLayer ){
                        var featureType = getLayer[0];
                        refreshTablesAfterEdition( featureType );
                    }
                },

                lizmapeditionfeaturemodified: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var featureType = getLayer[0];
                        refreshTablesAfterEdition( featureType );
                    }
                },

                lizmapeditionfeaturedeleted: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer ){
                        var featureType = getLayer[0];
                        refreshTablesAfterEdition( featureType );
                    } // todo : only remove line corresponding to deleted feature ?
                }
            });


        } // uicreated
    });


}();

