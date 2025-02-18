import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';

describe('buildLayersOrder', function () {
    it('From config', function () {
        const layersOrder = buildLayersOrder({
            "layersOrder": {
                "tramway_stops":0,
                "tramway_lines":1,
                "parent_layer":2,
                "parent_layer_without_attribute_table":3,
                "tramway stop (with parenthesis) and spaces":4
            }
        })
        expect(layersOrder).to.have.ordered.members([
            "tramway_stops",
            "tramway_lines",
            "parent_layer",
            "parent_layer_without_attribute_table",
            "tramway stop (with parenthesis) and spaces"
        ])
    })
    it('From config unordered', function () {
        const layersOrder = buildLayersOrder({
            "layersOrder": {
                "parent_layer":2,
                "tramway_stops":0,
                "tramway stop (with parenthesis) and spaces":4,
                "tramway_lines":1,
                "parent_layer_without_attribute_table":3
            }
        })
        expect(layersOrder).to.have.ordered.members([
            "tramway_stops",
            "tramway_lines",
            "parent_layer",
            "parent_layer_without_attribute_table",
            "tramway stop (with parenthesis) and spaces"
        ])
    })
    it('From layer tree', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        let invalid = [];
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

        expect(invalid).to.have.length(0);
        const layersOrder = buildLayersOrder(config, root);
        expect(layersOrder).to.have.ordered.members([
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
            "VilleMTP_MTP_Quartiers_2011_4326",
            "osm-mapnik",
            "osm-stamen-toner"
        ])
    })
})
