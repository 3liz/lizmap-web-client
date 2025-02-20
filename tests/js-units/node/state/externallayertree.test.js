import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { MapGroupState, MapRootState } from 'assets/src/modules/state/MapLayer.js';
import { base64svg, base64svgOlLayer, base64svgRasterLayer } from 'assets/src/modules/state/SymbologyIcons.js';

import { LayerTreeGroupState, TreeRootState } from 'assets/src/modules/state/LayerTree.js';
import { ExternalLayerTreeGroupState, OlTreeLayerState } from 'assets/src/modules/state/ExternalLayerTree.js';
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

describe('ExternalLayerTreeGroupState', function () {
    it('properties', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup).to.be.instanceOf(ExternalLayerTreeGroupState)
        expect(extTreeGroup.type).to.be.eq('ext-group')
        expect(extTreeGroup.level).to.be.eq(1)
        expect(extTreeGroup.name).to.be.eq('test')
        expect(extTreeGroup.wmsName).to.be.null
        expect(extTreeGroup.wmsTitle).to.be.eq('test')
        expect(extTreeGroup.wmsGeographicBoundingBox).to.be.null
        expect(extTreeGroup.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(extTreeGroup.wmsMinScaleDenominator).to.be.undefined
        expect(extTreeGroup.wmsMaxScaleDenominator).to.be.undefined
        expect(extTreeGroup.checked).to.be.true
        expect(extTreeGroup.visibility).to.be.true
        expect(extTreeGroup.layerConfig).to.be.null
        expect(extTreeGroup.childrenCount).to.be.eq(0)
        expect(extTreeGroup.mapItemState).to.be.deep.eq(extGroup)
    })

    it('events', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        mapRoot.createExternalGroup('test');
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup.wmsTitle).to.be.eq('test')

        // wmsTitle changed event
        let wmsTitleChangedEvt;
        extTreeGroup.addListener(evt => {
            wmsTitleChangedEvt = evt;
        }, 'ext-group.wmsTitle.changed');

        // Update title
        extTreeGroup.wmsTitle = 'This is an external group'
        expect(extTreeGroup.wmsTitle).to.be.eq('This is an external group')

        // Event dispatched
        expect(wmsTitleChangedEvt).to.not.be.undefined
        expect(wmsTitleChangedEvt.name).to.be.eq('test')
        expect(wmsTitleChangedEvt.wmsTitle).to.be.eq(extTreeGroup.wmsTitle)
    })

    it('addOlLayer', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup.wmsTitle).to.be.eq('test')

        // wmsTitle changed event
        let olLayerAddedEvt;
        extTreeGroup.addListener(evt => {
            olLayerAddedEvt = evt;
        }, 'ol-layer.added');

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

        // Added to children
        expect(extGroup.childrenCount).to.be.eq(1)
        expect(extTreeGroup.childrenCount).to.be.eq(1)

        const olTreeLayer = extTreeGroup.children[0];
        expect(olTreeLayer).to.be.instanceOf(OlTreeLayerState)
        expect(olTreeLayer.type).to.be.eq('ol-layer')
        expect(olTreeLayer.level).to.be.eq(2)
        expect(olTreeLayer.name).to.be.eq('wms4326')
        expect(olTreeLayer.mapItemState).to.be.deep.eq(olLayerState)

        // Event dispatched
        expect(olLayerAddedEvt).to.not.be.undefined
        expect(olLayerAddedEvt.name).to.be.eq('test')
        expect(olLayerAddedEvt.childName).to.be.eq('wms4326')
        expect(olLayerAddedEvt.childrenCount).to.be.eq(1)

        // Try to create with the same name
        try {
            extGroup.addOlLayer('wms4326', olLayer);
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer name `wms4326` is already used by a child!')
            expect(error).to.be.instanceOf(RangeError)
        }
        // No child added
        expect(extGroup.childrenCount).to.be.eq(1)
    })

    it('removeOlLayer', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup.wmsTitle).to.be.eq('test')

        // wmsTitle changed event
        let olLayerRemovedEvt;
        extTreeGroup.addListener(evt => {
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

        // Added to children
        expect(extGroup.childrenCount).to.be.eq(1)
        expect(extTreeGroup.childrenCount).to.be.eq(1)

        const olTreeLayer = extTreeGroup.children[0];
        expect(olTreeLayer).to.be.instanceOf(OlTreeLayerState)
        expect(olTreeLayer.type).to.be.eq('ol-layer')
        expect(olTreeLayer.level).to.be.eq(2)
        expect(olTreeLayer.name).to.be.eq('wms4326')
        expect(olTreeLayer.mapItemState).to.be.deep.eq(olLayerState)

        // Remove child
        expect(extGroup.removeOlLayer('wms4326')).to.be.deep.eq(olLayerState)
        expect(extGroup.childrenCount).to.be.eq(0)
        expect(extTreeGroup.childrenCount).to.be.eq(0)

        // Event dispatched
        expect(olLayerRemovedEvt).to.not.be.undefined
        expect(olLayerRemovedEvt.name).to.be.eq('test')
        expect(olLayerRemovedEvt.childName).to.be.eq('wms4326')
        expect(olLayerRemovedEvt.childrenCount).to.be.eq(0)
    })
})

