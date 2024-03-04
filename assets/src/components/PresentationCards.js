/**
 * @module components/PresentationCards.js
 * @name PresentationCards
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

import {mainLizmap} from '../modules/Globals.js';

/**
 * @class
 * @name PresentationCards
 * @augments HTMLElement
 */
export default class PresentationCards extends HTMLElement {

    constructor() {
        super();

        // Id of the component
        this.id = this.getAttribute('id');

        // Get presentations related to the element scope
        this.presentations = mainLizmap.presentation.getPresentations();
    }

    connectedCallback() {
        // Get the content from the template
        let template = document.getElementById('lizmap-presentation-card-template');

        // Add the Items from the presentations object
        for (let a in this.presentations) {
            // Get the presentation
            let presentation = this.presentations[a];

            // Create the div and fill it with the template content
            let div = document.createElement("div");
            div.classList.add('lizmap-presentation-card');
            div.innerHTML = template.innerHTML;

            // Edit the content
            div.querySelector('h3.lizmap-presentation-title').innerText = presentation.title;
            div.querySelector('p.lizmap-presentation-description').innerText = presentation.description;
            div.querySelector('button.liz-presentation-edit').value = presentation.id;
            div.querySelector('button.liz-presentation-delete').value = presentation.id;
            div.querySelector('button.liz-presentation-launch').value = presentation.id;

            // Add the card to the parent
            this.appendChild(div);
        }

        // Add click event on the create button
        const createButton = this.querySelector("button.liz-presentation-create");
        createButton.addEventListener("click", this.onButtonCreateClick);

        // Add click event on the presentation cards buttons
        const buttons = this.querySelectorAll("div.lizmap-presentation-card-toolbar button");
        Array.from(buttons).forEach(button => {
            if (button.classList.contains('liz-presentation-edit')) {
                button.addEventListener('click', this.onButtonEditClick);
            } else if (button.classList.contains('liz-presentation-delete')) {
                button.addEventListener('click', this.onButtonDeleteClick);
            } else if (button.classList.contains('liz-presentation-launch')) {
                button.addEventListener('click', this.onButtonLaunchClick);
            }
        });
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

    onButtonCreateClick(event) {
        // Get the host component
        const host = event.target.closest("lizmap-presentation-cards");

        console.log('Create a new presentation');
    }

    onButtonEditClick(event) {
        const button = event.currentTarget;
        const presentationId = button.value;
        console.log(`Edit the presentation ${presentationId}`);
    }

    onButtonDeleteClick(event) {
        const button = event.currentTarget;
        const presentationId = button.value;
        console.log(`Delete the presentation ${presentationId}`);
    }

    onButtonLaunchClick(event) {
        const button = event.currentTarget;
        const presentationId = button.value;
        console.log(`Launch the presentation ${presentationId}`);
        mainLizmap.presentation.runLizmapPresentation(presentationId);
    }

    disconnectedCallback() {
        // Remove click events on the presentation buttons
        const createButton = this.querySelector("button.liz-presentation-create");
        createButton.removeEventListener("click", this.onButtonCreateClick);
        const buttons = this.querySelectorAll("div.lizmap-presentation-card-toolbar button");
        Array.from(buttons).forEach(button => {
            if (button.classList.contains('liz-presentation-edit')) {
                button.removeEventListener('click', this.onButtonEditClick);
            } else if (button.classList.contains('liz-presentation-delete')) {
                button.removeEventListener('click', this.onButtonDeleteClick);
            } else if (button.classList.contains('liz-presentation-launch')) {
                button.removeEventListener('click', this.onButtonLaunchClick);
            }
        });
    }


}
