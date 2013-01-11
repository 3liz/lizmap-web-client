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
      <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#">
          <b id="info-user-login">{$user->login|eschtml}</b>
          <b class="caret"></b>
        </a>
        <ul class="dropdown-menu pull-right">
          {ifacl2 'auth.user.view'}
          <li><a href="{jurl 'jauthdb_admin~user:index', array('j_user_login'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
          {/ifacl2}
          <li><a href="{jurl 'jauth~login:out'}">{@view~default.header.disconnect@}</a></li>
        </ul>
      </li>
      {else}
      <li>
        <a href="{jurl 'jauth~login:form'}">{@view~default.header.connect@}</a>
      </li>
      {/if}
    </ul>
  </div>
</div>

<div id="content" class="container">
{jmessage_bootstrap}
{$MAIN}
<footer class="footer">
  <p class="pull-right">
    {image 'css/img/logo_footer.png'}
  </p>
</footer>
</div>
