/**
 * @name PresentationCards
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */


/**
 * @class
 * @name PresentationCards
 * @augments HTMLElement
 */
class PresentationCards extends HTMLElement {

    constructor() {
        super();

        // Id of the component
        this.id = this.getAttribute('id');

        // Presentations
        this.presentations = [];

        // Attribute to force the refresh of data
        // Store the last refresh timestamp
        this.updated = this.getAttribute('updated');

        // Presentation which must be shown
        this.detail = this.getAttribute('detail');
    }

    async load() {
        // Get presentations related to the element scope from query
        lizMap.mainLizmap.presentation.getPresentations()
            .then(data => {
                // Set property
                this.presentations = data;

                // Render
                this.render();

                // If a presentation was running, display it again
                if (lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION !== null) {
                    // Get active page
                    lizMap.mainLizmap.presentation.runLizmapPresentation(
                        lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION,
                        lizMap.mainLizmap.presentation.LIZMAP_PRESENTATION_ACTIVE_PAGE_NUMBER
                    );
                }
            })
            .catch(err => console.log(err))

    }

    getFieldDisplayHtml(field, fieldValue) {
        let fieldHtml = fieldValue;
        if (['background_image', 'illustration_media'].includes(field)) {
            const mediaUrl = `${lizUrls.media}?repository=${lizUrls.params.repository}&project=${lizUrls.params.project}&path=`;
            const fileExtension = fieldValue.split('.').pop().toLowerCase();
            if (['webm', 'mp4'].includes(fileExtension)) {
                fieldHtml = `
                    <video controls width="150" title="${fieldValue}">
                        <source src="${mediaUrl}${fieldValue}" type="video/${fileExtension}"/>
                    </video>
                `;
            } else if (['png', 'webp', 'jpeg', 'jpg', 'gif'].includes(fileExtension)) {
                fieldHtml = `<img src="${mediaUrl}${fieldValue + '#' + new Date().getTime()}" style="max-width:150px;max-height:150px;" title="${fieldValue}">`;
            } else {
                fieldHtml = fieldValue;
            }
        }

        return fieldHtml;
    }

