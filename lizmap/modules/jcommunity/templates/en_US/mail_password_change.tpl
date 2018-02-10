{meta Subject 'Request about a password reset on '.$domain_name}
<p>Hello,</p>

<p>You requested a password reset for your account <em>"{$user->login|eschtml}"</em>
on the web site <a href="{$website_uri}" class="notexpandlink">{$domain_name}</a>.</p>

<p>If you really want to change it, you should <a href="{$confirmation_link}">click on this link</a>.</p>

<p>You could then set a new password for your account. The link is valid 48h.</p>

<p>If this request is an error or you don't want to confirm, ignore this mail.
Your password won't be changed.</p>

<p>See you now on {$domain_name}!</p>

