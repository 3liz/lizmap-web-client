{ifacl2 'lizmap.admin.access'}
  <!--Services-->
  <div id="lizmap_server_information">
    <h2>{@admin.menu.server.information.label@}</h2>

    <h3>{@admin.server.information.lizmap.label@}</h3>
    <h4>{@admin.server.information.lizmap.info@}</h4>
    <table class="table table-striped table-bordered">
        <tr>
            <th width="50%">{@admin.server.information.lizmap.info.version@}</th>
            <td>{$data['info']['version']}</td>
        </tr>
        <tr>
            <th width="50%">{@admin.server.information.lizmap.info.date@}</th>
            <td>{$data['info']['date']}</td>
        </tr>
    </table>
    {hook 'LizmapServerVersion', $data['info']}

    <h3>{@admin.server.information.qgis.label@}</h3>
{if array_key_exists('qgis_server_info', $data)}
    <h4>{@admin.server.information.qgis.metadata@}</h4>
    <table class="table table-condensed table-striped table-bordered">
        <tr>
            <th width="50%">{@admin.server.information.qgis.version@}</th>
            <td>{$data['qgis_server_info']['metadata']['version']}</td>
        </tr>
        <tr>
            <th width="50%">{@admin.server.information.qgis.name@}</th>
            <td>{$data['qgis_server_info']['metadata']['name']}</td>
        </tr>
    </table>
    {hook 'QgisServerVersion', $data['qgis_server_info']['metadata']}

    <h4>{@admin.server.information.qgis.plugins@}</h4>
    <table class="table table-condensed table-striped table-bordered">
        {foreach $data['qgis_server_info']['plugins'] as $name=>$version}
        <tr>
            <th width="50%">{$name}</th>
            <td>{$version['version']}</td>
        </tr>
        {/foreach}
    </table>
    {hook 'QgisServerPlugins', $data['qgis_server_info']['plugins']}

{else}

    {if array_key_exists('qgis_server', $data) && array_key_exists('test', $data['qgis_server'])}
        {if $data['qgis_server']['test'] == 'OK'}
        <p>{@admin.server.information.qgis.test.ok@}</p>
        {else}
        <p><b>{@admin.server.information.qgis.test.error@}</b></p>
        {/if}
    {/if}
    <p>
        <b>{@admin.server.information.qgis.error.fetching.information@}</b><br/>
        <i>{@admin.server.information.qgis.error.fetching.information.detail@}</i>
    </p>

    </ul>

{/if}

  </div>
{/ifacl2}
