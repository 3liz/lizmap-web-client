<?php

use Lizmap\Request\WMSRequest;

class WMSRequestForTests extends WMSRequest
{
    public function getContextForTests()
    {
        return $this->process_getcontext();
    }

    public function checkMaximumWidthHeightForTests()
    {
        return $this->checkMaximumWidthHeight();
    }

    public function useCacheForTests($configLayer, $params, $profile)
    {
        return $this->useCache($configLayer, $params, $profile);
    }

    public function getRegexpMediaUrlsForTests()
    {
        return self::$regexp_media_urls;
    }

    public function replaceMediaPathByMediaUrlForTests($matches)
    {
        return '"getMedia?path='.$matches[1].'"';
    }
}
