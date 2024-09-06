<div id="dock-content">
{foreach $dockable as $dock}
  <div {if $dock->id != "switcher"}class="hide"{/if} id="{$dock->id}">
    {$dock->fetchContent()}
  </div>
{/foreach}
</div>

<button id="dock-close" class="btn"></button>
