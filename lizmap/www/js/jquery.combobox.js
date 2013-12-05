(function( $ ) {
  $.widget( "custom.combobox", {
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
          minLength: 0,
          autoFocus: true,
          source: $.proxy( this, "_source" )
        })
        .focus(
          function() {
            $(this).one('mouseup', function() {
              $(this).select();
            });
          }
        )
        .tooltip({
          tooltipClass: "ui-state-highlight"
        });
      this._on( this.input, {
        autocompleteselect: function( event, ui ) {
          ui.item.option.selected = true;
          this._trigger( "selected", event, {
            item: ui.item.option
          });
        },
        autocompletechange: "_removeIfInvalid"
      });
      this.input.autocomplete( "widget" ).css("z-index","1000");
    },
    _createShowAllButton: function() {
      var input = this.input,
      wasOpen = false;
      $( "<a>" )
        .attr( "tabIndex", -1 )
        .attr( "title", "Show All Items" )
        .tooltip()
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
      var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex(request.term), "i" );
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
          valid = false;
      this.element.children( "option" ).each(function() {
        if ( $( this ).text().toLowerCase() === valueLowerCase ) {
          this.selected = valid = true;
          return false;
        }
      });
      // Found a match, nothing to do
      if ( valid ) {
        return;
      }
      // Remove invalid value
      this.input
        .val( this.originalValue  )
        .attr( "title", value + " didn't match any item" )
        .tooltip( "open" );
      this.element.val( "" );
      this._delay(function() {
        this.input.tooltip( "close" ).attr( "title", "" );
      }, 2500 );
      this.input.data( "ui-autocomplete" ).term = "";
    },
    _destroy: function() {
      this.wrapper.remove();
      this.element.show();
    }
  });
})( jQuery );
