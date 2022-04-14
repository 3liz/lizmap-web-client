{meta_html css '/assets/css/dataTables.bootstrap.min.css'}
{meta_html js '/assets/js/jquery.dataTables.min.js'}
{meta_html js '/assets/js/admin/activate_datatable.js'}

<table class="lizmap_project_list table table-condensed table-striped table-bordered" style="width:95%">
    <thead>
        <tr>
            <th>{@admin.project.list.column.repository.label@}</th>
            <th>{@admin.project.list.column.project.label@}</th>
            <th>{@admin.project.list.column.project.file.time.label@}</th>
            <th>{@admin.project.list.column.crs.label@}</th>
            <th>{@admin.project.list.column.layers.count.label@}</th>
            <th>{@admin.project.list.column.qgis.desktop.version.label@}</th>
            <th>{@admin.project.list.column.lizmap.plugin.version.label@}</th>
            <th>{@admin.project.list.column.authorized.groups.label@}</th>
            <th>{@admin.project.list.column.hidden.project.label@}</th>

            <!-- <th>{@admin.project.list.column.invalid.layers.count.label@}</th>
            <th>{@admin.project.list.column.layout.count.label@}</th>
            <th>{@admin.project.list.column.used.memory.label@}</th> -->
        </tr>
    </thead>

    <tbody>

    <!-- colors for warnings and errors -->
    {assign $colors = array('warning'=>'lightyellow', 'error'=>'lightcoral')}

    {foreach $map_items as $mi}
    {if $mi->type == 'rep'}
        {foreach $mi->childItems as $p}
        <tr>
            <td title="{$mi->title}">{$mi->id}</td>
            <!-- project- KEEP the line break after the title to improve the tooltip readability-->
            <td title="{$p['title']}
{$p['abstract']|strip_tags|truncate:150}">
                <a target="_blank" href="{$p['url']}">{$p['id']}</a>
            </td>

            <!-- File time -->
            <td title="">{$p['file_time']|jdatetime:'timestamp':'Y-m-d H:i:s'}</td>

            <!-- Projection -->
            {assign $style = ''}
            {assign $title = ''}
            {if substr($p['projection'], 0, 4) == 'USER'}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.crs.user.warning.label@}
            {/if}
            <td title="{$title}" style="{$style}">{$p['projection']}</td>

            <!-- Layer count -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['layer_count'] > 100}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.layers.count.warning.label@}
            {/if}
            {if $p['layer_count'] > 200}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.layers.count.error.label@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['layer_count']}
            </td>

            <!-- QGIS project version -->
            {assign $style = ''}
            {assign $title = ''}
            {if $server_versions['qgis_server_version_int'] && $server_versions['qgis_server_version_int'] - $p['qgis_version_int'] > 6 }
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.qgis.desktop.version.too.old@.' ('.@admin.form.admin_services.qgisServerVersion.label@.': '.$server_versions['qgis_server_version'].')'}
            {/if}
            {if $server_versions['qgis_server_version_int'] && $p['qgis_version_int'] > $server_versions['qgis_server_version_int']}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.qgis.desktop.version.above.server@ .' ('.$server_versions['qgis_server_version'].')'}
            {/if}
            <td title="{$title}" style="{$style}">{$p['qgis_version']}</td>

            <!-- Version of Lizmap plugin for QGIS Desktop -->
            <td title="">{$p['lizmap_plugin_version']}</td>

            <!-- Authorized groups -->
            <td title="">{$p['acl_groups']}</td>

            <!-- Project hidden -->
            <td title="">
                {if $p['hidden_project']}
                    {@admin.project.list.column.hidden.project.yes.label@}
                {else}
                    {@admin.project.list.column.hidden.project.no.label@}
                {/if}
            </td>

            <!-- future interesting fields which requires using the py-qgis-server API -->
            <!-- <td title=""></td>
            <td title=""></td>
            <td title=""></td> -->
        </tr>
        {/foreach}
    {/if}
    {/foreach}
    </tbody>
</table>
