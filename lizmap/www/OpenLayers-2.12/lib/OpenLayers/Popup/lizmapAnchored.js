OpenLayers.Popup.LizmapAnchored =
  OpenLayers.Class(OpenLayers.Popup.Anchored, {
    'displayClass': 'olPopup lizmapPopup'
    ,'autoSize': true
    ,'maxSize': new OpenLayers.Size(500, 500)
    ,'keepInMap': true
    ,'contentDisplayClass': 'olPopupContent lizmapPopupContent',
    updateSize: function() {
      // determine actual render dimensions of the contents by putting its
      // contents into a fake contentDiv (for the CSS) and then measuring it
      var preparedHTML = "<div class='" + this.contentDisplayClass+ "'>" + 
    this.contentDiv.innerHTML + 
    "</div>";

      var containerElement = (this.map) ? this.map.div : document.body;
      var realSize = OpenLayers.Util.getRenderedDimensions(
        preparedHTML, null, {
          displayClass: this.displayClass,
          containerElement: containerElement
        }
        );

      // is the "real" size of the div is safe to display in our map?
      var safeSize = this.getSafeContentSize(realSize);

      var newSize = null;
      if (safeSize.equals(realSize)) {
        //real size of content is small enough to fit on the map, 
        // so we use real size.
        newSize = realSize;

      } else {

        // make a new 'size' object with the clipped dimensions 
        // set or null if not clipped.
        var fixedSize = {
          w: (safeSize.w < realSize.w) ? safeSize.w : null,
          h: (safeSize.h < realSize.h) ? safeSize.h : null
        };

        if (fixedSize.w && fixedSize.h) {
          //content is too big in both directions, so we will use 
          // max popup size (safeSize), knowing well that it will 
          // overflow both ways.                
          newSize = safeSize;
        } else {
          //content is clipped in only one direction, so we need to 
          // run getRenderedDimensions() again with a fixed dimension
          var clippedSize = OpenLayers.Util.getRenderedDimensions(
              preparedHTML, fixedSize, {
                displayClass: this.contentDisplayClass,
              containerElement: containerElement
              }
              );

          //if the clipped size is still the same as the safeSize, 
          // that means that our content must be fixed in the 
          // offending direction. If overflow is 'auto', this means 
          // we are going to have a scrollbar for sure, so we must 
          // adjust for that.
          //
          var currentOverflow = OpenLayers.Element.getStyle(
              this.contentDiv, "overflow"
              );
          if ( (currentOverflow != "hidden") && 
              (clippedSize.equals(safeSize)) ) {
                var scrollBar = OpenLayers.Util.getScrollbarWidth();
                if (fixedSize.w) {
                  clippedSize.h += scrollBar;
                } else {
                  clippedSize.w += scrollBar;
                }
              }

          newSize = this.getSafeContentSize(clippedSize);
        }
      }                        
      this.setSize(newSize);  
      this.verifySize();
    },
    verifySize: function() {
      if ($(this.div).parent().length != 0 ) {
        var contentDivHeight = 0;
        var contentDivWidth = 0;
        $(this.contentDiv).children().each(function(i,e) {
          var eHeight = $(e).outerHeight(true);
          contentDivHeight += eHeight;
          var eWidth = $(e).outerWidth(true);
          if (eWidth > contentDivWidth)
          contentDivWidth = eWidth;
        });
        if (this.size.w < contentDivWidth)
          this.size.w = contentDivWidth;
        if (this.size.h < contentDivHeight)
          this.size.h = contentDivHeight;
        this.setSize( this.getSafeContentSize(this.size) );
        if ( $(this.contentDiv).height() > contentDivHeight ) {
          $(this.contentDiv).height(contentDivHeight);
          $(this.div).height(contentDivHeight);
        }
        if($(this.div).height()<contentDivHeight) {
          $(this.div).find('.olPopupCloseBox').css('right','14px');
        }
      }
    }
  }
);
