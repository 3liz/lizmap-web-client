{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/media.css'}

<div id="header">
  <div id="logo">
  </div>
  <div id="title">
    <h1>{$title}</h1>
    <h2>{$subTitle}</h2>
  </div>

  <div id="headermenu" class="navbar navbar-expand position-absolute bottom-0">
    <div id="auth" class="container-fluid justify-content-end">
      <ul class="navbar-nav">
        {if $showHomeLink}
        <li class="home nav-item">
          <a class="nav-link" href="{jurl 'view~default:index'}" data-bs-toggle="tooltip" data-bs-title="{@view~default.home.title@}" data-placement="bottom">
            <span class="icon"></span>
            <span class="text"><b>{@view~default.home.title@}</b></span>
          </a>
        </li>
        {/if}
        {include 'lizmap~user_menu'}
      </ul>
    </div>
  </div>
</div>

<div id="content" class="container">
  <div id="search">
    <div class="input-group">
      <button id="toggle-search" class="btn" type="button" data-bs-toggle="tooltip"
        data-bs-title="{@view~default.header.search.toggleKeywordsTitle.title@}">T</button>
      <input id="search-project" class="form-control" data-bs-toggle="tooltip" data-bs-title="{@view~default.header.search.input.title@}"
        placeholder="{@view~map.search.nominatim.placeholder@}" type="text">
    </div>
    <div id="search-project-keywords">
      <span id="search-project-keywords-selected"></span><span id="search-project-result"></span>
    </div>
  </div>
  {jmessage_bootstrap}
  {if $checkServerInformation}
  <div class="alert alert-danger alert-dismissible fade show" role="alert">
      <p>{@view~default.server.information.error.admin@} <a href="{jurl 'admin~server_information:index'}">🔗</a></p>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
  {/if}
  {if isset($landing_page_content)}
  <div id="landingPageContent">
    {$landing_page_content}
  </div>
  {/if}
  {$MAIN}
    {if isset($landing_page_content_bottom)}
        <div id="landingPageContentBottom">
            {$landing_page_content_bottom}
        </div>
    {/if}
  <footer class="footer">
    <p class="pull-right">
      <img src="{$j_themepath.'css/img/logo_footer.png'}" alt=""/>
    </p>
  </footer>
</div>

{if $googleTag && $googleTag != ''}
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id={$googleTag}"></script>
<script>
  {literal}
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  {/literal}
  gtag('config', '{$googleTag}');
</script>
{/if}
