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
            html+= '<dd><button class="btn btn-mini layerActionZoom" title="'+lizDict['layer.metadata.zoomToExtent.title']+'" value="'+aName+'"><i class="icon-zoom-in"></i></button></dd>';

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

                const currentOpacity = metadatas.isBaselayer ?
                    lizMap.mainLizmap.state.baseLayers.getBaseLayerByName(aName).opacity :
                    lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerOrGroupByName(aName).opacity;
                var opacities = lizMap.config.options.layersOpacities;
                if (typeof opacities === 'undefined') {
                    opacities = [0.2, 0.4, 0.6, 0.8, 1];
                }
                for ( var i=0, len=opacities.length; i<len; i++ ) {
                    var oactive = '';
                    if(currentOpacity == opacities[i])
                        oactive = 'active';
                    html+= '<a href="#" class="btn btn-mini btn-opacity-layer '+ oactive+' '+ opacities[i]*100+'">'+opacities[i]*100+'</a>';
                }
                html+= '</dd>';
            }

            // Export
            if ( 'exportLayers' in lizMap.config.options
                && lizMap.config.options.exportLayers == 'True'
                && featureTypes != null
                && featureTypes.length != 0
                && layerConfig.typename != undefined) {
                var exportFormats = lizMap.mainLizmap.initialConfig.vectorLayerResultFormat;
                var options = '';
                for ( const format of exportFormats ) {
                    options += '<option value="'+format+'">'+format+'</option>';
                }
                // Check export enabled
                // By default, export is enabled for all layers with typename
                let exportEnabled = true;
                // If attribute layers is defined, we have to check if the publisher
                // has disabled export in attribute table config
                const attrLayersConfig = lizMap.mainLizmap.initialConfig.attributeLayers;
                if (attrLayersConfig !== null) {
                    const attrLayerConfigsLen = attrLayersConfig.layerConfigs.length;
                    const exportLayersLen = attrLayersConfig.layerConfigs.filter(attr => attr.exportEnabled).length;
                    // If some layers have export disabled, we have to check if the current layer is in the list
                    if (attrLayerConfigsLen != exportLayersLen) {
                        const attrLayerConfig = attrLayersConfig.layerConfigs.find(layer => layer.id === layerConfig.id);
                        // If the layer is not in the list, export is disabled
                        // else export is available as definde in attribute layer config
                        exportEnabled = (attrLayerConfig !== undefined && attrLayerConfig.exportEnabled);
                    }
                }
                // Export layer
                if( options != '' && exportEnabled) {
                    html+= '        <dt>'+lizDict['layer.metadata.export.title']+'</dt>';
                    html+= '<dd>';
                    html+= '<select class="exportLayer '+isBaselayer+'">';
                    html+= options;
                    html+= '</select>';
                    html+= '<button class="btn btn-mini exportLayer '+isBaselayer+'" title="'+lizDict['layer.metadata.export.title']+'" value="'+aName+'"><i class="icon-download"></i></button>';
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
            html+= '<button id="hide-sub-dock" class="btn btn-mini pull-right" name="close" title="'+lizDict['generic.btn.close.title']+'" value="'+aName+'">'+lizDict['generic.btn.close.title']+'</button>';
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
                var themeSelector = '<div id="theme-selector" class="btn-group" role="group">';
                themeSelector += '<button class="btn btn-mini dropdown-toggle" data-toggle="dropdown" type="button" title="' + lizDict['switcherLayersActions.themeSelector.title'] +'" href="#"><i class="icon-none qgis_sprite mActionShowAllLayers"></i><span class="caret"></span></button>';
                themeSelector += '<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="dropdownMenu">';

                for (var themeName in themes) {
                    themeSelector += '<li class="theme"><a href="#">' + themeName + '</a></li>';
                }

                themeSelector += '</ul>';
                themeSelector += '</div>';

                $('#switcher-layers-actions').prepend(themeSelector);

                // Handle theme switching
                $('#theme-selector').on('click', '.theme', function () {
                    // Set theme as selected
                    $('#theme-selector .theme').removeClass('selected');
                    $(this).addClass('selected');

                    const themeNameSelected = $(this).text();

                    if (themeNameSelected in lizMap.config.themes){
                        const themeSelected = lizMap.config.themes[themeNameSelected];

                        // Groups and subgroups are separated by a '/'. Keep full paths for proper matching
                        const checkedGroupNodes = themeSelected?.checkedGroupNode || [];
                        const expandedGroupNodes = themeSelected?.expandedGroupNode || [];
                        const expandedLegendNodes = themeSelected?.expandedLegendNode || [];
                        const checkedLegendNodes = themeSelected?.checkedLegendNodes || {};

                        const allItems = lizMap.mainLizmap.state.layerTree.findTreeLayersAndGroups();

                        // Suspend permalink updates during theme application
                        // This prevents "Too many Location/History API calls" error
                        const permalink = lizMap.mainLizmap.permalink;
                        if (permalink) {
                            // Save original _writeURLFragment method
                            permalink._originalWriteURLFragment = permalink._writeURLFragment;
                            // Replace with no-op function during theme application
                            permalink._writeURLFragment = () => {};
                        }

                        // STEP 1: Set ALL layers (ON if in theme, OFF if not)
                        for (const item of allItems) {
                            if (item.mapItemState.itemState.type === "group") {
                                continue; // Skip groups
                            }

                            const layerParams = themeSelected?.layers?.[item.layerConfig.id];
                            if (!layerParams) {
                                // Layer not in theme: uncheck it
                                item.checked = false;
                                item.expanded = false;
                                continue;
                            }

                            const style = layerParams?.style;
                            if (style) {
                                item.wmsSelectedStyleName = style;
                            }

                            // Layer in theme: check it
                            item.checked = true;
                            item.expanded = layerParams?.expanded === "1" || layerParams?.expanded === true;

                            // Handle legend node states (symbology categories)
                            const layerId = item.layerConfig.id;
                            const layerCheckedLegendNodes = checkedLegendNodes[layerId];
                            const hasCheckedLegendNodes = layerId in checkedLegendNodes;

                            // Define function to apply legend node states
                            const applyLegendNodeStates = () => {
                                const symbologyChildren = item.symbologyChildren;

                                if (symbologyChildren.length > 0) {
                                    // Handle checked state
                                    if (hasCheckedLegendNodes) {
                                        // Layer has checked-legend-nodes defined in theme:
                                        // Toggle rule checkbox based on layer configuration
                                        for (const symbol of symbologyChildren) {
                                            symbol.checked = layerCheckedLegendNodes.includes(symbol.ruleKey);
                                        }
                                    } else {
                                        // Layer in theme but no checked-legend-nodes defined:
                                        // Check all symbology children (default/full state)
                                        for (const symbol of symbologyChildren) {
                                            symbol.checked = true;
                                        }
                                    }

                                    // Handle expanded state
                                    for (const symbol of symbologyChildren) {
                                        symbol.expanded = expandedLegendNodes.includes(symbol.ruleKey);
                                    }
                                }
                            };

                            // Apply states either immediately or when symbology loads
                            if (item.symbology === null) {
                                // Symbology not loaded yet, listen for the change event
                                const onSymbologyChanged = (evt) => {
                                    applyLegendNodeStates();
                                    // Remove listener after applying states
                                    setTimeout(() => item.removeListener(onSymbologyChanged, 'layer.symbology.changed'), 10);
                                };
                                item.addListener(onSymbologyChanged, 'layer.symbology.changed');
                            } else {
                                // Symbology already loaded, apply immediately
                                applyLegendNodeStates();
                            }
                        }

                        // STEP 2: Set groups checked/expanded state based on theme configuration
                        // Use a two-pass approach to handle automatic parent checking:
                        // - Pass 1: Set all groups (child groups will auto-check parents)
                        // - Pass 2: Uncheck parent groups that shouldn't be checked

                        // Helper function to check if group is in list
                        const isInList = (nodeList, wmsName, name) => {
                            // First check for exact matches (full path or simple name)
                            if (nodeList.includes(wmsName) || nodeList.includes(name)) {
                                return true;
                            }

                            // For nested groups: check if this group matches the last component of a path
                            // Example: if checkedGroupNodes has "ALKIS/Beschriftung",
                            // then the "Beschriftung" subgroup should match, but "ALKIS" parent should NOT
                            for (const nodePath of nodeList) {
                                // Skip paths without separator (already handled by exact match above)
                                if (!nodePath.includes('/')) {
                                    continue;
                                }

                                // Get the last component of the path
                                const lastPart = nodePath.split('/').pop();

                                // Only match if wmsName or name equals the LAST part
                                if (wmsName === lastPart || name === lastPart) {
                                    return true;
                                }
                            }

                            return false;
                        };

                        // Pass 2a: Set all groups checked/expanded state
                        // Note: Setting child groups to checked will auto-propagate to parents
                        for (const item of allItems) {
                            if (item.mapItemState.itemState.type !== "group") {
                                continue; // Skip layers
                            }

                            item.checked = isInList(checkedGroupNodes, item.wmsName, item.name);
                            item.expanded = isInList(expandedGroupNodes, item.wmsName, item.name);
                        }

                        // Pass 2b: Fix parent groups that were auto-checked but shouldn't be
                        // When a child group is checked, it automatically checks the parent.
                        // This pass unchecks parents that aren't explicitly in the theme.
                        for (const item of allItems) {
                            if (item.mapItemState.itemState.type !== "group") {
                                continue; // Skip layers
                            }

                            // Only check groups that are currently checked
                            if (!item.checked) {
                                continue;
                            }

                            // Verify if this group should actually be checked per the theme
                            const shouldBeChecked = isInList(checkedGroupNodes, item.wmsName, item.name);

                            // If it's checked but not in the theme list, uncheck it
                            if (!shouldBeChecked) {
                                item.checked = false;
                            }
                        }

                        // Resume permalink updates after theme application
                        if (permalink && permalink._originalWriteURLFragment) {
                            // Restore original _writeURLFragment method
                            permalink._writeURLFragment = permalink._originalWriteURLFragment;
                            delete permalink._originalWriteURLFragment;
                            // Clear the suspend flag if this is the initial theme activation
                            if (permalink._suspendInitialWrite) {
                                delete permalink._suspendInitialWrite;
                            }
                            // Manually trigger one permalink update now that all changes are done
                            permalink._writeURLFragment();
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
                    $('#theme-selector.open').click();
                    return false;
                });

                // Trigger event with the list of mapThemes
                lizMap.events.triggerEvent("mapthemesadded",
                    {
                        'themes': themes
                    }
                );

                // Activate first map theme on load
                if (lizMap.mainLizmap.initialConfig.options.activateFirstMapTheme) {
                    // Prevent permalink from writing until after first theme is applied
                    const permalink = lizMap.mainLizmap.permalink;
                    if (permalink) {
                        permalink._suspendInitialWrite = true;
                    }
                    $('#theme-selector li.theme:nth-child(1)').click();
                }
                const urlParameters = (new URL(document.location)).searchParams;
                if (urlParameters.has('mapTheme')) {
                    const urlMapTheme = urlParameters.get('mapTheme');
                    $('#theme-selector li.theme').filter((i, e) => e.textContent == urlMapTheme).click();
                }
            }

            featureTypes = lizMap.mainLizmap.initialConfig.vectorLayerFeatureTypeList;

            // title tooltip
            $('#switcher-layers-actions .btn, #get-baselayer-metadata').tooltip({
                placement: 'bottom'
            });

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

                const isBaselayer = lizMap.mainLizmap.map.getActiveBaseLayer()?.get("name") == eName;

                // Get layer
                const layer = isBaselayer ?
                    lizMap.mainLizmap.state.baseLayers.getBaseLayerByName(eName) :
                    lizMap.mainLizmap.state.layersAndGroupsCollection.getLayerOrGroupByName(eName);

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
