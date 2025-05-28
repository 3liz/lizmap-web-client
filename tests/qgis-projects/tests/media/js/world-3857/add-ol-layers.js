/* eslint-disable no-unused-vars */
const addOlLayers = () => {
    const extGroupMapState = lizMap.mainLizmap.state.rootMapGroup.createExternalGroup('Test')
    const olLayer = new lizMap.ol.layer.Tile({
        source: new lizMap.ol.source.TileWMS({
            url: 'https://ahocevar.com/geoserver/gwc/service/wms',
            crossOrigin: '',
            params: {
                'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
                'TILED': true,
                'VERSION': '1.1.1',
            },
            projection: 'EPSG:4326',
            // Source tile grid (before reprojection)
            tileGrid: lizMap.ol.tilegrid.createXYZ({
                extent: [-180, -90, 180, 90],
                maxResolution: 360 / 512,
                maxZoom: 10,
            }),
            // Accept a reprojection error of 2 pixels
            reprojectionErrorThreshold: 2,
        }),
    });

    extGroupMapState.addOlLayer('wms4326', olLayer);

    const olLayer2 = new lizMap.ol.layer.Image({
        extent: [-13884991, 2870341, -7455066, 6338219],
        source: new lizMap.ol.source.ImageWMS({
            url: 'https://ahocevar.com/geoserver/wms',
            params: {'LAYERS': 'topp:states'},
            ratio: 1,
            serverType: 'geoserver',
        }),
    });
    extGroupMapState.addOlLayer('states', olLayer2);

    const olLayer3 = new lizMap.ol.layer.VectorTile({
        source: new lizMap.ol.source.OGCVectorTile({
            url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_countries/tiles/WebMercatorQuad',
            format: new lizMap.ol.format.MVT(),
        }),
        background: '#d1d1d1',
        style: {
            'stroke-width': 0.6,
            'stroke-color': '#8c8b8b',
            'fill-color': '#f7f7e9',
        },
    });
    extGroupMapState.addOlLayer('VectorTile', olLayer3);
    return true;
}
const removeOlLayers = () => {
    const extGroupMapState = lizMap.mainLizmap.state.rootMapGroup.children[0];
    extGroupMapState.clean();
    return true;
}
