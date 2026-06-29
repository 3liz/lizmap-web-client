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
import CircleStyle from 'ol/style/Circle.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';

/** Default Panoramax instance used when `panoramaxUrl` is not set in the config */
const DEFAULT_PANORAMAX_URL = 'https://panoramax.openstreetmap.fr/api';

/** Default (classic) colour for the coverage layer — matches COLORS.BASE on panoramax.openstreetmap.fr */
const PNX_COLOR = '#FF6F00';

/** Colour applied to the selected sequence — matches COLORS.SELECTED on panoramax.openstreetmap.fr */
const PNX_SELECTED_COLOR = '#1E88E5';

/**
 * Date-based palette for the coverage layer (matches panoramax.openstreetmap.fr colours).
 * Index: 0 = > 2 years (oldest), 1 = < 2 years, 2 = < 1 year, 3 = < 1 month (newest),
 *        4 = no date field (BASE colour).
 */
export const PNX_DATE_PALETTE = ['#fecc5c', '#fd8d3c', '#f03b20', '#bd0026', '#FF6F00'];

/**
 * Arrow icon pointing to the North (heading 0). Rotated clockwise to match the
 * heading (in radians) reported by the Panoramax photo viewer.
 */
const ARROW_SVG = 'data:image/svg+xml,'
    + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='48' height='48'%3E"
    + "%3Cpath d='M24 3 41 43 24 33 7 43Z' fill='%231700e2' stroke='%23ffffff' stroke-width='2.5' stroke-linejoin='round'/%3E"
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

        // Date-range filter state (null = no filter).
        // - sequences layer uses the `date` field ("YYYY-MM-DD")
        // - pictures  layer uses the `ts`   field ("YYYY-MM-DDTHH:mm:ss")
        this._filterStart = null;
        this._filterEnd = null;
        // `ts` includes time, so the max comparison uses end+1 day to include
        // all pictures taken on the end day (mirrors Panoramax's own logic).
        this._filterEndPlusOne = null;
        // Picture type filter ("flat" | "equirectangular" | null = no filter).
        this._filterType = null;
        // Account filter (UUID string | null = no filter).
        this._filterAccount = null;

        // STAC API base URL and the derived MVT tiles URL
        this._url = (options.panoramaxUrl || DEFAULT_PANORAMAX_URL).replace(/\/+$/, '');
        const tilesUrl = this._url + '/map/{z}/{x}/{y}.mvt';

        // Cached styles for the coverage layer (created once, reused every frame).
        this._pointStyle = new Style({
            image: new CircleStyle({
                radius: 4,
                fill: new Fill({ color: PNX_COLOR }),
                stroke: new Stroke({ color: '#ffffff', width: 1 }),
            }),
        });
        this._lineStyle = new Style({
            stroke: new Stroke({ color: PNX_COLOR, width: 3 }),
        });

        // Date-based styles (one per palette entry, for points and lines).
        this._datePointStyles = PNX_DATE_PALETTE.map(color => new Style({
            image: new CircleStyle({
                radius: 4,
                fill: new Fill({ color }),
                stroke: new Stroke({ color: '#ffffff', width: 1 }),
            }),
        }));
        this._dateLineStyles = PNX_DATE_PALETTE.map(color => new Style({
            stroke: new Stroke({ color, width: 3 }),
        }));

        // Selected sequence style (applied on top of any theme).
        this._selectedPointStyle = new Style({
            image: new CircleStyle({
                radius: 4,
                fill: new Fill({ color: PNX_SELECTED_COLOR }),
                stroke: new Stroke({ color: '#ffffff', width: 1 }),
            }),
        });
        this._selectedLineStyle = new Style({
            stroke: new Stroke({ color: PNX_SELECTED_COLOR, width: 3 }),
        });

        // Currently selected sequence UUID (null = none).
        this._selectedSeqId = null;

        // Current style mode ('classic' | 'date') and cached ISO date boundaries.
        this._styleMode = 'classic';
        this._dateBoundary1month = null;
        this._dateBoundary1year  = null;
        this._dateBoundary2years = null;

        // Panoramax coverage layer (MVT). The tiles are served in EPSG:3857 and
        // reprojected by OpenLayers to the current map view projection if needed.
        this._olLayer = new VectorTileLayer({
            declutter: true,
            source: new VectorTileSource({
                format: new MVT(),
                projection: 'EPSG:3857',
                url: tilesUrl,
            }),
            style: (feature) => {
                const isPoint = feature.getType() === 'Point' || feature.getType() === 'MultiPoint';
                // Apply date filter when at least one bound is set.
                if (this._filterStart || this._filterEnd) {
                    // sequences → `date` ("YYYY-MM-DD"), pictures → `ts` ("YYYY-MM-DDTHH:mm:ss")
                    const dateStr = isPoint ? feature.get('ts') : feature.get('date');
                    if (dateStr) {
                        if (this._filterStart && dateStr < this._filterStart) {
                            return null;
                        }
                        if (this._filterEnd) {
                            const maxComp = isPoint ? this._filterEndPlusOne : this._filterEnd;
                            if (dateStr > maxComp) {
                                return null;
                            }
                        }
                    }
                }
                if (this._filterType) {
                    const t = feature.get('type');
                    if (t && t !== this._filterType) {
                        return null;
                    }
                }
                if (this._filterAccount) {
                    if (feature.get('account_id') !== this._filterAccount) {
                        return null;
                    }
                }
                if (this._selectedSeqId && this._belongsToSelectedSeq(feature, isPoint)) {
                    return isPoint ? this._selectedPointStyle : this._selectedLineStyle;
                }
                if (this._styleMode === 'date') {
                    const dateStr = isPoint ? feature.get('ts') : feature.get('date');
                    const idx = this._getDateColorIndex(dateStr);
                    return isPoint ? this._datePointStyles[idx] : this._dateLineStyles[idx];
                }
                return isPoint ? this._pointStyle : this._lineStyle;
            },
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
     * Deactivate the tool: hide the coverage layer, stop handling map clicks and hide the arrow.
     */
    deactivate() {
        this._active = false;
        this._olLayerState.checked = false;
        this._selectedSeqId = null;
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
        let seqId;

        if (type === 'Point' || type === 'MultiPoint') {
            // A picture point: load it directly by its id
            picId = props.id ?? props.picture_id ?? props.pic_id ?? fid ?? null;
            seqId = props.sequence_id ?? props.seq_id ?? null;
            if (!seqId && props.sequences) {
                let sequences = props.sequences;
                // MVT RenderFeature serializes JS arrays as JSON strings (e.g. '["uuid1"]').
                if (typeof sequences === 'string' && sequences.trimStart().startsWith('[')) {
                    try { sequences = JSON.parse(sequences); } catch { sequences = []; }
                }
                seqId = Array.isArray(sequences)
                    ? (sequences[0] ?? null)
                    : (String(sequences) || null);
            }
        } else {
            // A sequence line: its feature id is the sequence UUID.
            seqId = fid ?? props.id ?? null;
        }

        // Highlight the clicked sequence immediately (the viewer will confirm the
        // exact seq id via setSelectedSequence() once the picture is loaded).
        if (seqId !== this._selectedSeqId) {
            this._selectedSeqId = seqId;
            this._olLayer.changed();
        }

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

    /**
     * Filter the coverage layer to only show pictures/sequences in a date range.
     * Either bound can be null to leave that side open.
     * @param {string|null} startDate - ISO date string "YYYY-MM-DD", or null
     * @param {string|null} endDate   - ISO date string "YYYY-MM-DD", or null
     */
    setDateFilter(startDate, endDate) {
        this._filterStart = startDate || null;
        this._filterEnd = endDate || null;

        if (endDate) {
            // Advance by one day so that pictures with a timestamp on `endDate`
            // (e.g. "2024-03-15T14:30:00") are included in the result.
            const d = new Date(endDate);
            d.setDate(d.getDate() + 1);
            this._filterEndPlusOne = d.toISOString().split('T')[0];
        } else {
            this._filterEndPlusOne = null;
        }

        // Mark the layer dirty so the style function is re-evaluated on the next
        // render frame. The tiles themselves remain cached (no network requests).
        this._olLayer.changed();
    }

    /**
     * Filter the coverage layer to only show features of a given type.
     * @param {string|null} type - "flat", "equirectangular", or null (no filter)
     */
    setTypeFilter(type) {
        this._filterType = type || null;
        this._olLayer.changed();
    }

    /**
     * Filter the coverage layer to only show features belonging to a given account.
     * @param {string|null} accountId - account UUID, or null (no filter)
     */
    setAccountFilter(accountId) {
        this._filterAccount = accountId || null;
        this._olLayer.changed();
    }

    /**
     * Highlight the given sequence on the coverage layer (blue, matching
     * COLORS.SELECTED on panoramax.openstreetmap.fr).  Called by the component
     * whenever the viewer loads a picture so the map stays in sync.
     * @param {string|null} seqId - sequence UUID, or null to clear the selection
     */
    setSelectedSequence(seqId) {
        const next = seqId || null;
        if (next === this._selectedSeqId) { return; }
        this._selectedSeqId = next;
        this._olLayer.changed();
    }

    /**
     * Return true if `feature` belongs to the currently selected sequence.
     * Works for both sequence lines (id === seqId) and picture points (sequences
     * array contains seqId).
     * @param {object} feature
     * @param {boolean} isPoint
     * @returns {boolean}
     */
    _belongsToSelectedSeq(feature, isPoint) {
        if (!this._selectedSeqId) { return false; }
        if (!isPoint) {
            return feature.getId() === this._selectedSeqId
                || feature.get('id') === this._selectedSeqId;
        }
        let sequences = feature.get('sequences');
        if (!sequences) { return false; }
        if (typeof sequences === 'string') {
            if (sequences.trimStart().startsWith('[')) {
                try { sequences = JSON.parse(sequences); } catch { return false; }
            } else {
                return sequences === this._selectedSeqId;
            }
        }
        return Array.isArray(sequences) && sequences.includes(this._selectedSeqId);
    }

    /**
     * Switch the coverage layer style between 'classic' (uniform brand colour) and
     * 'date' (colour-coded by capture date, matching panoramax.openstreetmap.fr).
     * @param {string} mode - 'classic' or 'date'
     */
    setStyleMode(mode) {
        this._styleMode = (mode === 'date') ? 'date' : 'classic';
        if (this._styleMode === 'date') {
            const now = Date.now();
            this._dateBoundary1month  = new Date(now - 30  * 24 * 3600 * 1000).toISOString().slice(0, 10);
            this._dateBoundary1year   = new Date(now - 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);
            this._dateBoundary2years  = new Date(now - 730 * 24 * 3600 * 1000).toISOString().slice(0, 10);
        }
        this._olLayer.changed();
    }

    /**
     * Map a feature's date string to a PNX_DATE_PALETTE index.
     * @param {string|undefined} dateStr - ISO date/datetime string, or falsy
     * @returns {number} 0–4 (4 = no date)
     */
    _getDateColorIndex(dateStr) {
        if (!dateStr) { return 4; }
        if (dateStr >= this._dateBoundary1month)  { return 3; }
        if (dateStr >= this._dateBoundary1year)   { return 2; }
        if (dateStr >= this._dateBoundary2years)  { return 1; }
        return 0;
    }

    /**
     * Search for contributor accounts whose name matches the given query.
     * Hits the Panoramax `/users/search?q=` endpoint. Returns an empty array on error
     * or when the request is aborted.
     * @param {string} query - search term (at least 1 character)
     * @param {AbortSignal} [signal]
     * @returns {Promise<Array<{id: string, name: string}>>}
     */
    async searchAccounts(query, signal) {
        try {
            const url = `${this._url}/users/search?q=${encodeURIComponent(query)}`;
            const r = await fetch(url, { headers: { Accept: 'application/json' }, signal });
            const data = await r.json();
            const list = data.features || [];
            return list
                .map(u => ({ id: u.id, name: u.label || u.id }))
                .filter(u => u.name && u.id);
        } catch {
            return [];
        }
    }
}
