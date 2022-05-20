import {mainLizmap, mainEventDispatcher} from '../modules/Globals.js';
import {html, render} from 'lit-html';

export default class Metadata extends HTMLElement {
    constructor() {
        super();

        this._name = this.getAttribute('name');
    }

    connectedCallback() {
        // Display
        this._template = () => html`
            <div class="sub-metadata">
                <h3> <span class="title"> <span class="icon"></span> <span class="text">${lizDict['layer.metadata.title']}</span> </span></h3>
                <div class="menu-content">
                    <dl>
                        <dt>${lizDict['layer.metadata.layer.name']}</dt>
                        <dd>Pas de fond de carte</dd>

                        <dt>${lizDict['layer.metadata.layer.type']}</dt>
                        <dd>Couche</dd>

                        <dt>${lizDict['layer.metadata.zoomToExtent.title']}</dt>
                        <dd><button class="btn btn-mini layerActionZoom" title="${lizDict['layer.metadata.zoomToExtent.title']}" value="emptyBaselayer"><i class="icon-zoom-in"></i></button></dd>

                        <dt>${lizDict['layer.metadata.style.title']}</dt>
                        <dd>
                            <select @change=${(event) => { this.style = event.target.value }} >
                                ${this.styles.map((style) => html`<option ?selected="${this.style === style}" value="${style}">${style}</option>`)}
                            </select>
                        </dd>

                        <dt>${lizDict['layer.metadata.opacity.title']}</dt>
                        <dd>
                            ${[20,40,60,80,100].map(opacity => 
                                html`<button value="${opacity / 100}" class="btn btn-mini btn-opacity-layer ${this.opacity === opacity / 100 ? 'active' : ''}" @click=${(event) => this.opacity = event.target.value}>${opacity}</button>`)}
                        </dd>
                    </dl>
                </div>
            </div>`;

        render(this._template(), this);

        mainEventDispatcher.addListener(
            () => {
                render(this._template(), this);
            }, ['baseLayers.changed']
        );

    }

    disconnectedCallback() {
        mainEventDispatcher.removeListener(
            () => {
                render(this._template(), this);
            }, ['baseLayers.changed']
        );
    }

    get layer(){
        for (const layer of mainLizmap.baseLayersMap.getAllLayers()) {
            if(layer.get('name') === this._name){
                return layer;
            }
        }
        return null;
    }

    get styles(){
        return mainLizmap.config.layers[this._name]?.styles;
    }

    get opacity(){
        return this.layer.getOpacity();
    }

    set opacity(opacity){
        this.layer.setOpacity(parseFloat(opacity));
    }

    get style(){
        return this.layer.getSource().getParams().STYLES;
    }
    
    set style(style){
        this.layer.getSource().updateParams({STYLES: style});
    }
}
