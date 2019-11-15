<?php

/*
 * CKFinder
 * ========
 * https://ckeditor.com/ckeditor-4/ckfinder/
 * Copyright (c) 2007-2019, CKSource - Frederico Knabben. All rights reserved.
 *
 * The software, this file and its contents are subject to the CKFinder
 * License. Please read the license.txt file before using, installing, copying,
 * modifying or distribute this file or part of its contents. The contents of
 * this file is part of the Source Code of CKFinder.
 */

namespace CKSource\CKFinder\Filesystem\File;

use CKSource\CKFinder\Backend\Backend;
use CKSource\CKFinder\Cache\CacheManager;
use CKSource\CKFinder\CKFinder;
use CKSource\CKFinder\Config;
use CKSource\CKFinder\Filesystem\Path;

/**
 * The File class.
 *
 * Base class for processed files.
 */
abstract class File
{
    /**
     * Constant used to mark files without extension.
     */
    const NO_EXTENSION = 'NO_EXT';

    /**
     * File name.
     *
     * @var string $fileName
     */
    protected $fileName;

    /**
     * CKFinder configuration.
     *
     * @var Config $config
     */
    protected $config;

    /**
     * @var CKFinder $app
     */
    protected $app;

    /**
     * Constructor.
     *
     * @param string   $fileName
     * @param CKFinder $app
     */
    public function __construct($fileName, CKFinder $app)
    {
        $this->fileName = $fileName;
        $this->config = $app['config'];
        $this->app = $app;
    }

    /**
     * Validates current file name.
     *
     * @return bool `true` if the file name is valid.
     */
    public function hasValidFilename()
    {
        return static::isValidName($this->fileName, $this->config->get('disallowUnsafeCharacters'));
    }

    /**
     * Returns current file name.
     *
     * @return string
     */
    public function getFilename()
    {
        return $this->fileName;
    }

    /**
     * Returns current file extension.
     *
     * @return string
     */
    public function getExtension()
    {
        return strtolower(pathinfo($this->fileName, PATHINFO_EXTENSION));
    }

    /**
     * Returns a list of current file extensions.
     *
     * For example for a file named `file.foo.bar.baz` it will return an array containing
     * `['foo', 'bar', 'baz']`.
     *
     * @param null $newFileName the file name to check if it is different than the current file name (for example for validation of
     *                          a new file name in edited files).
     *
     * @return array
     */
    public function getExtensions($newFileName = null)
    {
        $fileName = $newFileName ?: $this->fileName;

        if (strpos($fileName, '.') === false) {
            return null;
        }

        $pieces = explode('.', $fileName);

        array_shift($pieces); // Remove file base name

        return array_map('strtolower', $pieces);
    }

    /**
     * Renames the current file by adding a number to the file name.
     *
     * Renaming is done by adding a number in parenthesis provided that the file name does
     * not collide with any other file existing in the target backend/path.
     * For example, if the target backend path contains a file named `foo.txt`
     * and the current file name is `foo.txt`, this method will change the current file
     * name to `foo(1).txt`.
     *
     * @param Backend $backend target backend
     * @param string  $path    target backend-relative path
     *
     * @return bool `true` if file was renamed.
     */
    public function autorename(Backend $backend = null, $path = '')
    {
        $filePath = Path::combine($path, $this->fileName);

        if (!$backend->has($filePath)) {
            return false;
        }

        $pieces = explode('.', $this->fileName);
        $basename = array_shift($pieces);
        $extension = implode('.', $pieces);

        $i = 0;
        while (true) {
            $i++;
            $this->fileName = "{$basename}({$i})" . (!empty($extension) ? ".{$extension}" : '');

            $filePath = Path::combine($path, $this->fileName);

            if (!$backend->has($filePath)) {
                break;
            }
        }

        return true;
    }

