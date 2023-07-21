import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from '../../../../assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from '../../../../assets/src/modules/config/LayerTree.js';
import { BaseLayerTypes, BaseLayersConfig } from '../../../../assets/src/modules/config/BaseLayer.js';
import { buildLayersOrder } from '../../../../assets/src/modules/config/LayersOrder.js';
import { LayersAndGroupsCollection } from '../../../../assets/src/modules/state/Layer.js';

import { BaseLayersState } from '../../../../assets/src/modules/state/BaseLayer.js';

describe('BaseLayerState', function () {

    it('From options and layers tree', function () {
    })
})

describe('BaseLayersState', function () {

    it('From options and layers tree', function () {
        const capabilities = JSON.parse(readFileSync('./data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/montpellier-config.json', 'utf8'));
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
        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);

        const blGroup = rootCfg.children[6];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)

        const options = {
            emptyBaselayer: 'True'
        };
        const baseLayersConfig = new BaseLayersConfig({}, options, layers, blGroup)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const collection = new LayersAndGroupsCollection(rootCfg, layersOrder);

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
        const capabilities = JSON.parse(readFileSync('./data/backgrounds-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./data/backgrounds-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);
        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers);

        const blGroup = rootCfg.children[2];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)

        const baseLayersConfig = new BaseLayersConfig({}, {}, layers, blGroup)

        const layersOrder = buildLayersOrder(config, rootCfg);

        const collection = new LayersAndGroupsCollection(rootCfg, layersOrder);

        const baseLayers = new BaseLayersState(baseLayersConfig, collection)
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
        expect(baseLayers.baseLayers.map(l => l.name)).to.be.an('array').that.have.length(11).that.ordered.members([
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
        expect(baseLayers.baseLayers.map(l => l.type)).to.be.an('array').that.have.length(11).that.ordered.members([
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
            BaseLayerTypes.Lizmap,
        ])
    });

})
