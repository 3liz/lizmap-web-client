/**
 * @module legacy/switch-layers-actions.js
 * @name Switch layer actions
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

var lizLayerActionButtons = function() {

    var featureTypes = null;

    /**
     *
     * @param html
     */
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
                    var mediaLink = globalThis['lizUrls'].media + '?' + new URLSearchParams(globalThis['lizUrls'].params);
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

            lizMap.events.triggerEvent("lizmapswitcheritemselected",
                { 'name': itemName, 'type': itemType, 'selected': false}
            );

            document.querySelector('lizmap-treeview').itemNameSelected = undefined;
        });
    }

    /**
     *
     * @param aName
     */
    function getLayerMetadataHtml( aName ){
        var html = '';
        var metadatas = {
            title: aName,
            type: 'layer',
            abstract: null,
            link: null,
            styles: null,
            isBaselayer: false,
            actions: null
        };
        if( aName in lizMap.config.layers ){
            var layerConfig = lizMap.config.layers[aName];
            metadatas.title = layerConfig.title;
            metadatas.type = layerConfig.type;
            if( layerConfig.abstract )
                metadatas.abstract = layerConfig.abstract;
            if( layerConfig.link  )
                metadatas.link = layerConfig.link;
            if( layerConfig.styles && layerConfig.styles.length > 1 )
                metadatas.styles = layerConfig.styles

            // Add actions
            let layerActions = lizMap.mainLizmap.action.getActions('layer', layerConfig.id);
            if (layerActions.length) metadatas.actions = layerActions;

        }
        if( lizMap.mainLizmap.map.getActiveBaseLayer()?.get("name") == aName ){
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
            html+= '<dd><button class="btn btn-sm layerActionZoom" title="'+lizDict['layer.metadata.zoomToExtent.title']+'" value="'+aName+'"><i class="icon-zoom-in"></i></button></dd>';

            // Tools
            var isBaselayer = '';
            if(metadatas.isBaselayer){
                isBaselayer = 'baselayer';
            }

            // Styles
            if( metadatas.styles ){
                const layer = lizMap.mainLizmap.state.rootMapGroup.getMapLayerByName(aName);
                options = '';
                for( var st in metadatas.styles ){
                    st = metadatas.styles[st];
                    if( st == layer.wmsSelectedStyleName )
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
            let isSingleWMSLayer = false;
            if (!metadatas.isBaselayer) {
                isSingleWMSLayer = lizMap.mainLizmap.state.rootMapGroup.getMapLayerOrGroupByName(aName).singleWMSLayer;
            }
            if (!isSingleWMSLayer) {
                html+= '        <dt>'+lizDict['layer.metadata.opacity.title']+'</dt>';
                html+= '<dd>';
                html+= '<input type="hidden" class="opacityLayer '+isBaselayer+'" value="'+aName+'">';

                const currentOpacity = lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerOrGroupByName(aName).opacity;
                var opacities = lizMap.config.options.layersOpacities;
                if (typeof opacities === 'undefined') {
                    opacities = [0.2, 0.4, 0.6, 0.8, 1];
                }
                for ( var i=0, len=opacities.length; i<len; i++ ) {
                    var oactive = '';
                    if(currentOpacity == opacities[i])
                        oactive = 'active';
                    html+= '<a href="#" class="btn btn-sm btn-opacity-layer '+ oactive+' '+ opacities[i]*100+'">'+opacities[i]*100+'</a>';
                }
                html+= '</dd>';
            }

            // Export
            if ( 'exportLayers' in lizMap.config.options
                && lizMap.config.options.exportLayers == 'True'
                && featureTypes != null
                && featureTypes.length != 0 ) {
                var exportFormats = lizMap.mainLizmap.initialConfig.vectorLayerResultFormat;
                var options = '';
                for ( const format of exportFormats ) {
                    options += '<option value="'+format+'">'+format+'</option>';
                }
                // Export layer
                // Only if layer is in attribute table
                if( options != '' && layerConfig.typename != undefined) {
                    html+= '        <dt>'+lizDict['layer.metadata.export.title']+'</dt>';
                    html+= '<dd>';
                    html+= '<select class="exportLayer '+isBaselayer+'">';
                    html+= options;
                    html+= '</select>';
                    html+= '<button class="btn btn-sm exportLayer '+isBaselayer+'" title="'+lizDict['layer.metadata.export.title']+'" value="'+aName+'"><i class="icon-download"></i></button>';
                    html+= '</dd>';
                }
            }

            if( metadatas.abstract ){
                html+= '        <dt>'+lizDict['layer.metadata.layer.abstract']+'</dt>';
                html+= '        <dd>'+metadatas.abstract+'</dd>';
            }

            // Actions
            if (metadatas.actions) {
                html+= '        <dt>'+lizDict['action.title']+'</dt>';
                html += `
                <div class="layer-action-selector-container">
                    <lizmap-action-selector id="lizmap-layer-action-${layerConfig.id}" title="${lizDict['action.form.select.help']}"
                        no-selection-warning="${lizDict['action.form.select.warning']}"
                        action-scope="layer" action-layer-id="${layerConfig.id}"
                    ></lizmap-action-selector>
                <div>
                `;
            }

            html+= '    </dl>';

            // Link
            if( metadatas.link  ){
                html+= '    <button class="btn link layer-info" name="link" title="'+lizDict['layer.metadata.layer.info.see']+'" value="'+metadatas.link+'">'+lizDict['layer.metadata.layer.info.see']+'</button>';
            }

            // Style
            html+= '</div>';
            html+= '</div>';
            html+= '<button id="hide-sub-dock" class="btn btn-sm pull-right" name="close" title="'+lizDict['generic.btn.close.title']+'" value="'+aName+'">'+lizDict['generic.btn.close.title']+'</button>';
        }

        return html;
    }

    /**
     *
     * @param layerName
     * @param selected
     */
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
            $('#sub-dock').show();
        }
    }

    lizMap.events.on({

        'uicreated': function(){

            // Display theme switcher if any
            if ('themes' in lizMap.config){
                var themes = lizMap.config.themes;
                var themeSelector = '<div id="theme-selector" class="btn-group">';
                themeSelector += '<button class="btn btn-sm dropdown-toggle" data-bs-toggle="dropdown" type="button" aria-expanded="false" title="' + lizDict['switcherLayersActions.themeSelector.title'] +'"><i class="icon-none qgis_sprite mActionShowAllLayers"></i></button>';
                themeSelector += '<ul class="dropdown-menu">';

                for (var themeName in themes) {
                    themeSelector += '<li><button class="dropdown-item" type="button" data-theme="' + themeName + '">' + themeName + '</button></li>';
                }

                themeSelector += '</ul>';
                themeSelector += '</div>';

                $('#switcher-layers-actions').prepend(themeSelector);

                // Handle theme switching
                $('#theme-selector .dropdown-menu').on('click', 'button', function () {
                    // Set theme as active
                    $('#theme-selector button').removeClass('active');
                    $(this).addClass('active');

                    const themeNameSelected = $(this).text();

                    if (themeNameSelected in lizMap.config.themes){
                        const themeSelected = lizMap.config.themes[themeNameSelected];

                        // Groups and subgroups are separated by a '/'. We only keep deeper groups
                        const checkedGroups = themeSelected?.checkedGroupNode?.map(groupNode => groupNode.split('/').slice(-1)[0]) || [];
                        const expandedGroups = themeSelected?.expandedGroupNode?.map(groupNode => groupNode.split('/').slice(-1)[0]) || [];
                        const expandedLegendNodes = themeSelected?.expandedLegendNode || [];

                        // Set checked and expanded states
                        for (const layerOrGroup of lizMap.mainLizmap.state.layerTree.findTreeLayersAndGroups()) {
                            // Groups in theme are based on QGIS group (so groupAsLayer is not a layer but a group)
                            if (layerOrGroup.mapItemState.itemState.type === "group") {
                                layerOrGroup.checked = checkedGroups.includes(layerOrGroup.name);
                                layerOrGroup.expanded = expandedGroups.includes(layerOrGroup.name);
                            } else {
                                const layerParams = themeSelected?.layers?.[layerOrGroup.layerConfig.id];
                                if (!layerParams) {
                                    layerOrGroup.checked = false;
                                    continue;
                                }

                                const style = layerParams?.style;
                                if (style) {
                                    layerOrGroup.wmsSelectedStyleName = style;
                                }

                                layerOrGroup.checked = true;
                                layerOrGroup.expanded = layerParams?.expanded === "1" || layerParams?.expanded === true;

                                // `symbologyChildren` is empty for some time if the theme switches
                                // the layer style from simple to categorized.
                                // TODO: avoid this hack
                                setTimeout(() => {
                                    // Handle expanded legend states
                                    const symbologyChildren = layerOrGroup.symbologyChildren;
                                    if (symbologyChildren.length) {
                                        for (const symbol of symbologyChildren) {
                                            symbol.expanded = expandedLegendNodes.includes(symbol.ruleKey);
                                        }
                                    }
                                }, 1000);

                            }
                        }

                        // Set baseLayers checked state
                        if (themeSelected?.checkedGroupNode?.includes("baselayers/project-background-color")) {
                            lizMap.mainLizmap.state.baseLayers.selectedBaseLayerName = "project-background-color";
                        } else {
                            for (const baseLayer of lizMap.mainLizmap.state.baseLayers.getBaseLayers()) {
                                if (!baseLayer.layerConfig) {
                                    continue;
                                }
                                if (themeSelected?.layers?.[baseLayer.layerConfig.id]) {
                                    lizMap.mainLizmap.state.baseLayers.selectedBaseLayerName = baseLayer.name;
                                    break;
                                }
                            }
                        }

                        // Trigger map theme event
                        lizMap.events.triggerEvent("mapthemechanged",
                            {
                                'name': themeNameSelected,
                                'config': themeSelected
                            }
                        );
                    }
                });

                // Trigger event with the list of mapThemes
                lizMap.events.triggerEvent("mapthemesadded",
                    {
                        'themes': themes
                    }
                );

                // Activate first map theme on load
                if (lizMap.mainLizmap.initialConfig.options.activateFirstMapTheme) {
                    document.querySelector('#theme-selector .dropdown-menu button:nth-child(1)').click();
                }
                const urlParameters = (new URL(document.location)).searchParams;
                if (urlParameters.has('mapTheme')) {
                    const urlMapTheme = urlParameters.get('mapTheme');
                    document.querySelector('#theme-selector button[data-theme="'+urlMapTheme+'"]').click();
                }
            }

            featureTypes = lizMap.mainLizmap.initialConfig.vectorLayerFeatureTypeList;

            // Expand all or unfold all
            document.getElementById('layers-unfold-all').addEventListener('click', () => {
                document.querySelectorAll('lizmap-treeview .expandable').forEach(element => element.classList.add('expanded'));
            });
            document.getElementById('layers-fold-all').addEventListener('click', () => {
                document.querySelectorAll('lizmap-treeview .expandable').forEach(element => element.classList.remove('expanded'));
            });

            // Activate get-baselayer-metadata button
            $('#get-baselayer-metadata').click(function(){

                $('#hide-sub-dock').click();

                const activeBaseLayerName = lizMap.mainLizmap.map.getActiveBaseLayer().get("name");
                if( !activeBaseLayerName ){
                    return false;
                }

                lizMap.events.triggerEvent("lizmapswitcheritemselected",
                    { 'name': activeBaseLayerName, 'type': 'baselayer', 'selected': true}
                );
                return false;
            });

            // Zoom
            $('#content').on('click', 'button.layerActionZoom', function(){
                var layerName = $(this).val();
                if( !layerName ){
                    return false;
                }

                var itemConfig = lizMap.config.layers[layerName];
                if( itemConfig.type == 'baselayer' )
                    lizMap.map.zoomToMaxExtent();

                var mapProjection = lizMap.map.getProjection();
                if(mapProjection == 'EPSG:900913')
                    mapProjection = 'EPSG:3857';

                if ( !('extent' in itemConfig) ) {
                    console.log('The layer extent information has not been found in config');
                    console.log(itemConfig);
                    return false;
                }
                if ( !('crs' in itemConfig) ) {
                    console.log('The layer crs information has not been found in config');
                    console.log(itemConfig);
                    return false;
                }
                var lBounds = OpenLayers.Bounds.fromArray(itemConfig['extent']);
                lBounds = lBounds.transform(itemConfig['crs'],mapProjection);

                lizMap.map.zoomToExtent( lBounds );

                return false;
            });

            // Styles
            $('#content').on('change', 'select.styleLayer', function(){

                // Get chosen style
                var eStyle = $(this).val();

                // Get layer name and type
                var h = $(this).parent().find('input.styleLayer');
                var name = h.val();
                var isBaselayer = h.hasClass('baselayer');
                if( !name )
                    return false;

                // Get layer
                let layer;
                if (isBaselayer) {
                    layer = lizMap.map.baseLayer;
                } else {
                    layer = lizMap.mainLizmap.state.rootMapGroup.getMapLayerByName(name);
                }

                // Set style
                layer.wmsSelectedStyleName = eStyle;
            });

            // Opacity
            $('#content').on('click', 'a.btn-opacity-layer', function(){

                // Get chosen opacity
                var eVal = $(this).text();
                var opacity = parseInt(eVal) / 100;

                // Get layer name and type
                var h = $(this).parent().find('input.opacityLayer');
                var eName = h.val();
                if( !eName ){
                    return false;
                }

                // Get layer
                const layer = lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerOrGroupByName(eName);

                // Set opacity
                if( layer ) {
                    layer.opacity = opacity;
                    $('a.btn-opacity-layer').removeClass('active');
                    $('a.btn-opacity-layer.' + opacity*100).addClass('active');
                }

                // Blur dropdown or baselayer button
                $('#switcher').click();

                return false;
            });

            // Export
            $('#sub-dock').on('click', 'button.exportLayer', function(){
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

                lizMap.events.triggerEvent("layerfeatureremovefilter",
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
                                lizMap.events.triggerEvent("lizmapswitcheritemselected",
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
            } else {
                itemConfig = lizMap.config.layers[itemName];
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
}();
