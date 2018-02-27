<ServiceExceptionReport version="1.3.0" xmlns="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/ogc http://schemas.opengis.net/wms/1.3.0/exceptions_1_3_0.xsd">
{foreach $messages as $type_msg => $all_msg}
  <ServiceException{if $type_msg != 'default'} code="{$type_msg}"{/if}>
    {foreach $all_msg as $msg}
    {$msg}
    {/foreach}
  </ServiceException>
{/foreach}
</ServiceExceptionReport>
