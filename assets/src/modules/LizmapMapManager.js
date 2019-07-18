import LizmapMap from './LizmapMap';

/**
 *
 * @param {String} repository
 * @param {String} project
 * @returns {Promise}
 */
function loadMapConfig(repository, project) {
    // here create an http request to retrieve the "config"

    // dummy config
    let config = {
        baseLayers : {
            'osmMapnik' : {name: 'OSM', visible: false},
            'osmStamenToner': { name: 'OSM Toner', visible: true}
        }
    };
    return Promise.resolve(config);
}


const maps = {};

const LimapMapManager = {

    createMap : async function(mapId, repository, project) {
        if (mapId in maps) {
            return maps[mapId];
        }

        let config = await loadMapConfig(repository, project);
        maps[mapId] = new LizmapMap(mapId, repository, project);
        maps[mapId].setConfig(config);
        return maps[mapId];
    },

    getMap: function(mapId) {
        if (mapId in maps) {
            return maps[mapId];
        }
    }
};

export {LimapMapManager as default};

