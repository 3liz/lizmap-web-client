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
                            getAttributeTableFeature(lname);
                            $('#nav-tab-attribute-layer-' + lname + ' a' ).tab('show');
                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        );

                        // Bind click on refresh buttons
                        $('button.btn-refresh-attributeTable')
                        .click(function(){
                            var lname = attributeLayersDic[$(this).val()];
                            getAttributeTableFeature(lname);
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
                //~ $('#toggleAttributeLayers').parent().addClass('active');

                // Show attribute panel title
                //~ $('#attribute-table-panel').show();
                // Open attribute panel
                //~ showAttributeLayersPanel();
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
                //~ $('#toggleAttributeLayers').parent().removeClass('active');
                //~ hideAttributeLayersPanel();
                //~ $('#attribute-table-panel').hide();
                attributeLayersActive = false;
                var locatelayerSearch = lizMap.map.getLayersByName('locatelayer');
                if ( locatelayerSearch.length > 0 ) {
                    locatelayerSearch[0].destroyFeatures();
                }
                return false;
            }

            //~ function showAttributeLayersPanel(){
                //~ $('#attribute-table-panel').addClass('visible');
                //~ return false;
            //~ }
            //~ function hideAttributeLayersPanel(){
                //~ $('#attribute-table-panel').removeClass('visible');
                //~ return false;
            //~ }


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
                html+= '    <button class="btn-refresh-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.refresh.title']+'</button>';
                html+= '    <span class="attribute-layer-msg"></span>';
                html+= '    <table class="attribute-table-table table table-hover table-condensed"></table>';
                html+= '</div>';
                $('#attribute-table-container').append(html);


            }

            function getAttributeTableFeature(aName) {
                var dataLength = 0;

                config.attributeLayers[aName]['tableDisplayed'] = false;

                $('body').css('cursor', 'wait');

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
                // Query the server
                var service = OpenLayers.Util.urlAppend(lizUrls.wms
                        ,OpenLayers.Util.getParameterString(lizUrls.params)
                );
                $.get(service
                        ,wfsOptions
                        ,function(data) {

                    // Get features and build attribute table content
                    var lConfig = config.layers[aName];
                    atConfig['features'] = {};
                    var features = data.features;
                    dataLength = features.length;
                    var html = '';
                    if (dataLength > 0) {
                        config.attributeLayers[aName]['features'] = features;
                        html+= '<tr>';
                        for (var idx in features[0].properties){
                            html+='<th>' + idx + '</th>';
                        }
                        html+='<th></th>';
                        html+='</tr>';
                        for (var fid in features) {
                            html+='<tr>';
                            var feat = features[fid];
                            for (var idx in feat.properties){
                                var prop = feat.properties[idx];
                                html+='<td>' + prop + '</td>';
                            }
                            html+='<td><input type="hidden" value="'+fid+'"></td>';
                            html+='</tr>';
                        }
                        var aTable = '#attribute-layer-'+lizMap.cleanName(aName)+' table';

                        $(aTable).html(html);

                        // Zoom to selected feature on tr click
                        $(aTable +' tr').click(function() {
                            $(aTable + ' tr').removeClass('success');
                            $(this).addClass('success');

                            // Add the feature to the layer
                            var layer = lizMap.map.getLayersByName('locatelayer')[0];
                            layer.destroyFeatures();
                            var featId = $(this).find('input').val();
                            var feat = config.attributeLayers[aName]['features'][featId];
                            var format = new OpenLayers.Format.GeoJSON();
                            feat = format.read(feat)[0];
                            var proj = new OpenLayers.Projection(config.attributeLayers[aName].crs);
                            feat.geometry.transform(proj, lizMap.map.getProjection());
                            layer.addFeatures([feat]);

                            // Zoom to selected feature
                            //lizMap.map.zoomToExtent(feat.geometry.getBounds());
                            lizMap.map.setCenter(feat.geometry.getBounds().getCenterLonLat())

                            // Make the bottom box transparent during 1 s
                            $('#bottom-dock').addClass('half-transparent');
                            $(this).hover(function(){
                                $('#bottom-dock').removeClass('half-transparent');
                            });
                        });
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


        } // uicreated
    });


}();

