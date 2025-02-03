import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import EventDispatcher from 'assets/src/utils/EventDispatcher.js';
import { Extent } from 'assets/src/modules/utils/Extent.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';
import { MapState, buildScales } from 'assets/src/modules/state/Map.js';

describe('MapState', function () {
    it('Valid', function () {
        let mapState = new MapState();
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState).to.be.instanceOf(EventDispatcher)

        // Initial state
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.zoom).to.be.eq(-1)
        expect(mapState.minZoom).to.be.eq(0)
        expect(mapState.maxZoom).to.be.eq(-1)
        expect(mapState.scales).to.be.an('array').that.have.lengthOf(0)
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        expect(mapState.resolution).to.be.eq(-1)
        expect(mapState.scaleDenominator).to.be.eq(-1)
        expect(mapState.pointResolution).to.be.eq(-1)
        expect(mapState.pointScaleDenominator).to.be.eq(-1)
        expect(mapState.startupFeatures).to.be.undefined
        expect(mapState.singleWMSLayer).to.be.false

        // Update all properties
        mapState.update({
            "type": "map.state.changing",
            "projection": "EPSG:3857",
            "center": [
              432082.33132450003,
              5404877.667855
            ],
            "zoom": 4,
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
        expect(mapState.zoom).to.be.eq(4)
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
        expect(mapState.zoom).to.be.eq(4)
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
        expect(mapState.zoom).to.be.eq(4)
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
            "zoom": 4,
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
        expect(mapState.zoom).to.be.eq(4)
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
        expect(mapStateChangedEvt.zoom).to.be.undefined
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

    it('Transform', function () {
        let mapState = new MapState();
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState).to.be.instanceOf(EventDispatcher)

        // Update all properties
        mapState.update({
            "type": "map.state.changing",
            "projection": "EPSG:3857",
            "center": [
              432082.33132450003,
              5404877.667855
            ],
            "zoom": 4,
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

        let mapStateChangedEvt = null

        mapState.addListener(evt => {
            mapStateChangedEvt = evt
        }, 'map.state.changed');

        // update projection
        mapState.update({
            "type": "map.state.changing",
            "projection": "EPSG:4326"
        });

        expect(mapState.projection).to.be.eq('EPSG:4326')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            3.881461622267935,
            43.60729361373798
        ])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            3.568694593502878,
            43.52848921560505,
            4.194228651032991,
            43.68609801187091,
        ])

        expect(mapStateChangedEvt).to.not.be.null // event dispatch
        expect(mapStateChangedEvt.projection).to.be.eq('EPSG:4326') // the projection has not changed
        expect(mapStateChangedEvt.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            3.881461622267935,
            43.60729361373798
        ])
        expect(mapStateChangedEvt.extent).to.be.an('array').that.have.lengthOf(4).that.deep.equal([
            3.568694593502878,
            43.52848921560505,
            4.194228651032991,
            43.68609801187091,
        ])


        const opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": false,
            //"hide_numeric_scale_value": false,
            //"hideGroupCheckbox": false,
            //"activateFirstMapTheme": false,
        })
        mapState = new MapState(opt);

        // Initial state
        expect(mapState.projection).to.be.eq('EPSG:4326')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            0,
            0
        ])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            0,
            0,
            0,
            0
        ])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            -3.5,
            -1.0,
            3.5,
            1.0
        ])

        // update projection
        mapState.update({
            "type": "map.state.changing",
            "projection": "EPSG:3857"
        });

        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([
            0,
            0
        ])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            0,
            0,
            0,
            0
        ])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([
            -389618.21777645755,
            -111325.14286638453,
            389618.21777645755,
            111325.14286638486,
        ])
    })

    it('ConversionError && ValidationError', function () {
        let mapState = new MapState();
        expect(mapState).to.be.instanceOf(MapState)

        // Initial state
        expect(mapState.projection).to.be.eq('EPSG:3857')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.zoom).to.be.eq(-1)
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
                "zoom": 'foobar'
            })
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`foobar` is not a number!')
            expect(error).to.be.instanceOf(ConversionError)
        } finally {
            expect(mapState.zoom).to.be.eq(-1)
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

describe('buildScales', function () {
    it('order', function () {
        const opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": false,
            //"hide_numeric_scale_value": false,
            //"hideGroupCheckbox": false,
            //"activateFirstMapTheme": false,
        })
        // Default value for use_native_zoom_levels
        expect(opt.use_native_zoom_levels).to.be.eq(false)

        let optScales = Array.from(opt.mapScales);
        optScales.sort(function(a, b) {
            return Number(b) - Number(a);
        });
        let scales = buildScales(opt);
        expect(optScales).to.have.length(6);
        expect(scales).to.have.length(6);
        expect(scales.at(0)).to.be.eq(optScales.at(0)); // 500000
        expect(scales.at(-1)).to.be.eq(optScales.at(-1)); // 10000
    })

    it('use_native_zoom_levels', function () {
        let opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs",
                "ref": "EPSG:3857"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": true,
            //"hide_numeric_scale_value": false,
            //"hideGroupCheckbox": false,
        })
        // Default value for EPSG:3857 without use_native_zoom_levels defined
        expect(opt.use_native_zoom_levels).to.be.eq(true)

        let optScales = Array.from(opt.mapScales);
        optScales.sort(function(a, b) {
            return Number(b) - Number(a);
        });
        let scales = buildScales(opt);
        expect(optScales).to.have.length(6);
        expect(scales).to.have.length(5);
        expect(scales.at(0)).to.be.lessThan(optScales.at(0)); // < 500000
        expect(Math.round(scales.at(0))).to.be.eq(288896);
        expect(scales.at(-1)).to.be.greaterThan(optScales.at(-1)); // > 10000
        expect(Math.round(scales.at(-1))).to.be.eq(18056);

        opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": true,
        })
        // Default value for 2 mapScales without use_native_zoom_levels defined
        expect(opt.use_native_zoom_levels).to.be.eq(true)

        optScales = Array.from(opt.mapScales);
        optScales.sort(function(a, b) {
            return Number(b) - Number(a);
        });
        scales = buildScales(opt);
        expect(optScales).to.have.length(2);
        expect(scales).to.have.length(6);
        expect(scales.at(0)).to.be.eq(optScales.at(0)); // 500000
        expect(scales.at(-1)).to.be.eq(optScales.at(-1)); // 10000
    })
})

