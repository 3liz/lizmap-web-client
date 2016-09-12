var bottomDockFunction = function() {

    lizMap.events.on({
        'uicreated':function(evt){

        // Attributes
        var config = lizMap.config;
        var layers = lizMap.layers;
        var bottomDockActive = false;
        var bottomDockGlued = false;
        var bottomDockFullsize = false;

        // Initialize bottom dock position
        $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );

        // Div content interactions
        $('#bottom-dock').hover(
          function(){
            showBottomDockContent();
            $(this).removeClass('half-transparent');
            return false;
          }
          ,
          function(){
            if ( !bottomDockGlued &&!lizMap.checkMobile())
              hideBottomDockContent();

            $(this).addClass('half-transparent');
            return false;
          }
        );


        // Bind bottom dock buttons actions

        // Close button
        $('#bottom-dock .btn-bottomdock-clear')
        .click(function() {
          $('#mapmenu li.nav-bottomdock.active > a').click();
          return false;
        })
        .hover(
          function(){ $(this).addClass('btn-danger'); },
          function(){ $(this).removeClass('btn-danger'); }
        );

        // Pin button
        $('#bottom-dock .btn-bottomdock-glue')
        .click(function() {
          if ( bottomDockGlued ) {
            bottomDockGlued = false;
            $(this)
            .removeClass('active')
            .attr(
              'title',
              lizDict['bottomdock.toolbar.btn.glue.activate.title']
            )
            .html(lizDict['bottomdock.toolbar.btn.glue.activate.title']);
            hideBottomDockContent();
          }
          else {
            bottomDockGlued = true;
            $(this).addClass('active')
            .attr(
              'title',
              lizDict['bottomdock.toolbar.btn.glue.deactivate.title']
            )
            .html(lizDict['bottomdock.toolbar.btn.glue.glued.title']);
          }
          $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
          return false;
        })
        .hover(
          function(){
            if( bottomDockGlued ){
              $(this)
              .removeClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.glue.deactivate.title'])
              .html(lizDict['bottomdock.toolbar.btn.glue.deactivate.title']);
            }
            else{
              $(this)
              .addClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.glue.activate.title'])
              .html(lizDict['bottomdock.toolbar.btn.glue.activate.title']);
            }
            return false;
          },
          function(){
            if (bottomDockGlued ){
              $(this)
              .addClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.glue.deactivate.title'])
              .html(lizDict['bottomdock.toolbar.btn.glue.deactivate.title']);
            }
            else{
              $(this)
              .removeClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.glue.activate.title'])
              .html(lizDict['bottomdock.toolbar.btn.glue.activate.title']);
            }
            return false;
          }
        );

        // Size button
        $('#bottom-dock .btn-bottomdock-size')
        .click(function() {
          if ( bottomDockFullsize ) {
            bottomDockFullsize = false;
            $(this)
            .removeClass('active')
            .attr(
              'title',
              lizDict['bottomdock.toolbar.btn.size.maximize.title']
            )
            .html(lizDict['bottomdock.toolbar.btn.size.maximize.title']);
            $('#bottom-dock').removeClass('fullsize');
          }
          else {
            bottomDockFullsize = true;
            $(this).addClass('active')
            .attr(
              'title',
              lizDict['bottomdock.toolbar.btn.size.minimize.title']
            )
            .html(lizDict['bottomdock.toolbar.btn.size.minimize.title']);
            $('#bottom-dock').addClass('fullsize');
          }
          $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
          return false;
        })
        .hover(
          function(){
            if( bottomDockFullsize ){
              $(this)
              .removeClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.size.minimize.title'])
              .html(lizDict['bottomdock.toolbar.btn.size.minimize.title']);
            }
            else{
              $(this)
              .addClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.size.maximize.title'])
              .html(lizDict['bottomdock.toolbar.btn.size.maximize.title']);
            }
            return false;
          },
          function(){
            if (bottomDockFullsize ){
              $(this)
              .addClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.size.minimize.title'])
              .html(lizDict['bottomdock.toolbar.btn.size.minimize.title']);
            }
            else{
              $(this)
              .removeClass('btn-primary')
              .attr('title', lizDict['bottomdock.toolbar.btn.size.maximize.title'])
              .html(lizDict['bottomdock.toolbar.btn.size.maximize.title']);
            }
            return false;
          }
        );

        $('#mapmenu ul').on('click', 'li.nav-bottomdock > a', function(){
          var self = $(this);
          var parent = self.parent();
          var id = self.attr('href').substr(1);
          var tab = $('#nav-tab-'+id);
          if ( parent.hasClass('active') ) {
              if ( tab.hasClass('active') ) {
                  var nextActive = tab.next(':visible');
                  if ( nextActive.length != 0 ) {
                      nextActive.first().children('a').first().click();
                  } else {
                      var prevActive = tab.prev(':visible');
                      if ( prevActive.length != 0 )
                          prevActive.first().children('a').first().click();
                  }
              }
              tab.hide();
              tab.removeClass('active');
              parent.removeClass('active');
              bottomDockActive = false;
              lizMap.events.triggerEvent( "bottomdockclosed", {'id':id} );
          } else {
              var oldActive = $('#mapmenu li.nav-bottomdock.active');
              if ( oldActive.length != 0 ) {
                  oldActive.removeClass('active');
                  lizMap.events.triggerEvent( "bottomdockclosed", {'id': oldActive.children('a').first().attr('href').substr(1) } );
              }
              tab.show()
              tab.children('a').first().click();
              parent.addClass('active');
              bottomDockActive = true;
              lizMap.events.triggerEvent( "bottomdockopened", {'id':id} );
              $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
              $('#bottom-dock').addClass('visible');
          }
          self.blur();

          var dock = $('#bottom-dock');
          if ( $('#bottom-dock-tabs .active').length == 0 )
            dock.hide();
          else if ( !dock.is(':visible') )
            dock.show();
          return false;
        });

        function showBottomDockContent(){
          $('#bottom-dock').addClass('visible');
          $('#bottom-dock').css('left',  lizMap.getDockRightPosition() );
          return false;
        }
        function hideBottomDockContent(){
          $('#bottom-dock').removeClass('visible').focus();
          return false;
        }

      } // uicreated
    });


}();
