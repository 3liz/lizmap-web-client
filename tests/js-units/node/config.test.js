import { expect } from 'chai';

import { ValidationError } from '../../../assets/src/modules/Errors.js';
import { Config } from '../../../assets/src/modules/Config.js';


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
            expect(error.message).to.be.eq('The `options` in the config is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
