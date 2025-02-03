/**
 * @module components/ActionSelector.js
 * @name ActionSelector
 * @copyright 2023 3Liz
 * @author DOUCHIN Michaël
 * @license MPL-2.0
 */

import {mainLizmap} from '../modules/Globals.js';

/**
 * @class
 * @name ActionSelector
 * @augments HTMLElement
 */
export default class ActionSelector extends HTMLElement {

    constructor() {
        super();

        this.id = this.getAttribute('id');
        this.scope = this.getAttribute('action-scope');
        this.layerId = this.getAttribute('action-layer-id');
        this.noSelectionWarning = this.getAttribute('no-selection-warning');

        // Get actions related to the element scope
        this.actions = mainLizmap.action.getActions(this.scope, this.layerId);
    }

    connectedCallback() {
        // Get the content from the template
        let template = document.getElementById('lizmap-action-item-list');
        this.innerHTML = template.innerHTML;

        // Add the options from the actions object
        const select = this.querySelector('select');
        for (let a in this.actions) {
            let action = this.actions[a];
            let option = document.createElement("option");
            option.text = action.title;
            option.value = action.name;
            select.add(option);
        }

        // Buttons are deactivated by default
        this.querySelector('button.action-run-button').disabled = true;
        this.querySelector('button.action-deactivate-button').disabled = true;

        // Add click event on the Run button
        const runButton = this.querySelector("button.action-run-button");
        runButton.addEventListener("click", this.onActionRunClick);

        // Add click event on the Deactivate button
        const deactivateButton = this.querySelector("button.action-deactivate-button");
        deactivateButton.addEventListener("click", this.onActionDeactivateClick);

        // Add change event on the select
        select.addEventListener('change', this.onActionSelectChange);
    }

    getActionByName(name) {
        for (let a in this.actions) {
            let action = this.actions[a];
            if (action.name == name) {
                return action;
            }
        }

        return null;
    }

    onActionSelectChange(event) {
        // Remove previous digitizing tool if any
        document.getElementById('action-digitizing')?.remove();

        // Get the host component
        let host = event.target.closest("lizmap-action-selector");

        // Get the select
        const select = host.querySelector('select.action-select');

        // Get the selected action name
        const actionName = select.value;

        // Change the status of the deactivate button
        host.querySelector('button.action-run-button').disabled = (!actionName);
        host.querySelector('button.action-deactivate-button').disabled = (!actionName);

        // Build the description
        const descriptionSpan = host.querySelector('.action-description');
        let description = descriptionSpan.getAttribute('data-default-value');
        if (actionName) {
            // Get action
            const action = host.getActionByName(actionName);
            description = action.title;
            if ('description' in action && action.description) {
                description = action.description;
            }
            if (action?.geometry) {
                const actionDigitizing = `<div id="action-digitizing"><lizmap-digitizing context="action" selected-tool="${action.geometry}" available-tools="${action.geometry}"></lizmap-digitizing><div id="action-message-html"></div></div>`;
                document.querySelector('.action-selector-container').insertAdjacentHTML('afterend', actionDigitizing);
                mainLizmap.digitizing.context = "action";
                mainLizmap.digitizing.toggleVisibility(true);
            } else {
                mainLizmap.digitizing.toolSelected = 'deactivate'
                mainLizmap.digitizing.toggleVisibility(false);
            }
        } else {
            mainLizmap.digitizing.toolSelected = 'deactivate'
            mainLizmap.digitizing.toggleVisibility(false);
        }

        descriptionSpan.textContent = description;
    }

    onActionRunClick(event) {
        // Get the host component
        let host = event.target.closest("lizmap-action-selector");

        // Get the select
        const select = host.querySelector('select.action-select');

        // Get the selected action name
        const actionName = select.value;

        if (actionName) {
            mainLizmap.action.runLizmapAction(actionName, host.scope, host.layerId, null, null);
        } else {
            lizMap.addMessage(host.noSelectionWarning, 'warning', true).attr('id', 'lizmap-action-message');
        }
    }

    onActionDeactivateClick() {
        // Deactivate the current active action
        mainLizmap.digitizing.eraseAll();
        mainLizmap.action.resetLizmapAction();
    }

    disconnectedCallback() {
        // Add click event on the Run button
        const runButton = this.querySelector("button.action-run-button");
        runButton.removeEventListener("click", this.onActionRunClick);

        // Add click event on the Deactivate button
        const deactivateButton = this.querySelector("button.action-deactivate-button");
        deactivateButton.removeEventListener("click", this.onActionDeactivateClick);

        // Add change event on the select
        const select = this.querySelector('select.action-select');
        select.removeEventListener('change', this.onActionSelectChange);
    }


}
