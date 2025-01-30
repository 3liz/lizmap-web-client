import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { Extent } from 'assets/src/modules/utils/Extent.js';
import { LayerConfig, LayersConfig } from 'assets/src/modules/config/Layer.js';

describe('LayerConfig', function () {
    it('Valid', function () {
        const group = new LayerConfig({
            "id": "IGN",
            "name": "IGN",
            "type": "group",
            "title": "IGN",
            "abstract": "",
            "link": "",
            "minScale": 1,
            "maxScale": 1000000000000,
            "toggled": "True",
            "popup": "False",
            "popupSource": "auto",
            "popupTemplate": "",
            "popupMaxFeatures": 10,
            "popupDisplayChildren": "False",
            "noLegendImage": "False",
            "groupAsLayer": "False",
            "baseLayer": "False",
            "displayInLegend": "True",
            "singleTile": "True",
            "imageFormat": "image/png",
            "cached": "False",
            "clientCacheExpiration": 300,
            "mutuallyExclusive": "True"
        });
        expect(group.id).to.be.eq('IGN')
        expect(group.name).to.be.eq('IGN')
        expect(group.shortname).to.be.null
        expect(group.title).to.be.eq('IGN')
        expect(group.abstract).to.be.eq('')
        expect(group.link).to.be.eq('')
        expect(group.type).to.be.eq('group')
        expect(group.minScale).to.be.eq(1)
        expect(group.maxScale).to.be.eq(1000000000000)
        expect(group.geometryType).to.be.null
        expect(group.extent).to.be.null
        expect(group.crs).to.be.null
        expect(group.toggled).to.be.true
        expect(group.popup).to.be.false
        expect(group.popupSource).to.be.eq('auto')
        expect(group.popupTemplate).to.be.eq('')
        expect(group.popupMaxFeatures).to.be.eq(10)
        expect(group.popupDisplayChildren).to.be.false
        expect(group.noLegendImage).to.be.false
        expect(group.opacity).to.be.eq(1)
        expect(group.groupAsLayer).to.be.false
        expect(group.baseLayer).to.be.false
        expect(group.displayInLegend).to.be.true
        expect(group.singleTile).to.be.true
        expect(group.imageFormat).to.be.eq('image/png')
        expect(group.cached).to.be.false
        expect(group.clientCacheExpiration).to.be.eq(300)
        expect(group.mutuallyExclusive).to.be.true

        const layer1 = new LayerConfig({
            "id": "null_island20200414115730489",
            "name": "null_island OGRGeoJSON Point",
            "type": "layer",
            "geometryType": "point",
            "extent": [
                0,
                0,
                0,
                0
            ],
            "crs": "EPSG:4326",
            "title": "Null island with QGIS info",
            "abstract": "The null island with QGIS information : version and release name.",
            "link": "",
            "minScale": 1,
            "maxScale": 1000000000000,
            "toggled": "True",
            "popup": "True",
            "popupSource": "auto",
            "popupTemplate": "",
            "popupMaxFeatures": 10,
            "popupDisplayChildren": "False",
            "noLegendImage": "False",
            "groupAsLayer": "False",
            "baseLayer": "False",
            "displayInLegend": "True",
            "singleTile": "True",
            "imageFormat": "image/png",
            "cached": "False",
            "clientCacheExpiration": 300,
            "shortname": "null_island_qgis_info",
            "layerType": 'vector'
        });
        expect(layer1.id).to.be.eq('null_island20200414115730489')
        expect(layer1.name).to.be.eq('null_island OGRGeoJSON Point')
        expect(layer1.shortname).to.be.eq('null_island_qgis_info')
        expect(layer1.title).to.be.eq('Null island with QGIS info')
        expect(layer1.abstract).to.be.eq('The null island with QGIS information : version and release name.')
        expect(layer1.link).to.be.eq('')
        expect(layer1.type).to.be.eq('layer')
        expect(layer1.minScale).to.be.eq(1)
        expect(layer1.maxScale).to.be.eq(1000000000000)
        expect(layer1.layerType).to.be.eq('vector')
        expect(layer1.geometryType).to.be.eq('point')
        expect(layer1.extent).to.be.instanceOf(Extent)
        expect(layer1.extent.length).to.be.eq(4)
        expect(layer1.extent[0]).to.be.eq(0)
        expect(layer1.extent[1]).to.be.eq(0)
        expect(layer1.extent[2]).to.be.eq(0)
        expect(layer1.extent[3]).to.be.eq(0)
        expect(layer1.crs).to.be.eq('EPSG:4326')
        expect(layer1.toggled).to.be.true
        expect(layer1.popup).to.be.true
        expect(layer1.popupSource).to.be.eq('auto')
        expect(layer1.popupTemplate).to.be.eq('')
        expect(layer1.popupMaxFeatures).to.be.eq(10)
        expect(layer1.popupDisplayChildren).to.be.false
        expect(layer1.opacity).to.be.eq(1)
        expect(layer1.noLegendImage).to.be.false
        expect(layer1.groupAsLayer).to.be.false
        expect(layer1.baseLayer).to.be.false
        expect(layer1.displayInLegend).to.be.true
        expect(layer1.singleTile).to.be.true
        expect(layer1.imageFormat).to.be.eq('image/png')
        expect(layer1.cached).to.be.false
        expect(layer1.clientCacheExpiration).to.be.eq(300)
        expect(layer1.mutuallyExclusive).to.be.false

        const layer2 = new LayerConfig({
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
            "toggled": "False",
            "crs": "EPSG:4326",
            "name": "france_parts",
            "cached": "False",
            "type": "layer",
            "maxScale": 1000000000000,
            "popupSource": "auto",
            "imageFormat": "image/png",
            "minScale": 1,
            "layerType": 'vector'
        });
        expect(layer2.id).to.be.eq('france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29')
        expect(layer2.name).to.be.eq('france_parts')
        expect(layer2.shortname).to.be.null
        expect(layer2.title).to.be.eq('france_parts')
        expect(layer2.abstract).to.be.eq('')
        expect(layer2.link).to.be.eq('')
        expect(layer2.type).to.be.eq('layer')
        expect(layer2.minScale).to.be.eq(1)
        expect(layer2.maxScale).to.be.eq(1000000000000)
        expect(layer2.layerType).to.be.eq('vector')
        expect(layer2.geometryType).to.be.eq('polygon')
        expect(layer2.extent).to.be.instanceOf(Extent)
        expect(layer2.extent.length).to.be.eq(4)
        expect(layer2.extent[0]).to.be.lt(-5.132626)
        expect(layer2.extent[1]).to.be.lt(46.279191)
        expect(layer2.extent[2]).to.be.gt(3.117928)
        expect(layer2.extent[3]).to.be.gt(49.726474)
        expect(layer2.crs).to.be.eq('EPSG:4326')
        expect(layer2.toggled).to.be.false
        expect(layer2.popup).to.be.true
        expect(layer2.popupSource).to.be.eq('auto')
        expect(layer2.popupTemplate).to.be.eq('')
        expect(layer2.popupMaxFeatures).to.be.eq(10)
        expect(layer2.popupDisplayChildren).to.be.false
        expect(layer2.opacity).to.be.eq(1)
        expect(layer2.noLegendImage).to.be.false
        expect(layer2.groupAsLayer).to.be.false
        expect(layer2.baseLayer).to.be.false
        expect(layer2.displayInLegend).to.be.true
        expect(layer2.singleTile).to.be.true
        expect(layer2.imageFormat).to.be.eq('image/png')
        expect(layer2.cached).to.be.false
        expect(layer2.clientCacheExpiration).to.be.eq(300)
        expect(layer2.mutuallyExclusive).to.be.false
    })

    it('ValidationError', function () {
        try {
            new LayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('LayersConfig', function () {
    it('Valid', function () {
        const emptyLayers  = new LayersConfig({})
        expect(emptyLayers.layerNames.length).to.be.eq(0)
        expect(emptyLayers.layerIds.length).to.be.eq(0)
        expect(emptyLayers.layerConfigs.length).to.be.eq(0)

        const simpleLayers  = new LayersConfig({
            "null_island OGRGeoJSON Point": {
                "id": "null_island20200414115730489",
                "name": "null_island OGRGeoJSON Point",
                "type": "layer",
                "geometryType": "point",
                "extent": [
                    0,
                    0,
                    0,
                    0
                ],
                "crs": "EPSG:4326",
                "title": "Null island with QGIS info",
                "abstract": "The null island with QGIS information : version and release name.",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "True",
                "popup": "True",
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/png",
                "cached": "False",
                "clientCacheExpiration": 300,
                "shortname": "null_island_qgis_info",
                "layerType": 'vector'
            }
        })
        expect(simpleLayers.layerNames.length).to.be.eq(1)
        expect(simpleLayers.layerNames[0]).to.be.eq('null_island OGRGeoJSON Point')
        expect(simpleLayers.getLayerNames().next().value).to.be.eq('null_island OGRGeoJSON Point')
        expect(simpleLayers.layerIds.length).to.be.eq(1)
        expect(simpleLayers.layerIds[0]).to.be.eq('null_island20200414115730489')
        expect(simpleLayers.getLayerIds().next().value).to.be.eq('null_island20200414115730489')
        expect(simpleLayers.layerConfigs.length).to.be.eq(1)
        const simpleLayer = simpleLayers.layerConfigs[0];
        expect(simpleLayer).to.be.instanceOf(LayerConfig)
        expect(simpleLayer.name).to.be.eq('null_island OGRGeoJSON Point')
        expect(simpleLayer.id).to.be.eq('null_island20200414115730489')
        expect(simpleLayers.getLayerConfigByLayerName('null_island OGRGeoJSON Point')).to.be.eq(simpleLayer)
        expect(simpleLayers.getLayerConfigByLayerId('null_island20200414115730489')).to.be.eq(simpleLayer)
        expect(simpleLayers.getLayerConfigs().next().value).to.be.eq(simpleLayer)

        const francePartsLayers = new LayersConfig({
            "france_parts bordure": {
                "abstract": "",
                "displayInLegend": "True",
                "popupMaxFeatures": 10,
                "baseLayer": "False",
                "noLegendImage": "False",
                "id": "france_parts_copier20180110163243267",
                "title": "france_parts bordure",
                "singleTile": "True",
                "geometryType": "polygon",
                "groupAsLayer": "False",
                "popupTemplate": "",
                "popup": "False",
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
                "name": "france_parts bordure",
                "cached": "False",
                "type": "layer",
                "maxScale": 1000000000000,
                "popupSource": "lizmap",
                "imageFormat": "image/png",
                "minScale": 1,
                "layerType": 'vector'
            },
            "france_parts tuilé en cache": {
                "abstract": "",
                "displayInLegend": "True",
                "popupMaxFeatures": 10,
                "cacheExpiration": 0,
                "baseLayer": "False",
                "noLegendImage": "False",
                "id": "france_parts_copier20180110163329820",
                "title": "france_parts tuilé en cache",
                "singleTile": "False",
                "geometryType": "polygon",
                "groupAsLayer": "False",
                "popupTemplate": "",
                "popup": "False",
                "popupDisplayChildren": "False",
                "clientCacheExpiration": 300,
                "link": "",
                "extent": [
                    -5.1326269187,
                    46.2791909858,
                    3.11792890789,
                    49.7264741072
                ],
                "toggled": "False",
                "crs": "EPSG:4326",
                "name": "france_parts tuilé en cache",
                "cached": "True",
                "type": "layer",
                "maxScale": 1000000000000,
                "popupSource": "lizmap",
                "imageFormat": "image/png",
                "minScale": 1,
                "layerType": 'vector'
            },
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
                "minScale": 1,
                "layerType": 'vector'
            }
        })
        const francePartsLayerNames = francePartsLayers.layerNames;
        expect(francePartsLayerNames.length).to.be.eq(3)
        expect(francePartsLayerNames).deep.to.eq([
            "france_parts bordure",
            "france_parts tuilé en cache",
            "france_parts"
        ])
        const francePartsLayerIds = francePartsLayers.layerIds;
        expect(francePartsLayerIds.length).to.be.eq(3)
        expect(francePartsLayerIds).deep.to.eq([
            "france_parts_copier20180110163243267",
            "france_parts_copier20180110163329820",
            "france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29"
        ])
        const francePartsLayer = francePartsLayers.layerConfigs[2];
        expect(francePartsLayer).to.be.instanceOf(LayerConfig)
        expect(francePartsLayer.name).to.be.eq('france_parts')
        expect(francePartsLayer.id).to.be.eq('france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29')
        expect(francePartsLayers.getLayerConfigByLayerName('france_parts')).to.be.eq(francePartsLayer)
        expect(francePartsLayers.getLayerConfigByLayerId('france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29')).to.be.eq(francePartsLayer)
        const francePartsGetLayerConfigs = francePartsLayers.getLayerConfigs()
        expect(francePartsGetLayerConfigs.next().value).to.be.instanceOf(LayerConfig)
        expect(francePartsGetLayerConfigs.next().value).to.be.instanceOf(LayerConfig)
        expect(francePartsGetLayerConfigs.next().value).to.be.eq(francePartsLayer)

        const complexeLayers = new LayersConfig({
            "IGN": {
                "id": "IGN",
                "name": "IGN",
                "type": "group",
                "title": "IGN",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "True",
                "popup": "False",
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/png",
                "cached": "False",
                "clientCacheExpiration": 300,
                "mutuallyExclusive": "True"
            },
            "Orthophoto clé ortho": {
                "id": "Orthophoto_clé_ortho_e5eb448b_9667_4bf3_a28b_d95bd26c85a5",
                "name": "Orthophoto clé ortho",
                "type": "layer",
                "extent": [
                    -19835686.105981037,
                    -19971868.88040857,
                    19480910.888822887,
                    19971868.880408593
                ],
                "crs": "EPSG:3857",
                "title": "Orthophoto clé ortho",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "True",
                "popup": "False",
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/jpeg",
                "cached": "False",
                "clientCacheExpiration": 300,
                "layerType": 'raster'
            },
            "Plan IGN clé essentiels": {
                "id": "Plan_essentiels_0cdc425e_0e3f_45b7_b439_f090fb8a02ea",
                "name": "Plan IGN clé essentiels",
                "type": "layer",
                "extent": [
                    -19480910.888822876,
                    -19971868.88040857,
                    19480910.888822887,
                    19971868.880408593
                ],
                "crs": "EPSG:3857",
                "title": "Plan IGN clé essentiels",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "False",
                "popup": "False",
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/jpeg",
                "cached": "False",
                "clientCacheExpiration": 300,
                "layerType": 'raster'
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
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/jpeg",
                "cached": "False",
                "clientCacheExpiration": 300,
                "layerType": 'raster'
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
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/png",
                "cached": "False",
                "clientCacheExpiration": 300,
                "layerType": 'raster'
            },
            "Hidden": {
                "id": "Hidden",
                "name": "Hidden",
                "type": "group",
                "title": "Hidden",
                "abstract": "",
                "link": "",
                "minScale": 1,
                "maxScale": 1000000000000,
                "toggled": "True",
                "popup": "False",
                "popupSource": "auto",
                "popupTemplate": "",
                "popupMaxFeatures": 10,
                "popupDisplayChildren": "False",
                "noLegendImage": "False",
                "groupAsLayer": "False",
                "baseLayer": "False",
                "displayInLegend": "True",
                "singleTile": "True",
                "imageFormat": "image/png",
                "cached": "False",
                "clientCacheExpiration": 300
            }
        })
        const complexeLayerNames = complexeLayers.layerNames;
        expect(complexeLayerNames.length).to.be.eq(6)
        expect(complexeLayerNames).deep.to.eq([
            "IGN",
            "Orthophoto clé ortho",
            "Plan IGN clé essentiels",
            "Orthophotos clé essentiels",
            "OpenStreetMap",
            "Hidden"
        ])
        const complexeLayerIds = complexeLayers.layerIds;
        expect(complexeLayerIds.length).to.be.eq(6)
        expect(complexeLayerIds).deep.to.eq([
            "IGN",
            "Orthophoto_clé_ortho_e5eb448b_9667_4bf3_a28b_d95bd26c85a5",
            "Plan_essentiels_0cdc425e_0e3f_45b7_b439_f090fb8a02ea",
            "Orthophotos_essentiels_993e18ab_ef98_422d_aced_d82d4264b27b",
            "OpenStreetMap_098d6629_1ec4_4c2c_9489_9a44ae09223e",
            "Hidden"
        ])
        const ignGroup = complexeLayers.layerConfigs[0];
        expect(ignGroup).to.be.instanceOf(LayerConfig)
        expect(ignGroup.name).to.be.eq('IGN')
        expect(ignGroup.id).to.be.eq('IGN')
        expect(ignGroup.type).to.be.eq('group')
        expect(complexeLayers.getLayerConfigByLayerName('IGN')).to.be.eq(ignGroup)
        expect(complexeLayers.getLayerConfigByLayerId('IGN')).to.be.eq(ignGroup)
        const osmLayer = complexeLayers.layerConfigs[4];
        expect(osmLayer).to.be.instanceOf(LayerConfig)
        expect(osmLayer.name).to.be.eq('OpenStreetMap')
        expect(osmLayer.id).to.be.eq('OpenStreetMap_098d6629_1ec4_4c2c_9489_9a44ae09223e')
        expect(osmLayer.type).to.be.eq('layer')
        expect(complexeLayers.getLayerConfigByLayerName('OpenStreetMap')).to.be.eq(osmLayer)
        expect(complexeLayers.getLayerConfigByLayerId('OpenStreetMap_098d6629_1ec4_4c2c_9489_9a44ae09223e')).to.be.eq(osmLayer)
        const complexeGetLayerConfigs = complexeLayers.getLayerConfigs()
        expect(complexeGetLayerConfigs.next().value).to.be.eq(ignGroup)
        expect(complexeGetLayerConfigs.next().value).to.be.instanceOf(LayerConfig)
        expect(complexeGetLayerConfigs.next().value).to.be.instanceOf(LayerConfig)
        expect(complexeGetLayerConfigs.next().value).to.be.instanceOf(LayerConfig)
        expect(complexeGetLayerConfigs.next().value).to.be.eq(osmLayer)
        expect(complexeGetLayerConfigs.next().value).to.be.instanceOf(LayerConfig)
    })

    it('getLayerConfigByWmsName', function () {
        const francePartsLayers = new LayersConfig({
            "france_parts bordure": {
                "abstract": "",
                "displayInLegend": "True",
                "popupMaxFeatures": 10,
                "baseLayer": "False",
                "noLegendImage": "False",
                "id": "france_parts_copier20180110163243267",
                "title": "france_parts bordure",
                "singleTile": "True",
                "geometryType": "polygon",
                "groupAsLayer": "False",
                "popupTemplate": "",
                "popup": "False",
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
                "name": "france_parts bordure",
                "cached": "False",
                "type": "layer",
                "maxScale": 1000000000000,
                "popupSource": "lizmap",
                "imageFormat": "image/png",
                "minScale": 1,
                "layerType": 'vector',
                "shortname": "france_parts_bordure",
            },
            "france_parts tuilé en cache": {
                "abstract": "",
                "displayInLegend": "True",
                "popupMaxFeatures": 10,
                "cacheExpiration": 0,
                "baseLayer": "False",
                "noLegendImage": "False",
                "id": "france_parts_copier20180110163329820",
                "title": "france_parts tuilé en cache",
                "singleTile": "False",
                "geometryType": "polygon",
                "groupAsLayer": "False",
                "popupTemplate": "",
                "popup": "False",
                "popupDisplayChildren": "False",
                "clientCacheExpiration": 300,
                "link": "",
                "extent": [
                    -5.1326269187,
                    46.2791909858,
                    3.11792890789,
                    49.7264741072
                ],
                "toggled": "False",
                "crs": "EPSG:4326",
                "name": "france_parts tuilé en cache",
                "cached": "True",
                "type": "layer",
                "maxScale": 1000000000000,
                "popupSource": "lizmap",
                "imageFormat": "image/png",
                "minScale": 1,
                "layerType": 'vector',
                "shortname": "france_parts_tuile",
            },
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
                "minScale": 1,
                "layerType": 'vector',
                "shortname": "france_parts",
            }
        })

        const francePartsLayer = francePartsLayers.getLayerConfigByWmsName('france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29');
        expect(francePartsLayer.name).to.be.eq('france_parts')
        expect(francePartsLayer.id).to.be.eq('france_parts_8d8d649f_7748_43cc_8bde_b013e17ede29')
        expect(francePartsLayer.shortname).to.be.eq('france_parts')

        const francePartsTuileLayer = francePartsLayers.getLayerConfigByWmsName('france_parts_tuile');
        expect(francePartsTuileLayer.name).to.be.eq('france_parts tuilé en cache')
        expect(francePartsTuileLayer.id).to.be.eq('france_parts_copier20180110163329820')
        expect(francePartsTuileLayer.shortname).to.be.eq('france_parts_tuile')

        const francePartsBordureLayer = francePartsLayers.getLayerConfigByWmsName('france_parts bordure');
        expect(francePartsBordureLayer.name).to.be.eq('france_parts bordure')
        expect(francePartsBordureLayer.id).to.be.eq('france_parts_copier20180110163243267')
        expect(francePartsBordureLayer.shortname).to.be.eq('france_parts_bordure')

        expect(francePartsLayers.getLayerConfigByWmsName('unknown')).to.be.null
    })

    it('ValidationError', function () {
        try {
            new LayersConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('RangeError', function () {
        const layers  = new LayersConfig({})
        try {
            layers.getLayerConfigByLayerName('IGN')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer name `IGN` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
        try {
            layers.getLayerConfigByLayerId('IGN')
        } catch (error) {
            expect(error.name).to.be.eq('RangeError')
            expect(error.message).to.be.eq('The layer id `IGN` is unknown!')
            expect(error).to.be.instanceOf(RangeError)
        }
    })
})
