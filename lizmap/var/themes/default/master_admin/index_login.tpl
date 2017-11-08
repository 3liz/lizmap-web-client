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
    <h1>{@auth.titlePage.login@}</h1>
  </div>
</div>
<div id="content" class="container">
  <div class="row">
    <div>
       {$MAIN}
    </div>
  </div>
  <footer class="footer">
    <p class="pull-right">
      {image $j_themepath.'css/img/logo_footer.png'}
    </p>
  </footer>
</div>
