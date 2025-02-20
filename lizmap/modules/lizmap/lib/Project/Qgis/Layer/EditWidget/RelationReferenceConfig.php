<?php

/**
 * QGIS Vector layer edit widget RelationReference config.
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
 * QGIS Vector layer edit widget RelationReference config
 * <editWidget type="RelationReference">
 *   <config>
 *     <Option type="Map">
 *       <Option type="bool" value="false" name="AllowAddFeatures"/>
 *       <Option type="bool" value="true" name="AllowNULL"/>
 *       <Option type="bool" value="false" name="MapIdentification"/>
 *       <Option type="bool" value="false" name="OrderByValue"/>
 *       <Option type="bool" value="false" name="ReadOnly"/>
 *       <Option type="QString" value="service=lizmap sslmode=disable key=\'fid\' checkPrimaryKeyUnicity=\'0\' table=&quot;lizmap_data&quot;.&quot;risque&quot;" name="ReferencedLayerDataSource"/>
 *       <Option type="QString" value="risque_66cb8d43_86b7_4583_9217_f7ead54463c3" name="ReferencedLayerId"/>
 *       <Option type="QString" value="risque" name="ReferencedLayerName"/>
 *       <Option type="QString" value="postgres" name="ReferencedLayerProviderKey"/>
 *       <Option type="QString" value="tab_demand_risque_risque_66c_risque" name="Relation"/>
 *       <Option type="bool" value="false" name="ShowForm"/>
 *       <Option type="bool" value="true" name="ShowOpenFormButton"/>
 *       </Option>
 *   </config>
 * </editWidget>.
 *
 * @property bool   $AllowAddFeatures
 * @property bool   $AllowNULL
 * @property bool   $MapIdentification
 * @property bool   $OrderByValue
 * @property bool   $ReadOnly
 * @property string $ReferencedLayerDataSource
 * @property string $ReferencedLayerId
 * @property string $ReferencedLayerName
 * @property string $ReferencedLayerProviderKey
 * @property string $Relation
 * @property bool   $ShowForm
 * @property bool   $ShowOpenFormButton
 */
class RelationReferenceConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'AllowAddFeatures',
        'AllowNULL',
        'MapIdentification',
        'OrderByValue', // TODO Remove when QGIS 3.32 will be the minimum version for allowing a QGIS project
        'ReadOnly',
        'ReferencedLayerDataSource',
        'ReferencedLayerId',
        'ReferencedLayerName',
        'ReferencedLayerProviderKey',
        'Relation',
        'ShowForm',
        'ShowOpenFormButton',
    );

    /** @var array The default values for properties */
    protected $defaultValues = array(
        'OrderByValue' => true, // TODO Remove when QGIS 3.32 will be the minimum version for allowing a QGIS project
    );

    protected function set(array $data): void
    {
        if (array_key_exists('AllowAddFeatures', $data)) {
            $data['AllowAddFeatures'] = filter_var($data['AllowAddFeatures'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('AllowNULL', $data)) {
            $data['AllowNULL'] = filter_var($data['AllowNULL'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('MapIdentification', $data)) {
            $data['MapIdentification'] = filter_var($data['MapIdentification'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        // TODO Remove when QGIS 3.32 will be the minimum version for allowing a QGIS project
        if (array_key_exists('OrderByValue', $data)) {
            $data['OrderByValue'] = filter_var($data['OrderByValue'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('ReadOnly', $data)) {
            $data['ReadOnly'] = filter_var($data['ReadOnly'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('ShowForm', $data)) {
            $data['ShowForm'] = filter_var($data['ShowForm'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('ShowOpenFormButton', $data)) {
            $data['ShowOpenFormButton'] = filter_var($data['ShowOpenFormButton'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        parent::set($data);
    }
}

/*
<field name="father_id" configurationFlags="None">
<editWidget type="RelationReference">
  <config>
    <Option/>
  </config>
</editWidget>
</field>
*/
