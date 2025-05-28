<?php

/**
 * QGIS Vector layer edit widget UniqueValues config.
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
 * QGIS Vector layer edit widget UniqueValues config
 * <editWidget type="UniqueValues">
 *   <config>
 *     <Option type="Map">
 *       <Option value="1" type="QString" name="Editable"/>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property bool $Editable
 */
class UniqueValuesConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'Editable',
    );

    /** @var array The default values */
    protected $defaultValues = array(
        'Editable' => false,
    );

    protected function set(array $data): void
    {
        if (array_key_exists('Editable', $data)) {
            $data['Editable'] = filter_var($data['Editable'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        parent::set($data);
    }
}
