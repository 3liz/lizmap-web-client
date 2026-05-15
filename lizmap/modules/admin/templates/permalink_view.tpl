{jmessage_bootstrap}
<h1>{@admin~admin.menu.lizmap.permalink.label@}</h1>
<div class="container">
    <div class="card mb-3">
        <h2 class="card-header">
            {@admin~admin.permalink.manager.title@}
        </h2>
        <div class="card-body">
            <h3>{@admin~admin.permalink.manager.counter.title@}</h3>
            {if !$counterNumber}
                {assign $counterNumber = 0}
            {/if}
            <span data-testid="permalink-total-stored">{$counterNumber} {@admin~admin.permalink.manager.counter.sentence@}</span>
            <div class="form-actions">
                <a class="btn btn-sm" href="{jurl 'admin~permalink:detail'}">{@admin~admin.permalink.manager.detail.button@}</a>
            </div>
            <br />
            <h3>{@admin~admin.permalink.manager.counter.delete.title@}</h3>
            <div class="form-actions">
                <a class="btn btn-sm" href="{jurl 'admin~permalink:emptyPermalink'}" onclick="return confirm(`{@admin~admin.permalink.manager.empty.confirm@}`)">{@admin~admin.permalink.manager.empty.button@}</a>
            </div>
            <br />
            <h5>{@admin~admin.permalink.manager.lastusage.title@}</h5>
            <div class="row mb-4">
                <div class="col-4">
                    <form action="{formurl 'admin~permalink:deleteByLastUsage'}" method="post" class="form-inline col-auto">
                        <div class="input-group" data-testid="permalink-lastusage-input-group">
                            <label class="input-group-text" for="permalink-lastusage-filter">{@admin~admin.permalink.manager.lastusage.label@}</label>
                            <input type="text" class="form-control form-control-sm" placeholder="{@admin~admin.permalink.manager.lastusage.placeholder@}" id="permalink-lastusage-filter" name="permalink-lastusage-filter"/>
                            <label class="input-group-text">{@admin~admin.permalink.manager.lastusage.unit@}</label>
                            <button type="submit" class="btn btn-sm" onclick="return confirm(`{@admin~admin.permalink.manager.lastusage.confirm@}`)">{@admin~admin.permalink.manager.lastusage.submit@}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
