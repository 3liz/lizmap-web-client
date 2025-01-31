import { expect } from 'chai';

import { readFileSync } from 'fs';

import { deepFreeze, getNotContains } from 'assets/src/modules/config/Tools.js';

describe('deepFreeze', function () {
    it('Valid', function () {
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const freezedConfig = deepFreeze(config);

        // Try to add property
        try {
            freezedConfig.foo = 'bar';
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot add property foo, object is not extensible')
            expect(error).to.be.instanceOf(TypeError)
        }

        // Try to change a property
        try {
            freezedConfig.layers = [];
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot assign to read only property \'layers\' of object \'#<Object>\'')
            expect(error).to.be.instanceOf(TypeError)
        }

        // Try to delete a property
        try {
            delete freezedConfig.layers;
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot delete property \'layers\' of #<Object>')
            expect(error).to.be.instanceOf(TypeError)
        }

        // Try to add property
        try {
            freezedConfig.layers.foo = {};
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot add property foo, object is not extensible')
            expect(error).to.be.instanceOf(TypeError)
        }


        // Try to change a property
        try {
            freezedConfig.layers.Quartiers = null;
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot assign to read only property \'Quartiers\' of object \'#<Object>\'')
            expect(error).to.be.instanceOf(TypeError)
        }

        // Try to remove a child property
        try {
            delete freezedConfig.layers.Quartiers;
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot delete property \'Quartiers\' of #<Object>')
            expect(error).to.be.instanceOf(TypeError)
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
