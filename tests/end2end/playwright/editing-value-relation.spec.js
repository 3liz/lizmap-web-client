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
            await project.openEditingFormWithLayer('point');

            const select = await page.locator("#jforms_view_edition_code_with_geom_exp");

            await project.clickOnMapLegacy(650, 200);

            await select.selectOption({value: ''});

            await project.mapOl2.dragTo(project.mapOl2, {
                sourcePosition: { x: 650, y: 200 },
                targetPosition: { x: 500, y: 200 },
            });

            await select.selectOption({value: 'A2'});

            await project.mapOl2.dragTo(project.mapOl2, {
                sourcePosition: { x: 500, y: 200 },
                targetPosition: { x: 350, y: 200 },
            });

            await select.selectOption({value: 'A1'});

            await project.mapOl2.dragTo(project.mapOl2, {
                sourcePosition: { x: 350, y: 200 },
                targetPosition: { x: 350, y: 500 },
            });

            await select.selectOption({value: 'B1'});

            await project.mapOl2.dragTo(project.mapOl2, {
                sourcePosition: { x: 350, y: 500 },
                targetPosition: { x: 500, y: 500 },
            });

            await select.selectOption({value: 'B2'});

            await project.mapOl2.dragTo(project.mapOl2, {
                sourcePosition: { x: 500, y: 500 },
                targetPosition: { x: 650, y: 200 },
            });

            await select.selectOption({value: ''});

        })
    })
