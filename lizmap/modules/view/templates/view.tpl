{meta_html csstheme 'css/view.css'}

<ul class="thumbnails">
  {foreach $projects as $p}
  <li class="span3">
    <div class="thumbnail">
      <img src="{jurl 'view~media:illustration', array("repository"=>$p['repository'],"project"=>$p['id'])}" alt="project image" class="img-polaroid liz-project-img">
      <h5>{$p['title']}</h5>
      <p>
        <strong>{@default.project.abstract.label@}</strong>&nbsp;: {$p['abstract']}
        <br/><strong>{@default.project.projection.label@}</strong>&nbsp;: {$p['proj']}
        <br/><strong>{@default.project.bbox.label@}</strong>&nbsp;: {$p['bbox']}
      </p>
      <p>
        <a class="btn" href="{jurl 'view~map:index', array("repository"=>$p['repository'],"project"=>$p['id'])}">{@default.project.open.map@}</a>
      </p>
    </div>
  </li>
  {/foreach}
</ul>
