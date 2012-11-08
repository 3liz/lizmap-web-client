<h1>{jlocale 'jpref_admin~admin.prefs.list'}</h1>

{if count($prefs) == 0}
    {jlocale 'jpref_admin~admin.no.prefs'}.
{else}
    <table class="records-list">
        <thead>
            <tr>
                <th>{jlocale 'jpref_admin~admin.ui.pref.name'}</th><th>{jlocale 'jpref_admin~admin.ui.pref.value'}</th><th>&nbsp;</th><th>&nbsp;</th>
            </tr>
        </thead>
    
        <tbody>
            {foreach $prefs as $group}
                {if count($group->prefs) > 0}
                       <tr>
                            <th colspan="4">
                                <h3>
                                    {if $group->locale}
                                        {jlocale $group->locale}
                                    {else}
                                        {$group->id}
                                    {/if}
                                </h3>
                            </th>
                       </tr>
                   
                    {foreach $group->prefs as $pref}
                        <tr class="{cycle array('odd','even')}">
                            <td>
                                {if !empty($pref->locale)}
                                    {jlocale $pref->locale}
                                {else}
                                    {$pref->id}
                                {/if}
                            </td>
                            <td>
                                {if $pref->value !== null}
                                    {if is_bool($pref->value)}
                                        {if $pref->value}
                                            {jlocale 'jelix~ui.buttons.yes'}
                                        {else}
                                            {jlocale 'jelix~ui.buttons.no'}
                                        {/if}
                                    {else}
                                        {$pref->value}
                                    {/if}
                                {/if}
                            </td>
                            <td>
                                {if $pref->isWritable()}
                                        <a href="{jurl 'jpref_admin~prefs:edit', array('id' => $pref->id)}">Modifier</a>
                                {/if}
                            </td>
                            <td>
                                {if $pref->isWritable() && $pref->default_value !== null && $pref->default_value != $pref->value}
                                    <a href="{jurl 'jpref_admin~prefs:reset', array('id' => $pref->id)}">{jlocale 'jpref_admin~admin.ui.pref.reset'}
                                        <em>
                                        {if is_bool($pref->default_value)}
                                            {if $pref->default_value}
                                                {jlocale 'jelix~ui.buttons.yes'}
                                            {else}
                                                {jlocale 'jelix~ui.buttons.no'}
                                            {/if}
                                        {else}
                                            {$pref->default_value}
                                        {/if}
                                        </em>
                                    </a>
                                {/if}
                            </td>
                        </tr>
                    {/foreach}
                   
                   
                {/if}
            {/foreach}
        </tbody>
    </table>
{/if}