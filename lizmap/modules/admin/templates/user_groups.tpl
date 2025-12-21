<div class="row align-items-start justify-content-center">

<div class="col-auto">
{if count($usergroups)}
<table class="records-list table table-striped table-hover table-sm">
    <tr>
        <th>{@admin~user.acl.form.title@}</th>
        <th>&nbsp;</th>
    </tr>
    {foreach $usergroups as $group}
        <tr>
            <td>
                {$group->name}
            </td>
            <td>
               <a class="crud-link btn btn-sm" href="{jurl 'admin~acl:removegroup', array('user'=>$user, 'grpid'=>$group->id_aclgrp)}"
                  title="{@jacl2db_admin~acl2.remove.group.tooltip@}">{@admin~user.acl.form.remove.from.group@}</a>
            </td>
        </tr>
    {/foreach}
</table>
{else}
    <p>{@admin~user.acl.no.group@}</p>
{/if}
</div>

<div class="col-auto">
{if count($groups)}
<form action="{formurl 'admin~acl:addgroup', array('user'=>$user)}" method="post">
    {formurlparam}
    <div class="input-group">
        <label for="user-add-group" class="input-group-text">{@admin~user.acl.form.add.to.group@}</label>
        <select name="grpid" id="user-add-group" class="form-select form-select-sm">
            {foreach $groups as $group}
                <option value="{$group->id_aclgrp}">{$group->name}</option>
            {/foreach}
        </select>
        <input type="submit" class="btn btn-sm" value="{@admin~user.acl.form.add@}" />
    </div>
</form>
{/if}
</div>

</div>
