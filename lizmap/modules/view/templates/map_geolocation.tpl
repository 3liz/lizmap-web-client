<div class="geolocation">
  <h3>
    <span class="title">
      <button class="btn-geolocation-close btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button>
      <span class="icon"></span>
      <span class="text">&nbsp;{@view~map.geolocate.toolbar.title@}&nbsp;</span>
    </span>
  </h3>
  <div class="menu-content">
    <div class="button-bar">
      <button id="geolocation-center" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span>&nbsp;{@view~map.geolocate.toolbar.center@}</button>
      <button id="geolocation-bind" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span>&nbsp;{@view~map.geolocate.toolbar.bind@}</button>
      <button id="geolocation-stop" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span>&nbsp;{@view~map.geolocate.toolbar.stop@}</button>
    </div>
    {if $hasEditionLayers}
    <div id="geolocation-edition-group" style="display:none; margin-top:5px;">
      <table>
          <tr>
              <td style="vertical-align: top;">
      <span id="geolocation-edition-title" style="font-weight:bold">{@view~edition.geolocate.toolbar.title@}&nbsp;</span>
              </td>
              <td>
      <label id="geolocation-edition-linked-label" class="checkbox"><input id="geolocation-edition-linked" type="checkbox" value="1" disabled="disabled">{@view~edition.point.coord.geolocation.label@}</label>
      <button id="geolocation-edition-add" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span>&nbsp;{@view~edition.point.coord.add.label@}</button>
      <button id="geolocation-edition-submit" class="btn btn-small btn-primary" disabled="disabled"><span class="icon"></span>&nbsp;{@view~edition.point.coord.finalize.label@}</button>
              </td>
          </tr>
      </table>
    </div>
    {/if}
  </div>
</div>
