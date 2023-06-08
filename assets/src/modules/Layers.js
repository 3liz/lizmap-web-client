import { mainLizmap } from './Globals.js';

import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';

import WKT from 'ol/format/WKT.js';
import GeoJSON from 'ol/format/GeoJSON.js';

export default class Layers {

    constructor() {}

    /**
     * Add a vector layer from a WKT.
     * @param {string} wkt WKT in EPSG:4326 projection
     * @param {string} dataProjection
     * @param {StyleLike | null} style Layer style
     * @memberof Layers
     */
    addLayerFromWKT(wkt, dataProjection = 'EPSG:4326', style){
        const format = new WKT();
        const feature = format.readFeature(wkt, {
            dataProjection: dataProjection,
            featureProjection: mainLizmap.projection,
        });

        const vector = new VectorLayer({
            source: new VectorSource({
                features: [feature],
            }),
            style: style,
        });

        mainLizmap.map.addLayer(vector);

        return vector;
    }

    /**
     * Add a vector layer from a GeoJSON.
     * @param {ArrayBuffer|Document|Element|Object|string} geojson geojson in EPSG:4326 projection
     * @param {string} dataProjection
     * @param {StyleLike | null} style Layer style
     * @memberof Layers
     */
    addLayerFromGeoJSON(geojson, dataProjection = 'EPSG:4326', style) {
        const vector = new VectorLayer({
            source: new VectorSource({
                features: new GeoJSON().readFeatures(geojson, {
                    dataProjection: dataProjection,
                    featureProjection: mainLizmap.projection
                }),
            }),
            style: style,
        });

        mainLizmap.map.addLayer(vector);

        return vector;
    }

    /**
     * Removes the given layer from the map.
     * @param {import("ol/layer/Base").default} layer OL layer to remove
     * @memberof Layers
     */
    removeLayer(layer){
        for (const _layer of mainLizmap.map.getLayers().getArray()) {
            if (_layer === layer) {
                mainLizmap.map.removeLayer(layer);
            }
        }
    }
}
