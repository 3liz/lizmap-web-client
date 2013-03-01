{meta_html csstheme 'css/main.css'}
{meta_html csstheme 'css/view.css'}
{meta_html csstheme 'css/media.css'}

{foreach $repositories as $r}
<h2>{$r['title']}</h2>
<ul class="thumbnails">
  {foreach $r['projects'] as $p}
  <li class="span3">
    <div class="thumbnail">
      <div class="liz-project">
        <img src="{jurl 'view~media:illustration', array("repository"=>$p->getData('repository'),"project"=>$p->getData('id'))}" alt="project image" class="img-polaroid liz-project-img">
        <p class="liz-project-desc" style="display:none;">
          <strong>{$p->getData('title')}</strong>
          <br/>
          <br/><strong>{@default.project.abstract.label@}</strong>&nbsp;: {$p->getData('abstract')}
          <br/><strong>{@default.project.projection.label@}</strong>&nbsp;: {$p->getData('proj')}
          <br/><strong>{@default.project.bbox.label@}</strong>&nbsp;: {$p->getData('bbox')}
        </p>
      </div>
      <h5>{$p->getData('title')}</h5>
      <p>
        <a class="btn liz-project-view" href="{jurl 'view~map:index', array("repository"=>$p->getData('repository'),"project"=>$p->getData('id'))}">{@default.project.open.map@}</a>
      </p>
    </div>
  </li>
  {/foreach}
</ul>
{/foreach}
