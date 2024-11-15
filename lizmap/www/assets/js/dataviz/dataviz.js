let lizDataviz = function () {

    /**
     * Global variable which helps to get
     * the dataviz state
     */
    let dv = {
        'config': null,
        'plots': {},
        'template': null
    };

    /**
     * Check if an HTML element is in the current viewport
     * and is visible at the same time.
     *
     * This will be used to lazy load the plots.
     *
     * @param {HTMLElement} elem The element to check
     * @return {boolean} True if the element is in the viewport and visible
     */
    function isInViewport(elem) {
        let bounding = elem.getBoundingClientRect();
        let inViewport = (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.width > 0 &&
            bounding.height > 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
        let style = window.getComputedStyle(elem);
        let isVisible = !((style.display === 'none') || (style.visibility === 'hidden'))

        return (inViewport && isVisible);
    };

    /**
     * Get the percentage of an element covering the viewport
     *
     * @param {HTMLElement} element The element to test
     * @return {int} Percentage
     */
    function getViewPercentage(element) {
        const viewport = {
            top: window.pageYOffset,
            bottom: window.pageYOffset + window.innerHeight
        };
        const elementBoundingRect = element.getBoundingClientRect();
        const elementPos = {
            top: elementBoundingRect.y + window.pageYOffset,
            bottom: elementBoundingRect.y + elementBoundingRect.height + window.pageYOffset
        };
        if (viewport.top > elementPos.bottom || viewport.bottom < elementPos.top) {
            return 0;
        }
        // Element is fully within viewport
        if (viewport.top < elementPos.top && viewport.bottom > elementPos.bottom) {
            return 100;
        }
        // Element is bigger than the viewport
        if (elementPos.top < viewport.top && elementPos.bottom > viewport.bottom) {
            return 100;
        }

        const elementHeight = elementBoundingRect.height;
        let elementHeightInView = elementHeight;
        if (elementPos.top < viewport.top) {
            elementHeightInView = elementHeight - (window.pageYOffset - elementPos.top);
        }
        if (elementPos.bottom > viewport.bottom) {
            elementHeightInView = elementHeightInView - (elementPos.bottom - viewport.bottom);
        }
        const percentageInView = (elementHeightInView / window.innerHeight) * 100;

        return Math.round(percentageInView);
    }

    /**
     * Converts a string 'False' or 'True' to boolean
     *
     * @param {string} string The string to convert to boolean.
     * @return {boolean} The converted boolean value.
     */
    function optionToBoolean(string) {

        return (string.toString().toLowerCase() == "true");
    }

    /**
     * List the plots written in Lizmap configuration object
     * and create the needed HTML containers.
     *
     * It also get the data and render the plot if they are
     * not only displayed in the popup.
     *
     */
    function getPlots() {
        if (!dv.config.layers)
            return false;

        // Observe plots intersection with viewport
        // To help lazy loading data
        let observer = new IntersectionObserver(function (entries) {
            // callback code
            for (let i = 0; i < entries.length; i++) {
                if (entries[i]['isIntersecting']) {
                    let plotContainerId = entries[i]['target'].id;
                    let plotId = plotContainerId.replace('dataviz_plot_', '');
                    let data_fetched = dv.plots[plotId]['data_fetched'];
                    if (!data_fetched) {
                        getPlot(plotId, dv.plots[plotId]['filter'], plotContainerId);
                    }
                }
            }
        }, { threshold: [0.1], rootMargin: "0px 0px 0px 0px" });

        // For each configured plot, add reference in our global object
        // Add add the plot container div
        for (let i in dv.config.layers) {
            // initialize plot info
            dv.plots[i] = { 'json': null, 'filter': null, 'show_plot': true, 'cache': null, 'data_fetched': false };
            if (!(optionToBoolean(dv.config.layers[i]['only_show_child']))) {
                // Add plot container
                addPlotContainer(i);
            }
        }

        // Trigger the Lizmap event that the plots containers have been added
        lizMap.events.triggerEvent("datavizplotcontainersadded");

        // Get the plot data and display the plots
        // for the plot which are visible in the dock, not only in the parent popup
        for (let i in dv.config.layers) {
            let plotContainerId = `dataviz_plot_${i}`;

            // Set the plot container visibility at startup depending on the layer visibility
            setPlotContainerVisibilityFromLayerVisibility(i);

            // Get the data and display the plot only if needed
            if (!(optionToBoolean(dv.config.layers[i]['only_show_child']))) {
                // Get the plot data and display it if the container is visible
                let elem = document.getElementById(plotContainerId);
                // skip the element if it does not exist
                if (elem === null) {
                    continue;
                }
                if (isInViewport(elem) || getViewPercentage(elem) > 0) {
                    getPlot(i, null, plotContainerId);
                }

                // Add intersection observer on the plot container
                // to let the script get the data anytime the plot is displayed
                observer.observe(elem);
            }
        }

        // Filter plot if needed
        lizMap.events.on({
            layerFilterParamChanged: function (e) {
                refreshPlotsOnFilter(e.featureType, e.filter);
            },
            layerfeatureremovefilter: function (e) {
                refreshPlotsOnFilter(e.featureType, null);
            }
        });

        // Toggle the plot visibility based on the plot configuration
        // and the layer visibility
        // Add event to hide/show plots if needed
        // We use the id variable for the plot: we are in the buildPlot function
        lizMap.mainLizmap.state.rootMapGroup.addListener(
            evt => {
                const layer = lizMap.mainLizmap.state.rootMapGroup.getMapLayerByName(evt.name);
                if (!layer) {
                    return;
                }
                let layerId = layer.layerConfig.id;

                for (let pid in dv.config.layers) {
                    // Plot container ID
                    let plotContainerId = `dataviz_plot_${pid}`;

                    // Plot global configuration
                    let plot_config = dv.config.layers[pid];
                    if (!('display_when_layer_visible' in plot_config.plot)) {
                        continue;
                    }

                    // Check correspondance between layers
                    let pLayerId = plot_config['layer_id'];
                    let displayPlot = optionToBoolean(plot_config.plot.display_when_layer_visible);
                    if (pLayerId == layerId && displayPlot) {
                        // Set plot visibility depending on layer visibility
                        let showPlot = layer.visibility;
                        $('#' + plotContainerId + '_container').toggle(showPlot);
                        dv.plots[pid]['show_plot'] = showPlot;
                        if (showPlot) {
                            resizePlot(plotContainerId);
                        }
                    }
                }
            }, 'layer.visibility.changed'
        );
    }

    /**
     * Refresh the plot by requesting new data
     * anytime a filter has been applied or discarded
     * on the source layer
     *
     * @param {string} featureType The layer feature type
     * @param {string} filter The OWS filter, in format my_layer_feature_type: "a_field" = 'value'
     */
    function refreshPlotsOnFilter(featureType, filter) {
        for (let i in dv.config.layers) {
            let dvLayerId = dv.config.layers[i]['layer_id']

            // Check the plot corresponding to the currently (un-)filtered layer
            // and refresh the plot if needed
            if (featureType in lizMap.config.layers) {
                let layerId = lizMap.config.layers[featureType].id;
                // Do it only if the plot layer ID corresponds to the filtered layer
                if (layerId == dvLayerId) {
                    // LWC 3.7 - Do it only if the new option trigger_filter is true
                    let trigger_filter = dv.config.layers[i]['trigger_filter'];
                    if (!trigger_filter) {
                        continue;
                    }

                    // Reset the status of data_fetched
                    dv.plots[i]['data_fetched'] = false;

                    // Plot container ID
                    let plotContainerId = `dataviz_plot_${i}`;
                    let plotContainerElement = document.getElementById(plotContainerId);

                    // Show container if needed
                    if (dv.plots[i]['show_plot']) {
                        $('#' + plotContainerId + '_container').show();
                    }

                    // If the filter has been removed
                    // we should refresh the plot, only if visible
                    // we want to lazy load the plots
                    if (filter === null) {
                        // Reset the global variable filter
                        dv.plots[i]['filter'] = null;
                        // Get the plot data and display the plot
                        // only if it is visible in the view port
                        if (isInViewport(plotContainerElement) || getViewPercentage(plotContainerElement) > 0) {
                            getPlot(i, null, plotContainerId);
                        }
                    }
                    // When a filter is applied, we consider the performance
                    // will be ok and always refresh all the plots even
                    // if they are not in the viewport
                    else {
                        // Get exp_filter instead of wms filter
                        let pFilter = lizMap.config.layers[featureType]['request_params']['exp_filter'];
                        // Reset the global variable filter
                        dv.plots[i]['filter'] = pFilter;
                        if (pFilter.length > 5) {
                            if (isInViewport(plotContainerElement) || getViewPercentage(plotContainerElement) > 0) {
                                getPlot(i, pFilter, plotContainerId);
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Build the HTML wrapper code inside which to add each plot
     *
     * @param {string} title The plot title.
     * @param {string} abstract The plot abstract.
     * @param {string} target_id The plot container element id.
     * @param {boolean} with_title If we need to display the plot title
     *
     * @return {boolean} The converted boolean value.
     */
    function buildPlotContainerHtml(title, abstract, target_id, with_title) {
        with_title = typeof with_title !== 'undefined' ? with_title : true;
        let html = '';
        html += '<div class="dataviz_plot_container"  id="' + target_id + '_container">';
        if (with_title) {
            html += '<h3><span class="title">';
            html += '<span class="icon"></span>&nbsp;';
            html += '<span class="text">' + title + '</span>';
            html += '</span></h3>';
        }
        html += '<div class="menu-content">';
        if (abstract.trim() != '') {
            html += '  <p>' + abstract.trim() + '</p>';
        }
        html += '  <div class="dataviz-waiter progress progress-striped active" style="margin:5px 5px;">';
        html += '    <div class="bar" style="width: 100%;"></div>';
        html += '  </div>';
        html += '  <div id="' + target_id + '"></div>';
        html += '</div>';
        html += '</div>';

        return html;
    }

    /**
     * Add the HTML plot container in the right place
     * in the page: either the #dataviz-content div
     * or in a user-defined plot container if the HTML template
     * has been configured inside Lizmap plugin
     *
     * @param {int} plot_id The plot id
     */
    function addPlotContainer(plot_id) {
        let dataviz_plot_id = 'dataviz_plot_' + plot_id;
        dv.plots[plot_id] = { 'json': null, 'filter': null, 'show_plot': true, 'cache': null };
        let plot_config = dv.config.layers[plot_id];

        //if we chose to hide the parent plot the html variable become empty
        let html = '';
        if (!(optionToBoolean(plot_config.only_show_child))) {
            html = buildPlotContainerHtml(plot_config.title, plot_config.abstract, dataviz_plot_id);
        }

        // Move plot at the end of the main container
        // to the corresponding place if id is referenced in the template
        let pgetter = '#dataviz_plot_template_' + plot_id;
        let p = $(pgetter);
        if (p.length) {
            p.append(html);
        }
        else {
            $('#dataviz-content').append(html);
        }
    }

    /**
     * Get the plot data from the backend
     * and draw the plot with the buildPlot method
     *
     * @param {int} plot_id The id of the plot.
     * @param {string} exp_filter The optional data filter.
     * @param {string} target_id The ID of the target dom element.
     *
     */
    async function getPlot(plot_id, exp_filter, target_id) {

        if ($('#' + target_id).length == 0) {
            return;
        }

        // Show the infinite progress bar
        $('#' + target_id).prev('.dataviz-waiter:first').show();

        exp_filter = typeof exp_filter !== 'undefined' ? exp_filter : null;
        target_id = typeof target_id !== 'undefined' ? target_id : new Date().valueOf() + btoa(Math.random()).substring(0, 12);

        let lparams = {
            'request': 'getPlot',
            'plot_id': plot_id
        };
        if (exp_filter) {
            lparams['exp_filter'] = exp_filter;
        }

        // Use cache if it exists
        if (!exp_filter && dv.plots[plot_id]['cache']
            && 'data' in dv.plots[plot_id]['cache']
            && dv.plots[plot_id]['cache'].data
            && dv.plots[plot_id]['cache'].data.length > 0
        ) {
            // Store filter
            dv.plots[plot_id]['filter'] = null;

            // Store json back
            dv.plots[plot_id]['json'] = dv.plots[plot_id]['cache'];

            // Show container if needed
            if (dv.plots[plot_id]['show_plot']) {
                $('#' + target_id + '_container').show();
            }

            // Build plot
            buildPlot(target_id, dv.plots[plot_id]['cache']);
            $('#' + target_id).prev('.dataviz-waiter:first').hide();

            return true;
        }

        // No cache -> get data
        try {
            const response = await fetch(globalThis['datavizConfig'].url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(lparams),
            });

            // Check content type
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Wrong content-type. JSON Expected !");
            }

            // Get the JSON response
            const jsonData = await response.json();

            // Process the JSON data
            if ('errors' in jsonData) {
                console.log('Dataviz error');
                console.log(jsonData.errors);
            }

            // Store json only if no filter
            // Because we use cache for the full data
            // and we do not want to override it
            if (!exp_filter && !('errors' in jsonData)) {
                dv.plots[plot_id]['cache'] = jsonData;
                dv.plots[plot_id]['json'] = jsonData;
            }

            // Store filter
            dv.plots[plot_id]['filter'] = exp_filter;

            // Hide container if no data
            if (!jsonData.data || jsonData.data.length < 1) {
                // hide the full container
                $('#' + target_id + '_container').hide();
                // Hide the infinite progress bar
                $('#' + target_id).prev('.dataviz-waiter:first').hide();
                $('#' + target_id).parents('div.lizdataviz.lizmapPopupChildren:first').hide();

                return false;
            }

            // Show container if needed
            if (dv.plots[plot_id]['show_plot']) {
                $('#' + target_id + '_container').show();
            }

            // The data has been successfully fetched
            dv.plots[plot_id]['data_fetched'] = true;

            // Build plot
            // Pass plot_id to inherit custom configurations in child charts
            buildPlot(target_id, jsonData, plot_id);

            // Hide the infinite progress bar
            $('#' + target_id).prev('.dataviz-waiter:first').hide();

        } catch (error) {
            console.error("Error:", error);
        }
    }


    /**
     * Build the full HTML for the very specific plot
     * of type 'html' which cannot be rendered by PlotLy
     * as they are a Lizmap only feature.
     *
     * It is responsible for rendering the plot and
     * adding it in the document.
     *
     * @param {int} targetId The ID of the plot HTML container element.
     * @param {object} data The plot data as given by the backend
     * @param {int} pid The plot integer ID
     * @param {object} layout The plot layout defined by the user
     *
     */
    function buildHtmlPlot(targetId, data, pid = null, layout = null) {
        if (!data) {
            return;
        }

        // We need to get the plot Lizmap config from its container id
        pid = pid != null ? pid : getPlotIdByContainerId(targetId);

        // Do nothing if pid not found
        if (pid == null) {
            return;
        }
        let plot_config = dv.config.layers[pid];
        let plot = plot_config.plot;
        if (!('html_template' in plot)) {
            return;
        }
        let template = plot.html_template;

        // data has as many item as traces
        // First get number of x distinct values of 1st trace
        let nb_traces = data.length;

        let htmls = {};
        let max_distinct_x = 500;
        let distinct_x = [];
        for (let x in data[0]['x']) {
            // Keep only N first x values
            // For performance
            if (x > max_distinct_x) {
                break;
            }
            let html = template;
            let x_val = data[0]['x'][x];
            distinct_x.push(x_val);
            let x_search = '{$x}';
            let x_replacement = x_val;
            html = html.split(x_search).join(x_replacement);
            // Loop over traces
            for (let i = 0; i < nb_traces; i++) {
                let trace = data[i];
                // Y value
                let y_val = trace.y[x];
                let y_search = '{$yi}'.replace('i', i + 1);
                let localeString = dv.config.locale.replace('_', '-')
                let y_replacement = y_val.toLocaleString(localeString);;
                html = html.split(y_search).join(y_replacement);

                // Colors
                let y_color = 'purple';
                let y_creplacement = y_color;
                let y_csearch = '{$colori}'.replace('i', i + 1);
                if ('color' in trace.marker) {
                    y_color = trace.marker.color;
                    y_creplacement = y_color;
                }
                if ('colors' in trace.marker) {
                    y_color = trace.marker.colors[x];
                    y_creplacement = y_color;
                }
                html = html.split(y_csearch).join(y_creplacement);
            }
            htmls[x_val] = html;
        }

        // Sort by X
        distinct_x.sort();

        // Empty previous html
        $('#' + targetId).html('');

        // Add new built html
        for (let x in distinct_x) {
            let x_val = distinct_x[x];
            let html = '<div style="padding:5px;">' + htmls[x_val] + '</div>';
            $('#' + targetId).append(html);
        }
    }


    /**
     * Trigger the event to resize the plots.
     *
     * This method is used when the size of the plot(s) container(s)
     * may have changed.
     *
     */
    function resizePlot() {
        window.dispatchEvent(new Event('resize'));
    }


    /**
     * Return the plot integer ID by passing the plot element container ID?
     *
     * @param {string} id The plot integer ID
     * @return {int} The container HTML element ID
     */
    function getPlotIdByContainerId(id) {
        let pid = null;
        if (id.substring(0, 13) == 'dataviz_plot_') {
            pid = parseInt(id.replace('dataviz_plot_', ''));
        } else {
            for (let i in dv.config.layers) {
                let dvLayerId = dv.config.layers[i]['layer_id'];
                // Remove layer id prefix
                let temp_pid = id.replace(dvLayerId, '');
                if (id == temp_pid) {
                    continue;
                }
                // Remove fid
                temp_pid = temp_pid.replace(/^_[0-9]+_/, '');
                // Get plot id
                temp_pid = parseInt(temp_pid.split('_')[0]);
                if (temp_pid) {
                    pid = temp_pid;
                }
            }
        }
        return pid;
    }


    /**
     * Create and display the plot from the given plot configuration data.
     *
     * @param {string} targetId The ID of the plot HTML container element.
     * @param {object} conf The plot configuration with data and layout properties.
     * @param {int} pid The plot integer ID
     */
    function buildPlot(targetId, conf, pid = null) {

        // Build plot with plotly or lizmap
        if (conf.data.length && conf.data[0]['type'] == 'html') {
            buildHtmlPlot(targetId, conf.data, pid, conf.layout);
        } else {
            let plotLocale = dv.config.locale.substring(0, 2);
            let plotConfig = {
                showLink: false,
                scrollZoom: false,
                locale: plotLocale,
                responsive: true,
                toImageButtonOptions: {
                    format: 'png', // one of png, svg, jpeg, webp
                    height: 500,
                    width: 700,
                    scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
                },
                editable: false,
                modeBarButtonsToRemove: [
                    'sendDataToCloud', 'editInChartStudio',
                    'zoom2d', 'pan2d', 'select2d', 'lasso2d',
                    'drawclosedpath', 'drawopenpath', 'drawline',
                    'resetScale2d', 'toggleSpikelines', 'toggleHover',
                    'hoverClosestCartesian', 'hoverCompareCartesian'
                ],
                displaylogo: false,
                doubleClickDelay: 1000
            };
            Plotly.newPlot(
                targetId,
                conf.data,
                conf.layout,
                plotConfig
            );

            // Apply user defined layout
            // We need to get the plot Lizmap config from its container id
            pid = pid != null ? pid : getPlotIdByContainerId(targetId);

            // Do nothing if pid not found
            if (pid == null) {
                return;
            }
            let plot_config = dv.config.layers[pid];
            if ('layout' in plot_config.plot && plot_config.plot.layout) {
                let user_layout = plot_config.plot.layout;
                let new_layout = user_layout;
                Plotly.relayout(targetId, new_layout);
            }

        }

        // Add events to resize plot when needed
        lizMap.events.on({
            dockopened: e => {
                if ($.inArray(e.id, ['dataviz', 'popup']) > -1) {
                    resizePlot();
                }
                if ($('#mapmenu li.dataviz').hasClass('active')) {
                    resizePlot();
                }
            },
            rightdockopened: e => {
                if ($.inArray(e.id, ['dataviz', 'popup']) > -1) {
                    resizePlot();
                }
                if ($('#mapmenu li.dataviz').hasClass('active')) {
                    resizePlot();
                }
            },
            bottomdockopened: e => {
                if (e.id == 'dataviz') {
                    resizePlot();
                }
            },
            bottomdocksizechanged: () => {
                if ($('#mapmenu li.dataviz').hasClass('active') || $('#mapmenu li.popup').hasClass('active')) {
                    resizePlot();
                }
            },
            dockclosed: () => {
                if ($('#mapmenu li.dataviz').hasClass('active')) {
                    resizePlot();
                }
            },
            rightdockclosed: () => {
                if ($('#mapmenu li.dataviz').hasClass('active')) {
                    resizePlot();
                }
            },
            lizmapswitcheritemselected: () => {
                if ($('#mapmenu li.dataviz').hasClass('active')) {
                    resizePlot();
                }
            }
        });

        // AT STARTUP : Hide plot when layer not shown
        // First check if id begins with dataviz_plot -> this is a plot shown
        // in main panel and not in parent popup
        if (targetId.substring(0, 13) == 'dataviz_plot_') {
            let pid = parseInt(targetId.replace('dataviz_plot_', ''));
            setPlotContainerVisibilityFromLayerVisibility(pid);
        }

        lizMap.events.triggerEvent("datavizplotloaded",
            { 'id': targetId }
        );

    }


    /**
     * Set the plot container visibility
     * based on the source OpenLayers layer visibility
     * depending on the parameter display_when_layer_visible
     *
     * @param {int} plotId The plot integer ID
     * @return {boolean} True if the plot must be visible
     */
    function setPlotContainerVisibilityFromLayerVisibility(plotId) {
        let plot_config = dv.config.layers[plotId];
        if ('display_when_layer_visible' in plot_config.plot && optionToBoolean(plot_config.plot.display_when_layer_visible)) {
            let getLayerConfig = lizMap.getLayerConfigById(plot_config['layer_id']);
            if (getLayerConfig) {
                // OpenLayers configuration
                let layerConfig = getLayerConfig[1];

                // Layer needs a geometry to be visible
                if (layerConfig.geometryType === "none") {
                    return;
                }

                // Get the associated layer
                const layer = lizMap.mainLizmap.state.rootMapGroup.getMapLayerByName(layerConfig.name);
                if (layer) {
                    // Plot visibility
                    let targetId = `dataviz_plot_${plotId}`;
                    let plotVisibility = $('#' + targetId + '_container').is(":visible");
                    let showPlot = layer.visibility;

                    // Toggle plot container visibility
                    $('#' + targetId + '_container').toggle(showPlot);
                    dv.plots[plotId]['show_plot'] = showPlot;

                    // Resize the plot
                    if (showPlot && !plotVisibility) {
                        resizePlot(targetId);
                    }
                }
            }
        }
    }

    lizMap.events.on({
        'uicreated': function (evt) {
            if ('datavizLayers' in lizMap.config) {
                // Get config
                dv.config = lizMap.config.datavizLayers;

                // Add HTML template
                if ('datavizTemplate' in lizMap.config.options) {
                    datavizTemplate = lizMap.config.options.datavizTemplate;
                    // Replace $N by container divs
                    dv.template = datavizTemplate.replace(
                        new RegExp('\\$([0-9]+)', 'gm'),
                        '<div id="dataviz_plot_template_$1"></div>'
                    )
                    $('#dataviz-content').append(dv.template);
                }
                // Build all plots
                getPlots();
            }
        },

        // Set plot visibility for non spatial child layers
        'lizmaplayerchangevisibility': function (e) {
            if (e.config !== undefined && 'datavizLayers' in lizMap.config) {
                // Get layer info
                let name = e.name;
                let config = e.config;
                let layerId = config.id;

                // Test if layer is visible and in range (scales)
                let layer = lizMap.map.getLayersByName(config.cleanname)[0]
                let showPlot = (
                    layer.getVisibility() && layer.inRange
                );
            }
        }
    });

    let obj = {

        buildPlot: function (id, conf, pid = null) {
            return buildPlot(id, conf, pid);
        },
        buildPlotContainerHtml: function (title, abstract, target_id, with_title) {
            return buildPlotContainerHtml(title, abstract, target_id, with_title);
        },
        getPlot: function (plot_id, exp_filter, target_id) {
            return getPlot(plot_id, exp_filter, target_id);
        },
        resizePlot: function (id) {
            return resizePlot(id);
        },
        data: dv
    }

    return obj;
}();
