<div>
    <ul class="nav nav-list">
      {if $display_home}
      <li class="home">
        <a href="{jurl 'view~default:index'}" data-bs-toggle="tooltip" data-bs-title="{@view~default.home.menu@}" data-placement="right" data-container="#content">
          <span class="icon"></span><span class="menu-title">{@view~default.home.menu@}</span>
        </a>
      </li>
      {/if}

      {foreach $dockable as $dock}
      <li class="{$dock->id} nav-dock {$dock->menuIconClasses}{if $dock->id == "switcher"} active{/if}">
        <a id="button-{$dock->id}" data-bs-toggle="tooltip" data-bs-title="{$dock->title}" data-placement="right" data-dockid="{$dock->id}" href="#" data-container="#content">
          {$dock->icon}<span class="menu-title">{$dock->title}</span>
        </a>
      </li>
      {/foreach}

      {foreach $minidockable as $dock}
      <li class="{$dock->id} nav-minidock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" data-bs-toggle="tooltip" data-bs-title="{$dock->title}" data-placement="right" data-dockid="{$dock->id}" href="#" data-container="#content">
          {$dock->icon}<span class="menu-title">{$dock->title}</span>
        </a>
      </li>
      {/foreach}

      {foreach $bottomdockable as $dock}
      <li class="{$dock->id} nav-bottomdock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" data-bs-toggle="tooltip" data-bs-title="{$dock->title}" data-placement="right" data-dockid="{$dock->id}" href="#{$dock->id}" data-container="#content">
          {$dock->icon}<span class="menu-title">{$dock->title}</span>
        </a>
      </li>
      {/foreach}

      {foreach $rightdockable as $dock}
      <li class="{$dock->id} nav-right-dock {$dock->menuIconClasses}">
        <a id="button-{$dock->id}" data-bs-toggle="tooltip" data-bs-title="{$dock->title}" data-placement="right" data-dockid="{$dock->id}" href="#" data-container="#content">
          {$dock->icon}<span class="menu-title">{$dock->title}</span>
        </a>
      </li>
      {/foreach}

    </ul>
</div>
