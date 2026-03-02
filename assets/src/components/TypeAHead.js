/**
 * @module components/TypeAHead.js
 * @name TypeAHead
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */

import { html, render } from 'lit-html';

/**
 * @class
 * @name TypeAHead
 * @augments HTMLElement
 */
export default class TypeAHead extends HTMLElement {

    /**
     * Array of CSS classes to apply to the main text input.
     * @type {string[]}
     */
    _classList;

    /**
     * Typing delay management function.
     * @type {Function}
     */
    _timeoutFunction;

    /**
     * Delay time in milliseconds to aply to the _timeoutFunction function.
     * @type {number}
     */
    _timeoutDelay;

    /**
     * Current value of the main text input while user is typing.
     * @type {string}
     */
    _currentSearchTerm;

    /**
     * Current value of the main text input.
     * @type {string}
     */
    _currentDescription;

    /**
     * List of possible key-value options filtered by text search.
     * The component is designed to display only the available options
     * and manage their selection by the user.
     * Any updated list of options must be set
     * by the parent component/element using the appropriate `option` setter.
     *
     * The objects in this property must contain at least two mandatory properties:
     * - an `id` property, which represents the key of the option
     * - a `description` property, which represents the value of the option
     * @type {object[]}
     */
    _options;

    /**
     * User is typing or not
     * @type {boolean}
     */
    _onSearch;

    /**
     * Max number of elements to display.
     * `_options` object will be sliced until this index.
     * This option is used to prevent adding a large amount of nodes to the DOM.
     * @type {number}
     */
    _displayItems;

    /**
     * True if options are sliced, false otherwise
     * Useful for warning the user that the search term has produced a
     * high number of results and that if they want to view all of them
     * they need to refine the search
     * @type {boolean}
     */
    _moreItems;

    /**
     * Main template HTML structure
     * @type {Function}
     */
    _mainTemplate;

    constructor(){
        super();
        this._classList = [];
        this._timeoutFunction = null;
        this._timeoutDelay = 200;
        this._currentSearchTerm = '';
        this._currentDescription = '';
        this._options = [];
        this._onSearch = false;
        this._displayItems = 100;
        this._moreItems = false;
    }

    /**
     * Current true input value
     * @type {string}
     */
    get value(){
        return this.hiddenInput?.value || '';
    }

    /**
     * returns the _options internal property
     * @type {object[]}
     */
    get options(){
        return this._options;
    }

    /**
     * Returns hidden input HTML node
     * @type {Element|null}
     */
    get hiddenInput(){
        return this.querySelector(".lizmap-typeahead-input");
    }

    /**
     * Returns text input HTML node
     * @type {Element|null}
     */
    get typeInput(){
        return this.querySelector(".lizmap-typeahead-text");
    }

    /**
     * Returns options result container HTML node
     * @type {Element|null}
     */
    get optionsContainer(){
        return this.querySelector(".lizmap-typeahead-options-container");
    }

    /**
     * Update the options list
     * @param {object[]} options - The new list of options
     */
    set options(options){
        // sort option list
        options = options.sort((a,b) => {
            if (a['description'] == b['description']) return 0;
            if (a['description'] > b['description']) return 1;
            if (a['description'] < b['description']) return -1;

            return 0;
        })

        // is there more items?
        this._moreItems = options.length > this._displayItems ? true : false;

        // limit options list
        this._options = [...options.slice(0, this._displayItems)];

        // update main template
        this._renderTemplate();
    }

    connectedCallback() {
        // obtain the class list from corresponding element attribute
        this._classList = this.getAttribute('classList')?.split(',') || [];

        this._mainTemplate = () => html`
            <div class='lizmap-typeahead-container'>
                <input type="hidden" class="lizmap-typeahead-input">
                <input
                    type="text"
                    class="lizmap-typeahead-text ${this._classList.join(' ')}"
                    @keyup=${this._handleKeyUp.bind(this)}
                    @blur=${this._handleBlur.bind(this)}
                >
                <div class='lizmap-typeahead-options-container'
                    @mouseup=${this._preventMuoseUpEvent.bind(this)}>
                        ${this.options.length ? html`
                            ${this.options.map((o,ind) =>
                                html`<span
                                    tabindex="${ind}"
                                    data-lizmap-typeahead="${o.id}">${o.description}</span>`)}
                            ${this._moreItems ? html`<div style="pointer-events:none;">...</div>`: ''}`
                        : html`<span data-lizmap-typeahead='no-data'>No data</span>`}
                </div>
            </div>
        `
        this._renderTemplate();

        // Initialize component values
        if (!this.hiddenInput.value &&
            !this.typeInput.value &&
            this.hasAttribute('init-value')
            && this.hasAttribute('init-description')) {

            this.hiddenInput.value = this.getAttribute('init-value') || '';
            this.typeInput.value = this._currentDescription = this.getAttribute('init-description') || '';
        }

    }

