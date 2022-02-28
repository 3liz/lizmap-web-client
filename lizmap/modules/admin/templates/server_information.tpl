{ifacl2 'lizmap.admin.access'}
  <!--Services-->
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
        {if in_array($data['qgis_server_info']['error'], array('NO_ACCESS', 'BAD_DATA'))}
            {assign $errorcode=$data['qgis_server_info']['error']}
            <i>{@admin.server.information.qgis.error.fetching.information.detail.$errorcode@}</i>
        {elseif $data['qgis_server_info']['error'] == 'HTTP_ERROR'}
            {if $data['qgis_server_info']['error_http_code'] != '404'}
                <i>{@admin.server.information.qgis.error.fetching.information.detail.HTTP_ERROR@} {$data['qgis_server_info']['error_http_code']}</i><br>
            {else}
            <i>{@admin.server.information.qgis.error.fetching.information.detail@}</i>
            {/if}
        {else}
            <i>{@admin.server.information.qgis.error.fetching.information.detail@}</i>
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
        {if $data['qgis_server_info']['metadata']['commit_id']}
        <tr>
            <th>{@admin.server.information.qgis.commit_id@}</th>
            <td><a href="https://github.com/qgis/QGIS/commit/{$data['qgis_server_info']['metadata']['commit_id']}" target="_blank">{$data['qgis_server_info']['metadata']['commit_id']}</a></td>
        </tr>
        {/if}
    </table>
    {hook 'QgisServerVersion', $data['qgis_server_info']['metadata']}

    <h4>{@admin.server.information.qgis.plugins@}</h4>
    <table class="table table-condensed table-striped table-bordered table-server-info">
        {foreach $data['qgis_server_info']['plugins'] as $name=>$version}
        <tr>
            <th>{$name}</th>
            <td>{$version['version']}</td>
        </tr>
        {/foreach}
    </table>
    {hook 'QgisServerPlugins', $data['qgis_server_info']['plugins']}

{/if}

  </div>
{/ifacl2}
