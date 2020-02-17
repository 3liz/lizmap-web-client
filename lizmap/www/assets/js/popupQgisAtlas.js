

lizMap.events.on({

    'lizmappopupdisplayed': function(e){

        if( !('qgisServerPlugins' in lizMap.config) )
            return;
        if( !('atlasprint' in lizMap.config.qgisServerPlugins) )
            return;
        if( !('printTemplates' in lizMap.config) || lizMap.config.printTemplates.length == 0)
            return;

        $('div.lizmapPopupDiv').each(function(){
            if($(this).find('a.lizmap-atlasprint-link').length == 0){
            var getLayerId = $(this).find('input.lizmap-popup-layer-feature-id:first').val().split('.');
            var layerId = getLayerId[0];
            var fid = getLayerId[1];
            var layerName=getLayerId[0].split(/[0-9]/)[0];

            var layerNameOrTitle = $(this).prev('h4:first').text();
            for(var i in lizMap.config.printTemplates){
                var t = lizMap.config.printTemplates[i];
                if('atlas' in t){
                    if(layerId == t.atlas.coverageLayer){
                        // Build URL
                        var url = OpenLayers.Util.urlAppend(
                            lizUrls.wms,
                            OpenLayers.Util.getParameterString(lizUrls.params)
                        );
                        url += '&SERVICE=WMS';
                        url += '&VERSION=1.3.0&REQUEST=GetPrintAtlas';
                        url += '&FORMAT=pdf';
                        url += '&EXCEPTIONS=application/vnd.ogc.se_inimage&TRANSPARENT=true';
                        url += '&DPI=100';
                        url += '&TEMPLATE='+t.title;
                        url += '&LAYER='+layerName;
                        url += '&EXP_FILTER=$id IN ('+fid+')';
                        $(this).append('<a class="lizmap-atlasprint-link" href="'+url+'" target="_blank" title="' + lizDict['attributeLayers.toolbar.btn.data.export.title'] + ' ' + t.title + '"><span class="icon"></span>'+t.title+'</a></br>');
                        $(this).find('a.lizmap-atlasprint-link').tooltip();
                    }
                }
            }
            }
        });
    }
});
