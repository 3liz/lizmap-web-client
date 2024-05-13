<ows:ExceptionReport xmlns:ows="http://www.opengis.net/ows/1.1"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://www.opengis.net/ows/1.1 http://schemas.opengis.net/ows/1.1.0/owsExceptionReport.xsd"
	version="1.0.0" xml:lang="en">
{foreach $messages as $type_msg => $all_msg}
	<ows:Exception{if $type_msg != 'default'} exceptionCode="{$type_msg}"{/if}>
    {foreach $all_msg as $msg}
		<ows:ExceptionText>{$msg}</ows:ExceptionText>
    {/foreach}
	</ows:Exception>
{/foreach}
</ows:ExceptionReport>
