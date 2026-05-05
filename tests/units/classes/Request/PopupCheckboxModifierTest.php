<?php

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @coversNothing
 */
class PopupCheckboxModifierTest extends TestCase
{
    public static function setUpBeforeClass(): void
    {
        require_once __DIR__.'/../../../../lizmap/plugins/tpl/common/modifier.popupcheckbox.php';
    }

    public static function matchStateData()
    {
        // getCheckBoxFieldsForLayer() stores the raw values from the .qgs file.
        // Empty strings mean no custom text labels were configured (boolean DB field);
        // the boolean-string fallback fires only in that case.
        // Non-empty strings are user-configured labels → exact match only.

        return array(
            // ── Exact match against user-configured states ─────────────────
            'exact checked (t)'                => array('t', 't', 'f', 'checked'),
            'exact unchecked (f)'              => array('f', 't', 'f', 'unchecked'),

            // ── Boolean fallback: both states empty → boolean DB field ──────
            // QGIS WMS serialises boolean fields as 'true'/'false'
            'fallback true'                    => array('true', '', '', 'checked'),
            'fallback TRUE'                    => array('TRUE', '', '', 'checked'),
            'fallback t'                       => array('t', '', '', 'checked'),
            'fallback T'                       => array('T', '', '', 'checked'),
            'fallback 1'                       => array('1', '', '', 'checked'),
            'fallback yes'                     => array('yes', '', '', 'checked'),
            'fallback YES'                     => array('YES', '', '', 'checked'),
            'fallback on'                      => array('on', '', '', 'checked'),
            'fallback false'                   => array('false', '', '', 'unchecked'),
            'fallback FALSE'                   => array('FALSE', '', '', 'unchecked'),
            'fallback f'                       => array('f', '', '', 'unchecked'),
            'fallback 0'                       => array('0', '', '', 'unchecked'),
            'fallback no'                      => array('no', '', '', 'unchecked'),
            'fallback off'                     => array('off', '', '', 'unchecked'),

            // ── Null-like values (boolean field, no value stored) ──────────
            'empty string'                     => array('', '', '', 'unchecked'),
            'null literal'                     => array('null', '', '', 'unchecked'),
            'NULL uppercase'                   => array('NULL', '', '', 'unchecked'),
            'QGIS null parens ()'              => array('()', '', '', 'unchecked'),
            'whitespace only'                  => array('   ', '', '', 'unchecked'),

            // ── Fallback suppressed when custom states are configured ───────
            // A boolean-like value must NOT match when the field has text labels
            'suppressed: true with t/f states' => array('true', 't', 'f', null),
            'suppressed: t with Yes/No states' => array('t', 'Yes', 'No', null),
            'suppressed: 1 with on/off states' => array('1', 'on', 'off', null),

            // ── Unknown / unrecognised values ──────────────────────────────
            'unrecognised string'              => array('maybe', '', '', null),
            'unrecognised with states'         => array('maybe', 't', 'f', null),
            'number out of bool range'         => array('2', '', '', null),
        );
    }

    /**
     * @dataProvider matchStateData
     *
     * @param mixed       $value
     * @param mixed       $checkedExpected
     * @param mixed       $uncheckedExpected
     * @param null|string $expected
     */
    #[DataProvider('matchStateData')]
    public function testMatchState($value, $checkedExpected, $uncheckedExpected, $expected): void
    {
        $result = lizmap_popup_checkbox_match_state($value, $checkedExpected, $uncheckedExpected);
        $this->assertSame($expected, $result);
    }

    public static function modifierHtmlData()
    {
        // Empty strings: no custom labels configured (boolean DB field).
        // QGIS WMS serialises boolean fields as 'true'/'false'.
        $checkBoxFields = array(
            'has_photo' => array('CheckedState' => '', 'UncheckedState' => ''),
        );

        return array(
            'renders checked'   => array('has_photo', 'true', $checkBoxFields, '<input type="checkbox" disabled="disabled" checked="checked" class="lizmap-popup-checkbox-widget">'),
            'renders unchecked' => array('has_photo', 'false', $checkBoxFields, '<input type="checkbox" disabled="disabled" class="lizmap-popup-checkbox-widget">'),
        );
    }

    /**
     * @dataProvider modifierHtmlData
     *
     * @param mixed $attributeName
     * @param mixed $attributeValue
     * @param mixed $checkBoxFields
     * @param mixed $expected
     */
    #[DataProvider('modifierHtmlData')]
    public function testModifierRendersCheckbox($attributeName, $attributeValue, $checkBoxFields, $expected): void
    {
        $result = jtpl_modifier_common_popupcheckbox(
            $attributeName,
            $attributeValue,
            'testsrepository',
            'test',
            $checkBoxFields
        );
        $this->assertSame($expected, $result);
    }
}
