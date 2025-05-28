<?php

/**
 * Parse qgis project.
 *
 * @author    3liz
 * @copyright 2023 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */

namespace Lizmap\Project\Qgis;

class Parser
{
    /**
     * @param \XMLReader $oXmlReader
     *
     * @return array<string>
     */
    public static function readAttributes($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        $data = array();
        if ($oXmlReader->isEmptyElement) {
            return $data;
        }

        $localName = $oXmlReader->localName;
        $depth = $oXmlReader->depth;
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

            if ($oXmlReader->localName == 'attribute') {
                $data[] = $oXmlReader->readString();
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $oXmlReader
     *
     * @return array<string>
     */
    public static function readItems($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }

        $localName = $oXmlReader->localName;
        $depth = $oXmlReader->depth;
        $values = array();
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

            if ($oXmlReader->localName == 'item') {
                $values[] = $oXmlReader->readString();
            }
        }

        return $values;
    }

    /**
     * @param \XMLReader $oXmlReader
     *
     * @return array<string>
     */
    public static function readValues($oXmlReader)
    {
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }

        $localName = $oXmlReader->localName;
        $depth = $oXmlReader->depth;
        $values = array();
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

            if ($oXmlReader->localName == 'value') {
                $values[] = $oXmlReader->readString();
            }
        }

        return $values;
    }

    public const MAP_VALUES_AS_VALUES = 0;
    public const MAP_VALUES_AS_KEYS = 1;
    public const MAP_ONLY_VALUES = 2;

    /**
     * @param \XMLReader $oXmlReader
     * @param int        $extraction
     *
     * @return array
     */
    public static function readOption($oXmlReader, $extraction = Parser::MAP_VALUES_AS_VALUES)
    {
        $localName = 'Option';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'.$localName.'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
        $type = $oXmlReader->getAttribute('type');
        $name = $oXmlReader->getAttribute('name');
        $data = array();
        if (!$type && !$name) {
            return $data;
        }
        if ($type == 'Map' || $type == 'List' || $type == 'StringList') {
            if ($name == 'map') {
                $extraction = self::MAP_VALUES_AS_KEYS;
            }
            if ($type == 'StringList') {
                $extraction = self::MAP_ONLY_VALUES;
            }
            $options = array();
            while ($oXmlReader->read()) {
                if ($oXmlReader->nodeType == \XMLReader::END_ELEMENT
                    && $oXmlReader->localName == $localName
                    && $oXmlReader->depth == $depth) {
                    break;
                }

                if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
                    continue;
                }

                if ($oXmlReader->localName == $localName
                    && $oXmlReader->depth == $depth + 1) {
                    if ($extraction == self::MAP_ONLY_VALUES) {
                        $options = array_merge($options, self::readOption($oXmlReader, $extraction));
                    } else {
                        $options += self::readOption($oXmlReader, $extraction);
                    }
                }
            }
            if (!$name) {
                $data = $options;
            } else {
                $data[$name] = $options;
            }
        } else {
            $value = $oXmlReader->getAttribute('value');
            if ($type == 'bool') {
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            } elseif ($type == 'int') {
                $value = (int) $value;
            }
            if ($extraction == self::MAP_ONLY_VALUES) {
                $data[] = $value;
            } elseif ($extraction == self::MAP_VALUES_AS_KEYS) {
                $data[$value] = $name;
            } elseif ($name) {
                $data[$name] = $value;
            } else {
                $data[] = $value;
            }
        }

        return $data;
    }

    /**
     * @param \XMLReader $oXmlReader
     *
     * @return array
     */
    public static function readCustomProperties($oXmlReader)
    {
        $localName = 'customproperties';
        if ($oXmlReader->nodeType != \XMLReader::ELEMENT) {
            throw new \Exception('Provide an XMLReader::ELEMENT!');
        }
        if ($oXmlReader->localName != $localName) {
            throw new \Exception('Provide a `'.$localName.'` element not `'.$oXmlReader->localName.'`!');
        }

        $depth = $oXmlReader->depth;
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
                $data += self::readOption($oXmlReader);
            }
        }

        return $data;
    }
}
