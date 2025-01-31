import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { Extent } from 'assets/src/modules/utils/Extent.js';
import { BaseObjectConfig, BaseObjectLayerConfig, BaseObjectLayersConfig } from 'assets/src/modules/config/BaseObject.js';

describe('BaseObjectConfig', function () {
    it('Valid', function () {
        const cfg = {
            a: 1,
            b: 'true',
            c: 'test',
            d: [-1, -2, 1, 2],
            e: null
        };
        const required = {
            a: {type: 'number'},
            b: {type: 'boolean'},
            c: {type: 'string'},
            d: {type: 'extent'},
        };
        const optional = {
            e: {type: 'boolean', nullable: true},
            f: {type: 'boolean', default: false},
        };

        const bo = new BaseObjectConfig(cfg, required, optional);

        expect(bo._a).to.be.eq(1)
        expect(bo._b).to.be.eq(true)
        expect(bo._c).to.be.eq('test')
        expect(bo._d).to.be.instanceOf(Extent)
        expect(bo._e).to.be.eq(null)
        expect(bo._f).to.be.eq(false)
    })

    it('ValidationError', function () {
        let cfg = null;
        const required = {
            a: {type: 'number'},
            b: {type: 'boolean'},
            c: {type: 'string'},
            d: {type: 'extent'},
        };
        const optional = {
            e: {type: 'boolean', nullable: true}
        };

        try {
            new BaseObjectConfig(cfg, required, optional);
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        cfg = {
            a: 1
        };

        try {
            new BaseObjectConfig(cfg, required, optional);
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: a\n- The required properties: a,b,c,d')
            expect(error).to.be.instanceOf(ValidationError)
        }

        cfg = {
            a: 1,
            b: 'true',
            c: 'test',
            e: null
        };

        try {
            new BaseObjectConfig(cfg, required, optional);
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `d` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('ConversionError', function () {
        let cfg = {
            a: 'abcd',
            b: 'true',
            c: 'test',
            d: [-1, -2, 1, 2],
            e: null
        };
        const required = {
            a: {type: 'number'},
            b: {type: 'boolean'},
            c: {type: 'string'},
            d: {type: 'extent'},
        };
        const optional = {
            e: {type: 'boolean', nullable: true}
        };

        try {
            new BaseObjectConfig(cfg, required, optional);
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`abcd` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})

describe('BaseObjectLayerConfig', function () {
    it('Valid', function () {
        const layer = new BaseObjectLayerConfig("v_cat", {
            "layerId":"v_cat20180426181713938",
            "order": 3
        });
        expect(layer.id).to.be.eq('v_cat20180426181713938')
        expect(layer.name).to.be.eq('v_cat')
        expect(layer.order).to.be.eq(3)

        const layerNoOrder = new BaseObjectLayerConfig("v_cat", {
            "layerId":"v_cat20180426181713938"
        });
        expect(layerNoOrder.id).to.be.eq('v_cat20180426181713938')
        expect(layerNoOrder.name).to.be.eq('v_cat')
        expect(layerNoOrder.order).to.be.eq(-1)
    })

    it('ValidationError', function () {
        try {
            new BaseObjectLayerConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layerName parameter is mandatory!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new BaseObjectLayerConfig('v_cat')
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new BaseObjectLayerConfig('v_cat', {})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: \n- The required properties: layerId')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('BaseObjectLayersConfig', function () {
    it('Valid', function () {
        const config = new BaseObjectLayersConfig(BaseObjectLayerConfig, {
            "v_cat": {
                "layerId":"v_cat20180426181713938",
                "order": 3
            },
            "tramstop": {
                "layerId": "tramstop20150328114203878",
                "order": 0
            },
            "tram_stop_work": {
                "layerId": "tram_stop_work20150416102656130",
                "order": 2
            },
            "tramway_pivot": {
                "layerId": "jointure_tram_stop20150328114216806",
                "order": 1
            }
        });

        const configLayerNames = config.layerNames;
        expect(configLayerNames.length).to.be.eq(4)
        expect(configLayerNames).deep.to.eq([
            "tramstop",
            "tramway_pivot",
            "tram_stop_work",
            "v_cat"
        ])
        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(4)
        expect(configLayerIds).deep.to.eq([
            "tramstop20150328114203878",
            "jointure_tram_stop20150328114216806",
            "tram_stop_work20150416102656130",
            "v_cat20180426181713938"
        ])

        const tramstop = config.layerConfigs[0];
        expect(tramstop.id).to.be.eq("tramstop20150328114203878")
        expect(tramstop.name).to.be.eq("tramstop")
        expect(tramstop.order).to.be.eq(0)
        expect(config.layerIds[0]).to.be.eq(tramstop.id)
        expect(config.layerNames[0]).to.be.eq(tramstop.name)
        expect(config.getLayerConfigByLayerName('tramstop')).to.be.eq(tramstop)
        expect(config.getLayerConfigByLayerId('tramstop20150328114203878')).to.be.eq(tramstop)

        const tram_stop_work = config.layerConfigs[2];
        expect(tram_stop_work.id).to.be.eq("tram_stop_work20150416102656130")
        expect(tram_stop_work.name).to.be.eq("tram_stop_work")
        expect(tram_stop_work.order).to.be.eq(2)
        expect(config.layerIds[2]).to.be.eq(tram_stop_work.id)
        expect(config.layerNames[2]).to.be.eq(tram_stop_work.name)
        expect(config.getLayerConfigByLayerName('tram_stop_work')).to.be.eq(tram_stop_work)
        expect(config.getLayerConfigByLayerId('tram_stop_work20150416102656130')).to.be.eq(tram_stop_work)

        const configGetLayerConfigs = config.getLayerConfigs()
        expect(configGetLayerConfigs.next().value).to.be.eq(tramstop)
        expect(configGetLayerConfigs.next().value).to.be.instanceOf(BaseObjectLayerConfig)
        expect(configGetLayerConfigs.next().value).to.be.eq(tram_stop_work)
        expect(configGetLayerConfigs.next().value).to.be.instanceOf(BaseObjectLayerConfig)
    })
})
