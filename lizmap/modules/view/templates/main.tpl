{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/media.css'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{$title}</h1>
    <h2>{$subTitle}</h2>
  </div>

  <div id="headermenu" class="navbar navbar-fixed-top">
    <div id="auth" class="navbar-inner">
      <ul class="nav pull-right">
        {include 'lizmap~user_menu'}
      </ul>
    </div>
  </div>
</div>

<div id="content" class="container">
  <div id="search">
    <div class="input-prepend">
      <button id="toggle-search" class="btn" type="button" data-toggle="tooltip"
        title="{@view~default.header.search.toggleKeywordsTitle.title@}">T</button>
      <input id="search-project" class="span2" data-toggle="tooltip" title="{@view~default.header.search.input.title@}"
        placeholder="{@view~map.search.nominatim.placeholder@}" type="text">
    </div>
    <div id="search-project-keywords">
      <span id="search-project-keywords-selected"></span><span id="search-project-result"></span>
    </div>
  </div>
  {jmessage_bootstrap}
  {if $checkServerInformation}
  <div class="alert alert-block alert-error fade in" data-alert="alert">
    <a class="close" data-dismiss="alert" href="#">×</a>
    <p>{@view~default.server.information.error.admin@} <a href="{jurl 'admin~server_information:index'}">🔗</a></p>
  </div>
  {/if}
  {if isset($landing_page_content)}
  <div id="landingPageContent">
    {$landing_page_content}
  </div>
  {/if}
  {$MAIN}
  <footer class="footer">
    <p class="pull-right">
      <img src="{$j_themepath.'css/img/logo_footer.png'}" alt=""/>
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
