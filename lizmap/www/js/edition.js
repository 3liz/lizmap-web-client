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
    };

    // Edition type : createFeature or modifyFeature
    var editionType = null;

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
        $('#edition-cancel').addClass('disabled');
        $('#edition-form-container').hide().html('');
        $('#edition-waiter').hide();

        // Display create tools back
        if( $('#edition-layer').html().trim() != '' ){
            $('#edition-layer').show();
            $('#edition-draw').removeClass('disabled').show();
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
            for (var i in elk.sort()) {
                var alConfig = elconfig[elk[i]];
                $('#edition-layer').append('<option value="'+alConfig.id+'">'+alConfig.title+'</option>');
            }
            if( hasCreateLayers ){
                $('#edition-layer').removeAttr('disabled').show();
                $('#edition-draw').removeClass('disabled').show();
            }
            else{
                $('#edition-layer').hide();
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
                            lizMap.controls.featureInfo.deactivate();
                        },
                        deactivate: function( evt ) {
                            for ( var c in editCtrls ) {
                                if ( c != 'panel' && editCtrls[c].active )
                                    editCtrls[c].deactivate();
                            }
                            lizMap.controls.featureInfo.activate();
                        }
                    }
                }),
                point: new OpenLayers.Control.DrawFeature(editLayer,
                     OpenLayers.Handler.Point),
                line: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Path),
                polygon: new OpenLayers.Control.DrawFeature(editLayer,
                    OpenLayers.Handler.Polygon),
                modify: new OpenLayers.Control.ModifyFeature(editLayer)
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
                        editCtrls.modify.selectFeature( feat );
                    }

                    // Inform user he can now modify
                    $('#lizmap-edition-message').remove();
                    lizMap.addMessage(lizDict['edition.select.modify.activate'],'info',true).attr('id','lizmap-edition-message');

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

            $('#edition-cancel').click(function(){
                // Do nothing if not enabled
                if ( $(this).hasClass('disabled') )
                    return false;
                // Deactivate previous edition
                //if ( !confirm( lizDict['edition.confirm.cancel'] ) )
                    //return false;
                finishEdition();

                // back to parent
                if ( editionLayer['parent'] != null && editionLayer['parent']['backToParent']) {
                    var parentInfo = editionLayer['parent'];
                    var parentLayerId = parentInfo['layerId'];
                    var parentFeat = parentInfo['feature'];
                    launchEdition( parentLayerId, parentFeat.id.split('.').pop(), parentInfo['parent'], function(editionLayerId, editionFeatureId){
                        $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
                    });
                }
            });

        } else {
            $('#edition').parent().remove();
            $('#button-edition').remove();
            $('#edition-form-container').hide();
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
            var geometryType = editionLayer['config'].geometryType;


            // Hide drawfeature controls : they will go back when finishing edition or canceling
            $('#edition-layer').hide();
            $('#edition-draw').addClass('disabled').hide();

            // Creation
            if( action == 'createFeature' ){

                // Activate drawFeature control only if relevant
                if( editionLayer['config'].capabilities.createFeature == "True"
                && geometryType in editCtrls ){
                    var ctrl = editCtrls[geometryType];
                    if ( ctrl.active ) {
                        return false;
                    } else {
                        ctrl.activate();

                        $('#lizmap-edition-message').remove();
                        lizMap.addMessage(lizDict['edition.draw.activate'],'info',true).attr('id','lizmap-edition-message');
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
                        editCtrls.modify.selectFeature( feat );
                    }
                }

                $('#lizmap-edition-message').remove();
                lizMap.addMessage(lizDict['edition.select.modify.activate'],'info',true).attr('id','lizmap-edition-message');
            }

            // Send signal
            lizMap.events.triggerEvent(
                "lizmapeditionformdisplayed",
                {
                    'layerId': editionLayer['id'],
                    'featureId': featureId,
                    'editionConfig': editionLayer['config']
                }
            );

            if( aCallback )
                aCallback( editionLayer['id'], featureId );

        });

    }

    /*
     * Display the edition form
     *
     */
    function displayEditionForm( data ){

        // Add data
        $('#edition-form-container').html(data);
        var form = $('#edition-form-container form');

        // Keep a copy of original geometry data
        if( editionLayer['spatial'] && editionType == 'modifyFeature' ){
            var gColumn = form.find('input[name="liz_geometryColumn"]').val();
            if( gColumn != '' ){
                var originalGeom = form.find('input[name="'+gColumn+'"]').val();
                $('#edition-hidden-form input[name="liz_wkt"]').val( originalGeom );
            }
        }

        // Response contains a form
        if ( form.length != 0 ) {

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

            handleEditionFormSubmit( form );

            if ( $('#edition-cancel').hasClass('disabled') ) {
                $('#edition-cancel').removeClass('disabled');
            }
        }

        // Else it means no form has been sent back
        if ( form.length == 0 ) {
            controls['edition'].deactivate();
            controls['edition'].activate();
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
            // Deactivate edition
            finishEdition();

            // Display message via JS
            lizMap.addMessage( data, 'info', true).attr('id','lizmap-edition-message');

        }

        // Change form layout (from QGIS drag&drop form layout mode )
        var formId = $('#edition-form-container form').attr('id');
        // lizmapEditionFormLayoutJson is a global variable added through template
        if( typeof lizmapEditionFormLayoutJson !== 'undefined' && 'attributeEditorContainer' in lizmapEditionFormLayoutJson ){
            var attributeTree = [];
            var item = buildFormLayoutObj( attributeTree, lizmapEditionFormLayoutJson, 0, null );
            $('#edition-form-tabbable').prependTo( $('form#'+formId) );
            $('#edition-form-tabs li:first a').click().blur();

            $('#edition-form-container').parent('div.menu-content').css('overflow-x','hidden');
        }else{
            $('#edition-form-tabbable').hide();
        }


        $('#edition-form-container').show();
        $('#edition-waiter').hide();

        // Show the dock if needed
        var btn = $('#button-edition');
        var dockVisible = btn.parent().hasClass('active');
        if( !lizMap.checkMobile() ){
            if ( !dockVisible )
                btn.click();
        }else{
            if ( dockVisible )
                btn.click();
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
        }

        // Redraw bottom dock
        $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
    }

    function handleEditionFormSubmit( form ){
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
            form.submit(function() {
                // Additionnal checks
                var msg = checkFormBeforeSubmit();
                if( msg != 'ok' ){
                    lizMap.addMessage( msg, 'info', true).attr('id','lizmap-edition-message');
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
                } else
                    $.post(form.attr('action'),
                        form.serialize(),
                        function(data) {
                            displayEditionForm( data );
                        });
                return false;
            });
        }
        else{
            form.submit(function() {
                // Additionnal checks
                var msg = checkFormBeforeSubmit();
                if( msg != 'ok' ){
                    lizMap.addMessage( msg, 'info', true).attr('id','lizmap-edition-message');
                    return false;
                }
                $('#edition-waiter').show();
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
        var msg = 'ok';
        var form = $('#edition-form-container form');

        if( editionLayer['spatial'] ){

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

            lizMap.addMessage( data, 'info', true).attr('id','lizmap-edition-message');

            if ( aCallback )
                aCallback( aLayerId, aFeatureId );

            lizMap.events.triggerEvent(
                "lizmapeditionfeaturedeleted",
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


    function getFormLayoutNodeInfo(aNode, depth){
        var node = {};

        // default type
        if( depth % 2 == 0)
            node['type'] = 'group';
        else
            node['type'] = 'tab';

        // Get name if possible & check if it is a field
        if( 'attributes' in aNode ){
            node['name'] = aNode.attributes.name
            if( 'index' in aNode.attributes ){
                node['type'] = 'field';
            }
        }
        // Root node
        if ( depth == 0 ){
            node['name'] = 'root';
            node['type'] = 'root';
        }

        return node;

    }

    function getFormLayoutNodeChildren(aNode){

        var children = [];
        if( 'attributeEditorContainer' in aNode ){
            children = children.concat(aNode.attributeEditorContainer);
        }
        if( 'attributeEditorField' in aNode ){
            children = children.concat(aNode.attributeEditorField);
        }
        return children;

    }

    function buildFormLayoutObj(item, currentObj, depth, parent){
            var node = getFormLayoutNodeInfo(currentObj, depth);
            var children = getFormLayoutNodeChildren(currentObj);
            var a = node;
            a.depth = depth
            a.children = [];
            getFormLayoutNodeHtml(a, parent);
            for ( var c in children ){
                var child = children[c];
                var b = buildFormLayoutObj(item, child, depth+1, a);
                a['children'].push( b );
            }

            return a;

    }


    function getFormLayoutNodeHtml(node, parent){
        var formId = $('#edition-form-container form').attr('id');
        if( node.type == 'tab' ){
            // Ul item for tab nav
            var navHtml = '<li><a href="#edition-form-tab-';
            navHtml+= lizMap.cleanName(node.name).toLowerCase();
            navHtml+= '" data-toggle="tab">' + node.name + '</a></li>';

            // Tab item content
            var tabHtml = '<div class="tab-pane" id="edition-form-tab-';
            tabHtml+= lizMap.cleanName(node.name).toLowerCase();
            tabHtml+= '" ></div>';

            // If parent is root, simply add ul and item to already existing tab container
            if( parent.type == 'root'){
                $( "#edition-form-tabs" ).append(navHtml);
                $( "#edition-form-layout" ).append(tabHtml);
            }
            // Else we must first be sure tab container exists in parent group
            // Then append containt
            else{
                var tabContainerNavId = 'edition-form-tabs-' + lizMap.cleanName(parent.name).toLowerCase();
                var tabContainerDivId = 'edition-form-layout-' + lizMap.cleanName(parent.name).toLowerCase();
                var parentGroup = $('#' + formId + '_group_' + lizMap.cleanName(parent.name).toLowerCase() );
                if( !$('#' + tabContainerNavId).length ){
                    var tabContainer = '<ul class="nav nav-tabs" id="';
                    tabContainer+= tabContainerNavId;
                    tabContainer+= '"></ul>';
                    tabContainer+= '<div class="tab-content" id="';
                    tabContainer+= tabContainerDivId;
                    tabContainer+= '"></div>';
                    parentGroup.append(tabContainer);
                }
                $('#' + tabContainerNavId).append(navHtml);
                $('#' + tabContainerDivId).append(tabHtml);
                $('#' + tabContainerNavId + ' li:first a').click().blur();
            }
        }
        else if( node.type == 'group' ){
            html = '<fieldset>';
            html+= '<legend style="font-weight:bold;">';
            html+= node.name;
            html+= '</legend>';
            html+= '<div class="jforms-table-group" border="0" id="';
            html+= formId + '_group_' + lizMap.cleanName(node.name).toLowerCase();
            html+= '">';
            html+= '</div>';
            html+= '</fieldset>';
            $('#edition-form-tab-' + lizMap.cleanName(parent.name).toLowerCase() ).append(html)
        }
        else if( node.type == 'field' ){
            html = '';
            var field = $('#' + formId + '_' + lizMap.cleanName(node.name).toLowerCase() + '_label');
            var fieldContainer = field.parents().closest('div.control-group');
            var parentGroup = $('#' + formId + '_group_' + lizMap.cleanName(parent.name).toLowerCase() );
            if( !parentGroup.length )
                parentGroup = $('#edition-form-tab-' + lizMap.cleanName(parent.name).toLowerCase());
            fieldContainer.appendTo(parentGroup);
            // Do it also for _choice input (photos and files)
            var field = $('#' + formId + '_' + lizMap.cleanName(node.name).toLowerCase() + '_choice_label');
            if( field.length){
                var fieldContainer = field.parents().closest('div.control-group');
                fieldContainer.appendTo(parentGroup);
            }
        }

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
                    // Add action buttons if needed
                    $('div.lizmapPopupContent input.lizmap-popup-layer-feature-id').each(function(){
                        var self = $(this);
                        var val = self.val();
                        var eHtml = '';
                        var fid = val.split('.').pop();
                        var layerId = val.replace( '.' + fid, '' );

                        var getLayerConfig = lizMap.getLayerConfigById( layerId );

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
                        ) {
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

                    });
                    // Add interaction buttons
                    if( hasButton ) {

                        // edit
                        $('div.lizmapPopupContent button.popup-layer-feature-edit')
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
                        $('div.lizmapPopupContent button.popup-layer-feature-delete').click(function(){
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
                        lizMap.events.triggerEvent(
                            "lizmappopupupdated",
                            {'popup': popup}
                        );

                    }
                }
            });


        } // uicreated
    });


}();
