<?php

/**
 * XML tools for Lizmap.
 *
 * @author    3liz
 * @copyright 2020 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\App;

enum WktGeomType: string
{
    case POINT = 'Point';
    case LINESTRING = 'LineString';
    case POLYGON = 'Polygon';
    case MULTIPOINT = 'MultiPoint';
    case MULTILINESTRING = 'MultiLineString';
    case MULTIPOLYGON = 'MultiPolygon';

    public function toString(): string
    {
        return $this->value;
    }
}

/**
 * @phpstan-type WktMatches array{geomType: string, dim: string, str: string}
 * @phpstan-type PointCoords \SplFixedArray<float>
 * @phpstan-type LineStringCoords \SplFixedArray<PointCoords>
 * @phpstan-type PolygonCoords \SplFixedArray<LineStringCoords>
 * @phpstan-type MultiPointCoords \SplFixedArray<PointCoords>
 * @phpstan-type MultiLineStringCoords \SplFixedArray<LineStringCoords>
 * @phpstan-type MultiPolygonCoords \SplFixedArray<PolygonCoords>
 * @phpstan-type GeomCoords PointCoords|LineStringCoords|PolygonCoords|MultiPointCoords|MultiLineStringCoords|MultiPolygonCoords
 * @phpstan-type WktGeometry array{type: string, coordinates: GeomCoords}
 */
class WktTools
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
    public static function check(string $wkt): array|false
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
    public static function fix(string $wkt): ?string
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
     * @return null|WktGeometry The geometry as described in GeoJSON
     */
    public static function parse(string $wkt): ?array
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
        $type = null;
        $coordinates = null;
        if ($geomType === strtolower(WktGeomType::POINT->toString())) {
            $type = WktGeomType::POINT->toString();
            $coordinates = self::parsePoint($str);
        } elseif ($geomType === strtolower(WktGeomType::MULTIPOINT->toString())) {
            $type = WktGeomType::MULTIPOINT->toString();
            $coordinates = self::parseMultiPoint($str);
        } elseif ($geomType === strtolower(WktGeomType::LINESTRING->toString())) {
            $type = WktGeomType::LINESTRING->toString();
            $coordinates = self::parseLineString($str);
        } elseif ($geomType === strtolower(WktGeomType::MULTILINESTRING->toString())) {
            $type = WktGeomType::MULTILINESTRING->toString();
            $coordinates = self::parseMultiLineString($str);
        } elseif ($geomType === strtolower(WktGeomType::POLYGON->toString())) {
            $type = WktGeomType::POLYGON->toString();
            $coordinates = self::parsePolygon($str);
        } elseif ($geomType === strtolower(WktGeomType::MULTIPOLYGON->toString())) {
            $type = WktGeomType::MULTIPOLYGON->toString();
            $coordinates = self::parseMultiPolygon($str);
        }

        if ($coordinates === null) {
            return null;
        }

        $geometry = array();
        $geometry['type'] = $type;
        $geometry['coordinates'] = $coordinates;

        return $geometry;
    }

    /**
     * Return a Point coordinates array.
     *
     * @param string $str A WKT fragment representing the Point
     *
     * @return null|PointCoords The Point coordinates, array of coordinates
     *
     * @protected
     */
    protected static function parsePoint(string $str): ?\SplFixedArray
    {
        $coords = preg_split(self::$regExes['spaces'], trim($str));
        if (count($coords) < 2 || !is_numeric($coords[0]) || !is_numeric($coords[1])) {
            return null;
        }

        $point = new \SplFixedArray(2);
        $point[0] = floatval($coords[0]);
        $point[1] = floatval($coords[1]);

        return $point;
    }

    /**
     * Return a Multi Point coordinates array.
     *
     * @param string $str A WKT fragment representing the Multi Point
     *
     * @return null|MultiPointCoords The Multi Point coordinates, array of Points
     *
     * @protected
     */
    protected static function parseMultiPoint(string $str): ?\SplFixedArray
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

        return \SplFixedArray::fromArray($components);
    }

    /**
     * Return a LineString coordinates array.
     *
     * @param string $str A WKT fragment representing the LineString
     *
     * @return null|LineStringCoords The LinString coordinates, array of Points
     *
     * @protected
     */
    protected static function parseLineString(string $str): ?\SplFixedArray
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

        return \SplFixedArray::fromArray($components);
    }

    /**
     * Return a Multi LineString coordinates array.
     *
     * @param string $str A WKT fragment representing the Multi LineString
     *
     * @return null|MultiLineStringCoords The Multi LineString coordinates, array of LineStrings
     *
     * @protected
     */
    protected static function parseMultiLineString(string $str): ?\SplFixedArray
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

        return \SplFixedArray::fromArray($components);
    }

    /**
     * Return a Polygon coordinates array.
     *
     * @param string $str A WKT fragment representing the Polygon
     *
     * @return null|PolygonCoords The Polygon coordinates, array of LinearRings
     *
     * @protected
     */
    protected static function parsePolygon(string $str): ?\SplFixedArray
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

        return \SplFixedArray::fromArray($components);
    }

    /**
     * Return a Multi Polygon coordinates array.
     *
     * @param string $str A WKT fragment representing the Multi Polygon
     *
     * @return null|MultiPolygonCoords The Multi Polygon coordinates, array of Polygones
     *
     * @protected
     */
    protected static function parseMultiPolygon(string $str): ?\SplFixedArray
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

        return \SplFixedArray::fromArray($components);
    }
}
