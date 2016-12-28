  {ifacl2 'lizmap.admin.services.view'}
  <!--Services-->
  <div>
    <h2>{@admin.theme.detail.title@}</h2>
    <table class="table">
      {formcontrols $themeForm}
      <tr>
        <th>{ctrl_label}</th>
        <td>
            {ctrl_value}
        </td>
      </tr>
      {/formcontrols}
    </table>

    <!-- Modify -->
    {ifacl2 'lizmap.admin.services.update'}
    <div class="form-actions">
    <a class="btn" href="{jurl 'admin~theme:modify'}">
      {@admin~admin.configuration.button.modify.theme.label@}
    </a>
    </div>
    {/ifacl2}
  </div>
  {/ifacl2}

<script>
{if $hasHeaderLogo}
{literal}
$(document).ready(function() {
    // Replace logo value by corresponding image
    var html = '<img src="{/literal}{jurl 'view~media:logo'}{literal}" style="max-width:200px;">';
    html+= '&nbsp;<a onclick="return confirm(\'{/literal}{@admin~admin.theme.button.remove.logo.confirm.label@}{literal}\');" href="{/literal}{jurl 'admin~theme:removeLogo'}{literal}" class="btn" id="btn-remove-theme-logo">{/literal}{@admin~admin.theme.button.remove.logo.label@}{literal}</a>';
    $('#_headerLogo').html( html );
});
{/literal}

{else}

{literal}
$(document).ready(function() {
    $( '#_headerLogo').html('');
});
{/literal}

{/if}
</script>

