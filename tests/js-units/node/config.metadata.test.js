import { expect } from 'chai';

import { MetadataConfig } from '../../../assets/src/modules/config/Metadata.js';

describe('MetadataConfig', function () {
    it('Empty metadata', function () {
        const mt = new MetadataConfig();
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.1.8')
        expect(mt.lizmap_plugin_version).to.be.eq(30108)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30200)
        expect(mt.project_valid).to.be.eq(null)
        expect(mt.qgis_desktop_version).to.be.eq(30000)
    })

    it('From object metadata', function () {
        const mt = new MetadataConfig({
            lizmap_plugin_version_str: '3.8.1',
            lizmap_plugin_version: 30801,
            lizmap_web_client_target_version: 30503,
            project_valid: true,
            qgis_desktop_version: 32200,
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.8.1')
        expect(mt.lizmap_plugin_version).to.be.eq(30801)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30503)
        expect(mt.project_valid).to.be.eq(true)
        expect(mt.qgis_desktop_version).to.be.eq(32200)
    })
})
