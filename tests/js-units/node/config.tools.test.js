import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../assets/src/modules/Errors.js';
import { convertNumber, convertBoolean, getNotContains, Extent } from '../../../assets/src/modules/config/Tools.js';

describe('convertNumber', function () {
    it('Valid', function () {
        let num = convertNumber(1)
        expect(num).to.be.a('number')
        expect(num).to.be.eq(1)

        num = convertNumber(1.0)
        expect(num).to.be.a('number')
        expect(num).to.be.eq(1)

        num = convertNumber('1')
        expect(num).to.be.a('number')
        expect(num).to.be.eq(1)

        num = convertNumber('1.0')
        expect(num).to.be.a('number')
        expect(num).to.be.eq(1)

        num = convertNumber(-1)
        expect(num).to.be.a('number')
        expect(num).to.be.eq(-1)

        num = convertNumber(-1.0)
        expect(num).to.be.a('number')
        expect(num).to.be.eq(-1)

        num = convertNumber('-1')
        expect(num).to.be.a('number')
        expect(num).to.be.eq(-1)

        num = convertNumber('-1.0')
        expect(num).to.be.a('number')
        expect(num).to.be.eq(-1)
    })

    it('ConversionError', function () {
        try {
            convertNumber('error')
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`error` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})

describe('convertBoolean', function () {
    it('Valid', function () {
        let bool = convertBoolean(true)
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean(1)
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean('true')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean('t')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean('yes')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean('y')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean('1')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(true)

        bool = convertBoolean(false)
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean(0)
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean('false')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean('f')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean('no')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean('n')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean('0')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean('')
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)

        bool = convertBoolean(null)
        expect(bool).to.be.a('boolean')
        expect(bool).to.be.eq(false)
    })

    it('ConversionError', function () {
        try {
            convertBoolean(2)
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`2` is not an expected boolean: 1 or 0!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            convertBoolean('error')
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`error` is not an expected boolean: true, t, yes, y, 1, false, f, no, n, 0 or empty string ``!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            convertBoolean(['error'])
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('The Array `[error]` is not an expected boolean!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            convertBoolean({})
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('The Object is not an expected boolean!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})
describe('getNotContains', function () {
    it('Valid', function () {
        let result = getNotContains(['a', 'b'], ['a', 'b'])
        expect(result.length).to.be.eq(0)

        result = getNotContains(['a'], ['a', 'b'])
        expect(result.length).to.be.eq(0)

        result = getNotContains(['a', 'b', 'c'], ['a', 'b'])
        expect(result.length).to.be.eq(1)

        result = getNotContains(['a', 'b', 'c'], ['a', 'c'])
        expect(result.length).to.be.eq(1)
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
