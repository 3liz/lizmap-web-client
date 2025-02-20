<?php

/**
 * QGIS Layout item map.
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
 * QGIS Layout item map.
 *
 * @property int         $type
 * @property string      $typeName
 * @property int         $width
 * @property int         $height
 * @property int         $x
 * @property int         $y
 * @property string      $uuid
 * @property bool        $grid
 * @property null|string $overviewMap
 */
class LayoutItemMap extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'type',
        'typeName',
        'width',
        'height',
        'x',
        'y',
        'uuid',
        'grid',
        'overviewMap',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'type',
        'typeName',
        'width',
        'height',
        'x',
        'y',
        'uuid',
        'grid',
    );
}
