-- graphic views  
------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_log_counter_legenda AS
 WITH log_counter AS (
         SELECT row_number() OVER (ORDER BY l.repository, l.project) AS aid,
            l.id,
            l.key,
            l.counter,
            l.repository,
            l.project,
                CASE
                    WHEN l.key::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN l.key::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN l.key::text = 'popup'::text THEN '"#009900"'::text
                    WHEN l.key::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN l.key::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN l.key::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#ff3377"'::text
                END AS marker,
                CASE
                    WHEN l.key::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN l.key::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN l.key::text = 'popup'::text THEN '"#009900"'::text
                    WHEN l.key::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN l.key::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN l.key::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#ff3377"'::text
                END AS line,
            concat(l.project, ' - ', l.key) AS text
           FROM public.log_counter l
          ORDER BY (
                CASE
                    WHEN l.key::text = 'viewmap'::text THEN 1
                    WHEN l.key::text = 'popup'::text THEN 2
                    WHEN l.key::text = 'editionSaveFeature'::text THEN 3
                    WHEN l.key::text = 'print'::text THEN 4
                    WHEN l.key::text = 'editionDeleteFeature'::text THEN 5
                    ELSE 0
                END), l.repository
        ), conta_login AS (
         SELECT log_counter.id,
            log_counter.key,
            log_counter.counter AS conta_login,
            log_counter.repository,
            log_counter.project
           FROM public.log_counter
          WHERE log_counter.key::text = 'login'::text
        ), agra_viewmap AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.id::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Visualização de mapa", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.project::text, '", "'::text), '"], "y": [', string_agg(l.counter::text, ', '::text), ']}') AS valores
           FROM log_counter l
          WHERE l.key::text = 'viewmap'::text
        ), agra_popup AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.id::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Visualização de atributos", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.project::text, '", "'::text), '"], "y": [', string_agg(l.counter::text, ', '::text), ']}') AS valores
           FROM log_counter l
          WHERE l.key::text = 'popup'::text
        ), agra_editionsavefeature AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.id::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Edição de registos", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.project::text, '", "'::text), '"], "y": [', string_agg(l.counter::text, ', '::text), ']}') AS valores
           FROM log_counter l
          WHERE l.key::text = 'editionSaveFeature'::text
        ), agra_print AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.id::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Impressão", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.project::text, '", "'::text), '"], "y": [', string_agg(l.counter::text, ', '::text), ']}') AS valores
           FROM log_counter l
          WHERE l.key::text = 'print'::text
        ), agra_editiondeletefeature AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.id::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Registos apagados", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.project::text, '", "'::text), '"], "y": [', string_agg(l.counter::text, ', '::text), ']}') AS valores
           FROM log_counter l
          WHERE l.key::text = 'editionDeleteFeature'::text
        ), junta AS (
         SELECT av.valores,
            ap.valores,
            aes.valores,
            apr.valores,
            aed.valores,
            c.id,
            c.key,
            c.conta_login,
            c.repository,
            c.project
           FROM agra_viewmap av,
            agra_popup ap,
            agra_editionsavefeature aes,
            agra_print apr,
            agra_editiondeletefeature aed,
            conta_login c
        ), fina AS (
         SELECT concat('Plotly.newPlot(''da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe'', [', av.valores, ', ', ap.valores, ', ', aes.valores, ', ', apr.valores, ', ', aed.valores, '], {"barmode": "stack", "legend": {"orientation": "h"}, "paper_bgcolor": "rgb(255,255,255)", "plot_bgcolor": "rgb(255,255,255)", "showlegend": true, "template": {"data": {"bar": [{"error_x": {"color": "#2a3f5f"}, "error_y": {"color": "#2a3f5f"}, "marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "bar"}], "barpolar": [{"marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "barpolar"}], "carpet": [{"aaxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "baxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "type": "carpet"}], "choropleth": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "choropleth"}], "contour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour"}], "contourcarpet": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "contourcarpet"}], "heatmap": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap"}], "heatmapgl": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl"}], "histogram": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "histogram"}], "histogram2d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d"}], "histogram2dcontour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour"}], "mesh3d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "mesh3d"}], "parcoords": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "parcoords"}], "pie": [{"automargin": true, "type": "pie"}], "scatter": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter"}], "scatter3d": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter3d"}], "scattercarpet": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattercarpet"}], "scattergeo": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergeo"}], "scattergl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergl"}], "scattermapbox": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattermapbox"}], "scatterpolar": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolar"}], "scatterpolargl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolargl"}], "scatterternary": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterternary"}], "surface": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface"}], "table": [{"cells": {"fill": {"color": "#EBF0F8"}, "line": {"color": "white"}}, "header": {"fill": {"color": "#C8D4E3"}, "line": {"color": "white"}}, "type": "table"}]}, "layout": {"annotationdefaults": {"arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1}, "coloraxis": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "colorscale": {"diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]}, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": {"color": "#2a3f5f"}, "geo": {"bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white"}, "hoverlabel": {"align": "left"}, "hovermode": "closest", "mapbox": {"style": "light"}, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": {"angularaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "radialaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "scene": {"xaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "yaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "zaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}}, "shapedefaults": {"line": {"color": "#2a3f5f"}}, "ternary": {"aaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "baxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "caxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "title": {"x": 0.05}, "xaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}, "yaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}}}, "title": {"text": "Estatísticas Geo Portal - ', now()::date, ' | Total login: ', c.conta_login, '"}, "xaxis": {"gridcolor": "#bdbfc0","title": {"text": "Projecto"}}, "yaxis": {"gridcolor": "#bdbfc0","title": {"text": "Contagem"}, "type": "linear"}}, {"scrollZoom": true, "editable": true, "responsive": true})') AS data
           FROM agra_viewmap av,
            agra_popup ap,
            agra_editionsavefeature aes,
            agra_print apr,
            agra_editiondeletefeature aed,
            conta_login c
        )
 SELECT fina.data
   FROM fina;

