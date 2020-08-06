

{foreach $container->getChildrenBeforeTab() as $child}
    {if $child->isGroupBox()}
        <fieldset id="{$child->getHtmlId()}"{if !$groupVisibilities[$child->getHtmlId()]} style="display:none;"{/if}>
        <legend style="font-weight:bold;">{$child->getName()}</legend>
            <div class="jforms-table-group" id="{$child->getHtmlId()}">
            {fetchtpl 'view~edition_form_container',array('container'=>$child, 'groupVisibilities'=>$groupVisibilities)}
            </div>
        </fieldset>
    {else}
        <div class="control-group">
            {ctrl_label $child->getCtrlRef()}
            <div class="controls">
                {ctrl_control $child->getCtrlRef()}
            </div>
        </div>
    {/if}
{/foreach}

{if $container->hasTabChildren()}
<ul id="{$container->getParentId()}-tabs" class="nav nav-tabs">
    {foreach $container->getTabChildren() as $tabChild}
    <li{if !$groupVisibilities[$tabChild->getHtmlId()]} style="display:none;"{/if}><a href="#{$tabChild->getHtmlId()}"
           data-toggle="tab">{$tabChild->getName()}</a></li>
    {/foreach}
</ul>

<div id="{$container->getParentId()}-tab-content" class="tab-content">
    {foreach $container->getTabChildren() as $tabChild}
        <div class="tab-pane" id="{$tabChild->getHtmlId()}">
            {fetchtpl 'view~edition_form_container',array('container'=>$tabChild, 'groupVisibilities'=>$groupVisibilities)}
        </div>
    {/foreach}
</div>
{/if}

{foreach $container->getChildrenAfterTab() as $child}
    {if $child->isGroupBox()}
        <fieldset id="{$child->getHtmlId()}"{if !$groupVisibilities[$child->getHtmlId()]} style="display:none;"{/if}>
            <legend style="font-weight:bold;">{$child->getName()}</legend>
            <div class="jforms-table-group" id="{$child->getHtmlId()}">
                {fetchtpl 'view~edition_form_container',array('container'=>$child, 'groupVisibilities'=>$groupVisibilities)}
            </div>
        </fieldset>
    {else}
        <div class="control-group">
            {ctrl_label $child->getCtrlRef()}
            <div class="controls">
                {ctrl_control $child->getCtrlRef()}
            </div>
        </div>
    {/if}
{/foreach}