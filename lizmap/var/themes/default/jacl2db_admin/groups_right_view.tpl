{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.groups.rights.title@}</h1>

<p><a href="{jurl 'jacl2db_admin~groups:index'}" class="btn">{@jacl2db_admin~acl2.menu.item.groups@}</a></p>

<table class="records-list jacl2-list table-striped">
<thead>
    <tr>
        <th rowspan="2"></th>
        <th colspan="0">{@jacl2db_admin~acl2.table.th.groups@}</th>
    </tr>
    <tr>
    {foreach $groups as $group}
        <th colspan="2">{$group->name}</th>
    {/foreach}
    </tr>
    <tr>
        <th>{@jacl2db_admin~acl2.table.th.rights@}</th>
    {foreach $groups as $group}
        <th>global</th>
        <th>on res</th>
    {/foreach}
    </tr>
</thead>
<tfoot>
    <tr>
        <td></td>
    {foreach $groups as $group}
        <th></th>
        <th><a href="{jurl 'jacl2db_admin~groups:rightres',array('group'=>$group->id_aclgrp)}" class="btn btn-small">see</a></th>
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
        {if $r == ''}-{/if}
        {if $r == 'y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="yes" />{/if}
        {if $r == 'n'}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="no" />{/if}
    </td>
    <td>{if isset($rightsWithResources[$subject][$group]) && $rightsWithResources[$subject][$group]}yes{/if}</td>
    {/foreach}
</tr>
{/foreach}
</tbody>
</table>
