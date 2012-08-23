<feed xmlns="http://www.w3.org/2005/Atom"
	xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
    xmlns:err="http://jelix.org/ns/xmlerror/1.0"
	xml:lang="{$lang}">

  <title>{$atom->title|escxml}</title>
  <id>{$atom->id|escxml}</id>
  <updated>{$atom->updated|jdatetime:'db_datetime':'iso8601'}</updated>

  {foreach $atom->authors as $author}
  <author>
   {if $author['name']}<name>{$author['name']|escxml}</name>{/if}
   {if $author['email']}<email>{$author['email']|escxml}</email>{/if}
   {if $author['uri']}<uri>{$author['uri']|escxml}</uri>{/if}
  </author>
  {/foreach}

  {if $atom->webSiteUrl}
    <link rel="alternate" type="text/html" hreflang="{$lang}" href="{$atom->webSiteUrl|escxml}"/>
  {/if}{if $atom->selfLink}
    <link rel="self" type="application/atom+xml"  href="{$atom->selfLink|escxml}"/>
  {/if}
  {foreach $atom->otherLinks as $link}
    <link href="{$link['href']|escxml}" rel="{$link['rel']}" type="{$link['type']}" hreflang="{$link['hreflang']}" title="{$link['title']|escxml}" length="{$link['length']}"/>
  {/foreach}
  {foreach $atom->categories as $cat}
     <category term="{$cat|escxml}"/>
  {/foreach}
  {foreach $atom->contributors as $contributor}
     <contributor>{if $contributor['name']}<name>{$contributor['name']|escxml}</name>{/if}
        {if $contributor['email']}<email>{$contributor['email']|escxml}</email>{/if}
        {if $contributor['uri']}<uri>{$contributor['uri']|escxml}</uri>{/if}</contributor>
  {/foreach}
  {if $atom->generator}<generator {if $atom->generatorVersion}uri="{$atom->generatorVersion}"{/if} {if $atom->generatorUrl}version="{$atom->generatorUrl|escxml}"{/if}>{$atom->generator|escxml}</generator>{/if}
  {if $atom->icon}<icon>{$atom->icon|escxml}</icon>{/if}
  {if $atom->image}<logo>{$atom->image|escxml}</logo>{/if}
  {if $atom->copyright}<rights>{$atom->copyright|escxml}</rights>{/if}
  {if $atom->description}<subtitle type="{$atom->descriptionType}">{if $atom->descriptionType=='xhtml'}
    <div xmlns="http://www.w3.org/1999/xhtml">{$atom->description}</div>
    {else}{$atom->description|escxml}{/if}</subtitle>{/if}

  {foreach $items as $item}
  <entry>
    {if $item->id}   <id>{$item->id|escxml}</id> {else}<id>{$item->link|escxml}</id>{/if}
   <title>{$item->title|escxml}</title>
   {if $item->updated}
    <updated>{$item->updated|jdatetime:'db_datetime':'iso8601'}</updated>
   {else}
    <updated>{$item->published|jdatetime:'db_datetime':'iso8601'}</updated>
   {/if}
   <published>{$item->published|jdatetime:'db_datetime':'iso8601'}</published>
   {if $item->link}<link rel="alternate" type="text/html" href="{$item->link|escxml}"/>{/if}
   {if $item->authorName}<author><name>{$item->authorName|escxml}</name>
      {if $item->authorEmail}<email>{$item->authorEmail|escxml}</email>{/if}
      {if $item->authorUri}<uri>{$item->authorUri|escxml}</uri>{/if}</author>{/if}
  {foreach $item->otherAuthors as $author}
    <author>
    {if $author['name']}<name>{$author['name']|escxml}</name>{/if}
    {if $author['email']}<email>{$author['email']|escxml}</email>{/if}
    {if $author['uri']}<uri>{$author['uri']|escxml}</uri>{/if}
    </author>
  {/foreach}
  {foreach $item->contributors as $contributor}
     <contributor>
        {if $contributor['name']}<name>{$contributor['name']|escxml}</name>{/if}
        {if $contributor['email']}<email>{$contributor['email']|escxml}</email>{/if}
        {if $contributor['uri']}<uri>{$contributor['uri']|escxml}</uri>{/if}
     </contributor>
  {/foreach}
  {foreach $item->categories as $cat}
     <category term="{$cat|escxml}"/>
  {/foreach}
   {foreach $item->otherLinks as $link}
        <link href="{$link['href']|escxml}" rel="{$link['rel']}" type="{$link['type']}" hreflang="{$link['hreflang']}" title="{$link['title']|escxml}" length="{$link['length']}"/>
  {/foreach}
   {if $item->copyright}<rights>{$item->copyright|escxml}</rights>{/if }
   {if $item->summary}<content type="{$item->summaryType}">{if $item->summaryType=='xhtml'}
    <div xmlns="http://www.w3.org/1999/xhtml">{$item->summary}</div>
    {else}{$item->summary|escxml}{/if}</content>{/if}

   {if $item->content}<content type="{$item->contentType}">{if $item->contentType=='xhtml'}
    <div xmlns="http://www.w3.org/1999/xhtml">{$item->content}</div>
    {else}{$item->content|escxml}{/if}</content>{/if}

   {if $item->source}<source>{$source}</source>{/if}
  </entry>
  {/foreach}
</feed>