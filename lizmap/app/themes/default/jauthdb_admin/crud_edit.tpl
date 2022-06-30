{if $id === null}

<h1>{@jauthdb_admin~crud.title.create@}</h1>
{formfull $form, 'default:savecreate', array(), 'htmlbootstrap'}
    {if $randomPwd}
        <p>{@jauthdb_admin~crud.form.random.password@} {$randomPwd}</p>
    {/if}

    {foreach $otherInfo as $info}
        {$info}
    {/foreach}

    <p><a href="{jurl 'default:index'}" class="crud-link btn">{@jauthdb_admin~crud.link.return.to.list@}</a></p>

{else}

<h1>{@jauthdb_admin~crud.title.update@}</h1>

{formfull $form, 'default:saveupdate', array('j_user_login'=>$id), 'htmlbootstrap'}

    {foreach $otherInfo as $info}
        {$info}
    {/foreach}

    <p><a href="{jurl 'default:view', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~crud.link.return.to.view@}</a>.</p>
{/if}



