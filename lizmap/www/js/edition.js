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

    function deactivateEdition() {
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

        // Empty and hide form and tools
        $('#edition-cancel').addClass('disabled');
        $('#edition-form-container').hide().html('');

        // Display create tools back
        if( $('#edition-layer').html().trim() != '' ){
            $('#edition-layer').show();
            $('#edition-draw').removeClass('disabled').show();
        }
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
                    $('#edition-layer').append('<option value="'+alConfig.id+'">'+alConfig.title+'</option>');
                }
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
                        },
                        deactivate: function( evt ) {
                            for ( var c in editCtrls ) {
                                if ( editCtrls[c].active )
                                    editCtrls[c].deactivate();
                            }
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
                map.addControls([editCtrls[ctrl]]);
            }
            controls['edition'] = editCtrls.panel;


            // edit layer events
            editLayer.events.on({

                featureadded: function(evt) {
//~ console.log( 'feature added');
                    // Deactivate draw control
                    if( !editCtrls )
                        return false;
                    var geometryType = editionLayer['config'].geometryType;
                    editCtrls[geometryType].deactivate();

                    // Get feature
                    var feat = editionLayer['ol'].features[0];

                    // Update form liz_wkt field from added geometry
                    updateGeometryColumnFromFeature( feat );

                    // Activate modify control
                    if (editionLayer['config'].capabilities.modifyGeometry == "True"){
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
//~ console.log( 'feature modified');
                    if ( evt.feature.geometry == null )
                        return;
                    // Update form liz_wkt field from added geometry
                    updateGeometryColumnFromFeature( evt.feature );

                },

                featureselected: function(evt) {
//~ console.log( 'feature selected');
                    if ( evt.feature.geometry == null )
                        return;

                },

                featureunselected: function(evt) {
//~ console.log( 'featureunselected')

                    if ( evt.feature.geometry == null )
                        return;
                    updateGeometryColumnFromFeature( evt.feat )
                },

                vertexmodified: function(evt) {
//~ console.log( 'vertexmodified');

                }
            });

            $('#edition-layer').change(function() {
                var self = $(this);
                editCtrls.panel.activate();

            });

            lizMap.events.on({
                dockopened: function(e) {
                    if ( e.id == 'edition' ) {
                        console.log('edition dock set visible');
                    }
                },
                dockclosed: function(e) {
                    if ( e.id == 'edition' ) {
                        console.log('edition dock closed');
                    }
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
                    deactivateEdition();
                }

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
                if ( !confirm( lizDict['edition.confirm.cancel'] ) )
                    return false;
                deactivateEdition();
            });

            $('#edition-menu a[rel="tooltip"]').tooltip();

        } else {
            $('#edition').parent().remove();
            $('#edition-menu').remove();
            $('#edition-form-container').hide();
        }
    }


    // Start edition of a new feature or an existing one
    function launchEdition( aLayerId, aFid, aCallback ) {

        // Prevent multiple editions
        if( lizMap.editionPending )
            return false;
        lizMap.editionPending = true;


        editionLayer['id'] = null;
        editionLayer['config'] = null;
        editionLayer['spatial'] = null;
        editionLayer['drawControl'] = null;
        editionLayer['ol'] = null;

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

                // Hide drawfeature controls
                $('#edition-layer').hide();
                $('#edition-draw').addClass('disabled').hide();

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

            if( aCallback )
                aCallback( editionLayer['id'], featureId );

        });

    }

    /*
     * Display the edition form
     *
     */
    function displayEditionForm( data ){

        // Get editLayer
        editLayer = editionLayer['ol'];
        if( !editLayer )
            return false;

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

            // Redraw layer
            if( editionLayer['spatial'] ){
                $.each(layers, function(i, l) {
                    if (config.layers[l.params['LAYERS']].id != layerId)
                        return true;
                    l.redraw(true);
                    return false;
                });
            }

            // Display message via JS
            lizMap.addMessage( data, 'info', true).attr('id','lizmap-edition-message');

            // Deactivate edition
            deactivateEdition();
        }

        // Make the form visible
        $('#edition-form-container').show();

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
        $('#liz_layer_popup_close').click();

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
                if ( fileInputs.length != 0 ) {
                    form.fileupload({
                        dataType: 'html',
                        done: function (e, data) {
                            displayEditionForm( data.result );
                        }
                    });
                    form.fileupload('add', {fileInput:fileInputs});
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
                    'featureId': aFeatureId
                }
            );

            $.each(lizMap.layers, function(i, l) {
                if (config.layers[l.params['LAYERS']].id != aLayerId)
                    return true;
                l.redraw(true);
                return false;
            });
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

            lizMap.launchEdition = function( aLayerId, aFid) {
                return launchEdition( aLayerId, aFid);
            };

            lizMap.deleteEditionFeature = function( aLayerId, aFid, aMessage, aCallback ){
                return deleteEditionFeature( aLayerId, aFid, aMessage, aCallback );
            };


        } // uicreated
    });


}();
