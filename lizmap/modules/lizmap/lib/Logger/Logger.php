<?php

namespace Lizmap\Logger;

use Psr\Log\AbstractLogger;
use Psr\Log\InvalidArgumentException;
use Psr\Log\LogLevel;

/**
 * Logger is an implementation of the PSR-3 Logger Interface.
 *
 * This logger wraps \jLog with a log level.
 *
 * @author 3liz
 *
 * @see https://www.php-fig.org/psr/psr-3/
 * @see https://jelix.org/documentation/jelix/1.8/api/jLog
 */
class Logger extends AbstractLogger
{
    /**
     * Levels ordered from most important to least important
     * as defined in RFC 5424.
     *
     * @var string[]
     *
     * @see LogLevel
     */
    public const LogLevels = array(
        LogLevel::EMERGENCY,
        LogLevel::ALERT,
        LogLevel::CRITICAL,
        LogLevel::ERROR,
        LogLevel::WARNING,
        LogLevel::NOTICE,
        LogLevel::INFO,
        LogLevel::DEBUG,
    );

    /**
     * The default log level: error.
     *
     * @var string
     */
    public const DefaultLevel = LogLevel::ERROR;

    /**
     * The minimum logging level at which this logger will be used.
     *
     * @var string
     */
    protected $level;

    /**
     * Initialise the logger with a log level.
     *
     * @param string $level The minimum logging level at which this logger will be used
     *
     * @throws InvalidArgumentException
     *
     * @see LogLevel
     * @see setLevel()
     * @see https://www.php-fig.org/psr/psr-3/#5-psrlogloglevel
     */
    public function __construct(string $level = LogLevel::ERROR)
    {
        if (!in_array($level, self::LogLevels)) {
            throw new InvalidArgumentException('Invalid log level');
        }
        $this->level = $level;
    }

    /**
     * Get log level.
     */
    public function getLevel(): string
    {
        return $this->level;
    }

    /**
     * Set log level.
     *
     * @param string $level
     *
     * @throws InvalidArgumentException
     */
    public function setLevel($level): void
    {
        if (!in_array($level, self::LogLevels)) {
            throw new InvalidArgumentException('Invalid log level');
        }
        $this->level = $level;
    }

    /**
     * Check if the given level is high enough to be logged.
     *
     * This is used to avoid unnecessary logging.
     * For example, if the logger is set to LogLevel::ERROR, then LogLevel::INFO will not be logged.
     * But LogLevel::ERROR will be logged.
     * if the level is not in the list of LogLevels, it will be considered as not high enough.
     */
    public function isLevelHighEnough(string $level): bool
    {
        return in_array($level, self::LogLevels)
            && array_search($level, self::LogLevels) <= array_search($this->level, self::LogLevels);
    }

    /**
     * Logs with an arbitrary level.
     *
     * @param mixed              $level
     * @param string|\Stringable $message
     * @param array              $context
     *
     * @throws InvalidArgumentException
     */
    
    public function log($level, $message, array $context = array())
    {
        if (!in_array($level, self::LogLevels)) {
            throw new InvalidArgumentException('Invalid log level');
        }

        // If the level is not high enough, return early.
        if ($this->isLevelHighEnough($level)) {
            return;
        }

        \jLog::log(
            $this->interpolate((string) $message, $context),
            $level
        );
    }

    /**
     * Interpolates context values into message placeholders according to PSR-3 rules.
     *
     * This method replaces placeholders in the message with actual values
     * from the context array.
     *
     * @param string $message Message with placeholders
     * @param array  $context Values to replace placeholders
     *
     * @return string Interpolated message
     *
     * @see https://www.php-fig.org/psr/psr-3/#12-message
     */
    private function interpolate(string $message, array $context = array()): string
    {
        $replace = array();
        foreach ($context as $key => $val) {
            $replace['{'.$key.'}'] = $val;
        }

        return strtr($message, $replace);
    }
}
