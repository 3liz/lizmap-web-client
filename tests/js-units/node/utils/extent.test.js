import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { Extent } from 'assets/src/modules/utils/Extent.js';

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
        expect(ext.center).to.be.deep.eq([0, 0])

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
        expect(ext.center).to.be.deep.eq([0, 0])

        ext = new Extent(...[-1,-1,1,1])
        expect(ext.length).to.be.eq(4)
        expect(ext[0]).to.be.eq(-1)
        expect(ext[1]).to.be.eq(-1)
        expect(ext[2]).to.be.eq(1)
        expect(ext[3]).to.be.eq(1)
        expect(ext.xmin).to.be.eq(-1)
        expect(ext.ymin).to.be.eq(-1)
        expect(ext.xmax).to.be.eq(1)
        expect(ext.ymax).to.be.eq(1)
        expect(ext.center).to.be.deep.eq([0, 0])
    })

    it('Equals', function () {
        let ext = new Extent(-1,-1,1,1)
        expect(ext.equals([-1,-1,1,1])).to.be.true
        expect(ext.equals([-1,-1,1,0])).to.be.false
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
