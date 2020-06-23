var lizDataviz = function() {

    var dv = {
        'config' : null,
        'plots': {},
        'template': null
    };

    function optionToBoolean(string){
        var ret = false;
        if (string.toString().toLowerCase() == "true"){
            ret = true;
        }else{
            ret = false;
        }
        return ret;
    }

    function getPlots(){
        if(!dv.config.layers)
            return false;
        for( var i in dv.config.layers) {
            if (!( optionToBoolean(dv.config.layers[i]['only_show_child']) )) {
                addPlotContainer(i);
            }
        }
        lizMap.events.triggerEvent( "datavizplotcontainersadded" );
        for( var i in dv.config.layers) {
            if (!( optionToBoolean(dv.config.layers[i]['only_show_child']) )){
                getPlot(i, null, 'dataviz_plot_' + i);
            }
        }

        // Filter plot if needed
        lizMap.events.on({
            layerFilterParamChanged: function(e) {
                refreshPlotsOnFilter(e.featureType, e.filter);
            },
            layerfeatureremovefilter: function(e) {

                refreshPlotsOnFilter(e.featureType, null);
            }
        });

        // Change style of outer text in dark mode
        $('#dataviz-content.dark path.textline')
        .parent()
        .find('g.slicetext text')
        .css('fill', 'white');

    }

    function refreshPlotsOnFilter(featureType, filter){
        for( var i in dv.config.layers) {
            var dvLayerId = dv.config.layers[i]['layer_id']
            if( featureType in lizMap.config.layers ){
                var layerId = lizMap.config.layers[featureType].id;

                if( layerId == dvLayerId ){
                    if(filter === null){
                        getPlot(i, null, 'dataviz_plot_' + i);
                    }
                    else{
                        var pFilter = filter.replace(featureType+':', '');
                        if( pFilter.length > 5){
                            getPlot(i, pFilter, 'dataviz_plot_' + i);
                        }
                    }
                }
            }
        }
    }

    function buildPlotContainerHtml(title, abstract, target_id, with_title){
        with_title = typeof with_title !== 'undefined' ?  with_title : true;
        var html = '';
        html+= '<div class="dataviz_plot_container"  id="'+target_id+'_container">';
        if(with_title){
            html+= '<h3><span class="title">';
            html+= '<span class="icon"></span>&nbsp;';
            html+= '<span class="text">'+title+'</span>';
            html+= '</span></h3>';
        }
        html+= '<div class="menu-content">';
        if (abstract.trim() != '') {
            html+= '  <p>'+abstract.trim()+'</p>';
        }
        html+= '  <div class="dataviz-waiter progress progress-striped active" style="margin:5px 5px;">';
        html+= '    <div class="bar" style="width: 100%;"></div>';
        html+= '  </div>';
        html+= '  <div id="'+target_id+'"></div>';
        html+= '</div>';
        html+= '</div>';

        return html;
    }

    function addPlotContainer(plot_id){
        var dataviz_plot_id = 'dataviz_plot_' + plot_id;
        dv.plots[plot_id] = {'json': null, 'filter': null, 'show_plot': true, 'cache': null};
        var plot_config = dv.config.layers[plot_id];
        //if we chose to hide the parent plot the html variable become empty
        var html = '';
        if( !(optionToBoolean(plot_config.only_show_child)) )
        {
            html = buildPlotContainerHtml(plot_config.title, plot_config.abstract, dataviz_plot_id);
        }

        // Move plot at the end of the main container
        // to the corresponding place if id is referenced in the template
        var pgetter = '#dataviz_plot_template_' + plot_id;
        var p = $(pgetter);
        if( p.length ){
            p.append(html);
        }
        else{
            $('#dataviz-content').append(html);
        }
    }

    function getPlot(plot_id, exp_filter, target_id){
        if ( $('#'+target_id).length == 0) return;

        exp_filter = typeof exp_filter !== 'undefined' ?  exp_filter : null;
        target_id = typeof target_id !== 'undefined' ?  target_id : new Date().valueOf()+btoa(Math.random()).substring(0,12);

        var lparams = {
            'request': 'getPlot',
            'plot_id': plot_id
        };
        if (exp_filter) {
            lparams['exp_filter'] = exp_filter;
        }

        // Use cache if exsits
        if (!exp_filter && dv.plots[plot_id]['cache']
            && 'data' in dv.plots[plot_id]['cache']
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
            var plot = buildPlot(target_id, dv.plots[plot_id]['cache']);
            $('#'+target_id).prev('.dataviz-waiter:first').hide();

            return true;
        }

        // No cache -> get data
        $.getJSON(datavizConfig.url,
            lparams,
            function(json){
                if( 'errors' in json ){
                    console.log('Dataviz configuration error');
                    console.log(json.errors);
                    return false;
                }
                // Store json only if no filter
                // Because we use cache for the full data
                // and we do not want to override it
                if (!exp_filter) {
                    dv.plots[plot_id]['cache'] = json;
                }
                dv.plots[plot_id]['json'] = json;

                // Store filter
                dv.plots[plot_id]['filter'] = exp_filter;

                // Hide container if no data
                if( !json.data || json.data.length < 1){
                    // hide full container
                    $('#' + target_id + '_container').hide();
                    $('#'+target_id).prev('.dataviz-waiter:first').hide();
                    $('#'+target_id).parents('div.lizdataviz.lizmapPopupChildren:first').hide();
                    return false;
                }
                // Show container if needed
                if (dv.plots[plot_id]['show_plot']) {
                    $('#' + target_id + '_container').show();
                }

                // Build plot
                var plot = buildPlot(target_id, json);
                $('#'+target_id).prev('.dataviz-waiter:first').hide();
            }
        );
    }

    function buildHtmlPlot(id, data, layout) {
        if (!data) {
            return;
        }
        var a = parseInt(id.replace('dataviz_plot_', ''));
        var plot_config = dv.config.layers[a];
        var plot = plot_config.plot;
        if (!('html_template' in plot)) {
            return;
        }
        var template = plot.html_template;

        // data has as many item as traces
        // First get number of x distinct values of 1st trace
        var nb_traces = data.length;

        var htmls = {};
        var max_distinct_x = 500;
        var distinct_x = [];
        for (var x in data[0]['x']) {
            // Keep only N first x values
            // For performance
            if (x > max_distinct_x) {
                break;
            }
            var html = template;
            var x_val = data[0]['x'][x];
            distinct_x.push(x_val);
            var x_search = '{$x}';
            var x_replacement = x_val;
            html = html.split(x_search).join(x_replacement);
            // Loop over traces
            for (var i = 0; i < nb_traces; i++ ) {
                var trace = data[i];
                // Y value
                var y_val = trace.y[x];
                var y_search = '{$yi}'.replace('i', i+1);
                var localeString = dv.config.locale.replace('_', '-')
                var y_replacement = y_val.toLocaleString(localeString);;
                html = html.split(y_search).join(y_replacement);

                // Colors
                if ('color' in trace.marker) {
                    var y_color = trace.marker.color;
                    var y_csearch = '{$colori}'.replace('i', i+1);
                    var y_creplacement = y_color;
                }
                if ('colors' in trace.marker) {
                    var y_color = trace.marker.colors[x];
                    var y_csearch = '{$colori}'.replace('i', i+1);
                    var y_creplacement = y_color;
                }
                html = html.split(y_csearch).join(y_creplacement);
            }
            htmls[x_val] = html;
        }

        // Sort by X
        distinct_x.sort();

        // Empty previous html
        $('#'+id).html('');
        for (var x in distinct_x) {
            var x_val = distinct_x[x];
            var html = '<div style="padding:5px;">' + htmls[x_val] + '</div>';
            $('#'+id).append(html);
        }
    }

    function resizePlot(id){
        var d3 = Plotly.d3;
        var gd = d3.select('#'+id)
        .style({
            width: '100%',
            margin: '0px'
        });
        Plotly.Plots.resize(gd.node());
    }

    function getPlotIdByContainerId(id){
        var pid = null;
        if (id.substring(0, 13) == 'dataviz_plot_') {
            pid = parseInt(id.replace('dataviz_plot_', ''));
        } else {
            for( var i in dv.config.layers) {
                var dvLayerId = dv.config.layers[i]['layer_id'];
                // Remove layer id prefix
                var temp_pid = id.replace(dvLayerId, '');
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

    function buildPlot(id, conf){
        // Build plot with plotly or lizmap
        if(conf.data.length && conf.data[0]['type'] == 'html'){
            buildHtmlPlot(id, conf.data, conf.layout);
        }else{
            var plotLocale = dv.config.locale.substring(0, 2);
            var plotConfig = {
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
                    'sendDataToCloud','editInChartStudio',
                    'zoom2d','pan2d','select2d','lasso2d',
                    'drawclosedpath','drawopenpath','drawline',
                    'resetScale2d','toggleSpikelines','toggleHover',
                    'hoverClosestCartesian','hoverCompareCartesian'
                ],
                displaylogo: false,
                doubleClickDelay: 1000
            };
            Plotly.newPlot(
                id,
                conf.data,
                conf.layout,
                plotConfig
            );

            // Apply user defined layout
            // We need to get the plot Lizmap config from its container id
            var pid = getPlotIdByContainerId(id);
            // Do nothing if pid not found
            if (!pid) {
                return;
            }
            var plot_config = dv.config.layers[pid];
            if ('layout' in plot_config.plot && plot_config.plot.layout) {
                var user_layout = plot_config.plot.layout;
                //var json_layout = JSON.stringify(user_layout);
                //var new_layout = JSON.parse(json_layout.replace('"False"', 'false').replace('"True"', 'true'));
                var new_layout = user_layout;
                Plotly.relayout(id, new_layout);
            }

            // Change style of outer text in dark mode
            $('#dataviz-content.dark #'+id+' path.textline')
            .parent()
            .find('g.slicetext text')
            .css('fill', 'white');

        }




        // Add events to resize plot when needed
        lizMap.events.on({
            dockopened: function(e) {
                if ( $.inArray(e.id, ['dataviz', 'popup']) > -1 ) {
                    resizePlot(id);
                }
            },
            rightdockopened: function(e) {
                if ( $.inArray(e.id, ['dataviz', 'popup']) > -1 ) {
                    resizePlot(id);
                }
            },
            bottomdockopened: function(e) {
                if ( e.id == 'dataviz' ) {
                    resizePlot(id);
                }
            },
            bottomdocksizechanged: function(e) {
                if($('#mapmenu li.dataviz').hasClass('active')  || $('#mapmenu li.popup').hasClass('active')){
                    resizePlot(id);
                }
            }

        });

        window.addEventListener('resize', function () {
            if ($('#mapmenu li.dataviz').hasClass('active') || $('#mapmenu li.popup').hasClass('active')) {
                resizePlot(id);
            }
        });

        // Add event to hide/show plots if needed
        // We use the id variable for the plot: we are in the buildPlot function
        lizMap.events.on({
            'lizmaplayerchangevisibility': function(e) {
                if (e.config !== undefined && 'datavizLayers' in lizMap.config ){
                    // Get layer info
                    var config = e.config;
                    var layerId = config.id;

                    // Get plot id and layer id
                    var pid = getPlotIdByContainerId(id);
                    if (!pid) {
                        return;
                    }
                    var plot_config = dv.config.layers[pid];
                    if(!('display_when_layer_visible' in plot_config.plot)){
                        return;
                    }

                    // Check correspondance
                    var pLayerId = plot_config['layer_id'];
                    var ltoggle = optionToBoolean(plot_config.plot.display_when_layer_visible);
                    if (pLayerId == layerId && ltoggle){
                        // Set plot visibility depending on layer visibility
                        var layer = lizMap.map.getLayersByName(config.cleanname)[0]
                        var showPlot = (
                            layer.getVisibility() && layer.inRange
                            && dv.plots[pid]['json']
                            && 'data' in dv.plots[pid]['json']
                            && dv.plots[pid]['json']['data'] && dv.plots[pid]['json']['data'].length > 0
                        );
                        $('#' + id + '_container').toggle(showPlot);
                        dv.plots[pid]['show_plot'] = showPlot;
                        if(showPlot){
                            resizePlot(id);
                        }
                    }
                }
            }
        });

        // AT STARTUP : Hide plot when layer not shown
        // Todo: we should not refresh plot or even load it if not visible
        // First check if id begins with dataviz_plot -> main panel
        // or not -> popup child dataviz: do nothing
        if (id.substring(0, 13) == 'dataviz_plot_') {
            var pid = parseInt(id.replace('dataviz_plot_', ''));
            var plot_config = dv.config.layers[pid];
            if('display_when_layer_visible' in plot_config.plot && optionToBoolean(plot_config.plot.display_when_layer_visible)) {
                var getLayerConfig = lizMap.getLayerConfigById( plot_config['layer_id'] );
                if (getLayerConfig) {
                    var layerConfig = getLayerConfig[1];
                    var featureType = getLayerConfig[0];

                    // Use layer visibility
                    var oLayers = lizMap.map.getLayersByName(layerConfig.cleanname);
                    if(oLayers.length == 1){
                        var oLayer = oLayers[0];
                        var lvisibility = oLayer.visibility;
                        var pvisibility = $('#' + id + '_container').is(":visible");
                        var showPlot = (
                            lvisibility
                            && dv.plots[pid]['json']
                            && 'data' in dv.plots[pid]['json']
                            && dv.plots[pid]['json']['data'] && dv.plots[pid]['json']['data'].length > 0
                        );
                        $('#' + id + '_container').toggle(showPlot);
                        dv.plots[pid]['show_plot'] = showPlot;
                        if(showPlot && !pvisibility){
                            resizePlot(id);
                        }
                    }
                }
            }
        }

        lizMap.events.triggerEvent( "datavizplotloaded",
            {'id':id}
        );

    }

    // Find plots for non spatial layers wich are children of given plot id
    function getChildTablePlots(layerId) {
        var children = [];
        if (!('relations' in lizMap.config) || !(layerId in lizMap.config.relations)) {
            return children;
        }
        var getLayerConfig = lizMap.getLayerConfigById(layerId);
        if (!getLayerConfig) {
            return children;
        }
        var plotLayers = lizMap.config.datavizLayers.layers;
        var lrelations = lizMap.config.relations[layerId];
        for (var x in lrelations) {
            var rel = lrelations[x];
            // Id of the layer which is the child of layerId
            var children_layer_id = rel.referencingLayer;
            for ( var i in plotLayers) {
                if (plotLayers[i].layer_id==children_layer_id) {
                    var child_plot_config = plotLayers[i];
                    var child_plot_id = child_plot_config.plot_id;
                    // Check child layer is non spatial
                    // And if we must take the visibility into account
                    var c_getLayerConfig = lizMap.getLayerConfigById(children_layer_id);
                    if (
                        c_getLayerConfig && c_getLayerConfig[1].geometryType == 'none'
                        && 'display_when_layer_visible' in child_plot_config.plot
                        && optionToBoolean(child_plot_config.plot.display_when_layer_visible)
                    ) {
                        children.push(child_plot_id);
                    }
                }
            }
        }
        return children;
    }

    lizMap.events.on({
        'uicreated':function(evt){
            if( 'datavizLayers' in lizMap.config ){
                // Get config
                dv.config = lizMap.config.datavizLayers;

                // Add HTML template
                if( 'datavizTemplate' in lizMap.config.options ){
                    datavizTemplate = lizMap.config.options.datavizTemplate;
                    // Replace $N by container divs
                    dv.template = datavizTemplate.replace(
                        new RegExp('\\$([0-9]+)','gm'),
                        '<div id="dataviz_plot_template_$1"></div>'
                    )
                    $('#dataviz-content').append(dv.template);
                }
                // Build all plots
                getPlots();
            }
        },

        // Set plot visibility for non spatial child layers
        'lizmaplayerchangevisibility': function(e) {
            if( e.config !== undefined && 'datavizLayers' in lizMap.config ){
                // Get layer info
                var name = e.name;
                var config = e.config;
                var layerId = config.id;

                // Test if layer is visible and in range (scales)
                var layer = lizMap.map.getLayersByName(config.cleanname)[0]
                var showPlot = (
                    layer.getVisibility() && layer.inRange
                );

                // Get non spatial children layers
                var children = getChildTablePlots(layerId);
                for (var c in children) {
                    var child_id = children[c];
                    var child_html_id = 'dataviz_plot_' + child_id;
                    showPlot = (
                        showPlot
                        && dv.plots[child_id]['json']
                        && 'data' in dv.plots[child_id]['json']
                        && dv.plots[child_id]['json']['data'] && dv.plots[child_id]['json']['data'].length > 0
                    );
                    $('#' + child_html_id + '_container').toggle(showPlot);
                    if(showPlot){
                        resizePlot(child_html_id);
                    }
                }
            }
        }
    });

    var obj = {

        buildPlot: function(id, conf) {
          return buildPlot(id, conf);
        },
        buildPlotContainerHtml: function(title, abstract, target_id, with_title) {
          return buildPlotContainerHtml(title, abstract, target_id, with_title);
        },
        getPlot: function(plot_id, exp_filter, target_id) {
          return getPlot(plot_id, exp_filter, target_id);
        },
        resizePlot: function(id) {
          return resizePlot(id);
        },
        data: dv
    }

    return obj;
}();
