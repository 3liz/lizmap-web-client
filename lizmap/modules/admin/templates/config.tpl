{jmessage_bootstrap}

  <h1>{@admin~admin.configuration.h1@}</h1>


  <div>
    <h2>{@admin~admin.generic.h2@}</h2>
    <dl>
      <dt>{@admin~admin.generic.version.number.label@}</dt><dd>{$version}</dd>
    </dl>
  </div>

  {ifacl2 'lizmap.admin.services.view'}
  <!--Services-->
  <div>
    <h2>{@admin~admin.configuration.services.label@}</h2>
    {formdata $servicesForm ,'htmlbootstrap', array()}
    <table class="table services-table">
      {formcontrols }
        <tr>
        {ifctrl 'requestProxyEnabled'}
          {ifctrl_value '0'}
            <th>{ctrl_label}</th><td>{ctrl_value}</td>
          {else}
            <td colspan="2">
              {ctrl_value}
            </td>
          {/ifctrl_value}
        {else}
        <th>{ctrl_label}</th><td>{ctrl_value}</td>
        {/ifctrl}
      </tr>

      {/formcontrols}
    </table>
    {/formdata}
    <!-- Modify -->
    {ifacl2 'lizmap.admin.services.update'}
    <div class="form-actions">
    <a class="btn" href="{jurl 'admin~config:modifyServices'}">
      {@admin~admin.configuration.button.modify.service.label@}
    </a>
    </div>
    {/ifacl2}
  </div>
  {/ifacl2}
