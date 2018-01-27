<div class="jcommunity-box jcommunity-account">
<h1>Activation de votre compte</h1>

<p>Avant de pouvoir vous identifier sur le site, vous devez activer votre compte.
Pour cela, <strong>un email vous a été envoyé</strong>, contenant une clé (un mot avec des chiffres et des lettres).</p>

<p>Pour activer votre compte, indiquez la clé ci dessous, et choisissez un mot de passe.</p>

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
<p><a href="{jurl 'jcommunity~login:index'}">Annuler et retourner au formulaire d'identification</a></p>
</div>