import { expect } from 'chai';

import { LineString, Point, Polygon, Circle } from 'ol/geom.js';

import { formatArea, formatLength, getMeasures } from 'assets/src/modules/utils/Measure.js';

describe('Measure', function () {
    it('formatLength', function () {
        expect(formatLength(0)).to.be.eq('0 m')
        expect(formatLength(12.3456)).to.be.eq('12.35 m')
        expect(formatLength(100)).to.be.eq('100 m')
        expect(formatLength(1234.5)).to.be.eq('1.23 km')
    })

    it('formatArea', function () {
        expect(formatArea(12.3456)).to.be.eq('12.35 m²')
        expect(formatArea(10000)).to.be.eq('10000 m²')
        expect(formatArea(1234567)).to.be.eq('1.23 km²')
        // HTML for the map tooltips
        expect(formatArea(12.3456, true)).to.be.eq('12.35 m<sup>2</sup>')
        expect(formatArea(1234567, true)).to.be.eq('1.23 km<sup>2</sup>')
    })

    it('getMeasures LineString', function () {
        // About 111.2 m along the equator
        const line = new LineString([[0, 0], [0.001, 0]])
        expect(getMeasures(line, 'EPSG:4326')).to.be.deep.eq(['0.11 km'])
        expect(getMeasures(line, 'EPSG:4326', true)).to.be.deep.eq(['0.11 km'])

        const shortLine = new LineString([[0, 0], [0.0005, 0]])
        expect(getMeasures(shortLine, 'EPSG:4326')).to.be.deep.eq(['55.6 m'])
    })

    it('getMeasures Polygon', function () {
        // Square of about 55.6 m side length
        const ring = [[0, 0], [0.0005, 0], [0.0005, 0.0005], [0, 0.0005], [0, 0]]
        const polygon = new Polygon([ring])
        expect(getMeasures(polygon, 'EPSG:4326')).to.be.deep.eq(['0.22 km', '3091.09 m²'])
        expect(getMeasures(polygon, 'EPSG:4326', true)).to.be.deep.eq(['0.22 km', '3091.09 m<sup>2</sup>'])

        // Not closed linear ring: perimeter is the same
        const openPolygon = new Polygon([ring.slice(0, -1)])
        expect(getMeasures(openPolygon, 'EPSG:4326')[0]).to.be.eq('0.22 km')
    })

    it('getMeasures Circle', function () {
        // Radius of 1000 m in EPSG:3857 at the equator, about 998.9 m on the sphere
        const circle = new Circle([0, 0], 1000)
        const measures = getMeasures(circle, 'EPSG:3857')
        expect(measures).to.have.length(2)
        expect(measures[0]).to.be.eq('1 km')
        expect(measures[1]).to.be.eq('3.13 km²')
    })

    it('getMeasures without measure', function () {
        expect(getMeasures(new Point([0, 0]), 'EPSG:4326')).to.be.deep.eq([])
    })
})
