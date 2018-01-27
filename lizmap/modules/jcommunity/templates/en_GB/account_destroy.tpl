<div class="jcommunity-box jcommunity-account-destroy">
<h1>Deleting your account</h1>

<form action="{formurl 'jcommunity~account:dodestroy', array('user'=>$username)}" method="get">
<fieldset><legend>Confirmation</legend>
{formurlparam 'jcommunity~account:dodestroy', array('user'=>$username)}

<p>Are you sure to delete your account ?</p>
<div><input type="submit" value="Yes" />
 <a href="{jurl 'jcommunity~account:show', array('user'=>$username)}">Cancel</a>
</div>
</fieldset>
</form>
</div>