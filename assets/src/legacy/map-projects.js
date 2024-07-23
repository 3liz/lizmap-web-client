$(document).ready(function () {
    function loadProjDefinition( aCRS, aRep, aProj, aCallback ) {
        var proj = aCRS.replace(/^\s+|\s+$/g, ''); // trim();
        if ( proj in Proj4js.defs ) {
            aCallback( proj );
        } else {
            $.get( globalThis['lizUrls'].wms, {
                'repository':aRep,
                'project':aProj,
                'SERVICE':'WMS',
                'REQUEST':'GetProj4',
                'authid': proj
            }, function ( aText ) {
                Proj4js.defs[proj] = aText;
                new OpenLayers.Projection(proj);
                aCallback( proj );
            }
            );
        }
    }
    $('#map-projects .thumbnail a.liz-project-show-desc').each(function (i, e) { $(e).attr('onclick', ''); });
    $('#map-projects .thumbnail a.liz-project-show-desc').click(function () {
        var self = $(this);
        var href = self.attr('href');
        href = href.replace('link-projet-', 'liz-project-modal-');
        var lizmapModal = $('#lizmap-modal');
        lizmapModal.html($(href).html()).modal('show');
        var proj = lizmapModal.find('span.proj').text();
        var bbox = lizmapModal.find('span.bbox').text();
        lizMap.loadProjDefinition(proj, function (aProj) {
            var bounds = OpenLayers.Bounds.fromString(bbox);
            bounds.transform(aProj, 'EPSG:4326');
            var mapBounds = lizMap.map.getExtent().transform(lizMap.map.getProjection(), 'EPSG:4326');
            if (bounds.containsBounds(mapBounds)) {
                var view = lizmapModal.find('a.liz-project-view')
                var viewUrl = view.attr('href');
                view.attr('href', OpenLayers.Util.urlAppend(viewUrl
                    , '#' + mapBounds
                ));
            }
        });
        return false;
    });
    $('#map-projects .thumbnail a.liz-project-view').click(function () {
        var self = $(this);
        const searchParams = new URLSearchParams(self.attr('href').split('?')[1]);
        var desc = self.parent().parent().find('.liz-project-desc');
        var proj = desc.find('span.proj').text();
        var bbox = desc.find('span.bbox').text();
        loadProjDefinition(proj, searchParams.get('repository'), searchParams.get('project'), function (aProj) {
            var bounds = OpenLayers.Bounds.fromString(bbox);
            bounds.transform(aProj, 'EPSG:4326');
            var mapBounds = lizMap.map.getExtent().transform(lizMap.map.getProjection(), 'EPSG:4326');
            if (bounds.containsBounds(mapBounds))
                window.location = OpenLayers.Util.urlAppend(self.attr('href')
                    , '#' + mapBounds
                );
            else
                window.location = self.attr('href');
        });
        return false;
    });
});
