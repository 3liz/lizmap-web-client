import { expect } from 'chai';

import { ConversionError } from 'assets/src/modules/Errors.js';
import { convertNumber, convertBoolean, convertArray, hashCode } from 'assets/src/modules/utils/Converters.js';

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

describe('convertArray', function () {
    it('Valid', function () {
        let arr = convertArray(['a', 'b'])
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq(['a', 'b'])

        arr = convertArray([1, 2])
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq([1, 2])

        arr = convertArray('a, b')
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq(['a', 'b'])

        arr = convertArray('1, 2', 'number')
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq([1, 2])

        arr = convertArray('t, f', 'boolean')
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq([true, false])

        arr = convertArray([1, true, 'a'], 'string')
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq(['1', 'true', 'a'])

        arr = convertArray([1, true, 'a'], undefined)
        expect(arr).to.be.an('array')
        expect(arr).to.be.deep.eq([1, true, 'a'])
    })

    it('ConversionError', function () {
        try {
            convertArray(2)
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('\'2\' could not be converted to array!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            convertArray({})
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('\'{}\' could not be converted to array!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            convertArray([1, true, 'a'], 'boolean')
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`a` is not an expected boolean: true, t, yes, y, 1, false, f, no, n, 0 or empty string ``!')
            expect(error).to.be.instanceOf(ConversionError)
        }

        try {
            convertArray([1, true, 'a'], 'number')
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`a` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})

describe('hashCode', function () {
    it('Valid', function () {
        expect(hashCode('')).to.be.eq(0)
        expect(hashCode('Hello')).to.be.eq(69609650)
        expect(hashCode('HeLLo')).to.be.eq(69577906)
        expect(hashCode(JSON.stringify({
            type: 'layer.visibility.change',
            name: 'Quartiers',
            visibility: true,
        }))).to.be.eq(391836828)
    })
})
