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

                            atConfig['crs'] = self.find('SRS').text();
                            if ( atConfig.crs in Proj4js.defs ){
                                new OpenLayers.Projection(atConfig.crs);
                            }
                            else
                                $.get(service, {
                                    'REQUEST':'GetProj4'
                                    ,'authid': atConfig.crs
                                }, function ( aText ) {
                                    Proj4js.defs[atConfig.crs] = aText;
                                    new OpenLayers.Projection(atConfig.crs);
                                }, 'text');
                            var bbox = self.find('LatLongBoundingBox');
                            atConfig['bbox'] = [
                                parseFloat(bbox.attr('minx'))
                             ,parseFloat(bbox.attr('miny'))
                             ,parseFloat(bbox.attr('maxx'))
                             ,parseFloat(bbox.attr('maxy'))
                            ];
                            atConfig['title'] = self.find('Title').text();
                            attributeLayersDic[lizMap.cleanName(lname)] = lname;
                        }
                    });
                    if (hasAttributeTableLayers) {

                        // Add the list of laers in the summary table
                        var tHtml = '<table id="attribute-layer-list-table" class="table table-condensed table-hover table-striped" style="width:auto;">';
                        for( var idx in attributeLayersDic) {
                            var cleanName = idx;
                            var title = config.attributeLayers[ attributeLayersDic[ cleanName ] ][ 'title' ];
                            tHtml+= '<tr>';
                            tHtml+= '   <td>' + title + '</td><td><button value=' + cleanName + ' class="btn-open-attribute-layer">Detail</button></td>';
                            tHtml+= '</tr>';
                        }
                        tHtml+= '</table>';
                        $('#attribute-layer-list').html(tHtml);

                        // Create the vector layer if needed
                        var locatelayerSearch = lizMap.map.getLayersByName('locatelayer');
                        if (locatelayerSearch.length == 0 ) {
                            lizMap.map.addLayer(new OpenLayers.Layer.Vector('locatelayer',{
                                styleMap: new OpenLayers.StyleMap({
                                    pointRadius: 6,
                                    fill: false,
                                    stroke: true,
                                    strokeWidth: 3,
                                    strokeColor: 'yellow'
                                }),
                                projection: lizMap.map.getProjection()
                            }));
                        }

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
                attributeLayersActive = false;
                var locatelayerSearch = lizMap.map.getLayersByName('locatelayer');
                if ( locatelayerSearch.length > 0 ) {
                    locatelayerSearch[0].destroyFeatures();
                }
                return false;
            }


            function addLayerDiv(lname) {
                // Get layer config
                var atConfig = config.attributeLayers[lname];
                var layerName = lizMap.cleanName(lname);

                // Add li to the tabs
                var liHtml = '<li id="nav-tab-attribute-layer-' + layerName + '">';
                liHtml+= '<a href="#attribute-layer-' + layerName + '" data-toggle="tab">' + atConfig['title'] + '</a></li>';
                $('#attributeLayers-tabs').append( liHtml );

                // Add content div
                var html = '<div id="attribute-layer-' + layerName + '" class="tab-pane attribute-content bottom-content" >';
                html+= '    <div class="attribute-layer-main" id="attribute-layer-main-' + layerName + '" >';

                //~ // Refresh button
                //~ html+= '    <button class="btn-refresh-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.refresh.title']+'</button>';

                if( !atConfig['selectedFeatures'] )
                    atConfig['selectedFeatures'] = [];
                if( !atConfig['filteredFeatures'] )
                    atConfig['filteredFeatures'] = [];

                var selClass= '';
                if( atConfig['selectedFeatures'].length == 0 )
                    selClass= ' hidden';
                var filClass= '';
                if( atConfig['filteredFeatures'].length > 0 )
                    filClass= ' active btn-warning';
                else
                    filClass = selClass

                // Unselect button
                html+= '    <button class="btn-unselect-attributeTable btn btn-mini' + selClass + '" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.unselect.title']+'</button>';

                // Filter button
                html+= '    <button class="btn-filter-attributeTable btn btn-mini' + filClass + '" value="' + layerName + '" >'+lizDict['attributeLayers.toolbar.btn.data.filter.title']+'</button>';

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

                //~ // Detail button
                //~ html+= '    <button class="btn-detail-attributeTable btn btn-mini" value="' + layerName + '"  style="display:none;">'+lizDict['attributeLayers.toolbar.btn.data.detail.title']+'</button>';


                html+= '    <br/><span class="attribute-layer-msg"></span>';
                html+= '    <table id="attribute-layer-table-' + layerName + '" class="attribute-table-table table table-hover table-condensed table-striped"></table>';

                // Add child layers
                var childHtml = addChildrenContainer( lname );
                html+= childHtml;

                html+= '    </div>';
                html+= '    <div class="attribute-layer-feature-panel" id="attribute-table-panel-' + layerName + '" ></div>';
                html+= '</div>';

                $('#attribute-table-container').append(html);

                // Bind click on "unselect all" button
                $('#attribute-layer-'+ layerName + ' button.btn-unselect-attributeTable')
                .click(function(){
                    var aName = attributeLayersDic[ $(this).val() ];
                    // Send signal
                    lizMap.events.triggerEvent(
                        "layerfeatureunselectall",
                        { 'featureType': aName}
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

            }

            function getLayerConfigById( layerId, confObjet=config.layers, idAttribute='id') {
                for ( var lx in confObjet ) {
                    if ( confObjet[lx][idAttribute] == layerId )
                        return [lx, confObjet[lx] ];
                }
                return null;
            }

            function addChildrenContainer( parentLayerName ) {

                var childHtml = '';
                var lConfig = config.layers[parentLayerName];
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
                            childHtml+= '<div style="padding:20px;background-color:lightgrey;border:1px solid white;">';
                            childHtml+= '<h4>' + childLayerConfig.name + '</h4>';
                            var childLayerName = childLayerConfigA[0];
                            var tId = 'attribute-layer-table-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);
                            childHtml+= '<table id="' + tId  + '" class="attribute-table-table table table-hover table-condensed table-striped"></table>';
                            childHtml+= '</div>';
                        }
                    }

                }
                return childHtml;
            }

            function refreshChildrenLayersContent( sourceTable, featureType, featId ) {

                var feat = config.attributeLayers[featureType]['features'][featId];
                if(!feat)
                    return false;
                var fp = feat.properties;

                var lConfig = config.layers[featureType];
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

            function getAttributeTableFeature(aName, aTable, exp_filter=null ) {
                var dataLength = 0;

                config.attributeLayers[aName]['tableDisplayed'] = false;

                $('body').css('cursor', 'wait');
                if( !config.attributeLayers[aName]['selectedFeatures'] )
                    config.attributeLayers[aName]['selectedFeatures'] = [];

                var getFeatureUrlData = getAttributeFeatureUrlData( aName, exp_filter );

                $.get(getFeatureUrlData['url'], getFeatureUrlData['options'], function(data) {

                    // Get features and build attribute table content
                    var lConfig = config.layers[aName];
                    config.attributeLayers[aName]['features'] = [];
                    var features = data.features;
                    dataLength = features.length;

                    if (dataLength > 0) {
                        config.attributeLayers[aName]['features'] = {};
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

                        columns.push( {"data": "zoom", "width": "25px", "searchable": false, "sortable": false} );
                        columns.push( {"data": "center", "width": "25px", "searchable": false, "sortable": false} );

                        // Add column for each field
                        for (var idx in features[0].properties){
                            columns.push( {"data": idx, "title": idx} );
                        }

                        var dataSet = [];
                        for (var x in features) {
                            var line = {};

                            // add feature to layer global data
                            var feat = features[x];
                            var fid = feat.id.split('.')[1];
                            config.attributeLayers[aName]['features'][fid] = feat;

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

                            var zoomCol = '<button class="btn btn-mini attribute-layer-feature-focus zoom" value="'+fid+'" title="' + lizDict['attributeLayers.btn.zoom.title'] + '"><i class="icon-zoom-in"></i></button>';
                            line['zoom'] = zoomCol;

                            var centerCol = '<button class="btn btn-mini attribute-layer-feature-focus center" value="'+fid+'" title="' + lizDict['attributeLayers.btn.center.title'] + '"><i class="icon-screenshot"></i></button>';
                            line['center'] = centerCol;

                            for (var idx in feat.properties){
                                var prop = feat.properties[idx];
                                line[idx] = prop;
                            }


                            dataSet.push( line );
                        }

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
                                    if ( config.attributeLayers[aName]['selectedFeatures'].indexOf( data.DT_RowId.toString() ) != -1 ) {
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
                                    if( lConfig['popup'] == 'True' ) {
                                        var feat = config.attributeLayers[aName]['features'][featId];
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
                                        { 'featureType': aName, 'fid': featId}
                                    );
                                    return false;
                                })
                                .hover(
                                    function(){ $(this).addClass('btn-primary'); },
                                    function(){ $(this).removeClass('btn-primary'); }
                                );

                                // Zoom to selected feature on tr click
                                $(aTable +' tr td button.attribute-layer-feature-focus').click(function() {

                                    // Read feature
                                    var featId = $(this).val();
                                    var feat = config.attributeLayers[aName]['features'][featId];
                                    var format = new OpenLayers.Format.GeoJSON();
                                    feat = format.read(feat)[0];
                                    var proj = new OpenLayers.Projection(config.attributeLayers[aName].crs);
                                    feat.geometry.transform(proj, lizMap.map.getProjection());

                                    // Zoom or center to selected feature
                                    if( $(this).hasClass('zoom') )
                                        lizMap.map.zoomToExtent(feat.geometry.getBounds());
                                    else{
                                        var lonlat = feat.geometry.getBounds().getCenterLonLat()
                                        lizMap.map.setCenter(lonlat);
                                    }
                                    return false;

                                })
                                .hover(
                                    function(){ $(this).addClass('btn-primary'); },
                                    function(){ $(this).removeClass('btn-primary'); }
                                );

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

            function getAttributeFeatureUrlData( aName, exp_filter=null, featureid=null ) {
                var getFeatureUrlData = {};

                // Build WFS request parameters
                var atConfig = config.attributeLayers[aName];
                var typeName = aName.replace(' ','_');
                var layerName = lizMap.cleanName(aName);
                var extent = lizMap.map.getExtent().clone();
                var projFeat = new OpenLayers.Projection(atConfig.crs);
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
                if ( atConfig['filteredFeatures'] && atConfig['filteredFeatures'].length > 0 ){
                    filterParam.push( '$id IN ( ' + atConfig['filteredFeatures'].join() + ' ) ' );
                }
                if( filterParam.length )
                    wfsOptions['EXP_FILTER'] = filterParam.join( ' AND ' );


                // optionnal parameter filterid
                if( featureid )
                    wfsOptions['FEATUREID'] = featureid;

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

                var atConfig = config.attributeLayers[aName];
                var typeName = aName.replace(' ','_');

                // Calculate fake bbox around the feature
                var proj = new OpenLayers.Projection(atConfig.crs);
                var lConfig = config.layers[parentLayerName];
                var units = lizMap.map.getUnits();
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
                    $('#attribute-layer-main-' + layerName ).addClass('reduced');
                    $('#attribute-table-panel-' + layerName ).addClass('visible').html(data);
                    var closeButton = '<a class="close-attribute-feature-panel pull-right" href="#"><i class="icon-remove"></i></a>'
                    $('#attribute-table-panel-' + layerName + ' h4').append(closeButton);
                    $('#attribute-table-panel-' + layerName + ' h4 a.close-attribute-feature-panel').click(function(){
                        $('#attribute-layer-main-' + layerName ).removeClass('reduced');
                        $('#attribute-table-panel-' + layerName ).removeClass('visible').html('');
                    });
                });


            }

            function getSelectionFeatureId( aName ) {
                var featureidParameter = '';
                var selectionLayer = attributeLayersDic[ aName ];
                if( config.attributeLayers[selectionLayer]['selectedFeatures'] ){
                    var fids = [];
                    for( var id in config.attributeLayers[selectionLayer]['selectedFeatures'] ) {
                        fids.push( selectionLayer + '.' + config.attributeLayers[selectionLayer]['selectedFeatures'][id] );
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

            function refreshLayerSelection( featureType, featId, refresh=true ) {
                // Assure selectedFeatures property exists for the layer
                if( !config.attributeLayers[featureType]['selectedFeatures'] )
                    config.attributeLayers[featureType]['selectedFeatures'] = [];

                // Add or remove feature id from the selectedFeatures
                if( config.attributeLayers[featureType]['selectedFeatures'].indexOf( featId ) == -1 ) {
                    config.attributeLayers[featureType]['selectedFeatures'].push( featId );
                }else{
                    var idx = config.attributeLayers[featureType]['selectedFeatures'].indexOf( featId )
                    config.attributeLayers[featureType]['selectedFeatures'].splice( idx, 1 );
                }

                lizMap.events.triggerEvent(
                    "layerSelectionChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.attributeLayers[featureType]['selectedFeatures']
                    }
                );

            }

            function emptyLayerSelection( featureType, refresh=true ) {
                // Empty array
                if( !config.attributeLayers[featureType]['selectedFeatures'] )
                    config.attributeLayers[featureType]['selectedFeatures'] = [];
                config.attributeLayers[featureType]['selectedFeatures'] = [];

                lizMap.events.triggerEvent(
                    "layerSelectionChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.attributeLayers[featureType]['selectedFeatures']
                    }
                );

            }

            function refreshLayerFilter( featureType, featId ) {
                // Assure filteredFeatures property exists for the layer
                if( !config.attributeLayers[featureType]['filteredFeatures'] )
                    config.attributeLayers[featureType]['filteredFeatures'] = [];

                // Add or remove feature id from the filteredFeatures
                if( config.attributeLayers[featureType]['filteredFeatures'].indexOf( featId ) == -1 ) {
                    config.attributeLayers[featureType]['filteredFeatures'].push( featId );
                }else{
                    var idx = config.attributeLayers[featureType]['filteredFeatures'].indexOf( featId )
                    config.attributeLayers[featureType]['filteredFeatures'].splice( idx, 1 );
                }

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.attributeLayers[featureType]['filteredFeatures']
                    }
                );


            }

            function emptyLayerFilter( featureType ) {
                // Assure filteredFeatures property exists for the layer
                if( !config.attributeLayers[featureType]['filteredFeatures'] )
                    config.attributeLayers[featureType]['filteredFeatures'] = [];

                // Empty array
                config.attributeLayers[featureType]['filteredFeatures'] = [];

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.attributeLayers[featureType]['filteredFeatures']
                    }
                );


            }

            function filterLayerFromSelectedFeatures( featureType ) {
                if( !config.attributeLayers[featureType] )
                    return false;

                // Assure selectedFeatures property exists for the layer
                if( !config.attributeLayers[featureType]['selectedFeatures'] )
                    config.attributeLayers[featureType]['selectedFeatures'] = [];

                // Copy selected features as filtered features
                config.attributeLayers[featureType]['filteredFeatures'] = config.attributeLayers[featureType]['selectedFeatures'].slice();

                // Remove selection
                emptyLayerSelection( featureType, false );

                lizMap.events.triggerEvent(
                    "layerFilteredFeaturesChanged",
                    {
                        'featureType': featureType,
                        'featureIds': config.attributeLayers[featureType]['filteredFeatures']
                    }
                );


            }


            function refreshLayerRendering( featureType, filterParam=null ){
                // Modify layer wms options if needed
                var layer = lizMap.map.getLayersByName( featureType )[0];
                if( layer ) {

                    var layerN = attributeLayersDic[featureType];

                    // Selection parameter
                    if( config.attributeLayers[featureType]
                        && config.attributeLayers[featureType]['selectedFeatures']
                        && config.attributeLayers[featureType]['selectedFeatures'].length
                    ) {
                        layer.params['SELECTION'] = layerN + ':' + config.attributeLayers[featureType]['selectedFeatures'].join();
                    }
                    else
                        delete layer.params['SELECTION'];



                    // Filter parameter
                    if( config.attributeLayers[featureType]
                        && config.attributeLayers[featureType]['filteredFeatures']
                        && config.attributeLayers[featureType]['filteredFeatures'].length
                    ) {

                        var fi = [];
                        var features = config.attributeLayers[featureType]['features'];
                        if (!features)
                            return false;

                        var primaryKey = config.attributeLayers[featureType]['primaryKey'];
                        for( var x in config.attributeLayers[featureType]['filteredFeatures']) {
                            var idFeat = config.attributeLayers[featureType]['filteredFeatures'][x];
                            var afeat = features[idFeat];
                            var pk = afeat.properties[primaryKey];
                            if( !parseInt( pk ) )
                                pk = " '" + pk + "' ";
                            fi.push( pk );
                        }
                        layer.params['FILTER'] = layerN + ':"' + primaryKey + '" IN ( ' + fi.join( ' , ' ) + ' ) ';
                    }
                    // Filter passed when cascading to children
                    else if( filterParam ){
                        layer.params['FILTER'] = filterParam;
                    }
                    else
                        delete layer.params['FILTER'];

                    layer.redraw(true);

                    // Cascade to childrens
                    var ff = config.attributeLayers[featureType]['filteredFeatures'];
                    var parentLayerId = config.attributeLayers[featureType]['layerId'];
                    if( 'relations' in config && parentLayerId in config.relations) {
                        var layerRelations = config.relations[parentLayerId];

                        for( var lid in layerRelations ) {
                            var relation = layerRelations[lid];

                            // Get parent primary key values
                            var parentKeys = [];
                            for( var a in ff ){
                                var cFeatureId = ff[a];
                                var feat = config.attributeLayers[featureType]['features'][cFeatureId];
                                parentKeys.push( "'" + feat.properties[ relation.referencedField ] + "'");
                            }

                            var childLayerConfigA = getLayerConfigById(
                                relation.referencingLayer,
                                config.layers,
                                'id'
                            );
                            if( childLayerConfigA ){
                                var childLayerKeyName = childLayerConfigA[0];
                                var childLayerConfig = childLayerConfigA[1];

                                // Add a Filter to children layers
                                if( parentKeys.length > 0 )
                                    var cFilter = childLayerKeyName + ':"' + relation.referencingField + '" IN ( ' + parentKeys.join() + ' )';
                                else
                                    var cFilter = null
                                refreshLayerRendering( childLayerKeyName, cFilter );

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
                if( config.attributeLayers[eConfig[0]]
                    && config.attributeLayers[eConfig[0]]['features']
                    && config.attributeLayers[eConfig[0]]['features'][featureId]
                ){
                    var eProp = config.attributeLayers[eConfig[0]]['features'][featureId].properties;
                    for( var y in eProp ){
                        deleteConfirm+= '  \n"' + y + '": ' + eProp[y] ;
                    }

                }
                lizMap.deleteEditionFeature( layerId, featureId, deleteConfirm, function( aLID, aFID ){});
            }


            function updateMapLayerDrawing( featureType ){
                // Refresh layer renderding
                refreshLayerRendering( featureType );
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
                    if( !config.attributeLayers[featureType]['filteredFeatures'] )
                        config.attributeLayers[featureType]['filteredFeatures'] = [];
                    if( config.attributeLayers[featureType]['filteredFeatures'].length == 0 )
                        $('button.btn-filter-attributeTable').removeClass('active btn-warning').addClass('hidden');
                    else
                        $('button.btn-filter-attributeTable').removeClass('hidden').addClass('active btn-warning');
                }

            }

            function updateAttributeTableContent( featureType ){
                // Refresh table
                var aTable = '#attribute-layer-table-'+lizMap.cleanName( featureType );
                if( aTable )
                    getAttributeTableFeature( featureType, aTable );
            }

            function redrawAttributeTableContent( featureType, featureIds ){
                var aTable = '#attribute-layer-table-'+lizMap.cleanName( featureType );
                if ( $.fn.dataTable.isDataTable( aTable ) ) {
                    // Get selected feature ids if not given
                    if( !featureIds ){
                        // Assure selectedFeatures property exists for the layer
                        if( !config.attributeLayers[featureType]['selectedFeatures'] )
                            config.attributeLayers[featureType]['selectedFeatures'] = [];
                        var featureIds = config.attributeLayers[featureType]['selectedFeatures'];
                    }
                    // Remove class selected for all the lines
                    $(aTable).find('tr').removeClass('selected');
                    // Add class selected from featureIds
                    if( featureIds.length > 0 ){
                        var rTable = $( aTable ).DataTable();
                        var indexes = featureIds.map(function(num){ return '#' + num;})
                        // Add a class to those rows using an index selector
                        rTable.rows( indexes )
                            .nodes()
                            .to$()
                            .addClass( 'selected' );
                    }

                }
            }

            lizMap.events.on({

                layerfeaturehighlighted: function(e) {
                    refreshChildrenLayersContent( e.sourceTable, e.featureType, e.fid );
                },

                layerfeatureselected: function(e) {
                    refreshLayerSelection( e.featureType, e.fid );
                },

                layerfeatureunselectall: function(e) {
                    emptyLayerSelection( e.featureType );
                },

                layerfeaturefilterselected: function(e) {
                    filterLayerFromSelectedFeatures( e.featureType );
                },

                layerfeatureremovefilter: function(e) {
                    emptyLayerFilter( e.featureType );
                },

                layerSelectionChanged: function(e) {
                    // Update openlayers layer drawing
                    updateMapLayerDrawing( e.featureType, e.featureIds );

                    // Update attribute table tools
                    updateAttributeTableTools( e.featureType, e.featureIds );

                    // Redraw attribute table content (add "selected" classes)
                    redrawAttributeTableContent( e.featureType, e.featureIds );
                },

                layerFilteredFeaturesChanged: function(e) {
                    // Update openlayers layer drawing
                    updateMapLayerDrawing( e.featureType, e.featureIds );

                    // Update attribute table tools
                    updateAttributeTableTools( e.featureType, e.featureIds );

                    // Update attribute table content
                    updateAttributeTableContent( e.featureType, e.featureIds );
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
                            lizMap.events.triggerEvent('layerfeatureunselectall', {featureType});
                            lizMap.events.triggerEvent('layerfeatureselected', {featureType, fid});
                            return false;
                        });
                        // filter
                        $('#liz_layer_popup button.popup-layer-feature-filter').click(function(){
                            var fid = $(this).val().split('.').pop();
                            var featureType = $(this).val().replace( '.' + fid, '' );
                            // First select this feature only
                            lizMap.events.triggerEvent('layerfeatureunselectall', {featureType});
                            lizMap.events.triggerEvent('layerfeatureselected', {featureType, fid});
                            // Then filter for this selected feature
                            lizMap.events.triggerEvent('layerfeaturefilterselected', {featureType, fid});
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

                    // Add children table if needed

                },

                lizmapeditionfeaturecreated: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer )
                        updateAttributeTableContent( getLayer[0] );
                },

                lizmapeditionfeaturemodified: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer )
                        updateAttributeTableContent( getLayer[0], null );
                },

                lizmapeditionfeaturedeleted: function(e){
                    var getLayer = getLayerConfigById( e.layerId );
                    if( getLayer )
                        updateAttributeTableContent( getLayer[0], null );
                }
            });


        } // uicreated
    });


}();

