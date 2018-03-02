<div class="jcommunity-box jcommunity-account-destroy">
    <h1>{@jcommunity~account.form.delete.account.title@}</h1>

    <form action="{formurl 'jcommunity~account:dodestroy', array('user'=>$username)}" method="post">
        <fieldset><legend>{@jcommunity~account.form.delete.account.confirm.title@}</legend>
            {formurlparam}

            <p>{@jcommunity~account.form.delete.account.confirm@}</p>

            <p>
                <label for="conf_password">{@jcommunity~account.form.password@}</label>
                <input type="password" name="conf_password" id="conf_password" />
            </p>

            <div><input type="submit" value="{@jcommunity~account.form.delete.account.submit@}" />

                <a href="{jurl 'jcommunity~account:show', array('user'=>$username)}" class="btn">{@jcommunity~account.form.cancel@}</a>
            </div>
        </fieldset>
    </form>
</div>