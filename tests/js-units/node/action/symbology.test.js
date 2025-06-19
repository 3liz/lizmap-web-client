import { expect } from 'chai';

import { readFileSync } from 'fs';

import { MockAgent, setGlobalDispatcher, Agent } from 'undici';

import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';
import { LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { MapLayerLoadStatus, MapGroupState, MapRootState } from 'assets/src/modules/state/MapLayer.js';
import { LayerTreeGroupState, LayerTreeLayerState, TreeRootState } from 'assets/src/modules/state/LayerTree.js';
import { base64png, base64svg, base64svgPointLayer, base64svgLineLayer, base64svgPolygonLayer } from 'assets/src/modules/state/SymbologyIcons.js';

import { HttpRequestMethods } from 'assets/src/modules/Utils.js';
import { updateLayerTreeLayerSymbology, updateLayerTreeGroupLayersSymbology, updateLayerTreeLayersSymbology } from 'assets/src/modules/action/Symbology.js';

const agent = new MockAgent();
const client = agent.get('http://localhost:8130');

globalThis.lizUrls = {
    params: {
        "repository": "test",
        "project": "test"
    },
    wms: "http://localhost:8130/index.php/lizmap/service",
}
const icon = "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q474qaKI2Wxi+I\/LMKyC2AxBGHYbq8uYcLmIVDBEDLp79y6jzabbJBlEUvTDLCHJhlFAfQAA+w0alQ045JsAAAAASUVORK5CYII=";

const reply = (options) => {
    const url = new URL(options.path, options.origin);
    let params = {};
    let body = {"nodes":[]};
    const node = {
        "icon": icon,
        "title": "layer_legend_single_symbol",
        "type": "layer",
        "name": "layer_legend_single_symbol"
    };
    if (options.method === 'POST') {
        const bodyParams = new URLSearchParams(options.body);
        for (const [key, value] of bodyParams) {
            params[key] = value;
        }
        for (const layer of params['LAYER'].split(',')) {
            body.nodes.push({
                ...node,
                ...{"name": layer, "title": layer},
            });
        }
    } else {
        for (const [key, value] of url.searchParams) {
            params[key] = value;
        }
        body.nodes.push({
            ...node,
            ...{"name": params['LAYER'], "title": params['LAYER']},
        });
    }

    return body;
};

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

describe('Symbology actions', function () {
    before(function () {
        // runs once before the first test in this block
        agent.disableNetConnect();
        setGlobalDispatcher(agent);
    });

    after(async function () {
        // runs once after the last test in this block
        await agent.close();
        setGlobalDispatcher(new Agent());
    });

    it('updateLayerTreeLayerSymbology', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'GET',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}});

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const treeLayer = await updateLayerTreeLayerSymbology(sousquartiers);
        expect(treeLayer.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayer.icon).to.be.eq(base64png+icon)
        expect(sousquartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(sousquartiers.icon).to.be.eq(base64png+icon)
    });

    it('updateLayerTreeGroupLayersSymbology with GET method', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'GET',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}})
        .times(3);

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)

        const treeLayers = await updateLayerTreeGroupLayersSymbology(edition);
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(3)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(edition.children[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[0].icon).to.be.eq(base64png+icon)
        expect(treeLayers[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[1].icon).to.be.eq(base64png+icon)
        expect(edition.children[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[1].icon).to.be.eq(base64png+icon)
        expect(treeLayers[2].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[2].icon).to.be.eq(base64png+icon)
        expect(edition.children[2].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[2].icon).to.be.eq(base64png+icon)
    });

    it('updateLayerTreeGroupLayersSymbology with POST method', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}});

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)

        const treeLayers = await updateLayerTreeGroupLayersSymbology(edition, HttpRequestMethods.POST);
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(3)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(edition.children[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[0].icon).to.be.eq(base64png+icon)
        expect(treeLayers[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[1].icon).to.be.eq(base64png+icon)
        expect(edition.children[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[1].icon).to.be.eq(base64png+icon)
        expect(treeLayers[2].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[2].icon).to.be.eq(base64png+icon)
        expect(edition.children[2].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[2].icon).to.be.eq(base64png+icon)
    });


    it('updateLayerTreeGroupLayersSymbology with POST method error 504', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(504, {"code": 504, "message": "Gateway Time-out"}, {headers: {'content-type': 'application/json'}});

        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'GET',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}})
        .times(3);

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupState)

        const treeLayers = await updateLayerTreeGroupLayersSymbology(edition, HttpRequestMethods.POST);
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(3)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(edition.children[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[0].icon).to.be.eq(base64png+icon)
        expect(treeLayers[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[1].icon).to.be.eq(base64png+icon)
        expect(edition.children[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[1].icon).to.be.eq(base64png+icon)
        expect(treeLayers[2].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[2].icon).to.be.eq(base64png+icon)
        expect(edition.children[2].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(edition.children[2].icon).to.be.eq(base64png+icon)
    });

    it('updateLayerTreeLayersSymbology single layer', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'GET',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}});

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const treeLayers = await updateLayerTreeLayersSymbology([sousquartiers])
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(1)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(sousquartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(sousquartiers.icon).to.be.eq(base64png+icon)
    });

    it('updateLayerTreeLayersSymbology multiple layers with GET method', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'GET',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}})
        .times(2);

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const quartiers = root.children[3];
        expect(quartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(quartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const treeLayers = await updateLayerTreeLayersSymbology([sousquartiers, quartiers])
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(2)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(treeLayers[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[1].icon).to.be.eq(base64png+icon)
        expect(sousquartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(sousquartiers.icon).to.be.eq(base64png+icon)
        expect(quartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(quartiers.icon).to.be.eq(base64png+icon)
    });

    it('updateLayerTreeLayersSymbology multiple layers with POST method', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}});

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const quartiers = root.children[3];
        expect(quartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(quartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const treeLayers = await updateLayerTreeLayersSymbology([sousquartiers, quartiers], HttpRequestMethods.POST)
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(2)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(treeLayers[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[1].icon).to.be.eq(base64png+icon)
        expect(sousquartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(sousquartiers.icon).to.be.eq(base64png+icon)
        expect(quartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(quartiers.icon).to.be.eq(base64png+icon)
    });


    it('updateLayerTreeLayersSymbology multiple layers with POST method error 504', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(504, {"code": 504, "message": "Gateway Time-out"}, {headers: {'content-type': 'application/json'}});

        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'GET',
        })
        .reply(200, reply, {headers: {'content-type': 'application/json'}})
        .times(2);

        const root = getRootLayerTreeGroupState('montpellier')
        expect(root).to.be.instanceOf(LayerTreeGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(sousquartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const quartiers = root.children[3];
        expect(quartiers).to.be.instanceOf(LayerTreeLayerState)
        expect(quartiers.icon).to.be.eq(base64svg+base64svgPolygonLayer)

        const treeLayers = await updateLayerTreeLayersSymbology([sousquartiers, quartiers], HttpRequestMethods.POST)
        expect(treeLayers).to.be.instanceOf(Array)
        expect(treeLayers.length).to.be.equal(2)
        expect(treeLayers[0].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[0].icon).to.be.eq(base64png+icon)
        expect(treeLayers[1].icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(treeLayers[1].icon).to.be.eq(base64png+icon)
        expect(sousquartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(sousquartiers.icon).to.be.eq(base64png+icon)
        expect(quartiers.icon).to.not.be.eq(base64svg+base64svgPolygonLayer)
        expect(quartiers.icon).to.be.eq(base64png+icon)
    });

});
