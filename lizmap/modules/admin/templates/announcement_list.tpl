
<h1>{@admin~admin.announcement.list.title@}</h1>

{ifacl2 'lizmap.admin.announcement.manage'}
<div class="container">

    <div class="mb-3">
        <a class="btn btn-primary" href="{jurl 'admin~announcement:create'}">{@admin~admin.announcement.create@}</a>
    </div>

    {if $announcementCount == 0}
    <p>{@admin~admin.announcement.list.empty@}</p>
    {else}
    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>{@admin~admin.announcement.col.title@}</th>
                <th>{@admin~admin.announcement.col.repository@}</th>
                <th>{@admin~admin.announcement.col.project@}</th>
                <th>{@admin~admin.announcement.col.groups@}</th>
                <th>{@admin~admin.announcement.col.maxviews@}</th>
                <th>{@admin~admin.announcement.col.status@}</th>
                <th>{@admin~admin.announcement.col.created@}</th>
                <th>{@admin~admin.announcement.col.actions@}</th>
            </tr>
        </thead>
        <tbody>
            {foreach $announcements as $item}
            <tr>
                <td>{$item->title}</td>
                <td>{$item->target_repository}</td>
                <td>{$item->target_project}</td>
                <td>{$item->target_groups}</td>
                <td>{$item->max_display_count}</td>
                <td>
                    {if $item->is_active}
                    <span class="badge bg-success">{@admin~admin.announcement.status.active@}</span>
                    {else}
                    <span class="badge bg-secondary">{@admin~admin.announcement.status.inactive@}</span>
                    {/if}
                </td>
                <td>{$item->created_at|jdatetime:'db_datetime','lang_datetime'}</td>
                <td>
                    <a class="btn btn-sm btn-outline-primary" href="{jurl 'admin~announcement:edit', array('id'=>$item->id)}">{@admin~admin.announcement.btn.edit@}</a>
                    <a class="btn btn-sm btn-outline-secondary" href="{jurl 'admin~announcement:toggle', array('id'=>$item->id)}">{if $item->is_active}{@admin~admin.announcement.btn.deactivate@}{else}{@admin~admin.announcement.btn.activate@}{/if}</a>
                    <a class="btn btn-sm btn-outline-danger" href="{jurl 'admin~announcement:delete', array('id'=>$item->id)}" onclick="return confirm('{@admin~admin.announcement.confirm.delete@}')">{@admin~admin.announcement.btn.delete@}</a>
                </td>
            </tr>
            {/foreach}
        </tbody>
    </table>
    {/if}

</div>
{/ifacl2}
