<h3>{@admin~user.acl.form.title@}</h3>

{if count($usergroups)}
<table class="records-list table table-hover table-condensed">
    <tr>
        <th>Groupe</th>
        <th>&nbsp;</th>
    </tr>
    {foreach $usergroups as $group}
        <tr>
            <td>
                {$group->name}
            </td>
            <td>
               <a class="crud-link btn" href="{jurl 'admin~acl:removegroup', array('user'=>$user, 'grpid'=>$group->id_aclgrp)}"
                  title="{@jacl2db_admin~acl2.remove.group.tooltip@}">{@admin~user.acl.form.remove.from.group@}</a>
            </td>
        </tr>
    {/foreach}
</table>
{else}
    <p>{@admin~user.acl.no.group@}</p>
{/if}

{if count($groups)}
<form action="{formurl 'admin~acl:addgroup', array('user'=>$user)}" method="post">
    {formurlparam}
    <label for="user-add-group">{@admin~user.acl.form.add.to.group@}</label>
    <select name="grpid" id="user-add-group">
        {foreach $groups as $group}
            <option value="{$group->id_aclgrp}">{$group->name}</option>
        {/foreach}
    </select>
    <br/><input type="submit" value="{@admin~user.acl.form.add@}" />
</form>
{/if}
