<div>
  {if $title}
  <h3>{$title}</h3>
  {else}
  <h3>{@view~edition.modal.title.default@}</h3>
  {/if}
</div>

{jmessage_bootstrap}
<div id="edition-form-tabbable" class="tabbable">
  <ul id="edition-form-tabs" class="nav nav-tabs"></ul>
  <div class="tab-content" id="edition-form-layout"></div>
</div>


{formfull $form, 'lizmap~edition:saveFeature', array(), 'htmlbootstrap'}

<script>
{literal}
var lizmapEditionFormLayoutJson = {/literal}{$formLayout}{literal};
{/literal}
</script>
