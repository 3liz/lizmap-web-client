<?php

/**
 * QGIS Project Relation.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

/**
 * QGIS Project Relation class.
 *
 * @property string $id
 * @property string $name
 * @property string $referencingLayer
 * @property string $referencingField
 * @property string $referencedLayer
 * @property string $referencedField
 * @property string $strength
 */
class ProjectRelation extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'id',
        'name',
        'referencingLayer',
        'referencingField',
        'referencedLayer',
        'referencedField',
        'strength',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'id',
        'name',
        'referencingLayer',
        'referencingField',
        'referencedLayer',
        'referencedField',
        'strength',
    );

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'relation';

    public static function fromXmlReader($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        $localName = static::$qgisLocalName;
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'.$localName.'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $data = array(
            'id' => $oXmlReader->getAttribute('id'),
            'name' => $oXmlReader->getAttribute('name'),
            'referencingLayer' => $oXmlReader->getAttribute('referencingLayer'),
            'referencedLayer' => $oXmlReader->getAttribute('referencedLayer'),
            'strength' => $oXmlReader->getAttribute('strength'),
        );

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

            $tagName = $oXmlReader->localName;
            if ($tagName == 'fieldRef') {
                $data['referencingField'] = $oXmlReader->getAttribute('referencingField');
                $data['referencedField'] = $oXmlReader->getAttribute('referencedField');
            }
        }

        return new ProjectRelation($data);
    }
}
/*
    <relation id="SousQuartiers20160121124316563_QUARTMNO_VilleMTP_MTP_Quartiers_2011_432620130116112610876_QUARTMNO" referencingLayer="SousQuartiers20160121124316563" referencedLayer="VilleMTP_MTP_Quartiers_2011_432620130116112610876" strength="Association" name="Subdistricts by district">
      <fieldRef referencingField="QUARTMNO" referencedField="QUARTMNO"/>
    </relation>
 */
