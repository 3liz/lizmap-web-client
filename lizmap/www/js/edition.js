var lizEdition = function() {

    var config = null;
    var layers = null;
    var map = null;
    var controls = null;

    // Map control for edition
    var editCtrls = null;

    // Edition layer data
    var editionLayer = {
        'id': null // QGIS layer id
        ,'config': null // QGIS layer name
        ,'spatial': null // If the layer is spatial or not
        ,'drawControl': null // draw control
        ,'submitActor': 'submit' // Which submit button has been clicked
    };

    // Edition type : createFeature or modifyFeature
    var editionType = null;

    // Edition message management
    var editionMessageTimeoutId = null;
    function cleanEditionMessage() {
        var $EditionMessage = $('#lizmap-edition-message');
        if ( $EditionMessage.length != 0 ) {
            $EditionMessage.remove();
        }
        editionMessageTimeoutId = null;
    }
    function addEditionMessage(aMessage, aType, aClose){
        if ( editionMessageTimeoutId ) {
            window.clearTimeout(editionMessageTimeoutId);
            editionMessageTimeoutId = null;
        }
        var $EditionMessage = $('#lizmap-edition-message');
        if ( $EditionMessage.length != 0 ) {
            $EditionMessage.remove();
        }
        lizMap.addMessage(aMessage, aType, aClose).attr('id','lizmap-edition-message');
        editionMessageTimeoutId = window.setTimeout(cleanEditionMessage, 5000);
    }

    function afterSpliting(evt) {
        var splitFeatures = evt.features;
        var geometryType = editionLayer['config'].geometryType;
        var removableFeat = null;
        if ( geometryType == 'line' ) {
            if ( splitFeatures[0].geometry.getLength() < splitFeatures[1].geometry.getLength() )
                removableFeat = splitFeatures[0];
            else
                removableFeat = splitFeatures[1];
        }
        else if ( geometryType == 'polygon' ) {
            if ( splitFeatures[0].geometry.getArea() < splitFeatures[1].geometry.getArea() )
                removableFeat = splitFeatures[0];
            else
                removableFeat = splitFeatures[1];
        }
        if ( removableFeat )
            editionLayer['ol'].removeFeatures( [removableFeat] );
        // Update form liz_wkt field from added geometry
        if ( editionLayer['ol'].features.length !=0 )
            updateGeometryColumnFromFeature( editionLayer['ol'].features[0] );
        $('#edition-geomtool-nodetool').click();
        return false;
    }

/**
 * Function: OpenLayers.Geometry.pointOnSegment
 * Note that the OpenLayers.Geometry.segmentsIntersect doesn't work with points
 *
 * Parameters:
 * point - {Object} An object with x and y properties representing the
 *     point coordinates.
 * segment - {Object} An object with x1, y1, x2, and y2 properties
 *     representing endpoint coordinates.
 *
 * Returns:
 * {Boolean} Returns true if the point is on the segment.
 */
OpenLayers.Geometry.pointOnSegment = function(point, segment) {
    // Is the point inside the BBox of the segment
    if(point.x < Math.min(segment.x1, segment.x2) || point.x > Math.max(segment.x1, segment.x2) ||
       point.y < Math.min(segment.y1, segment.y2) || point.y > Math.max(segment.y1, segment.y2))
    {
        return false;
    }

    // Avoid dividing by zero
    if( segment.x1 == segment.x2 || segment.y1 == segment.y2 ||
        (point.x == segment.x1 && point.y == segment.y1) ||
        (point.x == segment.x2 && point.y == segment.y2) )
    {
        return true;
    }

    // Is the point on the line
    if(((segment.x1 - point.x) / (segment.y1 - point.y)).toFixed(5) ==
       ((segment.x2 - point.x) / (segment.y2 - point.y)).toFixed(5))
    {
        return true;
    }

    return false;
};

    function deactivateDrawFeature() {
        $('#edition-point-coord-crs-layer').html(lizDict['edition.point.coord.crs.layer']).val('').hide();
        $('#edition-point-coord-crs-map').html(lizDict['edition.point.coord.crs.map']).val('').hide();
        $('#edition-point-coord-x').val('');
        $('#edition-point-coord-y').val('');
        if ( $('#edition-point-coord-geolocation').is(':checked') )
            $('#edition-point-coord-geolocation').click();
        $('#edition-point-coord-add').hide();
        $('#edition-point-coord-form').hide();
        $('#edition-point-coord-form-expander i').removeClass('icon-chevron-down').addClass('icon-chevron-right');
        $('#edition-point-coord-form-group').hide();

        if ( $('#geolocation-edition-group').length != 0 ) {
            $('#geolocation-edition-group input').attr('disabled','disabled').removeClass('active');
            $('#geolocation-edition-group button').attr('disabled','disabled').removeClass('active');
            $('#geolocation-edition-group').hide();
        }

        lizMap.events.triggerEvent("lizmapeditiondrawfeaturedeactivated",
            {
                'layerId': editionLayer['id'],
                'editionConfig': editionLayer['config']
            }
        );
    }

    function activateDrawFeature() {
        var eform = $('#edition-form-container form');
        var srid = eform.find('input[name="liz_srid"]').val();
        if ( srid != '' && !('EPSG:'+srid in Proj4js.defs) )
            Proj4js.defs['EPSG:'+srid] = eform.find('input[name="liz_proj4"]').val();
        $('#edition-point-coord-crs-layer').html(lizDict['edition.point.coord.crs.layer']+' - EPSG:'+srid).val(srid).show();

        var mapProjCode = editionLayer['ol'].projection.projCode;
        var mapSrid = mapProjCode.replace('EPSG:','');
        $('#edition-point-coord-crs-map').html(lizDict['edition.point.coord.crs.map']+' - EPSG:'+mapSrid).val(mapSrid).show();

        var geometryType = editionLayer['config'].geometryType;
        if ( geometryType == 'point' )
            $('#edition-point-coord-add').hide();
        else
            $('#edition-point-coord-add').show();
        $('#edition-point-coord-form').show();

        if ( $('#geolocation-edition-group').length != 0 ) {
            $('#geolocation-edition-group').show();
            if ( !$('#geolocation-center').attr('disabled') )
                $('#geolocation-edition-group input').removeAttr('disabled');
        }

        lizMap.events.triggerEvent("lizmapeditiondrawfeatureactivated",
            {
                'layerId': editionLayer['id'],
                'editionConfig': editionLayer['config']
            }
        );
    }

    function keyUpPointCoord() {
        var x = parseFloat($('#edition-point-coord-x').val());
        var y = parseFloat($('#edition-point-coord-y').val());
        if ( !isNaN(x) && !isNaN(y) ) {
            var vertex = new OpenLayers.Geometry.Point(x,y);
            // Get SRID and transform geometry
            var srid = $('#edition-point-coord-crs').val();
            vertex.transform( 'EPSG:'+srid, editionLayer['ol'].projection );
            var geometryType = editionLayer['config'].geometryType;
            if ( !editCtrls[geometryType].handler.point ) {
                var px = editCtrls[geometryType].handler.layer.getViewPortPxFromLonLat({lon:vertex.x,lat:vertex.y});
                editCtrls[geometryType].handler.createFeature(px);
                editCtrls[geometryType].handler.point.geometry.x = vertex.x;
                editCtrls[geometryType].handler.point.geometry.y = vertex.y;
                editCtrls[geometryType].handler.point.geometry.clearBounds();
            } else {
                editCtrls[geometryType].handler.point.geometry.x = vertex.x;
                editCtrls[geometryType].handler.point.geometry.y = vertex.y;
                editCtrls[geometryType].handler.point.geometry.clearBounds();
            }
            editCtrls[geometryType].handler.drawFeature();
        }
    }

    // Redraw layers
    function redrawLayers( layerId ) {
        var willBeRedrawnLayerIds = [layerId];

        //check relations
        if( 'relations' in config ) {
            for( var rx in config.relations ){
                // get children layer ids
                if( rx == layerId ) {
                    var layerRelations = config.relations[layerId];
                    for( var lid in layerRelations ) {
                        var relation = layerRelations[lid];
                        if ( $.inArray( relation.referencingLayer, willBeRedrawnLayerIds ) != -1 )
                            continue;
                        willBeRedrawnLayerIds.push( relation.referencingLayer );
                    }
                }
                // get pivot linked layer ids
                else if( rx == 'pivot' && layerId in config.relations.pivot) {
                    var pivotLayers = config.relations.pivot[layerId];
                    for( var pId in pivotLayers ) {
                        if ( $.inArray( pId, willBeRedrawnLayerIds ) != -1 )
                            continue;
                        willBeRedrawnLayerIds.push( pId );
                    }
                }
                // get parent layer id
                else {
                    if ( $.inArray( rx, willBeRedrawnLayerIds ) != -1 )
                        continue;
                    var layerRelations = config.relations[rx];
                    for( var lid in layerRelations ) {
                        var relation = layerRelations[lid];
                        if( relation.referencingLayer == layerId )
                            willBeRedrawnLayerIds.push( rx );
                    }
                }
            }
        }

        // Effectivly redraw layers
        var redrawnLayerIds = [];
        while( willBeRedrawnLayerIds.length > 0 ) {
            var lid = willBeRedrawnLayerIds.shift();
            var childLayerConfig = lizMap.getLayerConfigById(
                lid,
                config.layers,
                'id'
            );

            // if no config
            if( !childLayerConfig )
                continue;

            var qgisName = childLayerConfig[0];
            var childLayerConfig = childLayerConfig[1];

            if( !('geometryType' in childLayerConfig) || childLayerConfig.geometryType == 'none' )
                continue;

            var olLayer = map.getLayersByName( qgisName );
            if( olLayer.length == 0 )
                olLayer = map.getLayersByName( lizMap.cleanName( qgisName ) );
            if( olLayer.length == 0 )
                continue;

            olLayer = olLayer[0];
            if( !olLayer.getVisibility() )
                continue;

            redrawnLayerIds.push(childLayerConfig.id);
            olLayer.redraw(true);
        }
        return redrawnLayerIds;
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

    function finishEdition() {
        // Lift the constraint on edition
        lizMap.editionPending = false;

        // Deactivate edition map controls
        if( editCtrls ){
            if( editionLayer['drawControl'] && editionLayer['drawControl'].active )
                editionLayer['drawControl'].deactivate();
            $('#edition-geomtool-container button i').removeClass('line');
            $('#edition-geomtool-container').hide();
            editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
            editCtrls.modify.createVertices = true;
            editCtrls.panel.deactivate();
        }
        // Destroy edition layer features
        if( editionLayer['ol'] )
            editionLayer['ol'].destroyFeatures();

        // Set global object to default
        editionLayer['id'] = null;
        editionLayer['config'] = null;
        editionLayer['spatial'] = null;
        editionLayer['drawControl'] = null;

        // Remove messages
        $('#lizmap-edition-message').remove();

        // Empty and hide tables
        $('#edition-children-container').hide().html('');

        // Empty and hide form and tools
        $('#edition-form-container').hide().html('');
        $('#edition-waiter').hide();

        // Display create tools back if there are eligible layers
        if( $('#edition-layer').html().trim() != '' ){
            $('#edition-layer').show();
            $('#edition-draw').removeClass('disabled').show();
        }else{
            $('#dock-close').click();
            $('#button-edition').hide();
        }

        // Redraw bottom dock
        $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
    }

    function addEditionControls() {
        // Edition layers
        if ('editionLayers' in config) {
            //initialize edition
            var service = OpenLayers.Util.urlAppend(lizUrls.edition
                ,OpenLayers.Util.getParameterString(lizUrls.params)
            );

            // fill in the combobox containing editable layers
            var hasCreateLayers = false;
            var elconfig = {};
            var elk = [];
            for (var alName in config.editionLayers) {
                var al = config.editionLayers[alName];
                if (
                    al.capabilities.createFeature == "False"
                 && al.capabilities.modifyAttribute == "False"
                 && al.capabilities.deleteFeature == "False"
                 && al.capabilities.modifyGeometry == "False"
                 ) {
                    delete config.editionLayers[alName];
                    continue;
                }

                if (
                    alName in config.layers
                    && al.capabilities.createFeature == "True"
                ) {
                    hasCreateLayers = true;
                    var alConfig = config.layers[alName];
                    elconfig[al.order] = {
                       id: alConfig.id,
                        title: alConfig.title,
                        order: al.order
                    };
                    elk.push(al.order);
                }
            }
            // Sort by order (int)
            elk.sort(function (a, b) {
                return a - b;
            });
            for ( var i in elk ) {
                var alConfig = elconfig[elk[i]];
                $('#edition-layer').append('<option value="'+alConfig.id+'">'+alConfig.title+'</option>');
            }
            if( hasCreateLayers ){
                $('#edition-layer').prop("disabled", false).show();
                $('#edition-draw').removeClass('disabled').show();
            }
            else{
                $('#button-edition').hide();
                $('#edition-layer').prop("disabled", true).hide();
                $('#edition-draw').addClass('disabled').hide();
            }

            // initiatlize layer
            // style the sketch fancy
            var sketchSymbolizers = {
                "Point": {
                    pointRadius: 6
                },
                "Line": {
                    strokeWidth: 4
                },
                "Polygon": {
                    strokeWidth: 2
                }
            };
            var style = new OpenLayers.Style();
            style.addRules([
                new OpenLayers.Rule({symbolizer: sketchSymbolizers})
            ]);
            var styleMap = new OpenLayers.StyleMap({"default": style});
            var editLayer = new OpenLayers.Layer.Vector('editLayer',{styleMap:styleMap});

            editionLayer['ol'] = editLayer;
            map.addLayer(editLayer);

            // initialize controls
            editCtrls = {
                panel: new OpenLayers.Control({
                    type: OpenLayers.Control.TYPE_TOOL,
                    eventListeners: {
                        activate: function( evt ) {
                            lizMap.deactivateToolControls( evt );
                            if ( lizMap.controls.featureInfo !== null )
                                lizMap.controls.featureInfo.deactivate();
                        },
                        deactivate: function( evt ) {
                            for ( var c in editCtrls ) {
                                if ( c != 'panel' && editCtrls[c].active )
                                    editCtrls[c].deactivate();
                            }
                            if ( lizMap.controls.featureInfo !== null )
                                lizMap.controls.featureInfo.activate();
                        }
                    }
                }),
                point: new OpenLayers.Control.DrawFeature(editLayer,
                     OpenLayers.Handler.Point,{
                        eventListeners: {
                            activate: activateDrawFeature,
                            deactivate: deactivateDrawFeature
                        }
                     }),
                line: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Path,{
                        eventListeners: {
                            activate: activateDrawFeature,
                            deactivate: deactivateDrawFeature
                        }
                     }),
                polygon: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Polygon,{
                        eventListeners: {
                            activate: activateDrawFeature,
                            deactivate: deactivateDrawFeature
                        }
                     }),
                modify: new OpenLayers.Control.ModifyFeature(editLayer),
                split: new OpenLayers.Control.Split({layer:editLayer,eventListeners: {aftersplit:afterSpliting}})
            };
            for ( var ctrl in editCtrls ) {
                if ( ctrl != 'panel' )
                    editCtrls[ctrl].events.on({
                        activate: function( evt ){
                            evt.object.layer.setVisibility(true);
                        },
                        deactivate: function( evt ){
                            evt.object.layer.setVisibility(false);
                        }
                    });
                map.addControls([editCtrls[ctrl]]);
            }
            controls['edition'] = editCtrls.panel;


            // edit layer events
            editLayer.events.on({

                featureadded: function(evt) {
                    // Deactivate draw control
                    if( !editCtrls )
                        return false;
                    var geometryType = editionLayer['config'].geometryType;
                    var drawWasActivated = editCtrls[geometryType].active;
                    if (drawWasActivated)
                        editCtrls[geometryType].deactivate();

                    // Get feature
                    var feat = editionLayer['ol'].features[0];

                    // Update form liz_wkt field from added geometry
                    updateGeometryColumnFromFeature( feat );

                    // Activate modify control
                    if (drawWasActivated || editionLayer['config'].capabilities.modifyGeometry == "True"){
                        // activate edition
                        editCtrls.panel.activate();
                        // then modify
                        editCtrls.modify.activate();
                        $('#edition-geomtool-nodetool').click();
                        editCtrls.modify.selectFeature( feat );
                        if (geometryType == 'line')
                            $('#edition-geomtool-container button i').addClass('line');
                        if (geometryType != 'point')
                            $('#edition-geomtool-container').show();
                    }

                    // Inform user he can now modify
                    addEditionMessage(lizDict['edition.select.modify.activate'],'info',true);

                    var btn = $('#button-edition');
                    var dockVisible = btn.parent().hasClass('active');
                    if( lizMap.checkMobile() && !dockVisible ){
                        btn.click();
                    }

                },

                featuremodified: function(evt) {
                    if ( evt.feature.geometry == null )
                        return;
                    // Update form liz_wkt field from added geometry
                    updateGeometryColumnFromFeature( evt.feature );

                },

                featureselected: function(evt) {
                    if ( evt.feature.geometry == null )
                        return;

                },

                featureunselected: function(evt) {
                    if ( evt.feature.geometry == null )
                        return;
                    updateGeometryColumnFromFeature( evt.feat )
                },

                sketchmodified: function(evt) {
                    var vertex = evt.vertex.clone();
                    // Get SRID and transform geometry
                    var srid = $('#edition-point-coord-crs').val();
                    vertex.transform( editionLayer['ol'].projection,'EPSG:'+srid );
                    if ( !$('#edition-point-coord-x').attr('disabled') )
                        $('#edition-point-coord-x').val(vertex.x);
                    if ( !$('#edition-point-coord-y').attr('disabled') )
                        $('#edition-point-coord-y').val(vertex.y);
                },

                vertexmodified: function(evt) {
                }
            });

            $('#edition-draw').click(function(){
                // Do nothing if not enabled
                if ( $(this).hasClass('disabled') )
                    return false;
                // Deactivate previous edition
                if( lizMap.editionPending){
                    if ( !confirm( lizDict['edition.confirm.cancel'] ) )
                        return false;
                    finishEdition();
                }

                // activate edition
                editCtrls.panel.activate();
                // Get layer id and set global property
                editionLayer['id'] = $('#edition-layer').val();

                // Launch edition to gather edition layer info
                // Use callback to activate draw control only when form displayed
                launchEdition( editionLayer['id'], null);
                if( !editionLayer['id'] )
                    return false;

                return false;
            });

            $('#edition-point-coord-form').submit(function(){
                return false;
            });
            $('#edition-point-coord-form-expander').click(function(){
                var chevron = $('#edition-point-coord-form-expander i');
                if ( chevron.hasClass('icon-chevron-right') ) {
                    chevron.removeClass('icon-chevron-right').addClass('icon-chevron-down');
                    $('#edition-point-coord-form-group').show();
                } else {
                    chevron.removeClass('icon-chevron-down').addClass('icon-chevron-right');
                    $('#edition-point-coord-form-group').hide();
                }
                return false;
            });
            $('#edition-point-coord-crs').change(function(){
                var geometryType = editionLayer['config'].geometryType;
                var vertex = editCtrls[geometryType].handler.point.geometry.clone();
                // Get SRID and transform geometry
                var srid = $(this).val();
                vertex.transform( editionLayer['ol'].projection,'EPSG:'+srid );
                $('#edition-point-coord-x').val(vertex.x);
                $('#edition-point-coord-y').val(vertex.y);
            });
            $('#edition-point-coord-x').keyup(keyUpPointCoord);
            $('#edition-point-coord-y').keyup(keyUpPointCoord);
            $('#edition-point-coord-geolocation').change(function(){
                if ( $(this).is(':checked') ) {
                    $('#edition-point-coord-x').attr('disabled','disabled');
                    $('#edition-point-coord-y').attr('disabled','disabled');
                    if ( lizMap.controls.geolocation.layer.features.length != 0 ) {
                        var geometryType = editionLayer['config'].geometryType;
                        var vertex = lizMap.controls.geolocation.layer.features[0].geometry;
                        var px = editCtrls[geometryType].handler.layer.getViewPortPxFromLonLat({lon:vertex.x,lat:vertex.y});
                        editCtrls[geometryType].handler.modifyFeature(px);
                    }
                } else {
                    $('#edition-point-coord-x').removeAttr('disabled');
                    $('#edition-point-coord-y').removeAttr('disabled');
                }
            });
            $('#edition-point-coord-add').click(function(){
                var geometryType = editionLayer['config'].geometryType;
                if ( geometryType != 'point' ) {
                    var node = editCtrls[geometryType].handler.point.geometry;
                    editCtrls[geometryType].handler.insertXY(node.x, node.y);
                }
            });
            $('#edition-point-coord-submit').click(function(){
                var geometryType = editionLayer['config'].geometryType;
                if ( geometryType == 'point' ) {
                    editCtrls[geometryType].handler.finalize();
                } else {
                    editCtrls[geometryType].handler.finishGeometry();
                }
            });

            $('#edition-geomtool-nodetool').click(function(){
                editCtrls.split.deactivate();
                editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                editCtrls.modify.createVertices = true;
                editCtrls.modify.activate();
                if ( editionLayer['ol'].features.length != 0 ) {
                    var feat = editionLayer['ol'].features[0];
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                    editCtrls.modify.selectFeature( feat );
                }
            });
            $('#edition-geomtool-drag').click(function(){
                editCtrls.split.deactivate();
                editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.DRAG;
                editCtrls.modify.createVertices = false;
                editCtrls.modify.activate();
                if ( editionLayer['ol'].features.length != 0 ) {
                    var feat = editionLayer['ol'].features[0];
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                    editCtrls.modify.selectFeature( feat );
                }
            });
            $('#edition-geomtool-rotate').click(function(){
                editCtrls.split.deactivate();
                editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.ROTATE;
                editCtrls.modify.createVertices = false;
                editCtrls.modify.activate();
                if ( editionLayer['ol'].features.length != 0 ) {
                    var feat = editionLayer['ol'].features[0];
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                    editCtrls.modify.selectFeature( feat );
                }
            });
            $('#edition-geomtool-reshape').click(function(){
                if ( editionLayer['ol'].features.length != 0 ) {
                    var feat = editionLayer['ol'].features[0];
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                }
                editCtrls.modify.deactivate();
                editCtrls.split.activate();
            });

            $('#edition-geomtool-container button').tooltip( {
                placement: 'top'
            } );

            //geolocation
            if ( 'geolocation' in lizMap.controls ) {
                $('#edition-point-coord-geolocation').attr('disabled','disabled');
                lizMap.controls.geolocation.events.on({
                    "locationupdated": function(evt) {
                        if ( editionLayer.config ) {
                            $('#edition-point-coord-geolocation').removeAttr('disabled');
                            var geometryType = editionLayer['config'].geometryType;
                            if ( $('#edition-point-coord-geolocation').is(':checked') ) {
                                if ( editCtrls[geometryType].active ) {
                                    var vertex = evt.point;
                                    var px = editCtrls[geometryType].handler.layer.getViewPortPxFromLonLat({lon:vertex.x,lat:vertex.y});
                                    editCtrls[geometryType].handler.modifyFeature(px);
                                }
                            }
                            if ( $('#geolocation-edition-group').length != 0 ) {
                                $('#geolocation-edition-group').show();
                                $('#geolocation-edition-group input').removeAttr('disabled');
                                if ( geometryType == 'point' )
                                    $('#geolocation-edition-add').hide();
                                else
                                    $('#geolocation-edition-add').show();
                            }
                        } else if ( $('#geolocation-edition-group').length != 0 ) {
                            $('#geolocation-edition-group input').attr('disabled','disabled').removeClass('active');
                            $('#geolocation-edition-group button').attr('disabled','disabled').removeClass('active');
                            $('#geolocation-edition-group').hide();
                        }
                    },
                    "activate": function(evt) {
                        $('#edition-point-coord-geolocation-group').show();
                        if ( $('#geolocation-edition-group').length != 0 && editionLayer.config )
                            $('#geolocation-edition-group').show();
                    },
                    "deactivate": function(evt) {
                        if ( $('#edition-point-coord-geolocation').is(':checked') )
                            $('#edition-point-coord-geolocation').click();
                        $('#edition-point-coord-geolocation').attr('disabled','disabled');
                        $('#edition-point-coord-geolocation-group').hide();
                        if ( $('#geolocation-edition-group').length != 0 ) {
                            $('#geolocation-edition-group input').attr('disabled','disabled').removeClass('active');
                            $('#geolocation-edition-group button').attr('disabled','disabled').removeClass('active');
                            $('#geolocation-edition-group').hide();
                        }
                    }
                });

                if ( $('#geolocation-edition-group').length != 0 ) {
                    $('#geolocation-edition-linked').change(function(){
                        if ( $(this).is(':checked') ) {
                            if ( !$('#edition-point-coord-geolocation').is(':checked') )
                                $('#edition-point-coord-geolocation').click();
                            $('#geolocation-edition-group button').removeAttr('disabled');
                        } else {
                            if ( $('#edition-point-coord-geolocation').is(':checked') )
                                $('#edition-point-coord-geolocation').click();
                            $('#geolocation-edition-group button').attr('disabled','disabled').removeClass('active');
                        }
                    });
                    $('#edition-point-coord-geolocation').change(function(){
                        if ( $(this).is(':checked') != $('#geolocation-edition-linked').is(':checked') )
                            $('#geolocation-edition-linked').click();
                    });
                    $('#geolocation-edition-add').click(function() {
                        $('#edition-point-coord-add').click();
                    });
                    $('#geolocation-edition-submit').click(function() {
                        $('#edition-point-coord-submit').click();
                    });
                }
            }

        } else {
            $('#edition').parent().remove();
            $('#button-edition').remove();
            $('#edition-form-container').hide();
        }
    }

    function cancelEdition(){
        // Deactivate previous edition
        finishEdition();

        // back to parent
        if ( editionLayer['parent'] != null && editionLayer['parent']['backToParent']) {
            var parentInfo = editionLayer['parent'];
            var parentLayerId = parentInfo['layerId'];
            var parentFeat = parentInfo['feature'];
            launchEdition( parentLayerId, parentFeat.id.split('.').pop(), parentInfo['parent'], function(editionLayerId, editionFeatureId){
                $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
            });
        } else {
            // trigger edition form closed
            lizMap.events.triggerEvent(
                'lizmapeditionformclosed'
            );
        }
    }

    // Start edition of a new feature or an existing one
    function launchEdition( aLayerId, aFid, aParent, aCallback ) {
        // Get parent relation
        var parentInfo = null;
        if ( aParent != null && ('layerId' in aParent) && ('feature' in aParent) ) {
            var parentLayerId = aParent['layerId'];
            var parentFeat = aParent['feature'];
            if( 'relations' in config &&
                parentLayerId in config.relations ) {
                var relation = getRelationInfo(parentLayerId,aLayerId);
                if (relation != null &&
                    relation.referencingLayer == aLayerId) {
                        parentInfo = {
                            'layerId': parentLayerId,
                            'feature': parentFeat,
                            'relation': relation,
                            'backToParent': false,
                            'parent': null
                        }
                    if ( lizMap.editionPending && editionLayer['id'] == parentLayerId ) {
                        var formFeatureId = $('#edition-form-container form input[name="liz_featureId"]').val();
                        var formLayerId = $('#edition-form-container form input[name="liz_layerId"]').val();
                        if (formLayerId == parentLayerId && formFeatureId == parentFeat.id.split('.').pop()) {
                            parentInfo['backToParent'] = true;
                            parentInfo['parent'] = editionLayer['parent'];
                            finishEdition();
                        }
                    }
                }
            }
        }

        // Deactivate previous edition
        if( lizMap.editionPending ){
            if ( !confirm( lizDict['edition.confirm.cancel'] ) )
                return false;
            finishEdition();
        }
        lizMap.editionPending = true;

        editionLayer['id'] = null;
        editionLayer['config'] = null;
        editionLayer['spatial'] = null;
        editionLayer['drawControl'] = null;
        editionLayer['ol'] = null;
        editionLayer['parent'] = null;

        // Check if edition is configured in lizmap
        if ( !('editionLayers' in config) )
                return false;

        // Get OpenLayers edition layer
        var editLayer = map.getLayersByName( 'editLayer' );
        if ( editLayer.length == 0 )
                return false;
        editLayer = editLayer[0];
        editLayer.destroyFeatures();
        editionLayer['ol'] = editLayer;

        // Get edition map controls
        if( !editCtrls )
            return false;

        // Initialize edition data
        var getLayer = lizMap.getLayerConfigById( aLayerId, config.editionLayers, 'layerId' );
        if( !getLayer )
            return false;
        editionLayer['id'] = aLayerId;
        editionLayer['config'] = getLayer[1];

        // Check if layer is spatial
        var geometryType = editionLayer['config'].geometryType;
        if( geometryType in editCtrls ){
            editionLayer['spatial'] = true;
            editionLayer['drawControl'] = editCtrls[geometryType];
        }

        // save parent info even if it's null
        editionLayer['parent'] = parentInfo;

        // Get form and display it
        getEditionForm( aFid, aCallback );

        // Hide bottom dock
        $('#bottom-dock').trigger('mouseleave');

        return true;
    }

    /*
     * Get edition form from service
     * @param featureId Feature id to edit : in null-> create feature
     */
    function getEditionForm( featureId, aCallback ){

        $('#edition-waiter').show();
        $('#edition-form-container').hide();

        // Get edition type
        var action = 'modifyFeature';
        if( !featureId )
            action = 'createFeature';
        editionType = action;

        // Deactivate previous form
        var originalForm = $('#edition-form-container form');
        if ( originalForm.length != 0 ) {
            originalForm.unbind('submit');
        }

        // Get form via web service
        var service = OpenLayers.Util.urlAppend(lizUrls.edition
            ,OpenLayers.Util.getParameterString(lizUrls.params)
        );
        $.get(service.replace('getFeature', action),{
            layerId: editionLayer['id'],
            featureId: featureId
        }, function(data){

            // Display the form
            displayEditionForm( data );

            // Activate some controls
            if( !editCtrls )
                return false;
            if ( !editionLayer['id'] )
                return false;

            // Hide drawfeature controls : they will go back when finishing edition or canceling
            $('#edition-layer').hide();
            $('#edition-draw').addClass('disabled').hide();

            if( aCallback )
                aCallback( editionLayer['id'], featureId );

        });
    }

    /*
     * Activate combobox widget
     *
     */
    function activateCombobox( selectCombobox ){
        selectCombobox.combobox({
            "minLength": 1,
            "position": { my : "left bottom", position: "flip" },
            "selected": function(evt, ui){
              if ( ui.item ) {
                var self = $(this);
                var uiItem = $(ui.item);
                window.setTimeout(function(){
                  self.val(uiItem.val()).change();
                }, 1);
              }
            }
        });
        selectCombobox.parent().find('span > input')
            .removeClass('label ui-corner-left ui-state-default ui-widget-content ui-widget');
    }

    /*
     * Activate autocomplete widget
     *
     */
    function activateAutocomplete( selectAutocomplete ){
        var wrapper = $( "<span>" )
            .addClass( "custom-autocomplete" )
            .insertAfter( selectAutocomplete );
        var selected = selectAutocomplete.children( ":selected" ),
            value = selected.val() ? selected.text() : "";
        var input = $( "<input>" )
            .appendTo( wrapper )
            .val( value )
            .attr( "title", "" )
            .addClass( "custom-autocomplete-input" )
            .autocomplete({
              source: function( request, response ) {
                  var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
                  response( selectAutocomplete.children( "option" ).map(function() {
                    var text = $( this ).text();
                    if ( this.value && ( !request.term || matcher.test(text) ) )
                      return {
                        label: text,
                        value: text,
                        option: this
                      };
                  }) );
                }
            });
        input.autocomplete( "widget" ).css("z-index","1050");
        input.attr('name', selectAutocomplete.attr('name'));
        selectAutocomplete.attr('name', input.attr('name')+'_source');
        selectAutocomplete.hide();
    }

    /*
     * Display the edition form
     *
     */
    function displayEditionForm( data ){
        // Firstly does the edition-form-container already has a form ?
        var oldSerializeArray = $('#edition-form-container form').serializeArray();

        // Add data
        $('#edition-form-container').html(data);
        var form = $('#edition-form-container form');

        // Response contains a form
        if ( form.length != 0 ) {
            var newSerializeArray = $('#edition-form-container form').serializeArray();

            // Get edition type from form data
            var formFeatureId = form.find('input[name="liz_featureId"]').val();
            if ( formFeatureId != '' )
                editionType = 'modifyFeature';
            else
                editionType = 'createFeature';

            // Keep a copy of original geometry data
            if( editionLayer['spatial'] && editionType == 'modifyFeature' ){
                var gColumn = form.find('input[name="liz_geometryColumn"]').val();
                if( gColumn != '' ){
                    var originalGeom = form.find('input[name="'+gColumn+'"]').val();
                    $('#edition-hidden-form input[name="liz_wkt"]').val( originalGeom );
                }
            }

            // Manage child form
            if ( editionLayer['parent'] != null ){
                var parentInfo = editionLayer['parent'];
                var parentFeat = parentInfo['feature'];
                var relation = parentInfo['relation'];
                var select = $('#edition-form-container form select[name="'+relation.referencingField+'"]');
                if( select.length == 1 ){
                    select.val(parentFeat.properties[relation.referencedField])
                          .attr('disabled','disabled');
                    var hiddenInput = $('<input type="hidden"></input>')
                        .attr('id', select.attr('id')+'_hidden')
                        .attr('name', relation.referencingField)
                        .attr('value', parentFeat.properties[relation.referencedField]);
                    $('#edition-form-container form div.jforms-hiddens').append(hiddenInput);
                    jFormsJQ.getForm($('#edition-form-container form').attr('id'))
                        .getControl(relation.referencingField)
                        .required=false;
                } else {
                    var input = $('#edition-form-container form input[name="'+relation.referencingField+'"]');
                    if( input.length == 1 && input.attr('type') != 'hidden'){
                        input.val(parentFeat.properties[relation.referencedField])
                              .attr('disabled','disabled');
                        var hiddenInput = $('<input type="hidden"></input>')
                            .attr('id', input.attr('id')+'_hidden')
                            .attr('name', relation.referencingField)
                            .attr('value', parentFeat.properties[relation.referencedField]);
                        $('#edition-form-container form div.jforms-hiddens').append(hiddenInput);
                        jFormsJQ.getForm($('#edition-form-container form').attr('id'))
                            .getControl(relation.referencingField)
                            .required=false;
                    }
                    else
                        input.val(parentFeat.properties[relation.referencedField]);
                }
            }

            // Create combobox based on RelationValue with fieldEditable
            var selectComboboxes = $('#edition-form-container form select.combobox');
            for( var i=0, len=selectComboboxes.length; i<len; i++ ) {
                var selectCombobox = $(selectComboboxes[i]);
                activateCombobox(selectCombobox);
            }
            var selectAutocompletes = $('#edition-form-container form select.autocomplete');
            for( var i=0, len=selectAutocompletes.length; i<len; i++ ) {
                var selectAutocomplete = $(selectAutocompletes[i]);
                activateAutocomplete(selectAutocomplete);
            }

            // If the form has been reopened after a successful save, refresh data
            var formStatus = form.find('input[name="liz_status"]').val();
            if( formStatus == '0' ) {
                if ( oldSerializeArray.length != 0 ){
                    var layerId = editionLayer['id'];

                    // Trigger event
                    var ev = 'lizmapeditionfeaturecreated';
                    if( editionType == 'modifyFeature' )
                        ev = 'lizmapeditionfeaturemodified';

                    lizMap.events.triggerEvent(
                        ev,
                        { 'layerId': layerId}
                    );

                    // Redraw layers
                    redrawLayers( layerId );
                }

                var geometryType = editionLayer['config'].geometryType;
                // Creation
                if( editionType == 'createFeature' ){

                    // Activate drawFeature control only if relevant
                    if( editionLayer['config'].capabilities.createFeature == "True"
                    && geometryType in editCtrls ){
                        $('#edition-geomtool-container button i').removeClass('line');
                        $('#edition-geomtool-container').hide();
                        editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                        editCtrls.modify.createVertices = true;
                        editCtrls.modify.deactivate();
                        editionLayer['ol'].destroyFeatures();
                        var ctrl = editCtrls[geometryType];
                        if ( ctrl.active ) {
                            return false;
                        } else {
                            ctrl.activate();

                            addEditionMessage(lizDict['edition.draw.activate'],'info',true);
                        }
                    }
                }
                // Modification
                else{
                    // Activate modification control
                    if ( editionLayer['config'].capabilities.modifyGeometry == "True"
                    && geometryType in editCtrls ){
                        // Need to get geometry from form and add feature to the openlayer layer
                        var feat = updateFeatureFromGeometryColumn();
                        if( feat ){
                            editCtrls.modify.activate();
                            $('#edition-geomtool-nodetool').click();
                            editCtrls.modify.selectFeature( feat );
                            if (geometryType == 'line')
                                $('#edition-geomtool-container button i').addClass('line');
                            if (geometryType != 'point')
                                $('#edition-geomtool-container').show();
                        }
                    }

                    addEditionMessage(lizDict['edition.select.modify.activate'],'info',true);
                }
            }


            // Activate form tabs based on QGIS drag&drop form layout mode
            $('#edition-form-container form > ul.nav-tabs li:first a').click().blur();
            $('#'+$('#edition-form-container form').attr('id')+'_liz_future_action_label').removeClass('control-label');

            // Handle JS events on form (submit, etc.)
            handleEditionFormSubmit( form );

            // Send signal
            lizMap.events.triggerEvent("lizmapeditionformdisplayed",
                {
                    'layerId': editionLayer['id'],
                    'featureId': formFeatureId,
                    'editionConfig': editionLayer['config']
                }
            );

        }

        // Else it means no form has been sent back
        // We consider it was a successful edition with no option to reopen the form
        if ( form.length == 0 ) {
            controls['edition'].deactivate();
            controls['edition'].activate();
            var layerId = editionLayer['id'];

            // Trigger event
            var ev = 'lizmapeditionfeaturecreated';
            if( editionType == 'modifyFeature' )
                ev = 'lizmapeditionfeaturemodified';
            lizMap.events.triggerEvent(ev,
                { 'layerId': layerId}
            );

            // Redraw layers
            redrawLayers( layerId );
            // Deactivate edition
            finishEdition();

            // Display message via JS
            if ( data != '' )
                addEditionMessage( data, 'info', true);

        }

        $('#edition-form-container').show();
        $('#edition-waiter').hide();

        // Show the dock if needed
        var btn = $('#button-edition');
        var dockVisible = btn.parent().hasClass('active');

        if (form.length != 0) {
            $('#button-edition').show();
            if( !lizMap.checkMobile() ){
                if ( !dockVisible )
                    btn.click();
            }else{
                if ( dockVisible )
                    btn.click();
            }
        }

        // Hide popup
        if( $('#liz_layer_popup_close').length )
            $('#liz_layer_popup_close').click();
        if( $('#mapmenu .nav-list > li.popupcontent > a').length ){
            if( $('#mapmenu .nav-list > li.popupcontent').hasClass('active') ){
                $('#button-popupcontent').click();
                $('div.lizmapPopupContent').remove();
            }
        }

        // back to parent
        if ( form.length == 0 && editionLayer['parent'] != null && editionLayer['parent']['backToParent']) {
            var parentInfo = editionLayer['parent'];
            var parentLayerId = parentInfo['layerId'];
            var parentFeat = parentInfo['feature'];
            launchEdition( parentLayerId, parentFeat.id.split('.').pop(), parentInfo['parent'], function(editionLayerId, editionFeatureId){
                $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
            });
        } else if ( form.length == 0 ) {
            // trigger edition form closed
            lizMap.events.triggerEvent(
                'lizmapeditionformclosed'
            );
        }

        // Redraw bottom dock
        $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
    }

    function handleEditionFormSubmit( form ){
        // Detect click on submit buttons
        editionLayer['submitActor'] = 'submit';
        form.find('input[type="submit"]').click(function(evt){
            var subprefix = form.attr('id') + '_' + '_submit' + '_';
            var submitActor = $(this).attr('id').replace(subprefix, '');
            editionLayer['submitActor'] = submitActor;

            // Confirm the use of the cancel button
            if ( submitActor == 'cancel' ) {
                evt.stopPropagation();
                if ( confirm( lizDict['edition.confirm.cancel'] ) )
                    displayEditionForm( '' );
                return false;
            }
        });

        // If needed, copy the geometry from the openlayer feature
        if(
            editionLayer['spatial']
            && editionLayer['ol']
            && editionLayer['ol'].features.length != 0
        ){
            var feat = editionLayer['ol'].features[0];
            updateGeometryColumnFromFeature( feat );
        }

        // Handle file uploads
        if ( form.attr('enctype') == 'multipart/form-data' ){
            form.submit(function(evt) {
                // Jelix checks
                var submitOk = jFormsJQ._submitListener(evt);
                if (!submitOk)
                    return false;
                // Additionnal checks
                var msg = checkFormBeforeSubmit(evt);
                // Edition has been canceled
                if(!msg)
                    return false;
                // Some client side errors have been detected in form
                if( msg != 'ok' ){
                    addEditionMessage( msg, 'info', true);
                    return false;
                }

                var fileInputs = form.find('input[type="file"]');
                fileInputs = fileInputs.filter( function( i, e ) {
                    return $(e).val() != "";
                });
                $('#edition-waiter').show();
                if ( fileInputs.length != 0 ) {
                    form.fileupload({
                        dataType: 'html',
                        done: function (e, data) {
                            displayEditionForm( data.result );
                        }
                    });
                    form.fileupload('send', {fileInput:fileInputs});
                } else {
                    $.post(form.attr('action'),
                        form.serialize(),
                        function(data) {
                            displayEditionForm( data );
                        });
                }
                return false;
            });
        }
        else{
            form.submit(function(evt) {
                // Jelix check
                var submitOk = jFormsJQ._submitListener(evt);
                if (!submitOk)
                    return false;
                // Additionnal checks
                var msg = checkFormBeforeSubmit(evt);
                // Edition has been canceled
                if(!msg){
                    return false;
                }
                // Some client side errors have been detected in form
                if( msg != 'ok' ){
                    addEditionMessage( msg, 'info', true);
                    return false;
                }
                $('#edition-waiter').show();
                var formser =
                $.post(form.attr('action'),
                    form.serialize(),
                    function(data) {
                        displayEditionForm( data );
                    });
                return false;
            });
        }
    }

    // Perform some additionnal checking on form
    function checkFormBeforeSubmit(){
        var form = $('#edition-form-container form');

        // Cancel edition if this submit button has been used
        if(editionLayer['submitActor'] == 'cancel'){
            cancelEdition();
            return false;
        }

        // Set submit button value
        var submit_hidden_id = form.attr('id') + '_' + '_submit';
        $('#' + submit_hidden_id).val(editionLayer['submitActor']);

        var msg = 'ok';
        if( editionLayer['spatial'] && editionLayer['config'].capabilities.modifyGeometry == 'True'){

            var gColumn = form.find('input[name="liz_geometryColumn"]').val();
            var formGeom = form.find('input[name="'+gColumn+'"]').val();
            if( formGeom.trim() == '' ){
                msg = lizDict['edition.message.error.no.geometry'];
            }

        }
        return msg;
    }

    function updateGeometryColumnFromFeature( feat ){

        if( feat.geometry == null  )
            return false;

        // Get editLayer
        var editLayer = editionLayer['ol'];
        if ( !editLayer )
            return false;

        // Clone passed geometry
        var geom = feat.geometry.clone();

        // Get SRID and transform geometry
        var eform = $('#edition-form-container form');
        var srid = eform.find('input[name="liz_srid"]').val();
        if ( srid != '' && !('EPSG:'+srid in Proj4js.defs) )
            Proj4js.defs['EPSG:'+srid] = eform.find('input[name="liz_proj4"]').val();
        geom.transform( editionLayer['ol'].projection,'EPSG:'+srid );

        // Get edition datasource geometry column name
        var gColumn = eform.find('input[name="liz_geometryColumn"]').val();

        // Set hidden geometry field
        eform.find('input[name="'+gColumn+'"]').val(geom);
        // dispatch event
        var formFeatureId = eform.find('input[name="liz_featureId"]').val();
        var formLayerId = eform.find('input[name="liz_layerId"]').val();
        lizMap.events.triggerEvent("lizmapeditiongeometryupdated",
            {
                'layerId': formLayerId,
                'featureId': formFeatureId,
                'geometry': geom,
                'srid': srid
            }
        );
        return true;
    }

    function updateFeatureFromGeometryColumn(){

        var feat = null;

        // Get editLayer
        var editLayer = editionLayer['ol'];
        if ( !editLayer )
            return false;

        // Get form
        var eform = $('#edition-form-container form');

        // Get edition datasource geometry column name
        var gColumn = eform.find('input[name="liz_geometryColumn"]').val();

        var srid = eform.find('input[name="liz_srid"]').val();
        if ( srid != '' && !('EPSG:'+srid in Proj4js.defs) )
            Proj4js.defs['EPSG:'+srid] = eform.find('input[name="liz_proj4"]').val();

        var feat = null;
        if ( gColumn != '' ) {
            var wkt = eform.find('input[name="'+gColumn+'"]').val();
            var format = new OpenLayers.Format.WKT({
                externalProjection: 'EPSG:'+srid,
                internalProjection: editionLayer['ol'].projection
            });
            feat = format.read(wkt);
        } else
            feat = new OpenLayers.Feature.Vector( );
        feat.fid = eform.find('input[name="liz_featureId"]').val();
        editionLayer['ol'].destroyFeatures();
        editionLayer['ol'].addFeatures([feat]);

        return feat;

    }


    function deleteEditionFeature( aLayerId, aFeatureId, aMessage, aCallback ){
        // Edition layers
        if ( !('editionLayers' in config) )
            return false;

        var eConfig = lizMap.getLayerConfigById(
            aLayerId,
            config.editionLayers,
            'layerId'
        );
        if ( !eConfig || eConfig[1].capabilities.deleteFeature == "False" )
            return false;
        var aName = eConfig[0];
        var configLayer = config.layers[aName];
        var typeName = eConfig[0].split(' ').join('_');
        if ( 'shortname' in configLayer && configLayer.shortname != '' )
            typeName = configLayer.shortname;

        var deleteConfirm = lizDict['edition.confirm.delete'];
        if ( aMessage )
            deleteConfirm += '\n' + aMessage;

        if ( !confirm( deleteConfirm ) )
            return false;

        var eService = OpenLayers.Util.urlAppend(lizUrls.edition
            ,OpenLayers.Util.getParameterString(lizUrls.params)
        );
        $.get(eService.replace('getFeature','deleteFeature'),{
            layerId: aLayerId,
            featureId: aFeatureId
        }, function(data){
            addEditionMessage( data, 'info', true);

            if ( aCallback )
                aCallback( aLayerId, aFeatureId );

            lizMap.events.triggerEvent("lizmapeditionfeaturedeleted",
                {
                    'layerId': aLayerId,
                    'featureId': aFeatureId,
                    'featureType': aName,
                    'updateDrawing': true
                }
            );

            // Redraw layers
            redrawLayers( aLayerId );
        });
        return false;
    }


    lizMap.events.on({
        'uicreated':function(evt){

            config = lizMap.config;
            layers = lizMap.layers;
            map = lizMap.map;
            controls = lizMap.controls;


            addEditionControls();

            lizMap.launchEdition = function( aLayerId, aFid, aParent, aCallback) {
                return launchEdition( aLayerId, aFid, aParent, aCallback);
            };

            lizMap.deleteEditionFeature = function( aLayerId, aFid, aMessage, aCallback ){
                return deleteEditionFeature( aLayerId, aFid, aMessage, aCallback );
            };

            lizMap.events.on({
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

                        var layerConfig = lizMap.getLayerConfigById( layerId );

                        // Edit button
                        var eConfig = null;
                        if( 'editionLayers' in config ) {
                            eConfig = lizMap.getLayerConfigById(
                                layerId,
                                config.editionLayers,
                                'layerId'
                            );
                        }

                        if( eConfig &&
                            ( eConfig[1].capabilities.modifyAttribute == "True" || eConfig[1].capabilities.modifyGeometry == "True" )
                            && self.next('span.popupButtonBar').find('button.popup-layer-feature-edit').length == 0
                        ) {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-edit"';
                            eHtml+= ' value="'+val+'"';
                            eHtml+= ' title="' + lizDict['attributeLayers.btn.edit.title'] + '"><i class="icon-pencil"></i>&nbsp;</button>';
                        }

                        // Delete feature button
                        if( eConfig && eConfig[1].capabilities.deleteFeature == "True"
                            && self.next('span.popupButtonBar').find('button.popup-layer-feature-delete').length == 0
                        ) {
                            eHtml+= '<button class="btn btn-mini popup-layer-feature-delete"';
                            eHtml+= ' value="'+val+'"';
                            eHtml+= ' title="' + lizDict['attributeLayers.btn.delete.title'] + '"><i class="icon-remove"></i>&nbsp;</button>';
                        }

                        if( eHtml != '' ){
                            var popupButtonBar = self.next('span.popupButtonBar');
                            if ( popupButtonBar.length != 0 ) {
                                popupButtonBar.append(eHtml);
                            } else {
                                eHtml = '<span class="popupButtonBar">' + eHtml + '</span><br/>';
                                self.after(eHtml);
                            }
                            self.find('button.btn').tooltip( {
                                placement: 'bottom'
                            } );
                            hasButton = true;
                            if( popup )
                                popup.verifySize();
                        }

                        lizMap.events.triggerEvent("lizmappopuplayerfeaturedisplayed",
                            {
                                popup: popup,
                                fid: fid,
                                layerId: layerId,
                                eConfig: eConfig,
                                layerName : layerConfig[0],
                                layerConfig: layerConfig[1],
                                div : self.parent()
                            }
                        );

                    });
                    // Add interaction buttons
                    if( hasButton ) {

                        // edit
                        $('div.lizmapPopupContent button.popup-layer-feature-edit')
                        .unbind('click')
                        .click(function(){
                            var fid = $(this).val().split('.').pop();
                            var layerId = $(this).val().replace( '.' + fid, '' );
                            // launch edition
                            lizMap.launchEdition( layerId, fid );

                            // Remove map popup to avoid confusion
                            if (lizMap.map.popups.length != 0)
                                lizMap.map.removePopup( lizMap.map.popups[0] );

                            return false;
                        })
                        .hover(
                            function(){ $(this).addClass('btn-primary'); },
                            function(){ $(this).removeClass('btn-primary'); }
                        )
                        .tooltip();

                        // delete
                        $('div.lizmapPopupContent button.popup-layer-feature-delete')
                        .unbind('click')
                        .click(function(){
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
                        )
                        .tooltip();


                        // Trigger event
                        lizMap.events.triggerEvent("lizmappopupupdated",
                            {'popup': popup}
                        );

                    }
                }
            });

        } // uicreated
    });


}();


