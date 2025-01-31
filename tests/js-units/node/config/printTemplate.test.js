import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { PrintAtlasConfig, PrintLabelConfig, PrintMapConfig, PrintTemplateConfig } from 'assets/src/modules/config/PrintTemplate.js';

describe('PrintAtlasConfig', function () {
    it('Valid', function () {
        const atlas1 = new PrintAtlasConfig({
            "enabled": "0",
            "coverageLayer": "",
        })
        expect(atlas1.enabled).to.be.eq(false)
        expect(atlas1.coverageLayerId).to.be.eq("")

        const atlas2 = new PrintAtlasConfig({
            "enabled": "1",
            "coverageLayer": "quartiers_d3c3fa1d_851a_4770_880d_9d5aec73ae9b",
        })
        expect(atlas2.enabled).to.be.eq(true)
        expect(atlas2.coverageLayerId).to.be.eq("quartiers_d3c3fa1d_851a_4770_880d_9d5aec73ae9b")
    })

    it('ValidationError', function () {
        try {
            new PrintAtlasConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('PrintLabelConfig', function () {
    it('Valid', function () {
        const label1 = new PrintLabelConfig({
            "id": "html_title",
            "htmlState": 1,
            "text": "Change HTML title",
        })
        expect(label1.id).to.be.eq("html_title")
        expect(label1.htmlState).to.be.eq(true)
        expect(label1.text).to.be.eq("Change HTML title")

        const label2 = new PrintLabelConfig({
            "id": "simple_title",
            "htmlState": 0,
            "text": "Change title",
        })
        expect(label2.id).to.be.eq("simple_title")
        expect(label2.htmlState).to.be.eq(false)
        expect(label2.text).to.be.eq("Change title")
    })

    it('ValidationError', function () {
        try {
            new PrintLabelConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('PrintMapConfig', function () {
    it('Valid', function () {
        const map = new PrintMapConfig({
            "id": "map0",
            "uuid": "{db361c4a-5cf5-4447-bb81-395db1ecf103}",
            "width": 281,
            "height": 173,
        })
        expect(map.id).to.be.eq("map0")
        expect(map.uuid).to.be.eq("{db361c4a-5cf5-4447-bb81-395db1ecf103}")
        expect(map.width).to.be.eq(281)
        expect(map.height).to.be.eq(173)
    })

    it('ValidationError', function () {
        try {
            new PrintMapConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})


describe('PrintTemplateConfig', function () {
    it('Valid', function () {
        const template1 = new PrintTemplateConfig({
            "title": "print_labels",
            "width": 297,
            "height": 210,
            "maps": [{
                "id": "map0",
                "uuid": "{406edec1-41b1-4a4c-9489-b0be8fbdc473}",
                "width": 19,
                "height": 14,
            }],
            "labels": [{
                "id": "html_title",
                "htmlState": 1,
                "text": "Change HTML title",
            },{
                "id": "simple_title",
                "htmlState": 0,
                "text": "Change title",
            }],
            "atlas": {
                "enabled": "0",
                "coverageLayer": "",
            }
        })
        expect(template1.title).to.be.eq("print_labels")
        expect(template1.width).to.be.eq(297)
        expect(template1.height).to.be.eq(210)

        const maps1 = template1.maps
        expect(maps1.length).to.be.eq(1)
        const map1 = maps1[0]
        expect(map1.id).to.be.eq("map0")
        expect(map1.uuid).to.be.eq("{406edec1-41b1-4a4c-9489-b0be8fbdc473}")
        expect(map1.width).to.be.eq(19)
        expect(map1.height).to.be.eq(14)

        const labels1 = template1.labels
        expect(labels1.length).to.be.eq(2)

        const label1 = labels1[0]
        expect(label1.id).to.be.eq("html_title")
        expect(label1.htmlState).to.be.eq(true)
        expect(label1.text).to.be.eq("Change HTML title")

        const label2 = labels1[1]
        expect(label2.id).to.be.eq("simple_title")
        expect(label2.htmlState).to.be.eq(false)
        expect(label2.text).to.be.eq("Change title")

        const atlas1 = template1.atlas
        expect(atlas1).to.not.be.eq(undefined)
        expect(atlas1).to.not.be.eq(null)
        expect(atlas1.enabled).to.be.eq(false)
        expect(atlas1.coverageLayerId).to.be.eq("")

        const template2 = new PrintTemplateConfig({
            "title": "Fiche quartiers",
            "width": 297,
            "height": 210,
            "maps": [{
                "id": "map0",
                "uuid": "{db361c4a-5cf5-4447-bb81-395db1ecf103}",
                "width": 281,
                "height": 173,
            }],
            "labels": [],
            "atlas": {
                "enabled": "1",
                "coverageLayer": "quartiers_d3c3fa1d_851a_4770_880d_9d5aec73ae9b",
            }
        })
        expect(template2.title).to.be.eq("Fiche quartiers")
        expect(template2.width).to.be.eq(297)
        expect(template2.height).to.be.eq(210)

        const maps2 = template2.maps
        expect(maps2.length).to.be.eq(1)
        const map2 = maps2[0]
        expect(map2.id).to.be.eq("map0")
        expect(map2.uuid).to.be.eq("{db361c4a-5cf5-4447-bb81-395db1ecf103}")
        expect(map2.width).to.be.eq(281)
        expect(map2.height).to.be.eq(173)

        expect(template2.labels.length).to.be.eq(0)

        const atlas2 = template2.atlas
        expect(atlas2).to.not.be.eq(undefined)
        expect(atlas2).to.not.be.eq(null)
        expect(atlas2.enabled).to.be.eq(true)
        expect(atlas2.coverageLayerId).to.be.eq("quartiers_d3c3fa1d_851a_4770_880d_9d5aec73ae9b")
    })

    it('ValidationError', function () {
        try {
            new PrintTemplateConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
