{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.groups.title@}</h1>

{ifacl2 'acl.group.modify'}

<p><a href="{jurl 'jacl2db_admin~groups:rights'}" class="btn">{@jacl2db_admin~acl2.groups.change.rights.link@}</a></p>

<form action="{formurl 'jacl2db_admin~groups:setdefault'}" method="post" class="form-inline">
<fieldset><legend>{@jacl2db_admin~acl2.groups.new.users.title@}</legend>
{formurlparam 'jacl2db_admin~groups:setdefault'}
    {foreach $groups as $group}
       <label class="checkbox inline"><input type="checkbox" name="groups[]" value="{$group->id_aclgrp}" {if $group->grouptype > 0}checked="checked"{/if}/> {$group->name} ({$group->id_aclgrp})</label>
    {/foreach}
  <div class="form-actions">
    <input type="submit" value="{@jacl2db_admin~acl2.setdefault.button@}" class="btn"/>
  </div>
</fieldset>
</form>

<form action="{formurl 'jacl2db_admin~groups:changename'}" method="post" class="form-horizontal">
<fieldset><legend>{@jacl2db_admin~acl2.change.name.title@}</legend>
{formurlparam 'jacl2db_admin~groups:changename'}
  <div class="control-group">
    <div class="controls">
    <select name="group_id">
    {foreach $groups as $group}
        {if  $group->id_aclgrp != '__anonymous'}<option value="{$group->id_aclgrp}">{$group->name}</option>{/if}
    {/foreach}
    </select>
    </div>
  </div>

  <div class="control-group">
    <label class="control-label" for="newname">{@jacl2db_admin~acl2.new.name.label@}</label>
    <div class="controls">
    <input id="newname" name="newname" />
    </div>
  </div>

  <div class="form-actions">
    <input type="submit" value="{@jacl2db_admin~acl2.rename.button@}" class="btn"/>
  </div>
</fieldset>
</form>
{/ifacl2}

{ifacl2 'acl.group.create'}
<form action="{formurl 'jacl2db_admin~groups:newgroup'}" method="post" class="form-horizontal">
<fieldset><legend>{@jacl2db_admin~acl2.create.group@}</legend>
{formurlparam 'jacl2db_admin~groups:newgroup'}
  <div class="control-group">
    <label class="control-label" for="newgroup">{@jacl2db_admin~acl2.group.name.label@}</label>
    <div class="controls">
    <input id="newgroup" name="newgroup" />
    </div>
  </div>
  <div class="control-group">
    <label class="control-label" for="newgroupid">{@jacl2db_admin~acl2.group.name.id@}</label>
    <div class="controls">
    <input id="newgroupid" name="newgroupid" />
    </div>
  </div>
  <div class="form-actions">
    <input type="submit" value="{@jacl2db_admin~acl2.save.button@}" class="btn"/>
  </div>
</fieldset>
</form>
{/ifacl2}

{ifacl2 'acl.group.delete'}
<form action="{formurl 'jacl2db_admin~groups:delgroup'}" method="post" class="form-horizontal">
<fieldset><legend>{@jacl2db_admin~acl2.delete.group@}</legend>
{formurlparam 'jacl2db_admin~groups:delgroup'}
  <div class="control-group">
    <div class="controls">
    <select name="group_id">
    {foreach $groups as $group}
        {if  $group->id_aclgrp != '__anonymous'}<option value="{$group->id_aclgrp}">{$group->name}</option>{/if}
    {/foreach}
     </select>
    </div>
  </div>

  <div class="form-actions">
    <input type="submit" value="{@jacl2db_admin~acl2.delete.button@}" class="btn"/>
  </div>
</fieldset>
</form>
{/ifacl2}

