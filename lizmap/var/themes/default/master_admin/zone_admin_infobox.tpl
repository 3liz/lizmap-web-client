<ul class="nav pull-right">
  {foreach $infoboxitems  as $item}
    <li>
     {if $item->icon}<i style="background-image:url({$item->icon});"></i>{/if}
     {if $item->type == 'url'}<a href="{$item->content|eschtml}">{$item->label|eschtml}</a>
     {else}<p class="navbar-text">{$item->content}</p>{/if}
    </li>
  {/foreach}
  <li class="dropdown">
    <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="info-user">{*<strong>{@master_admin~gui.header.user@}</strong>*}
     <b id="info-user-login">{$user->login|eschtml}</b>
     <b class="caret"></b>
    </a>
    <ul class="dropdown-menu pull-right">
      {ifacl2 'auth.user.view'}
      <li><a href="{jurl 'jauthdb_admin~user:index', array('j_user_login'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
      {/ifacl2}
      <li><a href="{jurl 'jauth~login:out'}" id="info-user-logout">{@master_admin~gui.header.disconnect@}</a></li>
    </ul>
  </li>
</ul>
