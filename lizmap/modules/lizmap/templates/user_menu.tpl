{hook 'LizTopMenuHtmlItems'}
{ifuserconnected}
    <li class="user dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="info-user">
            <span class="icon"></span>
            <span class="text">
                <span id="info-user-login" title="{$user->firstname} {$user->lastname}">{$user->login|eschtml}</span>
                <span style="display:none" id="info-user-firstname">{$user->firstname}</span>
                <span style="display:none" id="info-user-lastname">{$user->lastname}</span>
            </span>
            <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right">
            {ifacl2 'auth.user.view'}
                <li><a href="{jurl 'jcommunity~account:show', array('user'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
            {/ifacl2}
            {hook 'LizAccountMenuHtmlItems'}
            <li><a href="{jurl 'jcommunity~login:out'}?auth_url_return={jurl 'view~default:index'}">{@view~default.header.disconnect@}</a></li>
        </ul>
    </li>
{else}
    <li class="login">
        <a href="{jurl 'jcommunity~login:index', array('auth_url_return'=>$auth_url_return)}">
            <span class="icon"></span>
            <span class="text">{@view~default.header.connect@}</span>
        </a>
    </li>
    {if isset($allowUserAccountRequests) and $allowUserAccountRequests == '1'}
        <li class="registered">
            <a href="{jurl 'jcommunity~registration:index'}">
                <span class="icon"></span>
                <span class="text">{@view~default.header.createAccount@}</span>
            </a>
        </li>
    {/if}
{/ifuserconnected}
