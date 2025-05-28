import { expect } from 'chai';

import { readFileSync } from 'fs';

import { Extent } from 'assets/src/modules/utils/Extent.js';
import { LayersConfig } from 'assets/src/modules/config/Layer.js';
import { LayerGeographicBoundingBoxConfig, LayerBoundingBoxConfig, LayerStyleConfig, LayerTreeItemConfig, LayerTreeGroupConfig, LayerTreeLayerConfig, buildLayerTreeConfig } from 'assets/src/modules/config/LayerTree.js';

describe('LayerGeographicBoundingBoxConfig', function () {
    it('Valid', function () {
        const gbb = new LayerGeographicBoundingBoxConfig(-71.63, 41.75, -70.78, 42.9);
        expect(gbb).to.be.instanceOf(Extent)
        expect(gbb).to.have.lengthOf(4)
        expect(gbb[0]).to.be.eq(-71.63)
        expect(gbb[1]).to.be.eq(41.75)
        expect(gbb[2]).to.be.eq(-70.78)
        expect(gbb[3]).to.be.eq(42.9)
        expect(gbb.xmin).to.be.eq(-71.63)
        expect(gbb.ymin).to.be.eq(41.75)
        expect(gbb.xmax).to.be.eq(-70.78)
        expect(gbb.ymax).to.be.eq(42.9)
        expect(gbb.west).to.be.eq(-71.63)
        expect(gbb.south).to.be.eq(41.75)
        expect(gbb.east).to.be.eq(-70.78)
        expect(gbb.north).to.be.eq(42.9)
    })
})

describe('LayerBoundingBoxConfig', function () {
    it('Valid', function () {
        const gbb = new LayerBoundingBoxConfig('CRS:84', [-71.63, 41.75, -70.78, 42.9]);
        expect(gbb).to.be.instanceOf(Extent)
        expect(gbb.crs).to.be.eq('CRS:84')
        expect(gbb).to.have.lengthOf(4)
        expect(gbb[0]).to.be.eq(-71.63)
        expect(gbb[1]).to.be.eq(41.75)
        expect(gbb[2]).to.be.eq(-70.78)
        expect(gbb[3]).to.be.eq(42.9)
        expect(gbb.xmin).to.be.eq(-71.63)
        expect(gbb.ymin).to.be.eq(41.75)
        expect(gbb.xmax).to.be.eq(-70.78)
        expect(gbb.ymax).to.be.eq(42.9)
    })
})

describe('LayerStyleConfig', function () {
    it('Valid', function () {
        const style = new LayerStyleConfig('default', 'Défaut');
        expect(style.wmsName).to.be.eq('default')
        expect(style.wmsTitle).to.be.eq('Défaut')
    })
    it('Empty', function () {
        const style = new LayerStyleConfig('', '');
        expect(style.wmsName).to.be.eq('')
        expect(style.wmsTitle).to.be.eq('')
    })
})

