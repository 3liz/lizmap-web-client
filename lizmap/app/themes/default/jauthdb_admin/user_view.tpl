<h1>{@jauthdb_admin~user.title.view@}</h1>
{if count($otherInfo)}
<h2>{@jauthdb_admin~user.view.primaryinfo@}</h2>
{/if}

{formdatafull_bootstrap $form}

<ul class="crud-links-list unstyled">
    {if $canUpdate}<li><a href="{jurl 'jauthdb_admin~user:preupdate', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~user.link.edit.record@}</a></li>{/if}
    {if $canChangePass}<li><a href="{jurl 'jauthdb_admin~password:index', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~user.link.change.password@}</a></li>{/if}
</ul>

{if count($otherInfo)}
<h2>{@jauthdb_admin~user.view.otherinfo@}</h2>

{foreach $otherInfo as $info}
 {$info}
{/foreach}

{/if}

