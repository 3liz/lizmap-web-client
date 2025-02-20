<?php

/**
 * QGIS Vector layer edit widget TextEdit config.
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
 * QGIS Vector layer edit widget TextEdit config
 * <editWidget type="TextEdit">
 *   <config>
 *     <Option type="Map">
 *       <Option value="0" type="QString" name="IsMultiline"/>
 *       <Option value="0" type="QString" name="UseHtml"/>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property bool $IsMultiline
 * @property bool $UseHtml
 */
class TextEditConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'IsMultiline',
        'UseHtml',
    );

    /** @var array The default values */
    protected $defaultValues = array(
        'IsMultiline' => false,
        'UseHtml' => false,
    );

    protected function set(array $data): void
    {
        if (array_key_exists('IsMultiline', $data)) {
            $data['IsMultiline'] = filter_var($data['IsMultiline'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('UseHtml', $data)) {
            $data['UseHtml'] = filter_var($data['UseHtml'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        parent::set($data);
    }
}

/*
          <editWidget type="TextEdit">
            <config>
              <Option type="Map">
                <Option value="0" type="QString" name="IsMultiline"/>
                <Option value="0" type="QString" name="UseHtml"/>
              </Option>
            </config>
          </editWidget>

          <editWidget type="TextEdit">
            <config>
              <Option/>
            </config>
          </editWidget>
*/
