/**
 * @module modules/LocateByLayer.js
 * @name LocateByLayer
 * @copyright 2024 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import DOMPurify from 'dompurify';

import GeoJSON from 'ol/format/GeoJSON.js';

/**
 * @class
 * @name LocateByLayer
 */
export default class LocateByLayer {
    constructor() {
        this._locateByLayerConfig = lizMap.config.locateByLayer;
        const locateBtn = document.getElementById('button-locate');
        if (mainLizmap.initialConfig.locateByLayer) {
            this.addLocateByLayer();
            locateBtn?.click();
        } else {
            locateBtn?.parentNode.classList.add('hide');
        }
    }

    addLocateByLayer() {
        var locateByLayerList = [];
        for (var lname in this._locateByLayerConfig) {
            if ('order' in this._locateByLayerConfig[lname])
                locateByLayerList[this._locateByLayerConfig[lname].order] = lname;
            else
                locateByLayerList.push(lname);
        }
        var locateContent = [];
        for (var l in locateByLayerList) {
            var lname = locateByLayerList[l];
            var lConfig = lizMap.config.layers[lname];
            var html = '<div class="locate-layer">';
            html += '<select id="locate-layer-' + lizMap.cleanName(lname) + '" class="label">';
            html += '<option>' + lConfig.title + '...</option>';
            html += '</select>';
            html += '</div>';
            //constructing the select
            locateContent.push(html);
        }
        $('#locate .menu-content').html(locateContent.join('<hr/>'));

        var featureTypes = lizMap.mainLizmap.initialConfig.vectorLayerFeatureTypeList;
        if (featureTypes.length == 0) {
            this._locateByLayerConfig = {};
            $('#button-locate').parent().remove();
            $('#locate-menu').remove();
        } else {
            for (const featureType of featureTypes) {
                var typeName = featureType.Name;
                var lname = lizMap.getNameByTypeName(typeName);
                if (!lname) {
                    if (typeName in this._locateByLayerConfig)
                        lname = typeName
                    else if ((typeName in shortNameMap) && (shortNameMap[typeName] in this._locateByLayerConfig))
                        lname = shortNameMap[typeName];
                    else {
                        for (var lbl in this._locateByLayerConfig) {
                            if (lbl.split(' ').join('_') == typeName) {
                                lname = lbl;
                                break;
                            }
                        }
                    }
                }

                if (!(lname in this._locateByLayerConfig))
                    continue;

                var locate = this._locateByLayerConfig[lname];
                locate['crs'] = featureType.SRS;
                // loadProjDefinition(locate.crs, function () {
                //     new OpenLayers.Projection(locate.crs);
                // });
                locate['bbox'] = featureType.LatLongBoundingBox;
            }

            // get joins
            for (var lName in this._locateByLayerConfig) {
                var locate = this._locateByLayerConfig[lName];
                if ('vectorjoins' in locate && locate['vectorjoins'].length != 0) {
                    var vectorjoin = locate['vectorjoins'][0];
                    locate['joinFieldName'] = vectorjoin['targetFieldName'];
                    for (var jName in this._locateByLayerConfig) {
                        var jLocate = this._locateByLayerConfig[jName];
                        if (jLocate.layerId == vectorjoin.joinLayerId) {
                            vectorjoin['joinLayer'] = jName;
                            locate['joinLayer'] = jName;
                            jLocate['joinFieldName'] = vectorjoin['joinFieldName'];
                            jLocate['joinLayer'] = lName;
                            jLocate['filterjoins'] = [{
                                'targetFieldName': vectorjoin['joinFieldName'],
                                'joinFieldName': vectorjoin['targetFieldName'],
                                'joinLayerId': locate.layerId,
                                'joinLayer': lName
                            }];
                        }
                    }
                }
            }

            // get locate by layers features
            for (var lname in this._locateByLayerConfig) {
                this.getLocateFeature(lname);
            }
            $('.btn-locate-clear').click(function () {
                lizMap.mainLizmap.map.clearHighlightFeatures();
                $('#locate select').val('-1');
                $('div.locate-layer span > input').val('');

                if (lizMap.lizmapLayerFilterActive) {
                    lizMap.events.triggerEvent('lizmaplocatefeaturecanceled',
                        { 'featureType': lizMap.lizmapLayerFilterActive }
                    );
                }
                return false;

            });
            $('#locate-close').click(function () {
                $('.btn-locate-clear').click(); // deactivate locate and filter
                document.getElementById('button-locate')?.click();
                return false;
            });
        }
    }

     /**
     * Get features for locate by layer tool
     * @param aName
     */
     getLocateFeature(aName) {
        var locate = this._locateByLayerConfig[aName];

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
            for ( var i=0, len=vectorjoins.length; i<len; i++) {
                var vectorjoin = vectorjoins[i];
                fields.push( vectorjoin.targetFieldName );
            }
        }

        // Get WFS url and options
        var getFeatureUrlData = lizMap.getVectorLayerWfsUrl( aName, null, null, 'extent' );
        getFeatureUrlData['options']['PROPERTYNAME'] = fields.join(',');

        var layerName = lizMap.cleanName(aName);

