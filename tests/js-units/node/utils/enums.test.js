import { expect } from 'chai';

import { createEnum } from 'assets/src/modules/utils/Enums.js';

describe('createEnum', function () {
    it('Valid', function () {
        const Sizes = createEnum({
            Small: 'small',
            Medium: 'medium',
            Large: 'large',
        });

        const mySize = Sizes.Medium
        expect(mySize).to.be.eq(Sizes.Medium)
        expect(mySize).to.be.eq('medium')
        expect(Sizes.Small).to.be.eq('small')
        expect(Sizes.Medium).to.be.eq('medium')
        expect(Sizes.Large).to.be.eq('large')

        const Seasons = createEnum({
            'Winter': 0,
            'Spring': 1,
            'Summer': 2,
            'Autumn': 3
        });

        const mySeason = Seasons.Summer
        expect(mySeason).to.be.eq(Seasons.Summer)
        expect(mySeason).to.be.eq(2)
        expect(Seasons.Winter).to.be.eq(0)
        expect(Seasons.Spring).to.be.eq(1)
        expect(Seasons.Summer).to.be.eq(2)
        expect(Seasons.Autumn).to.be.eq(3)

        const Bool = createEnum({
            'Yes': true,
            'No': false,
            'Undefined': undefined,
        });
        const myRespond = Bool.Yes
        expect(myRespond).to.be.eq(Bool.Yes)
        expect(myRespond).to.be.true
        expect(Bool.Yes).to.be.true
        expect(Bool.No).to.be.false
        expect(Bool.Undefined).to.be.undefined
    })

    it('Errors', function () {
        try {
            createEnum('error')
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('\'error\' is not a valid enum structure.')
            expect(error).to.be.instanceOf(TypeError)
        }

        try {
            createEnum(['Winter', 'Spring', 'Summer', 'Autumn'])
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('\'Winter,Spring,Summer,Autumn\' is not a valid enum structure.')
            expect(error).to.be.instanceOf(TypeError)
        }

        try {
            createEnum({
                Small: {},
                Medium: 'medium',
                Large: 'large',
            })
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('You are only allowed to use \'number\', \'string\', \'boolean\' or \'undefined\' types, but you are using \'{}\'')
            expect(error).to.be.instanceOf(TypeError)
        }

        const Sizes = createEnum({
            Small: 'small',
            Medium: 'medium',
            Large: 'large',
        })
        try {
            Sizes.Small = 0
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Cannot assign to read only property \'Small\' of an Enum.')
            expect(error).to.be.instanceOf(TypeError)
        }

        try {
            Sizes.XLarge
        } catch (error) {
            expect(error.name).to.be.eq('TypeError')
            expect(error.message).to.be.eq('Property \'XLarge\' does not exist in the Enum.')
            expect(error).to.be.instanceOf(TypeError)
        }
    })
})
