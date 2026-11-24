import { expect } from 'chai';

import { readFileSync } from 'fs';

import { Config } from 'assets/src/modules/Config.js';
import { State } from 'assets/src/modules/State.js';

import { getPrintMainMapId, getPrintLayersParameters } from 'assets/src/modules/PrintLayers.js';

/**
 * Build the state of a project from the test data
 * @param {string} name - The project name
 * @returns {State} The project state
 */
function getState(name) {
    const capabilities = JSON.parse(readFileSync(`./tests/js-units/data/${name}-capabilities.json`, 'utf8'));
    expect(capabilities).to.not.be.undefined
    expect(capabilities.Capability).to.not.be.undefined
    const config = JSON.parse(readFileSync(`./tests/js-units/data/${name}-config.json`, 'utf8'));
    expect(config).to.not.be.undefined

    return new State(new Config(config, capabilities));
}

describe('PrintLayers', function () {

    describe('getPrintMainMapId', function () {

        it('Without maps', function () {
            expect(getPrintMainMapId(undefined)).to.be.eq('map0')
            expect(getPrintMainMapId({})).to.be.eq('map0')
            expect(getPrintMainMapId({maps: []})).to.be.eq('map0')
        })

        it('One map', function () {
            expect(getPrintMainMapId({
                maps: [{id: 'map0'}]
            })).to.be.eq('map0')
        })

        it('Main map and overview map', function () {
            // The overview map references the main map
            expect(getPrintMainMapId({
                maps: [{id: 'map0', overviewMap: 'map1'}, {id: 'map1'}]
            })).to.be.eq('map1')
            expect(getPrintMainMapId({
                maps: [{id: 'map0'}, {id: 'map1', overviewMap: 'map0'}]
            })).to.be.eq('map0')
        })

        it('Two maps without overview', function () {
            expect(getPrintMainMapId({
                maps: [{id: 'map0'}, {id: 'map1'}]
            })).to.be.eq('map0')
        })
    })

    describe('getPrintLayersParameters', function () {

        it('Selected base layer and visible layers', function () {
            const state = getState('montpellier')
            expect(state.baseLayers.selectedBaseLayerName).to.be.eq('osm-stamen-toner')

            const params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params).to.be.deep.eq({
                'map0:LAYERS': 'osm-stamen-toner,Quartiers,publicbuildings,tramway,tramstop,edition_line',
                'map0:STYLES': 'default,default,default,black,default,default',
                'map0:OPACITIES': '255,255,255,255,255,255',
            })

            // The parameters are prefixed with the map id
            expect(getPrintLayersParameters('map1', state.baseLayers.selectedBaseLayer, state.rootMapGroup))
                .to.have.all.keys('map1:LAYERS', 'map1:STYLES', 'map1:OPACITIES')
        })

        it('Change the selected base layer', function () {
            const state = getState('montpellier')

            state.baseLayers.selectedBaseLayerName = 'osm-mapnik'
            let params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params['map0:LAYERS']).to.be.eq('osm-mapnik,Quartiers,publicbuildings,tramway,tramstop,edition_line')

            // The empty base layer has no item state: no base layer is printed
            state.baseLayers.selectedBaseLayerName = 'empty'
            expect(state.baseLayers.selectedBaseLayer.hasItemState).to.be.false
            params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params).to.be.deep.eq({
                'map0:LAYERS': 'Quartiers,publicbuildings,tramway,tramstop,edition_line',
                'map0:STYLES': 'default,default,black,default,default',
                'map0:OPACITIES': '255,255,255,255,255',
            })

            // No selected base layer
            params = getPrintLayersParameters('map0', undefined, state.rootMapGroup)
            expect(params['map0:LAYERS']).to.be.eq('Quartiers,publicbuildings,tramway,tramstop,edition_line')
        })

        it('Base layers with item state', function () {
            const state = getState('backgrounds')
            expect(state.baseLayers.selectedBaseLayerName).to.be.eq('Stamen Watercolor')

            let params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params).to.be.deep.eq({
                'map0:LAYERS': 'Stamen_Watercolor',
                'map0:STYLES': 'default',
                'map0:OPACITIES': '255',
            })

            state.baseLayers.selectedBaseLayerName = 'local vector layer'
            params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params['map0:LAYERS']).to.be.eq('vector_layer')

            // A group used as base layer has no style
            state.baseLayers.selectedBaseLayerName = 'group with sub'
            params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params).to.be.deep.eq({
                'map0:LAYERS': 'group_with_sub',
                'map0:STYLES': '',
                'map0:OPACITIES': '255',
            })
        })

        it('Layers visibility and opacity', function () {
            const state = getState('montpellier')

            const sousquartiers = state.rootMapGroup.getMapLayerByName('SousQuartiers')
            expect(sousquartiers.visibility).to.be.false
            sousquartiers.checked = true
            expect(sousquartiers.visibility).to.be.true

            const quartiers = state.rootMapGroup.getMapLayerByName('Quartiers')
            quartiers.checked = false
            expect(quartiers.visibility).to.be.false

            const tramway = state.rootMapGroup.getMapLayerByName('tramway')
            tramway.opacity = 0.6

            const params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params).to.be.deep.eq({
                'map0:LAYERS': 'osm-stamen-toner,SousQuartiers,publicbuildings,tramway,tramstop,edition_line',
                'map0:STYLES': 'default,default,default,black,default,default',
                'map0:OPACITIES': '255,255,255,153,255,255',
            })
        })

        it('Selection and filter tokens', function () {
            const state = getState('montpellier')

            const quartiers = state.rootMapGroup.getMapLayerByName('Quartiers')
            quartiers.itemState.selectionToken = {
                selectedFeatures: ['1'],
                token: 'selection-token-for-quartiers'
            }
            quartiers.itemState.filterToken = {
                expressionFilter: '"QUARTIER" = 1',
                token: 'filter-token-for-quartiers'
            }

            const params = getPrintLayersParameters('map0', state.baseLayers.selectedBaseLayer, state.rootMapGroup)
            expect(params).to.be.deep.eq({
                'map0:LAYERS': 'osm-stamen-toner,Quartiers,publicbuildings,tramway,tramstop,edition_line',
                'map0:STYLES': 'default,default,default,black,default,default',
                'map0:OPACITIES': '255,255,255,255,255,255',
                'SELECTIONTOKEN': 'selection-token-for-quartiers',
                'FILTERTOKEN': 'filter-token-for-quartiers',
            })
        })
    })
})
