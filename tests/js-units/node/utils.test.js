import { expect } from 'chai';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';
import { readFileSync } from 'fs';
import { Utils } from 'assets/src/modules/Utils.js';
import {
    LineString,
    Point,
    Polygon
} from 'ol/geom.js';
import { Feature } from 'ol';

const agent = new MockAgent();
const client = agent.get('http://localhost:8130');

const featureCoordinates = JSON.parse(readFileSync('./tests/js-units/data/snapDrawGeometries.json', 'utf8'));

const linestring_a = new Feature(new LineString(featureCoordinates.linestring_a));
const linestring_b = new Feature(new LineString(featureCoordinates.linestring_b));
const circle_a = new Feature(new Polygon(featureCoordinates.circle_a));
const polygon_a = new Feature(new Polygon(featureCoordinates.polygon_a));
const polygon_b = new Feature(new Polygon(featureCoordinates.polygon_b));
const circle_b = new Feature(new Polygon(featureCoordinates.circle_b));
const point_a = new Feature(new Point(featureCoordinates.point_a));
const polygon_c = new Feature(new Polygon(featureCoordinates.polygon_c));

const replyGet = (options) => {
    const url = new URL(options.path, options.origin);
    let params = {};
    for (const [key, value] of url.searchParams) {
        params[key] = value;
    }
    return {
        method: options.method,
        origin: url.origin,
        pathname: url.pathname,
        params: params,
    };
};

const replyPost = (options) => {
    const url = new URL(options.path, options.origin);
    let params = {};
    for (const [key, value] of url.searchParams) {
        params[key] = value;
    }
    let body = options.body;
    if (options.headers['content-type'].includes('text/plain')) {
        body = {};
        const bodyParams = new URLSearchParams(options.body);
        for (const [key, value] of bodyParams) {
            body[key] = value;
        }
    }
    return {
        method: options.method,
        origin: url.origin,
        pathname: url.pathname,
        params: params,
        body: body,
    };
};

