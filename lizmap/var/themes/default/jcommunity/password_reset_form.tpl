<div class="jcommunity-box jcommunity-account-password">
    <h1>{@jcommunity~password.form.title@}</h1>

    {@jcommunity~password.form.text.html@}

    {formfull $form,'jcommunity~password_reset:send', array(), 'htmlbootstrap'}

    <p><a href="{jurl 'jcommunity~login:index'}" class="btn">{@jcommunity~login.cancel.and.back.to.login@}</a></p>
</div>