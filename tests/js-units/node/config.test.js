import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../assets/src/modules/Errors.js';
import { Metadata, Extent, Options, Config } from '../../../assets/src/modules/Config.js';

describe('Metadata', function () {
    it('Empty metadata', function () {
        const mt = new Metadata();
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.1.8')
        expect(mt.lizmap_plugin_version).to.be.eq(30108)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30200)
        expect(mt.project_valid).to.be.eq(null)
        expect(mt.qgis_desktop_version).to.be.eq(30000)
    })

    it('From object metadata', function () {
        const mt = new Metadata({
            lizmap_plugin_version_str: '3.8.1',
            lizmap_plugin_version: 30801,
            lizmap_web_client_target_version: 30503,
            project_valid: true,
            qgis_desktop_version: 32200,
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.8.1')
        expect(mt.lizmap_plugin_version).to.be.eq(30801)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30503)
        expect(mt.project_valid).to.be.eq(true)
        expect(mt.qgis_desktop_version).to.be.eq(32200)
    })
})

describe('Extent', function () {
    it('Valid', function () {
        let ext = new Extent(-1,-1,1,1)
        expect(ext.length).to.be.eq(4)
        expect(ext[0]).to.be.eq(-1)
        expect(ext[1]).to.be.eq(-1)
        expect(ext[2]).to.be.eq(1)
        expect(ext[3]).to.be.eq(1)
        expect(ext.xmin).to.be.eq(-1)
        expect(ext.ymin).to.be.eq(-1)
        expect(ext.xmax).to.be.eq(1)
        expect(ext.ymax).to.be.eq(1)

        ext = new Extent('-2','-2.0','2','2.0')
        expect(ext.length).to.be.eq(4)
        expect(ext[0]).to.be.eq(-2)
        expect(ext[1]).to.be.eq(-2)
        expect(ext[2]).to.be.eq(2)
        expect(ext[3]).to.be.eq(2)
        expect(ext.xmin).to.be.eq(-2)
        expect(ext.ymin).to.be.eq(-2)
        expect(ext.xmax).to.be.eq(2)
        expect(ext.ymax).to.be.eq(2)
    })

    it('ValidationError', function () {
        try {
            new Extent()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Not enough arguments for Extent constructor!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Extent(-1,-1,1,1,'EPSG:4326')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Too many arguments for Extent constructor!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('ConversionError', function () {
        try {
            new Extent(-1,-1,'error',1)
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`error` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})

describe('Options', function () {
    it('Valid', function () {
        const opt = new Options({
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
            new Options()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The `options` in the config is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Options({})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The `options` in the config is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('ConversionError', function () {
        try {
            new Options({hideProject: 'not hide'})
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`not hide` is not an expected boolean: true, t, yes, y, 1, false, f, no, n or 0!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            new Options({
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

describe('Config', function () {
    it('ValidationError', function () {
        try {
            new Config()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The config is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The config is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({layers:{}, datavizLayers:{}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `options` in the config!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({options:{}, layers:{}, datavizLayers:{}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `hideProject` in `options` in the config!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
