/**
 * @module modules/LocateByLayer.js
 * @name LocateByLayer
 * @copyright 2024 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import DOMPurify from 'dompurify';

import GeoJSON from 'ol/format/GeoJSON.js';

/**
 * @class
 * @name LocateByLayer
 */
export default class LocateByLayer {
    /**
     * Build the lizmap LocateByLayer instance
     * @param {LocateByLayerConfig} locateByLayer - The lizmap locateByLayer config
     * @param {Config[]} vectorLayerFeatureTypeList - The list of WFS feature type
     * @param {Map}           map           - OpenLayers map
     * @param {object}        lizmap3       - The old lizmap object
     */
    constructor(locateByLayer, vectorLayerFeatureTypeList, map, lizmap3) {
        this._map = map;
        this._vectorLayerFeatureTypeList = vectorLayerFeatureTypeList;

        this._lizmap3 = lizmap3;
        this._lizmap3LocateByLayerConfig = lizmap3.config.locateByLayer;

        const locateBtn = document.getElementById('button-locate');
        if (locateByLayer) {
            this.addLocateByLayer();
            document.querySelector('#mapmenu .locate').classList.add('active')
            document.getElementById('locate').classList.remove('hide')
        } else {
            locateBtn?.parentNode.classList.add('hide');
        }
    }

    addLocateByLayer() {
        var locateByLayerList = [];
        for (var lname in this._lizmap3LocateByLayerConfig) {
            if ('order' in this._lizmap3LocateByLayerConfig[lname]){
                locateByLayerList[this._lizmap3LocateByLayerConfig[lname].order] = lname;
            } else {
                locateByLayerList.push(lname);
            }
        }
        var locateContent = [];
        for (var l in locateByLayerList) {
            var locatedElement = locateByLayerList[l];
            var lConfig = this._lizmap3.config.layers[locatedElement];
            var html = '<div class="locate-layer">';
            html += '<select id="locate-layer-' + this._lizmap3.cleanName(locatedElement) + '" class="label">';
            html += '<option>' + lConfig.title + '...</option>';
            html += '</select>';
            html += '</div>';
            //constructing the select
            locateContent.push(html);
        }
        $('#locate .menu-content').html(locateContent.join('<hr/>'));

        var featureTypes = this._vectorLayerFeatureTypeList;
        if (featureTypes.length == 0) {
            this._lizmap3LocateByLayerConfig = {};
            $('#button-locate').parent().remove();
            $('#locate-menu').remove();
        } else {
            for (const featureType of featureTypes) {
                var typeName = featureType.Name;
                var nameByTypeName = this._lizmap3.getNameByTypeName(typeName);
                if (!nameByTypeName) {
                    if (typeName in this._lizmap3LocateByLayerConfig)
                        nameByTypeName = typeName
                    else if ((typeName in shortNameMap) && (shortNameMap[typeName] in this._lizmap3LocateByLayerConfig))
                        nameByTypeName = shortNameMap[typeName];
                    else {
                        for (var lbl in this._lizmap3LocateByLayerConfig) {
                            if (lbl.split(' ').join('_') == typeName) {
                                nameByTypeName = lbl;
                                break;
                            }
                        }
                    }
                }

                if (!(nameByTypeName in this._lizmap3LocateByLayerConfig))
                    continue;

                var locate = this._lizmap3LocateByLayerConfig[nameByTypeName];
                locate['crs'] = featureType.SRS;
                locate['bbox'] = featureType.LatLongBoundingBox;
            }

            // get joins
            for (var lName in this._lizmap3LocateByLayerConfig) {
                var element = this._lizmap3LocateByLayerConfig[lName];
                if ('vectorjoins' in element && element['vectorjoins'].length != 0) {
                    var vectorjoin = element['vectorjoins'][0];
                    element['joinFieldName'] = vectorjoin['targetFieldName'];
                    for (var jName in this._lizmap3LocateByLayerConfig) {
                        var jLocate = this._lizmap3LocateByLayerConfig[jName];
                        if (jLocate.layerId == vectorjoin.joinLayerId) {
                            vectorjoin['joinLayer'] = jName;
                            element['joinLayer'] = jName;
                            jLocate['joinFieldName'] = vectorjoin['joinFieldName'];
                            jLocate['joinLayer'] = lName;
                            jLocate['filterjoins'] = [{
                                'targetFieldName': vectorjoin['joinFieldName'],
                                'joinFieldName': vectorjoin['targetFieldName'],
                                'joinLayerId': element.layerId,
                                'joinLayer': lName
                            }];
                        }
                    }
                }
            }

            // get locate by layers features
            for (var layerName in this._lizmap3LocateByLayerConfig) {
                this.getLocateFeature(layerName);
            }
            document.getElementById('locate-clear').addEventListener('click', () => {
                this._lizmap3.mainLizmap.map.clearHighlightFeatures();
                $('#locate select').val('-1');
                $('div.locate-layer span > input').val('');

                if (this._lizmap3.lizmapLayerFilterActive) {
                    this._lizmap3.events.triggerEvent('lizmaplocatefeaturecanceled',
                        { 'featureType': this._lizmap3.lizmapLayerFilterActive }
                    );
                }
                return false;

            });
            document.getElementById('locate-close').addEventListener('click', () => {
                $('.btn-locate-clear').click(); // deactivate locate and filter
                document.getElementById('button-locate')?.click();
                return false;
            });
        }
    }

