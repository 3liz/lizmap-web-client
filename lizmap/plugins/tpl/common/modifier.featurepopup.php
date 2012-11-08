<?php
/**
* Plugin modifier for the popup templates
* @package   lizmap
* @subpackage view
* @author    3liz
* @copyright 2011 3liz
* @link      http://3liz.com
* @license    Mozilla Public License : http://www.mozilla.org/MPL/
*/

/**
* modifier plugin : text replace a feature attribute value by html content based on value.
* <pre>
*  {$attribute['name']|featurepopup:$attribute['value'],$repository,$project}
* </pre>
* @param string $attributeName Feature Attribute name.
* @param string $attributeValue Feature Attribute value.
* @param string $repository Lizmap Repository.
* @param string $project Name of the project.
* @return html string
*/

function jtpl_modifier_common_featurepopup($attributeName, $attributeValue, $repository, $project) {

	$popupClass = jClasses::getService("view~popup");
	$result = $popupClass->getHtmlFeatureAttribute($attributeName, $attributeValue, $repository, $project, Null);

	return $result;

}
