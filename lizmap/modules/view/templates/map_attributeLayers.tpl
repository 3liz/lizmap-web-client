<div class="tabbable">
  <div class="tab-content" id="attribute-table-container">
    <div class="tab-pane active attribute-content bottom-content" id="attribute-summary" >
      <div id="attribute-layer-list"></div>
      <b>{@view~map.attributeLayers.options.title@}</b>
      {formfull $form, 'view~default:index', array(), 'htmlbootstrap'}
    </div>
  </div>
  <ul id="attributeLayers-tabs" class="nav nav-tabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button id="nav-tab-attribute-summary" class="nav-link active" data-bs-toggle="tab" data-bs-target="#attribute-summary" role="tab">{@view~map.attributeLayers.toolbar.title@}</button>
    </li>
  </ul>
</div>
