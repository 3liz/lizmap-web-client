<div class="print">
  <h3><span class="title"><button class="btn-print-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}&nbsp;<span class="text"></span></span></span></h3>
  <div class="menu-content">
    <table class="table table-condensed">
      <tr>
        <td>{@view~map.print.toolbar.template@}</td>
        <td>{@view~map.print.toolbar.scale@}</td>
        <td>{@view~map.print.toolbar.dpi@}</td>
        <td>{@view~map.print.toolbar.format@}</td>
      </tr>
      <tr>
        <td><select id="print-template" class="btn-print-templates"></select></td>
        <td><select id="print-scale" class="btn-print-scales"></select></td>
        <td>
          <select id="print-dpi" class="btn-print-dpis">
            <option>100</option>
            <option>200</option>
            <option>300</option>
          </select></td>
        <td>
          <select id="print-format" class="btn-print-format">
            <option value="pdf">PDF</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="svg">SVG</option>
          </select>
        </td>
      </tr>
    </table>
    <div class="print-labels">
      <input class="print-label" style="width:90%;align:center;"></input>
      <textarea class="print-label" style="width:90%;align:center;"></textarea>
    </div>
    <table width="100%">
      <tr>
        <td align="right">
          <button style="width:100%;" id="print-launch" class="btn-print-launch btn btn-small btn-primary"><span class="icon"></span>&nbsp;{@view~map.print.toolbar.title@}</button>
        </td>
      </tr>
    </table>
  </div>
</div>
