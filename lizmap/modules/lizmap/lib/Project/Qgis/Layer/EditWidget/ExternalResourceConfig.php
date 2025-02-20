<?php

/**
 * QGIS Vector layer edit widget ExternalResource config.
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
 * QGIS Vector layer edit widget ExternalResource config
 * <editWidget type="ExternalResource">
 *   <config>
 *     <Option type="Map">
 *       <Option value="1" type="QString" name="DocumentViewer"/>
 *       <Option value="400" type="QString" name="DocumentViewerHeight"/>
 *       <Option value="400" type="QString" name="DocumentViewerWidth"/>
 *       <Option value="1" type="QString" name="FileWidget"/>
 *       <Option value="1" type="QString" name="FileWidgetButton"/>
 *       <Option value="Images (*.gif *.jpeg *.jpg *.png)" type="QString" name="FileWidgetFilter"/>
 *       <Option value="0" type="QString" name="StorageMode"/>
 *     </Option>
 *   </config>
 * </editWidget>.
 *
 * @property int    $DocumentViewer
 * @property int    $DocumentViewerHeight
 * @property int    $DocumentViewerWidth
 * @property bool   $FileWidget
 * @property bool   $FileWidgetButton
 * @property string $FileWidgetFilter
 * @property bool   $UseLink
 * @property bool   $FullUrl
 * @property array  $PropertyCollection
 * @property int    $RelativeStorage
 * @property string $StorageAuthConfigId
 * @property int    $StorageMode
 * @property string $StorageType
 */
class ExternalResourceConfig extends Qgis\BaseQgisObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'DocumentViewer',
        'DocumentViewerHeight',
        'DocumentViewerWidth',
        'FileWidget',
        'FileWidgetButton',
        'FileWidgetFilter',
        'UseLink',
        'FullUrl',
        'PropertyCollection',
        'RelativeStorage',
        'StorageAuthConfigId',
        'StorageMode',
        'StorageType',
    );

    protected function set(array $data): void
    {
        if (array_key_exists('DocumentViewer', $data)) {
            $data['DocumentViewer'] = (int) $data['DocumentViewer'];
        }
        if (array_key_exists('DocumentViewerHeight', $data)) {
            $data['DocumentViewerHeight'] = (int) $data['DocumentViewerHeight'];
        }
        if (array_key_exists('DocumentViewerWidth', $data)) {
            $data['DocumentViewerWidth'] = (int) $data['DocumentViewerWidth'];
        }
        if (array_key_exists('FileWidget', $data)) {
            $data['FileWidget'] = filter_var($data['FileWidget'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('UseLink', $data)) {
            $data['UseLink'] = filter_var($data['UseLink'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('FullUrl', $data)) {
            $data['FullUrl'] = filter_var($data['FullUrl'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }
        if (array_key_exists('RelativeStorage', $data)) {
            $data['RelativeStorage'] = (int) $data['RelativeStorage'];
        }
        if (array_key_exists('StorageMode', $data)) {
            $data['StorageMode'] = (int) $data['StorageMode'];
        }
        parent::set($data);
    }
}

/*

          <editWidget type="ExternalResource">
            <config>
              <Option type="Map">
                <Option value="1" name="DocumentViewer" type="int"/>
                <Option value="0" name="DocumentViewerHeight" type="int"/>
                <Option value="0" name="DocumentViewerWidth" type="int"/>
                <Option value="true" name="FileWidget" type="bool"/>
                <Option value="true" name="FileWidgetButton" type="bool"/>
                <Option value="" name="FileWidgetFilter" type="QString"/>
                <Option name="PropertyCollection" type="Map">
                  <Option value="" name="name" type="QString"/>
                  <Option name="properties" type="Map">
                    <Option name="storageUrl" type="Map">
                      <Option value="true" name="active" type="bool"/>
                      <Option value="'http://webdav/shapeData/'||file_name(@selected_file_path)" name="expression" type="QString"/>
                      <Option value="3" name="type" type="int"/>
                    </Option>
                  </Option>
                  <Option value="collection" name="type" type="QString"/>
                </Option>
                <Option value="0" name="RelativeStorage" type="int"/>
                <Option value="k6k7lv8" name="StorageAuthConfigId" type="QString"/>
                <Option value="0" name="StorageMode" type="int"/>
                <Option value="WebDAV" name="StorageType" type="QString"/>
              </Option>
            </config>
          </editWidget>

          array(
                'DocumentViewer' => 1,
                'DocumentViewerHeight' => 0,
                'DocumentViewerWidth' => 0,
                'FileWidget' => true,
                'FileWidgetButton' => true,
                'FileWidgetFilter' => '',
                'PropertyCollection' => array(
                  'name' => '',
                  'properties' => array(
                    'storageUrl' => array (
                      'active' => true,
                      'expression' => '\'http://webdav/shapeData/\'||file_name(@selected_file_path)',
                      'type' => 3,
                    ),
                  ),
                  'type' => 'collection',
                ),
                'RelativeStorage' => 0,
                'StorageAuthConfigId' => 'k6k7lv8',
                'StorageMode' => 0,
                'StorageType' => 'WebDAV',
        );
*/
