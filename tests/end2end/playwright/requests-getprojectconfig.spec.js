// @ts-check
import { test, expect } from '@playwright/test';
import { expect as responseExpect } from './fixtures/expect-response.js'
import { getAuthStorageStatePath } from './globals';

test.describe('Request Lizmap GetProjectConfig - anonymous - @requests @readonly', () => {
    test('Failed - Project is mandatory', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            // project: 'hide_project',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(404);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });

    test('Failed - Repository is mandatory', async({ request }) => {
        let params = new URLSearchParams({
            // repository: 'testsrepository',
            project: 'hide_project',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        responseExpect(response).toBeXml(404);
        // check body
        let body = await response.text();
        expect(body).toContain('ServiceException');
    });

    test('Empty config from hide_project', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'hide_project',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).toHaveProperty('hideProject', 'True');

        expect(body.warnings).toEqual({});

        expect(body.layers).toEqual({});

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).toEqual({});

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });

    test('The config from selection', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(2);
        expect(body.layers).toHaveProperty('selection');
        expect(body.layers).toHaveProperty('selection_polygon');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(2);
        expect(body.attributeLayers).toHaveProperty('selection');
        expect(body.attributeLayers).toHaveProperty('selection_polygon');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).not.toEqual({});
        expect(Object.keys(body.loginFilteredLayers)).toHaveLength(1);
        expect(body.loginFilteredLayers).toHaveProperty('selection');

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });

    test('The config from dataviz', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'dataviz',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(2);
        expect(body.layers).toHaveProperty('bakeries');
        expect(body.layers).toHaveProperty('polygons');

        expect(body.locateByLayer).not.toEqual({});
        expect(Object.keys(body.locateByLayer)).toHaveLength(1);
        expect(body.locateByLayer).toHaveProperty('polygons');

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(2);
        expect(body.attributeLayers).toHaveProperty('bakeries');
        expect(body.attributeLayers).toHaveProperty('polygons');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).not.toEqual([]);
        expect(body.datavizLayers.layers).toHaveLength(5);
        expect(body.datavizLayers.dataviz).not.toEqual([]);
        expect(body.datavizLayers.dataviz).toHaveProperty('location', 'dock');
        expect(body.datavizLayers.dataviz).toHaveProperty('theme', 'light');

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });

    test('The config from dataviz_filtered_in_popup', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'dataviz_filtered_in_popup',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(2);
        expect(body.layers).toHaveProperty('bakeries');
        expect(body.layers).toHaveProperty('polygons');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).toEqual({});

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).not.toEqual([]);
        expect(body.datavizLayers.layers).toHaveLength(2);
        expect(body.datavizLayers.dataviz).not.toEqual([]);
        expect(body.datavizLayers.dataviz).toHaveProperty('location', 'only-popup');
        expect(body.datavizLayers.dataviz).toHaveProperty('theme', 'light');

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });

    test('The config from filter_layer_by_user', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(3);
        expect(body.layers).toHaveProperty('red_layer_with_no_filter');
        expect(body.layers).toHaveProperty('blue_filter_layer_by_user');
        expect(body.layers).toHaveProperty('green_filter_layer_by_user_edition_only');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).toEqual({});

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).not.toEqual({});
        expect(Object.keys(body.loginFilteredLayers)).toHaveLength(2);
        expect(body.loginFilteredLayers).toHaveProperty('blue_filter_layer_by_user');
        expect(body.loginFilteredLayers).toHaveProperty('green_filter_layer_by_user_edition_only');

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('themes');

        expect(body).toHaveProperty('editionLayers');
        expect(Object.keys(body.editionLayers)).toHaveLength(3);
        expect(body.editionLayers).toHaveProperty('red_layer_with_no_filter');
        expect(body.editionLayers).toHaveProperty('blue_filter_layer_by_user');
        expect(body.editionLayers).toHaveProperty('green_filter_layer_by_user_edition_only');
    });

    test('The config from filter_layer_data_by_polygon_for_groups', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(7);
        expect(body.layers).toHaveProperty('PostgreSQL');
        expect(body.layers).toHaveProperty('townhalls_pg');
        expect(body.layers).toHaveProperty('shop_bakery_pg');
        expect(body.layers).toHaveProperty('Shapefiles');
        expect(body.layers).toHaveProperty('townhalls_EPSG2154');
        expect(body.layers).toHaveProperty('shop_bakery');
        expect(body.layers).toHaveProperty('polygons');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(4);
        expect(body.attributeLayers).toHaveProperty('townhalls_pg');
        expect(body.attributeLayers).toHaveProperty('shop_bakery_pg');
        expect(body.attributeLayers).toHaveProperty('townhalls_EPSG2154');
        expect(body.attributeLayers).toHaveProperty('shop_bakery');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).not.toEqual([]);
        expect(body.printTemplates).toHaveLength(1);

        expect(body.layouts.list).not.toEqual([]);
        expect(body.layouts.list).toHaveLength(1);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.config).toHaveProperty('filter_by_user', false);
        expect(body.filter_by_polygon.config).toHaveProperty('group_field', 'groups');
        expect(body.filter_by_polygon.config).toHaveProperty('polygon_layer_id', body.layers.polygons.id);
        expect(body.filter_by_polygon.layers).not.toEqual([]);
        expect(body.filter_by_polygon.layers).toHaveLength(4);

        expect(body).not.toHaveProperty('themes');

        expect(body).toHaveProperty('editionLayers');
        expect(Object.keys(body.editionLayers)).toHaveLength(2);
        expect(body.editionLayers).toHaveProperty('townhalls_pg');
        expect(body.editionLayers).toHaveProperty('shop_bakery_pg');
    });

    test('The config from theme', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'theme',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(12);
        expect(body.layers).toHaveProperty('sousquartiers');
        expect(body.layers).toHaveProperty('Les quartiers');
        expect(body.layers).toHaveProperty('tramway_lines');
        expect(body.layers).toHaveProperty('townhalls_pg');
        expect(body.layers).toHaveProperty('baselayers');
        expect(body.layers).toHaveProperty('project-background-color');
        expect(body.layers).toHaveProperty('OpenStreetMap');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).toEqual({});

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');

        expect(body).toHaveProperty('themes');
        expect(Object.keys(body.themes)).toHaveLength(5);
        expect(body.themes).toHaveProperty('theme1');
        expect(body.themes).toHaveProperty('theme2');
        expect(body.themes).toHaveProperty('theme3');
        expect(body.themes).toHaveProperty('theme4');
        expect(body.themes).toHaveProperty('theme5');
        // theme1
        expect(body.themes.theme1).toHaveProperty('layers');
        expect(Object.keys(body.themes.theme1.layers)).toHaveLength(1);
        expect(body.themes.theme1.layers).toHaveProperty(body.layers['Les quartiers'].id);
        expect(body.themes.theme1.layers[body.layers['Les quartiers'].id]).toEqual({
            'style': 'style1',
            'expanded': false,
            'visible': true,
        });
        expect(body.themes.theme1).toHaveProperty('checkedGroupNode');
        expect(body.themes.theme1.checkedGroupNode).toHaveLength(1);
        expect(body.themes.theme1.checkedGroupNode).toEqual(['group1']);
        expect(body.themes.theme1).toHaveProperty('expandedGroupNode');
        expect(body.themes.theme1.expandedGroupNode).toHaveLength(0);
        expect(body.themes.theme1).toHaveProperty('checkedLegendNodes');
        expect(body.themes.theme1.checkedLegendNodes).toHaveLength(0);
        // theme2
        expect(body.themes.theme2).toHaveProperty('layers');
        expect(Object.keys(body.themes.theme2.layers)).toHaveLength(1);
        expect(body.themes.theme2.layers).toHaveProperty(body.layers['Les quartiers'].id);
        expect(body.themes.theme2.layers[body.layers['Les quartiers'].id]).toEqual({
            'style': 'style2',
            'expanded': true,
            'visible': true,
        });
        expect(body.themes.theme2).toHaveProperty('checkedGroupNode');
        expect(body.themes.theme2.checkedGroupNode).toHaveLength(0);
        expect(body.themes.theme2).toHaveProperty('expandedGroupNode');
        expect(body.themes.theme2.expandedGroupNode).toHaveLength(1);
        expect(body.themes.theme2.expandedGroupNode).toEqual(['group1']);
        expect(body.themes.theme2).toHaveProperty('checkedLegendNodes');
        expect(body.themes.theme2.checkedLegendNodes).toHaveLength(0);
        // theme3
        expect(body.themes.theme3).toHaveProperty('layers');
        expect(Object.keys(body.themes.theme3.layers)).toHaveLength(2);
        expect(body.themes.theme3).toHaveProperty('checkedGroupNode');
        expect(body.themes.theme3.checkedGroupNode).toHaveLength(5);
        expect(body.themes.theme3.checkedGroupNode).toEqual(expect.arrayContaining([
            'group with subgroups/sub-group-1/sub-sub-group--1',
            'group with subgroups/sub-group-1',
            'baselayers/project-background-color',
            'group with subgroups',
            'baselayers',
        ]));
        expect(body.themes.theme3).toHaveProperty('expandedGroupNode');
        expect(body.themes.theme3.expandedGroupNode).toHaveLength(3);
        expect(body.themes.theme3.expandedGroupNode).toEqual(expect.arrayContaining([
            'group with subgroups/sub-group-1/sub-sub-group--1',
            'group with subgroups/sub-group-1',
            'group with subgroups',
        ]));
        expect(body.themes.theme3).toHaveProperty('checkedLegendNodes');
        expect(body.themes.theme3.checkedLegendNodes).toHaveLength(0);
        // theme4
        expect(body.themes.theme4).toHaveProperty('layers');
        expect(Object.keys(body.themes.theme4.layers)).toHaveLength(3);
        expect(body.themes.theme4).toHaveProperty('checkedGroupNode');
        expect(body.themes.theme4.checkedGroupNode).toHaveLength(2);
        expect(body.themes.theme4.checkedGroupNode).toEqual(expect.arrayContaining([
            'group1', 'baselayers'
        ]));
        expect(body.themes.theme4).toHaveProperty('expandedGroupNode');
        expect(body.themes.theme4.expandedGroupNode).toHaveLength(4);
        expect(body.themes.theme4.expandedGroupNode).toEqual(expect.arrayContaining([
            'group1',
            'group with subgroups/sub-group-1/sub-sub-group--1',
            'group with subgroups/sub-group-1',
            'baselayers',
        ]));
        expect(body.themes.theme4).toHaveProperty('checkedLegendNodes');
        expect(body.themes.theme4.checkedLegendNodes).toHaveLength(0);
        // theme5
        expect(body.themes.theme5).toHaveProperty('layers');
        expect(Object.keys(body.themes.theme5.layers)).toHaveLength(3);
        expect(body.themes.theme5.layers).toHaveProperty(body.layers['sousquartiers'].id);
        expect(body.themes.theme5.layers[body.layers['sousquartiers'].id]).toEqual({
            'style': 'défaut',
            'expanded': true,
            'visible': true,
        });
        expect(body.themes.theme5.layers).toHaveProperty(body.layers['tramway_lines'].id);
        expect(body.themes.theme5.layers[body.layers['tramway_lines'].id]).toEqual({
            'style': 'default',
            'expanded': true,
            'visible': false,
        });
        expect(body.themes.theme5.layers).toHaveProperty(body.layers['townhalls_pg'].id);
        expect(body.themes.theme5.layers[body.layers['townhalls_pg'].id]).toEqual({
            'style': 'default',
            'expanded': true,
            'visible': false,
        });
        expect(body.themes.theme5).toHaveProperty('checkedGroupNode');
        expect(body.themes.theme5.checkedGroupNode).toHaveLength(2);
        expect(body.themes.theme5.checkedGroupNode).toEqual(expect.arrayContaining([
            'group1', 'group with subgroups/sub-group-1'
        ]));
        expect(body.themes.theme5).toHaveProperty('expandedGroupNode');
        expect(body.themes.theme5.expandedGroupNode).toHaveLength(4);
        expect(body.themes.theme5.expandedGroupNode).toEqual(expect.arrayContaining([
            'group with subgroups/sub-group-1/sub-sub-group--2',
            'group with subgroups',
            'group with subgroups/sub-group-1/sub-sub-group--1',
            'group with subgroups/sub-group-1',
        ]));
        expect(body.themes.theme5).toHaveProperty('checkedLegendNodes');
        expect(body.themes.theme5.checkedLegendNodes).toHaveLength(0);
    });

    test('The config from print', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'print',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(4);
        expect(body.layers).toHaveProperty('sousquartiers');
        expect(body.layers).toHaveProperty('quartiers');
        expect(body.layers).toHaveProperty('baselayers');
        expect(body.layers).toHaveProperty('OpenStreetMap');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(1);
        expect(body.attributeLayers).toHaveProperty('quartiers');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).not.toEqual([]);
        expect(body.printTemplates).toHaveLength(5);
        expect(body.printTemplates[0]).toMatchObject({
            title: 'print_labels',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 227,
                height: 150,
                grid: false,
                overviewMap: null,
            }],
            labels: [{
                id: 'multiline_label',
                htmlState: true,
                text: 'Multiline label',
            },{
                id: 'simple_label',
                htmlState: false,
                text: 'simple label',
            }],
            atlas: {
                enabled: false,
            }
        });
        expect(body.printTemplates[1]).toMatchObject({
            title: 'print_map',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 98,
                height: 152,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: false,
            }
        });
        expect(body.printTemplates[2]).toMatchObject({
            title: 'atlas_quartiers',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 236,
                height: 156,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: true,
                coverageLayer: body.layers.quartiers.id,
            }
        });
        expect(body.printTemplates[3]).toMatchObject({
            title: 'atlas_sousquartiers',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 230,
                height: 147,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: true,
                coverageLayer: body.layers.sousquartiers.id,
            }
        });
        expect(body.printTemplates[4]).toMatchObject({
            title: 'print_overview',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 46,
                height: 44,
                grid: false,
                overviewMap: body.printTemplates[4].maps[1].uuid,
            },{
                id: 'map1',
                width: 253,
                height: 171,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: false,
            }
        });

        expect(body.layouts.config).toHaveProperty('default_popup_print', true);
        expect(body.layouts.list).not.toEqual([]);
        expect(body.layouts.list).toHaveLength(5);
        expect(body.layouts.list[0]).toEqual({
            layout: 'print_labels',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
        });
        expect(body.layouts.list[1]).toEqual({
            layout: 'print_map',
            enabled: true,
            formats_available: ['png', 'jpeg'],
            default_format: 'jpeg',
            dpi_available: ['100', '200'],
            default_dpi: '200',
        });
        expect(body.layouts.list[2]).toEqual({
            layout: 'atlas_quartiers',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
            icon: 'media/svg/tree-fill.svg',
        });
        expect(body.layouts.list[3]).toEqual({
            layout: 'atlas_sousquartiers',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
        });
        expect(body.layouts.list[4]).toEqual({
            layout: 'print_overview',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
        });

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });

});

