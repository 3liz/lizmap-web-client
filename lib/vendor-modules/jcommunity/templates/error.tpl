<div class="jcommunity-box">
    <h1>{@jcommunity~login.access.title@}</h1>
    {if $error == 'no_access_wronguser'}
        <p class="jcommunity-error">{@jcommunity~login.access.forbidden.wrong.user@}</p>
        <p><a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~account.back.to.account@}</a></p>
    {elseif $error == 'no_access_auth'}
        <p class="jcommunity-error">{@jcommunity~login.access.forbidden.authenticated@}</p>
        <p><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.back.to.login@}</a></p>
    {elseif $error == 'no_access_badstatus'}
        <p class="jcommunity-error">{@jcommunity~login.access.forbidden.badstatus@}</p>
        {if $login}
            <p><a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~account.back.to.account@}</a></p>
        {else}
            <p><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.back.to.login@}</a></p>
        {/if}
    {elseif $error == 'not_available'}
        <p class="jcommunity-error">{@jcommunity~login.access.not.available@}</p>
        {if $login}
        <p><a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~account.back.to.account@}</a></p>
        {else}
        <p><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.back.to.login@}</a></p>
        {/if}
    {else}
        <p class="jcommunity-error">Error {$error}</p>
    {/if}
</div>
