<div class="jcommunity-box jcommunity-login">
<h1>Authentification</h1>
{ifuserconnected}

    {$login}, vous êtes connecté.
    <div class="loginbox-links">
        (<a href="{jurl 'jcommunity~login:out'}">déconnexion</a>,
        <a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">votre compte</a>)
    </div>

{else}

    {form $form, 'jcommunity~login:in'}
      <div> {ctrl_label 'auth_login'} {ctrl_control 'auth_login'} </div>
      <div> {ctrl_label 'auth_password'} {ctrl_control 'auth_password'} </div>
      {if $persistance_ok}
          <div> {ctrl_label 'auth_remember_me'} {ctrl_control 'auth_remember_me'} </div>
      {/if}
      <div>
          {if $url_return}
            <input type="hidden" name="auth_url_return" value="{$url_return|eschtml}" />
          {/if}
          {formsubmit}</div>
    {/form}

     <div class="loginbox-links">
        {if $canRegister}<a href="{jurl 'jcommunity~registration:index'}" class="loginbox-links-create">S'inscrire</a>{/if}
        {if $canResetPassword}{if $canRegister}<span class="loginbox-links-separator"> - </span>{/if}
            <a href="{jurl 'jcommunity~password:index'}" class="loginbox-links-resetpass">J'ai oublié mon mot de passe</a>{/if}
     </div>

{/ifuserconnected}
</div>