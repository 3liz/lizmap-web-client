/**
 * @module modules/Search.js
 * @name Search
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { transformExtent } from 'ol/proj.js';

/**
 * @class
 * @name Search
 */
export default class Search {

    /**
     * Create a search instance
     * @param {Map}        map        - OpenLayers map
     * @param {object}     lizmap3    - The old lizmap object
     */
    constructor(map, lizmap3) {
        // Attributes
        this._map = map;
        this._lizmap3 = lizmap3;

        // Add or remove searches!
        var configOptions = this._lizmap3.config.options;
        if (('searches' in configOptions) && (configOptions.searches.length > 0)) {
            this._addSearches();
        }
        else {
            $('#nominatim-search').remove();
            $('#lizmap-search, #lizmap-search-close').remove();
        }
    }

    /**
     * Start the external search
     */
    _startExternalSearch() {
        if ($('#search-query').val().length != 0) {
            $('#lizmap-search .items li > a').unbind('click');
            $('#lizmap-search .items').html('<li class="start"><ul><li>' + lizDict['externalsearch.search'] + '</li></ul></li>');
            $('#lizmap-search, #lizmap-search-close').addClass('open');
        } else {
            this._lizmap3.addMessage(lizDict['externalsearch.noquery'], 'info', true).attr('id', 'lizmap-search-message');
        }
    }

    /**
     * Get the highlight regular expression
     * @returns {RegExp} The regular expression
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
            if (sqi != this._lizmap3.cleanName(sqi)) {
                sqvalsn.push(this._lizmap3.cleanName(sqi));
            }
        }
        sqrex += sqvalsn.join('|');
        sqrex += ')';
        return new RegExp(sqrex, "ig");
    }

    /**
     * PRIVATE method: addExternalSearch
     * add external search capability
     * @param {object} searchConfig - search configuration
     * @returns {boolean} external search is in the user interface
     */
    _addSearch(searchConfig) {
        if (searchConfig.type == 'externalSearch') {
            return false;
        }
        if (!searchConfig.url) {
            return false;
        }

        // define max extent for searches
        var wgs84 = new OpenLayers.Projection('EPSG:4326');
        var extent = new OpenLayers.Bounds(this._lizmap3.map.maxExtent.toArray());
        extent.transform(this._map.getView().getProjection().getCode(), wgs84);

        $('#nominatim-search').submit(() => {
            this._startExternalSearch();

            // Format answers to highlight searched keywords
            var labrex = this._getHighlightRegEx();
            $.get(searchConfig.url
                , {
                    "repository": globalThis['lizUrls'].params.repository,
                    "project": globalThis['lizUrls'].params.project,
                    "query": $('#search-query').val(),
                    "bbox": extent.toBBOX()
                }
                , (results) => {
                    var text = '';
                    var count = 0;

                    // Loop through results
                    for (var ftsId in results) {
                        var ftsLayerResult = results[ftsId];
                        text += '<li><strong>' + ftsLayerResult.search_name + '</strong>';
                        text += '<ul>';
                        for (var i = 0, len = ftsLayerResult.features.length; i < len; i++) {
                            var ftsFeat = ftsLayerResult.features[i];
                            var ftsGeometry = OpenLayers.Geometry.fromWKT(ftsFeat.geometry);
                            if (ftsLayerResult.srid != 'EPSG:4326') {
                                ftsGeometry.transform(ftsLayerResult.srid, 'EPSG:4326');
                            }
                            var bbox = ftsGeometry.getBounds();
                            if (extent.intersectsBounds(bbox)) {
                                var lab = ftsFeat.label.replace(labrex, '<strong class="highlight">$1</strong>');
                                text += '<li><a href="#' + bbox.toBBOX() + '" data-wkt="' + ftsGeometry.toString() + '">' + lab + '</a></li>';
                                count++;
                            }
                        }
                        text += '</ul></li>';
                    }

                    if (count != 0 && text != '') {
                        this._updateExternalSearch(text);
                    }
                    else {
                        this._updateExternalSearch('<li><strong>' + lizDict['externalsearch.mapdata'] + '</strong><ul><li>' + lizDict['externalsearch.notfound'] + '</li></ul></li>');
                    }
                }, 'json');
            return false;
        });

        return true;
    }

