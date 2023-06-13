import { expect } from 'chai';

import { ValidationError, ConversionError } from '../../../../assets/src/modules/Errors.js';
import { LayerThemeConfig, ThemeConfig, ThemesConfig } from '../../../../assets/src/modules/config/Theme.js';

describe('LayerThemeConfig', function () {
    it('Valid', function () {
        const layer1 = new LayerThemeConfig("SousQuartiers20160121124316563", {"style":"default", "expanded":"1"})
        expect(layer1.layerId).to.be.eq('SousQuartiers20160121124316563')
        expect(layer1.style).to.be.eq('default')
        expect(layer1.expanded).to.be.eq(true)
    })

    it('ValidationError', function () {
        try {
            new LayerThemeConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new LayerThemeConfig("SousQuartiers20160121124316563")
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('ConversionError', function () {
        try {
            new LayerThemeConfig("SousQuartiers20160121124316563", {"style":"default", "expanded":"trust"})
        } catch (error) {
            expect(error.name).to.be.eq('ConversionError')
            expect(error.message).to.be.eq('`trust` is not an expected boolean: true, t, yes, y, 1, false, f, no, n, 0 or empty string ``!')
            expect(error).to.be.instanceOf(ConversionError)
        }
    })
})

describe('ThemeConfig', function () {
    it('Valid', function () {
        const theme = new ThemeConfig("Administrative", {
            "layers":{
                "SousQuartiers20160121124316563":{"style":"default","expanded":"1"},
                "donnes_sociodemo_sous_quartiers20160121144525075":{"style":"default","expanded":"1"},
                "publicbuildings20150420100958543":{"style":"default","expanded":"1"},
                "VilleMTP_MTP_Quartiers_2011_432620130116112610876":{"style":"default","expanded":"0"}
            },
            "expandedGroupNode":["Edition","datalayers\/Tramway","datalayers\/Bus","datalayers\/Buildings","Overview","datalayers","Hidden"]
        })
        expect(theme.name).to.be.eq('Administrative')

        expect(theme.layerIds.length).to.be.eq(4)
        expect(theme.layerIds[0]).to.be.eq('SousQuartiers20160121124316563')
        expect(theme.getLayerIds().next().value).to.be.eq('SousQuartiers20160121124316563')

        expect(theme.layerConfigs.length).to.be.eq(4)
        const layer1 = theme.layerConfigs[0];
        expect(layer1).to.be.instanceOf(LayerThemeConfig)
        expect(layer1.layerId).to.be.eq('SousQuartiers20160121124316563')
        expect(layer1.style).to.be.eq('default')
        expect(layer1.expanded).to.be.eq(true)

        expect(theme.getLayerConfigByLayerId('SousQuartiers20160121124316563')).to.be.eq(layer1)
        expect(theme.getLayerConfigs().next().value).to.be.eq(layer1)

        expect(theme.expandedGroupNodes.length).to.be.eq(7)
        expect(theme.expandedGroupNodes[0]).to.be.eq('Edition')
        expect(theme.getExpandedGroupNodes().next().value).to.be.eq('Edition')
    })

    it('ValidationError', function () {
        try {
            new ThemeConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new ThemeConfig("Administrative")
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('ThemesConfig', function () {
    it('Valid', function () {
        const themes = new ThemesConfig({
            "Administrative":{
                "layers":{
                    "SousQuartiers20160121124316563":{"style":"default","expanded":"1"},
                    "donnes_sociodemo_sous_quartiers20160121144525075":{"style":"default","expanded":"1"},
                    "publicbuildings20150420100958543":{"style":"default","expanded":"1"},
                    "VilleMTP_MTP_Quartiers_2011_432620130116112610876":{"style":"default","expanded":"0"}
                },
                "expandedGroupNode":["Edition","datalayers\/Tramway","datalayers\/Bus","datalayers\/Buildings","Overview","datalayers","Hidden"]
            },
            "Editable layers":{
                "layers":{
                    "SousQuartiers20160121124316563":{"style":"default","expanded":"1"},
                    "donnes_sociodemo_sous_quartiers20160121144525075":{"style":"default","expanded":"1"},
                    "publicbuildings20150420100958543":{"style":"default","expanded":"1"},
                    "edition_polygon20130409114333776":{"style":"default","expanded":"0"},
                    "edition_line20130409161630329":{"style":"default","expanded":"0"},
                    "edition_point20130118171631518":{"style":"default","expanded":"0"}
                },
                "expandedGroupNode":["Edition","datalayers\/Tramway","datalayers\/Bus","datalayers\/Buildings","Overview","datalayers","Hidden"]
            },
            "Transport":{
                "layers":{
                    "tramway20150328114206278":{"style":"black","expanded":"1"},
                    "donnes_sociodemo_sous_quartiers20160121144525075":{"style":"default","expanded":"1"},
                    "tramway_ref20150612171109044":{"style":"default","expanded":"1"},
                    "jointure_tram_stop20150328114216806":{"style":"default","expanded":"1"},
                    "tramstop20150328114203878":{"style":"default","expanded":"1"},
                    "tram_stop_work20150416102656130":{"style":"default","expanded":"1"},
                    "bus_stops20121106170806413":{"style":"default","expanded":"0"},
                    "bus20121102133611751":{"style":"default","expanded":"0"}
                },
                "expandedGroupNode":["Edition","datalayers\/Tramway","datalayers\/Bus","datalayers\/Buildings","Overview","datalayers","Hidden"]
            }
        })

        expect(themes.themeNames.length).to.be.eq(3)
        expect(themes.themeNames[0]).to.be.eq('Administrative')
        expect(themes.getThemeNames().next().value).to.be.eq('Administrative')

        expect(themes.themeConfigs.length).to.be.eq(3)
        const theme1 = themes.themeConfigs[0]
        expect(theme1.name).to.be.eq('Administrative')

        expect(theme1.layerIds.length).to.be.eq(4)
        expect(theme1.layerIds[0]).to.be.eq('SousQuartiers20160121124316563')
        expect(theme1.getLayerIds().next().value).to.be.eq('SousQuartiers20160121124316563')

        expect(theme1.layerConfigs.length).to.be.eq(4)
        const layer1 = theme1.layerConfigs[0];
        expect(layer1).to.be.instanceOf(LayerThemeConfig)
        expect(layer1.layerId).to.be.eq('SousQuartiers20160121124316563')
        expect(layer1.style).to.be.eq('default')
        expect(layer1.expanded).to.be.eq(true)

        expect(theme1.getLayerConfigByLayerId('SousQuartiers20160121124316563')).to.be.eq(layer1)
        expect(theme1.getLayerConfigs().next().value).to.be.eq(layer1)

        expect(theme1.expandedGroupNodes.length).to.be.eq(7)
        expect(theme1.expandedGroupNodes[0]).to.be.eq('Edition')
        expect(theme1.getExpandedGroupNodes().next().value).to.be.eq('Edition')

        expect(themes.getThemeConfigByThemeName('Administrative')).to.be.eq(theme1)
        expect(themes.getThemeConfigs().next().value).to.be.eq(theme1)
    })

    it('ValidationError', function () {
        try {
            new ThemesConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
