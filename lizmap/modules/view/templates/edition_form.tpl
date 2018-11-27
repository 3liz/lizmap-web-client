<div>
  {if $title}
  <h3>{$title}</h3>
  {else}
  <h3>{@view~edition.modal.title.default@}</h3>
  {/if}
</div>

{jmessage_bootstrap}

{$attributeEditorFormTemplate}
