<?php

/**
 * QGIS Vector layer edit widget ValueMap config.
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
 * QGIS Vector layer edit widget ValueMap config
 * <editWidget type="ValueMap">
 *   <config>
 *     <Option type="Map">
 *       <Option type="Map" name="map">
 *         <Option value="A" type="QString" name="Zone A"/>
 *         <Option value="B" type="QString" name="Zone B"/>
 *          <Option value="{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}" type="QString" name="No Zone"/>
 *       </Option>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property array-key $map
 */
class ValueMapConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'map',
    );
}
