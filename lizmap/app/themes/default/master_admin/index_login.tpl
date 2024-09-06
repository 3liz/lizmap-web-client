{meta_html assets 'bootstrap'}

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
    <h1>{$page_title|eschtml}</h1>
  </div>

  <div id="headermenu" class="navbar navbar-expand position-absolute bottom-0">
    <div id="auth" class="container-fluid justify-content-end">
      <ul class="navbar-nav">
        <li class="home nav-item">
          <a class="nav-link" href="{jurl 'view~default:index'}" data-bs-toggle="tooltip" data-bs-title="{@view~default.home.title@}" data-placement="bottom">
            <span class="icon"></span>
            <span class="text"><b>{@view~default.home.title@}</b></span>
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
