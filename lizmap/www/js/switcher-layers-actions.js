var lizLayerActionButtons = function() {

    var tooltipControl = null;
    var tooltipLayers = [];
    var featureTypes = null;
    var opacityLayers = {};

    function fillSubDock( html ){
        $('#sub-dock').html( html );

        // Style opacity button
        $('#sub-dock a.btn-opacity-layer').each(function(){
            var v = $(this).text();
            var op = parseInt(v) / 100 - 0.3;
            $(this).css('background-color', 'rgba(0,0,0,'+op+')' );
            $(this).css('background-image', 'none');
            $(this).css('text-shadow', 'none');
            if( parseInt(v) > 60 )
                $(this).css('color', 'lightgrey');
        })

        // activate link buttons
        $('div.sub-metadata button.link')
        .click(function(){

          var self = $(this);
          if (self.hasClass('disabled'))
            return false;
          var windowLink = self.val();
          // Test if the link is internal
          var mediaRegex = /^(\/)?media\//;
          if(mediaRegex.test(windowLink)){
            var mediaLink = OpenLayers.Util.urlAppend(lizUrls.media
              ,OpenLayers.Util.getParameterString(lizUrls.params)
            )
            windowLink = mediaLink+'&path=/'+windowLink;
          }
          // Open link in a new window
          window.open(windowLink);
        });

        $('#hide-sub-dock').click(function(){
            var itemName = $(this).val();
            var itemConfig = lizMap.config.layers[itemName];
            var itemType = 'baselayer';
            if('type' in itemConfig)
                itemType = itemConfig.type;

            lizMap.events.triggerEvent(
                "lizmapswitcheritemselected",
                { 'name': itemName, 'type': itemType, 'selected': false}
            );

            $('#switcher tr.selected').removeClass('selected');
        });

    }

    function getLayerMetadataHtml( aName ){
        var html = '';
        var metadatas = {
            title: aName,
            type: 'layer',
            abstract: null,
            link: null,
            styles: null,
            isBaselayer: false
        };
        if( aName in lizMap.config.layers ){
            var layerConfig = lizMap.config.layers[aName];
            metadatas.title = layerConfig.title;
            metadatas.type = layerConfig.type;
            if( layerConfig.abstract )
                metadatas.abstract = layerConfig.abstract;
            if( layerConfig.link  )
                metadatas.link = layerConfig.link;
            if( layerConfig.styles  )
                metadatas.styles = layerConfig.styles
        }
        if( lizMap.map.baseLayer && lizMap.map.baseLayer.name == aName ){
            metadatas.type = 'layer';
            metadatas.isBaselayer = true;
        }

        if( metadatas ){
            var layerConfig = lizMap.config.layers[aName];

            // Header
            html+= '<div class="sub-metadata">';
            html+= '<h3>';
            html+='    <span class="title">';
            html+='        <span class="icon"></span>';
            html+='        <span class="text">'+lizDict['layer.metadata.title']+'</span>';
            html+='    </span>';
            html+='</h3>';

            // Content
            html+= '<div class="menu-content">';

            // Metadata
            html+= '    <dl class="dl-vertical" style="font-size:0.8em;">';
            html+= '        <dt>'+lizDict['layer.metadata.layer.name']+'</dt>';
            html+= '        <dd>'+metadatas.title+'</dd>';
            html+= '        <dt>'+lizDict['layer.metadata.layer.type']+'</dt>';
            html+= '        <dd>'+lizDict['layer.metadata.layer.type.' + metadatas.type]+'</dd>';

            // Zoom
            html+= '        <dt>'+lizDict['layer.metadata.zoomToExtent.title']+'</dt>';
            html+= '<dd><button class="btn btn-mini layerActionZoom" title="'+lizDict['layer.metadata.zoomToExtent.title']+'" value="'+aName+'"><i class="icon-zoom-in"></i></button></dd>';

            // Tools
            if( metadatas.type == 'layer'){


                var isBaselayer = '';
                if(metadatas.isBaselayer)
                    isBaselayer = 'baselayer';

                // Styles
                if( metadatas.styles ){
                    var selectedStyle = '';
                    var oLayer = lizMap.map.getLayersByName( aName )[0];
                    if( oLayer && 'STYLES' in oLayer.params) {
                        selectedStyle = oLayer.params['STYLES'];
                    }
                    options = '';
                    for( var st in metadatas.styles ){
                        st = metadatas.styles[st];
                        if( st == selectedStyle )
                            options += '<option value="'+st+'" selected>'+st+'</option>';
                        else
                            options += '<option value="'+st+'">'+st+'</option>';
                    }
                    if( options != '' ){
                        html+= '        <dt>'+lizDict['layer.metadata.style.title']+'</dt>';
                        html+= '<dd>';
                        html+= '<input type="hidden" class="styleLayer '+isBaselayer+'" value="'+aName+'">';
                        html+= '<select class="styleLayer '+isBaselayer+'">';
                        html+= options;
                        html+= '</select>';
                        html+= '</dd>';
                    }
                }

                // Opacity
                html+= '        <dt>'+lizDict['layer.metadata.opacity.title']+'</dt>';
                html+= '<dd>';
                var currentOpacity = 1;
                if( aName in opacityLayers ){
                    currentOpacity = opacityLayers[aName];
                }
                html+= '<input type="hidden" class="opacityLayer '+isBaselayer+'" value="'+aName+'">';
                var opacities = [0.2, 0.4, 0.6, 0.8, 1];
                for ( var i=0, len=opacities.length; i<len; i++ ) {
                    var oactive = '';
                    if(currentOpacity == opacities[i])
                        oactive = 'active';
                    html+= '<a href="#" class="btn btn-mini btn-opacity-layer '+ oactive+' '+ opacities[i]*100+'">'+opacities[i]*100+'</a>';
                }
                html+= '</dd>';

                // Export
                if ( 'exportLayers' in lizMap.config.options
                  && lizMap.config.options.exportLayers == 'True'
                  && featureTypes != null
                  && featureTypes.length != 0 ) {
                    var exportFormats = lizMap.getVectorLayerResultFormat();
                    var options = '';
                    for ( var i=0, len=exportFormats.length; i<len; i++ ) {
                        var format = exportFormats[i].tagName;
                        options += '<option value="'+format+'">'+format+'</option>';
                    }
                    // Export layer
                    // Only if layer is in attribute table
                    var showExport = false;
                    if( options != '' ) {
                        featureTypes.each( function(){
                            var self = $(this);
                            var typeName = self.find('Name').text();
                            if ( typeName == aName ) {
                                showExport = true;
                                return false;
                            } else if (typeName == aName.split(' ').join('_') ) {
                                showExport = true;
                                return false;
                            }
                        });
                    }
                    if( showExport ) {
                        html+= '        <dt>'+lizDict['layer.metadata.export.title']+'</dt>';
                        html+= '<dd>';
                        html+= '<select class="exportLayer '+isBaselayer+'">';
                        html+= options;
                        html+= '</select>';
                        html+= '<button class="btn btn-mini exportLayer '+isBaselayer+'" title="'+lizDict['layer.metadata.export.title']+'" value="'+aName+'"><i class="icon-download"></i></button>';
                        html+= '</dd>';
                    }
                }
            }

            if( metadatas.abstract ){
                html+= '        <dt>'+lizDict['layer.metadata.layer.abstract']+'</dt>';
                html+= '        <dd>'+metadatas.abstract+'</dd>';
            }

            html+= '    </dl>';




            // Link
            if( metadatas.link  ){
                html+= '    <button class="btn link layer-info" name="link" title="'+lizDict['layer.metadata.layer.info.see']+'" value="'+metadatas.link+'">'+lizDict['layer.metadata.layer.info.see']+'</button>';
            }

            // Style


            html+= '</div>';
            html+= '</div>';
            html+= '<button id="hide-sub-dock" class="btn btn-mini pull-right" style="margin-top:5px;" name="close" title="'+lizDict['generic.btn.close.title']+'" value="'+aName+'">'+lizDict['generic.btn.close.title']+'</button>';
        }

        return html;
    }

    function toggleMetadataSubDock(layerName, selected){
        if( selected ){
            var html = getLayerMetadataHtml( layerName );
            fillSubDock( html );
        }else{
            $('#sub-dock').hide().html( '' );
            return;
        }

        var subDockVisible = ( $('#sub-dock').css('display') != 'none' );
        if( !subDockVisible ){
            if( !lizMap.checkMobile() ){
                var leftPos = lizMap.getDockRightPosition();
                $('#sub-dock').css('left', leftPos).css('width', leftPos);
            }
            $('#sub-dock').show();

            var mh = $('#sub-dock').height();
            mh -= parseInt($('#sub-dock').css('padding-top'));
            mh -= parseInt($('#sub-dock').css('padding-bottom'));
            mh -= $('#sub-dock > .sub-metadata > h3').outerHeight();
            mh -= parseInt($('#sub-dock > .sub-metadata > h3').css('margin-bottom'));
            mh -= $('#sub-dock > button').outerHeight();
            mh -= parseInt($('#sub-dock > button').css('margin-top'));
            mh -= parseInt($('#sub-dock > .sub-metadata > .menu-content').css('padding-top'));
            mh -= parseInt($('#sub-dock > .sub-metadata > .menu-content').css('padding-bottom'));
            $('#sub-dock > .sub-metadata > .menu-content')
                .css('max-height', mh)
                .css('overflow', 'auto');

            $(this).addClass('active');
        }



    }

    lizMap.events.on({

    'uicreated': function(evt){

        featureTypes = lizMap.getVectorLayerFeatureTypes();

        // title tooltip
        $('#switcher-layers-actions .btn, #get-baselayer-metadata').tooltip( {
            placement: 'bottom'

        } );


        // Expand all of unfold all
        $('#layers-unfold-all').click(function(){
            $('#switcher table.tree tr:not(.liz-layer.disabled) a.expander').click();
            return false;
        });
        $('#layers-fold-all').click(function(){
            $('#switcher table.tree').collapseAll();
            return false;
        });



        // Activate get-baselayer-metadata button
        $('#get-baselayer-metadata').click(function(){

            $('#hide-sub-dock').click();

            if( !lizMap.map.baseLayer)
                return false;
            var layerName = lizMap.map.baseLayer.name;
            if( !layerName )
                return false;
            lizMap.events.triggerEvent(
                "lizmapswitcheritemselected",
                { 'name': layerName, 'type': 'baselayer', 'selected': true}
            );

            return false;
        });


        // Zoom
        $('#content').on('click', 'button.layerActionZoom', function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            var itemConfig = lizMap.config.layers[layerName];
            if( itemConfig.type == 'baselayer' )
                lizMap.map.zoomToMaxExtent();

            var mapProjection = lizMap.map.getProjection();
            if(mapProjection == 'EPSG:900913')
                mapProjection = 'EPSG:3857';

            if( !( 'bbox' in itemConfig ) || !( mapProjection in itemConfig['bbox'] ) ){
                console.log('The layer bbox information has not been found in config');
                console.log(itemConfig);
                return false;
            }

            var lex = itemConfig['bbox'][mapProjection]['bbox'];
            var lBounds = new OpenLayers.Bounds(
                lex[0],
                lex[1],
                lex[2],
                lex[3]
            );
            lizMap.map.zoomToExtent( lBounds );

            // Close subdock and dock
            if( lizMap.checkMobile() ){
                $('#hide-sub-dock').click();
                $('#button-switcher').click();
            }
            return false;
        });


        // Opacity
        $('#content').on('change', 'select.styleLayer', function(){

            // Get chosen style
            var eStyle = $(this).val();

            // Get layer name and type
            var h = $(this).parent().find('input.styleLayer');
            var eName = h.val();
            var isBaselayer = h.hasClass('baselayer');
            if( !eName )
                return false;

            // Get layer
            var layer = null;
            if( isBaselayer){
                layer = lizMap.map.baseLayer;
            }else{
                layer = lizMap.map.getLayersByName( lizMap.cleanName(eName) )[0];
            }

            // Set style
            if( layer && layer.params) {
                layer.params['STYLES'] = eStyle;
                layer.redraw( true );

                lizMap.events.triggerEvent(
                    "layerstylechanged",
                    { 'featureType': eName}
                );
            }
        });


        // Opacity
        $('#content').on('click', 'a.btn-opacity-layer', function(){

            // Get chosen opacity
            var eVal = $(this).text();
            var opacity = parseInt(eVal) / 100;

            // Get layer name and type
            var h = $(this).parent().find('input.opacityLayer');
            var eName = h.val();
            var isBaselayer = h.hasClass('baselayer');
            if( !eName )
                return false;

            // Get layer
            var layer = null;
            if( isBaselayer){
                layer = lizMap.map.baseLayer;
            }else{
                layer = lizMap.map.getLayersByName( lizMap.cleanName(eName) )[0];
            }

            // Set opacity
            if( layer && layer.params) {
                layer.setOpacity(opacity);
                opacityLayers[eName] = opacity;
                $('a.btn-opacity-layer').removeClass('active');
                $('a.btn-opacity-layer.' + opacity*100).addClass('active');
            }

            // Blur dropdown or baselayer button
            $('#switcher').click();

            // Close subdock and dock
            if( lizMap.checkMobile() ){
                $('#hide-sub-dock').click();
                $('#button-switcher').click();
            }
            return false;
        });


        // Export
        $('#content').on('click', 'button.exportLayer', function(){
            var eName = $(this).val();
            var eFormat = $(this).parent().find('select.exportLayer').val();
            lizMap.exportVectorLayer( eName, eFormat );
            return false;
        });

        // Cancel Lizmap global filter
        $('#layerActionUnfilter').click(function(){
            var layerName = lizMap.lizmapLayerFilterActive;
            if( !layerName )
                return false;

            lizMap.events.triggerEvent(
                "layerfeatureremovefilter",
                { 'featureType': layerName}
            );
            lizMap.lizmapLayerFilterActive = null;
            $(this).hide();

            return false;
        });

        lizMap.events.on({
            dockclosed: function(e) {
                if ( e.id == 'switcher' ) {
                    $('#hide-sub-dock').click();
                }
            },
            lizmapbaselayerchanged: function(e) {
                if ( $('#sub-dock').is(':visible') ) {
                    var subDockLayer = $('#hide-sub-dock').val();
                    if ( $('#switcher-baselayer-select').find('option[value="'+subDockLayer+'"]').length != 0 ) {
                        if ( subDockLayer != $('#switcher-baselayer-select').val() ) {
                            lizMap.events.triggerEvent(
                                "lizmapswitcheritemselected",
                                { 'name': e.layer.name, 'type': 'baselayer', 'selected': true}
                            );
                        }
                    }
                }
            }
        });

    },
    'lizmapswitcheritemselected': function(evt){

        // Get item properties
        var itemName = evt.name;
        var itemType = evt.type;
        var itemSelected = evt.selected;
        var itemConfig = {};
        // Get item Lizmap config
        if( itemType == 'baselayer'){
            var layerName = lizMap.getLayerNameByCleanName( lizMap.cleanName(itemName) );
            if( layerName ){
                itemName = layerName;
            }
        }else{
            var layerName = lizMap.getLayerNameByCleanName( lizMap.cleanName(itemName) );
            if( layerName ){
                itemName = layerName;
                itemConfig = lizMap.config.layers[layerName];
            }
            else{
                return false;
            }

        }

        // Change action buttons values
        var btValue = itemName;
        if( !itemSelected )
            btValue = '';
        $('#switcher-layers-actions button').val( btValue );

        // Toggle buttons depending on itemType

        // Zoom to layer
        var zoomStatus = (!itemSelected || !('bbox' in itemConfig) );
        $('button.layerActionZoom').attr( 'disable', zoomStatus ).toggleClass( 'disabled', zoomStatus );

        // Refresh sub-dock content
        toggleMetadataSubDock(itemName, itemSelected);

    }

    });
        //console.log($('#layers-unfold-all').length);

}();
