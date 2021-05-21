var lizLayerFilterTool = function() {

    lizMap.events.on({
        'uicreated':function(){

        if (typeof variable != "undefined")
            return true;

        // Compute the HTML container for the form
        function getLayerFilterDockRoot(){
            var html = '';

            html+= '<div class="menu-content">';
            // Add combo box to select the layer
            html+= '<select id="liz-filter-layer-selector">';
            var flayers = {};
            for (var o in filterConfig) {
                var conf = filterConfig[o];
                if( !(conf.layerId in flayers) ){
                    // Get layer
                    var layerId = conf.layerId;
                    var lconfig_get = lizMap.getLayerConfigById(layerId);
                    if( !lconfig_get)
                        continue;
                    var lname = lconfig_get[0];
                    var lconf = lconfig_get[1];
                    var displayName = lname;
                    if( 'title' in lconf && lconf.title != '' ){
                        displayName = lconf.title;
                    }
                    html+= '<option value="'+layerId+'">'+displayName+'</option>';
                    flayers[layerId] = true;
                }
            }
            html+= '</select></br>';

            // Add total feature counter
            var total = 0
            html+= '<b><span id="liz-filter-item-layer-total-count">' + total + '</span> '+lizDict['filter.label.features']+'</b>';

            // Add zoom link
            html+= '<br/><button id="liz-filter-zoom" class="btn btn-mini btn-primary" title="'+lizDict['filter.btn.zoom.title']+'">'+lizDict['filter.btn.zoom.label']+'</button>';

            // Add export button
            html+= '&nbsp;&nbsp;<button id="liz-filter-export" class="btn btn-mini btn-primary" title="'+lizDict['filter.btn.export.title']+'">'+lizDict['filter.btn.export.label']+'</button>';

            // Add unfilter link
            html+= '&nbsp;&nbsp;<button id="liz-filter-unfilter" class="btn btn-mini btn-primary" title="'+lizDict['filter.btn.reset.title']+'">'+lizDict['filter.btn.reset.label']+'</button>';

            html+= '</div>';

            // Add tree
            html+= '<div style="padding:10px 10px;" class="tree menu-content"></div>';

            return html;
        }

        function addLayerFilterToolInterface(){

            // Build interface html code
            // Add dock
            var html = getLayerFilterDockRoot();
            $('#filter-content').html(html);

            // Get 1st layer found as default layer
            var layerId = filterConfig[0]['layerId'];
            filterConfigData.layerId = layerId;

            // Activate the unfilter link
            $('#liz-filter-unfilter').click(function(){
                // Remove filter
                deactivateFilter();
                return false;
            });

            // Activate the zoom button
            $('#liz-filter-zoom').click(function(){
                zoomToFeatures()
                return false;
            });

            // Activate the export button
            $('#liz-filter-export').click(function(){
                lizMap.config.layers[filterConfigData.layerName].request_params['filter'] = filterConfigData.filter;
                lizMap.exportVectorLayer(filterConfigData.layerName, 'ODS', false);
                delete lizMap.config.layers[filterConfigData.layerName].request_params['filter'];
                return false;
            });

            // Add tooltip
            $('#filter-content [title]').tooltip();
        }

        // Launch the form filter feature
        function launchLayerFilterTool(layerId){

            // Get layer name
            var getConfig = lizMap.getLayerConfigById(layerId);
            if( !getConfig)
                return false;
            var layerName = getConfig[0];
            filterConfigData.layerName = layerName;

            // Remove previous field inputs
            $('div.liz-filter-field-box').remove();

            // Get html and add it
            getLayerFilterForm();

            // Limit dock size
            adaptLayerFilterSize();

            // Get Feature count
            getFeatureCount();

            // Set default zoom extent setZoomExtent
            // Only if first query works
            // Which means PHP spatialite extension is activated
            if( $('#liz-filter-zoom').is(":visible") ){
                setZoomExtent();
            }
        }

        // Get the HTML form
        // By getting form element for each field
        function getLayerFilterForm(){
            var layerId = filterConfigData.layerId;

            // Sort attribute layers as given by creation order in Lizmap plugin
            var formFilterLayersSorted = [];
            for (var o in filterConfig) {
                var field_item = filterConfig[o];
                if( 'title' in field_item && field_item.layerId == layerId ){
                    formFilterLayersSorted.push(field_item);
                    $("#filter div.tree").append('<div id="filter-field-order'+String(field_item.order)+'"></div>');
                }
            }

            // Add form fields
            for(var conf in formFilterLayersSorted){

            	var field_item = formFilterLayersSorted[conf];
            	getFormFieldInput(field_item);
            }
        }

        // Get the HTML form elemnt for a specific field
        function getFormFieldInput(field_item){
            var field_config = filterConfig[field_item.order];

            // unique values
            if( field_config['type'] == 'uniquevalues' ){
                return uniqueValuesFormInput(field_item);
            }

            // date
            if( field_config['type'] == 'date' ){
                return dateFormInput(field_item);
            }

            // numeric
            if( field_config['type'] == 'numeric' ){
                return numericFormInput(field_item);
            }

            // text
            if( field_config['type'] == 'text' ){
                return textFormInput(field_item);
            }

            return '';
        }

        function getFormFieldHeader(field_item){
            var html = '';
            html+= '<div class="liz-filter-field-box" id="liz-filter-box-';
            html+= lizMap.cleanName(field_item.title);
            html+= '">';
            var flabel = field_item.title;
            html+= '<span style="font-weight:bold;">' + flabel +'</span>';
            html+= '<button class="btn btn-primary btn-mini pull-right liz-filter-reset-field" title="'+lizDict['filter.btn.reset.title']+'" value="'+field_item.order+'">x</button>';
            html+= '<p>';

            return html;
        }

        function getFormFieldFooter(){
            var html = '';
            html+= '</p>';
            html+= '</div>';

            return html;
        }

        function checkResult(result){
            if (!result) {
                return false;
            }
            if ('status' in result && result['status'] == 'error') {
                console.log(result.title + ': ' + result.detail);
                return false;
            }
            return true;
        }

        // Get the HTML form element for the date field type
        function dateFormInput(field_item){
            // max_date = min_date when undefined
            const max_date = ('max_date' in field_item) ? field_item.max_date : field_item.min_date;

            var sdata = {
                request: 'getMinAndMaxValues',
                layerId: field_item.layerId,
                fieldname: field_item.min_date + ',' + max_date,
                filter: ''
            };
            $.get(filterConfigData.url, sdata, function(result){
                if(!checkResult(result)){
                    return false;
                }

                for(var a in result){
                    var feat = result[a];
                    // Add minutes to time zone offset when not present (needed for Firefox).
                    if (feat['min'][feat['min'].length - 3] === '+'){
                        feat['min'] = feat['min'] + ':00';
                    }
                    if (feat['max'][feat['max'].length - 3] === '+') {
                        feat['max'] = feat['max'] + ':00';
                    }
                    var dmin = formatDT(new Date(feat['min']), 'yy-mm-dd');
                    var dmax = formatDT(new Date(feat['max']), 'yy-mm-dd');
                    filterConfig[field_item.order]['min'] = dmin;
                    filterConfig[field_item.order]['max'] = dmax;
                }

                var html = '';
                html+= getFormFieldHeader(field_item);
                html+= '<span style="white-space:nowrap">';
                html+= '<input id="liz-filter-field-min-date' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-date" value="'+field_item['min']+'" style="width:100px;">';
                html+= '<input id="liz-filter-field-max-date' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-date" value="'+field_item['max']+'" style="width:100px;">';
                html+= '</span>';

                // http://jsfiddle.net/Lcrsd3jt/45/
                // pour avoir un date et time picker, see https://github.com/trentrichardson/jQuery-Timepicker-Addon
                html+= '<div id="liz-filter-datetime-range'+ lizMap.cleanName(field_item.title)+'">';
                html+= '    <div>';
                html+= '        <div id="liz-filter-slider-range'+ lizMap.cleanName(field_item.title)+'"></div>';
                html+= '    </div>';
                html+= '</div>';

                html+= getFormFieldFooter(field_item);
                $("#filter-field-order"+String(field_item.order)).append(html);
                $("#filter input.liz-filter-field-date").datepicker({
                    dateFormat: 'yy-mm-dd',
                    changeMonth: true,
                    changeYear: true,
                    minDate:  new Date(feat['min']),
                    maxDate:  new Date(feat['max'])
                });

                addFieldEvents(field_item);

            }, 'json');

        }

        // Get the HTML form element for the numeric field type
        function numericFormInput(field_item){
            var sdata = {
                request: 'getMinAndMaxValues',
                layerId: field_item.layerId,
                fieldname: field_item['field'],
                filter: ''
            };
            $.get(filterConfigData.url, sdata, function(result){
                if (!checkResult(result)) {
                    return false;
                }

                for(var a in result){
                    var feat = result[a];
                    filterConfig[field_item.order]['min'] = Number(feat['min']);
                    filterConfig[field_item.order]['max'] = Number(feat['max']);
                }

                var html = '';
                html+= getFormFieldHeader(field_item);
                html+= '<span style="white-space:nowrap">';
                html+= '<input id="liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title) + '" type="number" value="'+field_item['min']+'" step="' + 1 + '" min="'+field_item['min']+'" max="'+field_item['max']+'" class="liz-filter-field-numeric" style="width:100px;">';
                html+= '<input id="liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title) + '" type="number" value="'+field_item['max']+'" step="'+field_item['step']+'" min="'+field_item['min']+'" max="'+field_item['max']+'" class="liz-filter-field-numeric" style="width:100px;">';
                html+= '</span>';

                html+= '<div id="liz-filter-numeric-range'+ lizMap.cleanName(field_item.title)+'">';
                html+= '    <div>';
                html+= '        <div id="liz-filter-slider-range'+ lizMap.cleanName(field_item.title)+'"></div>';
                html+= '    </div>';
                html+= '</div>';

                html+= getFormFieldFooter(field_item);

                $("#filter-field-order"+String(field_item.order)).append(html);

                addFieldEvents(field_item);

            }, 'json');

        }

        // Get the HTML form element for the text field type
        function textFormInput(field_item){
            // Ajout des données d'autocompletion
            var field = field_item['field'];
            var sdata = {
                request: 'getUniqueValues',
                layerId: field_item.layerId,
                fieldname: field,
                filter: ''
            };
            $.get(filterConfigData.url, sdata, function(result){
                if (!checkResult(result)) {
                    return false;
                }

                var autocompleteData = [];
                for(var a in result){
                    var feat = result[a];
                    if (feat['v'] === null || !feat['v'] || (typeof feat['v'] === 'string' && feat['v'].trim() === '') )
                        continue;
                    autocompleteData.push(feat['v']);
                }

                var html = '';
                html += getFormFieldHeader(field_item);
                html += '<div style="width: 100%;">'
                html += '<input id="liz-filter-field-text' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-text" value="" title="' + lizDict['filter.input.text.title'] + '" placeholder="' + lizDict['filter.input.text.placeholder'] + '">';
                html += '</div>'
                html += getFormFieldFooter(field_item);

                $("#filter-field-order"+String(field_item.order)).append(html);
                addFieldEvents(field_item);

                $( "#liz-filter-field-text" + lizMap.cleanName(field_item.title) ).autocomplete({
                    source: autocompleteData,
                    autoFocus: false, // do not autofocus, because this prevents from searching with LIKE
                    delay: 200,
                    minLength: 2,
                    select: function( event, ui ) {
                        $(this).val(ui.item.value);
                        $(this).change();
                    }
                });
            }, 'json');
        }

        // Get the HTML form element for the uniqueValues field type
        // possible format: checkboxes or select
        function uniqueValuesFormInput(field_item){

            // Get unique values data (and counters)
            var sdata = {
                request: 'getUniqueValues',
                layerId: field_item.layerId,
                fieldname: field_item.field,
                filter: ''
            };
            $.get(filterConfigData.url, sdata, function(result){
                if (!checkResult(result)) {
                    return false;
                }

                var html = '';
                html += getFormFieldHeader(field_item);

                if (field_item.format == 'select') {
                    html += '<select id="liz-filter-field-' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-select">';
                    html += '<option value=""> --- </option>';
                    html += '</select>';
                }
                html += getFormFieldFooter(field_item);

             	$("#filter-field-order"+String(field_item.order)).append(html);

                if( !('items' in filterConfig[field_item.order]) )
                    filterConfig[field_item.order]['items'] = {};
                for(var a in result){
                    var feat = result[a];
                    filterConfig[field_item.order]['items'][feat['v']] = feat['c'];
                }

                var dhtml = '';
                var fkeys = Object.keys(
                    filterConfig[field_item.order]['items']
                );

                // Order fkeys alphabetically (which means sort checkboxes for each field)
                fkeys.sort(function (a, b) {
                    return a.localeCompare(b);
                });

                for( var z in fkeys ){
                    var f_val = fkeys[z];
                    var label = f_val;

                    if ( field_item.format == 'select' ) {
                        dhtml+= '<option value="' + lizMap.cleanName(f_val) +'">';
                    } else {
                        var inputId = 'liz-filter-field-' + lizMap.cleanName(field_item.title) + '-' + lizMap.cleanName(f_val);
                        dhtml+= '<span style="font-weight:normal;">';

                        dhtml+= '<button id="' + inputId + '" class="btn checkbox liz-filter-field-value" value="' + lizMap.cleanName(f_val) +'"></button>';

                    }
                    dhtml+= '&nbsp;' + label;

                    // close item
                    if ( field_item.format == 'select' ) {
                        dhtml+= '</option>';
                    } else {
                        dhtml+= '</span></br>';
                    }

                }
                var id = 'liz-filter-box-' + lizMap.cleanName(field_item.title);
                if ( field_item.format == 'select' ){
                    $('#' + id + ' select').append(dhtml);
                }else{
                    $('#' + id + ' p').append(dhtml);
                }

                addFieldEvents(field_item);
            }, 'json');
        }

        // Generate filter string for a field
        // Depending on the selected inputs
        function setFormFieldFilter(field_item){
            if( filterConfigData.deactivated ){
                return false;
            }

            // Set filter depending on field type
            // Unique values
            if( field_item.type == 'uniquevalues' ){
                setUniqueValuesFilter(field_item);
            }

            // Dates
            if( field_item.type == 'date' ){
                setDateFilter(field_item);
            }

            // Numeric
            if( field_item.type == 'numeric' ){
                setNumericFilter(field_item);
            }

            // Texte
            if( field_item.type == 'text' ){
                setTextFilter(field_item);
            }

            // Update global form filter
            setFormFilter();
        }

        // Set the filter for the uniqueValues field type
        function setUniqueValuesFilter(field_item){
            var field_config = filterConfig[field_item.order]

            // First loop through each field value
            // And check if the item (e.g checkbox) is selected or not
            filterConfig[field_item.order]['data'] = {}
            var allchecked = true;
            var nonechecked = true;
            if ( field_config.format == 'select' ) {
                var selectId = '#liz-filter-field-' + lizMap.cleanName(field_item.title);
                var selectVal = $(selectId).val();
                var clist = [];
                for(var f_val in filterConfig[field_item.order]['items']){
                    // Get checked status
                    var achecked = (selectVal == lizMap.cleanName(f_val));
                    if(!achecked){
                        allchecked = false;
                    }else{
                        nonechecked = false;
                        clist.push(f_val.replace(/'/g, "''"));
                    }
                    filterConfig[field_item.order]['data'][f_val] = achecked;
                }
            }
            if ( field_config.format == 'checkboxes' ) {
                var clist = [];
                for(var f_val in filterConfig[field_item.order]['items']){
                    // Get checked status
                    var inputId = '#liz-filter-field-' + lizMap.cleanName(field_item.title) + '-' + lizMap.cleanName(f_val);
                    var achecked = $(inputId).hasClass('checked');
                    if(!achecked){
                        allchecked = false;
                    }else{
                        nonechecked = false;
                        clist.push(f_val.replace(/'/g, "''"));
                    }
                    filterConfig[field_item.order]['data'][f_val] = achecked;
                }
            }
            filterConfig[field_item.order]['allchecked'] = allchecked;
            filterConfig[field_item.order]['nonechecked'] = nonechecked;
            filterConfig[field_item.order]['selected'] = clist;
            var filter = null;
            var field = field_item['field'];
            if(clist.length){
                if( 'splitter' in field_item && field_item['splitter'] != '' ){

                    filter = ' ( ';
                    var sep = '';
                    var lk = 'LIKE';
                    if( field_item.provider == 'postgres' ){
                        lk = 'ILIKE';
                    }
                    for(var i in clist){
                        var cval = clist[i];
                        filter+= sep + '"' + field + '"' + " " + lk + " '%" + cval + "%' ";
                        // if postgresql use ILIKE instead for WMS filtered requests
                        sep = ' AND ';
                    }
                    filter+= ' ) ';
                } else {
                    filter = '"' + field + '"' + " IN ( '" + clist.join("' , '") + "' ) ";
                }
            }
            filterConfig[field_item.order]['filter'] = filter;

        }

        // Set the filter for the Date type
        function setDateFilter(field_item){
            var filters = [];

            // get input values
            var min_id = '#liz-filter-field-min-date' + lizMap.cleanName(field_item.title);
            var max_id = '#liz-filter-field-max-date' + lizMap.cleanName(field_item.title);
            var min_val = $(min_id).val().trim();
            var max_val = $(max_id).val().trim();

            // Do nothing if min and max values entered equals the field min and max possible values
            if( min_val == field_item['min'] && max_val == field_item['max'] ){
                filterConfig[field_item.order]['filter'] = null;
                return true;
            }

            // fields
            var startField = field_item.min_date;
            var endField = ('max_date' in field_item) ? field_item.max_date : field_item.min_date;

            // min date filter
            if(min_val && Date.parse(min_val)){
                filters.push('( "' + startField + '"' + " >= '" + min_val + "'" + " OR " + ' "' + endField + '"' + " >= '" + min_val + "' )");
            }else{
                min_val = null;
            }

            // max date filter
            if(max_val && Date.parse(max_val)){
                filters.push('( "' + startField + '"' + " <= '" + max_val + "'" + " OR " + ' "' + endField + '"' + " <= '" + max_val + "' )");
            }else{
                max_val = null;
            }

            var filter = null;
            if(filters.length){
                var filter = ' ( ';
                filter+= filters.join(' AND ');
                filter+= ' ) ';
            }
            filterConfig[field_item.order]['data'] = {
                'min_date': min_val,
                'max_date': max_val
            };
            filterConfig[field_item.order]['filter'] = filter;

        }

        // Set the filter for the Numeric type
        function setNumericFilter(field_item){
            var filters = [];

            // get input values
            var min_id = '#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title);
            var max_id = '#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title);
            var min_val = $(min_id).val().trim();
            var max_val = $(max_id).val().trim();

            // Do nothing if min and max values entered equals the field min and max possible values
            if( min_val == field_item['min'] && max_val == field_item['max'] ){
                filterConfig[field_item.order]['filter'] = null;
                return true;
            }

            // field
            var field = field_item['field'];

            // min value filter
            if(min_val != ''){
                filters.push('( "' + field + '"' + " >= '" + min_val + "' )" );
            }else{
                min_val = null;
            }

            // max value filter
            if(max_val != ''){
                filters.push('( "' + field + '"' + " <= '" + max_val + "' )");
            }else{
                max_val = null;
            }

            var filter = null;
            if(filters.length){
                var filter = ' ( ';
                filter+= filters.join(' AND ');
                filter+= ' ) ';
            }
            filterConfig[field_item.order]['data'] = {
                'min': min_val,
                'max': max_val
            };
            filterConfig[field_item.order]['filter'] = filter;

        }

        // Set the filter for a text field_item
        function setTextFilter(field_item){

            var id = '#liz-filter-field-text' + lizMap.cleanName(field_item.title);
            var val = $(id).val().trim().replace(/'/g, "''");

            filterConfig[field_item.order]['data'] = {
                'text': val
            };
            var filter = null;
            var lk = 'LIKE';
            if( field_item.provider == 'postgres' ){
                lk = 'ILIKE';
            }
            var field = field_item['field'];
            if(val){
                filter = '"' + field + '"' + " " + lk + " '%" + val + "%'";
            }

            filterConfig[field_item.order]['data'] = {
                'text': val
            };
            filterConfig[field_item.order]['filter'] = filter;
        }


        // Compute the global filter to pass to the layer
        function setFormFilter(){
            var layerId = filterConfigData.layerId;

            var afilter = [];
            for (var o in filterConfig) {
                var field_item = filterConfig[o];
                if( 'title' in field_item && field_item['filter'] && field_item.layerId == layerId){
                    afilter.push(field_item['filter']);
                }
            }
            var filter = afilter.join(' AND ');

            // Trigger the filter on the layer
            var layerName = filterConfigData.layerName;
            triggerLayerFilter(layerName, filter);

            getFeatureCount(filter);

            if( $('#liz-filter-zoom').is(":visible") ){
                setZoomExtent(filter);
            }

            filterConfigData.filter = filter;

        }


        // Apply the global filter on the layer
        function triggerLayerFilter(layername, filter){

            // Get layer information
            var layerN = layername;
            var layer = null;
            var layers = lizMap.map.getLayersByName( lizMap.cleanName(layername) );
            if( layers.length == 1) {
                layer = layers[0];
            }
            if(!layer)
                return false;
            if( layer.params) {
                layerN = layer.params['LAYERS'];
            }

            // Add filter to the layer
            if( !filter || filter == ''){
                filter = null;
                var lfilter = null;

            }else{
                var lfilter = layerN + ':' + filter;
            }
            layer.params['FILTER'] = lfilter;
            if( !('request_params' in lizMap.config.layers[layername]) ){
                lizMap.config.layers[layername]['request_params'] = {};
            }

            // Add WFS exp_filter param
            lizMap.config.layers[layername]['request_params']['exp_filter'] = filter;

            // Get WMS filter token ( used via GET in GetMap or GetPrint )
            var surl = OpenLayers.Util.urlAppend(lizUrls.wms
                ,OpenLayers.Util.getParameterString(lizUrls.params)
            );
            var sdata = {
                service: 'WMS',
                request: 'GETFILTERTOKEN',
                typename: layername,
                filter: lfilter
            };
            $.post(surl, sdata, function(result){
                var filtertoken = result.token;
                // Add OpenLayers layer parameter
                delete layer.params['FILTER'];
                layer.params['FILTERTOKEN'] = filtertoken
                lizMap.config.layers[layername]['request_params']['filtertoken'] = filtertoken;

                // Redraw openlayers layer
                if( lizMap.config.layers[layername]['geometryType']
                    && lizMap.config.layers[layername]['geometryType'] != 'none'
                    && lizMap.config.layers[layername]['geometryType'] != 'unknown'
                ){
                    //layer.redraw(true);
                    layer.redraw();
                }

                // Tell popup to be aware of the filter
                lizMap.events.triggerEvent("layerFilterParamChanged",
                    {
                        'featureType': layername,
                        'filter': lfilter,
                        'updateDrawing': false
                    }
                );
            });

            return true;
        }

        // Deactivate the layer filter
        // And display all features
        function deactivateFilter(){
            var layerId = filterConfigData.layerId;

            // Deactivate all triggers to avoid unnecessary requests
            filterConfigData.deactivated = true;
            for (var o in filterConfig) {
                var field_item = filterConfig[o];
                if( 'title' in field_item && field_item.layerId == layerId ){
                    resetFormField(field_item.order);
                }
            }
            filterConfigData.deactivated = false;

            // Remove filter on map layers
            var layerName = filterConfigData.layerName;
            deactivateMaplayerFilter(layerName);

            // Refresh plots
            lizMap.events.triggerEvent("layerFilterParamChanged",
                {
                    'featureType': layerName,
                    'filter': null,
                    'updateDrawing': false
                }
            );

            // Get feature count
            getFeatureCount();

            // Set zoom extent
            if( $('#liz-filter-zoom').is(":visible") ){
                setZoomExtent();
            }

            // Remove feature info geometry
            removeFeatureInfoGeometry();

        }

        function resetFormField(field_item_order){
            var field_item = filterConfig[field_item_order];

            if( field_item.type == 'date' ){
                $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val(field_item['min']);
                $('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val(field_item['max']).change(); // .change() so that the slider is also resetted
            }
            else if( field_item['type'] == 'numeric' ){
                $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title)).val(field_item['min']);
                $('#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).val(field_item['max']).change();
            }
            else if( field_item['type'] == 'uniquevalues' ){
                if(field_item.format == 'checkboxes'){
                    $('#liz-filter-box-' + lizMap.cleanName(field_item.title) + ' button.liz-filter-field-value.checked').removeClass('checked');
                }
                else if(field_item.format == 'select'){
                    $('#liz-filter-field-' + lizMap.cleanName(field_item.title)).val(
                        $('#liz-filter-field-' + lizMap.cleanName(field_item.title)+ ' option:first').val()
                    );

                }
            }
            else if( field_item['type'] == 'text' ){
                $('#liz-filter-field-text' + lizMap.cleanName(field_item.title)).val('');
            }

            // Remove filter in stored object
            filterConfig[field_item.order]['filter'] = null;

        }

        function deactivateMaplayerFilter(layername){
            // Get layer information
            var layerN = layername;
            var layer = null;
            var layers = lizMap.map.getLayersByName( lizMap.cleanName(layername) );
            if( layers.length == 1) {
                layer = layers[0];
            }

            // Remove layer filter
            delete layer.params['FILTER'];
            delete layer.params['FILTERTOKEN'];
            delete layer.params['EXP_FILTER'];
            if( !('request_params' in lizMap.config.layers[layername]) ){
                lizMap.config.layers[layername]['request_params'] = {};
            }
            lizMap.config.layers[layername]['request_params']['exp_filter'] = null;
            lizMap.config.layers[layername]['request_params']['filtertoken'] = null;
            lizMap.config.layers[layername]['request_params']['filter'] = null;
            layer.redraw();
        }

        // Removes the getFeatureInfo geometry
        function removeFeatureInfoGeometry(){
            var layer = lizMap.map.getLayersByName('locatelayer');
            if ( layer.length == 1 )
                layer[0].destroyFeatures();
        }

        // Adapt the size of the dock
        function adaptLayerFilterSize(){
            lizMap.events.on({
                // Adapt dock size to display metadata
                dockopened: function(e) {
                    if ( e.id == 'filter') {
                        lizMap.updateContentSize();
                    }
                },
                rightdockclosed: function() {
                },
                minidockclosed: function() {
                },
                layerfeatureremovefilter: function(){
                    var layerId = filterConfigData.layerId;;

                    // We need to reset the form
                    // Deactivate all triggers to avoid unnecessary requests
                    filterConfigData.deactivated = true;
                    for (var o in filterConfig) {
                        var field_item = filterConfig[o];
                        if( !('title' in field_item) || field_item.layerId !== layerId ){
                            continue;
                        }
                        resetFormField(field_item.order);
                    }
                    filterConfigData.deactivated = false;

                    // Get feature count
                    getFeatureCount();
                }
            });

        }

        function formatDT(aDate, dateFormat) {
            var formatted = $.datepicker.formatDate(dateFormat, aDate);
            return formatted;
        };

        // Add an event on the inputs of a given field
        // For example, do something when a checkox is clicked
        // This triggers the calculation of the filter for the field
        function addFieldEvents(field_item){
            var container = 'liz-filter-box-' + lizMap.cleanName(field_item.title);
            var field_config = filterConfig[field_item.order]

            if( field_item.type == 'uniquevalues' ){
                if( field_item.format == 'checkboxes' ){
                    $('#' + container + ' button.liz-filter-field-value').click(function(){
                        var self = $(this);
                        // Do nothing if disabled
                        if (self.hasClass('disabled'))
                            return false;
                        // Add checked class if unchecked
                        if( !self.hasClass('checked') )
                            self.addClass('checked');
                        else
                            self.removeClass('checked');

                        // Filter the data
                        setFormFieldFilter(field_item);
                    });
                }
                if( field_item.format == 'select' ){

                    $('#liz-filter-field-' + lizMap.cleanName(field_item.title)).change(function(){
                        // Filter the data
                        setFormFieldFilter(field_item);
                    });
                }
            }

            // date
            if( field_config['type'] == 'date' ){

                var hasSlider = (true);
                if(hasSlider){
                    // Get value in seconds
                    var min_val = Date.parse(field_item['min'])/1000;
                    var max_val = Date.parse(field_item['max'])/1000;

                    // Add a function which will use a timeout
                    // to prevent too heavy load on server
                    // when using setFormFieldFilter
                    var timer = null;
                    function onDateChange(e, ui) {
                        if(filterConfigData.deactivated)
                            return false;
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            var dt_cur_from = new Date(ui.values[0]*1000); //.format("yyyy-mm-dd hh:ii:ss");
                            $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val(
                                formatDT(dt_cur_from, 'yy-mm-dd')
                            )
                            var dt_cur_to = new Date(ui.values[1]*1000); //.format("yyyy-mm-dd hh:ii:ss");
                            $('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val(
                                formatDT(dt_cur_to, 'yy-mm-dd')
                            )

                            setFormFieldFilter(field_item);
                        }, 150);
                    }

                    $("#liz-filter-slider-range"+ lizMap.cleanName(field_item.title)).slider({
                        range: true,
                        min: min_val,
                        max: max_val,
                        step: 86400,
                        values: [min_val, max_val],
                        change: function (e, ui) {
                            onDateChange(e, ui);
                        },
                        slide: function (e, ui) {
                            var dt_cur_from = new Date(ui.values[0]*1000); //.format("yyyy-mm-dd hh:ii:ss");
                            $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val(
                                formatDT(dt_cur_from, 'yy-mm-dd')
                            )
                            var dt_cur_to = new Date(ui.values[1]*1000); //.format("yyyy-mm-dd hh:ii:ss");
                            $('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val(
                                formatDT(dt_cur_to, 'yy-mm-dd')
                            )
                        }
                    });
                }

                $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title) + ', #liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).change(function(){
                    // Filter the data. Only if the slider is not activated (if it is activated, it triggers the filter)
                    if(!hasSlider){
                        setFormFieldFilter(field_item);
                    }else{
                        // Change values of the slider
                        $("#liz-filter-slider-range"+ lizMap.cleanName(field_item.title)).slider(
                            "values",
                            [
                                Date.parse($('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val())/1000,
                                Date.parse($('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val())/1000
                            ]
                        );
                    }
                });
            }

            // numeric
            if( field_config['type'] == 'numeric' ){

                var hasSlider = (true);
                if(hasSlider){
                    var min_val = field_item['min'];
                    var max_val = field_item['max'];

                    // Add a function which will use a timeout
                    // to prevent too heavy load on server
                    // when using setFormFieldFilter
                    var timer = null;
                    function onNumericChange(e, ui) {
                        if(filterConfigData.deactivated)
                            return false;
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            var dt_cur_from = ui.values[0];
                            $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title)).val(dt_cur_from);
                            var dt_cur_to = ui.values[1];
                            $('#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).val(dt_cur_to);

                            setFormFieldFilter(field_item);
                        }, 300);
                    }

                    $("#liz-filter-slider-range"+ lizMap.cleanName(field_item.title)).slider({
                        range: true,
                        min: min_val,
                        max: max_val,
                        step: 1,
                        values: [min_val, max_val],
                        change: function (e, ui) {
                            onNumericChange(e, ui);
                        },
                        slide: function (e, ui) {
                            var dt_cur_from = ui.values[0];
                            $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title)).val(dt_cur_from);
                            var dt_cur_to = ui.values[1];
                            $('#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).val(dt_cur_to);
                        }
                    });
                }

                $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title) + ', #liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).change(function(){
                    // Filter the data. Only if the slider is not activated (if it is activated, it triggers the filter)
                    if(!hasSlider){
                        setFormFieldFilter(field_item);
                    }else{
                        // Change values of the slider
                        $("#liz-filter-slider-range"+ lizMap.cleanName(field_item.title)).slider(
                            "values",
                            [
                                $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title)).val(),
                                $('#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).val()
                            ]
                        );
                    }
                });
            }


            // text
            if( field_config['type'] == 'text' ){
                $('#liz-filter-field-text' + lizMap.cleanName(field_item.title)).change(function(){
                    // Filter the data
                    setFormFieldFilter(field_item);
                });
            }

            // Add event on reset buttons
            $('#liz-filter-box-' + lizMap.cleanName(field_item.title) + ' button.liz-filter-reset-field' ).click(function(){
                resetFormField($(this).val());
                setFormFilter();
            });

            // Add tooltip
            $('#liz-filter-box-' + lizMap.cleanName(field_item.title) + ' [title]').tooltip();

        }

        function getFeatureCount(filter){
            filter = typeof filter !== 'undefined' ?  filter : '';
            var layerId = filterConfigData.layerId;

            var sdata = {
                request: 'getFeatureCount',
                layerId: layerId,
                filter: filter
            };
            $.get(filterConfigData.url, sdata, function(result){
                if( !result )
                    return false;
                if( 'status' in result && result['status'] == 'error' ){
                    console.log(result.title + ': ' + result.detail);
                    return false;
                }
                for(var a in result){
                    var feat = result[a];
                    var nb = feat['c'];
                    try{
                        nb = (new Intl.NumberFormat()).format(nb);
                    } catch(error) {
                        nb = feat['c'];
                    }
                    $('#liz-filter-item-layer-total-count').html(nb);
                }

            }, 'json');
        }

        function setZoomExtent(filter){
            filter = typeof filter !== 'undefined' ?  filter : '';

            var layerId = filterConfigData.layerId;

            // Get map projection and layer extent
            var mapProjection = lizMap.map.getProjection();
            if(mapProjection == 'EPSG:900913')
                mapProjection = 'EPSG:3857';

            // Get layer
            var layerName = filterConfigData.layerName;

            if(!filter){
                // Use layer extent
                var itemConfig = lizMap.config.layers[layerName];
                if('bbox' in itemConfig){
                    var lex = itemConfig['bbox'][mapProjection]['bbox'];
                    var extent = lex[0] + ',' + lex[1] + ',' + lex[2] + ',' + lex[3];
                    $('#liz-filter-zoom').val(extent);
                }
                return false;
            }

            // If a filter is set, request the extent with filter
            var sdata = {
                request: 'getExtent',
                layerId: layerId,
                filter: filter,
                crs: mapProjection
            };
            $.get(filterConfigData.url, sdata, function(result){
                if( !result )
                    return false;
                if( 'status' in result && result['status'] == 'error' ){
                    console.log(result.title + ': ' + result.detail);
                    // Hide Zoom button
                    $('#liz-filter-zoom').hide();
                    return;
                }

                for(var a in result){
                    //BOX(33373 7527405.72750002,449056.961709125 7724585.66040861)
                    var sourcebbox = result[a]['bbox'];
                    if(!sourcebbox)
                        return false;
                    sbbox = $.parseJSON(sourcebbox);
                    bbox = sbbox.bbox;
                    var extent = bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3];
                    $('#liz-filter-zoom').val(extent);
                }

            }, 'json');
        }

        function zoomToFeatures(){
            var bounds = $('#liz-filter-zoom').val();
            var abounds = null;
            if(bounds){
                var abounds = bounds.split(',');
            }
            if( !bounds || abounds.length != 4 ){
                return false;
            }
            var extent = new OpenLayers.Bounds(abounds[0], abounds[1], abounds[2], abounds[3]);
            lizMap.map.zoomToExtent(extent);
            return false;
        }

        // Launch LayerFilter feature
        addLayerFilterToolInterface();
        launchLayerFilterTool(filterConfigData.layerId);

        // Listen to the layer selector changes
        $('#liz-filter-layer-selector').change(function(){
            deactivateFilter();
            filterConfigData.layerId = $(this).val();
            launchLayerFilterTool($(this).val());
        });

        } // uicreated
    });


}();

var todo = '</br>'+
'* Print get filtertoken if not yet set</br>'+
'* Updata attribute table if displayed: display the Orange button to refresh</br>'+
'* Update dataviz on filter</br>';
