lizMap.events.on({

  lizmappopupdisplayed: function(e) {

      // Exemple : Add rounded corners
      var popupContainer = $('#liz_layer_popup');
      popupContainer.css('border-radius', '15px');

      // Loop through each layer+feature item
      $('div.lizmapPopupDiv').each(function(){

        var layerId = $(this).find('input.lizmap-popup-layer-feature-id:first').val();
        var layerNameOrTitle = $(this).prev('h4:first').text();

        console.log( layerId + ' - ' + layerNameOrTitle );

      });
  }

});