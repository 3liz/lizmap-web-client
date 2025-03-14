/**
 * @name PresentationPage
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */


/**
 * @class
 * @name PresentationPage
 * @augments HTMLElement
 */
class PresentationPage extends HTMLElement {

    constructor() {
        super();

        // UUID of the page
        this.uuid = this.getAttribute('data-uuid');

        // Page number
        this.number = this.getAttribute('data-page-number');

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

        // Anchor
        const pageAnchor = this.querySelector('a.lizmap-presentation-page-anchor');
        pageAnchor.setAttribute('name', this._properties['page_order']);

        // Toolbar buttons
        const editButton = this.querySelector('button.liz-presentation-edit.page');
        if (editButton) {
            editButton.value = this._properties['id'];
            editButton.addEventListener('click', function(event) {
                const button = event.currentTarget;
                const id = button.value;
                lizMap.mainLizmap.presentation.launchPresentationCreationForm('page', id);
            });
        }

        // title of the page
        const pageTitleElement = this.querySelector('h2.lizmap-presentation-page-title');
        const pageTitle = this._properties['title'];
        pageTitleElement.innerHTML = pageTitle;
        const titleVisible = (this._properties['title_visible'] && this._properties['title_visible'] == 't') ? true : false;
        if (!titleVisible) {
            pageTitleElement.style.display = 'none';
        } else {
            const titleAlign = (['left', 'center', 'right'].includes(this._properties['title_align'])) ? this._properties['title_align'] : 'left';
            pageTitleElement.style.textAlign = titleAlign;
        }


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
            const illustrationUrl = this._properties['illustration_url'];
            const illustrationType = this._properties['illustration_type'];
            if (illustrationType == 'image') {
                illustrationValue = this._properties['illustration_media'];
                let imageUrl = `${mediaUrl}${illustrationValue}`;
                if (!illustrationValue && illustrationUrl && illustrationUrl.startsWith('http')) {
                    imageUrl = illustrationUrl;
                    illustrationValue = illustrationUrl;
                }
                // override image display style
                let imageDisplay = 'cover';
                if (this._properties['illustration_display']) {
                    imageDisplay = this._properties['illustration_display'];
                }
                illustrationHtml = `
                <div
                    class="media-content media-image illustration-${imageDisplay}"
                    style="background-image: url(${imageUrl});"
                    title="${illustrationValue}"
                ></div>
                `;
            } else if (illustrationType == 'video') {
                illustrationValue = this._properties['illustration_media'];
                if (illustrationValue) {
                    illustrationHtml = `
                    <video controls
                        class="media-content media-video"
                        title="${illustrationValue}"
                    >
                        <source src="${mediaUrl}${illustrationValue}"/>
                    </video>
                    `;
                }

                // Check if the given URL is a Youtube video
                if (!illustrationValue && illustrationUrl.startsWith('http') && illustrationUrl.includes('youtu')) {
                    const youTubeUrl = new URL(illustrationUrl);
                    if (youTubeUrl) {
                        let youTubeId = null;
                        if (illustrationUrl.includes('youtu.be')) {
                            youTubeId = youTubeUrl.pathname;
                        }
                        if (illustrationUrl.includes('youtube.com') && youTubeUrl.pathname == '/watch') {
                            youTubeId = youTubeUrl.searchParams.get('v');
                        }
                        if (youTubeId !== null) {
                            const youTubeSrc = `https://www.youtube.com/embed/${youTubeId}`;
                            illustrationHtml = `
                            <iframe
                                width="100%" height="100%"
                                class="media-content media-iframe"
                                src="${youTubeSrc}"
                                referrerpolicy="strict-origin-when-cross-origin"
                                allowfullscreen
                            />
                            `;
                        }
                    }
                }

            } else if (illustrationType == 'iframe') {
                illustrationValue = illustrationUrl;
                illustrationHtml = `
                <iframe
                    width="100%" height="100%"
                    class="media-content media-iframe"
                    src="${illustrationValue}"
                    allowfullscreen
                />
                `;
            } else if (illustrationType == 'popup') {
                illustrationHtml = `
                <div class="media popup" style="
                >POPUP CONTENT</div>
                `;
            }
            illustrationDiv.innerHTML = illustrationHtml;
        }

        let flexDirection = 'column';
        switch (pageModel) {
            case 'text':
            case null:
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
                console.log(`Model ${pageModel} for page ${this._properties['title']}.`);
        }
        pageContent.style.flexDirection = flexDirection;

        // Set some properties
        // Nullify text div padding if it must not be visible
        textDiv.style.margin = (pageModel != 'media') ? '10px' : '0px';

        // Nullify flex if object must not be visible
        textDiv.style.display = (pageModel != 'media') ? 'block' : 'none';
        illustrationDiv.style.display = !(['text'].includes(pageModel)) ? 'block' : 'none';

        // Page background color from the presentation data
        if (this._presentation['background_color']) {
            this.style.backgroundColor = this._presentation['background_color'];
        }
        // override it if the page background color is also set
        if (this._properties['background_color']) {
            this.style.backgroundColor = this._properties['background_color'];
        }

        // Page text color from the presentation data
        if (this._presentation['text_color']) {
            this.style.color = this._presentation['text_color'];
        }
        // override it if the page text color is also set
        if (this._properties['text_color']) {
            this.style.color = this._properties['text_color'];
        }

        // Page background image from the presentation data
        if (this._presentation['background_image']) {
            this.style.backgroundImage = `url(${mediaUrl}${this._presentation['background_image']})`;
            this.classList.add(`background-${this._presentation['background_display']}`);
        }
        // override it if the page background image is also set
        if (this._properties['background_image']) {
            this.style.backgroundImage = `url(${mediaUrl}${this._properties['background_image']})`;
            // Also override the backgroudn display
            if (this._properties['background_display']) {
                this.classList.remove(`background-${this._presentation['background_display']}`);
                this.classList.add(`background-${this._properties['background_display']}`);
            }
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

// Define the new web component
if ("customElements" in window) {
    window.customElements.define('lizmap-presentation-page', PresentationPage);
}
