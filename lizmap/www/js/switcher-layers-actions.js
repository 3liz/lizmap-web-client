var lizLayerActionButtons = function() {

    function fillSubDock( html ){
        $('#sub-dock').html( html );
        $('#sub-dock i.close').click(function(){
            $('#sub-dock').hide();
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
            html+= '        <dt>'+lizDict['layer.metadata.layer.abstract']+'</dt>';
            if( layerConfig.abstract ){
                html+= '        <dd>'+layerConfig.abstract+'</dd>';
                html+= '        <dt>'+lizDict['layer.metadata.layer.link']+'</dt>';
            }
            var displayLink = false;
            if( displayLink && layerConfig.link  ){
                html+= '        <dd><a href="'+layerConfig.link+'" target="_blank">'+lizDict['layer.metadata.layer.info.see']+'</a></dd>';
                html+= '    </dl>';
            }

            html+= '</div>';
            html+= '</div>';
        }

        return html;
    }

    lizMap.events.on({

    'uicreated': function(evt){

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
            }else{
                $('#sub-dock').hide().html( '' );
            }

            return false;
        });


        $('#layerActionZoom').click(function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            return false;
        });


        $('#layerActionExport').click(function(){
            var layerName = $(this).val();
            if( !layerName )
                return false;

            return false;
        });

    },
    'lizmapswitcheritemselected': function(evt){

        // Get item properties
        var itemConfig = null;
        var itemName = '';
        var itemType = evt.type;
        var itemSelected = evt.selected;

        // Get item Lizmap config
        $.each(lizMap.config.layers, function( layerName, layerConfig) {
            if (itemConfig == null && lizMap.cleanName( layerName ) == evt.name){
                itemConfig = layerConfig;
                itemName = layerName;
                return false;
            }
        });

        if( !itemConfig )
            return false;

        // Change action buttons values
        var btValue = itemName;
        if( !itemSelected )
            btValue = '';
        $('#switcher-layers-actions button').val( btValue );

        // Toggle buttons depending on itemType
        // Metadata
        $('#layerActionMetadata').attr( 'disable', !itemSelected ).toggleClass( 'ui-state-disabled', !itemSelected );

        // Zoom to layer
        $('#layerActionZoom').attr( 'disable', (itemType == 'group' || !itemSelected) ).toggleClass( 'ui-state-disabled', (itemType == 'group' || !itemSelected) );

        // Export layer
        $('#layerActionExport').attr( 'disable', (itemType == 'group' || !itemSelected) ).toggleClass( 'ui-state-disabled', (itemType == 'group' || !itemSelected) );

        // Refresh sub-dock content
        if( $('#sub-dock .sub-metadata').length ){
            if( itemSelected ){
                var html = getLayerMetadataHtml( itemName );
                fillSubDock( html );
            }else{
                $('#sub-dock').hide();
            }
        }

    }

    });

}();
