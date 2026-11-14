import { expect } from 'chai';

import {
    closestPointOnSegment,
    intersectLines,
    locateOnPath,
    offsetPolyline,
    pathLength,
    removeDuplicates,
    tracePath,
} from 'assets/src/modules/utils/Tracing.js';

const expectCoordinates = (actual, expected) => {
    expect(actual).to.have.length(expected.length);
    actual.forEach((coord, i) => {
        expect(coord[0], `x of #${i}`).to.be.closeTo(expected[i][0], 1e-9);
        expect(coord[1], `y of #${i}`).to.be.closeTo(expected[i][1], 1e-9);
    });
};

// A 10x10 square ring, counter-clockwise, without the closing vertex
const square = [[0, 0], [10, 0], [10, 10], [0, 10]];
// An open polyline
const polyline = [[0, 0], [10, 0], [10, 10], [20, 10]];

describe('Tracing', function () {
    it('removeDuplicates and pathLength', function () {
        expectCoordinates(removeDuplicates([[0, 0], [0, 0], [1, 0], [1, 0], [1, 1]]), [[0, 0], [1, 0], [1, 1]]);
        expect(pathLength([[0, 0], [3, 4], [3, 10]])).to.be.closeTo(11, 1e-9);
        expect(pathLength([[0, 0]])).to.be.eq(0);
    });

    it('closestPointOnSegment', function () {
        let closest = closestPointOnSegment([5, 3], [0, 0], [10, 0]);
        expectCoordinates([closest.coord], [[5, 0]]);
        expect(closest.t).to.be.closeTo(0.5, 1e-9);
        expect(closest.distance).to.be.closeTo(3, 1e-9);

        closest = closestPointOnSegment([13, 4], [0, 0], [10, 0]);
        expect(closest.t).to.be.eq(1);
        expect(closest.distance).to.be.closeTo(5, 1e-9);
    });

    it('locateOnPath', function () {
        let location = locateOnPath(square, true, [-1, 5]);
        // The closing segment of the ring is used
        expect(location.index).to.be.eq(3);
        expect(location.t).to.be.closeTo(0.5, 1e-9);
        expect(location.distance).to.be.closeTo(1, 1e-9);

        location = locateOnPath(polyline, false, [-1, 5]);
        expect(location.index).to.be.eq(0);
        expect(location.t).to.be.eq(0);

        expect(locateOnPath([[0, 0]], false, [1, 1])).to.be.null;
    });

    it('tracePath on an open polyline', function () {
        const from = locateOnPath(polyline, false, [5, 0]);
        const to = locateOnPath(polyline, false, [15, 10]);
        expectCoordinates(tracePath(polyline, false, from, to), [[5, 0], [10, 0], [10, 10], [15, 10]]);
        // Reverse direction
        expectCoordinates(tracePath(polyline, false, to, from), [[15, 10], [10, 10], [10, 0], [5, 0]]);
        // Same segment
        const near = locateOnPath(polyline, false, [8, 0]);
        expectCoordinates(tracePath(polyline, false, from, near), [[5, 0], [8, 0]]);
        // From a vertex
        const vertex = locateOnPath(polyline, false, [10, 0]);
        expectCoordinates(tracePath(polyline, false, vertex, to), [[10, 0], [10, 10], [15, 10]]);
    });

    it('tracePath on a ring takes the shortest way', function () {
        const bottom = locateOnPath(square, true, [5, 0]);
        const right = locateOnPath(square, true, [10, 5]);
        expectCoordinates(tracePath(square, true, bottom, right), [[5, 0], [10, 0], [10, 5]]);
        expectCoordinates(tracePath(square, true, right, bottom), [[10, 5], [10, 0], [5, 0]]);

        // Through the closing vertex
        const left = locateOnPath(square, true, [0, 5]);
        expectCoordinates(tracePath(square, true, bottom, left), [[5, 0], [0, 0], [0, 5]]);
        expectCoordinates(tracePath(square, true, left, bottom), [[0, 5], [0, 0], [5, 0]]);

        // Opposite sides: the way by the left side is shorter (19 against 21)
        const top = locateOnPath(square, true, [4, 10]);
        expectCoordinates(tracePath(square, true, bottom, top), [[5, 0], [0, 0], [0, 10], [4, 10]]);

        // Same segment, both directions
        const bottomRight = locateOnPath(square, true, [8, 0]);
        expectCoordinates(tracePath(square, true, bottom, bottomRight), [[5, 0], [8, 0]]);
        expectCoordinates(tracePath(square, true, bottomRight, bottom), [[8, 0], [5, 0]]);
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
