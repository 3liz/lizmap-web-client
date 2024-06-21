<div id="mini-dock-content">
{foreach $dockable as $dock}
  <div class="hide" id="{$dock->id}">
    {$dock->fetchContent()}
  </div>
{/foreach}
</div>
