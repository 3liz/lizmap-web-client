var lizDataviz = function() {

    var dv = {
        'config' : null,
        'plots': [],
        'template': null
    };

    function getPlots(){
        if(!dv.config.layers)
            return false;
        for( var i in dv.config.layers) {
            addPlotContainer(i);
        }
        lizMap.events.triggerEvent( "datavizplotcontainersadded" );
        for( var i in dv.config.layers) {
            getPlot(i, null, 'dataviz_plot_' + i);
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
                        var pFilterSplit = filter.split(':');
                        if( pFilterSplit.length == 2){
                            getPlot(i, pFilterSplit[1], 'dataviz_plot_' + i);
                        }
                    }
                }
            }
        }
    }

    function buildPlotContainerHtml(title, abstract, target_id, with_title){
        with_title = typeof with_title !== 'undefined' ?  with_title : true;
        var html = '';
        html+= '<div class="dataviz_plot_container"  id="'+target_id+'_container">'
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
        var html = buildPlotContainerHtml(plot_config.title, plot_config.abstract, dataviz_plot_id);

        //if we chose to hide the parent plot the html variable become empty
        if(plot_config.only_show_childs=="True")
        {
            html='';
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

    function buildPlot(id, conf){
        // Build plot with plotly
        Plotly.newPlot(id, conf.data, conf.layout, {displayModeBar: false});
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
                        new RegExp('\\$([0-9])+','gm'),
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
          return getPlot(id);
        }
    }

    return obj;
}();
