import { expect } from 'chai';

import { readFileSync } from 'fs';

import { ConversionError } from 'assets/src/modules/Errors.js';
import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { base64png, base64svg, base64svgPointLayer, base64svgLineLayer, base64svgPolygonLayer, base64svgRasterLayer, base64svgOlLayer } from 'assets/src/modules/state/SymbologyIcons.js';
import { BaseIconSymbology, LayerIconSymbology, LayerSymbolsSymbology, SymbolIconSymbology } from 'assets/src/modules/state/Symbology.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { MapLayerLoadStatus, MapGroupState, MapRootState } from 'assets/src/modules/state/MapLayer.js';

import { LayerTreeGroupState, LayerTreeLayerState, TreeRootState } from 'assets/src/modules/state/LayerTree.js';
import { ExternalLayerTreeGroupState } from 'assets/src/modules/state/ExternalLayerTree.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';

import { default as ol } from 'assets/src/dependencies/ol.js';

/**
 * Returns the root LayerTreeGroupState for the project
 *
 * The files for building it are stored in js-units/data/ and are
 * - name +'-capabilities.json': the WMS capabilities parsed by OpenLayers
 * - name +'-config.json': the Lizmap config send by lizmap web client
 *
 * @param {String} name - The project name
 *
 * @return {LayerTreeGroupState}
 **/
function getRootLayerTreeGroupState(name) {
    const capabilities = JSON.parse(readFileSync('./tests/js-units/data/'+ name +'-capabilities.json', 'utf8'));
    expect(capabilities).to.not.be.undefined
    expect(capabilities.Capability).to.not.be.undefined
    const config = JSON.parse(readFileSync('./tests/js-units/data/'+ name +'-config.json', 'utf8'));
    expect(config).to.not.be.undefined

    const layers = new LayersConfig(config.layers);

    let invalid = [];
    const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

    expect(invalid).to.have.length(0);
    expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

    const layersOrder = buildLayersOrder(config, rootCfg);

    const options = new OptionsConfig(config.options);
    const collection = new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);

    const rootMapGroup = new MapRootState(collection.root);
    expect(rootMapGroup).to.be.instanceOf(MapGroupState)

    const root = new TreeRootState(rootMapGroup);
    expect(root).to.be.instanceOf(LayerTreeGroupState)
    expect(root).to.be.instanceOf(TreeRootState)
    return root;
}

