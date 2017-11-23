var lizSearch = function() {

    // Attributes
    var config = null;
    var map = null;

    function startExternalSearch() {
        $('#lizmap-search .items li > a').unbind('click');
        $('#lizmap-search .items').html( '<li class="start"><ul><li>'+lizDict['externalsearch.search']+'</li></ul></li>' );
        $('#lizmap-search, #lizmap-search-close').addClass('open');
    }

    function updateExternalSearch( aHTML ) {
        var wgs84 = new OpenLayers.Projection('EPSG:4326');

        $('#lizmap-search .items li > a').unbind('click');
        if ( $('#lizmap-search .items li.start').length != 0 )
            $('#lizmap-search .items').html( aHTML );
        else
            $('#lizmap-search .items').append( aHTML );
        $('#lizmap-search, #lizmap-search-close').addClass('open');
        $('#lizmap-search .items li > a').click(function() {
            var bbox = $(this).attr('href').replace('#','');
            var bbox = OpenLayers.Bounds.fromString(bbox);
            bbox.transform(wgs84, map.getProjectionObject());
            map.zoomToExtent(bbox);

            var feat = new OpenLayers.Feature.Vector(bbox.toGeometry().getCentroid());
            var data = $(this).attr('data');
            if ( data ) {
                var geom = OpenLayers.Geometry.fromWKT(data);
                geom.transform(wgs84, map.getProjectionObject());
                feat = new OpenLayers.Feature.Vector(geom);
            }

            var locateLayer = map.getLayersByName('locatelayer');
            if (locateLayer.length != 0) {
                locateLayer = locateLayer[0];
                locateLayer.destroyFeatures();
                locateLayer.setVisibility(true);
                locateLayer.addFeatures([feat]);
            }

            $('#lizmap-search, #lizmap-search-close').removeClass('open');
            return false;
        });
        $('#lizmap-search-close button').click(function() {
            $('#lizmap-search, #lizmap-search-close').removeClass('open');
            return false;
        });
    }

    function getHighlightRegEx() {
        // Format answers to highlight searched keywords
        var sqval = $('#search-query').val();
        var sqvals = sqval.split(' ');
        var sqvalsn = [];
        var sqrex = '(';
        for(var i in sqvals){
            var sqi = sqvals[i].trim();
            if( sqi == '' ){continue;}
            sqvalsn.push(sqi);
            if(sqi != lizMap.cleanName(sqi)){
                sqvalsn.push(lizMap.cleanName(sqi));
            }
        }
        sqrex+= sqvalsn.join('|');
        sqrex+= ')';
        return new RegExp(sqrex, "ig");
    }

    /**
     * PRIVATE function: addExternalSearch
     * add external search capability
     *
     * Returns:
     * {Boolean} external search is in the user interface
     */
    function addSearch( searchConfig ) {
        if ( searchConfig.type == 'externalSearch' )
            return false;
        if ( !'url' in searchConfig )
            return false;

        // define max extent for searches
        var wgs84 = new OpenLayers.Projection('EPSG:4326');
        var extent = new OpenLayers.Bounds( map.maxExtent.toArray() );
        extent.transform(map.getProjection(), wgs84);

        $('#nominatim-search').submit(function(){
            startExternalSearch();

            // Format answers to highlight searched keywords
            var labrex = getHighlightRegEx();
            $.get(searchConfig.url
                ,{
                  "repository": lizUrls.params.repository,
                  "project": lizUrls.params.project,
                  "query":$('#search-query').val(),
                  "bbox":extent.toBBOX()
                 }
                ,function(results) {
                    var text = '';
                    var count = 0;

                    // Loop through results
                    for ( var ftsId in results ) {
                        var ftsLayerResult = results[ftsId];
                        text += '<li><b>'+ftsLayerResult.search_name+'</b>';
                        text += '<ul>';
                        for ( var i=0, len=ftsLayerResult.features.length; i<len; i++){
                            var ftsFeat = ftsLayerResult.features[i];
                            var ftsGeometry = OpenLayers.Geometry.fromWKT(ftsFeat.geometry);
                            if ( ftsLayerResult.srid != 'EPSG:4326' )
                                ftsGeometry.transform(ftsLayerResult.srid, 'EPSG:4326');
                            var bbox = ftsGeometry.getBounds();
                            if ( extent.intersectsBounds(bbox) ) {
                              var lab = ftsFeat.label.replace(labrex,'<b style="color:#0094D6;">$1</b>');
                              text += '<li><a href="#'+bbox.toBBOX()+'" data="'+ftsGeometry.toString()+'">'+lab+'</a></li>';
                              count++;
                            }
                        }
                        text += '</ul></li>';
                    }

                    if (count != 0 && text != '')
                        updateExternalSearch( text );
                    else
                        updateExternalSearch( '<li><b>'+lizDict['externalsearch.mapdata']+'</b><ul><li>'+lizDict['externalsearch.notfound']+'</li></ul></li>' );
                }, 'json');
            return false;
        });

        return true;
    }

    /**
     * PRIVATE function: addExternalSearch
     * add external search capability
     *
     * Returns:
     * {Boolean} external search is in the user interface
     */
    function addExternalSearch( searchConfig ) {
        if ( searchConfig.type != 'externalSearch' )
            return false;

        // define max extent for searches
        var wgs84 = new OpenLayers.Projection('EPSG:4326');
        var extent = new OpenLayers.Bounds( map.maxExtent.toArray() );
        extent.transform(map.getProjection(), wgs84);

        // define external search service
        var service = null;
        switch (searchConfig.service) {
            case 'nominatim':
            case 'ign':
                if ( 'url' in searchConfig )
                    service = searchConfig.url;
                break;
            case 'google':
                if ( google && 'maps' in google && 'Geocoder' in google.maps )
                    service = new google.maps.Geocoder();
                break;
        }

        if ( service == null )
            return false;

        $('#nominatim-search').submit(function(){
            startExternalSearch();

            // Format answers to highlight searched keywords
            var labrex = getHighlightRegEx();
            switch (searchConfig.service) {
                case 'nominatim':
                    $.get(service
                        ,{"query":$('#search-query').val(),"bbox":extent.toBBOX()}
                        ,function(data) {
                            var text = '';
                            var count = 0;
                            $.each(data, function(i, e){
                                if (count > 9)
                                    return false;
                                if ( !e.boundingbox )
                                    return true;

                                var bbox = [
                                    e.boundingbox[2],
                                    e.boundingbox[0],
                                    e.boundingbox[3],
                                    e.boundingbox[1]
                                ];
                                bbox = new OpenLayers.Bounds(bbox);
                                if ( extent.intersectsBounds(bbox) ) {
                                    var lab = e.display_name.replace(labrex,'<b style="color:#0094D6;">$1</b>');
                                    text += '<li><a href="#'+bbox.toBBOX()+'">'+lab+'</a></li>';
                                    count++;
                                }
                            });
                            if (count == 0 || text == '')
                                text = '<li>'+lizDict['externalsearch.notfound']+'</li>';
                            updateExternalSearch( '<li><b>OpenStreetMap</b><ul>'+text+'</ul></li>' );
                        }, 'json');
                    break;
                case 'ign':
                    $.get(service
                        ,{"query":$('#search-query').val(),"bbox":extent.toBBOX()}
                        ,function(results) {
                            var text = '';
                            var count = 0;
                            $.each(results, function(i, e){
                                if (count > 9)
                                    return false;
                                var bbox = [
                                    e.bbox[0],
                                    e.bbox[1],
                                    e.bbox[2],
                                    e.bbox[3]
                                ];
                                bbox = new OpenLayers.Bounds(bbox);
                                if ( extent.intersectsBounds(bbox) ) {
                                    var lab = e.formatted_address.replace(labrex,'<b style="color:#0094D6;">$1</b>');
                                    text += '<li><a href="#'+bbox.toBBOX()+'">'+lab+'</a></li>';
                                    count++;
                                }
                            });
                            if (count == 0 || text == '')
                                text = '<li>'+lizDict['externalsearch.notfound']+'</li>';
                            updateExternalSearch( '<li><b>IGN</b><ul>'+text+'</ul></li>' );
                        }, 'json');
                    break;
                case 'google':
                    service.geocode( {
                        'address': $('#search-query').val(),
                        'bounds': new google.maps.LatLngBounds(
                          new google.maps.LatLng(extent.top,extent.left),
                          new google.maps.LatLng(extent.bottom,extent.right)
                          )
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var text = '';
                            var count = 0;
                            $.each(results, function(i, e){
                                if (count > 9)
                                    return false;
                                var bbox = [];
                                if (e.geometry.viewport) {
                                    bbox = [
                                        e.geometry.viewport.getSouthWest().lng(),
                                        e.geometry.viewport.getSouthWest().lat(),
                                        e.geometry.viewport.getNorthEast().lng(),
                                        e.geometry.viewport.getNorthEast().lat()
                                    ];
                                } else if (e.geometry.bounds) {
                                    bbox = [
                                        e.geometry.bounds.getSouthWest().lng(),
                                        e.geometry.bounds.getSouthWest().lat(),
                                        e.geometry.bounds.getNorthEast().lng(),
                                        e.geometry.bounds.getNorthEast().lat()
                                    ];
                                }
                                if ( bbox.length != 4 )
                                    return false;
                                bbox = new OpenLayers.Bounds(bbox);
                                if ( extent.intersectsBounds(bbox) ) {
                                    var lab = e.formatted_address.replace(labrex,'<b style="color:#0094D6;">$1</b>');
                                    text += '<li><a href="#'+bbox.toBBOX()+'">'+lab+'</a></li>';
                                    count++;
                                }
                            });
                            if (count == 0 || text == '')
                                text = '<li>'+lizDict['externalsearch.notfound']+'</li>';
                            updateExternalSearch( '<li><b>Google</b><ul>'+text+'</ul></li>' );
                        } else
                            updateExternalSearch( '<li><b>Google</b><ul><li>'+lizDict['externalsearch.notfound']+'</li></ul></li>' );
                    });
                break;
            }
            return false;
        });

        return true;
    }

    /**
     * PRIVATE function: addSearches
     * add searches capability
     *
     * Returns:
     * {Boolean} searches added to the user interface
     */
    function addSearches() {
        var configOptions = config.options;
        if ( !( 'searches' in configOptions ) || ( configOptions.searches.length == 0 ) )
            return;

        var searchOptions = config.options.searches;
        var searchAdded = false;
        for( var i=0, len=searchOptions.length; i<len; i++ ){
            var searchOption = searchOptions[i];
            var searchAddedResult = false;
            if ( searchOption.type == 'externalSearch' )
                searchAddedResult = addExternalSearch( searchOption );
            else
                searchAddedResult = addSearch( searchOption );
            searchAdded = searchAdded || searchAddedResult;
        }
        if ( !searchAdded ){
            $('#nominatim-search').remove();
            $('#lizmap-search, #lizmap-search-close').remove();
        }
        return searchAdded;
    }

    lizMap.events.on({
        'toolbarcreated':function(evt){
            // Attributes
            config = lizMap.config;
            map = lizMap.map;

            // Add or remove seaches!
            var configOptions = config.options;
            if ( ( 'searches' in configOptions ) && ( configOptions.searches.length > 0 ) )
                addSearches();
            else {
                $('#nominatim-search').remove();
                $('#lizmap-search, #lizmap-search-close').remove();
            }
        }
    });
}();