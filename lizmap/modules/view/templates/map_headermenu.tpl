<div id="auth" class="container-fluid justify-content-end">
    <form id="nominatim-search" class="navbar-search dropdown" role="search">
        <button id="header-clear" class="btn-locate-clear btn btn-sm btn-link icon" type="button"></button>
        <input id="search-query" type="text" class="search-query"
            placeholder="{@view~map.search.nominatim.placeholder@}"></input>
        <span class="search-icon">
            <button class="icon" type="submit" tabindex="-1">
                <span>{@view~map.search.nominatim.button@}</span>
            </button>
        </span>
    </form>

    <ul class="navbar-nav">
        {include 'lizmap~user_menu'}
    </ul>
</div>