    render() {

        // Check if a specific presentation must be shown
        const activePresentationId = parseInt(this.getAttribute('detail'));

        // Remove previous content
        this.innerHTML = '';

        // Get the base content of a card from the template
        const createTemplate = document.getElementById('lizmap-presentation-create-button-template');
        if (createTemplate) {
            this.innerHTML = createTemplate.innerHTML;
        }

        // Get the base content of a card from the template
        const cardTemplate = document.getElementById('lizmap-presentation-card-template');

        // Check if there is at least one presentation
        // Hide the tool for users not allowed to create presentations
        if (this.presentations.length == 0 && createTemplate === null) {
            lizMap.mainLizmap.presentation.hidePresentationDock();
        }

        // Load the existing presentations
        for (const a in this.presentations) {
            // Get the presentation
            const presentation = this.presentations[a];

            // Create the div and fill it with the template content
            let div = document.createElement("div");
            div.classList.add('lizmap-presentation-card');
            div.dataset.id = presentation.id;

            // Change display if given presentation ID is an integer
            let cardDisplay = 'normal';
            if (activePresentationId > 0) {
                const currentPresentationId = parseInt(presentation.id);
                const isDetail = (parseInt(currentPresentationId) == activePresentationId);
                if (isDetail) {
                    cardDisplay = 'detail';
                } else {
                    cardDisplay = 'none';
                }
            }
            div.dataset.display = cardDisplay;
            div.innerHTML = cardTemplate.innerHTML;

            // Title
            div.querySelector('h3.lizmap-presentation-title').innerHTML = `
                ${presentation.title}<span class="pull-right">${presentation.id}</span>
            `;

            // Description
            div.querySelector('p.lizmap-presentation-description').innerHTML = presentation.description;

            // Detailed information
            const table = div.querySelector('table.presentation-detail-table');
            if (table) {
                const fields = [
                    'background_color', 'background_image',
                    'footer', 'published', 'granted_groups',
                    'created_by', 'created_at', 'updated_by', 'updated_at'
                ];
                fields.forEach(field => {
                    let fieldValue = (!presentation[field]) ? '' : presentation[field];
                    const fieldHtml = this.getFieldDisplayHtml(field, fieldValue);
                    table.querySelector(`td.presentation-detail-${field}`).innerHTML = fieldHtml;
                })
            }

            // Buttons
            const detailButton = div.querySelector('button.liz-presentation-detail');
            if (detailButton) {
                detailButton.value = presentation.id;
                detailButton.innerText = (cardDisplay != 'detail') ? detailButton.dataset.label : detailButton.dataset.reverseLabel;
            }
            const editButton = div.querySelector('button.liz-presentation-edit');
            if (editButton) editButton.value = presentation.id;
            const deleteButton = div.querySelector('button.liz-presentation-delete');
            if (deleteButton) deleteButton.value = presentation.id;
            const launchButton = div.querySelector('button.liz-presentation-launch');
            if (launchButton) launchButton.value = presentation.id;
            const createPage = div.querySelector('button.liz-presentation-create.page');
            if (createPage) createPage.value = presentation.id;

            // Add pages preview (small vertical view of mini pages)
            this.renderPagesPreview(div, presentation);

            // Add the card to the parent
            this.appendChild(div);
        }

        // Add click event on the create button
        const createButtons = this.querySelectorAll("button.liz-presentation-create");
        Array.from(createButtons).forEach(createButton => {
            createButton.addEventListener("click", this.onButtonCreateClick);
        });

        // Add click event on the presentation cards buttons
        const buttons = this.querySelectorAll("div.lizmap-presentation-card-toolbar button, div.lizmap-presentation-page-preview-toolbar button");
        Array.from(buttons).forEach(button => {
            const classes = button.classList;
            if (classes.contains('liz-presentation-edit')) {
                button.addEventListener('click', this.onButtonEditClick);
            } else if (classes.contains('liz-presentation-delete')) {
                button.addEventListener('click', this.onButtonDeleteClick);
            } else if (classes.contains('liz-presentation-detail')) {
                button.addEventListener('click', this.onButtonDetailClick);
            } else if (classes.contains('liz-presentation-launch')) {
                button.addEventListener('click', this.onButtonLaunchClick);
            }
        });
    }

    /**
     * Render a presentation page preview
     *
     * @param {Object} page Presentation page object
     *
     * @return {HTMLDivElement} Page div to insert in the list
     */
    getPagePreview(page) {
        const pagePreviewTemplate = document.getElementById('lizmap-presentation-page-preview-template');
        const previewHtml = pagePreviewTemplate.innerHTML;

        let pageDiv = document.createElement('div');
        pageDiv.classList.add('lizmap-presentation-page-preview');
        pageDiv.dataset.presentationId = page.presentation_id;
        pageDiv.dataset.pageId = page.id;
        pageDiv.dataset.pageOrder = page.page_order;
        pageDiv.innerHTML = previewHtml;
        pageDiv.querySelector('h3.lizmap-presentation-page-preview-title').innerHTML = `
            ${page.title}<span class="pull-right">${page.page_order}</span>
        `;

        // Detailed information
        const pageTable = pageDiv.querySelector('table.presentation-detail-table');
        const pageFields = [
            // 'description'
            //, 'background_image'
        ];
        pageFields.forEach(field => {
            const pageTd = pageTable.querySelector(`td.presentation-page-${field}`);
            if (pageTd) {
                let pageFieldValue = (!page[field]) ? '' : page[field];
                const pageFieldHtml = this.getFieldDisplayHtml(field, pageFieldValue);
                pageTd.innerHTML = pageFieldHtml;
            }
        })

        const editButton = pageDiv.querySelector('button.liz-presentation-edit')
        if (editButton) editButton.value = page.id;
        const deleteButton = pageDiv.querySelector('button.liz-presentation-delete')
        if (deleteButton) deleteButton.value = page.id;

        return pageDiv;
    }

