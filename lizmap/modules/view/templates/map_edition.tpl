<div class="edition">
  <h3><span class="title"><!--button class="edition-stop btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button--><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
  <div class="menu-content">
    <div>
      <select id="edition-layer">
      </select>
    </div>
    <div class="edition-menu-start btn-group" data-toggle="buttons-checkbox">
      <a class="edition-draw btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.title@}</a>
      <a class="edition-select btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.select.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.title@}</a>
      <a class="edition-stop btn btn-small" href="#" rel="tooltip" title="{@view~map.toolbar.content.stop@}" data-placement="bottom">{@view~map.toolbar.content.stop@}</a>
    </div>
    <div style="display:none;" class="edition-menu-draw btn-group" data-toggle="buttons-checkbox">
      <a class="edition-draw-cancel btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.cancel.tooltip@}" data-placement="bottom">{@view~edition.toolbar.cancel.title@}</a>
      <a class="edition-draw-clear btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.clear.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.clear.title@}</a>
      <a class="edition-draw-save btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.save.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.save.title@}</a>
    </div>
    <div style="display:none;" class="edition-menu-select btn-group" data-toggle="buttons-checkbox">
      <a class="edition-select-cancel btn btn-small" href="#" rel="tooltip" title="{@view~edition.toolbar.cancel.tooltip@}" data-placement="bottom">{@view~edition.toolbar.cancel.title@}</a>
      <a class="edition-select-cancel btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.unselect.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.unselect.title@}</a>
      <a class="edition-select-attr btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.attr.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.attr.title@}</a>
      <a class="edition-select-undo btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.undo.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.undo.title@}</a>
      <a class="edition-select-delete btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.delete.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.delete.title@}</a>
    </div>
    <form style="display:none;">
      <input type="hidden" name="liz_srid" value=""/>
      <input type="hidden" name="liz_geometryColumn" value=""/>
      <input type="hidden" name="liz_wkt" value=""/>
      <input type="hidden" name="liz_featureId" value=""/>
    </form>
  </div>
</div>
