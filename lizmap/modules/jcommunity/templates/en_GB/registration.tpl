<div class="jcommunity-box jcommunity-account">
<h1>Creating an account</h1>

<p>To access to the web site services, register yourself by filling the following form.</p>

{form $form,'jcommunity~registration:save', array()}
<fieldset>
    <legend>Informations</legend>
    <p>{ctrl_label 'reg_login'} : {ctrl_control 'reg_login'}</p>
    <p>{ctrl_label 'reg_email'} : {ctrl_control 'reg_email'}</p>
    <p>{ctrl_label 'reg_captcha'} : {ctrl_control 'reg_captcha'}</p>
</fieldset>
<p>An email will be sent to you with a link and a key to confirm your registration. After it, 
you could identified yourself on the site.</p>
<p>{formsubmit}</p>
{/form}
<p><a href="{jurl 'jcommunity~login:index'}">Cancel and return to the login form</a></p>
</div>
