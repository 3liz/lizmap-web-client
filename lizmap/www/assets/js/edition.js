var lizEdition = function() {

    function FeatureEditionData(layerID, feature, relation) {
        /** @var {string} QGIS layer id */
        this.layerId = layerID;
        /** @var {Object} QGIS layer config */
        this.config = null;
        /** @var {} */
        this.feature = feature;
        /** @var {} */
        this.relation = relation;
        /** @var {FeatureEditionData}  parent feature */
        this.parent = null;
        /** @var {boolean} backToParent tell if we can edit the parent after a save */
        this.backToParent = false;
        /** @var {[Feature, FormData][]} new features to save on submit (features created after a split) */
        this.newfeatures = [];
    }
    FeatureEditionData.prototype = {
        setParentToEditAfterSave: function (parent) {
            this.backToParent = (!!parent);
            this.parent = parent;
        },
        get geometryType () {
            if (this.config) {
                return this.config.geometryType;
            }
            return '';
        },
    };

    function EditionLayerData() {
        /** @var {boolean} If the layer is spatial or not */
        this.spatial = false;
        /** @var {Object} draw control */
        this.drawControl = null;
        /** @var {string} Which submit button has been clicked */
        this.submitActor = 'submit';
        /** @var {OpenLayers.Layer.Vector} OL layer editLayer for edition */
        this.ol = null;
        /** @var {FeatureEditionData}  the current data about the edited feature */
        this.currentFeature = null;
        /** @var {OpenLayers.Layer.Vector}  layer editSplitLayer to stores temporary geometry of new features */
        this.splitOl = null;

        /** @var {OpenLayers.Rule[]} custom rules for the editLayer */
        this.olStyleCustomRules = [];
        /** @var {OpenLayers.Rule[]} custom rules for the editSplitLayer */
        this.splitOlStyleCustomRules = [];

    }
    EditionLayerData.prototype = {
        get config () {
            return this.currentFeature.config;
        },

        get geometryType () {
            if (this.currentFeature && this.currentFeature.config) {
                return this.currentFeature.config.geometryType;
            }
            return '';
        },

        get newfeatures () {
            return this.currentFeature.newfeatures
        },

        get id () {
            return this.currentFeature.layerId
        },

        get parent() {
            return this.currentFeature.parent;
        },

        get projCode() {
            return this.ol.projection.projCode;
        },

        deactivateControl : function() {
            if (this.drawControl && this.drawControl.active) {
                this.drawControl.deactivate();
            }
        },

        clearLayers: function() {
            if (this.ol) {
                this.ol.destroyFeatures();
            }

            if (this.splitOl) {
                this.splitOl.destroyFeatures();
            }
        },

        clear: function() {
            this.currentFeature = null;
            this.spatial = false;
            this.drawControl = null;
            this.submitActor = 'submit';
            this.clearLayers();
        },

        createLayers : function() {
            // Initialize layer for features created after a split
            var style, styleMap;
            var splitLayer = map.getLayersByName('editSplitLayer');
            if (splitLayer.length == 0) {
                style = new OpenLayers.Style();
                style.addRules([
                    new OpenLayers.Rule({
                        symbolizer: {
                            "Point": {
                                pointRadius: 6
                            },
                            "Line": {
                                strokeWidth: 4,
                                fillColor: "#1353ac",
                                strokeColor: "#d6eeff"
                            },
                            "Polygon": {
                                strokeWidth: 2
                            }
                        }
                    })
                ]);

                if (this.splitOlStyleCustomRules.length) {
                    style.addRules(this.splitOlStyleCustomRules);
                }

                styleMap = new OpenLayers.StyleMap({"default": style});
                this.splitOl = new OpenLayers.Layer.Vector('editSplitLayer', {styleMap: styleMap});
                map.addLayer(this.splitOl);
            }

            // initialize layer
            var editLayer = map.getLayersByName( 'editLayer' );
            if (editLayer.length == 0) {
                style = new OpenLayers.Style();
                style.addRules([
                    new OpenLayers.Rule({symbolizer:  {
                            "Point": {
                                pointRadius: 6
                            },
                            "Line": {
                                strokeWidth: 4,
                            },
                            "Polygon": {
                                strokeWidth: 2
                            }
                        }})
                ]);

                if (this.olStyleCustomRules.length) {
                    style.addRules(this.olStyleCustomRules);
                }

                styleMap = new OpenLayers.StyleMap({"default": style});
                this.ol = new OpenLayers.Layer.Vector('editLayer',{styleMap:styleMap});
                map.addLayer(this.ol);
            }
        },

        getFeature : function() {
            if (this.spatial && this.ol && this.ol.features.length != 0) {
                return this.ol.features[0];
            }
            return null;
        },

        removeEditedFeature : function(feat) {
            this.ol.removeFeatures( [feat]);
        },

        /**
         *
         * @param {object} feat
         * @param {FormData} formData
         */
        moveEditedFeatureToSplitLayer : function(feat, formData) {
            this.ol.removeFeatures( [feat]);
            this.splitOl.addFeatures([feat]);
            this.currentFeature.newfeatures.push([feat, formData]);
        },

        setDrawControl: function(drawControl) {
            this.drawControl = drawControl;
            this.spatial = true;
        },

        replaceFeature: function (newFeature) {
            this.clearLayers();
            this.ol.addFeatures([newFeature]);
        },

        canEditParentFeature : function() {
            return (this.currentFeature.parent != null && this.currentFeature.backToParent);
        },

        restoreSplitFeatures : function() {
            var layer = this.splitOl;
            layer.destroyFeatures();
            var featList = this.currentFeature.newfeatures.map(function(newFeat){ return newFeat[0]; });
            if (featList.length) {
                layer.addFeatures(featList);
            }
        }
    };

    var config = null;
    var layers = null;
    var map = null;
    var controls = null;

    // Map control for edition
    var editCtrls = null;

    // Edition layer data
    var editionLayer = new EditionLayerData();

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

    function afterReshapeSpliting(evt) {
        var splitFeatures = evt.features;
        var geometryType = editionLayer.geometryType;
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
        if (removableFeat) {
            editionLayer.removeEditedFeature(removableFeat);
        }
        // Update form geometry field from added geometry
        var feat = editionLayer.getFeature();
        if (feat) {
            updateGeometryColumnFromFeature(feat);
        }
        $('#edition-geomtool-nodetool').click();
        return false;
    }


    function beforeFeatureSpliting(evt) {

        var form = $('#edition-form-container form');
        if (checkFormBeforeSubmit(form) !== 'ok') {
            // content of the form is not good, we couldn't create a new feature
            addEditionMessage(lizDict['edition.splitfeat.form.error'],'error',true);
            return false;
        }
        if (!form.attr('data-new-feature-action')) {
            addEditionMessage(lizDict['edition.splitfeat.tech.error'],'error',true);
            return false;
        }
        return true;
    }


    function afterFeatureSpliting(evt) {

        // determine the two new geometry
        var splitFeatures = evt.features;
        var geometryType = editionLayer.geometryType;
        var newFeature = null;
        if ( geometryType == 'line' ) {
            if ( splitFeatures[0].geometry.getLength() < splitFeatures[1].geometry.getLength() )
                newFeature = splitFeatures[0];
            else
                newFeature = splitFeatures[1];
        }
        else if ( geometryType == 'polygon' ) {
            if ( splitFeatures[0].geometry.getArea() < splitFeatures[1].geometry.getArea() )
                newFeature = splitFeatures[0];
            else
                newFeature = splitFeatures[1];
        }

        // store one of the new geometry (the most little one), as a new feature
        if (newFeature) {
            var form = $('#edition-form-container form');
            // Get edition datasource geometry column name
            var gColumn = form.find('input[name="liz_geometryColumn"]').val();
            var geom = '';
            // create a new form that will be used to store the new feature
            var data = new FormData(form.get(0));
            if ('set' in data) {
                data.set('liz_featureId', '');
                data.set('__JFORMS_TOKEN__', '');
                if (gColumn) {
                    geom = calculateGeometryColumnFromFeature(newFeature);
                    data.set(gColumn, geom);
                }
            }
            else {
                // IE/Edge<12 workaround - no support of FormData.set()
                var featureIdField = form.find('input[name="liz_featureId"]');
                var geomField = form.find('input[name="'+gColumn+'"]');
                var tokenField = form.find('input[name="__JFORMS_TOKEN__"]');
                var oldFeatureId = featureIdField.val();
                var oldGeom = geomField.val();
                var oldToken = tokenField.val();
                featureIdField.val('');
                tokenField.val('');
                if (gColumn) {
                    geom = calculateGeometryColumnFromFeature(newFeature);
                    geomField.val(geom);
                }
                data = new FormData(form.get(0));
                featureIdField.val(oldFeatureId);
                geomField.val(oldGeom);
                tokenField.val(oldToken)
            }
            // move new feature into the temporary layer
            editionLayer.moveEditedFeatureToSplitLayer(newFeature, data);
        }

        // Update geometry column with the other geometry
        var feat = editionLayer.getFeature();
        if (feat) {
            updateGeometryColumnFromFeature( feat );
        }
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
        $('#edition-segment-length').parents('.control-group').addClass('hidden');
        $('#edition-segment-angle').parents('.control-group').addClass('hidden');

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

        var mapProjCode = editionLayer.projCode;
        var mapSrid = mapProjCode.replace('EPSG:','');
        $('#edition-point-coord-crs-map').html(lizDict['edition.point.coord.crs.map']+' - EPSG:'+mapSrid).val(mapSrid).show();

        if ( editionLayer.geometryType == 'point' )
            $('#edition-point-coord-add').hide();
        else
            $('#edition-point-coord-add').show();
        $('#edition-point-coord-form').show();

        lizMap.events.triggerEvent("lizmapeditiondrawfeatureactivated",
            {
                'layerId': editionLayer['id'],
                'editionConfig': editionLayer['config'],
                'drawControl': editionLayer['drawControl']
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
            var geometryType = editionLayer.geometryType;
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

                displaySegmentsLengthAndAngle(editCtrls[geometryType].handler.layer.features[0].geometry);
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
            editionLayer.deactivateControl();
            $('#edition-geomtool-container button i').removeClass('line');
            $('#edition-geomtool-container').hide();
            editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
            editCtrls.modify.createVertices = true;
            editCtrls.panel.deactivate();
        }

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

        // Hide edition tabs
        $('.edition-tabs').hide();
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

            editionLayer.createLayers();
            var editLayer = editionLayer.ol;

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
                reshape: new OpenLayers.Control.Split({layer:editLayer,eventListeners: {aftersplit:afterReshapeSpliting}}),
                featsplit: new OpenLayers.Control.Split({
                    layer:editLayer,
                    eventListeners: {
                        beforesplit:beforeFeatureSpliting,
                        aftersplit:afterFeatureSpliting
                    }})
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
                    var geometryType = editionLayer.geometryType;
                    var drawWasActivated = editCtrls[geometryType].active;
                    if (drawWasActivated)
                        editCtrls[geometryType].deactivate();

                    // Get feature
                    var feat = editLayer.features[0];

                    // Update form geometry field from added geometry
                    updateGeometryColumnFromFeature( feat );

                    // Activate modify control
                    if (drawWasActivated || editionLayer['config'].capabilities.modifyGeometry == "True"){
                        // activate edition
                        editCtrls.panel.activate();
                        // then modify
                        editCtrls.modify.activate();
                        $('#edition-geomtool-nodetool').click();
                        editCtrls.modify.selectFeature( feat );
                        if (geometryType === 'line'){
                            $('#edition-geomtool-container button i').addClass('line');
                        }
                        if (geometryType !== 'point'){
                            $('#edition-geomtool-container').show();
                        }
                    }

                    // Display form tab and hide digitization tab for point geometry
                    if (geometryType === 'point') {
                        $('.edition-tabs a[href="#tabform"]').tab('show');
                        $('.edition-tabs a[href="#tabdigitization"]').hide();
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
                    // Update form geometry field from added geometry
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
                    // Force drawing point on geolocation position
                    if ($('#edition-point-coord-geolocation').is(':checked')){
                        var [lon, lat] = lizMap.mainLizmap.geolocation.getPositionInCRS(editionLayer['ol'].projection);
                        evt.vertex.x = lon;
                        evt.vertex.y = lat;
                    }else{
                        var vertex = evt.vertex.clone();
                        displayCoordinates(vertex);
                    }

                    displaySegmentsLengthAndAngle(evt.feature.geometry);
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
                    editionLayer.clear();
                }

                // Activate edition
                editCtrls.panel.activate();

                // Display digitization tab
                $('.edition-tabs a[href="#tabdigitization"]').show();

                // Launch edition to gather edition layer info
                launchEdition( $('#edition-layer').val(), null);
                return false;
            });

            $('#edition-point-coord-form').submit(function(){
                return false;
            });
            $('#edition-point-coord-crs').change(function(){
                var vertex = editCtrls[editionLayer.geometryType].handler.point.geometry.clone();
                displayCoordinates(vertex);
            });
            $('#edition-point-coord-x').keyup(keyUpPointCoord);
            $('#edition-point-coord-y').keyup(keyUpPointCoord);
            $('#edition-point-coord-geolocation').change(function(){
                if ( $(this).is(':checked') ) {
                    $('#edition-point-coord-x').attr('disabled','disabled');
                    $('#edition-point-coord-y').attr('disabled','disabled');

                    if (lizMap.mainLizmap.geolocation.isTracking){
                        var geometryType = editionLayer.geometryType;
                        var [lon, lat] = lizMap.mainLizmap.geolocation.getPositionInCRS(editionLayer['ol'].projection);
                        if (lon && lat){
                            var px = editCtrls[geometryType].handler.layer.getViewPortPxFromLonLat({ lon: lon, lat: lat });
                            editCtrls[geometryType].handler.modifyFeature(px);

                            // Set X and Y input with geolocation position value as it is more precise than position given by edit controls
                            displayCoordinates(new OpenLayers.Geometry.Point(lon, lat));
                        }
                    }
                } else {
                    $('#edition-point-coord-x').removeAttr('disabled');
                    $('#edition-point-coord-y').removeAttr('disabled');
                }
                lizMap.mainLizmap.geolocation.isLinkedToEdition = $(this).is(':checked');
            });
            $('#edition-point-coord-add').click(function(){
                var geometryType = editionLayer.geometryType;
                if (geometryType != 'point' && editCtrls[geometryType].handler.point) {
                    var node = editCtrls[geometryType].handler.point.geometry;
                    editCtrls[geometryType].handler.insertXY(node.x, node.y);
                }
            });
            $('#edition-point-coord-submit').click(function(){
                var geometryType = editionLayer.geometryType;

                // Assert we have a geometry
                if (editCtrls[geometryType].handler.getGeometry()){
                    if (geometryType === 'point') {
                        // Take average point if mode is enabled
                        if (lizMap.mainLizmap.geolocationSurvey.averageRecordMode && lizMap.mainLizmap.geolocationSurvey.positionAverageInMapCRS !== undefined){
                            editCtrls[geometryType].handler.point.geometry.x = lizMap.mainLizmap.geolocationSurvey.positionAverageInMapCRS[0];
                            editCtrls[geometryType].handler.point.geometry.y = lizMap.mainLizmap.geolocationSurvey.positionAverageInMapCRS[1];
                            editCtrls[geometryType].handler.drawFeature();
                        }
                        editCtrls[geometryType].handler.finalize();
                    } else {
                        editCtrls[geometryType].handler.finishGeometry();
                    }
                }
            });

            $('#edition-geomtool-nodetool').click(function(){
                editCtrls.reshape.deactivate();
                editCtrls.featsplit.deactivate();
                editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.RESHAPE;
                editCtrls.modify.createVertices = true;
                editCtrls.modify.activate();
                var feat = editionLayer.getFeature();
                if (feat.geometry) {
                    // we unselect then select, to trigger corresponding events
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                    editCtrls.modify.selectFeature( feat );
                }
            });
            $('#edition-geomtool-drag').click(function(){
                editCtrls.reshape.deactivate();
                editCtrls.featsplit.deactivate();
                editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.DRAG;
                editCtrls.modify.createVertices = false;
                editCtrls.modify.activate();
                var feat = editionLayer.getFeature();
                if (feat) {
                    // we unselect then select, to trigger corresponding events
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                    editCtrls.modify.selectFeature( feat );
                }
            });
            $('#edition-geomtool-rotate').click(function(){
                editCtrls.reshape.deactivate();
                editCtrls.featsplit.deactivate();
                editCtrls.modify.mode = OpenLayers.Control.ModifyFeature.ROTATE;
                editCtrls.modify.createVertices = false;
                editCtrls.modify.activate();
                var feat = editionLayer.getFeature();
                if (feat) {
                    // we unselect then select, to trigger corresponding events
                    if ( editCtrls.modify.feature )
                        editCtrls.modify.unselectFeature( feat );
                    editCtrls.modify.selectFeature( feat );
                }
            });
            $('#edition-geomtool-reshape').click(function(){
                var feat = editionLayer.getFeature();
                if (feat && editCtrls.modify.feature) {
                    editCtrls.modify.unselectFeature(feat);
                }
                editCtrls.modify.deactivate();
                editCtrls.featsplit.deactivate();
                editCtrls.reshape.activate();
            });

            $('#edition-geomtool-split').click(function(){
                var feat = editionLayer.getFeature();
                if (feat && editCtrls.modify.feature) {
                    editCtrls.modify.unselectFeature(feat);
                }
                editCtrls.modify.deactivate();
                editCtrls.reshape.deactivate();
                editCtrls.featsplit.activate();
            });

            $('#edition-geomtool-container button').tooltip( {
                placement: 'top'
            } );

            // Geolocation

            // Toggle geolocation UI part based on tracking state
            lizMap.mainEventDispatcher.addListener(
                () => {
                    const geolocationIsTracking = lizMap.mainLizmap.geolocation.isTracking;
                    $('#edition-point-coord-geolocation-group').toggle(geolocationIsTracking);
                    if (geolocationIsTracking){
                        if ($('#edition-point-coord-geolocation').is(':checked')){
                            $('#edition-point-coord-x').attr('disabled', 'disabled');
                            $('#edition-point-coord-y').attr('disabled', 'disabled');
                        }
                    }else{
                        $('#edition-point-coord-x').removeAttr('disabled');
                        $('#edition-point-coord-y').removeAttr('disabled');
                    }
                },
                'geolocation.isTracking'
            );

            // Make modifyFeature follow geolocation when active
            lizMap.mainEventDispatcher.addListener(
                () => {
                    if (editionLayer && ('config' in editionLayer) ) {
                        $('#edition-point-coord-geolocation').removeAttr('disabled');
                        var geometryType = editionLayer.geometryType;
                        if ($('#edition-point-coord-geolocation').is(':checked') && editCtrls[geometryType].active ) {
                            // Move point
                            var [lon, lat] = lizMap.mainLizmap.geolocation.getPositionInCRS(editionLayer['ol'].projection);
                            var px = editCtrls[geometryType].handler.layer.getViewPortPxFromLonLat({ lon: lon, lat: lat});
                            editCtrls[geometryType].handler.modifyFeature(px);

                            displayCoordinates(new OpenLayers.Geometry.Point(lon, lat));
                        }
                    }
                },
                'geolocation.position'
            );
        } else {
            $('#edition').parent().remove();
            $('#button-edition').remove();
            $('#edition-form-container').hide();
        }
    }

    // Display coordinates. Vertex is in map projection
    function displayCoordinates(vertex){
        // Get SRID and transform geometry
        var srid = $('#edition-point-coord-crs').val();
        var displayProj = new OpenLayers.Projection('EPSG:' + srid);
        vertex.transform(editionLayer['ol'].projection, displayProj);

        if (displayProj.getUnits() === 'degrees') {
            $('#edition-point-coord-x').val(vertex.x.toFixed(6));
            $('#edition-point-coord-y').val(vertex.y.toFixed(6));
        } else {
            $('#edition-point-coord-x').val(vertex.x.toFixed(3));
            $('#edition-point-coord-y').val(vertex.y.toFixed(3));
        }
    }

    function displaySegmentsLength(components, projection, showTotal){
        $('#edition-segment-length').parents('.control-group').removeClass('hidden');

        const componentsCount = components.length;
        const lastSegmentLength = (new OpenLayers.Geometry.LineString([components[componentsCount - 2], components[componentsCount - 1]])).getGeodesicLength(projection);

        if (showTotal){
            let allSegmentsLength = 0;

            if (componentsCount > 1) {
                for (let index = 0; index < componentsCount - 1; index++) {
                    let line = new OpenLayers.Geometry.LineString([components[index], components[index + 1]]);
                    allSegmentsLength += line.getGeodesicLength(projection);
                }
            } else {
                allSegmentsLength = lastSegmentLength;
            }
            $('#edition-segment-length').text(lastSegmentLength.toFixed(3) + ' / ' + allSegmentsLength.toFixed(3));
        }else{
            $('#edition-segment-length').text(lastSegmentLength.toFixed(3));

        }

        lizMap.mainLizmap.edition.lastSegmentLength = lastSegmentLength.toFixed(3);
    }

    /*
    * Display the angle ABC between three points (in degrees)
    *
    * A first point, ex: {x: 0, y: 0}
    * B center point
    * C second point
    */
    function displayAngleBetweenThreePoints(A, B, C){
        $('#edition-segment-angle').parents('.control-group').removeClass('hidden');

        const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
        const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
        const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
        let angleInDegrees = (Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * 180)/Math.PI;

        if (isNaN(angleInDegrees)){
            angleInDegrees = 0;
        }

        $('#edition-segment-angle').text(angleInDegrees.toFixed(2));
    }

    // Display drawing segment length and angle when eligible
    function displaySegmentsLengthAndAngle(drawingGeom){
        if (drawingGeom.CLASS_NAME === "OpenLayers.Geometry.LineString"
            && drawingGeom.components
            && drawingGeom.components.length > 1) {
            const components = drawingGeom.components;
            const componentsLength = components.length;

            displaySegmentsLength(
                components,
                editionLayer['ol'].projection,
                true
            );

            if (componentsLength > 2) {
                displayAngleBetweenThreePoints(components[componentsLength - 1], components[componentsLength - 2], components[componentsLength - 3]);
            }
        } else if (drawingGeom.CLASS_NAME === "OpenLayers.Geometry.Polygon"
            && drawingGeom.components
            && drawingGeom.components[0].components.length > 2) {
            const clonedComponents = drawingGeom.clone().components[0].components;
            clonedComponents.pop();
            const clonedComponentsLength = clonedComponents.length;

            displaySegmentsLength(
                clonedComponents,
                editionLayer['ol'].projection,
                false
            );

            if (clonedComponentsLength > 2) {
                displayAngleBetweenThreePoints(clonedComponents[clonedComponentsLength - 1], clonedComponents[clonedComponentsLength - 2], clonedComponents[clonedComponentsLength - 3])
            }
        }
    }

    function cancelEdition(){
        // Deactivate previous edition
        finishEdition();

        // back to parent
        if ( editionLayer.canEditParentFeature()) {
            launchEditionOfParent();
        } else {
            editionLayer.clear();
            // trigger edition form closed
            lizMap.events.triggerEvent(
                'lizmapeditionformclosed'
            );
        }
    }

    // Start edition of a new feature or an existing one
    function launchEdition( aLayerId, aFid, aParent, aCallback ) {

        var editedFeature = new FeatureEditionData(aLayerId, null, null);

        // Get parent relation
        var parentInfo = null;
        if (aParent != null && ('layerId' in aParent) && ('feature' in aParent)) {
            var parentLayerId = aParent['layerId'];
            var parentFeat = aParent['feature'];
            if ('relations' in config &&
                parentLayerId in config.relations) {
                var relation = getRelationInfo(parentLayerId, aLayerId);
                if (relation != null &&
                    relation.referencingLayer == aLayerId
                ) {
                    // the given parent information corresponds to a real parent
                    // of the feature we want to edit, we take care about it

                    if (lizMap.editionPending && editionLayer['id'] == parentLayerId) {
                        var formFeatureId = $('#edition-form-container form input[name="liz_featureId"]').val();
                        var formLayerId = $('#edition-form-container form input[name="liz_layerId"]').val();
                        if (formLayerId == parentLayerId && formFeatureId == parentFeat.id.split('.').pop()) {
                            // the current edited feature is the parent of the
                            // feature we want to edit, let's retrieve its current data
                            parentInfo = editionLayer.currentFeature;
                            parentInfo.relation = relation;
                            parentInfo.feature = parentFeat;
                            editedFeature.setParentToEditAfterSave(parentInfo);
                            // and clear edition context
                            finishEdition();
                        }
                    }

                    if (!parentInfo) {
                        // let's store parent data into a FeatureEditionData
                        parentInfo = new FeatureEditionData(parentLayerId, parentFeat, relation);
                        editedFeature.parent = parentInfo;
                    }
                }
            }
        }

        return internalLaunchEdition(editedFeature, aFid, aCallback);
    }

    function launchEditionOfParent() {
        var parentInfo = editionLayer['parent'];
        var parentFeat = parentInfo.feature;

        return internalLaunchEdition(parentInfo, parentFeat.id.split('.').pop());
    }

    /**
     *
     * @param {FeatureEditionData} editedFeature
     * @param aFid
     * @param {Function} aCallback
     * @returns {boolean}
     */
    function internalLaunchEdition(editedFeature, aFid, aCallback) {

        // Deactivate previous edition when the feature to edit has no
        // relation to the current edited feature
        if (lizMap.editionPending) {
            if ( !confirm( lizDict['edition.confirm.cancel'] ) )
                return false;
            finishEdition();
        }


        editionLayer.clear();

        // Check if edition is configured in lizmap
        if ( !('editionLayers' in config) )
                return false;

        // Get edition map controls
        if( !editCtrls )
            return false;

        lizMap.editionPending = true;

        // check that layers for edition are there
        editionLayer.createLayers();

        // Initialize edition data
        var getLayer = lizMap.getLayerConfigById( editedFeature.layerId, config.editionLayers, 'layerId' );
        if (!getLayer) {
            lizMap.editionPending = false;
            return false;
        }

        editedFeature.config = getLayer[1];

        editionLayer.currentFeature = editedFeature;

        // Check if layer is spatial
        var geometryType = editedFeature.geometryType;
        if( geometryType in editCtrls ){
            editionLayer.setDrawControl(editCtrls[geometryType]);
        }

        // Get form and display it
        getEditionForm( aFid, aCallback );

        editionLayer.restoreSplitFeatures();

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
        editionType = 'modifyFeature';
        if (!featureId) {
            editionType = 'createFeature';
        }

        // Deactivate previous form
        var originalForm = $('#edition-form-container form');
        if ( originalForm.length != 0 ) {
            originalForm.unbind('submit');
        }

        // Get form via web service
        var service = OpenLayers.Util.urlAppend(lizUrls.edition
            ,OpenLayers.Util.getParameterString(lizUrls.params)
        );
        $.get(service.replace('getFeature', editionType),{
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

            // Show edition tabs
            $('.edition-tabs').show();

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
     * @param {string} data  html corresponding to the form or the result of a submit
     */
    function displayEditionForm (data) {
        // Firstly does the edition-form-container already has a form ?
        var oldSerializeArray = $('#edition-form-container form').serializeArray();

        // Add data, erase the current form
        var formContainer = $('#edition-form-container');
        formContainer.html(data);
        // the new form
        var form = $('#edition-form-container form');

        // Response contains a form
        if ( form.length != 0 ) {
            var newSerializeArray = form.serializeArray();

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
                    // XXX: liz_wkt is not used. remove it?
                    $('#edition-hidden-form input[name="liz_wkt"]').val( originalGeom );
                }
            }

            // Manage child form
            if ( editionLayer['parent'] != null ){
                var parentInfo = editionLayer['parent'];
                var relationRefField = parentInfo['relation'].referencingField;
                var parentFeatProp = parentInfo['feature'].properties[relationRefField];

                var select = form.find('select[name="'+relationRefField+'"]');
                if( select.length == 1 ){
                    select.val(parentFeatProp)
                          .attr('disabled','disabled');
                    // XXX this hidden field is not used anywhere. What is its purpose?
                    var hiddenInput = $('<input type="hidden"></input>')
                        .attr('id', select.attr('id')+'_hidden')
                        .attr('name', relationRefField)
                        .attr('value', parentFeatProp);
                    form.find('div.jforms-hiddens').append(hiddenInput);
                    jFormsJQ.getForm(form.attr('id'))
                        .getControl(relationRefField)
                        .required=false;
                } else {
                    var input = form.find('input[name="'+relationRefField+'"]');
                    if( input.length == 1 && input.attr('type') != 'hidden'){
                        input.val(parentFeatProp)
                              .attr('disabled','disabled');
                        // XXX this hidden field is not used anywhere. What is its purpose?
                        var hiddenInput = $('<input type="hidden"></input>')
                            .attr('id', input.attr('id')+'_hidden')
                            .attr('name', relationRefField)
                            .attr('value', parentFeatProp);
                        form.find('div.jforms-hiddens').append(hiddenInput);
                        jFormsJQ.getForm($('#edition-form-container form').attr('id'))
                            .getControl(relationRefField)
                            .required=false;
                    }
                    else
                        input.val(parentFeatProp);
                }
            }

            // Create combobox based on RelationValue with fieldEditable
            var selectComboboxes = form.find('select.combobox');
            for( var i=0, len=selectComboboxes.length; i<len; i++ ) {
                var selectCombobox = $(selectComboboxes[i]);
                activateCombobox(selectCombobox);
            }
            var selectAutocompletes = form.find('select.autocomplete');
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

                var geometryType = editionLayer.geometryType;
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
                        editionLayer.clearLayers();
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
                    }else{
                        $('.edition-tabs a[href="#tabdigitization"]').hide();
                    }

                    addEditionMessage(lizDict['edition.select.modify.activate'],'info',true);
                }
            }


            // Activate form tabs based on QGIS drag&drop form layout mode
            $('#edition-form-container form > ul.nav-tabs li:first a').click().blur();
            $('#'+form.attr('id')+'_liz_future_action_label').removeClass('control-label');

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

        formContainer.show();
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

        if (form.length == 0) {
            if (editionLayer.canEditParentFeature()) {
                // back to parent
                launchEditionOfParent();
            } else {
                editionLayer.clear();
                lizMap.clearDrawLayer('locatelayer');
                // trigger edition form closed
                lizMap.events.triggerEvent(
                    'lizmapeditionformclosed'
                );
            }
        }
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
        var feat = editionLayer.getFeature();
        if (feat) {
            updateGeometryColumnFromFeature( feat );
        }


        form.submit(function(evt) {

            // Cancel edition if this submit button has been used
            if(editionLayer['submitActor'] == 'cancel'){
                cancelEdition();
                return false;
            }

            //  check form
            var msg = checkFormBeforeSubmit(form, evt);

            // save has been canceled because of some errors in the form
            if (msg === false) {
                return false;
            }

            // Some client side errors have been detected in form
            if( msg != 'ok' ){
                addEditionMessage( msg, 'info', true);
                return false;
            }

            // Set submit button value
            var submit_hidden_id = form.attr('id') + '_' + '_submit';
            $('#' + submit_hidden_id).val(editionLayer['submitActor']);

            // send values
            $('#edition-waiter').show();

            var newFeatureUrl = form.attr('data-new-feature-action');
            var url = form.attr('action');
            var featureData = new FormData(form.get(0));
            var formResult = '';

            var sendFormPromise = sendNewFeatureForm(url, featureData);
            sendFormPromise.then(function(data) {
                formResult = data;
            });
            editionLayer.newfeatures.forEach(function(newFeatForm) {
                sendFormPromise = sendFormPromise.then(() => sendNewFeatureForm(newFeatureUrl, newFeatForm[1]));
            });
            sendFormPromise.then(() => {
                displayEditionForm( formResult );
            });
            return false;
        });
    }


    /**
     *
     * @param {FormData} formData
     * @return {Promise}
     */
    function sendNewFeatureForm(url, formData) {
        return new Promise(function(resolve, reject) {

            var request = new XMLHttpRequest();
            request.open("POST", url);
            request.onload = function(oEvent) {
                if (request.status == 200) {
                    resolve(request.responseText);
                } else {
                    reject();
                }
            };
            request.send(formData);
        });
    }

    /**
     * Check the content of the form
     * @param {jQuery} form
     * @param {DOMEvent|null} evt
     * @returns {string|boolean}
     */
    function checkFormBeforeSubmit(form, evt){

        // Jelix checks
        if (evt) {
            if (!jFormsJQ._submitListener(evt)) {
                return false;
            }
        }
        else {
            form.trigger('jFormsUpdateFields');
            if (!jFormsJQ.verifyForm(form.get(0))) {
                return false;
            }
        }

        var msg = 'ok';
        if (editionLayer['spatial'] && editionLayer['config'].capabilities.modifyGeometry == 'True') {

            var gColumn = form.find('input[name="liz_geometryColumn"]').val();
            var formGeom = form.find('input[name="'+gColumn+'"]').val();
            if( formGeom.trim() == '' ){
                msg = lizDict['edition.message.error.no.geometry'];
            }

        }
        return msg;
    }

    function calculateGeometryColumnFromFeature(feat) {
        if (feat.geometry == null) {
            return '';
        }

        if (!editionLayer['ol']) {
            return '';
        }

        // Clone passed geometry
        var geom = feat.geometry.clone();

        // Get SRID and transform geometry
        var eform = $('#edition-form-container form');
        var srid = eform.find('input[name="liz_srid"]').val();
        if (srid != '' && !('EPSG:'+srid in Proj4js.defs)) {
            Proj4js.defs['EPSG:'+srid] = eform.find('input[name="liz_proj4"]').val();
        }
        geom.transform(editionLayer['ol'].projection, 'EPSG:'+srid);
        return geom;
    }


    function updateGeometryColumnFromFeature( feat ){

        var geom = calculateGeometryColumnFromFeature(feat);
        if (geom === '') {
            return false;
        }

        var eform = $('#edition-form-container form');
        var srid = eform.find('input[name="liz_srid"]').val();
        if (srid != '' && !('EPSG:'+srid in Proj4js.defs)) {
            Proj4js.defs['EPSG:'+srid] = eform.find('input[name="liz_proj4"]').val();
        }

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

        if ( !editionLayer['ol'] )
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
        editionLayer.replaceFeature(feat);
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

            var editionOptions = {
                addStyleRulesToSplitLayers : function(rules) {
                    editionLayer.splitOlStyleCustomRules = editionLayer.splitOlStyleCustomRules.concat(rules);
                },
                addStyleRulesToEditLayers : function(rules) {
                    editionLayer.olStyleCustomRules = editionLayer.olStyleCustomRules.concat(rules);
                },
            };
            lizMap.events.triggerEvent(
                'lizmapeditionfeatureinit',
                {
                    "editorOptions" : editionOptions
                }
            );

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
};
