// @ts-check
import {expect, test} from '@playwright/test';
import {editedFeatureIds } from './globals';
import {ProjectPage} from "./pages/project";

test.describe('Geometry editing',
    {
        tag: ['@write'],
    }, () => {
        [
            { layerName: 'point_2154', geom: 'point', layerId: 'form_edition_point_2154_bfabce3b_eb48_4631_b43f_d1db3772f0a5' },
            { layerName: 'point_3857', geom: 'point', layerId: 'form_edition_point_3857_c23f4950_b9a9_4d41_b3af_048cf01dc0cd' },
            { layerName: 'point_4326', geom: 'point', layerId: 'form_edition_point_4326_f1955711_4ebd_4c78_a9fd_58083b600d6a' },
            { layerName: 'line_2154', geom: 'line', layerId: 'form_edition_line_2154_8797dd9f_d762_436f_91b6_1f06a37e9cf3' },
            { layerName: 'line_3857', geom: 'line', layerId: 'form_edition_line_3857_fd8ff719_81b7_4719_ad71_2a5fdebcbb13' },
            { layerName: 'line_4326', geom: 'line', layerId: 'form_edition_line_4326_2e2d506d_414a_4731_a1bb_17e33c490923' },
            { layerName: 'polygon_2154', geom: 'polygon', layerId: 'form_edition_polygon_2154_6b836ded_12c4_44ee_a6c4_44bf0a0d349e' },
            { layerName: 'polygon_3857', geom: 'polygon', layerId: 'form_edition_polygon_3857_980ac178_da20_4105_bf91_e8801a050dec' },
            { layerName: 'polygon_4326', geom: 'polygon', layerId: 'form_edition_polygon_4326_36f846ad_6690_4d2d_b48d_c342db7c07e9' },
        ].forEach(({ layerName, geom, layerId}) => {

            test(`Layer ${layerName} : create and edit attributes and geometry`, async ({ page }) => {
                const project = new ProjectPage(page, 'form_edition_simple_fields');
                await project.open();

                const field = 'label';

                // Add new data
                await project.openEditingFormWithLayer(layerName);
                await project.editingField(field).fill("VALUE NEW");

                const x1 = 600;
                const y1 = 200;
                await project.clickOnMapLegacy(x1, y1);
                if (geom === 'polygon'){
                    await project.clickOnMapLegacy(x1, y1 + 100);
                }
                if (geom === 'line' || geom === 'polygon') {
                    await project.dblClickOnMapLegacy(x1 + 100, y1);
                }
                await project.editingSubmitForm();

                // Fetch inserted ID
                const ids = await editedFeatureIds(page);

                // Open its popup, check the auto popup and then edit it
                await project.clickOnMap(x1, y1);
                const lastFeature = await project.identifyContentLocator(ids['id'], layerId);
                await expect(lastFeature.locator(`tr[data-field-name="${field}"] td`)).toHaveText("VALUE NEW");
                await lastFeature.locator(".feature-edit").click();

                await expect(project.editingField(field)).toHaveValue('VALUE NEW');

                // Edit attribute
                await project.editingField(field).fill("VALUE EDITED");

                // Edit the first point of the geometry with a translation of Y + 200
                const delta_y = 200;
                await project.mapOl2.dragTo(project.mapOl2, {
                    sourcePosition: { x: x1, y: y1 },
                    targetPosition: { x: x1, y: y1 + delta_y },
                });
                await project.editingSubmitForm();

                // Check the ID has not changed
                const idsEdited = await editedFeatureIds(page);
                await expect(ids['id']).toEqual(idsEdited['id']);

                // Open its popup using the new point in the geometry
                // The popup must open, it means the geometry has been updated
                // Check the updated value and remove the feature
                await project.clickOnMap(x1, y1 + delta_y);
                const feature = await project.identifyContentLocator(ids['id'], layerId);
                await expect(feature.locator(`tr[data-field-name="${field}"] td`)).toHaveText("VALUE EDITED");

                page.on('dialog', dialog => dialog.accept());
                await feature.locator(".feature-delete").click();
                await expect(page.locator(".jelix-msg-item-success")).toHaveText("The feature has been deleted.");

            });

        });
    });
