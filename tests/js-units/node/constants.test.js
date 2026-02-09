import { expect } from 'chai';

import { MEDIA_REGEX, URL_REGEX } from 'assets/src/utils/Constants.js'
import {
    base64png,
    base64pngNullData,
    base64svg,
    base64svgPointLayer,
    base64svgLineLayer,
    base64svgPolygonLayer,
    base64svgRasterLayer,
} from 'assets/src/modules/state/SymbologyIcons.js';

describe('MEDIA_REGEX', function () {
    it('media folder in repository', function () {
        expect(MEDIA_REGEX.test('media/foo/bar.png')).to.be.true;
    });

    it('media folder located in the root data folder', function () {
        expect(MEDIA_REGEX.test('../media/foo/bar.png')).to.be.true;
    });

    it('not a media path', function() {
        expect(MEDIA_REGEX.test('tests/media/foo/bar.png')).to.be.false;
        expect(MEDIA_REGEX.test('../tests/media/foo/bar.png')).to.be.false;
        expect(MEDIA_REGEX.test('http://localhost:8130/media/foo/bar.png')).to.be.false;
        expect(MEDIA_REGEX.test('https://localhost:8130/media/foo/bar.png')).to.be.false;
        expect(MEDIA_REGEX.test(base64png+base64pngNullData)).to.be.false;
        expect(MEDIA_REGEX.test(base64svg+base64svgPointLayer)).to.be.false;
    });
});


describe('URL_REGEX', function () {
    it('path starts with http://', function () {
        expect(URL_REGEX.test('http://localhost:8130/media/foo/bar.png')).to.be.true;
    });

    it('path starts with https://', function () {
        expect(URL_REGEX.test('https://localhost:8130/media/foo/bar.png')).to.be.true;
    });

    it('path starts with data:', function () {
        expect(URL_REGEX.test(base64png+base64pngNullData)).to.be.true;
        expect(URL_REGEX.test(base64svg+base64svgPointLayer)).to.be.true;
        expect(URL_REGEX.test(base64svg+base64svgLineLayer)).to.be.true;
        expect(URL_REGEX.test(base64svg+base64svgPolygonLayer)).to.be.true;
        expect(URL_REGEX.test(base64svg+base64svgRasterLayer)).to.be.true;
        let data = "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=";
        expect(URL_REGEX.test(base64png+data)).to.be.true;
    });

    it('not an url', function() {
        expect(URL_REGEX.test('tests/media/foo/bar.png')).to.be.false;
        expect(URL_REGEX.test('../tests/media/foo/bar.png')).to.be.false;
        expect(URL_REGEX.test('media/foo/bar.png')).to.be.false;
        expect(URL_REGEX.test('../media/foo/bar.png')).to.be.false;
    });
});
