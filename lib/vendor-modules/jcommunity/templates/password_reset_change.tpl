<div class="jcommunity-box jcommunity-account-password">
    <h1>{@jcommunity~password.form.change.title@}</h1>
{if $error_status}
    <p>{@jcommunity~password.form.change.error.$error_status@}</p>
{else}

    {@jcommunity~password.form.change.text.html@}

    {formfull $form,'jcommunity~password_reset:save', array()}

{/if}

    <p><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.cancel.and.back.to.login@}</a></p>
</div>