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
                            atConfig = config.attributeLayers[lname];
                            atConfig['crs'] = self.find('SRS').text();
                            if ( atConfig.crs in Proj4js.defs )
                                new OpenLayers.Projection(atConfig.crs);
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
                        var tHtml = '<table id="attribute-layer-list-table" class="table table-condensed table-hover" style="width:auto;">';
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
                            var filter = null;
                            getAttributeTableFeature(lname, filter, aTable);
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

                html+= '    <button class="btn-refresh-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.refresh.title']+'</button>';

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
                html+= '    <table id="attribute-layer-table-' + layerName + '" class="attribute-table-table table table-hover table-condensed table-stripped"></table>';

                // Add child layers
                var childHtml = addChildrenContainer( lname );
                html+= childHtml;

                html+= '    </div>';
                html+= '    <div class="attribute-layer-feature-panel" id="attribute-table-panel-' + layerName + '" ></div>';
                html+= '</div>';

                $('#attribute-table-container').append(html);

                // Bind click on refresh buttons
                $('#attribute-layer-'+ layerName + ' button.btn-refresh-attributeTable')
                .click(function(){
                    var aName = attributeLayersDic[ $(this).val() ];
                    var aTable = '#attribute-layer-main-'+lizMap.cleanName( aName )+' table:first';
                    var filter = null;
                    getAttributeTableFeature( aName, filter, aTable );
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

            function getLayerConfigById( layerId) {
                for ( var lx in config.layers ) {
                    if ( config.layers[lx]['id'] == layerId )
                        return [lx, config.layers[lx] ];
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
                        var childLayerConfigA = getLayerConfigById( relation.referencingLayer );
                        if( childLayerConfigA ){
                            var childLayerConfig = childLayerConfigA[1];
                            childHtml+= '<div style="padding:20px;background-color:lightgrey;border:1px solid white;">';
                            childHtml+= '<h4>' + childLayerConfig.name + '</h4>';
                            var childLayerName = childLayerConfigA[0];
                            var tId = 'attribute-layer-table-' + lizMap.cleanName(parentLayerName) + '-' + lizMap.cleanName(childLayerName);
                            childHtml+= '<table id="' + tId  + '" class="attribute-table-table table table-hover table-condensed table-stripped"></table>';
                            childHtml+= '</div>';
                            //~ console.log( childHtml );
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
                        var childLayerConfigA = getLayerConfigById( relation.referencingLayer );
                        if( childLayerConfigA ){
                            var childLayerName = childLayerConfigA[0];
                            var childLayerConfig = childLayerConfigA[1];
                            // Generate filter
                            var filter = '';
                            if( relation.referencingLayer == childLayerConfig.id ){
                                filter = '"' + relation.referencingField + '" = ' + "'" + fp[relation.referencedField] + "'";
                            }
                            // Get child table id
                            var childTable = sourceTable + '-' + lizMap.cleanName(childLayerName);
                            getAttributeTableFeature( childLayerName, filter, childTable );

                        }
                    }

                }
            }

            function getAttributeTableFeature(aName, filter, aTable) {
                var dataLength = 0;

                config.attributeLayers[aName]['tableDisplayed'] = false;

                $('body').css('cursor', 'wait');

                var getFeatureUrlData = getAttributeFeatureUrlData( aName, filter );
                $.get(getFeatureUrlData['url'], getFeatureUrlData['options'], function(data) {

                    // Get features and build attribute table content
                    var lConfig = config.layers[aName];
                    config.attributeLayers[aName]['features'] = [];
                    var features = data.features;
                    dataLength = features.length;
                    var html = '';
                    if (dataLength > 0) {
                        config.attributeLayers[aName]['features'] = features;
                        html+= '<tr>';
                        html+='<th>' + lizDict['attributeLayers.btn.info.title'] + '</th>';
                        html+='<th>' + lizDict['attributeLayers.btn.zoom.title'] + '</th>';
                        html+='<th>' + lizDict['attributeLayers.btn.center.title'] + '</th>';
                        for (var idx in features[0].properties){
                            html+='<th>' + idx + '</th>';
                        }
                        html+='</tr>';
                        for (var fid in features) {
                            html+='<tr>';
                            html+='<td><button class="btn btn-mini attribute-layer-feature-info" value="'+fid+'">' + lizDict['attributeLayers.btn.info.title'] + '</button></td>';
                            html+='<td><button class="btn btn-mini attribute-layer-feature-focus zoom" value="'+fid+'">' + lizDict['attributeLayers.btn.zoom.title'] + '</button></td>';
                            html+='<td><button class="btn btn-mini attribute-layer-feature-focus center" value="'+fid+'">' + lizDict['attributeLayers.btn.center.title'] + '</button></td>';
                            var feat = features[fid];
                            for (var idx in feat.properties){
                                var prop = feat.properties[idx];
                                html+='<td>' + prop + '</td>';
                            }
                            html+='</tr>';
                        }

                        // unbind previous events
                        $(aTable +' tr').unbind('click');
                        $(aTable +' tr td button').unbind('click');

                        $(aTable).html(html);

                        // Select the line
                        $(aTable +' tr').click(function() {
                            $(aTable +' tr').removeClass('active');
                            $(this).addClass('active');
                            // Get corresponding feature
                            var featId = $(this).find('button.attribute-layer-feature-focus').val();
                            // Send signal
                            lizMap.events.triggerEvent(
                                "tablefeatureselected",
                                { 'sourceTable': aTable, 'featureType': aName, 'fid': featId}
                            );
                            return false;

                        });

                        // Zoom to selected feature on tr click
                        $(aTable +' tr td button.attribute-layer-feature-focus').click(function() {

                            // Add the feature to the layer
                            var layer = lizMap.map.getLayersByName('locatelayer')[0];
                            layer.destroyFeatures();
                            var featId = $(this).val();
                            var feat = config.attributeLayers[aName]['features'][featId];
                            var format = new OpenLayers.Format.GeoJSON();
                            feat = format.read(feat)[0];
                            var proj = new OpenLayers.Projection(config.attributeLayers[aName].crs);
                            feat.geometry.transform(proj, lizMap.map.getProjection());
                            layer.addFeatures([feat]);

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
                        );;

                        // Display popup for the feature
                        $(aTable +' tr td button.attribute-layer-feature-info').click(function() {

                            // Add the feature to the layer
                            var layer = lizMap.map.getLayersByName('locatelayer')[0];
                            layer.destroyFeatures();
                            var featId = $(this).val();
                            var feat = config.attributeLayers[aName]['features'][featId];
                            var format = new OpenLayers.Format.GeoJSON();
                            feat = format.read(feat)[0];
                            var proj = new OpenLayers.Projection(config.attributeLayers[aName].crs);
                            feat.geometry.transform(proj, lizMap.map.getProjection());

                            var lonlat = feat.geometry.getBounds().getCenterLonLat()
                            getFeatureInfoForLayerFeature( aTable, aName, lonlat );
                            return false;

                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );;


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

            function getAttributeFeatureUrlData( aName, filter ) {
                var getFeatureUrlData = {};

                // Build WFS request parameters
                var atConfig = config.attributeLayers[aName];
                var typeName = aName.replace(' ','_');
                var layerName = lizMap.cleanName(aName);
                var extent = lizMap.map.getExtent();
                var proj = new OpenLayers.Projection(atConfig.crs);
                var bbox = lizMap.map.getExtent().transform(lizMap.map.getProjection(), proj).toBBOX();
                var wfsOptions = {
                    'SERVICE':'WFS'
                    ,'VERSION':'1.0.0'
                    ,'REQUEST':'GetFeature'
                    ,'TYPENAME':typeName
                    ,'OUTPUTFORMAT':'GeoJSON'
                    ,'BBOX': bbox
                    ,'MAXFEATURES': 100
                };
                if( filter ){
                    wfsOptions['EXP_FILTER'] = filter;
                }

                getFeatureUrlData['url'] = OpenLayers.Util.urlAppend(lizUrls.wms
                        ,OpenLayers.Util.getParameterString(lizUrls.params)
                );
                getFeatureUrlData['options'] = wfsOptions;

                return getFeatureUrlData;
            }

            function getFeatureInfoForLayerFeature( aTable, aName, lonlat) {
                var parentLayerName = aTable.replace('#attribute-layer-table-', '').split('-');
                parentLayerName = parentLayerName[0];

                $('#attribute-table-panel-' + parentLayerName ).html('');
                var pixelxy = lizMap.map.getPixelFromLonLat( lonlat );
                var atConfig = config.attributeLayers[aName];
                var typeName = aName.replace(' ','_');

                var extent = lizMap.map.getExtent();
                var proj = new OpenLayers.Projection(atConfig.crs);
                var bbox = lizMap.map.getExtent().toBBOX();

                var layerName = lizMap.cleanName(parentLayerName);

                var wmsOptions = {
                    'SERVICE':'WMS'
                    ,'VERSION':'1.3.0'
                    ,'REQUEST':'GetFeatureInfo'
                    ,'LAYERS':typeName
                    ,'QUERY_LAYERS':typeName
                    ,'BBOX': bbox
                    ,'WIDTH': lizMap.map.size.w
                    ,'HEIGHT': lizMap.map.size.h
                    ,'INFO_FORMAT': 'text/html'
                    ,'FEATURE_COUNT': 1
                    ,x: pixelxy.x
                    ,y: pixelxy.y
                };
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

            function exportAttributeTable( aName, format='GeoJSON', filter=null ) {
                var getFeatureUrlData = getAttributeFeatureUrlData( aName, filter );
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


            lizMap.events.on({
                tablefeatureselected: function(evt) {
                    refreshChildrenLayersContent( evt.sourceTable, evt.featureType, evt.fid );
                }
            });


        } // uicreated
    });


}();

