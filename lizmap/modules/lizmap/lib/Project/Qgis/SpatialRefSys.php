<?php

/**
 * QGIS Spatial Reference System.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

/**
 * QGIS Spatial Reference System classes.
 *
 * @property string      $authid
 * @property string      $proj4
 * @property null|int    $srid
 * @property null|string $description
 *
 * @phpstan-type SpatialRefSysData array{'authid': string, 'proj4'?: string, 'srid'?: int, 'description'?: string}
 */
class SpatialRefSys extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'authid',
        'proj4',
        'srid',
        'description',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'authid',
        'proj4',
    );

    /**
     * @var array<SpatialRefSys> The stored instances
     *
     * @see SpatialRefSys::getInstance()
     */
    private static $instances = array(
    );

    /**
     * Get all Spatial Reference System instance stored.
     *
     * @return array<SpatialRefSys>
     */
    public static function allInstances()
    {
        return array_values(self::$instances);
    }

    /**
     * Get all Spatial Reference System instance stored.
     *
     * @return array<SpatialRefSys>
     */
    public static function clearInstances()
    {
        return self::$instances = array();
    }

    /**
     * Get a Spatial Reference System instance from an array.
     * if the `authid` is already stored, the Spatial Reference System in memory will be returned
     * else a new Spatial Reference System instance is constructed, stored and returned.
     *
     * @param SpatialRefSysData $data An array describing Spatial Reference System
     *
     * @return SpatialRefSys the Spatial Reference System instance corresponding to the array
     */
    public static function getInstance($data)
    {
        if (array_key_exists($data['authid'], self::$instances)) {
            return self::$instances[$data['authid']];
        }
        $inst = new self($data);
        self::$instances[$inst->authid] = $inst;

        return $inst;
    }

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'spatialrefsys';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'authid',
        'proj4',
        'srid',
        'description',
    );

    /** @var array<string> The XML element needed children */
    protected static $mandatoryChildren = array(
        'authid',
        'proj4',
    );

    /**
     * Parse from an XMLReader instance at a child of an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at a child of an element
     *
     * @return int|string the result of the parsing
     */
    protected static function parseChild($oXmlReader)
    {
        if ($oXmlReader->localName == 'srid') {
            return (int) $oXmlReader->readString();
        }

        return $oXmlReader->readString();
    }

    /**
     * Build and instance with data as an array.
     *
     * @param array $data the instance data
     *
     * @return SpatialRefSys the instance
     */
    protected static function buildInstance($data)
    {
        if (array_key_exists($data['authid'], self::$instances)) {
            return self::$instances[$data['authid']];
        }

        return self::getInstance($data);
    }
}
