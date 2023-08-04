<div id="lizmap_project_list_help" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3>{@admin.project.modal.title@}</h3>
    </div>
    <div class="modal-body">
        <p>
            {jlocale "admin.project.rules.list.description.html", array($lizmapVersion,
            ($serverVersions['qgis_server_version_human_readable']))}
        </p>

        <ul>
            <li>{@admin.project.rules.list.blocking.html@}</li>
            <ul class="rules">
                <li class="blocker">{jlocale "admin.project.rules.list.blocking.target.html",
                    array($minimumLizmapTargetVersionRequired - 0.1)}</li>
            </ul>

            <li>{@admin.project.rules.list.warnings.html@}</li>
            <ul>
                <li>{@admin.project.list.column.qgis.desktop.version.label@}</li>
                <ul class="rules">
                    <li class="warning">{jlocale "admin.project.rules.list.qgis.version.warning.html",
                        array($serverVersions['qgis_server_version_old'])}</li>
                    <li class="error">{jlocale "admin.project.rules.list.qgis.version.error.html", array(
                        $serverVersions['qgis_server_version_next'])}</li>
                </ul>
                <li>{@admin.project.list.column.target.lizmap.version.label.longer@}</li>
                <ul class="rules">
                    <li class="warning">{jlocale "admin.project.rules.list.target.version.html",
                        array($minimumLizmapTargetVersionRequired)}</li>
                </ul>
                <li>{@admin.project.list.column.layers.count.label.longer@}</li>
                <ul class="rules">
                    <li class="warning">{jlocale "admin.project.rules.list.important.count.layers.html",
                        array($warningLayerCount)}</li>
                    <li class="error">{jlocale "admin.project.rules.list.very.important.count.layers.html",
                        array(($errorLayerCount))}</li>
                </ul>
                <li>{@admin.project.list.column.crs.label@}</li>
                <ul class="rules">
                    <li class="warning">{@admin.project.rules.list.custom.projection@}</li>
                </ul>

                {if $hasInspectionData}
                <li>{@admin.project.list.column.invalid.layers.count.label@}</li>
                <ul class="rules">
                    <li class="warning">{@admin.project.rules.list.invalid.datasource.html@}</li>
                </ul>
                <li>{@admin.project.list.column.loading.time.label.alt@}</li>
                <ul class="rules">
                    <li class="warning">{jlocale "admin.project.rules.list.warning.loading.html",
                        array($warningLoadingTime)}</li>
                    <li class="error">{jlocale "admin.project.rules.list.error.loading.html", array($errorLoadingTime)}
                    </li>
                </ul>
                <li>{@admin.project.list.column.memory.usage.label.alt@}</li>
                <ul class="rules">
                    <li class="warning">{jlocale "admin.project.rules.list.warning.memory.html", array($warningMemory)}
                    </li>
                    <li class="error">{jlocale "admin.project.rules.list.error.memory.html", array($errorMemory)}</li>
                </ul>
                {/if}

            </ul>
        </ul>
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal" aria-hidden="true">{@admin.project.modal.button.close@}</button>
    </div>
</div>