    /**
     * Get features for locate by layer tool
     * @param {string} aName - The layer name
     */
    getLocateFeature(aName) {
        var locate = this._lizmap3LocateByLayerConfig[aName];

        // get fields to retrieve
        var fields = ['geometry',locate.fieldName];
        // if a filter field is defined
        if ('filterFieldName' in locate)
            fields.push( locate.filterFieldName );
        // check for join fields
        if ( 'filterjoins' in locate ) {
            var filterjoins = locate.filterjoins;
            for ( var i=0, len=filterjoins.length; i<len; i++) {
                var filterjoin = filterjoins[i];
                fields.push( filterjoin.targetFieldName );
            }
        }
        if ( 'vectorjoins' in locate ) {
            var vectorjoins = locate.vectorjoins;
            for ( var k=0, vectorjoinsLen=vectorjoins.length; k<vectorjoinsLen; k++) {
                var vectorjoin = vectorjoins[i];
                fields.push( vectorjoin.targetFieldName );
            }
        }

        // Get WFS url and options
        var getFeatureUrlData = this._lizmap3.getVectorLayerWfsUrl( aName, null, null, 'extent' );
        getFeatureUrlData['options']['PROPERTYNAME'] = fields.join(',');

        var layerName = this._lizmap3.cleanName(aName);

        // Get data
        $.post( getFeatureUrlData['url'], getFeatureUrlData['options'], data => {
            var lConfig = this._lizmap3.config.layers[aName];
            locate['features'] = {};
            if ( !data.features )
                data = JSON.parse(data);
            var features = data.features;

            if ('filterFieldName' in locate) {
                // create filter combobox for the layer
                features.sort(function(a, b) {
                    var aProperty = a.properties[locate.filterFieldName];
                    var bProperty = b.properties[locate.filterFieldName];
                    if (isNaN(aProperty)) {
                        if (isNaN(bProperty)) {  // a and b are strings
                            return aProperty.localeCompare(bProperty);
                        } else {         // a string and b number
                            return 1;  // a > b
                        }
                    } else {
                        if (isNaN(bProperty)) {  // a number and b string
                            return -1;  // a < b
                        } else {         // a and b are numbers
                            return parseFloat(aProperty) - parseFloat(bProperty);
                        }
                    }
                });
                var filterPlaceHolder = '';
                if ( 'filterFieldAlias' in locate && locate.filterFieldAlias!='')
                    filterPlaceHolder += locate.filterFieldAlias+' ';
                else
                    filterPlaceHolder += locate.filterFieldName;
                filterPlaceHolder +=' ('+ lConfig.title + ')';
                var fOptions = '<option value="-1"></option>';
                var fValue = '-1';
                for (var i=0, len=features.length; i<len; i++) {
                    var feat = features[i];
                    if ( fValue != feat.properties[locate.filterFieldName] ) {
                        fValue = feat.properties[locate.filterFieldName];
                        fOptions += '<option value="'+fValue+'">'+fValue+'</option>';
                    }
                }

                // add filter values list
                $('#locate-layer-'+layerName).parent().before('<div class="locate-layer"><select id="locate-layer-'+layerName+'-'+locate.filterFieldName+'">'+fOptions+'</select></div><br/>');
                // listen to filter select changes
                document.getElementById('locate-layer-'+layerName+'-'+locate.filterFieldName).addEventListener("change", () => {
                    var filterValue = $(this).children(':selected').val();
                    this.updateLocateFeatureList( aName );
                    if (filterValue == '-1')
                        $('#locate-layer-'+layerName+'-'+locate.filterFieldName+' ~ span > input').val('');
                    $('#locate-layer-'+layerName+' ~ span > input').val('');
                    $('#locate-layer-'+layerName).val('-1');
                    this.zoomToLocateFeature(aName);
                });
                // add combobox to the filter select
                $('#locate-layer-'+layerName+'-'+locate.filterFieldName).combobox({
                    position: { my : "right top", at: "right bottom" },
                    "selected": function(evt, ui){
                        if ( ui.item ) {
                            const self = this;
                            var uiItem = $(ui.item);
                            window.setTimeout(function(){
                                self.value = uiItem.val();
                                self.dispatchEvent(new Event('change'));
                            }, 1);
                        }
                    }
                });

                // add place holder to the filter combobox input
                $('#locate-layer-'+layerName+'-'+locate.filterFieldName+' ~ span > input').attr('placeholder', filterPlaceHolder).val('');
                $('#locate-layer-'+layerName+'-'+locate.filterFieldName+' ~ span > input').autocomplete('close');
            }

            // create combobox for the layer
            features.sort(function(a, b) {
                var aProperty = a.properties[locate.fieldName];
                var bProperty = b.properties[locate.fieldName];
                if (isNaN(aProperty)) {
                    if (isNaN(bProperty)) {  // a and b are strings
                        return aProperty.localeCompare(bProperty);
                    } else {         // a string and b number
                        return 1;  // a > b
                    }
                } else {
                    if (isNaN(bProperty)) {  // a number and b string
                        return -1;  // a < b
                    } else {         // a and b are numbers
                        return parseFloat(aProperty) - parseFloat(bProperty);
                    }
                }
            });
            var placeHolder = '';
            if ('filterFieldName' in locate) {
                if ( 'fieldAlias' in locate && locate.fieldAlias!='' )
                    placeHolder += locate.fieldAlias+' ';
                else
                    placeHolder += locate.fieldName+' ';
                placeHolder += '('+lConfig.title+')';
            } else {
                placeHolder = lConfig.title;
            }
            var options = '<option value="-1"></option>';
            for (var j=0, featuresLen=features.length; j<featuresLen; j++) {
                var featElement = features[j];
                locate.features[featElement.id.toString()] = featElement;
                if ( !('filterFieldName' in locate) )
                    options += '<option value="' + featElement.id + '">' + DOMPurify.sanitize(featElement.properties[locate.fieldName]) + '</option>';
            }
            document.getElementById('locate-layer-'+layerName).innerHTML = options;
            // listen to select changes
            document.getElementById('locate-layer-'+layerName).addEventListener("change", (event) => {
                var val = event.target.value;
                if (val == '-1') {
                    $('#locate-layer-'+layerName+' ~ span > input').val('');
                    // update to join layer
                    if ( 'filterjoins' in locate && locate.filterjoins.length != 0 ) {
                        var filterjoins = locate.filterjoins;
                        for (var i=0, len=filterjoins.length; i<len; i++) {
                            var filterjoin = filterjoins[i];
                            var jName = filterjoin.joinLayer;
                            if ( jName in this._lizmap3LocateByLayerConfig ) {
                                // update joined select options
                                var oldVal = $('#locate-layer-'+cleanName(jName)).val();
                                this.updateLocateFeatureList( jName );
                                $('#locate-layer-'+cleanName(jName)).val( oldVal );
                                return;
                            }
                        }
                    }
                    // zoom to parent selection
                    if ( 'vectorjoins' in locate && locate.vectorjoins.length == 1 ) {
                        var joinName = locate.vectorjoins[0].joinLayer;
                        if ( joinName in this._lizmap3LocateByLayerConfig ) {
                            this.zoomToLocateFeature( joinName );
                            return;
                        }
                    }
                    // clear the map
                    this.zoomToLocateFeature( aName );
                } else {
                    // zoom to val
                    this.zoomToLocateFeature( aName );
                    // update joined layer
                    if ( 'filterjoins' in locate && locate.filterjoins.length != 0 ) {
                        var filterjoinsList = locate.filterjoins;
                        for (var index=0, length=filterjoinsList.length; index<length; index++) {
                            var filterJ = filterjoinsList[index];
                            var filterJName = filterJ.joinLayer;
                            if ( filterJName in this._lizmap3LocateByLayerConfig ) {
                                // update joined select options
                                this.updateLocateFeatureList( filterJName );
                                $('#locate-layer-'+cleanName(filterJName)).val('-1');
                                $('#locate-layer-'+cleanName(filterJName)+' ~ span > input').val('');
                            }
                        }
                    }
                }
                $(this).blur();
                return;
            });
            $('#locate-layer-'+layerName).combobox({
                "minLength": ('minLength' in locate) ? locate.minLength : 0,
                "position": { my : "right top", at: "right bottom" },
                "selected": function(evt, ui){
                    if ( ui.item ) {
                        const self = this;
                        var uiItem = $(ui.item);
                        window.setTimeout(function(){
                            self.value = uiItem.val();
                            self.dispatchEvent(new Event('change'));
                        }, 1);
                    }
                }
            });
            $('#locate-layer-'+layerName+' ~ span > input').attr('placeholder', placeHolder).val('');
            $('#locate-layer-'+layerName+' option[value=-1]').attr('label', placeHolder);
            $('#locate-layer-'+layerName+' ~ span > input').autocomplete('close');
            if ( ('minLength' in locate) && locate.minLength > 0 )
                $('#locate-layer-'+layerName).parent().addClass('no-toggle');
            if (this._lizmap3.checkMobile()) {
                // autocompletion items for locatebylayer feature
                $('div.locate-layer select').show();
                $('span.custom-combobox').hide();
            }
        },'json');
    }

