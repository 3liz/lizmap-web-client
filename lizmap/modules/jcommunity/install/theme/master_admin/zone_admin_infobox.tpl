<ul>
        <li id="info-user">
            {*<strong>{@master_admin~gui.header.user@}</strong>*}
            <span id="info-user-login">{$user->login|eschtml}</span>
            {ifacl2 'auth.user.view'}
            | <a href="{jurl 'jauthdb_admin~user:index', array('j_user_login'=>$user->login)}">{@master_admin~gui.header.your.account@}</a>
            {/ifacl2}
            | <a href="{jurl 'jcommunity~login:out'}" id="info-user-logout">{@master_admin~gui.header.disconnect@}</a>
        </li>
        {foreach $infoboxitems  as $item}
            <li {if $item->icon} style="background-image:url({$item->icon});"{/if}>
                {if $item->type == 'url'}<a href="{$item->content|eschtml}">{$item->label|eschtml}</a>
                {else}{$item->content}{/if}
            </li>
        {/foreach}
</ul>