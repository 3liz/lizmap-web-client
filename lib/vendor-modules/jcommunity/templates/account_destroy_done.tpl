<div class="jcommunity-box jcommunity-account-destroy">
    <h1>{@jcommunity~account.form.delete.account.title@}</h1>
    {if $error}
        <p class="jcommunity-error">
            {@jcommunity~account.form.delete.account.error.$error@}</p>
    {else}
        <p class="jcommunity-notice">{@jcommunity~account.form.delete.account.done@}</p>
    {/if}
</div>