describe('MapState with options', function () {
    it('Default values', function () {
        const opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": false,
            //"hide_numeric_scale_value": false,
            //"hideGroupCheckbox": false,
            //"activateFirstMapTheme": false,
        })
        let mapState = new MapState(opt);
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState.projection).to.be.eq('EPSG:4326')
        expect(mapState.center).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.zoom).to.be.eq(-1)
        expect(mapState.minZoom).to.be.eq(0)
        expect(mapState.maxZoom).to.be.eq(5)
        expect(mapState.scales).to.be.an('array').that.have.lengthOf(6)
        expect(mapState.size).to.be.an('array').that.have.lengthOf(2).that.deep.equal([0, 0])
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])
        expect(mapState.resolution).to.be.eq(-1)
        expect(mapState.scaleDenominator).to.be.eq(-1)
        expect(mapState.pointResolution).to.be.eq(-1)
        expect(mapState.pointScaleDenominator).to.be.eq(-1)
        expect(mapState.startupFeatures).to.be.undefined
        expect(mapState.singleWMSLayer).to.be.false
    })

    it('Native zoom levels', function () {
        let opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs",
                "ref": "EPSG:3857"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": true,
            //"hide_numeric_scale_value": false,
            //"hideGroupCheckbox": false,
        })
        // Default value for EPSG:3857 without use_native_zoom_levels defined
        expect(opt.use_native_zoom_levels).to.be.eq(true)

        let mapState = new MapState(opt);
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState.zoom).to.be.eq(-1)
        expect(mapState.minZoom).to.be.eq(0)
        expect(mapState.maxZoom).to.be.eq(4)
        expect(mapState.scales).to.be.an('array').that.have.lengthOf(5)
        expect(mapState.scales.at(0)).to.be.lessThan(opt.mapScales.at(-1)); // < 500000
        expect(Math.round(mapState.scales.at(0))).to.be.eq(288896);
        expect(mapState.scales.at(-1)).to.be.greaterThan(opt.mapScales.at(0)); // > 10000
        expect(Math.round(mapState.scales.at(-1))).to.be.eq(18056);

        opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": true,
        })
        // Default value for 2 mapScales without use_native_zoom_levels defined
        expect(opt.use_native_zoom_levels).to.be.eq(true)

        mapState = new MapState(opt);
        expect(mapState).to.be.instanceOf(MapState)
        expect(mapState.zoom).to.be.eq(-1)
        expect(mapState.minZoom).to.be.eq(0)
        expect(mapState.maxZoom).to.be.eq(5)
        expect(mapState.scales).to.be.an('array').that.have.lengthOf(6)
        expect(mapState.scales.at(0)).to.be.eq(opt.mapScales.at(-1)); // 500000
        expect(mapState.scales.at(-1)).to.be.eq(opt.mapScales.at(0)); // 10000
    })

    it('Zoom to initial extent', function () {
        const opt = new OptionsConfig({
            "projection": {
                "proj4": "+proj=longlat +datum=WGS84 +no_defs",
                "ref": "EPSG:4326"
            },
            "bbox": [
                "-3.5",
                "-1.0",
                "3.5",
                "1.0"
            ],
            "mapScales": [
                10000,
                25000,
                50000,
                100000,
                250000,
                500000
            ],
            "minScale": 10000,
            "maxScale": 500000,
            "initialExtent": [
                -3.5,
                -1.0,
                3.5,
                1.0
            ],
            "popupLocation": "dock",
            "pointTolerance": 25,
            "lineTolerance": 10,
            "polygonTolerance": 5,
            "hideProject": "True",
            "tmTimeFrameSize": 10,
            "tmTimeFrameType": "seconds",
            "tmAnimationFrameLength": 1000,
            "datavizLocation": "dock",
            "theme": "light",
            //"wmsMaxHeight": 3000,
            //"wmsMaxWidth": 3000,
            //"fixed_scale_overview_map": true,
            //"use_native_zoom_levels": false,
            //"hide_numeric_scale_value": false,
            //"hideGroupCheckbox": false,
            //"activateFirstMapTheme": false,
        })
        let mapState = new MapState(opt);
        expect(mapState).to.be.instanceOf(MapState)

        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([0, 0, 0, 0])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])

        mapState.zoomToInitialExtent()
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])

        // Update extent
        mapState.update({
            "type": "map.state.changed",
            "extent": [
                -3.5,
                -1,
                0,
                0
            ],
        });
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 0, 0])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])

        mapState.zoomToInitialExtent()
        expect(mapState.extent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])
        expect(mapState.initialExtent).to.be.instanceOf(Extent).that.have.lengthOf(4).that.deep.equal([-3.5, -1, 3.5, 1])
    })
})
