<?php

/**
 * QGIS Vector layer edit widget.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis\Layer;

use Lizmap\Project\Qgis;

/**
 * QGIS Vector layer edit widget.
 *
 * @property string                        $type
 * @property array-key|Qgis\BaseQgisObject $config
 */
class VectorLayerEditWidget extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'type',
        'config',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'type',
        'config',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'editWidget';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'type' => $oXmlReader->getAttribute('type'),
        );
    }

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'config',
    );

    protected static $childParsers = array();

    protected static function buildInstance($data)
    {
        if ($data['type'] == 'TextEdit') {
            $data['config'] = new EditWidget\TextEditConfig($data['config']);
        } elseif ($data['type'] == 'CheckBox') {
            $data['config'] = new EditWidget\CheckBoxConfig($data['config']);
        } elseif ($data['type'] == 'DateTime') {
            $data['config'] = new EditWidget\DateTimeConfig($data['config']);
        } elseif ($data['type'] == 'Range') {
            $data['config'] = new EditWidget\RangeConfig($data['config']);
        } elseif ($data['type'] == 'ExternalResource') {
            $data['config'] = new EditWidget\ExternalResourceConfig($data['config']);
        } elseif ($data['type'] == 'ValueMap') {
            $data['config'] = new EditWidget\ValueMapConfig($data['config']);
        } elseif ($data['type'] == 'UniqueValues') {
            $data['config'] = new EditWidget\UniqueValuesConfig($data['config']);
        } elseif ($data['type'] == 'RelationReference') {
            $data['config'] = new EditWidget\RelationReferenceConfig($data['config']);
        } elseif ($data['type'] == 'ExternalResource') {
            $data['config'] = new EditWidget\ValueRelationConfig($data['config']);
        }

        return new VectorLayerEditWidget($data);
    }
}
VectorLayerEditWidget::registerChildParser('config', function ($oXmlReader) {
    $depth = $oXmlReader->depth;
    $localName = $oXmlReader->localName;
    $data = array();
    if ($oXmlReader->isEmptyElement) {
        return $data;
    }
    while ($oXmlReader->read()) {
        if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
            && $oXmlReader->localName == $localName
            && $oXmlReader->depth == $depth) {
            break;
        }

        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            continue;
        }

        if ($oXmlReader->depth != $depth + 1) {
            continue;
        }

        if ($oXmlReader->localName == 'Option') {
            $data += Qgis\Parser::readOption($oXmlReader);
        }
    }

    return $data;
    /*
    <fieldConfiguration>
      <field name="OGC_FID">
        <editWidget type="TextEdit">
          <config>
            <Option type="Map">
              <Option value="0" type="QString" name="IsMultiline"/>
              <Option value="0" type="QString" name="UseHtml"/>
            </Option>
          </config>
        </editWidget>
      </field>
    </fieldConfiguration>
    */
});
