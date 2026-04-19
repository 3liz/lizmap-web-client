import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { FolioConfig, FolioZoomMethods, PortfolioConfig, PortfolioDrawingGeometries, PortfoliosConfig } from 'assets/src/modules/config/Portfolio.js'

describe('FolioConfig', function () {
    it('Valid fixed_scale', function () {
        const folio = new FolioConfig({
            "fixed_scale": 5000.0,
            "layout": "A4 Paysage",
            "theme": "theme1",
            "zoom_method": "fixed_scale"
        })
        expect(folio.layout).to.be.eq("A4 Paysage")
        expect(folio.theme).to.be.eq("theme1")
        expect(folio.zoomMethod).to.be.eq("fixed_scale")
        expect(folio.zoomMethod).to.be.eq(FolioZoomMethods.FixedScale)
        expect(folio.fixedScale).to.be.eq(5000.0)
        expect(folio.margin).to.be.null
    })

    it('Valid best_scale', function () {
        const folio = new FolioConfig({
            "layout": "A4 Paysage",
            "theme": "theme1",
            "zoom_method": "best_scale"
        })
        expect(folio.layout).to.be.eq("A4 Paysage")
        expect(folio.theme).to.be.eq("theme1")
        expect(folio.zoomMethod).to.be.eq("best_scale")
        expect(folio.zoomMethod).to.be.eq(FolioZoomMethods.BestScale)
        expect(folio.fixedScale).to.be.null
        expect(folio.margin).to.be.null
    })

    it('Valid margin', function () {
        const folio = new FolioConfig({
            "layout": "A4 Paysage",
            "margin": 10,
            "theme": "theme1",
            "zoom_method": "margin"
        })
        expect(folio.layout).to.be.eq("A4 Paysage")
        expect(folio.theme).to.be.eq("theme1")
        expect(folio.zoomMethod).to.be.eq("margin")
        expect(folio.zoomMethod).to.be.eq(FolioZoomMethods.Margin)
        expect(folio.fixedScale).to.be.null
        expect(folio.margin).to.be.eq(10)
    })

    it('ValidationError', function () {
        try {
            new FolioConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new FolioConfig({
                "layout": "A4 Paysage",
                "theme": "theme1",
                "zoom_method": "better_scale"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The folio zoom method is not valid `better_scale`!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new FolioConfig({
                "layout": "A4 Paysage",
                "theme": "theme1",
                "zoom_method": "fixed_scale"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The folio fixed scale has to be defined for fixed scale zoom method!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new FolioConfig({
                "layout": "A4 Paysage",
                "theme": "theme1",
                "zoom_method": "margin"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The folio margin has to be defined for margin zoom method!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('PortfolioConfig', function () {
    it('Valid point', function () {
        const portfolio = new PortfolioConfig({
            "title": "Test point",
            "drawing_geometry": "point",
            "folios": [
                {
                    "fixed_scale": 5000.0,
                    "layout": "A4 Paysage",
                    "theme": "theme1",
                    "zoom_method": "fixed_scale"
                }
            ]
        })

        expect(portfolio.title).to.be.eq('Test point')
        expect(portfolio.description).to.be.eq('')
        expect(portfolio.drawingGeometry).to.be.eq('point')
        expect(portfolio.drawingGeometry).to.be.eq(PortfolioDrawingGeometries.Point)
        expect(portfolio.folios.length).to.be.eq(1)

        const folio = portfolio.folios[0];
        expect(folio).to.be.instanceOf(FolioConfig)
        expect(folio.layout).to.be.eq("A4 Paysage")
        expect(folio.theme).to.be.eq("theme1")
        expect(folio.zoomMethod).to.be.eq("fixed_scale")
        expect(folio.zoomMethod).to.be.eq(FolioZoomMethods.FixedScale)
        expect(folio.fixedScale).to.be.eq(5000.0)
        expect(folio.margin).to.be.null
    })

    it('Valid line', function () {
        const portfolio = new PortfolioConfig({
            "title": "Test line",
            "drawing_geometry": "line",
            "folios": [
                {
                    "layout": "A4 Paysage",
                    "theme": "theme1",
                    "zoom_method": "best_scale"
                }
            ]
        })

        expect(portfolio.title).to.be.eq('Test line')
        expect(portfolio.description).to.be.eq('')
        expect(portfolio.drawingGeometry).to.be.eq('line')
        expect(portfolio.drawingGeometry).to.be.eq(PortfolioDrawingGeometries.Line)
        expect(portfolio.folios.length).to.be.eq(1)

        const folio = portfolio.folios[0];
        expect(folio).to.be.instanceOf(FolioConfig)
        expect(folio.layout).to.be.eq("A4 Paysage")
        expect(folio.theme).to.be.eq("theme1")
        expect(folio.zoomMethod).to.be.eq("best_scale")
        expect(folio.zoomMethod).to.be.eq(FolioZoomMethods.BestScale)
        expect(folio.fixedScale).to.be.null
        expect(folio.margin).to.be.null
    })

    it('Valid polygon', function () {
        const portfolio = new PortfolioConfig({
            "title": "Test polygon",
            "drawing_geometry": "polygon",
            "folios": [
                {
                    "layout": "A4 Paysage",
                    "margin": 10,
                    "theme": "theme1",
                    "zoom_method": "margin"
                }
            ]
        })

        expect(portfolio.title).to.be.eq('Test polygon')
        expect(portfolio.description).to.be.eq('')
        expect(portfolio.drawingGeometry).to.be.eq('polygon')
        expect(portfolio.drawingGeometry).to.be.eq(PortfolioDrawingGeometries.Polygon)
        expect(portfolio.folios.length).to.be.eq(1)

        const folio = portfolio.folios[0];
        expect(folio).to.be.instanceOf(FolioConfig)
        expect(folio.layout).to.be.eq("A4 Paysage")
        expect(folio.theme).to.be.eq("theme1")
        expect(folio.zoomMethod).to.be.eq("margin")
        expect(folio.zoomMethod).to.be.eq(FolioZoomMethods.Margin)
        expect(folio.fixedScale).to.be.null
        expect(folio.margin).to.be.eq(10)
    })

    it('ValidationError', function () {
        try {
            new PortfolioConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new PortfolioConfig({
                "title": "Bad geometry",
                "drawing_geometry": "bad_geom",
                "folios": []
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The portfolio drawing geometry is not valid `bad_geom`!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new PortfolioConfig({
                "title": "Bad folios",
                "drawing_geometry": "point",
                "folios": []
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The portfolio must have at least one folio!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new PortfolioConfig({
                "title": "Bad zoom method for point",
                "drawing_geometry": "point",
                "folios": [{
                    "layout": "A4 Paysage",
                    "margin": 10,
                    "theme": "theme1",
                    "zoom_method": "margin"
                }]
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The portfolio drawing geometry is Point, so the zoom method must be fixed_scale!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new PortfolioConfig({
                "title": "Bad zoom method for line or polygon",
                "drawing_geometry": "line",
                "folios": [{
                    "fixed_scale": 5000.0,
                    "layout": "A4 Paysage",
                    "theme": "theme1",
                    "zoom_method": "fixed_scale"
                }]
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The portfolio drawing geometry is not Point, so the zoom method must not be fixed_scale!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('PortfoliosConfig', function () {
    it('Valid', function () {
        const portfolios = new PortfoliosConfig({
            "list": [
                {
                    "title": "Test point",
                    "drawing_geometry": "point",
                    "folios": [
                        {
                            "fixed_scale": 5000.0,
                            "layout": "A4 Paysage",
                            "theme": "theme1",
                            "zoom_method": "fixed_scale"
                        }
                    ]
                },
                {
                    "title": "Test line",
                    "drawing_geometry": "line",
                    "folios": [
                        {
                            "layout": "A4 Paysage",
                            "theme": "theme1",
                            "zoom_method": "best_scale"
                        }
                    ]
                },
                {
                    "title": "Test polygon",
                    "drawing_geometry": "polygon",
                    "folios": [
                        {
                            "layout": "A4 Paysage",
                            "margin": 10,
                            "theme": "theme1",
                            "zoom_method": "margin"
                        }
                    ]
                }
            ]
        })
        expect(portfolios.list.length).to.be.eq(3)
        expect(portfolios.list[0]).to.be.instanceOf(PortfolioConfig)
        expect(portfolios.list[1]).to.be.instanceOf(PortfolioConfig)
        expect(portfolios.list[2]).to.be.instanceOf(PortfolioConfig)
        expect(portfolios.list.indexOf(portfolios.list[1])).to.be.eq(1)
    })

    it('ValidationError', function () {
        try {
            new PortfoliosConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new PortfoliosConfig({})
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg object has not enough properties compared to required!\n- The cfg properties: \n- The required properties: list')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})
