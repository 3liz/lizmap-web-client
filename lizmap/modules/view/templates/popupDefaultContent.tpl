<table class="lizmapPopupTable">
  <thead>
    <tr>
      <th>{@view~map.popup.table.th.data@}</th>
      <th>{@view~map.popup.table.th.value@}</th>
    </tr>
  </thead>

  <tbody>
  {foreach $attributes as $attribute}
    {if $attribute['name'] != 'geometry' && $attribute['name'] != 'maptip'}
      <tr data-field-name="{$attribute['name']}" {if $attribute['value']=='' || $attribute['value']=='NULL' } class="empty-data" {/if}>
        <th>{$attribute['name']}</th>
        <td>{$attribute['name']|popupcheckbox:$attribute['value'],$repository,$project,$checkBoxFields,$remoteStorageProfile}</td>
      </tr>
    {/if}
  {/foreach}
  </tbody>
</table>
