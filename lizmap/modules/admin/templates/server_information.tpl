{ifacl2 'lizmap.admin.access'}
  <!--Services-->
  <script type="text/javascript">
  {literal}
      function copyTextToClipboard(text) {
          if (!navigator.clipboard) {
            console.log('Copy to clipboard API is not available in this web browser');
            return;
          }

          navigator.clipboard.writeText(text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
          }, function(err) {
            console.error('Async: Could not copy text: ', err);
          });
    };
  {/literal}
  </script>
  <div id="lizmap_server_information">
    <h2>{@admin.menu.server.information.label@}</h2>

    <h3>{@admin.server.information.lizmap.label@}</h3>
    <h4>{@admin.server.information.lizmap.info@}</h4>
    <table class="table table-striped table-bordered table-server-info">
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
                <button onclick="copyTextToClipboard('{$baseUrlApplication}')">
                    <img src="">Copy
                </button>
            </td>
        </tr>
    </table>
    {hook 'LizmapServerVersion', $data['info']}

    <h3>{@admin.server.information.qgis.label@}</h3>

    {if array_key_exists('qgis_server', $data) && array_key_exists('test', $data['qgis_server'])}
      {if $data['qgis_server']['test'] == 'OK'}
          <p>{@admin.server.information.qgis.test.ok@}</p>
      {else}
          <p><b>{@admin.server.information.qgis.test.error@}</b></p>
      {/if}
    {/if}

{if array_key_exists('error', $data['qgis_server_info'])}

    <p>
        <b>{@admin.server.information.qgis.error.fetching.information@}</b><br/>
        {if $data['qgis_server_info']['error'] == 'NO_ACCESS'}
            <i>{@admin.server.information.qgis.error.fetching.information.detail.NO_ACCESS@}</i><br>
        {else}
            <i>{$errorQgisPlugin}</i>
            <br>
            <a href="{$linkDocumentation}" target="_blank">{$linkDocumentation}</a>
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

{else}

    <h4>{@admin.server.information.qgis.metadata@}</h4>
    <table class="table table-condensed table-striped table-bordered table-server-info">
        <tr>
            <th>{@admin.server.information.qgis.version@}</th>
            <td>{$data['qgis_server_info']['metadata']['version']}</td>
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
            <td>{$data['qgis_server_info']['metadata']['py_qgis_server_version']}</td>
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
    <table class="table table-condensed table-striped table-bordered table-server-info">
        <tr>
            <th style="width:20%;">{@admin.server.information.qgis.plugin@}</th>
            <th style="width:20%;">{@admin.server.information.qgis.plugin.version@}</th>
            {if $displayPluginActionColumn }
                <th>{@admin.server.information.qgis.plugin.action@}</th>
            {/if}
        <tr/>
        {foreach $data['qgis_server_info']['plugins'] as $name=>$version}
        <tr>
            <th style="width:20%;">{$name}</th>
            <td style="width:20%;">{$version['version']}</td>
            {if $displayPluginActionColumn }
                {if $name == 'lizmap_server' && $lizmapQgisServerNeedsUpdate}
                    <td style="background-color:lightcoral;"><strong>{$lizmapPluginUpdate}</strong></td>
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
