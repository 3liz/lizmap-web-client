import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { BaseLayerTypes, BaseLayerConfig, EmptyBaseLayerConfig, BaseLayersConfig } from 'assets/src/modules/config/BaseLayer.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';

import { BaseLayerState, EmptyBaseLayerState, BaseLayersState } from 'assets/src/modules/state/BaseLayer.js';

/**
 * Returns the BaseLayersState for the project
 *
 * The files for building it are stored in js-units/data/ and are
 * - name +'-capabilities.json': the WMS capabilities parsed by OpenLayers
 * - name +'-config.json': the Lizmap config send by lizmap web client
 *
 * @param {String} name - The project name
 * @param {string[]} expectedInvalidLayers - Expected list of invalid layers
 *
 * @return {BaseLayersState}
 **/
function getBaseLayersState(name, expectedInvalidLayers = []) {
    console.log(`Current test : ${name}`);
    const capabilities = JSON.parse(readFileSync(`./tests/js-units/data/${name}-capabilities.json`, 'utf8'));
    expect(capabilities).to.not.be.undefined
    expect(capabilities.Capability).to.not.be.undefined
    const config = JSON.parse(readFileSync(`./tests/js-units/data/${name}-config.json`, 'utf8'));

    expect(config).to.not.be.undefined

    const layers = new LayersConfig(config.layers);
    let invalid = [];
    const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);
    expect(invalid).to.have.length(expectedInvalidLayers.length);
    expect(invalid).to.deep.eq(expectedInvalidLayers);

    let baseLayerTreeItem = null;
    for (const layerTreeItem of rootCfg.getChildren()) {
        if ( layerTreeItem.name.toLowerCase() == 'baselayers') {
            baseLayerTreeItem = layerTreeItem;
            break;
        }
    }

    const baseLayersConfig = new BaseLayersConfig({}, config.options, layers, baseLayerTreeItem)

    const layersOrder = buildLayersOrder(config, rootCfg);

    const options = new OptionsConfig(config.options);
    const collection = new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);

    const baseLayers = new BaseLayersState(baseLayersConfig, collection)
    expect(baseLayers).to.be.instanceOf(BaseLayersState)
    return baseLayers;
}

