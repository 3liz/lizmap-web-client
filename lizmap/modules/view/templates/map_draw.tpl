<div class="draw">
    <h3>
        <span class="title">
            <button class="btn-draw-clear btn btn-mini btn-error btn-link"
                title="{@view~map.toolbar.content.stop@}" onclick="document.querySelector('#button-draw').click();">×</button>
            <svg>
                <use xlink:href="#pencil"></use>
            </svg>
            <span class="text">&nbsp;{@view~map.draw.navbar.title@}&nbsp;</span>
        </span>
    </h3>

    <div class="menu-content">
        <lizmap-digitizing import-export></lizmap-digitizing>
    </div>
</div>
