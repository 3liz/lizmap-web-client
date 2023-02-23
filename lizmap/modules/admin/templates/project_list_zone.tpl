
{meta_html css $basePath.'assets/css/dataTables.bootstrap.min.css'}
{meta_html js $basePath.'assets/js/jquery.dataTables.min.js'}
{meta_html js $basePath.'assets/js/admin/activate_datatable.js'}
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

{if $hasSomeProjectsNotDisplayed}
<div>
    {@admin.project.not.displayed@}
</div>
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
            <th class='lzmplugv'>{@admin.project.list.column.lizmap.plugin.version.label@}</th>
            <th>{@admin.project.list.column.target.lizmap.version.label@}</th>
            <th>{@admin.project.list.column.authorized.groups.label@}</th>
            <th>{@admin.project.list.column.hidden.project.label@}</th>
            <th>{@admin.project.list.column.project.file.time.label@}</th>
            <th>{@admin.project.list.column.crs.label@}</th>

        </tr>
    </thead>

    <tbody>

    <!-- colors for warnings and errors -->
    {assign $colors = array('warning'=>'lightyellow', 'error'=>'lightcoral')}
    {assign $warningLayerCount = 100}
    {assign $errorLayerCount = 200}
    {assign $warningLoadingTime = 30.0}
    {assign $errorLoadingTime = 60.0}
    {assign $warningMemory = 100}
    {assign $errorMemory = 250}

    {foreach $mapItems as $mi}
    {if $mi->type == 'rep'}
        {foreach $mi->childItems as $p}
        <tr>
            <!-- repository -->
            <td title="{$mi->title|strip_tags|eschtml:ENT_QUOTES}">
                {$mi->id}
            </td>

            <!-- project - KEEP the line break after the title to improve the tooltip readability-->
            <td title="{$p['title']|strip_tags|eschtml:ENT_QUOTES}
{$p['abstract']|strip_tags|eschtml:ENT_QUOTES|truncate:150}">
                <a target="_blank" href="{$p['url']}">{$p['id']}</a>
            </td>

            <!-- Hidden QGIS project abstract -->
            <td>{$p['abstract']|strip_tags|eschtml:ENT_QUOTES}</td>

            <!-- Hidden QGIS project image -->
            <td>{$p['image']}</td>

            <!-- Layer count -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['layer_count'] > $warningLayerCount}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.layers.count.warning.label@}
            {/if}
            {if $p['layer_count'] > $errorLayerCount}
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
                    <li style="cursor: help;" title="{$properties['source']|strip_tags|escxml:ENT_QUOTES}">
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
            <td>{$p['qgis_log']|strip_tags|eschtml:ENT_QUOTES|nl2br}</td>

            <!-- loading time -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['loading_time'] > $warningLoadingTime}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.loading.time.warning.label@}
            {/if}
            {if $p['loading_time'] > $errorLoadingTime}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.loading.time.error.label@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['loading_time']|number_format:2:'.':' '}
            </td>

            <!-- Memory usage -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['memory_usage'] > $warningMemory }
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.memory.usage.warning.label@}
            {/if}
            {if $p['memory_usage'] > $errorMemory }
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
            {if $serverVersions['qgis_server_version_int'] && $serverVersions['qgis_server_version_int'] - $p['qgis_version_int'] > $oldQgisVersionDiff }
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
            <td>
                {$p['lizmap_plugin_version']}
            </td>

            <!-- Target version of Lizmap Web Client -->
            {assign $style = ''}
            {assign $title = ''}
            {if $p['needs_update_error']}
                {assign $style = 'background-color: '.$colors['error'].';'}
                {assign $title = @admin.project.list.column.update.in.qgis.desktop@}
            {/if}
            {if $p['needs_update_warning']}
                {assign $style = 'background-color: '.$colors['warning'].';'}
                {assign $title = @admin.project.list.column.update.soon.in.qgis.desktop@}
            {/if}
            <td title="{$title}" style="{$style}">
                {$p['lizmap_web_client_target_version_display']}
            </td>

            <!-- Authorized groups -->
            <td>
                {$p['acl_groups']|strip_tags|eschtml:ENT_QUOTES}
            </td>

            <!-- Project hidden -->
            <td>
                {if $p['hidden_project']}
                    {@admin.project.list.column.hidden.project.yes.label@}
                {else}
                    {@admin.project.list.column.hidden.project.no.label@}
                {/if}
            </td>

            <!-- File time -->
            <td>
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
                {$p['projection']|strip_tags|eschtml:ENT_QUOTES}
            </td>

        </tr>
        {/foreach}
    {/if}
    {/foreach}
    </tbody>
</table>

<div>
    <br>
    <strong>{@admin.project.rules.list.introduction@}</strong>
    <p>
        {jlocale "admin.project.rules.list.description.html", array($lizmapVersion, ($serverVersions['qgis_server_version_human_readable']))}
    </p>
    <ul>
        <li>{@admin.project.rules.list.warnings.html@}</li>
        <ul>
            <li>{@admin.project.list.column.qgis.desktop.version.label@}</li>
            <ul>
                <li>{jlocale "admin.project.rules.list.qgis.version.light.yellow.html", array($serverVersions['qgis_server_version_old'])}</li>
                <li>{jlocale "admin.project.rules.list.qgis.version.light.coral.html", array( $serverVersions['qgis_server_version_next'])}</li>
            </ul>
            <li>{@admin.project.list.column.target.lizmap.version.label.longer@}</li>
            <ul>
                <li>{jlocale "admin.project.rules.list.target.version.html", array($minimumLizmapTargetVersionRequired)}</li>
            </ul>
            <li>{@admin.project.list.column.layers.count.label.longer@}</li>
            <ul>
                <li>{jlocale "admin.project.rules.list.important.count.layers.html", array($warningLayerCount)}</li>
                <li>{jlocale "admin.project.rules.list.very.important.count.layers.html", array(($errorLayerCount))}</li>
            </ul>
            <li>{@admin.project.list.column.crs.label@}</li>
            <ul>
                <li>{@admin.project.rules.list.custom.projection@}</li>
            </ul>

            {if $hasInspectionData}
            <li>{@admin.project.list.column.invalid.layers.count.label@}</li>
            <ul>
                <li>{@admin.project.rules.list.invalid.datasource.html@}</li>
            </ul>
            <li>{@admin.project.list.column.loading.time.label.alt@}</li>
            <ul>
                <li>{jlocale "admin.project.rules.list.warning.loading.html", array($warningLoadingTime)}</li>
                <li>{jlocale "admin.project.rules.list.error.loading.html", array($errorLoadingTime)}</li>
            </ul>
            <li>{@admin.project.list.column.memory.usage.label.alt@}</li>
            <ul>
                <li>{jlocale "admin.project.rules.list.warning.memory.html", array($warningMemory)}</li>
                <li>{jlocale "admin.project.rules.list.error.memory.html", array($errorMemory)}</li>
            </ul>
            {/if}

        </ul>
    <li>{@admin.project.rules.list.blocking.html@}</li>
        <ul>
            <li>{jlocale "admin.project.rules.list.blocking.target.html", array($minimumLizmapTargetVersionRequired - 0.1)}</li>
        </ul>
    </ul>
</div>
