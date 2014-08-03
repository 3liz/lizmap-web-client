<div style="width:30px; height:30px; position:relative;">
    <ul class="nav nav-list">
      <li class="home">
        <a href="{jurl 'view~default:index'}" rel="tooltip" data-original-title="{@view~default.repository.list.title@}" data-placement="right">
          <span class="icon"></span>
        </a>
      </li>
      <li class="switcher nav-dock">
        <a id="button-switcher" rel="tooltip" data-original-title="{@view~map.layers@}" data-placement="right" href="#switcher">
          <span class="icon"></span>
        </a>
      </li>
      <li class="legend nav-dock">
        <a id="button-legend" rel="tooltip" data-original-title="{@view~map.legend@}" data-placement="right" href="#legend">
          <span class="icon"></span>
        </a>
      </li>
      {if $locate}
      <li class="locate nav-minidock">
        <a id="button-locate" rel="tooltip" data-original-title="{@view~map.locatemenu.title@}" data-placement="right" href="#locate">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      <li class="metadata nav-dock">
        <a id="displayMetadata" rel="tooltip" data-original-title="{@view~map.metadata.link.label@}" data-placement="right" href="#metadata">
          <span class="icon"></span>
        </a>
      </li>
      {if $print}
      <li class="print nav-minidock">
        <a id="button-print" href="#print" data-original-title="{@view~map.print.navbar.title@}" data-placement="right" rel="tooltip">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      {if $edition}
      <li class="edition nav-minidock">
        <a id="button-edition" href="#edition" data-original-title="{@view~edition.navbar.title@}" data-placement="right" rel="tooltip">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      {if $measure}
      <li class="measure nav-minidock">
        <a id="button-measure" href="#measure" data-original-title="{@view~map.measure.navbar.title@}" data-placement="right" rel="tooltip">
          <span class="icon"></span>
        </a>
      </li>
      {/if}
      {if $geolocation}
      <li class="geolocation nav-minidock">
        <a id="button-geolocation" rel="tooltip" data-original-title="{@view~map.geolocate.navbar.title@}" data-placement="right" href="#geolocation">
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
    </ul>
</div>
