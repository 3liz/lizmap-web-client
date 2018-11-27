{meta_html js $j_basepath.'js/services_configuration.js'}

{jmessage_bootstrap}
<h1>{@admin~admin.form.admin_services.h1@}</h1>
{formfull $form, 'admin~config:saveServices', array(), 'htmlbootstrap'}

<div>
  <a class="btn" href="{jurl 'admin~config:index'}">{@admin~admin.configuration.button.back.label@}</a>
</div>

