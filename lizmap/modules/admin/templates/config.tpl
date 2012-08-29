{jmessage}
  <h1>{@admin~admin.configuration.h1@}</h1>

  <!--Services-->
  <div>
    <h2>{@admin~admin.configuration.services.label@}</h2>
    <dl>
      <dt>{@admin~admin.configuration.services.wmsServerURL.label@}</dt><dd>{$lizmapConfig->wmsServerURL}</dd>
      <dt>{@admin~admin.configuration.services.cacheServerURL.label@}</dt><dd>{$lizmapConfig->cacheServerURL}</dd>
      <dt>{@admin~admin.configuration.services.defaultRepository.label@}</dt><dd>{$lizmapConfig->defaultRepository}</dd>
    </dl>
    
    <!-- Modify -->
    <a class="btn" href="{jurl 'admin~config:modifyServices'}">
      {@admin~admin.configuration.button.modify.service.label@}
    </a>
  </div>

  <!--Repositories-->
  <div>
  <h2>{@admin~admin.configuration.repository.label@}</h2>
  {foreach $lizmapConfig->repositoryList as $repo}
    <legend>{$repo}</legend>
    {if isset($lizmapConfig->lizmapConfigData['repository:'.$repo]) }
      {assign $section = 'repository:'.$repo}
      {assign $item = $lizmapConfig->lizmapConfigData[$section]}
      <dl class="dl-horizontal">
      {foreach $item as $key=>$val}
        <dt>{$key}</dt><dd>{$val}</dd>
      {/foreach}
      </dl>

    <div class="form-actions">
      <!-- Modify -->
      <a class="btn" href="{jurl 'admin~config:modifySection', array('repository'=>$repo)}">{@admin~admin.configuration.button.modify.repository.label@}</a>
      <!-- Remove -->
      <a class="btn" href="{jurl 'admin~config:removeSection', array('repository'=>$repo)}" onclick="return confirm('{@admin~admin.configuration.button.remove.repository.confirm.label@}')">{@admin~admin.configuration.button.remove.repository.label@}</a>
  </div>
    {/if}
  {/foreach}    
  </div>

<!--Add a repository-->
<a class="btn" href="{jurl 'admin~config:createSection'}">{@admin~admin.configuration.button.add.repository.label@}</a>

