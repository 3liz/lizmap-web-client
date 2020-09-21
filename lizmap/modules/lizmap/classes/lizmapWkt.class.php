<?php
/**
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapWkt
{
    /** @var regExes[] */
    protected static $regExes = array(
        'typeStr' => '/^\s*(\w+)\s*(\w+)?\s*\(\s*(.*)\s*\)\s*$/',
        'spaces' => '/\s+/',
        'parenComma' => '/\)\s*,\s*\(/',
        'doubleParenComma' => '/\)\s*\)\s*,\s*\(\s*\(/',  // can't use {2} here
        'trimParens' => '/^\s*\(?(.*?)\)?\s*$/',
    );

    /**
     * Return a geometry array likes it is defined in GeoJSON.
     *
     * @param string $wkt A WKT string
     *
     * @return null|array The geometry as described in GeoJSON
     */
    public static function parse($wkt)
    {
        // Extracting geometry type, dimension and coordinates
        preg_match(self::$regExes['typeStr'], $wkt, $matches);
        if (count($matches) != 4) {
            return null;
        }
        $geomType = strtolower($matches[1]);
        $dim = strtolower($matches[2]);
        $str = $matches[3];

        if (substr($geomType, -2) === 'zm') {
            $geomType = substr($geomType, 0, -2);
            $dim = 'zm';
        } elseif (substr($geomType, -2) === 'mz') {
            $geomType = substr($geomType, 0, -2);
            $dim = 'mz';
        } elseif (substr($geomType, -1) === 'z') {
            $geomType = substr($geomType, 0, -1);
            $dim = 'z';
        } elseif (substr($geomType, -1) === 'm') {
            $geomType = substr($geomType, 0, -1);
            $dim = 'm';
        }

        // Get coordinates
        $coordinates = null;
        if ($geomType === 'point') {
            $coordinates = self::parsePoint($str);
        } elseif ($geomType === 'linestring') {
            $coordinates = self::parseLineString($str);
        } elseif ($geomType === 'polygon') {
            $coordinates = self::parsePolygon($str);
        }

        if ($coordinates === null) {
            return null;
        }

        $geometry = array();
        if ($geomType === 'point') {
            $geometry['type'] = 'Point';
        } elseif ($geomType === 'linestring') {
            $geometry['type'] = 'LineString';
        } elseif ($geomType === 'polygon') {
            $geometry['type'] = 'Polygon';
        }
        $geometry['coordinates'] = $coordinates;

        return $geometry;
    }

    /**
     * Return a Point coordinates array.
     *
     * @param string $str A WKT fragment representing the Point
     *
     * @return null|array The Point coordinates, array of coordinates
     *
     * @protected
     */
    protected static function parsePoint($str)
    {
        $coords = preg_split(self::$regExes['spaces'], trim($str));
        if (count($coords) < 2 || !is_numeric($coords[0]) || !is_numeric($coords[0])) {
            return null;
        }

        return array(floatval($coords[0]), floatval($coords[1]));
    }

    /**
     * Return a LineString coordinates array.
     *
     * @param string $str A WKT fragment representing the LineString
     *
     * @return null|array The LinString coordinates, array of Points
     *
     * @protected
     */
    protected static function parseLineString($str)
    {
        $components = array();
        $points = explode(',', trim($str));
        foreach ($points as $point) {
            $coords = self::parsePoint($point);
            if ($coords === null) {
                return null;
            }
            $components[] = $coords;
        }

        return $components;
    }

    /**
     * Return a Polygon coordinates array.
     *
     * @param string $str A WKT fragment representing the Polygon
     *
     * @return null|array The Polygon coordinates, array of LinearRings
     *
     * @protected
     */
    protected static function parsePolygon($str)
    {
        $components = array();
        $rings = preg_split(self::$regExes['parenComma'], trim($str));
        foreach ($rings as $ring) {
            $ring = preg_replace(self::$regExes['trimParens'], '$1', $ring);
            $linearring = self::parseLineString($ring);
            if ($linearring === null) {
                return null;
            }
            $components[] = $linearring;
        }

        return $components;
    }
}
