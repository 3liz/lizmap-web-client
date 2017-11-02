var lizDataviz = function() {

    var dv = {
        'config' : null,
        'plots': []
    };

    function getPlots(){
        if(!dv.config.layers)
            return false;
        for( var i in dv.config.layers) {
            addPlotContainer(i);
        }
        lizMap.events.triggerEvent( "datavizplotcontainersadded" );
        for( var i in dv.config.layers) {
            getPlot(i);
        }

    }

    function addPlotContainer(plot_id){
        var dataviz_plot_id = 'dataviz_plot_' + plot_id;
        var plot_config = dv.config.layers[plot_id];
        var html = '';
        html+= '<div class="dataviz_plot_container"  id="'+dataviz_plot_id+'_container">'
        html+= '<h3><span class="title">';
        html+= '<span class="icon"></span>&nbsp;';
        html+= '<span class="text">'+plot_config.title+'</span>';
        html+= '</span></h3>';
        html+= '<div class="menu-content">';
        html+= '  <p>'+plot_config.abstract+'</p>';
        html+= '  <div id="'+dataviz_plot_id+'"></div>';
        html+= '</div>';
        html+= '</div>';

        $('#dataviz-content').append(html);
    }

    function getPlot(plot_id){
        var lparams = {
            'request': 'getPlot',
            'plot_id': plot_id
        };
        $.getJSON(datavizConfig.url,
            lparams,
            function(json){
                if( 'errors' in json ){
                    console.log('Dataviz configuration error');
                    console.log(json.errors);
                    return false;
                }
                if( !json.data || json.data.length < 1)
                    return false;
                dv.plots.push(json);

                var dataviz_plot_id = 'dataviz_plot_' + plot_id;
                var plot = buildPlot(dataviz_plot_id, json);
            }
        );
    }

    function buildPlot(id, conf){
        Plotly.newPlot(id, conf.data, conf.layout);
        lizMap.events.on({
            dockopened: function(e) {
                if ( e.id == 'dataviz' ) {
                    resizePlot(id);
                }
            }
        });
        lizMap.events.on({
            rightdockopened: function(e) {
                if ( e.id == 'dataviz' ) {
                    resizePlot(id);
                }
            }
        });
        lizMap.events.on({
            bottomdockopened: function(e) {
                if ( e.id == 'dataviz' ) {
                    resizePlot(id);
                }
            }
        });
        $(window).resize(function() {
            if($('#mapmenu li.dataviz').hasClass('active')){
                resizePlot(id);
            }
        });
        $('#dataviz-waiter').hide();

        lizMap.events.triggerEvent(
            "datavizplotloaded",
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

                // Build all plots
                getPlots();
            }

        }
    });


}();
