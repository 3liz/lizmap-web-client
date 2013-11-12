<serviceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc">
{foreach $messages as $type_msg => $all_msg}
  <serviceException{if $type_msg != 'default'} code="{$type_msg}"{/if}>
    {foreach $all_msg as $msg}
    {$msg}
    {/foreach}
  </serviceException>
{/foreach}
</serviceExceptionReport>
