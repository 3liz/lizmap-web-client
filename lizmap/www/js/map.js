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
   * PRIVATE Property: controls
   * {Object({key:<OpenLayers.Control>})} Dictionary of controls
   */
  var controls = {};
  /**
   * PRIVATE Property: tree
   * {object} The layer's tree
   */
  var tree = {config:{type:'group'}};


  /**
   * PRIVATE function: cleanName
   * cleaning layerName for class and layer
   */
  function cleanName(aName){
    var accentMap = {
        "à": "a",    "á": "a",    "â": "a",    "ã": "a",    "ä": "a",    "ç": "c",    "è": "e",    "é": "e",    "ê": "e",    "ë": "e",    "ì": "i",    "í": "i",    "î": "i",    "ï": "i",    "ñ": "n",    "ò": "o",    "ó": "o",    "ô": "o",    "õ": "o",    "ö": "o",    "ù": "u",    "ú": "u",    "û": "u",    "ü": "u",    "ý": "y",    "ÿ": "y",
        "À": "A",    "Á": "A",    "Â": "A",    "Ã": "A",    "Ä": "A",    "Ç": "C",    "È": "E",    "É": "E",    "Ê": "E",    "Ë": "E",    "Ì": "I",    "Í": "I",    "Î": "I",    "Ï": "I",    "Ñ": "N",    "Ò": "O",    "Ó": "O",    "Ô": "O",    "Õ": "O",    "Ö": "O",    "Ù": "U",    "Ú": "U",    "Û": "U",    "Ü": "U",    "Ý": "Y",
        "-":" ", "'": " ", "(": " ", ")": " "};
    var normalize = function( term ) {
        var ret = "";
        for ( var i = 0; i < term.length; i++ ) {
            ret += accentMap[ term.charAt(i) ] || term.charAt(i);
        }
        return ret;
    };
    aName = normalize(aName);
    var reg = new RegExp(' ', 'g');
    return aName.replace(reg, '_');
  }


  /**
   * PRIVATE function: updateMobile
   * Determine if we should display the mobile version.
   */
  function updateMobile(){
    var isMobile = mCheckMobile();
    var contentIsMobile = $('#content').hasClass('mobile');
    if (isMobile == contentIsMobile)
      return;

    if (isMobile) {
      // Add mobile class to content
      $('#content, #headermenu').addClass('mobile');

      // hide overview map
      if (config.options.hasOverview){
        $('#overview-bar button').hide();
        $('#overviewmap').hide();
      }

      if( $('#menu').is(':visible'))
        $('#menu').hide();

      $('#map-content').append($('#toolbar'));

      $('#toggleLegend')
        .attr('data-original-title',$('#toggleLegendOn').attr('value'))
        .parent().attr('class','legend');
    }
    else
    {
      // Remove mobile class to content
      $('#content, #headermenu').removeClass('mobile');

      // Display overview map
      if (config.options.hasOverview){
        $('#overviewmap').show();
        $('#overview-bar button').show();
      }

      if( !$('#menu').is(':visible'))
        $('#content span.ui-icon-open-menu').click();
      else
        $('#map-content').show();

      $('#toolbar').insertBefore($('#switcher-menu'));

      $('#toggleLegend')
        .attr('data-original-title',$('#toggleMapOnlyOn').attr('value'))
        .parent().attr('class','map');
    }
  }


  /**
   * PRIVATE function: updateContentSize
   * update the content size
   */
  function updateContentSize(){

    updateMobile();

    // calculate height height
    var h = $('body').parent()[0].clientHeight;
    if(!h)
      h = $('window').innerHeight();
    h = h - $('#header').height();
    h = h - $('#headermenu').height();
    $('#map').height(h);

    // Update body padding top by summing up header+headermenu
    $('body').css('padding-top', $('#header').outerHeight() + $('#headermenu').outerHeight() );

    // calculate map width depending on theme configuration 
    // (fullscreen map or not, mobile or not)
    var w = $('body').parent()[0].offsetWidth;

    if ($('#menu').is(':hidden') || $('#map-content').hasClass('fullscreen')) {
      $('#map-content').css('margin-left',0);
    } else {
      w -= $('#menu').width();
      $('#map-content').css('margin-left', $('#menu').width());
    }
    $('#map').width(w);

    updateMapSize();

  }


  /**
   * PRIVATE function: updateMapSize
   * query OpenLayers to update the map size
   */
 function updateMapSize(){
    var center = map.getCenter();
    map.updateSize();
    map.setCenter(center);
    map.baseLayer.redraw();

    if ($('#navbar').height()+150 > $('#map').height() || mCheckMobile())
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
    // calculate switcher height
    // based on map height
    h = $('#map').height();
    // depending on element in #menu div
    if ($('#close-menu').is(':visible'))
      h -= $('#close-menu').outerHeight(true);
    /*
    if ($('#locate-menu').is(':visible') && $('#menu #locate-menu').length != 0) {
      h -= $('#locate-menu').children().first().outerHeight(true);
      h -= $('#locate-menu').children().last().outerHeight(true);
    }
    */
    if ( $('#menu #toolbar').length != 0 ) {
      $('#toolbar').children().each(function(){
        var self = $(this);
        if ( self.is(':visible') ) {
          var children = self.children();
          h -= children.first().outerHeight(true);
          if ( children.length > 1 )
            h -= children.last().outerHeight(true);
        }
      });
    }
    if ($('#baselayer-menu').is(':visible')) {
      h -= $('#baselayer-menu').children().first().outerHeight(true);
      h -= $('#baselayer-menu').children().last().outerHeight(true);
    }
    h -= $('#switcher-menu').children().first().outerHeight(true);

    var sw = $('#switcher');
    // depending on it's own css box parameters
    h -= (parseInt(sw.css('margin-top')) ? parseInt(sw.css('margin-top')) : 0 ) ;
    h -= (parseInt(sw.css('margin-bottom')) ? parseInt(sw.css('margin-bottom')) : 0 ) ;
    h -= (parseInt(sw.css('padding-top')) ? parseInt(sw.css('padding-top')) : 0 ) ;
    h -= (parseInt(sw.css('padding-bottom')) ? parseInt(sw.css('padding-bottom')) : 0 ) ;
    h -= (parseInt(sw.css('border-top-width')) ? parseInt(sw.css('border-top-width')) : 0 ) ;
    h -= (parseInt(sw.css('border-bottom-width')) ? parseInt(sw.css('border-bottom-width')) : 0 ) ;

    //depending on it's parent padding
    var swp = sw.parent();
    h -= (parseInt(swp.css('padding-top')) ? parseInt(swp.css('padding-top')) : 0 ) ;
    h -= (parseInt(swp.css('padding-bottom')) ? parseInt(swp.css('padding-bottom')) : 0 ) ;

    // If map if fullscreen, get #menu position : bottom or top
    h -= 2 * (parseInt($('#menu').css('bottom')) ? parseInt($('#menu').css('bottom')) : 0 ) ;

    if($('#map-content').hasClass('fullscreen')){
        $('#switcher').css('max-height', h);
    }
    else
        $('#switcher').height(h);
    
    
  }


  /**
   * PRIVATE function: getLayerLegendGraphicUrl
   * get the layer legend graphic
   *
   * Parameters:
   * name - {text} the layer name
   * withScale - {boolean} url with scale parameter
   *
   * Dependencies:
   * wmsServerUrl
   *
   * Returns:
   * {text} the url
   */
  function getLayerLegendGraphicUrl(name, withScale) {
    var layer = null
    $.each(layers,function(i,l) {
      if (layer == null && l.name == name)
        layer = l;
    });
    var legendParams = {SERVICE: "WMS",
                  VERSION: "1.3.0",
                  REQUEST: "GetLegendGraphics",
                  LAYERS: layer.params['LAYERS'],
                  EXCEPTIONS: "application/vnd.ogc.se_inimage",
                  FORMAT: "image/png",
                  TRANSPARENT: "TRUE",
                  WIDTH: 150,
                  LAYERFONTSIZE: 9,
                  ITEMFONTSIZE: 9,
                  SYMBOLSPACE: 1,
                  DPI: 96};
    var layerConfig = config.layers[layer.params['LAYERS']];
    if (layerConfig.id==layerConfig.name)
      legendParams['LAYERFONTBOLD'] = "TRUE";
    else {
      legendParams['LAYERFONTSIZE'] = 0;
      legendParams['LAYERSPACE'] = 0;
    }
    legendParams['LAYERFONTBOLD'] = "FALSE";
    if (withScale)
      legendParams['SCALE'] = map.getScale();
    var legendParamsString = OpenLayers.Util.getParameterString(legendParams);
    return OpenLayers.Util.urlAppend(wmsServerURL, legendParamsString);
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
    if ( minScale < 1 )
      minScale = 1;
    return {minScale:minScale,maxScale:maxScale};
  }

  /**
   * PRIVATE function: getLayerOrder
   * get the layer order and calculate it if it's a QGIS group
   *
   * Parameters:
   * nested - {Object} a capability layer
   *
   * Dependencies:
   * config
   *
   * Returns:
   * {Integer} the layer's order
   */
  function getLayerOrder(nested) {
    // there is no layersOrder in the project
    if (!('layersOrder' in config))
      return -1;

    // the nested is a layer and not a group
    if (nested.nestedLayers.length == 0)
      if (nested.name in config.layersOrder)
        return config.layersOrder[nested.name];
      else
        return -1;

    // the nested is a group
    var order = -1;
    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var layer = nested.nestedLayers[i];
      var lOrder = -1;
      if (layer.nestedLayers.length != 0)
        lOrder = getLayerScale(layer);
      else if (layer.name in config.layersOrder)
        lOrder = config.layersOrder[layer.name];
      else
        lOrder = -1;
      if (lOrder != -1) {
        if (order == -1 || lOrder < order)
          order = lOrder;
      }
    }
    return order;
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
      var layerName = cleanName(layer.name);

      if (layer.name.toLowerCase() == 'hidden')
        continue;

      // if the layer is not the Overview and had a config
      // creating the {<OpenLayers.Layer.WMS>} and the tree node
      if (layer.name != 'Overview' && layerConfig) {
        var node = {name:layerName,config:layerConfig,parent:pNode};
        var service = wmsServerURL;
        var layerWmsParams = {
          layers:layer.name
          ,version:'1.3.0'
          ,exceptions:'application/vnd.ogc.se_inimage'
          ,format:(layerConfig.imageFormat) ? layerConfig.imageFormat : 'image/png'
          ,dpi:96
        };
        if (layerWmsParams.format != 'image/jpeg')
          layerWmsParams['transparent'] = true;

        if (layerConfig.baseLayer == 'True') {
        // creating the base layer
          baselayers.push(new OpenLayers.Layer.WMS(layerName,service
              ,layerWmsParams
              ,{isBaseLayer:true
               ,gutter:5
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
              ,layerWmsParams
              ,{isBaseLayer:false
               ,minScale:scales.maxScale
               ,maxScale:scales.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
               ,order:getLayerOrder(layer)
              }));
        }
        else if (layerConfig.type == 'layer') {
        // creating the layer because it's a layer and has no children
          layers.push(new OpenLayers.Layer.WMS(layerName,service
              ,layerWmsParams
              ,{isBaseLayer:false
               ,minScale:layerConfig.maxScale
               ,maxScale:(layerConfig.minScale != null && layerConfig.minScale < 1) ? 1 : layerConfig.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
               ,order:getLayerOrder(layer)
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
   * PRIVATE function: getSwitcherLine
   * get the html table line <tr> of a config node for the switcher
   *
   * Parameters:
   * aNode - {Object} a config node
   *
   * Returns:
   * {String} the <tr> html corresponding to the node
   */
  function getSwitcherLine(aNode, aParent) {
    var html = '';

    var nodeConfig = aNode.config;
    html += '<tr id="'+nodeConfig.type+'-'+aNode.name+'"';
    html += ' class="liz-'+nodeConfig.type;
    if (aParent)
      html += ' child-of-group-'+aParent.name;
    if (('children' in aNode) && aNode['children'].length!=0)
      html += ' expanded parent';
    html += '">';

    html += '<td><button class="checkbox" name="'+nodeConfig.type+'" value="'+aNode.name+'" title="'+lizDict['tree.button.checkbox']+'"></button>';
    html += '<span class="label" title="'+nodeConfig.abstract+'">'+nodeConfig.title+'</span>';
    html += '</td>';

    html += '<td>';
    if (nodeConfig.type == 'layer')
      html += '<span class="loading">&nbsp;</span>';
    html += '</td>';

    var legendLink = '';
    if (nodeConfig.link)
      legendLink = nodeConfig.link;
    if (legendLink != '' )
      html += '<td><button class="link" name="link" title="'+lizDict['tree.button.link']+'" value="'+legendLink+'"/></td>';
    else
      html += '<td></td>';

    html += '</tr>';

    if (nodeConfig.type == 'layer') {
      var url = getLayerLegendGraphicUrl(aNode.name, false);

      html += '<tr id="legend-'+aNode.name+'" class="child-of-layer-'+aNode.name+' legendGraphics">';
      html += '<td colspan="2"><div class="legendGraphics"><img src="'+url+'"/></div></td>';
      html += '</tr>';
    }

    return html;
  }

  /**
   * PRIVATE function: getSwitcherNode
   * get the html of a config node for the switcher
   *
   * Parameters:
   * aNode - {Object} a config node
   *
   * Returns:
   * {String} the html corresponding to the node
   */
  function getSwitcherNode(aNode,aLevel) {
    var html = '';
    if (aLevel == 0
     && ('rootGroupsAsBlock' in config.options)
     && config.options['rootGroupsAsBlock'] == 'True') {
      var children = aNode.children;
      var previousSibling;
      for (var i=0, len=children.length; i<len; i++) {
        var child = children[i];
        var positionClass = '';
        if (i == 0)
          positionClass= 'first-block ';
        else if (i == len-1)
          positionClass= 'last-block ';
        if (('children' in child) && child['children'].length!=0) {
          if (previousSibling && ( (('children' in previousSibling) && previousSibling['children'].length==0) || !('children' in previousSibling)) ) {
            html += '</table>';
            html += '</div>';
          }
          html += '<div class="with-blocks '+positionClass+child.name+'">';
          html += '<table class="tree">';
          var grandChildren = child.children;
          for (var j=0, jlen=grandChildren.length; j<jlen; j++) {
            var grandChild = grandChildren[j];
            html += getSwitcherLine(grandChild);

            if (('children' in grandChild) && grandChild['children'].length!=0)
              html += getSwitcherNode(grandChild, aLevel+1);
          }
          html += '</table>';
          html += '</div>';
        } else {
          if (previousSibling && ('children' in previousSibling) && previousSibling['children'].length!=0) {
            html += '<div class="with-blocks '+positionClass+'no-group">';
            html += '<table class="tree">';
          }
          html += getSwitcherLine(child);
        }
        previousSibling = child;
      }
      if ((('children' in previousSibling) && previousSibling['children'].length==0) || !('children' in previousSibling)) {
        html += '</table>';
        html += '</div>';
      }
      return html;
    }
    if (aLevel == 0) {
      html += '<div class="without-blocks no-group">';
      html += '<table class="tree">';
    }

    var children = aNode.children;
    for (var i=0, len=children.length; i<len; i++) {
      var child = children[i];
      if (aLevel == 0)
        html += getSwitcherLine(child);
      else
        html += getSwitcherLine(child,aNode);

      if (('children' in child) && child['children'].length!=0)
        html += getSwitcherNode(child, aLevel+1);
    }

    if (aLevel == 0) {
      html += '</table>';
      html += '</div>';
    }
    return html;
  }

  /**
   * PRIVATE function: createMap
   * creating the map {<OpenLayers.Map>}
   */
  function createMap() {
    // get and define projection
    var proj = config.options.projection;
    if ( !(proj.ref in Proj4js.defs) )
      Proj4js.defs[proj.ref]=proj.proj4;
    var projection = new OpenLayers.Projection(proj.ref);
    if ( !(proj.ref in OpenLayers.Projection.defaults) )
      OpenLayers.Projection.defaults[proj.ref] = projection;

    // get and define the max extent
    var bbox = config.options.bbox;
    var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));

    var restrictedExtent = extent.scale(3);

    // calculate the map height
    var mapHeight = $('body').parent()[0].clientHeight;
    if(!mapHeight)
        mapHeight = $('window').innerHeight();
    mapHeight = mapHeight - $('#header').height();
    mapHeight = mapHeight - $('#headermenu').height();
    $('#map').height(mapHeight);

    var res = extent.getHeight()/$('#map').height();

    var scales = [];
    if ('mapScales' in config.options)
      scales = config.options.mapScales;
    scales.sort(function(a, b) {
      return Number(b) - Number(a);
    });

    // creating the map
    OpenLayers.Util.DEFAULT_PRECISION=20; // default is 14 : change needed to avoid rounding problem with cache
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

           //updateSwitcherSize();

//           alert('scale = ' + map.getScale() + '\nresolution=' + map.getResolution());
         }
        }

       ,maxExtent:extent
       ,restrictedExtent: restrictedExtent
       ,maxScale: scales.length == 0 ? config.options.minScale : "auto"
       ,minScale: scales.length == 0 ? config.options.maxScale : "auto"
       ,numZoomLevels: scales.length == 0 ? config.options.zoomLevelNumber : scales.length
       ,scales: scales.length == 0 ? null : scales
       ,projection:projection
       ,units:projection.proj.units
       ,allOverlays:(baselayers.length == 0)
    });
    map.addControl(new OpenLayers.Control.Attribution({div:document.getElementById('attribution')}));

    // add handler to update the map size
    $(window).resize(function() {
      updateContentSize();
    });
  }

  /**
   * Get features for locate by layer tool
   */
  function getLocateFeature(aName) {
    var locate = config.locateByLayer[aName];
    var wfsOptions = {
      'SERVICE':'WFS'
     ,'VERSION':'1.0.0'
     ,'REQUEST':'GetFeature'
     ,'TYPENAME':aName
     ,'PROPERTYNAME':'geometry,'+locate.fieldName
     ,'OUTPUTFORMAT':'GeoJSON'
    };
    $.get(wmsServerURL,wfsOptions,function(data) {
      locate['features'] = {};
      var features = data.features;
      features.sort(function(a, b) {
        return a.properties[locate.fieldName].localeCompare(b.properties[locate.fieldName]);
      });
      var lConfig = config.layers[aName];
      var options = '<option value="-1">'+lConfig.title+'</option>';
      for (var i=0, len=features.length; i<len; i++) {
        var feat = features[i];
        locate.features[feat.id.toString()] = feat;
        options += '<option value="'+feat.id+'">'+feat.properties[locate.fieldName]+'</option>';
      }
      $('#locate-layer-'+aName).html(options).change(function() {
        var layer = map.getLayersByName('locatelayer')[0];
        layer.destroyFeatures();
        $('#locate select:not(#locate-layer-'+aName+')').val('-1');
        var proj = new OpenLayers.Projection(locate.crs);
        var val = $(this).val();
        if (val == '-1') {
          var bbox = new OpenLayers.Bounds(locate.bbox);
          bbox.transform(proj, map.getProjection());
          map.zoomToExtent(bbox);
        } else {
          var feat = locate.features[val];
          var format = new OpenLayers.Format.GeoJSON();
          feat = format.read(feat)[0];
          feat.geometry.transform(proj, map.getProjection());
          map.zoomToExtent(feat.geometry.getBounds());
          if (locate.displayGeom == 'True')
            layer.addFeatures([feat]);
        }
        $(this).blur();
      });
    },'json');
  }

  /**
   * create the layer switcher
   */
  function createSwitcher() {
    // set the switcher content
    $('#switcher').html(getSwitcherNode(tree,0));
    $('#switcher table.tree').treeTable({
      onNodeShow: function() {
        //updateSwitcherSize();
        var self = $(this);
        if (self.find('div.legendGraphics').length != 0) {
          var name = self.attr('id').replace('legend-','');
          var url = getLayerLegendGraphicUrl(name, true);
          self.find('div.legendGraphics img').attr('src',url);
        }
      },
      onNodeHide: function() {
        //updateSwitcherSize();
      }
    });
    $('#close-menu .ui-icon-close-menu').click(function(){
      $('#menu').hide();
      if($('#content').hasClass('mobile')) {
        $('#map-content').show();
        $('#toggleLegend')
          .attr('data-original-title',$('#toggleLegendOn').attr('value'))
          .parent().attr('class','legend');
      } else {
        $('#toggleLegend')
          .attr('data-original-title',$('#toggleLegendMapOn').attr('value'))
          .parent().attr('class','legend');
      }
      $('#content .ui-icon-open-menu').show();
      updateContentSize();
    });
    $('#content .ui-icon-open-menu').click(function(){
      $('#menu').show();
      if($('#content').hasClass('mobile')) {
        $('#map-content').hide();
        $('#toggleLegend')
          .attr('data-original-title',$('#toggleMapOn').attr('value'))
          .parent().attr('class','map');
      } else {
        $('#toggleLegend')
          .attr('data-original-title',$('#toggleMapOn').attr('value'))
          .parent().attr('class','map');
      }
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
      var windowLink = self.val();
      // Test if the link is internal
      var mediaRegex = /^(\/)?media\//;
      if(mediaRegex.test(windowLink))
        windowLink = mediaServerURL+'&path=/'+windowLink;
      // Open link in a new window
      window.open(windowLink);
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
      if (blConfig)
        select += '<option value="'+blConfig.name+'">'+blConfig.title+'</option>';
      else
        select += '<option value="'+baselayer.name+'">'+baselayer.name+'</option>';
      /*
      if (blConfig)
        select.push('<input type="radio" name="baselayers" value="'+blConfig.name+'"><span class="baselayer-radio-label">'+blConfig.title+'</span></input>');
      else
        select.push('<input type="radio" name="baselayers" value="'+baselayer.name+'"><span class="baselayer-radio-label">'+baselayer.name+'</span></input>');
        */
    }
    //select += '</select>';
    //select = select.join('<br/>');

    if (baselayers.length!=0) {
      // active the select element for baselayers
      $('#baselayer-select').append(select);
      $('#baselayer-select')
        .change(function() {
          var val = $(this).val();
          map.setBaseLayer(map.getLayersByName(val)[0]);
          $(this).blur();
        });
      // Hide baselayer-menu if only one base layer inside
      if (baselayers.length==1)
        $('#baselayer-menu').hide();
    } else {
      // hide elements for baselayers
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
    layers.sort(function(a, b) {
      return a.order > b.order ? 1 : -1;
    });
    layers.reverse();
    for (var i=0,len=layers.length; i<len; i++) {
      var l = layers[i];
      l.units = projection.proj.units;
      l.events.on({
        loadstart: function(evt) {
          $('#layer-'+evt.object.name+' span.loading').addClass('loadstart');
        },
        loadend: function(evt) {
          $('#layer-'+evt.object.name+' span.loading').removeClass('loadstart');
        }
      });
      map.addLayer(l);
      if (!l.isVisible)
        $('#switcher button.checkbox[name="layer"][value="'+l.name+'"]').click();
    }

    // Add Locate by layer
    if ('locateByLayer' in config) {
      var locateContent = [];
      for (var lname in config.locateByLayer) {
        var lConfig = config.layers[lname];
        var html = '<div class="locate-layer">';
        html += '<select id="locate-layer-'+lname+'" class="label">';
        html += '<option>'+lConfig.title+'...</option>';
        html += '</select>';
        html += '</div>';
        //constructing the select
        locateContent.push(html);
      }
      $('#locate').html(locateContent.join('<br/>'));
      map.addLayer(new OpenLayers.Layer.Vector('locatelayer',{
        styleMap: new OpenLayers.StyleMap({
          pointRadius: 6,
          fill: false,
          stroke: true,
          strokeWidth: 3,
          strokeColor: 'yellow'
        })
      }));
      $.get(wmsServerURL,{
          'SERVICE':'WFS'
         ,'VERSION':'1.0.0'
         ,'REQUEST':'GetCapabilities'
      }, function(xml) {
        $(xml).find('FeatureType').each( function(){
          var self = $(this);
          var lname = self.find('Name').text();
          if (lname in config.locateByLayer) {
            var locate = config.locateByLayer[lname];
            locate['crs'] = self.find('SRS').text();
            new OpenLayers.Projection(locate.crs);
            var bbox = self.find('LatLongBoundingBox');
            locate['bbox'] = [
              parseFloat(bbox.attr('minx'))
             ,parseFloat(bbox.attr('miny'))
             ,parseFloat(bbox.attr('maxx'))
             ,parseFloat(bbox.attr('maxy'))
            ];
          }
        } );
        for (var lname in config.locateByLayer) {
          getLocateFeature(lname);
        }
        $('#locate-menu button.btn-locate-clear').click(function() {
          var layer = map.getLayersByName('locatelayer')[0];
          layer.destroyFeatures();
          $('#locate select').val('-1');
        });
      },'xml');
      $('#locate-menu').show();
    }
  }

  /**
   * PRIVATE function: createOverview
   * create the overview
   */
  function createOverview() {
    var ovLayer = new OpenLayers.Layer.WMS('overview',wmsServerURL
              ,{layers:'Overview',version:'1.3.0',exceptions:'application/vnd.ogc.se_inimage'
              ,format:'image/png'
              ,transparent:true,dpi:96}
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
      if(!mCheckMobile())
        $('#overviewmap').show();
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
    if ( ('zoomHistory' in config.options)
        && config.options['zoomHistory'] == "True") {
      var hCtrl =  new OpenLayers.Control.NavigationHistory();
      map.addControls([hCtrl]);
      $('#navbar div.history button.previous').button({
        text:false,
        icons:{primary: "ui-icon-previous"}
      }).removeClass("ui-corner-all")
      .click(function(){
        var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
        if (ctrl && ctrl.previousStack.length != 0)
          ctrl.previousTrigger();
        if (ctrl && ctrl.previous.active)
          $(this).addClass('ui-state-usable');
        else
          $(this).removeClass('ui-state-usable');
        if (ctrl && ctrl.next.active)
          $('#navbar div.history button.next').addClass('ui-state-usable');
        else
          $('#navbar div.history button.next').removeClass('ui-state-usable');
      });
      $('#navbar div.history button.next').button({
        text:false,
        icons:{primary: "ui-icon-next"}
      }).removeClass("ui-corner-all")
      .click(function(){
        var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
        if (ctrl && ctrl.nextStack.length != 0)
          ctrl.nextTrigger();
        if (ctrl && ctrl.next.active)
          $(this).addClass('ui-state-usable');
        else
          $(this).removeClass('ui-state-usable');
        if (ctrl && ctrl.previous.active)
          $('#navbar div.history button.previous').addClass('ui-state-usable');
        else
          $('#navbar div.history button.previous').removeClass('ui-state-usable');
      });
      map.events.on({
        moveend : function() {
          var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
          if (ctrl && ctrl.previousStack.length > 1)
            $('#navbar div.history button.previous').addClass('ui-state-usable');
          else
            $('#navbar div.history button.previous').removeClass('ui-state-usable');
          if (ctrl && ctrl.nextStack.length > 0)
            $('#navbar div.history button.next').addClass('ui-state-usable');
          else
            $('#navbar div.history button.next').removeClass('ui-state-usable');
        }
      });
    } else {
      $('#navbar > .history').remove();
    }
  }

  /**
   * PRIVATE function: createToolbar
   * create the tool bar (collapse overview and switcher, etc)
   */
  function createToolbar() {
    var configOptions = config.options;

    var info = addFeatureInfo();
    controls['featureInfo'] = info;

    if ( ('print' in configOptions)
        && configOptions['print'] == 'True')
      addPrintControl();
    else
      $('#togglePrint').parent().remove();

    if ( ('geolocation' in configOptions)
        && configOptions['geolocation'] == 'True')
      addGeolocationControl();
    else
      $('#toggleGeolocate').parent().remove();

    addAnnotationControls();

    if ( ('measure' in configOptions)
        && configOptions['measure'] == 'True')
      addMeasureControls();
    else {
      $('#measure').parent().remove();
      $('#measure-length-menu').remove();
      $('#measure-area-menu').remove();
      $('#measure-perimeter-menu').remove();
    }

    if ( ('externalSearch' in configOptions)
        && configOptions['externalSearch'] == 'nominatim')
      addNominatimSearch();
    else
      $('#nominatim-search').remove();

    addComplexPrintControl();
  }

  function deactivateToolControls( evt ) {
    for (var id in controls) {
      var ctrl = controls[id];
      if (ctrl == evt.object)
        continue;
      if (ctrl.type == OpenLayers.Control.TYPE_TOOL)
        ctrl.deactivate();
    }
    return true;
  }

  function addFeatureInfo() {
      var info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: wmsServerURL,
            title: 'Identify features by clicking',
            type:OpenLayers.Control.TYPE_TOGGLE,
            queryVisible: true,
            infoFormat: 'text/html',
            eventListeners: {
                getfeatureinfo: function(event) {
                    var text = event.text;
                    if (text != ''){
                      if (map.popups.length != 0)
                        map.removePopup(map.popups[0]);
                      OpenLayers.Popup.LizmapAnchored = OpenLayers.Class(OpenLayers.Popup.Anchored,
                        {
                         	'displayClass': 'olPopup lizmapPopup'
                          ,"autoSize": true
//	                        ,"size": new OpenLayers.Size(200, 200)
//	                        ,"minSize": new OpenLayers.Size(300, 300)
	                        ,"maxSize": new OpenLayers.Size(500, 500)
	                        ,"keepInMap": true
                         	,'contentDisplayClass': 'olPopupContent lizmapPopupContent'
                        }
                      );
                      var popup = new OpenLayers.Popup.LizmapAnchored(
                        "liz_layer_popup",
                        map.getLonLatFromPixel(event.xy),
                        null,
                        text,
                        null,
                        true,
                        function() {
                          map.removePopup(this);
                          if(mCheckMobile()){
                            $('#navbar').show();
                            $('#overview-box').show();
                          }


                        }
                        );
                      popup.panMapIfOutOfView = true;
//                      popup.autoSize = true; // disabled is better
//                      popup.size = new OpenLayers.Size(400, 400);
                      map.addPopup(popup);
                      var contentDivHeight = 0;
                      $('#liz_layer_popup_contentDiv').children().each(function(i,e) {
                        contentDivHeight += $(e).outerHeight(true);
                      });
                      if ( $('#liz_layer_popup_contentDiv').height() > contentDivHeight ) {
                        $('#liz_layer_popup_contentDiv').height(contentDivHeight)
                          $('#liz_layer_popup').height(contentDivHeight)
                      }
                      if($('#liz_layer_popup').height()<contentDivHeight) {
                        $('#liz_layer_popup .olPopupCloseBox').css('right','14px');
                      }
                      // Hide navbar and overview in mobile mode
                      if(mCheckMobile()){
                        $('#navbar').hide();
                        $('#overview-box').hide();
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
            if(layer instanceof OpenLayers.Layer.WMS  &&
               (!this.queryVisible || (layer.getVisibility() && layer.calculateInRange()))) {
                 var configLayer = config.layers[layer.params['LAYERS']];
                 if( configLayer && configLayer.popup && configLayer.popup == 'True'){
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
        }
        return layers;
     };
     map.addControl(info);
     info.activate();
     return info;
  }

  function addPrintControl() {
    if (composers.length == 0 ) {
      $('#togglePrint').parent().remove();
      return false;
    }
    var ptTomm = 0.35277; //conversion pt to mm
    var printCapabilities = {scales:[],layouts:[]};
    var composer = composers[0];
    var mapWidth = Number(composer.getElementsByTagName('ComposerMap')[0].getAttribute('width')) / ptTomm;
    var mapHeight = Number(composer.getElementsByTagName('ComposerMap')[0].getAttribute('height')) / ptTomm;
    //for some strange reason we need to provide a "map" and a "size" object with identical content
    printCapabilities.layouts.push({
      "name": composer.getAttribute('name'),
      "map": {
        "width": mapWidth,
      "height": mapHeight
      },
      "size": {
        "width": mapWidth,
      "height": mapHeight
      },
      "rotation": true
    });
    var layer = map.getLayersByName('Print');
    if ( layer.length == 0 ) {
      layer = new OpenLayers.Layer.Vector('Print');
      map.addLayer(layer);
      layer.setVisibility(false);
    } else
      layer = layer[0];
    if ( layer.features.length == 0 )
      layer.addFeatures([
        new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Polygon([
                new OpenLayers.Geometry.LinearRing([
                    new OpenLayers.Geometry.Point(-1, -1),
                    new OpenLayers.Geometry.Point(1, -1),
                    new OpenLayers.Geometry.Point(1, 1),
                    new OpenLayers.Geometry.Point(-1, 1)
                ])
            ])
          )
        ]);
    var dragCtrl = new OpenLayers.Control.DragFeature(layer,{
      geometryTypes: ['OpenLayers.Geometry.Polygon'],
      type:OpenLayers.Control.TYPE_TOOL,
      eventListeners: {
        "activate": function(evt) {
          deactivateToolControls(evt);
          $('#print-menu').show();
          updateSwitcherSize();
          mAddMessage(lizDict['print.activate'],'info',true).addClass('print');

          var units = map.getUnits();
          var res = map.getResolution()/2;
          var scale = OpenLayers.Util.getScaleFromResolution(res, units);
          var center = map.getCenter();
          var size = printCapabilities.layouts[0].size;
          var unitsRatio = OpenLayers.INCHES_PER_UNIT[units];
          var w = size.width / 72 / unitsRatio * scale / 2;
          var h = size.height / 72 / unitsRatio * scale / 2;
          var bounds = new OpenLayers.Bounds(center.lon - w, center.lat - h,
            center.lon + w, center.lat + h);
          var geom = bounds.toGeometry();
          var feat = layer.features[0];
          geom.id = feat.geometry.id;
          feat.geometry = geom;
          layer.setVisibility(true);
          evt.object.clickFeature(feat);
        },
        "deactivate": function(evt) {
          layer.setVisibility(false);
          $('#print-menu').hide();
          updateSwitcherSize();
          $('#message .print').remove();
        }
      }
    });
    map.addControls([dragCtrl]);
    controls['printDrag'] = dragCtrl;
    $('#togglePrint').click(function() {
      if (dragCtrl.active)
        dragCtrl.deactivate();
      else
        dragCtrl.activate();
      return false;
    });
    $('#print-menu button.btn-print-clear').click(function() {
      dragCtrl.deactivate();
      return false;
    });
    $('#print-menu button.btn-print-launch').click(function() {
      var composer = composers[0];
      var composerMap = composer.getElementsByTagName('ComposerMap')[0];
      composerMap = composerMap.getAttribute('name');
      var extent = dragCtrl.layer.features[0].geometry.getBounds();
      var url = wmsServerURL+'&SERVICE=WMS';
      //url += '&VERSION='+capabilities.version+'&REQUEST=GetPrint';
      url += '&VERSION=1.3&REQUEST=GetPrint';
      url += '&FORMAT=pdf&EXCEPTIONS=application/vnd.ogc.se_inimage&TRANSPARENT=true';
      url += '&SRS='+map.projection;
      url += '&DPI=300';
      url += '&TEMPLATE='+composer.getAttribute('name');
      url += '&'+composerMap+':extent='+extent;
      url += '&'+composerMap+':rotation=0';
      url += '&'+composerMap+':scale='+map.getScale()/2;
      var printLayers = []
      $.each(map.layers, function(i, l) {
        if (l.getVisibility() && l.CLASS_NAME == "OpenLayers.Layer.WMS")
          printLayers.push(l.params['LAYERS']);
      });
      url += '&LAYERS='+printLayers.join(',');
      window.open(url);
      return false;
    });
    map.events.on({
      "zoomend": function() {
        if ( dragCtrl.active && layer.getVisibility() ) {
          var units = map.getUnits();
          var res = map.getResolution()/2;
          var scale = OpenLayers.Util.getScaleFromResolution(res, units);
          var center = map.getCenter();
          var size = printCapabilities.layouts[0].size;
          var unitsRatio = OpenLayers.INCHES_PER_UNIT[units];
          var w = size.width / 72 / unitsRatio * scale / 2;
          var h = size.height / 72 / unitsRatio * scale / 2;
          var bounds = new OpenLayers.Bounds(center.lon - w, center.lat - h,
            center.lon + w, center.lat + h);
          var geom = bounds.toGeometry();
          var feat = layer.features[0];
          geom.id = feat.geometry.id;
          feat.geometry = geom;
          layer.drawFeature(feat);
        }
      }
    });
  }

  function addComplexPrintControl() {
    var ptTomm = 0.35277; //conversion pt to mm
    var printCapabilities = {scales:[],layouts:[]};
    for (var i=0, len=composers.length; i<len; i++) {
      var composer = composers[i];
      var mapWidth = Number(composer.getElementsByTagName('ComposerMap')[0].getAttribute('width')) / ptTomm;
      var mapHeight = Number(composer.getElementsByTagName('ComposerMap')[0].getAttribute('height')) / ptTomm;
      //for some strange reason we need to provide a "map" and a "size" object with identical content
      printCapabilities.layouts.push({
        "name": composer.getAttribute('name'),
        "map": {
          "width": mapWidth,
          "height": mapHeight
        },
        "size": {
          "width": mapWidth,
          "height": mapHeight
        },
        "rotation": true
      });
    }
    var layer = map.getLayersByName('Print');
    if ( layer.length == 0 ) {
      layer = new OpenLayers.Layer.Vector('Print');
      map.addLayer(layer);
      layer.setVisibility(false);
    } else
      layer = layer[0];
    if ( layer.features.length == 0 )
      layer.addFeatures([
        new OpenLayers.Feature.Vector(
          new OpenLayers.Geometry.Polygon([
                new OpenLayers.Geometry.LinearRing([
                    new OpenLayers.Geometry.Point(-1, -1),
                    new OpenLayers.Geometry.Point(1, -1),
                    new OpenLayers.Geometry.Point(1, 1),
                    new OpenLayers.Geometry.Point(-1, 1)
                ])
            ])
          )
        ]);
    var transformCtrl = new OpenLayers.Control.TransformFeature(layer,{
      preserveAspectRatio: true,
      rotate: true,
      geometryTypes: ['OpenLayers.Geometry.Polygon'],
      eventListeners: {
        "activate": function(e) {
          var units = map.getUnits();
          var res = map.getResolution()/2;
          var scale = OpenLayers.Util.getScaleFromResolution(res, units);
          var center = map.getCenter();
          var size = printCapabilities.layouts[0].size;
          var unitsRatio = OpenLayers.INCHES_PER_UNIT[units];
          var w = size.width / 72 / unitsRatio * scale / 2;
          var h = size.height / 72 / unitsRatio * scale / 2;
          var bounds = new OpenLayers.Bounds(center.lon - w, center.lat - h,
            center.lon + w, center.lat + h);
          var geom = bounds.toGeometry();
          var feat = layer.features[0];
          geom.id = feat.geometry.id;
          feat.geometry = geom;
          layer.setVisibility(true);
          //e.object.setFeature(feat);
        },
        "deactivate": function(e) {
          //layer.destroyFeatures();
          layer.setVisibility(false);
        },
        "beforesetfeature": function(e) {
        },
        "setfeature": function(e) {
        },
        "beforetransform": function(e) {
        },
        "transformcomplete": function(e) {
        }
      }
    });
    map.addControls([transformCtrl]);
    controls['printTransform'] = transformCtrl;
    //pour activer il suffit de faire un setFeature
    //transformCtrl.setFeature(layer.features[0]);
    return true;
  }

  function addAnnotationControls() {
    // Annotation layers
    if ('annotationLayers' in config) {
      var pointLayer = null;
      var lineLayer = null;
      var polygonLayer = null;
      for (var alName in config.annotationLayers) {
        var al = config.annotationLayers[alName];
        if ( al.geometryType == "point" )
          pointLayer = new OpenLayers.Layer.Vector(al.layerId ,{
            geometryType: OpenLayers.Geometry.Point
          });
        else if ( al.geometryType == "line" )
          lineLayer = new OpenLayers.Layer.Vector(al.layerId ,{
            geometryType: OpenLayers.Geometry.LineString
          });
        else if ( al.geometryType == "polygon" )
          polygonLayer = new OpenLayers.Layer.Vector(al.layerId ,{
            geometryType: OpenLayers.Geometry.Polygon
          });
      }
      var drawControls = {};
      var drawnFeat = null;
      function setAnnotationModal(aHtml) {
        $('#annotation-modal').html(aHtml);
        $('#annotation-modal form').submit(function(){
          var self = $(this);
          if (jForms.getForm(self.attr('id')).errorDecorator.message != '')
            return false;
          $.post(
            self.attr('action'),
            self.serialize(),
            function(result) {
              setAnnotationModal(result);
            });
          return false;
        });
      }

      // add polygon annotation layer
      // and its drawing control
      if ( polygonLayer != null ) {
        map.addLayer(polygonLayer);
        var polygonCtrl = new OpenLayers.Control.DrawFeature(
            polygonLayer,
            OpenLayers.Handler.Polygon,
            {type:OpenLayers.Control.TYPE_TOOL});
        polygonLayer.events.on({
          'featureadded': function(evt) {
            drawnFeat = evt.feature;
            $.get(createAnnotationURL
              ,{layerId:drawnFeat.layer.name}
              ,function (result) {
                setAnnotationModal(result);
                var formId = $('#annotation-modal form').attr('id');
                var srid = $('#'+formId+'_liz_srid').val();
                if ( !( ('EPSG:'+srid) in Proj4js.defs) )
                  Proj4js.defs['EPSG:'+srid] = $('#'+formId+'_liz_proj4').val();
                var geom = drawnFeat.geometry.clone();
                geom.transform(map.getProjectionObject(), new OpenLayers.Projection('EPSG:'+srid));
                var geomColumn = $('#'+formId+'_liz_geometryColumn').val();
                $('#'+formId+'_'+geomColumn).val(geom);
                $('#annotation-modal').modal('show');
              },'text');
          }
        });
        polygonCtrl.events.on({
          activate: function(evt) {
            deactivateToolControls(evt);
            $('#annotation-polygon-menu').show();
            $('#annotation-modal').modal('hide');
            updateSwitcherSize();
          },
          deactivate: function(evt) {
            $('#annotation-polygon-menu').hide();
            $('#annotation-modal').modal('hide');
            updateSwitcherSize();
          }
        });
        drawControls['polygon'] = polygonCtrl;
      } else {
        $('#annotation-polygon').parent().remove();
        $('#annotation-polygon-menu').remove();
      }

      // add line annotation layer
      // and its drawing control
      if ( lineLayer != null ) {
        map.addLayer(lineLayer);
        var lineCtrl = new OpenLayers.Control.DrawFeature(
            lineLayer,
            OpenLayers.Handler.Path,
            {type:OpenLayers.Control.TYPE_TOOL});
        lineLayer.events.on({
          'featureadded': function(evt) {
            drawnFeat = evt.feature;
            $.get(createAnnotationURL
              ,{layerId:drawnFeat.layer.name}
              ,function (result) {
                setAnnotationModal(result);
                var formId = $('#annotation-modal form').attr('id');
                var srid = $('#'+formId+'_liz_srid').val();
                if ( !( ('EPSG:'+srid) in Proj4js.defs) )
                  Proj4js.defs['EPSG:'+srid] = $('#'+formId+'_liz_proj4').val();
                var geom = drawnFeat.geometry.clone();
                geom.transform(map.getProjectionObject(), new OpenLayers.Projection('EPSG:'+srid));
                var geomColumn = $('#'+formId+'_liz_geometryColumn').val();
                $('#'+formId+'_'+geomColumn).val(geom);
                $('#annotation-modal').modal('show');
              },'text');
          }
        });
        lineCtrl.events.on({
          activate: function(evt) {
            deactivateToolControls(evt);
            $('#annotation-line-menu').show();
            $('#annotation-modal').modal('hide');
            updateSwitcherSize();
          },
          deactivate: function(evt) {
            $('#annotation-line-menu').hide();
            $('#annotation-modal').modal('hide');
            updateSwitcherSize();
          }
        });
        drawControls['line'] = lineCtrl;
      } else {
        $('#annotation-line').parent().remove();
        $('#annotation-line-menu').remove();
      }

      // add point annotation layer
      // and its drawing control
      if ( pointLayer != null ) {
        map.addLayer(pointLayer);
        var pointCtrl = new OpenLayers.Control.DrawFeature(
            pointLayer,
            OpenLayers.Handler.Point,
            {type:OpenLayers.Control.TYPE_TOOL});
        pointLayer.events.on({
          'featureadded': function(evt) {
            drawnFeat = evt.feature;
            $.get(createAnnotationURL
              ,{layerId:drawnFeat.layer.name}
              ,function (result) {
                setAnnotationModal(result);
                var formId = $('#annotation-modal form').attr('id');
                var srid = $('#'+formId+'_liz_srid').val();
                if ( !( ('EPSG:'+srid) in Proj4js.defs) )
                  Proj4js.defs['EPSG:'+srid] = $('#'+formId+'_liz_proj4').val();
                var geom = drawnFeat.geometry.clone();
                geom.transform(map.getProjectionObject(), new OpenLayers.Projection('EPSG:'+srid));
                var geomColumn = $('#'+formId+'_liz_geometryColumn').val();
                $('#'+formId+'_'+geomColumn).val(geom);
                $('#annotation-modal').modal('show');
              },'text');
          }
        });
        pointCtrl.events.on({
          activate: function(evt) {
            deactivateToolControls(evt);
            $('#annotation-point-menu').show();
            $('#annotation-modal').modal('hide');
            updateSwitcherSize();
          },
          deactivate: function(evt) {
            $('#annotation-point-menu').hide();
            $('#annotation-modal').modal('hide');
            updateSwitcherSize();
          }
        });
        drawControls['point'] = pointCtrl;
      } else {
        $('#annotation-point').parent().remove();
        $('#annotation-point-menu').remove();
      }

      if ( $('#annotation').next().children().length == 0 )
        $('#annotation').parent().remove();
      for(var key in drawControls) {
        map.addControl(drawControls[key]);
        controls[key+'Annotations'] = drawControls[key];
        // click in the navbar
        $('#annotation-'+key).click(function() {
          var keyId = $(this).attr('id').replace('annotation-','');
          if ( drawControls[keyId].active )
            drawControls[keyId].deactivate();
          else
            drawControls[keyId].activate();
          $('#annotation').dropdown('toggle');
          return false;
        });
        // click to stop
        $('#annotation-'+key+'-stop').click(function() {
          var keyId = $(this).attr('id').replace('annotation-','');
          keyId = keyId.replace('-stop','');
          drawControls[keyId].deactivate();
        });
      }
      $('#annotation-modal').modal();
      $('#annotation-modal').on('hidden', function () {
        if (drawnFeat == null)
          return true;
        var layerId = drawnFeat.layer.name;
        drawnFeat.layer.destroyFeatures([drawnFeat]);
        drawnfeat = null;
        $.each(layers, function(i, l) {
          if (config.layers[l.params['LAYERS']].id != layerId)
            return true;
          l.redraw(true);
          return false;
        });
      });
      config.annotationLayers['drawControls'] = drawControls;
    } else {
      $('#annotation').parent().remove();
      $('#annotation-point-menu').remove();
      $('#annotation-line-menu').remove();
      $('#annotation-polygon-menu').remove();
    }
  }

  function addMeasureControls() {
    // style the sketch fancy
    var sketchSymbolizers = {
      "Point": {
        pointRadius: 4,
        graphicName: "square",
        fillColor: "white",
        fillOpacity: 1,
        strokeWidth: 1,
        strokeOpacity: 1,
        strokeColor: "#333333"
      },
      "Line": {
        strokeWidth: 3,
        strokeOpacity: 1,
        strokeColor: "#666666",
        strokeDashstyle: "dash"
      },
      "Polygon": {
        strokeWidth: 2,
        strokeOpacity: 1,
        strokeColor: "#666666",
        strokeDashstyle: "dash",
        fillColor: "white",
        fillOpacity: 0.3
      }
    };
    var style = new OpenLayers.Style();
    style.addRules([
        new OpenLayers.Rule({symbolizer: sketchSymbolizers})
        ]);
    var styleMap = new OpenLayers.StyleMap({"default": style});

    var measureControls = {
      length: new OpenLayers.Control.Measure(
        OpenLayers.Handler.Path, {
          persist: true,
          geodesic: true,
          immediate: true,
          handlerOptions: {
            layerOptions: {
              styleMap: styleMap
            }
          },
          type:OpenLayers.Control.TYPE_TOOL
        }
      ),
      area: new OpenLayers.Control.Measure(
        OpenLayers.Handler.Polygon, {
          persist: true,
          geodesic: true,
          immediate: true,
          handlerOptions: {
            layerOptions: {
              styleMap: styleMap
            }
          },
          type:OpenLayers.Control.TYPE_TOOL
        }
      ),
      perimeter: new OpenLayers.Control.Measure(
        OpenLayers.Handler.Polygon, {
          persist: true,
          geodesic: true,
          immediate: true,
          handlerOptions: {
            layerOptions: {
              styleMap: styleMap
            }
          },
          type:OpenLayers.Control.TYPE_TOOL
        }
      )
    };
    measureControls.length.events.on({
      activate: function(evt) {
        deactivateToolControls(evt);
        $('#measure-length-menu').show();
        updateSwitcherSize();
        mAddMessage(lizDict['measure.activate.length'],'info',true).attr('id','lizmap-measure-message');
      },
      deactivate: function(evt) {
        $('#measure-length-menu').hide();
        updateSwitcherSize();
        $('#lizmap-measure-message').remove();
      }
    });
    measureControls.area.events.on({
      activate: function(evt) {
        deactivateToolControls(evt);
        $('#measure-area-menu').show();
        updateSwitcherSize();
        mAddMessage(lizDict['measure.activate.area'],'info',true).attr('id','lizmap-measure-message');
      },
      deactivate: function(evt) {
        $('#measure-area-menu').hide();
        updateSwitcherSize();
        $('#lizmap-measure-message').remove();
      }
    });
    measureControls.perimeter.measure = function(geometry, eventType) {
        var stat, order;
        if(geometry.CLASS_NAME.indexOf('LineString') > -1) {
            stat = this.getBestLength(geometry);
            order = 1;
        } else {
            stat = this.getBestLength(geometry.components[0]);
            order = 1;
        }
        this.events.triggerEvent(eventType, {
            measure: stat[0],
            units: stat[1],
            order: order,
            geometry: geometry
        });
    };
    measureControls.perimeter.events.on({
      activate: function(evt) {
        deactivateToolControls(evt);
        $('#measure-perimeter-menu').show();
        updateSwitcherSize();
        mAddMessage(lizDict['measure.activate.perimeter'],'info',true).attr('id','lizmap-measure-message');
      },
      deactivate: function(evt) {
        $('#measure-perimeter-menu').hide();
        updateSwitcherSize();
        $('#lizmap-measure-message').remove();
      }
    });

    function handleMeasurements(evt) {
      var geometry = evt.geometry;
      var units = evt.units;
      var order = evt.order;
      var measure = evt.measure;
      var out = "";
      if(order == 1) {
        out += lizDict['measure.handle']+" " + measure.toFixed(3) + " " + units;
      } else {
        out += lizDict['measure.handle']+" " + measure.toFixed(3) + " " + units + "<sup>2</" + "sup>";
      }
      var element = $('#lizmap-measure-message');
      if ( element.length == 0 ) {
        element = mAddMessage(out);
        element.attr('id','lizmap-measure-message');
      } else {
        element.html('<p>'+out+'</p>');
      }
    }
    for(var key in measureControls) {
      var control = measureControls[key];
      control.events.on({
        "measure": handleMeasurements,
        "measurepartial": handleMeasurements,
        "activate": function(evt) {
          deactivateToolControls(evt);
        }
      });
      map.addControl(control);
      controls[key+'Measure'] = control;
      // click in the navbar
      $('#measure-'+key).click(function() {
        var keyId = $(this).attr('id').replace('measure-','');
        if ( measureControls[keyId].active )
          measureControls[keyId].deactivate();
        else
          measureControls[keyId].activate();
        $('#measure').dropdown('toggle');
        return false;
      });
      // click to stop
      $('#measure-'+key+'-stop').click(function() {
        var keyId = $(this).attr('id').replace('measure-','');
        keyId = keyId.replace('-stop','');
        measureControls[keyId].deactivate();
      });
    }
    return measureControls;
  }

  function addGeolocationControl() {
    var style = {
      fillColor: '#0395D6',
      fillOpacity: 0.1,
      strokeColor: '#0395D6',
      strokeWidth: 1
    };
    var vector = new OpenLayers.Layer.Vector('geolocation');
    map.addLayer(vector);
    var geolocate = new OpenLayers.Control.Geolocate({
      type: OpenLayers.Control.TYPE_TOGGLE,
      bind: false,
      watch: true,
      geolocationOptions: {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 7000
      }
    });
    map.addControl(geolocate);
    var firstGeolocation = true;
    geolocate.events.on({
      "locationupdated": function(evt) {
        vector.destroyFeatures();
        var circle = new OpenLayers.Feature.Vector(
          OpenLayers.Geometry.Polygon.createRegularPolygon(
            evt.point.clone(),
            evt.position.coords.accuracy/2,
            40,
            0
          ),
          {},
          style
        );
        vector.addFeatures([
          new OpenLayers.Feature.Vector(
            evt.point,
            {},
            {
              graphicName: 'circle',
              strokeColor: '#0395D6',
              strokeWidth: 1,
              fillOpacity: 1,
              fillColor: '#0395D6',
              pointRadius: 3
            }
          ),
          circle
        ]);
        if (firstGeolocation) {
          map.zoomToExtent(vector.getDataExtent());
          //pulsate(circle);
          firstGeolocation = false;
          this.bind = true;
        }
      },
      "locationfailed": function(evt) {
        if ( vector.features.length == 0 )
          mAddMessage(lizDict['geolocation.failed'],'error',true);
      },
      "activate": function(evt) {
        $('#toggleGeolocate').parent().addClass('active');
      },
      "deactivate": function(evt) {
        vector.destroyFeatures();
        $('#toggleGeolocate').parent().removeClass('active');
      }
    });
    controls['geolocation'] = geolocate;
    $('#toggleGeolocate').click(function() {
      if (geolocate.active)
        geolocate.deactivate();
      else
        geolocate.activate();
      return false;
    });
  }

  function addNominatimSearch() {
    if ( !nominatimURL ) {
      $('#nominatim-search').remove();
      return false;
    }
    // Search with nominatim
    var wgs84 = new OpenLayers.Projection('EPSG:4326');
    var extent = new OpenLayers.Bounds( map.maxExtent.toArray() );
    extent.transform(map.getProjectionObject(), wgs84);
    $('#nominatim-search').submit(function(){
      $('#nominatim-search .dropdown-inner .items').html('');
      $.get(nominatimURL
        ,{"query":$('#search-query').val(),"bbox":extent.toBBOX()}
        ,function(data) {
          var text = '';
          $.each(data, function(i, e){
            var bbox = [
              e.boundingbox[2],
              e.boundingbox[0],
              e.boundingbox[3],
              e.boundingbox[1]
            ];
            bbox = new OpenLayers.Bounds(bbox);
            if ( extent.intersectsBounds(bbox) )
              text += '<li><a href="#'+bbox.toBBOX()+'">'+e.display_name+'</a></li>';
          });
          if (text != '') {
            $('#nominatim-search .dropdown-inner .items').html(text);
            $('#nominatim-search').addClass('open');
            $('#nominatim-search .dropdown-inner .items li > a').click(function() {
              var bbox = $(this).attr('href').replace('#','');
              var extent = OpenLayers.Bounds.fromString(bbox);
              extent.transform(wgs84, map.getProjectionObject());
              map.zoomToExtent(extent);
              $('#nominatim-search').removeClass('open');
              return false;
            });
          } else {
            mAddMessage('Nothing Found','info',true);
          }
        }, 'json');
      return false;
    });
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


  /**
   * PRIVATE function: mCheckMobile
   * Check wether in mobile context.
   *
   *
   * Returns:
   * {Boolean} True if in mobile context.
   */
  function mCheckMobile() {
    var minMapSize = 450;
    var w = $('body').parent()[0].offsetWidth;
    if($.browser.msie)
      w = $('body').width();
    var leftW = w - minMapSize;
    if(leftW < minMapSize || w < minMapSize)
      return true;
    return false;
  }

  /**
   * PRIVATE function: mAddMessage
   * Write message to the UI
   *
   *
   * Returns:
   * {jQuery Object} The message added.
   */
  function mAddMessage( aMessage, aType, aClose ) {
    var mType = 'info';
    var mTypeList = ['info', 'error', 'success'];
    var mClose = false;

    if ( $.inArray(aType, mTypeList) != -1 )
      mType = aType;

    if ( aClose )
      mClose = true;
      
    var html = '<div class="alert alert-block alert-'+mType+' fade in" data-alert="alert">';
    if ( mClose )
      html += '<a class="close" data-dismiss="alert" href="#">×</a>';
    html += '<p>'+aMessage+'</p>';
    html += '</div>';

    var elt = $(html);
    $('#message').append(elt);
    return elt;
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
     * Method: checkMobile
     */
    checkMobile: function() {
      return mCheckMobile();
    },

    /**
     * Method: checkMobile
     */
    addMessage: function( aMessage, aType, aClose ) {
      return mAddMessage( aMessage, aType, aClose );
    },

    /**
     * Method: init
     */
    init: function() {
      var self = this;
      //get config
      $.getJSON(cfgUrl,function(cfgData) {
        config = cfgData;
        config.options.hasOverview = false;

         //get capabilities
        $.get(wmsServerURL,{SERVICE:'WMS',REQUEST:'GetCapabilities',VERSION:'1.3.0'},function(data) {
          //parse capabilities
          if (!parseData(data))
            return true;

          //set title and abstract coming from capabilities
//          document.title = capabilities.title ? capabilities.title : capabilities.service.title;
//          $('#title').html('<h1>'+(capabilities.title ? capabilities.title : capabilities.service.title)+'</h1>');
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
          if(self.checkMobile()){
            $('#menu').hide();
            $('#map-content').css('margin-left','0');
          }

          // create the map
          createMap();
          self.map = map;
          self.layers = layers;
          self.baselayers = baselayers;
          self.controls = controls;
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
          createToolbar();

          $('#navbar div.slider').slider("value",map.getZoom());
          map.events.on({
            zoomend : function() {
              $('#switcher table.tree tr.legendGraphics.initialized').each(function() {
                var self = $(this);
                var name = self.attr('id').replace('legend-','');
                var url = getLayerLegendGraphicUrl(name, true);
                self.find('div.legendGraphics img').attr('src',url);
              });
            }
          });

          // Toggle legend
          $('#toggleLegend').click(function(){
            if ($('#menu').is(':visible')) {
              $('.ui-icon-close-menu').click();
              $('#metadata').hide();
            }
            else{
              $('.ui-icon-open-menu').click();
              $('#metadata').hide();
            }
            return false;
          });

          // Toggle locate
          $('#toggleLocate').click(function(){
            $('#locate-menu').toggle();
            $('#metadata').hide();
            updateSwitcherSize();
            return false;
          });
          if ( !('locateByLayer' in config) )
            $('#toggleLocate').parent().hide();

          // Toggle Metadata
          $('#displayMetadata').click(function(){
            $('#metadata').toggle();
            return false;
          });
          $('#hideMetadata').click(function(){
            $('#metadata').hide();
            return false;
          });

          $('#headermenu .navbar-inner .nav a[rel="tooltip"]').tooltip();
          self.events.triggerEvent("uicreated", self);

          $('body').css('cursor', 'auto');
          $('#loading').dialog('close');
        }, "text");
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
       //console.log('treecreated');
       if ((('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') ||
           (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') ||
           (('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') ||
           (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') ||
           (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') ||
           (('googleTerrain' in evt.config.options) && evt.config.options.googleTerrain == 'True')) {
         Proj4js.defs['EPSG:3857'] = Proj4js.defs['EPSG:900913'];
         var proj = evt.config.options.projection;
         if ( !(proj.ref in Proj4js.defs) )
           Proj4js.defs[proj.ref]=proj.proj4;
         var projection = new OpenLayers.Projection(proj.ref);
         var projOSM = new OpenLayers.Projection('EPSG:3857');
         proj.ref = 'EPSG:3857';
         proj.proj4 = Proj4js.defs['EPSG:3857'];

         var bbox = evt.config.options.bbox;
         var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
         extent = extent.transform(projection,projOSM);
         bbox = extent.toArray();

         var scales = [];
         if ('mapScales' in evt.config.options)
           scales = evt.config.options.mapScales;
         var nScales = [];
         if (scales.length != 0 ) {
           scales.sort(function(a, b) {
             return Number(b) - Number(a);
           });
           var maxScale = scales[0];
           var maxRes = OpenLayers.Util.getResolutionFromScale(maxScale, projOSM.proj.units);
           var minScale = scales[scales.length-1];
           var minRes = OpenLayers.Util.getResolutionFromScale(minScale, projOSM.proj.units);
           var res = OpenLayers.Util.getResolutionFromScale(591659030.3224756, projOSM.proj.units);
           while ( res > minRes ) {
             if ( res < maxRes ) {
               if (nScales.length == 0)
                 nScales.push(res*2);
               nScales.push(res);
             }
             res = res/2;
           }
           maxRes = nScales[0];
           nScales.push(res);
           minRes = res;

           maxScale = OpenLayers.Util.getScaleFromResolution(maxRes, projOSM.proj.units);
           minScale = OpenLayers.Util.getScaleFromResolution(minRes, projOSM.proj.units);
         }

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

       /*
       if (nScales.length != 0) {
         evt.config.options.zoomLevelNumber = nScales.length;
         evt.config.options.maxScale = maxScale;
         evt.config.options.minScale = minScale;
         evt.config.options.mapScales = nScales;
       }
       */
    }
   ,'mapcreated':function(evt){
       //console.log('mapcreated');
       //adding baselayers
       var maxExtent = null;
       if ( OpenLayers.Projection.defaults['EPSG:900913'].maxExtent )
         maxExtent = new OpenLayers.Bounds(OpenLayers.Projection.defaults['EPSG:900913'].maxExtent);
       else if ( OpenLayers.Projection.defaults['EPSG:3857'].maxExtent )
         maxExtent = new OpenLayers.Bounds(OpenLayers.Projection.defaults['EPSG:3857'].maxExtent);
       if (('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') {
         evt.map.allOverlays = false;
         var osm = new OpenLayers.Layer.OSM('osm');
         osm.maxExtent = maxExtent;
         /*
         if (evt.config.options.mapScales.length != 0) {
           osm.scales = evt.config.options.mapScales;
           osm.zoomLevelNumber = evt.config.options.mapScales.length;
         }
         */
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
         mapquest.maxExtent = maxExtent;
         /*
         if (evt.config.options.mapScales.length != 0) {
           osm.scales = evt.config.options.mapScales;
           osm.zoomLevelNumber = evt.config.options.mapScales.length;
         }
         */
         var mapquestCfg = {
           "name":"mapquest"
          ,"title":"MapQuest OSM"
         };
         evt.config.layers['mapquest'] = mapquestCfg;
         evt.baselayers.push(mapquest);
       }
       try {
       if (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') {
         var gsat = new OpenLayers.Layer.Google(
             "Google Satellite",
             {type: google.maps.MapTypeId.SATELLITE, numZoomLevels: 21}
             );
         gsat.maxExtent = maxExtent;
         var gsatCfg = {
           "name":"gsat"
          ,"title":"Google Satellite"
         };
         evt.config.layers['gsat'] = gsatCfg;
         evt.baselayers.push(gsat);
         evt.map.allOverlays = false;
       }
       if (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') {
         var ghyb = new OpenLayers.Layer.Google(
             "Google Hybrid",
             {type: google.maps.MapTypeId.HYBRID, numZoomLevels: 20}
             );
         ghyb.maxExtent = maxExtent;
         var ghybCfg = {
           "name":"ghyb"
          ,"title":"Google Hybrid"
         };
         evt.config.layers['ghyb'] = ghybCfg;
         evt.baselayers.push(ghyb);
         evt.map.allOverlays = false;
       }
       if (('googleTerrain' in evt.config.options) && evt.config.options.googleTerrain == 'True') {
         var gphy = new OpenLayers.Layer.Google(
             "Google Terrain",
             {type: google.maps.MapTypeId.TERRAIN, numZoomLevels: 16}
             );
         gphy.maxExtent = maxExtent;
         var gphyCfg = {
           "name":"gphy"
          ,"title":"Google Terrain"
         };
         evt.config.layers['gphy'] = gphyCfg;
         evt.baselayers.push(gphy);
         evt.map.allOverlays = false;
       }
       if (('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') {
         var gmap = new OpenLayers.Layer.Google(
             "Google Streets", // the default
             {numZoomLevels: 20}
             );
         gmap.maxExtent = maxExtent;
         var gmapCfg = {
           "name":"gmap"
          ,"title":"Google Streets"
         };
         evt.config.layers['gmap'] = gmapCfg;
         evt.baselayers.push(gmap);
         evt.map.allOverlays = false;
       }
       } catch(e) {
         //problems with google
         var myError = e;
         //console.log(myError);
       }

     }
   ,'uicreated':function(evt){
  //console.log('uicreated')

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
