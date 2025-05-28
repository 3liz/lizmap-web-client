<?php

/**
 * QGIS Project Gui Properties.
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
 * QGIS Project Gui Properties class.
 *
 * @property int      $CanvasColorBluePart
 * @property int      $CanvasColorGreenPart
 * @property int      $CanvasColorRedPart
 * @property null|int $SelectionColorAlphaPart
 * @property null|int $SelectionColorBluePart
 * @property null|int $SelectionColorGreenPart
 * @property null|int $SelectionColorRedPart
 */
class ProjectGuiProperties extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'CanvasColorBluePart',
        'CanvasColorGreenPart',
        'CanvasColorRedPart',
        'SelectionColorAlphaPart',
        'SelectionColorBluePart',
        'SelectionColorGreenPart',
        'SelectionColorRedPart',
        // 'Identify', // it contains disabledLayers
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'CanvasColorBluePart',
        'CanvasColorGreenPart',
        'CanvasColorRedPart',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'Gui';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'CanvasColorBluePart',
        'CanvasColorGreenPart',
        'CanvasColorRedPart',
        'SelectionColorAlphaPart',
        'SelectionColorBluePart',
        'SelectionColorGreenPart',
        'SelectionColorRedPart',
        // 'Identify', // it contains disabledLayers
    );

    /** @var array<string> The XML element needed children */
    protected static $mandatoryChildren = array(
        'CanvasColorBluePart',
        'CanvasColorGreenPart',
        'CanvasColorRedPart',
    );

    /**
     * Get the canvas color as RGB string.
     *
     * @return string The variables key / value array
     */
    public function getCanvasColor()
    {
        return 'rgb('.$this->CanvasColorRedPart.', '.$this->CanvasColorGreenPart.', '.$this->CanvasColorBluePart.')';
    }

    /**
     * Parse from an XMLReader instance at a child of an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at a child of an element
     *
     * @return array|int|string the result of the parsing
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

        if ($type == 'int') {
            return (int) $oXmlReader->readString();
        }

        return $oXmlReader->readString();
    }
}
