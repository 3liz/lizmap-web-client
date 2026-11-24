<?php

use Lizmap\App\Checker;

/**
 * Checker without authentication driver, events nor session, for the BASIC authentication tests.
 */
class CheckerForTests extends Checker
{
    /**
     * @var array<string, string> Valid passwords, by login
     */
    public static $passwords = array();

    /**
     * @var array<string, array> Responses returned by the listeners, by event name
     */
    public static $eventResponses = array();

    /**
     * @var string[] Names of the notified events, in order
     */
    public static $notifiedEvents = array();

    /**
     * @var null|object The user set for the request
     */
    public static $requestUser;

    /**
     * @var int Number of times the session has been closed
     */
    public static $sessionClosedCount = 0;

    /**
     * Reset the state of the fake driver, events and session.
     *
     * @param array<string, string> $passwords Valid passwords, by login
     */
    public static function reset($passwords = array())
    {
        self::$passwords = $passwords;
        self::$eventResponses = array();
        self::$notifiedEvents = array();
        self::$requestUser = null;
        self::$sessionClosedCount = 0;
    }

    /**
     * Check the password against the static list of passwords.
     *
     * @param string $login    The login sent by the client
     * @param string $password The password sent by the client
     *
     * @return false|object The user, or false if the login or the password is wrong
     */
    protected static function verifyPassword($login, $password)
    {
        if (!isset(self::$passwords[$login]) || self::$passwords[$login] !== $password) {
            return false;
        }
        $user = new stdClass();
        $user->login = $login;

        return $user;
    }

    /**
     * Record the event and return the configured responses.
     *
     * @param string $name   The event name
     * @param array  $params The event parameters
     *
     * @return array The configured responses of the listeners
     */
    protected static function notifyAuthEvent($name, $params)
    {
        self::$notifiedEvents[] = $name;

        return self::$eventResponses[$name] ?? array();
    }

    /**
     * Store the user in a static property instead of $_SESSION.
     *
     * @param object $user The authenticated user
     */
    protected static function setRequestUser($user)
    {
        self::$requestUser = $user;
    }

    /**
     * Count the session closings instead of closing the session.
     */
    protected static function closeSessionWithoutWriting()
    {
        ++self::$sessionClosedCount;
    }
}
