{meta_html js $j_jelixwww.'js/authdb_admin.js'}
<h1>{@jauthdb_admin~crud.title.list@}</h1>

{if $canview}
<form action="{formurl 'jauthdb_admin~default:view'}" method="get" class="form-inline">
    <div>
        <label for="search-login">{@jauthdb_admin~crud.title.view@}</label>
        <input id="search-login" name="j_user_login" data-link="{jurl 'jauthdb_admin~default:autocomplete'}">
        <button type="submit" class="btn btn-small">{@jauthdb_admin~crud.link.view.record@}</button>
    </div>
</form>
{/if}

<table class="records-list table table-hover table-condensed">
<thead>
<tr>
    <th>{@jauthdb_admin~crud.list.col.login@}</th>
    <th>&nbsp;</th>
</tr>
</thead>
<tbody>
{foreach $list as $record}
<tr class="{cycle array('odd','even')}">
    <td>{$record->login|eschtml}</td>
    <td>
        {if $canview}
        <a href="{jurl 'jauthdb_admin~default:view',array('j_user_login'=>$record->login)}" class="btn btn-small">{@jauthdb_admin~crud.link.view.record@}</a>
        {/if}
    </td>
</tr>
{/foreach}
</tbody>
</table>
{if $recordCount > $listPageSize}
<div class="record-pages-list">Pages : {pagelinks_bootstrap 'jauthdb_admin~default:index', array(),  $recordCount, $page, $listPageSize, 'offset' }</div>
{/if}
{if $cancreate}
<p><a href="{jurl 'jauthdb_admin~default:precreate'}" class="crud-link btn">{@jauthdb_admin~crud.link.create.record@}</a></p>
{/if}

