<h1>{@jauthdb_admin~crud.title.view@} {$id}</h1>
<div class="container">
{if count($otherInfo)}
<h2>{@jauthdb_admin~crud.view.primaryinfo@}</h2>
{/if}

{formdatafull_bootstrap $form, 'htmlbootstrap', $formOptions}

<div class="crud-links-list form-actions">
    {if $canUpdate}
        <a href="{jurl 'jauthdb_admin~default:preupdate', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~crud.link.edit.record@}</a>
    {/if}
    {if $canChangePass}
        <a href="{jurl 'jauthdb_admin~password:index', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~crud.link.change.password@}</a>
    {/if}
    {if $canDelete}
       <a href="{jurl 'jauthdb_admin~default:confirmdelete', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~crud.link.delete.record@}</a>
    {/if}
    {foreach $otherLinks as $link}
        <a href="{$link['url']}" class="crud-link btn btn-sm">{$link['label']}</a>
    {/foreach}
</div>

<hr />

{if count($otherInfo)}
<h2>{@jauthdb_admin~crud.view.otherinfo@}</h2>

{foreach $otherInfo as $info}
 {$info}
{/foreach}

{/if}

<hr />
<p><a href="{jurl 'jauthdb_admin~default:index'}" class="crud-link btn btn-sm">{@jauthdb_admin~crud.link.return.to.list@}</a></p>
</div>
