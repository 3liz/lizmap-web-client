<div id="header">
  <div id="logo">
    <h1>{$repositoryLabel}</h1>
  </div>
  <div id="title">
    <h1>
    {if $WMSServiceTitle}
      {$WMSServiceTitle}
    {else}
      {@view~map.title.h1@}
    {/if}
    </h1>
  </div>
</div>

<div id="headermenu" class="navbar navbar-fixed-top">
  <div id="auth" class="navbar-inner">
    {zone 'view~map_headermenu', array('repository'=>$repository,'project'=>$project)}
  </div>

</div>

<div id="content">

  <span class="ui-icon ui-icon-open-menu" style="display:none;" title="{@view~map.menu.show.hover@}"></span>

  <div id="menu">
    <div id="close-menu" style="display:none;" title="{@view~map.menu.close.hover@}">
      <span class="ui-icon ui-icon-close-menu"></span>
    </div>
    <div id="toolbar">
      {zone 'view~map_toolbar', array('repository'=>$repository,'project'=>$project)}
    </div>
    <div id="switcher-menu" class="switcher">
      <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~map.switchermenu.title@}</span></span></h3>
      <div class="menu-content">
        <div id="switcher"></div>
      </div>
    </div>
    <div id="baselayer-menu" class="baselayer">
      <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~map.baselayermenu.title@}</span></span></h3>
      <div class="menu-content">
        <div class="baselayer-select">
          <select id="baselayer-select" class="label"></select>
        </div>
      </div>
    </div>
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
      <div class="history"><button class="previous" title="{@view~map.navbar.previous.hover@}"></button><button class="next" title="{@view~map.navbar.next.hover@}"></button></div>
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
      <div id="mouseposition-bar">
        <span style="display:none;">{@view~map.mouseposition.hover@}</span>
        <span id="mouseposition" title="{@view~map.mouseposition.hover@}"></span>
        <select title="{@view~map.mouseposition.select@}">
          <option value="m">{@view~map.mouseposition.units.m@}</option>
          <option value="f">{@view~map.mouseposition.units.f@}</option>
          <option value="d">{@view~map.mouseposition.units.d@}</option>
          <option value="dm">{@view~map.mouseposition.units.dm@}</option>
          <option value="dms">{@view~map.mouseposition.units.dms@}</option>
        </select>
      </div>
    </div>

    <div id="attribution-box">
      <span id="attribution"></span>
      {image $j_themepath.'css/img/logo_footer.png'}
    </div>

    <div id="permalink-box">
      <a href="" target="_blank" id="permalink">{@view~map.permalink.title@}</a>
    </div>

    <div id="message" class="span6">{jmessage_bootstrap}</div>

    <div id="attribute-table-panel" style="display:none;">
      <h3>
          <span class="title">
              <button class="btn-attribute-clear btn btn-mini" type="button" title="{@view~map.attributeLayers.toolbar.btn.clear.title@}">{@view~map.attributeLayers.toolbar.btn.clear.title@}</button>
              &nbsp;
              <button class="btn-attribute-glue btn btn-mini" type="button" title="{@view~map.attributeLayers.toolbar.btn.glue.activate.title@}">{@view~map.attributeLayers.toolbar.btn.glue.activate.title@}</button>
              <button class="btn-attribute-size btn btn-mini" type="button" title="{@view~map.attributeLayers.toolbar.btn.size.maximize.title@}">{@view~map.attributeLayers.toolbar.btn.size.maximize.title@}</button>
              <span class="icon"></span>&nbsp;{@view~map.attributeLayers.toolbar.title@}
          </span>
        </h3>
        <div id="attribute-table-container"></div>
    </div>
  </div>

  <div id="metadata">
    <div class="row">
      <div class="span4 offset1">
        <h2>{@view~map.metadata.h2.illustration@}</h2>
        <p>
          <img src="{jurl 'view~media:illustration', array('repository'=>$repository,'project'=>$project)}" alt="project image" class="img-polaroid liz-project-img">
        </p>
      </div>

      <div class="span5 offset1">
        <h2>{@view~map.metadata.h2.description@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.description.title@}</dt>
            <dd>{$WMSServiceTitle}&nbsp;</dd>
            <dt>{@view~map.metadata.description.abstract@}</dt>
            <dd>{$WMSServiceAbstract|nl2br}&nbsp;</dd>
          </dl>
        </p>
      </div>

      <div class="span4 offset1">
        <h2>{@view~map.metadata.h2.properties@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.properties.projection@}</dt>
            <dd><small>{$ProjectCrs}&nbsp;</small></dd>
            <dt>{@view~map.metadata.properties.extent@}</dt>
            <dd><small>{$WMSExtent}</small></dd>
          </dl>
        </p>
      </div>
    </div>

    <div class="row">
      <div class="span5 offset1">
        <h2>{@view~map.metadata.h2.contact@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.contact.organization@}</dt>
            <dd>{$WMSContactOrganization}&nbsp;</dd>
            <dt>{@view~map.metadata.contact.person@}</dt>
            <dd>{$WMSContactPerson}&nbsp;</dd>
            <dt>{@view~map.metadata.contact.email@}</dt>
            <dd>{$WMSContactMail|replace:'@':' (at) '}&nbsp;</dd>
            <dt>{@view~map.metadata.contact.phone@}</dt>
            <dd>{$WMSContactPhone}&nbsp;</dd>
          </dl>
        </p>
      </div>
      <div class="span7">
        <h2>{@view~map.metadata.h2.resources@}</h2>
        <p>
          <dl class="dl-horizontal">
            <dt>{@view~map.metadata.resources.website@}</dt>
            <dd><a href="{$WMSOnlineResource}" target="_blank">{$WMSOnlineResource}</a></dd>

            {if $wmsGetCapabilitiesUrl}
            <dt>{@view~map.metadata.properties.wmsGetCapabilitiesUrl@}</dt>
            <dd><small><a href="{$wmsGetCapabilitiesUrl}" target="_blank">WMS Url</a></small></dd>
            {/if}
          </dl>
        </p>
      </div>
    </div>

    <div class="row">
      <div class="span4 offset8">
        <span class="btn" id="hideMetadata">{@view~map.metadata.hide@}</span>
      </div>
    </div>
  </div>
</div>

<div id="loading" class="ui-dialog-content ui-widget-content" title="{@view~map.loading.title@}">
  <p>
    {image $j_themepath.'css/img/loading.gif'}
  </p>
</div>

<div id="edition-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-show="false" data-keyboard="false" data-backdrop="static">
</div>