    /**
     * Render the pages preview of the given presentation
     * and add content in the given presentation div
     *
     * @param {HTMLDivElement} presentationDiv Div which must contain the pages preview
     * @param {Object} presentation Presentation properties
     */
    renderPagesPreview(presentationDiv, presentation) {
        let pageContainer = presentationDiv.querySelector('div.lizmap-presentation-card-pages-preview');
        presentation.pages.forEach(page => {
            const pagePreviewDiv = this.getPagePreview(page);
            pagePreviewDiv.setAttribute('draggable', 'true');
            pagePreviewDiv.addEventListener('dragstart', onDragStart)
            pagePreviewDiv.addEventListener('drop', OnDropped)
            pagePreviewDiv.addEventListener('dragenter', onDragEnter)
            pagePreviewDiv.addEventListener('dragover', onDragOver)
            pageContainer.appendChild(pagePreviewDiv);
        })

        // Utility functions for drag & drop capability
        function onDragStart (e) {
          const index = [].indexOf.call(e.target.parentElement.children, e.target);
          e.dataTransfer.setData('text/plain', index)
        }

        function onDragEnter (e) {
          cancelDefault(e);
        }

        function onDragOver (e) {
          cancelDefault(e);
        }

        function OnDropped (e) {
            cancelDefault(e)

            // Get item
            const item = e.currentTarget;

            // Get dragged item old and new index
            const oldIndex = e.dataTransfer.getData('text/plain');
            const newIndex = [].indexOf.call(item.parentElement.children, item);

            // Get the dropped item
            const dropped = item.parentElement.children[oldIndex];

            // Move the dropped items at new place
            if (newIndex < oldIndex) {
                item.before(dropped);
            } else {
                item.after(dropped);
            }

            // Recalculate page numbers
            let i = 1;
            let pagesNumbers = {};
            let pagesIds = [];
            let presentationId = null;
            for (const child of item.parentElement.children) {
                if (!child.classList.contains('lizmap-presentation-page-preview')) {
                    continue;
                }
                const pageOrder = i;
                child.dataset.pageOrder = pageOrder;
                child.querySelector('h3.lizmap-presentation-page-preview-title > span').innerText = pageOrder;
                presentationId = child.dataset.presentationId;
                const pageId = child.dataset.pageId;
                pagesNumbers[pageId] = pageOrder;
                pagesIds.push(pageId);
                i++;
            }

            if (presentationId !== null) {
                // Set the component presentation pages object
                const itemCards = item.closest('lizmap-presentation-cards');
                if (itemCards) {
                    itemCards.setPresentationPagesOrder(presentationId, pagesIds);
                }

                // Send new pagesNumbers to the server
                lizMap.mainLizmap.presentation.sendPresentationPaginationInformation(presentationId, pagesNumbers)
                .then(data => {
                    console.log('pagination modifiée');

                })
                .catch(err => console.log(err))
            }
        }

        function cancelDefault (e) {
          e.preventDefault();
          e.stopPropagation();

          return false;
        }

    }

    connectedCallback() {
        this.load();
    }

    static get observedAttributes() { return ['updated']; }

    attributeChangedCallback(name, oldValue, newValue) {
        // Listen to the change of the updated attribute
        // This will trigger the load (refresh the content)
        if (name === 'updated') {
            this.load();
        }
    }

    getPresentationById(presentationId) {
        for (let a in this.presentations) {
            let presentation = this.presentations[a];
            if (presentation.id == presentationId) {
                return presentation;
            }
        }

        return null;
    }




    /**
     * Reorder a presentation pages property to respect
     * the given order of pages.
     *
     * @param {integer} presentationId ID of the presentation
     * @param {array} pagesIds List of order page IDs
     *
     * @returns {boolean} True if changes have been made
     */

    setPresentationPagesOrder(presentationId, pagesIds) {
        let idx = null;
        let newPages = [];
        for (let a in this.presentations) {
            let presentation = this.presentations[a];
            if (presentation.id == presentationId) {
                idx = a;
                for (const i in pagesIds) {
                    const correspondingPage = presentation.pages.find(x => x.id === pagesIds[i]);
                    // Change page_order property
                    correspondingPage.page_order = parseInt(i)+1;
                    // Add page in the new array
                    newPages.push(correspondingPage);
                }
            }
        }
        if (idx !== null && newPages.length > 0) {
            this.presentations[idx].pages = newPages;
            return true;
        }

        return false;
    }

