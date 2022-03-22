{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/view.css'}
{meta_html csstheme 'css/media.css'}

<span id="anchor-top-projects"></span>
{assign $idm = 0}
{foreach $mapitems as $mi}
{if $mi->type == 'rep'}
<h2 class="liz-repository-title">{$mi->title}</h2>
<ul class="liz-repository-project-list">
  {foreach $mi->childItems as $p}
  {assign $idm = $idm + 1}
  <li class="liz-repository-project-item">
    <a name="link-projet-{$idm}"></a>
    <div class="thumbnail">
      <div class="liz-project">
        <img width="250" height="250" loading="lazy" src="{$p->img}" alt="project image" class="liz-project-img">
        <p class="liz-project-desc" style="display:none;">
          <b class="title">{$p->title}</b>
          <br/>
          <br/><b>{@default.project.abstract.label@}</b>&nbsp;: <span class="abstract">{$p->abstract|strip_tags|truncate:100}</span>
          <br/>
          <br/><b>{@default.project.keywordList.label@}</b>&nbsp;: <span class="keywordList">{$p->keywordList}</span>
          <br/>
          <br/><b>{@default.project.projection.label@}</b>&nbsp;: <span class="proj">{$p->proj}</span>
          <br/><b>{@default.project.bbox.label@}</b>&nbsp;: <span class="bbox">{$p->bbox}</span>
        </p>
      </div>
      <h5 class="liz-project-title">{$p->title}</h5>
      <p>
        <a class="btn liz-project-view" href="{$p->url}{if $hide_header}&h=0{/if}">{@default.project.open.map@}</a>
        <a class="btn liz-project-show-desc" href="#link-projet-{$idm}" onclick="$('#liz-project-modal-{$idm}').modal('show'); return false;">{@default.project.open.map.metadata@}</a>
      </p>
    </div>

    <div id="liz-project-modal-{$idm}" class="modal fade hide" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-show="false" data-keyboard="false" data-backdrop="static">

      <div class="modal-header">
        <a class="close" data-dismiss="modal">×</a>
        <h3>{$p->title}</h3>
      </div>
      <div class="modal-body">
        <dl class="dl-horizontal">
          <dt>{@view~map.metadata.h2.illustration@}</dt>
          <dd><img src="{$p->img}" alt="project image" width="150" height="150"></dd>
          <dt>{@default.project.title.label@}</dt>
          <dd>{$p->title}&nbsp;</dd>
          <dt>{@default.project.abstract.label@}</dt>
          <dd>{$p->abstract|nl2br}&nbsp;</dd>
          <dt>{@default.project.projection.label@}</dt>
          <dd><span class="proj">{$p->proj}</span>&nbsp;</dd>
          <dt>{@default.project.bbox.label@}</dt>
          <dd><span class="bbox">{$p->bbox}</span></dd>
          {if $p->wmsGetCapabilitiesUrl}
          <dt>{@view~map.metadata.properties.wmsGetCapabilitiesUrl@}</dt>
          <dd><small><a href="{$p->wmsGetCapabilitiesUrl}" target="_blank">WMS Url</a></small></dd>
          <dd><small><a href="{$p->wmtsGetCapabilitiesUrl}" target="_blank">WMTS Url</a></small></dd>
          {/if}
        </dl>
      </div>
      <div class="modal-footer">
        <a class="btn liz-project-view" href="{$p->url}{if $hide_header}&h=0{/if}">{@default.project.open.map@}</a>
        <a href="#" class="btn" data-dismiss="modal">{@default.project.close.map.metadata@}</a>
      </div>
    </div>
  </li>
  {/foreach}
</ul>
{/if}
{/foreach}
