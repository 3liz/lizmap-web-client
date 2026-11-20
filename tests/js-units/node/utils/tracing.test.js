import { expect } from 'chai';

import {
    closestPointOnSegment,
    intersectLines,
    offsetPolyline,
    removeDuplicates,
    TraceGraph,
} from 'assets/src/modules/utils/Tracing.js';

const expectCoordinates = (actual, expected) => {
    expect(actual).to.have.length(expected.length);
    actual.forEach((coord, i) => {
        expect(coord[0], `x of #${i}`).to.be.closeTo(expected[i][0], 1e-9);
        expect(coord[1], `y of #${i}`).to.be.closeTo(expected[i][1], 1e-9);
    });
};

/**
 * Route between two points of a graph
 * @param {TraceGraph} graph - the graph
 * @param {number[]}   from  - the start point
 * @param {number[]}   to    - the end point
 * @returns {object|null} the route
 */
const route = (graph, from, to) => {
    const start = graph.locate(from, 0.5);
    const end = graph.locate(to, 0.5);
    return graph.route(graph.shortestPathTree(start), end);
};

// A 10x10 square ring, counter-clockwise, without the closing vertex
const square = { points: [[0, 0], [10, 0], [10, 10], [0, 10]], closed: true };
// An open polyline
const polyline = { points: [[0, 0], [10, 0], [10, 10], [20, 10]], closed: false };

describe('Tracing', function () {
    it('removeDuplicates', function () {
        expectCoordinates(removeDuplicates([[0, 0], [0, 0], [1, 0], [1, 0], [1, 1]]), [[0, 0], [1, 0], [1, 1]]);
    });

    it('closestPointOnSegment', function () {
        let closest = closestPointOnSegment([5, 3], [0, 0], [10, 0]);
        expectCoordinates([closest.coord], [[5, 0]]);
        expect(closest.t).to.be.closeTo(0.5, 1e-9);
        expect(closest.distance).to.be.closeTo(3, 1e-9);

        closest = closestPointOnSegment([13, 4], [0, 0], [10, 0]);
        expect(closest.t).to.be.closeTo(1, 1e-9);
        expect(closest.distance).to.be.closeTo(5, 1e-9);
    });

    it('intersectLines', function () {
        expectCoordinates([intersectLines([[0, 2], [10, 2]], [[8, 0], [8, 10]])], [[8, 2]]);
        expect(intersectLines([[0, 0], [10, 0]], [[0, 2], [10, 2]])).to.be.null;
        expectCoordinates(
            [intersectLines([[500000, 5300002], [500010, 5300002]], [[500008, 5300000], [500008, 5300010]])],
            [[500008, 5300002]]
        );
    });

    it('offsetPolyline positive is on the left', function () {
        // Going east then north: left is north then west
        expectCoordinates(
            offsetPolyline([[0, 0], [10, 0], [10, 10]], [1, 1]),
            [[0, 1], [9, 1], [9, 10]]
        );
        // Negative: on the right
        expectCoordinates(
            offsetPolyline([[0, 0], [10, 0], [10, 10]], [-1, -1]),
            [[0, -1], [11, -1], [11, 10]]
        );
        // Single segment
        expectCoordinates(offsetPolyline([[0, 0], [10, 0]], [2]), [[0, 2], [10, 2]]);
        // Zero offset keeps the vertices
        expectCoordinates(offsetPolyline([[0, 0], [10, 0], [10, 10]], [0, 0]), [[0, 0], [10, 0], [10, 10]]);
    });

    it('offsetPolyline joins', function () {
        // Collinear segments
        expectCoordinates(
            offsetPolyline([[0, 0], [5, 0], [10, 0]], [1, 1]),
            [[0, 1], [5, 1], [10, 1]]
        );
        // Very sharp angle: bevel instead of a long miter
        const sharp = offsetPolyline([[0, 0], [10, 0], [0, 0.1]], [-1, -1]);
        expect(sharp).to.have.length(4);
        // Different distances per segment
        expectCoordinates(
            offsetPolyline([[0, 0], [10, 0], [10, 10]], [1, 2]),
            [[0, 1], [8, 1], [8, 10]]
        );
        // Duplicate vertices are ignored
        expectCoordinates(
            offsetPolyline([[0, 0], [10, 0], [10, 0], [10, 10]], [1, 1, 1]),
            [[0, 1], [9, 1], [9, 10]]
        );
    });
});

