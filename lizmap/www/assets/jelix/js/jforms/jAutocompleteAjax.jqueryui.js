/**
 * @package      jelix
 * @subpackage   forms
 * @author       Laurent Jouanneau
 * @copyright    2020 Laurent Jouanneau
 * @link         https://jelix.org
 * @licence      GNU Lesser General Public Licence see LICENCE file or http://www.gnu.org/licenses/lgpl.html
 */


/**
 * Widget, extending jQueryUI autocomplete. It searches terms by doing an ajax request.
 *
 * This plugin should be used with the autocompleteajax_html widget for jForms.
 */
$.widget( "custom.jAutocompleteAjax", $.ui.autocomplete, {
    options: {
        searchInId: false,

        // events
        response: function (event, ui) {
            var me = $(this).jAutocompleteAjax('instance');
            if (ui.content.length) {
                me.spanNoResult.hide();
                me._hasResult = false;
            } else {
                me.spanNoResult.show();
                me._hasResult = true;
            }
        },

        select: function (event, ui) {
            var valueElt = $(this).jAutocompleteAjax('instance').valueElt;
            valueElt.val(ui.item.id);
            valueElt.attr('title', ui.item.label);
            $(this).jAutocompleteAjax('instance').trashBtn.removeAttr('disabled');
        },

        close: function (event, ui) {
        },

        change: function (event, ui) {
            var me = $(this).jAutocompleteAjax('instance');
            if (ui.item == null) {
                if (me.element.val() === '' && !me._valueRequired) {
                    me.valueElt.val("");
                }
                me.resetAutocomplete();
            }
        },
    },

    _create: function() {
        this._super();
        var autoCompleteBox = this.element.parent();
        this.valueElt = autoCompleteBox.find('.autocomplete-value');
        this.spanNoResult = autoCompleteBox.find(".autocomplete-no-search-results");
        this.trashBtn = autoCompleteBox.find(".autocomplete-trash");

        if (this.valueElt.attr('disabled')) {
            this.element.attr('disabled', 'true');
        }
        if (this.valueElt.attr('readonly')) {
            this.element.attr('readonly', 'true');
        }
        var me = this;
        this.trashBtn.click(function(event){
            me.valueElt.val("");
            me.valueElt.removeAttr("title");
            me.resetAutocomplete();
        });

        // hide the valueElt.
        this.element.show();
        this.spanNoResult.hide();

        this._hasResult = false;
        this._valueRequired = false;


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
        var label = this.valueElt.attr('title');
        if (label == '') {
            label = this.valueElt.val();
        }
        if (label) {
            this.element.val(label);
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
