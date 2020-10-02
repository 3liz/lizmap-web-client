<div id="auth_login_zone">

    {ifuserconnected}
        <p>{$login|eschtml}, {@jcommunity~login.startpage.connected@}</p>
        <div class="loginbox-links">
            (<a href="{jurl 'jcommunity~login:out'}">{@jcommunity~login.logout@}</a>,
            <a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~login.login.account@}</a>)
        </div>
        {hook 'JauthLoginFormExtraAuthenticated'}
    {else}
    {hook 'JauthLoginFormExtraBefore'}
    {form $form, 'jcommunity~login:in', array(), 'htmlbootstrap'}
        <fieldset>
            <div class="control-group">
                {ctrl_label 'auth_login'}
                <div class="controls">
                    {ctrl_control 'auth_login'}
                </div>
            </div>
            <div class="control-group">
                {ctrl_label 'auth_password'}
                <div class="controls">
                    {ctrl_control 'auth_password'}
                </div>
            </div>
            {if $persistance_ok}
                <div class="control-group">
                    <div class="controls">
                        {ctrl_control 'auth_remember_me'} {ctrl_label 'auth_remember_me'}
                    </div>
                </div>
            {/if}
            {if $url_return}
                <input type="hidden" name="auth_url_return" value="{$url_return|eschtml}" />
            {/if}
            <div class="form-actions">{*formsubmit*}
                <input type="submit" value="{@jcommunity~login.startpage.login@}" class="btn"/>
            </div>
        </fieldset>
    {/form}

        <div class="loginbox-links">
            {if $canRegister}<a href="{jurl 'jcommunity~registration:index'}" class="loginbox-links-create">{@jcommunity~login.startpage.account.create@}</a>{/if}
            {if $canResetPassword}{if $canRegister}<span class="loginbox-links-separator"> - </span>{/if}
                <a href="{jurl 'jcommunity~password_reset:index'}" class="loginbox-links-resetpass">{@jcommunity~login.login.password.reset@}</a>{/if}
        </div>
    {hook 'JauthLoginFormExtraAfter'}
    {/ifuserconnected}
</div>
