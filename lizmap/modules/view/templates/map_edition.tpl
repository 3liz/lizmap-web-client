<div class="edition">
    <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
    <div class="menu-content">
        <p id="edition-modification-msg">
            {@view~edition.modification.msg@}
        </p>
        <div id="edition-creation">
            <div>
                <select id="edition-layer"></select>
            </div>

            <a id="edition-draw" class="btn btn-sm" href="#"
                data-bs-toggle="tooltip" data-bs-title="{@view~edition.toolbar.draw.tooltip@}"
                data-placement="bottom">{@view~edition.toolbar.draw.title@}</a>
        </div>

        <form id="edition-hidden-form" style="display:none;">
            <input type="hidden" name="liz_wkt" value="" />
        </form>

        <div class="tabbable edition-tabs" style="display: none;">
            <ul class="nav nav-pills" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active" data-bs-target="#tabform" data-bs-toggle="tab" type="button" role="tab">{@view~edition.tab.form.title@}</button>
                </li>
                <li class="nav-item">
                    <button class="nav-link" data-bs-target="#tabdigitization" data-bs-toggle="tab" type="button" role="tab">{@view~edition.tab.digitization.title@}</button>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="tabform">
                    <div id="edition-form-container">
                    </div>
                    <div id="edition-children-container" style="display:none;">
                    </div>
                </div>
                <div class="tab-pane" id="tabdigitization">
                    <div id="edition-geomtool-container" class="btn-group" data-toggle="buttons-radio"
                        style="display:none;">
                        <button id="edition-geomtool-nodetool" class="btn btn-sm"
                            data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.nodetool.title@}">
                            <i class="icon-none qgis_sprite mActionNodeTool"></i>
                        </button>
                        <button id="edition-geomtool-drag" class="btn btn-sm"
                            data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.drag.title@}">
                            <i class="icon-none qgis_sprite mActionMoveFeature"></i>
                        </button>
                        <button id="edition-geomtool-rotate" class="btn btn-sm"
                            data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.rotate.title@}">
                            <i class="icon-none qgis_sprite mActionRotateFeature"></i>
                        </button>
                        <button id="edition-geomtool-reshape" class="btn btn-sm"
                            data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.reshape.title@}">
                            <i class="icon-none qgis_sprite mActionReshape"></i>
                        </button>
                        <button id="edition-geomtool-split" class="btn btn-sm"
                            data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.splitfeatures.title@}">
                            <i class="icon-none qgis_sprite mActionSplitFeatures"></i>
                        </button>
                        <lizmap-reverse-geom class="btn btn-sm"
                            data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.reversegeom.title@}">
                        </lizmap-reverse-geom>
                    </div>
                    <button id="edition-geomtool-restart-drawing" class="btn btn-sm"
                        data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.restartdrawing.title@}">
                        <i class="icon-refresh"></i>
                    </button>
                    <lizmap-paste-geom data-bs-toggle="tooltip" data-bs-title="{@view~edition.geomtool.pastegeom.title@}"></lizmap-paste-geom>
                    <form id="edition-point-coord-form" class="form-horizontal">
                        <fieldset>
                            <div id="edition-point-coord-form-group" class="jforms-table-group">
                                <div id="handle-point-coord">
                                    <h3>{@view~edition.point.coord.title@}</h3>
                                    <div class="control-group">
                                        <label class="jforms-label control-label" for="edition-point-coord-crs"
                                            id="edition-point-coord-crs-label">{@view~edition.point.coord.crs.label@}</label>
                                        <div class="controls">
                                            <select name="coord-crs" id="edition-point-coord-crs"
                                                class="jforms-ctrl-menulist">
                                                <option value="4326" selected="selected"><span>EPSG:4326</span></option>
                                                <option id="edition-point-coord-crs-layer" value="" style="display:none;">
                                                </option>
                                                <option id="edition-point-coord-crs-map" value="" style="display:none;">
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="control-group">
                                        <label class="jforms-label control-label" for="edition-point-coord-x"
                                            id="edition-point-coord-x-label">{@view~edition.point.coord.x.label@}</label>
                                        <div class="controls">
                                            <input name="coord-x" id="edition-point-coord-x"
                                                class="jforms-ctrl-input input-small" value="" type="text">
                                        </div>
                                    </div>
                                    <div class="control-group">
                                        <label class="jforms-label control-label" for="edition-point-coord-y"
                                            id="edition-point-coord-y-label">{@view~edition.point.coord.y.label@}</label>
                                        <div class="controls">
                                            <input name="coord-y" id="edition-point-coord-y"
                                                class="jforms-ctrl-input input-small" value="" type="text">
                                        </div>
                                    </div>
                                    <div class="control-group hidden">
                                        <label
                                            class="jforms-label control-label">{@view~edition.segment.length.label@}</label>
                                        <div class="controls">
                                            <label id="edition-segment-length"></label>
                                        </div>
                                    </div>
                                    <div class="control-group hidden">
                                        <label
                                            class="jforms-label control-label">{@view~edition.segment.angle.label@}</label>
                                        <div class="controls">
                                            <label id="edition-segment-angle"></label>
                                        </div>
                                    </div>
                                    <div class="control-group">
                                        <div class="controls">
                                            <button name="submit" id="edition-point-coord-add"
                                                class="btn btn-sm">{@view~edition.point.coord.add.label@}</button>
                                            <button name="submit" id="edition-point-coord-submit"
                                                class="btn btn-sm">{@view~edition.point.coord.finalize.label@}</button>
                                        </div>
                                    </div>
                                    <div class="control-group" id="edition-point-coord-geolocation-group"
                                        style="display:none;">
                                        <div class="controls">
                                            <label class="jforms-label checkbox" for="edition-point-coord-geolocation"
                                                id="edition-point-coord-geolocation-label">
                                                <input name="checked" id="edition-point-coord-geolocation"
                                                    class="jforms-ctrl-checkbox" value="1" type="checkbox">
                                                {@view~edition.point.coord.geolocation.label@}
                                            </label>
                                        </div>
                                    </div>
                                    <lizmap-geolocation-survey></lizmap-geolocation-survey>
                                </div>
                                <lizmap-snapping></lizmap-snapping>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <div id="edition-waiter" class="waiter">
        <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
        <div class="menu-content">
            <div class="progress progress-striped active">
                <div class="bar" style="width: 100%;"></div>
            </div>
        </div>
    </div>

</div>