describe('TraceGraph', function () {
    it('locate', function () {
        const graph = new TraceGraph([polyline]);
        const location = graph.locate([5, 0.3], 0.5);
        expectCoordinates([location.coord], [[5, 0]]);
        expect(location.distance).to.be.closeTo(0.3, 1e-9);
        expect(graph.locate([5, 3], 0.5)).to.be.null;
        expect(new TraceGraph([]).locate([0, 0], 1)).to.be.null;
    });

    it('locate with a tolerance much larger than the segments stays fast', function () {
        this.timeout(1000);
        // Empty network, projected coordinates, tolerance of a zoomed out map
        expect(new TraceGraph([]).locate([430000, 5400000], 6000)).to.be.null;
        // Short segments
        const steps = { points: Array.from({ length: 100 }, (v, i) => [430000 + i * 0.01, 5400000]), closed: false };
        const location = new TraceGraph([steps]).locate([430000.5, 5400010], 6000);
        expect(location.distance).to.be.closeTo(10, 1e-6);
    });

    it('routes along an open line, both ways, with the path segment of each traced segment', function () {
        const graph = new TraceGraph([polyline]);
        let traced = route(graph, [5, 0], [15, 10]);
        expectCoordinates(traced.coords, [[5, 0], [10, 0], [10, 10], [15, 10]]);
        expect(traced.segments.map(s => s.segment)).to.deep.eq([0, 1, 2]);
        expect(traced.segments.every(s => s.path === polyline)).to.be.true;

        traced = route(graph, [15, 10], [5, 0]);
        expectCoordinates(traced.coords, [[15, 10], [10, 10], [10, 0], [5, 0]]);
        expect(traced.segments.map(s => s.segment)).to.deep.eq([2, 1, 0]);

        // From a vertex
        traced = route(graph, [10, 0], [15, 10]);
        expectCoordinates(traced.coords, [[10, 0], [10, 10], [15, 10]]);
        expect(traced.segments.map(s => s.segment)).to.deep.eq([1, 2]);
    });

    it('routes on the same segment directly', function () {
        const graph = new TraceGraph([polyline]);
        const traced = route(graph, [2, 0], [8, 0]);
        expectCoordinates(traced.coords, [[2, 0], [8, 0]]);
        expect(traced.segments.map(s => s.segment)).to.deep.eq([0]);
    });

    it('routes the shortest way around a ring, through its closing vertex', function () {
        const graph = new TraceGraph([square]);
        let traced = route(graph, [5, 0], [10, 5]);
        expectCoordinates(traced.coords, [[5, 0], [10, 0], [10, 5]]);

        traced = route(graph, [5, 0], [0, 5]);
        expectCoordinates(traced.coords, [[5, 0], [0, 0], [0, 5]]);
        expect(traced.segments.map(s => s.segment)).to.deep.eq([0, 3]);

        // Opposite sides: the way by the left side is shorter (19 against 21)
        traced = route(graph, [5, 0], [4, 10]);
        expectCoordinates(traced.coords, [[5, 0], [0, 0], [0, 10], [4, 10]]);
    });

    it('routes across features sharing a vertex', function () {
        const road1 = { points: [[0, 0], [10, 0]], closed: false };
        const road2 = { points: [[10, 0], [14, 5], [10, 10]], closed: false };
        const road3 = { points: [[10, 10], [15, 15], [20, 10]], closed: false };
        const road4 = { points: [[10, 10], [10, 20]], closed: false };
        const graph = new TraceGraph([road1, road2, road3, road4]);

        const traced = route(graph, [5, 0], [17.5, 12.5]);
        expectCoordinates(traced.coords, [[5, 0], [10, 0], [14, 5], [10, 10], [15, 15], [17.5, 12.5]]);
        expect(traced.segments.map(s => s.path)).to.deep.eq([road1, road2, road2, road3, road3]);
        expect(traced.segments.map(s => s.segment)).to.deep.eq([0, 0, 1, 0, 1]);

        // The other way, to another feature from the same junction
        expectCoordinates(route(graph, [10, 15], [5, 0]).coords, [[10, 15], [10, 10], [14, 5], [10, 0], [5, 0]]);
    });

    it('routes across a feature ending on the segment of another one', function () {
        // T junction: the north road ends in the middle of the main road segment, without vertex there
        const main = { points: [[0, 0], [20, 0]], closed: false };
        const north = { points: [[8, 0], [8, 10]], closed: false };
        const graph = new TraceGraph([main, north]);

        let traced = route(graph, [2, 0], [8, 6]);
        expectCoordinates(traced.coords, [[2, 0], [8, 0], [8, 6]]);
        expect(traced.segments.map(s => s.path)).to.deep.eq([main, north]);

        traced = route(graph, [8, 6], [18, 0]);
        expectCoordinates(traced.coords, [[8, 6], [8, 0], [18, 0]]);
    });

    it('routes across crossing features without shared vertex', function () {
        const diagonal1 = { points: [[0, 0], [10, 10]], closed: false };
        const diagonal2 = { points: [[0, 10], [10, 0]], closed: false };
        const graph = new TraceGraph([diagonal1, diagonal2]);

        const traced = route(graph, [2, 2], [8, 2]);
        expectCoordinates(traced.coords, [[2, 2], [5, 5], [8, 2]]);
        expect(traced.segments.map(s => s.path)).to.deep.eq([diagonal1, diagonal2]);
    });

    it('routes across features sharing a vertex on a polygon ring', function () {
        // A road ending on a vertex of a parcel boundary
        const parcel = { points: [[0, 0], [10, 0], [10, 10], [0, 10]], closed: true };
        const road = { points: [[10, 0], [20, 0]], closed: false };
        const graph = new TraceGraph([parcel, road]);

        const traced = route(graph, [15, 0], [10, 5]);
        expectCoordinates(traced.coords, [[15, 0], [10, 0], [10, 5]]);
    });

    it('does not route between disconnected features', function () {
        const road1 = { points: [[0, 0], [10, 0]], closed: false };
        const road2 = { points: [[0, 5], [10, 5]], closed: false };
        const graph = new TraceGraph([road1, road2]);
        expect(route(graph, [2, 0], [2, 5])).to.be.null;
    });

    it('keeps the junctions with large projected coordinates', function () {
        const x = 500000;
        const y = 5300000;
        const main = { points: [[x, y], [x + 20, y]], closed: false };
        const north = { points: [[x + 8, y], [x + 8, y + 10]], closed: false };
        const graph = new TraceGraph([main, north]);
        expectCoordinates(route(graph, [x + 2, y], [x + 8, y + 6]).coords, [[x + 2, y], [x + 8, y], [x + 8, y + 6]]);
    });
});