    /**
     * Check whether `$fileName` is a valid file name. Returns `true` on success.
     *
     * @param string $fileName
     * @param bool   $disallowUnsafeCharacters
     *
     * @return boolean `true` if `$fileName` is a valid file name.
     */
    public static function isValidName($fileName, $disallowUnsafeCharacters = true)
    {
        if (null === $fileName || !strlen(trim($fileName)) || substr($fileName, -1, 1) == "." || false !== strpos($fileName, "..")) {
            return false;
        }

        if (preg_match(',[[:cntrl:]]|[/\\\\:\*\?\"\<\>\|],', $fileName)) {
            return false;
        }

        if ($disallowUnsafeCharacters) {
            if (strpos($fileName, ";") !== false) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks if the current file has an image extension.
     *
     * @return bool `true` if the file name has an image extension.
     */
    public function isImage()
    {
        $imagesExtensions = array('gif', 'jpeg', 'jpg', 'png', 'psd', 'bmp', 'tiff', 'tif',
            'swc', 'iff', 'jpc', 'jp2', 'jpx', 'jb2', 'xbm', 'wbmp');

        return in_array($this->getExtension(), $imagesExtensions);
    }

    /**
     * Secures the file name from unsafe characters.
     *
     * @param string $fileName
     * @param bool   $disallowUnsafeCharacters
     *
     * @return string
     */
    public static function secureName($fileName, $disallowUnsafeCharacters = true, $forceAscii = false)
    {
        $fileName = str_replace(array(":", "*", "?", "|", "/"), "_", $fileName);

        if ($disallowUnsafeCharacters) {
            $fileName = str_replace(";", "_", $fileName);
        }

        if ($forceAscii) {
            $fileName = static::convertToAscii($fileName);
        }

        return $fileName;
    }

    /**
     * Replace accented UTF-8 characters with unaccented ASCII-7 "equivalents".
     * The purpose of this function is to replace characters commonly found in Latin
     * alphabets with something more or less equivalent from the ASCII range. This can
     * be useful for example for converting UTF-8 to something ready for a file name.
     * After the use of this function, you would probably also pass the string
     * through `utf8_strip_non_ascii` to clean out any other non-ASCII characters.
     *
     * For a more complete implementation of transliteration, see the `utf8_to_ascii` package
     * available from the phputf8 project downloads:
     * http://prdownloads.sourceforge.net/phputf8
     *
     * @param string $str
     *
     * @return string Accented chars replaced with ASCII equivalents
     * @author Andreas Gohr <andi@splitbrain.org>
     * @see http://sourceforge.net/projects/phputf8/
     */
    public static function convertToAscii($str)
    {
        static $utf8LowerAccents = null;
        static $utf8UpperAccents = null;

        if (is_null($utf8LowerAccents)) {
            $utf8LowerAccents = array(
                'à' => 'a', 'ô' => 'o', 'ď' => 'd', 'ḟ' => 'f', 'ë' => 'e', 'š' => 's', 'ơ' => 'o',
                'ß' => 'ss', 'ă' => 'a', 'ř' => 'r', 'ț' => 't', 'ň' => 'n', 'ā' => 'a', 'ķ' => 'k',
                'ŝ' => 's', 'ỳ' => 'y', 'ņ' => 'n', 'ĺ' => 'l', 'ħ' => 'h', 'ṗ' => 'p', 'ó' => 'o',
                'ú' => 'u', 'ě' => 'e', 'é' => 'e', 'ç' => 'c', 'ẁ' => 'w', 'ċ' => 'c', 'õ' => 'o',
                'ṡ' => 's', 'ø' => 'o', 'ģ' => 'g', 'ŧ' => 't', 'ș' => 's', 'ė' => 'e', 'ĉ' => 'c',
                'ś' => 's', 'î' => 'i', 'ű' => 'u', 'ć' => 'c', 'ę' => 'e', 'ŵ' => 'w', 'ṫ' => 't',
                'ū' => 'u', 'č' => 'c', 'ö' => 'oe', 'è' => 'e', 'ŷ' => 'y', 'ą' => 'a', 'ł' => 'l',
                'ų' => 'u', 'ů' => 'u', 'ş' => 's', 'ğ' => 'g', 'ļ' => 'l', 'ƒ' => 'f', 'ž' => 'z',
                'ẃ' => 'w', 'ḃ' => 'b', 'å' => 'a', 'ì' => 'i', 'ï' => 'i', 'ḋ' => 'd', 'ť' => 't',
                'ŗ' => 'r', 'ä' => 'ae', 'í' => 'i', 'ŕ' => 'r', 'ê' => 'e', 'ü' => 'ue', 'ò' => 'o',
                'ē' => 'e', 'ñ' => 'n', 'ń' => 'n', 'ĥ' => 'h', 'ĝ' => 'g', 'đ' => 'd', 'ĵ' => 'j',
                'ÿ' => 'y', 'ũ' => 'u', 'ŭ' => 'u', 'ư' => 'u', 'ţ' => 't', 'ý' => 'y', 'ő' => 'o',
                'â' => 'a', 'ľ' => 'l', 'ẅ' => 'w', 'ż' => 'z', 'ī' => 'i', 'ã' => 'a', 'ġ' => 'g',
                'ṁ' => 'm', 'ō' => 'o', 'ĩ' => 'i', 'ù' => 'u', 'į' => 'i', 'ź' => 'z', 'á' => 'a',
                'û' => 'u', 'þ' => 'th', 'ð' => 'dh', 'æ' => 'ae', 'µ' => 'u', 'ĕ' => 'e',
            );
        }

        if (is_null($utf8UpperAccents)) {
            $utf8UpperAccents = array(
                'À' => 'A', 'Ô' => 'O', 'Ď' => 'D', 'Ḟ' => 'F', 'Ë' => 'E', 'Š' => 'S', 'Ơ' => 'O',
                'Ă' => 'A', 'Ř' => 'R', 'Ț' => 'T', 'Ň' => 'N', 'Ā' => 'A', 'Ķ' => 'K',
                'Ŝ' => 'S', 'Ỳ' => 'Y', 'Ņ' => 'N', 'Ĺ' => 'L', 'Ħ' => 'H', 'Ṗ' => 'P', 'Ó' => 'O',
                'Ú' => 'U', 'Ě' => 'E', 'É' => 'E', 'Ç' => 'C', 'Ẁ' => 'W', 'Ċ' => 'C', 'Õ' => 'O',
                'Ṡ' => 'S', 'Ø' => 'O', 'Ģ' => 'G', 'Ŧ' => 'T', 'Ș' => 'S', 'Ė' => 'E', 'Ĉ' => 'C',
                'Ś' => 'S', 'Î' => 'I', 'Ű' => 'U', 'Ć' => 'C', 'Ę' => 'E', 'Ŵ' => 'W', 'Ṫ' => 'T',
                'Ū' => 'U', 'Č' => 'C', 'Ö' => 'Oe', 'È' => 'E', 'Ŷ' => 'Y', 'Ą' => 'A', 'Ł' => 'L',
                'Ų' => 'U', 'Ů' => 'U', 'Ş' => 'S', 'Ğ' => 'G', 'Ļ' => 'L', 'Ƒ' => 'F', 'Ž' => 'Z',
                'Ẃ' => 'W', 'Ḃ' => 'B', 'Å' => 'A', 'Ì' => 'I', 'Ï' => 'I', 'Ḋ' => 'D', 'Ť' => 'T',
                'Ŗ' => 'R', 'Ä' => 'Ae', 'Í' => 'I', 'Ŕ' => 'R', 'Ê' => 'E', 'Ü' => 'Ue', 'Ò' => 'O',
                'Ē' => 'E', 'Ñ' => 'N', 'Ń' => 'N', 'Ĥ' => 'H', 'Ĝ' => 'G', 'Đ' => 'D', 'Ĵ' => 'J',
                'Ÿ' => 'Y', 'Ũ' => 'U', 'Ŭ' => 'U', 'Ư' => 'U', 'Ţ' => 'T', 'Ý' => 'Y', 'Ő' => 'O',
                'Â' => 'A', 'Ľ' => 'L', 'Ẅ' => 'W', 'Ż' => 'Z', 'Ī' => 'I', 'Ã' => 'A', 'Ġ' => 'G',
                'Ṁ' => 'M', 'Ō' => 'O', 'Ĩ' => 'I', 'Ù' => 'U', 'Į' => 'I', 'Ź' => 'Z', 'Á' => 'A',
                'Û' => 'U', 'Þ' => 'Th', 'Ð' => 'Dh', 'Æ' => 'Ae', 'Ĕ' => 'E',
            );
        }


        $str = str_replace(array_keys($utf8LowerAccents), array_values($utf8LowerAccents), $str);

        $str = str_replace(array_keys($utf8UpperAccents), array_values($utf8UpperAccents), $str);

        return $str;
    }

    /**
     * @return CacheManager
     */
    public function getCache()
    {
        return $this->app['cache'];
    }
}
