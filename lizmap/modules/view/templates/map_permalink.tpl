<div class="permaLink">
  <h3>
    <span class="title">
      <button class="btn-permalink-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button>
      <span class="icon"></span>
      <span class="text">&nbsp;{@view~map.permalink.title@}&nbsp;</span>
    </span>
  </h3>

  <div class="menu-content">
    <div id="permalink-box">
      <a href="" target="_blank" id="permalink">{@view~map.permalink.title@}</a>
    </div>

    {if $gbContent}
    <br/>
    <div id="geobookmark-container">
      {$gbContent}
    </div>

    <div>
      <form id="geobookmark-form">
        <input type="text" name="bname" placeholder="{@view~map.permalink.geobookmark.name.placeholder@}">
        <input type="submit" class="btn-geobookmark-add btn btn-mini" title="{@view~map.permalink.geobookmark.button.add@}" value="{@view~map.permalink.geobookmark.button.add@}"/>
    </div>
    {/if}

  </div>
</div>
