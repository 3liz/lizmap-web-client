<h1>{@jauthdb_admin~user.title.view@}</h1>
<div class="container">
{if count($otherInfo)}
<h2>{@jauthdb_admin~user.view.primaryinfo@}</h2>
{/if}

{formdatafull_bootstrap $form, 'htmlbootstrap', $formOptions}

<div class="crud-links-list form-actions">
    {if $canUpdate}
    <a href="{jurl 'jauthdb_admin~user:preupdate', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~user.link.edit.record@}</a>
    {/if}
    {if $canChangePass}
    <a href="{jurl 'jauthdb_admin~password:index', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~user.link.change.password@}</a>
    {/if}
</div>

{if count($otherInfo)}
<h2>{@jauthdb_admin~user.view.otherinfo@}</h2>

{foreach $otherInfo as $info}
 {$info}
{/foreach}

{/if}
</div>
