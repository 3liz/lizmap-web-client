<?php

/**
 * Controlers tools for Lizmap.
 *
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class ControllerTools
{
    /**
     * Check if we are in a browser or an external client.
     */
    public static function clientIsABrowser(): bool
    {
        // In browser, Lizmap UI sends full service URL in referer
        $inBrowser = true;
        $referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
        if (!empty($referer)) {
            $referer_parse = parse_url($referer);
            if (array_key_exists('host', $referer_parse)) {
                $referer_domain = $referer_parse['host'];
                $domain = \jApp::coord()->request->getDomainName();
                if (!empty($domain) && $referer_domain != $domain) {
                    $inBrowser = false;
                }
            }
        } else {
            $inBrowser = false;
        }

        return $inBrowser;
    }
}