------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_log_detail_log_key_total_legenda AS
 WITH v_log_detail_log_key_total AS (
         SELECT row_number() OVER () AS aid,
            count(*) AS total,
            ld.log_key,
            'key'::text AS tipo
           FROM public.log_detail ld
          GROUP BY ld.log_key
        ), log_detail AS (
         SELECT t.aid,
            t.total,
            t.log_key,
                CASE
                    WHEN t.log_key::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_key::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_key::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_key::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_key::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_key::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#ff3377"'::text
                END AS marker,
                CASE
                    WHEN t.log_key::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_key::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_key::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_key::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_key::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_key::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#ff3377"'::text
                END AS line,
                CASE
                    WHEN t.log_key::text IS NULL THEN 'Anónimo'::text
                    ELSE t.log_key::text
                END AS text
           FROM v_log_detail_log_key_total t
          ORDER BY (
                CASE
                    WHEN t.log_key::text = 'viewmap'::text THEN 1
                    WHEN t.log_key::text = 'popup'::text THEN 2
                    WHEN t.log_key::text = 'editionSaveFeature'::text THEN 3
                    WHEN t.log_key::text = 'print'::text THEN 4
                    WHEN t.log_key::text = 'editionDeleteFeature'::text THEN 5
                    ELSE 0
                END)
        ), agra_log_key AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Chave", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_key::text, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
        ), fina AS (
         SELECT concat('Plotly.newPlot(''da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe'', [', alk.valores, '], {"barmode": "stack", "legend": {"orientation": "h"}, "paper_bgcolor": "rgb(255,255,255)", "plot_bgcolor": "rgb(255,255,255)", "showlegend": true, "template": {"data": {"bar": [{"error_x": {"color": "#2a3f5f"}, "error_y": {"color": "#2a3f5f"}, "marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "bar"}], "barpolar": [{"marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "barpolar"}], "carpet": [{"aaxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "baxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "type": "carpet"}], "choropleth": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "choropleth"}], "contour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour"}], "contourcarpet": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "contourcarpet"}], "heatmap": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap"}], "heatmapgl": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl"}], "histogram": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "histogram"}], "histogram2d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d"}], "histogram2dcontour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour"}], "mesh3d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "mesh3d"}], "parcoords": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "parcoords"}], "pie": [{"automargin": true, "type": "pie"}], "scatter": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter"}], "scatter3d": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter3d"}], "scattercarpet": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattercarpet"}], "scattergeo": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergeo"}], "scattergl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergl"}], "scattermapbox": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattermapbox"}], "scatterpolar": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolar"}], "scatterpolargl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolargl"}], "scatterternary": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterternary"}], "surface": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface"}], "table": [{"cells": {"fill": {"color": "#EBF0F8"}, "line": {"color": "white"}}, "header": {"fill": {"color": "#C8D4E3"}, "line": {"color": "white"}}, "type": "table"}]}, "layout": {"annotationdefaults": {"arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1}, "coloraxis": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "colorscale": {"diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]}, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": {"color": "#2a3f5f"}, "geo": {"bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white"}, "hoverlabel": {"align": "left"}, "hovermode": "closest", "mapbox": {"style": "light"}, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": {"angularaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "radialaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "scene": {"xaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "yaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "zaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}}, "shapedefaults": {"line": {"color": "#2a3f5f"}}, "ternary": {"aaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "baxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "caxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "title": {"x": 0.05}, "xaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}, "yaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}}}, "title": {"text": "Estatísticas Geo Portal - ', now()::date, ' | Chave"}, "xaxis": {"gridcolor": "#bdbfc0","title": {"text": "Chave"}}, "yaxis": {"gridcolor": "#bdbfc0","title": {"text": "Contagem"}, "type": "linear"}}, {"scrollZoom": true, "editable": true, "responsive": true})') AS data
           FROM agra_log_key alk
        )
 SELECT fina.data
   FROM fina;

