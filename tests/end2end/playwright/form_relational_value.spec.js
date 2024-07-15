// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Form relational values', () => {

    test.beforeEach(async ({ page }) => {
        const url = '/index.php/view/map/?repository=testsrepository&project=form_type_relational_value';
        await gotoMap(url, page)

        await page.locator('#button-edition').click();
        await page.locator('#edition-draw').click();
    });

    test('Checkboxes relational values', async ({ page }) => {
        const groups = [
            { groupName: "test", count: 3, expectRequired: false },
            { groupName: "test_not_null_only", count: 3, expectRequired: true },
            { groupName: "test_empty_value_only", count: 4, expectRequired: false }
        ];
        for (let group of groups) {
            // group label
            let locatorGroup = page.locator('#jforms_view_edition_' + group.groupName + '_label');
            if (group.expectRequired) {
                await expect(locatorGroup).toHaveClass(/jforms-required/);
            } else {
                await expect(locatorGroup).not.toHaveClass(/jforms-required/);
            }
            // 1 checkbox for each value in the group
            await expect(
                page.locator('#jforms_view_edition input[name="' + group.groupName + '[]"]')
            ).toHaveCount(group.count);
            // 1 label for each checkbox
            await expect(
                page.locator(
                    '#jforms_view_edition label.checkbox.jforms-chkbox.jforms-ctl-' + group.groupName + ' input'
                )
            ).toHaveCount(group.count);
            // each option has or not the class jforms-required
            for (let i = 0; i < group.count; i++) {
                let locatorCheckbox = page.locator('#jforms_view_edition_' + group.groupName + '_' + i);
                if (group.expectRequired) {
                    await expect(locatorCheckbox).toHaveClass(/jforms-required/);
                } else {
                    await expect(locatorCheckbox).not.toHaveClass(/jforms-required/);
                }

            }

        }

    });
});
