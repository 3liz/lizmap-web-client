<?php

/**
 * QGIS Vector layer edit widget ValueRelation config.
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
 * QGIS Vector layer edit widget ValueRelation config
 * <editWidget type="ValueRelation">
 *   <config>
 *     <Option type="Map">
 *         <Option value="0" type="QString" name="AllowMulti"/>
 *         <Option value="1" type="QString" name="AllowNull"/>
 *         <Option value="" type="QString" name="FilterExpression"/>
 *         <Option value="osm_id" type="QString" name="Key"/>
 *         <Option value="tramway20150328114206278" type="QString" name="Layer"/>
 *         <Option value="1" type="QString" name="OrderByValue"/>
 *         <Option value="0" type="QString" name="UseCompleter"/>
 *         <Option value="test" type="QString" name="Value"/>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property string $Layer
 * @property string $LayerName
 * @property string $LayerSource
 * @property string $LayerProviderName
 * @property string $Key
 * @property string $Value
 * @property string $Description
 * @property bool   $AllowMulti
 * @property string $NofColumns
 * @property bool   $AllowNull
 * @property bool   $OrderByValue
 * @property string $FilterExpression
 * @property bool   $UseCompleter
 */
class ValueRelationConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'Layer',
        'LayerName',
        'LayerSource',
        'LayerProviderName',
        'Key',
        'Value',
        'Description',
        'AllowMulti',
        'NofColumns',
        'AllowNull',
        'OrderByValue',
        'FilterExpression',
        'UseCompleter',
    );

    protected function set(array $data): void
    {
        if (array_key_exists('AllowMulti', $data)) {
            $data['AllowMulti'] = filter_var($data['AllowMulti'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('AllowNull', $data)) {
            $data['AllowNull'] = filter_var($data['AllowNull'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('OrderByValue', $data)) {
            $data['OrderByValue'] = filter_var($data['OrderByValue'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('UseCompleter', $data)) {
            $data['UseCompleter'] = filter_var($data['UseCompleter'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        parent::set($data);
    }
}
