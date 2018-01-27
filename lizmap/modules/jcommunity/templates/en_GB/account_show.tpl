<div class="jcommunity-box jcommunity-account">
<h1>{$user->login|eschtml}'s profile</h1>

<table>
<tr>
    <td>Login</td> <td>{$user->login|eschtml}</td>
    {if isset($user->nickname)}<td>Displayed name</td> <td>{$user->nickname|eschtml}</td>{/if}
</tr>
{ifuserconnected}
<tr>
    <td>Email</td> <td>{$user->email|eschtml}</td>
</tr>
{/ifuserconnected}
{foreach $otherInfos as $label=>$value}
<tr>
    <td>{$label|eschtml}</td> <td>{$value|eschtml}</td>
</tr>
{/foreach}
</table>
{$additionnalContent}

{if $himself}
<ul>
    <li><a href="{jurl 'jcommunity~account:prepareedit', array('user'=>$user->login)}">Edit your profile</a></li>
    <li><a href="{jurl 'jcommunity~account:destroy', array('user'=>$user->login)}">Delete your profile</a></li>
    {foreach $otherPrivateActions as $link=>$label}
    <li><a href="{$link}">{$label|eschtml}</a></li>
    {/foreach}
</ul>
{/if}
</div>