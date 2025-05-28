<?php

/**
 * locales loader.
 *
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

/**
 * Allow to load all locales from a locales file.
 */
class LocalesLoader
{
    /**
     * @var LocalesBundle[][]
     */
    protected static $bundles = array();

    /**
     * It returns all translations stored in the file indicated by the given key.
     *
     * @param string $key    a locale key. Only module and file prefix filename is required
     * @param string $locale
     *
     * @return array all translations
     *
     * @throws \jExceptionSelector
     */
    public static function getLocalesFrom($key, $locale = null)
    {
        // to be sure we have a valid syntax for the locale selector, we add this string.
        $key .= '.foo';

        // With Jelix 1.9+
        if (method_exists('jLocale', 'getBundle')) {
            return \jLocale::getBundle($key, $locale)->getAllKeys();
        }

        // with Jelix 1.8
        try {
            $file = new \jSelectorLoc($key, $locale);
        } catch (\jExceptionSelector $e) {
            // the file is not found
            if ($e->getCode() == 12) {
                // unknown module..
                throw $e;
            }

            throw new \Exception('(212)No locale file found for the given locale key "'.$key
                .'" in any other default languages');
        }

        $locale = $file->locale;
        $keySelector = $file->module.'~'.$file->fileKey;

        if (!isset(self::$bundles[$keySelector][$locale])) {
            self::$bundles[$keySelector][$locale] = new LocalesBundle($file, $locale);
        }

        $bundle = self::$bundles[$keySelector][$locale];

        return $bundle->getAllKeys();
    }
}
