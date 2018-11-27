{foreach $menuitems as $bloc}
    {if count($bloc->childItems)}
         {if $bloc->label}<li class="nav-header">{$bloc->label|eschtml}</li>{/if}
         {foreach $bloc->childItems as $item}
                <li {if $item->id == $selectedMenuItem} class="active"{/if}>
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
