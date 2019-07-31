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
        MainEventDispatcher.dispatch({
             type: "map-config-loaded",
             mapId: this._mapId,
             config: this._config
            });

        let baseLayers = [];
        for (let option in config.options) {
            if(option === 'osmMapnik'){
                baseLayers.push(new LizmapLayer(option, 'OSM', config.options.startupBaselayer === "osm-mapnik"));
            }
            if(option === 'osmStamenToner'){
                baseLayers.push(new LizmapLayer(option, 'OSM Toner', config.options.startupBaselayer === "osm-stamen-toner"));
            }
        }

        this._baseLayerGroup = new LizmapLayerGroup(this._mapId, baseLayers, {mutuallyExclusive: true});

        MainEventDispatcher.dispatch({
            type: "map-base-layers-loaded",
            mapId: this._mapId,
            baseLayerGroup: this._baseLayerGroup
        });

    }

    get zoom () {
        return this._zoom;
    }

    get baseLayerGroup () {
        return this._baseLayerGroup;
    }
}