<div class="jcommunity-box jcommunity-account">
    <h1>{@jcommunity~register.form.create.title@}</h1>

    <p>{@jcommunity~register.form.create.text.html@}</p>

    {formfull $form,'jcommunity~registration:save', array(), 'htmlbootstrap'}

    <p><a href="{jurl 'jcommunity~login:index'}"  class="btn">{@jcommunity~login.cancel.and.back.to.login@}</a></p>
</div>