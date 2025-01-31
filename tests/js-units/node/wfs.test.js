import { expect } from 'chai';

import { MockAgent, setGlobalDispatcher, Agent } from 'undici';

import WFS from 'assets/src/modules/WFS.js';

const agent = new MockAgent();
const client = agent.get('http://localhost:8130');

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

const wfs = new WFS();

describe('WFS', function () {
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

    it('describeFeatureType', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(200, replyPost, {headers: {'content-type': 'application/json'}});
        const data = await wfs.describeFeatureType({typeName:'test'});
        expect(data).to.deep.eq({
            "body": {
                SERVICE: 'WFS',
                REQUEST: 'DescribeFeatureType',
                VERSION: '1.0.0',
                OUTPUTFORMAT: 'JSON',
                "project": "test",
                "repository": "test",
                "typeName": "test",
            },
            "method": "POST",
            "origin": "http://localhost:8130",
            "params": {},
            "pathname": "/index.php/lizmap/service",
        });
    })

    it('GetFeature', async function () {
        client
        .intercept({
            path: /\/index.php\/lizmap\/service/,
            method: 'POST',
        })
        .reply(200, replyPost, {headers: {'content-type': 'application/vnd.geo+json'}});
        const data = await wfs.getFeature({typeName:'test'});
        expect(data).to.deep.eq({
            "body": {
                SERVICE: 'WFS',
                REQUEST: 'GetFeature',
                VERSION: '1.0.0',
                OUTPUTFORMAT: 'GeoJSON',
                "project": "test",
                "repository": "test",
                "typeName": "test",
            },
            "method": "POST",
            "origin": "http://localhost:8130",
            "params": {},
            "pathname": "/index.php/lizmap/service",
        });
    })
})
