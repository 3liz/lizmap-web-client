// @ts-check
import { test } from '@playwright/test';
import {ProjectPage} from "./pages/project";

test.describe('Value relation widget',
    {
        tag: ['@readonly'],
    },() => {

        test('Move geom and update select with a QGIS expression', async ({ page }) => {
            const project = new ProjectPage(page, 'form_edition_value_relation_field');
            await project.open();
            const formRequest = await project.openEditingFormWithLayer('point');
            await formRequest.response();

            const select = await page.locator("#jforms_view_edition_code_with_geom_exp");

            // Click on OL6 map since edition drawing was migrated from OL2 to OL6
            // x=450 keeps us in the safe zone (349-548), clear of #dock and #mini-dock
            await project.clickOnMap(450, 150);

            // Wait for edit mode to activate (OL6 singleclick fires after ~250ms)
            // so the Modify interaction is ready before dragTo
            await page.waitForFunction(() => lizMap.mainLizmap.digitizing.editedFeatures.length === 1);

            await select.selectOption({value: ''});

            await project.map.dragTo(project.map, {
                sourcePosition: { x: 450, y: 150 },
                targetPosition: { x: 500, y: 200 },
            });

            await select.selectOption({value: 'A2'});

            await project.map.dragTo(project.map, {
                sourcePosition: { x: 500, y: 200 },
                targetPosition: { x: 350, y: 200 },
            });

            await select.selectOption({value: 'A1'});

            await project.map.dragTo(project.map, {
                sourcePosition: { x: 350, y: 200 },
                targetPosition: { x: 350, y: 500 },
            });

            await select.selectOption({value: 'B1'});

            await project.map.dragTo(project.map, {
                sourcePosition: { x: 350, y: 500 },
                targetPosition: { x: 500, y: 500 },
            });

            await select.selectOption({value: 'B2'});

            await project.map.dragTo(project.map, {
                sourcePosition: { x: 500, y: 500 },
                targetPosition: { x: 450, y: 150 },
            });

            await select.selectOption({value: ''});

        })
    })
