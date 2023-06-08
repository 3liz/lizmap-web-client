var bottomDockFunction = function() {

    lizMap.events.on({
        'uicreated':function(){

        // Attributes
        var bottomDockFullsize = false;

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
            lizMap.events.triggerEvent('bottomdocksizechanged', {'size': 'half'} );
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
            lizMap.events.triggerEvent('bottomdocksizechanged', {'size': 'full'} );
          }
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
              lizMap.events.triggerEvent( "bottomdockopened", {'id':id} );
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
          lizMap.events.triggerEvent('bottomdocksizechanged', {'size': 'unknown'} );
          return false;
        }
        function hideBottomDockContent(){
          $('#bottom-dock').removeClass('visible').focus();
          return false;
        }

      } // uicreated
    });


}();
