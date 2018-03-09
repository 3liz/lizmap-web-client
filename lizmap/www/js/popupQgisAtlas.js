

lizMap.events.on({

    'lizmappopupdisplayed': function(e){
        
        $('div.lizmapPopupDiv').each(function(){

            var getLayerId = $(this).find('input.lizmap-popup-layer-feature-id:first').val().split('.');
            var layerId = getLayerId[0];
            var fid = getLayerId[1];
            var layerName=getLayerId[0].split(/[0-9]/)[0];
            console.log($(e.this));
            
            var layerNameOrTitle = $(this).prev('h4:first').text();
            for(var i in lizMap.config.printTemplates){
                var t = lizMap.config.printTemplates[i];
                if('atlas' in t){
                    //console.log(t.atlas.coverageLayer);
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

                        url += '&EXP_FILTER=$id IN ('+fid+')';
                        url += '&ATLAS=true';
                        $(this).append('<a href="'+url+'" target="_blank">Fiche '+t.title+'</a>');
                        //console.log(lizMap.config.options);
                    }
                }
            }
            
            
                       

        });   
    }

});
