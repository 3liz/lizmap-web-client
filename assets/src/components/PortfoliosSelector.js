/**
 * @module components/Portfolios.js
 * @name Portfolios
 * @copyright 2026 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { runPortfolio } from '../modules/action/Portfolio.js'

/**
 * @class
 * @name Portfolios
 * @augments HTMLElement
 * @example <caption>Example of use</caption>
 * <lizmap-portfolios-selector
 *     id="lizmap-project-portfolios"
 *     title="Select a portfolio"
 *     no-selection-warning="No portfolio selected"
 *     template-id="lizmap-portfolios-item-list">
 * </lizmap-portfolios-selector>
 */
export default class PortfoliosSelector extends HTMLElement {
    /**
     * The HTML element constructor
     * @class
     * @private
     */
    constructor() {
        super();

        this.id = this.getAttribute('id');
        this.title = this.getAttribute('title');

        this.noSelectionWarning = this.getAttribute('no-selection-warning');
        this.templateId = this.getAttribute('template-id');

        // Get portfolios related to the element scope
        this.config = mainLizmap.initialConfig.portfolios;
        this.state = null;

        // The dock handler
        this._dockHandler = null;
    }

    /**
     * Invoked when a component is added to the document's DOM.
     */
    connectedCallback() {
        // Get the content from the template
        let template = document.getElementById(this.templateId);
        this.innerHTML = template.innerHTML;

        // Add the portfolios from the portfolios list
        const select = this.querySelector('select');
        select.classList.add('form-select');
        for (const portfolio of this.config.list) {
            let option = document.createElement("option");
            option.text = portfolio.title;
            option.value = this.config.list.indexOf(portfolio);
            select.add(option);
        }

        const runButton = this.querySelector("button.portfolio-run-button");
        const deactivateButton = this.querySelector("button.portfolio-deactivate-button");

        // Buttons are deactivated by default
        runButton.disabled = true;
        deactivateButton.disabled = true;

        // Add click event on the Run button
        runButton.addEventListener("click", this.onPortfolioRunClick);
        deactivateButton.addEventListener("click", this.onPortfolioDeactivateClick);

        // Add change event on the select
        select.addEventListener('change', this.onPortfolioDeactivateClick);
        select.addEventListener('change', this.onPortfolioSelectChange);

        const state = mainLizmap.state.portfolios;

        this._dockHandler = (e) => {
            if (e.id === 'portfolios') {
                if (e.type === 'minidockopened') {
                    state.display();
                    this.onPortfolioDeactivateClick({target: this.querySelector('select.portfolio-select')});
                    this.onPortfolioSelectChange({target: this.querySelector('select.portfolio-select')});
                } else if (e.type === 'minidockclosed') {
                    console.log(e);
                    state.hide();
                    this._deactivateDigitizing();
                }
            }
        };
        lizMap.events.on({ minidockopened: this._dockHandler.bind(this) });
        lizMap.events.on({ minidockclosed: this._dockHandler.bind(this) });

        this.state = state;
    }

    _deactivateDigitizing() {
        this.querySelector('#portfolio-digitizing')?.remove();

        // Deactivate button
        this.querySelector('button.portfolio-run-button').disabled = true;

        // Deactivate digitizing
        mainLizmap.digitizing.toolSelected = 'deactivate';
        mainLizmap.digitizing.toggleVisibility(false);
        // Remove feature drawn listener
        mainEventDispatcher.removeListener(this.onDigitizingFeatureDrawn.bind(this), 'digitizing.featureDrawn');
        mainEventDispatcher.removeListener(this.onDigitizingFeatureErase.bind(this), 'digitizing.erase.all');
    }

    onPortfolioSelectChange(event) {
        // Get the host component
        let host = event.target.closest("lizmap-portfolios-selector");
        host._deactivateDigitizing();

        // Build the description
        const descriptionSpan = host.querySelector('.portfolio-description');
        let description = descriptionSpan.getAttribute('data-default-value');

        // Get the select
        const select = host.querySelector('select.portfolio-select');

        // Get the selected portfolio index
        const portfolioIdx = select.value;
        if (portfolioIdx) {
            // Get portfolio
            const portfolio = host.config.list[portfolioIdx];
            description = portfolio.title;
            if ('description' in portfolio && portfolio.description) {
                description = portfolio.description;
            }

            // Add digitizing component
            const portfolioDigitizing = `<div id="portfolio-digitizing">
            <lizmap-digitizing context="portfolio" selected-tool="${portfolio.drawingGeometry}" available-tools="${portfolio.drawingGeometry}">
            </lizmap-digitizing>
            <div id="portfolio-message-html"></div>
            </div>`;
            document.querySelector('.portfolio-selector-container').insertAdjacentHTML('afterend', portfolioDigitizing);
            // Activate digitizing module
            mainLizmap.digitizing.context = "portfolio";
            mainLizmap.digitizing.singlePartGeometry = true;
            mainLizmap.digitizing.toggleVisibility(true);
            mainLizmap.digitizing.toolSelected = portfolio.drawingGeometry;
            // Add feature drawn listener
            mainEventDispatcher.addListener(host.onDigitizingFeatureDrawn.bind(host), 'digitizing.featureDrawn');
            mainEventDispatcher.addListener(host.onDigitizingFeatureErase.bind(host), 'digitizing.erase.all');

            host.state.select(portfolioIdx);
        } else {
            host.state.select(-1);
        }

        descriptionSpan.textContent = description;
    }

    onPortfolioRunClick(event) {
        // Get the host component
        let host = event.target.closest("lizmap-portfolios-selector");

        // Get the select
        const select = host.querySelector('select.portfolio-select');

        // Get the selected portfolio name
        const portfolio = host.config.list[select.value];

        if (portfolio) {
            // Perform portfolio action
            runPortfolio(host.state);
        } else {
            lizMap.addMessage(host.noSelectionWarning, 'warning', true).attr('id', 'lizmap-portfolio-message');
        }
    }

    onPortfolioDeactivateClick(event) {
        // Deactivate the current active portfolio
        if (mainLizmap.digitizing.context === "portfolio") {
            mainLizmap.digitizing.eraseAll();
        }

        // Get the host component
        let host = event.target.closest("lizmap-portfolios-selector");
        // Disable deactivate button
        host.querySelector('button.portfolio-deactivate-button').disabled = true;
    }

    onDigitizingFeatureDrawn() {
        // Activate run button in case of digitizing context
        if (mainLizmap.digitizing.context === "portfolio" && mainLizmap.digitizing.visibility) {
            this.state.geometryDrawn();
            this.querySelector('button.portfolio-run-button').disabled = false;
        }
    }

    onDigitizingFeatureErase() {
        // Disable run button in case of digitizing context
        if (mainLizmap.digitizing.context === "portfolio" && mainLizmap.digitizing.visibility) {
            this.state.geometryCleared();
            this.querySelector('button.portfolio-run-button').disabled = true;
        }
    }

    disconnectedCallback() {
        // Add click event on the Run button
        const runButton = this.querySelector("button.portfolio-run-button");
        runButton.removeEventListener("click", this.onPortfolioRunClick);

        // Add change event on the select
        const select = this.querySelector('select.portfolio-select');
        select.removeEventListener('change', this.onPortfolioSelectChange);
        select.removeEventListener('change', this.onPortfolioDeactivateClick);

        if (this._dockHandler) {
            lizMap.events.off({ minidockopened: this._dockHandler });
            lizMap.events.off({ minidockclosed: this._dockHandler });
        }
    }
}
