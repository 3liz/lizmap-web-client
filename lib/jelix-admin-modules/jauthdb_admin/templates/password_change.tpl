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
<form action="{formurl 'password:update', array('j_user_login'=>$id)}" method="post"
onsubmit="return verifpass()">
	<fieldset><legend>{@jauthdb_admin~crud.form.new.password@}</legend>
	{formurlparam 'password:update', array('j_user_login'=>$id)}
	
	<p><label for="pwd">{@jauthdb_admin~crud.form.password@}</label>
	<input type="password" id="pwd" name="pwd" />
	({@jauthdb_admin~crud.form.random.password@} {$randomPwd})
	</p>

	<p><label for="pwd_confirm">{@jauthdb_admin~crud.form.password.confirm@}</label>
	<input type="password" id="pwd_confirm" name="pwd_confirm" /></p>
	
	<input type="submit" value="{@jauthdb_admin~crud.form.submit@}" />
	</fieldset>
</form>

<p><a href="{jurl $viewaction, array('j_user_login'=>$id)}" class="crud-link">{if $personalview}{@jauthdb_admin~crud.link.return.to.view@}{else}{@jauthdb_admin~user.link.return.to.view@}{/if}</a>.</p>
