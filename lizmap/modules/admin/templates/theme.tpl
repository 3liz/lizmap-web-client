{jmessage_bootstrap}

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
  {ifacl2 'lizmap.admin.theme.update'}
  <div class="form-actions">
  <a class="btn" href="{jurl 'admin~theme:modify'}">
    {@admin~admin.configuration.button.modify.theme.label@}
  </a>
  </div>
  {/ifacl2}
</div>

<script defer>
    {literal}
    function confirmImageDelete(){
        return confirm("{/literal}{@admin~admin.theme.button.remove.logo.confirm.label@}{literal}");
    }
    {/literal}
{foreach $hasHeaderImage as $item=>$has}
    {if $has}
        {literal}
            // Replace theme image value by corresponding image
            var html = '<img src="{/literal}{jurl 'view~media:themeImage', array('key'=>$item)}{literal}" style="max-width:200px;">';
        {/literal}
        {ifacl2 'lizmap.admin.theme.update'}
          {literal}
              html+= '&nbsp;<a onclick="confirmImageDelete();" href="{/literal}{jurl 'admin~theme:removeThemeImage', array('key'=>$item)}{literal}" class="btn" class="btn-remove-theme-image">{/literal}{@admin~admin.theme.button.remove.logo.label@}{literal}</a>';
          {/literal}
        {/ifacl2}
        {literal}
            document.getElementById('_{/literal}{$item}{literal}').innerHTML = html;
        {/literal}
    {else}
        {literal}
            document.getElementById('_{/literal}{$item}{literal}').innerHTML = '';
        {/literal}
    {/if}
{/foreach}
</script>
