import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { FormFilterElementConfig, FormFilterConfig } from 'assets/src/modules/config/FormFilter.js';

describe('FormFilterElementConfig', function () {
    it('Valid', function () {
        const element = new FormFilterElementConfig({
            "layerId": "form_filter_8bfd580f_2848_4bd4_80cf_facb270a9af5",
            "title": "test_filter",
            "type": "uniquevalues",
            "field": "label",
            "format": "select",
            "order": 0,
            "provider": "postgres"
        })

        expect(element.layerId).to.be.eq('form_filter_8bfd580f_2848_4bd4_80cf_facb270a9af5')
        expect(element.type).to.be.eq('uniquevalues')
        expect(element.title).to.be.eq('test_filter')
        expect(element.field).to.be.eq('label')
        expect(element.splitter).to.be.eq(null)
        expect(element.minDate).to.be.eq(null)
        expect(element.maxDate).to.be.eq(null)
        expect(element.format).to.be.eq('select')
        expect(element.order).to.be.eq(0)
        expect(element.provider).to.be.eq('postgres')

        const dateElement = new FormFilterElementConfig({
            "layerId": "events_4c3b47b8_3939_4c8c_8e91_55bdb13a2101",
            "title": "Date",
            "type": "date",
            "min_date": "field_date",
            "max_date": "field_date",
            "format": "checkboxes",
            "order": 2,
            "provider": "ogr"
        })

        expect(dateElement.layerId).to.be.eq('events_4c3b47b8_3939_4c8c_8e91_55bdb13a2101')
        expect(dateElement.title).to.be.eq('Date')
        expect(dateElement.type).to.be.eq('date')
        expect(dateElement.field).to.be.eq(null)
        expect(dateElement.minDate).to.be.eq('field_date')
        expect(dateElement.maxDate).to.be.eq('field_date')
        expect(dateElement.format).to.be.eq('checkboxes')
        expect(dateElement.order).to.be.eq(2)
        expect(dateElement.provider).to.be.eq('ogr')
    })

    it('ValidationError', function () {
        try {
            new FormFilterElementConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('FormFilterConfig', function () {
    it('Valid', function () {
        const config = new FormFilterConfig({
            "0":{
                "layerId":"vue_service_0fee3888_5a17_4cbf_9053_7d61f9ac9f19",
                "title":"Type de structure",
                "type":"uniquevalues",
                "field":"lib_long_type",
                "format":"select",
                "order":0,
                "provider":"postgres"
            },
            "1":{
                "layerId":"vue_service_0fee3888_5a17_4cbf_9053_7d61f9ac9f19",
                "title":"Initiation-Formation au num\u00e9rique",
                "type":"uniquevalues",
                "field":"pass_numerique",
                "format":"checkboxes",
                "splitter":",",
                "order":1,
                "provider":"postgres"
            },
            "2":{
                "layerId":"vue_service_0fee3888_5a17_4cbf_9053_7d61f9ac9f19",
                "title":"D\u00e9marches",
                "type":"uniquevalues",
                "field":"demarches",
                "format":"checkboxes",
                "splitter":";",
                "order":2,
                "provider":"postgres"
            },
            "3":{
                "layerId":"vue_service_0fee3888_5a17_4cbf_9053_7d61f9ac9f19",
                "title":"Services publics relay\u00e9s",
                "type":"uniquevalues",
                "field":"administration",
                "format":"checkboxes",
                "splitter":";",
                "order":3,
                "provider":"postgres"
            }
        })

        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(1)
        expect(configLayerIds).deep.to.eq([
            "vue_service_0fee3888_5a17_4cbf_9053_7d61f9ac9f19"
        ])

        expect(config.getElementConfigsByLayerId("vue_service_0fee3888_5a17_4cbf_9053_7d61f9ac9f19")).deep.to.eq(config.elementConfigs)

        const configGetElementConfigs = config.getElementConfigs()
        expect(configGetElementConfigs.next().value.order).to.be.eq(0)
        expect(configGetElementConfigs.next().value.order).to.be.eq(1)
        expect(configGetElementConfigs.next().value.order).to.be.eq(2)
        expect(configGetElementConfigs.next().value.order).to.be.eq(3)

        const disorderConfig = new FormFilterConfig({
            "1": {
                "layerId": "events_4c3b47b8_3939_4c8c_8e91_55bdb13a2101",
                "title": "Cat",
                "type": "uniquevalues",
                "field": "field_thematique",
                "format": "checkboxes",
                "splitter": ", ",
                "order": 1,
                "provider": "ogr"
            },
            "0": {
                "layerId": "polygons_5799087e_e084_49aa_a910_91195b24a48c",
                "title": "Name",
                "type": "uniquevalues",
                "field": "pname",
                "format": "checkboxes",
                "order": 0,
                "provider": "ogr"
            },
            "3": {
                "layerId": "events_4c3b47b8_3939_4c8c_8e91_55bdb13a2101",
                "title": "Commune",
                "type": "uniquevalues",
                "field": "field_communes",
                "format": "checkboxes",
                "splitter": ", ",
                "order": 3,
                "provider": "ogr"
            },
            "2": {
                "layerId": "events_4c3b47b8_3939_4c8c_8e91_55bdb13a2101",
                "title": "Date",
                "type": "date",
                "min_date": "field_date",
                "max_date": "field_date",
                "format": "checkboxes",
                "order": 2,
                "provider": "ogr"
            }
        })

        const disorderConfigGetElementConfigs = disorderConfig.getElementConfigs()
        expect(disorderConfigGetElementConfigs.next().value.order).to.be.eq(0)
        expect(disorderConfigGetElementConfigs.next().value.order).to.be.eq(1)
        expect(disorderConfigGetElementConfigs.next().value.order).to.be.eq(2)
        expect(disorderConfigGetElementConfigs.next().value.order).to.be.eq(3)
    })
})
