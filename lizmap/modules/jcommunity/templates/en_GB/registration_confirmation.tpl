<div class="jcommunity-box jcommunity-account">
<h1>Activation of your account</h1>

<p>You must activate your account before to authenticate yourself on the web site.
<strong>An email has been sent to you</strong> which contains a key (a word with some characters and numbers),
to activate your account.</p>

<p>Please fill the following form with the key given in the email, and choose a password for your account.</p>

{form $form,'jcommunity~registration:confirm', array()}
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