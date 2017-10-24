<div style="">
    <ul class="nav nav-list">
      {assign $onlyMaps=False}
      {foreach $dockable as $dock}
        {if $dock->id == 'home'}
          {assign $onlyMaps=True}
        {/if}
      {/foreach}
      {if !$onlyMaps}
      <li class="home">
        <a href="{jurl 'view~default:index'}" rel="tooltip" data-original-title="{@view~default.repository.list.title@}" data-placement="right" data-container="#content">
          <span class="icon"></span>
        </a>
      </li>
      {/if}

      {foreach $dockable as $dock}
      <li class="{$dock->id} nav-dock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}" data-container="#content">
          {$dock->icon}
        </a>
      </li>
      {/foreach}

      {foreach $minidockable as $dock}
      <li class="{$dock->id} nav-minidock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}" data-container="#content">
          {$dock->icon}
        </a>
      </li>
      {/foreach}

      {foreach $bottomdockable as $dock}
      <li class="{$dock->id} nav-bottomdock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}" data-container="#content">
          {$dock->icon}
        </a>
      </li>
      {/foreach}

      {foreach $rightdockable as $dock}
      <li class="{$dock->id} nav-right-dock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}" data-container="#content">
          {$dock->icon}
        </a>
      </li>
      {/foreach}

    </ul>
</div>
