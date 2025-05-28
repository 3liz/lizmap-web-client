{meta_html js $j_basepath.'assets/js/admin/config_section.js', ['defer' => '']}
{jmessage_bootstrap}

{if $form->getData('new') == 1}
<h1>{@admin~admin.form.admin_section.h1.create@}</h1>
{else}
<h1>{@admin~admin.form.admin_section.h1.modify@}</h1>
{/if}
{form $form, 'admin~maps:saveSection', array(), 'htmlbootstrap'}
<div class="control-group">
  {ctrl_label 'path'}
  <div class="controls">{ctrl_control 'path'}</div>
</div>
<div class="control-group">
  {ctrl_label 'label'}
  <div class="controls">{ctrl_control 'label'}</div>
</div>
<div class="control-group">
  {ctrl_label 'repository'}
  <div class="controls">{ctrl_control 'repository'}</div>
</div>

{formcontrols}
<div class="control-group">
  {ctrl_label}
  <div class="controls">{ctrl_control}</div>
</div>
{/formcontrols}
<div class="jforms-submit-buttons form-actions">{formsubmit}</div>
{/form}

<div>
  {if $form->getData('new') == 1}
  <a class="btn" href="{jurl 'admin~maps:index'}">{@admin~admin.configuration.button.back.label@}</a>
  {else}
  <a class="btn" href="{jurl 'admin~maps:index'}#{$form->getData('repository')}">{@admin~admin.configuration.button.back.label@}</a>
  {/if}
</div>
