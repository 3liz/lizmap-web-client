import { expect } from 'chai';

import { readFileSync } from 'fs';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerGeographicBoundingBoxConfig, LayerBoundingBoxConfig, LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { BaseSymbolsSymbology, LayerIconSymbology, LayerSymbolsSymbology, SymbolIconSymbology, LayerGroupSymbology } from 'assets/src/modules/state/Symbology.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { Extent } from 'assets/src/modules/utils/Extent.js';

import { LayerGroupState, LayerVectorState, LayerRasterState, LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';

/**
 * Returns the root LayerGroupState for the project
 *
 * The files for building it are stored in js-units/data/ and are
 * - name +'-capabilities.json': the WMS capabilities parsed by OpenLayers
 * - name +'-config.json': the Lizmap config send by lizmap web client
 *
 * @param {String} name - The project name
 *
 * @return {LayerGroupState}
 **/
function getRootLayerGroupState(name) {
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
    const root = new LayerGroupState(rootCfg, layersOrder, options.hideGroupCheckbox);
    expect(root).to.be.instanceOf(LayerGroupState)
    return root;
}

/**
 * Returns the LayersAndGroupsCollection for the project
 *
 * The files for building it are stored in js-units/data/ and are
 * - name +'-capabilities.json': the WMS capabilities parsed by OpenLayers
 * - name +'-config.json': the Lizmap config send by lizmap web client
 *
 * @param {String} name - The project name
 *
 * @return {LayersAndGroupsCollection}
 **/
function getLayersAndGroupsCollection(name) {
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
    return new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);
}

