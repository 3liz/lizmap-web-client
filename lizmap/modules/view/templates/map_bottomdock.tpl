    <div class="tabbable tabs-below">
      <div id="bottom-dock-content" class="tab-content">
      {foreach $dockable as $dock}
        <div class="tab-pane{if $dock->order==1} active{/if}" id="{$dock->id}">
          {$dock->fetchContent()}
        </div>
      {/foreach}
      </div>

      <div id="bottom-dock-window-buttons">
        <button class="btn-bottomdock-clear btn btn-sm" type="button" title="{@view~map.bottomdock.toolbar.btn.clear.title@}">{@view~map.bottomdock.toolbar.btn.clear.title@}</button>
        &nbsp;
        <button class="btn-bottomdock-size btn btn-sm" type="button" title="{@view~map.bottomdock.toolbar.btn.size.maximize.title@}">{@view~map.bottomdock.toolbar.btn.size.maximize.title@}</button>
      </div>

      <ul id="bottom-dock-tabs" class="nav nav-tabs">
      {foreach $dockable as $dock}
        <li id="nav-tab-{$dock->id}" {if $dock->order==1} class="active"{/if}><a href="#{$dock->id}" data-toggle="tab">{$dock->title}</a></li>
      {/foreach}
      </ul>
    </div>
