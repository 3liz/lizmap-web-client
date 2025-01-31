import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { TimeManagerLayerConfig, TimeManagerLayersConfig } from 'assets/src/modules/config/TimeManager.js';

describe('TimeManagerLayerConfig', function () {
    it('Valid', function () {
        const layer = new TimeManagerLayerConfig("time_manager", {
            "layerId": "time_manager_f272466b_c160_439c_bb9b_6c4b8c5ff74d",
            "startAttribute": "test_date",
            "endAttribute": "test_date",
            "attributeResolution": "days",
            "min_timestamp": "2007-01-01T00:00:00",
            "max_timestamp": "2017-01-01T00:00:00",
            "order": 0
        });
        expect(layer.id).to.be.eq('time_manager_f272466b_c160_439c_bb9b_6c4b8c5ff74d')
        expect(layer.name).to.be.eq('time_manager')
        expect(layer.startAttribute).to.be.eq('test_date')
        expect(layer.endAttribute).to.be.eq('test_date')
        expect(layer.attributeResolution).to.be.eq('days')
        expect(layer.minTimestamp).to.be.eq('2007-01-01T00:00:00')
        expect(layer.maxTimestamp).to.be.eq('2017-01-01T00:00:00')
        expect(layer.order).to.be.eq(0)
    })

    it('ValidationError', function () {
        try {
            new TimeManagerLayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layerName parameter is mandatory!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new TimeManagerLayerConfig('v_cat')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})


describe('TimeManagerLayersConfig', function () {
    it('Valid', function () {
        const config = new TimeManagerLayersConfig({
            "earthquake":{
                "layerId":"earthquake_32c9dd66_2dcd_484c_83c3_a9f3495de8db",
                "startAttribute":"time",
                "endAttribute":"time",
                "attributeResolution":"seconds",
                "min_timestamp":"2020-01-01T04:38:07.864Z",
                "max_timestamp":"2020-12-31T23:12:35.050Z",
                "order":0
            }
        })

        const configLayerNames = config.layerNames;
        expect(configLayerNames.length).to.be.eq(1)
        expect(configLayerNames).deep.to.eq([
            "earthquake"
        ])
        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(1)
        expect(configLayerIds).deep.to.eq([
            "earthquake_32c9dd66_2dcd_484c_83c3_a9f3495de8db"
        ])

        const layer = config.layerConfigs[0]
        expect(layer.id).to.be.eq('earthquake_32c9dd66_2dcd_484c_83c3_a9f3495de8db')
        expect(layer.name).to.be.eq('earthquake')
        expect(layer.startAttribute).to.be.eq('time')
        expect(layer.endAttribute).to.be.eq('time')
        expect(layer.attributeResolution).to.be.eq('seconds')
        expect(layer.minTimestamp).to.be.eq('2020-01-01T04:38:07.864Z')
        expect(layer.maxTimestamp).to.be.eq('2020-12-31T23:12:35.050Z')
        expect(layer.order).to.be.eq(0)
    })
})
