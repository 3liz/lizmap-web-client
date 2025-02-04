// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('QGIS Requests', () => {
    test('WMS Get Legend Graphic JSON', async ({ page }) => {
        const url = '/index.php/view/map?repository=testsrepository&project=layer_legends';
        await gotoMap(url, page)

        const single = await page.evaluate(async () => {
            return await fetch(
                "/index.php/lizmap/service?repository=testsrepository&project=layer_legends&" +
                "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=layer_legend_single_symbol&STYLE=&" +
                "EXCEPTIONS=application/vnd.ogc.se_inimage&FORMAT=application/json&TRANSPARENT=TRUE&DPI=96"
            ).then(r => r.ok ? r.json() : Promise.reject(r))
        })
        // check root
        expect(single.nodes).toHaveLength(1)
        expect(single.title).toBe('')
        // check node
        const singleNode = single.nodes[0]
        expect(singleNode.type).toBe('layer')
        expect(singleNode.name).toBe('layer_legend_single_symbol')
        expect(singleNode.title).toBe('layer_legend_single_symbol')
        expect(singleNode.icon).not.toBeUndefined()
        expect(singleNode.symbols).toBeUndefined()

        const categorized = await page.evaluate(async () => {
            return await fetch(
                "/index.php/lizmap/service?repository=testsrepository&project=layer_legends&" +
                "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=layer_legend_categorized&STYLE=&" +
                "EXCEPTIONS=application/vnd.ogc.se_inimage&FORMAT=application/json&TRANSPARENT=TRUE&DPI=96"
            ).then(r => r.ok ? r.json() : Promise.reject(r))
        })
        // check root
        expect(categorized.nodes).toHaveLength(1)
        expect(categorized.title).toBe('')
        // check node
        const categorizedNode = categorized.nodes[0]
        expect(categorizedNode.type).toBe('layer')
        expect(categorizedNode.name).toBe('layer_legend_categorized')
        expect(categorizedNode.title).toBe('layer_legend_categorized')
        expect(categorizedNode.icon).toBeUndefined()
        expect(categorizedNode.symbols).not.toBeUndefined()
        expect(categorizedNode.symbols).toHaveLength(2)

        const group = await page.evaluate(async () => {
            return await fetch(
                "/index.php/lizmap/service?repository=testsrepository&project=layer_legends&" +
                "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=legend_option_test&STYLE=" +
                "&EXCEPTIONS=application/vnd.ogc.se_inimage&FORMAT=application/json&TRANSPARENT=TRUE&DPI=96"
            ).then(r => r.ok ? r.json() : Promise.reject(r))
        })
        // check root
        expect(group.nodes).toHaveLength(1)
        expect(group.title).toBe('')
        // check node
        const groupNode = group.nodes[0]
        expect(groupNode.type).toBe('group')
        expect(groupNode.name).toBe('legend_option_test')
        expect(groupNode.title).toBe('legend_option_test')
        expect(groupNode.icon).toBeUndefined()
        expect(groupNode.symbols).toBeUndefined()
        expect(groupNode.nodes).not.toBeUndefined()
        expect(groupNode.nodes).toHaveLength(3)

        const combined = await page.evaluate(async () => {
            // To get layer_legend_single_symbol first, layer_legend_categorized second and legend_option_test third
            // LAYER parameter has to be the inverse: legend_option_test,layer_legend_categorized,layer_legend_single_symbol
            return await fetch(
                "/index.php/lizmap/service?repository=testsrepository&project=layer_legends&" +
                "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&" +
                "LAYER=legend_option_test,layer_legend_categorized,layer_legend_single_symbol&STYLE=&" +
                "EXCEPTIONS=application/vnd.ogc.se_inimage&FORMAT=application/json&TRANSPARENT=TRUE&DPI=96"
            ).then(r => r.ok ? r.json() : Promise.reject(r))
        })
        // check root
        expect(combined.nodes).toHaveLength(3)
        expect(combined.title).toBe('')
        // check first node as single node
        const firstNode = combined.nodes[0]
        expect(firstNode.type).toBe(singleNode.type)
        expect(firstNode.name).toBe(singleNode.name)
        expect(firstNode.title).toBe(singleNode.title)
        expect(firstNode.icon).toBe(singleNode.icon)
        expect(firstNode.symbols).toBe(singleNode.symbols)
        // check second node as categorized node
        const secondNode = combined.nodes[1]
        expect(secondNode.type).toBe(categorizedNode.type)
        expect(secondNode.name).toBe(categorizedNode.name)
        expect(secondNode.title).toBe(categorizedNode.title)
        expect(secondNode.icon).toBe(categorizedNode.icon)
        expect(secondNode.symbols).not.toBeUndefined()
        expect(secondNode.symbols).toMatchObject(categorizedNode.symbols)
        // check third node as group node
        const thirdNode = combined.nodes[2]
        expect(thirdNode.type).toBe(groupNode.type)
        expect(thirdNode.name).toBe(groupNode.name)
        expect(thirdNode.title).toBe(groupNode.title)
        expect(thirdNode.icon).toBe(groupNode.icon)
        expect(thirdNode.symbols).toBe(groupNode.symbols)
        expect(thirdNode.nodes).not.toBeUndefined()
        expect(thirdNode.nodes).toHaveLength(3)
        expect(thirdNode.nodes).toMatchObject(groupNode.nodes)
    });
});