function lizEditionErrorDecorator(){
    this.message = '';
}

lizEditionErrorDecorator.prototype = {
    start : function(form){
        this.message = '';
        this.form = form;
        $("#"+form.name+" .jforms-error").removeClass('jforms-error');
        $('#'+form.name+'_errors').empty().hide();
    },
    addError : function(control, messageType){
        var elt = this.form.element.elements[control.name];
        if (elt && elt.nodeType) {
            $(elt).addClass('jforms-error');
        }
        var name = control.name.replace(/\[\]/, '');
        $("#"+this.form.name+"_"+name+"_label").addClass('jforms-error');

        if(messageType == 1){
            this.message  += '<p class="error"> '+control.errRequired + "</p>";
        }else if(messageType == 2){
            this.message  += '<p class="error"> ' +control.errInvalid + "</p>";
        }else{
            this.message  += '<p class="error"> Error on \''+control.label+"' </p>";
        }
    },
    end : function(){
        var errid = this.form.name+'_errors';
        var div = document.getElementById(errid);
        if(this.message != ''){
            if (!div) {
                div = document.createElement('div');
                div.setAttribute('class', 'jforms-error-list alert alert-block alert-error');
                div.setAttribute('id', errid);
                $(this.form.element).first().before(div);
            }
            var jdiv = $(div);
            jdiv.hide().html(this.message).fadeIn();
        }
        else if (div) {
            $(div).hide();
        }
    }
}
