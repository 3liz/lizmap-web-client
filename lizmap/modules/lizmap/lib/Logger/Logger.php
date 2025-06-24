<?php

namespace Lizmap\Logger;

use Psr\Log\AbstractLogger;
use Psr\Log\InvalidArgumentException;

class Logger extends AbstractLogger
{
    /**
     * Logs with an arbitrary level.
     *
     * @param mixed $level
     *
     * @throws InvalidArgumentException
     */
    public function log($level, string|\Stringable $message, array $context = array())
    {
        \jLog::log($message, $level);
    }
}
