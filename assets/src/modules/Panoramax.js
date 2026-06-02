/**
 * @module modules/Panoramax.js
 * @name Panoramax
 * @copyright 2026 3Liz
 * @license MPL-2.0
 */
import { mainLizmap, mainEventDispatcher } from './Globals.js';
import { transform } from 'ol/proj.js';
import { Vector as VectorSource } from 'ol/source.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import MVT from 'ol/format/MVT.js';
import Feature from 'ol/Feature.js';
import Point from 'ol/geom/Point.js';
import Style from 'ol/style/Style.js';
import Icon from 'ol/style/Icon.js';

/** Default Panoramax instance used when `panoramaxUrl` is not set in the config */
const DEFAULT_PANORAMAX_URL = 'https://panoramax.openstreetmap.fr/api';

/**
 * Arrow icon pointing to the North (heading 0). Rotated clockwise to match the
 * heading (in radians) reported by the Panoramax photo viewer.
 */
const ARROW_SVG = 'data:image/svg+xml,'
    + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48' height='48'%3E"
    + "%3Cpath d='M24 3 41 43 24 33 7 43Z' fill='%23e2007a' stroke='%23ffffff' stroke-width='2.5' stroke-linejoin='round'/%3E"
    + '%3C/svg%3E';

/**
 * @class
 * @name Panoramax
 * @classdesc
 * Handle the map side of the Panoramax tool:
 * - the Panoramax MVT coverage layer (added to the layer tree as an external layer),
 * - the orientation arrow drawn on the map and kept in sync with the photo viewer,
 * - the detection of the clicked picture/sequence on the coverage layer.
 *
 * The UI side (the `<pnx-photo-viewer>` web component) lives in the
 * `components/Panoramax.js` custom element which drives this module.
 */
export default class Panoramax {

    /**
     * Create a Panoramax instance
     * @param {object} map     - OpenLayers map (mainLizmap.map)
     * @param {object} options - The Lizmap config options
     * @param {object} lizmap3 - The old lizmap object
     */
    constructor(map, options, lizmap3) {
        this._map = map;
        this._lizmap3 = lizmap3;
        this._active = false;

        // STAC API base URL and the derived MVT tiles URL
        this._url = (options.panoramaxUrl || DEFAULT_PANORAMAX_URL).replace(/\/+$/, '');
        const tilesUrl = this._url + '/map/{z}/{x}/{y}.mvt';

        // Panoramax coverage layer (MVT). The tiles are served in EPSG:3857 and
        // reprojected by OpenLayers to the current map view projection if needed.
        this._olLayer = new VectorTileLayer({
            declutter: true,
            source: new VectorTileSource({
                format: new MVT(),
                projection: 'EPSG:3857',
                url: tilesUrl,
            })
        });

        // Add the layer to the layer tree through an external group. This must be
        // done once and synchronously (createExternalGroup then addOlLayer in the
        // same tick) because the map wiring relies on the last added group/layer.
        const extGroup = mainLizmap.state.rootMapGroup.createExternalGroup('Panoramax');
        this._olLayerState = extGroup.addOlLayer('panoramax', this._olLayer);
        // Start hidden: the layer becomes visible when the tool is activated.
        this._olLayerState.checked = false;

        // Orientation arrow, kept on a dedicated tool layer above the map.
        this._arrowPoint = new Point([0, 0]);
        this._arrowFeature = new Feature({ geometry: this._arrowPoint });
        this._arrowIcon = new Icon({
            src: ARROW_SVG,
            rotation: 0,
            rotateWithView: true,
            anchor: [0.5, 0.5],
            scale: 0.7,
        });
        this._arrowFeature.setStyle(new Style({ image: this._arrowIcon }));
        this._arrowLayer = new VectorLayer({
            source: new VectorSource({ wrapX: false }),
        });
        this._arrowLayer.getSource().addFeature(this._arrowFeature);
        this._arrowLayer.setProperties({ name: 'LizmapPanoramaxArrowLayer' });
        this._arrowLayer.setVisible(false);
        map.addToolLayer(this._arrowLayer);

        // requestAnimationFrame coalescing for the (high frequency) heading updates
        this._pendingHeading = null;
        this._rafId = 0;

        // Detect clicks on the coverage layer (only when the tool is active)
        this._onMapClick = (evt) => this._handleClick(evt);
        this._map.on('singleclick', this._onMapClick);
    }

