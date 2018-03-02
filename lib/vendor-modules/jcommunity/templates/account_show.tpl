<div class="jcommunity-box jcommunity-account">
    <h1>{jlocale 'account.profile.of', array($user->login)}</h1>
    <table class="jforms-table">
        {if $himself}
            {formdata $form}
            {formcontrols}
            <tr>
                <th scope="row" valign="top">{ctrl_label}</th> <td>{ctrl_value}</td>
            </tr>
            {/formcontrols}
            {/formdata}
        {else}
            {formdata $form}
            {formcontrols $publicProperties}
                <tr>
                    <th scope="row" valign="top">{ctrl_label}</th> <td>{ctrl_value}</td>
                </tr>
            {/formcontrols}
            {/formdata}
        {/if}
        {foreach $otherInfos as $label=>$value}
            <tr>
                <th scope="row" valign="top">{$label|eschtml}</th> <td>{$value|eschtml}</td>
            </tr>
        {/foreach}
    </table>
    {$additionnalContent}

    {if $himself}
        <ul>
            {if $changeAllowed}<li><a href="{jurl 'jcommunity~account:prepareedit', array('user'=>$user->login)}">{@jcommunity~account.link.profile.edit@}</a></li>{/if}
            {if $passwordChangeAllowed}<li><a href="{jurl 'jcommunity~password:index', array('user'=>$user->login)}">{@jcommunity~account.link.account.change.password@}</a></li>{/if}
            {if $destroyAllowed}<li><a href="{jurl 'jcommunity~account:destroy', array('user'=>$user->login)}">{@jcommunity~account.link.account.delete@}</a></li>{/if}
            {foreach $otherPrivateActions as $link=>$label}
                <li><a href="{$link}">{$label|eschtml}</a></li>
            {/foreach}
        </ul>
    {/if}
</div>