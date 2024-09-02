{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/view.css'}
{meta_html csstheme 'css/media.css'}

<span id="anchor-top-projects"></span>
{assign $idm = 0}
{foreach $mapitems as $mi}
{if $mi->type == 'rep'}
<h2 class="liz-repository-title">{$mi->title}</h2>
<ul id="liz-repository-{$mi->id}" class="liz-repository-project-list" data-lizmap-repository="{$mi->id}">
  {foreach $mi->childItems as $p}
  {assign $idm = $idm + 1}
  <li class="liz-repository-project-item">
    <a name="link-projet-{$idm}"></a>
    <div class="thumbnail">
      <div id="liz-project-{$mi->id}-{$p->id}" class="liz-project"
        data-lizmap-repository="{$mi->id}"
        data-lizmap-project="{$p->id}"
        data-lizmap-bbox="{$p->bbox}"
        data-lizmap-proj="{$p->proj}">
        <a class="liz-project-view" href="{$p->url}{if $hide_header}&h=0{/if}">
          <img width="250" height="250" loading="lazy" src="{$p->img}" alt="project image" class="_liz-project-img img-fluid">
          <p class="liz-project-desc" >
            <b class="title">{$p->title}</b>
            <br/>
            <br/><b>{@default.project.abstract.label@}</b>&nbsp;: <span class="abstract">{$p->abstract|strip_tags|truncate:100}</span>
            <br/>
            <br/><b>{@default.project.keywordList.label@}</b>&nbsp;: <span class="keywordList">{$p->keywordList}</span>
            <br/>
            <br/><b>{@default.project.projection.label@}</b>&nbsp;: <span class="proj">{$p->proj}</span>
            <br/><b>{@default.project.bbox.label@}</b>&nbsp;: <span class="bbox">{$p->bbox}</span>
          </p>
        </a>
      </div>
      <h5 class="liz-project-title">{$p->title}</h5>
      <p>
        <a class="btn btn-sm liz-project-view" href="{$p->url}{if $hide_header}&h=0{/if}">{@default.project.open.map@}</a>
        <button type="button" class="btn btn-sm liz-project-show-desc" data-bs-toggle="modal" data-bs-target="#liz-project-modal-{$idm}" data-lizmap-modal="{$idm}">{@default.project.open.map.metadata@}</button>
      </p>
    </div>

    <div id="liz-project-modal-{$idm}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>{$p->title}</h3>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <dl class="row">
                        <div class="col text-end">
                            <dt>{@view~map.metadata.h2.illustration@}</dt>
                        </div>
                        <div class="col-8">
                            <dd><img src="{$p->img}" alt="project image" width="150" height="150"></dd>
                        </div>
                    </dl>
                    <dl class="row">
                        <div class="col text-end">
                            <dt>{@default.project.title.label@}</dt>
                        </div>
                        <div class="col-8">
                            <dd>{$p->title}&nbsp;</dd>
                        </div>
                    </dl>
                    <dl class="row">
                        <div class="col text-end">
                            <dt>{@default.project.abstract.label@}</dt>
                        </div>
                        <div class="col-8">
                            <dd>{$p->abstract|nl2br}&nbsp;</dd>
                        </div>
                    </dl>
                    <dl class="row">
                        <div class="col text-end">
                            <dt>{@default.project.projection.label@}</dt>
                        </div>
                        <div class="col-8">
                            <dd><span class="proj">{$p->proj}</span>&nbsp;</dd>
                        </div>
                    </dl>
                    <dl class="row">
                        <div class="col text-end">
                            <dt>{@default.project.bbox.label@}</dt>
                        </div>
                        <div class="col-8">
                            <dd><span class="bbox">{$p->bbox}</span></dd>
                        </div>
                    </dl>
                    {if $p->wmsGetCapabilitiesUrl}
                    <dl class="row">
                        <div class="col text-end">
                            <dt>{@view~map.metadata.properties.wmsGetCapabilitiesUrl@}</dt>
                        </div>
                        <div class="col-8">
                            <dd><small><a href="{$p->wmsGetCapabilitiesUrl}" target="_blank">WMS Url</a></small></dd>
                            <dd><small><a href="{$p->wmtsGetCapabilitiesUrl}" target="_blank">WMTS Url</a></small></dd>
                        </div>
                    </dl>
                    {/if}
                </div>
                <div class="modal-footer">
                    <a class="btn btn-sm liz-project-view" href="{$p->url}{if $hide_header}&h=0{/if}">{@default.project.open.map@}</a>
                    <button class="btn btn-sm" data-bs-dismiss="modal">{@default.project.close.map.metadata@}</button>
                </div>
            </div>
        </div>
    </div>
  </li>
  {/foreach}
</ul>
{/if}
{/foreach}
