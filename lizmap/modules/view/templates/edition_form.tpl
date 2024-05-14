<div>
  {if $title}
  <h3>{$title}</h3>
  {else}
  <h3>{@view~edition.modal.title.default@}</h3>
  {/if}
</div>

{jmessage_bootstrap}

{form $form, "lizmap~edition:saveFeature", array(), "htmlbootstrap",
        array("errorDecorator"=>"lizEditionErrorDecorator",
              "plugins"=>$formPlugins,
              "attributes"=>array('data-new-feature-action'=>$ajaxNewFeatureUrl),
              "widgetsAttributes" => $widgetsAttributes
        )}

{if $attributeEditorForm}

    {fetchtpl 'view~edition_form_container',
            array('container'=>$attributeEditorForm,
                  'groupVisibilities'=>$groupVisibilities)}

{else}
    {formcontrols $fieldNames}
    <div class="control-group">
        {ctrl_label}
        <div class="controls">
            {ctrl_control}
        </div>
    </div>
    {/formcontrols}
{/if}


    <div class="control-group">
        {ctrl_label "liz_future_action"}
        <div class="controls">
            {ctrl_control "liz_future_action"}
        </div>
    </div>
    <div class="jforms-submit-buttons form-actions">{formreset}{formsubmit}</div>
{/form}
