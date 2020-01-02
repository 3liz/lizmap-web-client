import Geolocation from '../modules/Geolocation.js';

export default class Lizmap {

    constructor() {

        lizMap.events.on({
            uicreated: () => {
                this._lizmap3 = lizMap;
            }
        });

        this.geolocation = new Geolocation();
    }

    addGeolocationLayer(){
        // TODO : change newGeolocation to geolocation after old code removed
        const geolocationLayer = new OpenLayers.Layer.Vector('newGeolocation');
        // Display position point
        geolocationLayer.addFeatures([
            new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(0,0),
                {},
                {
                    graphicName: 'circle',
                    strokeColor: '#0395D6',
                    strokeWidth: 1,
                    fillOpacity: 1,
                    fillColor: '#0395D6',
                    pointRadius: 3
                }
            ),
            // circle
        ]);
        this._lizmap3.map.addLayer(geolocationLayer);
    }

    moveGeolocationPoint(coordinates){
        const geolocationLayer = this._lizmap3.map.getLayersByName('newGeolocation')[0];
        const geolocationPoint = geolocationLayer.features[0];

        geolocationPoint.geometry.x = coordinates[0];
        geolocationPoint.geometry.y = coordinates[1];
        geolocationPoint.geometry.clearBounds();
        geolocationLayer.drawFeature(geolocationPoint);

        // geolocationLayer.destroyFeatures([geolocationPoint]);
        // geolocationLayer.addFeatures([
        //     new OpenLayers.Feature.Vector(
        //         new OpenLayers.Geometry.Point(coordinates[0], coordinates[1]),
        //         {},
        //         {
        //             graphicName: 'circle',
        //             strokeColor: '#0395D6',
        //             strokeWidth: 100,
        //             fillOpacity: 1,
        //             fillColor: '#0395D6',
        //             pointRadius: 300
        //         }
        //     )
        // ]);
        // geolocationPoint.move(geolocationPoint.geometry.x + coordinates[0], geolocationPoint.geometry.y + coordinates[1]);
    }

    get projection(){
        return this._lizmap3.map.getProjection();
    }

    /**
     * @param {Array} coordinates
     */
    set center(coordinates){
        this._lizmap3.map.setCenter(coordinates);
    }

    /**
     * @param {Array} coordinates
     */
    set extent(coordinates) {
        this._lizmap3.map.zoomToExtent(coordinates);
    }
}
