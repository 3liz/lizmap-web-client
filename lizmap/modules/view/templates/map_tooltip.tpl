<div class="tooltip-layer">
  <h3>
    <span class="title">
      <button class="btn-tooltip-layer-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button>
      <button id="tooltip-cancel" class="btn-tooltip-cancel btn btn-mini btn-link" type="button"></button>
      <span class="icon"></span>
      <span class="text">&nbsp;{@view~map.tooltip.toolbar.title@}&nbsp;</span>
    </span>
  </h3>
  <div class="menu-content">
    <table>
      <tr>
        <td>{@view~map.tooltip.toolbar.layer@}</td>
      </tr>
      <tr>
        <td>
            <select id="tooltip-layer-list" class="btn-tooltip-layer-list loading" disabled="">
                <option value="">---</option>
            </select>
        </td>
      </tr>
    </table>
  </div>
</div>
