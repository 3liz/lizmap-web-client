{jmessage_bootstrap}

  <h1>{@admin~admin.menu.lizmap.logs.label@}</h1>

  <div>
    <h2>{@admin~admin.logs.counter.title@}</h2>

    {if !$counterNumber}
      {assign $counterNumber = 0}
    {/if}
    {$counterNumber} {@admin~admin.logs.counter.number.sentence@}

    <div class="form-actions">
      <a class="btn" href="{jurl 'admin~logs:counter'}">{@admin~admin.logs.view.button@}</a>
      {ifacl2 'lizmap.admin.lizmap.log.delete'}
      <a class="btn" href="{jurl 'admin~logs:emptyCounter'}" onclick="return confirm(`{@admin~admin.logs.empty.confirm@}`)">{@admin~admin.logs.empty.button@}</a>
      {/ifacl2}
    </div>

  </div>

  <div>
    <h2>{@admin~admin.logs.detail.title@}</h2>

    {if !$detailNumber}
      {assign $detailNumber = 0}
    {/if}
    {$detailNumber} {@admin~admin.logs.detail.number.sentence@}

    <div class="form-actions">
      <a class="btn" href="{jurl 'admin~logs:detail'}">{@admin~admin.logs.view.button@}</a>
      <a class="btn" href="{jurl 'admin~logs:export'}">{@admin~admin.logs.export.button@}</a>
      {ifacl2 'lizmap.admin.lizmap.log.delete'}
      <a class="btn" href="{jurl 'admin~logs:emptyDetail'}" onclick="return confirm(`{@admin~admin.logs.empty.confirm@}`)">{@admin~admin.logs.empty.button@}</a>
      {/ifacl2}
    </div>

  </div>


  <div>
    <h2>{@admin~admin.logs.error.title@}</h2>

    <p>{@admin~admin.logs.error.sentence@}</p>

<textarea rows="10" style="width:90%;">{if $errorLog != 'toobig'}{$errorLog}{else}{@admin~admin.logs.error.file.too.big@}{/if}</textarea>
    {ifacl2 'lizmap.admin.lizmap.log.delete'}
    <div class="form-actions">
      <a class="btn" href="{jurl 'admin~logs:eraseError'}" onclick="return confirm(`{@admin~admin.logs.error.file.erase.confirm@}`);">{@admin~admin.logs.error.file.erase@}</a>
    </div>
    {/ifacl2}
  </div>
