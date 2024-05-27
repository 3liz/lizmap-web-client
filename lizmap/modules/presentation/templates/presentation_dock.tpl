<!-- Presentation dock container -->
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

<!-- Templates -->

<!-- Creation button -->
<template id="lizmap-presentation-create-button-template">
    <div style="text-align: center;">
        <button class="btn liz-presentation-create presentation"
            title="{@presentation~presentation.dock.card.button.create.title@}">{@presentation~presentation.dock.card.button.create.label@}</button>
    </div>
</template>

<!-- Template for a presentation card -->
<template id="lizmap-presentation-card-template">
    <h3 class="lizmap-presentation-title"></h3>
    <p class="lizmap-presentation-description"></p>

    <!-- table with details -->
    <table class="presentation-detail-table table table-condensed">
        <tr>
            <th>{@presentation~presentation.form.presentation.background_color.label@}</th>
            <td class="presentation-detail-background_color"></td>
        </tr>
        <tr>
            <th>{@presentation~presentation.form.presentation.background_image.label@}</th>
            <td class="presentation-detail-background_image"></td>
        </tr>
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

    <!-- div containing the presentation pages preview -->
    <div class="lizmap-presentation-card-pages-preview">
        <h3 class="lizmap-presentation-card-pages-preview-title">{@presentation~presentation.dock.card.pages.title.label@}</h3>

        <button class="btn liz-presentation-create page"
            title="{@presentation~presentation.dock.card.button.create.page.title@}">{@presentation~presentation.dock.card.button.create.page.label@}</button>
    </div>
</template>


<!-- Template for a presentation page preview item -->
<template id="lizmap-presentation-page-preview-template">
    <h3 class="lizmap-presentation-page-preview-title"></h3>
    <table class="presentation-detail-table table table-condensed">
        <tr>
            <!-- <th>{@presentation~presentation.dock.page.preview.description.label@}</th> -->
            <td class="presentation-page-description"></td>
        </tr>
    </table>
    <div class="lizmap-presentation-page-preview-toolbar">
        <button class="btn liz-presentation-edit page" value=""
            title="{@presentation~presentation.dock.page.preview.button.edit.title@}">{@presentation~presentation.dock.page.preview.button.edit.label@}</button>
        <button class="btn liz-presentation-delete page" value=""
            title="{@presentation~presentation.dock.page.preview.button.delete.title@}" data-confirm="{@presentation~presentation.dock.page.preview.button.delete.confirm@}">{@presentation~presentation.dock.page.preview.button.delete.label@}</button>
    </div>
</template>

<!-- Template for the presentation slides container -->
<template id="lizmap-presentation-slides-container-template">
    <div id="lizmap-presentation-slides-toolbar">
        <!-- First page -->
        <button class="btn"
            id="lizmap-presentation-slides-first-page"
            title="{@presentation~presentation.slides.toolbar.button.first.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToFirstPage();"
        >{@presentation~presentation.slides.toolbar.button.first.page.label@}</button>
        <!-- Previous page -->
        <button class="btn"
            id="lizmap-presentation-slides-previous-page"
            title="{@presentation~presentation.slides.toolbar.button.previous.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToPreviousPage();"
        >{@presentation~presentation.slides.toolbar.button.previous.page.label@}</button>
        <!-- Next page -->
        <button class="btn"
            id="lizmap-presentation-slides-next-page"
            title="{@presentation~presentation.slides.toolbar.button.next.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToNextPage();"
        >{@presentation~presentation.slides.toolbar.button.next.page.label@}</button>
        <!-- Last page -->
        <button class="btn"
            id="lizmap-presentation-slides-last-page"
            title="{@presentation~presentation.slides.toolbar.button.last.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToLastPage();"
        >{@presentation~presentation.slides.toolbar.button.last.page.label@}</button>
        <!-- Close -->
        <button class="btn"
            id="lizmap-presentation-slides-close"
            title="{@presentation~presentation.slides.toolbar.button.close.hint@}"
            onclick="lizMap.mainLizmap.presentation.resetLizmapPresentation(true, true, true, true);"
        >{@presentation~presentation.slides.toolbar.button.close.label@}</button>
        <!-- Minify -->
        <button class="btn"
            id="lizmap-presentation-slides-minify"
            title="{@presentation~presentation.slides.toolbar.button.minify.hint@}"
            onclick="lizMap.mainLizmap.presentation.toggleLizmapPresentation(false);"
        >{@presentation~presentation.slides.toolbar.button.minify.label@}</button>
    </div>
</template>

<!-- Template for the div allowing to set the minified presentatino back to visibility -->
<template id="lizmap-presentation-slides-minified-toolbar-template">
    <div id="lizmap-presentation-slides-minified-toolbar">
        <button class="btn"
            id="lizmap-presentation-slides-restore"
            title="{@presentation~presentation.slides.toolbar.button.restore.hint@}"
            onclick="lizMap.mainLizmap.presentation.toggleLizmapPresentation(true);"
        >{@presentation~presentation.slides.toolbar.button.restore.label@}</button>
    </div>
</template>

<!-- Template for a presentation page item -->
<template id="lizmap-presentation-page-template">
    <a class="lizmap-presentation-page-anchor"></a>
    <h2 class="lizmap-presentation-page-title"></h2>
    <div class="lizmap-presentation-page-content">
        <div class="lizmap-presentation-page-text">
        </div>
        <div class="lizmap-presentation-page-media">
        </div>
    </div>
</template>
