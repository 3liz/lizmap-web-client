<?php

use Lizmap\Request\WMTSRequest;


class WMTSRequestForTests extends WMTSRequest
{
    public function getCapabilitiesForTests()
    {
        return $this->process_getcapabilities();
    }
}
