{meta_html css  $j_jelixwww.'design/jacl2.css'}
{meta_html js  $j_jelixwww.'js/acl2db_admin.js'}

<h1>{@jacl2db_admin~acl2.user.rights.title@} {$user}</h1>


<form action="{formurl 'jacl2db_admin~users:saverights',array('user'=>$user)}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.rights.title@}</legend>

<div>{formurlparam 'jacl2db_admin~users:saverights',array('user'=>$user)}</div>
<table class="records-list jacl2-list-user" id="rights-list"
       data-yes-img="{$j_jelixwww}/design/icons/accept.png"
       data-yes-title="{@jacl2db_admin~acl2.group.rights.yes@}"
       data-no-img="{$j_jelixwww}/design/icons/cancel.png"
       data-no-title="{@jacl2db_admin~acl2.group.rights.forbidden@}"
>
<thead>
    <tr>
        <th rowspan="2"></th>
        <th class="colreduced" rowspan="2">{@jacl2db_admin~acl2.col.personnal.rights@}</th>
        <th class="colreduced" rowspan="2">{@jacl2db_admin~acl2.col.personnal.rights.res@}</th>
        {if $nbgrp}
        <th colspan="{$nbgrp}">{@jacl2db_admin~acl2.col.groups@}</th>
        {/if}
        <th class="colblank" rowspan="2"></th>
        <th class="colreduced" rowspan="2">{@jacl2db_admin~acl2.col.resulting@} {$user}</th>
    </tr>
    <tr>
    {foreach $groups as $group}
        {if isset($groupsuser[$group->id_aclgrp])}
        <th>{$group->name} <a class="removegroup" href="{jurl 'jacl2db_admin~users:removegroup',array('user'=>$user,'grpid'=>$group->id_aclgrp)}" title="{@jacl2db_admin~acl2.remove.group.tooltip@}">-</a></th>
        {else}
        <th class="notingroup">{$group->name} <a class="addgroup" href="{jurl 'jacl2db_admin~users:addgroup',array('user'=>$user,'grpid'=>$group->id_aclgrp)}" title="{@jacl2db_admin~acl2.add.group.tooltip@}">+</a></th>
        {/if}
    {/foreach}
    </tr>
</thead>
<tfoot>
    <tr>
        <td></td>
        <td><input type="submit" value="{@jacl2db_admin~acl2.save.button@}" /></td>
        <td colspan="{=$nbgrp+3}"></td>
    </tr>
</tfoot>
<tbody>
{assign $currentsbjgroup = '---'}
{foreach $rights as $subject=>$right}

{if $subjects[$subject]['grp'] && $currentsbjgroup != $subjects[$subject]['grp']}
<tr class="{cycle array('odd','even')}">
    <th colspan="{=$nbgrp*2+4}"><h3>{$sbjgroups_localized[$subjects[$subject]['grp']]}</h3></th>
</tr>{assign $currentsbjgroup = $subjects[$subject]['grp']}
{/if}
<tr class="{cycle array('odd','even')}">
    <th><label for="{$subject|eschtml}">{$subjects[$subject]['label']|eschtml}</label></th>
    {assign $resultr=''}
    {foreach $right as $group=>$r}
        {if $hisgroup && $group == $hisgroup->id_aclgrp}
            {if $r=='y' && $resultr==''}{assign $resultr='y'}{/if}
            {if $r=='n'}{assign $resultr='n'}{/if}
    <td>
        <select name="rights[{$subject}]" id="{$subject|eschtml}" class="user-right-authorization">
        <option value=""  {if $r == ''}selected="selected"{/if}>{@jacl2db_admin~acl2.group.rights.no@}</option>
        <option value="y" {if $r == 'y'}selected="selected"{/if}>{@jacl2db_admin~acl2.group.rights.yes@}</option>
        <option value="n" {if $r == 'n'}selected="selected"{/if}>{@jacl2db_admin~acl2.group.rights.forbidden@}</option>
        </select>
        <input type="hidden" name="currentrights[{$subject}]" value="{$r}"/>
    </td>
    <td>    {if $rightsWithResources[$subject]}{@jacl2db_admin~acl2.group.rights.yes@}{/if}</td>
        {else}
    <td {if !isset($groupsuser[$group])}class="notingroup">
            {if $r =='y'}<img src="{$j_jelixwww}/design/icons/accept_disabled.png" alt="{@jacl2db_admin~acl2.group.rights.yes@}"  title="{@jacl2db_admin~acl2.group.rights.yes@}"/>
            {elseif $r=='n'}<img src="{$j_jelixwww}/design/icons/cancel_disabled.png" alt="{@jacl2db_admin~acl2.group.rights.forbidden@}" title="{@jacl2db_admin~acl2.group.rights.forbidden@}" />{/if}
        {else} data-right="{$r}">
            {if $r =='y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="{@jacl2db_admin~acl2.group.rights.yes@}" title="{@jacl2db_admin~acl2.group.rights.yes@}" />{if $resultr==''}{assign $resultr='y'}{/if}
            {elseif $r=='n'}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="{@jacl2db_admin~acl2.group.rights.forbidden@}" title="{@jacl2db_admin~acl2.group.rights.forbidden@}" />{assign $resultr='n'}{/if}
        {/if}
    </td>
    {/if}
    {/foreach}
    <td class="colblank"></td>
    <td class="rights-result">
        {if $resultr =='y'}<img src="{$j_jelixwww}/design/icons/accept.png" alt="{@jacl2db_admin~acl2.group.rights.yes@}" title="{@jacl2db_admin~acl2.group.rights.yes@}" />
        {else}<img src="{$j_jelixwww}/design/icons/cancel.png" alt="{@jacl2db_admin~acl2.group.rights.forbidden@}" title="{@jacl2db_admin~acl2.group.rights.forbidden@}" />{/if}
    </td>
</tr>
{/foreach}
</tbody>
</table>
    <div class="legend">
        <ul>
            <li><span class="right-yes">{@jacl2db_admin~acl2.group.rights.yes@}</span> : {@jacl2db_admin~acl2.group.help.rights.yes@}</li>
            <li><span class="right-no">{@jacl2db_admin~acl2.group.rights.no@}</span>: {@jacl2db_admin~acl2.group.help.rights.no@}</li>
            <li><span class="right-forbidden">{@jacl2db_admin~acl2.group.rights.forbidden@}</span>: {@jacl2db_admin~acl2.group.help.rights.forbidden@}</li>
        </ul>
    </div>
{if $hasRightsOnResources}
<p>{@jacl2db_admin~acl2.has.rights.on.resources@}. <a href="{jurl 'jacl2db_admin~users:rightres',array('user'=>$user)}">{@jacl2db_admin~acl2.see.rights.on.resources@}</a>.</p>
{/if}
</fieldset>
</form>

