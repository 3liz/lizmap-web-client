import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../../assets/src/modules/Errors.js';
import EventDispatcher from '../../../../assets/src/utils/EventDispatcher.js';
import { Extent } from '../../../../assets/src/modules/utils/Extent.js';
import { MapState } from '../../../../assets/src/modules/state/Map.js';

describe('MapState', function () {
    it('Valid', function () {
        let mapState = new MapState();
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState).to.be.instanceOf(EventDispatcher)

        // Initial state
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        expect(mapState.resolution).to.be.eq(-1)
        expect(mapState.scaleDenominator).to.be.eq(-1)
        expect(mapState.pointResolution).to.be.eq(-1)
        expect(mapState.pointScaleDenominator).to.be.eq(-1)

        // Update all properties
        mapState.update({
            "type": "map.state.changing",
            "projection": "EPSG:3857",
            "center": [
              432082.33132450003,
              5404877.667855
            ],
            "size": [
              1822,
              634
            ],
            "extent": [
              397265.26494544884,
              5392762.398873487,
              466899.3977035512,
              5416992.936836514
            ],
            "resolution": 38.218514137268066,
            "scaleDenominator": 144447.63855208742,
            "pointResolution": 27.673393466176645,
            "pointScaleDenominator": 104592.14407328397
        });
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            432082.33132450003,
            5404877.667855
        ])
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            1822,
            634
        ])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            397265.26494544884,
            5392762.398873487,
            466899.3977035512,
            5416992.936836514
        ])
        expect(mapState.resolution).to.be.eq(38.218514137268066)
        expect(mapState.scaleDenominator).to.be.eq(144447.63855208742)
        expect(mapState.pointResolution).to.be.eq(27.673393466176645)
        expect(mapState.pointScaleDenominator).to.be.eq(104592.14407328397)

        // Update some properties
        mapState.update({
            "type": "map.state.changed",
            "extent": [
                414678.25685631623,
                5398816.026905431,
                449495.3232353674,
                5410931.295886946
            ],
            "resolution": 19.109257068634033,
            "scaleDenominator": 72223.81927604371,
            "pointResolution": 13.836702727785784,
            "pointScaleDenominator": 52296.09469372093
        });
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            432082.33132450003,
            5404877.667855
        ])
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            1822,
            634
        ])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            414678.25685631623,
            5398816.026905431,
            449495.3232353674,
            5410931.295886946
        ])
        expect(mapState.resolution).to.be.eq(19.109257068634033)
        expect(mapState.scaleDenominator).to.be.eq(72223.81927604371)
        expect(mapState.pointResolution).to.be.eq(13.836702727785784)
        expect(mapState.pointScaleDenominator).to.be.eq(52296.09469372093)

        // Update unknown properties - nothing will change
        mapState.update({
            "type": "layer.visibility.changed",
            "layer": 'Quartiers',
            "checked": false
        })
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            432082.33132450003,
            5404877.667855
        ])
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            1822,
            634
        ])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            414678.25685631623,
            5398816.026905431,
            449495.3232353674,
            5410931.295886946
        ])
        expect(mapState.resolution).to.be.eq(19.109257068634033)
        expect(mapState.scaleDenominator).to.be.eq(72223.81927604371)
        expect(mapState.pointResolution).to.be.eq(13.836702727785784)
        expect(mapState.pointScaleDenominator).to.be.eq(52296.09469372093)
    })

    it('Events', function () {
        let mapState = new MapState();
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState).to.be.instanceOf(EventDispatcher)

        let mapStateChangedEvt = null

        mapState.addListener(evt => {
            mapStateChangedEvt = evt
        }, 'map.state.changed');

        // Update all properties
        mapState.update({
            "type": "map.state.changing",
            "projection": "EPSG:3857",
            "center": [
              432082.33132450003,
              5404877.667855
            ],
            "size": [
              1822,
              634
            ],
            "extent": [
              397265.26494544884,
              5392762.398873487,
              466899.3977035512,
              5416992.936836514
            ],
            "resolution": 38.218514137268066,
            "scaleDenominator": 144447.63855208742,
            "pointResolution": 27.673393466176645,
            "pointScaleDenominator": 104592.14407328397
        });

        expect(mapStateChangedEvt).to.not.be.null // event dispatch
        expect(mapStateChangedEvt.projection).to.be.undefined // the projection has not changed
        expect(mapStateChangedEvt.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            432082.33132450003,
            5404877.667855
        ])
        expect(mapStateChangedEvt.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            1822,
            634
        ])
        expect(mapStateChangedEvt.extent).to.be.an('array').that.have.lengthOf(4).that.deep.equal([
            397265.26494544884,
            5392762.398873487,
            466899.3977035512,
            5416992.936836514
        ])
        expect(mapStateChangedEvt.resolution).to.be.eq(38.218514137268066)
        expect(mapStateChangedEvt.scaleDenominator).to.be.eq(144447.63855208742)
        expect(mapStateChangedEvt.pointResolution).to.be.eq(27.673393466176645)
        expect(mapStateChangedEvt.pointScaleDenominator).to.be.eq(104592.14407328397)

        // Reset object
        mapStateChangedEvt = null
        // Update some properties
        mapState.update({
            "type": "map.state.changing",
            "size": [
              1822,
              634
            ],
            "extent": [
                414678.25685631623,
                5398816.026905431,
                449495.3232353674,
                5410931.295886946
            ],
            "resolution": 19.109257068634033,
            "scaleDenominator": 72223.81927604371,
            "pointResolution": 13.836702727785784,
            "pointScaleDenominator": 52296.09469372093
        });

        expect(mapStateChangedEvt).to.not.be.null // event dispatch
        expect(mapStateChangedEvt.projection).to.be.undefined // the projection has not changed
        expect(mapStateChangedEvt.center).to.be.undefined
        expect(mapStateChangedEvt.size).to.be.undefined
        expect(mapStateChangedEvt.extent).to.be.an('array').that.have.lengthOf(4).that.deep.equal([
            414678.25685631623,
            5398816.026905431,
            449495.3232353674,
            5410931.295886946
        ])
        expect(mapStateChangedEvt.resolution).to.be.eq(19.109257068634033)
        expect(mapStateChangedEvt.scaleDenominator).to.be.eq(72223.81927604371)
        expect(mapStateChangedEvt.pointResolution).to.be.eq(13.836702727785784)
        expect(mapStateChangedEvt.pointScaleDenominator).to.be.eq(52296.09469372093)

        // Reset object
        mapStateChangedEvt = null
        // Update unknown properties - nothing will change
        mapState.update({
            "type": "layer.visibility.changed",
            "layer": 'Quartiers',
            "checked": false
        })
        expect(mapStateChangedEvt).to.be.null // event not dispatch

        // Reset object
        mapStateChangedEvt = null
        // Update properties with same values
        mapState.update({
            "type": "map.state.changed",
            "extent": [
                414678.25685631623,
                5398816.026905431,
                449495.3232353674,
                5410931.295886946
            ],
            "resolution": 19.109257068634033,
            "scaleDenominator": 72223.81927604371,
            "pointResolution": 13.836702727785784,
            "pointScaleDenominator": 52296.09469372093
        });
        expect(mapStateChangedEvt).to.be.null // event not dispatch
    })

    it('ConversionError && ValidationError', function () {
        let mapState = new MapState();
        expect(mapState).to.be.instanceOf(MapState)

        // Initial state
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        expect(mapState.resolution).to.be.eq(-1)
        expect(mapState.scaleDenominator).to.be.eq(-1)
        expect(mapState.pointResolution).to.be.eq(-1)
        expect(mapState.pointScaleDenominator).to.be.eq(-1)

        try {
            mapState.update({
                "center": 'foobar'
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The value for `center` has to be an array!')
            expect(error).to.be.instanceOf(ValidationError)
        } finally {
            expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        }

        try {
            mapState.update({
                "resolution": 'foobar'
            })
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`foobar` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)

            expect(mapState.resolution).to.be.eq(-1)
        }

        try {
            mapState.update({
                "size": 'foobar'
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The value for `size` has to be an array!')
            expect(error).to.be.instanceOf(ValidationError)
        } finally {
            expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        }

        try {
            mapState.update({
                "extent": 'foobar'
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The value for `extent` has to be an array!')
            expect(error).to.be.instanceOf(ValidationError)
        } finally {
            expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        }

        try {
            mapState.update({
                "extent": [-1,-1,'error',1]
            })
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`error` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        } finally {
            expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        }

        try {
            mapState.update({
                "scaleDenominator": 'foobar'
            })
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`foobar` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        } finally {
            expect(mapState.scaleDenominator).to.be.eq(-1)
        }
    })
})
