
<h1>{@gui.dashboard.title@}</h1>
{if !count($widgets)}
<p>{@gui.dashboard.nowidget@}.</p>
{else}

{assign $nbPerCol = ceil(count($widgets)/2)}
<div id="dashboard-content">
    <div id="dashboard-left-column">
        {for $i=0; $i<$nbPerCol;$i++}
        <div class="dashboard-widget">
            <h2>{$widgets[$i]->title|eschtml}</h2>
            <div class="dashboard-widget-content">{$widgets[$i]->content}</div>
        </div>
        {/for}
    </div>
    
    <div id="dashboard-right-column">
        {for $i=$nbPerCol; $i<count($widgets);$i++}
        <div class="dashboard-widget">
            <h2>{$widgets[$i]->title|eschtml}</h2>
            <div class="dashboard-widget-content">{$widgets[$i]->content}</div>
        </div>
        {/for}
    </div>
    <div class="dashboard-clear"></div>
</div>
{/if}