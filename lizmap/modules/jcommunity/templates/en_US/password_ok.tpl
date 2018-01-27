<div class="jcommunity-box jcommunity-account-password">
<h1>Activation of a new password</h1>
{if $status == 1}
<p class="jcommunity-notice">Your new password is already activated. You can identify yourself on the web site.</p>
{else}
{if $status == 2}
<p class="jcommunity-error">The activation is not possible : the validity of the key has expired. If you want to
retrieve a new password, <a href="{jurl 'jcommunity~password:index'}">ask a new one</a>.</p>
<p>However, you can still authenticate yourself with your old password.</p>
{else}
<p class="jcommunity-notice">The new password is now activated, and you are identified on the web site now.</p>
{/if}
{/if}
</div>