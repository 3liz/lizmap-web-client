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
        $('#bottom-dock h3').click(function() {
          hideBottomDockContent();
          return false;
        });
        $('#bottom-dock .btn-bottomdock-clear')
        .click(function() {
          deactivateBottomDock();
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

        $('#mapmenu li.nav-bottomdock > a').click(function(){
            if (bottomDockActive){
                deactivateBottomDock();
            }else{
                activateBottomDock();
            }
            return false
        });

        function activateBottomDock() {
          $('#mapmenu li.nav-bottomdock > a').parent().addClass('active');

          // Show bottom dock title
          $('#bottom-dock').show();
          // Open bottom dock
          showBottomDockContent();
          bottomDockActive = true;

          return false;
        }

        function deactivateBottomDock() {
          $('#mapmenu li.nav-bottomdock > a').parent().removeClass('active');
          hideBottomDockContent();
          $('#bottom-dock').hide();
          bottomDockActive = false;

          return false;
        }

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
