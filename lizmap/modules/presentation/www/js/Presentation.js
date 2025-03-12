/**
 * @name Presentation
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

/**
 * @class
 * @name Presentation
 */
class Presentation {

    /**
     * @boolean If the presentation feature is available for the current user
     */
    modulePresentationAvailable = false;

    /**
     * @string Unique ID of an presentation object
     * We allow only one active presentation at a time
     */
    ACTIVE_LIZMAP_PRESENTATION = null;

    /**
     * @boolean If a presentation editing form is active
     */
    LIZMAP_PRESENTATION_ACTIVE_EDITING_FORM = false;

    /**
     * @string Active page uuid
     */
    LIZMAP_PRESENTATION_ACTIVE_PAGE_UUID = null;

    /**
     * @string Active page number
     */
    LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER = 1;

    /**
     * @integer Active page number
     */
    LIZMAP_PRESENTATION_DOCK_SIZE = 50;

    /**
     * @string Active presentation number of pages
     */
    activePresentationPagesCount = 0;

    /**
     * @string Original map div left margin
     */
    mapLeftMargin = '30px';

    /**
     * @string Current dock size
     */
    currentDockSize = null;



    /**
     * Build the lizmap presentation instance
     */
    constructor() {
        this.modulePresentationAvailable = true;
        if (typeof presentationConfig === 'undefined') {
            this.modulePresentationAvailable = false;
        }
        if (this.modulePresentationAvailable) {
            // Hide the presentation dock if no presentation exists
            // And the user has no right to manage them
            const hideDock = false;
            if (hideDock) {
                this.hidePresentationDock();
            }

            // Main resentation div
            const containerId = 'presentation';
            const presentationMainDiv = document.getElementById(containerId);

            // Add a div which will contain the editing form
            const formDiv = document.createElement('div');
            formDiv.id = 'lizmap-presentation-form-container';
            presentationMainDiv.appendChild(formDiv);

            // Add a div which will contain the slideshow
            const slidesDiv = document.createElement('div');
            slidesDiv.id = 'lizmap-presentation-slides-container';
            const slidesDivTemplate = document.getElementById('lizmap-presentation-slides-container-template');
            slidesDiv.innerHTML = slidesDivTemplate.innerHTML;

            // Show only one page at a time by not allowing scroll
            // Todo : add an option ?
            slidesDiv.classList.add('no-scroll');
            presentationMainDiv.appendChild(slidesDiv);

            // Also add the button allowing to toggle back the presentation when minified
            const slidesRestoreDiv = document.createElement('div');
            slidesRestoreDiv.id = 'lizmap-presentation-slides-minified-toolbar-container';
            const slidesRestoreTemplate = document.getElementById('lizmap-presentation-slides-minified-toolbar-template');
            slidesRestoreDiv.innerHTML = slidesRestoreTemplate.innerHTML;
            presentationMainDiv.appendChild(slidesRestoreDiv);

            // Keep the map left margin before running the presentation
            let olMapDiv = document.getElementById('map');
            if (!olMapDiv) {
                olMapDiv = document.getElementById('newOlMap');
            }
            if (olMapDiv) {
                this.mapLeftMargin = olMapDiv.style.marginLeft;
            }

            // React on the main Lizmap events
            lizMap.mainLizmap.lizmap3.events.on({
            });

            // React on dock closed event
            lizMap.events.on({
                'dockclosed': function(event) {
                    // Do nothing if no presentation is runnning
                    if (lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION === null) return true;

                    // Check which dock is closed
                    const dockId = event.id;
                    if (dockId == 'presentation') {
                        // Minify the presentation only if presentation editing form is not active
                        if (!lizMap.mainLizmap.presentation.LIZMAP_PRESENTATION_ACTIVE_EDITING_FORM) {
                            lizMap.mainLizmap.presentation.toggleLizmapPresentation(false);
                        }
                    } else {
                        // Display back the running presentation
                        const notActivePresentationDock = document.querySelector('#mapmenu ul > li.presentation:not(.active) a');
                        if (notActivePresentationDock) {
                            notActivePresentationDock.click();
                        }
                        // Restore the presentation only if presentation editing form is not active
                        if (!lizMap.mainLizmap.presentation.LIZMAP_PRESENTATION_ACTIVE_EDITING_FORM) {
                            lizMap.mainLizmap.presentation.toggleLizmapPresentation(true);
                        }
                    }
                }
            });
        }

    }

    /**
     * Hide the presentation dock
     */
    hidePresentationDock() {
        let presentationMenu = document.querySelector('#mapmenu li.presentation');
        if (presentationMenu) {
            presentationMenu.style.display = "none";
        }
        let switcherMenuAnchor = document.querySelector('#mapmenu li.switcher:not(.active) a');
        if (switcherMenuAnchor) switcherMenu.click();
    }

    /**
     * Get an presentation item by its uid.
     *
     * @param {integer} presentationId - id of the presentation
     *
     * @return {null|object} The corresponding presentation data
     */
    getPresentationById(presentationId) {
        if (!this.modulePresentationAvailable) {
            return null;
        }

        // Get presentation data from the PresentationCards component
        const presentationCards = document.querySelector('lizmap-presentation-cards');
        if (presentationCards === null) {
            return null;
        }
        for (const p in presentationCards.presentations) {
            const presentation = presentationCards.presentations[p];
            if (presentation && presentation.id == presentationId) {
                return presentation;
            }
        }

        return null;
    }

