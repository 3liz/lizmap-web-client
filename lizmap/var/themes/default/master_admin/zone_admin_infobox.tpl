<ul class="nav pull-right">
  {foreach $infoboxitems  as $item}
    <li class="{$item->id}">
     {if $item->type == 'url'}
     <a href="{$item->content|eschtml}" title="{$item->label|eschtml}">
       {if $item->icon}<span class="icon"></span>{/if}
       <span class="text">{$item->label|eschtml}</span>
     </a>
     {else}
     <p class="navbar-text">{$item->content}</p>
     {/if}
    </li>
  {/foreach}
  <li class="user dropdown">
    <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="info-user">{*<strong>{@master_admin~gui.header.user@}</strong>*}
      <span class="icon"></span>
      <span id="info-user-login" class="text">{$user->login|eschtml}</span>
      <span class="caret"></span>
    </a>
    <ul class="dropdown-menu pull-right">
      {ifacl2 'auth.user.view'}
      <li><a href="{jurl 'jauthdb_admin~user:index', array('j_user_login'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
      {/ifacl2}
      <li><a href="{jurl 'jauth~login:out'}" id="info-user-logout">{@master_admin~gui.header.disconnect@}</a></li>
    </ul>
  </li>
</ul>
