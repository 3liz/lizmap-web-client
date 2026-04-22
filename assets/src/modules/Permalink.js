/**
 * @module modules/Permalink.js
 * @name Permalink
 * @copyright 2023 3Liz
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';
import {transformExtent} from 'ol/proj.js';
import { html, render } from 'lit-html';
import { Config } from './Config.js';
import { Utils } from './Utils.js';

/**
 * @class
 * @name Permalink
 */
export default class Permalink {

    /**
     * Permalink is managed via short link
     * @type {boolean}
     */
    _shortLinkPermalink;

    /**
     * Creates a Permalink instance
     * @param {Config} initialConfig - The lizmap initial config instance
     * @param {null|object} initialPermalink - Initial permalink startup object
     */
    constructor(initialConfig, initialPermalink) {

        // Used to behave differently when hash is changed
        // programmatically or by users in URL
        this._ignoreHashChange = false;
        // Store the build or received hash
        this._hash = '';
        this._extent4326 = [0, 0, 0, 0, 0];

        // Don't refresh hash when map is initialized
        this._ignoreStartupMapEvents = true;

        this._shortLinkPermalink = initialConfig.options.short_link_permalink;

        this._currentPermalinkId = null;

        // initialize current permalink, if any
        this.currentPermalinkProperties = initialPermalink;

        // Change `checked`, `style` states based on URL fragment
        if (window.location.hash) {
            this._runPermalink(false);
        }

        this._historyTableTemplate = (links = [], newEntry) => html`
            ${links && links.length ? html`
                <div class="permalink-history-title">${lizDict['permalink.history.title']}</div>
                <table class='table table-sm table-condensed'>
                    <tbody>
                        ${links.map((l,k) => {
                            return html`<tr data-url="${l.url}" data-share="${l.link}" class="${newEntry && k== 0 ? 'new-entry' : ''}">
                                <td>${l.link}</td>
                                <td><a href="${l.url}" target="_blank"><i title="${lizDict['permalink.history.visit']}" class='icon-eye-open'></i></a></td>
                                ${navigator.clipboard ? html`
                                    <td class="permalink-copy-to-clipboard" @click=${
                                        (e) => {
                                            const link = e.currentTarget.parentElement.getAttribute("data-url");
                                            this._copyToClipboard(link);
                                        }
                                    }>
                                    <i title="${lizDict['permalink.history.clipboard']}" class='icon-tags'></i>
                                </td>
                                ` : ''}
                                <td @click=${(e) => {
                                    const plink = e.currentTarget.parentElement.getAttribute("data-share");
                                    this.currentPermalinkId = plink;
                                    return this._sharePermalink();
                                }}><i title="${lizDict['permalink.history.share']}" class='icon-share'></i></td>
                            </tr>`
                            })}
                    </tbody>
                </table>
            ` : ''}
        `
        // initialize UI
        document.getElementById('permalink-box').style.display = this._shortLinkPermalink ? 'none' : 'block';
        document.getElementById('permalink-generator').style.display = this._shortLinkPermalink ? 'flex' : 'none';
        document.getElementById('permalink-back').style.display = this._shortLinkPermalink ? 'initial' : 'none';

        this._renderHistoryTemplate();

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

        // define events on UI component
        this._attachComponentEvents();

        // Refresh hash parameters when map state changes
        mainLizmap.state.map.addListener(
            () => {
                if (this._ignoreStartupMapEvents) {
                    this._ignoreStartupMapEvents = false;
                    return;
                }
                this._enableNewPermalinkButton();
                this._writeURLFragment();
            }, ['map.state.changed']
        );

        mainLizmap.state.rootMapGroup.addListener(
            () => {
                this._enableNewPermalinkButton();
                this._writeURLFragment();
            },
            [
                'layer.visibility.changed',
                'group.visibility.changed',
                'layer.style.changed',
                'group.style.changed',
                'layer.opacity.changed',
                'group.opacity.changed',
            ]
        );
    }

    /**
     * Setting the current permalink hash
     * @param {string} permalinkId - the permalink hash
     */
    set currentPermalinkId(permalinkId){
        this._currentPermalinkId = permalinkId;
    }

    /**
     * Getting the current permalink hash
     * @type {string}
     */
    get currentPermalinkId(){
        return this._currentPermalinkId;
    }

