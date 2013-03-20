{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.groups.rights.title@}</h1>

<form action="{formurl 'jacl2db_admin~groups:saverights'}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.rights.title@}</legend>
<div>{formurlparam 'jacl2db_admin~groups:saverights'}</div>
<table class="records-list jacl2-list">
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
        <th>{@jacl2db_admin~acl2.global.rights@}</th>
        <th>{@jacl2db_admin~acl2.special.rights@}</th>
    {/foreach}
    </tr>
</thead>
<tbody>
{assign $currentsbjgroup = '---'}
{foreach $rights as $subject=>$right}
{if $subjects[$subject]['grp'] && $currentsbjgroup != $subjects[$subject]['grp']}
<tr class="{cycle array('odd','even')}">
    <th colspan="{=$nbgrp*2+1}"><h3>{$sbjgroups_localized[$subjects[$subject]['grp']]}</h3></th>
</tr>{assign $currentsbjgroup = $subjects[$subject]['grp']}
{/if}
<tr class="{cycle array('odd','even')}">
    <th title="{$subject}">{$subjects[$subject]['label']|eschtml}</th>
    {foreach $right as $group=>$r}
    <td><select name="rights[{$group}][{$subject}]">
        <option value=""  {if $r == ''}selected="selected"{/if}>-</option>
        <option value="y" {if $r == 'y'}selected="selected"{/if}>yes</option>
        <option value="n" {if $r == 'n'}selected="selected"{/if}>no</option>
        </select>
    </td>
    <td>{if isset($rightsWithResources[$subject][$group]) && $rightsWithResources[$subject][$group]}
        <a href="{jurl 'jacl2db_admin~groups:rightres',array('group'=>$group)}">yes</a>
    {/if}</td>
    {/foreach}
</tr>
{/foreach}
</tbody>
</table>
<div class="legend">
    <ul>
        <li>{@jacl2db_admin~acl2.group.help.rights.inherit@}</li>
        <li>{@jacl2db_admin~acl2.group.help.rights.yes@}</li>
        <li>{@jacl2db_admin~acl2.group.help.rights.no@}</li>
    </ul>
</div>
<div><input type="submit" value="{@jacl2db_admin~acl2.save.button@}" /></div>
</fieldset>
</form>

