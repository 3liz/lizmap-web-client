<div class="selectiontool">
  <h3>
    <span class="title">
      <button class="btn-selectiontool-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button>
      <span class="icon-star icon-white"></span>
      <span class="text">&nbsp;{@view~map.selectiontool.toolbar.title@}&nbsp;</span>
    </span>
  </h3>
  <div class="menu-content">
    <table>
      <tr>
        <td>{@view~map.selectiontool.toolbar.layer@}</td>
      </tr>
      <tr>
        <td>
            <select id="selectiontool-layer-list" class="btn-selectiontool-layer-list">
            </select>
        </td>
      </tr>
      <tr>
        <td>
            <div id="selectiontool-query-buttons" class="btn-group" data-toggle="buttons-radio">
                <button id="selectiontool-query-deactivate" class="btn btn-small" data-original-title="{@view~map.selectiontool.toolbar.query.deactivate@}">
                    <i class="icon-none qgis_sprite mIconDeselectedsvg"></i>
                </button>
                <button id="selectiontool-query-box" class="btn btn-small" data-original-title="{@view~map.selectiontool.toolbar.query.box@}">
                    <i class="icon-none qgis_sprite mActionSelectRectanglesvg"></i>
                </button>
                <button id="selectiontool-query-circle" class="btn btn-small" data-original-title="{@view~map.selectiontool.toolbar.query.circle@}">
                    <i class="icon-none qgis_sprite mActionSelectRadiussvg"></i>
                </button>
                <button id="selectiontool-query-polygon" class="btn btn-small" data-original-title="{@view~map.selectiontool.toolbar.query.polygon@}">
                    <i class="icon-none qgis_sprite mActionSelectPolygonsvg"></i>
                </button>
                <button id="selectiontool-query-freehand" class="btn btn-small" data-original-title="{@view~map.selectiontool.toolbar.query.freehand@}">
                    <i class="icon-none qgis_sprite mActionSelectFreehandsvg"></i>
                </button>
            </div>
        </td>
      </tr>
      <tr>
        <td>
            <span id="selectiontool-results">{@view~dictionnary.selectiontool.results.none@}</span>
        </td>
      </tr>
      <tr>
        <td>
            <div id="selectiontool-actions">
                <div id="selectiontool-type-buttons" class="btn-group" data-toggle="buttons-radio">
                    <button id="selectiontool-type-refresh" class="btn btn-mini active" title="" data-original-title="{@view~map.selectiontool.toolbar.action.type.refresh@}" value="refresh">
                        <i class="icon-refresh"></i>
                    </button>
                    <button id="selectiontool-type-plus" class="btn btn-mini" title="" data-original-title="{@view~map.selectiontool.toolbar.action.type.plus@}" value="plus">
                        <i class="icon-plus"></i>
                    </button>
                    <button id="selectiontool-type-minus" class="btn btn-mini" title="" data-original-title="{@view~map.selectiontool.toolbar.action.type.minus@}" value="minus">
                        <i class="icon-minus"></i>
                    </button>
                </div>
                <button id="selectiontool-unselect" class="btn btn-mini disabled" title="" data-original-title="{@view~map.selectiontool.toolbar.action.unselect@}">
                    <i class="icon-star-empty"></i>
                </button>
                <button id="selectiontool-filter" class="btn btn-mini disabled" title="" data-original-title="{@view~map.selectiontool.toolbar.action.filter@}">
                    <i class="icon-filter"></i>
                </button>
                {if $layerExport}
                <div class="btn-group dropup" role="group" >
                    <button id="selectiontool-export" type="button" class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown" aria-expanded="false" title="{@view~map.switcher.layer.export.title@}">
                        {@view~map.switcher.layer.export.title@}
                      <span class="caret"></span>
                    </button>
                    <ul id="selectiontool-export-formats" class="dropdown-menu dropdown-menu-right" role="menu">
                        <li><a href="#" class="btn-export-selection">GeoJSON</a></li>
                        <li><a href="#" class="btn-export-selection">GML</a></li>
                    </ul>
                </div>
                {/if}
            </div>
        </td>
      </tr>
    </table>
  </div>
</div>
