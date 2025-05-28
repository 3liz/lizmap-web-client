<?php

/**
 * locale bundle loader.
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
 * Do not use directly. It will disappear when using futur Jelix versions.
 *
 * @internal
 */
class LocalesBundle extends \jBundle
{
    /**
     * Get all translations of the bundle.
     *
     * @param null|string $charset
     *
     * @return array
     */
    public function getAllKeys($charset = null)
    {
        if ($charset == null) {
            $charset = \jApp::config()->charset;
        }
        if (!in_array($charset, $this->_loadedCharset)) {
            $this->_loadLocales($charset);
        }

        return $this->_strings[$charset];
    }
}
