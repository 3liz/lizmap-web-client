<?php

/**
 * QGIS Project Visibility Preset.
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
 * QGIS Project Visibility preset layer class.
 *
 * @property string $id
 * @property bool   $visible
 * @property string $style
 * @property bool   $expanded
 */
class ProjectVisibilityPresetLayer extends BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'id',
        'visible',
        'style',
        'expanded',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'id',
        'visible',
        'style',
        'expanded',
    );
}
