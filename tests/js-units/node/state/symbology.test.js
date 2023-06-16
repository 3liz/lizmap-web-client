import { expect } from 'chai';

import { ValidationError } from '../../../../assets/src/modules/Errors.js';
import { base64png, BaseIconSymbology, LayerIconSymbology, SymbolIconSymbology, BaseSymbolsSymbology, LayerSymbolsSymbology, LayerGroupSymbology, buildLayerSymbology } from '../../../../assets/src/modules/state/Symbology.js';

describe('BaseIconSymbology', function () {
    it('Valid', function () {
        const icon = new BaseIconSymbology({
            "icon":"iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAACXBIWXMAAA9hAAAPYQGoP6dpAAAAU0lEQVQ4jWNgGAV0A4z4JJWVlf8j8+\/evYtTPQs+Q9YelkMRC7Zl+I\/LMKyC2AxBGPYIq8uYcLmIVDBEDLp79y5jsO0jkgwiKfphlpBkwyigPgAATTcaN5pMVDUAAAAASUVORK5CYII=",
            "title":"category 1"
        })
        expect(icon).to.be.instanceOf(BaseIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('category 1')
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
        expect(icon).to.be.instanceOf(BaseIconSymbology)
        expect(icon).to.be.instanceOf(SymbolIconSymbology)
        expect(icon.icon).to.have.string(base64png)
        expect(icon.title).to.be.eq('category 1')
        expect(icon.ruleKey).to.be.eq('0')
        expect(icon.checked).to.be.true
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
        expect(symbols.childrenCount).to.be.eq(2)
        expect(symbols.children).to.be.an('array').that.have.lengthOf(2)

        const symbolsChildren = symbols.children
        expect(symbolsChildren[0]).to.be.instanceOf(BaseIconSymbology)
        expect(symbolsChildren[1]).to.be.instanceOf(BaseIconSymbology)

        const symbolsGetChildren = symbols.getChildren()
        expect(symbolsGetChildren.next().value).to.be.instanceOf(BaseIconSymbology).that.be.eq(symbolsChildren[0])
        expect(symbolsGetChildren.next().value).to.be.instanceOf(BaseIconSymbology).that.be.eq(symbolsChildren[1])
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
    it('Valid', function () {
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
        expect(symbology.childrenCount).to.be.eq(2)
        expect(symbology.children).to.be.an('array').that.have.lengthOf(2)

        const symbologyChildren = symbology.children
        expect(symbologyChildren[0]).to.be.instanceOf(BaseIconSymbology).that.be.instanceOf(SymbolIconSymbology)
        expect(symbologyChildren[1]).to.be.instanceOf(BaseIconSymbology).that.be.instanceOf(SymbolIconSymbology)

        const symbologyGetChildren = symbology.getChildren()
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[0])
        expect(symbologyGetChildren.next().value).to.be.instanceOf(SymbolIconSymbology).that.be.eq(symbologyChildren[1])
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