test.describe('Request Lizmap GetProjectConfig - admin - @requests @readonly', () => {
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('The config from selection', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'selection',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(2);
        expect(body.layers).toHaveProperty('selection');
        expect(body.layers).toHaveProperty('selection_polygon');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(2);
        expect(body.attributeLayers).toHaveProperty('selection');
        expect(body.attributeLayers).toHaveProperty('selection_polygon');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).not.toEqual({});
        expect(Object.keys(body.loginFilteredLayers)).toHaveLength(1);
        expect(body.loginFilteredLayers).toHaveProperty('selection');

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });

    test('The config from filter_layer_by_user', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_by_user',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(3);
        expect(body.layers).toHaveProperty('red_layer_with_no_filter');
        expect(body.layers).toHaveProperty('blue_filter_layer_by_user');
        expect(body.layers).toHaveProperty('green_filter_layer_by_user_edition_only');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).toEqual({});

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).toEqual([]);

        expect(body.layouts.list).toEqual([]);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).not.toEqual({});
        expect(Object.keys(body.loginFilteredLayers)).toHaveLength(2);
        expect(body.loginFilteredLayers).toHaveProperty('blue_filter_layer_by_user');
        expect(body.loginFilteredLayers).toHaveProperty('green_filter_layer_by_user_edition_only');

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('themes');

        expect(body).toHaveProperty('editionLayers');
        expect(Object.keys(body.editionLayers)).toHaveLength(3);
        expect(body.editionLayers).toHaveProperty('red_layer_with_no_filter');
        expect(body.editionLayers).toHaveProperty('blue_filter_layer_by_user');
        expect(body.editionLayers).toHaveProperty('green_filter_layer_by_user_edition_only');
    });

    test('The config from filter_layer_data_by_polygon_for_groups', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'filter_layer_data_by_polygon_for_groups',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(7);
        expect(body.layers).toHaveProperty('PostgreSQL');
        expect(body.layers).toHaveProperty('townhalls_pg');
        expect(body.layers).toHaveProperty('shop_bakery_pg');
        expect(body.layers).toHaveProperty('Shapefiles');
        expect(body.layers).toHaveProperty('townhalls_EPSG2154');
        expect(body.layers).toHaveProperty('shop_bakery');
        expect(body.layers).toHaveProperty('polygons');

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(4);
        expect(body.attributeLayers).toHaveProperty('townhalls_pg');
        expect(body.attributeLayers).toHaveProperty('shop_bakery_pg');
        expect(body.attributeLayers).toHaveProperty('townhalls_EPSG2154');
        expect(body.attributeLayers).toHaveProperty('shop_bakery');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).not.toEqual([]);
        expect(body.printTemplates).toHaveLength(1);

        expect(body.layouts.list).not.toEqual([]);
        expect(body.layouts.list).toHaveLength(1);

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.config).toHaveProperty('filter_by_user', false);
        expect(body.filter_by_polygon.config).toHaveProperty('group_field', 'groups');
        expect(body.filter_by_polygon.config).toHaveProperty('polygon_layer_id', body.layers.polygons.id);
        expect(body.filter_by_polygon.layers).not.toEqual([]);
        expect(body.filter_by_polygon.layers).toHaveLength(4);

        expect(body).not.toHaveProperty('themes');

        expect(body).toHaveProperty('editionLayers');
        expect(Object.keys(body.editionLayers)).toHaveLength(2);
        expect(body.editionLayers).toHaveProperty('townhalls_pg');
        expect(body.editionLayers).toHaveProperty('shop_bakery_pg');
    });

    test('The config from print', async({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'print',
        });
        let url = `/index.php/lizmap/service/getProjectConfig?${params}`;
        let response = await request.get(url, {});
        // check response
        await responseExpect(response).toBeLizmapConfig();

        // Check specific body
        let body = await response.json();

        expect(body.options).not.toHaveProperty('hideProject');

        expect(body.layers).not.toEqual({});
        expect(Object.keys(body.layers)).toHaveLength(4);

        expect(body.locateByLayer).toEqual({});

        expect(body.attributeLayers).not.toEqual({});
        expect(Object.keys(body.attributeLayers)).toHaveLength(1);
        expect(body.attributeLayers).toHaveProperty('quartiers');

        expect(body.timemanagerLayers).toEqual({});

        expect(body.relations.pivot).toEqual([]);

        expect(body.printTemplates).not.toEqual([]);
        expect(body.printTemplates).toHaveLength(6);
        expect(body.printTemplates[0]).toMatchObject({
            title: 'print_labels',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 227,
                height: 150,
                grid: false,
                overviewMap: null,
            }],
            labels: [{
                id: 'multiline_label',
                htmlState: true,
                text: 'Multiline label',
            },{
                id: 'simple_label',
                htmlState: false,
                text: 'simple label',
            }],
            atlas: {
                enabled: false,
            }
        });
        expect(body.printTemplates[1]).toMatchObject({
            title: 'print_map',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 98,
                height: 152,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: false,
            }
        });
        expect(body.printTemplates[2]).toMatchObject({
            title: 'atlas_quartiers',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 236,
                height: 156,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: true,
                coverageLayer: body.layers.quartiers.id,
            }
        });
        expect(body.printTemplates[3]).toMatchObject({
            title: 'atlas_sousquartiers',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 230,
                height: 147,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: true,
                coverageLayer: body.layers.sousquartiers.id,
            }
        });
        expect(body.printTemplates[4]).toMatchObject({
            title: 'print_allowed_groups',
        });
        expect(body.printTemplates[5]).toMatchObject({
            title: 'print_overview',
            width: 297,
            height: 210,
            maps: [{
                id: 'map0',
                width: 46,
                height: 44,
                grid: false,
                overviewMap: body.printTemplates[5].maps[1].uuid,
            },{
                id: 'map1',
                width: 253,
                height: 171,
                grid: false,
                overviewMap: null,
            }],
            labels: [],
            atlas: {
                enabled: false,
            }
        });

        expect(body.layouts.config).toHaveProperty('default_popup_print', true);
        expect(body.layouts.list).not.toEqual([]);
        expect(body.layouts.list).toHaveLength(6);
        expect(body.layouts.list[0]).toEqual({
            layout: 'print_labels',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
        });
        expect(body.layouts.list[1]).toEqual({
            layout: 'print_map',
            enabled: true,
            formats_available: ['png', 'jpeg'],
            default_format: 'jpeg',
            dpi_available: ['100', '200'],
            default_dpi: '200',
        });
        expect(body.layouts.list[2]).toEqual({
            layout: 'atlas_quartiers',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
            icon: 'media/svg/tree-fill.svg',
        });
        expect(body.layouts.list[3]).toEqual({
            layout: 'atlas_sousquartiers',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
        });
        expect(body.layouts.list[4]).toEqual({
            layout: 'print_allowed_groups',
            enabled: true,
            formats_available: ['pdf', 'svg', 'png', 'jpeg'],
            default_format: 'pdf',
            dpi_available: ['100', '200', '300'],
            default_dpi: '100',
        });
        expect(body.layouts.list[5]).toEqual({
            layout: 'print_overview',
            enabled: true,
            formats_available: ['pdf'],
            default_format: 'pdf',
            dpi_available: ['100'],
            default_dpi: '100',
        });

        expect(body.atlas.layers).toEqual([]);

        expect(body.tooltipLayers).toEqual({});

        expect(body.formFilterLayers).toEqual({});

        expect(body.datavizLayers.locale).not.toEqual('');
        expect(body.datavizLayers.layers).toEqual([]);
        expect(body.datavizLayers.dataviz).toEqual([]);

        expect(body.loginFilteredLayers).toEqual({});

        expect(body.filter_by_polygon.layers).toEqual([]);

        expect(body).not.toHaveProperty('editionLayers');
        expect(body).not.toHaveProperty('themes');
    });
});
