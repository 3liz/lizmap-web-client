<div id="projects">
  {zone 'view~main_view', array('excludedProject'=>$repository.'~'.$project)}
  <script>
  {literal}
  $(document).ready(function () {
    $('#headermenu li.home a').click(function(){
      $('#content .project-list').toggle();
      return false;
    });
    $('#content .project-list a').click(function() {
      var self = $(this);
      var proj = self.parent().find('.proj').text();
      console.log(proj);
      lizMap.loadProjDefinition( proj, function( aProj ) {
          var bbox = self.parent().find('.bbox').text();
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
