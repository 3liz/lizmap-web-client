var lizLayerActionButtons = function() {

    var tooltipControl = null;
    var tooltipLayers = [];
    var featureTypes = null;

    function fillSubDock( html ){
        $('#sub-dock').html( html );
        $('#sub-dock i.close').click(function(){
            $('#sub-dock').hide();
        });

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

    }

    function getLayerMetadataHtml( aName ){

        var html = '';

        if( aName in lizMap.config.layers ){
            var layerConfig = lizMap.config.layers[aName];

            // Header
            html+= '<div class="sub-metadata">';
            html+= '<h3>';
            html+='    <span class="title">';
            html+='        <span class="icon"></span>';
            html+='        <span class="text">'+lizDict['layer.metadata.title']+'</span>';
            html+='        <i class="pull-right close icon-remove icon-white"></i>';
            html+='    </span>';
            html+='</h3>';

            // Content
            html+= '<div class="menu-content">';

            html+= '    <dl class="dl-vertical" style="font-size:0.8em;">';
            html+= '        <dt>'+lizDict['layer.metadata.layer.name']+'</dt>';
            html+= '        <dd>'+layerConfig.title+'</dd>';
            html+= '        <dt>'+lizDict['layer.metadata.layer.type']+'</dt>';
            html+= '        <dd>'+lizDict['layer.metadata.layer.type.' + layerConfig.type]+'</dd>';
            if( layerConfig.abstract ){
                html+= '        <dt>'+lizDict['layer.metadata.layer.abstract']+'</dt>';
                html+= '        <dd>'+layerConfig.abstract+'</dd>';
            }
            html+= '    </dl>';
            if( layerConfig.link ){
                html+= '    <button class="btn link" name="link" title="'+lizDict['layer.metadata.layer.info.see']+'" value="'+layerConfig.link+'">'+lizDict['layer.metadata.layer.info.see']+'</button>';
            }

            html+= '</div>';
            html+= '</div>';
        }

        return html;
    }

    // Bind click on layer style selector
    function onStyleSelection( bindClick ){
        $('#switcher-layers-actions a.btn-style-layer').unbind('click');

        if( !bindClick )
            return false;

        $('#layerActionStyle').click(function() {
            var self = $(this);
            var eName = self.val();
            if( !eName )
                return false;

            var cleanName = lizMap.cleanName(eName);
            var getLayer = lizMap.map.getLayersByName( cleanName );
            if( !getLayer )
                return false;

            var oLayer = getLayer[0];
            if( oLayer && 'STYLES' in oLayer.params){
                var selectedStyle = oLayer.params['STYLES'];
                var selectedLi = $('#switcher ul.list-style-layer li.selected');
                var dataStyle = '';
                if( selectedLi.length > 0 )
                    dataStyle = selectedLi.attr('data-style');
                if ( selectedStyle != dataStyle ) {
                    selectedLi.removeClass('selected').find('i').remove();
                    $('#switcher ul.list-style-layer li[data-style="'+selectedStyle+'"]').addClass('selected').find('a').prepend('<i class="icon-check"></i> ');
                }
            }

            var scrollInterval = window.setInterval( function(){
                if ( $('#switcher ul.list-style-layer li.selected').length > 0 )
                    $('#switcher ul.list-style-layer li').each(function(i,e){
                        if($(e).hasClass('selected')) {
                            $('#switcher ul.list-style-layer').scrollTop(i*$(e).height());
                            window.clearInterval(scrollInterval);
                        }
                    });
                else
                    window.clearInterval(scrollInterval);
            }, 100);
        });

        $('#switcher-layers-actions a.btn-style-layer').click(function(){
            var self = $(this);
            var eStyle = self.parent().attr('data-style');

            var eName = $('#layerActionStyle').val();
            if( !eName )
                return false;

            var cleanName = lizMap.cleanName(eName);
            var getLayer = lizMap.map.getLayersByName( cleanName );
            if( !getLayer )
                return false;

            var oLayer = getLayer[0];
            if( oLayer && eStyle != ''){
                oLayer.params['STYLES'] = eStyle;
                oLayer.redraw( true );
                self.parent().parent().find('li.selected').removeClass('selected').find('i').remove();
                self.parent().addClass('selected').find('a').prepend('<i class="icon-check"></i> ');

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
        $('#switcher-layers-actions .btn').tooltip( {
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

        // Activate switcher-layers-actions button
        $('#layerActionMetadata').click(function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            var subDockVisible = ( $('#sub-dock').css('display') != 'none' );

            if( !subDockVisible ){
                var html = getLayerMetadataHtml( layerName );

                if( !lizMap.checkMobile() ){
                    var leftPos = lizMap.getDockRightPosition();
                    $('#sub-dock').css('left', leftPos).css('width', leftPos);
                }
                fillSubDock( html );
                $('#sub-dock').show();
                $(this).addClass('active');
            }else{
                $('#sub-dock').hide().html( '' );
                $(this).removeClass('active');
            }

            return false;
        });

        $('#layerActionZoom').click(function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            var itemConfig = lizMap.config.layers[layerName];
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
            return false;
        });

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
                $('#layerActionExport ~ ul.dropdown-menu').append(exportHTML);
        } else {
            $('#layerActionExport').parent().remove();
        }

        // Export action
        $('#switcher-layers-actions a.btn-export-layer').click(function(){
            var eFormat = $(this).text();
            if( eFormat == 'GML' )
                eFormat = 'GML3';
            var eName = $('#layerActionExport').val();
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
        var itemName = '';
        var itemType = evt.type;
        var itemSelected = evt.selected;
        var itemConfig = {};

        // Get item Lizmap config
        var layerName = lizMap.getLayerNameByCleanName( evt.name );
        if( layerName ){
            itemName = layerName;
            itemConfig = lizMap.config.layers[layerName];
        }
        else{
            return false;
        }

        // Change action buttons values
        var btValue = itemName;
        if( !itemSelected )
            btValue = '';
        $('#switcher-layers-actions button').val( btValue );

        // Toggle buttons depending on itemType

        // Metadata
        $('#layerActionMetadata').attr( 'disable', !itemSelected ).toggleClass( 'disabled', !itemSelected );

        // Zoom to layer
        $('#layerActionZoom').attr( 'disable', (itemType == 'group' || !itemSelected) || !('extent' in itemConfig) ).toggleClass( 'disabled', (itemType == 'group' || !itemSelected || !('extent' in itemConfig) ) );

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
        $('#layerActionExport').attr( 'disable', !showExport ).toggleClass( 'disabled', !showExport );


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
            var selectedStyle = '';
            var oLayer = lizMap.map.getLayersByName( evt.name )[0];
            if( oLayer && 'STYLES' in oLayer.params) {
                selectedStyle = oLayer.params['STYLES'];
            }
            for( var st in itemConfig.styles ){
                styleHtml += '<li data-style="'+itemConfig.styles[st]+'"';
                if( itemConfig.styles[st] == selectedStyle ) styleHtml += ' class="selected"';
                styleHtml += '>';
                styleHtml += '<a href="#" class="btn-style-layer">';
                if( itemConfig.styles[st] == selectedStyle ) styleHtml += '<i class="icon-check"></i> ';
                styleHtml += itemConfig.styles[st];
                '</a>';
                styleHtml += '</li>';
            }
        }
        $('#layerActionStyle').next('ul:first').addClass('list-style-layer').html( styleHtml );
        onStyleSelection(showStyles);
        $('#layerActionStyle').attr( 'disable', !showStyles ).toggleClass( 'disabled', !showStyles );



        // Refresh sub-dock content
        if( $('#sub-dock .sub-metadata').length ){
            if( itemSelected ){
                var html = getLayerMetadataHtml( itemName );
                fillSubDock( html );
            }else{
                $('#sub-dock').hide();
                $('#layerActionMetadata').removeClass('active');
            }
        }

    }

    });
        //console.log($('#layers-unfold-all').length);

}();
