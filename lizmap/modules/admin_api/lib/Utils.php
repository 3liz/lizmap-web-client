<?php

namespace LizmapApi;

class Utils
{
    /**
     * Extracts and returns last part of a given path with a trailing slash.
     *
     * @param string $path the directory path to process
     *
     * @return string the last portion of the path, formatted with a trailing slash
     */
    public static function getLastPartPath(string $path): string
    {
        $array = explode('/', $path);
        $length = count($array);

        // Sometimes paths doesn't end with a '/'
        if ($array[$length - 1] == '') {
            return $array[$length - 2].'/';
        }

        return $array[$length - 1].'/';

    }
}
