<div class="jcommunity-box jcommunity-account-password">
<h1>Activation de votre nouveau mot de passe</h1>
{if $status == 1}
<p class="jcommunity-notice">Votre nouveau mot de passe est déjà activé. Vous pouvez vous identifier sur le site.</p>
{else}
{if $status == 2}
<p class="jcommunity-error">L'activation n'est pas possible : la periode de validité de la clé a expirée.
Si vous voulez récupérer un nouveau mot de passe, <a href="{jurl 'jcommunity~password:index'}">refaîte une demande</a>.</p>
<p>Vous pouvez toutefois vous identifier sur le site avec votre ancien mot de passe.</p>
{else}
<p class="jcommunity-notice">Votre nouveau mot de passe est maintenant activé et vous êtes maintenant identifié sur le site.</p>
{/if}
{/if}
</div>