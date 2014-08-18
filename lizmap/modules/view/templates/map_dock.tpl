    <div class="tabbable">
      <ul class="nav nav-tabs">
      {foreach $dockable as $dock}
        <li id="nav-tab-{$dock->id}" style="display:none;"><a href="#{$dock->id}" data-toggle="tab">{$dock->title}</a></li>
      {/foreach}
      </ul>
      <div class="tab-content">
      {foreach $dockable as $dock}
        <div class="tab-pane" id="{$dock->id}">
          {$dock->content}
        </div>
      {/foreach}
      </div>
    </div>
