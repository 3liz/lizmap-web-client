import { mainLizmap } from '../modules/Globals.js';
import { transformExtent } from 'ol/proj.js';
import WKT from 'ol/format/WKT.js';
import Feature from 'ol/Feature.js';

export default class Search {

    constructor() {
        // Attributes
        this._config = lizMap.config;
        this._map = lizMap.map;

        // Add or remove searches!
        var configOptions = this._config.options;
        if (('searches' in configOptions) && (configOptions.searches.length > 0)) {
            this._addSearches();
        }
        else {
            $('#nominatim-search').remove();
            $('#lizmap-search, #lizmap-search-close').remove();
        }
    }

    /**
     *
     */
    _startExternalSearch() {
        if ($('#search-query').val().length != 0) {
            $('#lizmap-search .items li > a').unbind('click');
            $('#lizmap-search .items').html('<li class="start"><ul><li>' + lizDict['externalsearch.search'] + '</li></ul></li>');
            $('#lizmap-search, #lizmap-search-close').addClass('open');
        } else {
            lizMap.addMessage(lizDict['externalsearch.noquery'], 'info', true).attr('id', 'lizmap-search-message');
        }
    }

    /**
     *
     */
    _getHighlightRegEx() {
        // Format answers to highlight searched keywords
        var sqval = $('#search-query').val();
        var sqvals = sqval.split(' ');
        var sqvalsn = [];
        var sqrex = '(';
        for (var i in sqvals) {
            var sqi = sqvals[i].trim();
            if (sqi == '') {
                continue;
            }
            sqvalsn.push(sqi);
            if (sqi != lizMap.cleanName(sqi)) {
                sqvalsn.push(lizMap.cleanName(sqi));
            }
        }
        sqrex += sqvalsn.join('|');
        sqrex += ')';
        return new RegExp(sqrex, "ig");
    }

