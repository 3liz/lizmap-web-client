import { expect } from 'chai';

import { timeManagerDatetimeFormat, timeManagerFilterResolution } from 'assets/src/modules/utils/TimeManagerFilter.js';

describe('timeManagerFilterResolution', function () {
    it('keeps sub-day resolutions so the filter is not truncated to midnight (#7056)', function () {
        expect(timeManagerFilterResolution('milliseconds')).to.be.eq('milliseconds')
        expect(timeManagerFilterResolution('seconds')).to.be.eq('seconds')
        expect(timeManagerFilterResolution('minutes')).to.be.eq('minutes')
        expect(timeManagerFilterResolution('hours')).to.be.eq('hours')
    })

    it('keeps day and week resolutions unchanged', function () {
        expect(timeManagerFilterResolution('days')).to.be.eq('days')
        expect(timeManagerFilterResolution('weeks')).to.be.eq('weeks')
    })

    it('clamps months and years to days to avoid partial-date strings failing on DATE fields (#6571)', function () {
        expect(timeManagerFilterResolution('months')).to.be.eq('days')
        expect(timeManagerFilterResolution('years')).to.be.eq('days')
    })

    it('falls back to days for empty or undefined resolution', function () {
        expect(timeManagerFilterResolution(undefined)).to.be.eq('days')
        expect(timeManagerFilterResolution('')).to.be.eq('days')
    })
});

describe('timeManagerDatetimeFormat', function () {
    it('includes the time of day for sub-day resolutions', function () {
        expect(timeManagerDatetimeFormat('milliseconds')).to.be.eq('YYYY-MM-DD HH:mm:ss')
        expect(timeManagerDatetimeFormat('seconds')).to.be.eq('YYYY-MM-DD HH:mm:ss')
        expect(timeManagerDatetimeFormat('minutes')).to.be.eq('YYYY-MM-DD HH:mm:00')
        expect(timeManagerDatetimeFormat('hours')).to.be.eq('YYYY-MM-DD HH:00')
    })

    it('uses a date-only pattern for days and weeks', function () {
        expect(timeManagerDatetimeFormat('days')).to.be.eq('YYYY-MM-DD')
        expect(timeManagerDatetimeFormat('weeks')).to.be.eq('YYYY-MM-DD')
    })

    it('uses partial-date patterns for months and years (slider display only)', function () {
        expect(timeManagerDatetimeFormat('months')).to.be.eq('YYYY-MM')
        expect(timeManagerDatetimeFormat('years')).to.be.eq('YYYY')
    })
});

// The two helpers combined describe what the Time Manager layer filter emits:
// the resolution is clamped first, then formatted. This is the exact behaviour
// fixed for issue #7056.
describe('Time Manager filter datetime format', function () {
    function filterFormat(attributeResolution) {
        return timeManagerDatetimeFormat(timeManagerFilterResolution(attributeResolution))
    }

    it('preserves the time of day for a minutes layer (#7056)', function () {
        expect(filterFormat('minutes')).to.be.eq('YYYY-MM-DD HH:mm:00')
    })

    it('never emits year-only or month-only strings for DATE fields (#6571)', function () {
        expect(filterFormat('months')).to.be.eq('YYYY-MM-DD')
        expect(filterFormat('years')).to.be.eq('YYYY-MM-DD')
    })
});