describe('BaseLayerState', function () {

    it('simple', function () {
        const blConfig = new BaseLayerConfig('name', {'title': 'title'})
        const baselayer = new BaseLayerState(blConfig)
        expect(baselayer).to.be.instanceOf(BaseLayerState)
        expect(baselayer.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(baselayer.name).to.be.eq('name')
        expect(baselayer.title).to.be.eq('title')
        expect(baselayer.hasKey).to.be.false
        expect(baselayer.key).to.be.null
        expect(baselayer.hasAttribution).to.be.false
        expect(baselayer.attribution).to.be.null
        expect(baselayer.hasItemState).to.be.false
        expect(baselayer.itemState).to.be.null
    })

    it('Error name', function () {
        const baseLayers = getBaseLayersState('backgrounds')
        const blConfig = new BaseLayerConfig('name', {'title': 'title'})
        let baselayer = null;
        try {
            baselayer = new BaseLayerState(blConfig, baseLayers.selectedBaseLayer.itemState)
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Base layer config and layer item sate have not the same name!\n- `name` for base layer config\n- `Stamen Watercolor` for layer item state')
            expect(error).to.be.instanceOf(TypeError)
        }
        expect(baselayer).to.be.null
    })
})

describe('EmptyBaseLayerState', function () {

    it('simple', function () {
        const blConfig = new EmptyBaseLayerConfig('name', {'title': 'title'})
        const baselayer = new EmptyBaseLayerState(blConfig)
        expect(baselayer).to.be.instanceOf(BaseLayerState)
        expect(baselayer.type).to.be.eq(BaseLayerTypes.Empty)
        expect(baselayer.name).to.be.eq('name')
        expect(baselayer.title).to.be.eq('title')
        expect(baselayer.hasKey).to.be.false
        expect(baselayer.key).to.be.null
        expect(baselayer.hasAttribution).to.be.false
        expect(baselayer.attribution).to.be.null
        expect(baselayer.hasItemState).to.be.false
        expect(baselayer.itemState).to.be.null
    })

    it('Error type', function () {
        const blConfig = new BaseLayerConfig('name', {'title': 'title'})
        let baselayer = null;
        try {
            baselayer = new EmptyBaseLayerState(blConfig)
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Not an `empty` base layer config. Get `lizmap` type for `name` base layer!')
            expect(error).to.be.instanceOf(TypeError)
        }
        expect(baselayer).to.be.null
    })
})

describe('BaseLayersState', function () {

    it('From options', function () {
        const baseLayers = getBaseLayersState('montpellier')
        expect(baseLayers.selectedBaseLayerName).to.be.eq('osm-stamen-toner')
        expect(baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(baseLayers.selectedBaseLayer.name).to.be.eq('osm-stamen-toner')
        expect(baseLayers.baseLayerNames).to.be.an('array').that.have.length(3).that.ordered.members([
            'empty',
            'osm-mapnik',
            'osm-stamen-toner'
        ])
        expect(baseLayers.baseLayers).to.be.an('array').that.have.length(3)
        expect(baseLayers.baseLayers.map(l => l.name)).to.be.an('array').that.have.length(3).that.ordered.members([
            'empty',
            'osm-mapnik',
            'osm-stamen-toner'
        ])
        expect(baseLayers.baseLayers.map(l => l.type)).to.be.an('array').that.have.length(3).that.ordered.members([
            BaseLayerTypes.Empty,
            BaseLayerTypes.XYZ,
            BaseLayerTypes.XYZ
        ])
    })

    it('From options and layers tree', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        // Update capabilities change Hidden group to Baselayers group
        const blName = 'Baselayers';
        capabilities.Capability.Layer.Layer[6].Name = blName;
        const blGroupCfg = structuredClone(config.layers.Hidden);
        blGroupCfg.id = blName;
        blGroupCfg.name = blName;
        blGroupCfg.title = blName;
        delete config.layers.Hidden;
        config.layers[blName] = blGroupCfg;

        const layers = new LayersConfig(config.layers);
        let invalid = [];
        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

        expect(invalid).to.have.length(0);

        const blGroup = rootCfg.children[6];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)

        const options = {
            emptyBaselayer: 'True'
        };
        const baseLayersConfig = new BaseLayersConfig({}, options, layers, blGroup)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const collection = new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);

        const baseLayers = new BaseLayersState(baseLayersConfig, collection)
        expect(baseLayers.selectedBaseLayerName).to.be.eq('osm-mapnik')
        expect(baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(baseLayers.selectedBaseLayer.name).to.be.eq('osm-mapnik')
        expect(baseLayers.baseLayerNames).to.be.an('array').that.have.length(3).that.ordered.members([
            'osm-mapnik',
            'osm-stamen-toner',
            'empty'
        ])
        expect(baseLayers.baseLayers).to.be.an('array').that.have.length(3)
        expect(baseLayers.baseLayers.map(l => l.name)).to.be.an('array').that.have.length(3).that.ordered.members([
            'osm-mapnik',
            'osm-stamen-toner',
            'empty'
        ])
        expect(baseLayers.baseLayers.map(l => l.type)).to.be.an('array').that.have.length(3).that.ordered.members([
            BaseLayerTypes.XYZ,
            BaseLayerTypes.XYZ,
            BaseLayerTypes.Empty
        ])

        baseLayers.selectedBaseLayerName = 'osm-stamen-toner'
        expect(baseLayers.selectedBaseLayerName).to.be.eq('osm-stamen-toner')
        expect(baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(baseLayers.selectedBaseLayer.name).to.be.eq('osm-stamen-toner')

        // Try set an unknown base layer
        try {
            baseLayers.selectedBaseLayerName = 'project-background-layer'
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The base layer name `project-background-layer` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(baseLayers.getBaseLayerByName('empty').type).to.be.eq(BaseLayerTypes.Empty)

        // Try get an unknown base layer
        try {
            baseLayers.getBaseLayerByName('project-background-layer')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The base layer name `project-background-layer` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
    })

    it('From baselayers user defined', function () {
        const baseLayers = getBaseLayersState('backgrounds')
        expect(baseLayers.selectedBaseLayerName).to.be.eq('Stamen Watercolor')
        expect(baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(baseLayers.selectedBaseLayer.name).to.be.eq('Stamen Watercolor')
        expect(baseLayers.baseLayerNames)
            .to.be.an('array')
            .that.have.length(11)
            .that.be.deep.eq([
                "Stamen Watercolor",
                "OSM TMS internal",
                "OSM TMS external",
                "project-background-color",
                "group with many layers and shortname",
                "group with sub",
                "local vector layer",
                "local raster layer",
                "WMTS single external",
                "WMS single internal",
                "WMS grouped external",
            ])
        expect(baseLayers.baseLayers).to.be.an('array').that.have.length(11)
        expect(baseLayers.baseLayers.map(l => l.name))
            .to.be.an('array')
            .that.have.length(11)
            .that.ordered.members(baseLayers.baseLayerNames)
        expect(baseLayers.baseLayers.map(l => l.type))
            .to.be.an('array')
            .that.have.length(11)
            .that.ordered.members([
                BaseLayerTypes.XYZ,
                BaseLayerTypes.XYZ,
                BaseLayerTypes.XYZ,
                BaseLayerTypes.Empty,
                BaseLayerTypes.Lizmap,
                BaseLayerTypes.Lizmap,
                BaseLayerTypes.Lizmap,
                BaseLayerTypes.Lizmap,
                BaseLayerTypes.WMTS,
                BaseLayerTypes.Lizmap,
                BaseLayerTypes.WMS,
            ])
        expect(baseLayers.baseLayers.map(l => l.hasItemState))
            .to.be.an('array')
            .that.have.length(11)
            .that.ordered.members([
                true,
                true,
                true,
                false,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
            ])
        expect(baseLayers.baseLayers.map(l => l.hasLayerConfig))
            .to.be.an('array')
            .that.have.length(11)
            .that.ordered.members([
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
                true,
            ])
    });

    it('Tiled baselayer', function () {
        // This project has OpenStreetMap in its GetCapabilities but not in CFG file
        const baseLayers = getBaseLayersState('tiled_baselayers', ['OpenStreetMap'])
        expect(baseLayers.selectedBaseLayerName).to.be.eq('wms_baselayer')
        expect(baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(baseLayers.selectedBaseLayer.name).to.be.eq('wms_baselayer')
        expect(baseLayers.baseLayerNames).to.be.an('array')
        .that.have.length(2)
        .that.be.deep.eq([
            "wms_baselayer",
            "tiled_baselayer",
        ])

        expect(baseLayers.baseLayers.map(l => l.type))
            .to.be.an('array')
            .that.have.length(2)
            .that.ordered.members([
                BaseLayerTypes.Lizmap,
                BaseLayerTypes.Lizmap,
        ])

        expect(baseLayers.baseLayers.map(l => l.layerConfig.cached))
        .to.be.an('array')
        .that.have.length(2)
        .that.ordered.members([
            false,
            true,
    ])
    })

    it('Bing Maps baselayers', function () {
        const baseLayers = getBaseLayersState('bing_basemap')
        expect(baseLayers.selectedBaseLayerName).to.be.eq('bing roads')
        expect(baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(baseLayers.selectedBaseLayer.name).to.be.eq('bing roads')
        expect(baseLayers.baseLayerNames).to.be.an('array')
        .that.have.length(2)
        .that.be.deep.eq([
            "bing roads",
            "bing aerial",
        ])

        expect(baseLayers.baseLayers.map(l => l.type))
            .to.be.an('array')
            .that.have.length(2)
            .that.ordered.members([
                BaseLayerTypes.Bing,
                BaseLayerTypes.Bing,
        ])

    })

})
