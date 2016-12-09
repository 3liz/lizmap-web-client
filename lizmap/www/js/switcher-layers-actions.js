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
            if('type' in itemConfig)
                var itemType = itemConfig.type;
            else
                var itemType = 'baselayer';

            lizMap.events.triggerEvent(
                "lizmapswitcheritemselected",
                { 'name': itemName, 'type': itemType, 'selected': false}
            );

            $('#switcher tr.selected').removeClass('selected');
        });

    }

    function getLayerMetadataHtml( aName ){

        var html = ''; var metadatas = null;
        if( aName in lizMap.config.layers ){
            var layerConfig = lizMap.config.layers[aName];
            metadatas = {
                title: layerConfig.title,
                type: layerConfig.type,
                abstract: null,
                link: null,
                isBaselayer: false
            };
            if(layerConfig.abstract &&  layerConfig.abstract)
                metadatas.abstract = layerConfig.abstract;
            if( layerConfig.link  )
                metadatas.link = layerConfig.link
        }
        if( lizMap.map.baseLayer && lizMap.map.baseLayer.name == aName ){
            metadatas.abstract = metadatas.title;
            metadatas.type = 'layer';
            metadatas.link = null;
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
            if( metadatas.abstract){
                html+= '        <dt>'+lizDict['layer.metadata.layer.abstract']+'</dt>';
                html+= '        <dd>'+metadatas.abstract+'</dd>';
            }

            // Tools
            if( metadatas.type == 'layer'){
                // Zoom
                html+= '        <dt>'+lizDict['layer.metadata.zoomToExtent.title']+'</dt>';
                html+= '<dd><button class="btn btn-mini layerActionZoom" title="'+lizDict['layer.metadata.zoomToExtent.title']+'" value="'+aName+'"><i class="icon-zoom-in"></i></button></dd>';

                // Opacity
                html+= '        <dt>'+lizDict['layer.metadata.opacity.title']+'</dt>';
                html+= '<dd>';
                isBaselayer = '';
                if(metadatas.isBaselayer)
                    isBaselayer = 'baselayer';
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
            }

            html+= '    </dl>';




            // Link
            if( metadatas.link  ){
                html+= '    <button class="btn link" name="link" title="'+lizDict['layer.metadata.layer.info.see']+'" value="'+metadatas.link+'">'+lizDict['layer.metadata.layer.info.see']+'</button>';
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
            $(this).addClass('active');
        }



    }

    // Bind click on layer style selector
    function onStyleSelection( bindClick ){
        $('#switcher-layers-actions a.btn-style-layer').unbind('click');

        if( !bindClick )
            return false;

        $('#switcher-layers-actions a.btn-style-layer').click(function(){
            var eStyle = $(this).text();

            var eName = $('button.layerActionStyle').val();
            if( !eName )
                return false;

            var cleanName = lizMap.cleanName(eName);
            var getLayer = lizMap.map.getLayersByName( cleanName );
            if( !getLayer )
                return false;

            var oLayer = lizMap.map.getLayersByName( cleanName )[0];
            if( oLayer && eStyle != ''){
                oLayer.params['STYLES'] = eStyle;
                oLayer.redraw( true );

                lizMap.events.triggerEvent(
                    "layerstylechanged",
                    { 'featureType': eName}
                );
            }

            $('#switcher').click(); // blur dropdown
            return false;
        });
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

            itemConfig = lizMap.config.layers[layerName];
            if( itemConfig.type == 'group' || !( 'extent' in itemConfig ) || !( 'crs' in itemConfig ) )
                return false;

            var lex = itemConfig['extent'];
            var lBounds = new OpenLayers.Bounds(
                lex[0],
                lex[1],
                lex[2],
                lex[3]
            );
            var layerProj = new OpenLayers.Projection( itemConfig.crs );
            var mapProj = lizMap.map.getProjectionObject();
            mapProj = new OpenLayers.Projection( 'EPSG:3857' );
            lBounds.transform(
                layerProj,
                mapProj
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
                var layer = lizMap.map.getLayersByName( lizMap.cleanName(eName) )[0];
            }

            // Set opactity
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
        if ( 'exportLayers' in lizMap.config.options && lizMap.config.options.exportLayers == 'True' ) {
            var exportFormats = lizMap.getVectorLayerResultFormat();
            var exportHTML = '';
            for ( var i=0, len=exportFormats.length; i<len; i++ ) {
                var format = exportFormats[i].tagName;
                if ( format != 'GML2' && format != 'GML3' && format != 'GEOJSON' ) {
                    exportHTML += '        <li><a href="#" class="btn-export-layer">'+format+'</a></li>';
                }
            }
            if ( exportHTML != '' )
                $('button.layerActionExport ~ ul.dropdown-menu').append(exportHTML);
        } else {
            $('button.layerActionExport').parent().remove();
        }
        // click on one export format option
        $('#switcher-layers-actions a.btn-export-layer').click(function(){
            var eFormat = $(this).text();
            if( eFormat == 'GML' )
                eFormat = 'GML3';
            var eName = $('button.layerActionExport').val();
            if( !eName )
                return false;
            lizMap.exportVectorLayer( eName, eFormat );
            $('#switcher').click(); // blur dropdown
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

    },
    'lizmapswitcheritemselected': function(evt){

        // Get item properties
        var itemConfig = null;
        var itemName = '';
        var itemType = evt.type;
        var itemSelected = evt.selected;
        var itemConfig = {};

        // Get item Lizmap config
        if( itemType == 'baselayer'){
            itemName = evt.name;
        }else{
            var layerName = lizMap.getLayerNameByCleanName( lizMap.cleanName(evt.name) );
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
        var zoomStatus = (itemType == 'group' || !itemSelected || !('extent' in itemConfig) );
        $('button.layerActionZoom').attr( 'disable', zoomStatus ).toggleClass( 'disabled', zoomStatus );

        // Opacity
        var opacityStatus = (itemType == 'group' || !itemSelected);
        $('button.layerActionOpacity').attr( 'disable', opacityStatus ).toggleClass( 'disabled', opacityStatus );
        $('a.btn-opacity-layer').attr( 'disable', opacityStatus ).toggleClass( 'disabled', opacityStatus );

        // Export layer
        // Only if layer is in attribute table
        var showExport = false;

        if( featureTypes.length != 0
            && itemType == 'layer'
            && itemSelected
            && itemName
        ){
            featureTypes.each( function(){
                var self = $(this);
                var typeName = self.find('Name').text();
                if ( typeName == itemName )
                    showExport = true;
                else if (typeName == itemName.split(' ').join('_') )
                    showExport = true;
            });
        }
        $('button.layerActionExport').attr( 'disable', !showExport ).toggleClass( 'disabled', !showExport );


        // Layer style
        // Only if layer has styles defined
        var showStyles = false;
        var styleHtml = '';
        if(
            itemType == 'layer'
            && itemSelected
            && 'styles' in itemConfig
        ){
            showStyles = true;
            for( var st in itemConfig.styles ){
                styleHtml += '<li><a href="#" class="btn-style-layer">'+itemConfig.styles[st]+'</a></li>';
            }
        }
        $('button.layerActionStyle').next('ul:first').html( styleHtml );
        onStyleSelection(showStyles);
        $('button.layerActionStyle').attr( 'disable', !showStyles ).toggleClass( 'disabled', !showStyles );


        // Refresh sub-dock content
        toggleMetadataSubDock(itemName, itemSelected);

    }

    });
        //console.log($('#layers-unfold-all').length);

}();
