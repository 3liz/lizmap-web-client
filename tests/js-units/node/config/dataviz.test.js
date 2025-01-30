import { expect } from 'chai';

import { ValidationError, ConversionError } from 'assets/src/modules/Errors.js';
import { DatavizOptionsConfig, DatavizTraceConfig, DatavizPlotConfig, DatavizElementConfig, DatavizLayersConfig } from 'assets/src/modules/config/Dataviz.js';

describe('DatavizOptionsConfig', function () {
    it('Valid', function () {
        const options = new DatavizOptionsConfig({
            "location": "dock",
            "theme": "light",
        })
        expect(options.location).to.be.eq("dock")
        expect(options.theme).to.be.eq("light")
    })

    it('ValidationError', function () {
        try {
            new DatavizOptionsConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('DatavizTraceConfig', function () {
    it('Valid', function () {
        const trace = new DatavizTraceConfig({
            "color": "#086fa1",
            "colorfield": "",
            "y_field": "id",
            "z_field": ""
        })
        expect(trace.color).to.be.eq("#086fa1")
        expect(trace.colorField).to.be.eq("")
        expect(trace.yField).to.be.eq("id")
        expect(trace.zField).to.be.eq("")
    })

    it('ValidationError', function () {
        try {
            new DatavizTraceConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('DatavizPlotConfig', function () {
    it('Valid', function () {
        const plot = new DatavizPlotConfig({
            "type": "bar",
            "x_field": "polygons_name",
            "aggregation": "count",
            "traces": [
                {
                    "color": "#086fa1",
                    "colorfield": "",
                    "y_field": "id",
                    "z_field": ""
                }
            ],
            "stacked": "False",
            "horizontal": "False",
            "display_legend": "True",
            "display_when_layer_visible": "False"
        })
        expect(plot.type).to.be.eq('bar')
        expect(plot.xField).to.be.eq('polygons_name')
        expect(plot.aggregation).to.be.eq('count')

        expect(plot.traces.length).to.be.eq(1)
        const trace = plot.traces[0]
        expect(trace.color).to.be.eq("#086fa1")
        expect(trace.colorField).to.be.eq("")
        expect(trace.yField).to.be.eq("id")
        expect(trace.zField).to.be.eq("")

        expect(plot.stacked).to.be.eq(false)
        expect(plot.horizontal).to.be.eq(false)
        expect(plot.displayLegend).to.be.eq(true)
        expect(plot.displayWhenLayerVisible).to.be.eq(false)

        const box = new DatavizPlotConfig({
            "type": "box",
            "aggregation": "",
            "display_when_layer_visible": "False",
            "traces": [
                {
                    "color": "#f938ff",
                    "colorfield": "",
                    "y_field": "socio_population_2009"
                }
            ],
            "display_legend": true,
            "stacked": false,
            "horizontal": false
        })
        expect(box.type).to.be.eq('box')
        expect(box.xField).to.be.null
        expect(box.aggregation).to.be.eq('')

        expect(box.traces.length).to.be.eq(1)
        const boxTrace = box.traces[0]
        expect(boxTrace.color).to.be.eq("#f938ff")
        expect(boxTrace.colorField).to.be.eq("")
        expect(boxTrace.yField).to.be.eq("socio_population_2009")
        expect(boxTrace.zField).to.be.null

        expect(box.stacked).to.be.false
        expect(box.horizontal).to.be.false
        expect(box.displayLegend).to.be.true
        expect(box.displayWhenLayerVisible).to.be.false
    })

    it('ValidationError', function () {
        try {
            new DatavizPlotConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new DatavizPlotConfig({
                "type": "bar",
                "title": "Bar Bakeries by municipalities",
                "layerId": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "x_field": "polygons_name",
                "aggregation": "count",
                "popup_display_child_plot": "False",
                "stacked": "False",
                "horizontal": "False",
                "only_show_child": "False",
                "display_legend": "True",
                "display_when_layer_visible": "False",
                "order": 1
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `traces` in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('DatavizElementConfig', function () {
    it('Valid', function () {
        const element = new DatavizElementConfig({
            "plot_id": 1,
            "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
            "title": "Bar Bakeries by municipalities",
            "title_popup": "Bar Bakeries for this municipalities",
            "abstract": "",
            "plot":{
                "type": "bar",
                "x_field": "polygons_name",
                "aggregation": "count",
                "traces": [
                    {
                        "color": "#086fa1",
                        "colorfield": "",
                        "y_field": "id",
                        "z_field": ""
                    }
                ],
                "stacked": "False",
                "horizontal": "False",
                "display_legend": "True",
                "display_when_layer_visible": "False"
            },
            "popup_display_child_plot": "False",
            "only_show_child": "False",
            "trigger_filter": true
        })
        expect(element.plotId).to.be.eq(1)
        expect(element.layerId).to.be.eq('bakeries_1dbdac14_931c_4568_ad56_3a947a77d810')
        expect(element.title).to.be.eq('Bar Bakeries by municipalities')
        expect(element.titlePopup).to.be.eq('Bar Bakeries for this municipalities')
        expect(element.abstract).to.be.eq('')

        expect(element.plot).to.not.be.eq(undefined)
        const plot = element.plot;
        expect(plot.type).to.be.eq('bar')
        expect(plot.xField).to.be.eq('polygons_name')
        expect(plot.aggregation).to.be.eq('count')

        expect(plot.traces.length).to.be.eq(1)
        const trace = plot.traces[0]
        expect(trace.color).to.be.eq("#086fa1")
        expect(trace.colorField).to.be.eq("")
        expect(trace.yField).to.be.eq("id")
        expect(trace.zField).to.be.eq("")

        expect(plot.stacked).to.be.eq(false)
        expect(plot.horizontal).to.be.eq(false)
        expect(plot.displayLegend).to.be.eq(true)
        expect(plot.displayWhenLayerVisible).to.be.eq(false)

        expect(element.popupDisplayChildPlot).to.be.eq(false)
        expect(element.onlyShowChild).to.be.eq(false)
        expect(element.triggerFilter).to.be.eq(true)
    })

    it('ValidationError', function () {
        try {
            new DatavizElementConfig()
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('The cfg parameter is not an Object!')
            expect(error).to.be.instanceOf(ValidationError)
        }

        try {
            new DatavizElementConfig({
                "plot_id": 1,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Bar Bakeries by municipalities",
                "abstract": "",
                "popup_display_child_plot": "False",
                "only_show_child": "False",
                "trigger_filter": "False"
            })
        } catch (error) {
            expect(error.name).to.be.eq('ValidationError')
            expect(error.message).to.be.eq('No `plot` in the cfg object!')
            expect(error).to.be.instanceOf(ValidationError)
        }
    })
})

describe('DatavizLayersConfig', function () {
    it('Valid', function () {
        const config = new DatavizLayersConfig({
            "0": {
                "plot_id": 0,
                "layer_id": "polygons_1e227060_6105_4a4a_92f2_11863ebe65f1",
                "title": "Municipalities",
                "abstract": "Municipalities",
                "plot":{
                    "type": "bar",
                    "x_field": "name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "popup_display_child_plot": "False",
                "only_show_child": "False",
                "trigger_filter": true
            },
            "1": {
                "plot_id": 1,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Bar Bakeries by municipalities",
                "plot":{
                    "type": "bar",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "only_show_child": "False",
                "popup_display_child_plot": "False",
                "trigger_filter": true
            },
            "2": {
                "plot_id": 2,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Pie Bakeries by municipalities",
                "plot":{
                    "type": "pie",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "only_show_child": "False",
                "popup_display_child_plot": "False",
                "trigger_filter": true
            }
        })

        const configLayerIds = config.layerIds;
        expect(configLayerIds.length).to.be.eq(2)
        expect(configLayerIds).deep.to.eq([
            "polygons_1e227060_6105_4a4a_92f2_11863ebe65f1",
            "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810"
        ])

        const configElementConfigs = config.elementConfigs
        expect(configElementConfigs.length).to.be.eq(3)

        const element = configElementConfigs[1]
        expect(element.plotId).to.be.eq(1)
        expect(element.layerId).to.be.eq('bakeries_1dbdac14_931c_4568_ad56_3a947a77d810')
        expect(element.title).to.be.eq('Bar Bakeries by municipalities')
        expect(element.abstract).to.be.eq('')

        expect(element.plot).to.not.be.eq(undefined)
        const plot = element.plot;
        expect(plot.type).to.be.eq('bar')
        expect(plot.xField).to.be.eq('polygons_name')
        expect(plot.aggregation).to.be.eq('count')

        expect(plot.traces.length).to.be.eq(1)
        const trace = plot.traces[0]
        expect(trace.color).to.be.eq("#086fa1")
        expect(trace.colorField).to.be.eq("")
        expect(trace.yField).to.be.eq("id")
        expect(trace.zField).to.be.eq("")

        expect(plot.stacked).to.be.eq(false)
        expect(plot.horizontal).to.be.eq(false)
        expect(plot.displayLegend).to.be.eq(true)
        expect(plot.displayWhenLayerVisible).to.be.eq(false)

        expect(element.popupDisplayChildPlot).to.be.eq(false)
        expect(element.onlyShowChild).to.be.eq(false)
        expect(element.triggerFilter).to.be.eq(true)

        const bakeriesElements = config.getElementConfigsByLayerId('bakeries_1dbdac14_931c_4568_ad56_3a947a77d810')
        expect(bakeriesElements.length).to.be.eq(2)
        expect(bakeriesElements[0]).deep.to.eq(element)

        const configGetElementConfigs = config.getElementConfigs()
        expect(configGetElementConfigs.next().value.plotId).to.be.eq(0)
        expect(configGetElementConfigs.next().value.plotId).to.be.eq(1)
        expect(configGetElementConfigs.next().value.plotId).to.be.eq(2)

        const arrayConfig = new DatavizLayersConfig([
            {
                "plot_id": 0,
                "layer_id": "polygons_1e227060_6105_4a4a_92f2_11863ebe65f1",
                "title": "Municipalities",
                "abstract": "Municipalities",
                "plot":{
                    "type": "bar",
                    "x_field": "name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "popup_display_child_plot": "False",
                "only_show_child": "False",
                "trigger_filter": true
            },{
                "plot_id": 2,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Pie Bakeries by municipalities",
                "plot":{
                    "type": "pie",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "only_show_child": "False",
                "popup_display_child_plot": "False",
                "trigger_filter": true
            },{
                "plot_id": 1,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Bar Bakeries by municipalities",
                "plot":{
                    "type": "bar",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "only_show_child": "False",
                "popup_display_child_plot": "False",
                "trigger_filter": true
            }
        ])

        const arrayConfigElementConfigs = arrayConfig.elementConfigs
        expect(arrayConfigElementConfigs.length).to.be.eq(3)
        expect(arrayConfigElementConfigs[1]).deep.to.eq(element)

        const arrayBakeriesElements = config.getElementConfigsByLayerId('bakeries_1dbdac14_931c_4568_ad56_3a947a77d810')
        expect(arrayBakeriesElements.length).to.be.eq(2)
        expect(arrayBakeriesElements[0]).deep.to.eq(element)

        const arrayConfigGetElementConfigs = arrayConfig.getElementConfigs()
        expect(arrayConfigGetElementConfigs.next().value.plotId).to.be.eq(0)
        expect(arrayConfigGetElementConfigs.next().value.plotId).to.be.eq(1)
        expect(arrayConfigGetElementConfigs.next().value.plotId).to.be.eq(2)

        const disorderConfig = new DatavizLayersConfig([
            {
                "plot_id": 0,
                "layer_id": "polygons_1e227060_6105_4a4a_92f2_11863ebe65f1",
                "title": "Municipalities",
                "abstract": "Municipalities",
                "plot":{
                    "type": "bar",
                    "x_field": "name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "popup_display_child_plot": "False",
                "only_show_child": "False",
                "trigger_filter": true
            },{
                "plot_id": 2,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Pie Bakeries by municipalities",
                "plot":{
                    "type": "pie",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "only_show_child": "False",
                "popup_display_child_plot": "False",
                "trigger_filter": true
            },{
                "plot_id": 1,
                "layer_id": "bakeries_1dbdac14_931c_4568_ad56_3a947a77d810",
                "title": "Bar Bakeries by municipalities",
                "plot":{
                    "type": "bar",
                    "x_field": "polygons_name",
                    "aggregation": "count",
                    "traces": [
                        {
                            "color": "#086fa1",
                            "colorfield": "",
                            "y_field": "id",
                            "z_field": ""
                        }
                    ],
                    "stacked": "False",
                    "horizontal": "False",
                    "display_legend": "True",
                    "display_when_layer_visible": "False",
                },
                "only_show_child": "False",
                "popup_display_child_plot": "False",
                "trigger_filter": true
            }
        ])

        const disorderConfigElementConfigs = disorderConfig.elementConfigs
        expect(disorderConfigElementConfigs.length).to.be.eq(3)
        expect(disorderConfigElementConfigs[1]).deep.to.eq(element)

        const disorderBakeriesElements = config.getElementConfigsByLayerId('bakeries_1dbdac14_931c_4568_ad56_3a947a77d810')
        expect(disorderBakeriesElements.length).to.be.eq(2)
        expect(disorderBakeriesElements[0]).deep.to.eq(element)

        const disorderConfigGetElementConfigs = disorderConfig.getElementConfigs()
        expect(disorderConfigGetElementConfigs.next().value.plotId).to.be.eq(0)
        expect(disorderConfigGetElementConfigs.next().value.plotId).to.be.eq(1)
        expect(disorderConfigGetElementConfigs.next().value.plotId).to.be.eq(2)
    })
})
