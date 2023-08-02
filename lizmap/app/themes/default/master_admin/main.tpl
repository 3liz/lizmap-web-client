{meta_html jquery_ui 'theme'}
{meta_html css $j_basepath.'assets/css/bootstrap.min.css'}
{meta_html css $j_basepath.'assets/css/bootstrap-responsive.min.css'}

{meta_html css $j_basepath.'assets/css/main.css'}
{meta_html css $j_basepath.'assets/css/admin.css'}
{meta_html css $j_basepath.'assets/css/media.css'}

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
    <div id="menu" class="span2">
      <div class="well sidebar-nav">
        <ul class="nav nav-list">
         {$MENU}
        </ul>
      </div>
    </div>
    <div class="span10">
      <div class="row-fluid">
        <div id="admin-message">{jmessage_bootstrap}</div>
       {$MAIN}
      </div>
    </div>
  </div>
  <footer class="footer">
    <p class="pull-right">
      <img src="{$j_themepath.'css/img/logo_footer.png'}" alt=""/>
    </p>
  </footer>
</div>
