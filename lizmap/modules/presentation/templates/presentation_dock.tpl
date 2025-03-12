<!-- Presentation dock container -->
<div id="lizmap-presentation-container">
    <div id="presentation-list-container" class="presentation-container-item list-container">
        <div id="presentation-introduction" style="padding: 5px;">
            <p>{@presentation~presentation.dock.introduction.label@}</p>
        </div>
        <div class="lizmap-presentation-card-container">
            <!-- Web component lizmap-presentation-cards will be added here by the Presentation.js -->
        </div>
    </div>
    <div id="presentation-running-message" style="display: none;">
        <p>{@presentation~presentation.dock.running.message@}</p>
        <button class="btn" id="lizmap-presentation-slides-restore"
        title="{@presentation~presentation.slides.toolbar.button.restore.hint@}"
        onclick="lizMap.mainLizmap.presentation.toggleLizmapPresentation(true);">{@presentation~presentation.slides.toolbar.button.restore.label@}</button>
    </div>
</div>

<!-- Localized strings -->
<div id="presentation-locales" style="display: none;">
    <span id="presentation-message-form-process-wait">{@presentation~presentation.message.form.process.wait@}</span>
    <span id="presentation-message-form-presentation-edit">{@presentation~presentation.message.form.presentation.edit@}</span>
    <span id="presentation-message-form-extent-saved">{@presentation~presentation.message.form.extent.saved@}</span>
    <span id="presentation-message-form-tree-state-saved">{@presentation~presentation.message.form.tree.state.saved@}</span>
    <span id="presentation-message-form-error-occurred">{@presentation~presentation.message.form.error.occurred@}</span>
</div>

<!-- Templates -->

<!-- Creation button -->
{ifacl2 "lizmap.presentation.edit", $repository}
<template id="lizmap-presentation-create-button-template">
    <div style="text-align: center;">
        <button class="btn liz-presentation-create presentation"
            title="{@presentation~presentation.dock.card.button.create.title@}">{@presentation~presentation.dock.card.button.create.label@}</button>
    </div>
</template>
{/ifacl2}

<!-- Template for a presentation card -->
<template id="lizmap-presentation-card-template">
    <h3 class="lizmap-presentation-title"></h3>
    <p class="lizmap-presentation-description"></p>

    {ifacl2 "lizmap.presentation.edit", $repository}
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
    {/ifacl2}

    <!-- div with the presentation button(s) -->
    <div class="lizmap-presentation-card-toolbar">
        {ifacl2 'lizmap.presentation.edit', $repository}
        <!-- Detail -->
        <button class="btn liz-presentation-detail" value=""
            title="{@presentation~presentation.dock.card.button.detail.title@}"
            data-label="{@presentation~presentation.dock.card.button.detail.label@}"
            data-title="{@presentation~presentation.dock.card.button.detail.title@}"
            data-reverse-label="{@presentation~presentation.dock.card.button.detail.reverse.label@}"
            data-reverse-title="{@presentation~presentation.dock.card.button.detail.reverse.title@}">
            {@presentation~presentation.dock.card.button.detail.label@}
        </button>

        <!-- Edit -->
        <button class="btn btn-warning liz-presentation-edit presentation" value=""
            title="{@presentation~presentation.dock.card.button.edit.title@}">{@presentation~presentation.dock.card.button.edit.label@}</button>

        <!-- Delete -->
        <button class="btn btn-danger liz-presentation-delete presentation" value=""
            title="{@presentation~presentation.dock.card.button.delete.title@}"
            data-confirm="{@presentation~presentation.dock.card.button.delete.confirm@}">{@presentation~presentation.dock.card.button.delete.label@}</button>
        {/ifacl2}

        <!-- Launch -->
        <button class="btn btn-success liz-presentation-launch" value=""
            title="{@presentation~presentation.dock.card.button.launch.title@}">{@presentation~presentation.dock.card.button.launch.label@}</button>
    </div>

    <!-- div containing the presentation pages preview -->
    <div class="lizmap-presentation-card-pages-preview">
        <h3 class="lizmap-presentation-card-pages-preview-title">
            {@presentation~presentation.dock.card.pages.title.label@}</h3>


        {ifacl2 'lizmap.presentation.edit', $repository}
        <button class="btn liz-presentation-create page"
            title="{@presentation~presentation.dock.card.button.create.page.title@}">{@presentation~presentation.dock.card.button.create.page.label@}</button>
        {/ifacl2}
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

    {ifacl2 "lizmap.presentation.edit", $repository}
    <div class="lizmap-presentation-page-preview-toolbar">
        <button class="btn btn-warning liz-presentation-edit page" value=""
            title="{@presentation~presentation.dock.page.preview.button.edit.title@}">{@presentation~presentation.dock.page.preview.button.edit.label@}</button>
        <button class="btn btn-danger liz-presentation-delete page" value=""
            title="{@presentation~presentation.dock.page.preview.button.delete.title@}"
            data-confirm="{@presentation~presentation.dock.page.preview.button.delete.confirm@}">{@presentation~presentation.dock.page.preview.button.delete.label@}</button>
    </div>
    {/ifacl2}
</template>

