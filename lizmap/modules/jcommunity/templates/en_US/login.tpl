<div class="jcommunity-box jcommunity-login">
<h1>Authentication</h1>
{ifuserconnected}

    {$login}, you are connected.
    <div class="loginbox-links">
        (<a href="{jurl 'jcommunity~login:out'}">Logout</a>,
        <a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">Your account</a>)
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
        {if $canRegister}<a href="{jurl 'jcommunity~registration:index'}" class="loginbox-links-create">Create an account</a>{/if}
        {if $canResetPassword}{if $canRegister}<span class="loginbox-links-separator"> - </span>{/if}
        <a href="{jurl 'jcommunity~password:index'}" class="loginbox-links-resetpass">I forgot my password</a>{/if}
     </div>

{/ifuserconnected}
</div>