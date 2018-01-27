<div class="jcommunity-box jcommunity-account-destroy">
<h1>Suppression de votre compte</h1>

<form action="{formurl 'jcommunity~account:dodestroy', array('user'=>$username)}" method="get">
<fieldset><legend>Confirmation</legend>
{formurlparam 'jcommunity~account:dodestroy', array('user'=>$username)}

<p>Êtes-vous sûr de vouloir supprimer votre compte ?</p>
<div><input type="submit" value="Oui" />
 <a href="{jurl 'jcommunity~account:show', array('user'=>$username)}">Annuler</a>
</div>
</fieldset>
</form>
</div>