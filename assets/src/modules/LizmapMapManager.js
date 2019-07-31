import LizmapMap from './LizmapMap';

/**
 *
 * @param {String} repository
 * @param {String} project
 * @returns {Promise}
 */
async function loadMapConfig(configURL, repository, project) {
    // http request to retrieve the "config"
    const config = await fetch(configURL + '?repository=' + repository + '&project=' + project)
        .then((resp) => resp.json());

    return config;
}

const maps = {};

const LizmapMapManager = {

    createMap: async function (mapId, configURL, repository, project) {
        if (mapId in maps) {
            return maps[mapId];
        }

        let config = await loadMapConfig(configURL, repository, project);
        maps[mapId] = new LizmapMap(mapId, repository, project);
        maps[mapId].setConfig(config);
        return maps[mapId];
    },

    getMap: function (mapId) {
        if (mapId in maps) {
            return maps[mapId];
        }
    }
};

export { LizmapMapManager as default };

