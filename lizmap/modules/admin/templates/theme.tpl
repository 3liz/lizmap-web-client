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
    {literal}
    function confirmImageDelete(){
        return confirm("{/literal}{@admin~admin.theme.button.remove.logo.confirm.label@}{literal}");
    }
    {/literal}
{foreach $hasHeaderImage as $item=>$has}
    {if $has}
        {literal}
        $(document).ready(function() {
            // Replace theme image value by corresponding image
            var html = '<img src="{/literal}{jurl 'view~media:themeImage', array('key'=>$item)}{literal}" style="max-width:200px;">';
            html+= '&nbsp;<a onclick="confirmImageDelete();" href="{/literal}{jurl 'admin~theme:removeThemeImage', array('key'=>$item)}{literal}" class="btn" class="btn-remove-theme-image">{/literal}{@admin~admin.theme.button.remove.logo.label@}{literal}</a>';
            $('#_{/literal}{$item}{literal}').html( html );
        });
        {/literal}

    {else}
        {literal}
        $(document).ready(function() {
            $( '#_{/literal}{$item}{literal}').html('');
        });
        {/literal}
    {/if}
{/foreach}
</script>

