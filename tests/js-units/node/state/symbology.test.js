import { expect } from 'chai';

import { readFileSync } from 'fs';

import { ValidationError } from 'assets/src/modules/Errors.js';
import { base64png, base64pngNullData } from 'assets/src/modules/state/SymbologyIcons.js';
import { BaseIconSymbology, LayerIconSymbology, SymbolIconSymbology, SymbolRuleSymbology, BaseSymbolsSymbology, LayerSymbolsSymbology, LayerGroupSymbology, buildLayerSymbology } from 'assets/src/modules/state/Symbology.js';

describe('BaseIconSymbology', function () {
    it('Simple', function () {
        const icon = new BaseIconSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
            "title":"category 1"
        })
        expect(icon).to.be.instanceOf(BaseIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('category 1')
        expect(icon.type).to.be.eq('icon')
    })

    it('Null data icon', function () {
        const icon = new BaseIconSymbology({
            "title":"Null data"
        })
        expect(icon).to.be.instanceOf(BaseIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.icon).to.have.string(base64pngNullData)
        expect(icon.icon).to.be.eq(base64png+base64pngNullData)
        expect(icon.title).to.be.eq('Null data')
        expect(icon.type).to.be.eq('icon')
    })

    it('ValidationError', function () {
        try {
            new BaseIconSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
            })
        } catch(error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `title` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('LayerIconSymbology', function () {
    it('Valid', function () {
        const icon = new LayerIconSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q474qaKI2Wxi+I\/LMKyC2AxBGHYbq8uYcLmIVDBEDLp79y6jzabbJBlEUvTDLCHJhlFAfQAA+w0alQ045JsAAAAASUVORK5CYII=",
            "title":"layer_legend_single_symbol",
            "type":"layer",
            "name":"layer_legend_single_symbol"
        })
        expect(icon).to.be.instanceOf(BaseIconSymbology)
        expect(icon).to.be.instanceOf(LayerIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('layer_legend_single_symbol')
        expect(icon.name).to.be.eq('layer_legend_single_symbol')
        expect(icon.type).to.be.eq('layer')
    })

    it('Failing type', function () {
        try {
            new LayerIconSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layer icon symbology is only available for layer type!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('Failing required properties', function () {
        try {
            new LayerIconSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
                "type":"layer",
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `name` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('SymbolIconSymbology', function () {
    it('Valid', function () {
        const icon = new SymbolIconSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
            "title":"category 1",
            "ruleKey":"0",
            "checked":true
        })
        expect(icon)
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('category 1')
        expect(icon.type).to.be.eq('icon')
        expect(icon.ruleKey).to.be.eq('0')
        expect(icon.checked).to.be.true
    })

    it('Null data icon', function () {
        const icon = new SymbolIconSymbology({
            "title": "1:25000",
            "ruleKey": "{1a0c9345-0ffd-4743-bf78-82ca39f64d40}",
            "checked": true,
            "parentRuleKey": "{a5359e9e-eecc-437d-a636-38237822ea81}"
        })
        expect(icon)
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.icon).to.have.string(base64pngNullData)
        expect(icon.title).to.be.eq('1:25000')
        expect(icon.type).to.be.eq('icon')
        expect(icon.ruleKey).to.be.eq('{1a0c9345-0ffd-4743-bf78-82ca39f64d40}')
        expect(icon.checked).to.be.true
    })

    it('Event', function () {
        const icon = new SymbolIconSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
            "title":"category 1",
            "ruleKey":"0",
            "checked":true
        })
        expect(icon).to.be.instanceOf(SymbolIconSymbology)
        expect(icon.checked).to.be.true
        let symbologyChangedEvt = null;
        icon.addListener(evt => {
            symbologyChangedEvt = evt
        }, 'symbol.checked.changed');
        icon.checked = false
        expect(symbologyChangedEvt).to.not.be.null
        expect(symbologyChangedEvt.title).to.be.eq('category 1')
        expect(symbologyChangedEvt.ruleKey).to.be.eq('0')
        expect(symbologyChangedEvt.checked).to.be.false
    })

    it('Failing required properties', function () {
        try {
            new SymbolIconSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: icon,title\n- The required properties: icon,title,ruleKey,checked')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('SymbolRuleSymbology', function () {
    it('Valid', function () {
        const icon = new SymbolRuleSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
            "title":"category 1",
            "ruleKey":"0",
            "checked":true
        })
        expect(icon)
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.be.instanceOf(SymbolRuleSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('category 1')
        expect(icon.type).to.be.eq('rule')
        expect(icon.ruleKey).to.be.eq('0')
        expect(icon.checked).to.be.true
        expect(icon.minScaleDenominator).to.be.eq(-1)
        expect(icon.maxScaleDenominator).to.be.eq(-1)
        expect(icon.parentRuleKey).to.be.eq('')
    })

    it('Null data icon', function () {
        const icon = new SymbolRuleSymbology({
            "title": "1:25000",
            "ruleKey": "{1a0c9345-0ffd-4743-bf78-82ca39f64d40}",
            "checked": true,
            "parentRuleKey": "{a5359e9e-eecc-437d-a636-38237822ea81}"
        })
        expect(icon)
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.be.instanceOf(SymbolRuleSymbology)
        expect(icon.icon)
            .to.have.string(base64png)
            .that.have.string(base64pngNullData)
        expect(icon.title).to.be.eq('1:25000')
        expect(icon.type).to.be.eq('rule')
        expect(icon.ruleKey).to.be.eq('{1a0c9345-0ffd-4743-bf78-82ca39f64d40}')
        expect(icon.checked).to.be.true
        expect(icon.minScaleDenominator).to.be.eq(-1)
        expect(icon.maxScaleDenominator).to.be.eq(-1)
        expect(icon.parentRuleKey).to.be.eq('{a5359e9e-eecc-437d-a636-38237822ea81}')
    })

    it('Event', function () {
        it('Valid', function () {
            const icon = new SymbolRuleSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
                "ruleKey":"0",
                "checked":true
            })
            expect(icon).to.be.instanceOf(SymbolRuleSymbology)
            let symbologyChangedEvt = null;
            icon.addListener(evt => {
                symbologyChangedEvt = evt
            }, 'symbol.checked.changed');
            expect(symbologyChangedEvt).to.not.be.null
            expect(symbologyChangedEvt.title).to.be.eq('category 1')
            expect(symbologyChangedEvt.ruleKey).to.be.eq('0')
            expect(symbologyChangedEvt.checked).to.be.true
        })
    })

    it('Failing required properties', function () {
        try {
            new SymbolRuleSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: icon,title\n- The required properties: icon,title,ruleKey,checked')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('BaseSymbolsSymbology', function () {
    it('Valid', function () {
        const symbols = new BaseSymbolsSymbology({
            "symbols":[{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1"
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                "title":"category 2"
            }],
            "title":"hide_at_startup",
            "type":"layer"
        })
        expect(symbols).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbols.title).to.be.eq('hide_at_startup')
        expect(symbols.type).to.be.eq('layer')
        expect(symbols.expanded).to.be.false
        expect(symbols.childrenCount).to.be.eq(2)
        expect(symbols.children).to.be.an('array').that.have.lengthOf(2)

        const symbolsChildren = symbols.children
        expect(symbolsChildren[0]).to.be.instanceOf(BaseIconSymbology)
        expect(symbolsChildren[1]).to.be.instanceOf(BaseIconSymbology)

        const symbolsGetChildren = symbols.getChildren()
        expect(symbolsGetChildren.next().value).to.be.instanceOf(BaseIconSymbology).that.be.eq(symbolsChildren[0])
        expect(symbolsGetChildren.next().value).to.be.instanceOf(BaseIconSymbology).that.be.eq(symbolsChildren[1])
    })

    it('Event', function () {
        const symbols = new BaseSymbolsSymbology({
            "symbols":[{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1"
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                "title":"category 2"
            }],
            "title":"hide_at_startup",
            "type":"layer"
        })
        expect(symbols).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbols.expanded).to.be.false

        let expandedChangedEvt = null;
        symbols.addListener(evt => {
            expandedChangedEvt = evt
        }, 'symbol.expanded.changed');
        symbols.expanded = true;

        expect(expandedChangedEvt).to.not.be.null
        expect(expandedChangedEvt.title).to.be.eq('hide_at_startup')
        expect(expandedChangedEvt.symbolType).to.be.eq('layer')
        expect(expandedChangedEvt.expanded).to.be.true
    })

    it('Failing required properties', function () {
        try {
            new BaseSymbolsSymbology({
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
                "type":"layer",
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `symbols` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('LayerSymbolsSymbology', function () {
    it('categorizedSymbol', function () {
        const symbology = new LayerSymbolsSymbology({
            "symbols":[{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
                "ruleKey":"0",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                "title":"category 2",
                "ruleKey":"1",
                "checked":true
            }],
            "title":"layer_legend_categorized",
            "type":"layer",
            "name":"layer_legend_categorized"
        })
        expect(symbology).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbology).to.be.instanceOf(LayerSymbolsSymbology)
        expect(symbology.title).to.be.eq('layer_legend_categorized')
        expect(symbology.name).to.be.eq('layer_legend_categorized')
        expect(symbology.type).to.be.eq('layer')
        expect(symbology.expanded).to.be.false
        expect(symbology.legendOn).to.be.true
        expect(symbology.childrenCount).to.be.eq(2)
        expect(symbology.children).to.be.an('array').that.have.lengthOf(2)

        const symbologyChildren = symbology.children
        expect(symbologyChildren[0])
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.not.be.instanceOf(SymbolRuleSymbology)
        expect(symbologyChildren[1])
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.not.be.instanceOf(SymbolRuleSymbology)

        const symbologyGetChildren = symbology.getChildren()
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[0])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[1])
        expect(symbologyGetChildren.next().value).to.be.undefined

        expect(symbology.wmsParameters('layer_legend_categorized')).to.be.an('object').that.be.deep.eq({})
        symbologyChildren[0].checked = false
        expect(symbology.legendOn).to.be.true
        expect(symbology.wmsParameters('layer_legend_categorized')).to.be.an('object').that.be.deep.eq({
            "LEGEND_ON": "layer_legend_categorized:1",
            "LEGEND_OFF": "layer_legend_categorized:0"
        })
        symbologyChildren[1].checked = false
        expect(symbology.legendOn).to.be.false
        expect(symbology.wmsParameters('layer_legend_categorized')).to.be.an('object').that.be.deep.eq({
            "LEGEND_ON": "layer_legend_categorized:",
            "LEGEND_OFF": "layer_legend_categorized:0,1"
        })
        symbologyChildren[0].checked = true
        expect(symbology.legendOn).to.be.true
        expect(symbology.wmsParameters('layer_legend_categorized')).to.be.an('object').that.be.deep.eq({
            "LEGEND_ON": "layer_legend_categorized:0",
            "LEGEND_OFF": "layer_legend_categorized:1"
        })
        symbologyChildren[1].checked = true
        expect(symbology.legendOn).to.be.true
        expect(symbology.wmsParameters('layer_legend_categorized')).to.be.an('object').that.be.deep.eq({})
    })

    it('RuleRenderer', function () {
        const legend = JSON.parse(readFileSync('./tests/js-units/data/quickosm-road-legend.json', 'utf8'));
        expect(legend).to.not.be.undefined
        expect(legend.nodes).to.be.an('array').that.have.length(1)

        const symbology = new LayerSymbolsSymbology(legend.nodes[0])
        expect(symbology).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbology).to.be.instanceOf(LayerSymbolsSymbology)
        expect(symbology.title).to.be.eq('road')
        expect(symbology.name).to.be.eq('road')
        expect(symbology.type).to.be.eq('layer')
        expect(symbology.expanded).to.be.false
        expect(symbology.legendOn).to.be.true
        expect(symbology.childrenCount).to.be.eq(3)
        expect(symbology.children).to.be.an('array').that.have.length(3)

        const symbologyChildren = symbology.children
        expect(symbologyChildren[0])
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.be.instanceOf(SymbolRuleSymbology)
        expect(symbologyChildren[0].title).to.be.eq('1:25000')
        expect(symbologyChildren[0].type).to.be.eq('rule')
        expect(symbologyChildren[0].minScaleDenominator).to.be.eq(1)
        expect(symbologyChildren[0].maxScaleDenominator).to.be.eq(25000)
        expect(symbologyChildren[0].checked).to.be.true
        expect(symbologyChildren[0].legendOn).to.be.true
        expect(symbologyChildren[0].expanded).to.be.false
        expect(symbologyChildren[0].childrenCount).to.be.eq(10)
        expect(symbologyChildren[0].children).to.be.an('array').that.have.length(10)
        const symbologyChildrenFirstChildren = symbologyChildren[0].children
        expect(symbologyChildrenFirstChildren[0])
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.be.instanceOf(SymbolRuleSymbology)
        expect(symbologyChildrenFirstChildren[0].title).to.be.eq('Motorway Link')
        expect(symbologyChildrenFirstChildren[0].type).to.be.eq('rule')
        expect(symbologyChildrenFirstChildren[0].minScaleDenominator).to.be.eq(-1)
        expect(symbologyChildrenFirstChildren[0].maxScaleDenominator).to.be.eq(-1)
        expect(symbologyChildrenFirstChildren[0].checked).to.be.true
        expect(symbologyChildrenFirstChildren[0].parentRule).to.not.be.null
        expect(symbologyChildrenFirstChildren[0].parentRule.legendOn).to.be.true
        expect(symbologyChildrenFirstChildren[0].legendOn).to.be.true
        expect(symbologyChildrenFirstChildren[0].expanded).to.be.false
        expect(symbologyChildrenFirstChildren[0].childrenCount).to.be.eq(0)
        expect(symbologyChildrenFirstChildren[0].children).to.be.an('array').that.have.length(0)
        expect(symbologyChildren[1])
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.be.instanceOf(SymbolRuleSymbology)
        expect(symbologyChildren[1].title).to.be.eq('25k to 50k')
        expect(symbologyChildren[1].type).to.be.eq('rule')
        expect(symbologyChildren[1].minScaleDenominator).to.be.eq(25001)
        expect(symbologyChildren[1].maxScaleDenominator).to.be.eq(50000)
        expect(symbologyChildren[1].checked).to.be.true
        expect(symbologyChildren[1].legendOn).to.be.true
        expect(symbologyChildren[1].expanded).to.be.false
        expect(symbologyChildren[1].childrenCount).to.be.eq(1)
        expect(symbologyChildren[1].children).to.be.an('array').that.have.length(1)
        expect(symbologyChildren[2])
            .to.be.instanceOf(BaseIconSymbology)
            .that.be.instanceOf(SymbolIconSymbology)
            .that.be.instanceOf(SymbolRuleSymbology)
        expect(symbologyChildren[2].title).to.be.eq('50k +')
        expect(symbologyChildren[2].type).to.be.eq('rule')
        expect(symbologyChildren[2].minScaleDenominator).to.be.eq(50001)
        expect(symbologyChildren[2].maxScaleDenominator).to.be.eq(10000000)
        expect(symbologyChildren[2].checked).to.be.true
        expect(symbologyChildren[2].legendOn).to.be.true
        expect(symbologyChildren[2].expanded).to.be.false
        expect(symbologyChildren[2].childrenCount).to.be.eq(3)
        expect(symbologyChildren[2].children).to.be.an('array').that.have.length(3)

        const symbologyGetChildren = symbology.getChildren()
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[0])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[1])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[2])
        expect(symbologyGetChildren.next().value).to.be.undefined

        expect(symbology.wmsParameters('road')).to.be.an('object').that.be.deep.eq({})
        symbologyChildren[0].checked = false
        expect(symbologyChildren[0].legendOn).to.be.false
        expect(symbologyChildrenFirstChildren[0].legendOn).to.be.false
        expect(symbologyChildren[1].legendOn).to.be.true
        expect(symbologyChildren[2].legendOn).to.be.true
        expect(symbology.legendOn).to.be.true
        expect(symbology.wmsParameters('road')).to.be.an('object').that.be.deep.eq({
            "LEGEND_ON": "road:" + [
                "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
                "{b3334f5f-daaf-4dc2-a2dc-f5f8485a1b37}",
                "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
                "{97c219cb-9b1a-4a9d-bba5-cfe3006fe48a}",
                "{2df87245-1aca-463a-a8eb-a5f2ea287a44}",
                "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            ].join(','),
            "LEGEND_OFF": "road:" + [
                "{1a0c9345-0ffd-4743-bf78-82ca39f64d40}",
                "{a9fac601-7bc7-4150-9783-19d7827b2ef8}",
                "{e2c3dbec-7274-4149-8b0b-959b2e758b9a}",
                "{78db6f50-70cc-417d-995d-97ad897bf52b}",
                "{26f18044-95a7-4170-9ce3-0137ce4a2232}",
                "{f215859b-f963-4872-8f4b-b2e39e5f0c35}",
                "{aac3fe77-b7ff-4c47-8f28-c33de0dc4b2b}",
                "{960d07d3-ac1a-40c8-8f2e-1b499f3ccafc}",
                "{303a360c-638b-4c9f-adee-eff33d3e95f1}",
                "{c63b61f8-f9e5-4a57-9231-9001ffd07bad}",
                "{245c23be-e45f-4f80-9ea4-f1676315f178}",
            ].join(',')
        })

        symbologyChildren[0].checked = true
        expect(symbologyChildren[0].legendOn).to.be.true
        expect(symbologyChildrenFirstChildren[0].legendOn).to.be.true
        expect(symbologyChildren[1].legendOn).to.be.true
        expect(symbologyChildren[2].legendOn).to.be.true
        expect(symbology.legendOn).to.be.true
        // No legend parameter because every legend is ON
        expect(symbology.wmsParameters('road').LEGEND_ON).to.be.undefined
        expect(symbology.wmsParameters('road').LEGEND_OFF).to.be.undefined
        expect(symbology.wmsParameters('road')).to.be.an('object').that.be.deep.eq({})

        symbologyChildrenFirstChildren[0].checked = false
        expect(symbologyChildren[0].legendOn).to.be.true
        expect(symbologyChildrenFirstChildren[0].legendOn).to.be.false
        expect(symbologyChildren[1].legendOn).to.be.true
        expect(symbologyChildren[2].legendOn).to.be.true
        expect(symbology.legendOn).to.be.true
        expect(symbology.wmsParameters('road'))
            .to.be.an('object')
            .that.have.all.keys(["LEGEND_ON", "LEGEND_OFF"])
        const CheckForAll = bits => string => bits.every(bit => string.includes(bit));
        expect(symbology.wmsParameters('road').LEGEND_ON).to.satisfy(CheckForAll([
            "road:",
            "{1a0c9345-0ffd-4743-bf78-82ca39f64d40}",
            "{e2c3dbec-7274-4149-8b0b-959b2e758b9a}",
            "{78db6f50-70cc-417d-995d-97ad897bf52b}",
            "{26f18044-95a7-4170-9ce3-0137ce4a2232}",
            "{f215859b-f963-4872-8f4b-b2e39e5f0c35}",
            "{aac3fe77-b7ff-4c47-8f28-c33de0dc4b2b}",
            "{960d07d3-ac1a-40c8-8f2e-1b499f3ccafc}",
            "{303a360c-638b-4c9f-adee-eff33d3e95f1}",
            "{c63b61f8-f9e5-4a57-9231-9001ffd07bad}",
            "{245c23be-e45f-4f80-9ea4-f1676315f178}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            "{b3334f5f-daaf-4dc2-a2dc-f5f8485a1b37}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            "{97c219cb-9b1a-4a9d-bba5-cfe3006fe48a}",
            "{2df87245-1aca-463a-a8eb-a5f2ea287a44}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
        ])).and.to.not.contains("{a9fac601-7bc7-4150-9783-19d7827b2ef8}")
        expect(symbology.wmsParameters('road').LEGEND_OFF).to.be.eq("road:" + [
                "{a9fac601-7bc7-4150-9783-19d7827b2ef8}",
            ].join(',')
        )

        symbologyChildren[0].checked = false
        symbologyChildren[1].checked = false
        symbologyChildren[2].checked = false
        expect(symbologyChildren[0].legendOn).to.be.false
        expect(symbologyChildrenFirstChildren[0].legendOn).to.be.false
        expect(symbologyChildren[1].legendOn).to.be.false
        expect(symbologyChildren[2].legendOn).to.be.false
        expect(symbology.legendOn).to.be.false
        expect(symbology.wmsParameters('road').LEGEND_ON).to.be.eq("road:")
        expect(symbology.wmsParameters('road').LEGEND_OFF).to.satisfy(CheckForAll([
            "road:",
            "{1a0c9345-0ffd-4743-bf78-82ca39f64d40}",
            "{a9fac601-7bc7-4150-9783-19d7827b2ef8}",
            "{e2c3dbec-7274-4149-8b0b-959b2e758b9a}",
            "{78db6f50-70cc-417d-995d-97ad897bf52b}",
            "{26f18044-95a7-4170-9ce3-0137ce4a2232}",
            "{f215859b-f963-4872-8f4b-b2e39e5f0c35}",
            "{aac3fe77-b7ff-4c47-8f28-c33de0dc4b2b}",
            "{960d07d3-ac1a-40c8-8f2e-1b499f3ccafc}",
            "{303a360c-638b-4c9f-adee-eff33d3e95f1}",
            "{c63b61f8-f9e5-4a57-9231-9001ffd07bad}",
            "{245c23be-e45f-4f80-9ea4-f1676315f178}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            "{b3334f5f-daaf-4dc2-a2dc-f5f8485a1b37}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            "{97c219cb-9b1a-4a9d-bba5-cfe3006fe48a}",
            "{2df87245-1aca-463a-a8eb-a5f2ea287a44}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
        ]))

        symbologyChildren[0].checked = true
        expect(symbologyChildren[0].legendOn).to.be.true
        expect(symbologyChildrenFirstChildren[0].legendOn).to.be.false
        expect(symbologyChildren[1].legendOn).to.be.false
        expect(symbologyChildren[2].legendOn).to.be.false
        expect(symbology.legendOn).to.be.true
        expect(symbology.wmsParameters('road').LEGEND_OFF).to.satisfy(CheckForAll([
            "road:",
            "{a9fac601-7bc7-4150-9783-19d7827b2ef8}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            "{b3334f5f-daaf-4dc2-a2dc-f5f8485a1b37}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
            "{97c219cb-9b1a-4a9d-bba5-cfe3006fe48a}",
            "{2df87245-1aca-463a-a8eb-a5f2ea287a44}",
            "{1be63a51-ccb6-4c5c-acdf-fdee5f8408c1}",
        ]), symbology.wmsParameters('road').LEGEND_OFF)
        expect(symbology.wmsParameters('road').LEGEND_ON).to.satisfy(CheckForAll([
            "road:",
            "{1a0c9345-0ffd-4743-bf78-82ca39f64d40}",
            "{e2c3dbec-7274-4149-8b0b-959b2e758b9a}",
            "{78db6f50-70cc-417d-995d-97ad897bf52b}",
            "{26f18044-95a7-4170-9ce3-0137ce4a2232}",
            "{f215859b-f963-4872-8f4b-b2e39e5f0c35}",
            "{aac3fe77-b7ff-4c47-8f28-c33de0dc4b2b}",
            "{960d07d3-ac1a-40c8-8f2e-1b499f3ccafc}",
            "{303a360c-638b-4c9f-adee-eff33d3e95f1}",
            "{c63b61f8-f9e5-4a57-9231-9001ffd07bad}",
            "{245c23be-e45f-4f80-9ea4-f1676315f178}",
        ]), symbology.wmsParameters('road').LEGEND_ON)
        .and.to.not.contains("{a9fac601-7bc7-4150-9783-19d7827b2ef8}")
    })

    it('RuleRenderer mixed', function () {
        // It is a RuleRenderer with only one rule in the QGIS User interface
        const symbology = new LayerSymbolsSymbology({
            "symbols": [
                {
                    "icon": "iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAASklEQVQ4jWNgGAWEACM2QWVl5f/4NN29exdDH4YAIUNwGcaCS+GdO3e2YBNXUVHxwSbORIztxIBRgwgDnLGGK3ZwAaolyFFAGAAAD9sQzpjSF7wAAAAASUVORK5CYII=",
                    "title": "Covoiturage",
                    "ruleKey": "{8457ada1-6ca6-4fc0-b47b-7597a8084cbf}",
                    "checked": true,
                    "parentRuleKey": "{c335718f-d733-41bf-bccd-d85f5f37f135}",
                    "expression": " \"dess_regul\" = 'st1' "
                },
                {
                    "icon": "iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAADElEQVQImWNgIB0AAAA0AAEjQ4N1AAAAAElFTkSuQmCC",
                    "title": ""
                }
            ],
            "title": "Arrêts star't",
            "type": "layer",
            "name": "arrets_start",
            "layerName": "Arrêts star't"
        })
        expect(symbology).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbology).to.be.instanceOf(LayerSymbolsSymbology)
        expect(symbology.title).to.be.eq('Arrêts star\'t')
        expect(symbology.name).to.be.eq('arrets_start')
        expect(symbology.type).to.be.eq('layer')
        expect(symbology.expanded).to.be.false
        expect(symbology.legendOn).to.be.true
        // Only 1 available children like in QGIS User Interface
        expect(symbology.childrenCount).to.be.eq(1)
        expect(symbology.children).to.be.an('array').that.have.lengthOf(1)
        // No legend parameter because every legend is ON or OFF
        expect(symbology.wmsParameters('arrets_start').LEGEND_ON).to.be.undefined
        expect(symbology.wmsParameters('arrets_start').LEGEND_OFF).to.be.undefined
        expect(symbology.wmsParameters('arrets_start')).to.be.an('object').that.be.deep.eq({})

        // We found 2 private icons like in the JSON
        expect(symbology._icons).to.be.an('array').that.have.lengthOf(2)
        // The first is the available child
        expect(symbology._icons[0].ruleKey).to.be.eq('{8457ada1-6ca6-4fc0-b47b-7597a8084cbf}')
        expect(symbology._icons[0].title).to.be.eq('Covoiturage')
        expect(symbology._icons[0].parentRuleKey).to.be.eq('{c335718f-d733-41bf-bccd-d85f5f37f135}')
        expect(symbology._icons[0].parentRule).to.be.null
        // The second is the unavailable child
        expect(symbology._icons[1].ruleKey).to.be.eq('')
        expect(symbology._icons[1].title).to.be.eq('')
        expect(symbology._icons[1].parentRuleKey).to.be.eq('')
        expect(symbology._icons[1].parentRule).to.be.null
    })

    it('Failing required properties', function () {
        try {
            new LayerSymbolsSymbology({
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"hide_at_startup",
                "type":"layer"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `name` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('LayerGroupSymbology', function () {
    it('Valid', function () {
        const symbology = new LayerGroupSymbology({
            "nodes":[{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"expand_at_startup",
                "type":"layer"
            },{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"disabled",
                "type":"layer"
            },{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"hide_at_startup",
                "type":"layer"
            }],
            "type":"group",
            "name":"legend_option_test",
            "title":"legend_option_test"
        })
        expect(symbology).to.be.instanceOf(LayerGroupSymbology)
        expect(symbology.title).to.be.eq('legend_option_test')
        expect(symbology.name).to.be.eq('legend_option_test')
        expect(symbology.type).to.be.eq('group')
        expect(symbology.childrenCount).to.be.eq(3)
        expect(symbology.children).to.be.an('array').that.have.lengthOf(3)

        const symbologyChildren = symbology.children
        expect(symbologyChildren[0]).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbologyChildren[1]).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbologyChildren[2]).to.be.instanceOf(BaseSymbolsSymbology)

        const symbologyGetChildren = symbology.getChildren()
        expect(symbologyGetChildren.next().value).to.be.instanceOf(BaseSymbolsSymbology).that.be.eq(symbologyChildren[0])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(BaseSymbolsSymbology).that.be.eq(symbologyChildren[1])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(BaseSymbolsSymbology).that.be.eq(symbologyChildren[2])
    })

    it('Event', function () {
        const symbology = new LayerGroupSymbology({
            "nodes":[{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"expand_at_startup",
                "type":"layer"
            },{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"disabled",
                "type":"layer"
            },{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"hide_at_startup",
                "type":"layer"
            }],
            "type":"group",
            "name":"legend_option_test",
            "title":"legend_option_test"
        })
        expect(symbology).to.be.instanceOf(LayerGroupSymbology)
        expect(symbology.childrenCount).to.be.eq(3)

        let expandedChangedEvt = null;
        symbology.addListener(evt => {
            expandedChangedEvt = evt
        }, 'symbol.expanded.changed');

        const symbologyChildren = symbology.children
        expect(symbologyChildren[1].expanded).to.be.false
        symbologyChildren[1].expanded = true;

        expect(expandedChangedEvt).to.not.be.null
        expect(expandedChangedEvt.title).to.be.eq('disabled')
        expect(expandedChangedEvt.symbolType).to.be.eq('layer')
        expect(expandedChangedEvt.expanded).to.be.true
    })


    it('Failing type', function () {
        try {
            new LayerGroupSymbology({
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1",
                    "ruleKey":"0",
                    "checked":true
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2",
                    "ruleKey":"1",
                    "checked":true
                }],
                "title":"layer_legend_categorized",
                "type":"layer",
                "name":"layer_legend_categorized"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The layer group symbology is only available for group type!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })

    it('Failing required properties', function () {
        try {
            new LayerGroupSymbology({
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1",
                    "ruleKey":"0",
                    "checked":true
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2",
                    "ruleKey":"1",
                    "checked":true
                }],
                "title":"layer_legend_categorized",
                "type":"group",
                "name":"layer_legend_categorized"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The properties: `nodes` are required in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('buildLayerSymbology', function () {
    it('LayerIconSymbology', function () {
        const icon = buildLayerSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q474qaKI2Wxi+I\/LMKyC2AxBGHYbq8uYcLmIVDBEDLp79y6jzabbJBlEUvTDLCHJhlFAfQAA+w0alQ045JsAAAAASUVORK5CYII=",
            "title":"layer_legend_single_symbol",
            "type":"layer",
            "name":"layer_legend_single_symbol"
        })
        expect(icon).to.be.instanceOf(BaseIconSymbology)
        expect(icon).to.be.instanceOf(LayerIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('layer_legend_single_symbol')
        expect(icon.name).to.be.eq('layer_legend_single_symbol')
        expect(icon.type).to.be.eq('layer')
    })

    it('LayerSymbolsSymbology', function () {
        const symbology = buildLayerSymbology({
            "symbols":[{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                "title":"category 1",
                "ruleKey":"0",
                "checked":true
            },{
                "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                "title":"category 2",
                "ruleKey":"1",
                "checked":true
            }],
            "title":"layer_legend_categorized",
            "type":"layer",
            "name":"layer_legend_categorized"
        })
        expect(symbology).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbology).to.be.instanceOf(LayerSymbolsSymbology)
        expect(symbology.title).to.be.eq('layer_legend_categorized')
        expect(symbology.name).to.be.eq('layer_legend_categorized')
        expect(symbology.type).to.be.eq('layer')
        expect(symbology.expanded).to.be.false
        expect(symbology.childrenCount).to.be.eq(2)
        expect(symbology.children).to.be.an('array').that.have.lengthOf(2)

        const symbologyChildren = symbology.children
        expect(symbologyChildren[0]).to.be.instanceOf(BaseIconSymbology).that.be.instanceOf(SymbolIconSymbology)
        expect(symbologyChildren[1]).to.be.instanceOf(BaseIconSymbology).that.be.instanceOf(SymbolIconSymbology)

        const symbologyGetChildren = symbology.getChildren()
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[0])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[1])
    })

    it('LayerGroupSymbology', function () {
        const symbology = buildLayerSymbology({
            "nodes":[{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"expand_at_startup",
                "type":"layer"
            },{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"disabled",
                "type":"layer"
            },{
                "symbols":[{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
                    "title":"category 1"
                },{
                    "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q4Q2HkUV9Lf+j8swrIJYDYGCd\/7WWF3GhMtFpIIhYtDdu3cZ3\/lbk2QQSdEPs4QkG0YB9QEAMC8aMZ0a06cAAAAASUVORK5CYII=",
                    "title":"category 2"
                }],
                "title":"hide_at_startup",
                "type":"layer"
            }],
            "type":"group",
            "name":"legend_option_test",
            "title":"legend_option_test"
        })
        expect(symbology).to.be.instanceOf(LayerGroupSymbology)
        expect(symbology.title).to.be.eq('legend_option_test')
        expect(symbology.name).to.be.eq('legend_option_test')
        expect(symbology.type).to.be.eq('group')
        expect(symbology.childrenCount).to.be.eq(3)
        expect(symbology.children).to.be.an('array').that.have.lengthOf(3)

        const symbologyChildren = symbology.children
        expect(symbologyChildren[0]).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbologyChildren[1]).to.be.instanceOf(BaseSymbolsSymbology)
        expect(symbologyChildren[2]).to.be.instanceOf(BaseSymbolsSymbology)

        const symbologyGetChildren = symbology.getChildren()
        expect(symbologyGetChildren.next().value).to.be.instanceOf(BaseSymbolsSymbology).that.be.eq(symbologyChildren[0])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(BaseSymbolsSymbology).that.be.eq(symbologyChildren[1])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(BaseSymbolsSymbology).that.be.eq(symbologyChildren[2])
    })

    it('ValidationError', function () {
        try {
            buildLayerSymbology()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The node parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            buildLayerSymbology({})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Node symbology required `type` property!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            buildLayerSymbology({'type': 'foobar'})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Node symbology `type` property has to be `layer` or `group`! It is: `foobar`')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            buildLayerSymbology({'type': 'layer'})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('Node symbology with `type` property equals to `layer` has to have `symbols` or `icon` property!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
