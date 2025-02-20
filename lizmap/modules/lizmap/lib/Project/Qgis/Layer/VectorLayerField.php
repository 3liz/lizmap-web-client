<?php

/**
 * QGIS Vector layer field.
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
 * QGIS Vector layer field.
 *
 * @property string                $name
 * @property null|string           $configurationFlags
 * @property VectorLayerEditWidget $editWidget
 */
class VectorLayerField extends Qgis\BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'name',
        'configurationFlags',
        'editWidget',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'name',
        'editWidget',
    );

    /**
     * @return bool
     */
    public function isHideFromWms()
    {
        if (!isset($this->configurationFlags)) {
            return false;
        }

        return strpos($this->configurationFlags, 'HideFromWms') !== false;
    }

    /**
     * @return bool
     */
    public function isHideFromWfs()
    {
        if (!isset($this->configurationFlags)) {
            return false;
        }

        return strpos($this->configurationFlags, 'HideFromWfs') !== false;
    }

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'field';

    protected static function getAttributes($oXmlReader)
    {
        return array(
            'name' => $oXmlReader->getAttribute('name'),
            'configurationFlags' => $oXmlReader->getAttribute('configurationFlags'),
        );
    }

    protected static $childParsers = array();
}
VectorLayerField::registerChildParser('editWidget', function ($oXmlReader) {
    return VectorLayerEditWidget::fromXmlReader($oXmlReader);
});
