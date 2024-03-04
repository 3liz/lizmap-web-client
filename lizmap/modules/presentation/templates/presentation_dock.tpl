<div id="presentation-container">
    <div id="presentation-content">
        <div id="presentation-introduction">
            <p>{@presentation~presentation.dock.introduction.label@}</p>
        </div>
        <div class="lizmap-presentation-card-container">
            <lizmap-presentation-cards id="lizmap-project-presentations">
                <div style="text-align: center;">
                    <button class="btn liz-presentation-create" title="{@presentation~presentation.dock.card.button.create.title@}">{@presentation~presentation.dock.card.button.create.label@}</button>
                </div>
            </lizmap-presentation-cards>
        </div>
    </div>
</div>


<!-- Template for the web component lizmap-presentation-cards -->
<template id="lizmap-presentation-card-template">
    <h3 class="lizmap-presentation-title"></h3>
    <p class="lizmap-presentation-description"></p>
    <!-- div with the presentation button(s) -->
    <div class="lizmap-presentation-card-toolbar">
        <button class="btn liz-presentation-edit" value="" title="{@presentation~presentation.dock.card.button.edit.title@}">{@presentation~presentation.dock.card.button.edit.label@}</button>
        <button class="btn liz-presentation-delete" value="" title="{@presentation~presentation.dock.card.button.delete.title@}">{@presentation~presentation.dock.card.button.delete.label@}</button>
        <button class="btn liz-presentation-launch" value="" title="{@presentation~presentation.dock.card.button.launch.title@}">{@presentation~presentation.dock.card.button.launch.label@}</button>
    </div>
</template>
