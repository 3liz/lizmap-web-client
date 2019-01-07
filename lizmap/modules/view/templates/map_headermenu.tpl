<div id="auth" class="navbar-inner">
  <div class="pull-right">
    <form id="nominatim-search" class="navbar-search dropdown">
   <button id="header-clear" class="btn-locate-clear btn btn-mini btn-link icon" type="button"></button>
      <input id="search-query" type="text" class="search-query" placeholder="{@view~map.search.nominatim.placeholder@}"></input>
      <span class="search-icon">
        <button class="icon nav-search" type="submit" tabindex="-1">
          <span>{@view~map.search.nominatim.button@}</span>
        </button>
      </span>
    </form>

    <ul class="nav">
      {include 'lizmap~user_menu'}
    </ul>
  </div>
</div>
