import { expect } from 'chai';

import { MetadataConfig } from 'assets/src/modules/config/Metadata.js';

describe('MetadataConfig', function () {
    it('Empty metadata', function () {
        const mt = new MetadataConfig();
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.1.8')
        expect(mt.lizmap_plugin_version).to.be.eq(30108)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30200)
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
        expect(mt.qgis_desktop_version).to.be.eq(32200)
    })

    it('events.qgs.cfg metadata', function () {
        const mt = new MetadataConfig({
            "qgis_desktop_version": 31615,
            "lizmap_plugin_version": "3.7.7",
            "lizmap_web_client_target_version": 30500
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.7.7')
        expect(mt.lizmap_plugin_version).to.be.eq(30707)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30500)
        expect(mt.qgis_desktop_version).to.be.eq(31615)
    })

    it('stratup.qgs.cfg metadata', function () {
        const mt = new MetadataConfig({
            "qgis_desktop_version": 32211,
            "lizmap_plugin_version_str": "3.9.1",
            "lizmap_plugin_version": 30901,
            "lizmap_web_client_target_version": 30500,
            "lizmap_web_client_target_status": "Stable"
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.9.1')
        expect(mt.lizmap_plugin_version).to.be.eq(30901)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30500)
        expect(mt.qgis_desktop_version).to.be.eq(32211)
    })

    it('stratup.qgs.cfg metadata', function () {
        const mt = new MetadataConfig({
            "qgis_desktop_version": 32216,
            "lizmap_plugin_version_str": "3.13.1-alpha",
            "lizmap_plugin_version": 31301,
            "lizmap_web_client_target_version": 30700,
            "lizmap_web_client_target_status": "Dev",
            "instance_target_url": "http://localhost:8130/"
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.13.1-alpha')
        expect(mt.lizmap_plugin_version).to.be.eq(31301)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30700)
        expect(mt.qgis_desktop_version).to.be.eq(32216)
    })

    it('stratup.qgs.cfg metadata', function () {
        const mt = new MetadataConfig({
            "qgis_desktop_version": 31615,
            "lizmap_plugin_version": "3.7.8-pre",
            "lizmap_web_client_target_version": 30500
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.7.8-pre')
        expect(mt.lizmap_plugin_version).to.be.eq(30708)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30500)
        expect(mt.qgis_desktop_version).to.be.eq(31615)
    })

    it('montpellier_filtered.qgs.cfg metadata', function () {
        const mt = new MetadataConfig({
            "lizmap_plugin_version": "3.2.18",
            "lizmap_web_client_target_version": 30300
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('3.2.18')
        expect(mt.lizmap_plugin_version).to.be.eq(30218)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30300)
        expect(mt.qgis_desktop_version).to.be.eq(30000)
    })

    it('dnd_form.qgs.cfg metadata', function () {
        const mt = new MetadataConfig({
            "qgis_desktop_version": 32204,
            "lizmap_plugin_version": "master",
            "lizmap_web_client_target_version": 30500
        });
        expect(mt.lizmap_plugin_version_str).to.be.eq('master')
        expect(mt.lizmap_plugin_version).to.be.eq(999999)
        expect(mt.lizmap_web_client_target_version).to.be.eq(30500)
        expect(mt.qgis_desktop_version).to.be.eq(32204)
    })
})
