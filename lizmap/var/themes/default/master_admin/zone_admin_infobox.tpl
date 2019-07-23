<ul class="nav pull-right">
  {foreach $infoboxitems  as $item}
    <li class="{$item->id}">
     {if $item->type == 'url'}
     <a href="{$item->content|eschtml}" title="{$item->label|eschtml}">
       {if $item->icon}<span class="icon"></span>{/if}
       <span class="text hidden-phone">{$item->label|eschtml}</span>
     </a>
     {else}
     <p class="navbar-text">{$item->content}</p>
     {/if}
    </li>
  {/foreach}
    {include 'lizmap~user_menu'}
</ul>
