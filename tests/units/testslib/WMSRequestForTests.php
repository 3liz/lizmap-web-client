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
}
