<div class="jcommunity-box jcommunity-account-password">
    <h1>{@jcommunity~password.form.change.title@}</h1>
    {if $error_status}
        <p>{@jcommunity~password.form.change.error.$error_status@}</p>
    {else}

        {@jcommunity~password.form.change.text.html@}

        {formfull $form,'jcommunity~password:save', array('user'=>$login), 'htmlbootstrap'}

    {/if}

    <p><a href="{jurl 'jcommunity~account:show', array('user'=>$login)}">{@jcommunity~account.cancel.and.back.to.account@}</a></p>
</div>