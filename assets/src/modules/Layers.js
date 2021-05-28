import { mainLizmap } from './Globals.js';

import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';

import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';

export default class Layers {

    constructor() {}

    /**
     * Add a vector layer from a WKT.
     * @param {string} wkt WKT in EPSG:4326 projection
     * @memberof Layers
     */
    addLayerFromWKT(wkt){
        const format = new WKT();
        const feature = format.readFeature(wkt, {
            dataProjection: 'EPSG:4326',
            featureProjection: mainLizmap.projection,
        });

        const vector = new VectorLayer({
            source: new VectorSource({
                features: [feature],
            }),
        });

        mainLizmap.map._olMap.addLayer(vector);

        return vector;
    }

    /**
     * Add a vector layer from a GeoJSON.
     * @param {ArrayBuffer|Document|Element|Object|string} geojson geojson in EPSG:4326 projection
     * @memberof Layers
     */
    addLayerFromGeoJSON(geojson) {
        const vector = new VectorLayer({
            source: new VectorSource({
                features: new GeoJSON().readFeatures(geojson, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: mainLizmap.projection
                }),
            }),
        });

        mainLizmap.map._olMap.addLayer(vector);

        return vector;
    }

    /**
     * Removes the given layer from the map.
     * @param {import("ol/layer/Base").default} layer OL layer to remove
     * @memberof Layers
     */
    removeLayer(layer){
        for (const _layer of mainLizmap.map._olMap.getLayers().getArray()) {
            if (_layer === layer) {
                mainLizmap.map._olMap.removeLayer(layer);
            }
        }
    }
}
