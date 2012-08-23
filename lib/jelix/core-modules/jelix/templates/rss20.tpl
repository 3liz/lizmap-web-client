<rss version="2.0"
         xmlns:err="http://jelix.org/ns/xmlerror/1.0">
 <channel>

    <title><![CDATA[{$rss->title}]]></title>
    <link>{$rss->webSiteUrl|escxml}</link>
    <description>{$rss->description|escxml}</description>

    {if $rss->language}
    <language>{$rss->language|escxml}</language>
    {/if}

    {if $rss->image && $rss->imageTitle && $rss->imageLink}
    <image>
        <url>{$rss->image|escxml}</url>
        <title><![CDATA[{$rss->imageTitle}]]></title>
        <link>{$rss->imageLink|escxml}</link>
        {if $rss->imageWidth} <width>{$rss->imageWidth|escxml}</width>{/if}
        {if $rss->imageHeight} <height>{$rss->imageHeight|escxml}</height>{/if}
        {if $rss->imageDescription} <description><![CDATA[{$rss->imageDescription}]]></description>{/if}
    </image>
    {/if}

    {if $rss->published}<pubDate>{$rss->published|jdatetime:'db_datetime':'rfc822'}</pubDate>{/if}
    {if $rss->updated}<lastBuildDate>{$rss->updated|jdatetime:'db_datetime':'rfc822'}</lastBuildDate>{/if}
    {if $rss->generator}<generator>{$rss->generator|escxml}</generator>{/if}
    {if $rss->copyright}<copyright>{$rss->copyright|escxml}</copyright>{/if}
    {if $rss->managingEditor}<managingEditor>{$rss->managingEditor|escxml}</managingEditor>{/if}
    {if $rss->webMaster}<webMaster>{$rss->webMaster|escxml}</webMaster>{/if}
    {if $rss->categories}{foreach $rss->categories as $cat}<category>{$cat|escxml}</category>{/foreach}{/if}
    {if $rss->docs}<docs>{$rss->docs|escxml}</docs>{/if}
    {if $rss->cloud}<cloud domain="" port="" path="" registerProcedure="" protocol="" />{/if}
    {if $rss->ttl}<ttl>{$rss->ttl|escxml}</ttl>{/if}
    {if $rss->rating}<rating>{$rss->rating|escxml}</rating>{/if}
    {if $rss->textInput}<textInput>
        {if $rss->textInput['title']}<title>{$rss->textInput['title']|escxml}</title>{/if}
        {if $rss->textInput['description']}<description>{$rss->textInput['description']|escxml}</description>{/if}
        {if $rss->textInput['name']}<name>{$rss->textInput['name']|escxml}</name>{/if}
        {if $rss->textInput['link']}<link>{$rss->textInput['link']|escxml}</link>{/if}
        </textInput>{/if}
    {if $rss->skipHours}<skipHours>{foreach $rss->skipHours as $hour}<hour>{$hour}</hour>{/foreach}</skipHours>{/if}
    {if $rss->skipDays}<skipDays>{foreach $rss->skipDays as $day}<day>{$day}</day>{/foreach}</skipDays>{/if}

  {foreach $items as $item}
    <item>
        <title><![CDATA[{$item->title}]]></title>
        {if $item->link}<link>{$item->link|escxml}</link>{/if}
        <description><![CDATA[{$item->content}]]></description>
        {if $item->published}<pubDate>{$item->published|jdatetime:'db_datetime':'rfc822'}</pubDate>{/if}
        <guid {if $item->idIsPermalink}isPermaLink="true"{/if}>{if $item->id}{$item->id|escxml}{else}{$item->link|escxml}{/if}</guid>
        {if $item->authorName || $item->authorEmail}<author>{$item->authorName|escxml} {$item->authorEmail|escxml}</author>{/if}
        {if $item->categories}{foreach $item->categories as $cat}<category>{$cat|escxml}</category>{/foreach}{/if}
        {if $item->comments}<comments>{$item->comments|escxml}</comments>{/if}
        {if $item->enclosure}<enclosure url="{$item->enclosure['url']|escxml}" length="{$item->enclosure['size']|escxml}" type="{$item->enclosure['mimetype']|escxml}"/>{/if}
        {if $item->sourceUrl}<source url="{$item->sourceUrl|escxml}">{$item->sourceTitle|escxml}</source>{/if}
    </item>
  {/foreach}

 </channel>
</rss>