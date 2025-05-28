<?php

/**
 * QGIS Project Properties.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

use Lizmap\Project;

/**
 * QGIS Project Properties class.
 *
 * @property null|string               $WMSServiceTitle
 * @property null|string               $WMSServiceAbstract
 * @property null|array<string>        $WMSKeywordList
 * @property null|array<float>         $WMSExtent
 * @property null|string               $WMSOnlineResource
 * @property null|string               $WMSContactMail
 * @property null|string               $WMSContactOrganization
 * @property null|string               $WMSContactPerson
 * @property null|string               $WMSContactPhone
 * @property null|int                  $WMSMaxWidth
 * @property null|int                  $WMSMaxHeight
 * @property null|int                  $WMSMaxAtlasFeatures
 * @property null|array<string>        $WMSRestrictedComposers
 * @property null|array<string>        $WMSRestrictedLayers
 * @property null|array<string>        $WFSLayers
 * @property null|bool                 $WMSUseLayerIDs
 * @property null|bool                 $WMSAddWktGeometry
 * @property null|ProjectGuiProperties $Gui
 * @property null|ProjectVariables     $Variables
 */
class ProjectProperties extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'WMSServiceTitle',
        'WMSServiceAbstract',
        'WMSKeywordList',
        'WMSExtent',
        'WMSOnlineResource',
        'WMSContactMail',
        'WMSContactOrganization',
        'WMSContactPerson',
        'WMSContactPhone',
        'WMSMaxWidth',
        'WMSMaxHeight',
        'WMSMaxAtlasFeatures',
        'WMSRestrictedComposers',
        'WMSRestrictedLayers',
        'WFSLayers',
        'WMSUseLayerIDs',
        'WMSAddWktGeometry',
        'Gui',
        'Variables',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'properties';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'WMSServiceTitle',
        'WMSServiceAbstract',
        'WMSKeywordList',
        'WMSExtent',
        'WMSOnlineResource',
        'WMSContactMail',
        'WMSContactOrganization',
        'WMSContactPerson',
        'WMSContactPhone',
        'WMSMaxWidth',
        'WMSMaxHeight',
        'WMSMaxAtlasFeatures',
        'WMSRestrictedComposers',
        'WMSRestrictedLayers',
        'WFSLayers',
        'WMSUseLayerIDs',
        'WMSAddWktGeometry',
        // 'Gui',
        // 'Variables',
    );

    /**
     * Parse from an XMLReader instance at a child of an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at a child of an element
     *
     * @return array|bool|int|string the result of the parsing
     */
    protected static function parseChild($oXmlReader)
    {
        $type = $oXmlReader->getAttribute('type');
        if ($type == 'QStringList') {
            if (!$oXmlReader->isEmptyElement) {
                return Parser::readValues($oXmlReader);
            }

            return array();
        }

        if ($type == 'bool') {
            return filter_var($oXmlReader->readString(), FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        }

        if ($type == 'int') {
            return (int) $oXmlReader->readString();
        }

        return $oXmlReader->readString();
    }

    protected static $childParsers = array();
}
ProjectProperties::registerChildParser('Gui', function ($oXmlReader) {
    return ProjectGuiProperties::fromXmlReader($oXmlReader);
});
ProjectProperties::registerChildParser('Variables', function ($oXmlReader) {
    return ProjectVariables::fromXmlReader($oXmlReader);
});
