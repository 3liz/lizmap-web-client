{meta_html css  $j_jelixwww.'design/records_list.css'}
{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.groups.rights.title@}</h1>

<p><a href="{jurl 'jacl2db_admin~groups:index'}" class="btn">{@jacl2db_admin~acl2.menu.item.groups@}</a></p>

<table class="records-list jacl2-list table-striped">
<thead>
    <tr>
        <th rowspan="2"></th>
        <th colspan="{=$nbgrp*2}">{@jacl2db_admin~acl2.table.th.groups@}</th>
    </tr>
    <tr>
    {foreach $groups as $group}
        <th colspan="2">{$group->name}</th>
    {/foreach}
    </tr>
    <tr>
        <th>{@jacl2db_admin~acl2.table.th.rights@}</th>
    {foreach $groups as $group}
        <th>{@jacl2db_admin~acl2.global.rights@}</th>
        <th>{@jacl2db_admin~acl2.special.rights@}</th>
    {/foreach}
    </tr>
</thead>
<tfoot>
    <tr>
        <td></td>
    {foreach $groups as $group}
        <th></th>
        <th><a href="{jurl 'jacl2db_admin~groups:rightres',array('group'=>$group->id_aclgrp)}" class="btn btn-small">{@jacl2db_admin~acl2.group.rights.yes@}</a></th>
    {/foreach}
    </tr>
</tfoot>
<tbody>
{assign $currentsbjgroup = '---'}
{foreach $rights as $subject=>$right}
{if $subjects[$subject]['grp'] && $currentsbjgroup != $subjects[$subject]['grp']}
<tr class="{cycle array('odd','even')}">
    <th colspan="{=$nbgrp*2+1}"><h3>{$sbjgroups_localized[$subjects[$subject]['grp']]}</h3></th>
</tr>{assign $currentsbjgroup = $subjects[$subject]['grp']}
{/if}
<tr class="{cycle array('odd','even')}">
    <th>{$subjects[$subject]['label']|eschtml}</th>
    {foreach $right as $group=>$r}
    <td>
        {if $r == ''}<span class="right-no">{@jacl2db_admin~acl2.group.rights.no@}</span>{/if}
        {if $r == 'y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="{@jacl2db_admin~acl2.group.rights.yes@}" />{/if}
        {if $r == 'n'}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="{@jacl2db_admin~acl2.group.rights.forbidden@}" />{/if}
    </td>
    <td>{if isset($rightsWithResources[$subject][$group]) && $rightsWithResources[$subject][$group]}yes{/if}</td>
    {/foreach}
</tr>
{/foreach}
</tbody>
</table>
<div class="legend">
    <ul>
        <li><img src="{$j_jelixwww}/design/icons/accept.png" alt="{@jacl2db_admin~acl2.group.rights.yes@}" /> : {@jacl2db_admin~acl2.group.help.rights.yes@}</li>
        <li><span class="right-no">{@jacl2db_admin~acl2.group.rights.no@}</span>: {@jacl2db_admin~acl2.group.help.rights.no@}</li>
        <li><img src="{$j_jelixwww}/design/icons/cancel.png" alt="{@jacl2db_admin~acl2.group.rights.forbidden@}" />: {@jacl2db_admin~acl2.group.help.rights.forbidden@}</li>
    </ul>
</div>
