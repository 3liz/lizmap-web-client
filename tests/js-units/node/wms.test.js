import { expect } from 'chai';

import { MockAgent, setGlobalDispatcher, Agent } from 'undici';

import WMS from 'assets/src/modules/WMS.js';

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
    if (options.headers['content-type'].includes('text/plain')
        || options.headers['content-type'].includes('application/x-www-form-urlencoded')) {
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

globalThis.lizUrls = {
    params: {
        "repository": "test",
        "project": "test"
    },
    wms: "http://localhost:8130/index.php/lizmap/service",
}

const wms = new WMS();

describe('WMS', function () {
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

    it('getFeatureInfo', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(200, replyPost, {headers: {'content-type': 'text/html'}});
        const data = await wms.getFeatureInfo({Name:'test'});
        expect(JSON.parse(data)).to.deep.eq({
            "body": {
                SERVICE: 'WMS',
                REQUEST: 'GetFeatureInfo',
                VERSION: '1.3.0',
                CRS: 'EPSG:4326',
                INFO_FORMAT: 'text/html',
                "project": "test",
                "repository": "test",
                "Name": "test",
            },
            "method": "POST",
            "origin": "http://localhost:8130",
            "params": {},
            "pathname": "/index.php/lizmap/service",
        });
    })

    it('getLegendGraphic', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(200, replyPost, {headers: {'content-type': 'application/json'}});
        const data = await wms.getLegendGraphic({Name:'test'});
        expect(data).to.deep.eq({
            "body": {
                SERVICE: 'WMS',
                REQUEST: 'GetLegendGraphic',
                VERSION: '1.3.0',
                FORMAT: 'application/json',
                "project": "test",
                "repository": "test",
                "Name": "test",
            },
            "method": "POST",
            "origin": "http://localhost:8130",
            "params": {},
            "pathname": "/index.php/lizmap/service",
        });
    })
})
