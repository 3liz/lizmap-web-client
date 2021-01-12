

lizMap.events.on({

    'lizmappopupdisplayed': function(){

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

                            // Add button and div to set custom labels
                            let customLabels = '';

                            for(const label of t.labels){
                                if (label.htmlState){
                                    customLabels += `<textarea class="atlasprint-custom-labels" cols="15" data-print-id="${label.id}" name="${label.id}" placeholder="${label.text}">${label.text}</textarea>`;
                                }else{
                                    customLabels += `<input type="text" class="atlasprint-custom-labels" size="15" data-print-id="${label.id}" name="${label.id}" placeholder="${label.text}" value="${label.text}">`;
                                }
                            }

                            // Create custom labels tool if any custom labels have been defined
                            const customLabelsTool = (customLabels === '') ? '' : `<div class="toggle-custom-labels-view"><button><i class="icon-cog" title="${lizDict['print.customLabels.tooltip']}"></i></button><div>${customLabels}</div></div>`;

                            $(this).append('<a class="lizmap-atlasprint-link" data-href="' + url + '" href="' + url + '" target="_blank" title="' + lizDict['attributeLayers.toolbar.btn.data.export.title'] + ' ' + t.title + '"><span class="icon"></span>' + t.title + '</a>' + customLabelsTool + '<br>');

                            // Activate toggle on custom labels button
                            $('.toggle-custom-labels-view > button').click(function () {
                                $(this).next().toggle();
                            });

                            // Activate URL rewrite when user modify custom labels value
                            $('.atlasprint-custom-labels').on('input', function(){
                                const atlasPrintLink = $(this).parents('.toggle-custom-labels-view').prev();

                                let customLabelsParams = '';

                                $('.atlasprint-custom-labels').each(function(){
                                    customLabelsParams += '&' + $(this).data('print-id') + '=' + encodeURIComponent($(this).val());
                                });

                                atlasPrintLink.attr('href', atlasPrintLink.data('href') + customLabelsParams);
                            });

                            // Add tooltips
                            $(this).find('a.lizmap-atlasprint-link, .toggle-custom-labels-view button i').tooltip();
                        }
                    }
                }
            }
        });
    }
});
