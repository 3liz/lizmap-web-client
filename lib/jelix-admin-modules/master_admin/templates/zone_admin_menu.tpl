{foreach $menuitems as $bloc}
    {if count($bloc->childItems)}
        <div class="menu-bloc" id="menu-bloc-{$bloc->id}">
            {if $bloc->label}<h3>{$bloc->label|eschtml}</h3>{/if}
            <ul>{foreach $bloc->childItems as $item}
                <li {if $item->id == $selectedMenuItem} class="selected"{/if}>
                    {if $item->type == 'url'}
                        <a href="{$item->content|eschtml}"{if $item->icon}
                        style="background-image:url({$item->icon});"{/if}{if $item->newWindow}
                        target="_blank"{/if}>{$item->label|eschtml}</a>
                    {else}
                        {$item->content}
                    {/if}
                </li>
            {/foreach}</ul>
        </div>
    {/if}
{/foreach}