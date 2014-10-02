    <div class="tabbable tabs-below">
      <div id="mini-dock-content" class="tab-content">
      {foreach $dockable as $dock}
        <div class="tab-pane{if $dock->order==1} active{/if}" id="{$dock->id}">
          {$dock->fetchContent()}
        </div>
      {/foreach}
      </div>
      <ul id="mini-dock-tabs" class="nav nav-tabs">
      {foreach $dockable as $dock}
        <li id="nav-tab-{$dock->id}" {if $dock->order==1} class="active"{/if}><a href="#{$dock->id}" data-toggle="tab">{$dock->title}</a></li>
      {/foreach}
      </ul>
    </div>