describe('LayerTreeGroupState', function () {
    it('Valid', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.wmsName).to.be.eq('Montpellier-Transports')
        expect(root.wmsTitle).to.be.eq('Montpellier - Transports')
        expect(root.wmsGeographicBoundingBox).to.be.null
        expect(root.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(root.checked).to.be.true
        expect(root.visibility).to.be.true
        expect(root.layerConfig).to.be.null
        expect(root.mutuallyExclusive).to.be.false
        expect(root.childrenCount).to.be.eq(4)

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupState)
        expect(transports.wmsMinScaleDenominator).to.be.eq(-1)
        expect(transports.wmsMaxScaleDenominator).to.be.eq(-1)

        const bus = transports.children[0];
        expect(bus).to.be.instanceOf(LayerTreeGroupState)
        expect(bus.name).to.be.eq('Bus')
        expect(bus.type).to.be.eq('group')
        expect(bus.level).to.be.eq(2)
        expect(bus.wmsName).to.be.eq('Bus')
        expect(bus.wmsTitle).to.be.eq('Bus')
        expect(bus.layerConfig).to.not.be.null;
        expect(bus.childrenCount).to.be.eq(2)
        expect(bus.wmsMinScaleDenominator).to.be.eq(-1)
        expect(bus.wmsMaxScaleDenominator).to.be.eq(40001)

        const busStops = bus.children[0];
        expect(busStops).to.be.instanceOf(LayerTreeLayerState)
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.hasSelectedFeatures).to.be.false
        expect(busStops.isFiltered).to.be.false
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)

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
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.isFiltered).to.be.false
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
        const root = getRootLayerTreeGroupState('montpellier')
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
        const root = getRootLayerTreeGroupState('montpellier')
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
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        let rootLayerSymbologyChangedEvt = null;
        root.addListener(evt => {
            rootLayerSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)

        let sousquartiersSymbologyChangedEvt = null;
        sousquartiers.addListener(evt => {
            sousquartiersSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');

        sousquartiers.symbology = {
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8\/9hAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAALklEQVQ4jWNkYGD4xYAJ2KA0uhxWcWwGEA2YKNFMFQMGBxjigTgaC4MhECk2AAAHYQX6C8Zs7gAAAABJRU5ErkJggg==",
            "title":"SousQuartiers",
            "type":"layer",
            "name":"SousQuartiers"
        };
        expect(sousquartiers.icon).to.have.string(base64png)
        expect(sousquartiers.icon).to.be.eq(sousquartiers.symbology.icon)
        expect(sousquartiers.symbologyChildrenCount).to.be.eq(0)
        expect(sousquartiers.symbologyChildren).to.be.an('array').that.have.lengthOf(0)
        expect(sousquartiers.getSymbologyChildren().next().value).to.be.undefined
        // Event dispatched
        expect(sousquartiersSymbologyChangedEvt).to.not.be.null
        expect(sousquartiersSymbologyChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootLayerSymbologyChangedEvt).to.not.be.null
        expect(rootLayerSymbologyChangedEvt.name).to.be.eq('SousQuartiers')

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
        const root = getRootLayerTreeGroupState('montpellier')
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

        let names = []
        for (const layer of root.findTreeLayers()) {
            names.push(layer.name)
        }
        expect(names).to.be.deep.equal(root.findTreeLayerNames())

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

    it('getTreeLayerByName', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const busStops = root.getTreeLayerByName('bus_stops')
        expect(busStops).to.be.instanceOf(LayerTreeLayerState)
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)

        const sousquartiers = root.getTreeLayerByName('SousQuartiers')
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.type).to.be.eq('layer')
        expect(sousquartiers.level).to.be.eq(1)
        expect(sousquartiers.wmsName).to.be.eq('SousQuartiers')
        expect(sousquartiers.layerConfig).to.not.be.null;
        expect(sousquartiers.wmsStyles).to.be.instanceOf(Array)
        expect(sousquartiers.wmsStyles).to.have.length(1)
        expect(sousquartiers.wmsStyles[0].wmsName).to.be.eq('default')
        expect(sousquartiers.wmsStyles[0].wmsTitle).to.be.eq('default')
        expect(sousquartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(sousquartiers.wmsAttribution).to.be.null
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })

        // Try get an unknown layer
        try {
            root.getTreeLayerByName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupState)
        const busStops2 = root.getTreeLayerByName('bus_stops')
        expect(busStops2).to.be.eq(busStops)
    })

    it('Events', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        let rootLayerVisibilityChangedEvt = [];
        let rootGroupVisibilityChangedEvt = null;
        root.addListener(evt => {
            rootLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        root.addListener(evt => {
            rootGroupVisibilityChangedEvt = evt
        }, 'group.visibility.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)

        expect(sousquartiers.checked).to.be.false
        expect(sousquartiers.visibility).to.be.false

        let sousquartiersVisibilityChangedEvt = null;
        sousquartiers.addListener(evt => {
            sousquartiersVisibilityChangedEvt = evt
        }, 'layer.visibility.changed');

        // Change value
        sousquartiers.checked = true;
        // Event dispatched
        expect(sousquartiersVisibilityChangedEvt).to.not.be.null
        expect(sousquartiersVisibilityChangedEvt.name).to.be.eq('SousQuartiers')
        expect(sousquartiersVisibilityChangedEvt.visibility).to.be.true
        // Values have changed
        expect(sousquartiers.checked).to.be.true
        expect(sousquartiers.visibility).to.be.true
        // Events dispatched at root level
        expect(rootLayerVisibilityChangedEvt).to.have.length(1)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.equal(sousquartiersVisibilityChangedEvt)
        expect(rootGroupVisibilityChangedEvt).to.be.null

        // Reset
        sousquartiersVisibilityChangedEvt = null;
        rootLayerVisibilityChangedEvt = [];
        // Set same value
        sousquartiers.checked = true;
        // Nothing changed
        expect(sousquartiersVisibilityChangedEvt).to.be.null
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)

        // Change value
        sousquartiers.checked = false;
        // Event dispatched
        expect(sousquartiersVisibilityChangedEvt).to.not.be.null
        expect(sousquartiersVisibilityChangedEvt.name).to.be.eq('SousQuartiers')
        expect(sousquartiersVisibilityChangedEvt.visibility).to.be.false
        // Values have changed
        expect(sousquartiers.checked).to.be.false
        expect(sousquartiers.visibility).to.be.false
        // Events dispatched at root level
        expect(rootLayerVisibilityChangedEvt).to.have.length(1)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.equal(sousquartiersVisibilityChangedEvt)
        expect(rootGroupVisibilityChangedEvt).to.be.null

        // Reset
        sousquartiersVisibilityChangedEvt = null;
        rootLayerVisibilityChangedEvt = [];

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)

        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true

        const poi = edition.children[0];
        expect(poi).to.be.instanceOf(LayerTreeLayerState)

        expect(poi.checked).to.be.false
        expect(poi.visibility).to.be.false

        let editionVisibilityChangedEvt = null;
        edition.addListener(evt => {
            editionVisibilityChangedEvt = evt
        }, 'group.visibility.changed');

        let poiVisibilityChangedEvt = null;
        poi.addListener(evt => {
            poiVisibilityChangedEvt = evt
        }, 'layer.visibility.changed');

        // Change poi checked value
        poi.checked = true;
        // Poi event dispatched
        expect(poiVisibilityChangedEvt).to.not.be.null
        expect(poiVisibilityChangedEvt.name).to.be.eq('points_of_interest')
        expect(poiVisibilityChangedEvt.visibility).to.be.true
        // Poi values have changed
        expect(poi.checked).to.be.true
        expect(poi.visibility).to.be.true
        // Edition group event not dispatched
        expect(editionVisibilityChangedEvt).to.be.null
        // Edition group values have not changed
        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true
        // Events dispatched at root level
        expect(rootLayerVisibilityChangedEvt).to.have.length(1)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.equal(poiVisibilityChangedEvt)
        expect(rootGroupVisibilityChangedEvt).to.be.null

        // Reset
        poiVisibilityChangedEvt = null;
        rootLayerVisibilityChangedEvt = [];
        // Change edition group checked value
        edition.checked = false;
        // edition group event dispatched
        expect(editionVisibilityChangedEvt).to.not.be.null
        expect(editionVisibilityChangedEvt.name).to.be.eq('Edition')
        expect(editionVisibilityChangedEvt.visibility).to.be.false
        // Edition group values have changed
        expect(edition.checked).to.be.false
        expect(edition.visibility).to.be.false
        // Poi event dispatched
        expect(poiVisibilityChangedEvt).to.not.be.null
        // Poi still checked but not visible
        expect(poi.checked).to.be.true
        expect(poi.visibility).to.be.false
        // Events dispatched at root level
        expect(rootLayerVisibilityChangedEvt).to.have.length(2)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.equal(poiVisibilityChangedEvt)
        expect(rootLayerVisibilityChangedEvt[1].name).to.be.eq('edition_line')
        expect(rootGroupVisibilityChangedEvt).to.not.be.null
        expect(rootGroupVisibilityChangedEvt).to.be.deep.equal(editionVisibilityChangedEvt)

        // Reset
        editionVisibilityChangedEvt = null;
        poiVisibilityChangedEvt = null;
        rootLayerVisibilityChangedEvt = [];
        rootGroupVisibilityChangedEvt = null;

        // Change poi checked value
        poi.checked = false;
        // No visibility events dispatched
        expect(editionVisibilityChangedEvt).to.be.null
        expect(poiVisibilityChangedEvt).to.be.null
        // Edition group values have not changed
        expect(edition.checked).to.be.false
        expect(edition.visibility).to.be.false
        // Poi checked changed
        expect(poi.checked).to.be.false
        expect(poi.visibility).to.be.false
        // Events not dispatched at root level
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(rootGroupVisibilityChangedEvt).to.be.null

        // Change poi checked value
        poi.checked = true;
        // Visibility events dispatched
        expect(editionVisibilityChangedEvt).to.not.be.null
        expect(poiVisibilityChangedEvt).to.not.be.null
        // Edition group values have changed
        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true
        // Poi values have changed
        expect(poi.checked).to.be.true
        expect(poi.visibility).to.be.true
        // Events dispatched at root level
        expect(rootLayerVisibilityChangedEvt).to.have.length(2)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.equal(poiVisibilityChangedEvt)
        expect(rootLayerVisibilityChangedEvt[1].name).to.be.eq('edition_line')
        expect(rootGroupVisibilityChangedEvt).to.not.be.null

        // Reset root
        //editionVisibilityChangedEvt = null;
        //poiVisibilityChangedEvt = null;
        rootLayerVisibilityChangedEvt = [];
        rootGroupVisibilityChangedEvt = null;
        // Do not dispatch already dispatched event
        edition.dispatch(poiVisibilityChangedEvt);
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        edition.dispatch(editionVisibilityChangedEvt);
        expect(rootGroupVisibilityChangedEvt).to.be.null
    })

    it('Opacity', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        let rootLayerOpacityChangedEvt = [];
        let rootGroupOpacityChangedEvt = [];
        root.addListener(evt => {
            rootLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        root.addListener(evt => {
            rootGroupOpacityChangedEvt.push(evt)
        }, 'group.opacity.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.opacity).to.be.eq(1)

        let sousquartiersOpacityChangedEvt = null;
        sousquartiers.addListener(evt => {
            sousquartiersOpacityChangedEvt = evt
        }, 'layer.opacity.changed');

        // Change value
        sousquartiers.opacity = 0.8;
        // Event dispatched
        expect(sousquartiersOpacityChangedEvt).to.not.be.null
        expect(sousquartiersOpacityChangedEvt.name).to.be.eq('SousQuartiers')
        expect(sousquartiersOpacityChangedEvt.opacity).to.be.eq(0.8)
        // Values have changed
        expect(sousquartiers.opacity).to.be.eq(0.8)
        // Events dispatched at root level
        expect(rootLayerOpacityChangedEvt).to.have.length(1)
        expect(rootLayerOpacityChangedEvt[0]).to.be.deep.equal(sousquartiersOpacityChangedEvt)
        expect(rootGroupOpacityChangedEvt).to.have.length(0)

        //Reset
        rootLayerOpacityChangedEvt = [];
        rootGroupOpacityChangedEvt = [];
        sousquartiersOpacityChangedEvt = null;

        // Try set opacity to not a number
        try {
            sousquartiers.opacity = 'foobar';
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`foobar` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        }
        // Nothing change
        expect(sousquartiersOpacityChangedEvt).to.be.null
        expect(sousquartiers.opacity).to.be.eq(0.8)
        expect(rootLayerOpacityChangedEvt).to.have.length(0)
        expect(rootGroupOpacityChangedEvt).to.have.length(0)

        // Set to the same value
        sousquartiers.opacity = '0.8';
        // Nothing change
        expect(sousquartiersOpacityChangedEvt).to.be.null
        expect(sousquartiers.opacity).to.be.eq(0.8)
        expect(rootLayerOpacityChangedEvt).to.have.length(0)
        expect(rootGroupOpacityChangedEvt).to.have.length(0)

        // Test through groups
        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupState)

        let transportsLayerOpacityChangedEvt = [];
        let transportsGroupOpacityChangedEvt = [];
        transports.addListener(evt => {
            transportsLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        transports.addListener(evt => {
            transportsGroupOpacityChangedEvt.push(evt)
        }, 'group.opacity.changed');

        const tramGroup = transports.children[1];
        expect(tramGroup).to.be.instanceOf(LayerTreeGroupState)
        expect(tramGroup.name).to.be.eq('Tramway')

        let tramGroupLayerOpacityChangedEvt = [];
        let tramGroupGroupOpacityChangedEvt = null;
        tramGroup.addListener(evt => {
            tramGroupLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        tramGroup.addListener(evt => {
            tramGroupGroupOpacityChangedEvt = evt
        }, 'group.opacity.changed');

        const tramway = tramGroup.children[1];
        expect(tramway).to.be.instanceOf(LayerTreeLayerState)
        expect(tramway.name).to.be.eq('tramway')

        let tramwayOpacityChangedEvt = null;
        tramway.addListener(evt => {
            tramwayOpacityChangedEvt = evt
        }, 'layer.opacity.changed');

        // Change value
        tramway.opacity = 0.8;
        // Event dispatched
        expect(tramwayOpacityChangedEvt).to.not.be.null
        expect(tramwayOpacityChangedEvt.name).to.be.eq('tramway')
        expect(tramwayOpacityChangedEvt.opacity).to.be.eq(0.8)
        // Values have changed
        expect(tramway.opacity).to.be.eq(0.8)
        // Events dispatched at root level
        expect(tramGroupLayerOpacityChangedEvt).to.have.length(1)
        expect(tramGroupLayerOpacityChangedEvt[0]).to.be.deep.equal(tramwayOpacityChangedEvt)
        expect(tramGroupGroupOpacityChangedEvt).to.be.null
        expect(transportsLayerOpacityChangedEvt).to.have.length(1)
        expect(transportsLayerOpacityChangedEvt[0]).to.be.deep.equal(tramwayOpacityChangedEvt)
        expect(transportsGroupOpacityChangedEvt).to.have.length(0)
        expect(rootLayerOpacityChangedEvt).to.have.length(1)
        expect(rootLayerOpacityChangedEvt[0]).to.be.deep.equal(tramwayOpacityChangedEvt)
        expect(rootGroupOpacityChangedEvt).to.have.length(0)

        //Reset
        rootLayerOpacityChangedEvt = [];
        rootGroupOpacityChangedEvt = [];
        transportsLayerOpacityChangedEvt = [];
        transportsGroupOpacityChangedEvt = [];
        tramGroupLayerOpacityChangedEvt = [];
        tramGroupGroupOpacityChangedEvt = null;
        tramwayOpacityChangedEvt = null;

        // Change Group value
        tramGroup.opacity = 0.9;
        // Event dispatched
        expect(tramGroupGroupOpacityChangedEvt).to.not.be.null
        expect(tramGroupGroupOpacityChangedEvt.name).to.be.eq('Tramway')
        expect(tramGroupGroupOpacityChangedEvt.opacity).to.be.eq(0.9)
        // Values have changed
        expect(tramGroup.opacity).to.be.eq(0.9)
        expect(transportsLayerOpacityChangedEvt).to.have.length(0)
        expect(transportsGroupOpacityChangedEvt).to.have.length(1)
        expect(transportsGroupOpacityChangedEvt[0]).to.be.deep.equal(tramGroupGroupOpacityChangedEvt)
        expect(rootLayerOpacityChangedEvt).to.have.length(0)
        expect(rootGroupOpacityChangedEvt).to.have.length(1)
        expect(rootGroupOpacityChangedEvt[0]).to.be.deep.equal(tramGroupGroupOpacityChangedEvt)
    })

    it('LoadStatus', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        let rootLayerLoadStatusChangedEvt = [];
        root.addListener(evt => {
            rootLayerLoadStatusChangedEvt.push(evt)
        }, 'layer.load.status.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Undefined).that.be.eq('undefined')

        let sousquartiersLoadStatusChangedEvt = null;
        sousquartiers.addListener(evt => {
            sousquartiersLoadStatusChangedEvt = evt
        }, 'layer.load.status.changed');

        // Change value
        sousquartiers.mapItemState.loadStatus = MapLayerLoadStatus.Loading
        // Event dispatched
        expect(sousquartiersLoadStatusChangedEvt).to.not.be.null
        expect(sousquartiersLoadStatusChangedEvt.name).to.be.eq('SousQuartiers')
        expect(sousquartiersLoadStatusChangedEvt.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.be.eq('loading')
        // Values have changed
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.be.eq('loading')
        // Events dispatched at root level
        expect(rootLayerLoadStatusChangedEvt).to.have.length(1)
        expect(rootLayerLoadStatusChangedEvt[0]).to.be.deep.equal(sousquartiersLoadStatusChangedEvt)

        //Reset
        rootLayerLoadStatusChangedEvt = [];
        sousquartiersLoadStatusChangedEvt = null;

        // Test through groups
        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupState)

        let transportsLayerLoadStatusChangedEvt = [];
        transports.addListener(evt => {
            transportsLayerLoadStatusChangedEvt.push(evt)
        }, 'layer.load.status.changed');

        const tramGroup = transports.children[1];
        expect(tramGroup).to.be.instanceOf(LayerTreeGroupState)
        expect(tramGroup.name).to.be.eq('Tramway')

        let tramGroupLayerLoadStatusChangedEvt = [];
        tramGroup.addListener(evt => {
            tramGroupLayerLoadStatusChangedEvt.push(evt)
        }, 'layer.load.status.changed');

        const tramway = tramGroup.children[1];
        expect(tramway).to.be.instanceOf(LayerTreeLayerState)
        expect(tramway.name).to.be.eq('tramway')

        let tramwayLoadStatusChangedEvt = null;
        tramway.addListener(evt => {
            tramwayLoadStatusChangedEvt = evt
        }, 'layer.load.status.changed');

        // Change value
        tramway.mapItemState.loadStatus = MapLayerLoadStatus.Loading
        // Event dispatched
        expect(tramwayLoadStatusChangedEvt).to.not.be.null
        expect(tramwayLoadStatusChangedEvt.name).to.be.eq('tramway')
        expect(tramwayLoadStatusChangedEvt.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.be.eq('loading')
        // Values have changed
        expect(tramway.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.be.eq('loading')
        // Events dispatched at root level
        expect(tramGroupLayerLoadStatusChangedEvt).to.have.length(1)
        expect(tramGroupLayerLoadStatusChangedEvt[0]).to.be.deep.equal(tramwayLoadStatusChangedEvt)
        expect(transportsLayerLoadStatusChangedEvt).to.have.length(1)
        expect(transportsLayerLoadStatusChangedEvt[0]).to.be.deep.equal(tramwayLoadStatusChangedEvt)
        expect(rootLayerLoadStatusChangedEvt).to.have.length(1)
        expect(rootLayerLoadStatusChangedEvt[0]).to.be.deep.equal(tramwayLoadStatusChangedEvt)
    })

    it('WMS selected styles', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupState)

        const tramway = transports.children[1];
        expect(tramway).to.be.instanceOf(LayerTreeGroupState)
        expect(tramway.name).to.be.eq('Tramway')

        const tram = tramway.children[1];
        expect(tram).to.be.instanceOf(LayerTreeLayerState)
        expect(tram.name).to.be.eq('tramway')
        expect(tram.wmsSelectedStyleName).to.be.eq('black')
        expect(tram.wmsStyles).to.be.an('array').that.be.lengthOf(2)
        expect(tram.wmsStyles[0].wmsName).to.be.eq('black')
        expect(tram.wmsStyles[1].wmsName).to.be.eq('colored')

        // Apply a known style name
        tram.wmsSelectedStyleName = 'colored'
        expect(tram.wmsSelectedStyleName).to.be.eq('colored')

        // listen to layer style change
        let tramStyleChangedEvt = null;
        let rootStyleChangedEvt = null;
        tram.addListener(evt => {
            tramStyleChangedEvt = evt
        }, 'layer.style.changed');
        root.addListener(evt => {
            rootStyleChangedEvt = evt
        }, 'layer.style.changed');

        // Apply a default style name
        tram.wmsSelectedStyleName = ''
        expect(tram.wmsSelectedStyleName).to.be.eq('black')
        // Event dispatched
        expect(tramStyleChangedEvt).to.not.be.null
        expect(tramStyleChangedEvt.name).to.be.eq('tramway')
        expect(tramStyleChangedEvt.style).to.be.eq('black')
        expect(rootStyleChangedEvt).to.not.be.null
        expect(rootStyleChangedEvt).to.be.deep.equal(tramStyleChangedEvt)

        //Reset
        tramStyleChangedEvt = null;
        rootStyleChangedEvt = null;

        // Apply same style
        tram.wmsSelectedStyleName = 'black'
        // No event dispatched
        expect(tramStyleChangedEvt).to.be.null
        expect(rootStyleChangedEvt).to.be.null

        // Try to apply an unknown style name
        try {
            tram.wmsSelectedStyleName = 'foobar'
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot assign an unknown WMS style name! `foobar` is not in the layer `tramway` WMS styles!')
            expect(error).to.be.instanceOf(TypeError)
        }
        // No event dispatched
        expect(tramStyleChangedEvt).to.be.null
        expect(rootStyleChangedEvt).to.be.null
    })

    it('Legend on/off', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const legend = JSON.parse(readFileSync('./tests/js-units/data/montpellier-legend.json', 'utf8'));
        expect(legend).to.not.be.undefined

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(sousquartiers.symbology).to.be.null
        sousquartiers.symbology = legend.nodes[1]
        expect(sousquartiers.symbology).to.be.instanceOf(LayerIconSymbology)

        const quartiers = root.children[3];
        expect(quartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(quartiers.name).to.be.eq('Quartiers')
        expect(quartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(quartiers.symbology).to.be.null

        // Set symbology
        quartiers.symbology = legend.nodes[0]
        // Check symbology
        expect(quartiers.symbology).to.be.instanceOf(LayerSymbolsSymbology)
        expect(quartiers.symbology.childrenCount).to.be.eq(8)
        expect(quartiers.symbology.children[0]).to.be.instanceOf(SymbolIconSymbology)
        expect(quartiers.symbology.children[0].checked).to.be.true
        expect(quartiers.symbology.children[0].ruleKey).to.be.eq('0')

        // Unchecked rules
        quartiers.symbology.children[0].checked = false;
        quartiers.symbology.children[2].checked = false;
        quartiers.symbology.children[4].checked = false;
        quartiers.symbology.children[6].checked = false;
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:1,3,5,7',
          'LEGEND_OFF': 'Quartiers:0,2,4,6',
          'DPI': 96
        })

        // Checked rules
        quartiers.symbology.children[0].checked = true;
        quartiers.symbology.children[2].checked = true;
        quartiers.symbology.children[4].checked = true;
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:0,1,2,3,4,5,7',
          'LEGEND_OFF': 'Quartiers:6',
          'DPI': 96
        })

        // Checked all rules and events
        let rootLayerSymbolCheckedChangedEvt = [];
        let rootLayerVisibilityChangedEvt = [];
        let layerSymbolCheckedChangedEvt = [];
        let layerVisibilityChangedEvt = [];
        let symbolCheckedChangedEvt = null;
        quartiers.symbology.children[6].addListener(evt => {
            symbolCheckedChangedEvt = evt
        }, 'symbol.checked.changed');
        quartiers.addListener(evt => {
            layerSymbolCheckedChangedEvt.push(evt)
        }, 'layer.symbol.checked.changed');
        quartiers.addListener(evt => {
            layerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        root.addListener(evt => {
            rootLayerSymbolCheckedChangedEvt.push(evt)
        }, 'layer.symbol.checked.changed');
        root.addListener(evt => {
            rootLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        quartiers.symbology.children[6].checked = true;
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(symbolCheckedChangedEvt).to.not.be.null
        expect(symbolCheckedChangedEvt.title).to.be.eq('PRES D\'ARENE')
        expect(symbolCheckedChangedEvt.ruleKey).to.be.eq('6')
        expect(symbolCheckedChangedEvt.checked).to.be.true
        expect(layerSymbolCheckedChangedEvt).to.have.length(1)
        expect(layerSymbolCheckedChangedEvt[0].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[0].title).to.be.eq('PRES D\'ARENE')
        expect(layerSymbolCheckedChangedEvt[0].ruleKey).to.be.eq('6')
        expect(layerSymbolCheckedChangedEvt[0].checked).to.be.true
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(1)
        expect(rootLayerSymbolCheckedChangedEvt[0]).to.be.deep.eq(layerSymbolCheckedChangedEvt[0])
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)

        // Reset
        rootLayerSymbolCheckedChangedEvt = [];
        rootLayerVisibilityChangedEvt = [];
        layerSymbolCheckedChangedEvt = [];
        layerVisibilityChangedEvt = [];
        symbolCheckedChangedEvt = null;

        // Check layer visibility changed with symbols checked changed
        // Rule 0
        quartiers.symbology.children[0].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(1)
        expect(layerSymbolCheckedChangedEvt[0].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[0].ruleKey).to.be.eq('0')
        expect(layerSymbolCheckedChangedEvt[0].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(1)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Rule 1
        quartiers.symbology.children[1].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(2)
        expect(layerSymbolCheckedChangedEvt[1].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[1].ruleKey).to.be.eq('1')
        expect(layerSymbolCheckedChangedEvt[1].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(2)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Rule 2
        quartiers.symbology.children[2].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(3)
        expect(layerSymbolCheckedChangedEvt[2].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[2].ruleKey).to.be.eq('2')
        expect(layerSymbolCheckedChangedEvt[2].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(3)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Rule 3
        quartiers.symbology.children[3].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(4)
        expect(layerSymbolCheckedChangedEvt[3].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[3].ruleKey).to.be.eq('3')
        expect(layerSymbolCheckedChangedEvt[3].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(4)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Rule 4
        quartiers.symbology.children[4].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(5)
        expect(layerSymbolCheckedChangedEvt[4].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[4].ruleKey).to.be.eq('4')
        expect(layerSymbolCheckedChangedEvt[4].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(5)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Rule 5
        quartiers.symbology.children[5].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(6)
        expect(layerSymbolCheckedChangedEvt[5].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[5].ruleKey).to.be.eq('5')
        expect(layerSymbolCheckedChangedEvt[5].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(6)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Rule 6
        quartiers.symbology.children[6].checked = false;
        expect(symbolCheckedChangedEvt).to.not.be.null
        expect(symbolCheckedChangedEvt.ruleKey).to.be.eq('6')
        expect(symbolCheckedChangedEvt.checked).to.be.false
        expect(layerSymbolCheckedChangedEvt).to.have.length(7)
        expect(layerSymbolCheckedChangedEvt[6].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[6].ruleKey).to.be.eq('6')
        expect(layerSymbolCheckedChangedEvt[6].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(7)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(quartiers.visibility).to.be.true

        // Reset
        symbolCheckedChangedEvt = null;

        // Rule 7
        quartiers.symbology.children[7].checked = false;
        expect(symbolCheckedChangedEvt).to.be.null
        expect(layerSymbolCheckedChangedEvt).to.have.length(8)
        expect(layerSymbolCheckedChangedEvt[7].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[7].ruleKey).to.be.eq('7')
        expect(layerSymbolCheckedChangedEvt[7].checked).to.be.false
        expect(layerVisibilityChangedEvt).to.have.length(1)
        expect(layerVisibilityChangedEvt[0].name).to.be.eq('Quartiers')
        expect(layerVisibilityChangedEvt[0].visibility).to.be.false
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(8)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(1)
        expect(rootLayerVisibilityChangedEvt).to.be.deep.eq(layerVisibilityChangedEvt)
        expect(quartiers.visibility).to.be.false

        // Rule 6
        quartiers.symbology.children[6].checked = true;
        expect(symbolCheckedChangedEvt).to.not.be.null
        expect(symbolCheckedChangedEvt.ruleKey).to.be.eq('6')
        expect(symbolCheckedChangedEvt.checked).to.be.true
        expect(layerSymbolCheckedChangedEvt).to.have.length(9)
        expect(layerSymbolCheckedChangedEvt[8].name).to.be.eq('Quartiers')
        expect(layerSymbolCheckedChangedEvt[8].ruleKey).to.be.eq('6')
        expect(layerSymbolCheckedChangedEvt[8].checked).to.be.true
        expect(layerVisibilityChangedEvt).to.have.length(2)
        expect(layerVisibilityChangedEvt[1].name).to.be.eq('Quartiers')
        expect(layerVisibilityChangedEvt[1].visibility).to.be.true
        expect(rootLayerSymbolCheckedChangedEvt).to.have.length(9)
        expect(rootLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(rootLayerVisibilityChangedEvt).to.have.length(2)
        expect(rootLayerVisibilityChangedEvt).to.be.deep.eq(layerVisibilityChangedEvt)
        expect(quartiers.visibility).to.be.true
    })

    it('Filter & token', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })

        expect(sousquartiers.isFiltered).to.be.false

        // Checked filter and events
        let rootFilterChangedEvt = null;
        let rootFilterTokenChangedEvt = null;
        let rootOrderedChangedEvt = [];
        let layerFilterChangedEvt = null;
        let layerFilterTokenChangedEvt = null;
        let layerOrderedChangedEvt = [];
        // Add event listener
        sousquartiers.addListener(evt => {
            layerFilterChangedEvt = evt
            layerOrderedChangedEvt.push(evt)
        }, 'layer.filter.changed');
        sousquartiers.addListener(evt => {
            layerFilterTokenChangedEvt = evt
            layerOrderedChangedEvt.push(evt)
        }, 'layer.filter.token.changed');
        root.addListener(evt => {
            rootFilterChangedEvt = evt
            rootOrderedChangedEvt.push(evt)
        }, 'layer.filter.changed');
        root.addListener(evt => {
            rootFilterTokenChangedEvt = evt
            rootOrderedChangedEvt.push(evt)
        }, 'layer.filter.token.changed');

        // Set expressionFilter
        sousquartiers.mapItemState.itemState.expressionFilter = '"QUARTMNO" = \'HO\''
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(layerFilterTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(rootFilterTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" = 'HO'"
        })
    })
})

describe('TreeRootState', function () {
    it('createExternalGroup', function () {
        const root = getRootLayerTreeGroupState('montpellier');
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(extGroup.name).to.be.eq('test')

        // The external group has been added
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup).to.be.instanceOf(ExternalLayerTreeGroupState)
        expect(extTreeGroup.type).to.be.eq('ext-group')
        expect(extTreeGroup.level).to.be.eq(1)
        expect(extTreeGroup.name).to.be.eq('test')
        expect(extTreeGroup.mapItemState).to.be.eq(extGroup)
    })

    it('removeExternalGroup', function () {
        const root = getRootLayerTreeGroupState('montpellier');
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(extGroup.name).to.be.eq('test')

        // The external group has been added
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        // Remove external group
        mapRoot.removeExternalGroup('test')
        expect(mapRoot.childrenCount).to.be.eq(4)
        expect(root.childrenCount).to.be.eq(4)
    })

    it('External events', function () {
        const root = getRootLayerTreeGroupState('montpellier');
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(extGroup.name).to.be.eq('test')

        // The external group has been added
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

		// OL layer removed event
		let olLayerAddedEvt;
		extGroup.addListener(evt => {
			olLayerAddedEvt = evt;
		}, 'ol-layer.added');
		// OL layer wmsTitle changed event
		let olLayerWmsTitleChangedEvt;
		extGroup.addListener(evt => {
			olLayerWmsTitleChangedEvt = evt;
		}, 'ol-layer.wmsTitle.changed');
		// OL layer icon changed event
		let olLayerIconChangedEvt;
		extGroup.addListener(evt => {
			olLayerIconChangedEvt = evt;
		}, 'ol-layer.icon.changed');
		// OL layer removed event
		let olLayerRemovedEvt;
		extGroup.addListener(evt => {
			olLayerRemovedEvt = evt;
		}, 'ol-layer.removed');


		// Add OpenLayers layer
		const olLayer = new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: 'https://ahocevar.com/geoserver/gwc/service/wms',
				crossOrigin: '',
				params: {
					'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
					'TILED': true,
					'VERSION': '1.1.1',
				},
				projection: 'EPSG:4326',
				// Source tile grid (before reprojection)
				tileGrid: ol.tilegrid.createXYZ({
					extent: [-180, -90, 180, 90],
					maxResolution: 360 / 512,
					maxZoom: 10,
				}),
				// Accept a reprojection error of 2 pixels
				reprojectionErrorThreshold: 2,
			}),
		});
		const olLayerState = extGroup.addOlLayer('wms4326', olLayer);
		expect(olLayerState.type).to.be.eq('ol-layer')
        expect(olLayerState.name).to.be.eq('wms4326')
        expect(olLayerState.wmsTitle).to.be.eq(olLayerState.name)
        expect(olLayerState.icon).to.be.eq(base64svg+base64svgOlLayer)

		// Event dispatched
		expect(olLayerAddedEvt).to.not.be.undefined
		expect(olLayerAddedEvt.name).to.be.eq('test')
		expect(olLayerAddedEvt.childName).to.be.eq('wms4326')
		expect(olLayerAddedEvt.childrenCount).to.be.eq(1)

        // Update wmsTitle
        const newWmsTitle = 'WMS 4326 layer'
        olLayerState.wmsTitle = newWmsTitle
        expect(olLayerState.name).to.be.eq('wms4326')
        expect(olLayerState.wmsTitle).to.not.be.eq(olLayerState.name)
        expect(olLayerState.wmsTitle).to.be.eq(newWmsTitle)

		// Event dispatched
		expect(olLayerWmsTitleChangedEvt).to.not.be.undefined
		expect(olLayerWmsTitleChangedEvt.name).to.be.eq(olLayerState.name)
        expect(olLayerWmsTitleChangedEvt.wmsTitle).to.be.eq(newWmsTitle)

        // Update icon
        const newIcon = base64svg+base64svgRasterLayer
        olLayerState.icon = newIcon
        expect(olLayerState.icon).to.not.be.eq(base64svg+base64svgOlLayer)
        expect(olLayerState.icon).to.be.eq(newIcon)

		// Event dispatched
		expect(olLayerIconChangedEvt).to.not.be.undefined
		expect(olLayerIconChangedEvt.name).to.be.eq(olLayerState.name)
        expect(olLayerIconChangedEvt.icon).to.be.eq(newIcon)

		// Remove child
		expect(extGroup.removeOlLayer('wms4326')).to.be.deep.eq(olLayerState)
		expect(extGroup.childrenCount).to.be.eq(0)

		// Event dispatched
		expect(olLayerRemovedEvt).to.not.be.undefined
		expect(olLayerRemovedEvt.name).to.be.eq('test')
		expect(olLayerRemovedEvt.childName).to.be.eq('wms4326')
		expect(olLayerRemovedEvt.childrenCount).to.be.eq(0)
    })
})