describe('OlTreeLayerState', function () {
    it('properties', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup.type).to.be.eq('ext-group')
        expect(extTreeGroup.wmsTitle).to.be.eq('test')
        expect(extTreeGroup.childrenCount).to.be.eq(0)
        expect(extTreeGroup.mapItemState).to.be.deep.eq(extGroup)

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
        expect(extGroup.childrenCount).to.be.eq(1)
        expect(extTreeGroup.childrenCount).to.be.eq(1)

        const olTreeLayer = extTreeGroup.children[0];
        expect(olTreeLayer).to.be.instanceOf(OlTreeLayerState)
        expect(olTreeLayer.type).to.be.eq('ol-layer')
        expect(olTreeLayer.level).to.be.eq(2)
        expect(olTreeLayer.name).to.be.eq('wms4326')
        expect(olTreeLayer.wmsName).to.be.null
        expect(olTreeLayer.wmsTitle).to.be.eq('wms4326')
        expect(olTreeLayer.wmsGeographicBoundingBox).to.be.null
        expect(olTreeLayer.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
        expect(olTreeLayer.wmsMinScaleDenominator).to.be.undefined
        expect(olTreeLayer.wmsMaxScaleDenominator).to.be.undefined
        expect(olTreeLayer.opacity).to.be.eq(1)
        expect(olTreeLayer.checked).to.be.true
        expect(olTreeLayer.visibility).to.be.true
        expect(olTreeLayer.layerConfig).to.be.null
        expect(olTreeLayer.icon).to.be.eq(base64svg + base64svgOlLayer)
        expect(olTreeLayer.mapItemState).to.be.deep.eq(olLayerState)
    })

    it('events', function () {
        const root = getRootLayerTreeGroupState('montpellier')
        expect(root.childrenCount).to.be.eq(4)

        const mapRoot = root.mapItemState;
        expect(mapRoot).to.be.instanceOf(MapRootState);
        expect(mapRoot.childrenCount).to.be.eq(4)

        // Create external group
        const extGroup = mapRoot.createExternalGroup('test');
        expect(mapRoot.childrenCount).to.be.eq(5)
        expect(root.childrenCount).to.be.eq(5)

        const extTreeGroup = root.children[0]
        expect(extTreeGroup.type).to.be.eq('ext-group')
        expect(extTreeGroup.wmsTitle).to.be.eq('test')

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
        extGroup.addOlLayer('wms4326', olLayer);
        expect(extGroup.childrenCount).to.be.eq(1)
        expect(extTreeGroup.childrenCount).to.be.eq(1)

        const olTreeLayer = extTreeGroup.children[0];
        expect(olTreeLayer.wmsTitle).to.be.eq('wms4326')
        expect(olTreeLayer.checked).to.be.true
        expect(olTreeLayer.visibility).to.be.true
        expect(olTreeLayer.opacity).to.be.eq(1)
        expect(olTreeLayer.icon).to.be.eq(base64svg + base64svgOlLayer)

        // wmsTitle and icon changed event
        let visibilityChangedEvt;
        let opacityChangedEvt;
        let wmsTitleChangedEvt;
        let iconChangedEvt;
        extTreeGroup.addListener(evt => {
            visibilityChangedEvt = evt;
        }, 'ol-layer.visibility.changed');
        extTreeGroup.addListener(evt => {
            opacityChangedEvt = evt;
        }, 'ol-layer.opacity.changed');
        extTreeGroup.addListener(evt => {
            wmsTitleChangedEvt = evt;
        }, 'ol-layer.wmsTitle.changed');
        extTreeGroup.addListener(evt => {
            iconChangedEvt = evt;
        }, 'ol-layer.icon.changed');

        // Update visibility
        olTreeLayer.checked = !olTreeLayer.checked;
        expect(olTreeLayer.checked).to.be.false
        expect(olTreeLayer.visibility).to.be.false

        // Event dispatched
        expect(visibilityChangedEvt).to.not.be.undefined
        expect(visibilityChangedEvt.name).to.be.eq('wms4326')
        expect(visibilityChangedEvt.visibility).to.be.false

        // Update opacity
        olTreeLayer.opacity = 0.5
        expect(olTreeLayer.opacity).to.be.eq(0.5)

        // Event dispatched
        expect(opacityChangedEvt).to.not.be.undefined
        expect(opacityChangedEvt.name).to.be.eq('wms4326')
        expect(opacityChangedEvt.opacity).to.be.eq(0.5)

        // Update title
        olTreeLayer.wmsTitle = 'This is an OpenLayers layer'
        expect(olTreeLayer.wmsTitle).to.be.eq('This is an OpenLayers layer')

        // Event dispatched
        expect(wmsTitleChangedEvt).to.not.be.undefined
        expect(wmsTitleChangedEvt.name).to.be.eq('wms4326')
        expect(wmsTitleChangedEvt.wmsTitle).to.be.eq(olTreeLayer.wmsTitle)

        // Update icon
        olTreeLayer.icon = base64svg + base64svgRasterLayer
        expect(olTreeLayer.icon).to.be.eq(base64svg + base64svgRasterLayer)

        // Event dispatched
        expect(iconChangedEvt).to.not.be.undefined
        expect(iconChangedEvt.name).to.be.eq('wms4326')
        expect(iconChangedEvt.icon).to.be.eq(olTreeLayer.icon)

        // Try update bad icon
        try {
            olTreeLayer.icon = ''
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq("base64icon value does not start with 'data:image/png;base64, ' or 'data:image/svg+xml;base64,'! The value is ''!")
            expect(error).to.be.instanceOf(TypeError)
        }
    })
})