    /**
     * PRIVATE function: addExternalSearch
     * add external search capability
     *
     * Returns:
     * {Boolean} external search is in the user interface
     * @param searchConfig
     */
    _addSearch(searchConfig) {
        if (searchConfig.type == 'externalSearch') {
            return false;
        }
        if (!'url' in searchConfig) {
            return false;
        }

        // define max extent for searches
        var wgs84 = new OpenLayers.Projection('EPSG:4326');
        var extent = new OpenLayers.Bounds(this._map.maxExtent.toArray());
        extent.transform(this._map.getProjection(), wgs84);

        $('#nominatim-search').submit(() => {
            this._startExternalSearch();

            // Format answers to highlight searched keywords
            var labrex = this._getHighlightRegEx();
            $.get(searchConfig.url
                , {
                    "repository": lizUrls.params.repository,
                    "project": lizUrls.params.project,
                    "query": $('#search-query').val(),
                    "bbox": extent.toBBOX()
                }
                , (results) => {
                    var text = '';
                    var count = 0;

                    // Loop through results
                    for (var ftsId in results) {
                        var ftsLayerResult = results[ftsId];
                        text += '<li><b>' + ftsLayerResult.search_name + '</b>';
                        text += '<ul>';
                        for (var i = 0, len = ftsLayerResult.features.length; i < len; i++) {
                            var ftsFeat = ftsLayerResult.features[i];
                            var ftsGeometry = OpenLayers.Geometry.fromWKT(ftsFeat.geometry);
                            if (ftsLayerResult.srid != 'EPSG:4326') {
                                ftsGeometry.transform(ftsLayerResult.srid, 'EPSG:4326');
                            }
                            var bbox = ftsGeometry.getBounds();
                            if (extent.intersectsBounds(bbox)) {
                                var lab = ftsFeat.label.replace(labrex, '<b style="color:#0094D6;">$1</b>');
                                text += '<li><a href="#' + bbox.toBBOX() + '" data="' + ftsGeometry.toString() + '">' + lab + '</a></li>';
                                count++;
                            }
                        }
                        text += '</ul></li>';
                    }

                    if (count != 0 && text != '') {
                        this._updateExternalSearch(text);
                    }
                    else {
                        this._updateExternalSearch('<li><b>' + lizDict['externalsearch.mapdata'] + '</b><ul><li>' + lizDict['externalsearch.notfound'] + '</li></ul></li>');
                    }
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
     * @param searchConfig
     */
    _addExternalSearch(searchConfig) {
        if (searchConfig.type != 'externalSearch') {
            return false;
        }

        // define max extent for searches
        var wgs84 = new OpenLayers.Projection('EPSG:4326');
        var extent = new OpenLayers.Bounds(this._map.maxExtent.toArray());
        extent.transform(this._map.getProjection(), wgs84);

        // define external search service
        var service = null;
        switch (searchConfig.service) {
            case 'nominatim':
                if ('url' in searchConfig) {
                    service = OpenLayers.Util.urlAppend(searchConfig.url
                        , new URLSearchParams(lizUrls.params)
                    );
                }
                break;
            case 'ign':
                service = 'https://data.geopf.fr/geocodage/completion/';
                break;
            case 'google':
                if (google && 'maps' in google && 'Geocoder' in google.maps) {
                    service = new google.maps.Geocoder();
                }
                break;
        }

        if (service == null) {
            return false;
        }

        $('#nominatim-search').submit(function () {
            this._startExternalSearch();

            // Format answers to highlight searched keywords
            var labrex = this._getHighlightRegEx();
            switch (searchConfig.service) {
                case 'nominatim':
                    $.get(service
                        , { "query": $('#search-query').val(), "bbox": extent.toBBOX() }
                        , function (data) {
                            var text = '';
                            var count = 0;
                            $.each(data, function (i, e) {
                                if (count > 9) {
                                    return false;
                                }
                                if (!e.boundingbox) {
                                    return true;
                                }

                                var bbox = [
                                    e.boundingbox[2],
                                    e.boundingbox[0],
                                    e.boundingbox[3],
                                    e.boundingbox[1]
                                ];
                                bbox = new OpenLayers.Bounds(bbox);
                                if (extent.intersectsBounds(bbox)) {
                                    var lab = e.display_name.replace(labrex, '<b style="color:#0094D6;">$1</b>');
                                    text += '<li><a href="#' + bbox.toBBOX() + '">' + lab + '</a></li>';
                                    count++;
                                }
                            });
                            if (count == 0 || text == '') {
                                text = '<li>' + lizDict['externalsearch.notfound'] + '</li>';
                            }
                            this._updateExternalSearch('<li><b>OpenStreetMap</b><ul>' + text + '</ul></li>');
                        }, 'json');
                    break;
                case 'ign':
                    let mapExtent4326 = transformExtent(mainLizmap.map.getView().calculateExtent(), mainLizmap.projection, 'EPSG:4326');
                    let queryParam = '?text=' + $('#search-query').val() + '&type=StreetAddress&maximumResponses=10&bbox=' + mapExtent4326
                    $.getJSON(encodeURI(service + queryParam), function (data) {
                        let text = '';
                        let count = 0;
                        for (const result of data.results) {
                            var lab = result.fulltext.replace(labrex, '<b style="color:#0094D6;">$1</b>');
                            text += '<li><a href="#' + result.x + ',' + result.y + ',' + result.x + ',' + result.y + '">' + lab + '</a></li>';
                            count++;
                        }
                        if (count == 0 || text == '') {
                            text = '<li>' + lizDict['externalsearch.notfound'] + '</li>';
                        }
                        this._updateExternalSearch('<li><b>IGN</b><ul>' + text + '</ul></li>');
                    });
                    break;
                case 'google':
                    service.geocode({
                        'address': $('#search-query').val(),
                        'bounds': new google.maps.LatLngBounds(
                            new google.maps.LatLng(extent.top, extent.left),
                            new google.maps.LatLng(extent.bottom, extent.right)
                        )
                    }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var text = '';
                            var count = 0;
                            $.each(results, function (i, e) {
                                if (count > 9) {
                                    return false;
                                }
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
                                if (bbox.length != 4) {
                                    return false;
                                }
                                bbox = new OpenLayers.Bounds(bbox);
                                if (extent.intersectsBounds(bbox)) {
                                    var lab = e.formatted_address.replace(labrex, '<b style="color:#0094D6;">$1</b>');
                                    text += '<li><a href="#' + bbox.toBBOX() + '">' + lab + '</a></li>';
                                    count++;
                                }
                            });
                            if (count == 0 || text == '') {
                                text = '<li>' + lizDict['externalsearch.notfound'] + '</li>';
                            }
                            this._updateExternalSearch('<li><b>Google</b><ul>' + text + '</ul></li>');
                        } else {
                            this._updateExternalSearch('<li><b>Google</b><ul><li>' + lizDict['externalsearch.notfound'] + '</li></ul></li>');
                        }
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
    _addSearches() {
        var configOptions = this._config.options;
        if (!('searches' in configOptions) || (configOptions.searches.length == 0)) {
            return;
        }

        var searchOptions = configOptions.searches;
        var searchAdded = false;
        for (var i = 0, len = searchOptions.length; i < len; i++) {
            var searchOption = searchOptions[i];
            var searchAddedResult = false;
            if (searchOption.type == 'externalSearch') {
                searchAddedResult = this._addExternalSearch(searchOption);
            }
            else {
                searchAddedResult = this._addSearch(searchOption);
            }
            searchAdded = searchAdded || searchAddedResult;
        }
        if (!searchAdded) {
            $('#nominatim-search').remove();
            $('#lizmap-search, #lizmap-search-close').remove();
        }
        return searchAdded;
    }

    /**
     *
     * @param aHTML
     */
    _updateExternalSearch(aHTML) {
        if ($('#search-query').val().length != 0) {
            var wgs84 = new OpenLayers.Projection('EPSG:4326');

            $('#lizmap-search .items li > a').unbind('click');
            if ($('#lizmap-search .items li.start').length != 0) {
                $('#lizmap-search .items').html(aHTML);
            }
            else {
                $('#lizmap-search .items').append(aHTML);
            }
            $('#lizmap-search, #lizmap-search-close').addClass('open');
            document.querySelectorAll('#lizmap-search .items li > a').forEach(link => {
                link.addEventListener('click', evt => {
                    evt.preventDefault();
                    const linkClicked = evt.currentTarget;
                    var bbox = linkClicked.getAttribute('href').replace('#', '');
                    var bbox = OpenLayers.Bounds.fromString(bbox);
                    bbox.transform(wgs84, this._map.getProjectionObject());
                    this._map.zoomToExtent(bbox);
    
                    var feat = new OpenLayers.Feature.Vector(bbox.toGeometry().getCentroid());
                    var geomWKT = linkClicked.getAttribute('data');
                    if (geomWKT) {
                        const map = mainLizmap.baseLayersMap;
    
                        const geom = (new WKT()).readGeometry(geomWKT, {
                            dataProjection: 'EPSG:4326',
                            featureProjection: mainLizmap.qgisProjectProjection
                        });
    
                        const feature = new Feature(geom);
    
                        map.clearHighlightFeatures();
                        map.addHighlightFeatures([feature]);
                    }
    
                    $('#lizmap-search, #lizmap-search-close').removeClass('open');
                    // trigger event containing selected feature
                    lizMap.events.triggerEvent('lizmapexternalsearchitemselected',
                        {
                            'feature': feat
                        }
                    );
                    return false;
                });
            });
            
            $('#lizmap-search-close button').click(function () {
                $('#lizmap-search, #lizmap-search-close').removeClass('open');
                return false;
            });
        }
    }
}