    /**
     * Get the list of presentations
     *
     * @return {Promise} presentations - Promise with the JSON list of presentations
     */
    getPresentations() {
        const url = presentationConfig.url;
        let formData = new FormData();
        formData.append('request', 'list');

        // Return promise
        return fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (json) {
            return json;
        }).catch(function (error) {
            console.warn(error);
        });
    }

    /**
     * Send the pagination order information to the server for the specified presentation
     *
     * @param {integer} presentationId ID of the presentation
     * @param {array} pages Array with the page ID as key and page number as value
     * @return {Promise} Modified presentation - Promise with the JSON of the presentations
     */
    sendPresentationPaginationInformation(presentationId, pages) {

        const url = presentationConfig.url;
        let formData = new FormData();
        formData.append('request', 'set_pagination');
        formData.append('id', presentationId);
        formData.append('pages', JSON.stringify(pages));

        // Return promise
        return fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response);
        }).then(function (json) {
            return json;
        }).catch(function (error) {
            console.warn(error);
        });
    }


    /**
     * Run a Lizmap presentation.
     *
     * @param {integer} presentationId - The presentation id
     * @param {integer} pageNumber - The page number to go to
     */
    async runLizmapPresentation(presentationId, pageNumber = 0) {
        if (!this.modulePresentationAvailable) {
            this.addMessage('No presentation found for the current Lizmap map !', 'error', 10000);

            return false;
        }

        // Get the presentation
        let presentation = this.getPresentationById(presentationId);
        if (presentation === null) {
            this.addMessage('No corresponding presentation found in the configuration !', 'error', 10000);

            return false;
        }

        // Set current presentation page count
        this.activePresentationPagesCount = presentation.pages.length;

        // Reset the other presentations
        // We allow only one active presentation at a time
        this.resetLizmapPresentation();
        try {
            // Reset its content from the template
            const slidesContainer = document.getElementById('lizmap-presentation-slides-container');
            const slidesDivTemplate = document.getElementById('lizmap-presentation-slides-container-template');
            slidesContainer.innerHTML = slidesDivTemplate.innerHTML;

            // slidesContainer background color
            slidesContainer.style.backgroundColor = presentation.background_color;

            // REMOVED THIS CODE TO USE PAGE BY PAGE BEHAVIOR
            // // Create an observer for page visibility
            // let observers = {};
            // let pageObserverOptions = {
            //     root: slidesContainer,
            //     rootMargin: "0px",
            //     threshold: [0, 0.25, 0.5, 0.75, 1],
            // };
            // const pageIntersectionCallback = (entries) => {
            //     entries.forEach((entry) => {

            //         const page = entry.target;
            //         const uuid = page.dataset.uuid;
            //         const visiblePct = `${Math.floor(entry.intersectionRatio * 100)}`;
            //         if (visiblePct >= 50) {
            //             page.classList.add('active');
            //             lizMap.mainLizmap.presentation.onPageVisible(page);
            //         } else {
            //             page.classList.remove('active');
            //         }

            //     });
            // };

            // Add the pages
            let targetPageElement = null;
            presentation.pages.forEach(page => {
                const presentationPage = document.createElement('lizmap-presentation-page');
                presentationPage.dataset.id = page.id;
                presentationPage.dataset.uuid = page.uuid;
                presentationPage.dataset.number = page.page_order;
                presentationPage.presentation = presentation;
                presentationPage.properties = page;
                slidesContainer.appendChild(presentationPage);

                // REMOVED THIS CODE TO USE PAGE BY PAGE BEHAVIOR
                // Add intersection observer
                // const observer = new IntersectionObserver(
                //     pageIntersectionCallback,
                //     pageObserverOptions,
                // );
                // observers[page.uuid] = observer;
                // observers[page.uuid].observe(presentationPage);

                // Store first page component
                if (targetPageElement === null || page.page_order == pageNumber) {
                    targetPageElement = presentationPage;
                }
            })

            // Set the presentation slides container visible
            const dock = document.getElementById('dock');
            dock.classList.add('presentation-visible');
            const bodyElt = document.querySelector('body');
            bodyElt.classList.add('presentation-visible');
            slidesContainer.classList.add('visible');

            // Set active page
            const targetPageNumber = (pageNumber > 0) ? pageNumber : 1;
            if (targetPageElement !== null) {
                this.goToGivenPage(targetPageNumber);
            }

            /**
             * Lizmap event to allow other scripts to process the data if needed
             * @event presentationLaunched
             * @property {string} presentationId Id of the presentation
             */
            lizMap.events.triggerEvent("presentationLaunched",
                {
                    'presentation': presentationId
                }
            );

            // Add arrow keys shortcuts
            this.addKeyShortCuts();

            // Set the presentation as active
            this.ACTIVE_LIZMAP_PRESENTATION = presentationId;

        } catch (error) {
            // Display the error
            console.warn(error);
            this.addMessage(error, 'error', 10000);

            // Reset the presentation
            this.resetLizmapPresentation();

        }
    }


    /**
     * Listener for key shorcuts
     *
     * @param {event} event Key up event
     */
    onKeyUp(event) {
        // Key name
        const keyName = event.key;

        // Do nothing if the presentation is not active
        const dock = document.getElementById('dock');
        if (this.ACTIVE_LIZMAP_PRESENTATION === null || !(dock.classList.contains('presentation-visible'))) {
            return;
        }

        // As the user releases the Ctrl key, the key is no longer active,
        // so event.ctrlKey is false.
        if (keyName === "Control") {
            // console.log("KEYUP - Control key was released");
            return;
        }

        if (event.ctrlKey) {
            // Even though event.key is not 'Control' (e.g., 'a' is pressed),
            // event.ctrlKey may be true if Ctrl key is pressed at the same time.
            // console.log(`KEYUP - CTRL + ${keyName}`);
            switch (keyName) {
                case 'ArrowRight':
                case 'ArrowDown':
                    lizMap.mainLizmap.presentation.goToLastPage();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    lizMap.mainLizmap.presentation.goToFirstPage();
                    break;
                case 'Escape':
                    // Close the presentation
                    lizMap.mainLizmap.presentation.resetLizmapPresentation();
                    break;
                default:
                    // nothing to do
                    break;
            }
        } else {
            // console.log(`KEYUP - ${keyName}`);
            switch (keyName) {
                case 'ArrowRight':
                case 'ArrowDown':
                    lizMap.mainLizmap.presentation.goToNextPage();
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    lizMap.mainLizmap.presentation.goToPreviousPage();
                    break;
                case 'Escape':
                    // Minify the presentation
                    lizMap.mainLizmap.presentation.toggleLizmapPresentation(false);
                    break;
                default:
                    // nothing to do
                    break;
            }
        }
    }

    /**
     * Add key shortcuts to control the active presentation
     */
    addKeyShortCuts() {
        document.addEventListener(
            "keyup",
            this.onKeyUp,
            false,
        );
    }

    /**
     * Remove key shortcuts to control the active presentation
     */
    removeKeyShortCuts() {
        document.removeEventListener(
            "keyup",
            this.onKeyUp,
            false,
        );
    }



    /**
     * Change the map size according to the given dock width percentage
     *
     * If the dock width is null, reset map and dock to its original position
     * If the dock width is a given number, move the map so that the dock and map
     * are side-by-side, so that the visible map is the full map
     *
     * @param {null|integer} dockWidth Width of the dock in percentage. Null to go back to original state
     * @param {boolean}      hideHeader If true, remove the Lizmap interface Header
     */
    changeMapSize(dockWidth = null, hideHeader = true) {
        // Do nothing if current dock width is already correctly set
        if (dockWidth === this.currentDockWidth) {
            return;
        }

        // THIS CANNOT BE DONE WITH CSS
        // Initial values
        let mapMarginLeft, mapWidthPercentage, dockWidthPercentage, maxDockWidthPercentage;
        if (dockWidth === null) {
            // If the given dock width is null, set back to the original position
            mapMarginLeft = this.mapLeftMargin;
            mapWidthPercentage = '100%';
            dockWidthPercentage = 'initial';
            maxDockWidthPercentage = '40%';
        } else {
            // else modify the map margin and width
            mapMarginLeft = `${dockWidth}%`;
            mapWidthPercentage = `${100 - dockWidth}%`;
            dockWidthPercentage = `${dockWidth}%`;
            maxDockWidthPercentage = `${dockWidth}%`;
        }

        // Set global variable
        this.currentDockWidth = dockWidth;

        // Dock
        const dock = document.getElementById('dock');
        if (dock) {
            dock.style.width = dockWidthPercentage;
            dock.style.maxWidth = maxDockWidthPercentage;
        }

        // Map div
        // Check if the div are present, since LWC has changed them a bit
        // in recent versions
        const mapDiv = document.getElementById('newOlMap');
        if (mapDiv) {
            mapDiv.style.marginLeft = mapMarginLeft;
            mapDiv.style.width = mapWidthPercentage;
        }
        const oldMapDiv = document.getElementById('map');
        if (oldMapDiv) {
            oldMapDiv.style.marginLeft = mapMarginLeft;
            oldMapDiv.style.setProperty('margin-left', mapMarginLeft, 'important');
            oldMapDiv.style.width = mapWidthPercentage;
        }
        const baseLayersOlMapDiv = document.getElementById('baseLayersOlMap');
        if (baseLayersOlMapDiv) {
            baseLayersOlMapDiv.style.marginLeft = mapMarginLeft;
            baseLayersOlMapDiv.style.setProperty('margin-left', mapMarginLeft, 'important');
            baseLayersOlMapDiv.style.width = mapWidthPercentage;
        }

        // Toggle header
        if (hideHeader) {
            const htmlElt = document.querySelector('html');
            const bodyElt = document.querySelector('body');
            const headerElt = document.getElementById('header');
            const contentElt = document.getElementById('content');
            const mapContentElt = document.getElementById('map-content');

            htmlElt.style.height = '100%';
            bodyElt.style.height = '100%';
            contentElt.style.height = '100%';
            mapContentElt.style.height = '100%';
            if (oldMapDiv) {
                oldMapDiv.style.height = '100%';
            }
            if (dockWidth == null) {
                // If the given dock width is null, set back to the original position
                // bodyElt.style.paddingTop = '75px';
                bodyElt.style.height = 'calc(100% - 75px)';
                bodyElt.classList.remove('presentation-visible');
                headerElt.style.display = 'block';
            } else {
                // Else hide the header and adapt other elements
                // bodyElt.style.setProperty('padding-top', '0px', 'important');
                headerElt.style.display = 'none';
                bodyElt.classList.add('presentation-visible');
            }
        }

        // Update map size
        lizMap.map.updateSize();
    }

    /**
     * Reset presentation
     *
     * @param {boolean} removeMessage - If we must remove the message displayed at the top.
     * @param {boolean} resetGlobalVariable - If we must empty the global variable ACTIVE_LIZMAP_PRESENTATION
     */
    resetLizmapPresentation(removeMessage = true, resetGlobalVariable = true) {

        // Hide presentation slides container
        const slidesContainer = document.getElementById('lizmap-presentation-slides-container');
        if (!slidesContainer) {
            return;
        }

        // Remove shortcuts
        this.removeKeyShortCuts();

        // Reactivate presentation dock
        const notActivePresentationDock = document.querySelector('#mapmenu ul > li.presentation:not(.active) a');
        if (notActivePresentationDock) {
            notActivePresentationDock.click();
        }

        // Put back the interface as initial
        slidesContainer.innerHTML = '';
        slidesContainer.classList.remove('visible');
        const dock = document.getElementById('dock');
        dock.classList.remove('presentation-visible');
        const bodyElt = document.querySelector('body');
        bodyElt.classList.remove('presentation-visible');

        // Set back the map to its original size
        this.changeMapSize(null);

        // Clear the previous Lizmap message
        if (removeMessage) {
            let previousMessage = document.getElementById('lizmap-presentation-message');
            if (previousMessage) previousMessage.remove();
        }

        // Reset the global variable
        if (resetGlobalVariable) {
            this.ACTIVE_LIZMAP_PRESENTATION = null;
        }
    }

    /**
     * Toggle the lizMap presentation visibility
     * Allow to minimize or restore the active presentation
     *
     * @param {boolean} show If true, show the presentation back. Minimize if false.
     */
    toggleLizmapPresentation(show = false) {
        const slidesContainer = document.getElementById('lizmap-presentation-slides-container');
        const slidesRestore = document.getElementById('lizmap-presentation-slides-minified-toolbar');
        const dock = document.getElementById('dock');
        const presentationListContainer = document.getElementById('presentation-list-container');
        const runningMessageDiv = document.getElementById('presentation-running-message');
        const dockTabsUl = document.getElementById('dock-tabs');
        const bodyElt = document.querySelector('body');
        if (!show) {
            // Remove visible class
            slidesContainer.classList.remove('visible');
            slidesRestore.classList.add('visible');
            dock.classList.remove('presentation-visible');
            bodyElt.classList.remove('presentation-visible');
            presentationListContainer.style.display = 'none';
            dockTabsUl.style.display = 'block';
            runningMessageDiv.style.display = 'block';

            // Set back the map to its original size
            this.changeMapSize(null);
        } else {
            // Add presentation visible classes
            bodyElt.classList.add('presentation-visible');
            dock.classList.add('presentation-visible');
            slidesContainer.classList.add('visible');
            slidesRestore.classList.remove('visible');
            presentationListContainer.style.display = 'block';
            runningMessageDiv.style.display = 'none';

            // We need to run the setInterfaceFromPage method to set the page & map width
            const page = document.querySelector(`lizmap-presentation-page[data-number="${this.LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER}"]`);
            if (page) {
                this.setInterfaceFromPage(page);
            }
        }
    }

    /**
     * Go to the given active presentation page
     * @param {integer} pageNumber The page number to go to
     */
    goToGivenPage(pageNumber) {
        // console.log(`from ${this.LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER} to ${pageNumber}`);
        // const targetAnchor = document.querySelector(`a.lizmap-presentation-page-anchor[name="${pageNumber}"]`);
        // if (targetAnchor) {
        //     targetAnchor.scrollIntoView();
        // }
        Array.from(document.querySelectorAll('lizmap-presentation-page')).map(page => {
            if (page.dataset.number == pageNumber) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
        const targetPageElement = document.querySelector(`lizmap-presentation-page[data-number="${pageNumber}"]`);
        lizMap.mainLizmap.presentation.onPageVisible(targetPageElement, true);
    }

    // Go to the previous page
    goToPreviousPage() {
        const targetPage = parseInt(this.LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER) - 1;
        if (targetPage >= 1) {
            this.goToGivenPage(targetPage);
        }
    }

    // Go to the next page
    goToNextPage() {
        // Get current page
        const targetPage = parseInt(this.LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER) + 1;
        if (targetPage <= this.activePresentationPagesCount) {
            this.goToGivenPage(targetPage);
        }
    }

    // Go to the first page
    goToFirstPage() {
        this.goToGivenPage(1);
    }

    // Go to the last page
    goToLastPage() {
        this.goToGivenPage(this.activePresentationPagesCount);
    }


    /**
     * Get a localized string
     *
     * @param {string} stringId Code of the message to localize
     */
    getLocale(stringId) {
        const elementId = 'presentation-' + stringId.replace(/\./g, '-');
        const span = document.getElementById(elementId);
        if (span) {
            return span.innerText;
        }

        return stringId;
    }

    /**
     * Display a lizMap message
     *
     * @param {string} message  Message to display
     * @param {string} type     Type : error or info
     * @param {number} duration Number of millisecond the message must be displayed
     */
    addMessage(message, type, duration) {

        let previousMessage = document.getElementById('lizmap-presentation-message');
        if (previousMessage) previousMessage.remove();
        lizMap.mainLizmap.lizmap3.addMessage(
            message, type, true, duration
        ).attr('id', 'lizmap-presentation-message');
    }

    /**
     * Hide & empty a form.
     *
     */
    hideForm() {
        // Remove form content
        const formContainer = document.getElementById('lizmap-presentation-form-container')
        formContainer.innerHTML = '';
        formContainer.display = 'none';

        // Show the other presentation div
        const parentDiv = document.getElementById('lizmap-presentation-container');
        parentDiv.dataset.display = 'block';

        // Go back to original map size
        this.changeMapSize(null);

        this.LIZMAP_PRESENTATION_ACTIVE_EDITING_FORM = false;
    }

    /**
     * Set Lizmap interface (dock & map) according to the given page
     *
     * This is mainly used to set the correct width & margins
     *
     * @param {HTMLElement} page Lizmap presentation page component
     */
    setInterfaceFromPage(page) {
        // At present, all pages are shown with the dock taking half the screen size
        this.changeMapSize(this.LIZMAP_PRESENTATION_DOCK_SIZE);
    }

    /**
     * Set the map extent based on an extent string representation
     *
     * @param {string} mapExtentString The map extent string representation "xmin,ymin,xmax,ymax"
     *
     * @returns {boolean} True if the map extent has been set
     */
    setMapExtent(mapExtentString) {
        // Set map extent
        const newExtent = mapExtentString.split(',');
        if (newExtent.length == 4) {
            // We must convert extent to an array of numbers
            const newExtentNumber = newExtent.map(Number);
            // We must zoom a little bit more to be sure to be at the right scale
            // Only if we use view.fit
            // For view.animate and the calculation of zoom for extent, no gutter needed
            const gutter = 0;
            let smallerExtent = [
                newExtentNumber[0] + ((newExtentNumber[2]-newExtentNumber[0]) * gutter / 100),
                newExtentNumber[1] + ((newExtentNumber[3]-newExtentNumber[1]) * gutter / 100),
                newExtentNumber[2] - ((newExtentNumber[2]-newExtentNumber[0]) * gutter / 100),
                newExtentNumber[3] - ((newExtentNumber[3]-newExtentNumber[1]) * gutter / 100)
            ];
            // lizMap.mainLizmap.extent = newExtentNumber;
            const view = lizMap.mainLizmap.map.getView();

            // Fit to the extent: deactivated
            // view.fit(
            //     smallerExtent,
            //     {
            //         duration: 2000
            //     }
            // );

            // Animate the view to the extent
            // We must calculate the zoom for the given extent to fit, and the center
            const finalZoom = view.getZoomForResolution(
                view.getResolutionForExtent(
                    smallerExtent,
                    lizMap.mainLizmap.map.getSize()
                )
            );
            const finalCenter = [
                newExtentNumber[0] + ((newExtentNumber[2] - newExtentNumber[0]) / 2),
                newExtentNumber[1] + ((newExtentNumber[3] - newExtentNumber[1]) / 2)
            ];
            view.animate({
                center: finalCenter,
                zoom: finalZoom,
                duration: 500,
            });

            return true;
        }

        return false;
    }

    /**
     * Set the group and layers visibility based on a store JSON representation
     *
     * @param {string} treeStateString The JSON representation of the layer & group tree state
     *
     * @returns {boolean} True if the layer tree state has been set
     */
    setLayerTreeState(treeStateString) {
        try {
            const treeState = JSON.parse(treeStateString);
            if ('groups' in treeState && 'layers' in treeState) {
                // Base layer
                if ('baseLayer' in treeState) {
                    for (const baseLayer of lizMap.mainLizmap.state.baseLayers.getBaseLayers()) {
                        if (baseLayer.name == treeState.baseLayer) {
                            lizMap.mainLizmap.state.baseLayers.selectedBaseLayerName = treeState.baseLayer;
                            break;
                        }
                    }
                }

                // First set the layers checked status
                // layers can be an empty array. If so, all checked layers must be unchecked.
                const layers = lizMap.mainLizmap.state.layersAndGroupsCollection.layers;
                for (const layer of layers) {
                    layer.checked = (treeState.layers.includes(layer.name));
                }

                // Then the groups status
                // nb:  some layers could be checked but not visible
                // because one of their parent group is not checked)
                // groups can be an empty array. If so, all checked groups must be unchecked.
                const groups = lizMap.mainLizmap.state.layersAndGroupsCollection.groups;
                for (const group of groups) {
                    group.checked = (treeState.groups.includes(group.name));
                }

                return true;
            }
        } catch(error) {
            console.log(error);
            console.log(`Wrong tree state for the active presentation page ${uuid}`);
            return false;
        }

        return false;
    }

    /**
     * Set Lizmap interface view depending on active page
     *
     * @param {HTMLElement} page Visible page HTML element
     * @param {boolean} pageChanged  True if the page has changed
     */
    onPageVisible(page, pageChanged = false) {
        // Manage global uuid property
        const uuid = page.dataset.uuid;
        let newPageVisible = null;

        // Set the global object page UUID if not set yet
        if (this.LIZMAP_PRESENTATION_ACTIVE_PAGE_UUID === null) {
            this.LIZMAP_PRESENTATION_ACTIVE_PAGE_UUID = uuid;
            newPageVisible = uuid;
        }

        // Check if the active UUID is different from the given page uuid
        if (uuid != this.LIZMAP_PRESENTATION_ACTIVE_PAGE_UUID) {
            this.LIZMAP_PRESENTATION_ACTIVE_PAGE_UUID = uuid;
            newPageVisible = uuid;
        }

        // Set the active page number
        this.LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER = page.dataset.number;

        // Store when the page has valid map properties (extent or tree state)
        let hasMapProperties = false;

        // Change Lizmap state only if active page has changed
        if (newPageVisible !== null || pageChanged) {
            // Change Lizmap interface depending of the current page map properties
            this.setInterfaceFromPage(page);

            // Set Map extent if needed
            // Use OpenLayers animation
            const mapExtentString = page.properties.map_extent;
            if (mapExtentString !== null) {
                const extentSet = this.setMapExtent(mapExtentString);
                if (extentSet) hasMapProperties = true;
            }

            // Set layer tree state if needed
            const treeStateString = page.properties.tree_state;
            if (treeStateString !== null) {
                const treeStateSet = this.setLayerTreeState(treeStateString);
                if (treeStateSet) hasMapProperties = true;
            }
        }
    }


    /**
     * Display the form to create a new presentation or a new page
     *
     * @param {string} itemType Type of item to edit: presentation or page.
     * @param {null|number} id Id of the presentation or page. If null, it is a creation form.
     * @param {null|number} presentation_id Id of the parent presentation. Only for creation of page
     */
    async launchPresentationCreationForm(itemType = 'presentation', id = null, presentation_id = null) {
        const waitMessage = this.getLocale('message.form.process.wait');
        this.addMessage(waitMessage, 'info', 60000);

        // Reset the active presentation
        try {
            // Get the form
            const url = presentationConfig.url;
            const request = (id === null) ? 'create' : 'modify';
            let formData = new FormData();
            formData.append('request', request);
            formData.append('id', id);
            formData.append('item_type', itemType);
            if (itemType == 'page' && request == 'create' && presentation_id) {
                formData.append('presentation_id', presentation_id);
            }
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });

            // Check content type
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("text/plain")) {
                throw new TypeError("Wrong content-type. HTML Expected !");
            }

            // Get the response
            const htmlContent = await response.text();

            // Reset the active presentation if needed
            if (this.ACTIVE_LIZMAP_PRESENTATION) this.resetLizmapPresentation(true, false);

            // Hide the visible presentation elements in the dock panel
            const parentDiv = document.getElementById('lizmap-presentation-container');
            parentDiv.dataset.display = 'none';

            // Set map size to 50% so that the extent will be correctly saved
            // At present, all pages are shown with the dock taking half the screen size
            this.changeMapSize(this.LIZMAP_PRESENTATION_DOCK_SIZE);

            // Display the form
            // Using innerHtml or insertAdjacentHTML prevents from running jForms embedded <script>
            // We should use jQuery html() method instead
            const formContainer = document.getElementById('lizmap-presentation-form-container')
            $('#lizmap-presentation-form-container').html(htmlContent);
            formContainer.display = 'block';

            // Change some fields
            const form = formContainer.querySelector('form');

            // Transform color fields into HTML5 fields
            Array.from(form.querySelectorAll('input[name$="_color"]')).map(element => {
                element.type = 'color';
                element.style.width = '50px';
                element.style.height = '30px';
                if (element.name == 'background_color' && element.value == '') {
                    element.value = '#FFFFFF';
                }
            });

            // Set the map extent and layers based on the stored page data
            if (itemType == 'page' && request == 'modify') {
                // Set Map extent if needed
                const mapExtentInput = form.querySelector('input[name="map_extent"]');
                if (mapExtentInput && mapExtentInput.value) {
                    this.setMapExtent(mapExtentInput.value);
                }

                // Set layer tree state if needed
                const treeStateInput = form.querySelector('input[name="tree_state"]');
                if (treeStateInput && treeStateInput.value) {
                    this.setLayerTreeState(treeStateInput.value);
                }
            }

            // Add forms events
            this.addFormEvents(form);

            // Remove message
            const editMessage = this.getLocale('message.form.presentation.edit');
            this.addMessage(editMessage, 'info', 5000);

            this.LIZMAP_PRESENTATION_ACTIVE_EDITING_FORM = true;

        } catch(error) {
            console.log(error);
            let previousMessage = document.getElementById('lizmap-presentation-message');
            if (previousMessage) previousMessage.remove();
            const errorMessage = `
                <b>${error}</b>
            `;
            console.error(errorMessage);
            this.addMessage(errorMessage, 'error', 5000);
        }
    }

    /**
     * Add the map related buttons in the presentation page editing form.
     *
     * One button to save the map extent,
     * another one to save the layer tree state.
     *
     */
    addMapButtonsToPageForm() {

        // Page form - Add map & bbox buttons after the model combobox
        // Find the form field allowing to change the page model
        // We would like to add the map buttons afterwards
        const mapGroup = document.getElementById('jforms_presentation_presentation_page_map');
        // Template of the div containing the map buttons
        const mapButtonTemplate = document.getElementById('lizmap-presentation-page-edit-map-buttons-template');

        if (mapGroup && mapButtonTemplate) {
            // Add content of the template after the group of the field page_model
            const mapGroupDiv = mapGroup.querySelector('div.jforms-table-group');
            if (mapGroupDiv) mapGroupDiv.insertAdjacentHTML('beforeend', mapButtonTemplate.innerHTML);

            // Add extent button interactivity
            // Check if form contains data
            const bboxButton = document.getElementById('presentation-page-add-bbox');
            const dropBboxButton = document.getElementById('presentation-page-drop-bbox');
            bboxButton.innerText = bboxButton.dataset.labelEmpty;
            const mapExtentValue = document.querySelector('#lizmap-presentation-form-container form input[name="map_extent"]').value;
            if (mapExtentValue != '') {
                bboxButton.innerText = bboxButton.dataset.labelSaved;
                bboxButton.classList.add('has-data');
            }
            bboxButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Get bbox and store it in the hidden field
                const extent = lizMap.mainLizmap.state.map.extent;
                const extentInput = document.querySelector('#lizmap-presentation-form-container form input[name="map_extent"]');
                const extentValue = extent.join(',');
                extentInput.value = extentValue;
                this.innerText = this.dataset.labelSaved;
                dropBboxButton.classList.add('has-data');

                const extentMessage = lizMap.mainLizmap.presentation.getLocale('message.form.extent.saved');
                lizMap.mainLizmap.presentation.addMessage(extentMessage, 'info', 5000);

                return false;
            });
            if (mapExtentValue != '') {
                dropBboxButton.classList.add('has-data');
            }
            dropBboxButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const extentInput = document.querySelector('#lizmap-presentation-form-container form input[name="map_extent"]');
                extentInput.value = '';
                this.classList.remove('has-data');
                const addButton = document.getElementById('presentation-page-add-bbox');
                addButton.classList.remove('has-data');
                addButton.innerText = addButton.dataset.labelEmpty;
            });

            // Add tree state button interactivity
            const treeButton = document.getElementById('presentation-page-add-tree-state');
            const dropTreeButton = document.getElementById('presentation-page-drop-tree-state');
            treeButton.innerText = treeButton.dataset.labelEmpty;
            const treeValue = document.querySelector('#lizmap-presentation-form-container form input[name="tree_state"]').value;
            if (treeValue != '') {
                treeButton.innerText = treeButton.dataset.labelSaved;
                treeButton.classList.add('has-data');
            }
            treeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Get layer tree state and store it in the hidden field
                const layers = lizMap.mainLizmap.state.layersAndGroupsCollection.layers;
                const groups = lizMap.mainLizmap.state.layersAndGroupsCollection.groups;
                const checkedLayers = layers.filter(l => (l.checked)).map(l => l.name);
                const checkedGroups = groups.filter(g => (g.checked)).map(g => g.name);
                const treeStateInput = document.querySelector('#lizmap-presentation-form-container form input[name="tree_state"]');
                const activeBaseLayer = lizMap.mainLizmap.state.baseLayers.selectedBaseLayerName;
                const treeStateValue = JSON.stringify(
                    {'groups': checkedGroups, 'layers': checkedLayers, 'baseLayer': activeBaseLayer}
                );
                treeStateInput.value = treeStateValue;
                this.innerText = this.dataset.labelSaved;
                dropTreeButton.classList.add('has-data');

                const treeStateMessage = lizMap.mainLizmap.presentation.getLocale('message.form.tree.state.saved');
                lizMap.mainLizmap.presentation.addMessage(treeStateMessage, 'info', 5000);

                return false;
            });
            if (treeValue != '') {
                dropTreeButton.classList.add('has-data');
            }
            dropTreeButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                const treeStateInput = document.querySelector('#lizmap-presentation-form-container form input[name="tree_state"]');
                treeStateInput.value = '';
                this.classList.remove('has-data');
                const addButton = document.getElementById('presentation-page-add-tree-state');
                addButton.classList.remove('has-data');
                addButton.innerText = addButton.dataset.labelEmpty;
            });
        }
    }

    /**
     * Add interactivity between presentation page editing form comboboxes
     */
    activatePageFormComboboxesInteractivity(form) {
        const modelInput = document.getElementById('jforms_presentation_presentation_page_model');
        modelInput.addEventListener('change', function(event) {
            const modelValue = event.currentTarget.value;

            // Hide or show illustration relative fields
            const inputDisplay = (modelValue == 'text') ? 'none' : 'block';

            // Illustration group
            const illustrationGroup = document.getElementById('jforms_presentation_presentation_page_illustration');
            illustrationGroup.closest('div.control-group').style.display = inputDisplay;

            // illustration type
            const typeInput = document.getElementById('jforms_presentation_presentation_page_illustration_type');
            typeInput.closest('div.control-group').style.display = inputDisplay;
            if (modelValue == 'text') {
                typeInput.value = '';
                typeInput.dispatchEvent(new Event('change'));
            }

            // illustration media file
            const fileLabel = document.getElementById('jforms_presentation_presentation_page_illustration_media_label');
            fileLabel.closest('div.control-group').style.display = inputDisplay;

            // Illustration URL
            const urlInput = document.getElementById('jforms_presentation_presentation_page_illustration_url');
            urlInput.closest('div.control-group').style.display = inputDisplay;

            // Illustration display, if it is an image
            const imageDisplay = document.getElementById('jforms_presentation_presentation_page_illustration_display');
            imageDisplay.closest('div.control-group').style.display = inputDisplay;
        });

        // Illustration type
        const typeInput = document.getElementById('jforms_presentation_presentation_page_illustration_type');
        typeInput.addEventListener('change', function(event) {
            const typeValue = event.currentTarget.value;

            if (typeValue == '') {
                // URL
                const urlInput = document.getElementById('jforms_presentation_presentation_page_illustration_url');
                // urlInput.value = '';

                // File
                const delFileRadio = document.getElementById('jforms_presentation_presentation_page_illustration_media_jf_action_del');
                if (delFileRadio) delFileRadio.click();
            } else {
                // File
                const keepFileRadio = document.getElementById('jforms_presentation_presentation_page_illustration_media_jf_action_keep');
                if (keepFileRadio) keepFileRadio.click();
            }
        });

    }


    /**
     * Trigger actions when submitting the form
     *
     * @param {HTMLFormElement} form
     */
    addFormEvents(form) {

        // Detect click on the submit buttons
        // to change the hidden input submit_button value
        Array.from(form.querySelectorAll('input[type=submit]')).map(element => {
            element.addEventListener('click', function(event) {
                const button = event.currentTarget;
                form.querySelector("input[name=submit_button]").value = button.name;
            });
        });

        // Get some form data
        const formData = new FormData(form);
        const itemType = formData.get('item_type');

        // Add button dedicated to save the map status:
        // map extent && layer tree state
        if (itemType == 'page') {
            this.addMapButtonsToPageForm();
        }

        // Add comboboxes interactivity
        if (itemType == 'page') {
            this.activatePageFormComboboxesInteractivity();

            // Trigger model type change
            const modelInput = document.getElementById('jforms_presentation_presentation_page_model');
            if (modelInput) modelInput.dispatchEvent(new Event('change'));
        }

        // Listen to the form submit
        const formId = (itemType == 'presentation') ? 'jforms_presentation_presentation' : 'jforms_presentation_presentation_page';
        jFormsJQ.onFormReady(formId,
            function(jForm) {
                jFormsJQ.getForm(formId).addSubmitHandler(function(ev){
                    // Display a message to inform the user that the form is being processed
                    const waitMessage = lizMap.mainLizmap.presentation.getLocale('message.form.process.wait');
                    lizMap.mainLizmap.presentation.addMessage(waitMessage, 'info', 60000);

                    // We must detect which button has been clicked
                    // and prevent from submitting the form if it is not
                    const formElt = document.querySelector('#lizmap-presentation-form-container form');
                    const formData = new FormData(formElt);
                    const formDataObject = Object.fromEntries(formData)
                    const formAction = formDataObject['submit_button'];

                    // Do not submit with buttons which have not the submit name
                    // console.log(formAction);
                    if (formAction != 'submit') {
                        // Return to the list of presentations if user canceled
                        if (formAction == 'cancel') {
                            lizMap.mainLizmap.presentation.hideForm();
                            let previousMessage = document.getElementById('lizmap-presentation-message');
                            if (previousMessage) previousMessage.remove();

                            // Refresh presentation
                            const cardsElement = document.querySelector('#presentation-list-container lizmap-presentation-cards');

                            // Changing this attribute triggers the reload of the presentations data
                            // If a presentation was running (variable ACTIVE_LIZMAP_PRESENTATION)
                            // it will displayed again)
                            cardsElement.setAttribute('updated', 'done');
                        }

                        return false;
                    }

                    return true;
                });

                // on active le submit avec xhr
                jForm.submitWithXHR(
                    // callback when the form action returns success
                    function(result) {
                        // console.log(result);
                        // Success message
                        lizMap.mainLizmap.presentation.addMessage(result.customData.message, 'info', 5000);

                        // Refresh the content of the list of presentations
                        // TODO : use the data given in result.customData & avoid getting data from the form
                        const formElt = document.querySelector('#lizmap-presentation-form-container form');
                        const formData = new FormData(formElt);
                        const itemType = formData.get('item_type');
                        const presentationId = (itemType == 'presentation') ? formData.get('id') : formData.get('presentation_id');
                        const cardsElement = document.querySelector('#presentation-list-container lizmap-presentation-cards');

                        // Setting this attribute detail to the presentation ID triggers the display of its details
                        cardsElement.setAttribute('detail', presentationId);

                        // Changing this attribute triggers the reload of the presentations data
                        // If a presentation was running (variable ACTIVE_LIZMAP_PRESENTATION)
                        // it will displayed again)
                        cardsElement.setAttribute('updated', 'done');

                        // Go back to the list of presentations
                        lizMap.mainLizmap.presentation.hideForm();

                        // If the presentation was running, refresh it
                        // It is done by the component PresentationCards since the change of the updated attribute
                        // triggers a request and here we cannot wait for it to finish

                    },

                    // callback when the form action returns errors
                    function(result) {
                        let errorMessage = lizMap.mainLizmap.presentation.getLocale('message.form.error.occurred');;
                        if (result.customData && 'message' in result.customData) {
                            errorMessage = result.customData.message;
                        } else if ('errorMessage' in result) {
                            errorMessage = result.errorMessage;
                            // Add more detail if present
                            if (result.customData && 'errors' in result.customData) {
                                for (const e in result.customData.errors) {
                                    const errorItem = result.customData.errors[e];
                                    errorMessage += `<p>${errorItem.title}: ${errorItem.detail}</p>`;
                                }
                            }
                        } else if ('errors' in result) {
                            errorMessage = '';
                            // Get field labels
                            const fieldLabels = result.customData.fieldLabels;
                            for (const [field, message] of Object.entries(result.errors)) {
                                errorMessage += `<b>${fieldLabels[field]}</b>: ${message}<br/>`;
                            }
                        }
                        console.error(errorMessage);
                        lizMap.mainLizmap.presentation.addMessage(errorMessage, 'error', 30000);
                    }
                );
            }
        );
    }

    /**
     * Delete the given presentation or page by its id.
     *
     * @param {string} itemType Type of item : presentation or page
     * @param {number} id ID of the presentation to delete
     */
    deletePresentation(itemType = 'presentation', id) {

        const waitMessage = this.getLocale('message.form.process.wait');
        this.addMessage(waitMessage, 'info', 60000);

        const url = presentationConfig.url;
        const formData = new FormData();
        formData.append('request', 'delete');
        formData.append('id', id);
        formData.append('item_type', itemType);
        fetch(url, {
            method: 'POST',
            body: formData
        }).then(function (response) {
            if (response.ok) {
                return response.text();
            }

            return Promise.reject(response);
        }).then(function (html) {
            // Display a message
            const message = html;
            lizMap.mainLizmap.presentation.addMessage(message, 'info', 10000);

            // Refresh the content of the list of presentations
            const cardsElement = document.querySelector('#presentation-list-container lizmap-presentation-cards');
            cardsElement.setAttribute('updated', 'done');
        }).catch(function (error) {
            console.warn(error);
        });
    }

};

(function () {
    lizMap.events.on({
        'uicreated': function(event) {
            // Initialize Lizmap presentation class
            const presentationInstance = new Presentation();
            lizMap.mainLizmap.presentation = presentationInstance;

            // Add component
            if (presentationInstance.modulePresentationAvailable) {
                // Insert the <lizmap-presentation-cards> component
                const presentationComponentTarget = document.querySelector('#lizmap-presentation-container div.lizmap-presentation-card-container');
                if (presentationComponentTarget) {
                    presentationComponentTarget.innerHTML = `
                    <lizmap-presentation-cards id="lizmap-project-presentations" detail=""></lizmap-presentation-cards>
                    `;
                }
            }
        }
    });

    return {};
})();
