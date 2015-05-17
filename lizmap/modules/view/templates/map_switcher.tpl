<div id="switcher-layers-container" class="switcher">
    <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~map.legendmenu.title@}</span></span></h3>

    <div id="switcher-layers-actions">
        <button class="btn btn-mini disabled" id="layerActionMetadata" title="{@view~map.switcher.layer.metadata.title@}"><i class=
        "icon-info-sign icon-white"></i></button>

        <button class="btn btn-mini disabled" id="layerActionZoom" title="{@view~map.switcher.layer.zoomToExtent.title@}"><i class="icon-zoom-in icon-white"></i></button>

        <div class="btn-group" role="group" >
            <button type="button" id="layerActionStyle" class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown" aria-expanded="false" title="{@view~map.switcher.layer.style.title@}">
                <i class="icon-adjust icon-white"></i>
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu">
            </ul>
        </div>

        <div class="btn-group" role="group" >
            <button type="button" id="layerActionExport" class="btn btn-mini dropdown-toggle disabled" data-toggle="dropdown" aria-expanded="false" title="{@view~map.switcher.layer.export.title@}">
                <i class="icon-download icon-white"></i>
              <span class="caret"></span>
            </button>
            <ul class="dropdown-menu" role="menu">
                <li><a href="#" class="btn-export-layer">GeoJSON</a></li>
                <li><a href="#" class="btn-export-layer">GML</a></li>
            </ul>
        </div>

        <button class="btn btn-mini pull-right" id="layerActionUnfilter" style="display:none;" title="{@view~map.switcher.layer.unfilter.title@}"><i class="icon-filter icon-white"></i></button>

    </div>

    <div class="menu-content">
        <div id="switcher-layers"></div>
    </div>
</div>
<div id="switcher-baselayer" class="baselayer">
    <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~map.baselayermenu.title@}</span></span></h3>
    <div class="menu-content">
        <div class="baselayer-select">
            <select id="switcher-baselayer-select" class="label"></select>
        </div>
    </div>
</div>
