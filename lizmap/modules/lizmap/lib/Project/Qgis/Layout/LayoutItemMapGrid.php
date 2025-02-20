<?php

/**
 * QGIS Layout item map grid.
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
 * QGIS Layout item map grid.
 *
 * @property bool $show
 */
class LayoutItemMapGrid extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'show',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'show',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'ComposerMapGrid';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'show' => filter_var($oXmlReader->getAttribute('show'), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE),
        );
    }
}