        // Get data
        $.post( getFeatureUrlData['url'], getFeatureUrlData['options'], (data) => {
            var lConfig = lizMap.config.layers[aName];
            locate['features'] = {};
            if ( !data.features )
                data = JSON.parse(data);
            var features = data.features;
            // if( locate.crs != 'EPSG:4326' && features.length != 0) {
            //     // load projection to be sure to have the definition
            //     loadProjDefinition( locate.crs, function() {
            //         locate.crs = 'EPSG:4326';
            //     });
            // }

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
            for (var i=0, len=features.length; i<len; i++) {
                var feat = features[i];
                locate.features[feat.id.toString()] = feat;
                if ( !('filterFieldName' in locate) )
                    options += '<option value="' + feat.id + '">' + DOMPurify.sanitize(feat.properties[locate.fieldName]) + '</option>';
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
                            if ( jName in this._locateByLayerConfig ) {
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
                        var jName = locate.vectorjoins[0].joinLayer;
                        if ( jName in this._locateByLayerConfig ) {
                            this.zoomToLocateFeature( jName );
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
                        var filterjoins = locate.filterjoins;
                        for (var i=0, len=filterjoins.length; i<len; i++) {
                            var filterjoin = filterjoins[i];
                            var jName = filterjoin.joinLayer;
                            if ( jName in this._locateByLayerConfig ) {
                                // update joined select options
                                this.updateLocateFeatureList( jName );
                                $('#locate-layer-'+cleanName(jName)).val('-1');
                                $('#locate-layer-'+cleanName(jName)+' ~ span > input').val('');
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
            if(lizMap.checkMobile()){
                // autocompletion items for locatebylayer feature
                $('div.locate-layer select').show();
                $('span.custom-combobox').hide();
            }
        },'json');
    }

    /**
     * Zoom to locate feature
     * @param aName
     */
    zoomToLocateFeature(aName) {
        // clear highlight layer
        lizMap.mainLizmap.map.clearHighlightFeatures();

        // get locate by layer val
        var locate = this._locateByLayerConfig[aName];
        var layerName = lizMap.cleanName(aName);
        var val = $('#locate-layer-'+layerName).val();
        if (val == '-1') {
            // Trigger event
            lizMap.events.triggerEvent('lizmaplocatefeaturecanceled', {'featureType': aName });
        } else {
            // zoom to val
            const featGeoJSON = locate.features[val];
            if( featGeoJSON.geometry){
                const geom = (new GeoJSON()).readGeometry(featGeoJSON.geometry, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: lizMap.mainLizmap.projection
                });
                // Show geometry if asked
                if (locate.displayGeom == 'True') {
                    var getFeatureUrlData = getVectorLayerWfsUrl( aName, null, null, null );
                    getFeatureUrlData['options']['PROPERTYNAME'] = ['geometry',locate.fieldName].join(',');
                    getFeatureUrlData['options']['FEATUREID'] = val;
                    // Get data
                    $.post( getFeatureUrlData['url'], getFeatureUrlData['options'], function(data) {
                        if ( !data.features ){
                            data = JSON.parse(data);
                        }
                        lizMap.mainLizmap.map.setHighlightFeatures(data.features[0], "geojson");
                    }).fail(function(){
                        lizMap.mainLizmap.map.setHighlightFeatures(feat, "geojson");
                    });
                }
                // zoom to extent
                lizMap.mainLizmap.map.zoomToGeometryOrExtent(geom);
            }

            var fid = val.split('.')[1];

            // Trigger event
            lizMap.events.triggerEvent('lizmaplocatefeaturechanged',
                {
                    'featureType': aName,
                    'featureId': fid
                }
            );
        }
    }

    /**
     * Get features for locate by layer tool
     * @param aName
     */
    updateLocateFeatureList(aName) {
        var locate = this._locateByLayerConfig[aName];
        // clone features reference
        var features = {};
        for ( var fid in locate.features ) {
            features[fid] = locate.features[fid];
        }
        // filter by filter field name
        if ('filterFieldName' in locate) {
            var filterValue = $('#locate-layer-' + lizMap.cleanName(aName) + '-'+locate.filterFieldName).val();
            if ( filterValue != '-1' ) {
                for (var fid in features) {
                    var feat = features[fid];
                    if (feat.properties[locate.filterFieldName] != filterValue)
                        delete features[fid];
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
                if ( jName in this._locateByLayerConfig ) {
                    var jLocate = this._locateByLayerConfig[jName];
                    var jVal = $('#locate-layer-' + lizMap.cleanName(jName)).val();
                    if ( jVal == '-1' ) continue;
                    var jFeat = jLocate.features[jVal];
                    for (var fid in features) {
                        var feat = features[fid];
                        if ( feat.properties[vectorjoin.targetFieldName] != jFeat.properties[vectorjoin.joinFieldName] )
                            delete features[fid];
                    }
                }
            }
        }
        // create the option list
        const placeHolder = lizMap.config.layers[aName].title;
        var options = '<option value="-1" label="'+placeHolder+'"></option>';
        for (var fid in features) {
            var feat = features[fid];
            options += '<option value="' + feat.id + '">' + DOMPurify.sanitize(feat.properties[locate.fieldName]) + '</option>';
        }
        // add option list
        $('#locate-layer-'+ lizMap.cleanName(aName)).html(options);
    }
};