------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_log_detail_log_key_user_repository_project_total_legenda AS
 WITH v_log_detail_log_key_user_repository_project_total AS (
         SELECT row_number() OVER () AS aid,
            count(*) AS total,
            ld.log_key,
                CASE
                    WHEN ld.log_user::text = ''::text THEN 'Anónimo'::character varying(100)
                    ELSE ld.log_user
                END AS log_user,
            ld.log_repository,
            ld.log_project
           FROM public.log_detail ld
          WHERE ld.log_key::text <> 'login'::text
          GROUP BY ld.log_key, ld.log_repository, ld.log_project, ld.log_user
        ), v_log_detail_log_key_total AS (
         SELECT row_number() OVER () AS aid,
            count(*) AS total,
            lak.log_key,
            'key'::text AS tipo
           FROM public.log_detail lak
          GROUP BY lak.log_key
        ), log_detail AS (
         SELECT t.aid,
            t.log_key,
            t.total,
            t.log_repository,
            t.log_project,
                CASE
                    WHEN t.log_key::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_key::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_key::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_key::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_key::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_key::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#ff3377"'::text
                END AS marker,
                CASE
                    WHEN t.log_key::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_key::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_key::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_key::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_key::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_key::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#ff3377"'::text
                END AS line,
            concat(t.log_user, ' - ', t.log_key) AS text
           FROM v_log_detail_log_key_user_repository_project_total t
          ORDER BY (
                CASE
                    WHEN t.log_key::text = 'viewmap'::text THEN 1
                    WHEN t.log_key::text = 'popup'::text THEN 2
                    WHEN t.log_key::text = 'editionSaveFeature'::text THEN 3
                    WHEN t.log_key::text = 'print'::text THEN 4
                    WHEN t.log_key::text = 'editionDeleteFeature'::text THEN 5
                    ELSE 0
                END), t.log_repository
        ), conta_login AS (
         SELECT t.aid,
            t.log_key,
            t.total AS conta_login
           FROM v_log_detail_log_key_total t
          WHERE t.log_key::text = 'login'::text
        ), agra_viewmap AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Visualização de mapa", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_project::text, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
          WHERE l.log_key::text = 'viewmap'::text
        ), agra_popup AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Visualização de atributos", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_project::text, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
          WHERE l.log_key::text = 'popup'::text
        ), agra_editionsavefeature AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Edição de registos", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_project::text, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
          WHERE l.log_key::text = 'editionSaveFeature'::text
        ), agra_print AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Impressão", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_project::text, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
          WHERE l.log_key::text = 'print'::text
        ), agra_editiondeletefeature AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Registos apagados", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_project::text, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
          WHERE l.log_key::text = 'editionDeleteFeature'::text
        ), junta AS (
         SELECT av.valores,
            ap.valores,
            aes.valores,
            apr.valores,
            aed.valores,
            c.aid,
            c.log_key,
            c.conta_login
           FROM agra_viewmap av,
            agra_popup ap,
            agra_editionsavefeature aes,
            agra_print apr,
            agra_editiondeletefeature aed,
            conta_login c
        ), fina AS (
         SELECT concat('Plotly.newPlot(''da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe'', [', av.valores, ', ', ap.valores, ', ', aes.valores, ', ', apr.valores, ', ', aed.valores, '], {"barmode": "stack", "legend": {"orientation": "h"}, "paper_bgcolor": "rgb(255,255,255)", "plot_bgcolor": "rgb(255,255,255)", "showlegend": true, "template": {"data": {"bar": [{"error_x": {"color": "#2a3f5f"}, "error_y": {"color": "#2a3f5f"}, "marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "bar"}], "barpolar": [{"marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "barpolar"}], "carpet": [{"aaxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "baxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "type": "carpet"}], "choropleth": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "choropleth"}], "contour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour"}], "contourcarpet": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "contourcarpet"}], "heatmap": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap"}], "heatmapgl": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl"}], "histogram": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "histogram"}], "histogram2d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d"}], "histogram2dcontour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour"}], "mesh3d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "mesh3d"}], "parcoords": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "parcoords"}], "pie": [{"automargin": true, "type": "pie"}], "scatter": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter"}], "scatter3d": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter3d"}], "scattercarpet": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattercarpet"}], "scattergeo": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergeo"}], "scattergl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergl"}], "scattermapbox": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattermapbox"}], "scatterpolar": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolar"}], "scatterpolargl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolargl"}], "scatterternary": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterternary"}], "surface": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface"}], "table": [{"cells": {"fill": {"color": "#EBF0F8"}, "line": {"color": "white"}}, "header": {"fill": {"color": "#C8D4E3"}, "line": {"color": "white"}}, "type": "table"}]}, "layout": {"annotationdefaults": {"arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1}, "coloraxis": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "colorscale": {"diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]}, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": {"color": "#2a3f5f"}, "geo": {"bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white"}, "hoverlabel": {"align": "left"}, "hovermode": "closest", "mapbox": {"style": "light"}, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": {"angularaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "radialaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "scene": {"xaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "yaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "zaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}}, "shapedefaults": {"line": {"color": "#2a3f5f"}}, "ternary": {"aaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "baxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "caxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "title": {"x": 0.05}, "xaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}, "yaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}}}, "title": {"text": "Estatísticas Geo Portal - ', now()::date, ' | Total login: ', c.conta_login, '"}, "xaxis": {"gridcolor": "#bdbfc0","title": {"text": "Projecto"}}, "yaxis": {"gridcolor": "#bdbfc0","title": {"text": "Contagem"}, "type": "linear"}}, {"scrollZoom": true, "editable": true, "responsive": true})') AS data
           FROM agra_viewmap av,
            agra_popup ap,
            agra_editionsavefeature aes,
            agra_print apr,
            agra_editiondeletefeature aed,
            conta_login c
        )
 SELECT fina.data
   FROM fina;

