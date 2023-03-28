import { mainLizmap, mainEventDispatcher } from '../../modules/Globals.js';
import { html, render } from 'lit-html';

import '../../images/svg/mActionEditPaste.svg';

/**
 * Webcomponent used to reverse vertices order for a modified feature
 * @extends HTMLElement
 */
export default class pasteGeom extends HTMLElement {
    constructor() {
        super();
    }

    _paste(){
        if(!confirm(lizDict['edition.confirm.paste'])){
            return;
        }

        const feature = mainLizmap?.featureStorage?.get()?.[0];
        if(feature){
            const pointsArray = [];
            const coordinates = feature.getGeometry().getCoordinates();
            for (const [x, y] of coordinates) {
                pointsArray.push(new OpenLayers.Geometry.Point(x, y));
            }
            const lineString = new OpenLayers.Geometry.LineString(pointsArray);
            if(mainLizmap.edition?.drawControl){
                mainLizmap.edition.drawControl.layer.addFeatures([new OpenLayers.Feature.Vector(lineString)])
            } else if (mainLizmap.edition.modifyFeatureControl.active){
                mainLizmap.edition.modifyFeatureControl.layer.destroyFeatures();
                mainLizmap.edition.modifyFeatureControl.layer.addFeatures([new OpenLayers.Feature.Vector(lineString)]);
            }
        }
    }

    connectedCallback() {
        this._template = () => 
        html`
        <button class='btn btn-small' data-original-title='${lizDict['edition.geom.paste']}' ?disabled=${!mainLizmap.featureStorage.get().length} @click=${() => this._paste()}>
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
    }

    disconnectedCallback() {}
}