    /**
     * Zoom to locate feature
     * @param {string} aName - The layer name
     */
    zoomToLocateFeature(aName) {
        // clear highlight layer
        this._map.clearHighlightFeatures();

        // get locate by layer val
        var locate = this._lizmap3LocateByLayerConfig[aName];
        var layerName = this._lizmap3.cleanName(aName);
        var val = $('#locate-layer-'+layerName).val();
        if (val == '-1') {
            // Trigger event
            this._lizmap3.events.triggerEvent('lizmaplocatefeaturecanceled', {'featureType': aName });
        } else {
            // zoom to val
            const featGeoJSON = locate.features[val];
            if( featGeoJSON.geometry){
                const geom = (new GeoJSON()).readGeometry(featGeoJSON.geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: this._lizmap3.mainLizmap.projection
                });
                // Show geometry if asked
                if (locate.displayGeom == 'True') {
                    var getFeatureUrlData = this._lizmap3.getVectorLayerWfsUrl( aName, null, null, null );
                    getFeatureUrlData['options']['PROPERTYNAME'] = ['geometry',locate.fieldName].join(',');
                    getFeatureUrlData['options']['FEATUREID'] = val;
                    // Get data
                    $.post( getFeatureUrlData['url'], getFeatureUrlData['options'], data => {
                        if ( !data.features ){
                            data = JSON.parse(data);
                        }
                        this._map.setHighlightFeatures(data.features[0], "geojson");
                    }).fail(() => {
                        this._.map.setHighlightFeatures(feat, "geojson");
                    });
                }
                // zoom to extent
                this._map.zoomToGeometryOrExtent(geom);
            }

            var fid = val.split('.')[1];

            // Trigger event
            this._lizmap3.events.triggerEvent('lizmaplocatefeaturechanged',
                {
                    'featureType': aName,
                    'featureId': fid
                }
            );
        }
    }

    /**
     * Get features for locate by layer tool
     * @param {string} aName - The layer name
     */
    updateLocateFeatureList(aName) {
        var locate = this._lizmap3LocateByLayerConfig[aName];
        // clone features reference
        var features = {};
        for ( var fid in locate.features ) {
            features[fid] = locate.features[fid];
        }
        // filter by filter field name
        if ('filterFieldName' in locate) {
            var filterValue = $('#locate-layer-' + this._lizmap3.cleanName(aName) + '-'+locate.filterFieldName).val();
            if ( filterValue != '-1' ) {
                for (var featureId in features) {
                    var feat = features[featureId];
                    if (feat.properties[locate.filterFieldName] != filterValue)
                        delete features[featureId];
                }
            } else
                features = {}
        }
        // filter by vector joins
        if ( 'vectorjoins' in locate && locate.vectorjoins.length != 0 ) {
            var vectorjoins = locate.vectorjoins;
            for ( var i=0, len =vectorjoins.length; i< len; i++) {
                var vectorjoin = vectorjoins[i];
                var jName = vectorjoin.joinLayer;
                if ( jName in this._lizmap3LocateByLayerConfig ) {
                    var jLocate = this._lizmap3LocateByLayerConfig[jName];
                    var jVal = $('#locate-layer-' + this._lizmap3.cleanName(jName)).val();
                    if ( jVal == '-1' ) continue;
                    var jFeat = jLocate.features[jVal];
                    for (var featId in features) {
                        var feature = features[featId];
                        if ( feature.properties[vectorjoin.targetFieldName] != jFeat.properties[vectorjoin.joinFieldName] )
                            delete features[featId];
                    }
                }
            }
        }
        // create the option list
        const placeHolder = this._lizmap3.config.layers[aName].title;
        var options = '<option value="-1" label="'+placeHolder+'"></option>';
        for (var featureElementId in features) {
            var featureElement = features[featureElementId];
            options += '<option value="' + featureElement.id + '">' + DOMPurify.sanitize(featureElement.properties[locate.fieldName]) + '</option>';
        }
        // add option list
        $('#locate-layer-'+ this._lizmap3.cleanName(aName)).html(options);
    }
};