    /**
     * PRIVATE method: addExternalSearch
     * add external search capability
     * @param {object} searchConfig - search configuration
     * @returns {boolean} external search is in the user interface
     */
    _addExternalSearch(searchConfig) {
        if (searchConfig.type != 'externalSearch') {
            return false;
        }

        // define max extent for searches
        var wgs84 = new OpenLayers.Projection('EPSG:4326');
        var extent = new OpenLayers.Bounds(this._lizmap3.map.maxExtent.toArray());
        extent.transform(this._map.getView().getProjection().getCode(), wgs84);

        // define external search service
        var service = null;
        switch (searchConfig.service) {
            case 'nominatim':
                if ('url' in searchConfig) {
                    service = OpenLayers.Util.urlAppend(searchConfig.url
                        , new URLSearchParams(globalThis['lizUrls'].params)
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

        $('#nominatim-search').submit(() => {
            this._startExternalSearch();

            // Format answers to highlight searched keywords
            var labrex = this._getHighlightRegEx();
            const searchQuery = document.getElementById('search-query').value;
            switch (searchConfig.service) {
                case 'nominatim':
                    $.get(service
                        , { "query": searchQuery, "bbox": extent.toBBOX() }
                        , data => {
                            var text = '';
                            var count = 0;
                            for (const address of data) {
                                if (count > 9) {
                                    return false;
                                }
                                if (!address.boundingbox) {
                                    return true;
                                }

                                var bbox = [
                                    address.boundingbox[2],
                                    address.boundingbox[0],
                                    address.boundingbox[3],
                                    address.boundingbox[1]
                                ];
                                bbox = new OpenLayers.Bounds(bbox);
                                if (extent.intersectsBounds(bbox)) {
                                    var lab = address.display_name.replace(labrex, '<strong class="highlight">$1</strong>');
                                    text += `<li><a href="#${bbox.toBBOX()}" data-wkt="POINT(${address.lon} ${address.lat})">${lab}</a></li>`;
                                    count++;
                                }
                            }
                            if (count == 0 || text == '') {
                                text = '<li>' + lizDict['externalsearch.notfound'] + '</li>';
                            }
                            this._updateExternalSearch('<li><strong>OpenStreetMap</strong><ul>' + text + '</ul></li>');
                        }, 'json');
                    break;
                case 'ign': {
                    if (searchQuery.length < 3 || searchQuery.length > 200) {
                        lizMap.addMessage(lizDict['externalsearch.ignlimit'], 'warning', true);
                        break;
                    }
                    let mapExtent4326 = transformExtent(this._map.getView().calculateExtent(), this._map.getView().getProjection().getCode(), 'EPSG:4326');
                    let queryParam = '?text=' + $('#search-query').val() + '&type=StreetAddress&maximumResponses=10&bbox=' + mapExtent4326;
                    $.getJSON(encodeURI(service + queryParam), data => {
                        let text = '';
                        let count = 0;
                        for (const result of data.results) {
                            var lab = result.fulltext.replace(labrex, '<strong class="highlight">$1</strong>');
                            text += `<li><a href="#${result.x},${result.y},${result.x},${result.y}" data-wkt="POINT(${result.x} ${result.y})">${lab}</a></li>`;
                            count++;
                        }
                        if (count == 0 || text == '') {
                            text = '<li>' + lizDict['externalsearch.notfound'] + '</li>';
                        }
                        this._updateExternalSearch('<li><strong>IGN</strong><ul>' + text + '</ul></li>');
                    });
                    break;
                }
                case 'google':
                    service.geocode({
                        'address': searchQuery,
                        'bounds': new google.maps.LatLngBounds(
                            new google.maps.LatLng(extent.top, extent.left),
                            new google.maps.LatLng(extent.bottom, extent.right)
                        )
                    }, (results, status) => {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var text = '';
                            var count = 0;
                            for (const address of results) {
                                if (count > 9) {
                                    return false;
                                }
                                var bbox = [];
                                if (address.geometry.viewport) {
                                    bbox = [
                                        address.geometry.viewport.getSouthWest().lng(),
                                        address.geometry.viewport.getSouthWest().lat(),
                                        address.geometry.viewport.getNorthEast().lng(),
                                        address.geometry.viewport.getNorthEast().lat()
                                    ];
                                } else if (address.geometry.bounds) {
                                    bbox = [
                                        address.geometry.bounds.getSouthWest().lng(),
                                        address.geometry.bounds.getSouthWest().lat(),
                                        address.geometry.bounds.getNorthEast().lng(),
                                        address.geometry.bounds.getNorthEast().lat()
                                    ];
                                }
                                if (bbox.length != 4) {
                                    return false;
                                }
                                bbox = new OpenLayers.Bounds(bbox);
                                if (extent.intersectsBounds(bbox)) {
                                    var lab = address.formatted_address.replace(labrex, '<strong class="highlight">$1</strong>');
                                    text += '<li><a href="#' + bbox.toBBOX() + '">' + lab + '</a></li>';
                                    count++;
                                }
                            }
                            if (count == 0 || text == '') {
                                text = '<li>' + lizDict['externalsearch.notfound'] + '</li>';
                            }
                            this._updateExternalSearch('<li><strong>Google</strong><ul>' + text + '</ul></li>');
                        } else {
                            this._updateExternalSearch('<li><strong>Google</strong><ul><li>' + lizDict['externalsearch.notfound'] + '</li></ul></li>');
                        }
                    });
                    break;
            }
            return false;
        });

        return true;
    }

    /**
     * PRIVATE method: _addSearches
     * add searches capability
     * @returns {boolean|void} searches added to the user interface
     */
    _addSearches() {
        var configOptions = this._lizmap3.config.options;
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
     * Update external search
     * @param {string} aHTML HTML to update
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
                    bbox = OpenLayers.Bounds.fromString(bbox);
                    bbox.transform(wgs84, this._lizmap3.map.getProjectionObject());
                    this._lizmap3.map.zoomToExtent(bbox);

                    var feat = new OpenLayers.Feature.Vector(bbox.toGeometry().getCentroid());
                    var geomWKT = linkClicked.dataset.wkt;
                    if (geomWKT) {
                        this._map.setHighlightFeatures(geomWKT, "wkt", "EPSG:4326");
                    }

                    $('#lizmap-search, #lizmap-search-close').removeClass('open');
                    // trigger event containing selected feature
                    this._lizmap3.events.triggerEvent('lizmapexternalsearchitemselected',
                        {
                            'feature': feat
                        }
                    );
                    return false;
                });
            });

            $('#lizmap-search-close button').click(() => {
                $('#lizmap-search, #lizmap-search-close').removeClass('open');
                return false;
            });
        }
    }
}
