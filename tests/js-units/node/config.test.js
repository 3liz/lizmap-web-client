import { expect } from 'chai';

import { readFileSync } from 'fs';

import { ValidationError } from 'assets/src/modules/Errors.js';
import { Config } from 'assets/src/modules/Config.js';
import { OptionsConfig } from 'assets/src/modules/config/Options.js';
import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerTreeGroupConfig } from 'assets/src/modules/config/LayerTree.js';
import { BaseLayersConfig } from 'assets/src/modules/config/BaseLayer.js';
import { MetadataConfig } from 'assets/src/modules/config/Metadata.js';
import { LocateByLayerConfig } from 'assets/src/modules/config/Locate.js';
import { AttributeLayersConfig } from 'assets/src/modules/config/AttributeTable.js';
import { TooltipLayersConfig } from 'assets/src/modules/config/Tooltip.js';
import { ThemesConfig } from 'assets/src/modules/config/Theme.js';
import { DatavizLayersConfig, DatavizOptionsConfig } from 'assets/src/modules/config/Dataviz.js';


describe('Config', function () {

    it('ValidationError', function () {
        try {
            new Config()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The config is not an Object! It\'s undefined')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The config is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({layers:{}, datavizLayers:{}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The WMS Capabilities is not an Object! It\'s undefined')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({layers:{}, datavizLayers:{}}, {})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The WMS Capabilities is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({layers:{}, datavizLayers:{}}, {Service:{}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `options` in the config!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({options:{}, layers:{}, datavizLayers:{}}, {Service:{}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `Capability` in the WMS Capabilities!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new Config({options:{}, layers:{}, datavizLayers:{}}, {Capability:{}})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The `options` in the config is empty!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('Valid', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const initialConfig = new Config(config, capabilities);

        expect(initialConfig.options).to.be.instanceOf(OptionsConfig)
        expect(initialConfig.layers).to.be.instanceOf(LayersConfig)
        expect(initialConfig.layerTree).to.be.instanceOf(LayerTreeGroupConfig)
        expect(initialConfig.baseLayers).to.be.instanceOf(BaseLayersConfig)
        expect(initialConfig.layersOrder).to.have.ordered.members([
            "points_of_interest",
            "edition_line",
            "areas_of_interest",
            "bus_stops",
            "bus",
            //"tramway_ref",
            //"tramway_pivot",
            //"tram_stop_work",
            "tramstop",
            "tramway",
            "publicbuildings",
            //"publicbuildings_tramstop",
            //"donnes_sociodemo_sous_quartiers",
            "SousQuartiers",
            "Quartiers",
            "VilleMTP_MTP_Quartiers_2011_4326",
            "osm-mapnik",
            "osm-stamen-toner"
        ])
        expect(initialConfig.vectorLayerResultFormat).to.be.an('array').that.be.empty
        expect(initialConfig.vectorLayerFeatureTypeList).to.be.an('array').that.be.empty
        expect(initialConfig.metadata).to.be.instanceOf(MetadataConfig)
        expect(initialConfig.hasLocateByLayer).to.be.true
        expect(initialConfig.locateByLayer).to.be.instanceOf(LocateByLayerConfig)
        expect(initialConfig.hasAttributeLayers).to.be.true
        expect(initialConfig.attributeLayers).to.be.instanceOf(AttributeLayersConfig)
        expect(initialConfig.hasTimemanagerLayers).to.be.false
        expect(initialConfig.timemanagerLayers).to.be.null
        expect(initialConfig.hasRelations).to.be.true
        expect(initialConfig.hasPrintTemplates).to.be.true
        expect(initialConfig.hasTooltipLayers).to.be.true
        expect(initialConfig.tooltipLayers).to.be.instanceOf(TooltipLayersConfig)
        expect(initialConfig.hasEditionLayers).to.be.false
        expect(initialConfig.editionLayers).to.be.null
        expect(initialConfig.hasFormFilterLayers).to.be.false
        expect(initialConfig.formFilterLayers).to.be.null
        expect(initialConfig.hasLoginFilteredLayers).to.be.false
        expect(initialConfig.hasThemes).to.be.true
        expect(initialConfig.themes).to.be.instanceOf(ThemesConfig)
        expect(initialConfig.datavizLocale).to.be.eq('fr_FR')
        expect(initialConfig.hasDatavizConfig).to.be.true
        expect(initialConfig.datavizLayers).to.be.instanceOf(DatavizLayersConfig)
        expect(initialConfig.datavizOptions).to.be.instanceOf(DatavizOptionsConfig)
    })

    it('Valid with WFS', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const wfsCapabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities-wfs.json', 'utf8'));
        expect(wfsCapabilities).to.not.be.undefined
        expect(wfsCapabilities.Capability).to.not.be.undefined

        const initialConfig = new Config(config, capabilities, wfsCapabilities);
        expect(initialConfig.vectorLayerResultFormat).to.be.an('array').that.have.length(13).that.include.members(['GML2', 'GeoJSON'])
        expect(initialConfig.vectorLayerFeatureTypeList).to.be.an('array').that.have.length(16)
        const featureType = initialConfig.vectorLayerFeatureTypeList[0];
        expect(featureType.Name).to.be.eq('SousQuartiers')
        expect(featureType.SRS).to.be.eq('EPSG:2154')
        expect(featureType.LatLongBoundingBox).to.be.an('array').that.have.length(4)
    })

    it('SingleWMS Layer Config', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/single_wms_image-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/single_wms_image-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const initialConfig = new Config(config, capabilities);

        expect(initialConfig.options).to.be.instanceOf(OptionsConfig)
        expect(initialConfig.options.wms_single_request_for_all_layers).to.be.eq(true)
    })

})
