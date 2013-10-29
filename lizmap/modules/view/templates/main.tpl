{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/media.css'}

<div id="header">
  <div id="logo">
    <h1>{$repositoryLabel}</h1>
  </div>
</div>

<div id="headermenu" class="navbar navbar-fixed-top">
  <div id="auth" class="navbar-inner">
    <ul class="nav pull-right">
      {if $isConnected}
      <li class="user dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          <span class="icon"></span>
          <b id="info-user-login" class="text">{$user->login|eschtml}</b>
          <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right">
          {ifacl2 'auth.user.view'}
          <li><a href="{jurl 'jauthdb_admin~user:index', array('j_user_login'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
          {/ifacl2}
          <li><a href="{jurl 'jauth~login:out'}?auth_url_return={jurl 'view~default:index'}">{@view~default.header.disconnect@}</a></li>
        </ul>
      </li>
      {else}
      <li class="login">
        <a href="{jurl 'jauth~login:form'}">
          <span class="icon"></span>
          <span class="text">{@view~default.header.connect@}</span>
        </a>
      </li>
        {if isset($allowUserAccountRequests)}
        <li class="login">
          <a href="{jurl 'view~user:createAccount'}">
            <span class="icon"></span>
            <span class="text">{@view~default.header.createAccount@}</span>
          </a>
        </li>
        {/if}
      {/if}
    </ul>
  </div>
</div>

<div id="content" class="container">
{jmessage_bootstrap}
{$MAIN}
<footer class="footer">
  <p class="pull-right">
    {image $j_themepath.'css/img/logo_footer.png'}
  </p>
</footer>
</div>
