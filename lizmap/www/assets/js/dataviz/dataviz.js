var lizDataviz = function() {

    var dv = {
        'config' : null,
        'plots': [],
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
        html+= '  <p>'+abstract+'</p>';
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
        if(exp_filter){
            lparams['exp_filter'] = exp_filter;
        }
        $.getJSON(datavizConfig.url,
            lparams,
            function(json){
                if( 'errors' in json ){
                    console.log('Dataviz configuration error');
                    console.log(json.errors);
                    return false;
                }
                if( !json.data || json.data.length < 1){
                    $('#'+target_id).prev('.dataviz-waiter:first').hide();
                    $('#'+target_id).parents('div.lizmapPopupChildren:first').hide();
                    return false;
                }
                dv.plots.push(json);

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

    function buildPlot(id, conf){
        // Build plot with plotly or lizmap
        if(conf.data.length && conf.data[0]['type'] == 'html'){
            buildHtmlPlot(id, conf.data, conf.layout);
        }else{
            var plotLocale = dv.config.locale.substring(0, 2)
            Plotly.newPlot(
                id,
                conf.data,
                conf.layout,
                {
                    displayModeBar: false,
                    locale: plotLocale
                }
            );
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
        $(window).resize(function() {
            if($('#mapmenu li.dataviz').hasClass('active') || $('#mapmenu li.popup').hasClass('active')){
                resizePlot(id);
            }
        });

        // Add event to hide/show plots if needed
        lizMap.events.on({
            'lizmaplayerchangevisibility': function(e) {
                if( 'datavizLayers' in lizMap.config ){
                    // Get layer info
                    var name = e.name;
                    var config = e.config;
                    var layerId = config.id;

                    // Get plot id and layer id
                    var pid = parseInt(id.replace('dataviz_plot_', ''));
                    var plot_config = dv.config.layers[pid];
                    if(!('display_when_layer_visible' in plot_config.plot)){
                        return;
                    }

                    // Check correspondance
                    var pLayerId = plot_config['layer_id'];
                    if (pLayerId == layerId){
                        // Set plot visibility depending on layer visibility
                        var ltoggle = optionToBoolean(plot_config.plot.display_when_layer_visible);
                        if( ltoggle ){
                            $('#' + id + '_container').toggle(e.visibility);
                            if(e.visibility){
                                resizePlot(id);
                            }
                        }
                    }
                }
            }
        });

        // Hide plot when layer not shown
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
                    var oLayers = lizMap.map.getLayersByName(layerConfig.cleanname);
                    if(oLayers.length == 1){
                        var oLayer = oLayers[0];
                        var lvisibility = oLayer.visibility;
                        $('#' + id + '_container').toggle(lvisibility);
                        if(lvisibility){
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

    function resizePlot(id){
        var d3 = Plotly.d3;
        var gd = d3.select('#'+id)
        .style({
            width: '100%',
            margin: '0px'
        });
        Plotly.Plots.resize(gd.node());
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
