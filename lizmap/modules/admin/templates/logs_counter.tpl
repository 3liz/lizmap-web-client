{jmessage_bootstrap}
  <h1>{@admin~admin.logs.counter.title@}</h1>
  <div class="container">

    <table class="table table-bordered table-striped">
      <thead>
        <tr>
          <th>{@admin~admin.logs.key@}</th>
          <th>{@admin~admin.logs.repository@}</th>
          <th>{@admin~admin.logs.project@}</th>
          <th>{@admin~admin.logs.counter@}</th>
        </tr>
      </thead>
      <tbody>
        {foreach $counter as $item}
        <tr>
          <td>{$item->key}</td>
          <td>{$item->repository}</td>
          <td>{$item->project}</td>
          <td>{$item->counter}</td>
        </tr>
        {/foreach}
      </tbody>
    </table>
    <div class="form-actions">
      <a class="btn btn-sm" href="{jurl 'admin~logs:index'}">{@admin~admin.configuration.button.back.label@}</a>
    </div>
  </div>
