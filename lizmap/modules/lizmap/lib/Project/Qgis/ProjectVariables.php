<?php

/**
 * QGIS Project Variables.
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
 * QGIS Project Variables class.
 *
 * @property array<string> $variableNames
 * @property array<string> $variableValues
 */
class ProjectVariables extends BaseQgisXmlObject
{
    /** @var array<string> The instance properties */
    protected $properties = array(
        'variableNames',
        'variableValues',
    );

    /** @var array<string> The not null properties */
    protected $mandatoryProperties = array(
        'variableNames',
        'variableValues',
    );

    /**
     * Get the variable value of the variable name.
     *
     * @param string $variableName The variable name
     *
     * @return bool The variable name exists
     */
    public function hasVariableName($variableName)
    {
        return in_array($variableName, $this->variableNames);
    }

    /**
     * Get the variable value of the variable name.
     *
     * @param string $variableName The variable name
     *
     * @return string The variable value
     */
    public function getVariableValue($variableName)
    {
        if (!$this->hasVariableName($variableName)) {
            throw new \Exception("no such variable `{$variableName}`.");
        }

        return $this->variableValues[array_search($variableName, $this->variableNames)];
    }

    /**
     * Get the variables as key / value array.
     *
     * @return array<string, string> The variables key / value array
     */
    public function getVariablesAsKeyArray()
    {
        $variables = array();
        foreach ($this->variableNames as $variableIndex => $name) {
            $variables[$name] = $this->variableValues[$variableIndex];
        }

        return $variables;
    }

    /** @var string The XML element local name */
    protected static $qgisLocalName = 'Variables';

    /** @var array<string> The XML element parsed children */
    protected static $children = array(
        'variableNames',
        'variableValues',
    );

    /** @var array<string> The XML element needed children */
    protected static $mandatoryChildren = array(
        'variableNames',
        'variableValues',
    );

    /**
     * Parse from an XMLReader instance at a child of an element.
     *
     * @param \XMLReader $oXmlReader An XMLReader instance at a child of an element
     *
     * @return array|string the result of the parsing
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

        return $oXmlReader->readString();
    }
}
