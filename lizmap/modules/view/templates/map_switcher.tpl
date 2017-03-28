<div id="switcher-layers-container" class="switcher">
    <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~map.legendmenu.title@}</span></span></h3>

    <div id="switcher-layers-actions">
        <button class="btn btn-mini" id="layers-unfold-all" title="{@view~map.switcher.layers.expand.title@}"><i class=
        "icon-resize-full icon-white"></i></button>
        <button class="btn btn-mini" id="layers-fold-all" title="{@view~map.switcher.layers.collapse.title@}"><i class=
        "icon-resize-small icon-white"></i></button>

        <button class="btn btn-mini layerActionZoom disabled" title="{@view~map.switcher.layer.zoomToExtent.title@}"><i class="icon-zoom-in icon-white"></i></button>

        <button class="btn btn-mini pull-right" id="layerActionUnfilter" style="display:none;" title="{@view~map.switcher.layer.unfilter.title@}"><i class="icon-filter icon-white"></i></button>

    </div>

    <div class="menu-content">
        <div id="switcher-layers"></div>
    </div>
</div>
<div id="switcher-baselayer" class="baselayer">
    <h3>
        <span class="title">
            <span class="icon"></span>&nbsp;
            <span class="text">{@view~map.baselayermenu.title@}</span>
            <span id="get-baselayer-metadata" class="pull-right" title="{@view~map.switcher.layer.metadata.title@}"><i class="icon-info-sign icon-white"></i></span>
        </span>
    </h3>
    <div class="menu-content">
        <div class="baselayer-select">
            <select id="switcher-baselayer-select" class="label"></select>
        </div>
    </div>
</div>
