{jmessage_bootstrap}
<h1>{@admin.form.admin_theme.h1@}</h1>
{ifacl2 'lizmap.admin.theme.update'}
{formfull $form, 'theme:save', array(), 'htmlbootstrap'}
{/ifacl2}
<div>
  <a class="btn" href="{jurl 'theme:index'}">{@admin~admin.configuration.button.back.label@}</a>
</div>
