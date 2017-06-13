var lizTimemanager = function() {

    lizMap.events.on({
        'uicreated':function(evt){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var tmActive = false;
            var tmLayersNb = 0;
            var tmLayerIndex = 0;

            if (!('timemanagerLayers' in config))
              return -1;

            $('#timemanager-menu button.btn-timemanager-clear').click(function() {
                $('#button-timemanager').click();
            });

            lizMap.events.on({
                minidockopened: function(e) {
                    if ( e.id == 'timemanager' ) {
                        //~ console.log('timemanager dock set visible');
                        if (!tmActive){
                            $('#timemanager-menu').show();
                            activateTimemanager();
                            tmActive = true;
                        }
                    }
                },
                minidockclosed: function(e) {
                    if ( e.id == 'timemanager' ) {
                        //~ console.log('timemanager dock closed');
                        if(tmActive)
                            deactivateTimemanager();
                    }
                }
            });

            $("#tmSlider").slider( );

            var filter = null;
            var tmAnimationTimer;
            var tmCurrentDate;
            var tmStartDate = -Infinity; // lower bound of when values
            var tmEndDate = Infinity; // upper value of when values

            // Size of a frame
            var tmTimeFrameSize = config.options['tmTimeFrameSize'];
            // Unit for the frame size : milliseconds, seconds, minutes, hours, days, weeks, months, years
            var tmTimeFrameType = config.options['tmTimeFrameType'];
            // Length  for each frame (between each step)
            var tmAnimationFrameLength = config.options['tmAnimationFrameLength']

            // Lizmap URL
            var service = OpenLayers.Util.urlAppend(lizUrls.wms
                ,OpenLayers.Util.getParameterString(lizUrls.params)
            );

            var featureTypes = lizMap.getVectorLayerFeatureTypes();
            if (featureTypes.length == 0 ){
                //what to deactivate ?
            } else {
                featureTypes.each( function(){
                    var self = $(this);
                    var lname = self.find('Name').text();
                    var typeName = self.find('Name').text();
                    var lname = '';
                    if (typeName in config.timemanagerLayers)
                        lname = typeName
                    else if ( lizMap.getNameByShortName(typeName) ){
                        lname = lizMap.getNameByShortName(typeName);
                    } else {
                        for (ltl in config.timemanagerLayers) {
                            if (ltl.split(' ').join('_') == typeName) {
                                lname = ltl;
                                break;
                            }
                        }
                    }
                  if (lname in config.timemanagerLayers) {
                    // Get layers timemanager config information
                    tmLayerConfig = config.timemanagerLayers[lname];
                    var bbox = self.find('LatLongBoundingBox');
                    tmLayerConfig['bbox'] = [
                      parseFloat(bbox.attr('minx'))
                     ,parseFloat(bbox.attr('miny'))
                     ,parseFloat(bbox.attr('maxx'))
                     ,parseFloat(bbox.attr('maxy'))
                    ];
                    tmLayerConfig['title'] = self.find('Title').text();
                    tmLayerConfig['crs'] = self.find('SRS').text();
                    if ( tmLayerConfig.crs in Proj4js.defs ) {
                        new OpenLayers.Projection(tmLayerConfig.crs);

                        // in QGIS server > 2.14 GeoJSON is in EPSG:4326
                        if ( 'qgisServerVersion' in config.options && config.options.qgisServerVersion != '2.14' ) {
                            tmLayerConfig['crs'] = 'EPSG:4326';
                            var bbox = tmLayerConfig['bbox'];
                            var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
                            extent.transform(tmLayerConfig.crs, 'EPSG:4326');
                            tmLayerConfig['bbox'] = extent.toArray();
                        }
                    } else
                        $.get(service, {
                            'REQUEST':'GetProj4'
                           ,'authid': tmLayerConfig.crs
                        }, function ( aText ) {
                            Proj4js.defs[tmLayerConfig.crs] = aText;
                            new OpenLayers.Projection(tmLayerConfig.crs);

                            // in QGIS server > 2.14 GeoJSON is in EPSG:4326
                            if ( 'qgisServerVersion' in config.options && config.options.qgisServerVersion != '2.14' ) {
                                tmLayerConfig['crs'] = 'EPSG:4326';
                                var bbox = tmLayerConfig['bbox'];
                                var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
                                extent.transform(tmLayerConfig.crs, 'EPSG:4326');
                                tmLayerConfig['bbox'] = extent.toArray();
                            }
                        }, 'text');
                  }
                });
              }

            // Vector layers popup
            var tmHighlightedLayers = [];
            var highlightControl = null;

            // Vector layers group
            var tmGroups = {};

            // Activate timemanager
            function activateTimemanager(){

                // hourglass
                $('#loading').dialog('open');

                // Count layers
                for (id in config.timemanagerLayers) {
                    tmLayersNb++;
                }

                for (id in config.timemanagerLayers) {
                    // Get layer config
                    var aConfig = config.layers[id];

                    // Get layers timemanager config information
                    tmLayerConfig = config.timemanagerLayers[id];

                    // If layer already exists, activate it and continue
                    if( tmLayerConfig['layer'] ){
                        $('#loading').dialog('close');
                        if ( !tmLayerConfig.layer.getVisibility() ) {
                          $('#tmLayers button.checkbox[value="'+tmLayerConfig.group+'"]').click();
                          tmLayerConfig.layer.setVisibility(true);
                        }
                        continue;
                    }

                    // get typeName
                    var typeName = id.split(' ').join('_');
                    if ( 'shortname' in aConfig && aConfig.shortname != '' )
                      typeName = aConfig.shortname;

                    // WFS parameters
                    var wfsOptions = {
                        'SERVICE':'WFS'
                        ,'VERSION':'1.0.0'
                        ,'REQUEST':'GetFeature'
                        ,'TYPENAME': typeName
                        ,'OUTPUTFORMAT':'GeoJSON'
                    };

                    // Protocol to get layer via WFS
                    var protocol = new OpenLayers.Protocol.HTTP({
                        url:  service,
                        params: wfsOptions,
                        format: new OpenLayers.Format.GeoJSON()
                    });
                    tmLayerConfig['protocol'] = protocol;

                    // Filter : comparison
                    tmLayerConfig['filter'] = new OpenLayers.Filter;
                    tmLayerConfig['filterStrategy'] = new OpenLayers.Strategy.Filter(
                        {filter: tmLayerConfig['filter']}
                    );

                    var styleMap = new OpenLayers.StyleMap();
                    tmLayerConfig['styleMap'] = styleMap;

                    // Layer renderer
                    var renderers = ["Canvas", "SVG", "VML"];

                    // Define vector layer
                    var layer = new OpenLayers.Layer.Vector('tm@' + id, {
                        strategies: [
                            new OpenLayers.Strategy.Fixed(),
                            tmLayerConfig['filterStrategy']
                        ],
                        protocol: protocol,
                        styleMap: styleMap,
                        renderers: renderers,
                        projection: new OpenLayers.Projection(tmLayerConfig.crs)
                    });
                    tmLayerConfig['layer'] = layer;

                    layer.events.on({
                        loadend: function(evt) {
                            setAnimationBoundariesFromLayer(evt.object.name);
                            setLayerStyleMap(evt.object.name);
                            // Get aliases and types information
                            if ( !('alias' in aConfig) || !aConfig['alias']) {
                                $.get(service, {
                                    'SERVICE':'WFS'
                                   ,'VERSION':'1.0.0'
                                   ,'REQUEST':'DescribeFeatureType'
                                   ,'TYPENAME':typeName
                                   ,'OUTPUTFORMAT':'JSON'
                                }, function(describe) {

                                    aConfig['alias'] = describe.aliases;
                                    if ('types' in describe)
                                        aConfig['types'] = describe.types;

                                },'json');
                            }
                        }

                    });

                    if ('label' in tmLayerConfig){
                        tmHighlightedLayers.push(layer);
                    }

                    if ( 'group' in tmLayerConfig
                        && tmLayerConfig.group != '' ) {
                      if ( !(tmLayerConfig.group in tmGroups) ) {
                        tmGroups[tmLayerConfig.group] = {
                          id:tmLayerConfig.group,
                          title:tmLayerConfig.groupTitle,
                          layers:[layer]
                        };
                      }
                      tmGroups[tmLayerConfig.group].layers.push(layer);
                    } else {
                      tmGroups[id] = {
                        id:id,
                        title:tmLayerConfig.title,
                        layers:[layer]
                      };
                    }

                    lizMap.map.addLayer(layer);
                    layer.setVisibility(true);
                }


                if (tmHighlightedLayers.length > 0 && !highlightControl){
                    highlightControl = new OpenLayers.Control.SelectFeature(tmHighlightedLayers, {
                        hover: true,
                        highlightOnly: true,
                        renderIntent: "temporary"
                    });

                    highlightControl.events.on({
                        featurehighlighted: function(evt) {
                            if(tmAnimationTimer)
                                return null

                            var lname = evt.feature.layer.name.split("@")[1];
                            var lconfig = config.timemanagerLayers[lname];
                            var labelAttribute = lconfig['label'];
                            var labelAttributeTable = labelAttribute.split(',');
                            var html = '';
                            for (a in evt.feature.attributes){
                                for (b in labelAttributeTable){
                                    if (a == labelAttributeTable[b]){
                                        var attrName = a;
                                        var aConfig = config.layers[lname];
                                        if ('alias' in aConfig && aConfig['alias'] && a in aConfig['alias'] && aConfig['alias'][a] != "" ) {
                                            attrName = aConfig['alias'][a];
                                        }
                                        html+= '<b>' + attrName + '</b>: ' + evt.feature.attributes[a] + '</br>';
                                    }
                                }
                            }
                            var lonlat = evt.feature.geometry.getBounds().getCenterLonLat();

                            var popup = new OpenLayers.Popup.Anchored(
                                'tmPopup',
                                lonlat,
                                new OpenLayers.Size(150,100),
                                html,
                                {size: {w: 14, h: 14}, offset: {x: -7, y: -7}},
                                false
                            );

                            evt.feature.popup = popup;
                            lizMap.map.addPopup(popup);
                        },
                        featureunhighlighted: function(evt) {
                            lizMap.map.removePopup(evt.feature.popup);
                            evt.feature.popup.destroy();
                            evt.feature.popup = null;
                        }
                    });

                    lizMap.map.addControl(highlightControl);
                    highlightControl.activate();
                }
                if (highlightControl) {
                  highlightControl.activate();
                }


                $('#tmLayers button.checkbox').addClass('checked');

                if ($('#tmLayers').children().length == 0) {
                  for ( var g in tmGroups ) {
                    var tmGroup = tmGroups[g];
                    var div = '<div>';
                    div += '<button class="btn checkbox checked" name="tm" value="'+tmGroup.id+'" title="'+lizDict['tree.button.checkbox']+'"></button>';
                    div += '<span class="label" title="'+tmGroup.title+'">'+tmGroup.title+'</span>';
                    div += '</div>';
                    $('#tmLayers').append(div);
                  }
                  $('#tmLayers button.checkbox')
                  .click(function(){
                    var self = $(this);

                    if ( self.hasClass('checked') ) {
                      self.removeClass('checked');
                    } else {
                        self.addClass('checked');
                    }

                    var tmGroup = tmGroups[self.val()];
                    for (var i=0, len=tmGroup.layers.length; i<len; i++) {
                      tmGroup.layers[i].setVisibility( self.hasClass('checked') );
                    }
                  });
                }

            }

            // Deactivate Timemanager feature
            function deactivateTimemanager(){
                // Stop animation
                stopAnimation(true);
                // Hide layers
                if (highlightControl)
                  highlightControl.deactivate();
                for (id in config.timemanagerLayers) {
                    aName = 'tm@' + id;
                    var layer = lizMap.map.getLayersByName(aName)[0];
                    layer.setVisibility(false);
                    //~ lizMap.map.removeLayer(layer);

                }
                $('#tmLayers button.checkbox').removeClass('checked');
                // Hide menu
                $('#timemanager-menu').hide();

                tmActive = false;
            }

            function setLayerStyleMap(aName){
                var format_sld = new OpenLayers.Format.SLD();
                var id = aName.split("@")[1];
                // Get layer config
                var aConfig = config.layers[id];
                var wmsLayer = id.split(' ').join('_');
                if ( 'shortname' in aConfig && aConfig.shortname != '' )
                      wmsLayer = aConfig.shortname;
                // WFS parameters
                var wmsOptions = {
                    'SERVICE':'WMS'
                    ,'VERSION':'1.1.1'
                    ,'REQUEST':'GetStyles'
                    ,'LAYERS': wmsLayer
                    ,'STYLE': ''
                };
                OpenLayers.Request.GET({
                    url: service,
                    params: wmsOptions,
                    success: sldComplete
                });

                function sldComplete(req) {
                    var data = req.responseText;
                    var reg = new RegExp('<se\:Rotation>\\W*<ogc\:Filter>\\W*<ogc\:Add>', 'g');
                    data = data.replace(reg, '<se\:Rotation>');
                    var reg = new RegExp('<ogc:Literal>0</ogc:Literal>\\W*</ogc\:Add>\\W*</ogc\:Filter>\\W*</se\:Rotation>', 'g');
                    data = data.replace(reg, '</se\:Rotation>');
                    sld = format_sld.read(data);
                    for (var l in sld.namedLayers) {
                        var styles = sld.namedLayers[l].userStyles, style;
                        for (var i=0,ii=styles.length; i<ii; ++i) {
                            style = styles[i];
                            var rules = style.rules, rule;
                            // Set bigger pointRadius for Points
                            var factor = 96 / 25.4
                            for (var j=0,jj=rules.length; j<jj; ++j){
                                rule = rules[j];
                                if ('Point' in rule.symbolizer)
                                    rule.symbolizer.Point.pointRadius = factor * rule.symbolizer.Point.pointRadius;
                                if ('Polygon' in rule.symbolizer)
                                    rule.symbolizer.Polygon.strokeWidth = factor * parseInt(rule.symbolizer.Polygon.strokeWidth);
                                if ('Line' in rule.symbolizer)
                                    rule.symbolizer.Line.strokeWidth = factor * parseInt(rule.symbolizer.Line.strokeWidth);
                            }
                            if (style){
                                var z = aName.split("@")[1];
                                config.timemanagerLayers[z]['styleMap'].styles.default = style;
                                config.timemanagerLayers[z]['layer'].styleMap = config.timemanagerLayers[z]['styleMap'];
                                config.timemanagerLayers[z]['layer'].redraw();
                            }
                            break;
                        }

                    }
                    tmLayerIndex++;
                    if( tmLayerIndex == tmLayersNb ) $('#loading').dialog('close');
                }

            }


            function setAnimationBoundariesFromLayer(aName) {
                var layer = lizMap.map.getLayersByName(aName)[0];

                var features = layer.features;
                if (!features || features.length == 0){
                    if (tmActive){
                        deactivateTimemanager();
                        return null;
                    }
                }
                var minTime = Infinity, maxTime = -Infinity ;
                wmsLayer = aName.split("@")[1];
                var startAttribute = config.timemanagerLayers[wmsLayer]['startAttribute'];

                for (var fid in features) {
                    var feat = features[fid];
                    var featTime = Date.parse( feat.attributes[startAttribute].toString()  );

                    feat.attributes[startAttribute] = featTime;
                    if (featTime && featTime < minTime) minTime = featTime;
                    if (featTime && featTime > maxTime) maxTime = featTime;
                }
                tmStartDate = new Date( minTime.getTime() );
                tmEndDate = new Date( maxTime.getTime() );
                tmCurrentDate = new Date( tmStartDate.getTime() );

                config.timemanagerLayers[wmsLayer]['filter'] = new OpenLayers.Filter.Comparison({
                    type: OpenLayers.Filter.Comparison.BETWEEN,
                    property: startAttribute,
                    lowerBoundary: tmStartDate,
                    upperBoundary: tmStartDate
                });
                config.timemanagerLayers[wmsLayer]['filterStrategy'].setFilter(
                    config.timemanagerLayers[wmsLayer]['filter']
                );


                $('#tmCurrentValue').html(setDisplayedDate(tmStartDate));
                $("#tmSlider").slider({
                    min: tmStartDate.getTime(),
                    max: tmEndDate.getTime(),
                    value: tmStartDate.getTime()
                });
            }

            $( "#tmSlider" ).on( "slide", function( event, ui ) {
                onSliderUpdate();
            });
            $( "#tmSlider" ).on( "slidestop", function( event, ui ) {
                onSliderStop();
            });

            $("#tmTogglePlay").click(function(){
                if( $(this).html() == lizDict['timemanager.toolbar.play'] ){
                    startAnimation();
                } else {
                    stopAnimation();
                }

            });
            $("#tmPrev").click(function(){stopAnimation(false);movePrev();});
            $("#tmNext").click(function(){stopAnimation(false);moveNext();});


            function getSideDate(curDate, timeFrameSize, timeFrameType, factor, fDirection){
                var returnVal = new Date(curDate.getTime());
                var addValue = factor * tmTimeFrameSize * fDirection;
                switch(timeFrameType){
                    case 'milliseconds': returnVal = returnVal.addMilliseconds(addValue);break;
                    case 'seconds': returnVal = returnVal.addSeconds(addValue);break;
                    case 'minutes': returnVal = returnVal.addMinutes(addValue);break;
                    case 'hours': returnVal = returnVal.addHours(addValue);break;
                    case 'days': returnVal = returnVal.addDays(addValue);break;
                    case 'weeks': returnVal = returnVal.addWeeks(addValue);break;
                    case 'months': returnVal = returnVal.addMonths(addValue);break;
                    case 'years': returnVal = returnVal.addYears(addValue);break;
                }
                return returnVal;

            }

            function startAnimation() {
                // Stop animation if already loaded (play/pause behaviour)
                if (tmAnimationTimer) {
                    stopAnimation(true);
                }
                // Deactivate highlight control
                if(highlightControl)
                    highlightControl.deactivate();
                // Change play butonn into pause
                $('#tmTogglePlay').html(lizDict['timemanager.toolbar.pause']);

                // Set current date to beginning if not set
                if (!tmCurrentDate) {
                    tmCurrentDate = tmStartDate;
                }
                var next = function() {
                    moveNext();
                };
                tmAnimationTimer = window.setInterval(next, tmAnimationFrameLength);
            }

            function setLayersFilterBoundaries(lowerBoundary, upperBoundary){
                // shift upperBoundary for 1 millisecond to have strict <
                // lowerBoundary <= attribute < upperBoundary
                upperBoundary = new Date(upperBoundary.getTime() - 1);
                // Set filter for each vector layer
                for (id in config.timemanagerLayers){
                    filter = config.timemanagerLayers[id]['filter'];
                    if (lowerBoundary) filter.lowerBoundary = lowerBoundary;
                    if (upperBoundary) filter.upperBoundary = upperBoundary;
                    config.timemanagerLayers[id]['filter'] = filter;
                    config.timemanagerLayers[id]['filterStrategy'].setFilter(filter);
                }
            }

            function moveNext(){

                if (tmCurrentDate < tmEndDate) {
                    var lowerBoundary = null;
                    var upperBoundary = null;
                    // Change lower boundary
                    lowerBoundary = getSideDate(
                        tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 1, 1
                    );
                    // Change upper boundary
                    upperBoundary = getSideDate(
                        tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 2, 1
                    );

                    updateStep(lowerBoundary, upperBoundary);

                } else {
                    stopAnimation(true);
                }
            }

            function movePrev() {
                if (tmCurrentDate > tmStartDate) {
                    var lowerBoundary = null;
                    var upperBoundary = null;
                    // Change lower boundary
                    lowerBoundary = getSideDate(
                        tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 1, -1
                    );
                    // Change upper boundary
                    upperBoundary = new Date(tmCurrentDate.getTime());

                    updateStep(lowerBoundary, upperBoundary);

                } else {
                    stopAnimation(true);
                }
            }

            function updateStep(lowerBoundary, upperBoundary) {
                // Set layers filter
                setLayersFilterBoundaries(lowerBoundary, upperBoundary);
                // Change global values
                tmCurrentDate = new Date(lowerBoundary.getTime());
                // Display
                $('#tmCurrentValue').html(setDisplayedDate(tmCurrentDate));
                $("#tmSlider").slider( "option", "value", tmCurrentDate.getTime() );
            }

            function onSliderUpdate() {
                var sliderVal = $("#tmSlider").slider( "option", "value" );
            }

            function setSliderStep(sliderDate, type){
                if (type == 'seconds') sliderDate = sliderDate.set( {millisecond : 0} );
                if (type == 'minutes') sliderDate = sliderDate.set( {second : 0});
                if (type == 'hours') sliderDate = sliderDate.set( {minute : 0});
                if (type == 'days') sliderDate = sliderDate.set( {hour : 0});
                if (type == 'weeks') sliderDate = sliderDate.monday();
                if (type == 'months') sliderDate = sliderDate.set( {day : 1});
                if (type == 'years') {
                    sliderDate.set( {month : 0});
                }
                return sliderDate;
            }

            function onSliderStop() {
                // Get slider data
                var sliderVal = $("#tmSlider").slider( "option", "value" );
                var sliderDate = new Date(sliderVal);
                // Get nearest step depending on frame type (hour, year, etc.)
                var tmTypes = ['milliseconds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
                for (id in tmTypes) {
                    sliderDate = setSliderStep(sliderDate, tmTypes[id]);
                    if (tmTypes[id] == tmTimeFrameType)
                        break;
                }
                // set new boundaries
                var lowerBoundary = new Date(sliderDate.getTime());
                var upperBoundary = getSideDate(
                    lowerBoundary, tmTimeFrameSize, tmTimeFrameType, 1, 1
                );

                updateStep(lowerBoundary, upperBoundary);
            }


            function stopAnimation(reset) {
                // Deactivate javascript timer
                window.clearInterval(tmAnimationTimer);
                tmAnimationTimer = null;
                // Change button label to play
                $('#tmTogglePlay').html(lizDict['timemanager.toolbar.play']);
                // Activate highlight control
                if(highlightControl)
                    highlightControl.activate();
                // Reset current date to startDate if reset asked
                if (reset === true) {
                    tmCurrentDate = new Date( new Date(tmStartDate).getTime() );
                    $('#tmCurrentValue').html(setDisplayedDate(tmCurrentDate));
                    $("#tmSlider").slider( "option", "value", tmCurrentDate.getTime() );
                    var upperBoundary = getSideDate(
                        tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 1, 1
                        );
                    setLayersFilterBoundaries(tmCurrentDate, upperBoundary);
                }
            }

            function setDisplayedDate(mytime){
                myDate = new Date(mytime);
                var dString = null;
                switch(tmTimeFrameType){
                    case 'milliseconds': dString = 'yyyy-MM-dd HH:mm:ss';break;
                    case 'seconds': dString = 'yyyy-MM-dd HH:mm:ss';break;
                    case 'minutes': dString = 'yyyy-MM-dd HH:mm:00';break;
                    case 'hours': dString = 'yyyy-MM-dd HH:00';break;
                    case 'days': dString = 'yyyy-MM-dd';break;
                    case 'weeks': dString = 'yyyy-MM-dd';break;
                    case 'months': dString = 'yyyy-MM';break;
                    case 'years': dString = 'yyyy';break;
                }
                return myDate.toString(dString);
            }

        }
    });


}();
