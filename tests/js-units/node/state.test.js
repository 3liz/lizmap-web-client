import { expect } from 'chai';

import { readFileSync } from 'fs';

import { Config } from 'assets/src/modules/Config.js';
import { MapState } from 'assets/src/modules/state/Map.js';
import { BaseLayersState } from 'assets/src/modules/state/BaseLayer.js';
import { LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { MapGroupState, MapLayerState } from 'assets/src/modules/state/MapLayer.js';
import { LayerTreeGroupState } from 'assets/src/modules/state/LayerTree.js';

import { State } from 'assets/src/modules/State.js';

describe('State', function () {

    it('Initialisation', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const initialConfig = new Config(config, capabilities);

        const state = new State(initialConfig)
        expect(state.map).to.be.instanceOf(MapState)
        expect(state.baseLayers).to.be.instanceOf(BaseLayersState)
        expect(state.layersAndGroupsCollection).to.be.instanceOf(LayersAndGroupsCollection)
        expect(state.rootMapGroup).to.be.instanceOf(MapGroupState)
        expect(state.layerTree).to.be.instanceOf(LayerTreeGroupState)
    })

    it('Events', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const initialConfig = new Config(config, capabilities);

        const state = new State(initialConfig)
        expect(state.map).to.be.instanceOf(MapState)
        expect(state.baseLayers).to.be.instanceOf(BaseLayersState)
        expect(state.layersAndGroupsCollection).to.be.instanceOf(LayersAndGroupsCollection)

        let eventLogs = []
        state.addListener(evt => {
            eventLogs.push(evt)
        }, '*');

        // Update map state
        state.map.update({
            "type": "map.state.changing",
            "projection": "EPSG:3857",
            "center": [
              432082.33132450003,
              5404877.667855
            ],
            "size": [
              1822,
              634
            ],
            "extent": [
              397265.26494544884,
              5392762.398873487,
              466899.3977035512,
              5416992.936836514
            ],
            "resolution": 38.218514137268066,
            "scaleDenominator": 144447.63855208742,
            "pointResolution": 27.673393466176645,
            "pointScaleDenominator": 104592.14407328397
        });
        expect(eventLogs).to.have.length(1)
        expect(eventLogs[0].type).to.be.eq('map.state.changed')

        expect(state.baseLayers.baseLayerNames).to.be.an('array').that.have.length(3).that.ordered.members([
            'empty',
            'osm-mapnik',
            'osm-stamen-toner',
        ])
        expect(state.baseLayers.selectedBaseLayerName).to.be.eq('osm-stamen-toner')
        expect(state.baseLayers.selectedBaseLayer).to.not.be.undefined
        expect(state.baseLayers.selectedBaseLayer.name).to.be.eq('osm-stamen-toner')

        eventLogs = []
        // Update selected base layer
        state.baseLayers.selectedBaseLayerName = 'osm-mapnik'
        expect(eventLogs).to.have.length(1)
        expect(eventLogs[0].type).to.be.eq('baselayers.selection.changed')

        const sousquartiers = state.rootMapGroup.children[2]
        expect(sousquartiers).to.be.instanceOf(MapLayerState)

        expect(sousquartiers.checked).to.be.false
        expect(sousquartiers.visibility).to.be.false

        eventLogs = []
        // Change SousQuartiers checked value
        sousquartiers.checked = true
        expect(eventLogs).to.have.length(1)
        expect(eventLogs[0].type).to.be.eq('layer.visibility.changed')

        eventLogs = []
        sousquartiers.checked = true
        expect(eventLogs).to.have.length(0)

        const edition = state.rootMapGroup.children[0];
        expect(edition).to.be.instanceOf(MapGroupState)

        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true

        const poi = edition.children[0];
        expect(poi).to.be.instanceOf(MapLayerState)

        expect(poi.checked).to.be.false
        expect(poi.visibility).to.be.false

        eventLogs = []
        // Change poi checked value
        poi.checked = true;
        expect(eventLogs).to.have.length(1)
        expect(eventLogs[0].type).to.be.eq('layer.visibility.changed')
        expect(eventLogs[0].name).to.be.eq('points_of_interest')

        eventLogs = []
        // Change edition group checked value
        edition.checked = false;
        expect(eventLogs).to.have.length(3)
        expect(eventLogs[0].type).to.be.eq('layer.visibility.changed')
        expect(eventLogs[0].name).to.be.eq('points_of_interest')
        expect(eventLogs[1].type).to.be.eq('layer.visibility.changed')
        expect(eventLogs[1].name).to.be.eq('edition_line')
        expect(eventLogs[2].type).to.be.eq('group.visibility.changed')
        expect(eventLogs[2].name).to.be.eq('Edition')

        eventLogs = []
        // Change poi checked value but visibility does not
        poi.checked = false;
        expect(eventLogs).to.have.length(0)

        eventLogs = []
        // Change poi checked value then the group and children checked layers
        poi.checked = true;
        expect(eventLogs).to.have.length(3)
        expect(eventLogs[0].type).to.be.eq('layer.visibility.changed')
        expect(eventLogs[0].name).to.be.eq('points_of_interest')
        expect(eventLogs[1].type).to.be.eq('layer.visibility.changed')
        expect(eventLogs[1].name).to.be.eq('edition_line')
        expect(eventLogs[2].type).to.be.eq('group.visibility.changed')
        expect(eventLogs[2].name).to.be.eq('Edition')
    })

})
