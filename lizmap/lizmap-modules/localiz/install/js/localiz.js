/*
Module recherche/masque
@todo: Tester la présence de la couche masque : désactiver fonction masque sinon`
@todo: Paramétrer l'url ?
*/
lizMap.events.on({
	'uicreated': function(event) {
        // alert('ok');
        // entité (code, lib, bbox...) retournée par le service search
		var itemMask = false;
        
        // identifier la couche masque
		var maskLayer = lizMap.map.getLayersByName('mask');
		if ( maskLayer.length > 0 ) {
            maskLayer = maskLayer[0];
        } else 
            maskLayer = false;
            
        $('#btn_localiz_mask').hide();
        $('#btn_localiz_hide').hide();
        
        // gérer fermeture dock
        $('.btn-localiz-clear').click(function(){
            $('#button-localiz').click();
            return false;
        });
        
        // zoom sur l'entité
        $('#btn_localiz_zoom').click(function(){
            var p4326 = new OpenLayers.Projection('EPSG:4326');
            var bbox = new OpenLayers.Bounds(itemMask.xmin, itemMask.ymin, itemMask.xmax, itemMask.ymax).transform(p4326, lizMap.map.projection);
            lizMap.map.zoomToExtent(bbox);            
            return false;
        });

        // créer un masque
        $('#btn_localiz_mask').click(function(){
			maskLayer.params['FILTER'] = 'mask:"oid"'+' = '+"'"+itemMask.oid+"'";
            if (! $("button[value='mask']").hasClass("checked"))
                $("button[value='mask']").click();
            else
                maskLayer.redraw();
                
            return false;
        });

        // effacer le masque
        $('#btn_localiz_hide').click(function(){
            if ($("button[value='mask']").hasClass("checked"))
                $("button[value='mask']").click();
                
            return false;
        });

        // Recherche auto-complétion
        $(function() {
            $("#localiz_search" ).autocomplete({
                source: function(request, response){
                    url = "/lizmap3/index.php?module=localiz&action=search";
                    $('#localiz_div_search span.loading').addClass('loadstart');
                    
                    $.getJSON( url, {
                        term: request.term
                    })
                    .done(function( data ) {
                        response(data);
                    })
                    .always(function(){
                        $('#localiz_div_search span.loading').removeClass('loadstart');
                    })
                    ;     
                    
                },
                // pb de positionnement, appendTo requis ?
                appendTo: "#localiz_div_search",
                // Recherche ssi 3 caractères sont saisis
                minLength: 3,
                // permet d'agrandir le mini-dock 
                open: function( event, ui ) {  
                    $("#localiz_div_search ul").css("position", "initial");
                },
                select: function( event, ui ) { 
                    itemMask = ui.item;
                    
                    // si couche masque présente, interdire la création de masque à partir des objets linéaires (ce)
                    if (maskLayer) {
                        if (itemMask.geometrytype == null || itemMask.geometrytype == 'LINESTRING' || itemMask.geometrytype == 'MULTILINESTRING') {
                            $('#btn_localiz_mask').hide();
                        } else {
                            $('#btn_localiz_mask').show();
                            $('#btn_localiz_hide').show();
                        }
                    }
                    
                    $("#localiz_search").val(itemMask.label);
                    $("#localiz_lib").text(itemMask.longlabel);
                    var p4326 = new OpenLayers.Projection('EPSG:4326');
                    var bbox = new OpenLayers.Bounds(itemMask.xmin, itemMask.ymin, itemMask.xmax, itemMask.ymax).transform(p4326, lizMap.map.projection);
                    lizMap.map.zoomToExtent(bbox);            
                },
                create: function() {
                    $(this).data('ui-autocomplete')._renderItem = function (ul, item) {
                      return $( '<li>' )
                        .append( item.longlabel )
                        .addClass('localiz_typ')
                        .addClass('localiz_typ_'+item.typcode)
                        .appendTo( ul );
                    };
                }
            });
        });

            
	}
});