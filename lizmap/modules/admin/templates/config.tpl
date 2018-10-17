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
    {formdata $servicesForm ,'htmlbootstrap', array()}
    <table class="table services-table">
      {formcontrols }
        <tr>
        {ifctrl 'requestProxyEnabled'}
          {ifctrl_value '0'}
            <th>{ctrl_label}</th><td>{ctrl_value}</td>
          {else}
            <td colspan="2">
              {ctrl_value}
            </td>
          {/ifctrl_value}
        {else}
        <th>{ctrl_label}</th><td>{ctrl_value}</td>
        {/ifctrl}
      </tr>

      {/formcontrols}
    </table>
    {/formdata}
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

  <!--Add a repository-->
  {ifacl2 'lizmap.admin.repositories.create'}
  <div style="margin:20px 0px;">
  <a class="btn" href="{jurl 'admin~config:createSection'}">{@admin~admin.configuration.button.add.repository.label@}</a>
  </div>
  {/ifacl2}


  {foreach $repositories as $repo}

    <legend>{$repo->getKey()}</legend>

    <dl><dt>{@admin~admin.form.admin_section.data.label@}</dt>
      <dd>
        <table class="table">
      {assign $section = 'repository:'.$repo->getKey()}
      {assign $properties = $repo->getProperties()}
      {assign $rootRepositories = $services->getRootRepositories()}
      {foreach $properties as $prop}
      <tr>
        {if $prop == 'path' && $rootRepositories != ''}
            {if substr($repo->getPath(), 0, strlen($rootRepositories)) === $rootRepositories}
            {assign $d = substr($repo->getPath(), strlen($rootRepositories))}
            <th>{@admin~admin.form.admin_section.repository.$prop.label@}</th><td>{$d}</td>
            {/if}
        {else}
        <th>{@admin~admin.form.admin_section.repository.$prop.label@}</th><td>{$repo->getData($prop)}</td>
        {/if}
      </tr>
      {/foreach}
        </table>
      </dd>
    </dl>

    <dl><dt>{@admin~admin.form.admin_section.groups.label@}</dt>
      <dd>
        <table class="table">
      {foreach $subjects as $s}
      {if property_exists($data[$repo->getKey()], $s)}
      <tr>
        <th>{$labels[$s]}</th><td>{$data[$repo->getKey()]->$s}</td>
      </tr>
      {/if}
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
{if count($repositories)}
{ifacl2 'lizmap.admin.repositories.create'}
<a class="btn" href="{jurl 'admin~config:createSection'}">{@admin~admin.configuration.button.add.repository.label@}</a>
{/ifacl2}
{/if}
