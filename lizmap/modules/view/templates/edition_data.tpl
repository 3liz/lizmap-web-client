<div class="modal-header">
  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  {if $title}
  <h3>{$title}</h3>
  {else}
  <h3>{@view~edition.modal.title.default@}</h3>
  {/if}
</div>
<div class="modal-body">
{assign $empty = True}
  {foreach $forms as $form}
  {assign $empty = False}
  <div>
    <form>
    <dl class="dl-horizontal">
    {foreach $form->controls as $ctrl}
      <dt>{$ctrl->label}</dt>
      <dd>&nbsp;{$ctrl->value}</dd>
    {/foreach}
      <dt></dt>
      <dd class="float-end">
      {foreach $form->hidden as $ref=>$val}
        <input type="hidden" name="{$ref}" value="{$val}"/>
      {/foreach}
        <input type="submit" name="select" value="Select" class="btn"></input>
      </dd>
    </dl>
    </form>
  </div>
  <hr>
  {/foreach}

  {if $empty}
  <div>
    <p>{@view~edition.modal.message.no.feature.found@}</p>
  </div>
  {/if}

</div>
<div class="modal-footer">
<a href="#" class="btn" data-bs-dismiss="modal">Close</a>
</div>
