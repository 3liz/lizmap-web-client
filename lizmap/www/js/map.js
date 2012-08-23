/**
* Class: lizMap
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

 
var lizMap = function() {
  /**
   * PRIVATE Property: config
   * {object} The map config
   */
  var config = null;
  /**
   * PRIVATE Property: capabilities
   * {object} The wms capabilities
   */
  var capabilities = null;
  /**
   * PRIVATE Property: map
   * {<OpenLayers.Map>} The map
   */
  var map = null;
  /**
   * PRIVATE Property: baselayers
   * {Array(<OpenLayers.Layer>)} Ordered list of base layers
   */
  var baselayers = [];
  /**
   * PRIVATE Property: layers
   * {Array(<OpenLayers.Layer>)} Ordered list of layers
   */
  var layers = [];
  /**
   * PRIVATE Property: tree
   * {object} The layer's tree
   */
  var tree = {config:{type:'group'}};
 
  /**
   * PRIVATE function: updateContentSize
   * update the content size
   */
 function updateContentSize(){
   var h = $('body').parent()[0].clientHeight-$('#header').height();
   $('#menu').height(h);
   $('#map').height(h);
   var w = $('body').parent()[0].offsetWidth;
   if ($('#menu').is(':hidden')) {
     $('#map-content').css('margin-left',0);
   } else {
     w -= $('#menu').width();
     $('#map-content').css('margin-left',$('#menu').width());
   }
   $('#map').width(w);

    updateMapSize();
  }
 
  /**
   * PRIVATE function: updateMapSize
   * update the map size
   */
 function updateMapSize(){
    var center = map.getCenter();
    map.updateSize();
    map.setCenter(center);
    map.baseLayer.redraw();

    if ($('#navbar').height()+150 > $('#map').height())
      $('#navbar .slider').hide();
    else
      $('#navbar .slider').show();

    updateSwitcherSize();
  }
  
  /**
   * PRIVATE function: updateSwitcherSize
   * update the switcher size
   */
  function updateSwitcherSize(){
    /*
    switcherMaxHeight = $('body').parent()[0].clientHeight - $('#header').height() - 20 - $('#switcherContainer').outerHeight() + $('#switcher').outerHeight();
    $('#switcher').css('height','auto').css('overflow','visible');
    if ($('#switcher').outerHeight() > switcherMaxHeight)
      $('#switcher').height(switcherMaxHeight).css('overflow','auto');
      */
    var h = $('body').parent()[0].clientHeight-$('#header').height();
    $('#menu').height(h);
    //var h = $('#menu').height();
    h -= $('#close-menu').outerHeight(true);
    h -= $('#toolbar').outerHeight(true);
    h -= $('#zoom-menu').outerHeight(true);
    h -= $('#baselayer-menu').outerHeight(true);
    h -= $('#switcher-menu').children().first().outerHeight(true);

    var sw = $('#switcher');
    h -= parseInt(sw.css('margin-top'));
    h -= parseInt(sw.css('margin-bottom'));
    h -= parseInt(sw.css('padding-top'));
    h -= parseInt(sw.css('padding-bottom'));
    h -= parseInt(sw.css('border-top-width'));
    h -= parseInt(sw.css('border-bottom-width'));

    var swp = sw.parent();
    h -= parseInt(swp.css('padding-top'));
    h -= parseInt(swp.css('padding-bottom'));

    $('#switcher').height(h);
  }

  /**
   * PRIVATE function: getLayerScale
   * get the layer scales based on children layer
   *
   * Parameters:
   * nested - {Object} a capability layer
   * minScale - {Float} the nested min scale
   * maxScale - {Float} the nested max scale
   *
   * Dependencies: 
   * config
   *
   * Returns:
   * {Object} the min and max scales
   */
  function getLayerScale(nested,minScale,maxScale) {
    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var layer = nested.nestedLayers[i];
      var layerConfig = config.layers[layer.name];
      if (layer.nestedLayers.length != 0)
         return getLayerScale(layer,minScale,maxScale);
      if (layerConfig) {
        if (minScale == null)
          minScale=layerConfig.minScale;
        else if (layerConfig.minScale<minScale)
          minScale=layerConfig.minScale;
        if (maxScale == null)
          maxScale=layerConfig.maxScale;
        else if (layerConfig.maxScale>maxScale)
          maxScale=layerConfig.maxScale;
      }
    }
    return {minScale:minScale,maxScale:maxScale};
  }

  /**
   * PRIVATE function: getLayerTree
   * get the layer tree
   * create OpenLayers WMS base or not layer {<OpenLayers.Layer.WMS>}
   * push these layers in layers or baselayers
   *
   * Parameters:
   * nested - {Object} a capability layer
   * pNode - {Object} the nested tree node
   * 
   * Dependencies:
   * config
   * layers
   * baselayers
   */
  function getLayerTree(nested,pNode) {
    pNode.children = [];
    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var layer = nested.nestedLayers[i];
      var layerConfig = config.layers[layer.name];
      var layerName = layer.name.replace(' ','_');

      // if the layer is not the Overview and had a config
      // creating the {<OpenLayers.Layer.WMS>} and the tree node
      if (layer.name!='Overview' && layerConfig) {
        var node = {name:layerName,config:layerConfig,parent:pNode};
        var service = wmsServerURL;
        if (layerConfig.cached == 'True')
          service = cacheServerURL;
        if (layerConfig.baseLayer == 'True') {
        // creating the base layer
          baselayers.push(new OpenLayers.Layer.WMS(layerName,service
              ,{layers:layer.name,version:'1.3.0',exceptions:'application/vnd.ogc.se_inimage',format:'image/png',transparent:true,dpi:96}
              ,{isBaseLayer:true
               ,gutter:(layerConfig.cached == 'True') ? 0 : 5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
              }));
        
        }
        else if (layerConfig.type == 'layer' && layer.nestedLayers.length != 0) {
        // creating the layer because it's a layer and has children
          var minScale = layerConfig.minScale;
          var maxScale = layerConfig.maxScale;
          // get the layer scale beccause, it has children
          var scales = getLayerScale(layer,null,null);
          layers.push(new OpenLayers.Layer.WMS(layerName,service
              ,{layers:layer.name,version:'1.3.0',exceptions:'application/vnd.ogc.se_inimage',format:'image/png',transparent:true,dpi:96}
              ,{isBaseLayer:false
               ,minScale:scales.maxScale
               ,maxScale:scales.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
              }));
        }
        else if (layerConfig.type == 'layer') {
        // creating the layer because it's a layer and has no children
          layers.push(new OpenLayers.Layer.WMS(layerName,service
              ,{layers:layer.name,version:'1.3.0',exceptions:'application/vnd.ogc.se_inimage',format:'image/png',transparent:true,dpi:96}
              ,{isBaseLayer:false
               ,minScale:layerConfig.maxScale
               ,maxScale:layerConfig.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
              }));
        }
        // creating the layer tre because it's a group, has children and is not a base layer
        if (layerConfig.type == 'group' && layer.nestedLayers.length != 0 && layerConfig.baseLayer == 'False')
          getLayerTree(layer,node);
        if (layerConfig.baseLayer != 'True')
          pNode.children.push(node);
      } else if (layer.name == 'Overview'){
        config.options.hasOverview = true;
      }
    }
  }

  /**
   * PRIVATE function: analyseNode
   * analyse Node Config
   * define if the node has to be a child of his parent node
   * 
   * Parameters:
   * aNode - {Object} a node config
   *
   * Returns:
   * {Boolean} maintains the node in the tree
   */
  function analyseNode(aNode) {
    var nodeConfig = aNode.config;
    if (nodeConfig.type == 'layer' && nodeConfig.baseLayer != 'True')
      return true;
    else if (nodeConfig.type == 'layer')
      return false;

    if (!('children' in aNode))
      return false;
    var children = aNode.children;
    var result = false;
    var removeIdx = [];
    for (var i=0, len=children.length; i<len; i++) {
      var child = children[i];
      var analyse = analyseNode(child);
      if (!analyse)
        removeIdx.push(i);
      result = (result || analyse);
    }
    removeIdx.reverse();
    for (var i=0, len=removeIdx.length; i<len; i++) {
      children.splice(removeIdx[i],1);
    }
    return result;
  }

  /**
   * PRIVATE function: getSwitcherNode
   * get the html of a config node for the switcher
   *
   * Parameters:
   * aNode - {Object} a config node
   *
   * Returns:
   * {String} the <ul> html corresponding to the node
   */
  function getSwitcherNode(aNode,aLevel) {
    var html = '';
    if (aLevel == 0)
      html += '<table id="switcher-tree">';

    var children = aNode.children;
    for (var i=0, len=children.length; i<len; i++) {
      var child = children[i];
      var childConfig = child.config;
      html += '<tr id="'+childConfig.type+'-'+child.name+'"';
      html += ' class="liz-'+childConfig.type;
      if (aLevel != 0)
        html += ' child-of-group-'+aNode.name;
      if (('children' in child) && child['children'].length!=0)
        html += ' expanded parent';
      html += '">'

      html += '<td><button class="checkbox" name="'+childConfig.type+'" value="'+child.name+'" title="'+dictionary['tree.button.checkbox']+'"></button>';
      html += '<span class="label" title="'+childConfig.abstract+'">'+childConfig.title+'</span></td>';

      var legendLink = '';
      if (childConfig.link)
        legendLink = childConfig.link;
      if (legendLink != '' )        
        html += '<td><button class="link" name="link" title="'+dictionary['tree.button.link']+'" value="'+legendLink+'"/></td>';
      else
        html += '<td></td>';

      html += '</tr>';

      if (childConfig.type == 'layer') {
        var legendParams = {SERVICE: "WMS",
                      VERSION: "1.3.0",
                      REQUEST: "GetLegendGraphics",
                      LAYERS: child.name,
                      EXCEPTIONS: "application/vnd.ogc.se_inimage",
                      FORMAT: "image/png",
                      TRANSPARENT: "TRUE",
                      WIDTH: 150,
                      DPI: 72};
          var legendParamsString = OpenLayers.Util.getParameterString(legendParams);
          var url = OpenLayers.Util.urlAppend(wmsServerURL, legendParamsString);

          html += '<tr id="legend-'+child.name+'" class="child-of-layer-'+child.name+'">';
          html += '<td colspan="2"><div class="legendGraphics"><img src="'+url+'"/></div></td>';
          html += '</tr>';
      }

      if (('children' in child) && child['children'].length!=0)
        html += getSwitcherNode(child, aLevel+1);
    }

    if (aLevel == 0)
      html += '</table>';
    return html;
  }

  /**
   * PRIVATE function: createMap
   * creating the map {<OpenLayers.Map>}
   */
  function createMap() {
    // get and define projection
    var proj = config.options.projection;
    Proj4js.defs[proj.ref]=proj.proj4;
    var projection = new OpenLayers.Projection(proj.ref);

    // get and define the max extent
    var bbox = config.options.bbox;
    var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));

    $('#map').height($('body').parent()[0].clientHeight-$('#header').height());
    var res = extent.getHeight()/$('#map').height();

    var scales = config.options.mapScales;
    scales.sort();

    // creating the map
    map = new OpenLayers.Map('map'
      ,{controls:[new OpenLayers.Control.Navigation(),new OpenLayers.Control.ZoomBox({alwaysZoom:true})]
       ,eventListeners:{
         zoomend: function(evt){
  // private treeTable
  var options = {
    childPrefix : "child-of-"
  };

  function childrenOf(node) {
    return $(node).siblings("tr." + options.childPrefix + node[0].id);
  };

  function descendantsOf(node) {
    var descendants = [];
    var children = [];
    if (node && node[0])
      children = childrenOf(node);
    for (var i=0, len=children.length; i<len; i++) {
      descendants.push(children[i]);
      descendants = descendants.concat(descendantsOf([children[i]]));
    }
    return descendants;
  };

  function parentOf(node) {
    var classNames = node[0].className.split(' ');

    for(var key=0; key<classNames.length; key++) {
      if(classNames[key].match(options.childPrefix)) {
        return $(node).siblings("#" + classNames[key].substring(options.childPrefix.length));
      }
    }

    return null;
  };

  function ancestorsOf(node) {
    var ancestors = [];
    while(node = parentOf(node)) {
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };
           //layer visibility
           for (var i=0,len=layers.length; i<len; i++) {
             var layer = layers[i];
             var b = $('#switcher button[name="layer"][value="'+layer.name+'"]').first();
             if (layer.inRange && b.button('option','disabled')) {
               var tr = b.parents('tr').first();
               tr.removeClass('liz-state-disabled').find('button').button('enable');
               var ancestors = ancestorsOf(tr);
               $.each(ancestors,function(i,a) {
                 $(a).removeClass('liz-state-disabled').find('button').button('enable');
               });
               if (tr.find('button[name="layer"]').button('option','icons').primary == 'liz-icon-check')
                 layer.setVisibility(true);
             } else if (!layer.inRange && !b.button('option','disabled')) {
               var tr = b.parents('tr').first();
               tr.addClass('liz-state-disabled').find('button').first().button('disable');
               if (tr.hasClass('liz-layer'))
                 tr.collapse();
               var ancestors = ancestorsOf(tr);
               $.each(ancestors,function(i,a) {
        a = $(a);
        var count = 0;
        var checked = 0;
        var aDesc = childrenOf(a);
        $.each(aDesc,function(j,trd) {
          $(trd).find('button.checkbox').each(function(i,b){
            if ($(b).button('option','disabled'))
              checked++;
            count++;
          });
        });
                 if (count == checked)
                   a.addClass('liz-state-disabled').find('button').first().button('disable');
                 else
                   a.removeClass('liz-state-disabled').find('button').button('enable');
               });
             }
           }
		   
	
           //slider
           $('#navbar div.slider').slider("value",this.getZoom());
           
           //pan button
           $('#navbar button.pan').click();

           updateSwitcherSize();
           
//           alert('scale = ' + map.getScale() + '\nresolution=' + map.getResolution());
         }
        }
		
       ,maxExtent:extent
       ,maxScale: scales.length == 0 ? config.options.minScale : "auto"
       ,minScale: scales.length == 0 ? config.options.maxScale : "auto"
       ,numZoomLevels: scales.length == 0 ? config.options.zoomLevelNumber : scales.length
       ,scales: scales.length == 0 ? null : scales
       ,projection:projection
       ,units:projection.proj.units
       ,allOverlays:(baselayers.length == 0)
    });
    map.addControl(new OpenLayers.Control.Attribution());
	
    // add handler to update the map size
    $(window).resize(function() {
      updateContentSize();
    });
  }

  /**
   * PRIVATE function: createSwitcher
   * create the layer switcher
   */
  function createSwitcher() {
    // set the switcher content
    $('#switcher').html(getSwitcherNode(tree,0));
    $('#switcher-tree').treeTable({
      onNodeShow: function() {
        //updateSwitcherSize();
      },
      onNodeHide: function() {
        //updateSwitcherSize();
      }
    });
    $('#close-menu .ui-icon-close-menu').click(function(){
      $('#menu').hide();
      $('#content .ui-icon-open-menu').show();
      updateContentSize();
    });
    $('#content .ui-icon-open-menu').click(function(){
      $('#menu').show();
      $(this).hide();
      updateContentSize();
    });

    
  // === Private functions
  var options = {
    childPrefix : "child-of-"
  };

  function childrenOf(node) {
    return $(node).siblings("tr." + options.childPrefix + node[0].id);
  };

  function descendantsOf(node) {
    var descendants = [];
    var children = [];
    if (node && node[0])
      children = childrenOf(node);
    for (var i=0, len=children.length; i<len; i++) {
      descendants.push(children[i]);
      descendants = descendants.concat(descendantsOf([children[i]]));
    }
    return descendants;
  };

  function parentOf(node) {
    var classNames = node[0].className.split(' ');

    for(var key=0; key<classNames.length; key++) {
      if(classNames[key].match(options.childPrefix)) {
        return $(node).siblings("#" + classNames[key].substring(options.childPrefix.length));
      }
    }

    return null;
  };

  function ancestorsOf(node) {
    var ancestors = [];
    while(node = parentOf(node)) {
      ancestors[ancestors.length] = node[0];
    }
    return ancestors;
  };

    // activate checkbox buttons
    $('#switcher button.checkbox').button({
      icons:{primary:'liz-icon-check'},
      text:false
    })
	  .removeClass( "ui-corner-all" )
    .click(function(){
      var self = $(this);
      if (self.attr('aria-disabled')=='true')
        return false;
      var icons = self.button('option','icons');
      var descendants = [self.parents('tr').first()];
      descendants = descendants.concat(descendantsOf($(descendants[0])));
      if (icons.primary != 'liz-icon-check') {
        $.each(descendants,function(i,tr) {
          $(tr).find('button.checkbox').button('option','icons',{primary:'liz-icon-check'});
          $(tr).find('button.checkbox[name="layer"]').each(function(i,b){
            var name = $(b).val();
            var layer = map.getLayersByName(name)[0];
            layer.setVisibility(true);
          });
        });
      } else {
        $.each(descendants,function(i,tr) {
          $(tr).find('button.checkbox').button('option','icons',{primary:''});
          $(tr).find('button.checkbox[name="layer"]').each(function(i,b){
            var name = $(b).val();
            var layer = map.getLayersByName(name)[0];
            layer.setVisibility(false);
          });
        });
        self.button('option','icons',{primary:''});
      }
      var ancestors = ancestorsOf(self.parents('tr').first());
      $.each(ancestors,function(i,tr) {
        tr = $(tr);
        var count = 0;
        var checked = 0;
        var pchecked = 0;
        var trDesc = childrenOf(tr);
        $.each(trDesc,function(j,trd) {
          $(trd).find('button.checkbox').each(function(i,b){
            var icons = $(b).button('option','icons');
            if (icons.primary == 'liz-icon-check')
              checked++;
            else if (icons.primary == 'liz-icon-partial-check')
              pchecked++;
            count++;
          });
        });
        var trButt = tr.find('button.checkbox');
        if (count==checked)
          trButt.button('option','icons',{primary:'liz-icon-check'});
        else if (checked==0 && pchecked==0)
          trButt.button('option','icons',{primary:''});
        else
          trButt.button('option','icons',{primary:'liz-icon-partial-check'});
      });
    });

    // activate link buttons
    $('#switcher button.link').button({
      icons:{primary:'liz-icon-info'},
      text:false
    })
	  .removeClass( "ui-corner-all" )
    .click(function(){
      var self = $(this);
      if (self.attr('aria-disabled')=='true')
        return false;
      window.open(self.val());
    });

    // activate the close button
    $('#switcherContainer .ui-dialog-titlebar-close').button({
      text:false,
      icons:{primary: "ui-icon-closethick"}
    }).click(function(){
      $('#toolbar button.switcher').button('option','icons',{primary:'liz-icon-switcher-collapsed'});
      $('#switcherContainer').toggle();
      return false;
    });

    var projection = map.projection;

    // get the baselayer select content
    // and adding baselayers to the map
    //var select = '<select class="baselayers">';
    var select = [];
    baselayers.reverse();
    for (var i=0,len=baselayers.length; i<len; i++) {
      var baselayer = baselayers[i]
      baselayer.units = projection.proj.units;
      map.addLayer(baselayer);
      var blConfig = config.layers[baselayer.name];
      /*
      if (blConfig)
        select += '<option value="'+blConfig.name+'">'+blConfig.title+'</option>';
      else
        select += '<option value="'+baselayer.name+'">'+baselayer.name+'</option>';
        */
      if (blConfig)
        select.push('<input type="radio" name="baselayers" value="'+blConfig.name+'">'+blConfig.title+'</input>');
      else
        select.push('<input type="radio" name="baselayers" value="'+baselayer.name+'">'+baselayer.name+'</input>');
    }
    //select += '</select>';
    select = select.join('<br/>');

    if (baselayers.length!=0) {
      // active the select element for baselayers
      $('#baselayer-select-input').append(select);
      $('#baselayer-select-input input').change(function(){
        var val = $(this).val();
        map.setBaseLayer(map.getLayersByName(val)[0]);
        if (val in config.layers)
          $('#baselayer-select .label').html(config.layers[val].title);
        else
          $('#baselayer-select .label').html(val);
      }).first().attr('checked','true').change();
      $('#baselayer-select .button')
      .attr( "tabIndex", -1 )
      .button({
			   icons: {
				   primary: "ui-icon-triangle-1-e"
				 },
				 text: false
			})
			.removeClass( "ui-corner-all" )
			.addClass( "ui-autocomplete-button ui-button-icon" )
      .click(function() {
        var self = $(this);
        var icons = self.button('option','icons');
        if (icons.primary == 'ui-icon-triangle-1-e')
          self.button('option','icons',{primary:'ui-icon-triangle-1-w'});
        else
          self.button('option','icons',{primary:'ui-icon-triangle-1-e'});
        $('#baselayer-select-input').toggle();
      });
    } else {
      // hide elements for baselayers
      //$('#baselayerContainer').hide().prev().hide();
      $('#baselayer-menu').hide();
      map.addLayer(new OpenLayers.Layer.Vector('baselayer',{
        maxExtent:map.maxExtent
       ,maxScale: map.maxScale
       ,minScale: map.minScale
       ,numZoomLevels: map.numZoomLevels
       ,scales: map.scales
       ,projection: map.projection
       ,units: map.projection.proj.units
      }));
    }

    // adding layers to the map
    layers.reverse();
    for (var i=0,len=layers.length; i<len; i++) {
      var l = layers[i];
      l.units = projection.proj.units;
      map.addLayer(l);
      if (!l.isVisible)
        $('#switcher button.checkbox[name="layer"][value="'+l.name+'"]').click();
    }

    $('#switcherContainer').toggle();
  }

  /**
   * PRIVATE function: createOverview
   * create the overview
   */
  function createOverview() {
    var ovLayer = new OpenLayers.Layer.WMS('overview',wmsServerURL
              ,{layers:'Overview',version:'1.3.0',exceptions:'application/vnd.ogc.se_inimage',format:'image/png',transparent:true,dpi:96}
              ,{isBaseLayer:true
               ,gutter:5
               ,buffer:0
              });

    if (config.options.hasOverview) {
      // get and define the max extent
      var bbox = config.options.bbox;
      var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
      var res = extent.getHeight()/90;
      var resW = extent.getWidth()/180;
      if (res <= resW)
        res = resW;

      map.addControl(new OpenLayers.Control.OverviewMap(
        {div: document.getElementById("overviewmap"),
         size : new OpenLayers.Size(220, 110),
         mapOptions:{maxExtent:map.maxExtent
                  ,maxResolution:"auto"
                  ,minResolution:"auto"
        //mieux calculé le coef 64 pour units == "m" et 8 sinon ???
                  //,scales: map.scales == null ? [map.minScale*64] : [Math.max.apply(Math,map.scales)*8]
                  ,scales: [OpenLayers.Util.getScaleFromResolution(res, map.projection.proj.units)]
                  ,projection:map.projection
                  ,units:map.projection.proj.units
                  ,layers:[ovLayer]
                  ,singleTile:true
                  }
        }
      ));
    } else {
      $('#overviewmap').hide();
      $('#overview-bar button').hide();
    }

    /*
    $('#overviewmap .ui-dialog-titlebar-close').button({
      text:false,
      icons:{primary: "ui-icon-closethick"}
    }).click(function(){
      $('#overviewmap').toggle();
      return false;
    });
    */
    $('#overview-bar .button').button({
      text:false,
      icons:{primary: "ui-icon-triangle-1-n"}
    })
	  .removeClass( "ui-corner-all" )
    .click(function(){
      var self = $(this);
      var icons = self.button('option','icons');
      if (icons.primary == 'ui-icon-triangle-1-n')
        self.button('option','icons',{primary:'ui-icon-triangle-1-s'});
      else
        self.button('option','icons',{primary:'ui-icon-triangle-1-n'});
      $('#overviewmap').toggle();
      return false;
    });

    map.addControl(new OpenLayers.Control.Scale(document.getElementById('scaletext')));
    map.addControl(new OpenLayers.Control.ScaleLine({div:document.getElementById('scaleline')}));

    if (config.options.hasOverview)
      $('#overviewmap').toggle();
    else
      $('#toolbar button.overview').hide();
  }

  /**
   * PRIVATE function: createNavbar
   * create the navigation bar (zoom, scales, etc)
   */
  function createNavbar() {
    $('#navbar div.slider').height(Math.max(50,map.numZoomLevels*5)).slider({
      orientation:'vertical',
      min: 0,
      max: map.numZoomLevels-1,
      change: function(evt,ui) {
        if (ui.value > map.baseLayer.numZoomLevels-1) {
          $('#navbar div.slider').slider('value',map.getZoom())
          $('#zoom-in-max-msg').show('slide', {}, 500, function() {
            window.setTimeout(function(){$('#zoom-in-max-msg').hide('slide', {}, 500)},1000)
          });
        } else
          map.zoomTo(ui.value);
      }
    });
    $('#navbar button.pan').button({
      text:false,
      icons:{primary: "ui-icon-pan"}
    }).removeClass("ui-corner-all")
    .click(function(){
      var self = $(this);
      if (self.hasClass('ui-state-select'))
        return false;
      $('#navbar button.zoom').removeClass('ui-state-select');
      self.addClass('ui-state-select');
      map.getControlsByClass('OpenLayers.Control.ZoomBox')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.Navigation')[0].activate();
    });
    $('#navbar button.zoom').button({
      text:false,
      icons:{primary: "ui-icon-zoom"}
    }).removeClass("ui-corner-all")
    .click(function(){
      var self = $(this);
      if (self.hasClass('ui-state-select'))
        return false;
      $('#navbar button.pan').removeClass('ui-state-select');
      self.addClass('ui-state-select');
      map.getControlsByClass('OpenLayers.Control.Navigation')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.ZoomBox')[0].activate();
    });
    $('#navbar button.zoom-extent').button({
      text:false,
      icons:{primary: "ui-icon-zoom-extent"}
    }).removeClass("ui-corner-all")
    .click(function(){
      map.zoomToExtent(map.maxExtent);
    });
    $('#navbar button.zoom-in').button({
      text:false,
      icons:{primary: "ui-icon-zoom-in"}
    }).removeClass("ui-corner-all")
    .click(function(){
      if (map.getZoom() == map.baseLayer.numZoomLevels-1)
        $('#zoom-in-max-msg').show('slide', {}, 500, function() {
          window.setTimeout(function(){$('#zoom-in-max-msg').hide('slide', {}, 500)},1000)
        });
      else
        map.zoomIn();
    });
    $('#navbar button.zoom-out').button({
      text:false,
      icons:{primary: "ui-icon-zoom-out"}
    }).removeClass("ui-corner-all")
    .click(function(){
      map.zoomOut();
    });
  }

  /**
   * PRIVATE function: createToolbar
   * create the tool bar (collapse overview and switcher, etc)
   */
  function createToolbar() {
    $('#toolbar button.switcher').button({
      text:false,
      icons:{primary: "liz-icon-switcher-open"}
    }).click(function(){
      var self = $(this);
      var icons = self.button('option','icons');
      if (icons.primary == 'liz-icon-switcher-open') {
        self.button('option','icons',{primary:'liz-icon-switcher-collapsed'});
        $('#switcherContainer').toggle();
      } else {
        self.button('option','icons',{primary:'liz-icon-switcher-open'});
        $('#switcherContainer').toggle();
      }
      return false;
    });
    $('#toolbar button.overview').button({
      text:false,
      icons:{primary: "liz-icon-overview"}
    }).click(function(){
      $('#overviewmap').toggle();
      return false;
    });
    /*
    $('#toolbar button.print').button({
      text:false,
      icons:{primary: "ui-icon-print"}
    }).click(function(){
      var composer = composers[0];
      var url = wmsServerURL+'&SERVICE=WMS';
      //url += '&VERSION='+capabilities.version+'&REQUEST=GetPrint';
      url += '&VERSION=1.3&REQUEST=GetPrint';
      url += '&FORMAT=pdf&EXCEPTIONS=application/vnd.ogc.se_inimage&TRANSPARENT=true';
      url += '&SRS='+map.projection;
      url += '&DPI=300';
      url += '&TEMPLATE='+composer.getAttribute('name');
      url += '&'+composer.getElementsByTagName('ComposerMap')[0].getAttribute('name')+':extent='+map.getExtent();
      url += '&'+composer.getElementsByTagName('ComposerMap')[0].getAttribute('name')+':rotation=0';
      url += '&'+composer.getElementsByTagName('ComposerMap')[0].getAttribute('name')+':scale='+map.getScale();
      var printLayers = []
      $('#switcher button[name="layer"][aria-disabled="false"]').each(function(i,b){
          b = $(b);
          var icons = b.button('option','icons');
          if (icons.primary == 'liz-icon-check')
            printLayers.push(b.val());
      });
      printLayers.push($('#baselayerContainer select').val());
      printLayers.reverse();
      url += '&LAYERS='+printLayers.join(',');
      window.open(url);
      return false;
    });
    */
    $('#toolbar button.print').hide();

    map.addControl(new OpenLayers.Control.Scale(document.getElementById('scalebar')));
  }

  function addFeatureInfo() {
      var info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: wmsServerURL, 
            title: 'Identify features by clicking',
            queryVisible: true,
            infoFormat: 'text/xml',
            eventListeners: {
                getfeatureinfo: function(event) {
                    var xmlf = new OpenLayers.Format.XML();
                    var data = xmlf.read(event.text).documentElement;
                    var text = '';
                    featureInfo = {};
                    var layers = xmlf.getElementsByTagNameNS(data,'*','Layer');
                    for (var i=0; i<layers.length; i++) {
                      var layer = layers[i];
                      var layerName = layer.getAttribute('name');
                      featureInfo[layerName] = {};
                      var features = xmlf.getElementsByTagNameNS(layer,'*','Feature');
                      for (var j=0; j<features.length; j++) {
                        text += '<h4>'+layerName+'</h4>';
                        text += '<div class="lizmapPopupDiv">';
                        text += '<table class="lizmapPopupTable">';
                        text += '<thead><tr><th class="left">'+dictionary['popup.table.th.data']+'</th><th>'+dictionary['popup.table.th.value']+'</th></tr></thead>';
                        text += '<tbody>';
                        var feature = features[j];
                        var featureId = feature.getAttribute('id');
                        featureInfo[layerName][featureId] = {};
                        var attributes = xmlf.getElementsByTagNameNS(feature,'*','Attribute');
                        for (var k=0; k<attributes.length; k++) {
                          var att = attributes[k];
                          var attName = att.getAttribute('name');
                          if (attName != 'geometry') {
                            var attValue = att.getAttribute('value');
                            featureInfo[layerName][featureId][attName] = attValue;
                            var urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
                            var emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/;
                            var imageRegex = /\.(jpg|jpeg|png|gif|bmp)$/i;
                            
                            var featText = '<tr><th class="left">'+attName+'</th><td>'+attValue+'</td></tr>';
                            if(urlRegex.test(attValue) && !imageRegex.test(attValue))
                              featText = '<tr><th class="left">'+attName+'</th><td><a href="'+attValue+'" target="_blank">'+attValue+'<a></td></tr>';
                            if(emailRegex.test(attValue))
                              featText = '<tr><th>'+attName+'</th><td><a href="mailto:'+attValue+'"</td></tr>' ;
                            if(imageRegex.test(attValue))
                              featText = '<tr><td colspan="2"><img src="'+attValue+'" width="300" border="0"/></td></tr>';
                            text += featText
                          }
                        }
                        text += '</tbody>';
                        text += '</table>';
                        text += '</div>';
                      }
                    }
                    

                    if (text != ''){
                      if (map.popups.length != 0)
                        map.removePopup(map.popups[0]);
                      OpenLayers.Popup.LizmapAnchored = OpenLayers.Class(OpenLayers.Popup.Anchored, {
                       	'displayClass': 'olPopup lizmapPopup'
                       	,'contentDisplayClass': 'olPopupContent lizmapPopupContent'
                      });
                      var popup = new OpenLayers.Popup.LizmapAnchored(
                        "liz_layer_popup", 
                        map.getLonLatFromPixel(event.xy),
                        null,
                        text,
                        null,
                        true,
                        function() {
                          map.removePopup(this);
                        }
                        );
                      popup.panMapIfOutOfView = true;
                      popup.autoSize = true;
                      popup.maxSize = new OpenLayers.Size(350, 300);
                      map.addPopup(popup);
                      var contentDivHeight = 0;
                      $('#liz_layer_popup_contentDiv').children().each(function(i,e) {
                        contentDivHeight += $(e).height();
                      });
                      if($('#liz_layer_popup').height()<contentDivHeight) {
                        $('#liz_layer_popup .olPopupCloseBox').css('right','14px');
                      }
                    }
                }
            }
     });
     info.findLayers = function() {
        var candidates = this.layers || this.map.layers;
        var layers = [];
        var layer, url;
        for(var i=0, len=candidates.length; i<len; ++i) {
            layer = candidates[i];
            if(layer instanceof OpenLayers.Layer.WMS &&
               (!this.queryVisible || (layer.getVisibility() && layer.calculateInRange()))) {
                url = OpenLayers.Util.isArray(layer.url) ? layer.url[0] : layer.url;
                // if the control was not configured with a url, set it
                // to the first layer url
                if(this.drillDown === false && !this.url) {
                    this.url = url;
                }
                if(this.drillDown === true || this.urlMatches(url)) {
                    layers.push(layer);
                }
            }
        }
        return layers;
     };
     map.addControl(info);
     info.activate();
     return info;
  }
  
  /**
   * PRIVATE function: parseData
   * parsing capability
   *
   * Parameters:
   * aData - {String} the WMS capabilities
   *
   * Returns:
   * {Boolean} the capability is OK
   */
  function parseData(aData) {
    var format =  new OpenLayers.Format.WMSCapabilities({version:'1.3.0'});
    var html = "";
    capabilities = format.read(aData);

    var format = new OpenLayers.Format.XML();
    composers = format.read(aData).getElementsByTagName('ComposerTemplate');

    var capability = capabilities.capability;
    if (!capability) {
      $('#map').html('SERVICE NON DISPONIBLE!');
      return false;
    }
    return true;
  }

  // creating the lizMap object
  var obj = {
    /**
     * Property: map
     * {<OpenLayers.Map>} The map
     */
    map: null,
    /**
     * Property: layers
     * {Array(<OpenLayers.Layer>)} The layers
     */
    layers: null,
    /**
     * Property: baselayers
     * {Array(<OpenLayers.Layer>)} The base layers
     */
    baselayers: null,
    /**
     * Property: events
     * {<OpenLayers.Events>} An events object that handles all 
     *                       events on the lizmap
     */
    events: null,
    /**
     * Property: config
     * {Object} The map config
     */
    config: null,
    /**
     * Property: dictionnary
     * {Object} The map dictionnary
     */
    dictionary: null,
    /**
     * Property: tree
     * {Object} The map tree
     */
    tree: null,
    /**
     * Method: init
     */
    init: function() {
      var self = this;
      //get config
      $.getJSON(cfgUrl,function(cfgData) {
        config = cfgData;
        config.options.hasOverview = false;

      //get dictionnary
      $.getJSON(dictionaryUrl,function(dictData) {
        dictionary = dictData;

         //get capabilities
        $.get(wmsServerURL,{SERVICE:'WMS',REQUEST:'GetCapabilities',VERSION:'1.3.0'},function(data) {
          //parse capabilities
          if (!parseData(data))
            return true;

          //set title and abstract coming from capabilities
          document.title = capabilities.title ? capabilities.title : capabilities.service.title;
          $('#title').html('<h1>'+(capabilities.title ? capabilities.title : capabilities.service.title)+'</h1>');
          //$('#abstract').html(capabilities.abstract ? capabilities.abstract : capabilities.service.abstract);
          $('#abstract').html(capabilities.abstract ? capabilities.abstract : '');

          // get and analyse tree
          var capability = capabilities.capability;
          var firstLayer = capability.nestedLayers[0];
          getLayerTree(firstLayer,tree);
          analyseNode(tree);
          self.config = config;
          self.tree = tree;
          self.events.triggerEvent("treecreated", self);

          // create the map
          createMap();
          self.map = map;
          self.layers = layers;
          self.baselayers = baselayers;
          self.events.triggerEvent("mapcreated", self);

          // create the switcher
          createSwitcher();
          self.events.triggerEvent("layersadded", self);

          // initialize the map
          map.zoomToExtent(map.maxExtent);
          updateContentSize();
          map.events.triggerEvent("zoomend",{"zoomChanged": true});

          // create overview if 'Overview' layer
          createOverview();

          // create navigation and toolbar
          createNavbar();
          //createToolbar();

          var info = addFeatureInfo();
          $('#navbar div.slider').slider("value",map.getZoom());
          self.events.triggerEvent("uicreated", self);
          
          $('body').css('cursor', 'auto');
          $('#loading').dialog('close');
        });
      });
      });
    }
  };
  // initializing the lizMap events
  obj.events = new OpenLayers.Events(
      obj, null,
      ['treecreated','mapcreated','layersadded','uicreated'], 
      true, 
      {includeXY: true}
    );
  return obj;
}();
/*
 * it's possible to add event listener
 * before the document is ready
 * but after this file
 */
