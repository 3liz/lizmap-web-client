/**
 * @module components/PresentationPage.js
 * @name PresentationPage
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

import { mainLizmap } from '../modules/Globals.js';

/**
 * @class
 * @name PresentationPage
 * @augments HTMLElement
 */
export default class PresentationPage extends HTMLElement {

    constructor() {
        super();

        // Id of the component
        this.uuid = this.getAttribute('data-uuid');

        // Page visibility
        this.active = this.getAttribute('data-active');

        // Presentation properties
        this._presentation = null;

        // Properties
        this._properties = null;
    }

    load() {
        this.render();
    }

    render() {
        // Base URL for media files
        const mediaUrl = `${lizUrls.media}?repository=${lizUrls.params.repository}&project=${lizUrls.params.project}&path=`;

        // Remove previous content
        this.innerHTML = '';

        // Get the base content of a card from the template
        const pageTemplate = document.getElementById('lizmap-presentation-page-template');
        this.innerHTML = pageTemplate.innerHTML;

        // Set the content of the child HTML elements
        if (this._properties === null) {
            return;
        }

        // title of the page
        const pageTitle = this.querySelector('h2.lizmap-presentation-page-title');
        pageTitle.innerHTML = this._properties['title'];

        // Content
        const pageContent = this.querySelector('div.lizmap-presentation-page-content');
        const textDiv = pageContent.querySelector('.lizmap-presentation-page-text');
        const illustrationDiv = pageContent.querySelector('.lizmap-presentation-page-media');

        // Page model
        const pageModel = this._properties['model'];

        // Description
        const description = this._properties['description'];
        if (pageModel != 'media') {
            textDiv.innerHTML = description;
        }

        // Illustration
        let illustrationHtml = '';
        let illustrationValue = '';
        if (pageModel != 'text') {
            switch (this._properties['illustration_type']) {
                case 'none':
                    break;
                case 'image':
                    illustrationValue = this._properties['illustration_media'];
                    illustrationHtml = `
                    <div style="
                        width: 100%; height: 100%;
                        margin: 0px; padding: 0px;
                        background-image: url(${mediaUrl}${illustrationValue});
                        background-position: center;
                        background-size: cover;
                        background-repeat: no-repeat;"
                        title="${illustrationValue}"
                    >
                    `;
                    break;
                case 'video':
                    illustrationValue = this._properties['illustration_media'];
                    illustrationHtml = `
                    <video controls style="
                        width: 100%; height: 100%;
                        margin: 0px; padding: 0px;"
                        title="${illustrationValue}"
                    >
                        <source src="${mediaUrl}${illustrationValue}" type="video/${fileExtension}"/>
                    </video>
                    `;
                    break;
                case 'iframe':
                    illustrationValue = this._properties['illustration_url'];
                    illustrationHtml = `
                    <iframe style="
                        width: 100%; height: 100%;
                        margin: 0px; padding: 0px;"
                        src="${illustrationValue}"
                    />
                    `;
                    break;
                case 'popup':
                    illustrationHtml = `
                    <div style="
                        width: 100%; height: 100%;
                        margin: 0px; padding: 0px;"
                    >POPUP CONTENT</div>
                    `;
                    break;
                default:
                    console.log(`Illustration type ${this._properties['illustration_type']} not valid.`);

            }
            illustrationDiv.innerHTML = illustrationHtml;
        }

        let flexDirection = 'column';
        switch (pageModel) {
            case 'text':
                break;
            case 'media':
                break;
            case 'text-left-media':
                flexDirection = 'row';
                break;
            case 'media-left-text':
                flexDirection = 'row-reverse';
                break;
            case 'text-above-media':
                flexDirection = 'column';
                break;
            case 'media-above-text':
                flexDirection = 'column-reverse';
                break;
            default:
                console.log(`Model ${this._properties['title']} not valid.`);
        }
        pageContent.style.flexDirection = flexDirection;

        // Set some properties
        // Nullify text div padding if it must not be visible
        textDiv.style.padding = (pageModel != 'media') ? '20px' : '0px';

        // Nullify flex if object must not be visible
        textDiv.style.flex = (pageModel != 'media') ? '1' : '0';
        illustrationDiv.style.flex = (pageModel != 'text') ? '1' : '0';

        // Page background color from the presentation data
        if (this._presentation['background_color']) {
            this.style.backgroundColor = this._presentation['background_color'];
        }
        // override it if the page background color is also set
        if (this._properties['background_color']) {
            this.style.backgroundColor = this._properties['background_color'];
        }

        // Page background image from the presentation data
        if (this._presentation['background_image']) {
            this.style.backgroundImage = `url(${mediaUrl}${this._presentation['background_image']})`;
            this.classList.add(`background-${this._presentation['background_display']}`);
        }
        // override it if the page background color is also set
        if (this._properties['background_image']) {
            this.style.backgroundImage = `url(${mediaUrl}${this._properties['background_image']})`;
        }

    }

    /**
     * Set the parent presentation properties
     *
     */
    set presentation(value) {
        this._presentation = value;
    }

    /**
     * Get the page properties
     */
    get presentation() {
        return this._presentation;
    }

    /**
     * Set the page properties
     *
     */
    set properties(value) {
        this._properties = value;

        // Re-render with new data
        this.render();
    }

    /**
     * Get the page properties
     */
    get properties() {
        return this._properties;
    }

    connectedCallback() {
        this.load();
    }

    static get observedAttributes() { return ['data-active']; }

    attributeChangedCallback(name, oldValue, newValue) {
        // Listen to the change of specific attributes
        console.log(`attribute active changed from ${oldValue} to ${newValue}`);
    }

    disconnectedCallback() {
        // Remove page events
    }
}
