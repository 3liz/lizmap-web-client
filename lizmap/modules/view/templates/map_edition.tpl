<div class="edition">
  <h3><span class="title"><!--button id="edition-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button--><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
  <div class="menu-content">
    <div>
      <select id="edition-layer"></select>
    </div>

    <a id="edition-draw" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.draw.tooltip@}" data-placement="bottom">{@view~edition.toolbar.draw.title@}</a>
<!--
    <a id="edition-select-undo" class="btn btn-small disabled" href="#" rel="tooltip" title="{@view~edition.toolbar.select.undo.tooltip@}" data-placement="bottom">{@view~edition.toolbar.select.undo.title@}</a>
-->



    <form id="edition-hidden-form" style="display:none;">
      <input type="hidden" name="liz_wkt" value=""/>
    </form>

  </div>


  <div class="menu-content">
    <div id="edition-geomtool-container" class="btn-group" data-toggle="buttons-radio" style="display:none;">
        <button id="edition-geomtool-nodetool" class="btn btn-small" data-original-title="{@view~edition.geomtool.nodetool.title@}">
            <i class="icon-none qgis_sprite mActionNodeTool"></i>
        </button>
        <button id="edition-geomtool-drag" class="btn btn-small" data-original-title="{@view~edition.geomtool.drag.title@}">
            <i class="icon-none qgis_sprite mActionMoveFeature"></i>
        </button>
        <button id="edition-geomtool-rotate" class="btn btn-small" data-original-title="{@view~edition.geomtool.rotate.title@}">
            <i class="icon-none qgis_sprite mActionRotateFeature"></i>
        </button>
        <button id="edition-geomtool-reshape" class="btn btn-small" data-original-title="{@view~edition.geomtool.reshape.title@}">
            <i class="icon-none qgis_sprite mActionReshape"></i>
        </button>
    </div>
    <div id="edition-form-container">
    </div>
    <div id="edition-children-container" style="display:none;">
    </div>
  </div>

  <div id="edition-waiter" class="waiter">
    <h3><span class="title"><!--button id="edition-stop" class="btn btn-stop btn-mini btn-link" title="{@view~map.toolbar.content.stop@}"></button--><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
    <div class="menu-content">
    <div class="progress progress-striped active">
      <div class="bar" style="width: 100%;"></div>
    </div>
    </div>
  </div>

</div>
