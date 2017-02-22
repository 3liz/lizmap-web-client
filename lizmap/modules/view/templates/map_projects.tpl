<div id="projects">
  {zone 'view~main_view', array('excludedProject'=>$excludedProject)}
  <script>
  {literal}
  $(document).ready(function () {
    $('#projects .thumbnail a.liz-project-show-desc').each(function(i,e){$(e).attr('onclick','');});
    $('#projects .thumbnail a.liz-project-show-desc').click(function(){
        var self = $(this);
        var href = self.attr('href');
        href = href.replace('link-projet-','liz-project-modal-');
        var lizmapModal = $('#lizmap-modal');
        lizmapModal.html( $(href).html() ).modal('show');
        var proj = lizmapModal.find('span.proj').text();
        var bbox = lizmapModal.find('span.bbox').text();
        lizMap.loadProjDefinition( proj, function( aProj ) {
          var bounds = OpenLayers.Bounds.fromString( bbox );
          bounds.transform( aProj, 'EPSG:4326' );
          var mapBounds = lizMap.map.getExtent().transform(lizMap.map.getProjection(), 'EPSG:4326');
          if ( bounds.containsBounds( mapBounds ) ) {
            var view = lizmapModal.find('a.liz-project-view')
            var viewUrl = view.attr('href');
            view.attr('href', OpenLayers.Util.urlAppend( viewUrl
                ,'bbox='+mapBounds.clone().transform('EPSG:4326',aProj)
            ));
          }
        });
        return false;
    });
    $('#projects .thumbnail a.liz-project-view').click(function(){
        var self = $(this);
        var desc = self.parent().parent().find('.liz-project-desc');
        var proj = desc.find('span.proj').text();
        var bbox = desc.find('span.bbox').text();
        lizMap.loadProjDefinition( proj, function( aProj ) {
          var bounds = OpenLayers.Bounds.fromString( bbox );
          bounds.transform( aProj, 'EPSG:4326' );
          var mapBounds = lizMap.map.getExtent().transform(lizMap.map.getProjection(), 'EPSG:4326');
          if ( bounds.containsBounds( mapBounds ) )
            window.location = OpenLayers.Util.urlAppend(self.attr('href')
              ,'bbox='+mapBounds.clone().transform('EPSG:4326',aProj)
            );
          else
            window.location = self.attr('href');
        });
        return false;
    });
  });
  {/literal}
  </script>
</div>
