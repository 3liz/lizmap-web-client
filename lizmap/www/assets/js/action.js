var action_current_object = null;

function createActionLayer(){

    var action_layer = new OpenLayers.Layer.Vector('actionLayer',{
        styleMap: new OpenLayers.StyleMap({
            graphicName: 'circle',
            pointRadius: 6,
            fill: true,
            fillColor: 'lightblue',
            fillOpacity: 0.3,
            stroke: true,
            strokeWidth: 3,
            strokeColor: 'blue',
            strokeOpacity: 0.8
        })
    });
    lizMap.map.addLayer(action_layer);
    lizMap.layers['actionLayer'] = action_layer;
}

function getItemByName(layerId, name){
    var ritem = null;
    for(var i in actionConfig[layerId]){
        var item = actionConfig[layerId][i];
        if( item.name == name ){
            ritem = item;
        }
    }
    return ritem;
}

function getActionData(layerId, fid, name){

    var options = {
        "layerId": layerId,
        "featureId": fid,
        "name": name
    };
    var item = getItemByName(layerId, name);

    // Request action and get data
    var url = actionConfigData.url;
    $.get( url, options, function(data) {

        // Report errors
        if ('errors' in data) {
            lizMap.addMessage(data.errors.title, 'error', true).attr('id','lizmap-action-message');
            console.log(data.errors.detail);
            return false;
        }

        // Returned features
        var features = addFeatures(layerId, item, data);

        // Display a message if given
        if (features.length > 0) {
            var feat = features[0];
            var message_field = 'message';
            if ('attributes' in feat && message_field in feat.attributes) {
                $('#lizmap-action-message').remove();
                var message = feat.attributes[message_field].trim();
                if (message) {
                    lizMap.addMessage(message, 'info', true).attr('id','lizmap-action-message');
                }
            }
        }

        // Callbacks
        if (features.length > 0
            && 'callbacks' in item
            && item.callbacks.length > 0 ) {
            for(let c in item.callbacks) {
                var cb = item.callbacks[c];
                var cmethod = cb['method'];

                // Get layer
                var cLayer = null;
                if('layerId' in cb){
                    var clayerId = cb['layerId'];
                    var getLayerConfig = lizMap.getLayerConfigById( clayerId );
                    if ( getLayerConfig ){
                        var layerConfig = getLayerConfig[1];
                        var featureType = getLayerConfig[0];
                        var getLayer = lizMap.map.getLayersByName(layerConfig['cleanname']);
                        if(getLayer.length > 0){
                            cLayer = getLayer[0];
                        }
                    }
                }

                // Run callback
                if( cmethod == 'redraw' && cLayer !== null){
                    // Redraw given layer
                    //console.log('redraw ' + cLayer.name);
                    cLayer.redraw(true);

                }
                var feat = features[0];
                if (cmethod == 'select' && cLayer !== null){
                    // Select features in given layer
                    //console.log('select ' + cLayer.name);
                    var f = feat.clone()
                    lizMap.selectLayerFeaturesFromSelectionFeature(featureType, f);
                }
                if (cmethod == 'zoom'){
                    // Zoom to feature
                    //console.log('zoom to feature');
                    lizMap.map.zoomToExtent(features[0].geometry.getBounds());
                }
            }

        }

        // Lizmap event to allow other scripts to process the data if needed
        lizMap.events.triggerEvent("actionResultReceived",
            {
                'layerId': layerId,
                'featureId': fid,
                'action': item,
                'features': features
            }
        );

    }, 'json');

    // Set the action as active
    action_current_object = layerId + '.' + fid + '.' + name;

}

function addFeatures(layerId, item, data){

    // Get layer
    var layer = lizMap.layers['actionLayer'];

    // Get layer projection
    var lcrs = 'EPSG:4326';
    var gFormat = new OpenLayers.Format.GeoJSON({
        externalProjection: lcrs,
        internalProjection: lizMap.map.getProjection()
    });

    // Change layer style
    if ('style' in item) {
        layer.styleMap.styles.default.defaultStyle = item.style;
    }

    // Add features
    var tfeatures = gFormat.read( data );
    layer.addFeatures( tfeatures );

    return tfeatures;
}

function addActionButton(layerId, fid, item, popupitem){

    // Build item html
    let ihtml = '<button class="btn btn-mini popup-action" value="';
    var btname = layerId + '.' + fid + '.' + item.name;
    ihtml+= btname;
    ihtml+= '" title="'+ item.title +'">';
    ihtml+= '<i class="'+ item.icon +'"></i>';
    ihtml+= '&nbsp;</button>';
    var toolbar = popupitem.next('span.popupButtonBar').find('button.popup-action[value="'+ btname + '"]');
    var popupButtonBar = popupitem.next('span.popupButtonBar');
    if (popupButtonBar.length != 0) {
        if (toolbar.length == 0)
            popupButtonBar.append(ihtml);
        else
            toolbar.before(ihtml);
    } else {
        ihtml = '<span class="popupButtonBar">' + ihtml + '</span></br>';
        popupitem.after(ihtml);
    }
    popupitem.find('button.btn').tooltip({
        placement: 'bottom'
    });

    // Trigger action when clicking on button
    $('div.lizmapPopupContent button.popup-action[value="'+ btname + '"]').click(function(){
        // Clear message
        $('#lizmap-action-message').remove();

        // Empty actionLayer: do it if button & action was active or not
        var layer = lizMap.layers['actionLayer'];
        layer.destroyFeatures();

        var val = $(this).val();
        var vals = val.split('.');
        var layerId = vals[0];
        var fid = vals[1];
        var name = vals[2];

        // Do nothing if geometry was already set
        // This allow to delete the current geometry
        if (action_current_object) {
            // deactivate if the current action was this one
            if (action_current_object == layerId + '.' + fid + '.' + name) {
                action_current_object = null;
                return true;
            }
        }
        action_current_object = null;

        // Get action item data
        // And add confirm question if needed
        var item = getItemByName(layerId, name);
        if ('confirm' in item && item.confirm.trim() != '') {
            var msg = item.confirm.trim();
            var go_on = confirm(msg);
            if (!go_on) {
                return false;
            }
        }

        // Toggle given geometry
        getActionData(layerId, fid, name);

        return false;
    }).hover(// Add hover
        function(){ $(this).addClass('btn-primary'); },
        function(){ $(this).removeClass('btn-primary'); }
    )
    ;
}

lizMap.events.on({


    'uicreated': function(){
        createActionLayer();
    },

    'lizmappopupdisplayed': function(){
        // Add action buttons if needed
        $('div.lizmapPopupContent input.lizmap-popup-layer-feature-id').each(function(){
            // Get layer id and feature id
            var self = $(this);
            var val = self.val();
            var fid = val.split('.').pop();
            var layerId = val.replace( '.' + fid, '' );

            // Get layer lizmap config
            var getLayerConfig = lizMap.getLayerConfigById( layerId );
            if (!getLayerConfig)
                return true;

            // Do nothing if layer is not found in action config
            if (!(layerId in actionConfig)) {
                return true;
            }

            // Add buttons for this layer
            for (var i in actionConfig[layerId]) {
                var item = actionConfig[layerId][i];
                //console.log(item);
                addActionButton(layerId, fid, item, self);
            }
        })

    }
});
