var lizAttributeTable = function() {

    lizMap.events.on({
        'uicreated':function(evt){

        // Attributes
        var config = lizMap.config;
        var layers = lizMap.layers;
        var hasAttributeTableLayers = false;
        var attributeLayersActive = false;
        var attributeLayerGlued = false;
        var attributeLayerFullsize = false;
        var attributeLayersDic = {};

        if (!('attributeLayers' in config))
          return -1;

        // Lizmap URL
        var service = OpenLayers.Util.urlAppend(lizUrls.wms
            ,OpenLayers.Util.getParameterString(lizUrls.params)
        );

        // Div content interactions
        $('#attribute-table-panel').hover(
          function(){
            showAttributeLayersPanel();
            return false;
          }
          ,
          function(){
            if ( !attributeLayerGlued &&!lizMap.checkMobile())
              hideAttributeLayersPanel();
            return false;
          }
        );

        // Verifying WFS layers
        $.get(service, {
          'SERVICE':'WFS'
          ,'VERSION':'1.0.0'
          ,'REQUEST':'GetCapabilities'
        }, function(xml) {

          var featureTypes = $(xml).find('FeatureType');
          if (featureTypes.length == 0 ){
            //what to deactivate ?
          } else {
            featureTypes.each( function(){
              var self = $(this);
              var lname = self.find('Name').text();
              if (lname in config.attributeLayers) {
                hasAttributeTableLayers = true;
                // Get layers config information
                atConfig = config.attributeLayers[lname];
                atConfig['crs'] = self.find('SRS').text();
                if ( atConfig.crs in Proj4js.defs )
                  new OpenLayers.Projection(atConfig.crs);
                else
                  $.get(service, {
                    'REQUEST':'GetProj4'
                    ,'authid': atConfig.crs
                  }, function ( aText ) {
                    Proj4js.defs[atConfig.crs] = aText;
                    new OpenLayers.Projection(atConfig.crs);
                  }, 'text');
                var bbox = self.find('LatLongBoundingBox');
                atConfig['bbox'] = [
                  parseFloat(bbox.attr('minx'))
                 ,parseFloat(bbox.attr('miny'))
                 ,parseFloat(bbox.attr('maxx'))
                 ,parseFloat(bbox.attr('maxy'))
                ];
                atConfig['title'] = self.find('Title').text();
                addLayerDiv(lname);
                attributeLayersDic[lizMap.cleanName(lname)] = lname;
              }
            });
            if (hasAttributeTableLayers) {

              // Create the vector layer
              var locatelayerSearch = lizMap.map.getLayersByName('locatelayer');
              if (locatelayerSearch.length == 0 ) {
                lizMap.map.addLayer(new OpenLayers.Layer.Vector('locatelayer',{
                  styleMap: new OpenLayers.StyleMap({
                    pointRadius: 6,
                    fill: false,
                    stroke: true,
                    strokeWidth: 3,
                    strokeColor: 'yellow'
                  }),
                  projection: lizMap.map.getProjection()
                }));
              }


              // Bind attribute panel buttons actions
              // Close button
              $('#attribute-table-panel h3').click(function() {
                hideAttributeLayersPanel();
                return false;
              });
              $('#attribute-table-panel .btn-attribute-clear')
              .click(function() {
                deactivateAttributeLayers();
                return false;
              })
              .hover(
                function(){ $(this).addClass('btn-danger'); },
                function(){ $(this).removeClass('btn-danger'); }
              );

              // Pin button
              $('#attribute-table-panel .btn-attribute-glue')
              .click(function() {
                if ( attributeLayerGlued ) {
                  attributeLayerGlued = false;
                  $(this)
                  .removeClass('active')
                  .attr(
                    'title',
                    lizDict['attributeLayers.toolbar.btn.glue.activate.title']
                  )
                  .html(lizDict['attributeLayers.toolbar.btn.glue.activate.title']);
                  hideAttributeLayersPanel();
                }
                else {
                  attributeLayerGlued = true;
                  $(this).addClass('active')
                  .attr(
                    'title',
                    lizDict['attributeLayers.toolbar.btn.glue.deactivate.title']
                  )
                  .html(lizDict['attributeLayers.toolbar.btn.glue.glued.title']);
                }
                return false;
              })
              .hover(
                function(){
                  if( attributeLayerGlued ){
                    $(this)
                    .removeClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.glue.deactivate.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.glue.deactivate.title']);
                  }
                  else{
                    $(this)
                    .addClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.glue.activate.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.glue.activate.title']);
                  }
                },
                function(){
                  if (attributeLayerGlued ){
                    $(this)
                    .addClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.glue.deactivate.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.glue.deactivate.title']);
                  }
                  else{
                    $(this)
                    .removeClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.glue.activate.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.glue.activate.title']);
                  }
                }
              );

              // Size button
              $('#attribute-table-panel .btn-attribute-size')
              .click(function() {
                if ( attributeLayerFullsize ) {
                  attributeLayerFullsize = false;
                  $(this)
                  .removeClass('active')
                  .attr(
                    'title',
                    lizDict['attributeLayers.toolbar.btn.size.maximize.title']
                  )
                  .html(lizDict['attributeLayers.toolbar.btn.size.maximize.title']);
                  $('#attribute-table-panel').removeClass('fullsize');
                }
                else {
                  attributeLayerFullsize = true;
                  $(this).addClass('active')
                  .attr(
                    'title',
                    lizDict['attributeLayers.toolbar.btn.size.minimize.title']
                  )
                  .html(lizDict['attributeLayers.toolbar.btn.size.minimize.title']);
                  $('#attribute-table-panel').addClass('fullsize');
                }
                return false;
              })
              .hover(
                function(){
                  if( attributeLayerFullsize ){
                    $(this)
                    .removeClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.size.minimize.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.size.minimize.title']);
                  }
                  else{
                    $(this)
                    .addClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.size.maximize.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.size.maximize.title']);
                  }
                },
                function(){
                  if (attributeLayerFullsize ){
                    $(this)
                    .addClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.size.minimize.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.size.minimize.title']);
                  }
                  else{
                    $(this)
                    .removeClass('btn-primary')
                    .attr('title', lizDict['attributeLayers.toolbar.btn.size.maximize.title'])
                    .html(lizDict['attributeLayers.toolbar.btn.size.maximize.title']);
                  }
                }
              );


              // Bind click on refresh buttons
              $('button.btn-refresh-attributeTable')
              .click(function(){
                var lname = attributeLayersDic[$(this).val()];
                getAttributeTableFeature(lname);
                return false;
              })
              .hover(
                function(){ $(this).addClass('btn-primary'); },
                function(){ $(this).removeClass('btn-primary'); }
              );

              // Bind click on show/hide buttons
              $('button.btn-toggle-attributeTable').click(function(){
                var aName = $(this).val();
                var aTable = '#attributeLayers-'+lizMap.cleanName(aName)+' table';
                if ( config.attributeLayers[aName]['tableDisplayed'] ){
                  $(aTable).hide();
                  config.attributeLayers[aName]['tableDisplayed'] = false;
                  $(this).text(lizDict['attributeLayers.toolbar.btn.data.show.title']);
                } else {
                  $(aTable).show();
                  config.attributeLayers[aName]['tableDisplayed'] = true;
                  $(this).text(lizDict['attributeLayers.toolbar.btn.data.hide.title']);
                }
              })
              .hover(
                function(){ $(this).addClass('btn-primary'); },
                function(){ $(this).removeClass('btn-primary'); }
              );

            } else {
              // Hide navbar menu
              $('#auth li.attributeLayers').hide();
              return -1;
            }
          }
        } );

        $('#toggleAttributeLayers').click(function(){
            if (attributeLayersActive){
                deactivateAttributeLayers();
                return false;
            }else{
                activateAttributeLayers();
                return false;
            }
        });

        function activateAttributeLayers() {
          $('#toggleAttributeLayers').parent().addClass('active');

          // Show attribute panel title
          $('#attribute-table-panel').show();
          // Open attribute panel
          showAttributeLayersPanel();
          attributeLayersActive = true;

          // Deactivate locate-menu
          if ( $('#locate-menu').is(':visible') && lizMap.checkMobile()){
            $('#toggleLocate').parent().removeClass('active');
            $('#locate-menu').toggle();
            lizMap.updateSwitcherSize();
          }
          return false;
        }

        function deactivateAttributeLayers() {
          $('#toggleAttributeLayers').parent().removeClass('active');
          hideAttributeLayersPanel();
          $('#attribute-table-panel').hide();
          attributeLayersActive = false;
          var locatelayerSearch = lizMap.map.getLayersByName('locatelayer');
          if ( locatelayerSearch.length > 0 ) {
            locatelayerSearch[0].destroyFeatures();
          }
          return false;
        }

        function showAttributeLayersPanel(){
          $('#attribute-table-panel').addClass('visible');
          return false;
        }
        function hideAttributeLayersPanel(){
          $('#attribute-table-panel').removeClass('visible');
          return false;
        }


        function addLayerDiv(lname) {
          atConfig = config.attributeLayers[lname];
          var layerName = lizMap.cleanName(lname);
          var html = '<div id="attributeLayers-'+layerName+'" class="attributeLayers-layer-div" style="">';
          html+= '<h4>'+atConfig['title'];
          html+= '&nbsp;&nbsp;<button class="btn-refresh-attributeTable btn btn-mini" value="' + layerName + '">'+lizDict['attributeLayers.toolbar.btn.data.refresh.title']+'</button>';
          html+= '&nbsp;<button class="btn-toggle-attributeTable btn btn-mini"  value="' + layerName + '"style="display:none;">'+lizDict['attributeLayers.toolbar.btn.data.hide.title']+'</button>';
          html+= '</h4>';
          html+= '<span class="attribute-layer-msg"></span>';
          html+= '<table class="attribute-table-table table table-hover table-condensed"></table>';
          html+= '</div>';
          $('#attribute-table-container').append(html);
        }

        function getAttributeTableFeature(aName) {
          var dataLength = 0;

          $('button.btn-toggle-attributeTable[value="'+lizMap.cleanName(aName)+'"]')
          .text(lizDict['attributeLayers.toolbar.btn.data.hide.title'])
          .hide();
          config.attributeLayers[aName]['tableDisplayed'] = false;

          $('body').css('cursor', 'wait');

          // Build WFS request parameters
          var atConfig = config.attributeLayers[aName];
          var typeName = aName.replace(' ','_');
          var layerName = lizMap.cleanName(aName);
          var extent = lizMap.map.getExtent();
          var proj = new OpenLayers.Projection(atConfig.crs);
          var bbox = lizMap.map.getExtent().transform(lizMap.map.getProjection(), proj).toBBOX();
          var wfsOptions = {
            'SERVICE':'WFS'
           ,'VERSION':'1.0.0'
           ,'REQUEST':'GetFeature'
           ,'TYPENAME':typeName
           ,'OUTPUTFORMAT':'GeoJSON'
           ,'BBOX': bbox
           ,'MAXFEATURES': 100
          };
          // Query the server
          var service = OpenLayers.Util.urlAppend(lizUrls.wms
              ,OpenLayers.Util.getParameterString(lizUrls.params)
          );
          $.get(service
              ,wfsOptions
              ,function(data) {

            // Get features and build attribute table content
            var lConfig = config.layers[aName];
            atConfig['features'] = {};
            var features = data.features;
            dataLength = features.length;
            var html = '';
            if (dataLength > 0) {
              config.attributeLayers[aName]['features'] = features;
              html+= '<tr>';
              for (var idx in features[0].properties){
                html+='<th>' + idx + '</th>';
              }
              html+='<th></th>';
              html+='</tr>';
              for (var fid in features) {
                html+='<tr>';
                var feat = features[fid];
                for (var idx in feat.properties){
                  var prop = feat.properties[idx];
                  html+='<td>' + prop + '</td>';
                }
                html+='<td><input type="hidden" value="'+fid+'"></td>';
                html+='</tr>';
              }
              var aTable = '#attributeLayers-'+lizMap.cleanName(aName)+' table';
              $(aTable).html(html);

              // Zoom to selected feature on tr click
              $(aTable +' tr').click(function() {
                $(aTable + ' tr').removeClass('success');
                $(this).addClass('success');

                // Add the feature to the layer
                var layer = lizMap.map.getLayersByName('locatelayer')[0];
                layer.destroyFeatures();
                var featId = $(this).find('input').val();
                var feat = config.attributeLayers[aName]['features'][featId];
                var format = new OpenLayers.Format.GeoJSON();
                feat = format.read(feat)[0];
                var proj = new OpenLayers.Projection(config.attributeLayers[aName].crs);
                feat.geometry.transform(proj, lizMap.map.getProjection());
                layer.addFeatures([feat]);

                // Zoom to selected feature
                //lizMap.map.zoomToExtent(feat.geometry.getBounds());
                lizMap.map.setCenter(feat.geometry.getBounds().getCenterLonLat())
              });
            }

            if ( dataLength == 0 ){

              $('#attributeLayers-'+lizMap.cleanName(aName)+' span.attribute-layer-msg').html(
                lizDict['attributeLayers.toolbar.msg.data.nodata'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
              ).addClass('failure');

            } else {
              config.attributeLayers[aName]['tableDisplayed'] = true;
              $(aTable).show();

              // Information message
              $('#attributeLayers-'+lizMap.cleanName(aName)+' span.attribute-layer-msg').html(
                dataLength +' '+ lizDict['attributeLayers.toolbar.msg.data.lines'] + ' ' + lizDict['attributeLayers.toolbar.msg.data.extent']
              ).addClass('success');

              // Display the hide/show button
              $('button.btn-toggle-attributeTable[value="'+lizMap.cleanName(aName)+'"]')
              .show();



            }
          });

          $('body').css('cursor', 'auto');
          return false;
        }


      } // uicreated
    });


}();
