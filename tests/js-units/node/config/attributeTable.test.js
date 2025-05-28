import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { AttributeLayerConfig, AttributeLayersConfig } from 'assets/src/modules/config/AttributeTable.js';

describe('AttributeLayerConfig', function () {
    it('Valid', function () {
        const layer = new AttributeLayerConfig("Quartiers", {
            "primaryKey": "QUARTMNO",
            "pivot": "False",
            "hideAsChild": "False",
            "hideLayer": "",
            "layerId": "VilleMTP_MTP_Quartiers_2011_432620130116112610876",
            "order": 7
        });
        expect(layer.id).to.be.eq('VilleMTP_MTP_Quartiers_2011_432620130116112610876')
        expect(layer.name).to.be.eq('Quartiers')
        expect(layer.primaryKey).to.be.eq('QUARTMNO')
        expect(layer.hiddenFields).to.be.eq('')
        expect(layer.pivot).to.be.eq(false)
        expect(layer.hideAsChild).to.be.eq(false)
        expect(layer.hideLayer).to.be.eq(false)
        expect(layer.order).to.be.eq(7)
    })

    it('ValidationError', function () {
        try {
            new AttributeLayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layerName parameter is mandatory!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new AttributeLayerConfig('v_cat')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})


describe('AttributeLayersConfig', function () {
    it('Valid', function () {
        const config = new AttributeLayersConfig({
            "tramstop": {
                "primaryKey": "osm_id",
                "pivot": "False",
                "hideAsChild": "",
                "hideLayer": "",
                "layerId": "tramstop20150328114203878",
                "order": 0
            },
            "tramway_pivot": {
                "primaryKey": "OGC_FID",
                "hiddenFields": "OGC_FID",
                "pivot": "True",
                "hideAsChild": "",
                "hideLayer": "",
                "layerId": "jointure_tram_stop20150328114216806",
                "order": 1
            },
            "tram_stop_work": {
                "primaryKey": "work_id",
                "pivot": "False",
                "hideAsChild": "",
                "hideLayer": "True",
                "layerId": "tram_stop_work20150416102656130",
                "order": 2
            }
        })

        const configLayerNames = config.layerNames;
        expect(configLayerNames.length).to.be.eq(3)
        expect(configLayerNames).deep.to.eq([
            "tramstop",
            "tramway_pivot",
            "tram_stop_work"
        ])
        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(3)
        expect(configLayerIds).deep.to.eq([
            "tramstop20150328114203878",
            "jointure_tram_stop20150328114216806",
            "tram_stop_work20150416102656130"
        ])

        const layer = config.layerConfigs[1]
        expect(layer.id).to.be.eq('jointure_tram_stop20150328114216806')
        expect(layer.name).to.be.eq('tramway_pivot')
        expect(layer.primaryKey).to.be.eq('OGC_FID')
        expect(layer.hiddenFields).to.be.eq('OGC_FID')
        expect(layer.pivot).to.be.eq(true)
        expect(layer.hideAsChild).to.be.eq(false)
        expect(layer.hideLayer).to.be.eq(false)
        expect(layer.order).to.be.eq(1)

        const disorderConfig = new AttributeLayersConfig({
            "tramstop": {
                "primaryKey": "osm_id",
                "pivot": "False",
                "hideAsChild": "",
                "hideLayer": "",
                "layerId": "tramstop20150328114203878",
                "order": 0
            },
            "tram_stop_work": {
                "primaryKey": "work_id",
                "pivot": "False",
                "hideAsChild": "",
                "hideLayer": "True",
                "layerId": "tram_stop_work20150416102656130",
                "order": 2
            },
            "tramway_pivot": {
                "primaryKey": "OGC_FID",
                "hiddenFields": "OGC_FID",
                "pivot": "True",
                "hideAsChild": "",
                "hideLayer": "",
                "layerId": "jointure_tram_stop20150328114216806",
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
