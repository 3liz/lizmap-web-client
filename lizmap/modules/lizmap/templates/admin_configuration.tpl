{jmessage}
  <h1>{@lizmap~admin.configuration.h1@}</h1>

  <!--Services-->
  <div>
    <h2>{@lizmap~admin.configuration.services.label@}</h2>
    <ul>
      <li><b>{@lizmap~admin.configuration.services.wmsServerURL.label@}</b> : {$lizmapConfig->wmsServerURL}
      <li><b>{@lizmap~admin.configuration.services.cacheServerURL.label@}</b> : {$lizmapConfig->cacheServerURL}
      <li><b>{@lizmap~admin.configuration.services.defaultRepository.label@}</b> : {$lizmapConfig->defaultRepository}
    </ul>
    
    <!-- Modify -->
    <a class="btn" href="{jurl 'lizmap~admin:modifyServices'}">
      {@lizmap~admin.configuration.button.modify.service.label@}
    </a>
  </div>

  <!--Repositories-->
  <div>
  <h2>{@lizmap~admin.configuration.repository.label@}</h2>
  {foreach $lizmapConfig->repositoryList as $repo}
    <h3>{$repo}</h3>
    {if isset($lizmapConfig->lizmapConfigData['repository:'.$repo]) }
      {assign $section = 'repository:'.$repo}
      {assign $item = $lizmapConfig->lizmapConfigData[$section]}
      <ul>
      {foreach $item as $key=>$val}
        <li><b>{$key}</b> : {$val}
      {/foreach}
      </ul>

      <!-- Modify -->
      <a class="btn" href="{jurl 'lizmap~admin:modifySection', array('repository'=>$repo)}">{@lizmap~admin.configuration.button.modify.repository.label@}</a>
      <!-- Remove -->
      <a class="btn" href="{jurl 'lizmap~admin:removeSection', array('repository'=>$repo)}" onclick="return confirm('{@lizmap~admin.configuration.button.remove.repository.confirm.label@}')">{@lizmap~admin.configuration.button.remove.repository.label@}</a>
    {/if}
  {/foreach}    
  </div>

<!--Add a repository-->
<a class="btn" href="{jurl 'lizmap~admin:createSection'}">{@lizmap~admin.configuration.button.add.repository.label@}</a>