describe('Utils', function () {
    before(function () {
        // runs once before the first test in this block
        agent.disableNetConnect();
        setGlobalDispatcher(agent);
    });

    after(async function () {
        // runs once after the last test in this block
        await agent.close();
        setGlobalDispatcher(new Agent());
    });

    it('fetch', async function () {
        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'GET',
            })
            .reply(200, replyGet);

        let data = await Utils.fetch('http://localhost:8130/index.php/lizmap/service?repository=test&project=test').then((res) => res.json());
        expect(data).to.deep.eq({
            method: 'GET',
            origin: 'http://localhost:8130',
            params: {
                project: 'test',
                repository: 'test',
            },
            pathname: '/index.php/lizmap/service',
        });

        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'POST',
            })
            .reply(200, replyPost);

        data = await Utils.fetch('http://localhost:8130/index.php/lizmap/service', {
            method: 'POST',
            body: 'repository=test&project=test',
        }).then((res) => res.json());
        expect(data).to.deep.eq({
            body: {
                project: 'test',
                repository: 'test',
            },
            method: 'POST',
            origin: 'http://localhost:8130',
            params: {},
            pathname: '/index.php/lizmap/service',
        });
    });

    it('fetch new url', async function () {
        client
            .intercept({
                path: /\/index.php\/lizmap\/service\/test\/test/,
                method: 'GET',
            })
            .reply(200, replyGet);

        let data = await Utils.fetch('http://localhost:8130/index.php/lizmap/service/test/test').then((res) => res.json());
        expect(data).to.deep.eq({
            method: 'GET',
            origin: 'http://localhost:8130',
            params: {},
            pathname: '/index.php/lizmap/service/test/test',
        });

        client
            .intercept({
                path: /\/index.php\/lizmap\/service\/test\/test/,
                method: 'POST',
            })
            .reply(200, replyPost);

        data = await Utils.fetch('http://localhost:8130/index.php/lizmap/service/test/test', {
            method: 'POST',
            body: 'foo=bar',
        }).then((res) => res.json());
        expect(data).to.deep.eq({
            body: {
                foo: 'bar',
            },
            method: 'POST',
            origin: 'http://localhost:8130',
            params: {},
            pathname: '/index.php/lizmap/service/test/test',
        });
    });

    it('fetch error', async function () {
        // 500 error
        client
            .intercept({
                path: (path) => path.includes('internal/server/error'),
                method: 'GET',
            })
            .reply(500, {
                message: 'Internal server error',
                status: 'error',
                code: 500,
            });

        try {
            await Utils.fetch('http://localhost:8130/internal/server/error');
        } catch (error) {
            expect(error.name).to.be.eq('HttpError');
            expect(error.statusCode).to.be.eq(500);
            expect(error.message).to.be.eq('HTTP error: 500');
            expect(error.resource).to.be.eq('http://localhost:8130/internal/server/error');
            expect(error.options).to.be.undefined;
        }

        // 404 error
        client
            .intercept({
                path: (path) => !path.includes('index.php/lizmap/service'),
                method: 'GET',
            })
            .reply(404, {
                message: 'Not found',
                status: 'error',
                code: 404,
            });
        try {
            await Utils.fetch('http://localhost:8130/index.php/lizmap/unknown?repository=test&project=test');
        } catch (error) {
            expect(error.name).to.be.eq('HttpError');
            expect(error.statusCode).to.be.eq(404);
            expect(error.message).to.be.eq('HTTP error: 404');
            expect(error.resource).to.be.eq('http://localhost:8130/index.php/lizmap/unknown?repository=test&project=test');
            expect(error.options).to.be.undefined;
        }

        // fetch POST failed
        client
            .intercept({
                path: (path) => !path.includes('index.php/lizmap/service'),
                method: 'POST',
            })
            .reply(404, {
                message: 'Not found',
                status: 'error',
                code: 404,
            });
        try {
            await Utils.fetch('http://localhost:8130/index.php/lizmap/unknown', {
                method: 'POST',
                body: 'repository=test&project=test',
            });
        } catch (error) {
            expect(error.name).to.be.eq('HttpError');
            expect(error.statusCode).to.be.eq(404);
            expect(error.message).to.be.eq('HTTP error: 404');
            expect(error.resource).to.be.eq('http://localhost:8130/index.php/lizmap/unknown');
            expect(error.options).to.deep.eq({
                method: 'POST',
                body: 'repository=test&project=test',
            });
        }

        // Network error
        try {
            await Utils.fetch('http://localhost:8130/index.php/lizmap/unknown?repository=test&project=test');
        } catch (error) {
            expect(error.name).to.be.eq('NetworkError');
            expect(error.message).to.be.eq('fetch failed');
            expect(error.resource).to.be.eq('http://localhost:8130/index.php/lizmap/unknown?repository=test&project=test');
            expect(error.options).to.be.undefined;
        }
    });

    it('fetchJSON', async function () {
        // JSON content type
        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'GET',
            })
            .reply(200, replyGet, { headers: { 'content-type': 'application/json' } });
        let data = await Utils.fetchJSON('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
        expect(data).to.deep.eq({
            method: 'GET',
            origin: 'http://localhost:8130',
            params: {
                project: 'test',
                repository: 'test',
            },
            pathname: '/index.php/lizmap/service',
        });

        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'POST',
            })
            .reply(200, replyPost, { headers: { 'content-type': 'application/json' } });
        data = await Utils.fetchJSON('http://localhost:8130/index.php/lizmap/service', {
            method: 'POST',
            body: 'repository=test&project=test',
        });
        expect(data).to.deep.eq({
            body: {
                project: 'test',
                repository: 'test',
            },
            method: 'POST',
            origin: 'http://localhost:8130',
            params: {},
            pathname: '/index.php/lizmap/service',
        });

        // GeoJSON content type
        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'GET',
            })
            .reply(200, replyGet, { headers: { 'content-type': 'application/vnd.geo+json' } });
        data = await Utils.fetchJSON('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
        expect(data).to.deep.eq({
            method: 'GET',
            origin: 'http://localhost:8130',
            params: {
                project: 'test',
                repository: 'test',
            },
            pathname: '/index.php/lizmap/service',
        });
    });

    it('fetchJSON response error', async function () {
        // Error content type
        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'GET',
            })
            .reply(200, replyGet, { headers: { 'content-type': 'text/html' } });

        try {
            await Utils.fetchJSON('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
        } catch (error) {
            expect(error.name).to.be.eq('ResponseError');
            expect(error.message).to.be.eq('Invalid content type: text/html');
            expect(error.resource).to.be.eq('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
            expect(error.options).to.be.undefined;
        }
    });

    it('fetchHTML', async function () {
        // JSON content type
        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'GET',
            })
            .reply(200, replyGet, { headers: { 'content-type': 'text/html' } });
        let data = await Utils.fetchHTML('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
        expect(JSON.parse(data)).to.deep.eq({
            method: 'GET',
            origin: 'http://localhost:8130',
            params: {
                project: 'test',
                repository: 'test',
            },
            pathname: '/index.php/lizmap/service',
        });
    });

    it('fetchHTML Response error', async function () {
        // JSON content type
        client
            .intercept({
                path: /\/index.php\/lizmap\/service/,
                method: 'GET',
            })
            .reply(200, replyGet, { headers: { 'content-type': 'application/json' } });
        try {
            await Utils.fetchHTML('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
        } catch (error) {
            expect(error.name).to.be.eq('ResponseError');
            expect(error.message).to.be.eq('Invalid content type: application/json');
            expect(error.resource).to.be.eq('http://localhost:8130/index.php/lizmap/service?repository=test&project=test');
            expect(error.options).to.be.undefined;
        }
    });

    it('Calculate intersections points of the given set of features', function () {
        const test_features = [
            {
                features: [linestring_b, circle_a],
                expectIntersections:0
            },
            {
                features: [polygon_a, circle_a],
                expectIntersections:0
            },
            {
                features: [polygon_a, circle_a, polygon_b],
                expectIntersections:0
            },
            {
                features: [linestring_a, linestring_b],
                expectIntersections:1
            },
            {
                features: [linestring_a, linestring_b, circle_b],
                expectIntersections:1
            },
            {
                features: [linestring_a, circle_a],
                expectIntersections:2
            },
            {
                features: [linestring_a, polygon_a],
                expectIntersections:2
            },
            {
                features: [linestring_a, polygon_a, circle_a],
                expectIntersections:4
            },
            {
                features: [linestring_a, polygon_a, circle_a, linestring_b],
                expectIntersections:6
            },
            {
                // point_a lies inside circle_a, no intersection
                features: [circle_a, point_a],
                expectIntersections:0
            },
            {
                features: [circle_a, circle_b],
                expectIntersections:2
            },
            {
                features: [polygon_b, circle_b],
                expectIntersections:2
            },
            {
                // whole dataset
                features: [linestring_a, linestring_b, circle_a, circle_b, polygon_a, polygon_b, point_a],
                expectIntersections:10
            },
            {
                // compare two identical geomtries, no intersection expected
                features: [linestring_a, linestring_a],
                expectIntersections:0
            }
        ];

        test_features.forEach((param)=>{
            const intersections = Utils.calculateGeometriesIntersections(param.features);
            expect(intersections).to.be.an('array').that.have.length(param.expectIntersections)
        })
    })

    it('Split features in segments', function () {
        const test_features = [
            {
                feature:linestring_a,
                expectedSegments:4
            },
            {
                feature:linestring_b,
                expectedSegments:4
            },
            {
                feature:polygon_a,
                expectedSegments:4
            },
            {
                // digitized square feature
                feature:polygon_b,
                expectedSegments:4
            },
            {
                feature:polygon_c,
                expectedSegments:5
            },
            {
                // a point has no segments
                feature:point_a,
                expectedSegments:0
            },
            {
                // fromCircle with 128 edges
                feature:circle_a,
                expectedSegments:128
            },
            {
                // fromCircle with 128 edges
                feature:circle_b,
                expectedSegments:128
            }
        ]

        test_features.forEach((param)=>{
            const segments = Utils.getSegmentsFromGeometry(param.feature.getGeometry());
            expect(segments).to.be.an('array').that.have.length(param.expectedSegments)
        })
    })

    it('Return intersection point of two given segment', function () {
        // using Utils.getSegmentsFromGeometry to get segments
        const test_features = [
            {
                segments:[
                    Utils.getSegmentsFromGeometry(linestring_a.getGeometry())[0],
                    Utils.getSegmentsFromGeometry(linestring_b.getGeometry())[0],
                ],
                expectedCoords:null
            },
            {
                segments:[
                    Utils.getSegmentsFromGeometry(linestring_a.getGeometry())[2],
                    Utils.getSegmentsFromGeometry(linestring_b.getGeometry())[0],
                ],
                expectedCoords:[3.8432783872159546, 43.64398255159795]
            },
            {
                segments:[
                    Utils.getSegmentsFromGeometry(polygon_a.getGeometry())[3],
                    Utils.getSegmentsFromGeometry(linestring_b.getGeometry())[0],
                ],
                expectedCoords:[3.847370494616892, 43.64355697242826]
            },
        ]

        test_features.forEach((param)=>{
            const intersectionPoint = Utils.getLineSegmentsIntersection(param.segments[0],param.segments[1]);
            if (param.expectedCoords === null) {
                expect(intersectionPoint).to.be.null;
            } else {
                expect(intersectionPoint).to.be.deep.equal(param.expectedCoords);
            }

        })
    })
});
