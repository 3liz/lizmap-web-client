import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../assets/src/modules/Errors.js';
import { Extent } from '../../../assets/src/modules/config/Tools.js';
import { BaseObjectConfig } from '../../../assets/src/modules/config/Base.js';

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
