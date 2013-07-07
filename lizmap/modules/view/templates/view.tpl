{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/view.css'}
{meta_html csstheme 'css/media.css'}

{foreach $mapitems as $mi}
{if $mi->type == 'rep'}
<h2>{$mi->title}</h2>
<ul class="thumbnails">
  {foreach $mi->childItems as $p}
  <li class="span3">
    <div class="thumbnail">
      <div class="liz-project">
        <img src="{$p->img}" alt="project image" class="img-polaroid liz-project-img">
        <p class="liz-project-desc" style="display:none;">
          <b>{$p->title}</b>
          <br/>
          <br/><b>{@default.project.abstract.label@}</b>&nbsp;: {$p->abstract|truncate:100}
          <br/>
          <br/><b>{@default.project.projection.label@}</b>&nbsp;: {$p->proj}
<!--          <br/><b>{@default.project.bbox.label@}</b>&nbsp;: {$p->bbox}-->
        </p>
      </div>
      <h5>{$p->title}</h5>
      <p>
        <a class="btn liz-project-view" href="{$p->url}">{@default.project.open.map@}</a>
      </p>
    </div>
  </li>
  {/foreach}
</ul>
{/if}
{/foreach}
