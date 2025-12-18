<div class="jcommunity-box jcommunity-account-password container" style="max-width: 700px;">
    <h1>{@jcommunity~password.form.title@}</h1>
    <div class="row">
    {@jcommunity~password.form.text.html@}
    </div>

    <div class="row">
    {form $form,'jcommunity~password_reset:send', array(), 'htmlbootstrap'}
        {formcontrols}
        <div class="form-group mb-3">
            {ctrl_label}
            {ctrl_control}
        </div>
        {/formcontrols}

        <div class="form-actions d-flex justify-content-center">
            {formsubmit}
        </div>

    {/form}
    </div>

    <div class="row" style="margin-top: 20px;">
        <a href="{jurl 'jcommunity~login:index'}" class="btn">{@jcommunity~login.cancel.and.back.to.login@}</a>
    </div>

</div>
