
<ul>
{foreach $errors as $error}
    <li>
        <b>{$error['title']}</b>
        <p>{$error['description']}</p>
    </li>
{/foreach}
</ul>
