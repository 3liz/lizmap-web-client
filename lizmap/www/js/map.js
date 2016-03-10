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
   * PRIVATE Property: externalBaselayersReplacement
   *
   */
  var externalBaselayersReplacement = {
    'osm': 'osm-mapnik',
    'mapquest': 'osm-mapquest',
    'osm-cyclemap': 'osm-cyclemap',
    'gsat': 'google-satellite',
    'ghyb': 'google-hybrid',
    'gphy': 'google-terrain',
    'gmap': 'google-street',
    'bmap': 'bing-road',
    'baerial': 'bing-aerial',
    'bhybrid': 'bing-hybrid',
    'ignmap': 'ign-scan',
    'ignplan': 'ign-plan',
    'ignphoto': 'ign-photo'
  };

  /**
   * PRIVATE Property: cleanNameMap
   *
   */
  var cleanNameMap = {
  };


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
    var reg = new RegExp('\\W', 'g');
    var theCleanName = aName.replace(reg, '_');
    cleanNameMap[theCleanName] = aName;
    return theCleanName;
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
        $('#overview-toggle').hide();
        $('#overview-map').hide().removeClass('active');
      }

      if( $('#menu').is(':visible'))
        $('#menu').hide();

      $('#map-content').append($('#toolbar'));

      $('#toggleLegend')
        .attr('data-original-title',$('#toggleLegendOn').attr('value'))
        .parent().attr('class','legend');

      // autocompletion items for locatebylayer feature
      $('div.locate-layer select').show();
      $('span.custom-combobox').hide();
    }
    else
    {
      // Remove mobile class to content
      $('#content, #headermenu').removeClass('mobile');

      // Display overview map
      if (config.options.hasOverview){
        $('#overview-map').show();
        $('#overview-toggle').show().addClass('active');
      }

      if( !$('#menu').is(':visible'))
        $('#content span.ui-icon-open-menu').click();
      else
        $('#map-content').show();

      $('#toolbar').insertBefore($('#switcher-menu'));

      $('#toggleLegend')
        .attr('data-original-title',$('#toggleMapOnlyOn').attr('value'))
        .parent().attr('class','map');

      // autocompletion items for locatebylayer feature
      $('div.locate-layer select').hide();
      $('span.custom-combobox').show();
    }

  }


  /**
   * PRIVATE function: updateContentSize
   * update the content size
   */
  function updateContentSize(){

    updateMobile();

    // calculate height height
    var h = $(window).innerHeight();
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
   * lizUrls.wms
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
    var qgisName = null;
    if ( name in cleanNameMap )
        qgisName = cleanNameMap[name];
    var layerConfig = null;
    if ( qgisName )
        layerConfig = config.layers[qgisName];
    if ( !layerConfig )
        layerConfig = config.layers[layer.params['LAYERS']];
    if ( !layerConfig )
        layerConfig = config.layers[layer.name];
    if ( !layerConfig )
        return null;
    if ( 'externalWmsToggle' in layerConfig && layerConfig.externalWmsToggle == 'True' ) {
        var externalAccess = layerConfig.externalAccess;
        var legendParams = {SERVICE: "WMS",
                      VERSION: "1.3.0",
                      REQUEST: "GetLegendGraphic",
                      LAYER: externalAccess.layers,
                      LAYERS: externalAccess.layers,
                      SLD_VERSION: "1.1.0",
                      EXCEPTIONS: "application/vnd.ogc.se_inimage",
                      FORMAT: "image/png",
                      TRANSPARENT: "TRUE",
                      WIDTH: 150,
                      DPI: 96};

        var legendParamsString = OpenLayers.Util.getParameterString(
             legendParams
            );
        return OpenLayers.Util.urlAppend(externalAccess.url, legendParamsString);
    }
    var legendParams = {SERVICE: "WMS",
                  VERSION: "1.3.0",
                  REQUEST: "GetLegendGraphic",
                  LAYERS: layer.params['LAYERS'],
                  EXCEPTIONS: "application/vnd.ogc.se_inimage",
                  FORMAT: "image/png",
                  TRANSPARENT: "TRUE",
                  WIDTH: 150,
                  LAYERFONTSIZE: 9,
                  ITEMFONTSIZE: 9,
                  SYMBOLSPACE: 1,
                  ICONLABELSPACE: 2,
                  DPI: 96};
    if (layerConfig.id==layerConfig.name)
      legendParams['LAYERFONTBOLD'] = "TRUE";
    else {
      legendParams['LAYERFONTSIZE'] = 0;
      legendParams['LAYERSPACE'] = 0;
      legendParams['LAYERFONTBOLD'] = "FALSE";
      legendParams['LAYERTITLE'] = "FALSE";
    }
    if (withScale)
      legendParams['SCALE'] = map.getScale();
    var legendParamsString = OpenLayers.Util.getParameterString(
         legendParams
        );
    var service = OpenLayers.Util.urlAppend(lizUrls.wms
        ,OpenLayers.Util.getParameterString(lizUrls.params)
    );
    return OpenLayers.Util.urlAppend(service, legendParamsString);
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

    var service = OpenLayers.Util.urlAppend(lizUrls.wms
      ,OpenLayers.Util.getParameterString(lizUrls.params)
    );
    if (lizUrls.publicUrlList && lizUrls.publicUrlList.length > 1 ) {
        service = [];
        for (var j=0, jlen=lizUrls.publicUrlList.length; j<jlen; j++) {
          service.push(
            OpenLayers.Util.urlAppend(
              lizUrls.publicUrlList[j],
              OpenLayers.Util.getParameterString(lizUrls.params)
            )
          );
        }
    }

    for (var i = 0, len = nested.nestedLayers.length; i<len; i++) {
      var serviceUrl = service
      var layer = nested.nestedLayers[i];
      var layerConfig = config.layers[layer.name];
      var layerName = cleanName(layer.name);

      if (layer.name.toLowerCase() == 'hidden')
        continue;

      // if the layer is not the Overview and had a config
      // creating the {<OpenLayers.Layer.WMS>} and the tree node
      if (layer.name != 'Overview' && layerConfig) {
        var node = {name:layerName,config:layerConfig,parent:pNode};
        var layerWmsParams = {
          layers:layer.name
          ,version:'1.3.0'
          ,exceptions:'application/vnd.ogc.se_inimage'
          ,format:(layerConfig.imageFormat) ? layerConfig.imageFormat : 'image/png'
          ,dpi:96
        };
        if (layerWmsParams.format != 'image/jpeg')
          layerWmsParams['transparent'] = true;

        // Override WMS url if external WMS server
        if (layerConfig.externalAccess ) {
          var extConfig = layerConfig.externalAccess;
          serviceUrl = extConfig.url;
          layerWmsParams = {
            layers: extConfig.layers
            ,styles:(extConfig.styles) ? extConfig.styles : ''
            ,crs:(extConfig.crs) ? extConfig.crs : 'EPSG:3857'
            ,format:(extConfig.format) ? extConfig.format : 'image/png'
            ,transparent:(extConfig.transparent) ? extConfig.transparent : 'true'
            ,exceptions:'application/vnd.ogc.se_inimage'
          }
        }

        if (layerConfig.baseLayer == 'True') {
        // creating the base layer
          baselayers.push(new OpenLayers.Layer.WMS(layerName,serviceUrl
              ,layerWmsParams
              ,{isBaseLayer:true
               ,gutter:5
               ,buffer:0
               ,singleTile:(layerConfig.singleTile == 'True')
               ,attribution:layer.attribution
              }));
        }
        else if (layerConfig.type == 'layer' && layer.nestedLayers.length != 0) {
        // creating the layer because it's a layer and has children
          var minScale = layerConfig.minScale;
          var maxScale = layerConfig.maxScale;
          // get the layer scale beccause, it has children
          var scales = getLayerScale(layer,null,null);
          layers.push(new OpenLayers.Layer.WMS(layerName,serviceUrl
              ,layerWmsParams
              ,{isBaseLayer:false
               ,minScale:scales.maxScale
               ,maxScale:scales.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,visibility:false
               ,gutter:5
               ,buffer:0
               ,transitionEffect:(layerConfig.singleTile == 'True')?'resize':null
               ,removeBackBufferDelay:250
               ,singleTile:(layerConfig.singleTile == 'True')
               ,order:getLayerOrder(layer)
               ,attribution:layer.attribution
              }));
        }
        else if (layerConfig.type == 'layer') {
        // creating the layer because it's a layer and has no children
          layers.push(new OpenLayers.Layer.WMS(layerName,serviceUrl
              ,layerWmsParams
              ,{isBaseLayer:false
               ,minScale:layerConfig.maxScale
               ,maxScale:(layerConfig.minScale != null && layerConfig.minScale < 1) ? 1 : layerConfig.minScale
               ,isVisible:(layerConfig.toggled=='True')
               ,visibility:false
               ,gutter:5
               ,buffer:0
               ,transitionEffect:(layerConfig.singleTile == 'True')?'resize':null
               ,removeBackBufferDelay:250
               ,singleTile:(layerConfig.singleTile == 'True')
               ,order:getLayerOrder(layer)
               ,attribution:layer.attribution
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
    if ( 'displayInLegend' in nodeConfig && nodeConfig.displayInLegend == 'False' )
      html += ' liz-hidden';

    html += '">';

    html += '<td><button class="btn checkbox" name="'+nodeConfig.type+'" value="'+aNode.name+'" title="'+lizDict['tree.button.checkbox']+'"></button>';
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
      html += '<td><button class="btn link" name="link" title="'+lizDict['tree.button.link']+'" value="'+legendLink+'"/></td>';
    else
      html += '<td></td>';

    var removeCache = '';
    if (nodeConfig.cached && nodeConfig.cached == 'True' && nodeConfig.type == 'layer' && ('removeCache' in config.options))
      html += '<td><button class="btn removeCache" name="removeCache" title="'+lizDict['tree.button.removeCache']+'" value="'+aNode.name+'"/></td>';
    else
      html += '<td></td>';

    html += '</tr>';

    if (nodeConfig.type == 'layer'
    && (!nodeConfig.noLegendImage || nodeConfig.noLegendImage != 'True')) {
      var url = getLayerLegendGraphicUrl(aNode.name, false);
      if ( url != null && url != '' ) {
          html += '<tr id="legend-'+aNode.name+'" class="child-of-layer-'+aNode.name+' legendGraphics">';
          html += '<td colspan="2"><div class="legendGraphics"><img src="'+url+'"/></div></td>';
          html += '</tr>';
      }
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
    var initialExtent = extent.clone();
    if ( 'initialExtent' in config.options && config.options.initialExtent.length == 4 ) {
      var initBbox = config.options.initialExtent;
      initialExtent = new OpenLayers.Bounds(Number(initBbox[0]),Number(initBbox[1]),Number(initBbox[2]),Number(initBbox[3]));
    }

    // calculate the map height
    var mapHeight = $('body').parent()[0].clientHeight;
    if(!mapHeight)
        mapHeight = $('window').innerHeight();
    mapHeight = mapHeight - $('#header').height();
    mapHeight = mapHeight - $('#headermenu').height();
    $('#map').height(mapHeight);

    var res = extent.getHeight()/$('#map').height();

    var scales = [];
    var resolutions = [];
    if ('resolutions' in config.options)
      resolutions = config.options.resolutions;
    else if ('mapScales' in config.options)
      scales = config.options.mapScales;
    scales.sort(function(a, b) {
      return Number(b) - Number(a);
    });
    // remove duplicate scales
    nScales = [];
    while (scales.length != 0){
      var scale = scales.pop(0);
      if ($.inArray( scale, nScales ) == -1 )
        nScales.push( scale );
    }
    scales = nScales;


    // creating the map
    OpenLayers.Util.IMAGE_RELOAD_ATTEMPTS = 3; // Avoid some issues with tiles not displayed
    OpenLayers.Util.DEFAULT_PRECISION=20; // default is 14 : change needed to avoid rounding problem with cache
    map = new OpenLayers.Map('map'
      ,{
        controls:[
          new OpenLayers.Control.Navigation(),
          new OpenLayers.Control.Permalink('permalink'),
          new OpenLayers.Control.ZoomBox({alwaysZoom:true})
        ]
        ,tileManager: null // prevent bug with OL 2.13 : white tiles on panning back
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
    if (node.length == 0 )
      return null;

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
             /*
             if (layer.inRange && b.button('option','disabled')) {
               var tr = b.parents('tr').first();
               tr.removeClass('disabled').find('button').button('enable');
               var ancestors = ancestorsOf(tr);
               $.each(ancestors,function(i,a) {
                 $(a).removeClass('disabled').find('button').button('enable');
               });
               if (tr.find('button[name="layer"]').button('option','icons').primary == 'liz-icon-check')
                 layer.setVisibility(true);
             } else if (!layer.inRange && !b.button('option','disabled')) {
               var tr = b.parents('tr').first();
               tr.addClass('disabled').find('button').first().button('disable');
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
                   a.addClass('disabled').find('button').first().button('disable');
                 else
                   a.removeClass('disabled').find('button').button('enable');
               });
             }
             * */
             if (layer.inRange && b.hasClass('disabled')) {
               var tr = b.parents('tr').first();
               tr.removeClass('disabled').find('button').removeClass('disabled');
               var ancestors = ancestorsOf(tr);
               $.each(ancestors,function(i,a) {
                 $(a).removeClass('disabled').find('button').removeClass('disabled');
               });
               if (tr.find('button[name="layer"]').hasClass('checked'))
                 layer.setVisibility(true);
             } else if (!layer.inRange && !b.hasClass('disabled')) {
               var tr = b.parents('tr').first();
               tr.addClass('disabled').find('button').addClass('disabled');
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
                        if ($(b).hasClass('disabled'))
                          checked++;
                        count++;
                      });
                    });
                 if (count == checked)
                   a.addClass('disabled').find('button').addClass('disabled');
                 else
                   a.removeClass('disabled').find('button').removeClass('disabled');
               });
             }
           }

           //pan button
           $('#navbar button.pan').click();
         }
        }

       ,maxExtent:extent
       ,restrictedExtent: restrictedExtent
       ,initialExtent:initialExtent
       ,maxScale: scales.length == 0 ? config.options.minScale : "auto"
       ,minScale: scales.length == 0 ? config.options.maxScale : "auto"
       ,numZoomLevels: scales.length == 0 ? config.options.zoomLevelNumber : scales.length
       ,scales: scales.length == 0 ? null : scales
       ,resolutions: resolutions.length == 0 ? null : resolutions
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
  function updateLocateFeatureList(aName, aJoinField, aJoinValue) {
    var locate = config.locateByLayer[aName];
    // clone features reference
    var features = {};
    for ( var fid in locate.features ) {
        features[fid] = locate.features[fid];
    }
    // filter by filter field name
    if ('filterFieldName' in locate) {
        var filterValue = $('#locate-layer-'+cleanName(aName)+'-'+locate.filterFieldName).val();
        if ( filterValue != '-1' ) {
          for (var fid in features) {
            var feat = features[fid];
            if (feat.properties[locate.filterFieldName] != filterValue)
              delete features[fid];
          }
        } else
          features = {}
    }
    // filter by vector joins
    if ( 'vectorjoins' in locate && locate.vectorjoins.length != 0 ) {
        var vectorjoins = locate.vectorjoins;
        for ( i=0, len =vectorjoins.length; i< len; i++) {
            vectorjoin = vectorjoins[i];
            var jName = vectorjoin.joinLayer;
            if ( jName in config.locateByLayer ) {
                var jLocate = config.locateByLayer[jName];
                var jVal = $('#locate-layer-'+cleanName(jName)).val();
                if ( jVal == '-1' ) continue;
                var jFeat = jLocate.features[jVal];
                for (var fid in features) {
                  var feat = features[fid];
                  if ( feat.properties[vectorjoin.targetFieldName] != jFeat.properties[vectorjoin.joinFieldName] )
                    delete features[fid];
                }
            }
        }
    }
    // create the option list
    var options = '<option value="-1"></option>';
    for (var fid in features) {
      var feat = features[fid];
      options += '<option value="'+feat.id+'">'+feat.properties[locate.fieldName]+'</option>';
    }
    // add option list
    $('#locate-layer-'+cleanName(aName)).html(options);
  }


  /**
   * Zoom to locate feature
   */
  function zoomToLocateFeature(aName) {
    // clean locate layer
    var layer = map.getLayersByName('locatelayer');
    if ( layer.length == 0 )
      return;
    layer = layer[0];
    layer.destroyFeatures();

    // get locate by layer val
    var locate = config.locateByLayer[aName];
    var proj = new OpenLayers.Projection(locate.crs);
    var val = $('#locate-layer-'+cleanName(aName)).val();
    if (val == '-1') {
      return; //don't move the map
      var bbox = new OpenLayers.Bounds(locate.bbox);
      bbox.transform(proj, map.getProjection());
      map.zoomToExtent(bbox);
    } else {
      // zoom to val
      var feat = locate.features[val];
      var format = new OpenLayers.Format.GeoJSON();
      feat = format.read(feat)[0];
      feat.geometry.transform(proj, map.getProjection());
      map.zoomToExtent(feat.geometry.getBounds());
      if (locate.displayGeom == 'True')
        layer.addFeatures([feat]);
    }
  }

  /**
   * Get features for locate by layer tool
   */
  function getLocateFeature(aName) {
    var locate = config.locateByLayer[aName];
    var fields = ['geometry',locate.fieldName];
    // if a filter field is defined
    if ('filterFieldName' in locate)
      fields.push( locate.filterFieldName );
    // check for join fields
    if ( 'filterjoins' in locate ) {
      var filterjoins = locate.filterjoins;
      for ( var i=0, len=filterjoins.length; i<len; i++) {
          var filterjoin = filterjoins[i];
          fields.push( filterjoin.targetFieldName );
      }
    }
    if ( 'vectorjoins' in locate ) {
      var vectorjoins = locate.vectorjoins;
      for ( var i=0, len=vectorjoins.length; i<len; i++) {
          var vectorjoin = vectorjoins[i];
          fields.push( vectorjoin.targetFieldName );
      }
    }
    var typeName = aName.replace(' ','_');
    var layerName = cleanName(aName);
    var wfsOptions = {
      'SERVICE':'WFS'
     ,'VERSION':'1.0.0'
     ,'REQUEST':'GetFeature'
     ,'TYPENAME':typeName
     ,'PROPERTYNAME':fields.join(',')
     ,'OUTPUTFORMAT':'GeoJSON'
    };
    var service = OpenLayers.Util.urlAppend(lizUrls.wms
        ,OpenLayers.Util.getParameterString(lizUrls.params)
    );
    $.get(service
        ,wfsOptions
        ,function(data) {
      var lConfig = config.layers[aName];
      locate['features'] = {};
      var features = data.features;

      if ('filterFieldName' in locate) {
        // create filter combobox for the layer
        features.sort(function(a, b) {
          return a.properties[locate.filterFieldName].localeCompare(b.properties[locate.filterFieldName]);
        });
        var filterPlaceHolder = '';
        if ( 'filterFieldAlias' in locate )
          filterPlaceHolder += locate.filterFieldAlias+' ';
        else
          filterPlaceHolder += locate.filterFieldName+' ';
        filterPlaceHolder += lConfig.title;
        var fOptions = '<option value="-1"></option>';
        var fValue = '-1';
        for (var i=0, len=features.length; i<len; i++) {
          var feat = features[i];
          if ( fValue != feat.properties[locate.filterFieldName] ) {
            fValue = feat.properties[locate.filterFieldName];
            fOptions += '<option value="'+fValue+'">'+fValue+'</option>';
          }
        }
        // add filter values list
        $('#locate-layer-'+layerName).parent().before('<div class="locate-layer"><select id="locate-layer-'+layerName+'-'+locate.filterFieldName+'">'+fOptions+'</select></div><br/>');
        // listen to filter select changes
        $('#locate-layer-'+layerName+'-'+locate.filterFieldName).change(function(){
          var filterValue = $(this).children(':selected').val();
          updateLocateFeatureList( aName );
          if (filterValue == '-1')
            $('#locate-layer-'+layerName+'-'+locate.filterFieldName+' ~ span input').val('');
          $('#locate-layer-'+layerName+' ~ span input').val('');
          $('#locate-layer-'+layerName).val('-1');
          zoomToLocateFeature(aName);
        });
        // add combobox to the filter select
        $('#locate-layer-'+layerName+'-'+locate.filterFieldName).combobox({
          "selected": function(evt, ui){
            if ( ui.item ) {
              var self = $(this);
              var uiItem = $(ui.item);
              window.setTimeout(function(){
                self.val(uiItem.val()).change();
              }, 1);
            }
          }
        });
        // add place holder to the filter combobox input
        $('#locate-layer-'+layerName+'-'+locate.filterFieldName+' ~ span > input').attr('placeholder', filterPlaceHolder).val('');
        updateSwitcherSize();
      }

      // create combobox for the layer
      features.sort(function(a, b) {
        return a.properties[locate.fieldName].localeCompare(b.properties[locate.fieldName]);
      });
      var placeHolder = '';
      if ( 'fieldAlias' in locate )
        placeHolder += locate.fieldAlias+' ';
      placeHolder += lConfig.title;
      var options = '<option value="-1"></option>';
      for (var i=0, len=features.length; i<len; i++) {
        var feat = features[i];
        locate.features[feat.id.toString()] = feat;
        if ( !('filterFieldName' in locate) )
          options += '<option value="'+feat.id+'">'+feat.properties[locate.fieldName]+'</option>';
      }
      // listen to select changes
      $('#locate-layer-'+layerName).html(options).change(function() {
        var val = $(this).children(':selected').val();
        if (val == '-1') {
          $('#locate-layer-'+layerName+' ~ span input').val('');
          // update to join layer
          if ( 'filterjoins' in locate && locate.filterjoins.length != 0 ) {
              var filterjoins = locate.filterjoins;
              for (var i=0, len=filterjoins.length; i<len; i++) {
                  var filterjoin = filterjoins[i];
                  var jName = filterjoin.joinLayer;
                  if ( jName in config.locateByLayer ) {
                      // update joined select options
                      var oldVal = $('#locate-layer-'+cleanName(jName)).val();
                      updateLocateFeatureList( jName );
                      $('#locate-layer-'+cleanName(jName)).val( oldVal );
                      return;
                  }
              }
          }
          // zoom to parent selection
          if ( 'vectorjoins' in locate && locate.vectorjoins.length == 1 ) {
              var jName = locate.vectorjoins[0].joinLayer;
              if ( jName in config.locateByLayer ) {
                zoomToLocateFeature( jName );
                return;
              }
          }
          // clear the map
          zoomToLocateFeature( aName );
        } else {
          // zoom to val
          zoomToLocateFeature( aName );
          // update joined layer
          if ( 'filterjoins' in locate && locate.filterjoins.length != 0 ) {
              var filterjoins = locate.filterjoins;
              for (var i=0, len=filterjoins.length; i<len; i++) {
                  var filterjoin = filterjoins[i];
                  var jName = filterjoin.joinLayer;
                  if ( jName in config.locateByLayer ) {
                      // update joined select options
                      updateLocateFeatureList( jName );
                      $('#locate-layer-'+cleanName(jName)).val('-1');
                      $('#locate-layer-'+cleanName(jName)+' ~ span input').val('');
                  }
              }
          }
        }
        $(this).blur();
        return;
      });
      $('#locate-layer-'+layerName).combobox({
    "minLength": ('minLength' in locate) ? locate.minLength : 0,
        "selected": function(evt, ui){
          if ( ui.item ) {
            var self = $(this);
            var uiItem = $(ui.item);
            window.setTimeout(function(){
              self.val(uiItem.val()).change();
            }, 1);
          }
        }
      });
      $('#locate-layer-'+layerName+' ~ span input').attr('placeholder', placeHolder).val('');
      if ( ('minLength' in locate) && locate.minLength > 0 )
        $('#locate-layer-'+layerName).parent().addClass('no-toggle');
      if(mCheckMobile()){
        // autocompletion items for locatebylayer feature
        $('div.locate-layer select').show();
        $('span.custom-combobox').hide();
      }
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
          if ( url != null && url != '' ) {
            self.find('div.legendGraphics img').attr('src',url);
          }
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
    if (node.length == 0 )
      return null;

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
    $('#switcher button.checkbox')
    .click(function(){
      var self = $(this);
      if (self.hasClass('disabled'))
        return false;
      var descendants = [self.parents('tr').first()];
      descendants = descendants.concat(descendantsOf($(descendants[0])));
      if ( !self.hasClass('checked') ) {
        $.each(descendants,function(i,tr) {
          $(tr).find('button.checkbox').removeClass('partial').addClass('checked');
          $(tr).find('button.checkbox[name="layer"]').each(function(i,b){
            var name = $(b).val();
            var layer = map.getLayersByName(name)[0];
            layer.setVisibility(true);
          });
        });
        self.removeClass('partial').addClass('checked');
      } else {
        $.each(descendants,function(i,tr) {
          $(tr).find('button.checkbox').removeClass('partial').removeClass('checked');
          $(tr).find('button.checkbox[name="layer"]').each(function(i,b){
            var name = $(b).val();
            var layer = map.getLayersByName(name)[0];
            layer.setVisibility(false);
          });
        });
        self.removeClass('partial').removeClass('checked');
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
            b = $(b);
            if ( b.hasClass('checked') )
              checked++;
            else if ( b.hasClass('partial')&& b.hasClass('checked') )
              pchecked++;
            count++;
          });
        });
        var trButt = tr.find('button.checkbox');
        if (count==checked)
          trButt.removeClass('partial').addClass('checked');
        else if (checked==0 && pchecked==0)
          trButt.removeClass('partial').removeClass('checked');
        else
          trButt.addClass('partial').addClass('checked');
      });
    });

    // activate link buttons
    $('#switcher button.link')
    .click(function(){
      var self = $(this);
      if (self.hasClass('disabled'))
        return false;
      var windowLink = self.val();
      // Test if the link is internal
      var mediaRegex = /^(\/)?media\//;
      if(mediaRegex.test(windowLink)){
        var mediaLink = OpenLayers.Util.urlAppend(lizUrls.media
          ,OpenLayers.Util.getParameterString(lizUrls.params)
        )
        windowLink = mediaLink+'&path=/'+windowLink;
      }
      // Open link in a new window
      window.open(windowLink);
    });

    // Activate removeCache button
    $('#switcher button.removeCache')
    .click(function(){
      var self = $(this);
      if (self.hasClass('disabled'))
        return false;
      var removeCacheServerUrl = OpenLayers.Util.urlAppend(
         lizUrls.removeCache
        ,OpenLayers.Util.getParameterString(lizUrls.params)
      );
      var windowLink = removeCacheServerUrl + '&layer=' + self.val();
      // Open link in a new window
      if (confirm(lizDict['tree.button.removeCache'] + ' ?'))
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
      if (a.order == b.order)
        return 0;
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
      if (l.isVisible)
        $('#switcher button.checkbox[name="layer"][value="'+l.name+'"]').click();
    }

    // Add Locate by layer
    if ('locateByLayer' in config) {
      var locateByLayerList = [];
      for (var lname in config.locateByLayer) {
        if ( 'order' in config.locateByLayer[lname] )
          locateByLayerList[ config.locateByLayer[lname].order ] = lname;
        else
          locateByLayerList.push( lname );
      }
      var locateContent = [];
      for (var l in locateByLayerList) {
        var lname = locateByLayerList[l];
        var lConfig = config.layers[lname];
        var html = '<div class="locate-layer">';
        html += '<select id="locate-layer-'+cleanName(lname)+'" class="label">';
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
      var service = OpenLayers.Util.urlAppend(lizUrls.wms
          ,OpenLayers.Util.getParameterString(lizUrls.params)
      );
      $.get(service, {
          'SERVICE':'WFS'
         ,'VERSION':'1.0.0'
         ,'REQUEST':'GetCapabilities'
      }, function(xml) {
        var featureTypes = $(xml).find('FeatureType');
        if (featureTypes.length == 0 ){
          config.locateByLayer = {};
          $('#toggleLocate').parent().remove();
          $('#locate-menu').remove();
          updateSwitcherSize();
        } else {
          featureTypes.each( function(){
            var self = $(this);
            var typeName = self.find('Name').text();
            var lname = '';
            if (typeName in config.locateByLayer)
              lname = typeName
            else {
              for (lbl in config.locateByLayer) {
                if (lbl.replace(' ','_') == typeName)
                  lname = lbl;
              }
            }
            if (lname != '') {
              var locate = config.locateByLayer[lname];
              locate['crs'] = self.find('SRS').text();
              if ( locate.crs in Proj4js.defs )
                new OpenLayers.Projection(locate.crs);
              else
                $.get(service, {
                  'REQUEST':'GetProj4'
                 ,'authid': locate.crs
                }, function ( aText ) {
                  Proj4js.defs[locate.crs] = aText;
                  new OpenLayers.Projection(locate.crs);
                }, 'text');
              var bbox = self.find('LatLongBoundingBox');
              locate['bbox'] = [
                parseFloat(bbox.attr('minx'))
               ,parseFloat(bbox.attr('miny'))
               ,parseFloat(bbox.attr('maxx'))
               ,parseFloat(bbox.attr('maxy'))
              ];
            }
          } );

          // get joins
          for (var lName in config.locateByLayer) {
            var locate = config.locateByLayer[lName];
            if ('vectorjoins' in locate && locate['vectorjoins'].length != 0) {
              var vectorjoin = locate['vectorjoins'][0];
              locate['joinFieldName'] = vectorjoin['targetFieldName'];
              for (var jName in config.locateByLayer) {
                var jLocate = config.locateByLayer[jName];
                if (jLocate.layerId == vectorjoin.joinLayerId) {
                  vectorjoin['joinLayer'] = jName;
                  locate['joinLayer'] = jName;
                  jLocate['joinFieldName'] = vectorjoin['joinFieldName'];
                  jLocate['joinLayer'] = lName;
                  jLocate['filterjoins'] = [{
                      'targetFieldName': vectorjoin['joinFieldName'],
                      'joinFieldName': vectorjoin['targetFieldName'],
                      'joinLayerId': locate.layerId,
                      'joinLayer': lName
                  }];
                }
              }
            }
          }

          // get locate by layers features
          for (var lname in config.locateByLayer) {
            getLocateFeature(lname);
          }
          $('#locate-menu button.btn-locate-clear').click(function() {
            var layer = map.getLayersByName('locatelayer')[0];
            layer.destroyFeatures();
            $('#locate select').val('-1');
          });
        }
      },'xml');
      $('#locate-menu').show();
    }

    $('#switcher span.label').tooltip();

    if( $('#switcher').hasClass('hideGroupCheckbox') ) {
      $('#switcher button[name="group"]').hide();
    }
  }

  /**
   * PRIVATE function: createOverview
   * create the overview
   */
  function createOverview() {
    var service = OpenLayers.Util.urlAppend(lizUrls.wms
        ,OpenLayers.Util.getParameterString(lizUrls.params)
    );
    var ovLayer = new OpenLayers.Layer.WMS('overview'
        ,service
        ,{
          layers:'Overview'
         ,version:'1.3.0'
         ,exceptions:'application/vnd.ogc.se_inimage'
         ,format:'image/png'
         ,transparent:true
         ,dpi:96
        },{
          isBaseLayer:true
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
        {div: document.getElementById("overview-map"),
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
      $('#overview-map').hide();
      $('#overview-toggle').hide().removeClass('active');
    }

    /*
    $('#overview-map .ui-dialog-titlebar-close').button({
      text:false,
      icons:{primary: "ui-icon-closethick"}
    }).click(function(){
      $('#overview-map').toggle();
      return false;
    });
    */
    $('#overview-toggle')/*.button({
      text:false,
      icons:{primary: "ui-icon-triangle-1-n"}
    })
    .removeClass( "ui-corner-all" )*/
    .click(function(){
      var self = $(this);
      if ( self.hasClass('active') )
        self.removeClass('active');
      else
        self.addClass('active');
        /*
      var self = $(this);
      var icons = self.button('option','icons');
      if (icons.primary == 'ui-icon-triangle-1-n')
        self.button('option','icons',{primary:'ui-icon-triangle-1-s'});
      else
        self.button('option','icons',{primary:'ui-icon-triangle-1-n'});
        * */
      $('#overview-map').toggle();
      return false;
    });

    map.addControl(new OpenLayers.Control.Scale(document.getElementById('scaletext')));
    map.addControl(new OpenLayers.Control.ScaleLine({div:document.getElementById('scaleline')}));

    var mpUnitSelect = $('#mouseposition-bar > select');
    var mapUnits = map.projection.getUnits();
    if ( mapUnits == 'degrees' ) {
      mpUnitSelect.find('option[value="m"]').remove();
      mpUnitSelect.find('option[value="f"]').remove();
    } else if ( mapUnits == 'm' ) {
      mpUnitSelect.find('option[value="f"]').remove();
    } else {
      mpUnitSelect.find('option[value="m"]').remove();
    }
    var mousePosition = new OpenLayers.Control.lizmapMousePosition({
        displayUnit:mpUnitSelect.val(),
        numDigits: 0,
        prefix: '',
        emptyString:$('#mouseposition').attr('title'),
        div:document.getElementById('mouseposition')
        });
    map.addControl( mousePosition );
    mpUnitSelect.change(function() {
        var mpSelectVal = $(this).val();
        if (mpSelectVal == 'm')
          mousePosition.numDigits = 0;
        else
          mousePosition.numDigits = 5;
        mousePosition.displayUnit = mpSelectVal;
    });

    if (config.options.hasOverview)
      if(!mCheckMobile()) {
        $('#overview-map').show();
        $('#overview-toggle').show().addClass('active');
      }
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
          $('#zoom-in-max-msg').show('slow', function() {
            window.setTimeout(function(){$('#zoom-in-max-msg').hide('slow')},1000)
          });
        } else if ( ui.value != map.zoom )
          map.zoomTo(ui.value);
      }
    });
    $('#navbar button.pan').click(function(){
      var self = $(this);
      if (self.hasClass('active'))
        return false;
      $('#navbar button.zoom').removeClass('active');
      self.addClass('active');
      map.getControlsByClass('OpenLayers.Control.ZoomBox')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.Navigation')[0].activate();
      map.getControlsByClass('OpenLayers.Control.WMSGetFeatureInfo')[0].activate();
    });
    $('#navbar button.zoom').click(function(){
      var self = $(this);
      if (self.hasClass('active'))
        return false;
      $('#navbar button.pan').removeClass('active');
      self.addClass('active');
      map.getControlsByClass('OpenLayers.Control.Navigation')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.WMSGetFeatureInfo')[0].deactivate();
      map.getControlsByClass('OpenLayers.Control.ZoomBox')[0].activate();
    });
    $('#navbar button.zoom-extent')
    .click(function(){
      map.zoomToExtent(map.initialExtent);
    });
    $('#navbar button.zoom-in')
    .click(function(){
      if (map.getZoom() == map.baseLayer.numZoomLevels-1)
          $('#zoom-in-max-msg').show('slow', function() {
            window.setTimeout(function(){$('#zoom-in-max-msg').hide('slow')},1000)
          });
      else
        map.zoomIn();
    });
    $('#navbar button.zoom-out')
    .click(function(){
      map.zoomOut();
    });
    if ( ('zoomHistory' in config.options)
        && config.options['zoomHistory'] == "True") {
      var hCtrl =  new OpenLayers.Control.NavigationHistory();
      map.addControls([hCtrl]);
      $('#navbar button.previous').click(function(){
        var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
        if (ctrl && ctrl.previousStack.length != 0)
          ctrl.previousTrigger();
        if (ctrl && ctrl.previous.active)
          $(this).removeClass('disabled');
        else
          $(this).addClass('disabled');
        if (ctrl && ctrl.next.active)
          $('#navbar button.next').removeClass('disabled');
        else
          $('#navbar button.next').addClass('disabled');
      });
      $('#navbar button.next').click(function(){
        var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
        if (ctrl && ctrl.nextStack.length != 0)
          ctrl.nextTrigger();
        if (ctrl && ctrl.next.active)
          $(this).removeClass('disabled');
        else
          $(this).addClass('disabled');
        if (ctrl && ctrl.previous.active)
          $('#navbar button.previous').removeClass('disabled');
        else
          $('#navbar button.previous').addClass('disabled');
      });
      map.events.on({
        moveend : function() {
          var ctrl = map.getControlsByClass('OpenLayers.Control.NavigationHistory')[0];
          if (ctrl && ctrl.previousStack.length != 0)
            $('#navbar button.previous').removeClass('disabled');
          else
            $('#navbar button.previous').addClass('disabled');
          if (ctrl && ctrl.nextStack.length != 0)
            $('#navbar button.next').removeClass('disabled');
          else
            $('#navbar button.next').addClass('disabled');
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


    addEditionControls();

    if ( ('measure' in configOptions)
        && configOptions['measure'] == 'True')
      addMeasureControls();
    else {
      $('#measure').parent().remove();
      $('#measure-length-menu').remove();
      $('#measure-area-menu').remove();
      $('#measure-perimeter-menu').remove();
    }

    if ( 'externalSearch' in configOptions )
      addExternalSearch();
    else
      $('#nominatim-search').remove();

  }

  function deactivateToolControls( evt ) {
    for (var id in controls) {
      var ctrl = controls[id];
      if (evt && ('object' in evt) && ctrl == evt.object)
        continue;
      if (ctrl.type == OpenLayers.Control.TYPE_TOOL)
        ctrl.deactivate();
    }
    return true;
  }

  function addFeatureInfo() {
      var info = new OpenLayers.Control.WMSGetFeatureInfo({
            url: OpenLayers.Util.urlAppend(lizUrls.wms
              ,OpenLayers.Util.getParameterString(lizUrls.params)
            ),
            title: 'Identify features by clicking',
            type:OpenLayers.Control.TYPE_TOGGLE,
            queryVisible: true,
            infoFormat: 'text/html',
            eventListeners: {
                getfeatureinfo: function(event) {
                    var text = event.text;
                    if (!text || text == null || text == '')
                        return false;

                    if (map.popups.length != 0)
                        map.removePopup(map.popups[0]);

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
                          return false;
                        }
                    );
                    popup.panMapIfOutOfView = true;
                    map.addPopup(popup);

                    // Trigger event
                    lizMap.events.triggerEvent(
                        "lizmappopupdisplayed"
                    );

                    popup.verifySize();
                    // Hide navbar and overview in mobile mode
                    if(mCheckMobile()){
                        $('#navbar').hide();
                        $('#overview-box').hide();
                    }
                }
            }
     });
     if (lizUrls.publicUrlList && lizUrls.publicUrlList.length != 0 ) {
        var layerUrls = [];
        for (var j=0, jlen=lizUrls.publicUrlList.length; j<jlen; j++) {
          layerUrls.push(
            OpenLayers.Util.urlAppend(
              lizUrls.publicUrlList[j],
              OpenLayers.Util.getParameterString(lizUrls.params)
            )
          );
        }
        info.layerUrls = layerUrls;
     }
     info.findLayers = function() {
        var candidates = this.layers || this.map.layers;
        var layers = [];
        var layer, url;
        for(var i=0, len=candidates.length; i<len; ++i) {
            layer = candidates[i];
            if(layer instanceof OpenLayers.Layer.WMS  &&
               (!this.queryVisible || (layer.getVisibility() && layer.calculateInRange()))) {
                var qgisName = null;
                if ( layer.name in cleanNameMap )
                    qgisName = cleanNameMap[layer.name];
                var configLayer = null;
                if ( qgisName )
                    configLayer = config.layers[qgisName];
                if ( !configLayer )
                    configLayer = config.layers[layer.params['LAYERS']];
                if ( !configLayer )
                    configLayer = config.layers[layer.name];
                if( configLayer && configLayer.popup && configLayer.popup == 'True' && configLayer.externalWmsToggle != 'True'){
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

  function getPrintScale( aScales ) {
      var newScales = [];
      for ( var i=0, len = aScales.length; i<len; i++ ) {
          newScales.push( parseFloat(aScales[i]) );
      }
      newScales.sort(function(a,b){return b-a;});
    var scale = map.getScale();
    var scaleIdx = $.inArray( scale, newScales );
    if ( scaleIdx == -1 ) {
    var s=0, slen=newScales.length;
    while ( scaleIdx == -1 && s<slen ) {
      if ( scale > newScales[s] )
        scaleIdx = s;
      else
       s++;
    }
    if( s == slen ) {
      scale = newScales[slen-1];
    } else {
      scale = newScales[scaleIdx];
    }
    }
    return scale;
  }

  function drawPrintBox( aLayout, aLayer, aScale ) {
    var size = aLayout.size;
    var units = map.getUnits();
    var unitsRatio = OpenLayers.INCHES_PER_UNIT[units];
    var w = size.width / 72 / unitsRatio * aScale / 2;
    var h = size.height / 72 / unitsRatio * aScale / 2;
      if ( aLayer.features.length == 0 ) {
          var center = map.getCenter();
          var bounds = new OpenLayers.Bounds(center.lon - w, center.lat - h,
            center.lon + w, center.lat + h);
          var geom = bounds.toGeometry();
          aLayer.addFeatures([
              new OpenLayers.Feature.Vector( geom )
          ]);
      } else {
          var feat = aLayer.features[0];
          var center = feat.geometry.getBounds().getCenterLonLat();
          var bounds = new OpenLayers.Bounds(center.lon - w, center.lat - h,
            center.lon + w, center.lat + h);
          var geom = bounds.toGeometry();
          geom.id = feat.geometry.id;
          feat.geometry = geom;
          aLayer.drawFeature(feat);
      }
    return true;
  }

  function getPrintGridInterval( aLayout, aScale, aScales ) {
    var size = aLayout.size;
    var units = map.getUnits();
    var unitsRatio = OpenLayers.INCHES_PER_UNIT[units];
    var w = size.width / 72 / unitsRatio * aScale;
    var h = size.height / 72 / unitsRatio * aScale;

      var refScale = w > h ? w : h;
      var newScales = [];
      for ( var i=0, len = aScales.length; i<len; i++ ) {
          newScales.push( parseFloat(aScales[i]) );
      }
      newScales.sort(function(a,b){return b-a;});
      var theScale = newScales[0];
      console.log( 'theScale: '+theScale );
      for ( var i=0, len=newScales.length; i<len; i++ ) {
          var s = newScales[i];
          console.log( 's: '+s );
          if ( s > refScale )
            theScale = s;
          if ( s < refScale )
            break;
      }
      return theScale/10;
  }

  function addPrintControl() {
    if ( !config['printTemplates'] || config.printTemplates.length == 0 ) {
      $('#togglePrint').parent().remove();
      return false;
    }
    var ptTomm = 0.35277; //conversion pt to mm
    var printCapabilities = {scales:[],layouts:[]};

    var scales = map.scales;
    if ( config.options.mapScales.length > 2 )
      scales = config.options.mapScales;
    if ( scales == null && map.resolutions != null ) {
      scales = [];
      for( var i=0, len=map.resolutions.length; i<len; i++ ){
        var units = map.getUnits();
        var res = map.resolutions[i];
        var scale = OpenLayers.Util.getScaleFromResolution(res, units);
        scales.push(scale);
      }
    }
    if ( scales == null ) {
      $('#togglePrint').parent().remove();
      return false;
    }
    if ( scales[0] < scales[scales.length-1] )
      scales.reverse();

    var scaleOptions = '';
    for( var i=0, len=scales.length; i<len; i++ ){
        var scale = scales[i];
        printCapabilities.scales.push(scale);
        var scaleText = scale;
        if (scaleText > 10)
            scaleText = Math.round(scaleText)
        else
            scaleText = Math.round(scaleText*100)/100
        scaleText = scaleText.toLocaleString()
        scaleOptions += '<option value="'+scale+'">'+scaleText+'</option>';
    }
    $('#print-menu select.btn-print-scales').html(scaleOptions);

    // creating printCapabilities layouts
    var pTemplates = config.printTemplates;
    for( var i=0, len=pTemplates.length; i<len; i++ ){
      var pTemplate = pTemplates[i];
      var pMap = null;
      var pMapIdx = 0;
      var pOverview = null;
      while( pMap == null && pMapIdx < pTemplate.maps.length) {
        pMap = pTemplate.maps[pMapIdx];
        if( pMap['overviewMap'] ) {
          pOverview = pTemplate.maps[pMapIdx];
          pMap = null;
          pMapIdx += 1;
        }
      }
      if ( pMap == null )
        continue;
      var mapWidth = Number(pMap.width) / ptTomm;
      var mapHeight = Number(pMap.height) / ptTomm;
      //for some strange reason we need to provide a "map" and a "size" object with identical content
      printCapabilities.layouts.push({
        "name": pTemplate.title,
        "map": {
          "width": mapWidth,
          "height": mapHeight
        },
        "size": {
          "width": mapWidth,
          "height": mapHeight
        },
        "rotation": false,
        "template": pTemplate,
        "mapId": pMap.id,
        "overviewId": pOverview != null ? pOverview.id : null
      });
    }

    // if no printCapabilities layouts removed print
    if( printCapabilities.layouts.length == 0 ) {
      $('#togglePrint').parent().remove();
      return false;
    }

    // creating the print layer
    var layer = map.getLayersByName('Print');
    if ( layer.length == 0 ) {
      layer = new OpenLayers.Layer.Vector('Print',{
        styleMap: new OpenLayers.StyleMap({
          "default": new OpenLayers.Style({
            fillColor: "#D43B19",
            fillOpacity: 0.2,
            strokeColor: "#CE1F2D",
            strokeWidth: 1
          })
        })
      });
      map.addLayer(layer);
      layer.setVisibility(false);
    } else
      layer = layer[0];

    // creating print menu
    for( var i=0, len= printCapabilities.layouts.length; i<len; i++ ){
      var layout = printCapabilities.layouts[i];
      $('#togglePrint ~ .dropdown-menu').append('<li><a href="#'+i+'">'+layout.name+'</a></li>');
    }

    var dragCtrl = new OpenLayers.Control.DragFeature(layer,{
      geometryTypes: ['OpenLayers.Geometry.Polygon'],
      type:OpenLayers.Control.TYPE_TOOL,
      layout: null,
      eventListeners: {
        "activate": function(evt) {
          if (this.layout == null)
            return false;

          deactivateToolControls(evt);

          var layout = this.layout;
          // get print scale
          var scale = getPrintScale( printCapabilities.scales );
          // update the select
          $('#print-menu select.btn-print-scales').val(scale);
          // draw print box
          drawPrintBox( layout, layer, scale );

          $('#togglePrint').parent().addClass('active');
          $('#print-menu .title .text').html(layout.name);
          $('#print-menu').show();
          updateSwitcherSize();
          mAddMessage(lizDict['print.activate'],'info',true).addClass('print');
          layer.setVisibility(true);
          evt.object.clickFeature(layer.features[0]);
        },
        "deactivate": function(evt) {
          layer.setVisibility(false);
          $('#togglePrint').parent().removeClass('active');
          $('#print-menu').hide();
          updateSwitcherSize();
          $('#message .print').remove();
          this.layout = null;
          layer.destroyFeatures();
        }
      }
    });
    map.addControls([dragCtrl]);
    controls['printDrag'] = dragCtrl;

    // set event listener to togglePrint
    $('#togglePrint ~ .dropdown-menu').find('a').click(function() {
      var self = $(this);
      var layout = printCapabilities.layouts[parseInt( self.attr('href').slice(1) )];
      if ( layout.template.labels.length != 0 ) {
        var labels = '';
        for (var i=0, len=layout.template.labels.length; i<len; i++){
          var tLabel = layout.template.labels[i];
          var label = '';
          if (tLabel.htmlState == 0) {
            label = '<input name="'+tLabel.id+'" class="print-label" placeholder="'+tLabel.text+'" value="'+tLabel.text+'"></input>'
          } else {
            label = '<textarea name="'+tLabel.id+'" class="print-label" placeholder="'+tLabel.text+'">'+tLabel.text+'</textarea>'
          }
          labels += label;
        }
        $('#print-menu .print-labels').html(labels);
        $('#print-menu .print-labels').show();
      } else {
        $('#print-menu .print-labels').html('');
        $('#print-menu .print-labels').hide();
      }
      if (dragCtrl.active && dragCtrl.layout == layout) {
        dragCtrl.deactivate();
      } else if (dragCtrl.active) {
        dragCtrl.deactivate();
        dragCtrl.layout = layout;
        dragCtrl.activate();
      } else {
        dragCtrl.layout = layout;
        dragCtrl.activate();
      }
      if ( $('#togglePrint ~ .dropdown-menu').is(':visible') )
        $('#togglePrint').dropdown('toggle');
      return false;
    });

    $('#print-menu button.btn-print-clear').click(function() {
      dragCtrl.deactivate();
      return false;
    });
    $('#print-menu select.btn-print-scales').change(function() {
      if ( dragCtrl.active && layer.getVisibility() ) {
        var self = $(this);
        var scale = parseFloat(self.val());
        // draw print box
        drawPrintBox( dragCtrl.layout, layer, scale );
      }
    });
    $('#print-menu button.btn-print-launch').click(function() {
      var pTemplate = dragCtrl.layout.template;
      var extent = dragCtrl.layer.features[0].geometry.getBounds();
      var url = OpenLayers.Util.urlAppend(lizUrls.wms
          ,OpenLayers.Util.getParameterString(lizUrls.params)
          );
      url += '&SERVICE=WMS';
      //url += '&VERSION='+capabilities.version+'&REQUEST=GetPrint';
      url += '&VERSION=1.3&REQUEST=GetPrint';
      url += '&FORMAT=pdf&EXCEPTIONS=application/vnd.ogc.se_inimage&TRANSPARENT=true';
      url += '&SRS='+map.projection;
      url += '&DPI=300';
      url += '&TEMPLATE='+pTemplate.title;
      url += '&'+dragCtrl.layout.mapId+':extent='+extent;
      //url += '&'+dragCtrl.layout.mapId+':rotation=0';
      var scale = $('#print-menu select.btn-print-scales').val();
      url += '&'+dragCtrl.layout.mapId+':scale='+scale;
      var gridInterval = getPrintGridInterval( dragCtrl.layout, parseFloat(scale), printCapabilities.scales );
      url += '&'+dragCtrl.layout.mapId+':grid_interval_x='+gridInterval;
      url += '&'+dragCtrl.layout.mapId+':grid_interval_y='+gridInterval;
      var printLayers = [];
      $.each(map.layers, function(i, l) {
        if (l.getVisibility() && l.CLASS_NAME == "OpenLayers.Layer.WMS")
        printLayers.push(l.params['LAYERS']);
      });
      printLayers.reverse();

      // Get active baselayer, and add the corresponding QGIS layer if needed
      var activeBaseLayerName = map.baseLayer.name;
      if ( activeBaseLayerName in externalBaselayersReplacement ) {
        printLayers.push(externalBaselayersReplacement[activeBaseLayerName]);
      }

      url += '&'+dragCtrl.layout.mapId+':LAYERS='+printLayers.join(',');
      if ( dragCtrl.layout.overviewId != null
          && config.options.hasOverview ) {
        var bbox = config.options.bbox;
        var oExtent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
        url += '&'+dragCtrl.layout.overviewId+':extent='+oExtent;
        url += '&'+dragCtrl.layout.overviewId+':LAYERS=Overview';
        printLayers.unshift('Overview');
      }
      url += '&LAYERS='+printLayers.join(',');
      var labels = $('#print-menu .print-labels').find('input, textarea').serialize();
      if ( labels != "" )
        url += '&'+labels;
      window.open(url);
      return false;
    });
    map.events.on({
      "zoomend": function() {
        if ( dragCtrl.active && layer.getVisibility() ) {
        // get scale
      var scale = getPrintScale( printCapabilities.scales );
      // update the select
          $('#print-menu select.btn-print-scales').val(scale);
          // draw print box
          drawPrintBox( dragCtrl.layout, layer, scale );
        }
      }
    });
  }

  function addEditionControls() {
    // Edition layers
    if ('editionLayers' in config) {
      //initialize edition
      $('#edition-modal').modal();
      var service = OpenLayers.Util.urlAppend(lizUrls.edition
        ,OpenLayers.Util.getParameterString(lizUrls.params)
      );
      for (var alName in config.editionLayers) {
        var al = config.editionLayers[alName];
        if (al.capabilities.modifyGeometry == "False"
         && al.capabilities.modifyAttribute == "False"
         && al.capabilities.deleteFeature == "False"
         && al.capabilities.createFeature == "False") {
          delete config.editionLayers[alName];
          continue;
        }
        if (alName in config.layers) {
          var alConfig = config.layers[alName];
          $('#edition ~ .dropdown-menu').append('<li><a href="#'+alName+'">'+alConfig.title+'</a></li>');
        }
      }

      // initiatlize layer
      // style the sketch fancy
      var sketchSymbolizers = {
        "Point": {
          pointRadius: 6
        },
        "Line": {
          strokeWidth: 4
        },
        "Polygon": {
          strokeWidth: 2
        }
      };
      var style = new OpenLayers.Style();
      style.addRules([
          new OpenLayers.Rule({symbolizer: sketchSymbolizers})
          ]);
      var styleMap = new OpenLayers.StyleMap({"default": style});
      var editLayer = new OpenLayers.Layer.Vector('editLayer',{styleMap:styleMap});
      map.addLayer(editLayer);

      // initialize controls
      OpenLayers.Control.EditionClick =
        OpenLayers.Class(OpenLayers.Control, {
          defaultHandlerOptions: {
            'single': true,
            'double': false,
            'pixelTolerance': 0,
            'stopSingle': true,
            'stopDouble': false
          },
          layerId: '',
          clickTolerance: 5,
          initialize: function(options) {
            this.handlerOptions = OpenLayers.Util.extend(
              {}, this.defaultHandlerOptions
            );
            OpenLayers.Control.prototype.initialize.apply(
              this, arguments
            );
            this.handler = new OpenLayers.Handler.Click(
              this, {
                'click': this.trigger
              }, this.handlerOptions
            );
          },
          pixelToBounds: function(pixel) {
            var llPx = pixel.add(-this.clickTolerance/2, this.clickTolerance/2);
            var urPx = pixel.add(this.clickTolerance/2, -this.clickTolerance/2);
            var ll = this.map.getLonLatFromPixel(llPx);
            var ur = this.map.getLonLatFromPixel(urPx);
            return new OpenLayers.Bounds(ll.lon, ll.lat, ur.lon, ur.lat);
          },
          trigger: function(e) {
            var bounds = this.pixelToBounds(e.xy);
            var crs = this.map.getProjectionObject().toString();
            if ( crs == 'EPSG:900913' )
              crs = 'EPSG:3857';
            $.get(service,{
              layerId: this.layerId,
              bbox: bounds.toBBOX(),
              crs: crs
            }, function(data){
              $('#edition-modal').html(data);
              $('#edition-modal form').submit(function() {
                var self = $(this);
                var srid = self.find('input[name="liz_srid"]').val();
                if ( !('EPSG:'+srid in Proj4js.defs) )
                  Proj4js.defs['EPSG:'+srid] = self.find('input[name="liz_proj4"]').val();
                var geom = self.find('input[name="liz_geometryColumn"]').val();
                var wkt = self.find('input[name="'+geom+'"]').val();
                var format = new OpenLayers.Format.WKT({
                  externalProjection: 'EPSG:'+srid,
                  internalProjection: editLayer.projection
                });
                var feat = format.read(wkt);
                feat.fid = self.find('input[name="liz_featureId"]').val();
                var form = $('#edition-menu form');
                form.find('input[name="liz_srid"]').val(srid);
                form.find('input[name="liz_geometryColumn"]').val(geom);
                form.find('input[name="liz_wkt"]').val(feat.geometry);
                form.find('input[name="liz_featureId"]').val(feat.fid);
                editLayer.addFeatures([feat]);
                $('#edition-modal').modal('hide');
                return false;
              });
              if ( $('#edition-modal form').length == 1)
                $('#edition-modal form').submit();
              else
                $('#edition-modal').modal('show');
            });
            return false;
          }
        });
      var editCtrls = {
        panel: new OpenLayers.Control({
          type: OpenLayers.Control.TYPE_TOOL,
          eventListeners: {
            activate: function( evt ) {
              deactivateToolControls( evt );
            },
            deactivate: function( evt ) {
              for ( var c in editCtrls ) {
                if ( editCtrls[c].active )
                  editCtrls[c].deactivate();
              }
              $('#edition-menu').hide();
            }
          }
        }),
        click: new OpenLayers.Control.EditionClick(),
        point: new OpenLayers.Control.DrawFeature(editLayer,
                   OpenLayers.Handler.Point),
        line: new OpenLayers.Control.DrawFeature(editLayer,
            OpenLayers.Handler.Path),
        polygon: new OpenLayers.Control.DrawFeature(editLayer,
            OpenLayers.Handler.Polygon),
        modify: new OpenLayers.Control.ModifyFeature(editLayer)
      };
      for ( var ctrl in editCtrls ) {
        map.addControls([editCtrls[ctrl]]);
      }
      controls['edition'] = editCtrls.panel;

      function manageEditionAdd(aData) {
        $('#edition-modal').html(aData);
        $('#edition-modal form').submit(function() {
          var self = $(this);
          $.post(self.attr('action'),
            self.serialize(),
            function(data) {
              manageEditionAdd(data);
            });
          return false;
        });
        if ( $('#edition-modal form').length != 0 ) {
          $('#edition-modal button[data-dismiss="modal"]').click(
            function() {
              editLayer.destroyFeatures();
              $('#edition-draw-clear').addClass('disabled');
              $('#edition-draw-save').addClass('disabled');
            }
          );
        }
        if ( $('#edition-modal form').length == 0 ) {
          for ( var ctrl in editCtrls ) {
            if ( ctrl !="panel" && editCtrls[ctrl].active)
              editCtrls[ctrl].deactivate();
          }
          var layerId = editCtrls.click.layerId;
          $.each(layers, function(i, l) {
            if (config.layers[l.params['LAYERS']].id != layerId)
              return true;
            l.redraw(true);
            return false;
          });
          editLayer.destroyFeatures();
          editCtrls.modify.activate();
          $('#edition-draw-clear').addClass('disabled');
          $('#edition-draw-save').addClass('disabled');
        }
      }

      function manageEditionGeom(aData) {
        $('#edition-modal').html(aData);
        $('#edition-modal form').submit(function() {
          var self = $(this);
          $.post(self.attr('action'),
            self.serialize(),
            function(data) {
              manageEditionGeom(data);
            });
          return false;
        });
        if ( $('#edition-modal form').length != 0 ) {
          $('#edition-modal button[data-dismiss="modal"]').click(
            function() {
              var format = new OpenLayers.Format.WKT();
              var wkt = $('#edition-menu form input[name="liz_wkt"]').val();
              var wktFeat = format.read(wkt);
              var geom = wktFeat.geometry.clone();
              var feat = editLayer.features[0];
              geom.id = feat.geometry.id;
              feat.geometry = geom;
              editLayer.drawFeature(feat);
              if (config.editionLayers[editCtrls.click.layerName].capabilities.modifyGeometry == "True")
                editCtrls.modify.selectFeature(feat);
            }
          );
        }
        if ( $('#edition-modal form').length == 0 ) {
          var layerId = editCtrls.click.layerId;
          $.each(layers, function(i, l) {
            if (config.layers[l.params['LAYERS']].id != layerId)
              return true;
            l.redraw(true);
            return false;
          });
          editLayer.drawFeature(editLayer.features[0]);
          if (config.editionLayers[editCtrls.click.layerName].capabilities.modifyGeometry == "True")
            editCtrls.modify.selectFeature(editLayer.features[0]);
        }
      }

      // edit layer events
      editLayer.events.on({
        featureadded: function(evt) {
          if ( editCtrls.click.active ) {
            editCtrls.click.deactivate();
            $('#lizmap-edition-message').remove();
            if (config.editionLayers[editCtrls.click.layerName].capabilities.modifyGeometry == "True") {
              editCtrls.modify.activate();
              editCtrls.modify.selectFeature(evt.feature);
              mAddMessage(lizDict['edition.select.modify.activate'],'info',true).attr('id','lizmap-edition-message');
            }
            $('#edition-select-unselect').removeClass('disabled');
            $('#edition-select-attr').removeClass('disabled');
            $('#edition-select-delete').removeClass('disabled');
          } else {
            $.get(service.replace('getFeature','createFeature'),{
              layerId: editCtrls.click.layerId,
            }, function(data){
              manageEditionAdd(data);
              var form = $('#edition-modal form');
              var srid = form.find('input[name="liz_srid"]').val();
              if ( !('EPSG:'+srid in Proj4js.defs) )
                Proj4js.defs['EPSG:'+srid] = form.find('input[name="liz_proj4"]').val();
              var gColumn = form.find('input[name="liz_geometryColumn"]').val();
              var geom = editLayer.features[0].geometry.clone();
              geom.transform(editLayer.projection,'EPSG:'+srid);
              $('#edition-modal form input[name="'+gColumn+'"]').val(geom);
              $('#edition-modal').modal('show');
            });
          }
        },
        featureselected: function(evt) {
          $('#edition-menu form input[name="liz_wkt"]').val(evt.feature.geometry);
        },
        featureunselected: function(evt) {
          var wkt = $('#edition-menu form input[name="liz_wkt"]').val();
          $.get(service.replace('getFeature','modifyFeature'),{
            layerId: editCtrls.click.layerId,
            featureId: evt.feature.fid
          }, function(data){
            manageEditionGeom(data);
            var form = $('#edition-modal form');
            var srid = form.find('input[name="liz_srid"]').val();
            if ( !('EPSG:'+srid in Proj4js.defs) )
              Proj4js.defs['EPSG:'+srid] = form.find('input[name="liz_proj4"]').val();
            var gColumn = form.find('input[name="liz_geometryColumn"]').val();
            var geom = evt.feature.geometry.clone();
            geom.transform(editLayer.projection,'EPSG:'+srid);
            $('#edition-modal form input[name="'+gColumn+'"]').val(geom);
            if (config.editionLayers[editCtrls.click.layerName].capabilities.modifyAttribute == "False") {
              form.submit();
              form.hide();
            }
            $('#edition-modal').modal('show');
          });
        },
        afterfeaturemodified: function(evt) {
          editLayer.events.triggerEvent("featureunselected", evt);
        },
        sketchmodified: function(evt) {
          if ( evt.vertex.parent == null )
            return true;
          var class_name = evt.vertex.parent.CLASS_NAME;
          if ( $('#edition-draw-clear').hasClass('disabled') ) {
            if ( class_name == 'OpenLayers.Geometry.LineString' ) {
              if (evt.vertex.parent.components.length == 2 ) {
                $('#edition-draw-clear').removeClass('disabled');
              }
            } else if ( class_name == 'OpenLayers.Geometry.LinearRing' ) {
              if (evt.vertex.parent.components.length == 3 ) {
                $('#edition-draw-clear').removeClass('disabled');
              }
            }
          }
          if ( $('#edition-draw-save').hasClass('disabled') ) {
            if ( class_name == 'OpenLayers.Geometry.LineString' ) {
              if (evt.vertex.parent.components.length > 2 ) {
                $('#edition-draw-save').removeClass('disabled');
              }
            } else if ( class_name == 'OpenLayers.Geometry.LinearRing' ) {
              if (evt.vertex.parent.components.length > 3 ) {
                $('#edition-draw-save').removeClass('disabled');
              }
            }
          }
        },
        vertexmodified: function(evt) {
          if ( $('#edition-select-undo').hasClass('disabled') ) {
            $('#edition-select-undo').removeClass('disabled');
          }
        }
      });

      $('#edition ~ .dropdown-menu').find('a').click(function() {
        editCtrls.panel.activate();
        var menu = $('#edition-menu');
        var alName = $(this).attr('href').slice(1);
        if (alName in config.editionLayers) {
          var al = config.editionLayers[alName];
          if ( editCtrls.click.layerId == al.layerId) {
            $('#edition-stop').click();
          } else {
            // update toolbar based on capabilities
            if (al.capabilities.deleteFeature == "False")
               $('#edition-select-delete').hide()
            else
               $('#edition-select-delete').show()
            if (al.capabilities.modifyAttribute == "False")
               $('#edition-select-attr').hide()
            else
               $('#edition-select-attr').show()
            if (al.capabilities.modifyGeometry == "False")
               $('#edition-select-undo').hide()
            else
               $('#edition-select-undo').show()

            if ( $('#edition-menu-draw').is(':visible') )
              $('#edition-draw-cancel').click();
            if ( $('#edition-menu-select').is(':visible') )
              $('#edition-select-cancel').click();

            if (alName in config.layers)
              $('#edition-menu h3 span.title span.text').html(config.layers[alName].title);
            else
              $('#edition-menu h3 span.title span.text').html(lizDict['edition.title']);
            editCtrls.click.layerId = al.layerId;
            editCtrls.click.layerName = alName;
            menu.show();
            if (al.capabilities.createFeature == "False") {
              $('#edition-draw').hide();
              $('#edition-select-cancel').hide();
              $('#edition-select').click();
            } else {
              $('#edition-draw').show();
              $('#edition-select-cancel').show();
            }
            if (al.capabilities.modifyGeometry == "False"
             && al.capabilities.modifyAttribute == "False"
             && al.capabilities.deleteFeature == "False") {
              $('#edition-select').hide();
              $('#edition-draw-cancel').hide();
              $('#edition-draw').click();
            } else {
              $('#edition-select').show();
              $('#edition-draw-cancel').show();
            }
          }
        }
        updateSwitcherSize();
        if ( $('#edition ~ .dropdown-menu').is(':visible') )
          $('#edition').dropdown('toggle');
        return false;
      });

      $('#edition-stop').click(function(){
        $('#edition-menu h3 span.title span.text').html(lizDict['edition.title']);
        editCtrls.click.layerId = '';
        editCtrls.click.layerName = '';
        editCtrls.panel.deactivate();
        editLayer.destroyFeatures();
        $('#edition-menu-draw').hide();
        $('#edition-draw-clear').addClass('disabled');
        $('#edition-draw-save').addClass('disabled');
        $('#edition-menu-select').hide();
        $('#edition-select-unselect').addClass('disabled');
        $('#edition-select-attr').addClass('disabled');
        $('#edition-select-undo').addClass('disabled');
        $('#edition-select-delete').addClass('disabled');
        $('#edition-menu-start').show();
        var form = $('#edition-menu form');
        form.find('input[name="liz_srid"]').val('');
        form.find('input[name="liz_geometryColumn"]').val('');
        form.find('input[name="liz_wkt"]').val('');
        form.find('input[name="liz_featureId"]').val('');
        updateSwitcherSize();
        return false;
      });

      $('#edition-select').click(function(){
        if ( !$('#edition-menu-start').is(':visible') )
          return false;

        $('#edition-menu-start').hide();
        $('#edition-menu-select').show();
        editCtrls.click.activate();
        $('#lizmap-edition-message').remove();
        mAddMessage(lizDict['edition.select.activate'],'info',true).attr('id','lizmap-edition-message');
        return false;
      });
      $('#edition-select-cancel').click(function(){
        $('#lizmap-edition-message').remove();
        editLayer.destroyFeatures();
        editCtrls.click.deactivate();
        editCtrls.modify.deactivate();
        $('#edition-select-unselect').addClass('disabled');
        $('#edition-select-attr').addClass('disabled');
        $('#edition-select-undo').addClass('disabled');
        $('#edition-select-delete').addClass('disabled');
        var form = $('#edition-menu form');
        form.find('input[name="liz_srid"]').val('');
        form.find('input[name="liz_geometryColumn"]').val('');
        form.find('input[name="liz_wkt"]').val('');
        form.find('input[name="liz_featureId"]').val('');
        $('#edition-menu-select').hide();
        $('#edition-menu-start').show();
        updateSwitcherSize();
        return false;
      });
      $('#edition-select-unselect').click(function(){
        if ( $(this).hasClass('disabled') )
          return false;

        editLayer.destroyFeatures();
        editCtrls.modify.deactivate();
        editCtrls.click.activate();
        $('#edition-select-unselect').addClass('disabled');
        $('#edition-select-attr').addClass('disabled');
        $('#edition-select-undo').addClass('disabled');
        $('#edition-select-delete').addClass('disabled');
        var form = $('#edition-menu form');
        form.find('input[name="liz_srid"]').val('');
        form.find('input[name="liz_geometryColumn"]').val('');
        form.find('input[name="liz_wkt"]').val('');
        form.find('input[name="liz_featureId"]').val('');
        return false;
      });
      $('#edition-select-undo').click(function(){
        if ( $(this).hasClass('disabled') )
          return false;

        var format = new OpenLayers.Format.WKT();
        var wkt = $('#edition-menu form input[name="liz_wkt"]').val();
        var wktFeat = format.read(wkt);
        var geom = wktFeat.geometry.clone();
        var feat = editLayer.features[0];
        geom.id = feat.geometry.id;
        feat.geometry = geom;
        editLayer.drawFeature(feat);
        if (config.editionLayers[editCtrls.click.layerName].capabilities.modifyGeometry == "True")
          editCtrls.modify.selectFeature(feat);
        return false;
      });
      $('#edition-select-attr').click(function(){
        if ( $(this).hasClass('disabled') )
          return false;

        if ( editLayer.selectedFeatures.length != 0 )
          editCtrls.modify.unselectFeature(editLayer.features[0]);
        else
          editLayer.events.triggerEvent("afterfeaturemodified", {
            feature: editLayer.features[0],
            modified: false
        });
        return false;
      });
      $('#edition-select-delete').click(function(){
        if ( $(this).hasClass('disabled') )
          return false;

        var featureId = $('#edition-menu form input[name="liz_featureId"]').val();
        if ( featureId == '' )
         return false;
        if ( !confirm( lizDict['edition.confirm.delete'] ) )
          return false;
        $.get(service.replace('getFeature','deleteFeature'),{
          layerId: editCtrls.click.layerId,
          featureId: featureId
        }, function(data){
          $('#edition-modal').html(data);
          $('#edition-modal').modal('show');
          editLayer.destroyFeatures();
          $('#edition-select-unselect').click();
          var layerId = editCtrls.click.layerId;
          $.each(layers, function(i, l) {
            if (config.layers[l.params['LAYERS']].id != layerId)
              return true;
            l.redraw(true);
            return false;
          });
        });
        return false;
      });

      $('#edition-draw').click(function(){
        if ( !$('#edition-menu-start').is(':visible') )
          return false;

        var layerId = editCtrls.click.layerId;
        var geomType = '';
        for (var alName in config.editionLayers) {
          var al = config.editionLayers[alName];
          if ( alName in config.layers && al.layerId == layerId)
            geomType = al.geometryType;
        }
        if ( geomType == '' )
          return false;

        var ctrl = editCtrls[geomType];
        if ( ctrl.active ) {
          return false;
        } else {
          ctrl.activate();
          $('#edition-draw-clear').addClass('disabled');
          $('#edition-draw-save').addClass('disabled');
          $('#edition-menu-start').hide();
          $('#edition-menu-draw').show();
          updateSwitcherSize();
          $('#lizmap-edition-message').remove();
          mAddMessage(lizDict['edition.draw.activate'],'info',true).attr('id','lizmap-edition-message');
        }
        return false;
      });
      $('#edition-draw-cancel').click(function(){
        $('#lizmap-edition-message').remove();
        var layerId = editCtrls.click.layerId;
        var geomType = '';
        for (var alName in config.editionLayers) {
          var al = config.editionLayers[alName];
          if ( alName in config.layers && al.layerId == layerId)
            geomType = al.geometryType;
        }
        if ( geomType != '' ) {
          var ctrl = editCtrls[geomType];
          ctrl.deactivate();
        }
        editLayer.destroyFeatures();
        $('#edition-draw-clear').addClass('disabled');
        $('#edition-draw-save').addClass('disabled');
        $('#edition-menu-draw').hide();
        $('#edition-menu-start').show();
        updateSwitcherSize();
        return false;
      });
      $('#edition-draw-save').click(function(){
        if ( $(this).hasClass('disabled') )
          return false;

        var layerId = editCtrls.click.layerId;
        var geomType = '';
        for (var alName in config.editionLayers) {
          var al = config.editionLayers[alName];
          if ( alName in config.layers && al.layerId == layerId)
            geomType = al.geometryType;
        }
        if ( geomType != '' ) {
          var ctrl = editCtrls[geomType];
          ctrl.finishSketch();
        }
        return false;
      });
      $('#edition-draw-clear').click(function(){
        if ( $(this).hasClass('disabled') )
          return false;

        var layerId = editCtrls.click.layerId;
        var geomType = '';
        for (var alName in config.editionLayers) {
          var al = config.editionLayers[alName];
          if ( alName in config.layers && al.layerId == layerId)
            geomType = al.geometryType;
        }
        if ( geomType != '' ) {
          var ctrl = editCtrls[geomType];
          ctrl.cancel();
          $('#edition-draw-clear').addClass('disabled');
          $('#edition-draw-save').addClass('disabled');
        }
        return false;
      });

    $('#edition-menu a[rel="tooltip"]').tooltip();

    } else {
      $('#edition').parent().remove();
      $('#edition-menu').remove();
      $('#edition-modal').remove();
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
        $('#measure').parent().addClass('active');
        $('#measure-length-menu').show();
        updateSwitcherSize();
        mAddMessage(lizDict['measure.activate.length'],'info',true).attr('id','lizmap-measure-message');
      },
      deactivate: function(evt) {
        $('#measure').parent().removeClass('active');
        $('#measure-length-menu').hide();
        updateSwitcherSize();
        $('#lizmap-measure-message').remove();
      }
    });
    measureControls.area.events.on({
      activate: function(evt) {
        deactivateToolControls(evt);
        $('#measure').parent().addClass('active');
        $('#measure-area-menu').show();
        updateSwitcherSize();
        mAddMessage(lizDict['measure.activate.area'],'info',true).attr('id','lizmap-measure-message');
      },
      deactivate: function(evt) {
        $('#measure').parent().removeClass('active');
        $('#measure-area-menu').hide();
        updateSwitcherSize();
        $('#lizmap-measure-message').remove();
      }
    });
    measureControls.perimeter.measure = function(geometry, eventType) {
        var stat, order;
        if( OpenLayers.Util.indexOf( geometry.CLASS_NAME, 'LineString' ) > -1) {
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
        $('#measure').parent().addClass('active');
        $('#measure-perimeter-menu').show();
        updateSwitcherSize();
        mAddMessage(lizDict['measure.activate.perimeter'],'info',true).attr('id','lizmap-measure-message');
      },
      deactivate: function(evt) {
        $('#measure').parent().removeClass('active');
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
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 30000
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
          if ( $('#geolocate-menu-bind').hasClass('active') )
            this.bind = true;
        }
      },
      "locationfailed": function(evt) {
        if ( vector.features.length == 0 )
          mAddMessage(lizDict['geolocation.failed'],'error',true);
      },
      "activate": function(evt) {
        $('#toggleGeolocate').parent().addClass('active');
        $('#geolocate-menu').show();
        updateSwitcherSize();
      },
      "deactivate": function(evt) {
        vector.destroyFeatures();
        $('#toggleGeolocate').parent().removeClass('active');
        $('#geolocate-menu').hide();
        updateSwitcherSize();
        $('#geolocate-menu-bind').removeClass('btn-info active').addClass('btn-success');
        geolocate.bind = false;
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
    $('#geolocate-menu-center').click(function(){
      if (vector.features.length != 0 )
        map.setCenter(vector.getDataExtent().getCenterLonLat());
    });
    $('#geolocate-menu-bind').click(function(){
      var self = $(this);
      if ( self.hasClass('active') ) {
        self.removeClass('btn-info active').addClass('btn-success');
        geolocate.bind = false;
      } else {
        self.removeClass('btn-success').addClass('btn-info active');
        geolocate.bind = true;
      }
    });
    $('#geolocate-menu button.btn-geolocate-clear').click(function(){
      geolocate.deactivate();
    });
  }

  function updateExternalSearch( aHTML ) {
    var wgs84 = new OpenLayers.Projection('EPSG:4326');

    $('#nominatim-search .dropdown-inner .items li > a').unbind('click');
    $('#nominatim-search .dropdown-inner .items').html( aHTML );
    $('#nominatim-search').addClass('open');
    $('#nominatim-search .dropdown-inner .items li > a').click(function() {
      var bbox = $(this).attr('href').replace('#','');
      var bbox = OpenLayers.Bounds.fromString(bbox);
      bbox.transform(wgs84, map.getProjectionObject());
      map.zoomToExtent(bbox);

      var locateLayer = map.getLayersByName('locatelayer');
      if (locateLayer.length != 0) {
        locateLayer = locateLayer[0];
        locateLayer.destroyFeatures();
        locateLayer.setVisibility(true);
        locateLayer.addFeatures([
          new OpenLayers.Feature.Vector(bbox.toGeometry().getCentroid())
          ]);
      }

      $('#nominatim-search').removeClass('open');
      return false;
    });
    $('#nominatim-search .dropdown-inner span.close').click(function() {
      $('#nominatim-search').removeClass('open');
      return false;
    });
  }

  /**
   * PRIVATE function: addExternalSearch
   * add external search capability
   *
   * Returns:
   * {Boolean} external search is in the user interface
   */
  function addExternalSearch() {
    var configOptions = config.options;

    // Search with nominatim
    var wgs84 = new OpenLayers.Projection('EPSG:4326');
    var extent = new OpenLayers.Bounds( map.maxExtent.toArray() );
    extent.transform(map.getProjectionObject(), wgs84);

    // define external search service
    var service = null
    switch (configOptions['externalSearch']) {
      case 'nominatim':
        if ( 'nominatim' in lizUrls )
          service = OpenLayers.Util.urlAppend(lizUrls.nominatim
              ,OpenLayers.Util.getParameterString(lizUrls.params)
              );
        break;
      case 'ign':
        if ( 'ign' in lizUrls )
          service = OpenLayers.Util.urlAppend(lizUrls.ign
              ,OpenLayers.Util.getParameterString(lizUrls.params)
              );
        break;
      case 'google':
        if ( 'maps' in google && 'Geocoder' in google.maps )
          service = new google.maps.Geocoder();
        break;
    }
    // if no external search service found
    // update ui
    if ( service == null ) {
      $('#nominatim-search').remove();
      return false;
    }

    $('#nominatim-search').submit(function(){
      updateExternalSearch( '<li>'+lizDict['externalsearch.search']+'</li>' );
      switch (configOptions['externalSearch']) {
        case 'nominatim':
          $.get(service
            ,{"query":$('#search-query').val(),"bbox":extent.toBBOX()}
            ,function(data) {
              var text = '';
              var count = 0;
              $.each(data, function(i, e){
                if (count > 9)
                  return false;
                var bbox = [
                  e.boundingbox[2],
                  e.boundingbox[0],
                  e.boundingbox[3],
                  e.boundingbox[1]
                ];
                bbox = new OpenLayers.Bounds(bbox);
                if ( extent.intersectsBounds(bbox) ) {
                  text += '<li><a href="#'+bbox.toBBOX()+'">'+e.display_name+'</a></li>';
                  count++;
                }
              });
              if (count != 0 && text != '')
                updateExternalSearch( text );
              else
                updateExternalSearch( '<li>'+lizDict['externalsearch.notfound']+'</li>' );
            }, 'json');
          break;
        case 'ign':
          $.get(service
            ,{"query":$('#search-query').val(),"bbox":extent.toBBOX()}
            ,function(results) {
              var text = '';
              var count = 0;
              $.each(results, function(i, e){
                if (count > 9)
                  return false;
                var bbox = [
                  e.bbox[0],
                  e.bbox[1],
                  e.bbox[2],
                  e.bbox[3]
                ];
                bbox = new OpenLayers.Bounds(bbox);
                if ( extent.intersectsBounds(bbox) ) {
                  text += '<li><a href="#'+bbox.toBBOX()+'">'+e.formatted_address+'</a></li>';
                  count++;
                }
              });
              if (count != 0 && text != '')
                updateExternalSearch( text );
              else
                updateExternalSearch( '<li>'+lizDict['externalsearch.notfound']+'</li>' );
            }, 'json');
          break;
        case 'google':
          service.geocode( {
            'address': $('#search-query').val(),
            'bounds': new google.maps.LatLngBounds(
              new google.maps.LatLng(extent.top,extent.left),
              new google.maps.LatLng(extent.bottom,extent.right)
              )
          }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              var text = '';
              var count = 0;
              $.each(results, function(i, e){
                if (count > 9)
                  return false;
                var bbox = [];
                if (e.geometry.viewport) {
                  bbox = [
                    e.geometry.viewport.getSouthWest().lng(),
                    e.geometry.viewport.getSouthWest().lat(),
                    e.geometry.viewport.getNorthEast().lng(),
                    e.geometry.viewport.getNorthEast().lat()
                  ];
                } else if (e.geometry.bounds) {
                  bbox = [
                    e.geometry.bounds.getSouthWest().lng(),
                    e.geometry.bounds.getSouthWest().lat(),
                    e.geometry.bounds.getNorthEast().lng(),
                    e.geometry.bounds.getNorthEast().lat()
                  ];
                }
                if ( bbox.length != 4 )
                  return false;
                bbox = new OpenLayers.Bounds(bbox);
                if ( extent.intersectsBounds(bbox) ) {
                  text += '<li><a href="#'+bbox.toBBOX()+'">'+e.formatted_address+'</a></li>';
                  count++;
                }
              });
              if (count != 0 && text != '')
                updateExternalSearch( text );
              else
                updateExternalSearch( '<li>'+lizDict['externalsearch.notfound']+'</li>' );
                //mAddMessage('Nothing Found','info',true);
            } else
              updateExternalSearch( '<li>'+lizDict['externalsearch.notfound']+'</li>' );
              //mAddMessage('Nothing Found','info',true);
          });
          break;
      }
      return false;
    });
    return true;
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
   * PRIVATE function: loadProjDefinition
   * load CRS definition and activate it
   *
   * Parameters:
   * aCRS - {String}
   * aCallbalck - {function ( proj )}
   *
   */
  function loadProjDefinition( aCRS, aCallback ) {
    var proj = aCRS.replace(/^\s+|\s+$/g, ''); // trim();
    if ( proj in Proj4js.defs ) {
      aCallback( proj );
    } else {
      $.get( OpenLayers.Util.urlAppend(
          lizUrls.wms
          ,OpenLayers.Util.getParameterString(lizUrls.params)
        ), {
          'REQUEST':'GetProj4'
         ,'authid': proj
        }, function ( aText ) {
          Proj4js.defs[proj] = aText;
          new OpenLayers.Projection(proj);
          aCallback( proj );
        }
      );
    }
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
    /*
    if($.browser.msie)
      w = $('body').width();
      */
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
     * Method: cleanName
     */
    cleanName: function( aName ) {
      return cleanName( aName );
    },

    /**
     * Method: checkMobile
     */
    addMessage: function( aMessage, aType, aClose ) {
      return mAddMessage( aMessage, aType, aClose );
    },

    /**
     * Method: updateSwitcherSize
     */
    updateSwitcherSize: function() {
      return updateSwitcherSize();
    },

    /**
     * Method: transformBounds
     */
    loadProjDefinition: function( aCRS, aCallback ) {
      return loadProjDefinition( aCRS, aCallback );
    },


    /**
     * Method: updateContentSize
     */
    updateContentSize: function() {
      return updateContentSize();
    },

    /**
     * Method: init
     */
    init: function() {
      var self = this;
      //get config
      $.getJSON(lizUrls.config,lizUrls.params,function(cfgData) {
        config = cfgData;
        config.options.hasOverview = false;

         //get capabilities
        var service = OpenLayers.Util.urlAppend(lizUrls.wms
          ,OpenLayers.Util.getParameterString(lizUrls.params)
        );
        $.get(service
          ,{SERVICE:'WMS',REQUEST:'GetCapabilities',VERSION:'1.3.0'}
          ,function(data) {
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

          // Verifying z-index
          var lastLayerZIndex = map.layers[map.layers.length-1].getZIndex();
          if ( lastLayerZIndex > map.Z_INDEX_BASE['Feature'] - 100 ) {
            map.Z_INDEX_BASE['Feature'] = lastLayerZIndex + 100;
            map.Z_INDEX_BASE['Popup'] = map.Z_INDEX_BASE['Feature'] + 25;
            if ( map.Z_INDEX_BASE['Popup'] > map.Z_INDEX_BASE['Control'] - 25 )
                map.Z_INDEX_BASE['Control'] = map.Z_INDEX_BASE['Popup'] + 25;
          }

          // initialize the map
          $('#switcher').height(0);
          // Set map extent depending on options
          /*
          if(lizPosition['lon']!=null){
            map.setCenter(
              new OpenLayers.LonLat(lizPosition['lon'], lizPosition['lat']),
              lizPosition['zoom']
            );
          }else{
            map.zoomToExtent(map.initialExtent);
          }
          */
          var verifyingVisibility = true;
          var hrefParam = OpenLayers.Util.getParameters(window.location.href);
          if ( !map.getCenter() ) {
            if ( hrefParam.bbox || hrefParam.BBOX ) {
                var hrefBbox = null;
                if ( hrefParam.bbox )
                  hrefBbox = OpenLayers.Bounds.fromArray( hrefParam.bbox );
                if ( hrefParam.BBOX )
                  hrefBbox = OpenLayers.Bounds.fromArray( hrefParam.BBOX );

                if ( hrefParam.crs && hrefParam.crs != map.getProjection() )
                  hrefBbox.transform( hrefParam.crs, map.getProjection() )
                if ( hrefParam.CRS && hrefParam.CRS != map.getProjection() )
                  hrefBbox.transform( hrefParam.CRS, map.getProjection() )

                if( map.restrictedExtent.containsBounds( hrefBbox ) )
                  map.zoomToExtent( hrefBbox, true );
                else {
                  var projBbox = $('#metadata .bbox').text();
                  projBbox = OpenLayers.Bounds.fromString(projBbox);
                  if( projBbox.containsBounds( hrefBbox ) ) {
                      var projProj = $('#metadata .proj').text();
                      loadProjDefinition( projProj, function( aProj ) {
                          hrefBbox.transform( aProj, map.getProjection() );
                          map.zoomToExtent( hrefBbox, true );
                      });
                  } else {
                    map.zoomToExtent(map.initialExtent);
                  }
                }
            } else {
              map.zoomToExtent(map.initialExtent);
            }
            verifyingVisibility = false;
          }

          updateContentSize();
          map.events.triggerEvent("zoomend",{"zoomChanged": true});

          // create overview if 'Overview' layer
          createOverview();

          // create navigation and toolbar
          createNavbar();
          createToolbar();

          // verifying the layer visibility for permalink
          if (verifyingVisibility) {
            map.getControlsByClass('OpenLayers.Control.ArgParser')[0].configureLayers();
            for (var i=0,len=layers.length; i<len; i++) {
              var l = layers[i];
              var btn = $('#switcher button.checkbox[name="layer"][value="'+l.name+'"]');
              if ( (hrefParam.layers && l.getVisibility() != btn.hasClass('checked') ) )
                $('#switcher button.checkbox[name="layer"][value="'+l.name+'"]').click();
            }
          }

          // finalize slider
          $('#navbar div.slider').slider("value",map.getZoom());
          map.events.on({
            zoomend : function() {
              $('#switcher table.tree tr.legendGraphics.initialized').each(function() {
                var self = $(this);
                var name = self.attr('id').replace('legend-','');
                var url = getLayerLegendGraphicUrl(name, true);
                if ( url != null && url != '' ) {
                  self.find('div.legendGraphics img').attr('src',url);
                }
              });
              // update slider position
              $('#navbar div.slider').slider("value",this.getZoom());
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
            //~ console.log('toggleLegend');
            map.updateSize();
            map.baseLayer.redraw(true);
            //~ console.log('redraw');
            return false;
          });

          // Toggle locate
          $('#toggleLocate').click(function(){
            $('#locate-menu').toggle();
            if ( $('#locate-menu').is(':visible') )
              $('#toggleLocate').parent().addClass('active');
            else
              $('#toggleLocate').parent().removeClass('active');
            $('#metadata').hide();
            updateSwitcherSize();
            return false;
          });
          if ( !('locateByLayer' in config) )
            $('#toggleLocate').parent().hide();
          else
            $('#toggleLocate').parent().addClass('active');

          // Toggle Metadata
          $('#displayMetadata').click(function(){
            $('#metadata').toggle();
            if ( $('#metadata').is(':visible') )
              $('#displayMetadata').parent().addClass('active');
            else
              $('#displayMetadata').parent().removeClass('active');
            return false;
          });
          $('#hideMetadata').click(function(){
            $('#metadata').hide();
            $('#displayMetadata').parent().removeClass('active');
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

 if (
   (('osmMapnik' in evt.config.options)
    && evt.config.options.osmMapnik == 'True') ||
   (('osmMapquest' in evt.config.options)
    && evt.config.options.osmMapquest == 'True') ||
   (('osmCyclemap' in evt.config.options)
    && evt.config.options.osmCyclemap == 'True') ||
   (('googleStreets' in evt.config.options)
    && evt.config.options.googleStreets == 'True') ||
   (('googleSatellite' in evt.config.options)
    && evt.config.options.googleSatellite == 'True') ||
   (('googleHybrid' in evt.config.options)
    && evt.config.options.googleHybrid == 'True') ||
   (('googleTerrain' in evt.config.options)
    && evt.config.options.googleTerrain == 'True') ||
   (('bingStreets' in evt.config.options)
    && evt.config.options.bingStreets == 'True'
    && ('bingKey' in evt.config.options)) ||
   (('bingSatellite' in evt.config.options)
    && evt.config.options.bingSatellite == 'True'
    && ('bingKey' in evt.config.options)) ||
   (('bingHybrid' in evt.config.options)
    && evt.config.options.bingHybrid == 'True'
    && ('bingKey' in evt.config.options)) ||
   (('ignTerrain' in evt.config.options)
    && evt.config.options.ignTerrain == 'True'
    && ('ignKey' in evt.config.options)) ||
   (('ignStreets' in evt.config.options)
    && evt.config.options.ignStreets == 'True'
    && ('ignKey' in evt.config.options)) ||
   (('ignSatellite' in evt.config.options)
    && evt.config.options.ignSatellite == 'True'
    && ('ignKey' in evt.config.options))
   ) {
     Proj4js.defs['EPSG:3857'] = Proj4js.defs['EPSG:900913'];
     var proj = evt.config.options.projection;
     if ( !(proj.ref in Proj4js.defs) )
       Proj4js.defs[proj.ref]=proj.proj4;
     var projection = new OpenLayers.Projection(proj.ref);
     var projOSM = new OpenLayers.Projection('EPSG:3857');
     proj.ref = 'EPSG:3857';
     proj.proj4 = Proj4js.defs['EPSG:3857'];

     // Transform the bbox
     var bbox = evt.config.options.bbox;
     var extent = new OpenLayers.Bounds(Number(bbox[0]),Number(bbox[1]),Number(bbox[2]),Number(bbox[3]));
     extent = extent.transform(projection,projOSM);
     bbox = extent.toArray();

     var scales = [];
     if ('mapScales' in evt.config.options)
       scales = evt.config.options.mapScales;
     if ( scales.length == 0 )
       scales = [evt.config.options.maxScale,evt.config.options.minScale];

     evt.config.options.projection = proj;
     evt.config.options.bbox = bbox;
     evt.config.options.zoomLevelNumber = 16;

     // Transform the initial bbox
     if ( 'initialExtent' in evt.config.options && evt.config.options.initialExtent.length == 4 ) {
       var initBbox = evt.config.options.initialExtent;
       var initialExtent = new OpenLayers.Bounds(Number(initBbox[0]),Number(initBbox[1]),Number(initBbox[2]),Number(initBbox[3]));
       initialExtent = initialExtent.transform(projection,projOSM);
       evt.config.options.initialExtent = initialExtent.toArray();
     }

     // Specify zoom level number
     if ((('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') ||
         (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') ||
         (('osmCyclemap' in evt.config.options) && evt.config.options.osmCyclemap == 'True') ||
         (('bingStreets' in evt.config.options) && evt.config.options.bingStreets == 'True' && ('bingKey' in evt.config.options)) ||
         (('bingSatellite' in evt.config.options) && evt.config.options.bingSatellite == 'True' && ('bingKey' in evt.config.options)) ||
         (('bingHybrid' in evt.config.options) && evt.config.options.bingHybrid == 'True' && ('bingKey' in evt.config.options)) ||
         (('ignTerrain' in evt.config.options) && evt.config.options.ignTerrain == 'True' && ('ignKey' in evt.config.options)) ||
         (('ignStreets' in evt.config.options) && evt.config.options.ignStreets == 'True') && ('ignKey' in evt.config.options))
       evt.config.options.zoomLevelNumber = 19;
     if ((('googleStreets' in evt.config.options) && evt.config.options.googleStreets == 'True') ||
         (('googleHybrid' in evt.config.options) && evt.config.options.googleHybrid == 'True') ||
         (('ignSatellite' in evt.config.options) && evt.config.options.ignSatellite == 'True') && ('ignKey' in evt.config.options))
       evt.config.options.zoomLevelNumber = 20;
     if ((('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True'))
       evt.config.options.zoomLevelNumber = 21;
     evt.config.options.maxScale = 591659030.3224756;
     evt.config.options.minScale = 2257.0000851534865;
     //evt.config.options.mapScales = [];
     var hasBaselayers = false;
     for ( var l in evt.config.layers ) {
       if ( evt.config.layers[l]["baseLayer"] == "True" )
         hasBaselayers = true;
     }
     // for minRes evaluating to scale 100
     // zoomLevelNumber is equal to 24
     if (hasBaselayers) {
       evt.config.options.zoomLevelNumber = 24;
     }

     var resolutions = [];
     if (scales.length != 0 ) {
       scales.sort(function(a, b) {
         return Number(b) - Number(a);
       });
       var maxScale = scales[0];
       var maxRes = OpenLayers.Util.getResolutionFromScale(maxScale, projOSM.proj.units);
       var minScale = scales[scales.length-1];
       var minRes = OpenLayers.Util.getResolutionFromScale(minScale, projOSM.proj.units);
       var res = 156543.03390625;
       var n = 1;
       while ( res > minRes && n < evt.config.options.zoomLevelNumber) {
         if ( res < maxRes ) {
           if (resolutions.length == 0 && res != 156543.03390625)
             resolutions.push(res*2);
           resolutions.push(res);
         }
         res = res/2;
         n++;
       }
       maxRes = resolutions[0];
       minRes = res;
       resolutions.push(res);
       var maxScale = OpenLayers.Util.getScaleFromResolution(maxRes, projOSM.proj.units);
       var minScale = OpenLayers.Util.getScaleFromResolution(minRes, projOSM.proj.units);
     }
     evt.config.options['resolutions'] = resolutions;

     if (resolutions.length != 0 ) {
       evt.config.options.zoomLevelNumber = resolutions.length;
       evt.config.options.maxScale = maxScale;
       evt.config.options.minScale = minScale;
     }
   }

    }
    ,'mapcreated':function(evt){
      //console.log('mapcreated');
      // Add empty baselayer to the map
      if ( ('emptyBaselayer' in evt.config.options)
         && evt.config.options.emptyBaselayer == 'True') {
        // creating the empty base layer
        layerConfig = {};
        layerConfig.title = lizDict['baselayer.empty.title'];
        layerConfig.name = 'emptyBaselayer';
        evt.config.layers['emptyBaselayer'] = layerConfig;

        evt.baselayers.push(new OpenLayers.Layer.Vector('emptyBaselayer',{
          isBaseLayer: true
         ,maxExtent: evt.map.maxExtent
         ,maxScale: evt.map.maxScale
         ,minScale: evt.map.minScale
         ,numZoomLevels: evt.map.numZoomLevels
         ,scales: evt.map.scales
         ,projection: evt.map.projection
         ,units: evt.map.projection.proj.units
        }));
        evt.map.allOverlays = false;
      }

      // Add OpenStreetMap, Google Maps, Bing Maps, IGN Geoportail
      // baselayers to the map
      if (
    (('osmMapnik' in evt.config.options)
    && evt.config.options.osmMapnik == 'True') ||
    (('osmMapquest' in evt.config.options)
     && evt.config.options.osmMapquest == 'True') ||
    (('osmCyclemap' in evt.config.options)
     && evt.config.options.osmCyclemap == 'True') ||
    (('googleStreets' in evt.config.options)
     && evt.config.options.googleStreets == 'True') ||
    (('googleSatellite' in evt.config.options)
     && evt.config.options.googleSatellite == 'True') ||
    (('googleHybrid' in evt.config.options)
     && evt.config.options.googleHybrid == 'True') ||
    (('googleTerrain' in evt.config.options)
     && evt.config.options.googleTerrain == 'True') ||
    (('bingStreets' in evt.config.options)
     && evt.config.options.bingStreets == 'True'
     && ('bingKey' in evt.config.options)) ||
    (('bingSatellite' in evt.config.options)
     && evt.config.options.bingSatellite == 'True'
     && ('bingKey' in evt.config.options)) ||
    (('bingHybrid' in evt.config.options)
     && evt.config.options.bingHybrid == 'True'
     && ('bingKey' in evt.config.options)) ||
    (('ignTerrain' in evt.config.options)
     && evt.config.options.ignTerrain == 'True'
     && ('ignKey' in evt.config.options)) ||
    (('ignStreets' in evt.config.options)
     && evt.config.options.ignStreets == 'True'
     && ('ignKey' in evt.config.options)) ||
    (('ignSatellite' in evt.config.options)
     && evt.config.options.ignSatellite == 'True'
     && ('ignKey' in evt.config.options))
    ) {
      //adding baselayers
      var maxExtent = null;
      if ( OpenLayers.Projection.defaults['EPSG:900913'].maxExtent )
        maxExtent = new OpenLayers.Bounds(OpenLayers.Projection.defaults['EPSG:900913'].maxExtent);
      else if ( OpenLayers.Projection.defaults['EPSG:3857'].maxExtent )
        maxExtent = new OpenLayers.Bounds(OpenLayers.Projection.defaults['EPSG:3857'].maxExtent);

      var lOptions = {zoomOffset:0,maxResolution:156543.03390625};
      if (('resolutions' in evt.config.options)
          && evt.config.options.resolutions.length != 0 ){
        var resolutions = evt.config.options.resolutions;
        var maxRes = resolutions[0];
        var numZoomLevels = resolutions.length;
        var zoomOffset = 0;
        var res = 156543.03390625;
        while ( res > maxRes ) {
          zoomOffset += 1;
          res = 156543.03390625 / Math.pow(2, zoomOffset);
        }
        lOptions['zoomOffset'] = zoomOffset;
        lOptions['maxResolution'] = maxRes;
        lOptions['numZoomLevels'] = numZoomLevels;
      }

      if (('osmMapnik' in evt.config.options) && evt.config.options.osmMapnik == 'True') {
        evt.map.allOverlays = false;
        var options = {
          zoomOffset: 0,
          maxResolution:156543.03390625,
          numZoomLevels:19
        };
        if (lOptions.zoomOffset != 0) {
          options.zoomOffset = lOptions.zoomOffset;
          options.maxResolution = lOptions.maxResolution;
        }
        if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
          options.numZoomLevels = lOptions.numZoomLevels;
        else
          options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
        var osm = new OpenLayers.Layer.OSM('osm',
            [
            "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
            "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
            "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
            ]
            ,options
            );
        osm.maxExtent = maxExtent;
        var osmCfg = {
          "name":"osm"
            ,"title":"OpenStreetMap"
        };
        evt.config.layers['osm'] = osmCfg;
        evt.baselayers.push(osm);
      }
      if (('osmMapquest' in evt.config.options) && evt.config.options.osmMapquest == 'True') {
        evt.map.allOverlays = false;
        var options = {
          zoomOffset: 0,
          maxResolution:156543.03390625,
          numZoomLevels:19
        };
        if (lOptions.zoomOffset != 0) {
          options.zoomOffset = lOptions.zoomOffset;
          options.maxResolution = lOptions.maxResolution;
        }
        if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
          options.numZoomLevels = lOptions.numZoomLevels;
        else
          options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
        var mapquest = new OpenLayers.Layer.OSM('mapquest',
            ["http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
            "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"]
            ,options
            );
        mapquest.maxExtent = maxExtent;
        var mapquestCfg = {
          "name":"mapquest"
            ,"title":"MapQuest OSM"
        };
        evt.config.layers['mapquest'] = mapquestCfg;
        evt.baselayers.push(mapquest);
      }
      if (('osmCyclemap' in evt.config.options) && evt.config.options.osmCyclemap == 'True') {
        evt.map.allOverlays = false;
        var options = {
          zoomOffset: 0,
          maxResolution:156543.03390625,
          numZoomLevels:19
        };
        if (lOptions.zoomOffset != 0) {
          options.zoomOffset = lOptions.zoomOffset;
          options.maxResolution = lOptions.maxResolution;
        }
        if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
          options.numZoomLevels = lOptions.numZoomLevels;
        else
          options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
        var cyclemap = new OpenLayers.Layer.OSM('osm-cyclemap',
            ["http://a.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
            "http://b.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png",
            "http://c.tile.opencyclemap.org/cycle/${z}/${x}/${y}.png"]
            ,options
            );
        cyclemap.maxExtent = maxExtent;
        var cyclemapCfg = {
          "name":"osm-cyclemap"
            ,"title":"OSM CycleMap"
        };
        evt.config.layers['osm-cyclemap'] = cyclemapCfg;
        evt.baselayers.push(cyclemap);
      }
      try {
        if (('googleSatellite' in evt.config.options) && evt.config.options.googleSatellite == 'True') {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:21
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var gsat = new OpenLayers.Layer.Google(
              "Google Satellite",
              {type: google.maps.MapTypeId.SATELLITE
                , numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset}
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
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:20
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var ghyb = new OpenLayers.Layer.Google(
              "Google Hybrid",
              {type: google.maps.MapTypeId.HYBRID
                , numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset}
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
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:16
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var gphy = new OpenLayers.Layer.Google(
              "Google Terrain",
              {type: google.maps.MapTypeId.TERRAIN
              , numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset}
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
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:20
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
         var gmap = new OpenLayers.Layer.Google(
             "Google Streets", // the default
             {numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset}
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
       if (('bingStreets' in evt.config.options) && evt.config.options.bingStreets == 'True' && ('bingKey' in evt.config.options))  {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:19
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var bmap = new OpenLayers.Layer.Bing({
             key: evt.config.options.bingKey,
             type: "Road",
             name: "Bing Road", // the default
             numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset
          });
          bmap.maxExtent = maxExtent;
          var bmapCfg = {
             "name":"bmap"
            ,"title":"Bing Road"
          };
          evt.config.layers['bmap'] = bmapCfg;
          evt.baselayers.push(bmap);
          evt.map.allOverlays = false;
       }
       if (('bingSatellite' in evt.config.options) && evt.config.options.bingSatellite == 'True' && ('bingKey' in evt.config.options))  {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:19
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var baerial = new OpenLayers.Layer.Bing({
             key: evt.config.options.bingKey,
             type: "Aerial",
             name: "Bing Aerial", // the default
             numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset
          });
          baerial.maxExtent = maxExtent;
          var baerialCfg = {
             "name":"baerial"
            ,"title":"Bing Aerial"
          };
          evt.config.layers['baerial'] = baerialCfg;
          evt.baselayers.push(baerial);
          evt.map.allOverlays = false;
       }
       if (('bingHybrid' in evt.config.options) && evt.config.options.bingHybrid == 'True' && ('bingKey' in evt.config.options))  {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:19
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var bhybrid = new OpenLayers.Layer.Bing({
             key: evt.config.options.bingKey,
             type: "AerialWithLabels",
             name: "Bing Hybrid", // the default
             numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset
          });
          bhybrid.maxExtent = maxExtent;
          var bhybridCfg = {
             "name":"bhybrid"
            ,"title":"Bing Hybrid"
          };
          evt.config.layers['bhybrid'] = bhybridCfg;
          evt.baselayers.push(bhybrid);
          evt.map.allOverlays = false;
       }
       if (('ignTerrain' in evt.config.options) && evt.config.options.ignTerrain == 'True' && ('ignKey' in evt.config.options)) {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:18
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var ignmap = new OpenLayers.Layer.WMTS({
            name: "ignmap",
            url: "http://gpp3-wxs.ign.fr/"+evt.config.options.ignKey+"/wmts",
            layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS",
            matrixSet: "PM",
            style: "normal",
            projection: new OpenLayers.Projection("EPSG:3857"),
            attribution: 'Fond&nbsp;: &copy;IGN <a href="http://www.geoportail.fr/" target="_blank"><img src="http://api.ign.fr/geoportail/api/js/2.0.0beta/theme/geoportal/img/logo_gp.gif"></a> <a href="http://www.geoportail.gouv.fr/depot/api/cgu/licAPI_CGUF.pdf" alt="TOS" title="TOS" target="_blank">Conditions d\'utilisation</a>'
            , numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset
            ,zoomOffset: options.zoomOffset

          });
          ignmap.maxExtent = maxExtent;
          var ignmapCfg = {
             "name":"ignmap"
            ,"title":"IGN Scan"
          };
          evt.config.layers['ignmap'] = ignmapCfg;
          evt.baselayers.push(ignmap);
          evt.map.allOverlays = false;
       }
       if (('ignStreets' in evt.config.options) && evt.config.options.ignStreets == 'True' && ('ignKey' in evt.config.options)) {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:18
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var ignplan = new OpenLayers.Layer.WMTS({
            name: "ignplan",
            url: "http://gpp3-wxs.ign.fr/"+evt.config.options.ignKey+"/wmts",
            layer: "GEOGRAPHICALGRIDSYSTEMS.PLANIGN",
            matrixSet: "PM",
            style: "normal",
            projection: new OpenLayers.Projection("EPSG:3857"),
            attribution: 'Fond&nbsp;: &copy;IGN <a href="http://www.geoportail.fr/" target="_blank"><img src="http://api.ign.fr/geoportail/api/js/2.0.0beta/theme/geoportal/img/logo_gp.gif"></a> <a href="http://www.geoportail.gouv.fr/depot/api/cgu/licAPI_CGUF.pdf" alt="TOS" title="TOS" target="_blank">Conditions d\'utilisation</a>'
            , numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset
            ,zoomOffset: options.zoomOffset

          });
          ignplan.maxExtent = maxExtent;
          var ignplanCfg = {
             "name":"ignplan"
            ,"title":"IGN Plan"
          };
          evt.config.layers['ignplan'] = ignplanCfg;
          evt.baselayers.push(ignplan);
          evt.map.allOverlays = false;
       }
       if (('ignSatellite' in evt.config.options) && evt.config.options.ignSatellite == 'True' && ('ignKey' in evt.config.options)) {
          var options = {
            zoomOffset: 0,
            maxResolution:156543.03390625,
            numZoomLevels:19
          };
          if (lOptions.zoomOffset != 0) {
            options.zoomOffset = lOptions.zoomOffset;
            options.maxResolution = lOptions.maxResolution;
          }
          if (lOptions.zoomOffset+lOptions.numZoomLevels <= options.numZoomLevels)
            options.numZoomLevels = lOptions.numZoomLevels;
          else
            options.numZoomLevels = options.numZoomLevels - lOptions.zoomOffset;
          var ignphoto = new OpenLayers.Layer.WMTS({
            name: "ignphoto",
            url: "http://gpp3-wxs.ign.fr/"+evt.config.options.ignKey+"/wmts",
            layer: "ORTHOIMAGERY.ORTHOPHOTOS",
            matrixSet: "PM",
            style: "normal",
            projection: new OpenLayers.Projection("EPSG:3857"),
            attribution: 'Fond&nbsp;: &copy;IGN <a href="http://www.geoportail.fr/" target="_blank"><img src="http://api.ign.fr/geoportail/api/js/2.0.0beta/theme/geoportal/img/logo_gp.gif"></a> <a href="http://www.geoportail.gouv.fr/depot/api/cgu/licAPI_CGUF.pdf" alt="TOS" title="TOS" target="_blank">Conditions d\'utilisation</a>'
            , numZoomLevels: options.numZoomLevels, maxResolution: options.maxResolution, minZoomLevel:options.zoomOffset
            ,zoomOffset: options.zoomOffset

          });
          ignphoto.maxExtent = maxExtent;
          var ignphotoCfg = {
             "name":"ignphoto"
            ,"title":"IGN Photos"
          };
          evt.config.layers['ignphoto'] = ignphotoCfg;
          evt.baselayers.push(ignphoto);
          evt.map.allOverlays = false;
       }
      } catch(e) {
         //problems with google
         var myError = e;
         //console.log(myError);
       }
     }

      if('lizmapExternalBaselayers' in evt.config){

        var externalService = OpenLayers.Util.urlAppend(lizUrls.wms
          ,OpenLayers.Util.getParameterString(lizUrls.params)
        );
        if (lizUrls.publicUrlList && lizUrls.publicUrlList.length > 1 ) {
            externalService = [];
            for (var j=0, jlen=lizUrls.publicUrlList.length; j<jlen; j++) {
              externalService.push(
                OpenLayers.Util.urlAppend(
                  lizUrls.publicUrlList[j],
                  OpenLayers.Util.getParameterString(lizUrls.params)
                )
              );
            }
        }

        // Add lizmap external baselayers
        for (id in evt.config['lizmapExternalBaselayers']) {

          var layerConfig = evt.config['lizmapExternalBaselayers'][id];

          if (!('repository' in layerConfig) || !('project' in layerConfig))
            continue;

          var layerName = evt.cleanName(layerConfig.layerName);

          var layerWmsParams = {
            layers:layerConfig.layerName
            ,version:'1.3.0'
            ,exceptions:'application/vnd.ogc.se_inimage'
            ,format:(layerConfig.layerImageFormat) ? 'image/'+layerConfig.layerImageFormat : 'image/png'
            ,dpi:96
          };
          if (layerWmsParams.format != 'image/jpeg')
            layerWmsParams['transparent'] = true;

          // Change repository and project in service URL
          var reg = new RegExp('repository\=(.+)&project\=(.+)', 'g');
          if (!externalService instanceof Array)
            var url = externalService.replace(reg, 'repository='+layerConfig.repository+'&project='+layerConfig.project);
          else
            var url = jQuery.map(externalService, function(element) { return element.replace(reg, 'repository='+layerConfig.repository+'&project='+layerConfig.project) });





          // creating the base layer
          layerConfig.title = layerConfig.layerTitle
          layerConfig.name = layerConfig.layerName
          layerConfig.baselayer = true;
          layerConfig.singleTile = "False";
          evt.config.layers[layerName] = layerConfig;
          evt.baselayers.push(new OpenLayers.Layer.WMS(layerName,url
            ,layerWmsParams
            ,{isBaseLayer:true
            ,gutter:5
            ,buffer:0
            ,singleTile:(layerConfig.singleTile == 'True')
          }));
          evt.map.allOverlays = false;

        }
      }

    }
   ,'uicreated':function(evt){
        //console.log('uicreated')
        var ovCtrl = lizMap.map.getControlsByClass('OpenLayers.Control.OverviewMap');
        if ( ovCtrl.length != 0 ) {
            ovCtrl = ovCtrl[0];
            if ( ovCtrl.ovmap.layers.length > 1 ) {
                for ( var i=0, len=ovCtrl.ovmap.layers.length; i<len; i++ ){
                    var l = ovCtrl.ovmap.layers[i];
                    if( l.name.toLowerCase() != 'overview' )
                        l.destroy();
                }
            }
        }
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
