<table class="lizmapPopupTable">
  <thead>
    <tr>
      <th>{@view~map.popup.table.th.data@}</th>
      <th>{@view~map.popup.table.th.value@}</th>
    </tr>
  </thead>

  <tbody>
  {foreach $attributes as $attribute}
    <tr>
      <th>{$attribute['name']}</th>
      <td>{$attribute['name']|featurepopup:$attribute['value'],$repository,$project}</td>
    </tr>
  {/foreach}
  </tbody>
</table>
