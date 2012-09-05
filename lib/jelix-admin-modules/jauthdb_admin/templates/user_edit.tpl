
<h1>{@jauthdb_admin~user.title.update@}</h1>

{formfull $form, 'user:saveupdate', array('j_user_login'=>$id)}
<p><a href="{jurl 'user:index', array('j_user_login'=>$id)}" class="crud-link">{@jauthdb_admin~user.link.return.to.view@}</a>.</p>




