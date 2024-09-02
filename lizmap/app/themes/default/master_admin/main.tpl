{meta_html jquery_ui 'theme'}
{meta_html css $j_basepath.'assets/css/bootstrap.min.css'}

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
  <div id="headermenu" class="navbar navbar-expand position-absolute bottom-0">
   <div id="auth" class="container-fluid justify-content-end">{$INFOBOX}</div>
  </div>
</div>

<div id="content" class="container-fluid">
  <div class="row">
    <div id="menu" class="col-sm-2">
      <div class="sidebar-nav">
        <ul class="list-group">
         {$MENU}
        </ul>
      </div>
    </div>
    <div class="col-sm-10">
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
