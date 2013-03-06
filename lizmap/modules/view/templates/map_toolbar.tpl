{if $annotation}
<div id="annotation-point-menu" class="annotation" style="display:none;">
  <h3><span class="title"><button id="annotation-point-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~annotation.toolbar.title.point@}</span></span></h3>
</div>
<div id="annotation-line-menu" class="annotation" style="display:none;">
  <h3><span class="title"><button id="annotation-line-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~annotation.toolbar.title.line@}</span></span></h3>
</div>
<div id="annotation-polygon-menu" class="annotation" style="display:none;">
  <h3><span class="title"><button id="annotation-polygon-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~annotation.toolbar.title.polygon@}</span></span></h3>
</div>
{/if}
{if $measure}
<div id="measure-length-menu" class="measure" style="display:none;">
  <h3><span class="title"><button id="measure-length-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~map.measure.toolbar.title.length@}</span></span></h3>
</div>
<div id="measure-area-menu" class="measure" style="display:none;">
  <h3><span class="title"><button id="measure-area-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~map.measure.toolbar.title.area@}</span></span></h3>
</div>
<div id="measure-perimeter-menu" class="measure" style="display:none;">
  <h3><span class="title"><button id="measure-perimeter-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~map.measure.toolbar.title.perimeter@}</span></span></h3>
</div>
{/if}
{if $print}
<div id="print-menu" class="print" style="display:none;">
  <h3><span class="title"><button class="btn-print-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}</span></span></h3>
  <div class="menu-content">
    <button class="btn-print-launch btn btn-small btn-success"><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}</button>
  </div>
</div>
{/if}
{if $locate}
<div id="locate-menu" class="locate" style="display:none;">
  <h3><span class="title"><button class="btn-locate-clear btn btn-mini btn-link" type="button"></button><span class="icon"></span>&nbsp;{@view~map.locatemenu.title@}</span></span></h3>
  <div class="menu-content">
    <div id="locate">
    </div>
  </div>
</div>
{/if}
