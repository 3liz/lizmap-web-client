<div class="jcommunity-box jcommunity-account-password">
    <h1>{@jcommunity~password.form.title@}</h1>
    {@jcommunity~password.admin.form.reset.html@}
    <form method="post" action="{jurl 'jcommunity~password_reset_admin:send'}">
        <p>
            <input type="hidden" name="pass_login" value="{$login}">
            <button>{@jcommunity~password.admin.form.email.button@} {$login}</button></p>
    </form>

    <p><a href="{jurl 'jauthdb_admin~default:view', array('j_user_login'=>$login)}">{@jcommunity~password.admin.form.back.to.account@} {$login}</a></p>
</div>