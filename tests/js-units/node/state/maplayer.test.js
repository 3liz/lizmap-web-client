import { expect } from 'chai';

import { readFileSync } from 'fs';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerGeographicBoundingBoxConfig, LayerBoundingBoxConfig, LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { LayerIconSymbology, LayerSymbolsSymbology, SymbolIconSymbology } from 'assets/src/modules/state/Symbology.js';
import { LayerGroupState, LayerVectorState, LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';

import { MapLayerLoadStatus, MapGroupState, MapLayerState, MapRootState } from 'assets/src/modules/state/MapLayer.js';

/**
 * Returns the root MapGroupState for the project
 *
 * The files for building it are stored in js-units/data/ and are
 * - name +'-capabilities.json': the WMS capabilities parsed by OpenLayers
 * - name +'-config.json': the Lizmap config send by lizmap web client
 *
 * @param {String} name - The project name
 *
 * @return {MapRootState}
 **/
function getRootMapGroupState(name) {
    const capabilities = JSON.parse(readFileSync('./tests/js-units/data/'+ name +'-capabilities.json', 'utf8'));
    expect(capabilities).to.not.be.undefined
    expect(capabilities.Capability).to.not.be.undefined
    const config = JSON.parse(readFileSync('./tests/js-units/data/'+ name +'-config.json', 'utf8'));
    expect(config).to.not.be.undefined

    const layers = new LayersConfig(config.layers);

    let invalid = [];
    const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

    expect(invalid).to.have.length(0);;
    expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

    const layersOrder = buildLayersOrder(config, rootCfg);

    const options = new OptionsConfig(config.options);
    const collection = new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);

    const root = new MapRootState(collection.root);
    expect(root).to.be.instanceOf(MapGroupState)
    expect(root).to.be.instanceOf(MapRootState)
    return root;
}

