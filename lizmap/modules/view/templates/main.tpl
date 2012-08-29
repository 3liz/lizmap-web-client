{meta_html csstheme 'css/main.css'}

<div id="header" class="navbar navbar-fixed-top">
  <div id="logo">
    <h1>{$repositoryLabel}</h1>
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
