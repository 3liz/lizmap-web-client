import { expect } from 'chai';

import { readFileSync } from 'fs';

import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { buildLayersOrder } from 'assets/src/modules/config/LayersOrder.js';
import { LayersAndGroupsCollection } from 'assets/src/modules/state/Layer.js';
import { base64svg, base64svgOlLayer, base64svgRasterLayer } from 'assets/src/modules/state/SymbologyIcons.js';

import { MapGroupState, MapRootState } from 'assets/src/modules/state/MapLayer.js';
import { ExternalMapGroupState, OlMapLayerState } from 'assets/src/modules/state/ExternalMapLayer.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';

import { default as ol } from 'assets/src/dependencies/ol.js';

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
	const capabilities = JSON.parse(readFileSync('./tests/js-units/data/' + name + '-capabilities.json', 'utf8'));
	expect(capabilities).to.not.be.undefined
	expect(capabilities.Capability).to.not.be.undefined
	const config = JSON.parse(readFileSync('./tests/js-units/data/' + name + '-config.json', 'utf8'));
	expect(config).to.not.be.undefined

	const layers = new LayersConfig(config.layers);

	let invalid = [];
	const rootCfg = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);
	expect(rootCfg).to.be.instanceOf(LayerTreeGroupConfig)
	expect(invalid).to.have.length(0);

	const layersOrder = buildLayersOrder(config, rootCfg);

	const options = new OptionsConfig(config.options);
	const collection = new LayersAndGroupsCollection(rootCfg, layersOrder, options.hideGroupCheckbox);

	const root = new MapRootState(collection.root);
	expect(root).to.be.instanceOf(MapGroupState)
	expect(root).to.be.instanceOf(MapRootState)
	return root;
}

