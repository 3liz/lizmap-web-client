<div class="jcommunity-box jcommunity-account">
    <h1>{jlocale 'account.profile.of', array($user->login)}</h1>
    <div class="jforms-table form-horizontal">
        {if $himself}
            {formdata $form, 'htmlbootstrap'}
            {formcontrols}
            <div class="control-group">
                {ctrl_label}
                <div class="controls">{ctrl_value}</div>
            </div>
            {/formcontrols}
            {/formdata}
        {else}
            {formdata $form, 'htmlbootstrap'}
            {formcontrols $publicProperties}
                <div class="control-group">
                    {ctrl_label}
                    <div class="controls">{ctrl_value}</div>
                </div>
            {/formcontrols}
            {/formdata}
        {/if}
        {foreach $otherInfos as $label=>$value}
            <div class="control-group">
                <label class="jforms-label control-label">{$label|eschtml}</label>
                <div class="controls"><span class="jforms-value jforms-value-input">{$value|eschtml}</span></div>
            </div>
        {/foreach}
    </div>
    {$additionnalContent}

    {if $himself}
        <ul class="crud-links-list unstyled">
            {if $changeAllowed}<li><a href="{jurl 'jcommunity~account:prepareedit', array('user'=>$user->login)}" class="crud-link btn">{@jcommunity~account.link.profile.edit@}</a></li>{/if}
            {if $passwordChangeAllowed}<li><a href="{jurl 'jcommunity~password:index', array('user'=>$user->login)}" class="crud-link btn">{@jcommunity~account.link.account.change.password@}</a></li>{/if}
            {if $destroyAllowed}<li><a href="{jurl 'jcommunity~account:destroy', array('user'=>$user->login)}" class="crud-link btn">{@jcommunity~account.link.account.delete@}</a></li>{/if}
            {foreach $otherPrivateActions as $link=>$label}
                <li><a href="{$link}"  class="crud-link btn">{$label|eschtml}</a></li>
            {/foreach}
        </ul>
    {/if}
</div>