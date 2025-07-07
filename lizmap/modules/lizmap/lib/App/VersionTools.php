<?php

/**
 * Version tools for Lizmap.
 *
 * @author    3Liz
 * @copyright 2025 3liz
 *
 * @see      https://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

class VersionTools
{
    /**
     * Drop the build ID from a semantic version name.
     * For instance, 3.10.0-pre.8697 → 3.10.0-pre.
     *
     * @param string $version The version to clean
     *
     * @return string The cleaned version
     */
    public static function dropBuildId(string $version): string
    {
        $version = explode('.', $version);
        $version = array_slice($version, 0, 3);

        return implode('.', $version);
    }

    /**
     * Transform integer QGIS version major minor to the human name.
     * For instance, 0340 → 3.40.
     *
     * @param mixed $qgisIntVersion
     *
     * @return string The cleaned version
     */
    public static function qgisMajMinHumanVersion($qgisIntVersion): string
    {
        // NOTE Will work as long a Major version is on 1 Digit
        return substr($qgisIntVersion, 0, 1).'.'.substr($qgisIntVersion, -2);
    }

    /**
     * Transform int formatted version (from 5 or 6 integer) to a sortable string.
     *
     * Transform "10102" into "01.01.02"
     * Transform "050912" into "05.09.12"
     *
     * @param string $intVersion the lizmap QGIS plugin version (not always int !!)
     *
     * @return string the version as sortable string
     */
    public static function intVersionToSortableString(string $intVersion): string
    {
        if ($intVersion == 'master' || $intVersion == 'dev') {
            return '00.00.00';
        }

        // in some old plugin the version is already human readable
        if (strpos($intVersion, '.') != false) {
            list($majorVersion, $minorVersion, $patchVersion) = explode('.', $intVersion);
            // add 0 to 1 digit version
            $majorVersion = (strlen($majorVersion) == 1 ? '0'.$majorVersion : $majorVersion);
            $minorVersion = (strlen($minorVersion) == 1 ? '0'.$minorVersion : $minorVersion);
            $patchVersion = (strlen($patchVersion) == 1 ? '0'.$patchVersion : $patchVersion);
        } else {
            $intVersion6Digit = (strlen($intVersion) == 6 ? $intVersion : '0'.$intVersion);
            list($majorVersion, $minorVersion, $patchVersion) = str_split($intVersion6Digit, 2);
        }

        return $majorVersion.'.'.$minorVersion.'.'.$patchVersion;
    }

    /**
     * Transform a QGIS version with its name to a sortable int version.
     *
     * Transform "3.34.12-Prizren" into "33412"
     *
     * @param string $versionString Name of the version
     */
    public static function qgisVersionWithNameToInt(string $versionString): int
    {
        $version = VersionTools::dropBuildId($versionString);
        $version = explode('.', $version);

        return intval(intval($version[0]) * 10000 + intval($version[1]) * 100 + intval($version[2]));
    }

    /**
     * Transform int formatted version to a human readable string (remove useless 0),
     * (remove patch version if 00).
     *
     * Transform "101" into "1.1"
     * Transform "0590" into "5.90"
     * Transform "250208 into 25.2.8
     * Transform "031400 into 3.14
     *
     * @param string $intVersion a version number as int
     *                           (major version on 1 or 2 digit, min and patch version on 2 digit)
     *
     * @return string the version as human readable string
     */
    public static function intVersionToHumanString(string $intVersion, bool $stripPatch = false): string
    {
        $intVersion6Digit = (strlen($intVersion) == 6 ? $intVersion : '0'.$intVersion);
        list($majorVersion, $minorVersion, $patchVersion) = str_split($intVersion6Digit, 2);
        $patchSuffix = ($stripPatch ? '' : '.'.intval($patchVersion));

        return intval($majorVersion).'.'.intval($minorVersion).$patchSuffix;
    }
}
