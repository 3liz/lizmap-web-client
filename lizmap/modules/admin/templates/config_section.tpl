{jmessage_bootstrap}
{if $form->getData('new') == 1}
<h1>{@admin~admin.form.admin_section.h1.create@}</h1>
{else}
<h1>{@admin~admin.form.admin_section.h1.modify@}</h1>
{/if}
{formfull $form, 'admin~maps:saveSection', array(), 'htmlbootstrap'}

<div>
  <a class="btn" href="{jurl 'admin~maps:index'}">{@admin~admin.configuration.button.back.label@}</a>
</div>
