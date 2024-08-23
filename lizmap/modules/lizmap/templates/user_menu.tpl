{hook 'LizTopMenuHtmlItems'}

{ifuserconnected}
    <li class="nav-item dashboard-item">
        <a class="nav-link" href="{jurl 'master_admin~default:index'}">
            <span class="icon dashboard-icon"></span>
            <span class="text hidden-phone">{@view~default.header.menuitem.admin.label@}</span>
        </a>
    </li>
    <li class="nav-item user dropdown">
        <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" id="info-user">
            <span class="icon"></span>
            <span class="text hidden-phone">
                <span id="info-user-login" title="{$user->firstname} {$user->lastname}">{$user->login|eschtml}</span>
                <span class="hide" id="info-user-firstname">{$user->firstname}</span>
                <span class="hide" id="info-user-lastname">{$user->lastname}</span>
            </span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end">
            {ifacl2 'auth.user.view'}
                <li><a class="dropdown-item" href="{jurl 'jcommunity~account:show', array('user'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
            {/ifacl2}
            {hook 'LizAccountMenuHtmlItems'}
            <li><a class="dropdown-item" href="{jurl 'jcommunity~login:out'}?auth_url_return={jurl 'view~default:index'}">{@view~default.header.disconnect@}</a></li>
        </ul>
    </li>
{else}
    <li class="nav-item login">
        {if isset($auth_url_return)}
        <a class="nav-link" href="{jurl 'jcommunity~login:index', array('auth_url_return'=>$auth_url_return)}">
            {else}
        <a class="nav-link" href="{jurl 'jcommunity~login:index'}">
        {/if}
            <span class="icon"></span>
            <span class="text hidden-phone">{@view~default.header.connect@}</span>
        </a>
    </li>
    {if isset($allowUserAccountRequests) and $allowUserAccountRequests == '1'}
        <li class="nav-item registered">
            <a class="nav-link" href="{jurl 'jcommunity~registration:index'}">
                <span class="icon"></span>
                <span class="text hidden-phone">{@view~default.header.createAccount@}</span>
            </a>
        </li>
    {/if}
{/ifuserconnected}
