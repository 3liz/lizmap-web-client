<div id="presentation-container">
    <div id="presentation-list-container" class="presentation-container-item list-container" >
        <div id="presentation-introduction">
            <p>{@presentation~presentation.dock.introduction.label@}</p>
        </div>
        <div class="lizmap-presentation-card-container">
            <lizmap-presentation-cards id="lizmap-project-presentations" detail=""/>
        </div>
    </div>
</div>


<!-- Templates for the web component lizmap-presentation-cards -->
<!-- Creation button -->
<template id="lizmap-presentation-create-button-template">
    <div style="text-align: center;">
        <button class="btn liz-presentation-create presentation"
            title="{@presentation~presentation.dock.card.button.create.title@}">{@presentation~presentation.dock.card.button.create.label@}</button>
    </div>
</template>

<!-- Template for a page -->
<template id="lizmap-presentation-page-preview-template">
    <h3 class="lizmap-presentation-page-preview-title"></h3>
    <table class="presentation-detail-table table table-condensed">
        <tr>
            <th>{@presentation~presentation.dock.page.preview.description.label@}</th>
            <td class="presentation-page-description"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.dock.page.preview.background_image.label@}</th>
            <td class="presentation-page-background_image"></td>
        </tr>
    </table>
    <div class="lizmap-presentation-page-preview-toolbar">
        <button class="btn liz-presentation-edit page" value=""
            title="{@presentation~presentation.dock.page.preview.button.edit.title@}">{@presentation~presentation.dock.page.preview.button.edit.label@}</button>
        <button class="btn liz-presentation-delete page" value=""
            title="{@presentation~presentation.dock.page.preview.button.delete.title@}" data-confirm="{@presentation~presentation.dock.page.preview.button.delete.confirm@}">{@presentation~presentation.dock.page.preview.button.delete.label@}</button>
    </div>
</template>

<!-- Card -->
<template id="lizmap-presentation-card-template">
    <h3 class="lizmap-presentation-title"></h3>
    <p class="lizmap-presentation-description"></p>

    <!-- table with details -->
    <table class="presentation-detail-table table table-condensed">
        <tr>
            <th>{@presentation~presentation.form.presentation.footer.label@}</th>
            <td class="presentation-detail-footer"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.published.label@}</th>
            <td class="presentation-detail-published"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.granted_groups.label@}</th>
            <td class="presentation-detail-granted_groups"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.created_by.label@}</th>
            <td class="presentation-detail-created_by"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.created_at.label@}</th>
            <td class="presentation-detail-created_at"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.updated_by.label@}</th>
            <td class="presentation-detail-updated_by"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.updated_at.label@}</th>
            <td class="presentation-detail-updated_at"></td>
        </tr>
    </table>

    <!-- div with the presentation button(s) -->
    <div class="lizmap-presentation-card-toolbar">
        <button class="btn liz-presentation-detail" value=""
            title="{@presentation~presentation.dock.card.button.detail.title@}"
            data-label="{@presentation~presentation.dock.card.button.detail.label@}"
            data-title="{@presentation~presentation.dock.card.button.detail.title@}"
            data-reverse-label="{@presentation~presentation.dock.card.button.detail.reverse.label@}"
            data-reverse-title="{@presentation~presentation.dock.card.button.detail.reverse.title@}">
            {@presentation~presentation.dock.card.button.detail.label@}
        </button>
        <button class="btn liz-presentation-edit presentation" value=""
            title="{@presentation~presentation.dock.card.button.edit.title@}">{@presentation~presentation.dock.card.button.edit.label@}</button>
        <button class="btn liz-presentation-delete presentation" value=""
            title="{@presentation~presentation.dock.card.button.delete.title@}" data-confirm="{@presentation~presentation.dock.card.button.delete.confirm@}">{@presentation~presentation.dock.card.button.delete.label@}</button>
        <button class="btn liz-presentation-launch" value=""
            title="{@presentation~presentation.dock.card.button.launch.title@}">{@presentation~presentation.dock.card.button.launch.label@}</button>
    </div>

    <!-- div containing the presentation pages -->
    <div class="lizmap-presentation-card-pages">
        <h3 class="lizmap-presentation-card-pages-title">{@presentation~presentation.dock.card.pages.title.label@}</h3>

        <button class="btn liz-presentation-create page"
            title="{@presentation~presentation.dock.card.button.create.page.title@}">{@presentation~presentation.dock.card.button.create.page.label@}</button>
    </div>
</template>
