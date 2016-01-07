lizMap.events.on({

    'attributeLayersReady': function(e) {

        var layersToActivate = ['Quartiers', 'SousQuartiers'];

        // Hide attribute table summary tab and content
        $('#nav-tab-attribute-summary').hide();
        $('#attribute-summary').hide();

        // Activate layers
        for( var l in layersToActivate ){
            $('.btn-open-attribute-layer[value="' + layersToActivate[l] + '"]' ).click();
        }

        // Open attribute layers panel
        $('#mapmenu li.attributeLayers a').click();
    }

});
