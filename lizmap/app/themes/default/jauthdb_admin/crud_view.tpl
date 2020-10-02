<h1>{@jauthdb_admin~crud.title.view@} {$id}</h1>
{if count($otherInfo)}
<h2>{@jauthdb_admin~crud.view.primaryinfo@}</h2>
{/if}

{formdatafull_bootstrap $form}

<ul class="crud-links-list inline">
    {if $canUpdate}<li><a href="{jurl 'jauthdb_admin~default:preupdate', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~crud.link.edit.record@}</a></li>{/if}
    {if $canChangePass}<li><a href="{jurl 'jauthdb_admin~password:index', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~crud.link.change.password@}</a></li>{/if}
    {if $canDelete}<li><a href="{jurl 'jauthdb_admin~default:confirmdelete', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~crud.link.delete.record@}</a></li>{/if}
    {foreach $otherLinks as $link}
        <li><a href="{$link['url']}" class="crud-link btn">{$link['label']}</a></li>
    {/foreach}
</ul>

{if count($otherInfo)}
<h2>{@jauthdb_admin~crud.view.otherinfo@}</h2>

{foreach $otherInfo as $info}
 {$info}
{/foreach}

{/if}

<hr />
<p><a href="{jurl 'jauthdb_admin~default:index'}" class="crud-link btn">{@jauthdb_admin~crud.link.return.to.list@}</a></p>


