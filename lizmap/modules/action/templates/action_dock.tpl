<div class="action">
    <h3>
        <span class="title">
            <button id="action-close" class="btn btn-stop btn-sm btn-error btn-link"
                title="{@action~action.dock.close@}">×</button>
            <span class="icon"></span>&nbsp;
            <span class="text">{@action~action.dock.title@}</span>
        </span>
    </h3>
    <div id="project-action-selector-container" class="menu-content">
        <lizmap-action-selector id="lizmap-project-actions" title="{@action~action.dock.form.select.help@}"
            no-selection-warning="{@action~action.dock.form.select.warning@}" action-scope="project">
        </lizmap-action-selector>
    </div>
</div>


<!-- Template for the web component lizmap-action-selector -->
<template id="lizmap-action-item-list">
    <!-- div containing the select and the selected item description -->
    <div class="action-selector-container">
        <select class="action-select">
            <option value="">-- {@action~action.dock.form.select.emptyItem.label@} -- </option>
        </select>
        <div class="action-description" data-default-value="{@action~action.dock.action.choose@}">
            {@action~action.dock.action.choose@}
        </div>
    </div>
    <!-- div with the action button(s) -->
    <div class="action-buttons">
        <button class="btn action-run-button" title="{@action~action.dock.form.button.run.help@}">
            {@action~action.dock.form.button.run.label@}
        </button>
        <button class="btn action-deactivate-button" title="{@action~action.dock.form.button.deactivate.help@}">
            {@action~action.dock.form.button.deactivate.label@}
        </button>
    </div>
</template>
