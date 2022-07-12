import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../assets/src/modules/Errors.js';
import { Extent } from '../../../assets/src/modules/config/Tools.js';
import { LayerConfig } from '../../../assets/src/modules/config/Layer.js';

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
            "popupFrame": null,
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
            "serverFrame": null,
            "clientCacheExpiration": 300,
            "mutuallyExclusive": "True"
        });
        expect(group.id).to.be.eq('IGN')
        expect(group.name).to.be.eq('IGN')
        expect(group.shortname).to.be.eq(null)
        expect(group.title).to.be.eq('IGN')
        expect(group.abstract).to.be.eq('')
        expect(group.link).to.be.eq('')
        expect(group.type).to.be.eq('group')
        expect(group.minScale).to.be.eq(1)
        expect(group.maxScale).to.be.eq(1000000000000)
        expect(group.geometryType).to.be.eq(null)
        expect(group.extent).to.be.eq(null)
        expect(group.crs).to.be.eq(null)
        expect(group.toggled).to.be.eq(true)
        expect(group.popup).to.be.eq(false)
        expect(group.popupFrame).to.be.eq(null)
        expect(group.popupSource).to.be.eq('auto')
        expect(group.popupTemplate).to.be.eq('')
        expect(group.popupMaxFeatures).to.be.eq(10)
        expect(group.popupDisplayChildren).to.be.eq(false)
        expect(group.noLegendImage).to.be.eq(false)
        expect(group.groupAsLayer).to.be.eq(false)
        expect(group.baseLayer).to.be.eq(false)
        expect(group.displayInLegend).to.be.eq(true)
        expect(group.singleTile).to.be.eq(true)
        expect(group.imageFormat).to.be.eq('image/png')
        expect(group.cached).to.be.eq(false)
        expect(group.serverFrame).to.be.eq(null)
        expect(group.clientCacheExpiration).to.be.eq(300)
        expect(group.mutuallyExclusive).to.be.eq(true)

        const layer = new LayerConfig({
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
            "popupFrame": null,
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
            "serverFrame": null,
            "clientCacheExpiration": 300,
            "shortname": "null_island_qgis_info"
        });
        expect(layer.id).to.be.eq('null_island20200414115730489')
        expect(layer.name).to.be.eq('null_island OGRGeoJSON Point')
        expect(layer.shortname).to.be.eq('null_island_qgis_info')
        expect(layer.title).to.be.eq('Null island with QGIS info')
        expect(layer.abstract).to.be.eq('The null island with QGIS information : version and release name.')
        expect(layer.link).to.be.eq('')
        expect(layer.type).to.be.eq('layer')
        expect(layer.minScale).to.be.eq(1)
        expect(layer.maxScale).to.be.eq(1000000000000)
        expect(layer.geometryType).to.be.eq('point')
        expect(layer.extent).to.be.instanceOf(Extent)
        expect(layer.extent.length).to.be.eq(4)
        expect(layer.extent[0]).to.be.eq(0)
        expect(layer.extent[1]).to.be.eq(0)
        expect(layer.extent[2]).to.be.eq(0)
        expect(layer.extent[3]).to.be.eq(0)
        expect(layer.crs).to.be.eq('EPSG:4326')
        expect(layer.toggled).to.be.eq(true)
        expect(layer.popup).to.be.eq(true)
        expect(layer.popupFrame).to.be.eq(null)
        expect(layer.popupSource).to.be.eq('auto')
        expect(layer.popupTemplate).to.be.eq('')
        expect(layer.popupMaxFeatures).to.be.eq(10)
        expect(layer.popupDisplayChildren).to.be.eq(false)
        expect(layer.noLegendImage).to.be.eq(false)
        expect(layer.groupAsLayer).to.be.eq(false)
        expect(layer.baseLayer).to.be.eq(false)
        expect(layer.displayInLegend).to.be.eq(true)
        expect(layer.singleTile).to.be.eq(true)
        expect(layer.imageFormat).to.be.eq('image/png')
        expect(layer.cached).to.be.eq(false)
        expect(layer.serverFrame).to.be.eq(null)
        expect(layer.clientCacheExpiration).to.be.eq(300)
        expect(layer.mutuallyExclusive).to.be.eq(false)
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
