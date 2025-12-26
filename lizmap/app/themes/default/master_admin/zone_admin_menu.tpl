{foreach $menuitems as $bloc}
    {if count($bloc->childItems)}
         {if $bloc->label}<li class="nav-header navbar-text">{$bloc->label|eschtml}</li>{/if}
         {foreach $bloc->childItems as $item}
                <li class="nav-item">
                    {if $item->type == 'url'}
                        <a class="nav-link{if $item->id == $selectedMenuItem} active{else} link-body-emphasis{/if}" href="{$item->content|eschtml}">
                            {if $item->icon}<i class="nav-icon"><img src="{$item->icon}"/></i>{/if}
                            {$item->label|eschtml}
                        </a>
                    {else}
                        {$item->content}
                    {/if}
                </li>
         {/foreach}
    {/if}
{/foreach}
