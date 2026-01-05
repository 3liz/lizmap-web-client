/**
 * @module modules/FeaturePickerPopup.js
 * @name FeaturePickerPopup
 * @copyright 2024 3Liz
 * @license MPL-2.0
 */

/**
 * Popup for selecting features at a clicked position
 * @class
 */
export default class FeaturePickerPopup {
    constructor(map) {
        this._map = map;
        this._popup = null;
        this._features = [];
        this._highlightLayer = null;
        this._createHighlightLayer();
    }

    /**
     * Create OpenLayers layer for feature highlighting
     */
    _createHighlightLayer() {
        // Create temporary vector layer for highlighting
        this._highlightLayer = new OpenLayers.Layer.Vector('FeaturePickerHighlight', {
            displayInLayerSwitcher: false,
            styleMap: new OpenLayers.StyleMap({
                'default': new OpenLayers.Style({
                    fillColor: '#ffaa00',
                    fillOpacity: 0.3,
                    strokeColor: '#ff6600',
                    strokeWidth: 3,
                    strokeOpacity: 0.8
                })
            })
        });
        this._map.addLayer(this._highlightLayer);
    }

    /**
     * Show popup with feature list
     * @param {Array} features - Array of features with metadata
     * @param {object} coordinate - Click coordinates {x, y}
     * @param {Function} onSelect - Callback when feature is selected
     */
    show(features, coordinate, onSelect) {
        this._features = features;
        this._onSelect = onSelect;

        // Create popup HTML
        const popupHtml = this._createPopupHtml(features);

        // Create popup element
        this._popup = $('<div>')
            .attr('id', 'feature-picker-popup')
            .addClass('feature-picker-popup')
            .html(popupHtml)
            .css({
                position: 'absolute',
                left: coordinate.x + 10 + 'px',
                top: coordinate.y + 10 + 'px',
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                padding: '8px',
                zIndex: 10000,
                minWidth: '250px',
                maxWidth: '400px',
                maxHeight: '300px',
                overflow: 'auto'
            });

        // Add to map container
        $('#map').append(this._popup);

        // Attach event handlers
        this._attachEventHandlers();
    }

    /**
     * Create HTML for popup table
     * @param {Array} features - Array of features
     * @returns {string} HTML string
     */
    _createPopupHtml(features) {
        let html = '<div class="feature-picker-header">';
        html += '<h5 style="margin: 0 0 4px 0; padding-bottom: 8px; border-bottom: 2px solid #ddd; font-size: 14px; font-weight: bold;">Select feature to copy</h5>';
        html += '<button class="close-btn" style="float:right; margin-top: -28px; border:none; background:none; cursor:pointer; font-size:20px; line-height:16px; padding:0 4px;">&times;</button>';
        html += '</div>';
        html += '<table class="table table-condensed table-hover" style="margin:0; width:100%; font-size:12px; border-top:none;">';
        html += '<tbody>';

        features.forEach((feature, index) => {
            html += `<tr class="feature-row" data-index="${index}" style="cursor:pointer;">`;
            html += `<td style="border-top:none;">${this._escapeHtml(feature.layerName)}</td>`;
            html += '</tr>';
        });

        html += '</tbody></table>';
        return html;
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Attach event handlers for hover and click
     */
    _attachEventHandlers() {
        const self = this;

        // Close button
        this._popup.find('.close-btn').on('click', () => {
            this.hide();
        });

        // Row hover - highlight feature
        this._popup.find('.feature-row').on('mouseenter', function() {
            const index = $(this).data('index');
            self._highlightFeature(index);
        });

        this._popup.find('.feature-row').on('mouseleave', function() {
            self._clearHighlight();
        });

        // Row click - select feature
        this._popup.find('.feature-row').on('click', function() {
            const index = $(this).data('index');
            self._selectFeature(index);
        });

        // Click outside popup to close
        $(document).on('click.featurePicker', (event) => {
            if (!$(event.target).closest('#feature-picker-popup').length) {
                self.hide();
            }
        });
    }

    /**
     * Highlight a feature on the map
     * @param {number} index - Index of feature to highlight
     */
    _highlightFeature(index) {
        this._clearHighlight();

        const feature = this._features[index];
        if (feature && feature.geometry) {
            // Create OpenLayers feature for highlighting
            const highlightFeature = new OpenLayers.Feature.Vector(
                feature.geometry.clone()
            );
            this._highlightLayer.addFeatures([highlightFeature]);
        }
    }

    /**
     * Clear feature highlight
     */
    _clearHighlight() {
        this._highlightLayer.removeAllFeatures();
    }

    /**
     * Select a feature and trigger callback
     * @param {number} index - Index of feature to select
     */
    _selectFeature(index) {
        const feature = this._features[index];

        if (this._onSelect) {
            this._onSelect(feature);
        }

        this.hide();
    }

    /**
     * Hide and cleanup popup
     */
    hide() {
        // Always try to remove popup from DOM by ID, even if reference is lost
        const existingPopup = $('#feature-picker-popup');
        if (existingPopup.length > 0) {
            existingPopup.remove();
        }

        if (this._popup) {
            this._popup.remove();
            this._popup = null;
        }

        this._clearHighlight();
        this._features = [];
        this._onSelect = null;

        // Remove document click handler
        $(document).off('click.featurePicker');
    }
}
