<div class="jcommunity-box jcommunity-account-password">
<h1>Récupération d'un nouveau mot de passe</h1>

<p>Si vous avez oublié votre mot de passe, indiquez ci-dessous votre login
et l'adresse e-mail que vous avez indiqué dans votre profil, lors de votre inscription.</p>

{form $form,'jcommunity~password:send', array()}
<fieldset>
    <p>{ctrl_label 'pass_login'} : {ctrl_control 'pass_login'}</p>
    <p>{ctrl_label 'pass_email'} : {ctrl_control 'pass_email'}</p>
</fieldset>
<p>Un email vous sera envoyé avec une clé d'activation vous permettant de choisir un nouveau mot de passe.</p>
<p>{formsubmit}</p>
{/form}

<p><a href="{jurl 'jcommunity~login:index'}">Annuler et retourner au formulaire d'identification</a></p>
</div>