    onButtonCreateClick(event) {
        if (lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION !== null) {
            return false;
        }
        // Get the host component
        const host = event.target.closest("lizmap-presentation-cards");
        const button = event.currentTarget;
        const item = (button.classList.contains('presentation')) ? 'presentation' : 'page';
        if (item == 'presentation') {
            lizMap.mainLizmap.presentation.launchPresentationCreationForm(item);
        } else {
            const presentation_id = button.value;
            lizMap.mainLizmap.presentation.launchPresentationCreationForm(item, null, presentation_id);
        }
    }

    onButtonEditClick(event) {
        if (lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION !== null) {
            return false;
        }
        const button = event.currentTarget;
        const item = (button.classList.contains('presentation')) ? 'presentation' : 'page';
        const id = button.value;
        lizMap.mainLizmap.presentation.launchPresentationCreationForm(item, id);
    }

    onButtonDetailClick(event) {
        if (lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION !== null) {
            return false;
        }
        const host = event.target.closest("lizmap-presentation-cards");
        const button = event.currentTarget;
        const presentationId = button.value;

        // Chosen card
        const chosenCard = host.querySelector(`[data-id='${presentationId}']`);
        const isActive = (chosenCard.dataset.display == 'detail');

        // Set other cards status
        host.presentations.forEach(item => {
            const card = host.querySelector(`[data-id='${item.id}']`);
            const display = (isActive) ? 'normal' : 'none';
            card.dataset.display = display;
        })

        // Set the clicked card display property
        chosenCard.dataset.display = (isActive) ? 'normal' : 'detail';

        // Set its detail button label & title
        button.innerText = (isActive) ? button.dataset.label : button.dataset.reverseLabel;
        button.setAttribute('title', (isActive) ? button.dataset.title : button.dataset.reverseTitle);

        // Set the full panel class
        const parentDiv = document.getElementById('lizmap-presentation-container');
        parentDiv.dataset.display = (isActive) ? 'normal' : 'detail';
    }

    onButtonDeleteClick(event) {
        if (lizMap.mainLizmap.presentation.ACTIVE_LIZMAP_PRESENTATION !== null) {
            return false;
        }
        const host = event.target.closest("lizmap-presentation-cards");
        const button = event.currentTarget;
        const item = (button.classList.contains('presentation')) ? 'presentation' : 'page';
        const id = button.value;
        // Confirmation message
        const confirmMessage = button.dataset.confirm;
        const areYourSure = window.confirm(confirmMessage);
        if (!areYourSure) {
            return false;
        }
        lizMap.mainLizmap.presentation.deletePresentation(item, id);

        // Set all presentations visible
        const parentDiv = document.getElementById('lizmap-presentation-container');
        parentDiv.dataset.display = 'normal';
        host.presentations.forEach(item => {
            const card = host.querySelector(`[data-id='${item.id}']`);
            card.dataset.display = 'normal';
        })
    }

    onButtonLaunchClick(event) {
        const host = event.target.closest("lizmap-presentation-cards");
        const button = event.currentTarget;
        const presentationId = button.value;

        // Get presentation item
        const presentation = host.getPresentationById(presentationId);
        if (presentation === null) {
            return false;
        }

        lizMap.mainLizmap.presentation.runLizmapPresentation(presentationId);
    }


    disconnectedCallback() {
        // Remove click events on the presentation buttons
        const createButton = this.querySelector("button.liz-presentation-create");
        createButton.removeEventListener("click", this.onButtonCreateClick);
        const buttons = this.querySelectorAll("div.lizmap-presentation-card-toolbar button, div.lizmap-presentation-page-preview-toolbar button");
        Array.from(buttons).forEach(button => {
            if (button.classList.contains('liz-presentation-edit')) {
                button.removeEventListener('click', this.onButtonEditClick);
            } else if (button.classList.contains('liz-presentation-delete')) {
                button.removeEventListener('click', this.onButtonDeleteClick);
            } else if (button.classList.contains('liz-presentation-detail')) {
                button.removeEventListener('click', this.onButtonDetailClick);
            } else if (button.classList.contains('liz-presentation-launch')) {
                button.removeEventListener('click', this.onButtonLaunchClick);
            }
        });
    }
}

// Define the new web component
if ("customElements" in window) {
    window.customElements.define('lizmap-presentation-cards', PresentationCards);
}
