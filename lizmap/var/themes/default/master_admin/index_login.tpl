{meta_html css $j_basepath.'css/jquery-ui-1.8.16.custom.css'}
{meta_html css $j_basepath.'css/bootstrap.css'}
{meta_html css $j_basepath.'css/bootstrap-responsive.css'}
{meta_html css $j_basepath.'css/main.css'}

{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/admin.css'}

{meta_html js $j_basepath.'js/jquery-1.8.0.min.js'}
{meta_html js $j_basepath.'js/jquery-ui-1.8.16.custom.min.js'}
{meta_html js $j_basepath.'js/bootstrap.js'}

<div id="header" class="navbar navbar-fixed-top">
  <div id="logo">
    <h1>{@auth.titlePage.login@}</h1>
  </div>
</div>
<div id="content" class="container">
  <div class="row">
    <div class="span6 offset3">
       {$MAIN}
    </div>
  </div>
  <footer class="footer">
    <p class="pull-right">
      {image 'css/img/logo_footer.png'}
    </p>
  </footer>
</div>
