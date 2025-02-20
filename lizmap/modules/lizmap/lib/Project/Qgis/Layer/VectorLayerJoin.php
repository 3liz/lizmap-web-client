<?php

/**
 * QGIS Vector layer join.
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
 * QGIS Vector layer join.
 *
 * @property string $joinLayerId
 * @property string $joinFieldName
 * @property string $targetFieldName
 */
class VectorLayerJoin extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'joinLayerId',
        'joinFieldName',
        'targetFieldName',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'joinLayerId',
        'joinFieldName',
        'targetFieldName',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'join';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'joinLayerId' => $oXmlReader->getAttribute('joinLayerId'),
            'joinFieldName' => $oXmlReader->getAttribute('joinFieldName'),
            'targetFieldName' => $oXmlReader->getAttribute('targetFieldName'),
        );
    }
}
