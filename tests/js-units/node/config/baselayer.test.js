import { expect } from 'chai';

import { readFileSync } from 'fs';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { AttributionConfig } from 'assets/src/modules/config/Attribution.js';
import { LayerConfig, LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';
import { BaseLayerTypes, BaseLayerConfig, EmptyBaseLayerConfig, XyzBaseLayerConfig, BingBaseLayerConfig, WmtsBaseLayerConfig, WmsBaseLayerConfig, BaseLayersConfig } from 'assets/src/modules/config/BaseLayer.js';

describe('BaseLayerConfig', function () {
    it('simple', function () {
        const baselayer = new BaseLayerConfig('name', {'title': 'title'})
        expect(baselayer).to.be.instanceOf(BaseLayerConfig)
        expect(baselayer.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(baselayer.name).to.be.eq('name')
        expect(baselayer.title).to.be.eq('title')
        expect(baselayer.hasKey).to.be.false
        expect(baselayer.key).to.be.null
        expect(baselayer.hasAttribution).to.be.false
        expect(baselayer.attribution).to.be.null
    })

    it('simple with key', function () {
        const blWithKey = new BaseLayerConfig('name', {'title': 'title', 'key': 'key'})
        expect(blWithKey).to.be.instanceOf(BaseLayerConfig)
        expect(blWithKey.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(blWithKey.name).to.be.eq('name')
        expect(blWithKey.title).to.be.eq('title')
        expect(blWithKey.hasKey).to.be.true
        expect(blWithKey.key).to.not.be.null
        expect(blWithKey.key).to.be.eq('key')
        expect(blWithKey.hasAttribution).to.be.false
        expect(blWithKey.attribution).to.be.null

        const blWithEmptyKey = new BaseLayerConfig('name', {'title': 'title', 'key': ''})
        expect(blWithEmptyKey).to.be.instanceOf(BaseLayerConfig)
        expect(blWithEmptyKey.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(blWithEmptyKey.name).to.be.eq('name')
        expect(blWithEmptyKey.title).to.be.eq('title')
        expect(blWithEmptyKey.hasKey).to.be.false
        expect(blWithEmptyKey.key).to.be.null
        expect(blWithEmptyKey.hasAttribution).to.be.false
        expect(blWithEmptyKey.attribution).to.be.null
    })

    it('simple with attribution', function () {
        const blWithAttribution = new BaseLayerConfig('name', {'title': 'title', 'attribution': {'title': 'title', 'url': 'url'}})
        expect(blWithAttribution).to.be.instanceOf(BaseLayerConfig)
        expect(blWithAttribution.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(blWithAttribution.name).to.be.eq('name')
        expect(blWithAttribution.title).to.be.eq('title')
        expect(blWithAttribution.hasKey).to.be.false
        expect(blWithAttribution.key).to.be.null
        expect(blWithAttribution.hasAttribution).to.be.true
        expect(blWithAttribution.attribution).to.be.instanceOf(AttributionConfig)
        expect(blWithAttribution.attribution.title).to.be.eq('title')
        expect(blWithAttribution.attribution.url).to.be.eq('url')

        const blWithEmptyAttribution = new BaseLayerConfig('name', {'title': 'title', 'attribution': {}})
        expect(blWithEmptyAttribution).to.be.instanceOf(BaseLayerConfig)
        expect(blWithEmptyAttribution.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(blWithEmptyAttribution.name).to.be.eq('name')
        expect(blWithEmptyAttribution.title).to.be.eq('title')
        expect(blWithEmptyAttribution.hasKey).to.be.false
        expect(blWithEmptyAttribution.key).to.be.null
        expect(blWithEmptyAttribution.hasAttribution).to.be.false
        expect(blWithEmptyAttribution.attribution).to.be.null
    })

    it('Validation Error: title mandatory', function () {
        try {
            new BaseLayerConfig('name', {})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: \n- The required properties: title')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('Validation Error: invalid attribution', function () {
        try {
            new BaseLayerConfig('name', {'title': 'title', 'attribution': {'name': 'name'}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `title` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('WmtsBaseLayerConfig', function () {
    it('Valid', function () {
        const ignPhotoBl = new WmtsBaseLayerConfig("ign-photo", {
            "type": "wmts",
            "title": "IGN Orthophoto",
            "url": "https://data.geopf.fr/wmts?",
            "layers": "ORTHOIMAGERY.ORTHOPHOTOS",
            "format": "image/jpeg",
            "styles": "normal",
            "tileMatrixSet": "PM",
            "crs": "EPSG:3857",
            "numZoomLevels": 22,
            "attribution": {
                "title": "Institut national de l'information géographique et forestière",
                "url": "https://www.ign.fr/"
            }
        })
        expect(ignPhotoBl).to.be.instanceOf(BaseLayerConfig)
        expect(ignPhotoBl.type).to.be.eq(BaseLayerTypes.WMTS)
        expect(ignPhotoBl).to.be.instanceOf(WmtsBaseLayerConfig)
        expect(ignPhotoBl.name).to.be.eq('ign-photo')
        expect(ignPhotoBl.title).to.be.eq('IGN Orthophoto')
        expect(ignPhotoBl.layerConfig).to.be.null
        expect(ignPhotoBl.url).to.be.eq('https://data.geopf.fr/wmts?')
        expect(ignPhotoBl.hasKey).to.be.false
        expect(ignPhotoBl.key).to.be.null
        expect(ignPhotoBl.layer).to.be.eq('ORTHOIMAGERY.ORTHOPHOTOS')
        expect(ignPhotoBl.format).to.be.eq('image/jpeg')
        expect(ignPhotoBl.style).to.be.eq('normal')
        expect(ignPhotoBl.matrixSet).to.be.eq('PM')
        expect(ignPhotoBl.crs).to.be.eq('EPSG:3857')
        expect(ignPhotoBl.numZoomLevels).to.be.eq(22)
        expect(ignPhotoBl.hasAttribution).to.be.true
        expect(ignPhotoBl.attribution).to.be.instanceOf(AttributionConfig)
        expect(ignPhotoBl.attribution.title).to.be.eq('Institut national de l\'information géographique et forestière')
        expect(ignPhotoBl.attribution.url).to.be.eq('https://www.ign.fr/')


        const lizmapBl = new WmtsBaseLayerConfig("Quartiers", {
            "type": "wmts",
            "title": "Quartiers",
            "url": "http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=cache&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities",
            "layers": "Quartiers",
            "format": "image/png",
            "styles": "default",
            "tileMatrixSet": "EPSG:3857",
            "crs": "EPSG:3857",
            "numZoomLevels": 16
        })
        expect(lizmapBl).to.be.instanceOf(BaseLayerConfig)
        expect(lizmapBl.type).to.be.eq(BaseLayerTypes.WMTS)
        expect(lizmapBl).to.be.instanceOf(WmtsBaseLayerConfig)
        expect(lizmapBl.name).to.be.eq('Quartiers')
        expect(lizmapBl.title).to.be.eq('Quartiers')
        expect(lizmapBl.layerConfig).to.be.null
        expect(lizmapBl.url).to.be.eq('http://localhost:8130/index.php/lizmap/service?repository=testsrepository&project=cache')
        expect(lizmapBl.hasKey).to.be.false
        expect(lizmapBl.key).to.be.null
        expect(lizmapBl.layer).to.be.eq('Quartiers')
        expect(lizmapBl.format).to.be.eq('image/png')
        expect(lizmapBl.style).to.be.eq('default')
        expect(lizmapBl.matrixSet).to.be.eq('EPSG:3857')
        expect(lizmapBl.crs).to.be.eq('EPSG:3857')
        expect(lizmapBl.numZoomLevels).to.be.eq(16)
        expect(lizmapBl.hasAttribution).to.be.false
        expect(lizmapBl.attribution).to.be.null
    })
})

describe('BaseLayersConfig', function () {
    it('From Options', function () {
        const options = {
            emptyBaselayer: 'True',
            osmMapnik: 'True',
            osmStamenToner: 'True',
            openTopoMap: 'True',
            osmCyclemap: 'True',
            OCMKey: 'osm-cyclemap-key',
            googleStreets: 'True',
            googleSatellite: 'True',
            googleHybrid: 'True',
            googleTerrain: 'True',
            bingStreets: 'True',
            bingSatellite: 'True',
            bingHybrid: 'True',
            bingKey: 'bing-key',
            ignTerrain: 'True',
            ignStreets: 'True',
            ignKey: 'ign-key',
            ignSatellite: 'True',
            ignCadastral: 'True',
            startupBaselayer: 'osm-mapnik'
        };
        const baseLayers = new BaseLayersConfig({}, options, new LayersConfig({}))

        expect(baseLayers.startupBaselayerName).to.be.eq('osm-mapnik')

        const baseLayerNames = baseLayers.baseLayerNames;
        expect(baseLayerNames.length).to.be.eq(16);
        expect(baseLayerNames).to.include('empty')
        expect(baseLayerNames).to.include('osm-mapnik')
        expect(baseLayerNames).to.include('osm-stamen-toner')
        expect(baseLayerNames).to.include('open-topo-map')
        expect(baseLayerNames).to.include('osm-cyclemap')
        expect(baseLayerNames).to.include('google-street')
        expect(baseLayerNames).to.include('google-satellite')
        expect(baseLayerNames).to.include('google-hybrid')
        expect(baseLayerNames).to.include('google-terrain')
        expect(baseLayerNames).to.include('bing-road')
        expect(baseLayerNames).to.include('bing-aerial')
        expect(baseLayerNames).to.include('bing-hybrid')
        expect(baseLayerNames).to.include('ign-scan')
        expect(baseLayerNames).to.include('ign-plan')
        expect(baseLayerNames).to.include('ign-photo')
        expect(baseLayerNames).to.include('ign-cadastral')

        const emptyBl = baseLayers.getBaseLayerConfigByBaseLayerName('empty')
        expect(emptyBl).to.be.instanceOf(BaseLayerConfig)
        expect(emptyBl.type).to.be.eq(BaseLayerTypes.Empty)
        expect(emptyBl).to.be.instanceOf(EmptyBaseLayerConfig)
        expect(emptyBl.name).to.be.eq('empty')
        expect(emptyBl.title).to.be.eq('empty')
        expect(emptyBl.hasLayerConfig).to.be.false
        expect(emptyBl.layerConfig).to.be.null

        const osmMapnikBl = baseLayers.getBaseLayerConfigByBaseLayerName('osm-mapnik')
        expect(osmMapnikBl).to.be.instanceOf(BaseLayerConfig)
        expect(osmMapnikBl.type).to.be.eq(BaseLayerTypes.XYZ)
        expect(osmMapnikBl).to.be.instanceOf(XyzBaseLayerConfig)
        expect(osmMapnikBl.name).to.be.eq('osm-mapnik')
        expect(osmMapnikBl.title).to.be.eq('OpenStreetMap')
        expect(osmMapnikBl.layerConfig).to.be.null
        expect(osmMapnikBl.url).to.be.eq('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        expect(osmMapnikBl.hasKey).to.be.false
        expect(osmMapnikBl.key).to.be.null
        expect(osmMapnikBl.crs).to.be.eq('EPSG:3857')
        expect(osmMapnikBl.zmin).to.be.eq(0)
        expect(osmMapnikBl.zmax).to.be.eq(19)
        expect(osmMapnikBl.hasAttribution).to.be.true
        expect(osmMapnikBl.attribution).to.be.instanceOf(AttributionConfig)
        expect(osmMapnikBl.attribution.title).to.be.eq('© OpenStreetMap contributors, CC-BY-SA')
        expect(osmMapnikBl.attribution.url).to.be.eq('https://www.openstreetmap.org/copyright')
        expect(osmMapnikBl.hasLayerConfig).to.be.false

        const osmCycleBl = baseLayers.getBaseLayerConfigByBaseLayerName('osm-cyclemap')
        expect(osmCycleBl).to.be.instanceOf(BaseLayerConfig)
        expect(osmCycleBl.type).to.be.eq(BaseLayerTypes.XYZ)
        expect(osmCycleBl).to.be.instanceOf(XyzBaseLayerConfig)
        expect(osmCycleBl.name).to.be.eq('osm-cyclemap')
        expect(osmCycleBl.title).to.be.eq('OSM CycleMap')
        expect(osmCycleBl.layerConfig).to.be.null
        expect(osmCycleBl.url).to.be.eq('https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey={key}')
        expect(osmCycleBl.hasKey).to.be.true
        expect(osmCycleBl.key).to.not.be.null
        expect(osmCycleBl.key).to.be.eq('osm-cyclemap-key')
        expect(osmCycleBl.crs).to.be.eq('EPSG:3857')
        expect(osmCycleBl.zmin).to.be.eq(0)
        expect(osmCycleBl.zmax).to.be.eq(18)
        expect(osmCycleBl.hasAttribution).to.be.true
        expect(osmCycleBl.attribution).to.be.instanceOf(AttributionConfig)
        expect(osmCycleBl.attribution.title).to.be.eq('Thunderforest')
        expect(osmCycleBl.attribution.url).to.be.eq('https://www.thunderforest.com/')
        expect(osmCycleBl.hasLayerConfig).to.be.false

        const googleSatBl = baseLayers.getBaseLayerConfigByBaseLayerName('google-satellite')
        expect(googleSatBl).to.be.instanceOf(BaseLayerConfig)
        expect(googleSatBl.type).to.be.eq(BaseLayerTypes.XYZ)
        expect(googleSatBl).to.be.instanceOf(XyzBaseLayerConfig)
        expect(googleSatBl.name).to.be.eq('google-satellite')
        expect(googleSatBl.title).to.be.eq('Google Satellite')
        expect(googleSatBl.layerConfig).to.be.null
        expect(googleSatBl.url).to.be.eq('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}')
        expect(googleSatBl.hasKey).to.be.false
        expect(googleSatBl.key).to.be.null
        expect(googleSatBl.crs).to.be.eq('EPSG:3857')
        expect(googleSatBl.zmin).to.be.eq(0)
        expect(googleSatBl.zmax).to.be.eq(20)
        expect(googleSatBl.hasAttribution).to.be.true
        expect(googleSatBl.attribution).to.be.instanceOf(AttributionConfig)
        expect(googleSatBl.attribution.title).to.be.eq('Map data ©2019 Google')
        expect(googleSatBl.attribution.url).to.be.eq('https://about.google/brand-resource-center/products-and-services/geo-guidelines/#required-attribution')
        expect(googleSatBl.hasLayerConfig).to.be.false

        const bingAerialBl = baseLayers.getBaseLayerConfigByBaseLayerName('bing-aerial')
        expect(bingAerialBl).to.be.instanceOf(BaseLayerConfig)
        expect(bingAerialBl.type).to.be.eq(BaseLayerTypes.Bing)
        expect(bingAerialBl).to.be.instanceOf(BingBaseLayerConfig)
        expect(bingAerialBl.name).to.be.eq('bing-aerial')
        expect(bingAerialBl.title).to.be.eq('Bing Satellite')
        expect(bingAerialBl.layerConfig).to.be.null
        expect(bingAerialBl.imagerySet).to.be.eq('Aerial')
        expect(bingAerialBl.hasKey).to.be.true
        expect(bingAerialBl.key).to.not.be.null
        expect(bingAerialBl.key).to.be.eq('bing-key')
        expect(bingAerialBl.hasLayerConfig).to.be.false

        const ignPhotoBl = baseLayers.getBaseLayerConfigByBaseLayerName('ign-photo')
        expect(ignPhotoBl).to.be.instanceOf(BaseLayerConfig)
        expect(ignPhotoBl.type).to.be.eq(BaseLayerTypes.WMTS)
        expect(ignPhotoBl).to.be.instanceOf(WmtsBaseLayerConfig)
        expect(ignPhotoBl.name).to.be.eq('ign-photo')
        expect(ignPhotoBl.title).to.be.eq('IGN Orthophoto')
        expect(ignPhotoBl.layerConfig).to.be.null
        expect(ignPhotoBl.url).to.be.eq('https://data.geopf.fr/wmts?')
        expect(ignPhotoBl.hasKey).to.be.false
        expect(ignPhotoBl.key).to.be.null
        expect(ignPhotoBl.layer).to.be.eq('ORTHOIMAGERY.ORTHOPHOTOS')
        expect(ignPhotoBl.format).to.be.eq('image/jpeg')
        expect(ignPhotoBl.style).to.be.eq('normal')
        expect(ignPhotoBl.matrixSet).to.be.eq('PM')
        expect(ignPhotoBl.crs).to.be.eq('EPSG:3857')
        expect(ignPhotoBl.numZoomLevels).to.be.eq(19)
        expect(ignPhotoBl.hasAttribution).to.be.true
        expect(ignPhotoBl.attribution).to.be.instanceOf(AttributionConfig)
        expect(ignPhotoBl.attribution.title).to.be.eq('Institut national de l\'information géographique et forestière')
        expect(ignPhotoBl.attribution.url).to.be.eq('https://www.ign.fr/')

        const ignScanBl = baseLayers.getBaseLayerConfigByBaseLayerName('ign-scan')
        expect(ignScanBl).to.be.instanceOf(BaseLayerConfig)
        expect(ignScanBl.type).to.be.eq(BaseLayerTypes.WMTS)
        expect(ignScanBl).to.be.instanceOf(WmtsBaseLayerConfig)
        expect(ignScanBl.name).to.be.eq('ign-scan')
        expect(ignScanBl.title).to.be.eq('IGN Scans')
        expect(ignScanBl.layerConfig).to.be.null
        expect(ignScanBl.url).to.be.eq('https://data.geopf.fr/private/wmts/?apikey={key}&')
        expect(ignScanBl.hasKey).to.be.true
        expect(ignScanBl.key).to.be.eq('ign-key')
        expect(ignScanBl.layer).to.be.eq('GEOGRAPHICALGRIDSYSTEMS.MAPS')
        expect(ignScanBl.format).to.be.eq('image/jpeg')
        expect(ignScanBl.style).to.be.eq('normal')
        expect(ignScanBl.matrixSet).to.be.eq('PM')
        expect(ignScanBl.crs).to.be.eq('EPSG:3857')
        expect(ignScanBl.numZoomLevels).to.be.eq(18)
        expect(ignScanBl.hasAttribution).to.be.true
        expect(ignScanBl.attribution).to.be.instanceOf(AttributionConfig)
        expect(ignScanBl.attribution.title).to.be.eq('Institut national de l\'information géographique et forestière')
        expect(ignScanBl.attribution.url).to.be.eq('https://www.ign.fr/')
    })

    it('From layers config', function () {
        const layersCfg = new LayersConfig({
            "france_parts": {
                "abstract": "",
                "displayInLegend": "True",
                "popupMaxFeatures": 10,
                "baseLayer": "False",
                "noLegendImage": "False",
                "id": "france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29",
                "title": "france_parts",
                "singleTile": "True",
                "geometryType": "polygon",
                "groupAsLayer": "False",
                "popupTemplate": "",
                "popup": "True",
                "popupDisplayChildren": "False",
                "clientCacheExpiration": 300,
                "link": "",
                "extent": [
                    -5.1326269187,
                    46.2791909858,
                    3.11792890789,
                    49.7264741072
                ],
                "toggled": "True",
                "crs": "EPSG:4326",
                "name": "france_parts",
                "cached": "False",
                "type": "layer",
                "maxScale": 1000000000000,
                "popupSource": "auto",
                "imageFormat": "image/png",
                "minScale": 1
            },
            "OpenStreetMap": {
                "id": "OpenStreetMap_098d6629_1ec4_4c2c_9489_9a44ae09223e",
                "name": "OpenStreetMap",
                "type": "layer",
                "extent": [
                    -20037508.342789244,
                    -20037508.342789255,
                    20037508.342789244,
                    20037508.342789244
                ],
                "crs": "EPSG:3857",
                "title": "OpenStreetMap",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "True",
                "popup": "False",
                "popupFrame": null,
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "True",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/png",
                "cached": "False",
                "serverFrame": null,
                "clientCacheExpiration": 300
            },
            "Orthophotos clé essentiels": {
                "id": "Orthophotos_essentiels_993e18ab_ef98_422d_aced_d82d4264b27b",
                "name": "Orthophotos clé essentiels",
                "type": "layer",
                "extent": [
                    -19835686.105981037,
                    -19971868.88040857,
                    19480910.888822887,
                    19971868.880408593
                ],
                "crs": "EPSG:3857",
                "title": "Orthophotos clé essentiels",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "False",
                "popup": "False",
                "popupFrame": null,
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "True",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/jpeg",
                "cached": "False",
                "serverFrame": null,
                "clientCacheExpiration": 300
            }
        })

        const layerNames = layersCfg.layerNames;
        expect(layerNames.length).to.be.eq(3)

        const osmLayer = layersCfg.layerConfigs[1];
        expect(osmLayer.name).to.be.eq('OpenStreetMap')
        expect(osmLayer.baseLayer).to.be.true

        const options = {
            startupBaselayer: 'OpenStreetMap'
        };
        const baseLayers = new BaseLayersConfig({}, options, layersCfg)

        expect(baseLayers.startupBaselayerName).to.be.eq('OpenStreetMap')

        const baseLayerNames = baseLayers.baseLayerNames;
        expect(baseLayerNames.length).to.be.eq(2);
        expect(baseLayerNames).to.include('OpenStreetMap')
        expect(baseLayerNames).to.include('Orthophotos clé essentiels')

        const osmBl = baseLayers.baseLayerConfigs[0]
        expect(osmBl).to.be.instanceOf(BaseLayerConfig)
        expect(osmBl.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(osmBl.name).to.be.eq('OpenStreetMap')
        expect(osmBl.title).to.be.eq('OpenStreetMap')
        expect(osmBl.hasLayerConfig).to.be.true
        expect(osmBl.layerConfig).to.not.be.null
        expect(osmBl.layerConfig).to.be.instanceOf(LayerConfig)
    })

    it('From options and layers config', function () {
        const layersCfg = new LayersConfig({
            "france_parts": {
                "abstract": "",
                "displayInLegend": "True",
                "popupMaxFeatures": 10,
                "baseLayer": "False",
                "noLegendImage": "False",
                "id": "france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29",
                "title": "france_parts",
                "singleTile": "True",
                "geometryType": "polygon",
                "groupAsLayer": "False",
                "popupTemplate": "",
                "popup": "True",
                "popupDisplayChildren": "False",
                "clientCacheExpiration": 300,
                "link": "",
                "extent": [
                    -5.1326269187,
                    46.2791909858,
                    3.11792890789,
                    49.7264741072
                ],
                "toggled": "True",
                "crs": "EPSG:4326",
                "name": "france_parts",
                "cached": "False",
                "type": "layer",
                "maxScale": 1000000000000,
                "popupSource": "auto",
                "imageFormat": "image/png",
                "minScale": 1
            },
            "OpenStreetMap": {
                "id": "OpenStreetMap_098d6629_1ec4_4c2c_9489_9a44ae09223e",
                "name": "OpenStreetMap",
                "type": "layer",
                "extent": [
                    -20037508.342789244,
                    -20037508.342789255,
                    20037508.342789244,
                    20037508.342789244
                ],
                "crs": "EPSG:3857",
                "title": "OpenStreetMap",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "True",
                "popup": "False",
                "popupFrame": null,
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "True",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/png",
                "cached": "False",
                "serverFrame": null,
                "clientCacheExpiration": 300
            },
            "Orthophotos clé essentiels": {
                "id": "Orthophotos_essentiels_993e18ab_ef98_422d_aced_d82d4264b27b",
                "name": "Orthophotos clé essentiels",
                "type": "layer",
                "extent": [
                    -19835686.105981037,
                    -19971868.88040857,
                    19480910.888822887,
                    19971868.880408593
                ],
                "crs": "EPSG:3857",
                "title": "Orthophotos clé essentiels",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "False",
                "popup": "False",
                "popupFrame": null,
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "True",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/jpeg",
                "cached": "False",
                "serverFrame": null,
                "clientCacheExpiration": 300
            }
        })

        const layerNames = layersCfg.layerNames;
        expect(layerNames.length).to.be.eq(3)

        const osmLayer = layersCfg.layerConfigs[1];
        expect(osmLayer.name).to.be.eq('OpenStreetMap')
        expect(osmLayer.baseLayer).to.be.true

        const options = {
            emptyBaselayer: 'True',
            osmStamenToner: 'True',
            googleSatellite: 'True',
            bingStreets: 'True',
            bingKey: 'bing-key',
            ignCadastral: 'True',
            startupBaselayer: 'OpenStreetMap'
        };
        const baseLayers = new BaseLayersConfig({}, options, layersCfg)

        expect(baseLayers.startupBaselayerName).to.be.eq('OpenStreetMap')

        const baseLayerNames = baseLayers.baseLayerNames;
        expect(baseLayerNames.length).to.be.eq(7);
        expect(baseLayerNames).to.include('OpenStreetMap')
        expect(baseLayerNames).to.include('Orthophotos clé essentiels')
        expect(baseLayerNames).to.include('empty')
        expect(baseLayerNames).to.include('osm-stamen-toner')
        expect(baseLayerNames).to.include('google-satellite')
        expect(baseLayerNames).to.include('bing-road')
        expect(baseLayerNames).to.include('ign-cadastral')

        const osmBl = baseLayers.baseLayerConfigs[5]
        expect(osmBl).to.be.instanceOf(BaseLayerConfig)
        expect(osmBl.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(osmBl.name).to.be.eq('OpenStreetMap')
        expect(osmBl.title).to.be.eq('OpenStreetMap')
        expect(osmBl.hasLayerConfig).to.be.true
        expect(osmBl.layerConfig).to.not.be.null
        expect(osmBl.layerConfig).to.be.instanceOf(LayerConfig)
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
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);
        expect(invalid).to.have.length(0);
        expect(root).to.be.instanceOf(LayerTreeGroupConfig)
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.childrenCount).to.be.eq(7)

        const blGroup = root.children[6];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)
        expect(blGroup.name).to.be.eq('Baselayers')
        expect(blGroup.type).to.be.eq('group')
        expect(blGroup.level).to.be.eq(1)

        const options = {
            emptyBaselayer: 'True'
        };
        const baseLayers = new BaseLayersConfig({}, options, layers, blGroup)

        const baseLayerNames = baseLayers.baseLayerNames;
        expect(baseLayerNames).to.have.length(3)
        expect(baseLayerNames).to.include('empty')
        expect(baseLayerNames).to.include('osm-mapnik')
        expect(baseLayerNames).to.include('osm-stamen-toner')

        expect(baseLayers.startupBaselayerName).to.be.eq('osm-mapnik')

        const osmBl = baseLayers.baseLayerConfigs[0]
        expect(osmBl).to.be.instanceOf(BaseLayerConfig)
        expect(osmBl.type).to.be.eq(BaseLayerTypes.XYZ)
        expect(osmBl).to.be.instanceOf(XyzBaseLayerConfig)
        expect(osmBl.name).to.be.eq('osm-mapnik')
        expect(osmBl.title).to.be.eq('osm-mapnik')
        expect(osmBl.hasLayerConfig).to.be.true
        expect(osmBl.layerConfig).to.not.be.null
        expect(osmBl.layerConfig).to.be.instanceOf(LayerConfig)
    })

    it('From baselayers user defined', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/backgrounds-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/backgrounds-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);
        let invalid = [];
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);
        expect(invalid).to.have.length(0);
        expect(root).to.be.instanceOf(LayerTreeGroupConfig)
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.childrenCount).to.be.eq(3)

        const blGroup = root.children[2];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)
        expect(blGroup.name).to.be.eq('baselayers')
        expect(blGroup.type).to.be.eq('group')
        expect(blGroup.level).to.be.eq(1)
        expect(blGroup.childrenCount).to.be.eq(16)

        const baseLayers = new BaseLayersConfig({}, {}, layers, blGroup)
        expect(baseLayers.baseLayerNames)
            .to.have.length(11)
            .that.be.deep.eq([
                //"=== TMS ===",
                "Stamen Watercolor",
                "OSM TMS internal",
                "OSM TMS external",
                //"=== GROUPS ===",
                "project-background-color",
                //"empty group",
                "group with many layers and shortname",
                "group with sub",
                //"=== LOCAL LAYERS ===",
                "local vector layer",
                "local raster layer",
                //"=== WM[T]S are on liz.lizmap.com ===",
                "WMTS single external",
                "WMS single internal",
                "WMS grouped external",
            ]);

        expect(baseLayers.startupBaselayerName).to.be.eq('Stamen Watercolor')

        const watercolorBl = baseLayers.baseLayerConfigs[0]
        expect(watercolorBl).to.be.instanceOf(BaseLayerConfig)
        expect(watercolorBl.type).to.be.eq(BaseLayerTypes.XYZ)
        expect(watercolorBl).to.be.instanceOf(XyzBaseLayerConfig)
        expect(watercolorBl.name).to.be.eq('Stamen Watercolor')
        expect(watercolorBl.title).to.be.eq('Stamen Watercolor')
        expect(watercolorBl.url).to.be.eq('https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg')
        expect(watercolorBl.zmin).to.be.eq(0)
        expect(watercolorBl.zmax).to.be.eq(18)
        expect(watercolorBl.crs).to.be.eq('EPSG:3857')
        expect(watercolorBl.hasLayerConfig).to.be.true
        expect(watercolorBl.layerConfig).to.not.be.null
        expect(watercolorBl.layerConfig).to.be.instanceOf(LayerConfig)
        expect(watercolorBl.layerConfig.externalWmsToggle).to.be.true
        expect(watercolorBl.layerConfig.externalAccess).to.be.deep.eq({
            "crs": "EPSG:3857",
            "format": "",
            "type": "xyz",
            "url": "https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg",
            "zmax": "18",
            "zmin": "0"
        })

        const osmBl = baseLayers.baseLayerConfigs[2]
        expect(osmBl).to.be.instanceOf(BaseLayerConfig)
        expect(osmBl.type).to.be.eq(BaseLayerTypes.XYZ)
        expect(osmBl).to.be.instanceOf(XyzBaseLayerConfig)
        expect(osmBl.name).to.be.eq('OSM TMS external')
        expect(osmBl.title).to.be.eq('OSM TMS external')
        expect(osmBl.url).to.be.eq('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        expect(osmBl.zmin).to.be.eq(0)
        expect(osmBl.zmax).to.be.eq(19)
        expect(osmBl.crs).to.be.eq('EPSG:3857')
        expect(osmBl.hasLayerConfig).to.be.true
        expect(osmBl.layerConfig).to.not.be.null
        expect(osmBl.layerConfig).to.be.instanceOf(LayerConfig)
        expect(osmBl.layerConfig.externalWmsToggle).to.be.true
        expect(osmBl.layerConfig.externalAccess).to.be.deep.eq({
            "crs": "EPSG:3857",
            "format": "",
            "type": "xyz",
            "url": "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            "zmax": "19",
            "zmin": "0"
        })

        const projectBackgroundColorBl = baseLayers.baseLayerConfigs[3]
        expect(projectBackgroundColorBl).to.be.instanceOf(BaseLayerConfig)
        expect(projectBackgroundColorBl.type).to.be.eq(BaseLayerTypes.Empty)
        expect(projectBackgroundColorBl).to.be.instanceOf(EmptyBaseLayerConfig)
        expect(projectBackgroundColorBl.name).to.be.eq('project-background-color')
        expect(projectBackgroundColorBl.title).to.be.eq('project-background-color')

        const groupBl = baseLayers.baseLayerConfigs[4]
        expect(groupBl).to.be.instanceOf(BaseLayerConfig)
        expect(groupBl.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(groupBl)
            .to.not.be.instanceOf(EmptyBaseLayerConfig)
            .that.not.be.instanceOf(XyzBaseLayerConfig)
            .that.not.be.instanceOf(BingBaseLayerConfig)
            .that.not.be.instanceOf(WmtsBaseLayerConfig)
            .that.not.be.instanceOf(WmsBaseLayerConfig)
        expect(groupBl.name).to.be.eq('group with many layers and shortname')
        expect(groupBl.title).to.be.eq('This is a nice group')
        expect(groupBl.hasLayerConfig).to.be.true
        expect(groupBl.layerConfig).to.not.be.null

        const vectorBl = baseLayers.baseLayerConfigs[6]
        expect(vectorBl).to.be.instanceOf(BaseLayerConfig)
        expect(vectorBl.type).to.be.eq(BaseLayerTypes.Lizmap)
        expect(vectorBl)
            .to.not.be.instanceOf(EmptyBaseLayerConfig)
            .that.not.be.instanceOf(XyzBaseLayerConfig)
            .that.not.be.instanceOf(BingBaseLayerConfig)
            .that.not.be.instanceOf(WmtsBaseLayerConfig)
            .that.not.be.instanceOf(WmsBaseLayerConfig)
        expect(vectorBl.name).to.be.eq('local vector layer')
        expect(vectorBl.title).to.be.eq('local vector layer')
        expect(vectorBl.hasLayerConfig).to.be.true
        expect(vectorBl.layerConfig).to.not.be.null

        const wmtsBl = baseLayers.baseLayerConfigs[8]
        expect(wmtsBl).to.be.instanceOf(BaseLayerConfig)
        expect(wmtsBl.type).to.be.eq(BaseLayerTypes.WMTS)
        expect(wmtsBl).to.be.instanceOf(WmtsBaseLayerConfig)
        expect(wmtsBl.name).to.be.eq('WMTS single external')
        expect(wmtsBl.title).to.be.eq('WMTS single external')
        expect(wmtsBl.url).to.be.eq('https://liz.lizmap.com/tests/index.php/lizmap/service?repository=testse2elwc&project=wmts')
        expect(wmtsBl.layer).to.be.eq('Communes')
        expect(wmtsBl.format).to.be.eq('image/png')
        expect(wmtsBl.style).to.be.eq('default')
        expect(wmtsBl.matrixSet).to.be.eq('EPSG:3857')
        expect(wmtsBl.crs).to.be.eq('EPSG:3857')
        expect(wmtsBl.numZoomLevels).to.be.eq(19)
        expect(wmtsBl.hasLayerConfig).to.be.true
        expect(wmtsBl.layerConfig).to.not.be.null
        expect(wmtsBl.layerConfig.externalWmsToggle).to.be.true
        expect(wmtsBl.layerConfig.externalAccess).to.be.deep.eq({
            "crs": "EPSG:3857",
            "dpiMode": "7",
            "format": "image/png",
            "layers": "Communes",
            "styles": "default",
            "tileMatrixSet": "EPSG:3857",
            "url": "https://liz.lizmap.com/tests/index.php/lizmap/service?repository=testse2elwc&project=wmts&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetCapabilities",
            "type": "wmts"
        })

        const wmsBl = baseLayers.baseLayerConfigs[10]
        expect(wmsBl).to.be.instanceOf(BaseLayerConfig)
        expect(wmsBl.type).to.be.eq(BaseLayerTypes.WMS)
        expect(wmsBl).to.be.instanceOf(WmsBaseLayerConfig)
        expect(wmsBl.name).to.be.eq('WMS grouped external')
        expect(wmsBl.title).to.be.eq('WMS grouped external')
        expect(wmsBl.url).to.be.eq('https://liz.lizmap.com/tests/index.php/lizmap/service?repository=miscellaneous&project=flatgeobuf')
        expect(wmsBl.layers).to.be.eq('commune')
        expect(wmsBl.format).to.be.eq('image/png; mode=8bit')
        expect(wmsBl.styles).to.be.eq('défaut')
        expect(wmsBl.crs).to.be.eq('EPSG:3857')
        expect(wmsBl.hasLayerConfig).to.be.true
        expect(wmsBl.layerConfig).to.not.be.null
        expect(wmsBl.layerConfig.externalWmsToggle).to.be.true
        expect(wmsBl.layerConfig.externalAccess).to.be.deep.eq({
            "contextualWMSLegend": "0",
            "crs": "EPSG:3857",
            "dpiMode": "7",
            "featureCount": "10",
            "format": "image/png;%20mode%3D8bit",
            "layers": "commune",
            "styles": "d%C3%A9faut",
            "url": "https://liz.lizmap.com/tests/index.php/lizmap/service?repository=miscellaneous&project=flatgeobuf&VERSION=1.3.0"
        })
    })

    it('default_background_color_index', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/backgrounds-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/backgrounds-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        // Removed empty groups from capabilities like with QGIS Server 3.34
        for(const wmsCapaLayer of capabilities.Capability.Layer.Layer) {
            if (!wmsCapaLayer.hasOwnProperty('Layer') || wmsCapaLayer.Layer.length === 0) {
                continue;
            }
            if (wmsCapaLayer.Name != 'baselayers') {
                continue;
            }
            wmsCapaLayer.Layer = wmsCapaLayer.Layer.filter((baseLayer) => {
                const cfg = layers.getLayerConfigByWmsName(baseLayer.Name);
                if (cfg == null) {
                    return false;
                }
                if (cfg.type != 'group') {
                    return true;
                }
                if (!baseLayer.hasOwnProperty('Layer') || baseLayer.Layer.length === 0) {
                    return false;
                }
                return true;
            });
        }

        let invalid = [];
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

        expect(invalid).to.have.length(0);
        expect(root).to.be.instanceOf(LayerTreeGroupConfig)
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.childrenCount).to.be.eq(3)

        const blGroup = root.children[2];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)
        expect(blGroup.name).to.be.eq('baselayers')
        expect(blGroup.type).to.be.eq('group')
        expect(blGroup.level).to.be.eq(1)
        expect(blGroup.childrenCount).to.be.eq(10) // was 16

        const options = {
            default_background_color_index: 3,
        };

        const baseLayers = new BaseLayersConfig({}, options, layers, blGroup)
        expect(baseLayers.baseLayerNames)
            .to.have.length(11) // still 11
            .that.be.deep.eq([
                //"=== TMS ===",
                "Stamen Watercolor",
                "OSM TMS internal",
                "OSM TMS external",
                //"=== GROUPS ===",
                "project-background-color",
                //"empty group",
                "group with many layers and shortname",
                "group with sub",
                //"=== LOCAL LAYERS ===",
                "local vector layer",
                "local raster layer",
                //"=== WM[T]S are on liz.lizmap.com ===",
                "WMTS single external",
                "WMS single internal",
                "WMS grouped external",
            ]);

        expect(baseLayers.startupBaselayerName).to.be.eq("Stamen Watercolor")

        const baseLayersWithoutOptions = new BaseLayersConfig({}, {}, layers, blGroup)
        expect(baseLayersWithoutOptions.baseLayerNames)
            .to.have.length(11) // still 11
            .that.be.deep.eq([
                //"=== TMS ===",
                "Stamen Watercolor",
                "OSM TMS internal",
                "OSM TMS external",
                //"=== GROUPS ===",
                "project-background-color",
                //"empty group",
                "group with many layers and shortname",
                "group with sub",
                //"=== LOCAL LAYERS ===",
                "local vector layer",
                "local raster layer",
                //"=== WM[T]S are on liz.lizmap.com ===",
                "WMTS single external",
                "WMS single internal",
                "WMS grouped external",
            ]);

        expect(baseLayers.startupBaselayerName).to.be.eq("Stamen Watercolor")
    })

    it('startupBaseLayer', function () {
        const emptyStratupBlOpt = {
            emptyBaselayer: 'True',
            osmMapnik: 'True',
            startupBaselayer: 'empty'
        };
        const emptyStratupBl = new BaseLayersConfig({}, emptyStratupBlOpt, new LayersConfig({}))

        expect(emptyStratupBl.startupBaselayerName).to.be.eq('empty')

        const osmMapnikStratupBlOpt = {
            emptyBaselayer: 'True',
            osmMapnik: 'True',
            startupBaselayer: 'osmMapnik'
        };
        const osmMapnikStratupBl = new BaseLayersConfig({}, osmMapnikStratupBlOpt, new LayersConfig({}))

        expect(osmMapnikStratupBl.startupBaselayerName).to.be.eq('osm-mapnik')

        const nullStratupBlOpt = {
            emptyBaselayer: 'True',
            osmMapnik: 'True'
        };
        const nullStratupBl = new BaseLayersConfig({}, nullStratupBlOpt, new LayersConfig({}))

        expect(nullStratupBl.startupBaselayerName).to.be.null

        const undefinedStratupBlOpt = {
            emptyBaselayer: 'True',
            osmMapnik: 'True',
            startupBaselayer: 'ign-photo'
        };
        const undefinedStratupBl = new BaseLayersConfig({}, undefinedStratupBlOpt, new LayersConfig({}))

        expect(undefinedStratupBl.startupBaselayerName).to.be.null

        const unknownStratupBlOpt = {
            emptyBaselayer: 'True',
            osmMapnik: 'True',
            startupBaselayer: 'unknown'
        };
        const unknownStratupBl = new BaseLayersConfig({}, unknownStratupBlOpt, new LayersConfig({}))

        expect(unknownStratupBl.startupBaselayerName).to.be.null
    })

    it('startupBaseLayer from baselayers user defined', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/display_in_legend-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/display_in_legend-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        // Removed empty groups from capabilities like with QGIS Server 3.34
        for(const wmsCapaLayer of capabilities.Capability.Layer.Layer) {
            if (!wmsCapaLayer.hasOwnProperty('Layer') || wmsCapaLayer.Layer.length === 0) {
                continue;
            }
            if (wmsCapaLayer.Name != 'baselayers') {
                continue;
            }
            wmsCapaLayer.Layer = wmsCapaLayer.Layer.filter((baseLayer) => {
                const cfg = layers.getLayerConfigByWmsName(baseLayer.Name);
                if (cfg == null) {
                    return false;
                }
                if (cfg.type != 'group') {
                    return true;
                }
                if (!baseLayer.hasOwnProperty('Layer') || baseLayer.Layer.length === 0) {
                    return false;
                }
                return true;
            });
        }

        let invalid = [];
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

        expect(invalid).to.have.length(0);
        expect(root).to.be.instanceOf(LayerTreeGroupConfig)
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.childrenCount).to.be.eq(4)

        const blGroup = root.children[3];
        expect(blGroup).to.be.instanceOf(LayerTreeGroupConfig)
        expect(blGroup.name).to.be.eq('baselayers')
        expect(blGroup.type).to.be.eq('group')
        expect(blGroup.level).to.be.eq(1)
        // project-background-color not in capabilities
        expect(blGroup.childrenCount).to.be.eq(1)

        const baseLayers = new BaseLayersConfig({}, {}, layers, blGroup)

        expect(baseLayers.baseLayerNames)
            .to.have.length(2) // still 11
            .that.be.deep.eq([
                "project-background-color",
                "OpenStreetMap"
            ])

        expect(baseLayers.startupBaselayerName).to.be.eq("project-background-color")

    })

    it('ValidationError', function () {
        try {
            new BaseLayersConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
