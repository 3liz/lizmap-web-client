<ul class="navbar-nav">
  {foreach $infoboxitems  as $item}
    <li class="{$item->id} nav-item">
     {if $item->type == 'url'}
     <a class="nav-link" href="{$item->content|eschtml}" title="{$item->label|eschtml}">
       {if $item->icon}<span class="icon"></span>{/if}
       <span class="d-none d-sm-inline">{$item->label|eschtml}</span>
     </a>
     {else}
     <p class="navbar-text">{$item->content}</p>
     {/if}
    </li>
  {/foreach}
    {include 'lizmap~user_menu'}
</ul>
