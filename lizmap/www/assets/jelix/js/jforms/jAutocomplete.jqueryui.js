/**
 * @package      jelix
 * @subpackage   forms
 * @author       Laurent Jouanneau
 * @copyright    2020 Laurent Jouanneau
 * @link         https://jelix.org
 * @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */


/**
 * Widget, extending jQueryUI autocomplete, that transform a simple select field
 * into an autocomplete field
 *
  This plugin should be used with the autocomplete_html widget for jForms.
 */

$.widget( "custom.jAutocomplete", $.ui.autocomplete, {
    options: {
        searchInId: false,
        source: function (request, response) {
            var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
            var searchInId = this.options.searchInId;
            var results = this._selectValues.filter(function(item) {
                if (matcher.test(item.label)) {
                    return true;
                }
                if (searchInId && matcher.test(item.id)) {
                    return true;
                }
                return false;
            });
            response(results);
        },

        // events

        response: function (event, ui) {
            var me = $(this).jAutocomplete('instance');
            if (ui.content.length) {
                me.spanNoResult.hide();
                me._hasResult = false;
            } else {
                me.spanNoResult.show();
                me._hasResult = true;
            }
        },

        select: function (event, ui) {
            $(this).jAutocomplete('instance').selectBox.val(ui.item.id);
            $(this).jAutocomplete('instance').trashBtn.removeAttr('disabled');
        },

        close: function (event, ui) {
        },

        change: function (event, ui) {
            var me = $(this).jAutocomplete('instance');
            if (ui.item == null) {
                if (me.element.val() === '' && !me._valueRequired) {
                    me.selectBox.val(-1);
                }
                me.resetAutocomplete();
            }
        },
    },
    // prepare the list of data for search
    _readSelectData: function() {
        var values = [];
        var required = true;
        this.selectBox.find('option').each(function (idx, optElt) {
            var val = optElt.getAttribute('value');
            if (val !== '') {
                var item = { label: optElt.textContent, id: val};
                /*if (options.searchInId) {
                    item.label += ' (#'+val+')';
                }*/
                values.push(item);
            }
            else if (idx == 0) {
                required = false;
            }
        });
        this._selectValues = values;
        this._valueRequired = required;
    },
    _create: function() {
        this._super();
        var autoCompleteBox = this.element.parent();
        this.selectBox = autoCompleteBox.find('.autocomplete-select');
        this.spanNoResult = autoCompleteBox.find(".autocomplete-no-search-results");
        this.trashBtn = autoCompleteBox.find(".autocomplete-trash");

        if (this.selectBox.attr('disabled')) {
            this.element.attr('disabled', 'true');
        }
        if (this.selectBox.attr('readonly')) {
            this.element.attr('readonly', 'true');
        }
        var me = this;
        this.trashBtn.click(function(event){
            me.selectBox.val(-1);
            me.resetAutocomplete();
        });

        // hide the selectBox.
        // It is visible by default, to allow to select if JS is deactivated
        this.selectBox.hide();
        this.element.show();
        this.spanNoResult.hide();

        this._hasResult = false;
        this._valueRequired = false;

        this._readSelectData();

        this.resetAutocomplete();

        this.options.minLength = (this.options.searchInId? 1 : 3);

    },
    _renderItem: function( ul, item ) {
        var label = item.label;
        if (this.options.searchInId) {
            label += ' ('+item.id+')';
        }

        return $( "<li>" )
            .append( $( "<div>" ).text(label ) )
            .appendTo( ul );
    },
    resetAutocomplete: function() {
        var selectedOpt = this.selectBox[0].selectedOptions;
        if (selectedOpt.length) {
            this.element.val(selectedOpt[0].label);
            this.trashBtn.removeAttr('disabled');
        }
        else {
            this.element.val("");
            this.trashBtn.attr('disabled', 'true');
        }
        this.spanNoResult.hide();
        this._hasResult = false;
    }
});
