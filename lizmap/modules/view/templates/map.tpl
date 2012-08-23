<div id="header">
  <div id="logo">
    <h1>{$repositoryLabel}</h1>
  </div>
  <div id="title">
    <h1>{@view~map.title.h1@}</h1>
    <h2>{@view~map.title.h2@}</h2>
  </div>
</div>
<div id="content">
  <span class="ui-icon ui-icon-open-menu" style="display:none;" title="{@view~map.menu.show.hover@}"></span>
  <div id="menu">
    <div id="close-menu" title="{@view~map.menu.close.hover@}">
      <span class="ui-icon ui-icon-close-menu"></span>
    </div>
    <div id="toolbar" style="height:0; display:none;"></div>
    <div id="zoom-menu" style="height:0; display:none;">
      <h3><span class="ui-icon ui-icon-zoom-open"></span><span class="title">{@view~map.zoommenu.title@}</span></h3>
    </div>
    <div id="switcher-menu">
      <h3><span class="title">{@view~map.switchermenu.title@}</span></h3>
      <div class="menu-content">
        <div id="switcher"></div>
      </div>
    </div>
    <div id="baselayer-menu">
      <h3><span class="title">{@view~map.baselayermenu.title@}</span></h3>
      <div class="menu-content">
        <div id="baselayer-select">
           <span class="label"></span>
           <button class="button" title="{@view~map.baselayer.select.hover@}"></button>
        </div>
      </div>
    </div>
    <div id="baselayer-select-input" style="display:none;"></div>
  </div>
  <div id="map-content">
    <div id="map"></div>
    <span id="navbar">
      <button class="pan ui-state-select" title="{@view~map.navbar.pan.hover@}"></button><br/>
      <button class="zoom" title="{@view~map.navbar.zoom.hover@}"></button><br/>
      <button class="zoom-extent" title="{@view~map.navbar.zoomextent.hover@}"></button><br/>
      <button class="zoom-in" title="{@view~map.navbar.zoomin.hover@}"></button><br/>
      <div class="slider" title="{@view~map.navbar.slider.hover@}"></div>
      <button class="zoom-out" title="{@view~map.navbar.zoomout.hover@}"></button>
      <span id="zoom-in-max-msg" class="ui-widget-content ui-corner-all" style="display:none;">{@view~map.message.zoominmax@}</span>
    </span>
    <div id="overview-box">
      <div id="overviewmap" title="{@view~map.overviewmap.hover@}"></div>
      <div id="overview-bar">
        <div id="scaleline" class="olControlScaleLine" style="width:100px; position:relative; bottom:0; top:0; left:0;" title="{@view~map.overviewbar.scaleline.hover@}">
        </div>
        <div id="scaletext" class="label" style="position:absolue; bottom:0; top:0; left:100px; right:20px; position:absolute; text-align:center; padding:0.7em 0 0 0;" title="{@view~map.overviewbar.scaletext.hover@}">{@view~map.overviewbar.scaletext.title@}</div>
        <button class="button" title="{@view~map.overviewbar.displayoverview.hover@}"></button>
      </div>
    </div>
  </div>
</div>
<div id="loading" class="ui-dialog-content ui-widget-content" title="{@view~map.loading.title@}">
  <p>
    {image 'css/img/loading.gif'}
  </p>
</div>
