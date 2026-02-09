import { expect } from 'chai';

import { MEDIA_REGEX } from 'assets/src/utils/Constants.js'

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
    });
});
