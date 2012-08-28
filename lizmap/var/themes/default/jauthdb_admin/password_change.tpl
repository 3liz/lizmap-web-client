{if $personalview}
<h1>{@jauthdb_admin~user.title.password@}</h1>
{else}
<h1>{@jauthdb_admin~crud.title.password@} {$id}</h1>
{/if}
<script>
//<![CDATA[
{literal}
function verifpass() {
	var pwd = document.getElementById('pwd').value;
	var pwd2 = document.getElementById('pwd_confirm').value;
	if ( pwd == '' || pwd != pwd2) {
{/literal}
		alert("{@jauthdb_admin~crud.message.bad.password@}");
		return false;
{literal}
	}
	else return true;
{/literal}
}
//]]>
</script>
<form action="{formurl 'password:update', array('j_user_login'=>$id)}" class="form-horizontal" method="post"
onsubmit="return verifpass()">
	<fieldset><legend>{@jauthdb_admin~crud.form.new.password@}</legend>
	{formurlparam 'password:update', array('j_user_login'=>$id)}
	
	<div class="control-group">
  <label class="control-label" for="pwd">{@jauthdb_admin~crud.form.password@}</label>
  <div class="controls">
	<input type="password" id="pwd" name="pwd" />
	<span class="help-block">({@jauthdb_admin~crud.form.random.password@} {$randomPwd})</span>
  </div>
	</div>

	<div class="control-group">
  <label class="control-label" for="pwd_confirm">{@jauthdb_admin~crud.form.password.confirm@}</label>
  <div class="controls">
	<input type="password" id="pwd_confirm" name="pwd_confirm" />
  </div>
	</div>
	
	<div class="form-actions">
	<input type="submit" value="{@jauthdb_admin~crud.form.submit@}" class="btn"/>
	</div>
	</fieldset>
</form>

<p><a href="{jurl $viewaction, array('j_user_login'=>$id)}" class="crud-link btn">{if $personalview}{@jauthdb_admin~crud.link.return.to.view@}{else}{@jauthdb_admin~user.link.return.to.view@}{/if}</a></p>
