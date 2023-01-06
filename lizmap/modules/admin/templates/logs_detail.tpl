<div>
    <h2>{@admin~admin.logs.detail.title@}</h2>

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>{@admin~admin.logs.key@}</th>
          <th>{@admin~admin.logs.timestamp@}</th>
          <th>{@admin~admin.logs.user@}</th>
          <th>{@admin~admin.logs.content@}</th>
          <th>{@admin~admin.logs.repository@}</th>
          <th>{@admin~admin.logs.project@}</th>
          <th>{@admin~admin.logs.ip@}</th>
        </tr>
      </thead>
      <tbody>
        {foreach $detail as $item}
        <tr>
          <td>{$item->key}</td>
          <td>{$item->timestamp|jdatetime:'db_datetime','lang_datetime'}</td>
          <td>{$item->user}</td>
          <td>{$item->content}</td>
          <td>{$item->repository}</td>
          <td>{$item->project}</td>
          <td>{$item->ip}</td>
        </tr>
        {/foreach}
      </tbody>
    </table>

  </div>

  <div class="pagination">
    <ul>
      <li><a href="{jurl 'admin~logs:detail', array('page'=>1)}">{@admin~admin.logs.first_page@}</a></li>
      <li><a href="{jurl 'admin~logs:detail', array('page'=>$page-1)}">{@admin~admin.logs.previous_page@}</a></li>
      <li><a href="{jurl 'admin~logs:detail', array('page'=>$page+1)}">{@admin~admin.logs.next_page@}</a></li>
    </ul>
  </div>

  <div class="form-actions">
    <a class="btn" href="{jurl 'admin~logs:index'}">{@admin~admin.configuration.button.back.label@}</a>
  </div>
