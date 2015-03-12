<div class="edition">
  <h3><span class="title"><!--button id="edition-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button--><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
  <div class="menu-content">
    <div>
      <select id="edition-layer">
      </select>
    </div>
    <div id="edition-menu-start" class="btn-group" data-toggle="buttons-checkbox">
      <a id="edition-draw" class="btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.title@}</a>
      <a id="edition-select" class="btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.select.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.title@}</a>
      <a id="edition-stop" class="btn btn-small" href="#" rel="tooltip" title="{@view~map.toolbar.content.stop@}" data-placement="bottom">{@view~map.toolbar.content.stop@}</a>
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
