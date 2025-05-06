
{include 'lizmap~copy_to_clipboard'}

{ifacl2 'lizmap.admin.server.information.view'}
  <!--Services-->
  <div id="lizmap_server_information">
    <h2>{@admin.menu.server.information.label@}</h2>

    <h3>{@admin.server.information.lizmap.label@}</h3>
    <h4>{@admin.server.information.lizmap.info@}</h4>
    {if !$installationComplete}
      <div class="alert alert-danger" role="alert">
          {@admin.server.information.installation.not.complete.html@}
      </div>
    {/if}
    {if !$checkQgisServerWrapper}
      <div class="alert alert-danger" role="alert">
          {$qgisServerWrapperLabel}
      </div>
    {/if}
    <table class="table table-striped table-bordered table-server-info table-lizmap-web-client">
        <tr>
            <th>{@admin.server.information.lizmap.info.version@}</th>
            <td>
            {$data['info']['version']}
            {if $currentLizmapCommitId}
                - <a href="https://github.com/3liz/lizmap-web-client/commit/{$currentLizmapCommitId}" target="_blank">{$currentLizmapCommitId}</a>
            {/if}
            </td>
        </tr>
        <tr>
            <th>{@admin.server.information.lizmap.info.date@}</th>
            <td>{$data['info']['date']}</td>
        </tr>
        <tr>
            <th>{@admin.server.information.lizmap.url@}</th>
            <td>
                {$baseUrlApplication}
                {usemacro 'copy_to_clipboard', $baseUrlApplication}
            </td>
        </tr>
    </table>

    <h4>{@admin.server.information.modules@}</h4>
    {if empty($modules)}
      <p>{@admin.server.information.no.module@}</p>
    {else}
        <table class="table table-condensed table-striped table-bordered table-server-info table-lizmap-modules">
        <thead>
        <tr>
            <th>{@admin.server.information.module@}</th>
            <th>{@admin.server.information.module.version@}</th>
        </tr>
        </thead>
        <tbody>
        {foreach $modules as $module}
            <tr>
                <th>{$module->slug}</th>
                <td>{$module->version}</td>
            </tr>
        {/foreach}
        </tbody>
    {/if}
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
                <li>{@admin.server.information.qgis.error.fetching.information.qgis.lizmap.html@}</li>
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
                </a> - <a href="https://github.com/qgis/QGIS/commit/{$data['qgis_server_info']['metadata']['commit_id']}" target="_blank">
                    {$data['qgis_server_info']['metadata']['commit_id']}
                </a>
            </td>
        </tr>
        <tr>
            <th>{@admin.server.information.qgis.name@}</th>
            <td>{$data['qgis_server_info']['metadata']['name']}</td>
        </tr>
        <tr>
            {if $data['qgis_server_info']['py_qgis_server']['found']}
                <th>
                    {$data['qgis_server_info']['py_qgis_server']['name']}
                    {if $data['qgis_server_info']['py_qgis_server']['documentation_url']}
                        <a href="{$data['qgis_server_info']['py_qgis_server']['documentation_url']}" target="_blank">
                            <span class='badge rounded-pill bg-secondary'>{@admin.server.information.qgis.plugin.help@}</span>
                        </a>
                    {/if}
                </th>
                <td>
                    {if $data['qgis_server_info']['py_qgis_server']['stable']}
                        {if $data['qgis_server_info']['py_qgis_server']['version'] == 'n/a'}
                            {* If the value is n/a, Py-QGIS-Server failed to fetch the version *}
                            {* https://github.com/3liz/py-qgis-server/blob/b11bba45495d32e348457c0802fe08f2bf952b8b/pyqgisserver/version.py#L17 *}
                            {$data['qgis_server_info']['py_qgis_server']['version']}
                        {else}
                            {if $data['qgis_server_info']['py_qgis_server']['git_repository_url']}
                                <a href="{$data['qgis_server_info']['py_qgis_server']['git_repository_url']}/releases/tag/{$data['qgis_server_info']['py_qgis_server']['version']}" target="_blank">
                                    {$data['qgis_server_info']['py_qgis_server']['version']}
                                </a>
                            {/if}
                        {/if}
                    {else}
                        <a href="{$data['qgis_server_info']['py_qgis_server']['git_repository_url']}/commit/{$data['qgis_server_info']['py_qgis_server']['commit_id']}" target="_blank">
                            {$data['qgis_server_info']['py_qgis_server']['version']} - {$data['qgis_server_info']['py_qgis_server']['commit_id']}
                        </a>
                    {/if}
                </td>
            {else}
                {* When Py-QGIS-Server and QJazz were not found *}
                <th>{@admin.server.information.qgis.wrapper@}</th><td>{@admin.server.information.qgis.wrapper.not.installed@}</td>
            {/if}
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
        </tr>
        {foreach $data['qgis_server_info']['plugins'] as $name=>$version}
        <tr>
            {if $version['name']}
            {* Fixed in lizmap_server plugin 1.3.2 https://github.com/3liz/qgis-lizmap-server-plugin/commit/eb6a773ba035f877e9fa91db5ef87911a2648ee1 *}
            <th style="width:20%;">
                {$version['name']}
                {if array_key_exists('homepage', $version) && $version['homepage']}
                    <a href="{$version['homepage']}" target="_blank"><span class='badge rounded-pill bg-secondary'>{@admin.server.information.qgis.plugin.help@}</span></a>
                {/if}
            </th>
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
                {if $name == 'lizmap_server' && $lizmapQgisServerNeedsUpdate}
                    <span class='badge badge-important'>{$lizmapPluginUpdate}</span>
                {/if}
            </td>
        </tr>
        {/foreach}
    </table>
    {hook 'QgisServerPlugins', $data['qgis_server_info']['plugins']}

{/if}

  </div>
{/ifacl2}
