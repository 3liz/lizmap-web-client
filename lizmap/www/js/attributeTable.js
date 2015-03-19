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
                atConfig = config.attributeLayers[lname];
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

                // Unselect button
                html+= '    <button class="btn-unselect-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.unselect.title']+'</button>';

                // Filter button
                html+= '    <button class="btn-filter-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.filter.title']+'</button>';

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

                html+= '    <br/><span class="attribute-layer-msg"></span>';
                html+= '    <table id="attribute-layer-table-' + layerName + '" class="attribute-table-table table table-hover table-condensed table-striped"></table>';

                // Add child layers
                var childHtml = addChildrenContainer( lname );
                html+= childHtml;

                html+= '    </div>';
                html+= '    <div class="attribute-layer-feature-panel" id="attribute-table-panel-' + layerName + '" ></div>';
                html+= '</div>';

                $('#attribute-table-container').append(html);

                //~ // Bind click on refresh buttons
                //~ $('#attribute-layer-'+ layerName + ' button.btn-refresh-attributeTable')
                //~ .click(function(){
                    //~ var aName = attributeLayersDic[ $(this).val() ];
                    //~ var aTable = '#attribute-layer-table-'+lizMap.cleanName( aName );
                    //~ getAttributeTableFeature( aName, aTable );
                    //~ return false;
                //~ })
                //~ .hover(
                    //~ function(){ $(this).addClass('btn-primary'); },
                    //~ function(){ $(this).removeClass('btn-primary'); }
                //~ );

                // Bind click on unselect button
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
                        $(this).removeClass('active').removeClass('btn-warning');
                        lizMap.events.triggerEvent(
                            "layerfeatureremovefilter",
                            { 'featureType': aName}
                        );
                    } else {
                        $(this).addClass('active').addClass('btn-warning');
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

                        columns.push( {"title": "Select"} );
                        if( lConfig['popup'] == 'True' ) {
                            columns.push( {"title": "Info"} );
                        }
                        if( aName in config.editionLayers ) {
                            columns.push( {"title": "Edit"} );
                        }
                        columns.push( {"title": "Zoom"} );
                        columns.push( {"title": "Center"} );
                        for (var idx in features[0].properties){
                            columns.push( {"title": idx} );
                        }

                        var dataSet = [];
                        for (var x in features) {
                            var line = [];

                            // add feature to layer global data
                            var feat = features[x];
                            var fid = feat.id.split('.')[1];
                            config.attributeLayers[aName]['features'][fid] = feat;

                            // Build table lines
                            var trClass = '';
                            if( config.attributeLayers[aName]['selectedFeatures'] && config.attributeLayers[aName]['selectedFeatures'].indexOf( fid ) != -1)
                                trClass = 'selected';

                            var selectCol = '<td><button class="btn btn-mini attribute-layer-feature-select" value="'+fid+'" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-plus"></i></button></td>';
                            line.push( selectCol );

                            if( lConfig['popup'] == 'True' ) {
                                var infoCol = '<td><button class="btn btn-mini attribute-layer-feature-info" value="'+fid+'" title="' + lizDict['attributeLayers.btn.info.title'] + '"><i class="icon-info-sign"></i></button></td>';
                                line.push( infoCol );
                            }
                            if( aName in config.editionLayers ) {
                                var editCol = '<td><button class="btn btn-mini attribute-layer-feature-edit" value="'+fid+'" title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i></button></td>';
                                line.push( editCol );
                            }

                            var zoomCol = '<td><button class="btn btn-mini attribute-layer-feature-focus zoom" value="'+fid+'" title="' + lizDict['attributeLayers.btn.zoom.title'] + '"><i class="icon-zoom-in"></i></button></td>';
                            line.push( zoomCol );

                            var centerCol = '<td><button class="btn btn-mini attribute-layer-feature-focus center" value="'+fid+'" title="' + lizDict['attributeLayers.btn.center.title'] + '"><i class="icon-screenshot"></i></button></td>';
                            line.push( centerCol );

                            for (var idx in feat.properties){
                                var prop = feat.properties[idx];
                                line.push( prop );
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
                                    return false;

                                });

                                // Select feature
                                $(aTable +' tr td button.attribute-layer-feature-select').click(function() {
                                    var featId = $(this).val();

                                    // Change tr state
                                    var tr = $(this).parents('tr:first');
                                    if( !tr.hasClass('selected') ){
                                        tr.addClass('selected');
                                        $(this).attr( 'title', lizDict['attributeLayers.btn.unselect.title'] );
                                        $(this).children('i').removeClass('icon-plus').addClass('icon-minus');
                                    }else {
                                        tr.removeClass('selected');
                                        $(this).attr( 'title', lizDict['attributeLayers.btn.select.title'] );
                                        $(this).children('i').removeClass('icon-minus').addClass('icon-plus');
                                    }

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

                                // Display popup for the feature
                                if( lConfig['popup'] == 'True' ) {
                                    $(aTable +' tr td button.attribute-layer-feature-info').click(function() {

                                        var featId = $(this).val();
                                        var feat = config.attributeLayers[aName]['features'][featId];
                                        getFeatureInfoForLayerFeature( aTable, aName, feat );
                                        return false;

                                    })
                                    .hover(
                                        function(){ $(this).addClass('btn-primary'); },
                                        function(){ $(this).removeClass('btn-primary'); }
                                    );
                                }

                                // Trigger edition for selected feature
                                if( config.editionLayers && aName in config.editionLayers ) {
                                    $(aTable +' tr td button.attribute-layer-feature-edit').click(function() {

                                        // Get the layer feature
                                        var layer = lizMap.map.getLayersByName('locatelayer')[0];
                                        layer.destroyFeatures();
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
                if ( atConfig['filteredFeatures'] && atConfig['filteredFeatures'].length ){
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
                    ,'CRS': lizMap.map.getProjection()
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

            function refreshLayerSelection( featureType, featId ) {
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

                // Refresh layer renderding
                refreshLayerRendering( featureType );
            }

            function emptyLayerSelection( featureType, refresh=true ) {
                // Empty array
                if( !config.attributeLayers[featureType]['selectedFeatures'] )
                    config.attributeLayers[featureType]['selectedFeatures'] = [];
                config.attributeLayers[featureType]['selectedFeatures'] = [];

                // Refresh layer renderding
                if (refresh)
                    refreshLayerRendering( featureType );

                // Remove selected class for the table
                $('#attribute-layer-table-' + featureType + ' tr').removeClass('selected');
                //~ $('button.btn-filter-attributeTable').deactivate();
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

            }

            function emptyLayerFilter( featureType ) {
                // Empty array
                config.attributeLayers[featureType]['filteredFeatures'] = [];

                // Refresh layer renderding
                refreshLayerRendering( featureType );

                // Refresh table
                var aTable = '#attribute-layer-table-'+lizMap.cleanName( featureType );
                getAttributeTableFeature( featureType, aTable );
            }

            function filterLayerFromSelectedFeatures( featureType ) {
                // Assure selectedFeatures property exists for the layer
                if( !config.attributeLayers[featureType]['selectedFeatures'] )
                    config.attributeLayers[featureType]['selectedFeatures'] = [];

                // Copy selected features as filtered features
                config.attributeLayers[featureType]['filteredFeatures'] = config.attributeLayers[featureType]['selectedFeatures'].slice();

                // Remove selection
                emptyLayerSelection( featureType, false );

                // Refresh layer renderding
                refreshLayerRendering( featureType );

                // Refresh table
                var aTable = '#attribute-layer-table-'+lizMap.cleanName( featureType );
                getAttributeTableFeature( featureType, aTable );

            }


            function refreshLayerRendering( featureType ){
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
                    else
                        delete layer.params['FILTER'];


                    layer.redraw(true);
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
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.select.title'] + '"><i class="icon-plus"></i>&nbsp;' + lizDict['attributeLayers.btn.select.title'] + '</button>';
                        }

                        // Edit button
                        var eConfig = getLayerConfigById(
                            layerId,
                            config.editionLayers,
                            'layerId'
                        );
                        if( eConfig ) {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-edit" value="';
                            eHtml+= $(this).val();
                            eHtml+= '" title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i>&nbsp;' + lizDict['attributeLayers.btn.edit.title'] + '</button>';
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
                            emptyLayerSelection( featureType, false )
                            lizMap.events.triggerEvent('layerfeatureselected', {featureType, fid});
                        });
                        // edit
                        $('#liz_layer_popup button.popup-layer-feature-edit').click(function(){
                            var fid = $(this).val().split('.').pop();
                            var layerId = $(this).val().replace( '.' + fid, '' );
                            // launch edition
                            lizMap.launchEdition( layerId, fid );
                        });
                    }

                    // Add children table if needed

                }
            });


        } // uicreated
    });


}();

