/**
 * @module modules/Permalink.js
 * @name Permalink
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';

/**
 * @class
 * @name Permalink
 */
export default class Permalink {

    constructor() {

        // Used to behave differently when hash is changed
        // programmatically or by users in URL
        this._ignoreHashChange = false;
        // Store the build or received hash
        this._hash = '';
        this._extent4326 = [0, 0, 0, 0, 0];

        // Don't refresh hash when map is initialized
        this._ignoreStartupMapEvents = true;

        // Change `checked`, `style` states based on URL fragment
        if (window.location.hash) {
            this._runPermalink(false);
        }

        window.addEventListener(
            "hashchange", () => {
                // The hash has been changed by the module
                if (this._ignoreHashChange) {
                    this._ignoreHashChange = false;
                    return;
                }
                // Received the event but the hash does not change
                if (this._hash == window.location.hash) {
                    return;
                }
                if (window.location.hash) {
                    this._runPermalink();
                }
            }
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

        // Geobookmarks (only for logged in users)
        const geobookmarkForm = document.getElementById('geobookmark-form');

        if (geobookmarkForm) {
            this._bindGeobookmarkEvents();

            geobookmarkForm.addEventListener('submit', event => {
                event.preventDefault();
                const bname = document.querySelector('#geobookmark-form input[name="bname"]').value;
                if (bname == '') {
                    lizMap.addMessage(lizDict['geobookmark.name.required'], 'danger', true);
                    return false;
                }
                const gbparams = {};
                gbparams['project'] = globalThis['lizUrls'].params.project;
                gbparams['repository'] = globalThis['lizUrls'].params.repository;
                gbparams['hash'] = this._hash;
                gbparams['name'] = bname;
                gbparams['q'] = 'add';
                fetch(globalThis['lizUrls'].geobookmark, {
                    method: "POST",
                    body: new URLSearchParams(gbparams)
                }).then(response => {
                    return response.text();
                }).then( data => {
                    this._setGeobookmarkContent(data);
                });
            });
        }

        // If geobookmark is the same than the hash there is
        // no `hashchange` event. In this case we run permalink
        document.querySelectorAll('.btn-geobookmark-run').forEach(button => {
            button.addEventListener('click', event => {
                if (decodeURIComponent(window.location.hash) === event.currentTarget.getAttribute('href')) {
                    this._runPermalink();
                }
            });
        });

        // Refresh hash parameters when map state changes
        mainLizmap.state.map.addListener(
            () => {
                if (this._ignoreStartupMapEvents) {
                    this._ignoreStartupMapEvents = false;
                    return;
                }
                this._writeURLFragment();
            }, ['map.state.changed']
        );

        mainLizmap.state.rootMapGroup.addListener(
            () => this._writeURLFragment(),
            ['layer.visibility.changed', 'group.visibility.changed', 'layer.style.changed', 'group.style.changed', 'layer.opacity.changed', 'group.opacity.changed']
        );
    }

    _setGeobookmarkContent(gbData) {
        // set content
        $('div#geobookmark-container').html(gbData);
        // unbind previous click events
        $('div#geobookmark-container button').unbind('click');
        // Bind events
        this._bindGeobookmarkEvents();
        // Remove bname val
        $('#geobookmark-form input[name="bname"]').val('').blur();
    }

    _bindGeobookmarkEvents() {
        document.querySelectorAll('.btn-geobookmark-del').forEach(button => {
            button.addEventListener('click', () => {
                if (confirm(lizDict['geobookmark.confirm.delete'])) {
                    var gbid = button.value;
                    this._removeGeoBookmark(gbid);
                }
            });
        });
    }

    _removeGeoBookmark(id) {
        var gbparams = {
            id: id,
            q: 'del',
            repository: globalThis['lizUrls'].params.repository,
            project: globalThis['lizUrls'].params.project
        };

        fetch(globalThis['lizUrls'].geobookmark + '?' + new URLSearchParams(gbparams)).then(response => {
            return response.text();
        }).then( data => {
            this._setGeobookmarkContent(data);
        });
    }

    _runPermalink(setExtent = true) {
        if (this._hash === ''+window.location.hash) {
            return;
        }
        if (window.location.hash === "") {
            this._hash = '';
            return;
        }

        this._hash = ''+window.location.hash;

        // items are layers then groups from leaf to root
        const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(
            mainLizmap.state.layersAndGroupsCollection.groups.reverse() // reverse groups array to get from leaf to root
        );

        const [extent4326, itemsInURL, stylesInURL, opacitiesInURL] = window.location.hash.substring(1).split('|').map(part => part.split(','));

        if (setExtent
            && extent4326.length === 4
            && this._extent4326.filter((v, i) => {return parseFloat(extent4326[i]).toPrecision(6) != v}).length != 0) {
            const mapExtent = transformExtent(
                extent4326.map(coord => parseFloat(coord)),
                'EPSG:4326',
                lizMap.map.projection.projCode
            );
            this._extent4326 = extent4326.map(coord => parseFloat(coord).toPrecision(6));
            mainLizmap.extent = mapExtent;
        }

        if (itemsInURL && itemsInURL.length != 0) {
            for (const item of items){
                if(itemsInURL && itemsInURL.includes(encodeURIComponent(item.name))){
                    const itemIndex = itemsInURL.indexOf(encodeURIComponent(item.name));
                    item.checked = true;
                    if (item.type === 'layer' && stylesInURL[itemIndex] !== undefined) {
                        item.wmsSelectedStyleName = decodeURIComponent(stylesInURL[itemIndex]);
                    }
                    if (opacitiesInURL[itemIndex]) {
                        item.opacity = parseFloat(opacitiesInURL[itemIndex]);
                    }
                } else {
                    item.checked = false;
                }
            }
        }
    }

    // Set URL in permalink component's input
    _refreshURLsInPermalinkComponent() {
        const inputSharePermalink = document.getElementById('input-share-permalink');
        const permalink = document.getElementById('permalink');
        const selectEmbedPermalink = document.getElementById('select-embed-permalink');
        const inputEmbedPermalink = document.getElementById('input-embed-permalink');

        var searchParams = {
            repository: globalThis['lizUrls'].params.repository,
            project: globalThis['lizUrls'].params.project
        };
        if (this._hash === '') {
            const urlParameters = (new URL(window.location)).searchParams;
            if (urlParameters.has('bbox')) {
                searchParams['bbox'] = urlParameters.get('bbox');
            }
            if (urlParameters.has('crs')) {
                searchParams['crs'] = urlParameters.get('crs');
            }
        }

        const permalinkValue = window.location.origin
            + window.location.pathname
            + '?'
            + new URLSearchParams(searchParams)
            + this._hash;

        if (inputSharePermalink) {
            inputSharePermalink.value = permalinkValue;
        }
        if (permalink) {
            permalink.href = permalinkValue;
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
        let bbox = mainLizmap.extent;
        if (lizMap.map.projection.projCode !== 'EPSG:4326') {
            bbox = transformExtent(
                bbox,
                lizMap.map.projection.projCode,
                'EPSG:4326'
            );
        }
        this._extent4326 = bbox.map(x => x.toFixed(6));
        hash = this._extent4326.join();

        // Item's visibility, style and opacity
        // Only write layer's properties when visible
        let itemsVisibility = [];
        let itemsStyle = [];
        let itemsOpacity = [];

        for (const item of mainLizmap.state.rootMapGroup.findMapLayersAndGroups()) {
            if (item.checked){
                itemsVisibility.push(encodeURIComponent(item.name));
                itemsStyle.push(item.wmsSelectedStyleName ? encodeURIComponent(item.wmsSelectedStyleName) : item.wmsSelectedStyleName);
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

        // Saved new hash
        this._hash = '#'+hash;
        // Finally override URL fragment
        if (mainLizmap.initialConfig.options.automatic_permalink) {
            this._ignoreHashChange = true;
            window.location.hash = hash;
        }

        this._refreshURLsInPermalinkComponent();
    }
}
