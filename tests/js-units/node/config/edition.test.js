import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { EditionCapabilitiesConfig, EditionLayerConfig, EditionLayersConfig } from 'assets/src/modules/config/Edition.js';

describe('EditionCapabilitiesConfig', function () {
    it('Valid', function () {
        const capabilities = new EditionCapabilitiesConfig({
            "createFeature": "True",
            "modifyAttribute": "True",
            "modifyGeometry": "False",
            "deleteFeature": "False"
        })
        expect(capabilities.createFeature).to.be.eq(true)
        expect(capabilities.modifyAttribute).to.be.eq(true)
        expect(capabilities.modifyGeometry).to.be.eq(false)
        expect(capabilities.deleteFeature).to.be.eq(false)
    })

    it('ValidationError', function () {
        try {
            new EditionCapabilitiesConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('EditionLayerConfig', function () {
    it('Valid', function () {
        const layer = new EditionLayerConfig("tram_stop_work", {
            "layerId": "tram_stop_work20150416102656130",
            "geometryType": "none",
            "capabilities": {
                "createFeature": "True",
                "modifyAttribute": "True",
                "modifyGeometry": "False",
                "deleteFeature": "True"
            },
            "acl": "",
            "order": 3
        })
        expect(layer.id).to.be.eq('tram_stop_work20150416102656130')
        expect(layer.name).to.be.eq('tram_stop_work')
        expect(layer.geometryType).to.be.eq('none')
        expect(layer.capabilities).to.not.be.eq(undefined)
        expect(layer.capabilities.createFeature).to.be.eq(true)
        expect(layer.capabilities.modifyAttribute).to.be.eq(true)
        expect(layer.capabilities.modifyGeometry).to.be.eq(false)
        expect(layer.capabilities.deleteFeature).to.be.eq(true)
        expect(layer.acl).to.be.eq('')
        expect(layer.order).to.be.eq(3)
    })

    it('ValidationError', function () {
        try {
            new EditionLayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layerName parameter is mandatory!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new EditionLayerConfig('v_cat')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new EditionLayerConfig("tramstop", {
                "layerId": "tramstop20150328114203878",
                "geometryType": "point",
                "acl": "",
                "order": 4
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `capabilities` in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('EditionLayersConfig', function () {
    it('Valid', function () {
        const config = new EditionLayersConfig({
            "points of interest": {
                "layerId": "edition_point20130118171631518",
                "geometryType": "point",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "False",
                    "modifyGeometry": "False",
                    "deleteFeature": "False"
                },
                "acl": "",
                "order": 0
            },
            "edition_line": {
                "layerId": "edition_line20130409161630329",
                "geometryType": "line",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "True",
                    "modifyGeometry": "False",
                    "deleteFeature": "False"
                },
                "acl": "",
                "order": 1
            },
            "areas_of_interest": {
                "layerId": "edition_polygon20130409114333776",
                "geometryType": "polygon",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "True",
                    "modifyGeometry": "True",
                    "deleteFeature": "True"
                },
                "acl": "",
                "order": 2
            }
        })

        const configLayerNames = config.layerNames;
        expect(configLayerNames.length).to.be.eq(3)
        expect(configLayerNames).deep.to.eq([
            "points of interest",
            "edition_line",
            "areas_of_interest"
        ])
        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(3)
        expect(configLayerIds).deep.to.eq([
            "edition_point20130118171631518",
            "edition_line20130409161630329",
            "edition_polygon20130409114333776"
        ])

        const layer = config.layerConfigs[1];
        expect(layer.id).to.be.eq("edition_line20130409161630329")
        expect(layer.name).to.be.eq("edition_line")
        expect(layer.geometryType).to.be.eq('line')
        expect(layer.capabilities).to.not.be.eq(undefined)
        expect(layer.capabilities.createFeature).to.be.eq(true)
        expect(layer.capabilities.modifyAttribute).to.be.eq(true)
        expect(layer.capabilities.modifyGeometry).to.be.eq(false)
        expect(layer.capabilities.deleteFeature).to.be.eq(false)
        expect(layer.acl).to.be.eq('')
        expect(layer.order).to.be.eq(1)

        const disorderConfig = new EditionLayersConfig({
            "points of interest": {
                "layerId": "edition_point20130118171631518",
                "geometryType": "point",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "False",
                    "modifyGeometry": "False",
                    "deleteFeature": "False"
                },
                "acl": "",
                "order": 0
            },
            "edition_line": {
                "layerId": "edition_line20130409161630329",
                "geometryType": "line",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "True",
                    "modifyGeometry": "False",
                    "deleteFeature": "False"
                },
                "acl": "",
                "order": 1
            },
            "areas_of_interest": {
                "layerId": "edition_polygon20130409114333776",
                "geometryType": "polygon",
                "capabilities": {
                    "createFeature": "True",
                    "modifyAttribute": "True",
                    "modifyGeometry": "True",
                    "deleteFeature": "True"
                },
                "acl": "",
                "order": 2
            }
        })

        const disorderConfigLayerNames = disorderConfig.layerNames;
        expect(disorderConfigLayerNames.length).to.be.eq(3)
        expect(disorderConfigLayerNames).deep.to.eq(configLayerNames)

        const disorderConfigLayerIds = disorderConfig.layerIds;
        expect(disorderConfigLayerIds.length).to.be.eq(3)
        expect(disorderConfigLayerIds).deep.to.eq(configLayerIds)
    })
})
