(function( $ ) {
  $.widget( "custom.combobox", {
  options: {
    minLength: 0
  },
    _create: function() {
      this.wrapper = $( "<span>" )
        .addClass( "custom-combobox" )
        .insertAfter( this.element );
      this.element.hide();
      this._createAutocomplete();
      this._createShowAllButton();
    },
    _createAutocomplete: function() {
      var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";
      this.originalValue = value;
      this.input = $( "<input>" )
        .appendTo( this.wrapper )
        .val( value )
        .attr( "title", "" )
        .addClass( "custom-combobox-input ui-widget ui-widget-content ui-state-default ui-corner-left label" )
        .autocomplete({
          delay: 0,
          position: this.options.position,
          minLength: this.options.minLength,
          autoFocus: true,
          source: $.proxy( this, "_source" )
        })
        .focus(
          function() {
            $(this).one('mouseup', function() {
              $(this).select();
            });
          }
        );
      this._on( this.input, {
        autocompleteselect: function( event, ui ) {
          ui.item.option.selected = true;
          this._trigger( "selected", event, {
            item: ui.item.option
          });
        },
        autocompletechange: "_removeIfInvalid",
        autocompleteclose: "_close"
      });
      this.input.autocomplete( "widget" ).css("z-index","1050");
    },
    _createShowAllButton: function() {
    if ( this.minLength > 0 )
      return;
      var input = this.input,
      wasOpen = false;
      $( "<a>" )
        .attr( "tabIndex", -1 )
        .appendTo( this.wrapper )
        .button({
          icons: {
            primary: "ui-icon-triangle-1-s"
          },
          text: false
        })
        .removeClass( "ui-corner-all" )
        .addClass( "custom-combobox-toggle ui-corner-right" )
        .mousedown(function() {
          wasOpen = input.autocomplete( "widget" ).is( ":visible" );
        })
        .click(function() {
          input.focus();
          // Close if already visible
          if ( wasOpen ) {
            return;
          }
          // Pass empty string as value to search for, displaying all results
          input.autocomplete( "search", "" );
        });
    },
    _source: function( request, response ) {
      var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
      response( this.element.children( "option" ).map(function() {
        var text = $( this ).text();
        if ( this.value && ( !request.term || matcher.test(text) ) )
          return {
            label: text,
            value: text,
            option: this
          };
      }) );
    },
    _removeIfInvalid: function( event, ui ) {
      // Selected an item, nothing to do
      if ( ui.item ) {
        return;
      }
      // Search for a match (case-insensitive)
      var value = this.input.val(),
          valueLowerCase = value.toLowerCase(),
          option = null;
          valid = false;
      this.element.children( "option" ).each(function() {
        if ( $( this ).text().toLowerCase() === valueLowerCase ) {
          this.selected = valid = true;
          option = this;
          return false;
        }
      });
      // Found a match, nothing to do
      if ( valid ) {
        this.element.change();
        return;
      }
      // Remove invalid value
      this.input.val( this.originalValue  );
      // and select originalValue if not yet selected
      var selected = this.element.children( ":selected" ),
        originalValueLowerCase = this.originalValue.toLowerCase(),
        found = false;
      if ( selected.text().toLowerCase() != originalValueLowerCase ) {
        this.element.children( "option" ).each(function() {
          if ( $( this ).text().toLowerCase() === originalValueLowerCase ) {
            this.selected = found = true;
            return false;
          }
        });
      }
      if ( found ) {
        this.element.change();
        return;
      }
      this.element.val( "" );
      this.input.data( "ui-autocomplete" ).term = "";
    },
    _close: function() {
        if ( this.input.val() == '') {
          // Remove invalid value
          this.input.val( this.originalValue  );
          // and select originalValue if not yet selected
          var selected = this.element.children( ":selected" ),
            originalValueLowerCase = this.originalValue.toLowerCase(),
            found = false;
          if ( selected.text().toLowerCase() != originalValueLowerCase ) {
            this.element.children( "option" ).each(function() {
              if ( $( this ).text().toLowerCase() === originalValueLowerCase ) {
                this.selected = found = true;
                return false;
              }
            });
          }
          if ( found ) {
            this.element.change();
          }
        }
    },
    _destroy: function() {
      this.wrapper.remove();
      this.element.show();
    }
  });
})( jQuery );
