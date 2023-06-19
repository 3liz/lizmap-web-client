import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../../assets/src/modules/Errors.js';
import { Extent } from '../../../../assets/src/modules/utils/Extent.js';
import { OptionsConfig } from '../../../../assets/src/modules/config/Options.js';

describe('OptionsConfig', function () {
    it('Valid', function () {
        const opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true
        })
        expect(opt.hideProject).to.be.eq(true)

        expect(opt.bbox).to.be.instanceOf(Extent)
        expect(opt.bbox.length).to.be.eq(4)
        expect(opt.bbox[0]).to.be.eq(-3.5)
        expect(opt.bbox[1]).to.be.eq(-1)
        expect(opt.bbox[2]).to.be.eq(3.5)
        expect(opt.bbox[3]).to.be.eq(1)

        expect(opt.initialExtent).to.be.instanceOf(Extent)
        expect(opt.initialExtent.length).to.be.eq(4)
        expect(opt.initialExtent[0]).to.be.eq(-3.5)
        expect(opt.initialExtent[1]).to.be.eq(-1)
        expect(opt.initialExtent[2]).to.be.eq(3.5)
        expect(opt.initialExtent[3]).to.be.eq(1)

        // default value
        expect(opt.wmsMaxHeight).to.be.eq(3000)
        expect(opt.wmsMaxWidth).to.be.eq(3000)
        expect(opt.fixed_scale_overview_map).to.be.eq(true)
    })
    it('ValidationError', function () {
        try {
            new OptionsConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The `options` in the config is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new OptionsConfig({})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The `options` in the config is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new OptionsConfig({hideProject: 'not hide'})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: hideProject\n- The required properties: bbox,initialExtent,mapScales,minScale,maxScale,projection,pointTolerance,lineTolerance,polygonTolerance,popupLocation,datavizLocation')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('ConversionError', function () {
        try {
            new OptionsConfig({
                "hideProject": "True",
                "bbox": [
                    "-3.5",
                    "-1.0",
                    "3.5",
                    "1.0"
                ],
                "initialExtent": [
                    -3.5,
                    -1.0,
                    3.5,
                    1.0
                ],
                "mapScales": [
                    10000,
                    25000,
                    50000,
                    100000,
                    250000,
                    500000
                ],
                "minScale": 'error',
                "maxScale": 500000,
                "projection": {
                    "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                    "ref": "EPSG:4326"
                },
                "pointTolerance": 25,
                "lineTolerance": 10,
                "polygonTolerance": 5,
                "popupLocation": "dock",
                "datavizLocation": "dock"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`error` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})
