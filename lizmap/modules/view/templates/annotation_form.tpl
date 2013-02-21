<div class="modal-header">
  {if $title}
  <h3>{$title}</h3>
  {else}
  <h3>{@view~annotation.modal.title.default@}</h3>
  {/if}
</div>
{formfull $form, 'lizmap~annotation:saveAnnotation', array(), 'htmlbootstrap', array("modal"=>True,"cancel"=>True,"cancelLocale"=>"view~annotation.form.cancel.label","errorDecorator"=>"bootstrapErrorDecoratorHtml")}
