
{meta_html css $basePath.'assets/css/dataTables.bootstrap.min.css'}
{meta_html js $basePath.'assets/js/jquery.dataTables.min.js'}
{meta_html js $basePath.'assets/js/admin/activate_datatable.js'}
{assign $tableClass=''}
{if $hasInspectionData}
    {assign $tableClass='has_inspection_data'}
{/if}
<table class="lizmap_project_list table table-condensed table-bordered {$tableClass}" style="width:100%">
    <thead>
        <tr>
            <th>{@admin.project.list.column.repository.label@}</th>
            <th>{@admin.project.list.column.project.label@}</th>
            <th>{@admin.project.list.column.project.abstract.label@}</th>
            <th>{@admin.menu.lizmap.project.image.label@}</th>
            <th>{@admin.project.list.column.layers.count.label@}</th>
        {if $hasInspectionData}
            <th>{@admin.project.list.column.invalid.layers.count.label@}</th>
            <th>{@admin.project.list.column.invalid.layers.list.label@}</th>
            <th>{@admin.project.list.column.project.has.log.label@}</th>
            <th>{@admin.project.list.column.project.qgis.log.label@}</th>
            <th>{@admin.project.list.column.loading.time.label@}</th>
            <th>{@admin.project.list.column.memory.usage.label@}</th>
        {/if}
            <th>{@admin.project.list.column.qgis.desktop.version.label@}</th>
            <th>{@admin.project.list.column.lizmap.plugin.version.label@}</th>
            <th>{@admin.project.list.column.authorized.groups.label@}</th>
            <th>{@admin.project.list.column.hidden.project.label@}</th>
            <th>{@admin.project.list.column.project.file.time.label@}</th>
            <th>{@admin.project.list.column.crs.label@}</th>

        </tr>
    </thead>

    <tbody>

    <!-- colors for warnings and errors -->
    {assign $colors = array('warning'=>'lightyellow', 'error'=>'lightcoral')}

    {foreach $mapItems as $mi}
    {if $mi->type == 'rep'}
        {foreach $mi->childItems as $p}
        <tr>
            <!-- repository -->
            <td title="{$mi->title}">
                {$mi->id}
            </td>

            <!-- project- KEEP the line break after the title to improve the tooltip readability-->
            <td title="{$p['title']}
{$p['abstract']|strip_tags|truncate:150}">
                <a target="_blank" href="{$p['url']}">{$p['id']}</a>
            </td>

            <!-- Hidden QGIS project abstract -->
            <td>{$p['abstract']}</td>

            <!-- Hidden QGIS project image -->
            <td>{$p['image']}</td>

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

        {if $hasInspectionData}

            <!-- Invalid layers count -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['invalid_layers_count'] > 0}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.invalid.layers.count.error.label@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['invalid_layers_count']}
            </td>

            <!-- Hidden invalid layers list -->
            {if $p['invalid_layers_count'] > 0}
            <td>
                <ul>
                {foreach $p['invalid_layers'] as $id=>$properties}
                    <li style="cursor: help;" title="{$properties['source']}">
                        {$properties['name']}
                    </li>
                {/foreach}
                </ul>
            </td>
            {else}
            <td></td>
            {/if}


            <!-- A QGIS log exists -->
            <td>{if !empty(trim($p['qgis_log']))}🔴{/if}</td>

            <!-- Hidden QGIS logs -->
            <td>{$p['qgis_log']|nl2br}</td>

            <!-- loading time -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['loading_time'] > 30.0}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.loading.time.warning.label@}
            {/if}
            {if $p['loading_time'] > 90.0}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.loading.time.error.label@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['loading_time']|number_format:2:'.':' '}
            </td>

            <!-- Memory usage -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['memory_usage'] > 100.0}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.memory.usage.warning.label@}
            {/if}
            {if $p['memory_usage'] > 250.0}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.memory.usage.error.label@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['memory_usage']|number_format:2:'.':' '}
            </td>

        {/if}

            <!-- QGIS project version -->
            {assign $style = ''}
            {assign $title = ''}
            {if $serverVersions['qgis_server_version_int'] && $serverVersions['qgis_server_version_int'] - $p['qgis_version_int'] > 6 }
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.qgis.desktop.version.too.old@.' ('.@admin.form.admin_services.qgisServerVersion.label@.': '.$serverVersions['qgis_server_version'].')'}
            {/if}
            {if $serverVersions['qgis_server_version_int'] && $p['qgis_version_int'] > $serverVersions['qgis_server_version_int']}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.qgis.desktop.version.above.server@ .' ('.$serverVersions['qgis_server_version'].')'}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['qgis_version']}
            </td>

            <!-- Version of Lizmap plugin for QGIS Desktop -->
            <td title="">
                {$p['lizmap_plugin_version']}
            </td>

            <!-- Authorized groups -->
            <td title="">
                {$p['acl_groups']}
            </td>

            <!-- Project hidden -->
            <td title="">
                {if $p['hidden_project']}
                    {@admin.project.list.column.hidden.project.yes.label@}
                {else}
                    {@admin.project.list.column.hidden.project.no.label@}
                {/if}
            </td>

            <!-- File time -->
            <td title="">
                {$p['file_time']|jdatetime:'timestamp':'Y-m-d H:i:s'}
            </td>

            <!-- Projection -->
            {assign $style = ''}
            {assign $title = ''}
            {if substr($p['projection'], 0, 4) == 'USER'}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.crs.user.warning.label@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['projection']}
            </td>

        </tr>
        {/foreach}
    {/if}
    {/foreach}
    </tbody>
</table>
