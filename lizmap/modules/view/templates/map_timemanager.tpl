<div id="timemanager-menu" class="timemanager" style="display:none;">
    <h3>
        <span class="title">
            <button type="button" class="btn-timemanager-clear btn-close"
                title="{@view~map.toolbar.content.stop@}"></button>
            <span class="icon"></span>
            <span class="text">&nbsp;{@view~map.timemanager.toolbar.title@}&nbsp;</span>
        </span>
    </h3>
    <div class="menu-content">
        <div id="tmSlider"></div>
        <div>
            <span id="tmCurrentValue"></span><span> - </span><span id="tmNextValue"></span><br/>
            <button id="tmPrev" class="btn-print-launch btn btn-sm btn-primary">{@view~map.timemanager.toolbar.prev@}</button>
            <button id="tmTogglePlay" class="btn-print-launch btn btn-sm btn-primary">{@view~map.timemanager.toolbar.play@}</button>
            <button id="tmNext" class="btn-print-launch btn btn-sm btn-primary">{@view~map.timemanager.toolbar.next@}</button>
        </div>
        <div id="tmLayers"></div>
    </div>
</div>