------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_log_detail_log_project_total_legenda AS
 WITH v_log_detail_log_project_total AS (
         SELECT row_number() OVER () AS aid,
            count(*) AS total,
            lap.log_project,
            'project'::text AS tipo
           FROM public.log_detail lap
          GROUP BY lap.log_project
        ), log_detail AS (
         SELECT t.aid,
            t.total,
                CASE
                    WHEN t.log_project::text IS NULL THEN 'Anónimo'::text
                    ELSE t.log_project::text
                END AS log_project,
                CASE
                    WHEN t.log_project::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_project::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_project::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_project::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_project::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_project::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#a5d915"'::text
                END AS marker,
                CASE
                    WHEN t.log_project::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_project::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_project::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_project::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_project::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_project::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#a5d915"'::text
                END AS line,
                CASE
                    WHEN t.log_project::text IS NULL THEN 'Anónimo'::text
                    ELSE t.log_project::text
                END AS text
           FROM v_log_detail_log_project_total t
          ORDER BY (
                CASE
                    WHEN t.log_project::text = 'viewmap'::text THEN 1
                    WHEN t.log_project::text = 'popup'::text THEN 2
                    WHEN t.log_project::text = 'editionSaveFeature'::text THEN 3
                    WHEN t.log_project::text = 'print'::text THEN 4
                    WHEN t.log_project::text = 'editionDeleteFeature'::text THEN 5
                    ELSE 0
                END)
        ), agra_log_project AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Projecto", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_project, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
        ), fina AS (
         SELECT concat('Plotly.newPlot(''da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe'', [', alk.valores, '], {"barmode": "stack", "legend": {"orientation": "h"}, "paper_bgcolor": "rgb(255,255,255)", "plot_bgcolor": "rgb(255,255,255)", "showlegend": true, "template": {"data": {"bar": [{"error_x": {"color": "#2a3f5f"}, "error_y": {"color": "#2a3f5f"}, "marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "bar"}], "barpolar": [{"marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "barpolar"}], "carpet": [{"aaxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "baxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "type": "carpet"}], "choropleth": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "choropleth"}], "contour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour"}], "contourcarpet": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "contourcarpet"}], "heatmap": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap"}], "heatmapgl": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl"}], "histogram": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "histogram"}], "histogram2d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d"}], "histogram2dcontour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour"}], "mesh3d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "mesh3d"}], "parcoords": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "parcoords"}], "pie": [{"automargin": true, "type": "pie"}], "scatter": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter"}], "scatter3d": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter3d"}], "scattercarpet": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattercarpet"}], "scattergeo": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergeo"}], "scattergl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergl"}], "scattermapbox": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattermapbox"}], "scatterpolar": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolar"}], "scatterpolargl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolargl"}], "scatterternary": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterternary"}], "surface": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface"}], "table": [{"cells": {"fill": {"color": "#EBF0F8"}, "line": {"color": "white"}}, "header": {"fill": {"color": "#C8D4E3"}, "line": {"color": "white"}}, "type": "table"}]}, "layout": {"annotationdefaults": {"arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1}, "coloraxis": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "colorscale": {"diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]}, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": {"color": "#2a3f5f"}, "geo": {"bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white"}, "hoverlabel": {"align": "left"}, "hovermode": "closest", "mapbox": {"style": "light"}, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": {"angularaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "radialaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "scene": {"xaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "yaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "zaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}}, "shapedefaults": {"line": {"color": "#2a3f5f"}}, "ternary": {"aaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "baxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "caxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "title": {"x": 0.05}, "xaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}, "yaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}}}, "title": {"text": "Estatísticas Geo Portal - ', now()::date, ' | Projecto"}, "xaxis": {"gridcolor": "#bdbfc0","title": {"text": "Projecto"}}, "yaxis": {"gridcolor": "#bdbfc0","title": {"text": "Contagem"}, "type": "linear"}}, {"scrollZoom": true, "editable": true, "responsive": true})') AS data
           FROM agra_log_project alk
        )
 SELECT fina.data
   FROM fina;
   