describe('LayerGroupState', function () {
    it('Valid', function () {
        const root = getRootLayerGroupState('montpellier');
        expect(root).to.be.instanceOf(LayerGroupState)
        expect(root.id).to.be.null
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.wmsName).to.be.eq('Montpellier-Transports')
        expect(root.wmsTitle).to.be.eq('Montpellier - Transports')
        expect(root.wmsAbstract).to.be.eq('Demo project with bus and tramway lines in Montpellier, France.\nData is licensed under ODbl, OpenStreetMap contributors')
        expect(root.title).to.be.null
        expect(root.abstract).to.be.null
        expect(root.link).to.be.null
        expect(root.wmsGeographicBoundingBox).to.be.null
        expect(root.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(root.wmsMinScaleDenominator).to.be.eq(-1)
        expect(root.wmsMaxScaleDenominator).to.be.eq(-1)
        expect(root.checked).to.be.true
        expect(root.visibility).to.be.true
        expect(root.opacity).to.be.eq(1)
        expect(root.baseLayer).to.be.false
        expect(root.displayInLegend).to.be.true
        expect(root.imageFormat).to.be.null
        expect(root.singleTile).to.be.true
        expect(root.cached).to.be.false
        expect(root.layerConfig).to.be.null
        expect(root.groupAsLayer).to.be.false
        expect(root.mutuallyExclusive).to.be.false
        expect(root.childrenCount).to.be.eq(7)
        expect(root.findLayerNames()).to.be.an('array').that.have.ordered.members([
            "points_of_interest",
            "edition_line",
            "areas_of_interest",
            "bus_stops",
            "bus",
            "tramway_ref",
            "tramway_pivot",
            "tram_stop_work",
            "tramstop",
            "tramway",
            "publicbuildings",
            "publicbuildings_tramstop",
            "donnes_sociodemo_sous_quartiers",
            "SousQuartiers",
            "Quartiers",
            "VilleMTP_MTP_Quartiers_2011_4326",
            "osm-mapnik",
            "osm-stamen-toner"
        ])

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerGroupState)
        expect(transports.id).to.be.eq('datalayers')
        expect(transports.wmsName).to.be.eq('datalayers')
        expect(transports.wmsTitle).to.be.eq('datalayers')
        expect(transports.wmsMinScaleDenominator).to.be.eq(-1)
        expect(transports.wmsMaxScaleDenominator).to.be.eq(-1)
        expect(transports.title).to.be.eq('Transport')
        expect(transports.abstract).to.be.eq('')

        const bus = transports.children[0];
        expect(bus).to.be.instanceOf(LayerGroupState)
        expect(bus.id).to.be.eq('Bus')
        expect(bus.name).to.be.eq('Bus')
        expect(bus.type).to.be.eq('group')
        expect(bus.level).to.be.eq(2)
        expect(bus.wmsName).to.be.eq('Bus')
        expect(bus.wmsTitle).to.be.eq('Bus')
        expect(bus.wmsAbstract).to.be.null
        expect(bus.title).to.be.eq('Bus')
        expect(bus.abstract).to.be.eq('Lignes et arrêts de bus de Montpellier')
        expect(bus.link).to.be.eq('http://www.montpellier-agglo.com/tam/page.php?id_rubrique=29')
        expect(bus.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(bus.wmsGeographicBoundingBox.west).to.be.eq(3.55326)
        expect(bus.wmsGeographicBoundingBox.south).to.be.eq(43.5265)
        expect(bus.wmsGeographicBoundingBox.east).to.be.eq(4.081239)
        expect(bus.wmsGeographicBoundingBox.north).to.be.eq(43.761579)
        expect(bus.wmsBoundingBoxes).to.be.an('array').that.have.length(3)
        expect(bus.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(bus.wmsBoundingBoxes[0].crs).to.be.eq('EPSG:3857')
        expect(bus.wmsBoundingBoxes[0].xmin).to.be.eq(395547.093)
        expect(bus.wmsBoundingBoxes[0].ymin).to.be.eq(5392456.984)
        expect(bus.wmsBoundingBoxes[0].xmax).to.be.eq(454321.449)
        expect(bus.wmsBoundingBoxes[0].ymax).to.be.eq(5428619.815)
        expect(bus.wmsBoundingBoxes[1].crs).to.be.eq('EPSG:4326')
        expect(bus.wmsBoundingBoxes[1].xmin).to.be.eq(bus.wmsGeographicBoundingBox.west)
        expect(bus.wmsBoundingBoxes[1].ymin).to.be.eq(bus.wmsGeographicBoundingBox.south)
        expect(bus.wmsBoundingBoxes[1].xmax).to.be.eq(bus.wmsGeographicBoundingBox.east)
        expect(bus.wmsBoundingBoxes[1].ymax).to.be.eq(bus.wmsGeographicBoundingBox.north)
        expect(bus.wmsMinScaleDenominator).to.be.eq(-1)
        expect(bus.wmsMaxScaleDenominator).to.be.eq(40001)
        expect(bus.checked).to.be.true
        expect(bus.visibility).to.be.true
        expect(bus.opacity).to.be.eq(1)
        expect(bus.baseLayer).to.be.false
        expect(bus.displayInLegend).to.be.true
        expect(bus.imageFormat).to.be.eq('image/png')
        expect(bus.singleTile).to.be.false
        expect(bus.cached).to.be.false
        expect(bus.layerConfig).to.not.be.null;
        expect(bus.groupAsLayer).to.be.false
        expect(bus.mutuallyExclusive).to.be.false
        expect(bus.childrenCount).to.be.eq(2)
        expect(bus.findLayerNames()).to.be.an('array').that.have.ordered.members([
            "bus_stops",
            "bus",
        ])

        const busStops = bus.children[0];
        expect(busStops).to.be.instanceOf(LayerVectorState)
        expect(busStops.id).to.be.eq('bus_stops20121106170806413')
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.wmsAbstract).to.be.null
        expect(busStops.title).to.be.eq('Stops')
        expect(busStops.abstract).to.be.eq('')
        expect(busStops.link).to.be.eq('')
        expect(busStops.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(busStops.wmsGeographicBoundingBox.west).to.be.eq(3.55326)
        expect(busStops.wmsGeographicBoundingBox.south).to.be.eq(43.526928)
        expect(busStops.wmsGeographicBoundingBox.east).to.be.eq(4.039132)
        expect(busStops.wmsGeographicBoundingBox.north).to.be.eq(43.752341)
        expect(busStops.wmsBoundingBoxes).to.be.an('array').that.have.length(3)
        expect(busStops.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(busStops.wmsBoundingBoxes[0].crs).to.be.eq('EPSG:3857')
        expect(busStops.wmsBoundingBoxes[0].xmin).to.be.eq(395547.093)
        expect(busStops.wmsBoundingBoxes[0].ymin).to.be.eq(5392522.697)
        expect(busStops.wmsBoundingBoxes[0].xmax).to.be.eq(449634.007)
        expect(busStops.wmsBoundingBoxes[0].ymax).to.be.eq(5427196.032)
        expect(busStops.wmsBoundingBoxes[1].crs).to.be.eq('EPSG:4326')
        expect(busStops.wmsBoundingBoxes[1].xmin).to.be.eq(busStops.wmsGeographicBoundingBox.west)
        expect(busStops.wmsBoundingBoxes[1].ymin).to.be.eq(busStops.wmsGeographicBoundingBox.south)
        expect(busStops.wmsBoundingBoxes[1].xmax).to.be.eq(busStops.wmsGeographicBoundingBox.east)
        expect(busStops.wmsBoundingBoxes[1].ymax).to.be.eq(busStops.wmsGeographicBoundingBox.north)
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)
        expect(busStops.checked).to.be.false
        expect(busStops.visibility).to.be.false
        expect(busStops.opacity).to.be.eq(1)
        expect(busStops.baseLayer).to.be.false
        expect(busStops.displayInLegend).to.be.true
        expect(busStops.imageFormat).to.be.eq('image/png')
        expect(busStops.singleTile).to.be.true
        expect(busStops.cached).to.be.false
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.layerType).to.be.eq('vector')
        expect(busStops.layerOrder).to.be.eq(3)
        expect(busStops.extent).to.be.instanceOf(Extent)
        expect(busStops.extent.xmin).to.be.eq(3.55326)
        expect(busStops.extent.ymin).to.be.eq(43.526928)
        expect(busStops.extent.xmax).to.be.eq(4.039131)
        expect(busStops.extent.ymax).to.be.eq(43.752341)
        expect(busStops.crs).to.be.eq('EPSG:4326')
        expect(busStops.popup).to.be.true
        expect(busStops.popupMaxFeatures).to.be.eq(10)
        expect(busStops.wmsSelectedStyleName).to.be.eq('default')
        expect(busStops.wmsStyles).to.be.an('array').that.have.length(1)
        expect(busStops.wmsAttribution).to.be.null
        expect(busStops.isSpatial).to.be.true
        expect(busStops.geometryType).to.be.eq('point')
        expect(busStops.popupDisplayChildren).to.be.false
        expect(busStops.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "bus_stops",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(busStops.symbology).to.be.null
        expect(busStops.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(busStops.selectionToken).to.be.null
        expect(busStops.expressionFilter).to.be.null
        expect(busStops.filterToken).to.be.null

        const donneesSocio = root.children[2];
        expect(donneesSocio).to.be.instanceOf(LayerVectorState)
        expect(donneesSocio.id).to.be.eq('donnes_sociodemo_sous_quartiers20160121144525075')
        expect(donneesSocio.name).to.be.eq('donnes_sociodemo_sous_quartiers')
        expect(donneesSocio.type).to.be.eq('layer')
        expect(donneesSocio.level).to.be.eq(1)
        expect(donneesSocio.wmsGeographicBoundingBox).to.be.null
        expect(donneesSocio.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(donneesSocio.checked).to.be.false
        expect(donneesSocio.visibility).to.be.false
        expect(donneesSocio.layerType).to.be.eq('vector')
        expect(donneesSocio.layerOrder).to.be.eq(-1)
        expect(donneesSocio.extent).to.be.null
        expect(donneesSocio.crs).to.be.eq('EPSG:4326')
        expect(donneesSocio.isSpatial).to.be.false
        expect(donneesSocio.geometryType).to.be.eq('none')
        expect(donneesSocio.popupDisplayChildren).to.be.false

        const sousquartiers = root.children[3];
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.id).to.be.eq('SousQuartiers20160121124316563')
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.type).to.be.eq('layer')
        expect(sousquartiers.level).to.be.eq(1)
        expect(sousquartiers.checked).to.be.false
        expect(sousquartiers.visibility).to.be.false
        expect(sousquartiers.isSpatial).to.be.true
        expect(sousquartiers.geometryType).to.be.eq('polygon')
        expect(sousquartiers.wmsName).to.be.eq('SousQuartiers')
        expect(sousquartiers.layerConfig).to.not.be.null;
        expect(sousquartiers.wmsStyles).to.be.an('array')
        expect(sousquartiers.wmsStyles).to.have.length(1)
        expect(sousquartiers.wmsStyles[0].wmsName).to.be.eq('default')
        expect(sousquartiers.wmsStyles[0].wmsTitle).to.be.eq('default')
        expect(sousquartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(sousquartiers.wmsAttribution).to.be.null
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(sousquartiers.symbology).to.be.null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null

        const hidden = root.children[6];
        expect(hidden).to.be.instanceOf(LayerGroupState)
        expect(hidden.id).to.be.eq('Hidden')
        expect(hidden.name).to.be.eq('Hidden')
        expect(hidden.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(hidden.wmsGeographicBoundingBox.west).to.be.eq(-180)
        expect(hidden.wmsGeographicBoundingBox.south).to.be.eq(-85.051129)
        expect(hidden.wmsGeographicBoundingBox.east).to.be.eq(180)
        expect(hidden.wmsGeographicBoundingBox.north).to.be.eq(85.051129)
        expect(hidden.childrenCount).to.be.eq(2)

        const osm = hidden.children[0];
        expect(osm).to.be.instanceOf(LayerRasterState)
        expect(osm.id).to.be.eq('osm_mapnik20180315181738526')
        expect(osm.name).to.be.eq('osm-mapnik')
        expect(osm.wmsName).to.be.eq('osm-mapnik')
        expect(osm.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(osm.wmsGeographicBoundingBox.west).to.be.eq(-180)
        expect(osm.wmsGeographicBoundingBox.south).to.be.eq(-85.051129)
        expect(osm.wmsGeographicBoundingBox.east).to.be.eq(180)
        expect(osm.wmsGeographicBoundingBox.north).to.be.eq(85.051129)
        expect(osm.layerOrder).to.be.eq(11)
        expect(osm.extent).to.be.instanceOf(Extent)
        expect(osm.extent.xmin).to.be.eq(-20037508.342789244)
        expect(osm.extent.ymin).to.be.eq(-20037508.342789255)
        expect(osm.extent.xmax).to.be.eq(20037508.342789244)
        expect(osm.extent.ymax).to.be.eq(20037508.342789244)
        expect(osm.crs).to.be.eq('EPSG:3857')
        expect(osm.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "osm-mapnik",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(osm.externalWmsToggle).to.be.true
        expect(osm.externalAccess).to.be.an('object').that.be.deep.eq({
            "crs": "EPSG:3857",
            "format": "",
            "type": "xyz",
            "url": "http://tile.openstreetmap.org/{z}/{x}/{y}.png"
        })
    })

    it('Selection and parameters', function () {
        const root = getRootLayerGroupState('montpellier');

        const sousquartiers = root.children[3];
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(sousquartiers.symbology).to.be.null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.false

        sousquartiers.selectedFeatures = ['1']
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1"
        })

        sousquartiers.selectedFeatures = ['1', '3']
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1,3"
        })

        sousquartiers.selectedFeatures = null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })

        try {
            sousquartiers.selectedFeatures = {}
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Selection Ids could only be null or an array!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })

        sousquartiers.selectedFeatures = ['1']
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1"
        })

        sousquartiers.selectionToken = 'token-for-id-1'
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.eq('token-for-id-1')
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1"
        })

        sousquartiers.selectionToken = null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1"
        })

        try {
            sousquartiers.selectionToken = 1
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Selection token could only be null, a string or an object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1"
        })

        sousquartiers.selectionToken = 'token-for-id-1'
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.eq('token-for-id-1')
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1"
        })

        // The selection token will be reset when selected features changed
        sousquartiers.selectedFeatures = ['1', '3']
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1,3"
        })

        // Update filter token with an object
        // An empty object throw an error and does not change anything
        try {
            sousquartiers.selectionToken = {}
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('If the expression filter token is an object, it has to have `token` and `selectedFeatures` properties!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(2)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTION": "SousQuartiers:1,3"
        })

        // An object with `selectedFeatures` and `token` updates the 2 properties
        sousquartiers.selectionToken = {
            selectedFeatures: ['1'],
            token: 'token-for-id-1'
        }
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(1)
        expect(sousquartiers.selectionToken).to.be.eq('token-for-id-1')
        expect(sousquartiers.hasSelectedFeatures).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "SELECTIONTOKEN": "token-for-id-1"
        })
        // Reset filter and token
        sousquartiers.selectedFeatures = [] // or null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
    })

    it('Filter and parameters', function () {
        const root = getRootLayerGroupState('montpellier');

        const sousquartiers = root.children[3];
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(sousquartiers.symbology).to.be.null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.hasSelectedFeatures).to.be.false
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.false

        sousquartiers.expressionFilter = '"QUARTMNO" = \'HO\''
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" = 'HO'"
        })

        sousquartiers.expressionFilter = '"QUARTMNO" IN ( \'HO\' , \'PA\' )'
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" IN ( 'HO' , 'PA' )"
        })

        sousquartiers.expressionFilter = null
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })

        try {
            sousquartiers.expressionFilter = {}
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Expression filter could only be null or a string!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })

        sousquartiers.expressionFilter = '"QUARTMNO" = \'HO\''
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" = 'HO'"
        })

        sousquartiers.filterToken = 'token-for-id-1'
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.filterToken).to.be.eq('token-for-id-1')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1"
        })

        sousquartiers.filterToken = null
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" = 'HO'"
        })

        try {
            sousquartiers.filterToken = 1
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Expression filter token could only be null, a string or an object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" = 'HO'"
        })

        sousquartiers.filterToken = 'token-for-id-1'
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.filterToken).to.be.eq('token-for-id-1')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1"
        })

        sousquartiers.expressionFilter = '"QUARTMNO" IN ( \'HO\' , \'PA\' )'
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" IN ( 'HO' , 'PA' )"
        })

        // Update filter token with an object
        // An empty object throw an error and does not change anything
        try {
            sousquartiers.filterToken = {}
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('If the expression filter token is an object, it has to have `token` and `expressionFilter` properties!')
            expect(error).to.be.instanceOf(ValidationError)
        }
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" IN ( \'HO\' , \'PA\' )')
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTER": "SousQuartiers:\"QUARTMNO\" IN ( 'HO' , 'PA' )"
        })

        // An object with `expressionFilter` and `token` updates the 2 properties
        sousquartiers.filterToken = {
            expressionFilter: '"QUARTMNO" = \'HO\'',
            token: 'token-for-id-1'
        }
        expect(sousquartiers.expressionFilter).to.be.a('string').that.be.eq('"QUARTMNO" = \'HO\'')
        expect(sousquartiers.filterToken).to.be.eq('token-for-id-1')
        expect(sousquartiers.isFiltered).to.be.true
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
            "FILTERTOKEN": "token-for-id-1"
        })

        // Reset filter and token
        sousquartiers.expressionFilter = null
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null
        expect(sousquartiers.isFiltered).to.be.false
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
    })

    it('Mutually exclusive', function () {
        const root = getRootLayerGroupState('mutually-exclusive');

        const group = root.children[0]
        expect(group).to.be.instanceOf(LayerGroupState)
        expect(group.mutuallyExclusive).to.be.true
        expect(group.checked).to.be.true
        expect(group.visibility).to.be.true
        expect(group.childrenCount).to.be.eq(2)

        const layer1 = group.children[0]
        expect(layer1).to.be.instanceOf(LayerVectorState)
        expect(layer1.checked).to.be.true
        expect(layer1.visibility).to.be.true
        const layer2 = group.children[1]
        expect(layer2).to.be.instanceOf(LayerVectorState)
        expect(layer2.checked).to.be.false
        expect(layer2.visibility).to.be.false

        layer2.checked = true;
        expect(group.checked).to.be.true
        expect(group.visibility).to.be.true
        expect(layer1.checked).to.be.false
        expect(layer1.visibility).to.be.false
        expect(layer2.checked).to.be.true
        expect(layer2.visibility).to.be.true

        group.checked = false;
        expect(group.checked).to.be.false
        expect(group.visibility).to.be.false
        expect(layer1.checked).to.be.false
        expect(layer1.visibility).to.be.false
        expect(layer2.checked).to.be.true
        expect(layer2.visibility).to.be.false

        layer1.checked = true;
        expect(group.checked).to.be.true
        expect(group.visibility).to.be.true
        expect(layer1.checked).to.be.true
        expect(layer1.visibility).to.be.true
        expect(layer2.checked).to.be.false
        expect(layer2.visibility).to.be.false

        layer1.checked = false;
        expect(group.checked).to.be.true
        expect(group.visibility).to.be.true
        expect(layer1.checked).to.be.false
        expect(layer1.visibility).to.be.false
        expect(layer2.checked).to.be.false
        expect(layer2.visibility).to.be.false
    })

    it('Group as layer', function () {
        const root = getRootLayerGroupState('cadastre-caen');
        expect(root.childrenCount).to.be.eq(1)

        const group = root.children[0]
        expect(group).to.be.instanceOf(LayerGroupState)
        expect(group.groupAsLayer).to.be.false
        expect(group.type)
            .to.be.eq('group')
            .that.be.eq(group.mapType)
        expect(group.childrenCount).to.be.eq(4)

        const fond = group.children[3]
        expect(fond).to.be.instanceOf(LayerGroupState)
        expect(fond.groupAsLayer).to.be.true
        expect(fond.type)
            .to.be.eq('group')
            .that.not.be.eq(fond.mapType)
        expect(fond.mapType).to.be.eq('layer')
        expect(fond.checked).to.be.true
        expect(fond.visibility).to.be.true
        expect(fond.childrenCount).to.be.eq(2)

        expect(fond.children[0].isInGroupAsLayer).to.be.true
        expect(fond.children[0].checked).to.be.true
        expect(fond.children[0].visibility).to.be.true
        expect(fond.children[0].displayInLegend).to.be.false
        expect(fond.children[0]).to.be.instanceOf(LayerGroupState)
        expect(fond.children[0].childrenCount).to.be.eq(12)
        expect(fond.children[0].children[0].isInGroupAsLayer).to.be.true
        expect(fond.children[0].children[0].checked).to.be.false
        expect(fond.children[0].children[0].visibility).to.be.true
        expect(fond.children[0].children[0].displayInLegend).to.be.false
        expect(fond.children[1].isInGroupAsLayer).to.be.true
        expect(fond.children[1].checked).to.be.true
        expect(fond.children[1].visibility).to.be.true
        expect(fond.children[1].displayInLegend).to.be.false
        expect(fond.children[1]).to.be.instanceOf(LayerGroupState)
        expect(fond.children[1].childrenCount).to.be.eq(14)
        expect(fond.children[1].children[0].isInGroupAsLayer).to.be.true
        expect(fond.children[1].children[0].checked).to.be.false
        expect(fond.children[1].children[0].visibility).to.be.true
        expect(fond.children[1].children[0].displayInLegend).to.be.false

        fond.checked = false;
        expect(fond.checked).to.be.false
        expect(fond.visibility).to.be.false
        expect(fond.children[0].checked).to.be.true
        expect(fond.children[0].visibility).to.be.false
        expect(fond.children[0].children[0].checked).to.be.false
        expect(fond.children[0].children[0].visibility).to.be.false
        expect(fond.children[1].checked).to.be.true
        expect(fond.children[1].visibility).to.be.false
        expect(fond.children[1].children[0].checked).to.be.false
        expect(fond.children[1].children[0].visibility).to.be.false

        fond.children[1].children[0].checked = true;
        expect(fond.checked).to.be.false
        expect(fond.visibility).to.be.false
        expect(fond.children[0].checked).to.be.true
        expect(fond.children[0].visibility).to.be.false
        expect(fond.children[0].children[0].checked).to.be.false
        expect(fond.children[0].children[0].visibility).to.be.false
        expect(fond.children[1].checked).to.be.true
        expect(fond.children[1].visibility).to.be.false
        expect(fond.children[1].children[0].checked).to.be.true
        expect(fond.children[1].children[0].visibility).to.be.false

        fond.children[0].children[0].checked = true;
        expect(fond.checked).to.be.false
        expect(fond.visibility).to.be.false
        expect(fond.children[0].checked).to.be.true
        expect(fond.children[0].visibility).to.be.false
        expect(fond.children[0].children[0].checked).to.be.true
        expect(fond.children[0].children[0].visibility).to.be.false
        expect(fond.children[1].checked).to.be.true
        expect(fond.children[1].visibility).to.be.false
        expect(fond.children[1].children[0].checked).to.be.true
        expect(fond.children[1].children[0].visibility).to.be.false

        fond.checked = true;
        expect(fond.checked).to.be.true
        expect(fond.visibility).to.be.true
        expect(fond.children[0].checked).to.be.true
        expect(fond.children[0].visibility).to.be.true
        expect(fond.children[0].children[0].checked).to.be.true
        expect(fond.children[0].children[0].visibility).to.be.true
        expect(fond.children[1].checked).to.be.true
        expect(fond.children[1].visibility).to.be.true
        expect(fond.children[1].children[0].checked).to.be.true
        expect(fond.children[1].children[0].visibility).to.be.true

        fond.children[1].checked = false;
        expect(fond.checked).to.be.true
        expect(fond.visibility).to.be.true
        expect(fond.children[0].checked).to.be.true
        expect(fond.children[0].visibility).to.be.true
        expect(fond.children[0].children[0].checked).to.be.true
        expect(fond.children[0].children[0].visibility).to.be.true
        expect(fond.children[1].checked).to.be.false
        expect(fond.children[1].visibility).to.be.true
        expect(fond.children[1].children[0].checked).to.be.true
        expect(fond.children[1].children[0].visibility).to.be.true
    })

    it('Group as layer checked', function () {
        const root = getRootLayerGroupState('layer_legends');
        expect(root.childrenCount).to.be.eq(6)

        const layer_legend_single_symbol = root.children[0]
        expect(layer_legend_single_symbol).to.be.instanceOf(LayerVectorState)
        expect(layer_legend_single_symbol.name).to.be.eq('layer_legend_single_symbol')
        expect(layer_legend_single_symbol.type)
            .to.be.eq('layer')
            .that.be.eq(layer_legend_single_symbol.mapType)

        const layer_legend_categorized = root.children[1]
        expect(layer_legend_categorized).to.be.instanceOf(LayerVectorState)
        expect(layer_legend_categorized.name).to.be.eq('layer_legend_categorized')
        expect(layer_legend_categorized.type)
            .to.be.eq('layer')
            .that.be.eq(layer_legend_categorized.mapType)

        const layer_legend_ruled = root.children[2]
        expect(layer_legend_ruled).to.be.instanceOf(LayerVectorState)
        expect(layer_legend_ruled.name).to.be.eq('layer_legend_ruled')
        expect(layer_legend_ruled.type)
            .to.be.eq('layer')
            .that.be.eq(layer_legend_ruled.mapType)

        const tramway_lines = root.children[3]
        expect(tramway_lines).to.be.instanceOf(LayerVectorState)
        expect(tramway_lines.name).to.be.eq('tramway_lines')
        expect(tramway_lines.type)
            .to.be.eq('layer')
            .that.be.eq(tramway_lines.mapType)

        // A group is checked only if at least 1 child is checked
        const legend_option_test = root.children[4]
        expect(legend_option_test).to.be.instanceOf(LayerGroupState)
        expect(legend_option_test.name).to.be.eq('legend_option_test')
        expect(legend_option_test.type)
            .to.be.eq('group')
            .that.be.eq(legend_option_test.mapType)
        expect(legend_option_test.groupAsLayer).to.be.false
        expect(legend_option_test.layerConfig).not.to.be.null
        expect(legend_option_test.layerConfig.toggled).to.be.true
        expect(legend_option_test.childrenCount).to.be.eq(3)
        expect(legend_option_test.children[0]).to.be.instanceOf(LayerVectorState)
        expect(legend_option_test.children[0].checked).to.be.false
        expect(legend_option_test.children[1]).to.be.instanceOf(LayerVectorState)
        expect(legend_option_test.children[1].checked).to.be.false
        expect(legend_option_test.children[2]).to.be.instanceOf(LayerVectorState)
        expect(legend_option_test.children[2].checked).to.be.false
        expect(legend_option_test.checked).to.be.true

        // A group as layer is checked if its config has toggled
        const group_as_layer = root.children[5]
        expect(group_as_layer).to.be.instanceOf(LayerGroupState)
        expect(group_as_layer.name).to.be.eq('Group as layer')
        expect(group_as_layer.type)
            .to.be.eq('group')
            .that.not.be.eq(group_as_layer.mapType)
        expect(group_as_layer.mapType).to.be.eq('layer')
        expect(group_as_layer.groupAsLayer).to.be.true
        expect(group_as_layer.layerConfig).not.to.be.null
        expect(group_as_layer.layerConfig.toggled).to.be.true
        expect(group_as_layer.checked).to.be.true
    })

    it('Group as layer symbology', function () {
        const root = getRootLayerGroupState('cadastre-caen');
        expect(root.childrenCount).to.be.eq(1)

        const group = root.children[0]
        expect(group).to.be.instanceOf(LayerGroupState)
        expect(group.groupAsLayer).to.be.false
        expect(group.type)
            .to.be.eq('group')
            .that.be.eq(group.mapType)
        expect(group.childrenCount).to.be.eq(4)

        const fond = group.children[3]
        expect(fond).to.be.instanceOf(LayerGroupState)
        expect(fond.groupAsLayer).to.be.true
        expect(fond.type)
            .to.be.eq('group')
            .that.not.be.eq(fond.mapType)
        expect(fond.mapType).to.be.eq('layer')
        /*const collection = getLayersAndGroupsCollection('cadastre-caen');

        const fond = collection.getLayerByName('Fond')*/

        expect(fond.symbology).to.be.undefined

        let fondSymbologyChangedEvt = null;

        fond.addListener(evt => {
            fondSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');

        const legend = JSON.parse(readFileSync('./tests/js-units/data/cadastre-caen-fond-legend.json', 'utf8'));
        expect(legend).to.not.be.undefined

        // Set symbology
        fond.symbology = legend
        expect(fond.symbology).to.be.instanceOf(LayerGroupSymbology)

        // Event dispatched
        expect(fondSymbologyChangedEvt).to.not.be.null
        expect(fondSymbologyChangedEvt.name).to.be.eq('Fond')


        let expandedChangedEvt = null;
        fond.addListener(evt => {
            expandedChangedEvt = evt
        }, 'layer.symbol.expanded.changed');
        const symbologyChildren = fond.symbology.children
        expect(symbologyChildren[1]).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbologyChildren[1].expanded).to.be.false
        symbologyChildren[1].expanded = true;

        expect(expandedChangedEvt).to.not.be.null
        expect(expandedChangedEvt.title).to.be.eq('Objets ponctuels')
        expect(expandedChangedEvt.symbolType).to.be.eq('layer')
        expect(expandedChangedEvt.expanded).to.be.true
    })
})

