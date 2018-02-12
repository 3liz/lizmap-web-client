<div class="jcommunity-box jcommunity-login">
    <h1>{@jcommunity~login.login.title@}</h1>

    {ifuserconnected}
        <p>{$login|eschtml}, {@jcommunity~login.startpage.connected@}</p>
        <div class="loginbox-links">
            (<a href="{jurl 'jcommunity~login:out'}">{@jcommunity~login.logout@}</a>,
            <a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~login.login.account@}</a>)
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
            {if $canRegister}<a href="{jurl 'jcommunity~registration:index'}" class="loginbox-links-create">{@jcommunity~login.startpage.account.create@}</a>{/if}
            {if $canResetPassword}{if $canRegister}<span class="loginbox-links-separator"> - </span>{/if}
            <a href="{jurl 'jcommunity~password_reset:index'}" class="loginbox-links-resetpass">{@jcommunity~login.login.password.reset@}</a>{/if}
        </div>

    {/ifuserconnected}
</div>