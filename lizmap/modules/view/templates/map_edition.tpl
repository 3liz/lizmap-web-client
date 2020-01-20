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
    <form id="edition-point-coord-form" class="form-horizontal" style="display:none;">
        <fieldset>
            <legend style="font-weight:bold;"><a id="edition-point-coord-form-expander" class="btn"><i class="icon-chevron-right"></i>{@view~edition.point.coord.title@}</a></legend>
            <div id="edition-point-coord-form-group" class="jforms-table-group" style="display:none;">
                <div class="control-group">
                    <label class="jforms-label control-label" for="edition-point-coord-crs" id="edition-point-coord-crs-label">{@view~edition.point.coord.crs.label@}</label>
                    <div class="controls">
                        <select name="coord-crs" id="edition-point-coord-crs" class="jforms-ctrl-menulist">
                            <option value="4326" selected="selected"><span>EPSG:4326</span></option>
                            <option id="edition-point-coord-crs-layer" value="" style="display:none;"></option>
                            <option id="edition-point-coord-crs-map" value="" style="display:none;"></option>
                        </select>
                    </div>
                </div>
                <div class="control-group">
                    <label class="jforms-label control-label" for="edition-point-coord-x" id="edition-point-coord-x-label">{@view~edition.point.coord.x.label@}</label>
                    <div class="controls">
                        <input name="coord-x" id="edition-point-coord-x" class="jforms-ctrl-input" value="" type="text">
                    </div>
                </div>
                <div class="control-group">
                    <label class="jforms-label control-label" for="edition-point-coord-y" id="edition-point-coord-y-label">{@view~edition.point.coord.y.label@}</label>
                    <div class="controls">
                        <input name="coord-y" id="edition-point-coord-y" class="jforms-ctrl-input" value="" type="text">
                    </div>
                </div>
                <div class="control-group" id="edition-point-coord-geolocation-group" style="display:none;">
                    <div class="controls">
                        <label class="jforms-label checkbox" for="edition-point-coord-geolocation" id="edition-point-coord-geolocation-label">
                            <input name="checked" id="edition-point-coord-geolocation" class="jforms-ctrl-checkbox" value="1" type="checkbox">
                            {@view~edition.point.coord.geolocation.label@}
                        </label>
                    </div>
                </div>
                <div class="control-group">
                    <div class="controls">
                        <button name="submit" id="edition-point-coord-add" class="btn btn-small">{@view~edition.point.coord.add.label@}</button>
                        <button name="submit" id="edition-point-coord-submit" class="btn btn-small">{@view~edition.point.coord.finalize.label@}</button>
                    </div>
                </div>
            </div>
        </fieldset>
    </form>
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
