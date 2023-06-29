import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from '../../../../assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from '../../../../assets/src/modules/config/LayerTree.js';
import { BaseLayersConfig } from '../../../../assets/src/modules/config/BaseLayer.js';

import { BaseLayersState } from '../../../../assets/src/modules/state/BaseLayer.js';

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
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers);

        const blGroup = root.children[6];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)

        const options = {
            emptyBaselayer: 'True'
        };
        const baseLayersConfig = new BaseLayersConfig({}, options, layers, blGroup)

        const baseLayers = new BaseLayersState(baseLayersConfig)
        expect(baseLayers.selectedBaseLayerName).to.be.eq('osm-mapnik')
        expect(baseLayers.selectedBaseLayerConfig).to.not.be.undefined
        expect(baseLayers.selectedBaseLayerConfig.name).to.be.eq('osm-mapnik')
        expect(baseLayers.baseLayerNames).to.be.an('array').that.have.length(3).that.ordered.members([
            'osm-mapnik',
            'osm-stamen-toner',
            'empty'
        ])
        expect(baseLayers.baseLayerConfigs).to.be.an('array').that.have.length(3)
        expect(baseLayers.baseLayerConfigs.map(l => l.name)).to.be.an('array').that.have.length(3).that.ordered.members([
            'osm-mapnik',
            'osm-stamen-toner',
            'empty'
        ])
        expect(baseLayers.baseLayerConfigs.map(l => l.type)).to.be.an('array').that.have.length(3).that.ordered.members([
            'xyz',
            'xyz',
            'empty'
        ])

        baseLayers.selectedBaseLayerName = 'osm-stamen-toner'
        expect(baseLayers.selectedBaseLayerName).to.be.eq('osm-stamen-toner')
        expect(baseLayers.selectedBaseLayerConfig).to.not.be.undefined
        expect(baseLayers.selectedBaseLayerConfig.name).to.be.eq('osm-stamen-toner')

        // Try set an unknown base layer
        try {
            baseLayers.selectedBaseLayerName = 'project-background-layer'
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The base layer name `project-background-layer` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(baseLayers.getBaseLayerConfigByName('empty').type).to.be.eq('empty')

        // Try get an unknown base layer
        try {
            baseLayers.getBaseLayerConfigByName('project-background-layer')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The base layer name `project-background-layer` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
    });

})
