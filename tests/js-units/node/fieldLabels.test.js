import { expect } from 'chai';

import FieldLabels, { MAX_FILTERED_CODES } from 'assets/src/modules/FieldLabels.js';

/**
 * A fake WFS module, returning the features of a source layer and recording the requests.
 */
class FakeWFS {

    /**
     * Create the fake WFS module.
     * @param {Array} features - The features returned by getFeature
     */
    constructor(features) {
        this.features = features;
        this.requests = [];
        this.fail = false;
    }

    /**
     * Record the request and return the features.
     * @param {object} options - The GetFeature parameters
     * @returns {Promise<object>} The GeoJSON response
     */
    getFeature(options) {
        this.requests.push(options);
        if (this.fail) {
            return Promise.reject(new Error('Request failed'));
        }
        return Promise.resolve({ type: 'FeatureCollection', features: this.features });
    }
}

/**
 * A fake legacy lizMap object, to trigger the edition events.
 */
class FakeLizmap3 {

    /**
     * Create the fake lizMap object.
     */
    constructor() {
        this.handlers = {};
        this.events = {
            on: (handlers) => Object.assign(this.handlers, handlers),
        };
    }

    /**
     * Trigger an event.
     * @param {string} name  - The event name
     * @param {object} event - The event properties
     */
    trigger(name, event) {
        this.handlers[name](event);
    }
}

const features = [
    { type: 'Feature', properties: { code: 1, label: 'One' } },
    { type: 'Feature', properties: { code: 2, label: 'Two' } },
];

const source = {
    layerId: 'source_layer_id',
    typeName: 'source',
    codeField: 'code',
    labelField: 'label',
};

describe('FieldLabels', function () {

    it('buildExpFilter', function () {
        // No filter
        expect(FieldLabels.buildExpFilter(source)).to.be.eq('');

        // The source layer filter only
        expect(FieldLabels.buildExpFilter({...source, expFilter: '"active"'})).to.be.eq('"active"');

        // The codes are quoted, sorted, without duplicates nor null values
        expect(FieldLabels.buildExpFilter({...source, codes: ['b', "l'a", null, 'b', 1]}))
            .to.be.eq(`"code" IN ('1', 'b', 'l''a')`);

        // Both filters are enclosed with parenthesis
        expect(FieldLabels.buildExpFilter({...source, expFilter: '"a" OR "b"', codes: [1]}))
            .to.be.eq(`( "a" OR "b" ) AND ( "code" IN ('1') )`);

        // The field name is quoted
        expect(FieldLabels.buildExpFilter({...source, codeField: 'my "code"', codes: [1]}))
            .to.be.eq(`"my ""code""" IN ('1')`);

        // Too many codes: all the labels
        const codes = Array.from({length: MAX_FILTERED_CODES + 1}, (v, i) => i);
        expect(FieldLabels.buildExpFilter({...source, codes: codes})).to.be.eq('');
    });

    it('getLabels requests the labels without geometry', async function () {
        const wfs = new FakeWFS(features);
        const fieldLabels = new FieldLabels(wfs);

        const labels = await fieldLabels.getLabels({...source, expFilter: '"active"'});
        expect(labels).to.be.deep.eq({ 1: 'One', 2: 'Two' });
        expect(wfs.requests).to.have.length(1);
        expect(wfs.requests[0]).to.be.deep.eq({
            TYPENAME: 'source',
            PROPERTYNAME: 'code,label',
            GEOMETRYNAME: 'none',
            EXP_FILTER: '"active"',
        });

        // No code: no request
        expect(await fieldLabels.getLabels({...source, codes: [null]})).to.be.deep.eq({});
        expect(wfs.requests).to.have.length(1);
    });

    it('getLabels uses the cache', async function () {
        const wfs = new FakeWFS(features);
        const fieldLabels = new FieldLabels(wfs);

        // Simultaneous calls share the request
        const [labels1, labels2] = await Promise.all([fieldLabels.getLabels(source), fieldLabels.getLabels(source)]);
        expect(labels1).to.be.deep.eq(labels2);
        expect(wfs.requests).to.have.length(1);

        // The cached labels are used
        await fieldLabels.getLabels(source);
        expect(wfs.requests).to.have.length(1);

        // Another filter is another request
        await fieldLabels.getLabels({...source, codes: [1]});
        expect(wfs.requests).to.have.length(2);

        // Cleared cache: new request
        fieldLabels.clear();
        await fieldLabels.getLabels(source);
        expect(wfs.requests).to.have.length(3);
    });

    it('getLabels requests again the old labels', async function () {
        const wfs = new FakeWFS(features);
        // No time to live: the labels are always requested
        const fieldLabels = new FieldLabels(wfs, undefined, 0);

        await fieldLabels.getLabels(source);
        await fieldLabels.getLabels(source);
        expect(wfs.requests).to.have.length(2);
    });

    it('getLabels does not keep a failed request', async function () {
        const wfs = new FakeWFS(features);
        const fieldLabels = new FieldLabels(wfs);

        // The failed request is rejected
        wfs.fail = true;
        let error = null;
        try {
            await fieldLabels.getLabels(source);
        } catch (e) {
            error = e;
        }
        expect(error).to.be.instanceOf(Error);

        // The next call requests again the labels
        wfs.fail = false;
        expect(await fieldLabels.getLabels(source)).to.be.deep.eq({ 1: 'One', 2: 'Two' });
        expect(wfs.requests).to.have.length(2);
    });

    it('invalidate on edition', async function () {
        const wfs = new FakeWFS(features);
        const lizmap3 = new FakeLizmap3();
        const fieldLabels = new FieldLabels(wfs, lizmap3);

        await fieldLabels.getLabels(source);
        expect(wfs.requests).to.have.length(1);

        // An edition of another layer keeps the cached labels
        lizmap3.trigger('lizmapeditionfeaturemodified', { layerId: 'other_layer_id' });
        await fieldLabels.getLabels(source);
        expect(wfs.requests).to.have.length(1);

        // Each edition of the source layer removes the cached labels
        let count = 1;
        for (const eventName of ['lizmapeditionfeaturecreated', 'lizmapeditionfeaturemodified', 'lizmapeditionfeaturedeleted']) {
            lizmap3.trigger(eventName, { layerId: 'source_layer_id' });
            await fieldLabels.getLabels(source);
            count++;
            expect(wfs.requests).to.have.length(count);
        }
    });
});
