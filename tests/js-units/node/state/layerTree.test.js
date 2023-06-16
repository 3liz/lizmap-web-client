import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from '../../../../assets/src/modules/config/Layer.js';
import { LayerGeographicBoundingBoxConfig, LayerBoundingBoxConfig, LayerTreeGroupConfig, buildLayerTreeConfig } from '../../../../assets/src/modules/config/LayerTree.js';
import { base64png, base64svg, base64svgPointLayer, base64svgLineLayer, base64svgPolygonLayer, BaseIconSymbology, SymbolIconSymbology } from '../../../../assets/src/modules/state/Symbology.js';
import { buildLayersOrder } from '../../../../assets/src/modules/config/LayersOrder.js';
import { MapGroupState, MapLayerState } from '../../../../assets/src/modules/state/MapLayer.js';

import { LayerTreeGroupState, LayerTreeLayerState } from '../../../../assets/src/modules/state/LayerTree.js';

describe('LayerTreeGroupState', function () {
    it('Valid', function () {
        const capabilities = JSON.parse(readFileSync('./data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);
        expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const rootMapGroup = new MapGroupState(rootCfg, layersOrder);

        const root = new LayerTreeGroupState(rootMapGroup);
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.wmsName).to.be.eq('Montpellier-Transports')
        expect(root.wmsTitle).to.be.eq('Montpellier - Transports')
        expect(root.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(root.wmsGeographicBoundingBox.west).to.be.eq(43.542477)
        expect(root.wmsGeographicBoundingBox.south).to.be.eq(3.746034)
        expect(root.wmsGeographicBoundingBox.east).to.be.eq(43.672144)
        expect(root.wmsGeographicBoundingBox.north).to.be.eq(4.01689)
        expect(root.wmsBoundingBoxes).to.be.instanceOf(Array)
        expect(root.wmsBoundingBoxes).to.have.length(3)
        expect(root.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(root.wmsBoundingBoxes[0].crs).to.be.eq('EPSG:3857')
        expect(root.wmsBoundingBoxes[0].xmin).to.be.eq(417006.613)
        expect(root.wmsBoundingBoxes[0].ymin).to.be.eq(5394910.34)
        expect(root.wmsBoundingBoxes[0].xmax).to.be.eq(447158.049)
        expect(root.wmsBoundingBoxes[0].ymax).to.be.eq(5414844.995)
        expect(root.checked).to.be.true
        expect(root.visibility).to.be.true
        expect(root.layerConfig).to.be.null
        expect(root.mutuallyExclusive).to.be.false
        expect(root.childrenCount).to.be.eq(4)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)
        expect(edition.name).to.be.eq('Edition')
        expect(edition.type).to.be.eq('group')
        expect(edition.level).to.be.eq(1)
        expect(edition.wmsName).to.be.eq('Edition')
        expect(edition.wmsTitle).to.be.eq('Edition')
        expect(edition.layerConfig).to.not.be.null
        expect(root.mutuallyExclusive).to.be.false
        expect(edition.childrenCount).to.be.eq(3)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.type).to.be.eq('layer')
        expect(sousquartiers.level).to.be.eq(1)
        expect(sousquartiers.wmsName).to.be.eq('SousQuartiers')
        expect(sousquartiers.wmsTitle).to.be.eq('SousQuartiers')
        expect(sousquartiers.layerConfig).to.not.be.null;
        expect(sousquartiers.wmsStyles).to.be.instanceOf(Array)
        expect(sousquartiers.wmsStyles).to.have.length(1)
        expect(sousquartiers.wmsStyles[0].wmsName).to.be.eq('default')
        expect(sousquartiers.wmsStyles[0].wmsTitle).to.be.eq('default')
        expect(sousquartiers.wmsAttribution).to.be.null

        const rootGetChildren = root.getChildren()
        expect(rootGetChildren.next().value).to.be.eq(edition)
        const child2 = rootGetChildren.next().value;
        expect(child2).to.be.instanceOf(LayerTreeGroupState)
        expect(child2.name).to.be.eq('datalayers')
        expect(rootGetChildren.next().value).to.be.eq(sousquartiers)
        const child4 = rootGetChildren.next().value;
        expect(child4).to.be.instanceOf(LayerTreeLayerState)
        expect(child4.name).to.be.eq('Quartiers')
    })

    it('Check && visibility', function () {
        const capabilities = JSON.parse(readFileSync('./data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);
        expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const rootMapGroup = new MapGroupState(rootCfg, layersOrder);

        const root = new LayerTreeGroupState(rootMapGroup);
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        expect(root.checked).to.be.true
        expect(root.visibility).to.be.true

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)

        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true

        const poi = edition.children[0];
        expect(poi).to.be.instanceOf(LayerTreeLayerState)

        expect(poi.checked).to.be.false
        expect(poi.visibility).to.be.false

        const rides = edition.children[1];
        expect(rides).to.be.instanceOf(LayerTreeLayerState)

        expect(rides.checked).to.be.true
        expect(rides.visibility).to.be.true

        const areas = edition.children[2];
        expect(areas).to.be.instanceOf(LayerTreeLayerState)

        expect(areas.checked).to.be.false
        expect(areas.visibility).to.be.false

        // Unchecked group Edition
        edition.checked = false;

        expect(edition.checked).to.be.false
        expect(edition.visibility).to.be.false

        expect(poi.checked).to.be.false
        expect(poi.visibility).to.be.false

        expect(rides.checked).to.be.true
        expect(rides.visibility).to.be.false

        expect(areas.checked).to.be.false
        expect(areas.visibility).to.be.false

        // Checked Point Of Interests
        poi.checked = true;

        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true

        expect(poi.checked).to.be.true
        expect(poi.visibility).to.be.true

        expect(rides.checked).to.be.true
        expect(rides.visibility).to.be.true

        expect(areas.checked).to.be.false
        expect(areas.visibility).to.be.false
    })

    it('Icon', function () {
        const capabilities = JSON.parse(readFileSync('./data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);
        expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const rootMapGroup = new MapGroupState(rootCfg, layersOrder);

        const root = new LayerTreeGroupState(rootMapGroup);
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)

        const poi = edition.children[0];
        expect(poi).to.be.instanceOf(LayerTreeLayerState)
        expect(poi.icon).to.be.eq(base64svg+base64svgPointLayer)

        const rides = edition.children[1];
        expect(rides).to.be.instanceOf(LayerTreeLayerState)
        expect(rides.icon).to.be.eq(base64svg+base64svgLineLayer)

        const areas = edition.children[2];
        expect(areas).to.be.instanceOf(LayerTreeLayerState)
        expect(areas.icon).to.be.eq(base64svg+base64svgPolygonLayer)
    })

    it('Symbology', function () {
        const capabilities = JSON.parse(readFileSync('./data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);
        expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const rootMapGroup = new MapGroupState(rootCfg, layersOrder);

        const root = new LayerTreeGroupState(rootMapGroup);
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        sousquartiers.symbology = {
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAALklEQVQ4jWNkYGD4xYAJ2KA0uhxWcWwGEA2YKNFMFQMGBxjigTgaC4MhECk2AAAHYQX6C8Zs7gAAAABJRU5ErkJggg==",
            "title":"SousQuartiers",
            "type":"layer",
            "name":"SousQuartiers"
        };
        expect(sousquartiers.icon).to.have.string(base64png)
        expect(sousquartiers.icon).to.be.eq(sousquartiers.symbology.icon)
        expect(sousquartiers.symbologyChildrenCount).to.be.eq(0)

        const quartiers = root.children[3];
        expect(quartiers).to.be.instanceOf(LayerTreeLayerState)
        quartiers.symbology = {
            "symbols":[{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWUlEQVQ4jWO09w1bzEAApDX0Hp7VUGyLTY7R3jdscVpD72FChmADsxqKbZnI0YgMBtaAtIbewwPrAuoEIrlRCDeAYhfgSmH0c8HQN4ARPTvjy7roIK2h9zAAH0sa4\/UtHhUAAAAASUVORK5CYII=",
                "title":"CROIX D'ARGENT",
                "ruleKey":"0",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWUlEQVQ4jWPk1nVezEAACHsXHn67td8Wmxwjt67zYmHvwsOEDMEG3m7tt2UiRyMyGFgDhL0LDw+sC6gTiORGIdwAil2AK4XRzwVD3wBG9OyML+uiA2HvwsMACoMZCj04skUAAAAASUVORK5CYII=",
                "title":"HOPITAUX-FACULTES",
                "ruleKey":"1",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWUlEQVQ4jWN0DjZZzEAA5HWHHp5UutoWmxyjc7DJ4rzu0MOEDMEGJpWutmUiRyMyGFgD8rpDDw+sC6gTiORGIdwAil2AK4XRzwVD3wBG9OyML+uig7zu0MMALjsadrnFGLAAAAAASUVORK5CYII=",
                "title":"LES CEVENNES",
                "ruleKey":"2",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWklEQVQ4jWOMs7JazEAAzEmMO5wyf5EtNjnGOCurxXMS4w4TMgQbSJm\/yJaJHI3IYGANmJMYd3hgXUCdQCQ3CuEGUOwCXCmMfi4Y+gYwomdnfFkXHcxJjDsMAIAKGpsFw6NBAAAAAElFTkSuQmCC",
                "title":"MONTPELLIER CENTRE",
                "ruleKey":"3",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWUlEQVQ4jWMM4+RezEAA9AoIHC7+8MEWmxxjGCf34l4BgcOEDMEGij98sGUiRyMyGFgDegUEDg+sC6gTiORGIdwAil2AK4XRzwVD3wBG9OyML+uig14BgcMAV7AYtZKc8NMAAAAASUVORK5CYII=",
                "title":"MOSSON",
                "ruleKey":"4",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWklEQVQ4jWOMN2BYzEAALPBnOJywkcEWmxxjvAHD4gX+DIcJGYINJGxksGUiRyMyGFgDFvgzHB5YF1AnEMmNQrgBFLsAVwqjnwuGvgGM6NkZX9ZFBwv8GQ4DAGqJFGb85cxrAAAAAElFTkSuQmCC",
                "title":"PORT MARIANNE",
                "ruleKey":"5",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWUlEQVQ4jWP0dQ5czEAA1Oa1HW6eVGWLTY7R1zlwcW1e22FChmADzZOqbJnI0YgMBtaA2ry2wwPrAuoEIrlRCDeAYhfgSmH0c8HQN4ARPTvjy7rooDav7TAAFPoa3pkC2qcAAAAASUVORK5CYII=",
                "title":"PRES D'ARENE",
                "ruleKey":"6",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAWklEQVQ4jWNUF7NazEAAOKklHt53a74tNjlGdTGrxU5qiYcJGYIN7Ls135aJHI3IYGANcFJLPDywLqBOIJIbhXADKHYBrhRGPxcMfQMY0bMzvqyLDpzUEg8DAOMQGPhYL1pmAAAAAElFTkSuQmCC",
                "title":"",
                "ruleKey":"7",
                "checked":true
            }],
            "title":"Quartiers",
            "type":"layer",
            "name":"Quartiers"
        };
        expect(quartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)
        expect(quartiers.symbologyChildrenCount).to.be.eq(8)
        expect(quartiers.symbologyChildren).to.be.an('array').that.have.lengthOf(8)

        const quartierstSymbologyChildren = quartiers.getSymbologyChildren()
        expect(quartierstSymbologyChildren.next().value).to.be.instanceOf(BaseIconSymbology).that.be.instanceOf(SymbolIconSymbology)
    })

    it('findTreeLayerNames', function () {
        const capabilities = JSON.parse(readFileSync('./data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);
        expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const rootMapGroup = new MapGroupState(rootCfg, layersOrder);

        const root = new LayerTreeGroupState(rootMapGroup);
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        expect(root.findTreeLayerNames()).to.have.ordered.members([
            "points_of_interest",
            "edition_line",
            "areas_of_interest",
            "bus_stops",
            "bus",
            //"tramway_ref",
            //"tramway_pivot",
            //"tram_stop_work",
            "tramstop",
            "tramway",
            "publicbuildings",
            //"publicbuildings_tramstop",
            //"donnes_sociodemo_sous_quartiers",
            "SousQuartiers",
            "Quartiers",
            // "VilleMTP_MTP_Quartiers_2011_4326",
            // "osm-mapnik",
            // "osm-stamen-toner"
        ])

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupState)

        expect(transports.findTreeLayerNames()).to.have.ordered.members([
            "bus_stops",
            "bus",
            "tramstop",
            "tramway",
            "publicbuildings",
        ])
    })
})
