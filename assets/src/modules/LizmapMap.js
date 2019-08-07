import { INCHTOMM, MainEventDispatcher } from "./LizmapGlobals";
import LizmapLayerGroup from "./LizmapLayerGroup";
import LizmapLayer from "./LizmapLayer";

export default class LizmapMap {

    constructor(mapId, repository, project) {
        this._mapId = mapId;
        this._repositoryName = repository;
        this._projectName = project;

        this._zoom;
        this._minResolution;
        this._maxResolution;

        // FIXME : Set with LizmapOlMapElement.js.
        // Is it possible to set them directly in this class ?
        this._minZoom;
        this._maxZoom;
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
            if (option === 'osmMapnik') {
                baseLayers.push(new LizmapLayer(option, 'OSM', config.options.startupBaselayer === "osm-mapnik"));
            }
            if (option === 'osmStamenToner') {
                baseLayers.push(new LizmapLayer(option, 'OSM Toner', config.options.startupBaselayer === "osm-stamen-toner"));
            }
        }

        this._baseLayerGroup = new LizmapLayerGroup(this._mapId, baseLayers, { mutuallyExclusive: true });

        MainEventDispatcher.dispatch({
            type: "map-base-layers-loaded",
            mapId: this._mapId,
            baseLayerGroup: this._baseLayerGroup
        });

        if (config.options.hasOwnProperty('minScale') && config.options.hasOwnProperty('maxScale')) {
            this._minResolution = config.options.minScale * INCHTOMM / (1000 * 90 * window.devicePixelRatio);
            this._maxResolution = config.options.maxScale * INCHTOMM / (1000 * 90 * window.devicePixelRatio);

            MainEventDispatcher.dispatch({
                type: "map-min-max-resolution-set",
                mapId: this._mapId,
                minResolution: this._minResolution,
                maxResolution: this._maxResolution
            });
        }
    }

    get zoom() {
        return this._zoom;
    }

    set zoom(zoom) {
        // Avoid infinite loop
        if (this._zoom !== zoom) {
            this._zoom = zoom;

            MainEventDispatcher.dispatch({
                type: "map-zoom-set",
                mapId: this._mapId,
                zoom: this.zoom
            });
        }
    }

    /**
     * @param {Integer} minZoom
     */
    set minZoom(minZoom) {
        this._minZoom = minZoom;

        MainEventDispatcher.dispatch({
            type: "map-min-zoom-set",
            mapId: this._mapId,
            minZoom: this._minZoom
        });
    }

    /**
     * @param {Integer} maxZoom
     */
    set maxZoom(maxZoom) {
        this._maxZoom = maxZoom;

        MainEventDispatcher.dispatch({
            type: "map-max-zoom-set",
            mapId: this._mapId,
            maxZoom: this._maxZoom
        });
    }

    get baseLayerGroup() {
        return this._baseLayerGroup;
    }

    zoomIn() {
        if (this.zoom < this._maxZoom) {
            this.zoom = this.zoom + 1;
        }
    }

    zoomOut() {
        if (this.zoom > this._minZoom) {
            this.zoom = this.zoom - 1;
        }
    }
}