    /**
     * Stores the current permalink properties in local storage when short link permalink is enabled
     * @param {object} plink - the permalink object
     */
    set currentPermalinkProperties(plink){
        if(!this._shortLinkPermalink) return;

        const {repository, project} = globalThis['lizUrls'].params;
        const storedPermalink = localStorage.getItem('lizmap_p_link');
        let updatedPermalink;

        if(typeof plink === 'object' && !Array.isArray(plink) && plink !== null) {
            if (plink.repository && plink.repository == repository && plink.project && plink.project == project) {
                updatedPermalink = [plink];
                if (storedPermalink) {
                    let currentPermalinkList = JSON.parse(storedPermalink);
                    if(Array.isArray(currentPermalinkList)) {
                        updatedPermalink = [
                            ...currentPermalinkList.filter(f => f.repository !== repository || f.project !== project),
                            ...updatedPermalink,
                        ];
                    }
                }
            }
        } else {
            // remove current permalink instance from local storage, if any
            if (storedPermalink) {
                let currentPermalinkList = JSON.parse(storedPermalink);
                if(Array.isArray(currentPermalinkList)) {
                    updatedPermalink = currentPermalinkList.filter((f)=> f.repository != repository || f.project != project);
                }
            }
        }
        if (updatedPermalink) localStorage.setItem('lizmap_p_link', JSON.stringify(updatedPermalink));
    }

    /**
     * Retrieves the current permalink properties from local storage
     * @type {object}
     */
    get currentPermalinkProperties(){
        let currentPermalink = null;
        const {repository, project} = globalThis['lizUrls'].params;
        try {
            const storedPermalink = localStorage.getItem('lizmap_p_link');
            if (storedPermalink) {

                let currentPermalinkList = JSON.parse(storedPermalink);
                if(Array.isArray(currentPermalinkList)) {
                    let currentPermalinkObj = currentPermalinkList.filter((f)=> f.repository == repository && f.project == project);
                    if(currentPermalinkObj.length == 1) {
                        currentPermalink = currentPermalinkObj[0].plink;
                    }
                }
            }
        } catch(e) {
            console.log(e);
            currentPermalink = null;
        }

        return currentPermalink;
    }

    /**
     * Stores the permalink history in the local storage
     * @param {Array} history - the permalink records on history
     */
    set permalinksHistory(history){
        localStorage.setItem('lizmap_permalink_history', JSON.stringify(history));
    }

    /**
     * Get history records
     * @type {Array}
     */
    get permalinksHistory(){
        let storedPermalink = [];
        const {repository, project} = globalThis['lizUrls'].params;
        try {
            const permalinkParameters = localStorage.getItem('lizmap_permalink_history');
            if (permalinkParameters) {
                let historyPermalink = JSON.parse(permalinkParameters);
                if (historyPermalink && Array.isArray(historyPermalink)) {
                    storedPermalink = historyPermalink.filter(f => f.repository == repository && f.project == project)
                }
            }
        } catch (e) {
            console.warn(e);
            storedPermalink = [];
        }

        return storedPermalink;
    }

    /**
     * Get permalink from server
     * @param {string} permalinkId - the permalink hash
     * @returns {Promise<object>} The permalink object or the error object
     */
    static async getPermalink(permalinkId){
        const permalinkParams = new URLSearchParams({
            o:'g',
            id: permalinkId,
            ...globalThis['lizUrls'].params
        })

        let permalinkData;
        try {
            permalinkData = await Utils.fetchJSON(globalThis['lizUrls'].short_link_permalink + '?' + permalinkParams);
        } catch(e) {
            permalinkData = { error: [e.message]};
        }

        return permalinkData;
    }

    /**
     * Copy the permalink link to clipboard
     * @param {string} link - the permalink url
     */
    _copyToClipboard(link){
        navigator.clipboard.writeText(link).then(() => {
        });
    }

    /**
     * Renders the history template on client
     * @param {boolean} newEntry - wether a new record has been added
     */
    _renderHistoryTemplate(newEntry = false) {
        if (this._shortLinkPermalink) {
            render(this._historyTableTemplate(this.permalinksHistory, newEntry), document.getElementById('permalink-history'))
        }
    }

    /**
     * Enables the add paermalink button.
     * @returns {void}
     */
    _enableNewPermalinkButton(){
        if (!this._shortLinkPermalink) return;
        document.getElementById('lizmap-new-permalink').disabled = false;
        document.getElementById('lizmap-new-permalink').innerText = lizDict['permalink.new'];
    }

