<div style="width:30px; height:30px; position:relative;">
    <ul class="nav nav-list">
      {assign $onlyMaps=False}
      {foreach $dockable as $dock}
        {if $dock->id == 'home'}
          {assign $onlyMaps=True}
        {/if}
      {/foreach}
      {if !$onlyMaps}
      <li class="home">
        <a href="{jurl 'view~default:index'}" rel="tooltip" data-original-title="{@view~default.repository.list.title@}" data-placement="right">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      <!--li class="switcher nav-dock">
        <a id="button-switcher" rel="tooltip" data-original-title="{@view~map.layers@}" data-placement="right" href="#switcher">
          <span class="icon"></span>
        </a>
      </li>
      <li class="legend nav-dock">
        <a id="button-legend" rel="tooltip" data-original-title="{@view~map.legend@}" data-placement="right" href="#legend">
          <span class="icon"></span>
        </a>
      </li>
      <li class="metadata nav-dock">
        <a id="displayMetadata" rel="tooltip" data-original-title="{@view~map.metadata.link.label@}" data-placement="right" href="#metadata">
          <span class="icon"></span>
        </a>
      </li-->
      {foreach $dockable as $dock}
      <li class="{$dock->id} nav-dock">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}">
          {$dock->icon}
        </a>
      </li>
      {/foreach}
      {foreach $minidockable as $dock}
      <li class="{$dock->id} nav-minidock">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}">
          {$dock->icon}
        </a>
      </li>
      {/foreach}
      {foreach $bottomdockable as $dock}
      <li class="{$dock->id} nav-bottomdock">
        <a id="button-{$dock->id}" rel="tooltip" data-original-title="{$dock->title}" data-placement="right" href="#{$dock->id}">
          {$dock->icon}
        </a>
      </li>
      {/foreach}
      <!--
      {if $attributeLayers}
      <li class="attributeLayers">
        <a id="toggleAttributeLayers" rel="tooltip" data-original-title="{@view~map.attributeLayers.navbar.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      -->
    </ul>
</div>
