var lizAtlas = function() {

    lizMap.events.on({
        'uicreated':function(evt){

        if( !('atlasEnabled' in lizMap.config.options) )
            return;
        if( lizMap.config.options['atlasEnabled'] != 'True')
            return;

        var getLayerConfig = lizMap.getLayerConfigById( lizMap.config.options['atlasLayer'] );
        if ( !getLayerConfig )
            return;
        var layerConfig = getLayerConfig[1];
        var featureType = getLayerConfig[0];
        var primaryKey = lizMap.config.options['atlasPrimaryKey'] != '' ? lizMap.config.options['atlasPrimaryKey'] : null;
        if(!primaryKey)
            return;
        var titleField = lizMap.config.options['atlasFeatureLabel'] != '' ? lizMap.config.options['atlasFeatureLabel'] : null;
        if(!titleField)
            return;
        var sortField = lizMap.config.options['atlasSortField'] != '' ? lizMap.config.options['atlasSortField'] : titleField;

        var lizAtlasConfig = {
            'layername': featureType,
            'showAtStartup': lizMap.config.options['atlasShowAtStartup'] == 'True' ? true : false,
            'displayLayerDescription': lizMap.config.options['atlasDisplayLayerDescription'] == 'True' ? true : false,
            'primaryKey': primaryKey,
            'titleField': titleField,
            'sortField': sortField,
            'duration': lizMap.config.options['atlasDuration'],
            'autoPlay': lizMap.config.options['atlasAutoPlay'] == 'True' ? true : false,
            'maxWidth': lizMap.config.options['atlasMaxWidth'] +'%',
            'drawFeatureGeom': lizMap.config.options['atlasHighlightGeometry'] == 'True' ? true : false,
            'atlasDisplayPopup': lizMap.config.options['atlasDisplayPopup'] == 'True' ? true : false,
            'triggerFilter': lizMap.config.options['atlasTriggerFilter'] == 'True' ? true : false,
            'zoom': lizMap.config.options['atlasZoom'] == '' ? false : lizMap.config.options['atlasZoom']
        };
        var lizAtlasTimer;

        function getAtlasData(featureType) {

            // Get data
            lizMap.getAttributeFeatureData(featureType, null, null, 'geom', function(aName, aFilter, aFeatures, aAliases){
                if( aFeatures.length != 0 ) {
                    lizAtlasConfig['features'] = aFeatures;
                    lizAtlasConfig['featureType'] = featureType;
                    prepareFeatures();
                    launchAtlas();
                }
                $('body').css('cursor', 'auto');
                return false;
            });
        }

        function prepareFeatures(){

            // Get and order features
            lizAtlasConfig['features_with_pkey'] = {};
            var items = [];
            var pkey_field = lizAtlasConfig['primaryKey'];
            var s_field = lizAtlasConfig['sortField'];
            for(var i in lizAtlasConfig.features){

                // Get feature
                var feat = lizAtlasConfig.features[i];
                var fid = feat.id.split('.').pop();
                var pk_val = feat.properties[pkey_field];

                // Add feature in dictionary for further ref
                lizAtlasConfig['features_with_pkey'][pk_val] = feat;

                // Add feature to sorted oject
                items.push(feat.properties);
            }

            items.sort(function(a, b) {
                var nameA = a[s_field];
                var nameB = b[s_field];
                if( typeof(a[s_field]) == 'string' || typeof(b[s_field]) == 'string' ){
                    nameA = a[s_field].toUpperCase(); // ignore upper and lowercase
                    nameB = b[s_field].toUpperCase(); // ignore upper and lowercase
                }
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }

                // names must be equal
                return 0;
            });

            lizAtlasConfig['features_sorted'] = items;
            //console.log(lizAtlasConfig['features_with_pkey']);
        }

        function getAtlasHome(){


            var home = '';
            // Add description

            if( lizAtlasConfig['displayLayerDescription'] ){
                var labstract = lizMap.config.layers[lizAtlasConfig.layername]['abstract'];
                if(labstract != ''){
                    home+= '<p id="liz-atlas-item-layer-abstract">' + lizMap.config.layers[lizAtlasConfig.layername]['abstract'] + '</p>';
                }
            }

            // Add combobox with all data
            home+= '<p style="padding:0px 10px;">';
            home+= '<select id="liz-atlas-select">';
            home+= '<option value="-1"> --- </option>';
            var pkey_field = lizAtlasConfig['primaryKey'];
            for(var i in lizAtlasConfig['features_sorted']){
                var item = lizAtlasConfig['features_sorted'][i];

                // Add option
                home+= '<option value="'+i+'">';
                home+= item[lizAtlasConfig['titleField']];
                home+= '</option>';
            }
            home+= '</select>';
            home+= '<br><span>';
            home+= '<button class="btn btn-mini btn-primary liz-atlas-item" value="-1">'+lizDict['atlas.toolbar.prev']+'</button>';
            home+= '&nbsp;';
            home+= '<button class="btn btn-mini btn-primary liz-atlas-item" value="1">'+lizDict['atlas.toolbar.next']+'</button>';
            home+= '&nbsp;';
            home+= '<button class="btn btn-mini btn-wanrning liz-atlas-run" value="1">'+lizDict['atlas.toolbar.play']+'</button>';
            home+= '&nbsp;';
            home+= '</span>';
            home+= '</span>';
            home+= '</br>';
            home+= '</p>';
            home+= '<div id="liz-atlas-item-detail" style="display:none;">';
            home+= '</div>';

            lizAtlasConfig.home = home;
            return home;
        }

        function launchAtlas(){
            // Get Atlas home
            var home = getAtlasHome(lizAtlasConfig.featureType, lizAtlasConfig.features);

            // Add dock
            lizMap.addDock(
                'atlas',
                lizDict['atlas.toolbar.title'],
                'right-dock',
                home,
                'icon-globe'
            );
            var title = '<h3>';
            title+= '<i class="icon-globe icon-white" style="margin: 4px;"></i>';
            title+= lizMap.config.layers[lizAtlasConfig.layername]['title'];
            title+= '</h3>';
            $('#atlas').prepend(title);


            // Add events
            activateAtlasTrigger();

            // Limit dock size
            adaptAtlasSize();

            // Show dock
            if( lizAtlasConfig['showAtStartup'] && !lizMap.checkMobile() ){
                $('#mapmenu li.atlas:not(.active) a').click();
                // Hide legend
                $('#mapmenu li.switcher.active a').click();
            }

            // Start animation
            if( lizAtlasConfig['autoPlay'] && !lizMap.checkMobile() ){
                $('button.liz-atlas-run').click();
            }

        }

        function adaptAtlasSize(){
            lizMap.events.on({
            // Adapt dock size to display metadata
            rightdockopened: function(e) {
                if ( e.id == 'atlas') {
                    // Size : add class to content to enabled specific css to be applied
                    $('#content').addClass('atlas-visible');
                    lizMap.updateContentSize();

                }
            },
            rightdockclosed: function(e) {
                if ( e.id == 'atlas' ) {

                    // Set right-dock default size by removing #content class
                    $('#content').removeClass('atlas-visible');
                    lizMap.updateContentSize();

                    // Deactivate atlas and stop animation
                    deactivateAtlas();

                }
            }
            });

        }

        function activateAtlasTrigger(){
            $('#liz-atlas-select')
            .change( function(){
                var i = $(this).val();
                var len = lizAtlasConfig['features_sorted'].length;

                if( i == -1 ){
                    deactivateAtlas();
                    return false;
                }
                if( i && i>= 0 && i < len ){
                    var item = lizAtlasConfig['features_sorted'][i];

                    var pkey_field = lizAtlasConfig['primaryKey'];

                    if(item[pkey_field] in lizAtlasConfig['features_with_pkey'] ){
                        var feature = lizAtlasConfig['features_with_pkey'][item[pkey_field]];
                        runAtlasItem( feature );

                    }else{
                        console.log("no feature found");
                    }

                }
                return false;

            });

            $('#atlas div.menu-content')
            .on('click', 'button.liz-atlas-item', function(){
                var a = parseInt($(this).val());
                var curval = parseInt($('#liz-atlas-select').val());
                var nextval = a + curval;
                var len = lizAtlasConfig['features_sorted'].length;
                if(nextval >= len)
                    nextval = 0;
                if( nextval >= 0 && nextval < len){
                    $('#liz-atlas-select').val(nextval).change();
                }
                return false;
            });

            // Timer
            $('#atlas div.menu-content button.liz-atlas-run').click(function(){
                // Get button value
                var a = $(this).val();

                // Get animation duration
                var duration = lizAtlasConfig.duration;
                if( !(parseInt(duration) > 0) )
                    duration = 5;
                var step = parseInt(duration) * 1000;
                if(step < 2 || step > 60000){
                    step = 5000;
                }

                // Run or stop animation
                if( a == '1' ){
                    // Click on the next button
                    $('button.liz-atlas-item[value="1"]').click();

                    // Change the run button value into 0
                    $(this).val(0);

                    // Change button look
                    $(this).text(lizDict['atlas.toolbar.stop']).addClass('btn-danger');

                    // Run timer
                    lizAtlasTimer = setInterval(function(){
                        // Click on then next button for each step
                        $('button.liz-atlas-item[value="1"]').click();
                    }, step);
                }else{
                    deactivateAtlas();
                }
            });
        }


        function runAtlasItem(feature){

            // Use OL tools to reproject feature geometry
            var format = new OpenLayers.Format.GeoJSON();
            var feat = format.read(feature)[0];
            var f = feat.clone();
            var proj = lizMap.config.layers[lizAtlasConfig.layername]['featureCrs'];
            f.geometry.transform(proj, lizMap.map.getProjection());

            // Zoom to feature
            if( lizAtlasConfig['zoom']){
                if( lizAtlasConfig['zoom'].toLowerCase() == 'center' ){
                    // center
                    var lonlat = f.geometry.getBounds().getCenterLonLat();
                    lizMap.map.setCenter(lonlat);
                }
                else{
                    // zoom
                    lizMap.map.zoomToExtent(f.geometry.getBounds());
                }
            }

            // Draw feature geometry
            var getLayer = lizMap.map.getLayersByName('locatelayer');
            if ( lizAtlasConfig.drawFeatureGeom && getLayer.length > 0 ){
                alayer = getLayer[0];
                alayer.destroyFeatures();
                alayer.addFeatures([f]);
            }

            // Display popup
            if( lizAtlasConfig['atlasDisplayPopup'] ){
                lizMap.getFeaturePopupContent(lizAtlasConfig.featureType, feature, function(data){
                    // Add class to table
                    var popupReg = new RegExp('lizmapPopupTable', 'g');
                    text = data.replace( popupReg, 'table table-condensed lizmapPopupTable');
                    var text = '<div class="lizmapPopupContent">'+text+'</div>';
                    // Remove <h4> with layer title
                    var titleReg = new RegExp('<h4>.+</h4>');
                    text = text.replace(titleReg, '');
                    $('#liz-atlas-item-detail').html(text).show();

                    // Trigger event ? a bit buggy
                    lizMap.events.triggerEvent("lizmappopupdisplayed", {'popup': null} );

                    // Add children
                    lizMap.addChildrenFeatureInfo(data);

                });
            }


            // Trigger Filter
            if( lizAtlasConfig['triggerFilter'] ){

                var fid = feature.id.split('.').pop();

                // Select feature
                lizMap.events.triggerEvent('layerfeatureselected',
                    {'featureType': lizAtlasConfig.featureType, 'fid': fid, 'updateDrawing': false}
                );
                // Filter selected feature
                lizMap.events.triggerEvent('layerfeaturefilterselected',
                    {'featureType': lizAtlasConfig.featureType}
                );
            }


        }


        function deactivateAtlas(){
            // Stop animation
            if( lizAtlasTimer ){
                var btrun = $('#atlas div.menu-content button.liz-atlas-run');
                // Change button value
                btrun.val(1);

                // Change button look
                btrun.text(lizDict['atlas.toolbar.play']).removeClass('btn-danger');

                // Reset interval and time
                clearInterval(lizAtlasTimer);
                lizAtlasTimer = null;
            }

            // Deactivate highlight
            var layer = lizMap.map.getLayersByName('locatelayer');
            if ( lizAtlasConfig.drawFeatureGeom && layer.length > 0 ){
                layer = layer[0];
                layer.destroyFeatures();
            }

            // Deactivate filter
            if ( lizAtlasConfig.triggerFilter && lizMap.lizmapLayerFilterActive ){
                lizMap.events.triggerEvent( "layerfeatureremovefilter",
                    { 'featureType': lizAtlasConfig.featureType}
                );
            }

            // Hide some containers
            $('#liz-atlas-item-detail').hide();
        }

        // Launch Atlas feature
        getAtlasData(lizAtlasConfig.layername);


        } // uicreated
    });


}();
