{jmessage_bootstrap}

  <h1>{@admin~admin.configuration.h1@}</h1>


  <div>
    <h2>{@admin~admin.generic.h2@}</h2>
    <dl>
      <dt>{@admin~admin.generic.version.number.label@}</dt><dd>{$version}</dd>
    </dl>
  </div>

  {ifacl2 'lizmap.admin.services.view'}
  <!--Services-->
  <div>
    <h2>{@admin~admin.configuration.services.label@}</h2>
    <dl>
      <dt>{@admin~admin.configuration.services.wmsServerURL.label@}</dt><dd>{$services->wmsServerURL}</dd>
      <dt>{@admin~admin.configuration.services.cacheStorageType.label@}</dt><dd>{$services->cacheStorageType}</dd>
      <dt>{@admin~admin.configuration.services.cacheRootDirectory.label@}</dt><dd>{$services->cacheRootDirectory}</dd>
      <dt>{@admin~admin.configuration.services.cacheExpiration.label@}</dt><dd>{$services->cacheExpiration}</dd>
      <dt>{@admin~admin.configuration.services.defaultRepository.label@}</dt><dd>{$services->defaultRepository}</dd>
      <dt>{@admin~admin.configuration.services.proxyMethod.label@}</dt><dd>{$services->proxyMethod}</dd>
      <dt>{@admin~admin.configuration.services.debugMode.label@}</dt><dd>{$services->debugMode}</dd>
    </dl>

    <!-- Modify -->
    {ifacl2 'lizmap.admin.services.update'}
    <div class="form-actions">
    <a class="btn" href="{jurl 'admin~config:modifyServices'}">
      {@admin~admin.configuration.button.modify.service.label@}
    </a>
    </div>
    {/ifacl2}
  </div>
  {/ifacl2}

  {ifacl2 'lizmap.admin.repositories.view'}
  <!--Repositories-->
  <div>
  <h2>{@admin~admin.configuration.repository.label@}</h2>
  {foreach $repositories as $repo}

    <legend>{$repo->getKey()}</legend>

    <dl><dt>{@admin~admin.form.admin_section.data.label@}</dt>
      <dd>
        <table class="table">
      {assign $section = 'repository:'.$repo->getKey()}
      {assign $properties = $repo->getProperties()}
      {foreach $properties as $prop}
      <tr>
        <th>{$prop}</th><td>{$repo->getData($prop)}</td>
      </tr>
      {/foreach}
        </table>
      </dd>
    </dl>

    <dl><dt>{@admin~admin.form.admin_section.groups.label@}</dt>
      <dd>
        <table class="table">
      {foreach $data[$repo->getKey()] as $k=>$v}
      <tr>
        <th>{$labels[$k]}</th><td>{$v}</td>
      </tr>
      {/foreach}
        </table>
      </dd>
    </dl>

      <div class="form-actions">
        <!-- View repository page -->
        {ifacl2 'lizmap.repositories.view', $repo->getKey()}
        <a class="btn" href="{jurl 'view~default:index', array('repository'=>$repo->getKey())}" target="_blank">{@admin~admin.configuration.button.view.repository.label@}</a>
        {/ifacl2}
        <!-- Modify -->
        {ifacl2 'lizmap.admin.repositories.update'}
        <a class="btn" href="{jurl 'admin~config:modifySection', array('repository'=>$repo->getKey())}">{@admin~admin.configuration.button.modify.repository.label@}</a>
        {/ifacl2}
        <!-- Remove -->
        {ifacl2 'lizmap.admin.repositories.delete'}
        <a class="btn" href="{jurl 'admin~config:removeSection', array('repository'=>$repo->getKey())}" onclick="return confirm('{@admin~admin.configuration.button.remove.repository.confirm.label@}')">{@admin~admin.configuration.button.remove.repository.label@}</a>
        {/ifacl2}
        {ifacl2 'lizmap.admin.repositories.delete'}
        <a class="btn" href="{jurl 'admin~config:removeCache', array('repository'=>$repo->getKey())}" onclick="return confirm('{@admin~admin.cache.button.remove.repository.cache.confirm.label@}')">{@admin~admin.cache.button.remove.repository.cache.label@}</a>
        {/ifacl2}
      </div>

  {/foreach}
  </div>
  {/ifacl2}

<!--Add a repository-->
{ifacl2 'lizmap.admin.repositories.create'}
<a class="btn" href="{jurl 'admin~config:createSection'}">{@admin~admin.configuration.button.add.repository.label@}</a>
{/ifacl2}
