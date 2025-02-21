<?php

/**
 * QGIS Layout item map overview.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layout;

use Lizmap\Project\Qgis;

/**
 * QGIS Layout item map overview.
 *
 * @property bool   $show
 * @property string $frameMap
 */
class LayoutItemMapOverview extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'show',
        'frameMap',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'show',
        'frameMap',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'ComposerMapOverview';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'show' => filter_var($oXmlReader->getAttribute('show'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
            'frameMap' => $oXmlReader->getAttribute('frameMap'),
        );
    }
}
