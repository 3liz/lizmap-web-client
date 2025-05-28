<?php

/**
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

/**
 * @phpstan-type WktMatches array{geomType: string, dim: string, str: string}
 */
class lizmapWkt
{
    /** @var array<string, string> */
    protected static $regExes = array(
        'typeStr' => '/^\s*(\w+)\s*(\w+)?\s*\(\s*(.*)\s*\)\s*$/',
        'spaces' => '/\s+/',
        'parenComma' => '/\)\s*,\s*\(/',
        'doubleParenComma' => '/\)\s*\)\s*,\s*\(\s*\(/',  // can't use {2} here
        'trimParens' => '/^\s*\(?(.*?)\)?\s*$/',
        'checkCoordinates' => '/^[0-9 \(\)\.,-]*$/',
    );

    /**
     * Check if the WKT string is well formed.
     *
     * @param string $wkt A WKT string
     *
     * @return false|WktMatches The WKT string is well formed
     */
    public static function check($wkt)
    {
        preg_match(self::$regExes['typeStr'], $wkt, $matches);

        if (count($matches) != 4) {
            return false;
        }
        // geomType has not to be empty
        if (empty($matches[1])) {
            return false;
        }
        // the string has not to been empty
        if (empty($matches[3]) || !preg_match(self::$regExes['checkCoordinates'], $matches[3])) {
            return false;
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

        return array(
            'geomType' => $geomType,
            'dim' => $dim,
            'str' => $str,
        );
    }

    /**
     * Return a WKT string corrected with space between geometry type and dimension as upper case.
     *
     * @param string $wkt A WKT string
     *
     * @return null|string The WKT string corrected with space between geometry type and dimension as upper case
     */
    public static function fix($wkt)
    {
        // Checking and extracting geometry type, dimension and coordinates
        $matches = self::check($wkt);
        if (!$matches) {
            return null;
        }

        $nWkt = $matches['geomType'];
        if ($matches['dim'] !== '') {
            $nWkt .= ' '.$matches['dim'];
        }
        $nWkt .= ' ('.$matches['str'].')';

        return strtoupper($nWkt);
    }

    /**
     * Return a geometry array likes it is defined in GeoJSON.
     *
     * @param string $wkt A WKT string
     *
     * @return null|array The geometry as described in GeoJSON
     */
    public static function parse($wkt)
    {
        // Checking and extracting geometry type, dimension and coordinates
        $matches = self::check($wkt);
        if (!$matches) {
            return null;
        }
        $geomType = $matches['geomType'];
        $dim = $matches['dim'];
        $str = $matches['str'];

        // Get coordinates
        $coordinates = null;
        if ($geomType === 'point') {
            $coordinates = self::parsePoint($str);
        } elseif ($geomType === 'multipoint') {
            $coordinates = self::parseMultiPoint($str);
        } elseif ($geomType === 'linestring') {
            $coordinates = self::parseLineString($str);
        } elseif ($geomType === 'multilinestring') {
            $coordinates = self::parseMultiLineString($str);
        } elseif ($geomType === 'polygon') {
            $coordinates = self::parsePolygon($str);
        } elseif ($geomType === 'multipolygon') {
            $coordinates = self::parseMultiPolygon($str);
        }

        if ($coordinates === null) {
            return null;
        }

        $geometry = array();
        if ($geomType === 'point') {
            $geometry['type'] = 'Point';
        } elseif ($geomType === 'multipoint') {
            $geometry['type'] = 'MultiPoint';
        } elseif ($geomType === 'linestring') {
            $geometry['type'] = 'LineString';
        } elseif ($geomType === 'multilinestring') {
            $geometry['type'] = 'MultiLineString';
        } elseif ($geomType === 'polygon') {
            $geometry['type'] = 'Polygon';
        } elseif ($geomType === 'multipolygon') {
            $geometry['type'] = 'MultiPolygon';
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
        if (count($coords) < 2 || !is_numeric($coords[0]) || !is_numeric($coords[1])) {
            return null;
        }

        return array(floatval($coords[0]), floatval($coords[1]));
    }

    /**
     * Return a Multi Point coordinates array.
     *
     * @param string $str A WKT fragment representing the Multi Point
     *
     * @return null|array The Multi Point coordinates, array of Points
     *
     * @protected
     */
    protected static function parseMultiPoint($str)
    {
        $components = array();
        $points = explode(',', trim($str));
        foreach ($points as $point) {
            $point = preg_replace(self::$regExes['trimParens'], '$1', $point);
            $component = self::parsePoint($point);
            if ($component === null) {
                return null;
            }
            $components[] = $component;
        }

        return $components;
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
     * Return a Multi LineString coordinates array.
     *
     * @param string $str A WKT fragment representing the Multi LineString
     *
     * @return null|array The Multi LineString coordinates, array of LineStrings
     *
     * @protected
     */
    protected static function parseMultiLineString($str)
    {
        $components = array();
        $lines = preg_split(self::$regExes['parenComma'], trim($str));
        foreach ($lines as $line) {
            $line = preg_replace(self::$regExes['trimParens'], '$1', $line);
            $component = self::parseLineString($line);
            if ($component === null) {
                return null;
            }
            $components[] = $component;
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

    /**
     * Return a Multi Polygon coordinates array.
     *
     * @param string $str A WKT fragment representing the Multi Polygon
     *
     * @return null|array The Multi Polygon coordinates, array of Polygones
     *
     * @protected
     */
    protected static function parseMultiPolygon($str)
    {
        $components = array();
        $polygons = preg_split(self::$regExes['doubleParenComma'], trim($str));
        foreach ($polygons as $polygon) {
            $polygon = preg_replace(self::$regExes['trimParens'], '$1', $polygon);
            $component = self::parsePolygon($polygon);
            if ($component === null) {
                return null;
            }
            $components[] = $component;
        }

        return $components;
    }
}
