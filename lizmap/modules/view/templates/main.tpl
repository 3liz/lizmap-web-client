{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/media.css'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{$repositoryLabel}</h1>
  </div>

  <div id="headermenu" class="navbar navbar-fixed-top">
    <div id="auth" class="navbar-inner">
      <ul class="nav pull-right">
        {if $isConnected}
        <li class="user dropdown">
          <a class="dropdown-toggle" data-toggle="dropdown" href="#">
            <span class="icon"></span>
            <span id="info-user-login" class="text">{$user->login|eschtml}</span>
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
          <a href="{jurl 'jauth~login:form', array('auth_url_return'=>$auth_url_return)}">
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

{if $googleAnalyticsID && $googleAnalyticsID != ''}
<!-- Google Analytics -->
<script type="text/javascript">
{literal}
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
{/literal}
ga('create', '{$googleAnalyticsID}', 'auto');
ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
{/if}
