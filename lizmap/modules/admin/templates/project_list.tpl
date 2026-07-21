{ifacl2 'lizmap.admin.project.list.view'}

{meta_html assets 'datatables_responsive'}

<h2>{@admin.menu.lizmap.project.list.label@}</h2>

<div id="lizmap_project_list_container">
    <div id="lizmap_project_list">

        {if $qgisServerOk == false}
        {*The best would be to not display this table at all until QGIS server is OK.*}
        {*So we can assume later in the code we have a QGIS server int version*}
        <div>
            {@admin.server.information.error@}
        </div>
        {/if}

        <!-- Help button about the colours used in the table -->
        <button type="button" data-bs-target="#lizmap_project_list_help" role="button" class="btn btn-sm float-end" data-bs-toggle="modal">{@admin.project.modal.title@}</button>
        <!-- The modal div code is at the bottom of this file -->

        <!-- Warning displayed when some projects cannot be shown in the main web interface -->
        <div id="lizmap_project_list_not_displayed" class="alert alert-warning" style="display: none;">{$notDisplayedMessage}</div>

        <!-- Sentence displayed when the user clicks on a line of the projects table
        to view the hidden columns data and when there is no data for these columns -->
        <span id="lizmap_project_list_no_data_label" style="display: none;">{@admin.project.list.no.hidden.column.content@}</span>

        <!-- The table shell. DataTables loads the rows as JSON from the "data" action. -->
        <table class="lizmap_project_list table table-sm table-bordered" style="width:100%" data-url="{$dataUrl}" data-show-hidden-title="{@admin.project.list.column.show.line.hidden.columns@}">
            <thead>
                <tr>
                    <th></th>
                    <th>{@admin.project.list.column.repository.label@}</th>
                    <th>{@admin.project.list.column.project.label@}</th>
                    <th>{@admin.project.list.column.layers.count.label@}</th>
                    <th>{@admin.project.list.column.invalid.layers.count.label@}</th>
                    <th>{@admin.project.list.column.project.has.log.label@}</th>
                    <th>{@admin.project.list.column.loading.time.label@}</th>
                    <th>{@admin.project.list.column.memory.usage.label@}</th>
                    <th>{@admin.project.list.column.qgis.desktop.version.label@}</th>
                    <th>{@admin.project.list.column.target.lizmap.version.label@}</th>
                    <th>{@admin.project.list.column.lizmap.warnings.count.label@}</th>
                    <th>{@admin.project.list.column.hidden.project.label@}</th>
                    <th>{@admin.project.list.column.authorized.groups.label@}</th>
                    <th>{@admin.project.list.column.project.file.time.label@}</th>
                    <th>{@admin.project.list.column.inspection.file.time.label@}</th>
                    <th>{@admin.project.list.column.crs.label@}</th>
                    <th>{@admin.project.list.column.invalid.layers.list.label@}</th>
                    <th>{@admin.project.list.column.project.qgis.log.label@}</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>

    </div>
</div>

<!-- Help guide -->
{include 'admin~project_list_help'}

{/ifacl2}
