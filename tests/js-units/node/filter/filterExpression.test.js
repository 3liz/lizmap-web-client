import { expect } from 'chai';

import { combineFilters } from 'assets/src/modules/filter/FilterExpression.js';

describe('combineFilters', function () {
    it('Returns null when nothing can be combined', function () {
        expect(combineFilters([])).to.be.null;
        expect(combineFilters([null])).to.be.null;
        expect(combineFilters([undefined])).to.be.null;
        expect(combineFilters([''])).to.be.null;
        expect(combineFilters(['   '])).to.be.null;
        expect(combineFilters([null, undefined, '', '  '])).to.be.null;
    });

    it('Returns a single filter unchanged', function () {
        expect(combineFilters(['"a" = 1'])).to.be.eq('"a" = 1');
        expect(combineFilters([null, '"a" = 1', ''])).to.be.eq('"a" = 1');
    });

    it('Joins several filters with AND', function () {
        expect(combineFilters(['"a" = 1', '"b" = 2'])).to.be.eq('"a" = 1 AND "b" = 2');
        expect(combineFilters(['"a" = 1', '"b" = 2', '"c" = 3'])).to.be.eq('"a" = 1 AND "b" = 2 AND "c" = 3');
    });

    it('Skips empty entries but keeps the order of the others', function () {
        expect(combineFilters([null, '"a" = 1', '', '"b" = 2', undefined])).to.be.eq('"a" = 1 AND "b" = 2');
        expect(combineFilters(['"b" = 2', '"a" = 1'])).to.be.eq('"b" = 2 AND "a" = 1');
    });

    it('Does not trim the fragments it keeps', function () {
        expect(combineFilters([' "a" = 1 ', '"b" = 2'])).to.be.eq(' "a" = 1  AND "b" = 2');
    });

    it('Does not mutate its input', function () {
        const filters = ['"a" = 1', null, '"b" = 2'];
        combineFilters(filters);
        expect(filters).to.deep.eq(['"a" = 1', null, '"b" = 2']);
    });
});
