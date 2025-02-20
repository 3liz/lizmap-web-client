<?php

/**
 * QGIS Vector layer edit widget DateTime config.
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
 * QGIS Vector layer edit widget DateTime config
 * <editWidget type="DateTime">
 *   <config>
 *     <Option type="Map">
 *       <Option value="false" type="bool" name="allow_null"/>
 *       <Option value="false" type="bool" name="calendar_popup"/>
 *       <Option value="" type="QString" name="display_format"/>
 *       <Option value="yyyy-MM-dd" type="QString" name="field_format"/>
 *       <Option value="false" type="bool" name="field_iso_format"/>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property bool   $allow_null
 * @property bool   $calendar_popup
 * @property string $display_format
 * @property string $field_format
 * @property bool   $field_iso_format
 */
class DateTimeConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'allow_null',
        'calendar_popup',
        'display_format',
        'field_format',
        'field_iso_format',
    );

    /** @var array The default values */
    protected $defaultValues = array(
        'allow_null' => false,
        'calendar_popup' => false,
        'display_format' => '',
        'field_format' => 'yyyy-MM-dd',
        'field_iso_format' => false,
    );

    protected function set(array $data): void
    {
        if (array_key_exists('allow_null', $data)) {
            $data['allow_null'] = filter_var($data['allow_null'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('calendar_popup', $data)) {
            $data['calendar_popup'] = filter_var($data['calendar_popup'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('field_iso_format', $data)) {
            $data['field_iso_format'] = filter_var($data['field_iso_format'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        parent::set($data);
    }
}