------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_log_detail_log_repository_total_legenda AS
 WITH v_log_detail_log_repository_total AS (
         SELECT row_number() OVER () AS aid,
            count(*) AS total,
            lgr.log_repository,
            'repository'::text AS tipo
           FROM public.log_detail lgr
          GROUP BY lgr.log_repository
        ), log_detail AS (
         SELECT t.aid,
            t.total,
                CASE
                    WHEN t.log_repository::text IS NULL THEN 'Anónimo'::text
                    ELSE t.log_repository::text
                END AS log_repository,
                CASE
                    WHEN t.log_repository::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_repository::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_repository::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_repository::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_repository::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_repository::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#a5d915"'::text
                END AS marker,
                CASE
                    WHEN t.log_repository::text = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_repository::text = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_repository::text = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_repository::text = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_repository::text = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_repository::text = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#a5d915"'::text
                END AS line,
                CASE
                    WHEN t.log_repository::text IS NULL THEN 'Anónimo'::text
                    ELSE t.log_repository::text
                END AS text
           FROM v_log_detail_log_repository_total t
          ORDER BY (
                CASE
                    WHEN t.log_repository::text = 'viewmap'::text THEN 1
                    WHEN t.log_repository::text = 'popup'::text THEN 2
                    WHEN t.log_repository::text = 'editionSaveFeature'::text THEN 3
                    WHEN t.log_repository::text = 'print'::text THEN 4
                    WHEN t.log_repository::text = 'editionDeleteFeature'::text THEN 5
                    ELSE 0
                END)
        ), agra_log_repository AS (
         SELECT concat('{"customdata": ["nome_repositoryo"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Repositório", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_repository, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
        ), fina AS (
         SELECT concat('Plotly.newPlot(''da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe'', [', alk.valores, '], {"barmode": "stack", "legend": {"orientation": "h"}, "paper_bgcolor": "rgb(255,255,255)", "plot_bgcolor": "rgb(255,255,255)", "showlegend": true, "template": {"data": {"bar": [{"error_x": {"color": "#2a3f5f"}, "error_y": {"color": "#2a3f5f"}, "marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "bar"}], "barpolar": [{"marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "barpolar"}], "carpet": [{"aaxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "baxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "type": "carpet"}], "choropleth": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "choropleth"}], "contour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour"}], "contourcarpet": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "contourcarpet"}], "heatmap": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap"}], "heatmapgl": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl"}], "histogram": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "histogram"}], "histogram2d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d"}], "histogram2dcontour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour"}], "mesh3d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "mesh3d"}], "parcoords": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "parcoords"}], "pie": [{"automargin": true, "type": "pie"}], "scatter": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter"}], "scatter3d": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter3d"}], "scattercarpet": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattercarpet"}], "scattergeo": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergeo"}], "scattergl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergl"}], "scattermapbox": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattermapbox"}], "scatterpolar": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolar"}], "scatterpolargl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolargl"}], "scatterternary": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterternary"}], "surface": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface"}], "table": [{"cells": {"fill": {"color": "#EBF0F8"}, "line": {"color": "white"}}, "header": {"fill": {"color": "#C8D4E3"}, "line": {"color": "white"}}, "type": "table"}]}, "layout": {"annotationdefaults": {"arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1}, "coloraxis": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "colorscale": {"diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]}, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": {"color": "#2a3f5f"}, "geo": {"bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white"}, "hoverlabel": {"align": "left"}, "hovermode": "closest", "mapbox": {"style": "light"}, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": {"angularaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "radialaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "scene": {"xaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "yaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "zaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}}, "shapedefaults": {"line": {"color": "#2a3f5f"}}, "ternary": {"aaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "baxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "caxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "title": {"x": 0.05}, "xaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}, "yaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}}}, "title": {"text": "Estatísticas Geo Portal - ', now()::date, ' | Repositório"}, "xaxis": {"gridcolor": "#bdbfc0","title": {"text": "Repositório"}}, "yaxis": {"gridcolor": "#bdbfc0","title": {"text": "Contagem"}, "type": "linear"}}, {"scrollZoom": true, "editable": true, "responsive": true})') AS data
           FROM agra_log_repository alk
        )
 SELECT fina.data
   FROM fina;

------------------------------------------------------------------

CREATE OR REPLACE VIEW public.v_log_detail_log_user_total_legenda AS
 WITH v_log_detail_log_user_total AS (
         SELECT row_number() OVER () AS aid,
            count(*) AS total,
                CASE
                    WHEN ldu.log_user::text = ''::text THEN 'Anónimo'::text
                    ELSE ldu.log_user::text
                END AS log_user,
            'user'::text AS tipo
           FROM public.log_detail ldu
          GROUP BY ldu.log_user
        ), log_detail AS (
         SELECT t.aid,
            t.total,
                CASE
                    WHEN t.log_user IS NULL THEN 'Anónimo'::text
                    ELSE t.log_user
                END AS log_user,
                CASE
                    WHEN t.log_user = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_user = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_user = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_user = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_user = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_user = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#a5d915"'::text
                END AS marker,
                CASE
                    WHEN t.log_user = 'editionDeleteFeature'::text THEN '"#cc0000"'::text
                    WHEN t.log_user = 'editionSaveFeature'::text THEN '"#1a75ff"'::text
                    WHEN t.log_user = 'popup'::text THEN '"#009900"'::text
                    WHEN t.log_user = 'print'::text THEN '"#e68a00"'::text
                    WHEN t.log_user = 'viewmap'::text THEN '"#cccc00"'::text
                    WHEN t.log_user = 'login'::text THEN '"#99994d"'::text
                    ELSE '"#a5d915"'::text
                END AS line,
                CASE
                    WHEN t.log_user IS NULL THEN 'Anónimo'::text
                    ELSE t.log_user
                END AS text
           FROM v_log_detail_log_user_total t
          WHERE t.total > 1
          ORDER BY t.log_user
        ), agra_log_user AS (
         SELECT concat('{"customdata": ["nome_projecto"], "ids": [', string_agg(l.aid::text, ', '::text), '], "marker": {"color": [', string_agg(l.marker, ', '::text), '], "colorbar": {"len": 0.8}, "colorscale": [[0.0, "rgb(255,255,255)"], [0.125, "rgb(240,240,240)"], [0.25, "rgb(217,217,217)"], [0.375, "rgb(189,189,189)"], [0.5, "rgb(150,150,150)"], [0.625, "rgb(115,115,115)"], [0.75, "rgb(82,82,82)"], [0.875, "rgb(37,37,37)"], [1.0, "rgb(0,0,0)"]], "line": {"color": [', string_agg(l.line, ', '::text), '], "width": 1.0}, "reversescale": false, "showscale": false}, "name": "Utilizador", "opacity": 1.0, "orientation": "v", "text": ["', string_agg(l.text, '", "'::text), '"], "textposition": "auto", "type": "bar", "x": ["', string_agg(l.log_user, '", "'::text), '"], "y": [', string_agg(l.total::text, ', '::text), ']}') AS valores
           FROM log_detail l
        ), fina AS (
         SELECT concat('Plotly.newPlot(''da5d5f96-85e6-4cbe-8251-7bfa4beb5ebe'', [', alk.valores, '], {"barmode": "stack", "legend": {"orientation": "h"}, "paper_bgcolor": "rgb(255,255,255)", "plot_bgcolor": "rgb(255,255,255)", "showlegend": true, "template": {"data": {"bar": [{"error_x": {"color": "#2a3f5f"}, "error_y": {"color": "#2a3f5f"}, "marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "bar"}], "barpolar": [{"marker": {"line": {"color": "#E5ECF6", "width": 0.5}}, "type": "barpolar"}], "carpet": [{"aaxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "baxis": {"endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f"}, "type": "carpet"}], "choropleth": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "choropleth"}], "contour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour"}], "contourcarpet": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "contourcarpet"}], "heatmap": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap"}], "heatmapgl": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl"}], "histogram": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "histogram"}], "histogram2d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d"}], "histogram2dcontour": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour"}], "mesh3d": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "type": "mesh3d"}], "parcoords": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "parcoords"}], "pie": [{"automargin": true, "type": "pie"}], "scatter": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter"}], "scatter3d": [{"line": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatter3d"}], "scattercarpet": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattercarpet"}], "scattergeo": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergeo"}], "scattergl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattergl"}], "scattermapbox": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scattermapbox"}], "scatterpolar": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolar"}], "scatterpolargl": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterpolargl"}], "scatterternary": [{"marker": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "type": "scatterternary"}], "surface": [{"colorbar": {"outlinewidth": 0, "ticks": ""}, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface"}], "table": [{"cells": {"fill": {"color": "#EBF0F8"}, "line": {"color": "white"}}, "header": {"fill": {"color": "#C8D4E3"}, "line": {"color": "white"}}, "type": "table"}]}, "layout": {"annotationdefaults": {"arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1}, "coloraxis": {"colorbar": {"outlinewidth": 0, "ticks": ""}}, "colorscale": {"diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]]}, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": {"color": "#2a3f5f"}, "geo": {"bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white"}, "hoverlabel": {"align": "left"}, "hovermode": "closest", "mapbox": {"style": "light"}, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": {"angularaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "radialaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "scene": {"xaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "yaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}, "zaxis": {"backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white"}}, "shapedefaults": {"line": {"color": "#2a3f5f"}}, "ternary": {"aaxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "baxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}, "bgcolor": "#E5ECF6", "caxis": {"gridcolor": "white", "linecolor": "white", "ticks": ""}}, "title": {"x": 0.05}, "xaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}, "yaxis": {"automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": {"standoff": 15}, "zerolinecolor": "white", "zerolinewidth": 2}}}, "title": {"text": "Estatísticas Geo Portal - ', now()::date, ' | Utilizador"}, "xaxis": {"gridcolor": "#bdbfc0","title": {"text": "Utilizador"}}, "yaxis": {"gridcolor": "#bdbfc0","title": {"text": "Contagem"}, "type": "linear"}}, {"scrollZoom": true, "editable": true, "responsive": true})') AS data
           FROM agra_log_user alk
        )
 SELECT fina.data
   FROM fina;