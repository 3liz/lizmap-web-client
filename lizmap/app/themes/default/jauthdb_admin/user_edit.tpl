
<h1>{@jauthdb_admin~user.title.update@}</h1>

<div class="container">
{formfull $form, 'user:saveupdate', array('j_user_login'=>$id), 'htmlbootstrap', $formOptions}
<p><a href="{jurl 'user:index', array('j_user_login'=>$id)}" class="crud-link btn btn-sm">{@jauthdb_admin~user.link.return.to.view@}</a></p>
</div>
