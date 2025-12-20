{meta_html assets 'jauthdb_admin'}

<h1>{@jauthdb_admin~crud.title.list@}</h1>

<div class="container">
    <div class="row justify-content-between mb-3">
{if $showfilter}
    <form action="{formurl 'jauthdb_admin~default:index'}" method="get" class="form-inline col-auto">
        <div class="input-group">
            <label for="user-list-filter" class="input-group-text">{@jauthdb_admin~crud.search.form.keyword.label@}</label>
            <input type="text" class="form-control form-control-sm" name="filter" value="{$filter|eschtml}" id="user-list-filter" />
            <button type="submit" class="btn btn-sm">{@jauthdb_admin~crud.search.button.label@}</button>
        </div>
    </form>
{/if}

{if $canview}
<form action="{formurl 'jauthdb_admin~default:view'}" method="get" class="form-inline col-auto">
    <div class="input-group">
        <label for="search-login" class="input-group-text">{@jauthdb_admin~crud.title.view@}</label>
        <input id="search-login" name="j_user_login" class="form-control form-control-sm" data-link="{jurl 'jauthdb_admin~default:autocomplete'}">
        <button type="submit" class="btn btn-sm">{@jauthdb_admin~crud.link.view.record@}</button>
    </div>
</form>
{/if}
    </div>

<table class="records-list table table-bordered table-striped table-condensed table-hover">
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
        <a href="{jurl 'jauthdb_admin~default:view',array('j_user_login'=>$record->login)}" class="btn btn-sm">{@jauthdb_admin~crud.link.view.record@}</a>
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
<p><a href="{jurl 'jauthdb_admin~default:precreate'}" class="crud-link btn btn-sm">{@jauthdb_admin~crud.link.create.record@}</a></p>
{/if}
</div>
