{if $personalview}
<h1>{@jauthdb_admin~user.title.password@}</h1>
{else}
<h1>{@jauthdb_admin~crud.title.password@} {$id}</h1>
{/if}
{form $form, 'jauthdb_admin~password:update', array('j_user_login'=>$id), 'htmlbootstrap', $formOptions}
	<fieldset><legend>{@jauthdb_admin~crud.form.new.password@}</legend>
    {formcontrols}
	<p>{ctrl_label}
        {ctrl_control}
	{ifctrl 'pwd'}{if $randomPwd}({@jauthdb_admin~crud.form.random.password@} {$randomPwd}){/if}{/ifctrl}
	</p>
    {/formcontrols}

	{formsubmit}
	</fieldset>
{/form}

<p><a href="{jurl $viewaction, array('j_user_login'=>$id)}" class="crud-link">{if $personalview}{@jauthdb_admin~crud.link.return.to.view@}{else}{@jauthdb_admin~user.link.return.to.view@}{/if}</a>.</p>
