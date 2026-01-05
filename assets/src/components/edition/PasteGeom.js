/**
 * @module components/edition/PasteGeom.js
 * @name PasteGeom
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../../modules/Globals.js';
import { html, render } from 'lit-html';

import '../../images/svg/mActionEditPaste.svg';

/**
 * Web component used to paste a geometry
 * @class
 * @name pasteGeom
 * @augments HTMLElement
 */
export default class pasteGeom extends HTMLElement {
    constructor() {
        super();
    }

    _paste(){
        if(!confirm(lizDict['edition.confirm.paste'])){
            return;
        }

        const storedData = mainLizmap?.featureStorage?.get();
        const features = storedData?.features;

        if(!features || features.length === 0){
            lizMap.addMessage(lizDict['edition.error.noGeometryToPaste'] || 'No geometry available to paste', 'error', true);
            return;
        }

        const feature = features[0];
        const geometry = feature.getGeometry();

        // Convert OL6 geometry to OL2 format
        const ol2Geometry = this._convertToOL2Geometry(geometry);

        if(!ol2Geometry){
            lizMap.addMessage(lizDict['edition.error.incompatibleGeometry'] || 'Incompatible geometry type', 'error', true);
            return;
        }

        // Add to appropriate layer
        if(mainLizmap.edition?.drawControl){
            mainLizmap.edition.drawControl.layer.removeAllFeatures();
            mainLizmap.edition.drawControl.layer.addFeatures([new OpenLayers.Feature.Vector(ol2Geometry)]);
        } else if (mainLizmap.edition.modifyFeatureControl.active){
            mainLizmap.edition.modifyFeatureControl.layer.destroyFeatures();
            mainLizmap.edition.modifyFeatureControl.layer.addFeatures([new OpenLayers.Feature.Vector(ol2Geometry)]);
        }

        // Update geometry field in form
        if(mainLizmap.edition.updateGeometryColumnFromFeature){
            mainLizmap.edition.updateGeometryColumnFromFeature(new OpenLayers.Feature.Vector(ol2Geometry));
        }

        // Visual feedback
        lizMap.addMessage(lizDict['edition.geom.pasted'] || 'Geometry pasted successfully', 'info', true);
    }

    /**
     * Convert OL6 geometry to OL2 format
     * @param {object} olGeometry - OpenLayers 6 geometry
     * @returns {OpenLayers.Geometry} OpenLayers 2 geometry
     */
    _convertToOL2Geometry(olGeometry){
        const geomType = olGeometry.getType();
        const coords = olGeometry.getCoordinates();

        switch(geomType){
            case 'Point':
                return new OpenLayers.Geometry.Point(coords[0], coords[1]);

            case 'LineString': {
                const linePoints = coords.map(c =>
                    new OpenLayers.Geometry.Point(c[0], c[1])
                );
                return new OpenLayers.Geometry.LineString(linePoints);
            }

            case 'Polygon': {
                const rings = coords.map(ring => {
                    const ringPoints = ring.map(c =>
                        new OpenLayers.Geometry.Point(c[0], c[1])
                    );
                    return new OpenLayers.Geometry.LinearRing(ringPoints);
                });
                return new OpenLayers.Geometry.Polygon(rings);
            }

            case 'MultiPoint': {
                const points = coords.map(c =>
                    new OpenLayers.Geometry.Point(c[0], c[1])
                );
                return new OpenLayers.Geometry.MultiPoint(points);
            }

            case 'MultiLineString': {
                const lines = coords.map(line => {
                    const linePoints = line.map(c =>
                        new OpenLayers.Geometry.Point(c[0], c[1])
                    );
                    return new OpenLayers.Geometry.LineString(linePoints);
                });
                return new OpenLayers.Geometry.MultiLineString(lines);
            }

            case 'MultiPolygon': {
                const polygons = coords.map(poly => {
                    const rings = poly.map(ring => {
                        const ringPoints = ring.map(c =>
                            new OpenLayers.Geometry.Point(c[0], c[1])
                        );
                        return new OpenLayers.Geometry.LinearRing(ringPoints);
                    });
                    return new OpenLayers.Geometry.Polygon(rings);
                });
                return new OpenLayers.Geometry.MultiPolygon(polygons);
            }

            default:
                console.error('Unsupported geometry type:', geomType);
                return null;
        }
    }

    connectedCallback() {
        this._template = () =>
            html`
        <button class='btn btn-sm' data-bs-toggle="tooltip" data-bs-title='${lizDict['edition.geom.paste']}' ?disabled=${!mainLizmap.featureStorage.hasFeatures()} @click=${() => this._paste()}>
            <svg>
                <use xlink:href="#mActionEditPaste"></use>
            </svg>
        </button>`;

        render(this._template(), this);

        // Add tooltip on buttons
        $('button', this).tooltip({
            placement: 'top'
        });

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'featureStorage.set'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'featureStorage.copy'
        );

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, 'featureStorage.clear'
        );
    }

    disconnectedCallback() {}
}
