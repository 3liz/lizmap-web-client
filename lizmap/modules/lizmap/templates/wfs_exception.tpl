<ServiceExceptionReport version="1.2.0" xmlns="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/ogc http://schemas.opengis.net/wfs/1.0.0/OGC-exception.xsd">
{foreach $messages as $type_msg => $all_msg}
  <ServiceException{if $type_msg != 'default'} code="{$type_msg}"{/if}>
    {foreach $all_msg as $msg}
    {$msg}
    {/foreach}
  </ServiceException>
{/foreach}
</ServiceExceptionReport>
