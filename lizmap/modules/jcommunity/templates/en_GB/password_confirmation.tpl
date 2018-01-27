<div class="jcommunity-box jcommunity-account-password">
<h1>Activation of your new password</h1>

<p><strong>An email has been sent to you</strong> which contains a key.
In order to confirm the password change. you should indicate the key in the following form,
and give a new password.</p>

{form $form,'jcommunity~password:confirm', array()}
<fieldset>
    <legend>Activation</legend>
    <ul>
    {formcontrols}
    <li>{ctrl_label} : {ctrl_control}</li>
    {/formcontrols}
    </ul>
</fieldset>
<p>{formsubmit}</p>
{/form}
<p><a href="{jurl 'jcommunity~login:index'}">Cancel and return to the login form</a></p>
</div>