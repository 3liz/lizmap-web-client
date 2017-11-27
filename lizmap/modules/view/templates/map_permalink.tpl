<div class="permaLink">
  <h3>
    <span class="title">
      <button class="btn-permalink-clear btn btn-mini btn-error btn-link" title="{@view~map.toolbar.content.stop@}">×</button>
      <span class="icon"></span>
      <span class="text">&nbsp;{@view~map.permalink.toolbar.title@}&nbsp;</span>
    </span>
  </h3>

  <div class="menu-content">
    <div id="permalink-box" class="tabbable">
        <ul class="nav nav-tabs permalink-tabs">
            <li class="active">
                <a href="#tab-share-permalink" data-toggle="tab" title="{@view~map.permalink.share.tab.title@}">{@view~map.permalink.share.tab@}</a>
            </li>
            <li>
                <a href="#tab-embed-permalink" data-toggle="tab" title="{@view~map.permalink.embed.tab.title@}">{@view~map.permalink.embed.tab@}</a>
            </li>
        </ul>
        <div class="tab-content permalink-tab-content">
            <div id="tab-share-permalink" class="permalink-tab-pane-share tab-pane active">
                <input id="input-share-permalink" type="text">
                <a href="" target="_blank" id="permalink" title="{@view~map.permalink.share.link@}"><i class="icon-share"></i></a>
            </div>
            <div id="tab-embed-permalink" class="permalink-tab-pane-embed tab-pane">
                <a href="{jfullurl 'view~embed:index', array('repository'=>$repository,'project'=>$project)}" target="_blank" id="permalink-embed" style="display:none;"></a>
                <select id="select-embed-permalink" class="permalink-embed-select" style="width:auto;">
                    <option value="s">{@view~map.permalink.embed.size.small@}</option>
                    <option value="m">{@view~map.permalink.embed.size.medium@}</option>
                    <option value="l">{@view~map.permalink.embed.size.large@}</option>
                    <option value="p">{@view~map.permalink.embed.size.personalized@}</option>
                </select>
                <span id="span-embed-personalized-permalink" class="permalink-personalized" style="display:none;">
                  <input id="input-embed-width-permalink" type="text" value="800">
                  <pan>×</pan>
                  <input id="input-embed-height-permalink" type="text" value="600">
                </span>
                <br/>
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
        <input type="submit" class="btn-geobookmark-add btn btn-mini" title="{@view~map.permalink.geobookmark.button.add@}" value="{@view~map.permalink.geobookmark.button.add@}"/>
      </form>
    </div>
    {/if}

  </div>
</div>
