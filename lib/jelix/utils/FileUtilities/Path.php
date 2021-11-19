<?php

/**
 * @author       Laurent Jouanneau
 * @copyright    2015-2016 Laurent Jouanneau
 *
 * @link         http://jelix.org
 * @licence      MIT
 */
namespace Jelix\FileUtilities;

class Path
{
    const NORM_ADD_TRAILING_SLASH = 1;

    /**
     * normalize a path : translate '..', '.', replace '\' by '/' and so on..
     * support windows path.
     * 
     * when $path is relative, it can be resolved against the given $basePath.
     *
     * @param string $path
     * @param int    $options  see NORM_* const
     * @param string $basePath
     *
     * @return string the normalized path
     */
    public static function normalizePath($path, $options = 0, $basePath = '')
    {
        list($prefix, $path, $absolute) = self::_normalizePath($path, false, $basePath);
        if (!is_string($path)) {
            $path = implode('/', $path);
        }

        $path = $prefix.($absolute ? '/' : '').$path;
        if ($options & self::NORM_ADD_TRAILING_SLASH) {
            $path .= '/';
        }

        return $path;
    }

    /**
     * says if the given path is an absolute one or not.
     *
     * @param string $path
     *
     * @return bool true if the path is absolute
     */
    public static function isAbsolute($path)
    {
        list($prefix, $path, $absolute) = self::_startNormalize($path);

        return $absolute;
    }

    /**
     * calculate the shortest path between two directories.
     *
     * @param string $from absolute path from which we should start
     * @param string $to   absolute path to which we should go
     *
     * @return string relative path between the two path
     */
    public static function shortestPath($from, $to)
    {
        list($fromprefix, $from, $fromabsolute) = self::_normalizePath($from, true);
        list($toprefix, $to, $toabsolute) = self::_normalizePath($to, true);
        if (!$fromabsolute) {
            throw new \InvalidArgumentException('The \'from\' path should be absolute');
        }
        if (!$toabsolute) {
            throw new \InvalidArgumentException('The \'to\' path should be absolute');
        }
        if ($fromprefix != $toprefix) {
            return $toprefix.'/'.rtrim(implode('/', $to), '/');
        }
        while (count($from) && count($to) && $from[0] == $to[0]) {
            array_shift($from);
            array_shift($to);
        }

        if (!count($from)) {
            if (!count($to)) {
                return '.';
            }
            $prefix = '';
        } else {
            $prefix = rtrim(str_repeat('../', count($from)), '/');
        }
        if (!count($to)) {
            $suffix = '';
        } else {
            $suffix = implode('/', $to);
        }

        return $prefix.($suffix != '' && $prefix != '' ? '/' : '').$suffix;
    }

    /**
     * it returns components of a path after normalization, in an array.
     *
     * - first element: for windows path, the drive part "C:", "C:" etc... always in uppercase
     * - second element: the normalized path. as string or array depending of $alwaysArray
     *                 when as string: no trailing slash.
     * - third element: indicate if the given path is an absolute path (true) or not (false)
     *
     * @param bool $alwaysArray if true, second element is an array
     *
     * @return array
     */
    protected static function _normalizePath($originalPath, $alwaysArray, $basePath = '')
    {
        list($prefix, $path, $absolute) = self::_startNormalize($originalPath);
        if (!$absolute && $basePath) {
            list($prefix, $path, $absolute) = self::_startNormalize($basePath.'/'.$originalPath);
        }
        if ($absolute && $path != '') {
            // remove leading '/' for path
            if ($path == '/') {
                $path = '';
            } else {
                $path = substr($path, 1);
            }
        }

        if (strpos($path, './') === false && substr($path, -1) != '.') {
            // if there is no relative path component like ../ or ./, we can
            // return directly the path informations
            if ($alwaysArray) {
                if ($path == '') {
                    return array($prefix, array(), $absolute);
                }

                return array($prefix, explode('/', rtrim($path, '/')), $absolute);
            } else {
                if ($path == '') {
                    return array($prefix, $path, $absolute);
                }

                return array($prefix, rtrim($path, '/'), $absolute);
            }
        }
        $path = explode('/', $path);
        $path2 = array();
        $up = false;
        foreach ($path as $chunk) {
            if ($chunk === '..') {
                if (count($path2)) {
                    if (end($path2) != '..') {
                        array_pop($path2);
                    } else {
                        $path2[] = '..';
                    }
                } elseif (!$absolute) {
                    // for non absolute path, we keep leading '..'
                    $path2[] = '..';
                }
            } elseif ($chunk !== '' && $chunk != '.') {
                $path2[] = $chunk;
            }
        }

        return array($prefix, $path2, $absolute);
    }

    protected static function _startNormalize($path)
    {
        $path = str_replace('\\', '/', $path);
        $path = preg_replace('#(/+)#', '/', $path);
        $prefix = '';
        $absolute = false;
        if (preg_match('#^([a-z]:)/#i', $path, $m)) {
            // support Windows path
            $prefix = strtoupper($m[1]);
            $path = substr($path, 2);
            $absolute = true;
        } else {
            $absolute = ($path[0] == '/');
        }

        return array($prefix, $path, $absolute);
    }
}
