<?php

use Lizmap\Logger as Log;

class ConfigForTests extends Log\Config
{
    public function modifyForTests($data)
    {
        return $this->modify($data);
    }
}
