{meta_html css $j_basepath.'css/jquery-ui-1.8.23.custom.css'}
{meta_html css $j_basepath.'css/bootstrap.css'}
{meta_html css $j_basepath.'css/bootstrap-responsive.css'}
{meta_html css $j_basepath.'css/main.css'}
{meta_html css $j_basepath.'css/admin.css'}

{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/admin.css'}

{meta_html js $j_basepath.'js/jquery-1.8.0.min.js'}
{meta_html js $j_basepath.'js/jquery-ui-1.8.23.custom.min.js'}
{meta_html js $j_basepath.'js/bootstrap.js'}

<div id="header" class="navbar navbar-fixed-top">
  <div id="logo">
    <h1>Admin</h1>
  </div>
  <div id="auth">{$INFOBOX}</div>
</div>
<div id="content" class="container-fluid">
  <div class="row-fluid">
    <div id="menu" class="span3">
      <div class="well sidebar-nav">
        <ul class="nav nav-list">
         {$MENU}
        </ul>
      </div>
    </div>
    <div class="span9">
      <div class="row-fluid">
        <div id="admin-message">{jmessage_bootstrap}</div>
       {$MAIN}
      </div>
    </div>
  </div>
  <footer class="footer">
    <p class="pull-right">
      {image 'css/img/logo_footer.png'}
    </p>
  </footer>
</div>
