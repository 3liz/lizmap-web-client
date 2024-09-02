{foreach $menuitems as $bloc}
    {if count($bloc->childItems)}
         {if $bloc->label}<li class="list-group-item list-group-item-secondary">{$bloc->label|eschtml}</li>{/if}
         {foreach $bloc->childItems as $item}
                <li class="list-group-item list-group-item-action{if $item->id == $selectedMenuItem} active{/if}">
                    {if $item->type == 'url'}
                        <a href="{$item->content|eschtml}"{if $item->icon}
                        style="background-image:url({$item->icon});"{/if}>{$item->label|eschtml}</a>
                    {else}
                        {$item->content}
                    {/if}
                </li>
         {/foreach}
    {/if}
{/foreach}