describe('ExternalMapGroupState', function () {
	it('properties', function () {
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');
		expect(extGroup).to.be.instanceOf(ExternalMapGroupState)
		expect(extGroup.type).to.be.eq('ext-group')
		expect(extGroup.level).to.be.eq(1)
		expect(extGroup.name).to.be.eq('test')
		expect(extGroup.wmsName).to.be.null
		expect(extGroup.wmsTitle).to.be.eq('test')
		expect(extGroup.wmsGeographicBoundingBox).to.be.null
		expect(extGroup.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
		expect(extGroup.wmsMinScaleDenominator).to.be.undefined
		expect(extGroup.wmsMaxScaleDenominator).to.be.undefined
		expect(extGroup.checked).to.be.true
		expect(extGroup.visibility).to.be.true
		expect(extGroup.layerConfig).to.be.null
		expect(extGroup.itemState).to.be.null
		expect(extGroup.childrenCount).to.be.eq(0)

		// The external group has been added
		expect(root.childrenCount).to.be.eq(5)
		expect(root.children[0]).to.be.eq(extGroup)
	})

	it('events', function () {
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');
		expect(extGroup.wmsTitle).to.be.eq('test')

		// wmsTitle changed event
		let wmsTitleChangedEvt;
		extGroup.addListener(evt => {
			wmsTitleChangedEvt = evt;
		}, 'ext-group.wmsTitle.changed');

		// Update title
		extGroup.wmsTitle = 'This is an external group'
		expect(extGroup.wmsTitle).to.be.eq('This is an external group')

		// Event dispatched
		expect(wmsTitleChangedEvt).to.not.be.undefined
		expect(wmsTitleChangedEvt.name).to.be.eq('test')
		expect(wmsTitleChangedEvt.wmsTitle).to.be.eq(extGroup.wmsTitle)
	})

	it('addOlLayer', function () {
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');
		expect(extGroup.childrenCount).to.be.eq(0)

		// OL Layer added event
		let olLayerAddedEvt;
		extGroup.addListener(evt => {
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
		expect(olLayerState).to.be.instanceOf(OlMapLayerState)
		expect(olLayerState.type).to.be.eq('ol-layer')
		expect(olLayerState.level).to.be.eq(2)
		expect(olLayerState.name).to.be.eq('wms4326')
		expect(olLayerState.wmsTitle).to.be.eq('wms4326')

		// Added to children
		expect(extGroup.childrenCount).to.be.eq(1)
		expect(extGroup.children[0]).to.be.deep.eq(olLayerState)

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
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');
		expect(extGroup.childrenCount).to.be.eq(0)

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
		expect(olLayerState).to.be.instanceOf(OlMapLayerState)
		expect(olLayerState.type).to.be.eq('ol-layer')
		expect(olLayerState.level).to.be.eq(2)
		expect(olLayerState.name).to.be.eq('wms4326')

		// Added to children
		expect(extGroup.childrenCount).to.be.eq(1)
		expect(extGroup.children[0]).to.be.deep.eq(olLayerState)

		// Try to remove with unknown name
		expect(extGroup.removeOlLayer('unknown')).to.be.undefined

		// No child removed
		expect(extGroup.childrenCount).to.be.eq(1)

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

describe('OlMapLayerState', function () {
	it('properties', function () {
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');

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
		expect(olLayerState).to.be.instanceOf(OlMapLayerState)
		expect(olLayerState.type).to.be.eq('ol-layer')
		expect(olLayerState.level).to.be.eq(2)
		expect(olLayerState.name).to.be.eq('wms4326')
		expect(olLayerState.wmsName).to.be.null
		expect(olLayerState.wmsTitle).to.be.eq('wms4326')
		expect(olLayerState.wmsGeographicBoundingBox).to.be.null
		expect(olLayerState.wmsBoundingBoxes).to.be.an('array').that.have.length(0)
		expect(olLayerState.wmsMinScaleDenominator).to.be.undefined
		expect(olLayerState.wmsMaxScaleDenominator).to.be.undefined
		expect(olLayerState.opacity).to.be.eq(1)
		expect(olLayerState.checked).to.be.true
		expect(olLayerState.visibility).to.be.true
		expect(olLayerState.layerConfig).to.be.null
		expect(olLayerState.itemState).to.be.null
		expect(olLayerState.icon).to.be.eq(base64svg + base64svgOlLayer)
	})

	it('wmsTitle', function () {
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');

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
			properties: {
				wmsTitle: 'This is a custom title'
			}
		});
		const olLayerState = extGroup.addOlLayer('wms4326', olLayer);
		expect(olLayerState).to.be.instanceOf(OlMapLayerState)
		expect(olLayerState.name).to.be.eq('wms4326')
		expect(olLayerState.wmsName).to.be.null
		expect(olLayerState.wmsTitle).to.be.eq('This is a custom title')
	})

	it('events', function () {
		const root = getRootMapGroupState('montpellier');
		expect(root.childrenCount).to.be.eq(4)

		// Create external group
		const extGroup = root.createExternalGroup('test');
		expect(extGroup.wmsTitle).to.be.eq('test')

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
		expect(olLayerState.checked).to.be.true
		expect(olLayerState.visibility).to.be.true
		expect(olLayerState.olLayer.getVisible()).to.be.true
		expect(olLayerState.opacity).to.be.eq(1)
		expect(olLayerState.olLayer.getOpacity()).to.be.eq(1)
		expect(olLayerState.wmsTitle).to.be.eq('wms4326')
		expect(olLayerState.icon).to.be.eq(base64svg + base64svgOlLayer)

		// wmsTitle and icon changed event
		let visibilityChangedEvt;
		let opacityChangedEvt;
		let wmsTitleChangedEvt;
		let iconChangedEvt;
		extGroup.addListener(evt => {
			visibilityChangedEvt = evt;
		}, 'ol-layer.visibility.changed');
		extGroup.addListener(evt => {
			opacityChangedEvt = evt;
		}, 'ol-layer.opacity.changed');
		extGroup.addListener(evt => {
			wmsTitleChangedEvt = evt;
		}, 'ol-layer.wmsTitle.changed');
		extGroup.addListener(evt => {
			iconChangedEvt = evt;
		}, 'ol-layer.icon.changed');

		// Update visibility
		olLayerState.checked = !olLayerState.checked;
		expect(olLayerState.checked).to.be.false
		expect(olLayerState.visibility).to.be.false
		expect(olLayerState.olLayer.getVisible()).to.be.false

		// Event dispatched
		expect(visibilityChangedEvt).to.not.be.undefined
		expect(visibilityChangedEvt.name).to.be.eq('wms4326')
		expect(visibilityChangedEvt.visibility).to.be.false

		// Update opacity
		olLayerState.opacity = 0.5
		expect(olLayerState.opacity).to.be.eq(0.5)
		expect(olLayerState.olLayer.getOpacity()).to.be.eq(0.5)

		// Event dispatched
		expect(opacityChangedEvt).to.not.be.undefined
		expect(opacityChangedEvt.name).to.be.eq('wms4326')
		expect(opacityChangedEvt.opacity).to.be.eq(0.5)

		// Update title
		olLayerState.wmsTitle = 'This is an OpenLayers layer'
		expect(olLayerState.wmsTitle).to.be.eq('This is an OpenLayers layer')

		// Event dispatched
		expect(wmsTitleChangedEvt).to.not.be.undefined
		expect(wmsTitleChangedEvt.name).to.be.eq('wms4326')
		expect(wmsTitleChangedEvt.wmsTitle).to.be.eq(olLayerState.wmsTitle)

		// Update icon
		olLayerState.icon = base64svg + base64svgRasterLayer
		expect(olLayerState.icon).to.be.eq(base64svg + base64svgRasterLayer)

		// Event dispatched
		expect(iconChangedEvt).to.not.be.undefined
		expect(iconChangedEvt.name).to.be.eq('wms4326')
		expect(iconChangedEvt.icon).to.be.eq(olLayerState.icon)

		// Try update bad icon
		try {
			olLayerState.icon = ''
		} catch (error) {
			expect(error.name).to.be.eq('TypeError')
			expect(error.message).to.be.eq("base64icon value does not start with 'data:image/png;base64, ' or 'data:image/svg+xml;base64,'! The value is ''!")
			expect(error).to.be.instanceOf(TypeError)
		}
	})
})
