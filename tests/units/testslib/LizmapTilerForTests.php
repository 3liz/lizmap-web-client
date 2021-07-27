<?php


class LizmapTilerForTests
{
    public static $tileCapFail = null;

    public static $tileCaps = null;

    public static function getTileCapabilities($project)
    {
        if (self::$tileCapFail) {
            throw new Exception('fail just for test');
        }
        if (self::$tileCaps) {
            return self::$tileCaps;
        }
    }
}