describe('LayerTreeItemConfig', function () {
    it('Valid', function () {
        const item = new LayerTreeItemConfig('Roads and Rivers', 'test', 1, {
            "Name": "ROADS_RIVERS",
            "Title": "Roads and Rivers",
            "CRS": [
              "EPSG:26986",
              "CRS:84"
            ],
            "EX_GeographicBoundingBox": [
              -71.63,
              41.75,
              -70.78,
              42.9
            ],
            "BoundingBox": [
              {
                "crs": "CRS:84",
                "extent": [
                  -71.63,
                  41.75,
                  -70.78,
                  42.9
                ],
                "res": [
                  0.01,
                  0.01
                ]
              },
              {
                "crs": "EPSG:26986",
                "extent": [
                  189000,
                  834000,
                  285000,
                  962000
                ],
                "res": [
                  1,
                  1
                ]
              }
            ],
            "Attribution": {
              "Title": "State College University",
              "OnlineResource": "http://www.university.edu/",
              "LogoURL": {
                "Format": "image/gif",
                "OnlineResource": "http://www.university.edu/icons/logo.gif",
                "size": [
                  100,
                  100
                ]
              }
            },
            "Identifier": [
              "123456"
            ],
            "FeatureListURL": [
              {
                "Format": "XML",
                "OnlineResource": "http://www.university.edu/data/roads_rivers.gml"
              }
            ],
            "Style": [
              {
                "Name": "USGS",
                "Title": "USGS Topo Map Style",
                "Abstract": "Features are shown in a style like that used in USGS topographic maps.",
                "LegendURL": [
                  {
                    "Format": "image/gif",
                    "OnlineResource": "http://www.university.edu/legends/usgs.gif",
                    "size": [
                      72,
                      72
                    ]
                  }
                ],
                "StyleSheetURL": {
                  "Format": "text/xsl",
                  "OnlineResource": "http://www.university.edu/stylesheets/usgs.xsl"
                }
              }
            ],
            "MinScaleDenominator": 1000,
            "MaxScaleDenominator": 250000
        })
        expect(item.name).to.be.eq('Roads and Rivers')
        expect(item.type).to.be.eq('test')
        expect(item.level).to.be.eq(1)
        expect(item.wmsName).to.be.eq('ROADS_RIVERS')
        expect(item.wmsTitle).to.be.eq('Roads and Rivers')
        expect(item.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(item.wmsGeographicBoundingBox.west).to.be.eq(-71.63)
        expect(item.wmsGeographicBoundingBox.south).to.be.eq(41.75)
        expect(item.wmsGeographicBoundingBox.east).to.be.eq(-70.78)
        expect(item.wmsGeographicBoundingBox.north).to.be.eq(42.9)
        expect(item.wmsBoundingBoxes).to.have.lengthOf(2)
        expect(item.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(item.wmsBoundingBoxes[0].crs).to.be.eq('CRS:84')
        expect(item.wmsBoundingBoxes[0]).to.have.lengthOf(4)
        expect(item.wmsBoundingBoxes[0].xmin).to.be.eq(-71.63)
        expect(item.wmsBoundingBoxes[0].ymin).to.be.eq(41.75)
        expect(item.wmsBoundingBoxes[0].xmax).to.be.eq(-70.78)
        expect(item.wmsBoundingBoxes[0].ymax).to.be.eq(42.9)
        expect(item.layerConfig).to.be.null;
    })
})

describe('buildLayerTreeConfig', function () {
    it('Montpellier', function () {
        const capabilities = JSON.parse(readFileSync('./tests/js-units/data/montpellier-capabilities.json', 'utf8'));
        expect(capabilities).to.not.be.undefined
        expect(capabilities.Capability).to.not.be.undefined
        const config = JSON.parse(readFileSync('./tests/js-units/data/montpellier-config.json', 'utf8'));
        expect(config).to.not.be.undefined

        const layers = new LayersConfig(config.layers);

        let invalid = [];
        const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

        expect(invalid).to.have.length(0);
        expect(root).to.be.instanceOf(LayerTreeGroupConfig)
        expect(root.name).to.be.eq('root')
        expect(root.type).to.be.eq('group')
        expect(root.level).to.be.eq(0)
        expect(root.wmsName).to.be.eq('Montpellier-Transports')
        expect(root.wmsTitle).to.be.eq('Montpellier - Transports')
        expect(root.wmsAbstract).to.be.eq('Demo project with bus and tramway lines in Montpellier, France.\nData is licensed under ODbl, OpenStreetMap contributors')
        expect(root.wmsGeographicBoundingBox).to.be.instanceOf(LayerGeographicBoundingBoxConfig)
        expect(root.wmsGeographicBoundingBox.west).to.be.eq(43.542477)
        expect(root.wmsGeographicBoundingBox.south).to.be.eq(3.746034)
        expect(root.wmsGeographicBoundingBox.east).to.be.eq(43.672144)
        expect(root.wmsGeographicBoundingBox.north).to.be.eq(4.01689)
        expect(root.wmsBoundingBoxes).to.be.instanceOf(Array)
        expect(root.wmsBoundingBoxes).to.have.length(3)
        expect(root.wmsBoundingBoxes[0]).to.be.instanceOf(LayerBoundingBoxConfig)
        expect(root.wmsBoundingBoxes[0].crs).to.be.eq('EPSG:3857')
        expect(root.wmsBoundingBoxes[0].xmin).to.be.eq(417006.613)
        expect(root.wmsBoundingBoxes[0].ymin).to.be.eq(5394910.34)
        expect(root.wmsBoundingBoxes[0].xmax).to.be.eq(447158.049)
        expect(root.wmsBoundingBoxes[0].ymax).to.be.eq(5414844.995)
        expect(root.layerConfig).to.be.null;
        expect(root.childrenCount).to.be.eq(7)
        expect(root.findTreeLayerConfigNames()).to.have.length(18)
        expect(root.findTreeLayerConfigs()).to.have.length(18)

        const edition = root.children[0];
        expect(edition).to.be.instanceOf(LayerTreeGroupConfig)
        expect(edition.name).to.be.eq('Edition')
        expect(edition.type).to.be.eq('group')
        expect(edition.level).to.be.eq(1)
        expect(edition.wmsName).to.be.eq('Edition')
        expect(edition.wmsTitle).to.be.eq('Edition')
        expect(edition.wmsAbstract).to.be.null
        expect(edition.layerConfig).to.not.be.null;
        expect(edition.childrenCount).to.be.eq(3)
        expect(edition.findTreeLayerConfigNames()).to.have.length(3).that.be.deep.eq([
            "points_of_interest",
            "edition_line",
            "areas_of_interest"
        ])
        expect(edition.findTreeLayerConfigs()).to.have.length(3)

        const transports = root.children[1];
        expect(transports).to.be.instanceOf(LayerTreeGroupConfig)
        expect(transports.childrenCount).to.be.eq(3)
        expect(transports.findTreeLayerConfigNames()).to.have.length(9)
        expect(transports.findTreeLayerConfigs()).to.have.length(9)

        const bus = transports.children[0];
        expect(bus).to.be.instanceOf(LayerTreeGroupConfig)
        expect(bus.name).to.be.eq('Bus')
        expect(bus.type).to.be.eq('group')
        expect(bus.level).to.be.eq(2)
        expect(bus.wmsName).to.be.eq('Bus')
        expect(bus.wmsTitle).to.be.eq('Bus')
        expect(bus.wmsAbstract).to.be.null
        expect(bus.wmsMinScaleDenominator).to.be.eq(-1)
        expect(bus.wmsMaxScaleDenominator).to.be.eq(-1)
        expect(bus.layerConfig).to.not.be.null
        expect(bus.childrenCount).to.be.eq(2)
        expect(bus.findTreeLayerConfigNames()).to.have.length(2).that.be.deep.eq([
          "bus_stops",
          "bus"
      ])
        expect(bus.findTreeLayerConfigs()).to.have.length(2)

        const busStops = bus.children[0];
        expect(busStops).to.be.instanceOf(LayerTreeLayerConfig)
        expect(busStops.name).to.be.eq('bus_stops')
        expect(busStops.type).to.be.eq('layer')
        expect(busStops.level).to.be.eq(3)
        expect(busStops.wmsName).to.be.eq('bus_stops')
        expect(busStops.wmsTitle).to.be.eq('bus_stops')
        expect(busStops.wmsAbstract).to.be.null
        expect(busStops.layerConfig).to.not.be.null
        expect(busStops.wmsMinScaleDenominator).to.be.eq(0)
        expect(busStops.wmsMaxScaleDenominator).to.be.eq(15000)

        const sousquartiers = root.children[3];
        expect(sousquartiers).to.be.instanceOf(LayerTreeLayerConfig)
        expect(sousquartiers.name).to.be.eq('SousQuartiers')
        expect(sousquartiers.type).to.be.eq('layer')
        expect(sousquartiers.level).to.be.eq(1)
        expect(sousquartiers.wmsName).to.be.eq('SousQuartiers')
        expect(sousquartiers.wmsTitle).to.be.eq('SousQuartiers')
        expect(sousquartiers.wmsAbstract).to.be.null
        expect(sousquartiers.layerConfig).to.not.be.null;
        expect(sousquartiers.wmsStyles).to.be.instanceOf(Array)
        expect(sousquartiers.wmsStyles).to.have.length(1)
        expect(sousquartiers.wmsStyles[0].wmsName).to.be.eq('default')
        expect(sousquartiers.wmsStyles[0].wmsTitle).to.be.eq('default')
        expect(sousquartiers.wmsAttribution).to.be.null
        expect(sousquartiers.wmsMinScaleDenominator).to.be.eq(-1)
        expect(sousquartiers.wmsMaxScaleDenominator).to.be.eq(-1)

        const rootGetChildren = root.getChildren()
        expect(rootGetChildren.next().value).to.be.eq(edition)
        const child2 = rootGetChildren.next().value;
        expect(child2).to.be.instanceOf(LayerTreeGroupConfig)
        expect(child2.name).to.be.eq('datalayers')
        const child3 = rootGetChildren.next().value;
        expect(child3).to.be.instanceOf(LayerTreeLayerConfig)
        expect(child3.name).to.be.eq('donnes_sociodemo_sous_quartiers')
        expect(rootGetChildren.next().value).to.be.eq(sousquartiers)
        const child5 = rootGetChildren.next().value;
        expect(child5).to.be.instanceOf(LayerTreeLayerConfig)
        expect(child5.name).to.be.eq('Quartiers')
        const child6 = rootGetChildren.next().value;
        expect(child6).to.be.instanceOf(LayerTreeGroupConfig)
        expect(child6.name).to.be.eq('Overview')
        const child7 = rootGetChildren.next().value;
        expect(child7).to.be.instanceOf(LayerTreeGroupConfig)
        expect(child7.name).to.be.eq('Hidden')
    })

    it('Backgrounds', function () {
      const capabilities = JSON.parse(readFileSync('./tests/js-units/data/backgrounds-capabilities.json', 'utf8'));
      expect(capabilities).to.not.be.undefined
      expect(capabilities.Capability).to.not.be.undefined
      const config = JSON.parse(readFileSync('./tests/js-units/data/backgrounds-config.json', 'utf8'));
      expect(config).to.not.be.undefined

      const layers = new LayersConfig(config.layers);

      let invalid = [];
      const root = buildLayerTreeConfig(capabilities.Capability.Layer, layers, invalid);

      expect(invalid).to.have.length(0);
      expect(root).to.be.instanceOf(LayerTreeGroupConfig)
      expect(root.name).to.be.eq('root')
      expect(root.type).to.be.eq('group')
      expect(root.level).to.be.eq(0)
      expect(root.layerConfig).to.be.null;
      expect(root.childrenCount).to.be.eq(3)
      expect(root.findTreeLayerConfigNames()).to.have.length(20)
      expect(root.findTreeLayerConfigs()).to.have.length(20)

      const layer = root.children[0]
      expect(layer).to.be.instanceOf(LayerTreeLayerConfig)
      expect(layer.type).to.be.eq('layer')
      expect(layer.name).to.be.eq('OpenTopoMap')

      const baselayers = root.children[2]
      expect(baselayers).to.be.instanceOf(LayerTreeGroupConfig)
      expect(baselayers.type).to.be.eq('group')
      expect(baselayers.name).to.be.eq('baselayers')
      expect(baselayers.childrenCount).to.be.eq(16)
      expect(baselayers.findTreeLayerConfigNames()).to.have.length(18)
      expect(baselayers.findTreeLayerConfigs()).to.have.length(18)

      const baselayersGetChildren = baselayers.getChildren()

      const tms = baselayersGetChildren.next().value;
      expect(tms.type).to.be.eq('layer')
      expect(tms.name).to.be.eq('=== TMS ===')
      expect(tms.layerConfig.type).to.be.eq('group')
      expect(tms.wmsName).to.be.eq('TMS')
      expect(tms.wmsStyles).to.have.length(1)
      expect(tms.wmsStyles[0].wmsName).to.be.eq('')
      expect(tms.wmsStyles[0].wmsTitle).to.be.eq('Default')

      const watercolor = baselayersGetChildren.next().value;
      expect(watercolor.type).to.be.eq('layer')
      expect(watercolor.name).to.be.eq('Stamen Watercolor')
      expect(watercolor.layerConfig.type).to.be.eq('layer')
      expect(watercolor.wmsName).to.be.eq('Stamen_Watercolor')
      expect(watercolor.wmsStyles).to.have.length(1)
      expect(watercolor.wmsStyles[0].wmsName).to.be.eq('default')
      expect(watercolor.wmsStyles[0].wmsTitle).to.be.eq('default')

      const osm = baselayersGetChildren.next().value;
      expect(osm.type).to.be.eq('layer')
      expect(osm.name).to.be.eq('OSM TMS internal')
      expect(osm.layerConfig.type).to.be.eq('layer')
      expect(osm.wmsName).to.be.eq('OpenStreetMap_1')
      expect(osm.wmsStyles).to.have.length(1)
      expect(osm.wmsStyles[0].wmsName).to.be.eq('default')
      expect(osm.wmsStyles[0].wmsTitle).to.be.eq('default')

      const osm2 = baselayersGetChildren.next().value;
      expect(osm2.type).to.be.eq('layer')
      expect(osm2.name).to.be.eq('OSM TMS external')
      expect(osm2.layerConfig.type).to.be.eq('layer')
      expect(osm2.wmsName).to.be.eq('OpenStreetMap_2')
      expect(osm2.wmsStyles).to.have.length(1)
      expect(osm2.wmsStyles[0].wmsName).to.be.eq('default')
      expect(osm2.wmsStyles[0].wmsTitle).to.be.eq('default')

      const groups = baselayersGetChildren.next().value;
      expect(groups.type).to.be.eq('layer')
      expect(groups.name).to.be.eq('=== GROUPS ===')
      expect(groups.layerConfig.type).to.be.eq('group')
      expect(groups.wmsName).to.be.eq('GROUPS')
      expect(groups.wmsStyles).to.have.length(1)
      expect(groups.wmsStyles[0].wmsName).to.be.eq('')
      expect(groups.wmsStyles[0].wmsTitle).to.be.eq('Default')

      const projectBackgroundColor = baselayersGetChildren.next().value;
      expect(projectBackgroundColor.type).to.be.eq('layer')
      expect(projectBackgroundColor.name).to.be.eq('project-background-color')
      expect(projectBackgroundColor.layerConfig.type).to.be.eq('group')
      expect(projectBackgroundColor.wmsName).to.be.eq('project-background-color')
      expect(projectBackgroundColor.wmsStyles).to.have.length(1)
      expect(projectBackgroundColor.wmsStyles[0].wmsName).to.be.eq('')
      expect(projectBackgroundColor.wmsStyles[0].wmsTitle).to.be.eq('Default')

      const emptyGroup = baselayersGetChildren.next().value;
      expect(emptyGroup.type).to.be.eq('layer')
      expect(emptyGroup.name).to.be.eq('empty group')
      expect(emptyGroup.layerConfig.type).to.be.eq('group')
      expect(emptyGroup.wmsName).to.be.eq('empty_group')
      expect(emptyGroup.wmsStyles).to.have.length(1)
      expect(emptyGroup.wmsStyles[0].wmsName).to.be.eq('')
      expect(emptyGroup.wmsStyles[0].wmsTitle).to.be.eq('Default')

      const group = baselayersGetChildren.next().value;
      expect(group.type).to.be.eq('group')
      expect(group.name).to.be.eq('group with many layers and shortname')
      expect(group.layerConfig.type).to.be.eq('group')
      expect(group.wmsName).to.be.eq('group_with_many_layers_shortname')
      expect(group.childrenCount).to.be.eq(3)
      expect(group.findTreeLayerConfigNames()).to.have.length(3)
      expect(group.findTreeLayerConfigs()).to.have.length(3)

      const groupSub = baselayersGetChildren.next().value;
      expect(groupSub.type).to.be.eq('group')
      expect(groupSub.name).to.be.eq('group with sub')
      expect(groupSub.layerConfig.type).to.be.eq('group')
      expect(groupSub.wmsName).to.be.eq('group_with_sub')
      expect(groupSub.childrenCount).to.be.eq(1)
      expect(groupSub.findTreeLayerConfigNames()).to.have.length(1)
      expect(groupSub.findTreeLayerConfigs()).to.have.length(1)

      const localLayers = baselayersGetChildren.next().value;
      expect(localLayers.type).to.be.eq('layer')
      expect(localLayers.name).to.be.eq('=== LOCAL LAYERS ===')
      expect(localLayers.layerConfig.type).to.be.eq('group')
      expect(localLayers.wmsName).to.be.eq('LOCAL_LAYERS')
      expect(localLayers.wmsStyles).to.have.length(1)
      expect(localLayers.wmsStyles[0].wmsName).to.be.eq('')
      expect(localLayers.wmsStyles[0].wmsTitle).to.be.eq('Default')

      const vector = baselayersGetChildren.next().value;
      expect(vector.type).to.be.eq('layer')
      expect(vector.name).to.be.eq('local vector layer')
      expect(vector.layerConfig.type).to.be.eq('layer')
      expect(vector.wmsName).to.be.eq('vector_layer')
      expect(vector.wmsStyles).to.have.length(1)
      expect(vector.wmsStyles[0].wmsName).to.be.eq('default')
      expect(vector.wmsStyles[0].wmsTitle).to.be.eq('default')

      const raster = baselayersGetChildren.next().value;
      expect(raster.type).to.be.eq('layer')
      expect(raster.name).to.be.eq('local raster layer')
      expect(raster.layerConfig.type).to.be.eq('layer')
      expect(raster.wmsName).to.be.eq('local_raster')
      expect(raster.wmsStyles).to.have.length(1)
      expect(raster.wmsStyles[0].wmsName).to.be.eq('default')
      expect(raster.wmsStyles[0].wmsTitle).to.be.eq('default')

      const wmts = baselayersGetChildren.next().value;
      expect(wmts.type).to.be.eq('layer')
      expect(wmts.name).to.be.eq('=== WM[T]S are on liz.lizmap.com ===')
      expect(wmts.layerConfig.type).to.be.eq('group')
      expect(wmts.wmsName).to.be.eq('WM_T_S_are_on_liz_lizmap_com')
      expect(wmts.wmsStyles).to.have.length(1)
      expect(wmts.wmsStyles[0].wmsName).to.be.eq('')
      expect(wmts.wmsStyles[0].wmsTitle).to.be.eq('Default')

      const wmtsSingle = baselayersGetChildren.next().value;
      expect(wmtsSingle.type).to.be.eq('layer')
      expect(wmtsSingle.name).to.be.eq('WMTS single external')
      expect(wmtsSingle.layerConfig.type).to.be.eq('layer')
      expect(wmtsSingle.wmsName).to.be.eq('WMTS_liz_lizmap_com_communes')
      expect(wmtsSingle.wmsStyles).to.have.length(1)
      expect(wmtsSingle.wmsStyles[0].wmsName).to.be.eq('default')
      expect(wmtsSingle.wmsStyles[0].wmsTitle).to.be.eq('default')

      const wmsSingle = baselayersGetChildren.next().value;
      expect(wmsSingle.type).to.be.eq('layer')
      expect(wmsSingle.name).to.be.eq('WMS single internal')
      expect(wmsSingle.layerConfig.type).to.be.eq('layer')
      expect(wmsSingle.wmsName).to.be.eq('WMST_lizmap_com_MTP_1')
      expect(wmsSingle.wmsStyles).to.have.length(1)
      expect(wmsSingle.wmsStyles[0].wmsName).to.be.eq('default')
      expect(wmsSingle.wmsStyles[0].wmsTitle).to.be.eq('default')

      const wmsGrouped = baselayersGetChildren.next().value;
      expect(wmsGrouped.type).to.be.eq('layer')
      expect(wmsGrouped.name).to.be.eq('WMS grouped external')
      expect(wmsGrouped.layerConfig.type).to.be.eq('layer')
      expect(wmsGrouped.wmsName).to.be.eq('WMST_lizmap_com_MTP')
      expect(wmsGrouped.wmsStyles).to.have.length(1)
      expect(wmsGrouped.wmsStyles[0].wmsName).to.be.eq('default')
      expect(wmsGrouped.wmsStyles[0].wmsTitle).to.be.eq('default')
    })
})
