import { expect } from 'chai';
import { MockAgent, setGlobalDispatcher, Agent } from 'undici';
import { Utils } from 'assets/src/modules/Utils.js';

const agent = new MockAgent();
const client = agent.get('http://localhost:8130');

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
});
