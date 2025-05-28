import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { TooltipLayerConfig, TooltipLayersConfig } from 'assets/src/modules/config/Tooltip.js';

describe('TooltipLayerConfig', function () {
    it('Valid', function () {
        const layer = new TooltipLayerConfig("tramstop", {
            "fields": "osm_id,name",
            "displayGeom": "True",
            "colorGeom": "red",
            "layerId": "tramstop20150328114203878",
            "order": 0
        })
        expect(layer.id).to.be.eq('tramstop20150328114203878')
        expect(layer.name).to.be.eq('tramstop')
        expect(layer.fields).to.be.eq('osm_id,name')
        expect(layer.displayGeom).to.be.eq(true)
        expect(layer.colorGeom).to.be.eq('red')
        expect(layer.order).to.be.eq(0)
    })

    it('ValidationError', function () {
        try {
            new TooltipLayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layerName parameter is mandatory!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new TooltipLayerConfig('v_cat')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})


describe('TooltipLayersConfig', function () {
    it('Valid', function () {
        const config = new TooltipLayersConfig({
            "tramstop": {
                "fields": "osm_id,name",
                "displayGeom": "True",
                "colorGeom": "red",
                "layerId": "tramstop20150328114203878",
                "order": 0
            },
            "Quartiers": {
                "fields": "LIBQUART",
                "displayGeom": "True",
                "colorGeom": "black",
                "layerId": "VilleMTP_MTP_Quartiers_2011_432620130116112610876",
                "order": 1
            }
        })

        const configLayerNames = config.layerNames;
        expect(configLayerNames.length).to.be.eq(2)
        expect(configLayerNames).deep.to.eq([
            "tramstop",
            "Quartiers"
        ])
        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(2)
        expect(configLayerIds).deep.to.eq([
            "tramstop20150328114203878",
            "VilleMTP_MTP_Quartiers_2011_432620130116112610876"
        ])

        const layer = config.layerConfigs[0];
        expect(layer.id).to.be.eq("tramstop20150328114203878")
        expect(layer.name).to.be.eq("tramstop")
        expect(layer.fields).to.be.eq('osm_id,name')
        expect(layer.displayGeom).to.be.eq(true)
        expect(layer.colorGeom).to.be.eq('red')
        expect(layer.order).to.be.eq(0)

        const disorderConfig = new TooltipLayersConfig({
            "Quartiers": {
                "fields": "LIBQUART",
                "displayGeom": "True",
                "colorGeom": "black",
                "layerId": "VilleMTP_MTP_Quartiers_2011_432620130116112610876",
                "order": 1
            },
            "tramstop": {
                "fields": "osm_id,name",
                "displayGeom": "True",
                "colorGeom": "red",
                "layerId": "tramstop20150328114203878",
                "order": 0
            }
        })

        const disorderConfigLayerNames = disorderConfig.layerNames;
        expect(disorderConfigLayerNames.length).to.be.eq(2)
        expect(disorderConfigLayerNames).deep.to.eq(configLayerNames)

        const disorderConfigLayerIds = disorderConfig.layerIds;
        expect(disorderConfigLayerIds.length).to.be.eq(2)
        expect(disorderConfigLayerIds).deep.to.eq(configLayerIds)
    })
})
