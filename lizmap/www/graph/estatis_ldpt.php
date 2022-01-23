<html lang="pt" >
    <head>
    <meta content="text/html; charset=UTF-8" http-equiv="content-type">
    <title>Projetos - Arqvector - Estatísticas</title>
    <meta name="description" content="">
    <meta name="keywords" content="">
    <link rel="shortcut icon" href="/assets/favicon/favicon.ico">
    <script type="text/javascript" src="/assets/js/dataviz/plotly-latest.min.js"></script>
    <style id="plotly.js-style-global"></style>
    <script type="text/javascript" src="/assets/js/dataviz/dataviz.js"></script>
<style>
body {
    background: #EFEFEF;
}
</style>
	</head>
	<div>
    <div id="da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe" class="plotly-graph-div" style="height:100%; width:100%;"></div>
    <script type="text/javascript">
        var dados = <?php pg_free_result($result); include ('../../modules/admin/graph/sql_ldpt.php');?>
                    window.PLOTLYENV=window.PLOTLYENV || {};
                    
                if (document.getElementById("da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe")) {
                    dados
                };
                
    </script>
    </div>
    <script>
        // additional js function to select and click on the data
        // returns the ids of the selected/clicked feature

        var plotly_div = document.getElementById('da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe')
        var plotly_data = plotly_div.data

        // selecting function
        plotly_div.on('plotly_selected', function(data){
        var dds = {};
        dds["mode"] = 'selection'
        dds["type"] = data.points[0].data.type

        featureIds = [];
        featureIdsTernary = [];

        data.points.forEach(function(pt){
        featureIds.push(parseInt(pt.id))
        featureIdsTernary.push(parseInt(pt.pointNumber))
        dds["id"] = featureIds
        dds["tid"] = featureIdsTernary
            })
        //console.log(dds)
        window.status = JSON.stringify(dds)
        })

        // clicking function
        plotly_div.on('plotly_click', function(data){
        var featureIds = [];
        var dd = {};
        dd["fidd"] = data.points[0].id
        dd["mode"] = 'clicking'

        // loop and create dictionary depending on plot type
        for(var i=0; i < data.points.length; i++){

        // scatter plot
        if(data.points[i].data.type == 'scatter'){
            dd["uid"] = data.points[i].data.uid
            dd["type"] = data.points[i].data.type

            data.points.forEach(function(pt){
            dd["fid"] = pt.id
            })
        }

        // pie

        else if(data.points[i].data.type == 'pie'){
          dd["type"] = data.points[i].data.type
          dd["label"] = data.points[i].label
          dd["field"] = data.points[i].data.name
          console.log(data.points[i].label)
          console.log(data.points[i])
        }

        // histogram
        else if(data.points[i].data.type == 'histogram'){
            dd["type"] = data.points[i].data.type
            dd["uid"] = data.points[i].data.uid
            dd["field"] = data.points[i].data.name

            // correct axis orientation
            if(data.points[i].data.orientation == 'v'){
                dd["id"] = data.points[i].x
                dd["bin_step"] = data.points[i].fullData.xbins.size
            }
            else {
                dd["id"] = data.points[i].y
                dd["bin_step"] = data.points[i].fullData.ybins.size
            }
        }

        // box plot
        else if(data.points[i].data.type == 'box'){
            dd["uid"] = data.points[i].data.uid
            dd["type"] = data.points[i].data.type
            dd["field"] = data.points[i].data.customdata[0]

                // correct axis orientation
                if(data.points[i].data.orientation == 'v'){
                    dd["id"] = data.points[i].x
                }
                else {
                    dd["id"] = data.points[i].y
                }
            }

        // violin plot
        else if(data.points[i].data.type == 'violin'){
            dd["uid"] = data.points[i].data.uid
            dd["type"] = data.points[i].data.type
            dd["field"] = data.points[i].data.customdata[0]

                // correct axis orientation (for violin is viceversa)
                if(data.points[i].data.orientation == 'v'){
                    dd["id"] = data.points[i].x
                }
                else {
                    dd["id"] = data.points[i].y
                }
            }

        // bar plot
        else if(data.points[i].data.type == 'bar'){
            dd["uid"] = data.points[i].data.uid
            dd["type"] = data.points[i].data.type
            dd["field"] = data.points[i].data.customdata[0]

                // correct axis orientation
                if(data.points[i].data.orientation == 'v'){
                    dd["id"] = data.points[i].x
                }
                else {
                    dd["id"] = data.points[i].y
                }
            }

        // ternary
        else if(data.points[i].data.type == 'scatterternary'){
            dd["uid"] = data.points[i].data.uid
            dd["type"] = data.points[i].data.type
            dd["field"] = data.points[i].data.customdata
            dd["fid"] = data.points[i].pointNumber
            }

            }
        window.status = JSON.stringify(dd)
        });
    </script>
		
		