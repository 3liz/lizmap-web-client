<div class="edition">
    <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
    <div class="menu-content">
        <p id="edition-modification-msg">
            {@view~edition.modification.msg@}
        </p>
        <div id="edition-creation">
            <div>
                <select id="edition-layer" class="form-select"></select>
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
                    <lizmap-digitizing
                        context="draw"
                        selected-tool="point"
                        available-tools="point"
                        measure
                    ></lizmap-digitizing>
                </div>
            </div>
        </div>
    </div>

    <div id="edition-waiter" class="waiter">
        <h3><span class="title"><span class="icon"></span>&nbsp;<span class="text">{@view~edition.toolbar.title@}</span></span></h3>
        <div class="menu-content">
            <div class="progress progress-bar progress-bar-striped progress-bar-animated active">
                <div class="bar" style="width: 100%;"></div>
            </div>
        </div>
    </div>

</div>
