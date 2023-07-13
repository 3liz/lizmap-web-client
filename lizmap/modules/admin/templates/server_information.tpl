
{meta_html js $j_basepath.'assets/js/admin/copy_to_clipboard.js'}

{ifacl2 'lizmap.admin.server.information.view'}
  <!--Services-->
  <div id="lizmap_server_information">
    <h2>{@admin.menu.server.information.label@}</h2>

    <h3>{@admin.server.information.lizmap.label@}</h3>
    <h4>{@admin.server.information.lizmap.info@}</h4>
    <table class="table table-striped table-bordered table-server-info table-lizmap-web-client">
        <tr>
            <th>{@admin.server.information.lizmap.info.version@}</th>
            <td>{$data['info']['version']}</td>
        </tr>
        <tr>
            <th>{@admin.server.information.lizmap.info.date@}</th>
            <td>{$data['info']['date']}</td>
        </tr>
        <tr>
            <th>{@admin.server.information.lizmap.url@}</th>
            <td>
                {$baseUrlApplication}
                <button type="button" class="btn-small copy-to-clipboard" data-text="{$baseUrlApplication}">
                    <svg aria-hidden="true" height="16" width="16" data-view-component="true"><path fill-rule="evenodd" d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25v-7.5z"/><path fill-rule="evenodd" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25v-7.5zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25h-7.5z"/></svg>
                </button>
            </td>
        </tr>
    </table>
    {hook 'LizmapServerVersion', $data['info']}

    <h3>{@admin.server.information.qgis.label@}</h3>

    {if array_key_exists('qgis_server', $data) && array_key_exists('test', $data['qgis_server'])}
      {* The lizmap plugin is not installed or not well configured *}
      {* The QGIS Server has been tried with a WMS GetCapabilities without map parameter *}
      {if $data['qgis_server']['test'] == 'OK'}
          <p>{@admin.server.information.qgis.test.ok@}</p>
      {else}
          <p><b>{@admin.server.information.qgis.test.error@}</b></p>
      {/if}
    {/if}

