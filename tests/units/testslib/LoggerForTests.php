<?php

use Lizmap\Logger as Log;

class LoggerForTests extends Log\Logger
{
    public function interpolateForTests($message, $context = array())
    {
        return $this->interpolate($message, $context);
    }
}
