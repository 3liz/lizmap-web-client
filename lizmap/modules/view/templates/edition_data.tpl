<div class="modal-header">
  <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
  {if $title}
  <h3>{$title}</h3>
  {else}
  <h3>{@view~edition.modal.title.default@}</h3>
  {/if}
</div>
<div class="modal-header">
  {foreach $forms as $form}
  <div>
    <form>
    <dl class="dl-horizontal">
    {foreach $form->controls as $ctrl}
      <dt>{$ctrl->label}</dt>
      <dd>&nbsp;{$ctrl->value}</dd>
    {/foreach}
      <dt></dt>
      <dd class="pull-right">
      {foreach $form->hidden as $ref=>$val}
        <input type="hidden" name="{$ref}" value="{$val}"/>
      {/foreach}
        <input type="submit" name="select" value="Select" class="btn"></input>
      </dd>
    </dl>
    </form>
  </div>
  {/foreach}
</div>
<div class="modal-footer">
<a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Close</a>
</div>