describe('MapGroupState', function () {
    it('Valid', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.wmsName).to.be.eq('Montpellier-Transports')
        expect(root.wmsGeographicBoundingBox).to.be.null
        expect(root.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(root.wmsMinScaleDenominator).to.be.eq(-1)
        expect(root.wmsMaxScaleDenominator).to.be.eq(-1)
        expect(root.checked).to.be.true
        expect(root.visibility).to.be.true
        expect(root.layerConfig).to.be.null
        expect(root.mutuallyExclusive).to.be.false
        expect(root.childrenCount).to.be.eq(4)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(MapGroupState)
        expect(edition.name).to.be.eq('Edition')
        expect(edition.type).to.be.eq('group')
        expect(edition.level).to.be.eq(1)
        expect(edition.wmsName).to.be.eq('Edition')
        expect(edition.layerConfig).to.not.be.null
        expect(root.mutuallyExclusive).to.be.false
        expect(edition.childrenCount).to.be.eq(3)

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(MapGroupState)
        expect(transports.wmsMinScaleDenominator).to.be.eq(-1)
        expect(transports.wmsMaxScaleDenominator).to.be.eq(-1)

        const bus = transports.children[0];
        expect(bus).to.be.instanceOf(MapGroupState)
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
        expect(busStops).to.be.instanceOf(MapLayerState)
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.layerType).to.be.eq('vector')
        expect(busStops.layerOrder).to.be.eq(3)
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.type).to.be.eq('layer')
        expect(sousquartiers.level).to.be.eq(1)
        expect(sousquartiers.layerType).to.be.eq('vector')
        expect(sousquartiers.layerOrder).to.be.eq(8)
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

        const rootGetChildren = root.getChildren()
        expect(rootGetChildren.next().value).to.be.eq(edition)
        const child2 = rootGetChildren.next().value;
        expect(child2).to.be.instanceOf(MapGroupState)
        expect(child2.name).to.be.eq('datalayers')
        expect(rootGetChildren.next().value).to.be.eq(sousquartiers)
        const child4 = rootGetChildren.next().value;
        expect(child4).to.be.instanceOf(MapLayerState)
        expect(child4.name).to.be.eq('Quartiers')
    })

    it('Check && visibility', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        expect(root.checked).to.be.true
        expect(root.visibility).to.be.true

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(MapGroupState)

        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true

        const poi = edition.children[0];
        expect(poi).to.be.instanceOf(MapLayerState)

        expect(poi.checked).to.be.false
        expect(poi.itemState.visibility).to.be.false
        expect(poi.visibility).to.be.false

        const rides = edition.children[1];
        expect(rides).to.be.instanceOf(MapLayerState)

        expect(rides.checked).to.be.true
        expect(rides.visibility).to.be.true

        const areas = edition.children[2];
        expect(areas).to.be.instanceOf(MapLayerState)

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

    it('findMapLayerNames', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        expect(root.findMapLayerNames()).to.have.ordered.members([
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
        for (const layer of root.findMapLayers()) {
            names.push(layer.name)
        }
        expect(names).to.be.deep.equal(root.findMapLayerNames())

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(MapGroupState)

        expect(transports.findMapLayerNames()).to.have.ordered.members([
            "bus_stops",
            "bus",
            "tramstop",
            "tramway",
            "publicbuildings",
        ])
    })

    it('findMapLayers && countExplodedMapLayers', function(){
        const root = getRootMapGroupState('layer-count');
        expect(root).to.be.instanceOf(MapGroupState);

        // map layer count and order
        expect(root.findMapLayers().length).to.be.eq(5);

        // map layer exploded count
        expect(root.countExplodedMapLayers()).to.be.eq(7);
    })

    it('getMapLayerByName', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        const busStops = root.getMapLayerByName('bus_stops')
        expect(busStops).to.be.instanceOf(MapLayerState)
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)

        const sousquartiers = root.getMapLayerByName('SousQuartiers')
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
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
            root.getMapLayerByName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(MapGroupState)
        const busStops2 = root.getMapLayerByName('bus_stops')
        expect(busStops2).to.be.eq(busStops)
    })

    it('layerOrder', function () {
        const root = getRootMapGroupState('layer_order');
        expect(root).to.be.instanceOf(MapGroupState)

        const mapLayers = root.findMapLayers();
        expect(mapLayers).to.be.an('array').that.have.length(4)

        const quartiers = mapLayers[0]
        expect(quartiers).to.be.instanceOf(MapLayerState)
        expect(quartiers.name).to.be.eq('quartiers')
        expect(quartiers.layerOrder).to.be.eq(3)

        const sousquartiers = mapLayers[1]
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
        expect(sousquartiers.name).to.be.eq('sousquartiers')
        expect(sousquartiers.layerOrder).to.be.eq(2)

        const tramway_lines = mapLayers[2]
        expect(tramway_lines).to.be.instanceOf(MapLayerState)
        expect(tramway_lines.name).to.be.eq('tramway_lines')
        expect(tramway_lines.layerOrder).to.be.eq(1)

        const tramway_stops = mapLayers[3]
        expect(tramway_stops).to.be.instanceOf(MapLayerState)
        expect(tramway_stops.name).to.be.eq('tramway_stops')
        expect(tramway_stops.layerOrder).to.be.eq(0)

        const tramway_group = root.children[2]
        expect(tramway_group).to.be.instanceOf(MapGroupState)
        expect(tramway_group.name).to.be.eq('tramway')
        expect(tramway_group.layerOrder).to.be.undefined
        expect(tramway_group.itemState.layerOrder).to.be.eq(0)


        const cadastre = getRootMapGroupState('cadastre-caen');
        expect(cadastre).to.be.instanceOf(MapGroupState)
        expect(cadastre.childrenCount).to.be.eq(1)

        const group = cadastre.children[0]
        expect(group).to.be.instanceOf(MapGroupState)
        expect(group.name).to.be.eq('Cadastre')
        expect(group.childrenCount).to.be.eq(4)

        const parcelles = group.children[0]
        expect(parcelles).to.be.instanceOf(MapLayerState)
        expect(parcelles.name).to.be.eq('Parcelles')
        expect(parcelles.layerOrder).to.be.eq(0)

        const sections = group.children[1]
        expect(sections).to.be.instanceOf(MapLayerState)
        expect(sections.name).to.be.eq('Sections')
        expect(sections.layerOrder).to.be.eq(1)

        const communes = group.children[2]
        expect(communes).to.be.instanceOf(MapLayerState)
        expect(communes.name).to.be.eq('Communes')
        expect(communes.layerOrder).to.be.eq(2)

        const fond = group.children[3]
        expect(fond).to.be.instanceOf(MapLayerState)
        expect(fond.name).to.be.eq('Fond')
        expect(fond.layerOrder).to.be.eq(3)
    })

    it('Checked & visibility', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        let rootLayerVisibilityChangedEvt = [];
        let rootGroupVisibilityChangedEvt = null;
        root.addListener(evt => {
            rootLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        root.addListener(evt => {
            rootGroupVisibilityChangedEvt = evt
        }, 'group.visibility.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)

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
        expect(edition).to.be.instanceOf(MapGroupState)

        expect(edition.checked).to.be.true
        expect(edition.visibility).to.be.true

        const poi = edition.children[0];
        expect(poi).to.be.instanceOf(MapLayerState)

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
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        let rootLayerOpacityChangedEvt = [];
        let rootGroupOpacityChangedEvt = [];
        root.addListener(evt => {
            rootLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        root.addListener(evt => {
            rootGroupOpacityChangedEvt.push(evt)
        }, 'group.opacity.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
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
        expect(transports).to.be.instanceOf(MapGroupState)

        let transportsLayerOpacityChangedEvt = [];
        let transportsGroupOpacityChangedEvt = [];
        transports.addListener(evt => {
            transportsLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        transports.addListener(evt => {
            transportsGroupOpacityChangedEvt.push(evt)
        }, 'group.opacity.changed');

        const tramGroup = transports.children[1];
        expect(tramGroup).to.be.instanceOf(MapGroupState)
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
        expect(tramway).to.be.instanceOf(MapLayerState)
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
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        let rootLayerLoadStatusChangedEvt = [];
        root.addListener(evt => {
            rootLayerLoadStatusChangedEvt.push(evt)
        }, 'layer.load.status.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Undefined).that.be.eq('undefined')

        let sousquartiersLoadStatusChangedEvt = null;
        sousquartiers.addListener(evt => {
            sousquartiersLoadStatusChangedEvt = evt
        }, 'layer.load.status.changed');

        // Change value
        sousquartiers.loadStatus = MapLayerLoadStatus.Loading
        // Event dispatched
        expect(sousquartiersLoadStatusChangedEvt).to.not.be.null
        expect(sousquartiersLoadStatusChangedEvt.name).to.be.eq('SousQuartiers')
        expect(sousquartiersLoadStatusChangedEvt.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.be.eq('loading')
        // Values have changed
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.to.be.eq('loading')
        // Events dispatched at root level
        expect(rootLayerLoadStatusChangedEvt).to.have.length(1)
        expect(rootLayerLoadStatusChangedEvt[0]).to.be.deep.equal(sousquartiersLoadStatusChangedEvt)

        //Reset
        rootLayerLoadStatusChangedEvt = [];
        sousquartiersLoadStatusChangedEvt = null;

        // Try set load status to not in enum
        try {
            sousquartiers.loadStatus = 'loaded'
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Unkonw status: `loaded`!')
            expect(error).to.be.instanceOf(TypeError)
        }
        // Nothing change
        expect(sousquartiersLoadStatusChangedEvt).to.be.null
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.to.be.eq('loading')
        expect(rootLayerLoadStatusChangedEvt).to.have.length(0)

        // Change value
        sousquartiers.loadStatus = MapLayerLoadStatus.Ready
        // Event dispatched
        expect(sousquartiersLoadStatusChangedEvt).to.not.be.null
        expect(sousquartiersLoadStatusChangedEvt.name).to.be.eq('SousQuartiers')
        expect(sousquartiersLoadStatusChangedEvt.loadStatus).to.be.eq(MapLayerLoadStatus.Ready).that.be.eq('ready')
        // Values have changed
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Ready).that.to.be.eq('ready')
        // Events dispatched at root level
        expect(rootLayerLoadStatusChangedEvt).to.have.length(1)
        expect(rootLayerLoadStatusChangedEvt[0]).to.be.deep.equal(sousquartiersLoadStatusChangedEvt)

        //Reset
        rootLayerLoadStatusChangedEvt = [];
        sousquartiersLoadStatusChangedEvt = null;

        // Reapply value
        sousquartiers.loadStatus = 'ready'
        // Nothing change
        expect(sousquartiersLoadStatusChangedEvt).to.be.null
        expect(sousquartiers.loadStatus).to.be.eq(MapLayerLoadStatus.Ready).that.to.be.eq('ready')
        expect(rootLayerLoadStatusChangedEvt).to.have.length(0)

        // Test through groups
        const transports = root.children[1];
        expect(transports).to.be.instanceOf(MapGroupState)

        let transportsLayerLoadStatusChangedEvt = [];
        transports.addListener(evt => {
            transportsLayerLoadStatusChangedEvt.push(evt)
        }, 'layer.load.status.changed');

        const tramGroup = transports.children[1];
        expect(tramGroup).to.be.instanceOf(MapGroupState)
        expect(tramGroup.name).to.be.eq('Tramway')

        let tramGroupLayerLoadStatusChangedEvt = [];
        tramGroup.addListener(evt => {
            tramGroupLayerLoadStatusChangedEvt.push(evt)
        }, 'layer.load.status.changed');

        const tramway = tramGroup.children[1];
        expect(tramway).to.be.instanceOf(MapLayerState)
        expect(tramway.name).to.be.eq('tramway')

        let tramwayLoadStatusChangedEvt = null;
        tramway.addListener(evt => {
            tramwayLoadStatusChangedEvt = evt
        }, 'layer.load.status.changed');

        // Change value
        tramway.loadStatus = MapLayerLoadStatus.Loading;
        // Event dispatched
        expect(tramwayLoadStatusChangedEvt).to.not.be.null
        expect(tramwayLoadStatusChangedEvt.name).to.be.eq('tramway')
        expect(tramwayLoadStatusChangedEvt.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.to.be.eq('loading')
        // Values have changed
        expect(tramway.loadStatus).to.be.eq(MapLayerLoadStatus.Loading).that.to.be.eq('loading')
        // Events dispatched at root level
        expect(tramGroupLayerLoadStatusChangedEvt).to.have.length(1)
        expect(tramGroupLayerLoadStatusChangedEvt[0]).to.be.deep.equal(tramwayLoadStatusChangedEvt)
        expect(transportsLayerLoadStatusChangedEvt).to.have.length(1)
        expect(transportsLayerLoadStatusChangedEvt[0]).to.be.deep.equal(tramwayLoadStatusChangedEvt)
        expect(rootLayerLoadStatusChangedEvt).to.have.length(1)
        expect(rootLayerLoadStatusChangedEvt[0]).to.be.deep.equal(tramwayLoadStatusChangedEvt)
    })

    it('WMS selected styles', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(MapGroupState)

        const tramway = transports.children[1];
        expect(tramway).to.be.instanceOf(MapGroupState)
        expect(tramway.name).to.be.eq('Tramway')

        const tram = tramway.children[1];
        expect(tram).to.be.instanceOf(MapLayerState)
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
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        const legend = JSON.parse(readFileSync('./tests/js-units/data/montpellier-legend.json', 'utf8'));
        expect(legend).to.not.be.undefined

        let rootLayerSymbologyChangedEvt = null;
        root.addListener(evt => {
            rootLayerSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(sousquartiers.symbology).to.be.null

        let sousquartiersSymbologyChangedEvt = null;
        sousquartiers.addListener(evt => {
            sousquartiersSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');

        // Set symbology
        sousquartiers.symbology = legend.nodes[1]
        expect(sousquartiers.symbology).to.be.instanceOf(LayerIconSymbology)
        // Event dispatched
        expect(sousquartiersSymbologyChangedEvt).to.not.be.null
        expect(sousquartiersSymbologyChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootLayerSymbologyChangedEvt).to.not.be.null
        expect(rootLayerSymbologyChangedEvt.name).to.be.eq('SousQuartiers')

        // Reset
        rootLayerSymbologyChangedEvt = null;
        sousquartiersSymbologyChangedEvt = null;

        const quartiers = root.children[3];
        expect(quartiers).to.be.instanceOf(MapLayerState)
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
        // Event dispatched
        expect(sousquartiersSymbologyChangedEvt).to.be.null
        expect(rootLayerSymbologyChangedEvt).to.not.be.null
        expect(rootLayerSymbologyChangedEvt.name).to.be.eq('Quartiers')

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:1,2,3,4,5,6,7',
          'LEGEND_OFF': 'Quartiers:0',
          'DPI': 96
        })

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:2,3,4,5,6,7',
          'LEGEND_OFF': 'Quartiers:0,1',
          'DPI': 96
        })

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:3,4,5,6,7',
          'LEGEND_OFF': 'Quartiers:0,1,2',
          'DPI': 96
        })

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:4,5,6,7',
          'LEGEND_OFF': 'Quartiers:0,1,2,3',
          'DPI': 96
        })

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:5,6,7',
          'LEGEND_OFF': 'Quartiers:0,1,2,3,4',
          'DPI': 96
        })

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:6,7',
          'LEGEND_OFF': 'Quartiers:0,1,2,3,4,5',
          'DPI': 96
        })

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:7',
          'LEGEND_OFF': 'Quartiers:0,1,2,3,4,5,6',
          'DPI': 96
        })

        // Reset
        symbolCheckedChangedEvt = null

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
        expect(quartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'Quartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'LEGEND_ON': 'Quartiers:6',
          'LEGEND_OFF': 'Quartiers:0,1,2,3,4,5,7',
          'DPI': 96
        })
    })

    it('Selection & token', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(sousquartiers.symbology).to.be.null
        expect(sousquartiers.itemState).to.not.be.null
        expect(sousquartiers.itemState).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.itemState.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.itemState.expressionFilter).to.be.null
        expect(sousquartiers.itemState.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.false

        // Checked selection and events
        let rootSelectionChangedEvt = null;
        let rootSelectionTokenChangedEvt = null;
        let rootOrderedChangedEvt = [];
        let layerSelectionChangedEvt = null;
        let layerSelectionTokenChangedEvt = null;
        let layerOrderedChangedEvt = [];
        // Add event listener
        sousquartiers.addListener(evt => {
            layerSelectionChangedEvt = evt
            layerOrderedChangedEvt.push(evt)
        }, 'layer.selection.changed');
        sousquartiers.addListener(evt => {
            layerSelectionTokenChangedEvt = evt
            layerOrderedChangedEvt.push(evt)
        }, 'layer.selection.token.changed');
        root.addListener(evt => {
            rootSelectionChangedEvt = evt
            rootOrderedChangedEvt.push(evt)
        }, 'layer.selection.changed');
        root.addListener(evt => {
            rootSelectionTokenChangedEvt = evt
            rootOrderedChangedEvt.push(evt)
        }, 'layer.selection.token.changed');

        // Set selectedFeatures
        sousquartiers.itemState.selectedFeatures = ['1']
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(layerSelectionTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(rootSelectionTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1"
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set selectedFeatures
        sousquartiers.itemState.selectedFeatures = ['1', '3']
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(layerSelectionTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(rootSelectionTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1,3"
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Reset selectedFeatures
        sousquartiers.itemState.selectedFeatures = null;
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(layerSelectionTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(rootSelectionTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // update selectedFeatures and selectionToken
        sousquartiers.itemState.selectedFeatures = ['1']
        sousquartiers.itemState.selectionToken = 'token-for-id-1'
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(layerSelectionTokenChangedEvt).to.not.be.null
        expect(layerSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(layerSelectionTokenChangedEvt.selectionToken).to.be.eq('token-for-id-1')
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(rootSelectionTokenChangedEvt).to.not.be.null
        expect(rootSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(rootSelectionTokenChangedEvt.selectionToken).to.be.eq('token-for-id-1')
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1"
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Update selectionToken with an object
        sousquartiers.itemState.selectionToken = {
            selectedFeatures: ['1', '3'],
            token: 'token-for-id-1-3'
        }
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(layerSelectionTokenChangedEvt).to.not.be.null
        expect(layerSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(layerSelectionTokenChangedEvt.selectionToken).to.be.eq('token-for-id-1-3')
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(rootSelectionTokenChangedEvt).to.not.be.null
        expect(rootSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(rootSelectionTokenChangedEvt.selectionToken).to.be.eq('token-for-id-1-3')
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1-3"
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set selectedFeatures
        sousquartiers.itemState.selectedFeatures = ['1']
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(layerSelectionTokenChangedEvt).to.not.be.null
        expect(layerSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(layerSelectionTokenChangedEvt.selectionToken).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(rootSelectionTokenChangedEvt).to.not.be.null
        expect(rootSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(rootSelectionTokenChangedEvt.selectionToken).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1"
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set selectionToken with an object contains the same selectedFeatures
        sousquartiers.itemState.selectionToken = {
            selectedFeatures: ['1'],
            token: 'token-for-id-1'
        }
        expect(layerSelectionChangedEvt).to.be.null
        expect(layerSelectionTokenChangedEvt).to.not.be.null
        expect(layerSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(layerSelectionTokenChangedEvt.selectionToken).to.be.eq('token-for-id-1')
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootSelectionChangedEvt).to.be.null
        expect(rootSelectionTokenChangedEvt).to.not.be.null
        expect(rootSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(rootSelectionTokenChangedEvt.selectionToken).to.be.eq('token-for-id-1')
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1"
        })

        //Reset
        rootSelectionChangedEvt = null;
        rootSelectionTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerSelectionChangedEvt = null;
        layerSelectionTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        try {
            sousquartiers.itemState.selectionToken = 1
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Selection token could only be null, a string or an object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(layerSelectionChangedEvt).to.be.null
        expect(layerSelectionTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(0)
        expect(rootSelectionChangedEvt).to.be.null
        expect(rootSelectionTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(0)
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1"
        })

        // Set selectionToken with an object contains an empty selectedFeatures
        sousquartiers.itemState.selectionToken = {
            selectedFeatures: [],
            token: 'token-empty'
        }
        expect(layerSelectionChangedEvt).to.not.be.null
        expect(layerSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(layerSelectionTokenChangedEvt).to.not.be.null
        expect(layerSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(layerSelectionTokenChangedEvt.selectionToken).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(rootSelectionChangedEvt).to.not.be.null
        expect(rootSelectionChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionChangedEvt.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(rootSelectionTokenChangedEvt).to.not.be.null
        expect(rootSelectionTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootSelectionTokenChangedEvt.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(rootSelectionTokenChangedEvt.selectionToken).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.selection.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.selection.token.changed')
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96
        })
    })

    it('Filter & token', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root).to.be.instanceOf(MapGroupState)

        const sousquartiers = root.children[2];
        expect(sousquartiers).to.be.instanceOf(MapLayerState)
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(sousquartiers.symbology).to.be.null
        expect(sousquartiers.itemState).to.not.be.null
        expect(sousquartiers.itemState).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.itemState.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.itemState.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.itemState.expressionFilter).to.be.null
        expect(sousquartiers.itemState.filterToken).to.be.null
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
        sousquartiers.itemState.expressionFilter = '"QUARTMNO" = \'HO\''
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

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set expressionFilter
        sousquartiers.itemState.expressionFilter = '"QUARTMNO" IN ( \'HO\' , \'PA\' )'
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(layerFilterTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(rootFilterTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" IN ( 'HO' , 'PA' )"
        })

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Reset expressionFilter
        sousquartiers.itemState.expressionFilter = null
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.null
        expect(layerFilterTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.null
        expect(rootFilterTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.isFiltered).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96
        })

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set expressionFilter and filterToken
        sousquartiers.itemState.expressionFilter = '"QUARTMNO" = \'HO\''
        sousquartiers.itemState.filterToken = 'token-for-id-1'
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(layerFilterTokenChangedEvt).to.not.be.null
        expect(layerFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(layerFilterTokenChangedEvt.filterToken).to.be.eq('token-for-id-1')
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(rootFilterTokenChangedEvt).to.not.be.null
        expect(rootFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(rootFilterTokenChangedEvt.filterToken).to.be.eq('token-for-id-1')
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(sousquartiers.itemState.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1"
        })

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set filterToken with an object
        sousquartiers.itemState.filterToken = {
            expressionFilter: '"QUARTMNO" IN ( \'HO\' , \'PA\' )',
            token: 'token-for-id-1-3'
        }
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(layerFilterTokenChangedEvt).to.not.be.null
        expect(layerFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(layerFilterTokenChangedEvt.filterToken).to.be.eq('token-for-id-1-3')
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(rootFilterTokenChangedEvt).to.not.be.null
        expect(rootFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(rootFilterTokenChangedEvt.filterToken).to.be.eq('token-for-id-1-3')
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(sousquartiers.itemState.expressionFilter).to.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1-3"
        })

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set expressionFilter
        sousquartiers.itemState.expressionFilter = '"QUARTMNO" = \'HO\''
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(layerFilterTokenChangedEvt).to.not.be.null
        expect(layerFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(layerFilterTokenChangedEvt.filterToken).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(rootFilterTokenChangedEvt).to.not.be.null
        expect(rootFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(rootFilterTokenChangedEvt.filterToken).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" = 'HO'"
        })

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];

        // Set filterToken with an object contains the same expressionFilter
        sousquartiers.itemState.filterToken = {
            expressionFilter: '"QUARTMNO" = \'HO\'',
            token: 'token-for-id-1'
        }
        expect(layerFilterChangedEvt).to.be.null
        expect(layerFilterTokenChangedEvt).to.not.be.null
        expect(layerFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(layerFilterTokenChangedEvt.filterToken).to.be.eq('token-for-id-1')
        expect(layerOrderedChangedEvt).to.have.length(1)
        expect(rootFilterChangedEvt).to.be.null
        expect(rootFilterTokenChangedEvt).to.not.be.null
        expect(rootFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterTokenChangedEvt.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(rootFilterTokenChangedEvt.filterToken).to.be.eq('token-for-id-1')
        expect(rootOrderedChangedEvt).to.have.length(1)
        expect(sousquartiers.itemState.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1"
        })

        //Reset
        rootFilterChangedEvt = null;
        rootFilterTokenChangedEvt = null;
        rootOrderedChangedEvt = [];
        layerFilterChangedEvt = null;
        layerFilterTokenChangedEvt = null;
        layerOrderedChangedEvt = [];


        try {
            sousquartiers.itemState.filterToken = 1
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Expression filter token could only be null, a string or an object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(layerFilterChangedEvt).to.be.null
        expect(layerFilterTokenChangedEvt).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(0)
        expect(rootFilterChangedEvt).to.be.null
        expect(rootFilterTokenChangedEvt).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(0)
        expect(sousquartiers.itemState.expressionFilter).to.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1"
        })

        // Set filterToken with an object contains an empty expressionFilter
        sousquartiers.itemState.filterToken = {
            expressionFilter: null,
            token: 'token-empty'
        }
        expect(layerFilterChangedEvt).to.not.be.null
        expect(layerFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterChangedEvt.expressionFilter).to.be.null
        expect(layerFilterTokenChangedEvt).to.not.be.null
        expect(layerFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(layerFilterTokenChangedEvt.expressionFilter).to.be.null
        expect(layerFilterTokenChangedEvt.filterToken).to.be.null
        expect(layerOrderedChangedEvt).to.have.length(2)
        expect(layerOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(layerOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(rootFilterChangedEvt).to.not.be.null
        expect(rootFilterChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterChangedEvt.expressionFilter).to.be.null
        expect(rootFilterTokenChangedEvt).to.not.be.null
        expect(rootFilterTokenChangedEvt.name).to.be.eq('SousQuartiers')
        expect(rootFilterTokenChangedEvt.expressionFilter).to.be.null
        expect(rootFilterTokenChangedEvt.filterToken).to.be.null
        expect(rootOrderedChangedEvt).to.have.length(2)
        expect(rootOrderedChangedEvt[0].type).to.be.eq('layer.filter.changed')
        expect(rootOrderedChangedEvt[1].type).to.be.eq('layer.filter.token.changed')
        expect(sousquartiers.isFiltered).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96
        })
    })

    it('Group as layer', function () {
        const root = getRootMapGroupState('cadastre-caen');
        expect(root).to.be.instanceOf(MapGroupState)
        expect(root.childrenCount).to.be.eq(1)

        const group = root.children[0]
        expect(group).to.be.instanceOf(MapGroupState)
        expect(group.childrenCount).to.be.eq(4)

        const fond = group.children[3]
        expect(fond).to.be.instanceOf(MapLayerState)
        expect(fond.checked).to.be.true
        expect(fond.visibility).to.be.true
        expect(fond.layerOrder).to.be.eq(3)

        // Check the item state
        expect(fond.itemState).to.be.instanceOf(LayerGroupState)
        expect(fond.itemState.groupAsLayer).to.be.true
        expect(fond.itemState.childrenCount).to.be.eq(2)
        expect(fond.itemState.children[0].isInGroupAsLayer).to.be.true
        expect(fond.itemState.children[0].checked).to.be.true
        expect(fond.itemState.children[0].visibility).to.be.true
        expect(fond.itemState.children[0]).to.be.instanceOf(LayerGroupState)
        expect(fond.itemState.children[0].childrenCount).to.be.eq(12)
        expect(fond.itemState.children[0].children[0].isInGroupAsLayer).to.be.true
        expect(fond.itemState.children[0].children[0].checked).to.be.false
        expect(fond.itemState.children[0].children[0].visibility).to.be.true
        expect(fond.itemState.children[1].isInGroupAsLayer).to.be.true
        expect(fond.itemState.children[1].checked).to.be.true
        expect(fond.itemState.children[1].visibility).to.be.true
        expect(fond.itemState.children[1]).to.be.instanceOf(LayerGroupState)
        expect(fond.itemState.children[1].childrenCount).to.be.eq(14)
        expect(fond.itemState.children[1].children[0].isInGroupAsLayer).to.be.true
        expect(fond.itemState.children[1].children[0].checked).to.be.false
        expect(fond.itemState.children[1].children[0].visibility).to.be.true

        let rootLayerVisibilityChangedEvt = [];
        let rootGroupVisibilityChangedEvt = [];
        root.addListener(evt => {
            rootLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        root.addListener(evt => {
            rootGroupVisibilityChangedEvt.push(evt)
        }, 'group.visibility.changed');

        let fondLayerVisibilityChangedEvt = [];
        let fondGroupVisibilityChangedEvt = [];
        fond.addListener(evt => {
            fondLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        fond.addListener(evt => {
            fondGroupVisibilityChangedEvt.push(evt)
        }, 'group.visibility.changed');

        fond.checked = false;
        expect(fond.checked).to.be.false
        expect(fond.visibility).to.be.false
        // Events dispatched
        expect(fondLayerVisibilityChangedEvt).to.have.length(1)
        expect(fondLayerVisibilityChangedEvt[0].name).to.be.eq('Fond')
        expect(fondLayerVisibilityChangedEvt[0].visibility).to.be.false
        expect(fondGroupVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerVisibilityChangedEvt).to.have.length(1)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.eq(fondLayerVisibilityChangedEvt[0])
        expect(rootGroupVisibilityChangedEvt).to.have.length(0)

        // Reset
        rootLayerVisibilityChangedEvt = [];
        rootGroupVisibilityChangedEvt = [];
        fondLayerVisibilityChangedEvt = [];
        fondGroupVisibilityChangedEvt = [];

        fond.itemState.children[1].children[0].checked = true;
        // Nothing changes
        expect(fond.checked).to.be.false
        expect(fond.visibility).to.be.false
        // No Events dispatched
        expect(fondLayerVisibilityChangedEvt).to.have.length(0)
        expect(fondGroupVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(rootGroupVisibilityChangedEvt).to.have.length(0)

        fond.itemState.children[0].children[0].checked = true;
        // Nothing changes
        expect(fond.checked).to.be.false
        expect(fond.visibility).to.be.false
        // No Events dispatched
        expect(fondLayerVisibilityChangedEvt).to.have.length(0)
        expect(fondGroupVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(rootGroupVisibilityChangedEvt).to.have.length(0)

        fond.checked = true;
        expect(fond.checked).to.be.true
        expect(fond.visibility).to.be.true
        // Events dispatched
        expect(fondLayerVisibilityChangedEvt).to.have.length(1)
        expect(fondLayerVisibilityChangedEvt[0].name).to.be.eq('Fond')
        expect(fondLayerVisibilityChangedEvt[0].visibility).to.be.true
        expect(fondGroupVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerVisibilityChangedEvt).to.have.length(1)
        expect(rootLayerVisibilityChangedEvt[0]).to.be.deep.eq(fondLayerVisibilityChangedEvt[0])
        expect(rootGroupVisibilityChangedEvt).to.have.length(0)

        // Reset
        rootLayerVisibilityChangedEvt = [];
        rootGroupVisibilityChangedEvt = [];
        fondLayerVisibilityChangedEvt = [];
        fondGroupVisibilityChangedEvt = [];

        fond.itemState.children[1].checked = false;
        // Nothing changes
        expect(fond.checked).to.be.true
        expect(fond.visibility).to.be.true
        // No Events dispatched
        expect(fondLayerVisibilityChangedEvt).to.have.length(0)
        expect(fondGroupVisibilityChangedEvt).to.have.length(0)
        expect(rootLayerVisibilityChangedEvt).to.have.length(0)
        expect(rootGroupVisibilityChangedEvt).to.have.length(0)

        // WMS Parameters
        expect(fond.wmsName).to.be.eq('Fond')
        expect(fond.wmsSelectedStyleName).to.be.eq('')
        expect(fond.wmsStyles).to.be.instanceOf(Array)
        expect(fond.wmsStyles).to.have.length(1)
        expect(fond.wmsStyles[0].wmsName).to.be.eq('')
        expect(fond.wmsStyles[0].wmsTitle).to.be.eq('')
        expect(fond.wmsParameters).to.be.deep.eq({
            'LAYERS': 'Fond',
            'STYLES': '',
            'FORMAT': 'image/png',
            'DPI': 96
        })

        // Try get an unknown layer
        try {
            fond.wmsSelectedStyleName = 'default'
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot assign an unknown WMS style name! `default` is not in the layer `Fond` WMS styles!')
            expect(error).to.be.instanceOf(TypeError)
        }
    })
})

describe('MapRootState', function () {
    it('createExternalGroup', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = root.createExternalGroup('test');
        expect(extGroup.name).to.be.eq('test')

        // The external group has been added
        expect(root.childrenCount).to.be.eq(5)
        expect(root.children[0]).to.be.eq(extGroup)

        // Try to create with the same name
        try {
            root.createExternalGroup('test');
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The group name `test` is already used by an external group child!')
            expect(error).to.be.instanceOf(RangeError)
        }
    })

    it('removeExternalGroup', function () {
        const root = getRootMapGroupState('montpellier');
        expect(root.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = root.createExternalGroup('test');
        expect(extGroup.name).to.be.eq('test')
        expect(root.childrenCount).to.be.eq(5)

        // Try to remove with unknown name
        expect(root.removeExternalGroup('unknown')).to.be.undefined

        // Remove external group
        expect(root.removeExternalGroup('test')).to.be.eq(extGroup);
        expect(root.childrenCount).to.be.eq(4)
    })
})
