import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { LocateLayerConfig, LocateByLayerConfig } from 'assets/src/modules/config/Locate.js';

describe('LocateLayerConfig', function () {
    it('Valid', function () {
        const layer = new LocateLayerConfig("v_cat", {
            "layerId":"v_cat20180426181713938",
            "fieldName":"cat_name",
            "displayGeom":"True",
            "minLength":0,
            "filterOnLocate":"False",
            "order":0
        });
        expect(layer.id).to.be.eq('v_cat20180426181713938')
        expect(layer.name).to.be.eq('v_cat')
        expect(layer.fieldName).to.be.eq('cat_name')
        expect(layer.minLength).to.be.eq(0)
        expect(layer.displayGeom).to.be.eq(true)
        expect(layer.filterOnLocate).to.be.eq(false)
        expect(layer.order).to.be.eq(0)
    })

    it('ValidationError', function () {
        try {
            new LocateLayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layerName parameter is mandatory!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new LocateLayerConfig('v_cat')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})


describe('LocateByLayerConfig', function () {
    it('Valid', function () {
        const config = new LocateByLayerConfig({
            "Quartiers": {
                "fieldName": "LIBQUART",
                "displayGeom": "True",
                "minLength": 1,
                "filterOnLocate": "",
                "layerId": "VilleMTP_MTP_Quartiers_2011_432620130116112610876",
                "order": 0
            },
            "SousQuartiers": {
                "fieldName": "LIBSQUART",
                "displayGeom": "True",
                "minLength": 0,
                "filterOnLocate": "False",
                "layerId": "SousQuartiers20160121124316563",
                "order": 1
            },
            "tramway": {
                "fieldName": "name",
                "displayGeom": "False",
                "minLength": 0,
                "filterOnLocate": "True",
                "layerId": "tramway20150328114206278",
                "order": 2
            }
        })

        const configLayerNames = config.layerNames;
        expect(configLayerNames.length).to.be.eq(3)
        expect(configLayerNames).deep.to.eq([
            "Quartiers",
            "SousQuartiers",
            "tramway"
        ])
        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(3)
        expect(configLayerIds).deep.to.eq([
            "VilleMTP_MTP_Quartiers_2011_432620130116112610876",
            "SousQuartiers20160121124316563",
            "tramway20150328114206278"
        ])

        const layer = config.layerConfigs[1]
        expect(layer.id).to.be.eq('SousQuartiers20160121124316563')
        expect(layer.name).to.be.eq('SousQuartiers')
        expect(layer.fieldName).to.be.eq('LIBSQUART')
        expect(layer.minLength).to.be.eq(0)
        expect(layer.displayGeom).to.be.eq(true)
        expect(layer.filterOnLocate).to.be.eq(false)
        expect(layer.order).to.be.eq(1)

        const disorderConfig = new LocateByLayerConfig({
            "Quartiers": {
                "fieldName": "LIBQUART",
                "displayGeom": "True",
                "minLength": 1,
                "filterOnLocate": "",
                "layerId": "VilleMTP_MTP_Quartiers_2011_432620130116112610876",
                "order": 0
            },
            "tramway": {
                "fieldName": "name",
                "displayGeom": "False",
                "minLength": 0,
                "filterOnLocate": "True",
                "layerId": "tramway20150328114206278",
                "order": 2
            },
            "SousQuartiers": {
                "fieldName": "LIBSQUART",
                "displayGeom": "True",
                "minLength": 0,
                "filterOnLocate": "False",
                "layerId": "SousQuartiers20160121124316563",
                "order": 1
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