{if array_key_exists('error', $data['qgis_server_info'])}
{* The lizmap plugin is not installed or not well configured *}
{* The QGIS Server has been tried with a WMS GetCapabilities without map parameter *}
{if $data['qgis_server']['test'] == 'OK'}

    <p>
        <b>{@admin.server.information.qgis.error.fetching.information@}</b><br/>
        {if $data['qgis_server_info']['error'] == 'NO_ACCESS'}
            <i>{@admin.server.information.qgis.error.fetching.information.detail.NO_ACCESS@}</i><br>
        {else}
            <p>{@admin.server.information.qgis.error.fetching.information.description@}</p>
            <ol>
                <li>{jlocale "admin.server.information.qgis.error.fetching.information.qgis.version.html", array($minimumQgisVersion)}</li>
                <li>{jlocale "admin.server.information.qgis.error.fetching.information.plugin.version.html", array($minimumLizmapServer)}</li>
                <li>{@admin.server.information.qgis.error.fetching.information.qgis.url.html@}</li>
                <li>{@admin.server.information.qgis.error.fetching.information.lizmap.url.html@}</li>
                <li>{@admin.server.information.qgis.error.fetching.information.lizmap.logs.html@}</li>
                <li>{@admin.server.information.qgis.error.fetching.information.environment.variable@}</li>
                <li>{@admin.server.information.qgis.error.fetching.information.help@}</li>
            </ol>
            <br>
            {assign $lizmapDoc='https://docs.lizmap.com/current/en/install/pre_requirements.html#lizmap-server-plugin'}
            {assign $qgisDoc='https://docs.qgis.org/latest/en/docs/server_manual/config.html#environment-variables'}
            <a href="{$lizmapDoc}" target="_blank">{$lizmapDoc}</a>
            <br>
            <a href="{$qgisDoc}" target="_blank">{$qgisDoc}</a>
            <br>
            {if $data['qgis_server_info']['error_http_code'] == '200'}
                {* QGIS Server might return a 200, it's confusing for users. Ticket #2755 *}
                {assign $errorcode='Unknown'}
            {else}
                {assign $errorcode=$data['qgis_server_info']['error_http_code']}
            {/if}
            <i>{@admin.server.information.qgis.error.fetching.information.detail.HTTP_ERROR@} {$errorcode}</i><br>
        {/if}
    </p>
{/if}
{else}

    <h4>{@admin.server.information.qgis.metadata@}</h4>
    <table class="table table-condensed table-striped table-bordered table-server-info table-qgis-server">
        <tr>
            <th>{@admin.server.information.qgis.version@}</th>
            <td>
                <a href="https://github.com/qgis/QGIS/releases/tag/{$data['qgis_server_info']['metadata']['tag']}" target="_blank">
                    {$data['qgis_server_info']['metadata']['version']}
                </a>
            </td>
        </tr>
        <tr>
            <th>{@admin.server.information.qgis.name@}</th>
            <td>{$data['qgis_server_info']['metadata']['name']}</td>
        </tr>
        <tr>
            <th>{@admin.server.information.qgis.commit_id@}</th>
            <td><a href="https://github.com/qgis/QGIS/commit/{$data['qgis_server_info']['metadata']['commit_id']}" target="_blank">{$data['qgis_server_info']['metadata']['commit_id']}</a></td>
        </tr>
        <tr>
            <th>Py-QGIS-Server</th>
            <td>
                {if $data['qgis_server_info']['py_qgis_server']['found']}
                    {if $data['qgis_server_info']['py_qgis_server']['stable']}
                    <a href="https://github.com/3liz/py-qgis-server/releases/tag/{$data['qgis_server_info']['py_qgis_server']['version']}" target="_blank">
                        {$data['qgis_server_info']['py_qgis_server']['version']}
                    </a>
                    {else}
                    <a href="https://github.com/3liz/py-qgis-server/commit/{$data['qgis_server_info']['py_qgis_server']['commit_id']}" target="_blank">
                        {$data['qgis_server_info']['py_qgis_server']['version']} - {$data['qgis_server_info']['py_qgis_server']['commit_id']}
                    </a>
                    {/if}
                {else}
                    {$data['qgis_server_info']['py_qgis_server']['version']}
                {/if}
            </td>
        </tr>
        {if $qgisServerNeedsUpdate }
        <tr>
            <th>{@admin.server.information.qgis.action@}</th>
            <td style="background-color:lightcoral;"><strong>{$updateQgisServer}</strong></td>
        </tr>
        {/if}
    </table>
    {hook 'QgisServerVersion', $data['qgis_server_info']['metadata']}

    <h4>{@admin.server.information.qgis.plugins@}</h4>
    <table class="table table-condensed table-striped table-bordered table-server-info table-qgis-server-plugins">
        <tr>
            <th style="width:20%;">{@admin.server.information.qgis.plugin@}</th>
            <th style="width:20%;">{@admin.server.information.qgis.plugin.version@}</th>
            {if $displayPluginActionColumn }
                <th>{@admin.server.information.qgis.plugin.action@}</th>
            {/if}
        </tr>
        {foreach $data['qgis_server_info']['plugins'] as $name=>$version}
        <tr>
            {if $version['name']}
            {* Fixed in lizmap_server plugin 1.3.2 https://github.com/3liz/qgis-lizmap-server-plugin/commit/eb6a773ba035f877e9fa91db5ef87911a2648ee1 *}
            <th style="width:20%;">{$version['name']}</th>
            {else}
            <th style="width:20%;">{$name}</th>
            {/if}
            <td style="width:20%;">
                {if $version['repository']}
                    {if $version['commitNumber'] == 1}
                        {* commitNumber == 1, it means the package is coming from a git tag *}
                        <a href="{$version['repository']}/releases/tag/{$version['version']}" target="_blank">{$version['version']}</a>
                    {else}
                        <a href="{$version['repository']}/commit/{$version['commitSha1']}" target="_blank">{$version['version']} - {$version['commitSha1']|truncate:7:''}</a>
                    {/if}
                {else}
                    {$version['version']}
                {/if}
            </td>
            {if $displayPluginActionColumn }
                {if $name == 'lizmap_server' && $lizmapQgisServerNeedsUpdate}
                    <td style="background-color:lightcoral;"><strong>{$lizmapPluginUpdate}</strong></td>
                {elseif $name == 'atlasprint' && $removeAtlasPrintPlugin}
                    <td>{@admin.server.information.qgis.plugin.atlasprint@}</td>
                {else}
                <td></td>
                {/if}
            {/if}
        </tr>
        {/foreach}
    </table>
    {hook 'QgisServerPlugins', $data['qgis_server_info']['plugins']}

{/if}

  </div>
{/ifacl2}