    /**
     * Whether the tool is currently active (dock open).
     * @type {boolean}
     */
    get active() {
        return this._active;
    }

    /**
     * Activate the tool: show the coverage layer and start handling map clicks.
     */
    activate() {
        this._active = true;
        this._olLayerState.checked = true;
    }

    /**
     * Deactivate the tool: stop handling map clicks and hide the arrow.
     * The coverage layer visibility is left under the user's control (layer tree).
     */
    deactivate() {
        this._active = false;
        this.clearArrow();
    }

    /**
     * Hide the orientation arrow and cancel any pending heading update.
     */
    clearArrow() {
        this._arrowLayer.setVisible(false);
        if (this._rafId) {
            window.cancelAnimationFrame(this._rafId);
            this._rafId = 0;
        }
        this._pendingHeading = null;
    }

    /**
     * Move the arrow to the picture location and orient it.
     * Called when a picture is loaded in the viewer.
     * @param {number} lon        - picture longitude (EPSG:4326)
     * @param {number} lat        - picture latitude (EPSG:4326)
     * @param {number} headingDeg - heading in degrees (0 = North, clockwise)
     */
    updateArrow(lon, lat, headingDeg) {
        if (typeof lon !== 'number' || typeof lat !== 'number' || isNaN(lon) || isNaN(lat)) {
            return;
        }
        const xy = transform([lon, lat], 'EPSG:4326', this._map.getView().getProjection());
        this._arrowPoint.setCoordinates(xy);
        if (typeof headingDeg === 'number' && !isNaN(headingDeg)) {
            this._arrowIcon.setRotation(headingDeg * Math.PI / 180);
        }
        this._arrowFeature.changed();
        this._arrowLayer.setVisible(true);
    }

    /**
     * Update only the arrow heading (when the user rotates the view in the photo
     * viewer). Updates are coalesced with requestAnimationFrame to avoid stutter.
     * @param {number} headingDeg - heading in degrees (0 = North, clockwise)
     */
    updateHeading(headingDeg) {
        if (typeof headingDeg !== 'number' || isNaN(headingDeg)) {
            return;
        }
        this._pendingHeading = headingDeg;
        if (this._rafId) {
            return;
        }
        this._rafId = window.requestAnimationFrame(() => {
            this._rafId = 0;
            if (this._pendingHeading === null) {
                return;
            }
            this._arrowIcon.setRotation(this._pendingHeading * Math.PI / 180);
            this._arrowFeature.changed();
            this._pendingHeading = null;
        });
    }

    /**
     * Handle a click on the map: if a Panoramax feature is hit, ask the viewer to
     * load the corresponding picture (by id) or the nearest one (by position).
     * @param {object} evt - OpenLayers map browser event
     */
    _handleClick(evt) {
        if (!this._active) {
            return;
        }
        const feature = this._map.forEachFeatureAtPixel(
            evt.pixel,
            (f) => f,
            {
                layerFilter: (layer) => layer === this._olLayer,
                hitTolerance: 5,
            }
        );
        if (!feature) {
            return;
        }

        const props = feature.getProperties();
        const fid = feature.getId();
        const type = feature.getType();
        let picId = null;
        let seqId = null;

        if (type === 'Point' || type === 'MultiPoint') {
            // A picture point: load it directly by its id
            picId = props.id ?? props.picture_id ?? props.pic_id ?? fid ?? null;
            seqId = props.sequence_id ?? props.seq_id ?? null;
            if (!seqId && props.sequences) {
                seqId = Array.isArray(props.sequences)
                    ? props.sequences[0]
                    : String(props.sequences).split(',')[0];
            }
        }
        // A sequence line (no precise picture id) falls through to the
        // position-based loading below.

        if (picId) {
            mainEventDispatcher.dispatch({
                type: 'panoramax.picture.selected',
                seqId: seqId || null,
                picId: picId,
            });
        } else {
            // No precise picture id (e.g. a sequence line at low zoom): load the
            // picture closest to the clicked position.
            const lonlat = transform(evt.coordinate, this._map.getView().getProjection(), 'EPSG:4326');
            mainEventDispatcher.dispatch({
                type: 'panoramax.position.selected',
                lon: lonlat[0],
                lat: lonlat[1],
            });
        }
    }
}
