<?php

/**
 * QGIS Vector layer edit widget Range config.
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
 * QGIS Vector layer edit widget Range config
 * <editWidget type="Range">
 *   <config>
 *     <Option type="Map">
 *       <Option name="AllowNull" type="bool" value="true"></Option>
 *       <Option name="Max" type="int" value="2147483647"></Option>
 *       <Option name="Min" type="int" value="-2147483648"></Option>
 *       <Option name="Precision" type="int" value="0"></Option>
 *       <Option name="Step" type="int" value="1"></Option>
 *       <Option name="Style" type="QString" value="SpinBox"></Option>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property bool   $AllowNull
 * @property int    $Max
 * @property int    $Min
 * @property int    $Precision
 * @property float  $Step
 * @property string $Style
 */
class RangeConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'AllowNull',
        'Max',
        'Min',
        'Precision',
        'Step',
        'Style',
    );

    /** @var array The default values */
    protected $defaultValues = array(
        'AllowNull' => true,
        'Style' => 'SpinBox',
    );

    protected function set(array $data): void
    {
        if (array_key_exists('AllowNull', $data)) {
            $data['AllowNull'] = filter_var($data['AllowNull'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('Max', $data)) {
            $data['Max'] = (int) $data['Max'];
        }
        if (array_key_exists('Min', $data)) {
            $data['Min'] = (int) $data['Min'];
        }
        if (array_key_exists('Precision', $data)) {
            $data['Precision'] = (int) $data['Precision'];
        }
        if (array_key_exists('Step', $data)) {
            $data['Step'] = (float) $data['Step'];
        }
        parent::set($data);
    }
}