    /**
     * Defines events on UI components
     * @returns {void}
     */
    _attachComponentEvents(){
        // Handle events on permalink component
        // close minidock
        const btnPermalinkClear = document.querySelector('.btn-permalink-clear');

        if (btnPermalinkClear) {
            btnPermalinkClear.addEventListener('click', () => document.getElementById('button-permaLink').click());
        }

        // change embed iframe size
        const selectEmbedPermalink = document.getElementById('select-embed-permalink');

        if (selectEmbedPermalink) {
            selectEmbedPermalink.addEventListener('change', event => {
                document.getElementById('span-embed-personalized-permalink').classList.toggle('hide', event.target.value !== 'p')
                this._refreshURLsInPermalinkComponent();
            });
        }

        // custom iframe size
        document.querySelectorAll('#input-embed-width-permalink, #input-embed-height-permalink').forEach(input =>
            input.addEventListener('input', () => this._refreshURLsInPermalinkComponent())
        );

        // Geobookmarks (only for logged in users)
        const geobookmarkForm = document.getElementById('geobookmark-form');

        if (geobookmarkForm) {
            this._bindGeobookmarkEvents();

            geobookmarkForm.addEventListener('submit', async event => {
                event.preventDefault();
                const bname = document.querySelector('#geobookmark-form input[name="bname"]').value;
                if (bname == '') {
                    lizMap.addMessage(lizDict['geobookmark.name.required'], 'danger', true);
                    return false;
                }
                let permalink = null;
                if (this._shortLinkPermalink) {
                    permalink = await this._addShortLinkPermalink();
                    if(!permalink) return;
                }
                const gbparams = {};
                gbparams['project'] = globalThis['lizUrls'].params.project;
                gbparams['repository'] = globalThis['lizUrls'].params.repository;
                gbparams['hash'] = this._shortLinkPermalink ? `#permalink=${permalink}` : this._hash;
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

        // short link permalink
        if (this._shortLinkPermalink) {
            const backToLinkGenerator = document.getElementById('permalink-back');
            backToLinkGenerator.addEventListener('click', () => {
                document.getElementById('permalink-box').style.display = 'none';
                document.getElementById('permalink-generator').style.display = 'flex';
            })

            const newPermalinkButton = document.getElementById('lizmap-new-permalink');
            if(newPermalinkButton) {
                newPermalinkButton.addEventListener('click', e => {
                    this._createNewPermalink(e);
                })
            }
        }
    }

    /**
     * Updates the local permalink history
     * @param {object} plink - the permalink object
     * @param {boolean} newEntry - wether a new record has been added
     */
    _updatePermalinkHistory(plink, newEntry){
        const {repository, project} = globalThis['lizUrls'].params;
        let permalinkList = this.permalinksHistory;
        const isOnHistory = permalinkList.filter((e)=> e.link == plink);
        if(!isOnHistory.length) {
            permalinkList.unshift({
                link: plink,
                repository: repository,
                project:project,
                url: window.location.origin
                + window.location.pathname
                + '?'
                + new URLSearchParams(globalThis['lizUrls'].params)
                + "#permalink="+plink,
            })

            // keep only 20 items per tuple (repository, project)
            permalinkList = permalinkList.slice(0,20);
        } else {
            // order history
            permalinkList = [...isOnHistory, ...permalinkList.filter((e)=> e.link != plink)]

        }
        this.permalinksHistory = permalinkList;
        this._renderHistoryTemplate(newEntry);
    }

    /**
     * Creates a new permalink short link and updates UI.
     * @param {Event} e - click event
     * @returns {void}
     */
    async _createNewPermalink(e){
        e.preventDefault();
        document.getElementById('lizmap-new-permalink').disabled = true;
        const permalink = await this._addShortLinkPermalink();

        if(permalink) {
            this.currentPermalinkId = permalink;
            this._updatePermalinkHistory(permalink, true);
            if(navigator.clipboard) {
                this._copyToClipboard(permalink);
                document.getElementById('lizmap-new-permalink').innerText = lizDict['permalink.clipboard'];
            } else {
                this._sharePermalink();
            }
        } else {
            document.getElementById('lizmap-new-permalink').disabled = false;
        }
    }

    /**
     * Adds a new short link permalink for the given repository and project
     * @returns {Promise<null|string>} The permalink hash or null in case of errors
     */
    async _addShortLinkPermalink(){
        let permalinkParams = new URLSearchParams({
            o: 'add',
            repository: globalThis['lizUrls'].params.repository,
            project: globalThis['lizUrls'].params.project
        });

        // capture the current permalink properties
        this._writeURLFragment();
        let permalinkData;
        // send request to the server
        try {
            permalinkData = await Utils.fetchJSON(globalThis['lizUrls'].short_link_permalink + '?' + permalinkParams,{
                method:'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    permalink:{...this.currentPermalinkProperties}
                })
            })
            if(permalinkData && permalinkData.permalink){
                return permalinkData.permalink;
            } else {
                mainLizmap.displayMessage(permalinkData.error.reduce((p,c)=> p + '\n' + c,''), 'danger', true);
                return null;
            }
        } catch (e) {
            mainLizmap.displayMessage(e.message, 'danger', true);
            return null;
        }
    }

    /**
     * Updates component UI for share functionality
     * @returns {void}
     */
    _sharePermalink(){
        document.getElementById('permalink-box').style.display = 'block';
        document.getElementById('permalink-generator').style.display = 'none';
        this._refreshURLsInPermalinkComponent()
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

    /**
     * Runs the permalink to update the map
     * @param {boolean} setExtent - whether set the map extent or not
     * @returns {Promise<void>}
     */
    async _runPermalink(setExtent = true) {
        if (this._hash === ''+window.location.hash) {
            return;
        }
        if (window.location.hash === "") {
            this._hash = '';
            return;
        }

        this._hash = ''+window.location.hash;

        if (this._shortLinkPermalink && this._hash.indexOf('#permalink=') == 0){
            const shortLink = window.location.hash.substring(1).split('=')[1];
            if (shortLink) {
                const permalink = await this.constructor.getPermalink(shortLink);
                if (!permalink) return;
                if(permalink.hasOwnProperty('error')) {
                    mainLizmap.displayMessage(permalink.error.reduce((p,c) => p + '\n' + c,''),'danger',true);
                } else {
                    this.currentPermalinkProperties = permalink;
                }
            }
            if (mainLizmap.config.options.automatic_permalink) {
                window.location.hash = "#map_status";
            } else history.replaceState(null, '', window.location.pathname + window.location.search)
        }

        // items are layers then groups from leaf to root
        const items = mainLizmap.state.layersAndGroupsCollection.layers.concat(
            mainLizmap.state.layersAndGroupsCollection.groups.reverse() // reverse groups array to get from leaf to root
        );

        const [extent4326, itemsInURL, stylesInURL, opacitiesInURL] = this._getPermalinkValues();

        if (setExtent
            && extent4326
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

    /**
     * Parse permalink hash
     * @returns {Array} The array of permalink parameters
     */
    _getPermalinkValues(){
        if (this._shortLinkPermalink) {
            let permalinkValues = Array(4);
            try {
                let currentPermalink = this.currentPermalinkProperties;
                if (currentPermalink) {
                    permalinkValues = [
                        currentPermalink.bbox,
                        currentPermalink.layers ?? null,
                        currentPermalink.styles ?? null,
                        currentPermalink.opacities ?? null,
                        currentPermalink.symbology ?? null,
                    ]
                }
            } catch(e){
                console.warn(e)
            }

            return permalinkValues;
        } else {
            return window.location.hash.substring(1).split('|').map(part => part.split(','));
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
            + (this._shortLinkPermalink ? "#permalink="+this.currentPermalinkId : this._hash);

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

            let embedURL = window.location.href.replace('/map?','/embed?');
            if (this._shortLinkPermalink) {
                embedURL = embedURL.split('#')[0] + "#permalink="+this.currentPermalinkId;
            }

            inputEmbedPermalink.value = `<iframe width="${width}" height="${height}" frameborder="0" style="border:0" src="${embedURL}" allowfullscreen></iframe>`;
        }
    }

    _writeURLFragment() {
        // Don't write initial permalink if waiting for first theme to be applied
        if (this._suspendInitialWrite) {
            return;
        }

        let hash;

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
        if(this._shortLinkPermalink) {
            const {repository, project} = globalThis['lizUrls'].params;
            const hashParams = {}
            hashParams.bbox = this._extent4326;
            if (itemsVisibility.length) hashParams.layers = itemsVisibility;
            if (itemsStyle.length) hashParams.styles = itemsStyle;
            if (itemsOpacity.length) hashParams.opacities = itemsOpacity;

            this.currentPermalinkProperties = {repository: repository, project: project, plink: hashParams};
        }

        if (mainLizmap.initialConfig.options.automatic_permalink) {
            if (this._shortLinkPermalink) {
                window.location.hash = 'map_status'
            } else {
                this._ignoreHashChange = true;
                window.location.hash = hash;
            }
        }

        this._refreshURLsInPermalinkComponent();
    }
}
