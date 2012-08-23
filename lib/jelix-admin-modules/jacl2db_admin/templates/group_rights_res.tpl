{meta_html css  $j_jelixwww.'design/jacl2.css'}

<h1>{@jacl2db_admin~acl2.group.rightres.title@} {$groupname}</h1>


<form action="{formurl 'jacl2db_admin~groups:saverightres',array('group'=>$groupid)}" method="post">
<fieldset><legend>{@jacl2db_admin~acl2.rightres.title@}</legend>
<div>{formurlparam 'jacl2db_admin~groups:saverightres',array('group'=>$groupid)}</div>

<p><strong>{@jacl2db_admin~acl2.warning.deleting.rightres@}</strong></p>

<table class="records-list jacl2-list">
<thead>
    <tr>
        <th>{@jacl2db_admin~acl2.col.subjects@}</th>
        <th>{@jacl2db_admin~acl2.col.resources@}</th>
    </tr>
</thead>
<tfoot>
    <tr>
        <td><input type="submit" value="{@jacl2db_admin~acl2.delete.button@}" /></td>
        <td></td>
    </tr>
</tfoot>
<tbody>
{foreach $rightsWithResources as $subject=>$resources}
<tr class="{cycle array('odd','even')}">
    <th>
        <input type="checkbox" name="subjects[{$subject}]" id="{$subject|eschtml}" />
        <label for="{$subject|eschtml}">{$subjects_localized[$subject]|eschtml}</label>
    </th>
    <td>{assign $firstr=true}
        {foreach $resources as $r}{if !$firstr}, {else}{assign $firstr=false}{/if}
        <span class="aclres{$r->canceled}">{$r->id_aclres|eschtml}</span>{/foreach}</td>
</tr>
{/foreach}
</tbody>
</table>
</fieldset>
</form>

<p><a href="{jurl 'jacl2db_admin~groups:rights'}">{@jacl2db_admin~acl2.link.return.to.rights@}</a>.</p>

