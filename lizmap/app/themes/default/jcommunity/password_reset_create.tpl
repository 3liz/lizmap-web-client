<div class="jcommunity-box jcommunity-account-password">
    <h1>{@jcommunity~password.form.create.title@}</h1>
{if $error_status}
    <p>{@jcommunity~password.form.create.error.$error_status@}</p>
{else}

    {@jcommunity~password.form.create.text.html@}

    {formfull $form,'jcommunity~password_confirm_registration:save', array(), 'htmlbootstrap'}

{/if}

    <p><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.cancel.and.back.to.login@}</a></p>
</div>