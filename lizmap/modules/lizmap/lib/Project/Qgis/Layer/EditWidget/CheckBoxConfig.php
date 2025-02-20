<?php

/**
 * QGIS Vector layer edit widget CheckBox config.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer\EditWidget;

use Lizmap\Project\Qgis;

/**
 * QGIS Vector layer edit widget CheckBox config
 * <editWidget type="CheckBox">
 *   <config>
 *     <Option type="Map">
 *         <Option value="1" type="QString" name="CheckedState"/>
 *         <Option value="0" type="QString" name="UncheckedState"/>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property string $CheckedState
 * @property string $UncheckedState
 * @property int    $TextDisplayMethod
 */
class CheckBoxConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'CheckedState',
        'UncheckedState',
        'TextDisplayMethod',
    );

    /** @var array The default values */
    protected $defaultValues = array(
        'CheckedState' => '',
        'UncheckedState' => '',
        'TextDisplayMethod' => 0,
    );
}
