import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

export default class Permalink {

    constructor() {

        // Change `checked`, `style` states based on URL fragment
        if (window.location.hash) {
            this._runPermalink();
        }

        window.addEventListener(
            "hashchange", this._runPermalink
        );

        this._refreshURLsInPermalinkComponent();

        // Handle events on permalink component
        const btnPermalinkClear = document.querySelector('.btn-permalink-clear');

        if (btnPermalinkClear) {
            btnPermalinkClear.addEventListener('click', () => document.getElementById('button-permaLink').click());
        }

        const selectEmbedPermalink = document.getElementById('select-embed-permalink');

        if (selectEmbedPermalink) {
            selectEmbedPermalink.addEventListener('change', event => {
                document.getElementById('span-embed-personalized-permalink').classList.toggle('hide', event.target.value !== 'p')
                this._refreshURLsInPermalinkComponent();
            });
        }

        document.querySelectorAll('#input-embed-width-permalink, #input-embed-height-permalink').forEach(input => 
            input.addEventListener('input', this._refreshURLsInPermalinkComponent)
        );

        // Refresh bbox parameter on moveend
        lizMap.map.events.on({
            moveend: () => {
                this._writeURLFragment();
            }
        });

        mainLizmap.state.rootMapGroup.addListener(
            () => this._writeURLFragment(),
            ['layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'group.style.changed', 'layer.opacity.changed', 'group.opacity.changed']
        );
    }

    _runPermalink() {
        const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(mainLizmap.state.layersAndGroupsCollection.groups);
        const [, itemsInURL, stylesInURL, opacitiesInURL] = window.location.hash.substring(1).split('|').map(part => part.split(','));

        for (const item of items){
            if(itemsInURL && itemsInURL.includes(encodeURIComponent(item.name))){
                const itemIndex = itemsInURL.indexOf(encodeURIComponent(item.name));
                item.checked = true;
                if(item.type === 'layer'){
                    item.wmsSelectedStyleName = decodeURIComponent(stylesInURL[itemIndex]);
                }
                item.opacity = parseFloat(opacitiesInURL[itemIndex]);
            } else {
                item.checked = false;
            }
        }
    }

    // Set URL in permalink component's input
    _refreshURLsInPermalinkComponent() {
        const inputSharePermalink = document.getElementById('input-share-permalink');
        const permalink = document.getElementById('permalink');
        const selectEmbedPermalink = document.getElementById('select-embed-permalink');
        const inputEmbedPermalink = document.getElementById('input-embed-permalink');

        if (inputSharePermalink) {
            inputSharePermalink.value = window.location.href;
        }
        if (permalink) {
            permalink.href = window.location.href;
        }
        if (selectEmbedPermalink) {
            const iframeSize = selectEmbedPermalink.value;
            let width = 0;
            let height = 0;

            if ( iframeSize === 's' ) {
                width = 400;
                height = 300;
            } else if ( iframeSize === 'm' ) {
                width = 600;
                height = 450;
            } else if (iframeSize === 'l') {
                width = 800;
                height = 600;
            } else if (iframeSize === 'p') {
                width = document.getElementById('input-embed-width-permalink').value;
                height = document.getElementById('input-embed-height-permalink').value;
            }

            const embedURL = window.location.href.replace('/map?','/embed?');

            inputEmbedPermalink.value = `<iframe width="${width}" height="${height}" frameborder="0" style="border:0" src="${embedURL}" allowfullscreen></iframe>`;
        }
    }

    _writeURLFragment() {
        let hash = '';

        // BBOX
        let bbox = lizMap.map.getExtent().toArray();
        if (lizMap.map.projection.projCode !== 'EPSG:4326') {
            bbox = transformExtent(
                bbox,
                lizMap.map.projection.projCode,
                'EPSG:4326'
            );
        }
        hash = bbox.join();

        // Item's visibility, style and opacity
        // Only write layer's properties when visible
        let itemsVisibility = [];
        let itemsStyle = [];
        let itemsOpacity = [];

        for (const item of lizMap.mainLizmap.state.rootMapGroup.findMapLayersAndGroups()) {
            if (item.checked){
                itemsVisibility.push(item.name);
                itemsStyle.push(item.wmsSelectedStyleName);
                itemsOpacity.push(item.opacity);
            }
        }

        if (itemsVisibility.length) {
            hash += '|' + itemsVisibility.join();
        }

        if (itemsStyle.length) {
            hash += '|' + itemsStyle.join();
        }

        if (itemsOpacity.length) {
            hash += '|' + itemsOpacity.join();
        }

        // Finally override URL fragment
        window.location.hash = hash;

        this._refreshURLsInPermalinkComponent();
    }
};
