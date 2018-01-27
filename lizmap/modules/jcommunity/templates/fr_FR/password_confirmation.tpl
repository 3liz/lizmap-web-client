<div class="jcommunity-box jcommunity-account-password">
<h1>Activation de votre nouveau mot de passe</h1>

<p>Un mail vous a été envoyé, contenant une clé d'activation. Pour valider
le changement de mot de passe, indiquez la clé et un nouveau
mot de passe dans le formulaire suivant.</p>

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
</div>