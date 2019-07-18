import {MainEventDispatcher} from "./LizmapGlobals";
import LizmapLayerGroup from "./LizmapLayerGroup";
import LizmapLayer from "./LizmapLayer";

export default class LizmapMap {

    constructor (mapId, repository, project) {
        this._mapId = mapId;
        this._repositoryName = repository;
        this._projectName = project;
    }

    setConfig(config) {
        this._config = config;
        MainEventDispatcher.dispatch({ type: "map-config-loaded", mapId: this._mapId});

        let baseLayers = [];
        for (let layerId in  config.baseLayers) {
            let layerConf = config.baseLayers[layerId];
            baseLayers.push(new LizmapLayer(layerId, layerConf.name, layerConf.visible));
        }

        this._baseLayerGroup = new LizmapLayerGroup(this._mapId, baseLayers, {mutuallyExclusive: true});

        MainEventDispatcher.dispatch({
            type: "map-base-layers-loaded",
            mapId: this._mapId,
            baseLayerGroup: this._baseLayerGroup
        });
    }

    get baseLayerGroup () {
        return this._baseLayerGroup;
    }
}