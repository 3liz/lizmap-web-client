<h1>{@jauthdb_admin~crud.title.delete@} {$id}</h1>
<form action="{formurl 'default:delete', array('j_user_login'=>$id)}" method="post">
	<fieldset><legend>{@jauthdb_admin~crud.confirmation@}</legend>
	{formurlparam 'default:delete', array('j_user_login'=>$id)}
	<div class="control-group">
	{@jauthdb_admin~crud.confirm.deletion@}
	</div>

	<div class="control-group">
	<label class="control-label" for="pwd_confirm">{@jauthdb_admin~crud.confirm.password@}</label>
  <div class="controls">
	<input type="password" id="pwd_confirm" name="pwd_confirm" />
  </div>
	</div>
	
	<div class="form-actions">
	<input type="submit" value="{@jauthdb_admin~crud.confirm@}" class="btn"/>
	</div>
	</fieldset>
</form>

<p><a href="{jurl 'default:view', array('j_user_login'=>$id)}" class="crud-link btn">{@jauthdb_admin~crud.link.return.to.view@}</a></p>




