/**
 * @module legacy/filter.js
 * @name Filter
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import DOMPurify from 'dompurify';

var lizLayerFilterTool = function () {

    lizMap.events.on({
        'uicreated': function () {

            // If filterConfig is empty, there is no filter set => hide filter tool
            if (!globalThis['filterConfig'] || (globalThis['filterConfig'].constructor === Object && Object.keys(globalThis['filterConfig']).length === 0)) {
                $('#mapmenu li.filter.nav-dock').addClass('hide');
                return true;
            }


            // Compute the HTML container for the form
            /**
             *
             */
            function getLayerFilterDockRoot() {
                var html = '';

                html += '<div class="menu-content">';
                // Add combo box to select the layer
                html += '<select id="liz-filter-layer-selector">';
                var flayers = {};
                for (var o in globalThis['filterConfig']) {
                    var conf = globalThis['filterConfig'][o];
                    if (!(conf.layerId in flayers)) {
                        // Get layer
                        var layerId = conf.layerId;
                        var lconfig_get = lizMap.getLayerConfigById(layerId);
                        if (!lconfig_get)
                            continue;
                        var lname = lconfig_get[0];
                        var lconf = lconfig_get[1];
                        var displayName = lname;
                        if ('title' in lconf && lconf.title != '') {
                            displayName = lconf.title;
                        }
                        html += '<option value="' + layerId + '">' + displayName + '</option>';
                        flayers[layerId] = true;
                    }
                }
                html += '</select></br>';

                // Add total feature counter
                var total = 0
                html += '<b><span id="liz-filter-item-layer-total-count">' + total + '</span> ' + lizDict['filter.label.features'] + '</b>';

                // Add zoom link
                html += '<br/><button id="liz-filter-zoom" class="btn btn-sm btn-primary" title="' + lizDict['filter.btn.zoom.title'] + '">' + lizDict['filter.btn.zoom.label'] + '</button>';

                // Add export button
                if (lizMap.mainLizmap.initialConfig.vectorLayerResultFormat.includes('ODS')) {
                    html += '&nbsp;&nbsp;<button id="liz-filter-export" class="btn btn-sm btn-primary" title="' + lizDict['filter.btn.export.title'] + '">' + lizDict['filter.btn.export.label'] + '</button>';
                }

                // Add unfilter link
                html += '&nbsp;&nbsp;<button id="liz-filter-unfilter" class="btn btn-sm btn-primary" title="' + lizDict['filter.btn.reset.title'] + '">' + lizDict['filter.btn.reset.label'] + '</button>';

                html += '</div>';

                // Add tree
                html += '<div style="padding:10px 10px;" class="tree menu-content"></div>';

                return html;
            }

            /**
             *
             */
            function addLayerFilterToolInterface() {
                if (!globalThis['filterConfig'] || (globalThis['filterConfig'].constructor === Object && Object.keys(globalThis['filterConfig']).length === 0)) {
                    return false;
                }

                // Build interface html code
                // Add dock
                var html = getLayerFilterDockRoot();
                $('#filter-content').html(html);

                // Get 1st layer found as default layer
                var layerId = globalThis['filterConfig'][0]['layerId'];
                globalThis['filterConfigData'].layerId = layerId;

                // Activate the unfilter link
                $('#liz-filter-unfilter').click(function () {
                    // Remove filter
                    deactivateFilter();
                    return false;
                });

                // Activate the zoom button
                $('#liz-filter-zoom').click(function () {
                    zoomToFeatures()
                    return false;
                });

                // Activate the export button
                if (lizMap.mainLizmap.initialConfig.vectorLayerResultFormat.includes('ODS')) {
                    $('#liz-filter-export').click(function () {
                        lizMap.config.layers[globalThis['filterConfigData'].layerName].request_params['filter'] = globalThis['filterConfigData'].filter;
                        lizMap.exportVectorLayer(globalThis['filterConfigData'].layerName, 'ODS', false);
                        delete lizMap.config.layers[globalThis['filterConfigData'].layerName].request_params['filter'];
                        return false;
                    });
                }

                // Add tooltip
                $('#filter-content [title]').tooltip({
                    trigger: 'hover'
                });
            }

            // Launch the form filter feature
            /**
             *
             * @param layerId
             */
            function launchLayerFilterTool(layerId) {

                // Get layer name
                var getConfig = lizMap.getLayerConfigById(layerId);
                if (!getConfig)
                    return false;
                var layerName = getConfig[0];
                globalThis['filterConfigData'].layerName = layerName;

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
                if ($('#liz-filter-zoom').is(":visible")) {
                    setZoomExtent();
                }
            }

            // Get the HTML form
            // By getting form element for each field
            /**
             *
             */
            function getLayerFilterForm() {
                var layerId = globalThis['filterConfigData'].layerId;

                // Sort attribute layers as given by creation order in Lizmap plugin
                var formFilterLayersSorted = [];
                for (var o in globalThis['filterConfig']) {
                    var field_item = globalThis['filterConfig'][o];
                    if ('title' in field_item && field_item.layerId == layerId) {
                        formFilterLayersSorted.push(field_item);
                        $("#filter div.tree").append('<div id="filter-field-order' + String(field_item.order) + '"></div>');
                    }
                }

                // Add form fields
                for (var conf in formFilterLayersSorted) {

                    var field_item = formFilterLayersSorted[conf];
                    getFormFieldInput(field_item);
                }
            }

            // Get the HTML form element for a specific field
            /**
             *
             * @param field_item
             */
            function getFormFieldInput(field_item) {
                var field_config = globalThis['filterConfig'][field_item.order];

                // unique values
                if (field_config['type'] == 'uniquevalues') {
                    return uniqueValuesFormInput(field_item);
                }

                // date
                if (field_config['type'] == 'date') {
                    return dateFormInput(field_item);
                }

                // numeric
                if (field_config['type'] == 'numeric') {
                    return numericFormInput(field_item);
                }

                // text
                if (field_config['type'] == 'text') {
                    return textFormInput(field_item);
                }

                return '';
            }

            /**
             *
             * @param field_item
             */
            function getFormFieldHeader(field_item) {
                var html = '';
                html += '<div class="liz-filter-field-box" id="liz-filter-box-';
                html += lizMap.cleanName(field_item.title);
                html += '">';
                var flabel = field_item.title;
                html += '<span style="font-weight:bold;">' + flabel + '</span>';
                html += '<button class="btn btn-primary btn-sm pull-right liz-filter-reset-field" title="' + lizDict['filter.btn.reset.title'] + '" value="' + field_item.order + '">x</button>';
                html += '<p>';

                return html;
            }

            /**
             *
             */
            function getFormFieldFooter() {
                var html = '';
                html += '</p>';
                html += '</div>';

                return html;
            }

            /**
             *
             * @param result
             */
            function checkResult(result) {
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
            /**
             *
             * @param field_item
             */
            function dateFormInput(field_item) {
                // For LWC >=3.7, the min_date and max_date
                // are replaced by start_field & end_field
                var start_field_property = 'min_date';
                var end_field_property = 'max_date';
                let lizmap_plugin_metadata = lizMap.getLizmapDesktopPluginMetadata();
                if (lizmap_plugin_metadata.lizmap_web_client_target_version >= 30700) {
                    start_field_property = 'start_field';
                    end_field_property = 'end_field';
                }
                // end_field = start_field when undefined
                const end_field = (end_field_property in field_item) ? field_item[end_field_property] : field_item[start_field_property];

                var sdata = {
                    request: 'getMinAndMaxValues',
                    layerId: field_item.layerId,
                    fieldname: field_item[start_field_property] + ',' + end_field,
                    filter: ''
                };
                $.get(globalThis['filterConfigData'].url, sdata, function (result) {
                    if (!checkResult(result)) {
                        return false;
                    }

                    for (var a in result) {
                        var feat = result[a];
                        // Add minutes to time zone offset when not present (needed for Firefox).
                        if (feat['min'][feat['min'].length - 3] === '+') {
                            feat['min'] = feat['min'] + ':00';
                        }
                        if (feat['max'][feat['max'].length - 3] === '+') {
                            feat['max'] = feat['max'] + ':00';
                        }
                        var dmin = formatDT(new Date(feat['min']), 'yy-mm-dd');
                        var dmax = formatDT(new Date(feat['max']), 'yy-mm-dd');
                        globalThis['filterConfig'][field_item.order]['min'] = dmin;
                        globalThis['filterConfig'][field_item.order]['max'] = dmax;
                    }

                    var html = '';
                    html += getFormFieldHeader(field_item);
                    html += '<span style="white-space:nowrap">';
                    html += '<input id="liz-filter-field-min-date' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-date" value="' + field_item['min'] + '" style="width:100px;">';
                    html += '<input id="liz-filter-field-max-date' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-date" value="' + field_item['max'] + '" style="width:100px;">';
                    html += '</span>';

                    // http://jsfiddle.net/Lcrsd3jt/45/
                    // pour avoir un date et time picker, see https://github.com/trentrichardson/jQuery-Timepicker-Addon
                    html += '<div id="liz-filter-datetime-range' + lizMap.cleanName(field_item.title) + '">';
                    html += '    <div>';
                    html += '        <div id="liz-filter-slider-range' + lizMap.cleanName(field_item.title) + '"></div>';
                    html += '    </div>';
                    html += '</div>';

                    html += getFormFieldFooter(field_item);
                    $("#filter-field-order" + String(field_item.order)).append(html);
                    $("#filter input.liz-filter-field-date").datepicker({
                        dateFormat: 'yy-mm-dd',
                        changeMonth: true,
                        changeYear: true,
                        minDate: new Date(feat['min']),
                        maxDate: new Date(feat['max'])
                    });

                    addFieldEvents(field_item);

                }, 'json');

            }

            // Get the HTML form element for the numeric field type
            /**
             *
             * @param field_item
             */
            function numericFormInput(field_item) {
                // Since LWC >=3.7, we can configure a field with the end value
                var fieldNames = '';
                let lizmap_plugin_metadata = lizMap.getLizmapDesktopPluginMetadata();
                if (lizmap_plugin_metadata.lizmap_web_client_target_version >= 30700) {
                    fieldNames += field_item.start_field;
                    if ('end_field' in field_item && field_item.end_field != '') {
                        fieldNames += ',' + field_item.end_field;
                    }
                } else {
                    fieldNames += field_item.field;
                }

                var sdata = {
                    request: 'getMinAndMaxValues',
                    layerId: field_item.layerId,
                    fieldname: fieldNames,
                    filter: ''
                };
                $.get(globalThis['filterConfigData'].url, sdata, function (result) {
                    if (!checkResult(result)) {
                        return false;
                    }

                    for (var a in result) {
                        var feat = result[a];
                        globalThis['filterConfig'][field_item.order]['min'] = Number(feat['min']);
                        globalThis['filterConfig'][field_item.order]['max'] = Number(feat['max']);
                    }

                    var html = '';
                    html += getFormFieldHeader(field_item);
                    html += '<span style="white-space:nowrap">';
                    html += '<input id="liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title) + '" type="number" value="' + field_item['min'] + '" step="' + 1 + '" min="' + field_item['min'] + '" max="' + field_item['max'] + '" class="liz-filter-field-numeric" style="width:100px;">';
                    html += '<input id="liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title) + '" type="number" value="' + field_item['max'] + '" step="' + field_item['step'] + '" min="' + field_item['min'] + '" max="' + field_item['max'] + '" class="liz-filter-field-numeric" style="width:100px;">';
                    html += '</span>';

                    html += '<div id="liz-filter-numeric-range' + lizMap.cleanName(field_item.title) + '">';
                    html += '    <div>';
                    html += '        <div id="liz-filter-slider-range' + lizMap.cleanName(field_item.title) + '"></div>';
                    html += '    </div>';
                    html += '</div>';

                    html += getFormFieldFooter(field_item);

                    $("#filter-field-order" + String(field_item.order)).append(html);

                    addFieldEvents(field_item);

                }, 'json');

            }

            // Get the HTML form element for the text field type
            /**
             *
             * @param field_item
             */
            function textFormInput(field_item) {
                var field = field_item['field'];
                var sdata = {
                    request: 'getUniqueValues',
                    layerId: field_item.layerId,
                    fieldname: field,
                    filter: ''
                };

                var html = '';
                html += getFormFieldHeader(field_item);
                html += '<div style="width: 100%;">'
                html += '<input id="liz-filter-field-text' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-text" value="" title="' + lizDict['filter.input.text.title'] + '" placeholder="' + lizDict['filter.input.text.placeholder'] + '">';
                html += '</div>'
                html += getFormFieldFooter(field_item);

                $("#filter-field-order" + String(field_item.order)).append(html);
                addFieldEvents(field_item);

                $("#liz-filter-field-text" + lizMap.cleanName(field_item.title)).autocomplete({
                    source: function (request, response) {
                        const autocompleteFilter = `"${field}" ILIKE '%${request.term}%' `;
                        if (!globalThis['filterConfigData'].filter) {
                            sdata.filter = autocompleteFilter;
                        } else {
                            sdata.filter = ' ( ' + globalThis['filterConfigData'].filter + ' ) AND ' + autocompleteFilter;
                        }
                        fetch(globalThis['filterConfigData'].url, {
                            method: "POST",
                            body: new URLSearchParams(sdata)
                        }).then(response => {
                            return response.json();
                        }).then(result => {
                            var autocompleteData = [];
                            for (var a in result) {
                                var feat = result[a];
                                if (feat['v'] === null || !feat['v'] || (typeof feat['v'] === 'string' && feat['v'].trim() === '')) {
                                    continue;
                                }
                                autocompleteData.push(feat['v']);
                            }
                            response(autocompleteData);
                        });
                    },
                    autoFocus: false, // do not autofocus, because this prevents from searching with LIKE
                    delay: 500,
                    minLength: 3,
                    select: function (event, ui) {
                        $(this).val(ui.item.value);
                        $(this).blur();
                    }
                });
            }

            // Get the HTML form element for the uniqueValues field type
            // possible format: checkboxes or select
            /**
             *
             * @param field_item
             */
            function uniqueValuesFormInput(field_item) {

                // Get data
                const fetchRequests = [];

                // Get unique values data (and counters)
                var sdata = {
                    request: 'getUniqueValues',
                    layerId: field_item.layerId,
                    fieldname: field_item.field,
                    filter: ''
                };

                fetchRequests.push(
                    fetch(globalThis['filterConfigData'].url + '&' + new URLSearchParams(sdata)).then(response => {
                        return response.json();
                    })
                );

                // Get keys/values if defined
                let keyValues = {};

                const layerName = lizMap.getLayerConfigById(field_item.layerId)[0];
                const fieldConf = lizMap.keyValueConfig[layerName]?.[field_item.field];
                if (fieldConf) {
                    if (fieldConf.type == 'ValueMap') {
                        keyValues = fieldConf.data;
                    } else {
                        // Get source layer typename from it ID
                        let getSourceLayer = lizMap.getLayerConfigById(fieldConf.source_layer_id);
                        if( getSourceLayer && getSourceLayer.length == 2) {
                            const sourceLayerConfig = getSourceLayer[1];
                            const source_typename = sourceLayerConfig?.shortname || sourceLayerConfig?.typename || sourceLayerConfig?.name;
                            if (source_typename != undefined) {
                                fetchRequests.push(
                                    lizMap.mainLizmap.wfs.getFeature({
                                        TYPENAME: source_typename,
                                        PROPERTYNAME: fieldConf.code_field + ',' + fieldConf.label_field,
                                        // we must not use null for exp_filter but '' if no filter is active
                                        EXP_FILTER: fieldConf.exp_filter ? fieldConf.exp_filter : ''
                                    })
                                );
                            }
                        }

                    }
                }

                Promise.all(fetchRequests).then(responses => {
                    const [result, rawKeyValues] = responses;

                    if (!checkResult(result)) {
                        return false;
                    }

                    if (rawKeyValues) {
                        rawKeyValues.features.forEach(feature => keyValues[feature.properties[fieldConf.code_field]] = feature.properties[fieldConf.label_field]);
                    }

                    // Build UI
                    var html = '';
                    html += getFormFieldHeader(field_item);

                    if (field_item.format == 'select') {
                        html += '<select id="liz-filter-field-' + lizMap.cleanName(field_item.title) + '" class="liz-filter-field-select">';
                        html += '<option value=""> --- </option>';
                        html += '</select>';
                    }
                    html += getFormFieldFooter(field_item);

                    $("#filter-field-order" + String(field_item.order)).append(html);

                    if (!('items' in globalThis['filterConfig'][field_item.order])) {
                        globalThis['filterConfig'][field_item.order]['items'] = {};
                    }

                    for (const feat of result) {
                        globalThis['filterConfig'][field_item.order]['items'][DOMPurify.sanitize(feat['v'])] = feat['c'];
                    }

                    var dhtml = '';
                    var fkeys = Object.keys(
                        globalThis['filterConfig'][field_item.order]['items']
                    );

                    // Order fkeys alphabetically (which means sort checkboxes for each field)
                    fkeys.sort(function (a, b) {
                        return a.localeCompare(b);
                    });

                    for (const f_val of fkeys) {
                        // Replace key by value if defined
                        var label = keyValues.hasOwnProperty(f_val) ? keyValues[f_val] : f_val;

                        if (field_item.format == 'select') {
                            dhtml += `<option value="${lizMap.cleanName(f_val)}">${label}</option>`;
                        } else {
                            var inputId = 'liz-filter-field-' + lizMap.cleanName(field_item.title) + '-' + lizMap.cleanName(f_val);
                            dhtml += `<label class="checkbox"><input id="${inputId}" class="liz-filter-field-value" type="checkbox" value="${lizMap.cleanName(f_val)}">${label}</label>`;
                        }
                    }
                    var id = 'liz-filter-box-' + lizMap.cleanName(field_item.title);
                    if (field_item.format == 'select') {
                        $('#' + id + ' select').append(dhtml);
                    } else {
                        $('#' + id + ' p').append(dhtml);
                    }

                    addFieldEvents(field_item);
                });
            }

            // Generate filter string for a field
            // Depending on the selected inputs
            /**
             *
             * @param field_item
             */
            function setFormFieldFilter(field_item) {
                if (globalThis['filterConfigData'].deactivated) {
                    return false;
                }

                // Set filter depending on field type
                // Unique values
                if (field_item.type == 'uniquevalues') {
                    setUniqueValuesFilter(field_item);
                }

                // Dates
                if (field_item.type == 'date') {
                    setDateFilter(field_item);
                }

                // Numeric
                if (field_item.type == 'numeric') {
                    setNumericFilter(field_item);
                }

                // Texte
                if (field_item.type == 'text') {
                    setTextFilter(field_item);
                }

                // Update global form filter
                activateFilter();
            }

            // Set the filter for the uniqueValues field type
            /**
             *
             * @param field_item
             */
            function setUniqueValuesFilter(field_item) {
                var field_config = globalThis['filterConfig'][field_item.order]

                // First loop through each field value
                // And check if the item (e.g checkbox) is selected or not
                globalThis['filterConfig'][field_item.order]['data'] = {}
                var allchecked = true;
                var nonechecked = true;
                if (field_config.format == 'select') {
                    var selectId = '#liz-filter-field-' + lizMap.cleanName(field_item.title);
                    var selectVal = $(selectId).val();
                    var clist = [];
                    for (var f_val in globalThis['filterConfig'][field_item.order]['items']) {
                        // Get checked status
                        if (Array.isArray(selectVal)) {
                            var achecked = selectVal.includes(lizMap.cleanName(f_val));
                        } else {
                            var achecked = (selectVal == lizMap.cleanName(f_val));
                        }
                        if (!achecked) {
                            allchecked = false;
                        } else {
                            nonechecked = false;
                            clist.push(f_val.replace(/'/g, "''"));
                        }
                        globalThis['filterConfig'][field_item.order]['data'][f_val] = achecked;
                    }
                }
                if (field_config.format == 'checkboxes') {
                    var clist = [];
                    for (var f_val in globalThis['filterConfig'][field_item.order]['items']) {
                        // Get checked status
                        var inputId = '#liz-filter-field-' + lizMap.cleanName(field_item.title) + '-' + lizMap.cleanName(f_val);
                        var achecked = $(inputId).is(':checked');
                        if (!achecked) {
                            allchecked = false;
                        } else {
                            nonechecked = false;
                            clist.push(f_val.replace(/'/g, "''"));
                        }
                        globalThis['filterConfig'][field_item.order]['data'][f_val] = achecked;
                    }
                }
                globalThis['filterConfig'][field_item.order]['allchecked'] = allchecked;
                globalThis['filterConfig'][field_item.order]['nonechecked'] = nonechecked;
                globalThis['filterConfig'][field_item.order]['selected'] = clist;
                var filter = null;
                var field = field_item['field'];
                if (clist.length) {
                    // Check if the value '' is present. If so, we should also search for NULL
                    let hasEmptyValue = false;

                    // If there is a separator in the field values, and we need
                    // to explode the values into single items, we need to use
                    // LIKE statements joined with OR
                    if ('splitter' in field_item && field_item['splitter'] != '') {

                        filter = ' ( ';
                        var sep = '';
                        var lk = 'LIKE';

                        // For a PostgreSQL layer, we can use ILIKE instead of LIKE
                        // for WMS filtered requests to be case insensitive
                        if (field_item.provider == 'postgres') {
                            lk = 'ILIKE';
                        }
                        for (var i in clist) {
                            var cval = clist[i];
                            // If cval is '', we should store this information
                            if (cval === '') {
                                hasEmptyValue = true;
                            }

                            // Create the filter for this value
                            filter += sep + '"' + field + '"' + " " + lk + " '%" + cval + "%' ";
                            // We need to use a OR to display features with
                            // 'Theatre, Culture' or 'Theatre', or 'Culture, Information'
                            // When 'Theatre' and 'Culture' are checked in the list
                            sep = ' OR ';
                        }
                        // Add NULL values
                        if (hasEmptyValue) {
                            filter += ` OR "${field}" IS NULL `;
                        }
                        filter += ' ) ';
                    } else {
                        // Search for empty values (to add the rule OR "field" IS NULL )
                        if (clist.includes('')) {
                            hasEmptyValue = true;
                        }
                        // If there is not separator in the field values, use IN to get all features
                        // corresponding to one of the checked values
                        filter = '"' + field + '"' + " IN ( '" + clist.join("' , '") + "' ) ";
                        // Add NULL values
                        if (hasEmptyValue) {
                            filter = ` ( ${filter} OR "${field}" IS NULL ) `;
                        }
                    }
                }
                globalThis['filterConfig'][field_item.order]['filter'] = filter;

            }

            // Set the filter for the Date type
            /**
             *
             * @param field_item
             */
            function setDateFilter(field_item) {
                var filters = [];

                // get input values
                var min_id = '#liz-filter-field-min-date' + lizMap.cleanName(field_item.title);
                var max_id = '#liz-filter-field-max-date' + lizMap.cleanName(field_item.title);
                var min_val = $(min_id).val().trim();
                var max_val = $(max_id).val().trim();

                // Do nothing if min and max values entered equals the field min and max possible values
                if (min_val == field_item['min'] && max_val == field_item['max']) {
                    globalThis['filterConfig'][field_item.order]['filter'] = null;
                    return true;
                }

                // fields
                // Since LWC >=3.7, min_date & max_date
                // are replaced by start_field & end_field
                var start_field_property = 'min_date';
                var end_field_property = 'max_date';
                let lizmap_plugin_metadata = lizMap.getLizmapDesktopPluginMetadata();
                if (lizmap_plugin_metadata.lizmap_web_client_target_version >= 30700) {
                    start_field_property = 'start_field';
                    end_field_property = 'end_field';
                }
                const startField = field_item[start_field_property]
                const endField = (end_field_property in field_item) ? field_item[end_field_property] : field_item[start_field_property];

                // min date filter
                if (min_val && Date.parse(min_val)) {
                    filters.push('( "' + startField + '"' + " >= '" + min_val + "'" + " OR " + ' "' + endField + '"' + " >= '" + min_val + "' )");
                } else {
                    min_val = null;
                }

                // max date filter
                if (max_val && Date.parse(max_val)) {
                    // Add one day to the max values as we cannot select hours
                    // This allow to select features with the max value. Eg a feature with 2023-10-25 12:20:01
                    // must be selected if max date is 2023-10-25 wich is indeed 2023-10-25 00:00:00
                    let max_val_new = new Date(Date.parse(max_val));
                    // Add a day
                    max_val_new.setDate(max_val_new.getDate() + 1);
                    // Truncate to keep only date & transform into string
                    let max_val_new_str = formatDT(max_val_new, 'yy-mm-dd');
                    // We use strict < instead of <= because we just add a day to the max value
                    filters.push('( "' + startField + '"' + " < '" + max_val_new_str + "'" + " OR " + ' "' + endField + '"' + " < '" + max_val_new_str + "' )");
                } else {
                    max_val = null;
                }

                var filter = null;
                if (filters.length) {
                    var filter = ' ( ';
                    filter += filters.join(' AND ');
                    filter += ' ) ';
                }
                globalThis['filterConfig'][field_item.order]['data'] = {
                    'min_date': min_val,
                    'max_date': max_val
                };
                globalThis['filterConfig'][field_item.order]['filter'] = filter;

            }

            // Set the filter for the Numeric type
            /**
             *
             * @param field_item
             */
            function setNumericFilter(field_item) {
                var filters = [];

                // get input values
                var min_id = '#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title);
                var max_id = '#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title);
                var min_val = $(min_id).val().trim();
                var max_val = $(max_id).val().trim();

                // Do nothing if min and max values entered equals the field min and max possible values
                if (min_val == field_item['min'] && max_val == field_item['max']) {
                    globalThis['filterConfig'][field_item.order]['filter'] = null;
                    return true;
                }

                // fields
                var startField = '';
                var endField = null;

                // Since LWC >=3.7, we can configure a field with the end value
                let lizmap_plugin_metadata = lizMap.getLizmapDesktopPluginMetadata();
                if (lizmap_plugin_metadata.lizmap_web_client_target_version >= 30700) {
                    startField = field_item.start_field;
                    endField = ('end_field' in field_item && field_item.end_field != '') ? field_item.end_field : startField;
                } else {
                    startField = field_item.field;
                }

                // min value filter
                if (min_val != '') {
                    var min_val_filter = '( ';
                    min_val_filter += '"' + startField + '"' + " >= '" + min_val + "'";
                    if (endField) {
                        min_val_filter += " OR " + ' "' + endField + '"' + " >= '" + min_val + "'";
                    }
                    min_val_filter += ' )';
                    filters.push(min_val_filter);
                } else {
                    min_val = null;
                }

                // max value filter
                if (max_val != '') {
                    var max_val_filter = '( ';
                    max_val_filter += '"' + startField + '"' + " <= '" + max_val + "'";
                    if (endField) {
                        max_val_filter += " OR " + ' "' + endField + '"' + " <= '" + max_val + "'";
                    }
                    max_val_filter += ' )';
                    filters.push(max_val_filter);
                } else {
                    max_val = null;
                }

                var filter = null;
                if (filters.length) {
                    var filter = ' ( ';
                    filter += filters.join(' AND ');
                    filter += ' ) ';
                }
                globalThis['filterConfig'][field_item.order]['data'] = {
                    'min': min_val,
                    'max': max_val
                };
                globalThis['filterConfig'][field_item.order]['filter'] = filter;

            }

            // Set the filter for a text field_item
            /**
             *
             * @param field_item
             */
            function setTextFilter(field_item) {

                var id = '#liz-filter-field-text' + lizMap.cleanName(field_item.title);
                var val = $(id).val().trim().replace(/'/g, "''");

                globalThis['filterConfig'][field_item.order]['data'] = {
                    'text': val
                };
                var filter = null;
                var lk = 'LIKE';
                if (field_item.provider == 'postgres') {
                    lk = 'ILIKE';
                }
                var field = field_item['field'];
                if (val) {
                    filter = '"' + field + '"' + " " + lk + " '%" + val + "%'";
                }

                globalThis['filterConfig'][field_item.order]['data'] = {
                    'text': val
                };
                globalThis['filterConfig'][field_item.order]['filter'] = filter;
            }

            /**
             * Get the list of feature ids for a given filter.
             *
             * This is needed to trigger the filter with the selection tool
             * @param {string} filter - The SQL like filter
             * @param pkField
             * @param aCallBack
             */
            function getFilteredFeatureIds(filter, pkField, aCallBack) {
                filter = typeof filter !== 'undefined' ? filter : '';
                var layerId = globalThis['filterConfigData'].layerId;
                var field = pkField;
                var sdata = {
                    request: 'getUniqueValues',
                    layerId: layerId,
                    fieldname: field,
                    filter: filter
                };
                $.get(globalThis['filterConfigData'].url, sdata, function (result) {
                    if (!checkResult(result)) {
                        return false;
                    }
                    var ids = [];
                    for (var a in result) {
                        var feat = result[a];
                        if (feat['v'] === null || !feat['v'] || (typeof feat['v'] === 'string' && feat['v'].trim() === ''))
                            continue;
                        ids.push(feat['v']);
                    }
                    if (aCallBack) {
                        aCallBack(ids);
                    }
                }, 'json');
            }

            /**
             * Get the method to use to trigger the layer filter
             *
             * 'simple' means like before 3.6: directly change layer request_params and run
             * 'full' means we first get the features ids for the filter and then trigger the
             * Lizmap filter based on the attribute table methods. This will cascade the filter
             * to child layers.
             *
             * If there an attribute table config for this layer
             * we use the filter with selection, in order
             * to trigger the filter for the children tables
             * and propagate the filter to the other tools
             * such as the dataviz, the attribute table, etc.
             *
             * You can force the method in the JS console with;
             * globalThis['filterConfigData'].filterMethod = 'simple'
             * @returns {string} filterMethod - The method: simple or full
             */
            function getFilterMethod() {

                // Default is simple
                var filterMethod = 'simple';

                // If the filter method is already configured, use it
                if (globalThis['filterConfigData'].hasOwnProperty('filterMethod')) {
                    filterMethod = globalThis['filterConfigData'].filterMethod;
                    if (filterMethod == 'simple' || filterMethod == 'full') {
                        return filterMethod;
                    }
                }

                // If the layer has attribute layer configuration, use full
                var layerName = globalThis['filterConfigData'].layerName;
                if ('attributeLayers' in lizMap.config && layerName in lizMap.config.attributeLayers) {
                    var attributeLayerConfig = lizMap.config.attributeLayers[layerName];
                    var pkField = attributeLayerConfig['primaryKey'];
                    if (pkField.split(',').length == 1) {
                        filterMethod = 'full';
                    }
                }

                return filterMethod;
            }


            /**
             * Compute the global filter to pass to the layer
             * and apply it to the map and other tools
             *
             */
            function activateFilter() {
                var layerId = globalThis['filterConfigData'].layerId;
                var layerName = globalThis['filterConfigData'].layerName;

                var afilter = [];
                for (var o in globalThis['filterConfig']) {
                    var field_item = globalThis['filterConfig'][o];
                    if ('title' in field_item && field_item['filter'] && field_item.layerId == layerId) {
                        afilter.push(field_item['filter']);
                    }
                }

                // We use AND clause between fields
                var filter = afilter.join(' AND ');

                // Deactivate the filter if it is empty.
                // It can occur when the user unchecks the only checkbox
                // which was checked before,
                // or resetted the field input with the reset button
                // when only this field filter was active
                if (afilter.length == 0 || filter.trim() == '') {
                    deactivateFilter();
                    return true;
                }

                // Lizmap method to filter the data: simple or full
                var filterMethod = getFilterMethod();
                if (filterMethod == 'simple') {
                    // Use a simple filter only for the getmap and other WMS/WFS queries
                    lizMap.triggerLayerFilter(layerName, filter);
                } else {
                    // Get the filtered features fids
                    var pkField = lizMap.config.attributeLayers[layerName]['primaryKey'];
                    getFilteredFeatureIds(filter, pkField, function (filteredIds) {
                        // Pass a fake false filter if no ids are returned.
                        // It means the global filter between fields returns no data
                        if (filteredIds.length == 0) {
                            filteredIds = [-9999999];
                        }
                        // Update the selectedfeatures object
                        if (!lizMap.config.layers[layerName]['selectedFeatures']) {
                            lizMap.config.layers[layerName]['selectedFeatures'] = [];
                        }
                        lizMap.config.layers[layerName]['selectedFeatures'] = filteredIds;

                        // Trigger the filter based on these selected features
                        lizMap.events.triggerEvent("layerfeaturefilterselected",
                            { 'featureType': layerName }
                        );
                    });
                }

                // Get the feature count and display it
                getFeatureCount(filter);

                if ($('#liz-filter-zoom').is(":visible")) {
                    setZoomExtent(filter);
                }

                // Set the filter in the global variable
                globalThis['filterConfigData'].filter = filter;

            }

            // Deactivate the layer filter
            // And display all features
            /**
             *
             */
            function deactivateFilter() {
                var layerId = globalThis['filterConfigData'].layerId;

                globalThis['filterConfigData'].filter = undefined;

                // Deactivate all triggers to avoid unnecessary requests
                // and then empty all the input values
                globalThis['filterConfigData'].deactivated = true;
                for (var o in globalThis['filterConfig']) {
                    var field_item = globalThis['filterConfig'][o];
                    if ('title' in field_item && field_item.layerId == layerId) {
                        resetFormField(field_item.order);
                    }
                }
                globalThis['filterConfigData'].deactivated = false;

                // Remove filter on map layers
                var layerName = globalThis['filterConfigData'].layerName;

                // Lizmap method to filter the data: simple or full
                var filterMethod = getFilterMethod();
                if (filterMethod == 'simple') {
                    // Use a simple filter only for the getmap and other WMS/WFS queries
                    lizMap.deactivateMaplayerFilter(layerName);

                    // Refresh plots
                    lizMap.events.triggerEvent("layerFilterParamChanged",
                        {
                            'featureType': layerName,
                            'filter': null,
                            'updateDrawing': false
                        }
                    );
                } else {
                    // Deactivate the filter
                    lizMap.events.triggerEvent('layerfeatureremovefilter',
                        { 'featureType': layerName }
                    );
                }


                // Get feature count
                getFeatureCount();

                // Set zoom extent
                if ($('#liz-filter-zoom').is(":visible")) {
                    setZoomExtent();
                }

                // Remove feature info geometry
                removeFeatureInfoGeometry();

            }

            /**
             *
             * @param field_item_order
             */
            function resetFormField(field_item_order) {

                var field_item = globalThis['filterConfig'][field_item_order];

                if (field_item.type == 'date') {
                    $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val(field_item['min']);
                    $('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val(field_item['max']).change(); // .change() so that the slider is also resetted
                }
                else if (field_item['type'] == 'numeric') {
                    $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title)).val(field_item['min']);
                    $('#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).val(field_item['max']).change();
                }
                else if (field_item['type'] == 'uniquevalues') {
                    if (field_item.format == 'checkboxes') {
                        $('#liz-filter-box-' + lizMap.cleanName(field_item.title) + ' input.liz-filter-field-value').prop("checked", false);
                    }
                    else if (field_item.format == 'select') {
                        var selectField = $('#liz-filter-field-' + lizMap.cleanName(field_item.title));
                        // If the select is multiple && sumoSelect has been used to transform the combobox
                        if ('sumo' in selectField[0]) {
                            if (selectField[0].hasAttribute('multiple')) {
                                selectField[0].sumo.unSelectAll();
                            } else {
                                selectField[0].sumo.unSelectItem(selectField.val());
                            }
                        } else {
                            var firstOptionValue = selectField.find('option:first').val();
                            selectField.val(firstOptionValue);
                        }
                    }
                }
                else if (field_item['type'] == 'text') {
                    $('#liz-filter-field-text' + lizMap.cleanName(field_item.title)).val('');
                }

                // Remove filter in stored object
                globalThis['filterConfig'][field_item.order]['filter'] = null;

            }

            /**
             * Removes the getFeatureInfo geometry
             */
            function removeFeatureInfoGeometry() {
                lizMap.mainLizmap.map.clearHighlightFeatures();
            }

            /**
             * Adapt the size of the dock
             */
            function adaptLayerFilterSize() {
                lizMap.events.on({
                    // Adapt dock size to display metadata
                    dockopened: function (e) {
                        if (e.id == 'filter') {
                            lizMap.updateContentSize();
                        }
                    },
                    rightdockclosed: function () {
                    },
                    minidockclosed: function () {
                    },
                    layerfeatureremovefilter: function () {
                        var layerId = globalThis['filterConfigData'].layerId;

                        globalThis['filterConfigData'].filter = undefined;

                        // We need to reset the form
                        // Deactivate all triggers to avoid unnecessary requests
                        globalThis['filterConfigData'].deactivated = true;
                        for (var o in globalThis['filterConfig']) {
                            var field_item = globalThis['filterConfig'][o];
                            if (!('title' in field_item) || field_item.layerId !== layerId) {
                                continue;
                            }
                            resetFormField(field_item.order);
                        }
                        globalThis['filterConfigData'].deactivated = false;

                        // Get feature count
                        getFeatureCount();
                    }
                });

            }

            /**
             *
             * @param aDate
             * @param dateFormat
             */
            function formatDT(aDate, dateFormat) {
                var formatted = $.datepicker.formatDate(dateFormat, aDate);
                return formatted;
            }

            // Add an event on the inputs of a given field
            // For example, do something when a checkbox is clicked
            // This triggers the calculation of the filter for the field
            /**
             *
             * @param field_item
             */
            function addFieldEvents(field_item) {
                var container = 'liz-filter-box-' + lizMap.cleanName(field_item.title);
                var field_config = globalThis['filterConfig'][field_item.order]

                if (field_item.type == 'uniquevalues') {
                    if (field_item.format == 'checkboxes') {
                        $('#' + container + ' input.liz-filter-field-value').click(function () {
                            var self = $(this);
                            // Do nothing if disabled
                            if (self.hasClass('disabled'))
                                return false;

                            // Filter the data
                            setFormFieldFilter(field_item);
                        });
                    }
                    if (field_item.format == 'select') {

                        $('#liz-filter-field-' + lizMap.cleanName(field_item.title)).change(function () {
                            // Filter the data
                            setFormFieldFilter(field_item);
                        });
                    }
                }

                // date
                if (field_config['type'] == 'date') {

                    var hasSlider = (true);
                    if (hasSlider) {
                        // Get value in seconds
                        var min_val = Date.parse(field_item['min']) / 1000;
                        var max_val = Date.parse(field_item['max']) / 1000;

                        // Add a function which will use a timeout
                        // to prevent too heavy load on server
                        // when using setFormFieldFilter
                        var timer = null;
                        /**
                         *
                         * @param e
                         * @param ui
                         */
                        function onDateChange(e, ui) {
                            if (globalThis['filterConfigData'].deactivated)
                                return false;
                            clearTimeout(timer);
                            timer = setTimeout(function () {
                                var dt_cur_from = new Date(ui.values[0] * 1000); //.format("yyyy-mm-dd hh:ii:ss");
                                $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val(
                                    formatDT(dt_cur_from, 'yy-mm-dd')
                                )
                                var dt_cur_to = new Date(ui.values[1] * 1000); //.format("yyyy-mm-dd hh:ii:ss");
                                $('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val(
                                    formatDT(dt_cur_to, 'yy-mm-dd')
                                )

                                setFormFieldFilter(field_item);
                            }, 150);
                        }

                        $("#liz-filter-slider-range" + lizMap.cleanName(field_item.title)).slider({
                            range: true,
                            min: min_val,
                            max: max_val,
                            step: 86400,
                            values: [min_val, max_val],
                            change: function (e, ui) {
                                onDateChange(e, ui);
                            },
                            slide: function (e, ui) {
                                var dt_cur_from = new Date(ui.values[0] * 1000); //.format("yyyy-mm-dd hh:ii:ss");
                                $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val(
                                    formatDT(dt_cur_from, 'yy-mm-dd')
                                )
                                var dt_cur_to = new Date(ui.values[1] * 1000); //.format("yyyy-mm-dd hh:ii:ss");
                                $('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val(
                                    formatDT(dt_cur_to, 'yy-mm-dd')
                                )
                            }
                        });
                    }

                    $('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title) + ', #liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).change(function () {
                        // Filter the data. Only if the slider is not activated (if it is activated, it triggers the filter)
                        if (!hasSlider) {
                            setFormFieldFilter(field_item);
                        } else {
                            // Change values of the slider
                            $("#liz-filter-slider-range" + lizMap.cleanName(field_item.title)).slider(
                                "values",
                                [
                                    Date.parse($('#liz-filter-field-min-date' + lizMap.cleanName(field_item.title)).val()) / 1000,
                                    Date.parse($('#liz-filter-field-max-date' + lizMap.cleanName(field_item.title)).val()) / 1000
                                ]
                            );
                        }
                    });
                }

                // numeric
                if (field_config['type'] == 'numeric') {

                    var hasSlider = (true);
                    if (hasSlider) {
                        var min_val = field_item['min'];
                        var max_val = field_item['max'];

                        // Add a function which will use a timeout
                        // to prevent too heavy load on server
                        // when using setFormFieldFilter
                        var timer = null;
                        /**
                         *
                         * @param e
                         * @param ui
                         */
                        function onNumericChange(e, ui) {
                            if (globalThis['filterConfigData'].deactivated)
                                return false;
                            clearTimeout(timer);
                            timer = setTimeout(function () {
                                var dt_cur_from = ui.values[0];
                                $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title)).val(dt_cur_from);
                                var dt_cur_to = ui.values[1];
                                $('#liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).val(dt_cur_to);

                                setFormFieldFilter(field_item);
                            }, 300);
                        }

                        $("#liz-filter-slider-range" + lizMap.cleanName(field_item.title)).slider({
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

                    $('#liz-filter-field-min-numeric' + lizMap.cleanName(field_item.title) + ', #liz-filter-field-max-numeric' + lizMap.cleanName(field_item.title)).change(function () {
                        // Filter the data. Only if the slider is not activated (if it is activated, it triggers the filter)
                        if (!hasSlider) {
                            setFormFieldFilter(field_item);
                        } else {
                            // Change values of the slider
                            $("#liz-filter-slider-range" + lizMap.cleanName(field_item.title)).slider(
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
                if (field_config['type'] == 'text') {
                    $('#liz-filter-field-text' + lizMap.cleanName(field_item.title)).change(function () {
                        // Filter the data
                        setFormFieldFilter(field_item);
                    });
                }

                // Add event on reset buttons
                $('#liz-filter-box-' + lizMap.cleanName(field_item.title) + ' button.liz-filter-reset-field').click(function () {
                    resetFormField($(this).val());
                    activateFilter();
                });

                // Add tooltip
                $('#liz-filter-box-' + lizMap.cleanName(field_item.title) + ' [title]').tooltip({
                    trigger: 'hover'
                });

            }

            /**
             *
             * @param filter
             */
            function getFeatureCount(filter) {
                filter = typeof filter !== 'undefined' ? filter : '';
                var layerId = globalThis['filterConfigData'].layerId;

                var sdata = {
                    request: 'getFeatureCount',
                    layerId: layerId,
                    filter: filter
                };
                $.get(globalThis['filterConfigData'].url, sdata, function (result) {
                    if (!result)
                        return false;
                    if ('status' in result && result['status'] == 'error') {
                        console.log(result.title + ': ' + result.detail);
                        return false;
                    }
                    for (var a in result) {
                        var feat = result[a];
                        var nb = feat['c'];
                        try {
                            nb = (new Intl.NumberFormat()).format(nb);
                        } catch (error) {
                            nb = feat['c'];
                        }
                        $('#liz-filter-item-layer-total-count').html(nb);
                    }

                }, 'json');
            }

            /**
             *
             * @param filter
             */
            function setZoomExtent(filter) {
                filter = typeof filter !== 'undefined' ? filter : '';

                var layerId = globalThis['filterConfigData'].layerId;

                // Get map projection and layer extent
                var mapProjection = lizMap.map.getProjection();
                if (mapProjection == 'EPSG:900913')
                    mapProjection = 'EPSG:3857';

                // Get layer
                var layerName = globalThis['filterConfigData'].layerName;

                if (!filter) {
                    // Use layer extent
                    var itemConfig = lizMap.config.layers[layerName];
                    if ('bbox' in itemConfig) {
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
                $.get(globalThis['filterConfigData'].url, sdata, function (result) {
                    if (!result)
                        return false;
                    if ('status' in result && result['status'] == 'error') {
                        console.log(result.title + ': ' + result.detail);
                        // Hide Zoom button
                        $('#liz-filter-zoom').hide();
                        return;
                    }

                    for (var a in result) {
                        //BOX(33373 7527405.72750002,449056.961709125 7724585.66040861)
                        var sourcebbox = result[a]['bbox'];
                        if (!sourcebbox)
                            return false;
                        var sbbox = $.parseJSON(sourcebbox);
                        var bbox = sbbox.bbox;
                        var extent = bbox[0] + ',' + bbox[1] + ',' + bbox[2] + ',' + bbox[3];
                        $('#liz-filter-zoom').val(extent);
                    }

                }, 'json');
            }

            /**
             *
             */
            function zoomToFeatures() {
                var bounds = $('#liz-filter-zoom').val();
                var abounds = null;
                if (bounds) {
                    abounds = bounds.split(',');
                }
                if (!bounds || abounds.length != 4) {
                    return false;
                }
                lizMap.mainLizmap.map.zoomToGeometryOrExtent(abounds);
                return false;
            }

            // Launch LayerFilter feature
            addLayerFilterToolInterface();
            launchLayerFilterTool(globalThis['filterConfigData'].layerId);

            // Listen to the layer selector changes
            $('#liz-filter-layer-selector').change(function () {
                deactivateFilter();
                globalThis['filterConfigData'].layerId = $(this).val();
                launchLayerFilterTool($(this).val());
            });

        } // uicreated
    });


}();
