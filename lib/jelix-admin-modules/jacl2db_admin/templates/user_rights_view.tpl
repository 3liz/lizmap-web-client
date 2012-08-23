{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.user.rights.title@} {$user}</h1>

<table class="records-list jacl2-list-user">
<thead>
    <tr>
        <th rowspan="2"></th>
        <th class="colreduced" rowspan="2">{@jacl2db_admin~acl2.col.personnal.rights@}</th>
        <th class="colreduced" rowspan="2">{@jacl2db_admin~acl2.col.personnal.rights.res@}</th>
        {if $nbgrp}
        <th colspan="{$nbgrp}">{@jacl2db_admin~acl2.col.groups@}</th>
        {/if}
        <th class="colblank" rowspan="2"></th>
        <th class="colreduced" rowspan="2">{@jacl2db_admin~acl2.col.resulting@}</th>
    </tr>
    <tr>
    {foreach $groups as $group}
        {if isset($groupsuser[$group->id_aclgrp])}
        <th>{$group->name}</th>
        {else}
        <th class="notingroup">{$group->name}</th>
        {/if}
    {/foreach}
    </tr>
</thead>
<tbody>
{assign $currentsbjgroup = '---'}
{foreach $rights as $subject=>$right}

{if $subjects[$subject]['grp'] && $currentsbjgroup != $subjects[$subject]['grp']}
<tr class="{cycle array('odd','even')}">
    <th colspan="{=$nbgrp*2+4}"><h3>{$sbjgroups_localized[$subjects[$subject]['grp']]}</h3></th>
</tr>{assign $currentsbjgroup = $subjects[$subject]['grp']}
{/if}
<tr class="{cycle array('odd','even')}">
    <th>{$subjects[$subject]['label']|eschtml}</th>
    {assign $resultr=''}
    {foreach $right as $group=>$r}
    {if $hisgroup && $group == $hisgroup->id_aclgrp}
            {if $r=='y' && $resultr==''}{assign $resultr='y'}{/if}
            {if $r=='n'}{assign $resultr='n'}{/if}
    <td>
        {if $r =='y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="yes" />{if $resultr==''}{assign $resultr='y'}{/if}
        {elseif $r=='n'}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="no" />{assign $resultr='n'}{/if}
    </td>
    <td>{if $rightsWithResources[$subject]}yes{/if}</td>
    {else}
    <td {if !isset($groupsuser[$group])}class="notingroup">
            {if $r =='y'}<img src="{$j_jelixwww}/design/icons/accept_disabled.png" alt="yes" />
            {elseif $r=='n'}<img src="{$j_jelixwww}/design/icons/cancel_disabled.png" alt="no" />{/if}
        {else}>
            {if $r =='y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="yes" />{if $resultr==''}{assign $resultr='y'}{/if}
            {elseif $r=='n'}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="no" />{assign $resultr='n'}{/if}
        {/if}
    </td>
    {/if}
    {/foreach}
    <td class="colblank"></td>
    <td>
        {if $resultr =='y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="yes" />
        {else}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="no" />{/if}
    </td>
</tr>
{/foreach}
</tbody>
</table>
{if $hasRightsOnResources}
<p>{@jacl2db_admin~acl2.has.rights.on.resources@}. <a href="{jurl 'jacl2db_admin~users:rightres',array('user'=>$user)}">{@jacl2db_admin~acl2.see.rights.on.resources@}</a>.</p>
{/if}
