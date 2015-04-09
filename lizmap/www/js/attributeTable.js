var lizAttributeTable = function() {

    lizMap.events.on({
        'uicreated':function(evt){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var hasAttributeTableLayers = false;
            var attributeLayersActive = false;
            var attributeLayersDic = {};

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
                            config.layers[lname]['request_params'] = { 'filter' : null, 'exp_filter': null };

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
                liHtml+= '<a href="#attribute-layer-' + layerName + '" data-toggle="tab">' + config.layers[lname]['title'] + '</a></li>';
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

                // Unselect button
                html+= '<div class="attribute-layer-action-bar">';
                html+= '    <button class="btn-unselect-attributeTable btn btn-mini' + selClass + '" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.unselect.title']+'</button>';

                // Filter button
                html+= '    <button class="btn-filter-attributeTable btn btn-mini' + filClass + '" value="' + layerName + '" >'+lizDict['attributeLayers.toolbar.btn.data.filter.title']+'</button>';

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
                    html+= '<button type="checkbox" class="btn-detail-attributeTable btn btn-mini" value="' + layerName + '" >';
                    html+= lizDict['attributeLayers.toolbar.cb.data.detail.title'];
                    html+= '</button>';
                }

                // Export tools
                html+= '&nbsp;<div class="btn-group" role="group">';
                html+= '    <button type="button" class="btn btn-mini dropdown-toggle" data-toggle="dropdown" aria-expanded="false">';
                html+= lizDict['attributeLayers.toolbar.btn.data.export.title'];
                html+= '      <span class="caret"></span>';
                html+= '    </button>';
                html+= '    <ul class="dropdown-menu" role="menu">';
                html+= '        <li><a href="#" class="btn-export-attributeTable">GeoJSON</a></li>';
                html+= '        <li><a href="#" class="btn-export-attributeTable">GML</a></li>';
                html+= '    </ul>';
                html+= '</div>';

                // Create button
                var canCreate = false;
                if( layerName in config.editionLayers ) {
                    var al = config.editionLayers[layerName];
                    if( al.capabilities.createFeature == "True" )
                        canCreate = true;
                }
                if( canCreate ){
                    html+= '    <button class="btn-createFeature-attributeTable btn btn-mini" value="' + layerName + '" >'+lizDict['attributeLayers.toolbar.btn.data.createFeature.title']+'</button>';
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


                html+= '    <br/><span class="attribute-layer-msg"></span>';

                html+= '</div>'; // attribute-layer-action-bar


                if( childHtml )
                    alc= ' showChildren';
                html+= '<div class="attribute-layer-content'+alc+'">';
                html+= '    <table id="attribute-layer-table-' + layerName + '" class="attribute-table-table table table-hover table-condensed table-striped"></table>';

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
                    if( 'pivot' in attrConfig && 'parents' in attrConfig ) {
                        for( var parId in attrConfig['parents'] ){
                            var parKey = attrConfig['parents'][parId];
                            par = { 'id': parId, 'fkey': parKey };

                            var getP = getLayerConfigById( parId, config.attributeLayers, 'layerId' );
                            if( !getP )
                                return false;
                            var idSelected = config.layers[ getP[0] ]['selectedFeatures'];

                            if( !( idSelected.length > 0 ) )
                                return false;

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

                            p.push(par);
                        }

                        if( !( p.length == 2 )  )
                            return false;

                        var service = OpenLayers.Util.urlAppend(lizUrls.edition
                            ,OpenLayers.Util.getParameterString(lizUrls.params)
                        );
                        $.get(service.replace('getFeature','linkFeatures'),{
                          features1: p[0]['id'] + ':' + p[0]['fkey'] + ':' + p[0]['selected'].join(),
                          features2: p[1]['id'] + ':' + p[1]['fkey'] + ':' + p[1]['selected'].join(),
                          pivot: lid

                        }, function(data){
                            $('#edition-modal').html(data);
                            $('#edition-modal').modal('show');
                        });

                    }

                    return false;
                })
                .hover(
                    function(){ $(this).addClass('btn-primary'); },
                    function(){ $(this).removeClass('btn-primary'); }
                );


            }

            function getLayerConfigById( layerId, confObjet=config.layers, idAttribute='id') {
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
                    for( var lid in layerRelations ) {
                        var relation = layerRelations[lid];
                        var childLayerConfigA = getLayerConfigById(
                            relation.referencingLayer,
                            config.layers,
                            'id'
                        );
                        if( childLayerConfigA ){
                            var childLayerConfig = childLayerConfigA[1];
                            var childLayerName = childLayerConfigA[0];

                            var tabId = 'attribute-child-tab-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);
                            // Build Div content for tab
                            var cDiv = '<div class="tab-pane attribute-layer-child-content active" id="'+ tabId +'" >';
                            var tId = 'attribute-layer-table-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);
                            cDiv+= '    <table id="' + tId  + '" class="attribute-table-table table table-hover table-condensed table-striped"></table>';
                            cDiv+= '</div>';
                            childDiv.push(cDiv);

                            // Build li content for tab
                            var cLi = '<li id="nav-tab-'+ tabId +'" class="active"><a href="#'+ tabId +'" data-toggle="tab">'+ childLayerConfig.title +'</a></li>';
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
                                if('pivot' in config.attributeLayers[childLayerName] && 'parents' in config.attributeLayers[childLayerName]){
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

            function getAttributeTableFeature(aName, aTable, exp_filter=null, aCallback=null ) {
                var dataLength = 0;

                config.attributeLayers[aName]['tableDisplayed'] = false;

                $('body').css('cursor', 'wait');

                var getFeatureUrlData = getAttributeFeatureUrlData( aName, exp_filter );

                $.get(getFeatureUrlData['url'], getFeatureUrlData['options'], function(data) {

                    // Get features and build attribute table content
                    var lConfig = config.layers[aName];
                    config.layers[aName]['features'] = [];

                    var atFeatures = data.features;
                    dataLength = atFeatures.length;

                    if (dataLength > 0) {
                        var foundFeatures = {};
                        var columns = [];

                        columns.push( { "data": "select", "width": "25px", "searchable": false, "sortable": false} );

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

                        if( canEdit )
                            columns.push( {"data": "edit", "width": "25px", "searchable": false, "sortable": false} );
                        if( canDelete )
                            columns.push( {"data": "delete", "width": "25px", "searchable": false, "sortable": false} );

                        if( lConfig['geometryType'] != 'none'
                            && lConfig['geometryType'] != 'unknown'
                        ){
                            columns.push( {"data": "zoom", "width": "25px", "searchable": false, "sortable": false} );
                            columns.push( {"data": "center", "width": "25px", "searchable": false, "sortable": false} );
                        }

                        // Add column for each field
                        for (var idx in atFeatures[0].properties){
                            columns.push( {"data": idx, "title": idx} );
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
                            var selectCol = '<button class="btn btn-mini attribute-layer-feature-select" value="'+fid+'" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-ok"></i></button>';
                            line['select'] = selectCol;

                            if( canEdit ) {
                                var editCol = '<button class="btn btn-mini attribute-layer-feature-edit" value="'+fid+'" title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i></button>';
                                line['edit'] = editCol;
                            }

                            if( canDelete ) {
                                var deleteCol = '<button class="btn btn-mini attribute-layer-feature-delete" value="'+fid+'" title="' + lizDict['attributeLayers.btn.delete.title'] + '"><i class="icon-remove"></i></button>';
                                line['delete'] = deleteCol;
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
                                var prop = feat.properties[idx];
                                line[idx] = prop;
                            }


                            dataSet.push( line );
                        }

                        // Fill in the features object
                        config.layers[aName]['features'] = foundFeatures;

                        // Callback
                        if ( aCallback )
                          aCallback( aName );


                        if ( $.fn.dataTable.isDataTable( aTable ) ) {
                            var oTable = $( aTable ).dataTable();
                            oTable.fnClearTable();
                            oTable.fnAddData( dataSet );
                        }
                        else {
                           $( aTable ).dataTable( {
                                 data: dataSet
                                ,columns: columns
                                ,language: { url:lizUrls["dataTableLanguage"] }
                                ,pageLength: 100
                                ,deferRender: true
                                ,pagingType: "full"
                                ,createdRow: function ( row, data, dataIndex ) {
                                    if ( config.layers[aName]['selectedFeatures'].indexOf( data.DT_RowId.toString() ) != -1 ) {
                                        $(row).addClass('selected');
                                    }
                                }

                            } );

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

                        // Information message
                        $('#attribute-layer-'+lizMap.cleanName(aName)+' span.attribute-layer-msg').html(
                            dataLength +' '+ lizDict['attributeLayers.toolbar.msg.data.lines'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
                        ).addClass('success');

                    }
                });

                $('body').css('cursor', 'auto');
                return false;
            }

            function getAttributeFeatureUrlData( aName, exp_filter=null, featureId=null ) {
                var getFeatureUrlData = {};

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
                //optionnal parameter exp_filter
                var filterParam = [];
                if( exp_filter ){
                    filterParam.push( exp_filter );
                }
                if ( config.layers[aName]['filteredFeatures'] && config.layers[aName]['filteredFeatures'].length > 0 ){
                    filterParam.push( '$id IN ( ' + config.layers[aName]['filteredFeatures'].join() + ' ) ' );
                }

                if( filterParam.length )
                    wfsOptions['EXP_FILTER'] = filterParam.join( ' AND ' );

                // optionnal parameter filterid
                if( featureId )
                    wfsOptions['FEATUREID'] = featureId;

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

            function exportAttributeTable( aName, format='GeoJSON' ) {

                // Get selected features
                var featureid = getSelectionFeatureId( aName );
                // Get WFS url and options
                var getFeatureUrlData = getAttributeFeatureUrlData( aName, null, featureid );
                // Force download
                getFeatureUrlData['options']['dl'] = 1;
                // Set export format
                getFeatureUrlData['options']['OUTPUTFORMAT'] = format;
                // Build WFS url
                var exportUrl = OpenLayers.Util.urlAppend(
                    getFeatureUrlData['url'],
                    OpenLayers.Util.getParameterString( getFeatureUrlData['options'] )
                );
                // Open in new window
                window.open( exportUrl );
                return false;
            }

            function refreshLayerSelection( featureType, featId, updateDrawing=true ) {
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
                        'updateDrawing': updateDrawing
                    }
                );

            }

            function emptyLayerSelection( featureType, refresh=true ) {
                // Empty array
                if( !config.layers[featureType]['selectedFeatures'] )
                    config.layers[featureType]['selectedFeatures'] = [];
                config.layers[featureType]['selectedFeatures'] = [];

                lizMap.events.triggerEvent(
                    "layerSelectionChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.layers[featureType]['selectedFeatures'],
                        'updateDrawing': refresh
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
                //~ // Assure filteredFeatures property exists for the layer
                //~ if( !config.layers[featureType]['filteredFeatures'] )
                    //~ config.layers[featureType]['filteredFeatures'] = [];

                // Empty array
                config.layers[featureType]['filteredFeatures'] = [];

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


            function refreshLayerRendering( featureType, filterParam=null, cascade=true ){
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
                    else if( filterParam ){
                        layer.params['FILTER'] = filterParam;
                        config.layers[featureType]['request_params']['filter'] = filterParam;
                    }
                    else{
                        delete layer.params['FILTER'];
                        config.layers[featureType]['request_params']['filter'] = null;
                    }
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
                        && cascade
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

                                        config.layers[fParam['name']]['request_params']['filter'] = cFilter;

                                        // do not cascade if pivot to avoid infinite loop
                                        if( cascade ){
                                            refreshLayerRendering( fParam['name'], cFilter, false );
                                        }

                                    });

                                }else{
                                    // Add a Filter to children layers
                                    if( fParam['values'].length > 0 )
                                        var cFilter = fParam['name'] + ':"' + fParam['key'] + '" IN ( ' + fParam['values'].join() + ' )';
                                    else
                                        var cFilter = null

                                    config.layers[fParam['name']]['request_params']['filter'] = cFilter;

                                    // do not cascade if pivot to avoid infinite loop
                                    if( cascade ){
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

                var aTable = '#attribute-layer-table-'+lizMap.cleanName( featureType );
                if ( $.fn.dataTable.isDataTable( aTable ) ) {

                    // Get selected feature ids if not given
                    if( !featureIds ){
                        // Assure selectedFeatures property exists for the layer
                        if( !config.layers[featureType]['selectedFeatures'] )
                            config.layers[featureType]['selectedFeatures'] = [];
                        var featureIds = config.layers[featureType]['selectedFeatures'];
                    }

                    // Remove class selected for all the lines
                    $(aTable).find('tr').removeClass('selected');

                    // Add class selected from featureIds
                    if( featureIds.length > 0 ){
                        var rTable = $( aTable ).DataTable();
                        // Add 'selected' class
                        for( var i in featureIds ){
                            var sfid = featureIds[i]
                            $( aTable).find( '#' + sfid ).addClass( 'selected' );
                        }
                        //~ var indexes = featureIds.map(function(num){ return '#' + num;});
                        // Add a class to those rows using an index selector
                        //~ rTable.rows( indexes )
                            //~ .nodes()
                            //~ .to$()
                            //~ .addClass( 'selected' );


                    }

                }
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
                        if( aConfig ) {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-select" value="';
                            eHtml+= aConfig[0] + '.' + fid;
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-ok"></i>&nbsp;' + lizDict['attributeLayers.btn.select.title'] + '</button>';

                            eHtml+= '<button class="btn btn-mini popup-layer-feature-filter" value="';
                            eHtml+= aConfig[0] + '.' + fid;
                            eHtml+= '" title="' + lizDict['attributeLayers.toolbar.btn.data.filter.title'] + '"><i class="icon-filter"></i>&nbsp;' + lizDict['attributeLayers.toolbar.btn.data.filter.title'] + '</button>';
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
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i>&nbsp;' + lizDict['attributeLayers.btn.edit.title'] + '</button>';
                        }

                        // Delete feature button
                        if( eConfig && eConfig[1].capabilities.deleteFeature == "True") {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-delete" value="';
                            eHtml+= $(this).val();
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.delete.title'] + '"><i class="icon-remove"></i>&nbsp;' + lizDict['attributeLayers.btn.delete.title'] + '</button>';
                        }

                        if( eHtml ){
                            $(this).after(eHtml);
                            hasButton = true;
                        }

                    });
                    // Add interaction buttons
                    if( hasButton ) {
                        // select
                        $('#liz_layer_popup button.popup-layer-feature-select').click(function(){
                            var fid = $(this).val().split('.').pop();
                            var featureType = $(this).val().replace( '.' + fid, '' );
                            lizMap.events.triggerEvent(
                                'layerfeatureunselectall',
                                { 'featureType': featureType, 'updateDrawing': true}
                            );
                            lizMap.events.triggerEvent(
                                'layerfeatureselected',
                                { 'featureType': featureType, 'fid': fid, 'updateDrawing': true}
                            );
                            return false;
                        });
                        // filter
                        $('#liz_layer_popup button.popup-layer-feature-filter').click(function(){
                            var fid = $(this).val().split('.').pop();
                            var featureType = $(this).val().replace( '.' + fid, '' );
                            // First deselect all features
                            lizMap.events.triggerEvent(
                                'layerfeatureunselectall',
                                { 'featureType': featureType, 'updateDrawing': false}
                            );
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
                            return false;
                        });
                        // edit
                        $('#liz_layer_popup button.popup-layer-feature-edit').click(function(){
                            var fid = $(this).val().split('.').pop();
                            var layerId = $(this).val().replace( '.' + fid, '' );
                            // launch edition
                            lizMap.launchEdition( layerId, fid );
                            return false;
                        });
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
                        });
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

