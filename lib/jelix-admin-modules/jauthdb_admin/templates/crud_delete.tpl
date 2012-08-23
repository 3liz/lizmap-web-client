<h1>{@jauthdb_admin~crud.title.delete@} {$id}</h1>
<form action="{formurl 'default:delete', array('j_user_login'=>$id)}" method="post">
	<fieldset><legend>{@jauthdb_admin~crud.confirmation@}</legend>
	{formurlparam 'default:delete', array('j_user_login'=>$id)}
	<p>{@jauthdb_admin~crud.confirm.deletion@}</p>
	<p><label for="pwd_confirm">{@jauthdb_admin~crud.confirm.password@}</label>
	<input type="password" id="pwd_confirm" name="pwd_confirm" /></p>
	<input type="submit" value="{@jauthdb_admin~crud.confirm@}" />
	</fieldset>
</form>

<p><a href="{jurl 'default:view', array('j_user_login'=>$id)}" class="crud-link">{@jauthdb_admin~crud.link.return.to.view@}</a>.</p>




