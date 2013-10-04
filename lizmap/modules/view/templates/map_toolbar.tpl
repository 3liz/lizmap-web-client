{if $edition}
<div id="edition-menu" class="edition" style="display:none;">
  <h3><span class="title"><button id="edition-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
  <div class="menu-content">
    <div id="edition-menu-start" class="btn-group" data-toggle="buttons-checkbox">
      <a id="edition-draw" class="btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.title@}</a>
      <a id="edition-select" class="btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.select.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.title@}</a>
    </div>
    <div id="edition-menu-draw" style="display:none;" class="btn-group" data-toggle="buttons-checkbox">
      <a id="edition-draw-cancel" class="btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.cancel.tooltip@}" data-placement="bottom">{@view~edition.toolbar.cancel.title@}</a>
      <a id="edition-draw-clear" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.clear.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.clear.title@}</a>
      <a id="edition-draw-save" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.save.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.save.title@}</a>
    </div>
    <div id="edition-menu-select" style="display:none;" class="btn-group" data-toggle="buttons-checkbox">
      <a id="edition-select-cancel" class="btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.cancel.tooltip@}" data-placement="bottom">{@view~edition.toolbar.cancel.title@}</a>
      <a id="edition-select-unselect" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.unselect.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.unselect.title@}</a>
      <a id="edition-select-attr" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.attr.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.attr.title@}</a>
      <a id="edition-select-undo" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.undo.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.undo.title@}</a>
      <a id="edition-select-delete" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.delete.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.delete.title@}</a>
    </div>
    <form style="display:none;">
      <input type="hidden" name="liz_srid" value=""/>
      <input type="hidden" name="liz_geometryColumn" value=""/>
      <input type="hidden" name="liz_wkt" value=""/>
      <input type="hidden" name="liz_featureId" value=""/>
    </form>
  </div>
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
{if $geolocation}
<div id="geolocate-menu" class="geolocate" style="display:none;">
  <h3><span class="title"><button class="btn-geolocate-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button><span class="icon"></span>&nbsp;{@view~map.geolocate.toolbar.title@}&nbsp;<span class="text"></span></span></span></h3>
  <div class="menu-content">
    <button id="geolocate-menu-center" class="btn-print-launch btn btn-small btn-success"><span class="icon"></span>&nbsp;{@view~map.geolocate.toolbar.center@}</button>
    <button id="geolocate-menu-bind" class="btn-print-launch btn btn-small btn-success"><span class="icon"></span>&nbsp;{@view~map.geolocate.toolbar.bind@}</button>
  </div>
</div>
{/if}
{if $print}
<div id="print-menu" class="print" style="display:none;">
  <h3><span class="title"><button class="btn-print-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}&nbsp;<span class="text"></span></span></span></h3>
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
