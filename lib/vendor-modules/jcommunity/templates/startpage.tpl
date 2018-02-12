<div class="jcommunity-box">
    {ifuserconnected}
        <p>{$user->login|eschtml}, {@jcommunity~login.startpage.connected@}</p>

        <p>{@jcommunity~login.startpage.youcan@}</p>
        <ul>
            <li><a href="{jurl 'jcommunity~account:show', array('user'=>$user->login)}">{@jcommunity~login.startpage.account.view@}</a></li>
            <li><a href="{jurl 'jcommunity~login:out'}">{@jcommunity~login.startpage.logout@}</a></a></li>
        </ul>
    {else}
        <p>{@jcommunity~login.startpage.not.connected@}</p>

        <p>{@jcommunity~login.startpage.youcan@}</p>
        <ul>
            <li><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.startpage.login@}</a></li>
            {if $canRegister}<li><a href="{jurl 'jcommunity~registration:index'}">{@jcommunity~login.startpage.account.create@}</a></li>{/if}
            {if $canResetPassword}<li><a href="{jurl 'jcommunity~password_reset:index'}">{@jcommunity~login.startpage.password.reset@}</a></li>{/if}
        </ul>
    {/ifuserconnected}
</div>