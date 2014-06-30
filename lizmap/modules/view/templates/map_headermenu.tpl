<div id="auth" class="navbar-inner">
  <div class="pull-right">
    {if $externalSearch != ''}
    <form id="nominatim-search" class="navbar-search pull-left dropdown">
      <input id="search-query" type="text" class="search-query" placeholder="{@view~map.search.nominatim.placeholder@}"></input>
      <span class="search-icon">
        <button class="icon nav-search" type="submit" tabindex="-1">
          <span>{@view~map.search.nominatim.button@}</span>
        </button>
      </span>
      <div class="dropdown-menu pull-right">
        <div class="dropdown-caret">
          <div class="caret-outer"></div>
          <div class="caret-inner"></div>
        </div>
        <div class="dropdown-inner">
          <span class="close">×</span>
          <ul class="items"></ul>
        </div>
      </div>
    </form>
    {/if}
    <ul class="nav">
      <li class="home">
        <a href="{jurl 'view~default:index'}" rel="tooltip" data-original-title="{@view~default.repository.list.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      <li class="map">
        <a id="toggleLegend" rel="tooltip" data-original-title="{@view~map.map.only@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
        <span id="toggleLegendOn" value="{@view~map.legend@}"/>
        <span id="toggleMapOn" value="{@view~map.map@}"/>
        <span id="toggleLegendMapOn" value="{@view~map.legend.map@}"/>
        <span id="toggleMapOnlyOn" value="{@view~map.map.only@}"/>
      </li>
      {if $locate}
      <li class="locate">
        <a id="toggleLocate" rel="tooltip" data-original-title="{@view~map.locatemenu.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      <li class="information">
        <a id="displayMetadata" rel="tooltip" data-original-title="{@view~map.metadata.link.label@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      {if $print}
      <li class="print dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" id="togglePrint" rel="tooltip" data-original-title="{@view~map.print.navbar.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
          <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right">
        </ul>
      </li>
      {/if}
      {if $edition}
      <li class="edition dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="edition" data-original-title="{@view~edition.navbar.title@}" data-placement="bottom" rel="tooltip">
          <span class="icon"></span>
          <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right">
        </ul>
      </li>
      {/if}
      {if $measure}
      <li class="measure dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="measure" data-original-title="{@view~map.measure.navbar.title@}" data-placement="bottom" rel="tooltip">
          <span class="icon"></span>
          <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right">
          <li><a id="measure-length" href="#">{@view~map.measure.navbar.title.length@}</a></li>
          <li><a id="measure-area" href="#">{@view~map.measure.navbar.title.area@}</a></li>
          <li><a id="measure-perimeter" href="#">{@view~map.measure.navbar.title.perimeter@}</a></li>
        </ul>
      </li>
      {/if}
      {if $geolocation}
      <li class="geolocate">
        <a id="toggleGeolocate" rel="tooltip" data-original-title="{@view~map.geolocate.navbar.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      {if $timemanager}
      <li class="timemanager">
        <a id="toggleTimemanager" rel="tooltip" data-original-title="{@view~map.timemanager.navbar.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      {if $attributeLayers}
      <li class="attributeLayers">
        <a id="toggleAttributeLayers" rel="tooltip" data-original-title="{@view~map.attributeLayers.navbar.title@}" data-placement="bottom" href="#">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      {if $isConnected}
      <li class="user dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="#" id="user-info">
          <span class="icon"></span>
          <span class="text"><b id="info-user-login">{$user->login|eschtml}</b></span>
          <span class="caret"></span>
        </a>
        <ul class="dropdown-menu pull-right">
          {ifacl2 'auth.user.view'}
          <li><a href="{jurl 'jauthdb_admin~user:index', array('j_user_login'=>$user->login)}">{@master_admin~gui.header.your.account@}</a></li>
          {/ifacl2}
          <li><a href="{jurl 'jauth~login:out'}?auth_url_return={jurl 'view~default:index'}">{@view~default.header.disconnect@}</a></li>
        </ul>
      </li>
      {else}
      <li class="login">
        <a href="{jurl 'jauth~login:form', array('auth_url_return'=>$auth_url_return)}">
          <span class="icon"></span>
          <span class="text"><b>{@view~default.header.connect@}</b></span>
        </a>
      </li>
      {/if}
    </ul>
  </div>
</div>
