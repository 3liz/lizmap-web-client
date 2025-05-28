
<h1>{@gui.dashboard.title@}</h1>
{if !count($widgets)}
    <p>{@gui.dashboard.nowidget@}.</p>
{else}

{assign $nbPerCol = ceil(count($widgets)/2)}
<div id="dashboard-content" class="row">
    <div id="dashboard-left-column" class="span6">
        {for $i=0; $i<$nbPerCol;$i++}
        <div class="dashboard-widget well">
            <h3>{$widgets[$i]->title|eschtml}</h3>
            <div class="dashboard-widget-content">{$widgets[$i]->content}</div>
        </div>
        {/for}
    </div>
    <div id="dashboard-right-column" class="span6">
        {for $i=$nbPerCol; $i<count($widgets);$i++}
        <div class="dashboard-widget well">
            <h3>{$widgets[$i]->title|eschtml}</h3>
            <div class="dashboard-widget-content">{$widgets[$i]->content}</div>
        </div>
        {/for}
    </div>
</div>
{/if}