    <div class="tabbable">
      <ul id="dock-tabs" class="nav nav-tabs">
      {foreach $dockable as $dock}
        <li id="nav-tab-{$dock->id}"><a href="#{$dock->id}" data-toggle="tab">{$dock->title}</a></li>
      {/foreach}
      </ul>
      <div id="dock-content" class="tab-content">
      {foreach $dockable as $dock}
        <div class="tab-pane" id="{$dock->id}">
          {$dock->fetchContent()}
        </div>
      {/foreach}
      </div>
    </div>

<button id="dock-close" class="btn"></button>
