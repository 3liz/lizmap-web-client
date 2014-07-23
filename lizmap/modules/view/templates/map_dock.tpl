    <div class="tabbable tabs-below">
      <div class="tab-content">
      {foreach $dockable as $dock}
        <div class="tab-pane{if $dock->order==1} active{/if}" id="{$dock->id}">
          {$dock->content}
        </div>
      {/foreach}
      </div>
      <ul class="nav nav-tabs">
      {foreach $dockable as $dock}
        <li{if $dock->order==1} class="active"{/if}><a href="#{$dock->id}" data-toggle="tab">{$dock->title}</a></li>
      {/foreach}
      </ul>
    </div>
