<div class="print">
  <h3><span class="title"><button class="btn-print-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}&nbsp;<span class="text"></span></span></span></h3>
  <div class="menu-content">
    <table>
      <tr>
        <th>Template</th>
        <th>{@view~map.print.toolbar.scale@}</th>
        <th>DPI</th>
        <th></th>
      </tr>
      <tr>
        <td><select id="print-template" class="btn-print-templates"></select></td>
        <td><select id="print-scale" class="btn-print-scales"></select></td>
        <td><select id="print-dpi" class="btn-print-dpis"><option>100</option><option>200</option><option>300</option></select></td>
        <td><button id="print-launch" class="btn-print-launch btn btn-small btn-success"><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}</button></td>
      </tr>
    </table>
    <div class="print-labels">
      <input class="print-label"></input>
      <textarea class="print-label"></textarea>
    </div>
  </div>
</div>