<!-- Template for the presentation slides container -->
<template id="lizmap-presentation-slides-container-template">
    <div id="lizmap-presentation-slides-toolbar">
        <!-- First page -->
        <button class="btn" id="lizmap-presentation-slides-first-page"
            title="{@presentation~presentation.slides.toolbar.button.first.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToFirstPage();">{@presentation~presentation.slides.toolbar.button.first.page.label@}</button>
        <!-- Previous page -->
        <button class="btn" id="lizmap-presentation-slides-previous-page"
            title="{@presentation~presentation.slides.toolbar.button.previous.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToPreviousPage();">{@presentation~presentation.slides.toolbar.button.previous.page.label@}</button>
        <!-- Next page -->
        <button class="btn" id="lizmap-presentation-slides-next-page"
            title="{@presentation~presentation.slides.toolbar.button.next.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToNextPage();">{@presentation~presentation.slides.toolbar.button.next.page.label@}</button>
        <!-- Last page -->
        <button class="btn" id="lizmap-presentation-slides-last-page"
            title="{@presentation~presentation.slides.toolbar.button.last.page.hint@}"
            onclick="lizMap.mainLizmap.presentation.goToLastPage();">{@presentation~presentation.slides.toolbar.button.last.page.label@}</button>
        <!-- Close -->
        <button class="btn" id="lizmap-presentation-slides-close"
            title="{@presentation~presentation.slides.toolbar.button.close.hint@}"
            onclick="lizMap.mainLizmap.presentation.resetLizmapPresentation(true, true, true, true);">{@presentation~presentation.slides.toolbar.button.close.label@}</button>
        <!-- Minify -->
        <button class="btn" id="lizmap-presentation-slides-minify"
            title="{@presentation~presentation.slides.toolbar.button.minify.hint@}"
            onclick="lizMap.mainLizmap.presentation.toggleLizmapPresentation(false);">{@presentation~presentation.slides.toolbar.button.minify.label@}</button>
    </div>
</template>

<!-- Template for the div allowing to set the minified presentation back to visibility -->
<template id="lizmap-presentation-slides-minified-toolbar-template">
    <div id="lizmap-presentation-slides-minified-toolbar">
        <button class="btn" id="lizmap-presentation-slides-restore"
            title="{@presentation~presentation.slides.toolbar.button.restore.hint@}"
            onclick="lizMap.mainLizmap.presentation.toggleLizmapPresentation(true);">{@presentation~presentation.slides.toolbar.button.restore.label@}</button>
    </div>
</template>

<!-- Template for a presentation page item -->
<template id="lizmap-presentation-page-template">
    <a class="lizmap-presentation-page-anchor"></a>
    <h2 class="lizmap-presentation-page-title"></h2>
    <div class="lizmap-presentation-page-toolbar">

        {ifacl2 "lizmap.presentation.edit", $repository}
        <button class="btn liz-presentation-edit page" value=""
            title="{@presentation~presentation.dock.page.preview.button.edit.title@}">{@presentation~presentation.dock.page.preview.button.edit.label@}</button>
        {/ifacl2}
    </div>
    <div class="lizmap-presentation-page-content">
        <div class="lizmap-presentation-page-text">
        </div>
        <div class="lizmap-presentation-page-media">
        </div>
    </div>
</template>

{ifacl2 "lizmap.presentation.edit", $repository}
<!-- Template for the extent & tree state button to add in the page editing form -->
<template id="lizmap-presentation-page-edit-map-buttons-template">
    <!-- Save map extent -->
    <div class="control-group">
        <label class="control-label jforms-label" for="presentation-page-add-bbox" id="presentation-page-add-bbox-label"
            title="{@presentation~presentation.form.presentation_page.map_extent.hint@}">{@presentation~presentation.form.presentation_page.map_extent.label@}</label>
        <div class="controls">
            <button id="presentation-page-add-bbox" class="btn edit-map-buttons presentation-page-add-bbox"
                name="add-bbox" title="{@presentation~presentation.form.presentation_page.map_extent.hint@}"
                data-label-empty="{@presentation~presentation.form.presentation_page.map_extent.label.empty@}"
                data-label-saved="{@presentation~presentation.form.presentation_page.map_extent.label.saved@}">{@presentation~presentation.form.presentation_page.map_extent.label@}</button>
            <button id="presentation-page-drop-bbox" class="btn drop-map-buttons presentation-page-drop-bbox"
                name="drop-bbox"
                title="{@presentation~presentation.form.presentation_page.map_extent.drop.hint@}">{@presentation~presentation.form.presentation_page.map_extent.drop.label@}</button>
        </div>
    </div>
    <!-- Save layer tree state -->
    <div class="control-group">
        <label class="control-label jforms-label" for="presentation-page-add-tree-state"
            id="presentation-page-add-tree-state-label"
            title="{@presentation~presentation.form.presentation_page.tree_state.hint@}">{@presentation~presentation.form.presentation_page.tree_state.label@}</label>
        <div class="controls">
            <button id="presentation-page-add-tree-state" class="btn edit-map-buttons presentation-page-add-tree-state"
                name="add-tree-state" title="{@presentation~presentation.form.presentation_page.tree_state.hint@}"
                data-label-empty="{@presentation~presentation.form.presentation_page.tree_state.label.empty@}"
                data-label-saved="{@presentation~presentation.form.presentation_page.tree_state.label.saved@}">{@presentation~presentation.form.presentation_page.tree_state.label@}</button>
            <button id="presentation-page-drop-tree-state"
                class="btn drop-map-buttons presentation-page-drop-tree-state" name="drop-tree-state"
                title="{@presentation~presentation.form.presentation_page.tree_state.drop.hint@}">{@presentation~presentation.form.presentation_page.tree_state.drop.label@}</button>
        </div>
    </div>
</template>
{/ifacl2}
