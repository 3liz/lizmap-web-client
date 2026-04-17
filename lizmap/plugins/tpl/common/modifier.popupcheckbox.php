<?php

/**
 * Plugin modifier for the popup templates.
 *
 * Renders a field value as a disabled checkbox when the field is configured
 * with a QGIS CheckBox edit widget. Falls back to the standard featurepopup
 * modifier for anything that doesn't match a recognised checked/unchecked
 * state.
 *
 * @author    3liz
 * @copyright 2026 3liz
 *
 * @see      http://3liz.com
 *
 * @license    Mozilla Public License : http://www.mozilla.org/MPL/
 *
 * @param mixed      $attributeName        feature Attribute name
 * @param mixed      $attributeValue       feature Attribute value
 * @param string     $repository           lizmap Repository
 * @param string     $project              name of the project
 * @param array      $checkBoxFields       map fieldName => ['CheckedState' => string, 'UncheckedState' => string]
 * @param null|array $remoteStorageProfile webDav configuration
 *
 * @return string
 */
function jtpl_modifier_common_popupcheckbox($attributeName, $attributeValue, $repository, $project, $checkBoxFields, $remoteStorageProfile = null)
{
    $name = (string) $attributeName;

    if (is_array($checkBoxFields) && isset($checkBoxFields[$name])) {
        $cfg = $checkBoxFields[$name];
        $state = lizmap_popup_checkbox_match_state(
            (string) $attributeValue,
            isset($cfg['CheckedState']) ? (string) $cfg['CheckedState'] : '',
            isset($cfg['UncheckedState']) ? (string) $cfg['UncheckedState'] : ''
        );
        if ($state === 'checked') {
            return '<input type="checkbox" disabled="disabled" checked="checked" class="lizmap-popup-checkbox-widget">';
        }
        if ($state === 'unchecked') {
            return '<input type="checkbox" disabled="disabled" class="lizmap-popup-checkbox-widget">';
        }
    }

    $popupClass = jClasses::getService('view~popup');

    return $popupClass->getHtmlFeatureAttribute($attributeName, $attributeValue, $repository, $project, null, $remoteStorageProfile);
}

/**
 * Decide whether the given raw value represents a checked, unchecked, or
 * unrecognised state for a QGIS CheckBox-widget field. Matches the
 * configured CheckedState/UncheckedState first, then falls back to common
 * boolean representations (so fields typed as boolean, which come through
 * WMS/WFS as 'true'/'false' regardless of the widget's labels, also render
 * as checkboxes). Null-like values render as unchecked.
 *
 * @param string $value             raw attribute value
 * @param string $checkedExpected   CheckedState configured in QGIS
 * @param string $uncheckedExpected UncheckedState configured in QGIS
 *
 * @return null|string 'checked', 'unchecked', or null for no match
 */
function lizmap_popup_checkbox_match_state($value, $checkedExpected, $uncheckedExpected)
{
    if ($checkedExpected !== '' && $value === $checkedExpected) {
        return 'checked';
    }
    if ($uncheckedExpected !== '' && $value === $uncheckedExpected) {
        return 'unchecked';
    }
    $normalized = strtolower(trim($value));
    if (in_array($normalized, array('true', 't', '1', 'yes', 'on'), true)) {
        return 'checked';
    }
    if (in_array($normalized, array('false', 'f', '0', 'no', 'off'), true)) {
        return 'unchecked';
    }
    // QGIS's "()" represents a NULL boolean in some popup renderings
    if (in_array($normalized, array('', 'null', '()'), true)) {
        return 'unchecked';
    }

    return null;
}
