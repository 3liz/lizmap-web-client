
<h1>{@admin~admin.logs.detail.title@}</h1>
<div class="container">

    {assign $localeShowHide = ($showqgis ? "hide" : 'show')}
    <p>
      <a class='btn btn-sm' href='{jurl 'admin~logs:detail', array('page'=>$page, 'showqgis' => (!$showqgis))}'>{@admin~admin.log.qgis_login.$localeShowHide@}</a>
    </p>
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

  <nav>
    <ul class="pagination">
      <li class="page-item">
        <a class="page-link" href="{jurl 'admin~logs:detail', array('page'=>1, 'showqgis' => $showqgis)}">{@admin~admin.logs.first_page@}</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="{jurl 'admin~logs:detail', array('page'=>$page-1, 'showqgis' => $showqgis)}">{@admin~admin.logs.previous_page@}</a>
      </li>
      <li class="page-item">
        <a class="page-link" href="{jurl 'admin~logs:detail', array('page'=>$page+1, 'showqgis' => $showqgis)}">{@admin~admin.logs.next_page@}</a>
      </li>
    </ul>
  </nav>

  <div class="form-actions">
    <a class="btn btn-sm" href="{jurl 'admin~logs:index'}">{@admin~admin.configuration.button.back.label@}</a>
  </div>
</div>
