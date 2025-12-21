
{meta_html assets 'datatables_responsive'}

{assign $tableClass=''}
{if $hasInspectionData}
    {assign $tableClass='has_inspection_data'}
{/if}

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

<!-- Sentence displayed when the user clicks on a line of the projects table
to view the hidden columns data and when there is no data for these columns -->
<span id="lizmap_project_list_no_data_label" style="display: none;">{@admin.project.list.no.hidden.column.content@}</span>

<!-- The table contains the projects data. Datatables is used to improve the UX -->
<table class="lizmap_project_list table table-condensed table-bordered {$tableClass}" style="width:100%">
    <thead>
        <tr>
            <th></th>
            <th>{@admin.project.list.column.repository.label@}</th>
            <th>{@admin.project.list.column.project.label@}</th>
            <th>{@admin.project.list.column.layers.count.label@}</th>
            {if $hasInspectionData}
                <th>{@admin.project.list.column.invalid.layers.count.label@}</th>
                <th>{@admin.project.list.column.project.has.log.label@}</th>
                <th>{@admin.project.list.column.loading.time.label@}</th>
                <th>{@admin.project.list.column.memory.usage.label@}</th>
            {/if}
            <th>{@admin.project.list.column.qgis.desktop.version.label@}</th>
            <th>{@admin.project.list.column.target.lizmap.version.label@}</th>
            <th>{@admin.project.list.column.lizmap.warnings.count.label@}</th>
            <th>{@admin.project.list.column.hidden.project.label@}</th>
            <th>{@admin.project.list.column.authorized.groups.label@}</th>
            <th>{@admin.project.list.column.project.file.time.label@}</th>
            {if $hasInspectionData}
                <th>{@admin.project.list.column.inspection.file.time.label@}</th>
            {/if}
            <th>{@admin.project.list.column.crs.label@}</th>
            {if $hasInspectionData}
                <th>{@admin.project.list.column.invalid.layers.list.label@}</th>
                <th>{@admin.project.list.column.project.qgis.log.label@}</th>
            {/if}

        </tr>
    </thead>

    <tbody>

    <!-- colors for warnings and errors -->
    {assign $warningLayerCount = 100}
    {assign $errorLayerCount = 200}
    {assign $warningLoadingTime = 30.0}
    {assign $errorLoadingTime = 60.0}
    {assign $warningMemory = 100}
    {assign $errorMemory = 250}

    {foreach $mapItems as $mi}
    {if $mi->type == 'rep'}
        {foreach $mi->childItems as $p}
        <tr data-repository-id="{$p['repository_id']}" data-project-id="{$p['id']}">
            <!-- Empty first column to use with the responsive (contains the triangle to open line details) -->
            <td title="{@admin.project.list.column.show.line.hidden.columns@}">
            </td>

            <!-- repository -->
            {* Warning : KEEP the line break after the title to improve the tooltip readability *}
            <td title="{if !empty($mi->title)}{$mi->title|strip_tags|eschtml}{/if}
{@admin.project.list.column.path.label@ . ' : ' . $p['repository_id']}/">
            {* End of warning *}
                <a target="_blank" href="{$p['url_repository']}">{$mi->id}</a>
            </td>

            <!-- project -->
            {* Warning : KEEP the line break after the title to improve the tooltip readability *}
            <td title="{if !empty($p['title'])}{$p['title']|strip_tags|eschtml}{/if}
{if !empty($p['abstract'])}{$p['abstract']|strip_tags|eschtml|truncate:150}{/if}">
            {* End of warning *}
            {if $p['needs_update_error'] || $p['acl_no_access']}
                {* The project cannot be displayed, either it is too old, or the user has no access to it. *}
                {* Do not provide a link to open it.*}
                {$p['id']}
                {if $p['acl_no_access']}
                    <span title='{@admin.project.list.column.project.acl@}'>🔒</span>
                {/if}
            {else}
                <a target="_blank" href="{$p['url']}">{$p['id']}</a>
            {/if}
            </td>

            <!-- Layer count -->
            {assign $class = ''}
            {assign $title = ''}
            {if $p['layer_count'] > $warningLayerCount}
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.layers.count.warning.label@}
            {/if}
            {if $p['layer_count'] > $errorLayerCount}
                {assign $class = 'liz-error'}
                {assign $title = @admin.project.list.column.layers.count.error.label@}
            {/if}
            <td title="{$title}" class="{$class}">
                {$p['layer_count']}
            </td>

        {if $hasInspectionData}

            <!-- Invalid layers count -->
            {assign $class = ''}
            {assign $title = ''}
            {if $p['invalid_layers_count'] > 0}
                {assign $class = 'liz-error'}
                {assign $title = @admin.project.list.column.invalid.layers.count.error.label@}
            {/if}
            <td title="{$title}" class="{$class}">
                {$p['invalid_layers_count']}
            </td>

            <!-- A QGIS log exists -->
            <td>{if !empty($p['qgis_log']) && !empty(trim($p['qgis_log']))}🔴{/if}</td>

            <!-- loading time -->
            {assign $class = ''}
            {assign $title = ''}
            {if $p['loading_time'] > $warningLoadingTime}
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.loading.time.warning.label@}
            {/if}
            {if $p['loading_time'] > $errorLoadingTime}
                {assign $class = 'liz-error'}
                {assign $title = @admin.project.list.column.loading.time.error.label@}
            {/if}
            <td title="{$title}" class="{$class}">
                {if !empty($p['loading_time'])}
                {$p['loading_time']|number_format:2:'.':' '}
                {/if}
            </td>

            <!-- Memory usage -->
            {assign $class = ''}
            {assign $title = ''}
            {if $p['memory_usage'] > $warningMemory }
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.memory.usage.warning.label@}
            {/if}
            {if $p['memory_usage'] > $errorMemory }
                {assign $class = 'liz-error'}
                {assign $title = @admin.project.list.column.memory.usage.error.label@}
            {/if}
            <td title="{$title}" class="{$class}">
                {if !empty($p['memory_usage'])}
                {$p['memory_usage']|number_format:2:'.':' '}
                {/if}
            </td>

        {/if}

            <!-- QGIS desktop version -->
            {assign $class = ''}
            {assign $title = ''}
            {if $serverVersions['qgis_server_version_int'] && $serverVersions['qgis_server_version_int'] - $p['qgis_version_int'] > $oldQgisVersionDiff }
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.qgis.desktop.version.too.old@.' ('.@admin.form.admin_services.qgisServerVersion.label@.': '.$serverVersions['qgis_server_version'].')'}
            {/if}
            {if $serverVersions['qgis_server_version_int'] && $p['qgis_version_int'] > $serverVersions['qgis_server_version_int']}
                {assign $class = 'liz-error'}
                {assign $title = @admin.project.list.column.qgis.desktop.version.above.server@ .' ('.$serverVersions['qgis_server_version'].')'}
            {/if}
            {if $title != ''}
                {* Append version of Lizmap plugin for QGIS Desktop in tooltip *}
                {assign $title = $title . ' - '}
            {/if}
            {assign $title = $title . @admin.project.list.column.lizmap.plugin.version.label@ . ' ' .  $p['lizmap_plugin_version']}
            {if $p['lizmap_plugin_update'] }
                {assign $title = $title . ' ' . @admin.project.list.column.qgis.desktop.recent.label.html@}
            {/if}
            <td title="{$title}" class="{$class}">
                {$p['qgis_version']}
                {if $p['lizmap_plugin_update'] }
                    <span class='badge badge-warning'>⚠</span>
                {/if}
            </td>

            <!-- Target version of Lizmap Web Client -->
            {assign $class = ''}
            {assign $title = ''}
            {if $p['needs_update_error']}
                {assign $class = 'liz-blocker'}
                {assign $title = @admin.project.list.column.update.in.qgis.desktop@}
            {/if}
            {if $p['needs_update_warning']}
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.update.soon.in.qgis.desktop@}
            {/if}
            <td title="{$title}" class="{$class}">
                {$p['lizmap_web_client_target_version_display']}
            </td>

            <!-- Warnings in CFG file -->
            {assign $class = ''}
            {assign $title = ''}
            {if $p['cfg_warnings_count'] >= 1}
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.lizmap.warnings.explanations.label@ . ' : '}
                {foreach $p['cfg_warnings'] as $id=>$count}
                    {assign $title = $title . ' ' . $id . ' (' . $count . '), ' }
                {/foreach}
            {/if}
            <td title="{$title}" class="{$class}">
            {$p['cfg_warnings_count']}
            </td>

            <!-- Project hidden -->
            <td>
                {if $p['hidden_project']}
                    {@admin.project.list.column.hidden.project.yes.label@}
                {else}
                    {@admin.project.list.column.hidden.project.no.label@}
                {/if}
            </td>

            <!-- Authorized groups -->
            <td>
                {if !empty($p['acl_groups'])}
                {$p['acl_groups']|strip_tags|eschtml}
                {/if}
            </td>

            <!-- File time -->
            <td>
                {$p['file_time']|jdatetime:'timestamp':'Y-m-d H:i:s'}
            </td>

            {if $hasInspectionData}
                <!-- Inspection file time -->
                <td>
                    {if !empty($p['inspection_timestamp'])}
                    {$p['inspection_timestamp']|jdatetime:'timestamp':'Y-m-d H:i:s'}
                    {/if}
                </td>
            {/if}

            <!-- Projection -->
            {assign $class = ''}
            {assign $title = ''}
            {if substr($p['projection'], 0, 4) == 'USER'}
                {assign $class = 'liz-warning'}
                {assign $title = @admin.project.list.column.crs.user.warning.label@}
            {/if}
            <td title="{$title}" class="{$class}">
                {if !empty($p['projection'])}
                {$p['projection']|strip_tags|eschtml}
                {/if}
            </td>

        {if $hasInspectionData}
            <!-- List of invalid layers -->
            {if $p['invalid_layers_count'] > 0}
            <td>
                <ul>
                {foreach $p['invalid_layers'] as $id=>$properties}
                    <li style="cursor: help;" title="{$properties['source']|strip_tags|escxml}">
                        {$properties['name']}
                    </li>
                {/foreach}
                </ul>
            </td>
            {else}
            <td></td>
            {/if}

            <!-- QGIS logs -->
            <td class="lizmap-project-qgis-log">
                {if !empty($p['qgis_log'])}
                <pre>
                {$p['qgis_log']|strip_tags|eschtml|nl2br}
                </pre>
                {/if}
            </td>
        {/if}

        </tr>
        {/foreach}
    {/if}
    {/foreach}
    </tbody>
</table>


<!-- Help guide -->
{include 'admin~project_list_help'}