    disconnectedCallback(){

    }
    /**
     * Avoid unwanted side effetct derived from the mouseup event
     * on options container when container is removed after clicking an
     * option.
     *
     * @param {Event} e - mouseup event.
     * @returns {void}
     */
    _preventMuoseUpEvent(e){
        e.preventDefault();
        this._renderTemplate();
    }

    /**
     * Render the main template and set the options container panel position
     * as side effect.
     *
     * @returns {void}
     */
    _renderTemplate(){
        render(this._mainTemplate(), this);
        this._setOptionsContainerStyle();
    }

    /**
     * Adjust the width and position of the options container panel
     * based on the position of the main text input relative to the screen.
     *
     * @returns {void}
     */
    _setOptionsContainerStyle(){
        const width = this.typeInput.getBoundingClientRect().width;
        // get top position based on the position of the main text input relative to the screen
        const top = this._getOptionsContainerTopPosition();

        this.optionsContainer.style.top = top + 'px';
        this.optionsContainer.style.width = width + 'px';

        // show options container panel if user is typing
        if(this._onSearch) {
            this.optionsContainer.classList.add('on-search');
        } else this.optionsContainer.classList.remove('on-search');
    }

    /**
     * Get the options container top position.
     *
     * If the main text input is placed in the first half of the screen (from top)
     * then show the panel beneath the main text input. Else position the panel above it.
     *
     * @returns {number}
     */
    _getOptionsContainerTopPosition() {
        let rect = this.typeInput.getBoundingClientRect();
        if(rect.y <= window.innerHeight / 2) {
            return rect.y + rect.height + 10;
        } else {
            return rect.top - 10 - this.optionsContainer.getBoundingClientRect().height;
        }
    }

    /**
     * Determines the component's behavior in response to the main text input's keyup event.
     * To reduce the number of lizmap-typeahead-search events fired,
     * a timeout function has been applied.
     *
     * @param {Event} e keyup event
     * @fires TypeAHead#lizmap-typeahead-search
     * @returns {void}
     */
    _handleKeyUp(e){
        //const searchInputValue = e.target.value;
        this._onSearch = true;
        clearTimeout(this._timeoutFunction);
        this._timeoutFunction = setTimeout(()=>{
            // store the value of the current search
            this._currentSearchTerm = e.target.value;
            //const typeInputValue = this.typeInput.value;
            let event = new CustomEvent('lizmap-typeahead-search', {
                detail: this.typeInput.value,
                composed: true,
                bubbles: true
            });
            this.dispatchEvent(event);
        }, this._timeoutDelay)
    }

    /**
     * Determines the component's behavior in response to the main text input's blur event.
     * It manages the option's key-value mapping.
     * If a valid option is selected from those in the options property,
     * the main text input is filled with the option's description (value),
     * while the hidden input field is filled with the option's actual value (key).
     * Otherwhise, rolls back the state of the components to the previous valid selected option.
     * (an empty option is a valid selected option)
     *
     * @param {Event} e blur event
     * @fires TypeAHead#lizmap-typeahead-change
     * @returns {void}
     */
    _handleBlur(e) {
        let validPick = false;
        if(e.relatedTarget && e.relatedTarget.hasAttribute('data-lizmap-typeahead')){
            const hiddenInput = this.hiddenInput;
            hiddenInput.value = e.relatedTarget.getAttribute('data-lizmap-typeahead');
            this.typeInput.value = this._currentDescription = this._getValueDescription();
            validPick = true;
        } else {
            if(this._currentSearchTerm == '') {
                this.typeInput.value = '';
                this.hiddenInput.value = '';
            } else {
                this.typeInput.value = this._currentDescription;
            }
        }
        this._onSearch = false;
        if(!validPick) this._renderTemplate();

        let event = new CustomEvent('lizmap-typeahead-change', {
            detail:this.hiddenInput.value,
            composed:true,
            bubbles:true
        });

        this.dispatchEvent(event);
    }

    /**
     * Get the option description based on the option key.
     *
     * @returns {string}
     */
    _getValueDescription(){
        let opt = this._options.filter((o)=> o.id == this.hiddenInput.value);
        return opt.length ? opt[0].description : '';
    }
}
