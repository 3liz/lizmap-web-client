<div class="jcommunity-box jcommunity-account">
    <h1>{@jcommunity~register.registration.confirm.title@}</h1>
    <p class="jcommunity-{if $status == 'ok'}notice{else}error{/if}"
    >{@jcommunity~register.registration.confirm.$status@}</p>
    <p><a href="{jurl 'jcommunity~login:index'}">{@jcommunity~login.back.to.login@}</a></p>
</div>