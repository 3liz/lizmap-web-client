    <div>
      <div id="bottom-dock-content">
      {foreach $dockable as $dock}
        <div {if $dock->order!=1}class="hide"{/if} id="{$dock->id}">
          {$dock->fetchContent()}
        </div>
      {/foreach}
      </div>

      <div id="bottom-dock-window-buttons">
        <button class="btn-bottomdock-clear btn btn-sm" type="button" title="{@view~map.bottomdock.toolbar.btn.clear.title@}">{@view~map.bottomdock.toolbar.btn.clear.title@}</button>
        &nbsp;
        <button class="btn-bottomdock-size btn btn-sm" type="button" title="{@view~map.bottomdock.toolbar.btn.size.maximize.title@}">{@view~map.bottomdock.toolbar.btn.size.maximize.title@}</button>
      </div>
    </div>
