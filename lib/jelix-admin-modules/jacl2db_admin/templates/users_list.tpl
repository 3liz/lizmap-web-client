{meta_html css  $j_jelixwww.'design/jacl2.css'}


<h1>{@jacl2db_admin~acl2.users.title@}</h1>

<form action="{formurl 'jacl2db_admin~users:rights'}" method="get" class="form-inline">
    <div>
        <label>{@jacl2db_admin~acl2.user.rights.title@}</label>
        <input name="user"></input>
        <button type="submit">{@jacl2db_admin~acl2.show.button@}</button>
    </div>
</form>

<form action="{formurl 'jacl2db_admin~users:index'}" method="get">
<fieldset><legend>{@jacl2db_admin~acl2.filter.title@}</legend>
{formurlparam 'jacl2db_admin~users:index'}
    <label for="user-list-group">{@jacl2db_admin~acl2.filter.group@}</label>
    <select name="grpid" id="user-list-group">
    {foreach $groups as $group}
        <option value="{$group->id_aclgrp}" {if $group->id_aclgrp == $grpid}selected="selected"{/if}>{$group->name}</option>
    {/foreach}
     </select>
    - 
    <label for="user-list-filter">{@jacl2db_admin~acl2.filter.word@}</label>
    <input type="text" name="filter" value="{$filter|eschtml}" id="user-list-filter" />
    <br/><input type="submit" value="{@jacl2db_admin~acl2.show.button@}" />
</fieldset>
</form>

{if $usersCount == 0}
<p>{@jacl2db_admin~acl2.no.user.message@}</p>
{else}
<table class="records-list">
<thead>
    <tr>
        <th>{@jacl2db_admin~acl2.col.users@}</th>
        <th>{@jacl2db_admin~acl2.col.groups@}</th>
        <th></th>
    </tr>
</thead>
<tbody>
{assign $line = true}
{foreach $users as $user}
    <tr class="{if $line}odd{else}even{/if}">
        <td>{$user->login}</td>
        <td>{foreach $user->groups as $group} {$group->name} {/foreach}</td>
        <td><a href="{jurl 'jacl2db_admin~users:rights', array('user'=>$user->login)}">{@jacl2db_admin~acl2.rights.link@}</a></td>
    </tr>
{assign $line = !$line}
{/foreach}
</tbody>
</table>
{/if}

{if $usersCount > $listPageSize}
<div class="record-pages-list">{@jacl2db_admin~acl2.pages.links.label@} {pagelinks 'jacl2db_admin~users:index', array('grpid'=>$grpid, 'filter'=>$filter),  $usersCount, $offset, $listPageSize, 'idx' }</div>
{/if}



