/**
 * @module legacy/timemanager.js
 * @name Time manager
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

var lizTimemanager = function() {

    lizMap.events.on({
        'uicreated':function(evt){

            // Attributes
            var config = lizMap.config;
            var layers = lizMap.layers;
            var tmActive = false;
            var tmLayersNumber = 0;
            var tmLayerIndex = 0;
            var tmLayersDataFetched = 0;
            var tmLayersReady = false;

            if (!('timemanagerLayers' in config))
                return -1;

            // Count layers
            tmLayersNumber = Object.keys(lizMap.config.timemanagerLayers).length;

            $('#timemanager-menu button.btn-timemanager-clear').click(function() {
                document.getElementById('button-timemanager').click();
            });

            lizMap.events.on({
                minidockopened: function(e) {
                    if ( e.id == 'timemanager' ) {
                        if (!tmActive){
                            $('#timemanager-menu').show();
                            activateTimemanager();
                            tmActive = true;
                        }
                    }
                },
                minidockclosed: function(e) {
                    if ( e.id == 'timemanager' ) {
                        if(tmActive)
                            deactivateTimemanager();
                    }
                }
            });

            // Init slider with no values
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
            if (tmAnimationFrameLength < 1000)
                tmAnimationFrameLength = 1000;

            // Activate timemanager
            /**
             *
             */
            function activateTimemanager(){

                // hourglass
                //$('#loading').dialog('open');

                // Get min and max timestamps from layers
                var minTime = Infinity, maxTime = -Infinity ;
                for (var l in config.timemanagerLayers) {
                    var tmLayerConfig = config.timemanagerLayers[l];
                    getDataFromLayer(tmLayerConfig, function(mi, ma){

                        // Keep min and max values
                        config.timemanagerLayers[l]['min'] = mi;
                        config.timemanagerLayers[l]['max'] = ma;

                        // Get truncated min and max
                        var layerMinTime = moment(mi).startOf(tmTimeFrameType.slice(0, -1))
                        var layerMaxTime = moment(ma).endOf(tmTimeFrameType.slice(0, -1))

                        // Calculate global min and max
                        if (layerMinTime && layerMinTime < minTime) minTime = layerMinTime;
                        if (layerMaxTime && layerMaxTime > maxTime) maxTime = layerMaxTime;
                        tmStartDate = moment( minTime );
                        tmEndDate = moment( maxTime );
                        tmCurrentDate = moment( tmStartDate );

                        // Set slider
                        $('#tmCurrentValue').html(formatDatetime(tmStartDate, tmTimeFrameType));
                        $('#tmNextValue').html(formatDatetime(tmEndDate, tmTimeFrameType));
                        toggleNextSpan();
                        $("#tmSlider").slider({
                            min: tmStartDate.valueOf(),
                            max: tmEndDate.startOf(tmTimeFrameType.slice(0, -1)).valueOf(),
                            value: tmStartDate.valueOf()
                        });
                        tmLayersDataFetched+= 1;
                        tmLayersReady = (tmLayersDataFetched == tmLayersNumber);
                        loadTimemanager(tmLayersReady);

                    });
                }
                // Make sure to trigger filter for slider position
                onSliderStop();
            }

            // Deactivate Timemanager feature
            /**
             *
             */
            function deactivateTimemanager(){
                // Stop animation
                stopAnimation(true);

                // Hide menu
                $('#timemanager-menu').hide();
                tmActive = false;

                // Remove layers filters
                unFilterTimeLayers();
            }

            /**
             *
             * @param layerConfig
             * @param aCallback
             */
            function getDataFromLayer(layerConfig, aCallback){

                // Get min and max timestamp from layer
                var fieldnameContent = layerConfig.startAttribute;
                if( layerConfig.endAttribute && layerConfig.endAttribute != ''
                && layerConfig.endAttribute != layerConfig.startAttribute) {
                    fieldnameContent+= ',' + layerConfig.endAttribute;
                }

                // Check if min and max are already in config
                // Usefull for non SQL layers
                if ('min_timestamp' in layerConfig && layerConfig.min_timestamp && layerConfig.min_timestamp != ''
                    &&
                    'max_timestamp' in layerConfig && layerConfig.max_timestamp && layerConfig.max_timestamp != ''
                ) {
                    var dmin = layerConfig.min_timestamp;
                    var dmax = layerConfig.max_timestamp;
                    aCallback(dmin, dmax);
                    return true;
                }

                // Else query min and max timestamps via lizmap filter methods
                var sdata = {
                    request: 'getMinAndMaxValues',
                    layerId: layerConfig.layerId,
                    fieldname: fieldnameContent,
                    filter: ''
                };
                $.get(globalThis['filterConfigData'].url, sdata, function(result){
                    if( !result )
                        return false;
                    if( 'status' in result && result['status'] == 'error' ){
                        console.log(result.title + ': ' + result.detail);
                        return false;
                    }
                    // Get min and max from feature
                    var dmin = null;
                    var dmax = null;
                    for(var a in result){
                        var feat = result[a];
                        dmin = feat['min'];
                        dmax = feat['max'];
                    }
                    // Callback
                    aCallback(dmin, dmax);

                }, 'json');
            }


            // Add event on slider and buttons
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


            /**
             *
             * @param curDate
             * @param timeFrameSize
             * @param timeFrameType
             * @param factor
             * @param fDirection
             */
            function getSideDate(curDate, timeFrameSize, timeFrameType, factor, fDirection){
                var returnVal = moment(curDate).startOf(timeFrameType);
                var addValue = factor * tmTimeFrameSize * fDirection;
                returnVal.add(addValue, timeFrameType);
                return returnVal;
            }


            /**
             *
             * @param ready
             */
            function loadTimemanager(ready){
                if(!ready){
                    return true;
                }
                // Make sure to trigger filter for slider position
                onSliderStop();
            }

            /**
             *
             */
            function startAnimation() {
                // Stop animation if already loaded (play/pause behaviour)
                if (tmAnimationTimer) {
                    stopAnimation(true);
                }

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


            // Build the filter for QGIS Server
            /**
             *
             * @param layerConfig
             * @param min_val
             * @param max_val
             */
            function buildDateFilter(layerConfig, min_val, max_val){
                var filters = [];

                // Do nothing if min and max values entered equals the field min and max possible values
                if( min_val == layerConfig['min'] && max_val == layerConfig['max'] ){
                    layerConfig['data'] = {
                        'min_date': null,
                        'max_date': null
                    };
                    layerConfig['filter'] = null;
                    return null;
                }

                // fields
                var startField = layerConfig.startAttribute;
                var endField = layerConfig.endAttribute;
                var attributeResolution = layerConfig.attributeResolution;

                // min date filter
                if(min_val && Date.parse(min_val)){
                    var f_min = '( "' + startField + '"' + " >= '" + formatDatetime(min_val, attributeResolution) + "'";
                    if (endField && endField != '' && endField != startField){
                        f_min += " OR " + ' "' + endField + '"' + " >= '" + formatDatetime(min_val, attributeResolution) + "'";
                    }
                    f_min += " )";
                    filters.push(f_min);
                }else{
                    min_val = null;
                }

                // max date filter
                if(max_val && Date.parse(max_val)){
                    var f_max = '( "' + startField + '"' + " <= '" + formatDatetime(max_val, attributeResolution) + "'";
                    if(endField && endField != '' && endField != startField) {
                        f_max += " OR " + ' "' + endField + '"' + " <= '" + formatDatetime(max_val, attributeResolution) + "'";
                    }
                    f_max += " )";
                    filters.push(f_max);
                }else{
                    max_val = null;
                }

                var filter = null;
                if(filters.length){
                    filter = ' ( ';
                    filter+= filters.join(' AND ');
                    filter+= ' ) ';
                }
                layerConfig['data'] = {
                    'min_date': min_val,
                    'max_date': max_val
                };
                layerConfig['filter'] = filter;
                //console.log(filter);
                return filter;
            }


            /**
             *
             * @param lowerBoundary
             * @param upperBoundary
             */
            function setLayersFilter(lowerBoundary, upperBoundary){

                // shift upperBoundary for 1 millisecond to have strict <
                // lowerBoundary <= attribute < upperBoundary
                upperBoundary.subtract(1, 'milliseconds');

                // Set filter for each vector layer
                for (var l in config.timemanagerLayers){
                    filter = buildDateFilter(config.timemanagerLayers[l], lowerBoundary, upperBoundary);
                    lizMap.triggerLayerFilter(l, filter);
                }
            }



            /**
             *
             */
            function moveNext(){
                var nextLowerBoundary = getSideDate(
                    tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 1, 1
                );

                if (nextLowerBoundary.startOf(tmTimeFrameType.slice(0, -1)) <= tmEndDate.startOf(tmTimeFrameType.slice(0, -1))) {
                    var lowerBoundary = null;
                    var upperBoundary = null;
                    // Change lower boundary
                    lowerBoundary = nextLowerBoundary;
                    // Change upper boundary
                    upperBoundary = getSideDate(
                        tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 2, 1
                    );

                    updateStep(lowerBoundary, upperBoundary);

                } else {
                    // Go back to first step
                    stopAnimation(true);
                    // Make sure to trigger filter for slider position
                    onSliderStop();
                }
            }

            /**
             *
             */
            function movePrev() {
                var prevLowerBoundary = getSideDate(
                    tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 1, -1
                );
                if (prevLowerBoundary.startOf(tmTimeFrameType.slice(0, -1)) >= tmStartDate.startOf(tmTimeFrameType.slice(0, -1))) {
                    var lowerBoundary = null;
                    var upperBoundary = null;
                    // Change lower boundary
                    lowerBoundary = prevLowerBoundary;
                    // Change upper boundary
                    upperBoundary = moment(tmCurrentDate);

                    updateStep(lowerBoundary, upperBoundary);

                } else {
                    stopAnimation(true);
                    // Make sure to trigger filter for slider position
                    onSliderStop();
                }
            }

            // Display/hide the span containing the next time value
            /**
             *
             */
            function toggleNextSpan() {
                var hideNextSpan = ($('#tmCurrentValue').text() == $('#tmNextValue').text());
                $('#tmNextValue').toggle(!hideNextSpan);
                $('#tmNextValue').prev("span").toggle(!hideNextSpan);
            }

            /**
             *
             * @param lowerBoundary
             * @param upperBoundary
             */
            function updateStep(lowerBoundary, upperBoundary) {
                // Set layers filter
                setLayersFilter(lowerBoundary, upperBoundary);

                // Change global values
                tmCurrentDate = moment(lowerBoundary);

                // Display
                $('#tmCurrentValue').html(formatDatetime(tmCurrentDate, tmTimeFrameType));
                $('#tmNextValue').html(formatDatetime(moment(upperBoundary), tmTimeFrameType));
                toggleNextSpan();
                $("#tmSlider").slider( "option", "value", tmCurrentDate.valueOf() );
            }

            /**
             *
             */
            function onSliderUpdate() {
                var sliderVal = $("#tmSlider").slider( "option", "value" );
            }

            /**
             *
             * @param sliderDate
             * @param type
             */
            function setSliderStep(sliderDate, type){
                if (type == 'seconds') sliderDate = sliderDate.set( {'millisecond' : 0} );
                if (type == 'minutes') sliderDate = sliderDate.set( {'second' : 0});
                if (type == 'hours') sliderDate = sliderDate.set( {'minute' : 0});
                if (type == 'days') sliderDate = sliderDate.set( {'hour' : 0});
                if (type == 'weeks') sliderDate = sliderDate.day(1); // Monday ( TODO : make it locale aware ?)
                if (type == 'months') sliderDate = sliderDate.set( {'day' : 1});
                if (type == 'years') {
                    sliderDate.set( {'month' : 0});
                }
                return sliderDate;
            }

            /**
             *
             */
            function onSliderStop() {
                // Get slider data
                var sliderVal = $("#tmSlider").slider( "option", "value" );
                var sliderDate = moment(sliderVal);

                // Get nearest step depending on frame type (hour, year, etc.)
                sliderDate = sliderDate.startOf(tmTimeFrameType.slice(0, -1))

                // set new boundaries
                var lowerBoundary = sliderDate;
                var upperBoundary = getSideDate(
                    lowerBoundary, tmTimeFrameSize, tmTimeFrameType, 1, 1
                );

                updateStep(lowerBoundary, upperBoundary);
            }


            /**
             *
             * @param reset
             */
            function stopAnimation(reset) {
                // Deactivate javascript timer
                window.clearInterval(tmAnimationTimer);
                tmAnimationTimer = null;

                // Change button label to play
                $('#tmTogglePlay').html(lizDict['timemanager.toolbar.play']);

                // Reset current date to startDate if reset asked
                if (reset === true) {
                    tmCurrentDate = moment( tmStartDate );
                    $('#tmCurrentValue').html(formatDatetime(tmCurrentDate, tmTimeFrameType));
                    $("#tmSlider").slider( "option", "value", tmCurrentDate.valueOf() );
                    var upperBoundary = getSideDate(
                        tmCurrentDate, tmTimeFrameSize, tmTimeFrameType, 1, 1
                    );
                    $('#tmNextValue').html(formatDatetime(upperBoundary, tmTimeFrameType));
                    toggleNextSpan();
                }
            }

            /**
             *
             */
            function unFilterTimeLayers() {
                // Remove filter
                for(var layerName in lizMap.config.timemanagerLayers){
                    lizMap.deactivateMaplayerFilter(layerName);
                    // Refresh plots and popups
                    lizMap.config.layers[layerName]['request_params']['filtertoken'] = null;
                    lizMap.events.triggerEvent("layerFilterParamChanged",
                        {
                            'featureType': layerName,
                            'filter': null,
                            'updateDrawing': false
                        }
                    );
                }
            }

            /**
             *
             * @param mytime
             * @param timeResolution
             */
            function formatDatetime(mytime, timeResolution){
                var myDate = moment(mytime);
                var dString = null;
                switch(timeResolution){
                    case 'milliseconds': dString = 'YYYY-MM-DD HH:mm:ss';break;
                    case 'seconds': dString = 'YYYY-MM-DD HH:mm:ss';break;
                    case 'minutes': dString = 'YYYY-MM-DD HH:mm:00';break;
                    case 'hours': dString = 'YYYY-MM-DD HH:00';break;
                    case 'days': dString = 'YYYY-MM-DD';break;
                    case 'weeks': dString = 'YYYY-MM-DD';break;
                    case 'months': dString = 'YYYY-MM';break;
                    case 'years': dString = 'YYYY';break;
                }
                return myDate.format(dString);
            }

        }
    });


}();
