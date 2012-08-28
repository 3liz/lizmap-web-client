{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.groups.title@}</h1>

{ifacl2 'acl.group.modify'}

<p><a href="{jurl 'jacl2db_admin~groups:rights'}">{@jacl2db_admin~acl2.groups.change.rights.link@}</a></p>

<form action="{formurl 'jacl2db_admin~groups:setdefault'}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.groups.new.users.title@}</legend>
{formurlparam 'jacl2db_admin~groups:setdefault'}
    {foreach $groups as $group}
       <label><input type="checkbox" name="groups[]" value="{$group->id_aclgrp}" {if $group->grouptype > 0}checked="checked"{/if}/> {$group->name}</label>
    {/foreach}
    <br />
    <input type="submit" value="{@jacl2db_admin~acl2.setdefault.button@}" />
</fieldset>
</form>

<form action="{formurl 'jacl2db_admin~groups:changename'}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.change.name.title@}</legend>
{formurlparam 'jacl2db_admin~groups:changename'}
    <select name="group_id">
    {foreach $groups as $group}
        {if  $group->id_aclgrp != '__anonymous'}<option value="{$group->id_aclgrp}">{$group->name}</option>{/if}
    {/foreach}
     </select>

    <label for="newname">{@jacl2db_admin~acl2.new.name.label@}</label> <input id="newname" name="newname" />
    <input type="submit" value="{@jacl2db_admin~acl2.rename.button@}" />
</fieldset>
</form>
{/ifacl2}

{ifacl2 'acl.group.create'}
<form action="{formurl 'jacl2db_admin~groups:newgroup'}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.create.group@}</legend>
{formurlparam 'jacl2db_admin~groups:newgroup'}
<label for="newgroup">{@jacl2db_admin~acl2.group.name.label@}</label> <input id="newgroup" name="newgroup" />
<label for="newgroupid">{@jacl2db_admin~acl2.group.name.id@}</label> <input id="newgroupid" name="newgroupid" />
<input type="submit" value="{@jacl2db_admin~acl2.save.button@}" />
</fieldset>
</form>
{/ifacl2}

{ifacl2 'acl.group.delete'}
<form action="{formurl 'jacl2db_admin~groups:delgroup'}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.delete.group@}</legend>
{formurlparam 'jacl2db_admin~groups:delgroup'}
    <select name="group_id">
    {foreach $groups as $group}
        {if  $group->id_aclgrp != '__anonymous'}<option value="{$group->id_aclgrp}">{$group->name}</option>{/if}
    {/foreach}
     </select>

    <input type="submit" value="{@jacl2db_admin~acl2.delete.button@}" />
</fieldset>
</form>
{/ifacl2}

