<div id="login-status">
    {ifuserconnected}
    {$login}, {@jcommunity~login.startpage.connected@}
        (<a href="{jurl 'jcommunity~login:out'}">{@jcommunity~login.logout@}</a>,
        <a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~login.login.account@}</a>)
    {else}
    {@jcommunity~login.startpage.not.connected@}
    <a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.startpage.login@}</a>{if $canRegister},
    <a href="{jurl 'jcommunity~registration:index'}">{@jcommunity~login.startpage.account.create@}</a>{/if}{if $canResetPassword},
    <a href="{jurl 'jcommunity~password_reset:index'}">{@jcommunity~login.login.password.reset@}</a>{/if}
    {/ifuserconnected}
</div>
