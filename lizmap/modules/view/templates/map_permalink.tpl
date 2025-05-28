<div class="permaLink">
  <h3>
    <span class="title">
      <button class="btn-permalink-clear btn btn-sm btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button>
      <span class="icon"></span>
      <span class="text">&nbsp;{@view~map.permalink.toolbar.title@}&nbsp;</span>
    </span>
  </h3>

  <div class="menu-content">
    <div id="permalink-box">
        <ul class="nav nav-tabs permalink-tabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-target="#tab-share-permalink" data-bs-toggle="tab" title="{@view~map.permalink.share.tab.title@}">{@view~map.permalink.share.tab@}</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-target="#tab-embed-permalink" data-bs-toggle="tab" title="{@view~map.permalink.embed.tab.title@}">{@view~map.permalink.embed.tab@}</button>
            </li>
        </ul>
        <div class="tab-content permalink-tab-content">
            <div id="tab-share-permalink" class="permalink-tab-pane-share tab-pane active" role="tabpanel">
                <input id="input-share-permalink" type="text">
                <a href="" target="_blank" id="permalink" title="{@view~map.permalink.share.link@}"><i class="icon-share"></i></a>
            </div>
            <div id="tab-embed-permalink" class="permalink-tab-pane-embed tab-pane" role="tabpanel">
                <a href="{jfullurl 'view~embed:index', array('repository'=>$repository,'project'=>$project)}" target="_blank" id="permalink-embed" style="display:none;"></a>
                <select id="select-embed-permalink" class="permalink-embed-select" style="width:auto;">
                    <option value="s">{@view~map.permalink.embed.size.small@}</option>
                    <option value="m">{@view~map.permalink.embed.size.medium@}</option>
                    <option value="l">{@view~map.permalink.embed.size.large@}</option>
                    <option value="p">{@view~map.permalink.embed.size.personalized@}</option>
                </select>
                <div id="span-embed-personalized-permalink" class="permalink-personalized hide">
                  <input id="input-embed-width-permalink" type="number" min="0" class="input-mini" value="800">
                  <span>×</span>
                  <input id="input-embed-height-permalink" type="number" min="0" class="input-mini" value="600">
                </div>
                <input id="input-embed-permalink" class="permalink-embed-input" type="text">
            </div>
        </div>
    </div>

    {if $gbContent}
    <br/>
    <div id="geobookmark-container">
      {$gbContent}
    </div>

    <div>
      <form id="geobookmark-form">
        <input type="text" name="bname" placeholder="{@view~map.permalink.geobookmark.name.placeholder@}">
        <input type="submit" class="btn-geobookmark-add btn btn-sm" title="{@view~map.permalink.geobookmark.button.add@}" value="{@view~map.permalink.geobookmark.button.add@}"/>
      </form>
    </div>
    {/if}

  </div>
</div>
