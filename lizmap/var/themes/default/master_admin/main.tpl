{meta_html css $j_basepath.'css/jquery-ui-1.8.23.custom.css'}
{meta_html css $j_basepath.'css/bootstrap.css'}
{meta_html css $j_basepath.'css/bootstrap-responsive.css'}

{meta_html css $j_basepath.'css/main.css'}
{meta_html css $j_basepath.'css/admin.css'}
{meta_html css $j_basepath.'css/media.css'}

{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/admin.css'}
{meta_html csstheme 'css/media.css'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{@admin~admin.header.admin@}</h1>
  </div>
  <div id="headermenu" class="navbar navbar-fixed-top">
   <div id="auth" class="navbar-inner">{$INFOBOX}</div>
  </div>
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
      {image $j_themepath.'css/img/logo_footer.png'}
    </p>
  </footer>
</div>
