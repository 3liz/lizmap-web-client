
<h1>{@gui.dashboard.title@}</h1>
{if !count($widgets)}
    <p>{@gui.dashboard.nowidget@}.</p>
{else}

{assign $nbPerCol = ceil(count($widgets)/2)}
<div id="dashboard-content" class="row">
    <div class="col-sm-6">
        {for $i=0; $i<$nbPerCol;$i++}
        <div class="card">
            <h3 class="card-header">{$widgets[$i]->title|eschtml}</h3>
            <div class="card-body">{$widgets[$i]->content}</div>
        </div>
        {/for}
    </div>
    <div class="col-sm-6">
        {for $i=$nbPerCol; $i<count($widgets);$i++}
        <div class="card">
            <h3 class="card-header">{$widgets[$i]->title|eschtml}</h3>
            <div class="card-body">{$widgets[$i]->content}</div>
        </div>
        {/for}
    </div>
</div>
{/if}
