<div id="right-dock-content">
{foreach $dockable as $dock}
    <div class="hide" id="{$dock->id}">
        {$dock->fetchContent()}
    </div>
{/foreach}
</div>

<button id="right-dock-close" class="btn"></button>
