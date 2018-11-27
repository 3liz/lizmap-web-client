<div id="auth_login_zone">
{if $failed}
<div class="alert alert-message alert-error fade in" data-alert="alert">
<a class="close" data-dismiss="alert" href="#">×</a>
<p>{@jauth~auth.failedToLogin@}</p>
</div>
{/if}

{if ! $isLogged}

<form action="{formurl 'jauth~login:in'}" method="post" id="loginForm" class="form-horizontal">
  <fieldset>
    <div class="control-group">
      <label class="control-label" for="login">{@jauth~auth.login@}</label>
      <div class="controls">
        <input type="text" name="login" id="login" size="9" value="{$login|eschtml}" />
      </div>
    </div>
    <div class="control-group">
      <label class="control-label" for="password">{@jauth~auth.password@}</label>
      <div class="controls">
        <input type="password" name="password" id="password" size="9" />
      </div>
    </div>
    {if $showRememberMe}
    <div class="control-group">
      <div class="controls">
        <label class="checkbox" for="rememberMe">
          <input type="checkbox" name="rememberMe" id="rememberMe" value="1" />
          {@jauth~auth.rememberMe@}
        </label>
      </div>
    </div>
    {/if}
    {formurlparam 'jauth~login:in'}
    {if !empty($auth_url_return)}
    <input type="hidden" name="auth_url_return" value="{$auth_url_return|eschtml}"/>
    {/if}
    <div class="form-actions">
      <input type="submit" value="{@jauth~auth.buttons.login@}" class="btn"/>
    </div>
    </fieldset>
  </form>
{else}
    <p>{$user->login} | <a href="{jurl 'jauth~login:out'}" >{@jauth~auth.buttons.logout@}</a></p>
{/if}
</div>
