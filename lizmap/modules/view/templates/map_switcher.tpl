<div id="switcher-layers-container" class="switcher">
    <div id="switcher-layers-actions">
        <button class="btn btn-sm" id="layers-unfold-all" title="{@view~map.switcher.layers.expand.title@}"><i class=
        "icon-resize-full icon-white"></i></button>
        <button class="btn btn-sm" id="layers-fold-all" title="{@view~map.switcher.layers.collapse.title@}"><i class=
        "icon-resize-small icon-white"></i></button>
        <button class="btn btn-sm" id="layerActionUnfilter" style="display:none;" title="{@view~map.switcher.layer.unfilter.title@}"><i class="icon-filter icon-white"></i></button>
    </div>
    <div class="menu-content">
        <lizmap-treeview></lizmap-treeview>
    </div>
</div>
<div id="switcher-baselayer" class="baselayer">
    <h3>
        <span class="title">
            <span class="icon"></span>&nbsp;
            <span class="text">{@view~map.baselayermenu.title@}</span>
            <span id="get-baselayer-metadata" class="float-end" title="{@view~map.switcher.layer.metadata.title@}"><i class="icon-info-sign icon-white"></i></span>
        </span>
    </h3>
    <div class="menu-content">
        <lizmap-base-layers></lizmap-base-layers>
    </div>
</div>
