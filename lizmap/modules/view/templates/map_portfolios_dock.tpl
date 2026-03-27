<div class="portfolios">
    <h3>
        <span class="title">
            <button id="portfolios-close" type="button" class="btn-portfolios-close btn-close"
                title="{@view~map.toolbar.content.stop@}"></button>
            <span class="icon"></span>&nbsp;
            <span class="text">{@view~map.portfolios.toolbar.title@}</span>
        </span>
    </h3>
    <div id="project-portfolios-selector-container" class="menu-content">
        <lizmap-portfolios-selector id="lizmap-project-portfolios" title="{@view~map.portfolio.select.help@}"
            no-selection-warning="{@view~map.portfolio.select.warning@}" template-id="lizmap-portfolios-item-list">
        </lizmap-portfolios-selector>
    </div>
</div>

<!-- Template for the web component lizmap-portfolios-selector -->
<template id="lizmap-portfolios-item-list">
    <!-- div containing the select and the selected item description -->
    <div class="portfolio-selector-container">
        <select class="portfolio-select form-select">
            <option value="">-- {@view~map.portfolio.select.emptyItem.label@} -- </option>
        </select>
        <div class="portfolio-description" data-default-value="{@view~map.portfolio.select.choose@}">
            {@view~map.portfolio.select.choose@}
        </div>
    </div>
    <!-- div with the action button(s) -->
    <div class="portfolio-buttons">
        <button class="btn portfolio-run-button" title="{@view~map.portfolio.button.run.help@}">
            {@view~map.portfolio.button.run.label@}
        </button>
        <button class="btn portfolio-deactivate-button" title="{@view~map.portfolio.button.deactivate.help@}">
            {@view~map.portfolio.button.deactivate.label@}
        </button>
    </div>
</template>
