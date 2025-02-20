<?php

/**
 * QGIS Vector layer alias.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project\Qgis;

/**
 * QGIS Vector layer alias.
 *
 * @property int    $index
 * @property string $field
 * @property string $name
 */
class VectorLayerAlias extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'index',
        'field',
        'name',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'index',
        'field',
        'name',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'alias';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'index' => (int) $oXmlReader->getAttribute('index'),
            'field' => $oXmlReader->getAttribute('field'),
            'name' => $oXmlReader->getAttribute('name'),
        );
    }
}
