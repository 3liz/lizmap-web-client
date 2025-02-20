<?php

/**
 * Plugin modifier for the popup templates.
 *
 * @author    3liz
 * @copyright 2011 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 *
 * @param mixed      $attributeName
 * @param mixed      $attributeValue
 * @param mixed      $repository
 * @param mixed      $project
 * @param null|mixed $remoteStorageProfile
 */

/**
 * modifier plugin : text replace a feature attribute value by html content based on value.
 * <pre>
 *  {$attribute['name']|featurepopup:$attribute['value'],$repository,$project}
 * </pre>.
 *
 * @param string     $attributeName        feature Attribute name
 * @param string     $attributeValue       feature Attribute value
 * @param string     $repository           lizmap Repository
 * @param string     $project              name of the project
 * @param null|array $remoteStorageProfile webDav configuration
 *
 * @return html string
 */
function jtpl_modifier_common_featurepopup($attributeName, $attributeValue, $repository, $project, $remoteStorageProfile = null)
{
    $popupClass = jClasses::getService('view~popup');

    return $popupClass->getHtmlFeatureAttribute($attributeName, $attributeValue, $repository, $project, null, $remoteStorageProfile);
}
