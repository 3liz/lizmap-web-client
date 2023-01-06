{ifacl2 'lizmap.admin.project.list.view'}

<h2>{@admin.menu.lizmap.project.list.label@}</h2>

<div id="lizmap_project_list_container">
    <div id="lizmap_project_list">
        {$projectList}
    </div>
    <div id="lizmap_project_list_sidebar">
        <h4>{@admin.menu.lizmap.project.sidebar.title.label@}</h4>
        <div id="lizmap_project_list_sidebar_content">
            <dl>
                <dt id="dd_image_label">{@admin.menu.lizmap.project.image.label@}</dt>
                <dd id="dd_image_value"></dd>
                <dt id="dd_title_label">{@admin.project.list.column.project.label@}</dt>
                <dd id="dd_title_value"></dd>
                <dt id="dd_abstract_label">{@admin.project.list.column.project.abstract.label@}</dt>
                <dd id="dd_abstract_value"></dd>
                <dt id="dd_invalid_layers_label">{@admin.project.list.column.invalid.layers.list.label@}</dt>
                <dd id="dd_invalid_layers_value"></dd>
                <dt id="dd_qgis_logs_label">{@admin.project.list.column.project.qgis.log.label@}</dt>
                <dd id="dd_qgis_logs_value"></dd>
            </dl>
        </div>
    </div>
</div>

{/ifacl2}
