{meta_html jquery_ui 'default'}
{meta_html css $j_basepath.'assets/css/bootstrap.min.css'}
{meta_html css $j_basepath.'assets/css/bootstrap-responsive.min.css'}

{meta_html css $j_basepath.'assets/css/main.css'}
{meta_html css $j_basepath.'assets/css/admin.css'}
{meta_html css $j_basepath.'assets/css/media.css'}

{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/admin.css'}
{meta_html csstheme 'css/media.css'}

{meta_html js $j_basepath.'assets/js/bootstrap.min.js'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{@jcommunity~login.login.title@}</h1>
  </div>

  <div id="headermenu" class="navbar navbar-fixed-top">
    <div id="auth" class="navbar-inner">
      <ul class="nav pull-right">
        <li class="home">
          <a href="{jurl 'view~default:index'}" rel="tooltip" data-original-title="{@view~default.repository.list.title@}" data-placement="bottom" href="#">
            <span class="icon"></span>
            <span class="text"><b>{@view~default.repository.list.title@}</b></span>
          </a>
        </li>
    </div>
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
      <img src="{$j_themepath.'css/img/logo_footer.png'}" alt=""/>
    </p>
  </footer>
</div>
