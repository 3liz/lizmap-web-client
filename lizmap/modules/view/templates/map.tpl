<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>
    {if $WMSServiceTitle}
      {$WMSServiceTitle}
    {else}
      {@view~map.title.h1@}
    {/if}
    </h1>
    <h2>{$repositoryLabel}</h2>
  </div>
  <div id="headermenu" class="navbar navbar-fixed-top">
    {zone 'view~map_headermenu', array('repository'=>$repository,'project'=>$project,'auth_url_return'=>$auth_url_return)}
  </div>
</div>

<div id="content">

  <div id="menuToggle">
    <span></span>
    <span></span>
    <span></span>
  </div>

  <div id="mapmenu">
    {zone 'view~map_menu', array('repository'=>$repository,'project'=>$project,'dockable'=>$dockable,'minidockable'=>$minidockable, 'bottomdockable'=>$bottomdockable, 'rightdockable'=>$rightdockable)}
  </div>

  <div id="docks-wrapper">
    <div id="dock">
      {zone 'view~map_dock', array('repository'=>$repository,'project'=>$project,'dockable'=>$dockable)}
    </div>

    <div id="sub-dock">
    </div>

    <div id="bottom-dock">
      {zone 'view~map_bottomdock', array('repository'=>$repository,'project'=>$project,'dockable'=>$bottomdockable)}
    </div>

    <div id="right-dock" class="hide">
      {zone 'view~map_rightdock', array('repository'=>$repository,'project'=>$project,'dockable'=>$rightdockable)}
    </div>
  </div>
  <div id="map-content">
    <div id="newOlMap" style="width:100%;height:100%;position: absolute;z-index:750;"></div>
    <div id="liz_layer_popup" class="ol-popup">
      <a href="#" id="liz_layer_popup_closer" class="ol-popup-closer"></a>
      <div id="liz_layer_popup_contentDiv" class="lizmapPopupContent"></div>
    </div>
    <div id="tooltip"></div>
    <div id="map"></div>

    <div id="mini-dock">
      {zone 'view~map_minidock', array('repository'=>$repository,'project'=>$project,'dockable'=>$minidockable)}
    </div>

    <lizmap-navbar id="navbar"></lizmap-navbar>

    <div id="overview-box">
      <lizmap-overviewmap title="{@view~map.overviewmap.hover@}"></lizmap-overviewmap>
      <div id="overview-bar">
       <lizmap-scaleline title="{@view~map.overviewbar.scaletext.hover@}"></lizmap-scaleline>
      </div>
      <lizmap-mouse-position></lizmap-mouse-position>
    </div>
    <div id="attribution-box">
      <div id="attribution-ol"></div>
      <img src="{$j_themepath.'css/img/logo_footer.png'}" alt=""/>
    </div>

    <div id="message" class="span6">{jmessage_bootstrap}</div>


    <div id="lizmap-search">

      <div id="lizmap-search-close">
        <button class="btn btn-mini btn-primary">{@view~map.bottomdock.toolbar.btn.clear.title@}</button>
      </div>

      <div>
        <ul class="items"></ul>
      </div>

    </div>

  </div>
</div>

<div id="loading" class="ui-dialog-content ui-widget-content" title="{@view~map.loading.title@}">
  <p>
  </p>
</div>

<div id="lizmap-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-show="false" data-keyboard="false" data-backdrop="static">
</div>


{if $googleAnalyticsID && $googleAnalyticsID != ''}
<!-- Google Analytics -->
<script type="text/javascript">
{literal}
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
{/literal}
ga('create', '{$googleAnalyticsID}', 'auto');
ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
{/if}