describe('LayersAndGroupsCollection', function () {
    it('Valid', function () {
        const collection = getLayersAndGroupsCollection('montpellier');

        const root = collection.root;
        expect(root).to.be.instanceOf(LayerGroupState)

        expect(collection.layerNames).to.be.an('array').that.have.ordered.members([
            "points_of_interest",
            "edition_line",
            "areas_of_interest",
            "bus_stops",
            "bus",
            "tramway_ref",
            "tramway_pivot",
            "tram_stop_work",
            "tramstop",
            "tramway",
            "publicbuildings",
            "publicbuildings_tramstop",
            "donnes_sociodemo_sous_quartiers",
            "SousQuartiers",
            "Quartiers",
            "VilleMTP_MTP_Quartiers_2011_4326",
            "osm-mapnik",
            "osm-stamen-toner"
        ])

        let names = []
        for (const layer of collection.layers) {
            names.push(layer.name)
        }
        expect(names).to.have.ordered.members(collection.layerNames)

        expect(collection.groupNames).to.be.an('array').that.have.ordered.members([
            "Edition",
            "datalayers",
            "Bus",
            "Tramway",
            "Buildings",
            "Overview",
            "Hidden"
        ])
        names = []
        for (const group of collection.groups) {
            names.push(group.name)
        }
        expect(names).to.have.ordered.members(collection.groupNames)

        const busStops = collection.getLayerByName('bus_stops')
        expect(busStops).to.be.instanceOf(LayerVectorState)
        expect(busStops.id).to.be.eq('bus_stops20121106170806413')
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.wmsAbstract).to.be.null
        expect(busStops.link).to.be.eq('')
        expect(busStops.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(busStops.wmsGeographicBoundingBox.west).to.be.eq(3.55326)
        expect(busStops.wmsGeographicBoundingBox.south).to.be.eq(43.526928)
        expect(busStops.wmsGeographicBoundingBox.east).to.be.eq(4.039132)
        expect(busStops.wmsGeographicBoundingBox.north).to.be.eq(43.752341)
        expect(busStops.wmsBoundingBoxes).to.be.an('array').that.have.length(3)
        expect(busStops.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(busStops.wmsBoundingBoxes[0].crs).to.be.eq('EPSG:3857')
        expect(busStops.wmsBoundingBoxes[0].xmin).to.be.eq(395547.093)
        expect(busStops.wmsBoundingBoxes[0].ymin).to.be.eq(5392522.697)
        expect(busStops.wmsBoundingBoxes[0].xmax).to.be.eq(449634.007)
        expect(busStops.wmsBoundingBoxes[0].ymax).to.be.eq(5427196.032)
        expect(busStops.wmsBoundingBoxes[1].crs).to.be.eq('EPSG:4326')
        expect(busStops.wmsBoundingBoxes[1].xmin).to.be.eq(busStops.wmsGeographicBoundingBox.west)
        expect(busStops.wmsBoundingBoxes[1].ymin).to.be.eq(busStops.wmsGeographicBoundingBox.south)
        expect(busStops.wmsBoundingBoxes[1].xmax).to.be.eq(busStops.wmsGeographicBoundingBox.east)
        expect(busStops.wmsBoundingBoxes[1].ymax).to.be.eq(busStops.wmsGeographicBoundingBox.north)
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)
        expect(busStops.checked).to.be.false
        expect(busStops.visibility).to.be.false
        expect(busStops.opacity).to.be.eq(1)
        expect(busStops.baseLayer).to.be.false
        expect(busStops.displayInLegend).to.be.true
        expect(busStops.imageFormat).to.be.eq('image/png')
        expect(busStops.singleTile).to.be.true
        expect(busStops.cached).to.be.false
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.layerType).to.be.eq('vector')
        expect(busStops.layerOrder).to.be.eq(3)
        expect(busStops.extent).to.be.instanceOf(Extent)
        expect(busStops.extent.xmin).to.be.eq(3.55326)
        expect(busStops.extent.ymin).to.be.eq(43.526928)
        expect(busStops.extent.xmax).to.be.eq(4.039131)
        expect(busStops.extent.ymax).to.be.eq(43.752341)
        expect(busStops.crs).to.be.eq('EPSG:4326')
        expect(busStops.popup).to.be.true
        expect(busStops.popupMaxFeatures).to.be.eq(10)
        expect(busStops.wmsSelectedStyleName).to.be.eq('default')
        expect(busStops.wmsStyles).to.be.an('array').that.have.length(1)
        expect(busStops.wmsAttribution).to.be.null
        expect(busStops.isSpatial).to.be.true
        expect(busStops.geometryType).to.be.eq('point')
        expect(busStops.popupDisplayChildren).to.be.false
        expect(busStops.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "bus_stops",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(busStops.symbology).to.be.null
        expect(busStops.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(busStops.selectionToken).to.be.null
        expect(busStops.expressionFilter).to.be.null
        expect(busStops.filterToken).to.be.null

        const donneesSocio = collection.getLayerByName('donnes_sociodemo_sous_quartiers')
        expect(donneesSocio).to.be.instanceOf(LayerVectorState)
        expect(donneesSocio.id).to.be.eq('donnes_sociodemo_sous_quartiers20160121144525075')
        expect(donneesSocio.name).to.be.eq('donnes_sociodemo_sous_quartiers')
        expect(donneesSocio.type).to.be.eq('layer')
        expect(donneesSocio.level).to.be.eq(1)
        expect(donneesSocio.wmsGeographicBoundingBox).to.be.null
        expect(donneesSocio.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(donneesSocio.checked).to.be.false
        expect(donneesSocio.visibility).to.be.false
        expect(donneesSocio.layerType).to.be.eq('vector')
        expect(donneesSocio.layerOrder).to.be.eq(-1)
        expect(donneesSocio.extent).to.be.null
        expect(donneesSocio.crs).to.be.eq('EPSG:4326')
        expect(donneesSocio.isSpatial).to.be.false
        expect(donneesSocio.geometryType).to.be.eq('none')
        expect(donneesSocio.popupDisplayChildren).to.be.false

        const sousquartiers = collection.getLayerByName('SousQuartiers')
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.id).to.be.eq('SousQuartiers20160121124316563')
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.type).to.be.eq('layer')
        expect(sousquartiers.level).to.be.eq(1)
        expect(sousquartiers.checked).to.be.false
        expect(sousquartiers.visibility).to.be.false
        expect(sousquartiers.isSpatial).to.be.true
        expect(sousquartiers.geometryType).to.be.eq('polygon')
        expect(sousquartiers.wmsName).to.be.eq('SousQuartiers')
        expect(sousquartiers.layerConfig).to.not.be.null;
        expect(sousquartiers.wmsStyles).to.be.an('array')
        expect(sousquartiers.wmsStyles).to.have.length(1)
        expect(sousquartiers.wmsStyles[0].wmsName).to.be.eq('default')
        expect(sousquartiers.wmsStyles[0].wmsTitle).to.be.eq('default')
        expect(sousquartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(sousquartiers.wmsAttribution).to.be.null
        expect(sousquartiers.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "SousQuartiers",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(sousquartiers.symbology).to.be.null
        expect(sousquartiers.selectedFeatures).to.be.an('array').that.have.length(0)
        expect(sousquartiers.selectionToken).to.be.null
        expect(sousquartiers.expressionFilter).to.be.null
        expect(sousquartiers.filterToken).to.be.null

        const osm = collection.getLayerByName('osm-mapnik')
        expect(osm).to.be.instanceOf(LayerRasterState)
        expect(osm.id).to.be.eq('osm_mapnik20180315181738526')
        expect(osm.name).to.be.eq('osm-mapnik')
        expect(osm.wmsName).to.be.eq('osm-mapnik')
        expect(osm.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(osm.wmsGeographicBoundingBox.west).to.be.eq(-180)
        expect(osm.wmsGeographicBoundingBox.south).to.be.eq(-85.051129)
        expect(osm.wmsGeographicBoundingBox.east).to.be.eq(180)
        expect(osm.wmsGeographicBoundingBox.north).to.be.eq(85.051129)
        expect(osm.layerOrder).to.be.eq(11)
        expect(osm.extent).to.be.instanceOf(Extent)
        expect(osm.extent.xmin).to.be.eq(-20037508.342789244)
        expect(osm.extent.ymin).to.be.eq(-20037508.342789255)
        expect(osm.extent.xmax).to.be.eq(20037508.342789244)
        expect(osm.extent.ymax).to.be.eq(20037508.342789244)
        expect(osm.crs).to.be.eq('EPSG:3857')
        expect(osm.wmsParameters).to.be.an('object').that.be.deep.eq({
            "LAYERS": "osm-mapnik",
            "STYLES": "default",
            "FORMAT": "image/png",
            "DPI": 96,
        })
        expect(osm.externalWmsToggle).to.be.true
        expect(osm.externalAccess).to.be.an('object').that.be.deep.eq({
            "crs": "EPSG:3857",
            "format": "",
            "type": "xyz",
            "url": "http://tile.openstreetmap.org/{z}/{x}/{y}.png"
        })

        // Try get an unknown layer
        try {
            collection.getLayerByName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(collection.getLayerById('bus_stops20121106170806413')).to.be.deep.eq(busStops)
        expect(collection.getLayerById('donnes_sociodemo_sous_quartiers20160121144525075')).to.be.deep.eq(donneesSocio)
        expect(collection.getLayerById('SousQuartiers20160121124316563')).to.be.deep.eq(sousquartiers)
        expect(collection.getLayerById('osm_mapnik20180315181738526')).to.be.deep.eq(osm)


        // Try get an unknown layer
        try {
            collection.getLayerById('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer id `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(collection.getLayerByWmsName('bus_stops')).to.be.deep.eq(busStops)
        expect(collection.getLayerByWmsName('donnes_sociodemo_sous_quartiers')).to.be.deep.eq(donneesSocio)
        expect(collection.getLayerByWmsName('SousQuartiers')).to.be.deep.eq(sousquartiers)
        expect(collection.getLayerByWmsName('osm-mapnik')).to.be.deep.eq(osm)

        // Try get an unknown layer
        try {
            collection.getLayerByWmsName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer WMS Name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }


        const transports = collection.getGroupByName('datalayers');
        expect(transports).to.be.instanceOf(LayerGroupState)
        expect(transports.id).to.be.eq('datalayers')
        expect(transports.wmsName).to.be.eq('datalayers')
        expect(transports.wmsMinScaleDenominator).to.be.eq(-1)
        expect(transports.wmsMaxScaleDenominator).to.be.eq(-1)

        const bus = collection.getGroupByName('Bus');
        expect(bus).to.be.instanceOf(LayerGroupState)
        expect(bus.id).to.be.eq('Bus')
        expect(bus.name).to.be.eq('Bus')
        expect(bus.type).to.be.eq('group')
        expect(bus.level).to.be.eq(2)
        expect(bus.wmsName).to.be.eq('Bus')
        expect(bus.wmsTitle).to.be.eq('Bus')
        expect(bus.wmsAbstract).to.be.null
        expect(bus.link).to.be.eq('http://www.montpellier-agglo.com/tam/page.php?id_rubrique=29')
        expect(bus.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(bus.wmsGeographicBoundingBox.west).to.be.eq(3.55326)
        expect(bus.wmsGeographicBoundingBox.south).to.be.eq(43.5265)
        expect(bus.wmsGeographicBoundingBox.east).to.be.eq(4.081239)
        expect(bus.wmsGeographicBoundingBox.north).to.be.eq(43.761579)
        expect(bus.wmsBoundingBoxes).to.be.an('array').that.have.length(3)
        expect(bus.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(bus.wmsBoundingBoxes[0].crs).to.be.eq('EPSG:3857')
        expect(bus.wmsBoundingBoxes[0].xmin).to.be.eq(395547.093)
        expect(bus.wmsBoundingBoxes[0].ymin).to.be.eq(5392456.984)
        expect(bus.wmsBoundingBoxes[0].xmax).to.be.eq(454321.449)
        expect(bus.wmsBoundingBoxes[0].ymax).to.be.eq(5428619.815)
        expect(bus.wmsBoundingBoxes[1].crs).to.be.eq('EPSG:4326')
        expect(bus.wmsBoundingBoxes[1].xmin).to.be.eq(bus.wmsGeographicBoundingBox.west)
        expect(bus.wmsBoundingBoxes[1].ymin).to.be.eq(bus.wmsGeographicBoundingBox.south)
        expect(bus.wmsBoundingBoxes[1].xmax).to.be.eq(bus.wmsGeographicBoundingBox.east)
        expect(bus.wmsBoundingBoxes[1].ymax).to.be.eq(bus.wmsGeographicBoundingBox.north)
        expect(bus.wmsMinScaleDenominator).to.be.eq(-1)
        expect(bus.wmsMaxScaleDenominator).to.be.eq(40001)
        expect(bus.checked).to.be.true
        expect(bus.visibility).to.be.true
        expect(bus.opacity).to.be.eq(1)
        expect(bus.baseLayer).to.be.false
        expect(bus.displayInLegend).to.be.true
        expect(bus.imageFormat).to.be.eq('image/png')
        expect(bus.singleTile).to.be.false
        expect(bus.cached).to.be.false
        expect(bus.layerConfig).to.not.be.null;
        expect(bus.groupAsLayer).to.be.false
        expect(bus.mutuallyExclusive).to.be.false
        expect(bus.childrenCount).to.be.eq(2)
        expect(bus.findLayerNames()).to.be.an('array').that.have.ordered.members([
            "bus_stops",
            "bus",
        ])

        const hidden = collection.getGroupByName('Hidden');
        expect(hidden).to.be.instanceOf(LayerGroupState)
        expect(hidden.id).to.be.eq('Hidden')
        expect(hidden.name).to.be.eq('Hidden')
        expect(hidden.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(hidden.wmsGeographicBoundingBox.west).to.be.eq(-180)
        expect(hidden.wmsGeographicBoundingBox.south).to.be.eq(-85.051129)
        expect(hidden.wmsGeographicBoundingBox.east).to.be.eq(180)
        expect(hidden.wmsGeographicBoundingBox.north).to.be.eq(85.051129)
        expect(hidden.childrenCount).to.be.eq(2)

        // Try get an unknown group
        try {
            collection.getGroupByName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The group name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(collection.getGroupByWmsName('datalayers')).to.be.deep.eq(transports)
        expect(collection.getGroupByWmsName('Bus')).to.be.deep.eq(bus)
        expect(collection.getGroupByWmsName('Hidden')).to.be.deep.eq(hidden)

        // Try get an unknown group
        try {
            collection.getGroupByWmsName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The group WMS Name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(collection.getLayerOrGroupByName('bus_stops')).to.be.deep.eq(busStops)
        expect(collection.getLayerOrGroupByName('donnes_sociodemo_sous_quartiers')).to.be.deep.eq(donneesSocio)
        expect(collection.getLayerOrGroupByName('SousQuartiers')).to.be.deep.eq(sousquartiers)
        expect(collection.getLayerOrGroupByName('osm-mapnik')).to.be.deep.eq(osm)
        expect(collection.getLayerOrGroupByName('datalayers')).to.be.deep.eq(transports)
        expect(collection.getLayerOrGroupByName('Bus')).to.be.deep.eq(bus)
        expect(collection.getLayerOrGroupByName('Hidden')).to.be.deep.eq(hidden)

        // Try get an unknown layer or group
        try {
            collection.getLayerOrGroupByName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }

        expect(collection.getLayerOrGroupByWmsName('bus_stops')).to.be.deep.eq(busStops)
        expect(collection.getLayerOrGroupByWmsName('donnes_sociodemo_sous_quartiers')).to.be.deep.eq(donneesSocio)
        expect(collection.getLayerOrGroupByWmsName('SousQuartiers')).to.be.deep.eq(sousquartiers)
        expect(collection.getLayerOrGroupByWmsName('osm-mapnik')).to.be.deep.eq(osm)
        expect(collection.getLayerOrGroupByWmsName('datalayers')).to.be.deep.eq(transports)
        expect(collection.getLayerOrGroupByWmsName('Bus')).to.be.deep.eq(bus)
        expect(collection.getLayerOrGroupByWmsName('Hidden')).to.be.deep.eq(hidden)

        // Try get an unknown layer or group
        try {
            collection.getLayerOrGroupByWmsName('sous-quartiers')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The WMS Name `sous-quartiers` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
    })

    it('Checked & visibility', function () {
        const collection = getLayersAndGroupsCollection('montpellier');

        let collectionLayerVisibilityChangedEvt = [];
        let collectionGroupVisibilityChangedEvt = [];
        collection.addListener(evt => {
            collectionLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        collection.addListener(evt => {
            collectionGroupVisibilityChangedEvt.push(evt)
        }, 'group.visibility.changed');

        const sousquartiers = collection.getLayerByName('SousQuartiers')
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)

        expect(sousquartiers.isSpatial).to.be.true
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
        expect(collectionLayerVisibilityChangedEvt).to.have.length(1)
        expect(collectionLayerVisibilityChangedEvt[0]).to.be.deep.equal(sousquartiersVisibilityChangedEvt)
        expect(collectionGroupVisibilityChangedEvt).to.have.length(0)

        // Reset
        sousquartiersVisibilityChangedEvt = null;
        collectionLayerVisibilityChangedEvt = [];
        // Set same value
        sousquartiers.checked = true;
        // Nothing changed
        expect(sousquartiersVisibilityChangedEvt).to.be.null
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)

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
        expect(collectionLayerVisibilityChangedEvt).to.have.length(1)
        expect(collectionLayerVisibilityChangedEvt[0]).to.be.deep.equal(sousquartiersVisibilityChangedEvt)
        expect(collectionGroupVisibilityChangedEvt).to.have.length(0)

        // Reset
        sousquartiersVisibilityChangedEvt = null;
        collectionLayerVisibilityChangedEvt = [];

        // Get not spatial vector layer
        const donneesSocio = collection.getLayerByName('donnes_sociodemo_sous_quartiers')
        expect(donneesSocio).to.be.instanceOf(LayerVectorState)

        expect(donneesSocio.isSpatial).to.be.false
        expect(donneesSocio.checked).to.be.false
        expect(donneesSocio.visibility).to.be.false

        // Try to checked not spatial vector layer
        donneesSocio.checked = true;
        // not spatial vector layer checked changed but nothing else
        expect(donneesSocio.checked).to.be.true
        expect(donneesSocio.visibility).to.be.false
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
        // Reset
        donneesSocio.checked = false;
        expect(donneesSocio.checked).to.be.false
        expect(donneesSocio.visibility).to.be.false
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)

        // Test through groups
        const transports = collection.getGroupByName('datalayers');
        expect(transports).to.be.instanceOf(LayerGroupState)

        expect(transports.checked).to.be.true
        expect(transports.visibility).to.be.true

        let transportsLayerVisibilityChangedEvt = [];
        let transportsGroupVisibilityChangedEvt = [];
        transports.addListener(evt => {
            transportsLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        transports.addListener(evt => {
            transportsGroupVisibilityChangedEvt.push(evt)
        }, 'group.visibility.changed');

        const tramGroup = collection.getGroupByName('Tramway')
        expect(tramGroup).to.be.instanceOf(LayerGroupState)

        expect(tramGroup.checked).to.be.true
        expect(tramGroup.visibility).to.be.true

        let tramGroupLayerVisibilityChangedEvt = [];
        let tramGroupGroupVisibilityChangedEvt = null;
        tramGroup.addListener(evt => {
            tramGroupLayerVisibilityChangedEvt.push(evt)
        }, 'layer.visibility.changed');
        tramGroup.addListener(evt => {
            tramGroupGroupVisibilityChangedEvt = evt
        }, 'group.visibility.changed');

        const tramStopWork = collection.getLayerByName('tram_stop_work')
        expect(tramStopWork).to.be.instanceOf(LayerVectorState)

        expect(tramStopWork.isSpatial).to.be.false
        expect(tramStopWork.checked).to.be.false
        expect(tramStopWork.visibility).to.be.false

        const tramway = collection.getLayerByName('tramway')
        expect(tramway).to.be.instanceOf(LayerVectorState)

        expect(tramway.isSpatial).to.be.true
        expect(tramway.checked).to.be.true
        expect(tramway.visibility).to.be.true

        let tramwayLayerVisibilityChangedEvt = null;
        tramway.addListener(evt => {
            tramwayLayerVisibilityChangedEvt = evt
        }, 'layer.visibility.changed');

        // Set all in transports not visible
        transports.checked = false
        // Events dispatched
        expect(transportsGroupVisibilityChangedEvt).to.have.length(4)
        expect(transportsGroupVisibilityChangedEvt[0].name).to.be.eq('Buildings')
        expect(transportsGroupVisibilityChangedEvt[1].name).to.be.eq('Tramway')
        expect(transportsGroupVisibilityChangedEvt[2].name).to.be.eq('Bus')
        expect(transportsGroupVisibilityChangedEvt[3].name).to.be.eq('datalayers')
        expect(transportsLayerVisibilityChangedEvt).to.have.length(3)
        expect(transportsLayerVisibilityChangedEvt[0].name).to.be.eq('tramstop')
        expect(transportsLayerVisibilityChangedEvt[1].name).to.be.eq('tramway')
        expect(transportsLayerVisibilityChangedEvt[2].name).to.be.eq('publicbuildings')
        expect(tramGroupGroupVisibilityChangedEvt).to.not.be.null
        expect(tramGroupGroupVisibilityChangedEvt.name).to.be.eq('Tramway')
        expect(tramGroupGroupVisibilityChangedEvt.visibility).to.be.false
        expect(tramGroupLayerVisibilityChangedEvt).to.have.length(2)
        expect(tramGroupLayerVisibilityChangedEvt[0].name).to.be.eq('tramstop')
        expect(tramGroupLayerVisibilityChangedEvt[1].name).to.be.eq('tramway')
        expect(tramwayLayerVisibilityChangedEvt).to.not.be.null
        expect(tramwayLayerVisibilityChangedEvt.name).to.be.eq('tramway')
        expect(tramwayLayerVisibilityChangedEvt.visibility).to.be.false
        // Visibility has changed not all checked
        expect(transports.checked).to.be.false
        expect(transports.visibility).to.be.false
        expect(tramGroup.checked).to.be.true
        expect(tramGroup.visibility).to.be.false
        expect(tramStopWork.checked).to.be.false
        expect(tramStopWork.visibility).to.be.false
        expect(tramway.checked).to.be.true
        expect(tramway.visibility).to.be.false
        // Events dispatched at collection level
        expect(collectionGroupVisibilityChangedEvt).to.have.length(4)
        expect(collectionGroupVisibilityChangedEvt[0].name).to.be.eq('Buildings')
        expect(collectionGroupVisibilityChangedEvt[1].name).to.be.eq('Tramway')
        expect(collectionGroupVisibilityChangedEvt[2].name).to.be.eq('Bus')
        expect(collectionGroupVisibilityChangedEvt[3].name).to.be.eq('datalayers')
        expect(collectionLayerVisibilityChangedEvt).to.have.length(3)
        expect(collectionLayerVisibilityChangedEvt[0].name).to.be.eq('tramstop')
        expect(collectionLayerVisibilityChangedEvt[1].name).to.be.eq('tramway')
        expect(collectionLayerVisibilityChangedEvt[2].name).to.be.eq('publicbuildings')

        //Reset
        collectionLayerVisibilityChangedEvt = [];
        collectionGroupVisibilityChangedEvt = [];
        transportsLayerVisibilityChangedEvt = [];
        transportsGroupVisibilityChangedEvt = [];
        tramGroupLayerVisibilityChangedEvt = [];
        tramGroupGroupVisibilityChangedEvt = null;
        tramwayLayerVisibilityChangedEvt = null;

        // Set tramway layer checked to false - visibilities are not changed
        tramway.checked = false
        // No Events dispatched
        expect(collectionGroupVisibilityChangedEvt).to.have.length(0)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
        expect(transportsGroupVisibilityChangedEvt).to.have.length(0)
        expect(transportsLayerVisibilityChangedEvt).to.have.length(0)
        expect(tramGroupGroupVisibilityChangedEvt).to.be.null
        expect(tramGroupLayerVisibilityChangedEvt).to.have.length(0)
        expect(tramwayLayerVisibilityChangedEvt).to.be.null
        // Only tramway checked changed
        expect(transports.checked).to.be.false
        expect(transports.visibility).to.be.false
        expect(tramGroup.checked).to.be.true
        expect(tramGroup.visibility).to.be.false
        expect(tramStopWork.checked).to.be.false
        expect(tramStopWork.visibility).to.be.false
        expect(tramway.checked).to.be.false
        expect(tramway.visibility).to.be.false

        // Set tram stop work layer (not spatial) checked to false - visibilities are not changed
        tramStopWork.checked = true
        // No Events dispatched
        expect(collectionGroupVisibilityChangedEvt).to.have.length(0)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
        expect(transportsGroupVisibilityChangedEvt).to.have.length(0)
        expect(transportsLayerVisibilityChangedEvt).to.have.length(0)
        expect(tramGroupGroupVisibilityChangedEvt).to.be.null
        expect(tramGroupLayerVisibilityChangedEvt).to.have.length(0)
        expect(tramwayLayerVisibilityChangedEvt).to.be.null
        // Only tramway checked changed
        expect(transports.checked).to.be.false
        expect(transports.visibility).to.be.false
        expect(tramGroup.checked).to.be.true
        expect(tramGroup.visibility).to.be.false
        expect(tramStopWork.checked).to.be.true
        expect(tramStopWork.visibility).to.be.false
        expect(tramway.checked).to.be.false
        expect(tramway.visibility).to.be.false
        // Reset
        tramStopWork.checked = false
        // No Events dispatched
        expect(collectionGroupVisibilityChangedEvt).to.have.length(0)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
        expect(transportsGroupVisibilityChangedEvt).to.have.length(0)
        expect(transportsLayerVisibilityChangedEvt).to.have.length(0)
        expect(tramGroupGroupVisibilityChangedEvt).to.be.null
        expect(tramGroupLayerVisibilityChangedEvt).to.have.length(0)
        expect(tramwayLayerVisibilityChangedEvt).to.be.null
        // Only tramway checked changed
        expect(transports.checked).to.be.false
        expect(transports.visibility).to.be.false
        expect(tramGroup.checked).to.be.true
        expect(tramGroup.visibility).to.be.false
        expect(tramStopWork.checked).to.be.false
        expect(tramStopWork.visibility).to.be.false
        expect(tramway.checked).to.be.false
        expect(tramway.visibility).to.be.false

        // Set tramway layer checked to true - visibilities are changed
        tramway.checked = true
        // Events dispatched
        expect(transportsGroupVisibilityChangedEvt).to.have.length(4)
        expect(transportsGroupVisibilityChangedEvt[0].name).to.be.eq('Buildings')
        expect(transportsGroupVisibilityChangedEvt[1].name).to.be.eq('Tramway')
        expect(transportsGroupVisibilityChangedEvt[2].name).to.be.eq('Bus')
        expect(transportsGroupVisibilityChangedEvt[3].name).to.be.eq('datalayers')
        expect(transportsLayerVisibilityChangedEvt).to.have.length(3)
        expect(transportsLayerVisibilityChangedEvt[0].name).to.be.eq('tramstop')
        expect(transportsLayerVisibilityChangedEvt[1].name).to.be.eq('tramway')
        expect(transportsLayerVisibilityChangedEvt[2].name).to.be.eq('publicbuildings')
        expect(tramGroupGroupVisibilityChangedEvt).to.not.be.null
        expect(tramGroupGroupVisibilityChangedEvt.name).to.be.eq('Tramway')
        expect(tramGroupGroupVisibilityChangedEvt.visibility).to.be.true
        expect(tramGroupLayerVisibilityChangedEvt).to.have.length(2)
        expect(tramGroupLayerVisibilityChangedEvt[0].name).to.be.eq('tramstop')
        expect(tramGroupLayerVisibilityChangedEvt[1].name).to.be.eq('tramway')
        expect(tramwayLayerVisibilityChangedEvt).to.not.be.null
        expect(tramwayLayerVisibilityChangedEvt.name).to.be.eq('tramway')
        expect(tramwayLayerVisibilityChangedEvt.visibility).to.be.true
        // Visibility has changed
        expect(transports.checked).to.be.true
        expect(transports.visibility).to.be.true
        expect(tramGroup.checked).to.be.true
        expect(tramGroup.visibility).to.be.true
        expect(tramStopWork.checked).to.be.false
        expect(tramStopWork.visibility).to.be.false
        expect(tramway.checked).to.be.true
        expect(tramway.visibility).to.be.true
        // Events dispatched at collection level
        expect(collectionGroupVisibilityChangedEvt).to.have.length(4)
        expect(collectionGroupVisibilityChangedEvt[0].name).to.be.eq('Buildings')
        expect(collectionGroupVisibilityChangedEvt[1].name).to.be.eq('Tramway')
        expect(collectionGroupVisibilityChangedEvt[2].name).to.be.eq('Bus')
        expect(collectionGroupVisibilityChangedEvt[3].name).to.be.eq('datalayers')
        expect(collectionLayerVisibilityChangedEvt).to.have.length(3)
        expect(collectionLayerVisibilityChangedEvt[0].name).to.be.eq('tramstop')
        expect(collectionLayerVisibilityChangedEvt[1].name).to.be.eq('tramway')
        expect(collectionLayerVisibilityChangedEvt[2].name).to.be.eq('publicbuildings')
    })

    it('Empty group as group', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/display-in-legend-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/display-in-legend-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        // `group-without-children` has a config
        const layers = new LayersConfig(config.layers);
        expect(layers.layerNames).to.be.an('array').that.have.length(12).that.includes(
            "group-without-children"
        )

        let invalid = [];
        const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

        expect(invalid).to.have.length(0);
        expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)

        // `group-without-children` has a layerTree config and it is a layer not a group
        expect(rootCfg.childrenCount).to.be.eq(4)
        expect(rootCfg.findTreeLayerConfigNames()).to.be.an('array').that.have.length(8).that.includes(
            "group-without-children"
        )

        const layersOrder = buildLayersOrder(config, rootCfg);

        const options = new OptionsConfig(config.options);
        const collection = new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);

        // `group-without-children` has no state
        expect(collection.groupNames).to.be.an('array').that.have.ordered.members([
            "PostgreSQL",
            "Shapefiles",
            "POIs",
            "baselayers",
        ])

        const root = collection.root;
        expect(root).to.be.instanceOf(LayerGroupState)
        expect(root.childrenCount).to.be.eq(3)
        expect(root.children).to.have.length(3)

        // `group-without-children` is not a child of root layer state
        expect(root.children[0].type).to.be.eq('group')
        expect(root.children[0].name).to.be.eq('PostgreSQL')
        expect(root.children[1].type).to.be.eq('group')
        expect(root.children[1].name).to.be.eq('Shapefiles')
        expect(root.children[2].type).to.be.eq('group')
        expect(root.children[2].name).to.be.eq('baselayers')

        // try to get `group-without-children`
        try {
            collection.getGroupByName('group-without-children')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The group name `group-without-children` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
        try {
            collection.getLayerOrGroupByName('group-without-children')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The name `group-without-children` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
    })

    it('Display in legend', function () {
        const collection = getLayersAndGroupsCollection('display-in-legend');

        const shapefilesGroup = collection.getGroupByName('Shapefiles')
        expect(shapefilesGroup).to.be.instanceOf(LayerGroupState)

        expect(shapefilesGroup.checked).to.be.true
        expect(shapefilesGroup.visibility).to.be.true
        expect(shapefilesGroup.displayInLegend).to.be.true

        const polygons = shapefilesGroup.children[1]
        expect(polygons.name).to.be.eq('polygons')
        expect(polygons).to.be.instanceOf(LayerVectorState)

        expect(polygons.isSpatial).to.be.true
        expect(polygons.checked).to.be.true
        expect(polygons.visibility).to.be.true
        expect(polygons.displayInLegend).to.be.false

        // Hide Shapefiles group
        shapefilesGroup.checked = false;
        expect(shapefilesGroup.checked).to.be.false
        expect(shapefilesGroup.visibility).to.be.false
        // Polygons which is not display in legend is not affected
        expect(polygons.checked).to.be.true
        expect(polygons.visibility).to.be.true

        const poisGroup = shapefilesGroup.children[0]
        expect(poisGroup.name).to.be.eq('POIs')
        expect(poisGroup).to.be.instanceOf(LayerGroupState)

        expect(poisGroup.checked).to.be.true
        expect(poisGroup.visibility).to.be.false
        expect(poisGroup.displayInLegend).to.be.true

        const townhalls = poisGroup.children[0]
        expect(townhalls.name).to.be.eq('townhalls_EPSG2154')
        expect(townhalls).to.be.instanceOf(LayerVectorState)

        expect(townhalls.isSpatial).to.be.true
        expect(townhalls.checked).to.be.false
        expect(townhalls.visibility).to.be.false
        expect(townhalls.displayInLegend).to.be.true

        // Display townhalls
        townhalls.checked = true;
        expect(townhalls.checked).to.be.true
        expect(townhalls.visibility).to.be.true
        // Parent groups will be checked
        expect(poisGroup.checked).to.be.true
        expect(poisGroup.visibility).to.be.true
        expect(shapefilesGroup.checked).to.be.true
        expect(shapefilesGroup.visibility).to.be.true
        // Nothing change for not display in legend layer
        expect(polygons.checked).to.be.true
        expect(polygons.visibility).to.be.true

        // Hide polygons
        polygons.checked = false
        expect(polygons.checked).to.be.false
        expect(polygons.visibility).to.be.false
        expect(shapefilesGroup.checked).to.be.true
        expect(shapefilesGroup.visibility).to.be.true
        expect(poisGroup.checked).to.be.true
        expect(poisGroup.visibility).to.be.true
        expect(townhalls.checked).to.be.true
        expect(townhalls.visibility).to.be.true

        // Hide Shapefiles group
        shapefilesGroup.checked = false
        expect(shapefilesGroup.checked).to.be.false
        expect(shapefilesGroup.visibility).to.be.false
        // Children are hidden
        expect(poisGroup.checked).to.be.true
        expect(poisGroup.visibility).to.be.false
        expect(townhalls.checked).to.be.true
        expect(townhalls.visibility).to.be.false
        // Nothing change for not display in legend layer
        expect(polygons.checked).to.be.false
        expect(polygons.visibility).to.be.false

        // Display Polygons
        polygons.checked = true
        expect(polygons.checked).to.be.true
        expect(polygons.visibility).to.be.true
        // Nothing change for parent group
        expect(shapefilesGroup.checked).to.be.false
        expect(shapefilesGroup.visibility).to.be.false
        // Nothing change for others
        expect(poisGroup.checked).to.be.true
        expect(poisGroup.visibility).to.be.false
        expect(townhalls.checked).to.be.true
        expect(townhalls.visibility).to.be.false
    })

    it('Opacity', function () {
        const collection = getLayersAndGroupsCollection('montpellier');

        let collectionLayerOpacityChangedEvt = [];
        let collectionGroupOpacityChangedEvt = [];
        collection.addListener(evt => {
            collectionLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        collection.addListener(evt => {
            collectionGroupOpacityChangedEvt.push(evt)
        }, 'group.opacity.changed');

        const sousquartiers = collection.getLayerByName('SousQuartiers')
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)
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
        expect(collectionLayerOpacityChangedEvt).to.have.length(1)
        expect(collectionLayerOpacityChangedEvt[0]).to.be.deep.equal(sousquartiersOpacityChangedEvt)
        expect(collectionGroupOpacityChangedEvt).to.have.length(0)

        //Reset
        collectionLayerOpacityChangedEvt = [];
        collectionGroupOpacityChangedEvt = [];
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
        expect(collectionLayerOpacityChangedEvt).to.have.length(0)
        expect(collectionGroupOpacityChangedEvt).to.have.length(0)

        // Set to the same value
        sousquartiers.opacity = '0.8';
        // Nothing change
        expect(sousquartiersOpacityChangedEvt).to.be.null
        expect(sousquartiers.opacity).to.be.eq(0.8)
        expect(collectionLayerOpacityChangedEvt).to.have.length(0)
        expect(collectionGroupOpacityChangedEvt).to.have.length(0)

        // Test through groups
        const transports = collection.getGroupByName('datalayers');
        expect(transports).to.be.instanceOf(LayerGroupState)

        let transportsLayerOpacityChangedEvt = [];
        let transportsGroupOpacityChangedEvt = [];
        transports.addListener(evt => {
            transportsLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        transports.addListener(evt => {
            transportsGroupOpacityChangedEvt.push(evt)
        }, 'group.opacity.changed');

        const tramGroup = collection.getGroupByName('Tramway')
        expect(tramGroup).to.be.instanceOf(LayerGroupState)

        let tramGroupLayerOpacityChangedEvt = [];
        let tramGroupGroupOpacityChangedEvt = null;
        tramGroup.addListener(evt => {
            tramGroupLayerOpacityChangedEvt.push(evt)
        }, 'layer.opacity.changed');
        tramGroup.addListener(evt => {
            tramGroupGroupOpacityChangedEvt = evt
        }, 'group.opacity.changed');

        const tramway = collection.getLayerByName('tramway')
        expect(tramway).to.be.instanceOf(LayerVectorState)

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
        expect(collectionLayerOpacityChangedEvt).to.have.length(1)
        expect(collectionLayerOpacityChangedEvt[0]).to.be.deep.equal(tramwayOpacityChangedEvt)
        expect(collectionGroupOpacityChangedEvt).to.have.length(0)

        //Reset
        collectionLayerOpacityChangedEvt = [];
        collectionGroupOpacityChangedEvt = [];
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
        expect(collectionLayerOpacityChangedEvt).to.have.length(0)
        expect(collectionGroupOpacityChangedEvt).to.have.length(1)
        expect(collectionGroupOpacityChangedEvt[0]).to.be.deep.equal(tramGroupGroupOpacityChangedEvt)
    })

    it('WMS selected styles', function () {
        const collection = getLayersAndGroupsCollection('montpellier');

        const transports = collection.getGroupByName('datalayers');
        expect(transports).to.be.instanceOf(LayerGroupState)

        const tramGroup = collection.getGroupByName('Tramway')
        expect(tramGroup).to.be.instanceOf(LayerGroupState)

        const tramway = collection.getLayerByName('tramway')
        expect(tramway).to.be.instanceOf(LayerVectorState)
        expect(tramway.name).to.be.eq('tramway')
        expect(tramway.wmsSelectedStyleName).to.be.eq('black')
        expect(tramway.wmsStyles).to.be.an('array').that.be.lengthOf(2)
        expect(tramway.wmsStyles[0].wmsName).to.be.eq('black')
        expect(tramway.wmsStyles[1].wmsName).to.be.eq('colored')

        // Apply a known style name
        tramway.wmsSelectedStyleName = 'colored'
        expect(tramway.wmsSelectedStyleName).to.be.eq('colored')

        // listen to layer style change
        let tramwayStyleChangedEvt = null;
        let collectionStyleChangedEvt = null;
        tramway.addListener(evt => {
            tramwayStyleChangedEvt = evt
        }, 'layer.style.changed');
        collection.addListener(evt => {
            collectionStyleChangedEvt = evt
        }, 'layer.style.changed');

        // Apply a default style name
        tramway.wmsSelectedStyleName = ''
        expect(tramway.wmsSelectedStyleName).to.be.eq('black')
        // Event dispatched
        expect(tramwayStyleChangedEvt).to.not.be.null
        expect(tramwayStyleChangedEvt.name).to.be.eq('tramway')
        expect(tramwayStyleChangedEvt.style).to.be.eq('black')
        expect(collectionStyleChangedEvt).to.not.be.null
        expect(collectionStyleChangedEvt).to.be.deep.equal(tramwayStyleChangedEvt)

        //Reset
        tramwayStyleChangedEvt = null;
        collectionStyleChangedEvt = null;

        // Apply same style
        tramway.wmsSelectedStyleName = 'black'
        // No event dispatched
        expect(tramwayStyleChangedEvt).to.be.null
        expect(collectionStyleChangedEvt).to.be.null

        // Try to apply an unknown style name
        try {
            tramway.wmsSelectedStyleName = 'foobar'
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot assign an unknown WMS style name! `foobar` is not in the layer `tramway` WMS styles!')
            expect(error).to.be.instanceOf(TypeError)
        }
        // No event dispatched
        expect(tramwayStyleChangedEvt).to.be.null
        expect(collectionStyleChangedEvt).to.be.null
    })

    it('Legend ON/OFF', function () {
        const collection = getLayersAndGroupsCollection('montpellier');

        const sousquartiers = collection.getLayerByName('SousQuartiers')
        expect(sousquartiers).to.be.instanceOf(LayerVectorState)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.wmsSelectedStyleName).to.be.eq('default')
        expect(sousquartiers.wmsParameters).to.be.an('object').that.deep.equal({
          'LAYERS': 'SousQuartiers',
          'STYLES': 'default',
          'FORMAT': 'image/png',
          'DPI': 96
        })
        expect(sousquartiers.symbology).to.be.null

        let collectionLayerSymbologyChangedEvt = null;
        let sousquartiersSymbologyChangedEvt = null;

        collection.addListener(evt => {
            collectionLayerSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');
        sousquartiers.addListener(evt => {
            sousquartiersSymbologyChangedEvt = evt
        }, 'layer.symbology.changed');

        const legend = JSON.parse(readFileSync('./tests/js-units/data/montpellier-legend.json', 'utf8'));
        expect(legend).to.not.be.undefined

        // Set symbology
        sousquartiers.symbology = legend.nodes[1]
        expect(sousquartiers.symbology).to.be.instanceOf(LayerIconSymbology)
        // Event dispatched
        expect(sousquartiersSymbologyChangedEvt).to.not.be.null
        expect(sousquartiersSymbologyChangedEvt.name).to.be.eq('SousQuartiers')
        expect(collectionLayerSymbologyChangedEvt).to.not.be.null
        expect(collectionLayerSymbologyChangedEvt.name).to.be.eq('SousQuartiers')

        // Reset
        collectionLayerSymbologyChangedEvt = null;
        sousquartiersSymbologyChangedEvt = null;

        const quartiers = collection.getLayerByName('Quartiers')
        expect(quartiers).to.be.instanceOf(LayerVectorState)
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
        expect(collectionLayerSymbologyChangedEvt).to.not.be.null
        expect(collectionLayerSymbologyChangedEvt.name).to.be.eq('Quartiers')

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
        let collectionLayerSymbolCheckedChangedEvt = [];
        let collectionLayerVisibilityChangedEvt = [];
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
        collection.addListener(evt => {
            collectionLayerSymbolCheckedChangedEvt.push(evt)
        }, 'layer.symbol.checked.changed');
        collection.addListener(evt => {
            collectionLayerVisibilityChangedEvt.push(evt)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(1)
        expect(collectionLayerSymbolCheckedChangedEvt[0]).to.be.deep.eq(layerSymbolCheckedChangedEvt[0])
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)

        // Reset
        collectionLayerSymbolCheckedChangedEvt = [];
        collectionLayerVisibilityChangedEvt = [];
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(1)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(2)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(3)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(4)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(5)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(6)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(7)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(0)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(8)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(1)
        expect(collectionLayerVisibilityChangedEvt).to.be.deep.eq(layerVisibilityChangedEvt)
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
        expect(collectionLayerSymbolCheckedChangedEvt).to.have.length(9)
        expect(collectionLayerSymbolCheckedChangedEvt).to.be.deep.eq(layerSymbolCheckedChangedEvt)
        expect(collectionLayerVisibilityChangedEvt).to.have.length(2)
        expect(collectionLayerVisibilityChangedEvt).to.be.deep.eq(layerVisibilityChangedEvt)
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
})