lizMap.events.on({
    'treecreated':function(evt){
       //alert('treecreated');
       if ((('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') ||
           (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') ||
           (('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') ||
           (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') ||
           (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') ||
           (('googleTerrain' in evt.config.options) && evt.config.options.googleTerrain == 'True')) {
         var proj = evt.config.options.projection;
         Proj4js.defs[proj.ref]=proj.proj4;
         var projection = new OpenLayers.Projection(proj.ref);
         var projOSM = new OpenLayers.Projection('EPSG:900913');
         proj.ref = 'EPSG:900913';
         proj.proj4 = Proj4js.defs['EPSG:900913'];

         var bbox = evt.config.options.bbox;
         var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
         extent = extent.transform(projection,projOSM);
         bbox = extent.toArray();
         
         evt.config.options.projection = proj;
         evt.config.options.bbox = bbox;
         evt.config.options.zoomLevelNumber = 16;
         if ((('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') ||
             (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True'))
           evt.config.options.zoomLevelNumber = 19;
         if ((('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') ||
             (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True'))
           evt.config.options.zoomLevelNumber = 20;
         if ((('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True'))
           evt.config.options.zoomLevelNumber = 21;
         evt.config.options.maxScale = 591659030.3224756;
         evt.config.options.minScale = 2257.0000851534865;
         evt.config.options.mapScales = [];
       }
    }
   ,'mapcreated':function(evt){
       //alert('mapcreated')
       //adding baselayers
       if (('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') {
         evt.map.allOverlays = false;
         var osm = new OpenLayers.Layer.OSM('osm');
         var osmCfg = {
           "name":"osm"
             ,"title":"OpenStreetMap"
         };
         evt.config.layers['osm'] = osmCfg;
         evt.baselayers.push(osm);
       }
       if (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') {
         evt.map.allOverlays = false;
         var mapquest = new OpenLayers.Layer.OSM('mapquest', 
            ["http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
             "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
             "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
             "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"]
             , {numZoomLevels: 19}
            );
         var mapquestCfg = {
           "name":"mapquest"
          ,"title":"MapQuest OSM"
         };
         evt.config.layers['mapquest'] = mapquestCfg;
         evt.baselayers.push(mapquest);
       }
       try {
       if (('googleTerrain' in evt.config.options) && evt.config.options.googleTerrain == 'True') {
         evt.map.allOverlays = false;
         var gphy = new OpenLayers.Layer.Google(
             "Google Terrain",
             {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 16}
             );
         var gphyCfg = {
           "name":"gphy"
          ,"title":"Google Terrain"
         };
         evt.config.layers['gphy'] = gphyCfg;
         evt.baselayers.push(gphy);
       }
       if (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') {
         evt.map.allOverlays = false; 
         var gsat = new OpenLayers.Layer.Google(
             "Google Satellite",
             {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 21}
             );
         var gsatCfg = {
           "name":"gsat"
          ,"title":"Google Satellite"
         };
         evt.config.layers['gsat'] = gsatCfg;
         evt.baselayers.push(gsat);
       }
       if (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') {
         evt.map.allOverlays = false;
         var ghyb = new OpenLayers.Layer.Google(
             "Google Hybrid",
             {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
             );
         var ghybCfg = {
           "name":"ghyb"
          ,"title":"Google Hybrid"
         };
         evt.config.layers['ghyb'] = ghybCfg;
         evt.baselayers.push(ghyb);
       }
       if (('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') {
         evt.map.allOverlays = false;
         var gmap = new OpenLayers.Layer.Google(
             "Google Streets", // the default
             {numZoomLevels: 20}
             );
         var gmapCfg = {
           "name":"gmap"
          ,"title":"Google Streets"
         };
         evt.config.layers['gmap'] = gmapCfg;
         evt.baselayers.push(gmap);
       }
       } catch(e) {
         //problems with google
       }
     }
   ,'uicreated':function(evt){
     //alert('uicreated')
   }
});

$(document).ready(function () {
  // start waiting
  $('body').css('cursor', 'wait');
  $('#loading').dialog({ 
    modal: true
    , draggable: false
    , resizable: false
    , closeOnEscape: false
    , dialogClass: 'liz-dialog-wait'
  })
  .parent().removeClass('ui-corner-all')
  .children('.ui-dialog-titlebar').removeClass('ui-corner-all');
  // configurate OpenLayers
  OpenLayers.DOTS_PER_INCH = 96;
  // initialize LizMap
  lizMap.init();
});
