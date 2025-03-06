<?php

class LizmapTilerForTests
{
    public static $tileCapFail;

    public static $tileCaps;

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
