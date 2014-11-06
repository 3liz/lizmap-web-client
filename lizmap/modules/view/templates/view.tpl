{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/view.css'}
{meta_html csstheme 'css/media.css'}

<div class="project-list">
    <div class="row-fluid">
        <div class="span6 offset3">
        {assign $idm = 0}
        {foreach $mapitems as $mi}
            {if $mi->type == 'rep'}
            <h2>{$mi->title}</h2>
            <ul class="media-list">
            {foreach $mi->childItems as $p}
                {assign $idm = $idm + 1}
                <li class="media">
                    <a class="pull-left" href="{$p->url}">
                        <img class="media-object" src="{$p->img}" alt="project image" style="width:125px; height:125px;">
                    </a>
                    <div class="media-body">
                        <h4 class="media-heading">{$p->title}</h4>
                        <b>{@default.project.abstract.label@}</b>&nbsp;: <span class="abstract">{$p->abstract|truncate:100}</span>
                        <br/>
                        <b>{@default.project.projection.label@}</b>&nbsp;: <span class="proj">{$p->proj}</span>
                        <br/>
                        <b>{@default.project.bbox.label@}</b>&nbsp;: <span class="bbox">{$p->bbox}</span>
                        {if $p->wmsGetCapabilitiesUrl}
                        <b>{@view~map.metadata.properties.wmsGetCapabilitiesUrl@}</b>&nbsp;:
                        <span><a href="{$p->wmsGetCapabilitiesUrl}" target="_blank">WMS Url</a></span>
                        {/if}
                    <div>
                </li>
            {/foreach}
            </ul>
            {/if}
        {/foreach}
        </div>
    </div>
</div>
