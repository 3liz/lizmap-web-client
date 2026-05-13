{jmessage_bootstrap}
<h1>{@admin~admin.permalink.manager.detail.title@}</h1>
<div class="container">
    <table data-testid='permalink-detail-table' class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>{@admin~admin.permalink.manager.detail.hash@}</th>
          <th>{@admin~admin.permalink.manager.detail.params@}</th>
          <th>{@admin~admin.permalink.manager.detail.repository@}</th>
          <th>{@admin~admin.permalink.manager.detail.project@}</th>
          <th>{@admin~admin.permalink.manager.detail.creation@}</th>
          <th>{@admin~admin.permalink.manager.detail.lastusage@}</th>
        </tr>
      </thead>
      <tbody>
        {foreach $detail as $item}
        <tr>
          <td>{$item->id}</td>
          <td>{$item->url_parameters}</td>
          <td>{$item->repository}</td>
          <td>{$item->project}</td>
          <td>{$item->creation_date|jdatetime:'db_datetime','lang_datetime'}</td>
          <td>{$item->last_usage_date|jdatetime:'db_datetime','lang_datetime'}</td>
        </tr>
        {/foreach}
      </tbody>
    </table>

  <nav>
    <ul class="pagination">
      <li class="page-item">
        <a class="page-link" href="{jurl 'admin~permalink:detail', array('page'=>1)}">{@admin~admin.permalink.manager.detail.first_page@}</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="{jurl 'admin~permalink:detail', array('page'=>$page-1)}">{@admin~admin.permalink.manager.detail.previous_page@}</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="{jurl 'admin~permalink:detail', array('page'=>$page+1)}">{@admin~admin.permalink.manager.detail.next_page@}</a>
      </li>
    </ul>
  </nav>

  <div class="form-actions">
    <a class="btn btn-sm" href="{jurl 'admin~permalink:index'}">{@admin~admin.configuration.button.back.label@}</a>
  </div>
</div>
